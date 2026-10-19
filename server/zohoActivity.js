import {
  zohoPeriod,
  zohoId,
  zohoTeam,
  normalizeZohoEntry,
  normalizeZohoReply,
} from '../src/shared/data/zohoActivity.js';
export class ZohoActivityError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
    this.code = 'ZOHO_ACTIVITY';
  }
}
export function activityParameters(params, now = Date.now()) {
  const period = zohoPeriod(params.get('start'), params.get('end'));
  if ([...params.keys()].some((key) => !['start', 'end', 'from', 'anchor'].includes(key)))
    throw new ZohoActivityError('Parâmetros de consulta inválidos.', 400);
  const from = Number(params.get('from') || 0);
  if (!Number.isInteger(from) || from < 0 || from > 490 || from % 10)
    throw new ZohoActivityError('Página de consulta inválida.', 400);
  const anchor = params.get('anchor') || new Date(now).toISOString();
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(anchor) ||
    !Number.isFinite(Date.parse(anchor)) ||
    Date.parse(anchor) > now + 60000 ||
    Date.parse(anchor) < Date.parse(period.from)
  )
    throw new ZohoActivityError('Referência de coleta inválida.', 400);
  return { period, from, anchor };
}
export async function collectZohoActivityBatch(get, { period, from, anchor }) {
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
    limit: '10',
    sortBy: 'createdTime',
    modifiedTimeRange: `${period.from},${anchor}`,
  });
  const tickets = await fetchPage(`/tickets/search?${search}`);
  if (tickets.length > 10)
    throw new ZohoActivityError('A fonte não respeitou o limite de chamados.');
  const replies = [],
    entries = [],
    review = [],
    metrics = [];
  const ticketIds = new Set();
  for (const ticket of tickets) {
    const ticketId = zohoId(ticket?.id);
    if (!ticketId || ticketIds.has(ticketId))
      throw new ZohoActivityError(
        'Chamados repetidos ou inválidos durante a coleta. Tente novamente.',
      );
    ticketIds.add(ticketId);
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
  const next = tickets.length === 10 ? from + 10 : null;
  if (next >= 500)
    throw new ZohoActivityError(
      'O recorte excedeu 500 chamados modificados. Reduza o período para concluir a coleta.',
    );
  return {
    version: 1,
    period,
    anchor,
    from,
    next,
    ticketIds: [...ticketIds],
    replies,
    entries,
    review,
    metrics,
    coverage:
      'Chamados acessíveis modificados desde o início do período até a referência da coleta; não inclui arquivos ou itens fora do acesso da conta. A indexação do Zoho pode atrasar.',
  };
}
