import {
  zohoPeriod,
  zohoId,
  zohoTeam,
  normalizeZohoEntry,
  normalizeZohoReply,
  zohoDay,
} from '../src/shared/data/zohoActivity.js';
import { closureReader } from './zohoClosures.js';
import { ticketIndicatorEvidence } from './zohoIndicators.js';
export class ZohoActivityError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
    this.code = 'ZOHO_ACTIVITY';
  }
}
export function activityParameters(params, now = Date.now()) {
  const period = zohoPeriod(params.get('start'), params.get('end'));
  if (
    [...params.keys()].some(
      (key) => !['start', 'end', 'from', 'anchor', 'indicators'].includes(key),
    ) ||
    (params.has('indicators') && params.get('indicators') !== '1')
  )
    throw new ZohoActivityError('Parâmetros de consulta inválidos.', 400);
  const from = Number(params.get('from') || 0);
  if (!Number.isInteger(from) || from < 0 || from > 495 || from % 5)
    throw new ZohoActivityError('Página de consulta inválida.', 400);
  const anchor = params.get('anchor') || new Date(now).toISOString();
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(anchor) ||
    !Number.isFinite(Date.parse(anchor)) ||
    Date.parse(anchor) > now + 60000 ||
    Date.parse(anchor) < Date.parse(period.from)
  )
    throw new ZohoActivityError('Referência de coleta inválida.', 400);
  return { period, from, anchor, ...(params.has('indicators') ? { indicators: true } : {}) };
}
export async function collectZohoActivityBatch(get, { period, from, anchor, indicators = false }) {
  let calls = 0;
  const fetchPage = async (path) => {
    if (++calls > 42)
      throw new ZohoActivityError(
        'Esta página atingiu o limite de chamadas. Escolha um período menor.',
      );
    const result = await get(path);
    if (!Array.isArray(result?.data))
      throw new ZohoActivityError('A fonte retornou uma listagem inválida.');
    return result.data;
  };
  const search = new URLSearchParams({
    from: String(from),
    limit: '5',
    sortBy: 'createdTime',
    modifiedTimeRange: `${period.from},${anchor}`,
  });
  const tickets = await fetchPage(`/tickets/search?${search}`);
  if (tickets.length > 5)
    throw new ZohoActivityError('A fonte não respeitou o limite de chamados.');
  const replies = [],
    entries = [],
    review = [],
    metrics = [],
    closures = [],
    ticketIndicators = [];
  const readClosures = closureReader(fetchPage, (message) => new ZohoActivityError(message));
  const ticketIds = new Set();
  for (const ticket of tickets) {
    const ticketId = zohoId(ticket?.id);
    if (!ticketId || ticketIds.has(ticketId))
      throw new ZohoActivityError(
        'Chamados repetidos ou inválidos durante a coleta. Tente novamente.',
      );
    ticketIds.add(ticketId);
    const ticketClosures = await readClosures(ticket, period, anchor);
    if (indicators) {
      if (++calls > 42)
        throw new ZohoActivityError('Limite de chamadas atingido. Reduza o período.');
      const detail = await get(`/tickets/${ticketId}`);
      if (zohoId(detail?.id) !== ticketId)
        throw new ZohoActivityError('Detalhe de categoria divergente.');
      ticketIndicators.push(
        await ticketIndicatorEvidence(ticket, period, anchor, detail, fetchPage),
      );
    }
    const closedDay = zohoDay(ticket.closedTime);
    if (
      closedDay &&
      closedDay >= period.start &&
      closedDay <= period.end &&
      Date.parse(ticket.closedTime) <= Date.parse(anchor) &&
      !ticketClosures.some(
        (row) => Math.abs(Date.parse(row.closedAt) - Date.parse(ticket.closedTime)) < 1000,
      )
    )
      throw new ZohoActivityError(
        'A data de fechamento do chamado não pôde ser conferida no histórico de status.',
      );
    const allEntries = [];
    let effortReviewCount = 0;
    for (const [kind, path, normalize, target] of [
      ['reply', 'threads', normalizeZohoReply, replies],
      ['entry', 'timeEntry', normalizeZohoEntry, entries],
    ]) {
      let complete = false;
      const seen = new Set();
      for (let page = 0; page < 4; page++) {
        const options = path === 'threads' ? 'sortBy=-sendDateTime' : 'module=tickets&orderBy=DESC';
        const rows = await fetchPage(
          `/tickets/${ticketId}/${path}?from=${page * 100}&limit=100&${options}`,
        );
        if (rows.length > 100)
          throw new ZohoActivityError('A fonte não respeitou a paginação das interações.');
        for (const row of rows) {
          const rowId = zohoId(row?.id);
          if (!rowId || seen.has(rowId))
            throw new ZohoActivityError(
              'Registros repetidos ou inválidos na paginação do chamado.',
            );
          seen.add(rowId);
          if (kind === 'entry' && ticketClosures.length) {
            const full = normalizeZohoEntry(row, ticketId, null);
            if (!full.reason) {
              const owner = row.owner;
              allEntries.push({
                ...full,
                name:
                  zohoId(owner?.id) === full.agentId
                    ? [owner.firstName, owner.lastName]
                        .filter((value) => typeof value === 'string')
                        .join(' ')
                        .slice(0, 100)
                    : null,
              });
            } else if (full.reason !== 'Apontamento excluído') effortReviewCount++;
          }
          const item = normalize(row, ticketId, period);
          if (item.agentId && !zohoTeam.some((agent) => agent.id === item.agentId)) continue;
          if (item.reason) {
            if (item.reason !== 'Fora do período')
              review.push({
                kind,
                id: item.id,
                ticketId,
                agentId: item.agentId,
                reason: item.reason,
              });
          } else target.push(item);
        }
        if (rows.length < 100) {
          complete = true;
          break;
        }
      }
      if (!complete)
        throw new ZohoActivityError(
          'Um chamado excedeu 400 interações ou apontamentos. A coleta não foi aplicada.',
        );
    }
    for (const closure of ticketClosures) {
      const totals = new Map();
      for (const entry of allEntries) {
        if (Date.parse(entry.executedTime) > Date.parse(closure.closedAt)) continue;
        const old = totals.get(entry.agentId) || {
          agentId: entry.agentId,
          name: entry.name,
          seconds: 0,
        };
        old.seconds += entry.seconds;
        totals.set(entry.agentId, old);
      }
      const contributions = [...totals.values()].sort((a, b) => b.seconds - a.seconds);
      const max = contributions[0]?.seconds || 0;
      const leaderIds =
        max > 0 ? contributions.filter((row) => row.seconds === max).map((row) => row.agentId) : [];
      if (
        zohoTeam.some((agent) =>
          [closure.agentId, closure.ownerId, ...contributions.map((row) => row.agentId)].includes(
            agent.id,
          ),
        )
      )
        closures.push({ ...closure, contributions, leaderIds, effortReviewCount });
    }
    if (++calls > 42)
      throw new ZohoActivityError(
        'Esta página atingiu o limite de chamadas. Escolha um período menor.',
      );
    const metric = await get(`/tickets/${ticketId}/metrics`);
    const label = (value) => (typeof value === 'string' ? value.slice(0, 60) : null);
    metrics.push({
      ticketId,
      assigneeId: zohoId(ticket.assigneeId),
      number: typeof ticket.ticketNumber === 'string' ? ticket.ticketNumber.slice(0, 50) : ticketId,
      firstResponse: label(metric?.firstResponseTime),
      resolution: label(metric?.resolutionTime),
      totalResponse: label(metric?.totalResponseTime),
    });
  }
  const next = tickets.length === 5 ? from + 5 : null;
  if (next >= 500)
    throw new ZohoActivityError(
      'O recorte excedeu 500 chamados modificados. Reduza o período para concluir a coleta.',
    );
  return {
    version: 2,
    period,
    anchor,
    from,
    next,
    ticketIds: [...ticketIds],
    replies,
    entries,
    review,
    metrics,
    closures,
    ...(indicators ? { ticketIndicators } : {}),
    coverage:
      'Chamados acessíveis modificados desde o início do período até a referência da coleta; não inclui arquivos ou itens fora do acesso da conta. A indexação do Zoho pode atrasar.',
  };
}
