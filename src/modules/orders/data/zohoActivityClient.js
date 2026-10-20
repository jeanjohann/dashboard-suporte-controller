import { api } from '../../../shared/security/accessClient.js';
import { zohoPeriod } from '../../../shared/data/zohoActivity.js';

/** Só entrega uma coleta quando todas as páginas terminam. Falhas/cancelamento descartam o lote. */
export async function loadZohoActivity(
  { start, end, signal, onProgress = () => {} },
  apiImpl = api,
) {
  zohoPeriod(start, end);
  const result = {
    period: { start, end },
    replies: [],
    entries: [],
    review: [],
    metrics: [],
    closures: [],
    ticketIds: [],
  };
  const seen = new Set();
  let from = 0,
    anchor;
  for (let page = 0; page < 100; page++) {
    signal?.throwIfAborted();
    const params = new URLSearchParams({ start, end, from: String(from) });
    if (anchor) params.set('anchor', anchor);
    const batch = await apiImpl(`/api/zoho/activity?${params}`, { signal });
    signal?.throwIfAborted();
    if (
      batch.version !== 2 ||
      batch.from !== from ||
      batch.period?.start !== start ||
      batch.period?.end !== end ||
      (anchor && batch.anchor !== anchor) ||
      !['replies', 'entries', 'review', 'metrics', 'closures', 'ticketIds'].every((key) =>
        Array.isArray(batch[key]),
      )
    )
      throw Error(
        'A coleta do Zoho retornou uma página incompatível. A leitura anterior foi mantida.',
      );
    anchor = batch.anchor;
    for (const id of batch.ticketIds) {
      if (seen.has(id))
        throw Error(
          'Os chamados mudaram de posição durante a coleta. Tente novamente; a leitura anterior foi mantida.',
        );
      seen.add(id);
    }
    for (const key of ['replies', 'entries', 'review', 'metrics', 'closures', 'ticketIds'])
      result[key].push(...batch[key]);
    onProgress(result.ticketIds.length);
    if (batch.next == null)
      return { ...result, anchor, readAt: new Date().toISOString(), coverage: batch.coverage };
    if (batch.next !== from + 5)
      throw Error('A paginação do Zoho não avançou corretamente. A leitura anterior foi mantida.');
    from = batch.next;
  }
  throw Error(
    'A coleta excedeu o limite do piloto. Reduza o período; a leitura anterior foi mantida.',
  );
}
