/** Consultas equivalentes em Node; não mede DOM, rede, banco ou abertura total. */
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { evaluateDashboardWidget } from '../src/modules/my-dashboard/domain/evaluate.js';
import { createDashboardEvaluator } from '../src/modules/my-dashboard/domain/evaluationCache.js';

const columns = [
  'Status',
  'Data de atendimento',
  'Tipo de Serviço',
  'Motivo',
  'Razão Social',
  'Placa',
  'Custo Total',
];
const source = {
  filename: 'OS FICTÍCIA',
  data: {
    columns: columns.map((label) => ({ label })),
    issues: [],
    rows: Array.from({ length: 1000 }, (_, i) => ({
      sourceRow: i + 2,
      os: String(i),
      cells: [
        'Pago',
        45900 + (i % 28),
        'Assistência Técnica',
        'Revisão',
        'BASE FICTÍCIA',
        'TST' + i,
        0,
      ].map((raw) => ({ raw })),
    })),
  },
};
const sources = { orders: { value: source, loadedAt: '2026-10-24T12:00:00Z' } };
const user = { active: true, role: 'admin', email: 'benchmark@example.invalid' };
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const results = [];
for (const count of [10, 20, 40]) {
  const before = [],
    after = [];
  for (let sample = 0; sample < 5; sample++) {
    const widgets = Array.from({ length: count }, (_, i) => ({
      id: String(i),
      metric: 'orders.completed',
      filters: {},
    }));
    const started = performance.now();
    const expected = widgets.map((w) => evaluateDashboardWidget(w, sources, user));
    before.push(performance.now() - started);
    const evaluate = createDashboardEvaluator();
    const cachedStart = performance.now();
    const actual = widgets.map((w) => evaluate(w, sources, user));
    after.push(performance.now() - cachedStart);
    assert.deepEqual(actual, expected);
    assert.equal(actual[0].value, 1000);
  }
  results.push({ cards: count, beforeMedianMs: median(before), afterMedianMs: median(after) });
}
const report = {
  rows: 1000,
  samples: 5,
  scope:
    'Consultas iguais, cache inicialmente vazio por amostra; inclui o primeiro cálculo. Resultados equivalentes. Não representa todos os painéis nem tempo total de abertura.',
  results,
};
fs.mkdirSync('layout-review', { recursive: true });
fs.writeFileSync('layout-review/benchmark-dashboard.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
