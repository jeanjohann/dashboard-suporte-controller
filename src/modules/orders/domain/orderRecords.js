/** Seleção e ordenação da tabela original de OS; não alteram o recorte dos indicadores. */
import { compareValues } from '../../../shared/data/sorting.js';

/** Busca no conteúdo exibido das células, com a mesma comparação textual em português da página. */
export function searchOrderRecords(rows, search) {
  return rows.filter(
    (row) =>
      !search ||
      row.cells.some((cell) =>
        String(cell.display).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
      ),
  );
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
