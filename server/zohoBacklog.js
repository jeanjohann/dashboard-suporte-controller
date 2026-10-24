/** Carteira atual por responsável: não depende da data de criação ou última alteração. */
import { zohoId, zohoTeam } from '../src/shared/data/zohoActivity.js';
import { ZohoActivityError } from './zohoActivity.js';

export function backlogParameters(params) {
  const agentId = params.get('agentId'),
    from = Number(params.get('from') || 0);
  if (
    [...params.keys()].some((key) => !['backlog', 'agentId', 'from'].includes(key)) ||
    params.get('backlog') !== '1' ||
    !zohoTeam.some((agent) => agent.id === agentId) ||
    !Number.isInteger(from) ||
    from < 0 ||
    from > 4900 ||
    from % 100
  )
    throw new ZohoActivityError('Parâmetros de pendências inválidos.', 400);
  return { agentId, from };
}

export async function collectZohoBacklogBatch(get, { agentId, from }, now = Date.now) {
  const params = new URLSearchParams({
    assigneeId: agentId,
    from: String(from),
    limit: '100',
    sortBy: 'createdTime',
  });
  const result = await get(`/tickets/search?${params}`);
  if (!Array.isArray(result?.data) || result.data.length > 100)
    throw new ZohoActivityError('Listagem de pendências incompatível.');
  const seen = new Set(),
    tickets = [];
  const label = (v) => (typeof v === 'string' ? v.trim().slice(0, 160) : null);
  for (const row of result.data) {
    const id = zohoId(row?.id);
    if (!id || seen.has(id) || zohoId(row.assigneeId) !== agentId)
      throw new ZohoActivityError(
        'Responsável ou paginação de pendências divergente. Tente novamente.',
      );
    seen.add(id);
    const state = String(row.statusType || '')
      .toUpperCase()
      .replace(/[ _-]/g, '');
    if (!['OPEN', 'ONHOLD', 'CLOSED'].includes(state))
      throw new ZohoActivityError(
        'Um chamado está sem categoria de status confirmada. As pendências não foram aplicadas.',
      );
    if (state === 'CLOSED') continue;
    tickets.push({
      ticketId: id,
      number: label(row.ticketNumber) || id,
      agentId,
      state,
      status: label(row.status),
      category: label(row.category),
      subCategory: label(row.subCategory),
    });
  }
  const next = result.data.length === 100 ? from + 100 : null;
  if (next >= 5000)
    throw new ZohoActivityError(
      'A carteira excedeu o limite de pesquisa de 5.000 chamados por agente. Nenhum total parcial foi aplicado.',
    );
  return {
    version: 1,
    agentId,
    from,
    next,
    scannedIds: [...seen],
    tickets,
    observedAt: new Date(now()).toISOString(),
  };
}
