/** Recorta uma pessoa sobre o resultado já filtrado: mantém data, papel e denominador da equipe. */
import { attendanceDate, field } from '../../../shared/data/filters.js';
import { isUnproductive } from './attendanceKind.js';

const owner = (data, row, column) => {
  const cell = field(data, row, column);
  return cell?.issue ? '' : String(cell?.raw ?? '').trim();
};

export function supportPerson(data, result, name) {
  if (result.unavailable || !name) return null;
  const rows = result.rows.filter((row) => owner(data, row, result.role.column) === name);
  const group = result.groups.find((item) => item.label === name);
  const empty = {
    visits: 0,
    productive: 0,
    unproductive: 0,
    calls: 0,
    clients: 0,
    vehicles: result.totals.vehicles == null ? null : 0,
    vehiclesMissing: 0,
    unproductiveRate: null,
    servicesPerCall: null,
  };
  const metrics = (item) =>
    Object.fromEntries(Object.keys(empty).map((key) => [key, item?.[key] ?? empty[key]]));
  const missingDateRows = result.missingDateRows.filter(
    (row) => owner(data, row, result.role.column) === name,
  );
  const clients = new Map();
  for (const row of rows) {
    const client = owner(data, row, 'Razão Social');
    // Um cliente ausente não é confundido com uma razão social real de nome semelhante.
    const key = JSON.stringify([Boolean(client), client]);
    const item = clients.get(key) || {
      label: client || 'Cliente não informado',
      value: 0,
      rows: [],
    };
    item.value++;
    item.rows.push(row.sourceRow);
    clients.set(key, item);
  }
  const sourceRows = new Set(rows.map((row) => row.sourceRow));
  const unproductiveSources = new Set(
    rows.filter((row) => isUnproductive(data, row)).map((row) => row.sourceRow),
  );
  const periods = result.periods
    .map((period) => {
      const selected = period.rows.filter((row) => sourceRows.has(row));
      if (!selected.length) return null;
      const unproductive = selected.filter((row) => unproductiveSources.has(row)).length;
      return {
        label: period.label,
        productive: selected.length - unproductive,
        unproductive,
        rows: selected,
      };
    })
    .filter(Boolean);
  const pastGroup = result.past?.groups.find((item) => item.label === name);
  const pastRows =
    result.past?.rows.filter((row) => owner(data, row, result.role.column) === name) || [];
  const pastMissing =
    result.past?.missingDateRows.filter((row) => owner(data, row, result.role.column) === name) ||
    [];
  return {
    ...result,
    person: name,
    rows,
    selected: { ...result.selected, rows },
    totals: metrics(group),
    groups: group ? [group] : [],
    participationBase: result.totals.productive,
    share: group?.share ?? (result.totals.productive ? 0 : null),
    missing: [],
    missingDates: missingDateRows.length,
    missingDateRows,
    undated: rows.filter((row) => !attendanceDate(data, row, result.role.date)).length,
    periods,
    profiles: result.profiles.filter((item) => item.owner === name),
    clientGroups: [...clients.values()].sort(
      (a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'),
    ),
    past: result.past
      ? {
          ...result.past,
          rows: pastRows,
          selected: { ...result.past.selected, rows: pastRows },
          groups: pastGroup ? [pastGroup] : [],
          missing: [],
          missingDateRows: pastMissing,
          missingDates: pastMissing.length,
          totals: metrics(pastGroup),
        }
      : null,
  };
}
