/** Volume atribuído ao suporte, com bases temporais separadas e rastreabilidade até a linha. */
import { applyFilters, attendanceDate, field } from '../../../shared/data/filters.js';
import { isUnproductive } from './attendanceKind.js';
import { previousPeriod } from './dashboard.js';
import { validPlate } from './trackerReplacements.js';
import { customerIdentity, customerAnalysisIdentity } from './customerIdentity.js';

export const supportRoles = {
  execution: { column: 'Resp. Execução', date: 'Data de atendimento', label: 'Execução' },
  scheduling: { column: 'Resp. Agendamento', date: 'Agendamento', label: 'Agendamento' },
};
const day = 86400000;
const iso = (instant) => new Date(instant).toISOString().slice(0, 10);

/** Calendário civil: últimos 7 dias incluem hoje; semanas atual/anterior vão de segunda a domingo. */
export function supportPeriod(
  preset,
  today,
  month = today?.slice(0, 7),
  year = today?.slice(0, 4),
) {
  const time = Date.parse(today + 'T00:00:00Z');
  if (!Number.isFinite(time) || iso(time) !== today) throw Error('Data de referência inválida.');
  if (preset === 'total') return { start: '', end: '' };
  if (preset === 'last7') return { start: iso(time - 6 * day), end: today };
  if (preset === 'currentWeek' || preset === 'previousWeek') {
    const monday = time - ((new Date(time).getUTCDay() + 6) % 7) * day;
    if (preset === 'currentWeek') return { start: iso(monday), end: iso(monday + 6 * day) };
    return { start: iso(monday - 7 * day), end: iso(monday - day) };
  }
  if (preset === 'month' && /^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) {
    const start = month + '-01';
    const date = new Date(start + 'T00:00:00Z');
    date.setUTCMonth(date.getUTCMonth() + 1);
    return { start, end: iso(+date - day) };
  }
  if (
    preset === 'year' &&
    /^\d{4}$/.test(String(year)) &&
    Number(year) >= 1900 &&
    Number(year) <= 9999
  )
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  throw Error('Escolha um período válido.');
}

/** Dados ausentes não viram uma pessoa fictícia, cliente ou chamado contado no ranking. */
function text(data, row, label) {
  if (label === 'Razão Social') {
    const identity = customerIdentity(data, row);
    return identity.key === 'Sem cliente' ? '' : identity.key;
  }
  const cell = field(data, row, label);
  return cell?.issue ? '' : String(cell?.raw ?? '').trim();
}
function count(data, rows) {
  const calls = new Set(),
    clients = new Set(),
    vehicles = new Set();
  let productive = 0,
    vehiclesMissing = 0;
  for (const row of rows) {
    if (!isUnproductive(data, row)) productive++;
    if (row.os != null && String(row.os).trim()) calls.add(String(row.os).trim());
    const client = text(data, row, 'Razão Social');
    if (client) clients.add(customerAnalysisIdentity(data, row).key);
    const plate = text(data, row, 'Placa');
    if (client && validPlate(plate)) vehicles.add(JSON.stringify([client, plate]));
    else vehiclesMissing++;
  }
  return {
    visits: rows.length,
    productive,
    unproductive: rows.length - productive,
    calls: calls.size,
    clients: clients.size,
    vehicles: ['Razão Social', 'Placa'].every((label) =>
      data.columns.some((column) => column.label === label),
    )
      ? vehicles.size
      : null,
    vehiclesMissing,
    unproductiveRate: rows.length ? (rows.length - productive) / rows.length : null,
    servicesPerCall: calls.size ? rows.length / calls.size : null,
  };
}

/** Somente Concluída/Pago. Atribuição de agendamento é de serviços realizados, não de toda a agenda aberta. */
function summarize(data, filters, role) {
  const selected = applyFilters(data, filters, role.date);
  const rows = selected.rows.filter((row) =>
    ['Concluída', 'Pago'].includes(text(data, row, 'Status')),
  );
  const categorical = applyFilters(data, { ...filters, start: '', end: '' });
  const missingDateRows =
    filters.start || filters.end
      ? categorical.rows.filter(
          (row) =>
            ['Concluída', 'Pago'].includes(text(data, row, 'Status')) &&
            !attendanceDate(data, row, role.date),
        )
      : [];
  const groups = new Map(),
    missing = [];
  for (const row of rows) {
    const label = text(data, row, role.column);
    if (!label) {
      missing.push(row.sourceRow);
      continue;
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(row);
  }
  const totals = count(data, rows);
  return {
    selected,
    rows,
    totals,
    missing,
    missingDates: missingDateRows.length,
    missingDateRows,
    groups: [...groups]
      .map(([label, records]) => {
        const metrics = count(data, records);
        return {
          label,
          ...metrics,
          rows: records.map((row) => row.sourceRow),
          share: totals.productive ? metrics.productive / totals.productive : null,
        };
      })
      .sort((a, b) => b.productive - a.productive || a.label.localeCompare(b.label, 'pt-BR')),
  };
}

/** Filtros compartilhados são preservados; a comparação muda somente o intervalo de datas. */
export function supportPerformance(data, filters = {}, roleKey = 'execution') {
  const role = supportRoles[roleKey];
  if (!role) throw Error('Responsabilidade inválida.');
  const required = ['Status', role.column, role.date];
  const absent = required.filter((label) => !data.columns.some((column) => column.label === label));
  if (absent.length) return { unavailable: absent, role };
  const current = summarize(data, filters, role);
  const range = previousPeriod(filters);
  const past = range
    ? summarize(data, { ...filters, start: range.start, end: range.end }, role)
    : null;
  const periods = new Map(),
    profiles = new Map();
  let undated = 0;
  const unit = range && range.days <= 62 ? 'day' : 'month';
  for (const row of current.rows) {
    const date = attendanceDate(data, row, role.date);
    const productive = !isUnproductive(data, row);
    if (!date) undated++;
    else {
      const label = unit === 'day' ? date : date.slice(0, 7);
      const entry = periods.get(label) || { label, productive: 0, unproductive: 0, rows: [] };
      entry[productive ? 'productive' : 'unproductive']++;
      entry.rows.push(row.sourceRow);
      periods.set(label, entry);
    }
    const owner = text(data, row, role.column);
    if (!owner) continue;
    const type = productive
      ? text(data, row, 'Tipo de Serviço') || 'Tipo não informado'
      : 'Visita improdutiva';
    const key = JSON.stringify([owner, type]);
    const entry = profiles.get(key) || { owner, type, value: 0, rows: [] };
    entry.value++;
    entry.rows.push(row.sourceRow);
    profiles.set(key, entry);
  }
  return {
    ...current,
    role,
    range,
    past,
    undated,
    unit,
    groups: current.groups.map((group) => ({
      ...group,
      previous: past
        ? past.groups.find((item) => item.label === group.label)?.productive || 0
        : null,
    })),
    profiles: [...profiles.values()],
    periods: [...periods.values()].sort((a, b) => a.label.localeCompare(b.label)),
  };
}
