import test from 'node:test';
import assert from 'node:assert/strict';
import {
  metricKinds,
  canCompare,
  compareSeries,
  donutSeries,
  effectiveWidget,
  organizeSections,
} from './presentation.js';
import { dashboardMetric } from './catalog.js';
import { validateDashboardDocument } from './layout.js';
import {
  dashboardBackup,
  readDashboardBackup,
  copyDashboard,
  placeWidget,
} from './boardActions.js';
import { dashboardTemplates, createTemplate } from './templates.js';
import { evaluateDashboardWidget } from './evaluate.js';

const admin = { active: true, role: 'admin' },
  linesUser = { active: true, role: 'user', pages: ['lines'] };
const scalar = (id, metric = 'orders.completed') => ({
  id,
  metric,
  title: id,
  kind: 'card',
  size: 'small',
  filters: {},
});
const series = (id, metric = 'orders.execution') => ({
  ...scalar(id, metric),
  kind: 'chart',
  size: 'medium',
});
const doc = (widget) => ({
  version: 1,
  revision: 0,
  dashboards: [{ id: 'b', name: 'Teste', widgets: [widget] }],
});
test('formatos respeitam a natureza do indicador; roscas não somam agentes sobrepostos', () => {
  assert.deepEqual(metricKinds(dashboardMetric('orders.months')), [
    'chart',
    'columns',
    'line',
    'area',
    'table',
  ]);
  assert(metricKinds(dashboardMetric('orders.types')).includes('donut'));
  assert(!metricKinds(dashboardMetric('zoho.closedByAgent')).includes('donut'));
  assert(!metricKinds(dashboardMetric('orders.execution')).includes('line'));
  assert.deepEqual(metricKinds(dashboardMetric('orders.completed')), ['card', 'table']);
});
test('rosca agrega a cauda mantendo o total e recusa ausências/negativos', () => {
  const rows = Array.from({ length: 9 }, (_, i) => ({ label: 'Categoria ' + i, value: i }));
  const before = structuredClone(rows),
    grouped = donutSeries(rows);
  assert.equal(grouped.length, 6);
  assert.equal(
    grouped.reduce((sum, r) => sum + r.value, 0),
    36,
  );
  assert.equal(grouped.at(-1).label, 'Outras categorias (agrupadas)');
  assert.deepEqual(rows, before);
  assert.equal(donutSeries([{ label: 'Falta', value: null }]), null);
  assert.equal(donutSeries([{ label: 'Negativo', value: -1 }]), null);
  assert.deepEqual(donutSeries([{ label: 'Zero', value: 0 }]), []);
});
test('comparações requerem eixo/unidade compatíveis e preservam ausência versus zero', () => {
  assert(canCompare('orders.execution', 'orders.scheduling'));
  assert(canCompare('orders.execution', 'zoho.closedByAgent'));
  assert(!canCompare('zoho.closedByAgent', 'zoho.timeByAgent'));
  assert(!canCompare('orders.months', 'orders.types'));
  assert.deepEqual(
    compareSeries([{ label: 'Jean', value: 0 }], [{ label: 'Jean Johann', value: 8 }]),
    [
      { label: 'Jean', value: 0, comparison: null },
      { label: 'Jean Johann', value: null, comparison: 8 },
    ],
  );
  assert.deepEqual(
    compareSeries([{ label: '2026-03', value: 2 }], [{ label: '2026-01', value: 0 }], true).map(
      (r) => r.label,
    ),
    ['2026-01', '2026-03'],
  );
});
test('recorte é optativo, compatível com o módulo e não modifica filtros próprios', () => {
  const w = { ...scalar('w'), filters: { start: '2025-01-01', client: 'Anterior' } };
  const filters = { start: '2026-10-01', end: '2026-10-20', client: 'Cliente A' };
  assert.equal(effectiveWidget(w, filters), w);
  assert.deepEqual(effectiveWidget({ ...w, inheritFilters: true }, filters).filters, filters);
  assert.equal(w.filters.client, 'Anterior');
  assert.deepEqual(effectiveWidget({ ...w, inheritFilters: true }, {}).filters, {
    start: '',
    end: '',
    client: '',
  });
  const zoho = { ...scalar('z', 'zoho.seconds'), inheritFilters: true, filters: { agent: '123' } };
  assert.deepEqual(effectiveWidget(zoho, filters).filters, { agent: '123' });
  assert.deepEqual(
    effectiveWidget({ ...scalar('p', 'operational.records'), inheritFilters: true }, filters)
      .filters,
    { client: 'Cliente A' },
  );
});
test('composição, comparação e recorte sobrevivem a backup/cópia com IDs novos', () => {
  const w = { ...scalar('w'), section: 'Equipe', companions: [scalar('z', 'zoho.seconds')] };
  const d = doc(w);
  d.dashboards[0].filters = { client: 'Cliente A' };
  const text = dashboardBackup(d, admin);
  assert.deepEqual(readDashboardBackup(text, admin), d.dashboards);
  assert.throws(
    () => readDashboardBackup(text, { active: true, role: 'user', pages: ['orders'] }),
    /permissão/,
  );
  let id = 0;
  const copied = copyDashboard(d.dashboards[0], [], () => 'new' + ++id);
  assert.notEqual(copied.widgets[0].companions[0].id, 'z');
  assert.deepEqual(copied.filters, d.dashboards[0].filters);
  const chart = { ...series('a'), comparison: series('b', 'orders.scheduling') };
  assert.deepEqual(validateDashboardDocument(doc(chart)), doc(chart));
  const poison = new Proxy(
    {},
    {
      get() {
        throw Error('Fonte restrita lida');
      },
    },
  );
  assert.equal(evaluateDashboardWidget(w.companions[0], poison, linesUser).status, 'restricted');
});
test('validação recusa composições recursivas, medidas incompatíveis e recortes inválidos', () => {
  for (const w of [
    { ...series('a'), kind: 'donut' },
    { ...scalar('a'), companions: [{ ...scalar('b'), companions: [] }] },
    { ...scalar('a'), companions: [series('b')] },
    { ...scalar('a'), companions: Array.from({ length: 4 }, (_, i) => scalar('b' + i)) },
    { ...series('a'), comparison: series('b', 'zoho.timeByAgent') },
    { ...series('a'), comparison: { ...series('b'), comparison: series('c') } },
  ])
    assert.throws(() => validateDashboardDocument(doc(w)));
  const d = doc(scalar('a'));
  d.dashboards[0].filters = { start: '2026-10-20', end: '2026-10-01' };
  assert.throws(() => validateDashboardDocument(d), /período/);
});
test('modelos respeitam permissões e mover entre seções adota a seção do destino', () => {
  let id = 0;
  for (const template of dashboardTemplates) {
    const board = createTemplate(template, linesUser, () => 'id' + ++id);
    assert(board.widgets.every((w) => w.metric.startsWith('consumption.')));
    validateDashboardDocument({ version: 1, revision: 0, dashboards: [board] });
  }
  const rows = [
    { ...scalar('a'), section: 'Operação' },
    { ...scalar('b'), section: 'Equipe' },
    { ...scalar('c'), section: 'Operação' },
  ];
  assert.deepEqual(
    organizeSections(rows).map((w) => w.id),
    ['a', 'c', 'b'],
  );
  const moved = placeWidget(rows, 'a', 'b', true);
  assert.equal(moved.find((w) => w.id === 'a').section, 'Equipe');
  assert.equal(rows[0].section, 'Operação');
});
