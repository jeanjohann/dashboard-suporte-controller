/**
 * Testes de regressão: Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summaryMetrics } from './summary.js';
import { finance } from './analysis.js';
import { rankingItems } from '../../../shared/charts/chartRules.js';
test('cards excluem canceladas, preservam zero e usam denominador válido', () => {
  const names = ['Status', 'Custo Total', 'Km', 'Técnico', 'Cobrança', 'Valor a cobrar'];
  const data = {
    columns: names.map((label) => ({ label })),
    rows: [
      ['Pago', 100, 10, 90, 'Cliente', 200],
      ['Concluída', 0, 0, 0, 'Cliente', 0],
      ['Pago', '', 5, '', 'Addlog', 20],
      ['Cancelada', 999, 999, 999, 'Cliente', 999],
    ].map((values, i) => ({
      os: i < 2 ? '1' : String(i),
      sourceRow: i + 2,
      cells: values.map((raw) => ({ raw })),
    })),
  };
  const metrics = Object.fromEntries(
    summaryMetrics(data, finance(data), null).map((item) => [item.key, item]),
  );
  assert.equal(metrics.completed.value, 3);
  assert.equal(metrics.calls.value, 2);
  assert.equal(metrics.cost.value, 10000);
  assert.equal(metrics.average.value, 5000);
  assert.equal(metrics.travel.value, 1500);
  assert.deepEqual(metrics.average.rows, [2, 3]);
  assert.equal(metrics.trackers.value, null);
});
test('cards de troca contam evento e referenciam as linhas do par e acessório', () => {
  const items = summaryMetrics({ columns: [], rows: [] }, null, {
    trackerAvailable: true,
    accessoryAvailable: true,
    swaps: [{ removalRow: 10, installationRow: 11 }],
    accessories: { Coletora: 1, RFID: 0 },
    accessoryRows: { Coletora: [12], RFID: [] },
  });
  assert.equal(items[0].value, null);
  assert.equal(items[5].value, 1);
  assert.deepEqual(items[5].rows, [10, 11]);
  assert.deepEqual(items[6].rows, [12]);
  assert.equal(items[7].value, 0);
});
test('limite de ranking mantém dados originais e empates em ordem estável', () => {
  const items = [
    { label: 'A', value: 1 },
    { label: 'B', value: 4 },
    { label: 'C', value: 4 },
  ];
  assert.deepEqual(
    rankingItems(items, '2').map((item) => item.label),
    ['B', 'C'],
  );
  assert.equal(rankingItems(items, 'all').length, 3);
  assert.equal(items[0].label, 'A');
});
