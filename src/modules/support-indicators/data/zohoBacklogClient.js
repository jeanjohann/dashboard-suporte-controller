import { api } from '../../../shared/security/accessClient.js';
import { zohoId, zohoTeam } from '../../../shared/data/zohoActivity.js';

/** Aplica apenas as duas carteiras completas; erros preservam a consulta anterior. */
export async function loadZohoBacklog({ signal, onProgress = () => {} } = {}, read = api) {
  const tickets = [],
    seen = new Set(),
    startedAt = new Date().toISOString();
  let scanned = 0;
  for (const agent of zohoTeam) {
    let from = 0,
      complete = false;
    for (let page = 0; page < 50; page++) {
      signal?.throwIfAborted();
      const params = new URLSearchParams({ backlog: '1', agentId: agent.id, from: String(from) });
      const batch = await read('/api/zoho/activity?' + params, { signal });
      signal?.throwIfAborted();
      if (
        batch.version !== 1 ||
        batch.agentId !== agent.id ||
        batch.from !== from ||
        !Array.isArray(batch.scannedIds) ||
        batch.scannedIds.length > 100 ||
        !Array.isArray(batch.tickets) ||
        !Number.isFinite(Date.parse(batch.observedAt)) ||
        (batch.next !== null && (batch.next !== from + 100 || batch.scannedIds.length !== 100))
      )
        throw Error(
          'Consulta de pendências incompleta ou incompatível. A leitura anterior foi mantida.',
        );
      const pageIds = new Set(batch.scannedIds);
      if (
        pageIds.size !== batch.scannedIds.length ||
        batch.scannedIds.some((id) => !zohoId(id) || seen.has(id))
      )
        throw Error('A carteira mudou ou repetiu chamados durante a consulta. Tente novamente.');
      const ticketIds = new Set();
      for (const row of batch.tickets) {
        if (
          !row ||
          !pageIds.has(row.ticketId) ||
          ticketIds.has(row.ticketId) ||
          row.agentId !== agent.id ||
          !['OPEN', 'ONHOLD'].includes(row.state) ||
          typeof row.number !== 'string' ||
          ['category', 'subCategory', 'status'].some(
            (key) => row[key] !== null && typeof row[key] !== 'string',
          )
        )
          throw Error('Chamado pendente incompatível. A leitura anterior foi mantida.');
        ticketIds.add(row.ticketId);
        tickets.push(row);
      }
      batch.scannedIds.forEach((id) => seen.add(id));
      scanned += batch.scannedIds.length;
      onProgress(scanned);
      if (batch.next === null) {
        complete = true;
        break;
      }
      from = batch.next;
    }
    if (!complete)
      throw Error('A carteira excedeu o limite de pesquisa. Nenhum total parcial foi aplicado.');
  }
  return { complete: true, tickets, startedAt, readAt: new Date().toISOString() };
}
