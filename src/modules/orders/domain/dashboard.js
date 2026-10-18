import { isUnproductive } from './attendanceKind.js';
/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { applyFilters, field, attendanceDate } from '../../../shared/data/filters.js';
import { money } from './analysis.js';
import { sourceText, validPlate } from './trackerReplacements.js';
import { customerIdentity, customerAnalysisIdentity } from './customerIdentity.js';
/** Constrói o intervalo anterior com a mesma duração inclusiva do período selecionado. */
export function previousPeriod(filters) {
  const valid = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const d = new Date(value + 'T00:00:00Z');
    return Number.isFinite(+d) && d.toISOString().slice(0, 10) === value ? +d : null;
  };
  const start = valid(filters.start),
    end = valid(filters.end);
  if (start == null || end == null || end < start) return null;
  const day = 86400000,
    days = (end - start) / day + 1,
    iso = (time) => new Date(time).toISOString().slice(0, 10);
  return { start: iso(start - days * day), end: iso(start - day), days };
}
/** Calcula os indicadores de um recorte com os denominadores dos serviços elegíveis. */
export function periodMetrics(data) {
  const completed = data.rows.filter((r) =>
    ['Concluída', 'Pago'].includes(field(data, r, 'Status')?.raw),
  );
  const costs = completed.map((r) => money(field(data, r, 'Custo Total'))).filter((v) => v != null);
  const has = (...labels) =>
    ['Status', ...labels].every((label) => data.columns.some((col) => col.label === label));
  const clients = new Set(),
    vehicles = new Set();
  let clientsMissing = 0,
    vehiclesMissing = 0;
  for (const row of completed) {
    const client = sourceText(data, row, 'Razão Social');
    const plate = sourceText(data, row, 'Placa');
    const clientKey = customerIdentity(data, row).key;
    if (client) clients.add(customerAnalysisIdentity(data, row).key);
    else clientsMissing++;
    // Mesmo critério conservador de identificação: não presume veículo a partir de placa provisória.
    if (client && validPlate(plate)) vehicles.add(JSON.stringify([clientKey, plate]));
    else vehiclesMissing++;
  }
  return {
    completed: completed.length,
    productive: completed.filter((r) => !isUnproductive(data, r)).length,
    unproductive: completed.filter((r) => isUnproductive(data, r)).length,
    maintenance: completed.filter(
      (r) =>
        !isUnproductive(data, r) &&
        field(data, r, 'Tipo de Serviço')?.raw === 'Assistência Técnica',
    ).length,
    calls: new Set(completed.map((r) => r.os)).size,
    implementations: has('Tipo de Serviço')
      ? completed.filter(
          (r) =>
            !isUnproductive(data, r) && field(data, r, 'Tipo de Serviço')?.raw === 'Implementação',
        ).length
      : null,
    clients: has('Razão Social') ? clients.size : null,
    vehicles: has('Razão Social', 'Placa') ? vehicles.size : null,
    clientsMissing,
    vehiclesMissing,
    cost: costs.length ? costs.reduce((s, v) => s + v, 0) : null,
    average: costs.length ? costs.reduce((s, v) => s + v, 0) / costs.length : null,
    costCount: costs.length,
  };
}
/** Calcula diferença e variação percentual; base zero ou ausente não produz percentual artificial. */
export function change(current, previous) {
  return current == null || previous == null
    ? null
    : {
        difference: current - previous,
        percent: previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100,
      };
}
/** Aplica os filtros à base original e reúne os indicadores atuais e a comparação temporal disponível. */
export function dashboardData(original, filters) {
  const selected = applyFilters(original, filters),
    range = previousPeriod(filters),
    previous = range
      ? applyFilters(original, { ...filters, start: range.start, end: range.end })
      : null;
  const categorical = applyFilters(original, { ...filters, start: '', end: '' });
  const agenda = { waiting: [], scheduled: [] };
  for (const r of categorical.rows) {
    const status = field(original, r, 'Status')?.raw;
    if (status === 'Agendar') agenda.waiting.push(r.sourceRow);
    if (status === 'Agendado') agenda.scheduled.push(r.sourceRow);
  }
  const months = new Map(),
    types = new Map();
  for (const r of selected.rows) {
    if (!['Concluída', 'Pago'].includes(field(original, r, 'Status')?.raw)) continue;
    const label = isUnproductive(original, r)
      ? 'Visita Improdutiva'
      : String(field(original, r, 'Tipo de Serviço')?.raw ?? '').trim() || 'Não informado';
    types.set(label, (types.get(label) || 0) + 1);
    const date = attendanceDate(original, r);
    if (!date) continue;
    const month = date.slice(0, 7),
      item = months.get(month) || { label: month, implementation: 0, maintenance: 0, other: 0 };
    if (isUnproductive(original, r)) {
      item.unproductive = (item.unproductive || 0) + 1;
    } else if (label === 'Assistência Técnica') item.maintenance++;
    else if (label === 'Implementação') item.implementation++;
    else item.other++;
    months.set(month, item);
  }
  return {
    selected,
    range,
    previous,
    current: periodMetrics(selected),
    past: previous ? periodMetrics(previous) : null,
    agenda,
    months: [...months.values()].sort((a, b) => a.label.localeCompare(b.label)),
    types: [...types].map(([label, value]) => ({ label, value })),
  };
}
