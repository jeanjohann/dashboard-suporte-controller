import { trackerReplacementPairs } from './trackerReplacements.js';
import { trackerModel } from './trackerModels.js';
import { field } from '../../../shared/data/filters.js';

/** Eventos completos no recorte. A entrada de uma troca não recebe atribuição de manutenção. */
export function maintenanceMatrix(original, selected) {
  const classified = trackerReplacementPairs(original),
    wanted = new Set(selected.rows.map((row) => row.sourceRow));
  const rows = new Map(original.rows.map((row) => [row.sourceRow, row]));
  const cells = new Map(),
    included = new Set();
  let undirected = 0,
    partial = 0;
  function add(event, serial, sourceRow, swapped) {
    const row = rows.get(sourceRow);
    const model = trackerModel({ raw: serial }) || 'Modelo não identificado';
    const cell = field(original, row, 'Motivo');
    const reason =
      cell && !cell.issue
        ? String(cell.raw ?? '').trim() || 'Motivo não informado'
        : 'Motivo não informado';
    const key = JSON.stringify([model, reason]);
    if (!cells.has(key)) cells.set(key, { model, reason, value: 0, swaps: 0, rows: [] });
    const group = cells.get(key);
    group.value++;
    if (swapped) group.swaps++;
    group.rows.push(...event.rows);
    event.rows.forEach((number) => included.add(number));
  }
  for (const event of classified.withoutReplacement)
    if (event.rows.every((number) => wanted.has(number)))
      add(event, event.serial, event.rows[0], false);
  for (const event of classified.pairs) {
    if (!event.rows.some((number) => wanted.has(number))) continue;
    if (!event.rows.every((number) => wanted.has(number))) {
      partial++;
      continue;
    }
    if (!event.oldSerial || !event.removalRow) {
      undirected++;
      continue;
    }
    add(event, event.oldSerial, event.removalRow, true);
  }
  const groups = [...cells.values()].sort(
    (a, b) => b.value - a.value || a.model.localeCompare(b.model),
  );
  return {
    available: classified.available,
    groups,
    events: groups.reduce((sum, item) => sum + item.value, 0),
    swaps: groups.reduce((sum, item) => sum + item.swaps, 0),
    undirected,
    partial,
    flaggedRows: new Set(
      classified.issues
        .filter((issue) => wanted.has(issue.row) && !included.has(issue.row))
        .map((issue) => issue.row),
    ).size,
  };
}
