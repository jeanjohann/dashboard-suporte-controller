import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCustomQuery, defaultQuery } from './customQuery.js';
import { evaluateDashboardWidget } from './evaluate.js';
import { validateDashboardDocument } from './layout.js';
import { metricKinds, canCompare } from './presentation.js';
import { importOperationalSheet } from '../../operational/domain/operational.js';
import { dashboardMetric } from './catalog.js';

const labels = [
  'Status',
  'Motivo',
  'Razão Social',
  'Placa',
  'ID Rastreador',
  'Custo Total',
  'Data de atendimento',
];
const data = {
  columns: labels.map((label) => ({ label })),
  rows: [
    ['Pago', 'Revisão', 'A', 'AAA1B23', '14400001', 100, 45658],
    ['Concluída', 'Revisão', 'A', 'AAA1B23', '14400001', 0, 45658],
    ['Pago', 'Visita Improdutiva', 'B', 'BBB1B23', '16200001', null, 45690],
    ['Agendado', 'Revisão', 'A', 'CCC1B23', '16200002', 900, null],
  ].map((values, index) => ({
    sourceRow: index + 2,
    os: index < 2 ? '1' : String(index),
    cells: values.map((raw) => ({ raw })),
  })),
};
const query = (measure, group = 'none', scope = 'performed') => ({ group, measure, scope });

test('análise livre mantém granularidade, distintos, zeros, ausências e denominadores', () => {
  const original = JSON.stringify(data);
  assert.equal(evaluateCustomQuery('orders', data, query('rows')).value, 3);
  assert.equal(evaluateCustomQuery('orders', data, query('calls')).value, 2);
  assert.equal(evaluateCustomQuery('orders', data, query('vehicles')).value, 2);
  const average = evaluateCustomQuery('orders', data, query('meanCost'));
  assert.equal(average.value, 5000);
  assert.equal(average.queryAudit[0].excluded, 1);
  assert.equal(average.queryAudit[0].valid, 2);
  assert.deepEqual(average.queryAudit[0].rows, [2, 3, 4]);
  assert.equal(evaluateCustomQuery('orders', data, query('rows', 'none', 'productive')).value, 2);
  assert.equal(
    evaluateCustomQuery('orders', data, query('sumCost', 'Razão Social')).series.find(
      (row) => row.label === 'B',
    ).value,
    null,
  );
  assert.equal(evaluateCustomQuery('orders', data, query('sumCost'), { client: 'B' }).value, null);
  assert.equal(JSON.stringify(data), original);
});
test('agrupamento temporal exclui datas ausentes, ordena meses e exige cabeçalhos', () => {
  const result = evaluateCustomQuery('orders', data, query('rows', 'month', 'all'));
  assert.deepEqual(
    result.series.map((row) => row.label),
    ['2025-01', '2025-02'],
  );
  assert.match(result.note, /1 registros sem data válida/);
  assert.throws(() => evaluateCustomQuery('orders', { ...data, columns: [] }, query('rows')));
});
test('configuração personalizada é transportável e não admite fórmulas, eixos ou unidades arbitrários', () => {
  const widget = {
    id: 'w',
    metric: 'orders.custom',
    title: 'Teste',
    kind: 'card',
    size: 'small',
    filters: {},
    query: query('meanCost'),
  };
  const document = {
    version: 1,
    revision: 0,
    dashboards: [{ id: 'b', name: 'Teste', widgets: [widget] }],
  };
  assert.deepEqual(validateDashboardDocument(document), document);
  for (const changes of [
    { query: { ...widget.query, sql: 'SELECT *' } },
    { query: query('sumSerial') },
    { query: query('rows', 'Desconhecido') },
    { query: query('rows', 'Motivo') },
  ]) {
    assert.throws(() =>
      validateDashboardDocument({
        ...document,
        dashboards: [{ ...document.dashboards[0], widgets: [{ ...widget, ...changes }] }],
      }),
    );
  }
  assert.deepEqual(metricKinds(dashboardMetric('orders.custom'), query('rows')), ['card', 'table']);
  assert(!canCompare('orders.custom', 'orders.custom'));
  assert(defaultQuery('operational').group === 'model');
});
test('permissões da análise livre são verificadas antes de acessar a fonte', () => {
  const poison = new Proxy(
    {},
    {
      get() {
        throw Error('Não pode ler');
      },
    },
  );
  assert.equal(
    evaluateDashboardWidget({ metric: 'orders.custom', query: query('rows') }, poison, {
      active: true,
      role: 'viewer',
      pages: [],
    }).status,
    'restricted',
  );
});
test('mensalidade usa a célula operacional de origem, nunca o texto normalizado ou valor ausente', () => {
  const sheet = {
    '!ref': 'A1:BY2',
    A1: { v: 'Nº' },
    BH1: { v: 'Equipamentos' },
    BF1: { v: 'Placa instalada' },
    AU1: { v: 'Situação' },
    A2: { v: 1 },
    C2: { v: 'A' },
    BH2: { v: '144000001' },
    BF2: { v: 'AAA1B23' },
    AS2: { v: 25 },
  };
  const run = () =>
    evaluateCustomQuery('operational', importOperationalSheet(sheet), {
      group: 'none',
      measure: 'sumMonthly',
      scope: 'all',
    }).value;
  assert.equal(run(), 2500);
  sheet.AS2 = { v: '25,00' };
  assert.equal(run(), null);
  sheet.AS2 = { v: 0 };
  assert.equal(run(), 0);
  sheet.AS2 = { v: null };
  assert.equal(run(), null);
});
