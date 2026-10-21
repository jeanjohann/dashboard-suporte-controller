import { defaultQuery, validQuery, queryUnit } from './customQuery.js';
import { dashboardMetric } from './catalog.js';

export const kindLabels = {
  card: 'Cartão',
  chart: 'Barras horizontais',
  columns: 'Colunas',
  line: 'Linhas',
  donut: 'Rosca',
  table: 'Tabela',
};
export const sizeLabels = { small: 'Pequeno', medium: 'Médio', wide: 'Largura total' };
const partitions = new Set([
  'orders.types',
  'operational.models',
  'operational.clients',
  'operational.statuses',
  'consumption.operators',
  'monitoring.bases',
]);
export function metricKinds(metric, query) {
  if (!metric) return [];
  if (metric.custom) {
    const q = query || defaultQuery(metric.module);
    return q.group === 'none'
      ? ['card', 'table']
      : [
          'chart',
          'columns',
          ...(q.group === 'month' ? ['line'] : []),
          ...(q.measure === 'rows' ? ['donut'] : []),
          'table',
        ];
  }
  if (!metric.kinds.includes('chart')) return metric.kinds;
  return [
    'chart',
    'columns',
    ...(metric.id === 'orders.months' ? ['line'] : []),
    ...(partitions.has(metric.id) ? ['donut'] : []),
    'table',
  ];
}
function axis(metric) {
  if (
    ['orders.execution', 'orders.scheduling', 'zoho.closedByAgent', 'zoho.timeByAgent'].includes(
      metric?.id,
    )
  )
    return 'agents';
  return metric?.id;
}
export function canCompare(left, right) {
  const first = typeof left === 'string' ? { metric: left } : left;
  const second = typeof right === 'string' ? { metric: right } : right;
  const a = dashboardMetric(first?.metric),
    b = dashboardMetric(second?.metric);
  if (a?.custom || b?.custom)
    return Boolean(
      a?.custom &&
      b?.custom &&
      a.module === b.module &&
      validQuery(a.module, first.query) &&
      validQuery(b.module, second.query) &&
      first.query.group !== 'none' &&
      first.query.group === second.query.group &&
      first.query.measure === second.query.measure &&
      queryUnit(first.query) === queryUnit(second.query),
    );
  return Boolean(
    a &&
    b &&
    !a.custom &&
    !b.custom &&
    a.kinds.includes('chart') &&
    b.kinds.includes('chart') &&
    a.unit === b.unit &&
    axis(a) === axis(b),
  );
}
/** Ausência de categoria continua nula; só rótulos exatamente iguais são associados. */
export function compareSeries(left, right, chronological = false) {
  const a = new Map(left.map((row) => [row.label, row.value]));
  const b = new Map(right.map((row) => [row.label, row.value]));
  const labels = [...new Set([...a.keys(), ...b.keys()])];
  if (chronological) labels.sort();
  return labels.map((label) => ({
    label,
    value: a.get(label) ?? null,
    comparison: b.get(label) ?? null,
  }));
}
/** Roscas preservam o total ao reunir a cauda; desconhecidos nunca se tornam zero. */
export function donutSeries(rows, limit = 6) {
  if (rows.some((row) => row.value == null || !Number.isFinite(row.value) || row.value < 0))
    return null;
  const sorted = rows.filter((row) => row.value > 0).toSorted((a, b) => b.value - a.value);
  if (sorted.length <= limit) return sorted;
  return [
    ...sorted.slice(0, limit - 1),
    {
      label: 'Outras categorias (agrupadas)',
      value: sorted.slice(limit - 1).reduce((sum, row) => sum + row.value, 0),
    },
  ];
}
export function effectiveWidget(widget, boardFilters = {}) {
  if (!widget.inheritFilters) return widget;
  const module = dashboardMetric(widget.metric)?.module;
  const filters = { ...widget.filters };
  if (['orders', 'park', 'logistics'].includes(module)) {
    filters.start = boardFilters.start || '';
    filters.end = boardFilters.end || '';
  }
  if (['orders', 'park', 'operational'].includes(module))
    filters.client = boardFilters.client || '';
  return { ...widget, filters };
}
export function widgetParts(widget) {
  return [widget, ...(widget.companions || []), ...(widget.comparison ? [widget.comparison] : [])];
}

/** Agrupa seções pela primeira ocorrência, conservando a ordem interna. */
export function organizeSections(widgets) {
  const sections = [...new Set(widgets.map((w) => w.section || ''))];
  return sections.flatMap((section) => widgets.filter((w) => (w.section || '') === section));
}
