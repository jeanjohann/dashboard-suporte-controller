/** Ordenação do recorte operacional completo; a paginação é aplicada somente na apresentação. */
import { compareValues } from '../../../shared/data/sorting.js';

const fields = ['sourceRow', 'client', 'serial', 'plate', 'model', 'status'];

/** Mantém a origem intacta, ausências ao final e identificadores textuais sem conversão para Number. */
export function sortOperationalRecords(rows, sort) {
  const field = fields[sort?.index];
  if (!field || !['asc', 'desc'].includes(sort?.direction)) return rows;
  return [...rows].sort((a, b) => {
    let comparison;
    if (field === 'serial') {
      const x = String(a[field] ?? '').trim(),
        y = String(b[field] ?? '').trim();
      if (!x || !y) return !x ? (!y ? a.sourceRow - b.sourceRow : 1) : -1;
      comparison = x.localeCompare(y, 'pt-BR', { numeric: true });
      if (sort.direction === 'desc') comparison = -comparison;
    } else comparison = compareValues(a[field], b[field], sort.direction);
    return comparison || a.sourceRow - b.sourceRow;
  });
}
