/**
 * Testes de regressão: Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { report, history } from './reports.js';
const names = [
  'Status',
  'UF',
  'Custo Total',
  'Placa',
  'ID Rastreador',
  'Data de atendimento',
  'Cobrança',
  'Valor a cobrar',
];
function fixture() {
  return {
    columns: names.map((label) => ({ label })),
    rows: [
      ['#1', 'Pago', 'SP', 100, 'ABC', 1, 45001, 'Cliente', 200],
      ['#1', 'Concluída', 'PR', 50, 'ABC', 2, 45000, 'Addlog', 100],
      ['#2', 'Cancelada', 'SP', 999, 'ABC', 1, null, 'Cliente', 999],
      ['#3', 'Pago', 'SP', null, 'DEF', 3, null, 'Cliente', null],
    ].map(([os, ...values], i) => ({
      os,
      sourceRow: i + 2,
      cells: values.map((raw) => ({ raw, display: String(raw ?? '') })),
    })),
  };
}
test('relatórios preservam total lançado, excluem cancelamento e valores ausentes', () => {
  const result = report(fixture(), 'UF', 'cost');
  assert.equal(result.eligible, 3);
  assert.equal(result.excluded, 1);
  assert.deepEqual(
    result.items.map((item) => [item.label, item.value]),
    [
      ['SP', 10000],
      ['PR', 5000],
    ],
  );
  assert.deepEqual(result.items[0].rows, [2]);
});
test('chamado pode participar de grupos diferentes sem duplicar dentro do grupo', () => {
  const result = report(fixture(), 'UF', 'calls');
  assert.deepEqual(
    result.items.map((item) => [item.label, item.value]),
    [
      ['SP', 2],
      ['PR', 1],
    ],
  );
});
test('relatório contratual separa destinatários e sinaliza ausência de colunas', () => {
  assert.equal(report(fixture(), 'UF', 'client').items[0].value, 20000);
  assert.equal(report({ columns: [], rows: [] }, 'UF', 'cost').unavailable, true);
});
test('histórico mantém cancelamento e ordena datas com ausentes ao final', () => {
  const result = history(fixture(), 'Placa', 'ABC');
  assert.deepEqual(
    result.map((event) => event.row.sourceRow),
    [3, 2, 4],
  );
  assert.equal(history(fixture(), 'ID Rastreador', '1').length, 2);
  assert.equal(history(fixture(), 'Placa', 'AB').length, 0);
});
