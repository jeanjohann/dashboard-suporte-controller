import { dashboardMetric, canUseDashboardModule } from './catalog.js';

export const dashboardTemplates = [
  {
    id: 'management',
    name: 'Visão de gestão',
    note: 'Volume, custos e evolução dos atendimentos.',
    metrics: [
      'orders.completed',
      'orders.productive',
      'orders.cost',
      'orders.months',
      'orders.types',
      'orders.execution',
    ],
  },
  {
    id: 'support',
    name: 'Equipe de suporte',
    note: 'OS e Zoho lado a lado, cada fonte com seu período.',
    metrics: [
      'orders.productive',
      'zoho.closedTickets',
      'zoho.seconds',
      'orders.execution',
      'orders.scheduling',
      'zoho.closedByAgent',
      'zoho.timeByAgent',
    ],
  },
  {
    id: 'park',
    name: 'Parque e equipamentos',
    note: 'Retrato operacional, manutenção e distribuição de modelos.',
    metrics: [
      'operational.records',
      'park.withServices',
      'park.swaps',
      'park.rate',
      'operational.models',
      'operational.statuses',
    ],
  },
  {
    id: 'consumption',
    name: 'Consumo M2M',
    note: 'Tráfego, ausência de consumo e participação das operadoras.',
    metrics: [
      'consumption.lines',
      'consumption.ticks',
      'consumption.average',
      'consumption.zero',
      'consumption.operators',
    ],
  },
];
export function templateMetrics(template, user) {
  return template.metrics
    .map(dashboardMetric)
    .filter((metric) => metric && canUseDashboardModule(user, metric.module));
}
export function createTemplate(template, user, makeId) {
  return {
    id: makeId(),
    name: template.name,
    widgets: templateMetrics(template, user).map((metric) => ({
      id: makeId(),
      metric: metric.id,
      title: metric.label,
      kind: metric.id === 'orders.months' ? 'line' : metric.kinds[0],
      size: metric.kinds.includes('chart') ? 'medium' : 'small',
      filters: {},
      section: metric.kinds.includes('chart') ? 'Análises' : 'Indicadores principais',
      inheritFilters: ['orders', 'park', 'operational', 'logistics'].includes(metric.module),
    })),
  };
}
