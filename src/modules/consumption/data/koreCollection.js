/** Acumula lotes contíguos em memória, rejeitando duplicidades e mudança de cobertura. */
import { normalizeKorePage } from './koreContract.js';
export function appendKoreBatch(previous, batch) {
  if (
    !batch ||
    !Array.isArray(batch.pages) ||
    !batch.pages.length ||
    batch.pages.length > 8 ||
    typeof batch.cleanupConfirmed !== 'boolean'
  )
    throw Error('Lote KORE inválido.');
  const pages = batch.pages.map(normalizeKorePage);
  const rows = [...(previous?.rows ?? [])];
  const ids = new Set(rows.map((row) => row.id));
  const chips = new Set(rows.map((row) => row.iccid).filter(Boolean));
  let number = (previous?.page ?? 0) + 1;
  const total = previous?.totalReported ?? pages[0].totalReported;
  if (previous && !previous.hasNext) throw Error('Coleta já concluída.');
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    if (
      page.page !== number++ ||
      page.totalReported !== total ||
      (index < pages.length - 1 && !page.hasNext)
    )
      throw Error('A paginação ou o total da conta mudou. Reinicie a coleta.');
    for (const row of page.rows) {
      if (ids.has(row.id) || (row.iccid && chips.has(row.iccid)))
        throw Error('Há linhas repetidas entre páginas. Reinicie a coleta.');
      ids.add(row.id);
      if (row.iccid) chips.add(row.iccid);
      rows.push(row);
    }
  }
  const last = pages.at(-1);
  if (
    rows.length > total ||
    (!last.hasNext && rows.length !== total) ||
    (last.hasNext && rows.length >= total)
  )
    throw Error('A cobertura não corresponde ao total informado. Reinicie a coleta.');
  return {
    ...last,
    rows,
    firstReadAt: previous?.firstReadAt ?? pages[0].readAt,
    cleanupConfirmed: batch.cleanupConfirmed,
    complete: !last.hasNext,
  };
}
