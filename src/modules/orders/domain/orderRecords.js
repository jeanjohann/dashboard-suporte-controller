/** Seleção e ordenação da tabela original de OS; não alteram o recorte dos indicadores. */
import { compareValues } from '../../../shared/data/sorting.js';

/** Busca no conteúdo exibido das células, com a mesma comparação textual em português da página. */
export function searchOrderRecords(rows, search, cache) {
  const needle = search ? search.toLocaleLowerCase('pt-BR') : '';
  return rows.filter((row) => {
    if (!needle) return true;
    let values = cache?.get(row.cells);
    if (cache && !values) {
      values = [];
      cache.set(row.cells, values);
    }
    return row.cells.some((cell, index) => {
      const text = values?.[index] ?? String(cell.display).toLocaleLowerCase('pt-BR');
      if (values) values[index] = text;
      return text.includes(needle);
    });
  });
}
/** Cache local à versão da base, por células imutáveis; não cruza usuários nem cria texto entre células. */
export function createOrderRecordSearch() {
  const cache = new WeakMap();
  return (rows, search) => searchOrderRecords(rows, search, cache);
}

/** Ordena todo o resultado antes de paginar. Células com erro são ausentes; empates usam a linha de origem. */
export function sortOrderRecords(rows, sort) {
  if (!sort) return rows;
  const value = (row) =>
    sort.index === -1
      ? row.sourceRow
      : row.cells[sort.index]?.issue
        ? null
        : row.cells[sort.index]?.raw;
  return [...rows].sort(
    (a, b) => compareValues(value(a), value(b), sort.direction) || a.sourceRow - b.sourceRow,
  );
}
