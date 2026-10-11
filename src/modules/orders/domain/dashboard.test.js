/**
 * Testes de regressão: Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { previousPeriod, change, dashboardData, periodMetrics } from './dashboard.js';
test('período anterior tem mesma duração inclusive e atravessa ano e fevereiro', () => {
  assert.deepEqual(previousPeriod({ start: '2025-01-01', end: '2025-01-31' }), {
    start: '2024-12-01',
    end: '2024-12-31',
    days: 31,
  });
  assert.deepEqual(previousPeriod({ start: '2024-03-01', end: '2024-03-01' }), {
    start: '2024-02-29',
    end: '2024-02-29',
    days: 1,
  });
  assert.equal(previousPeriod({ start: '2025-02-30', end: '2025-03-01' }), null);
  assert.equal(previousPeriod({ start: '2025-03-02', end: '2025-03-01' }), null);
  assert.equal(previousPeriod({ start: '2025-01-01' }), null);
});
test('variações preservam ausência e base zero sem fabricar percentual', () => {
  assert.deepEqual(change(10, 5), { difference: 5, percent: 100 });
  assert.deepEqual(change(3, 0), { difference: 3, percent: null });
  assert.equal(change(null, 1), null);
  assert.equal(periodMetrics({ columns: [], rows: [] }).cost, null);
});
test('agenda sem data é fotografia e comparação mantém os filtros de categoria', () => {
  const columns = [
    'Status',
    'Data de atendimento',
    'Tipo de Serviço',
    'Custo Total',
    'Razão Social',
  ].map((label) => ({ label }));
  const values = [
    ['Concluída', 45658, 'Assistência Técnica', 100, 'A'],
    ['Pago', 45657, 'Implementação', 0, 'A'],
    ['Concluída', 45658, 'Assistência Técnica', 500, 'B'],
    ['Agendar', null, null, null, 'A'],
    ['Agendado', null, null, null, 'A'],
    ['Cancelada', 45658, 'Assistência Técnica', 900, 'A'],
  ];
  const rows = values.map((v, i) => ({
    os: '#' + i,
    sourceRow: i + 2,
    cells: v.map((raw) => ({ raw })),
  }));
  const d = dashboardData(
    { columns, rows, issues: [] },
    { start: '2025-01-01', end: '2025-01-01', 'Razão Social': ['A'] },
  );
  assert.equal(d.current.completed, 1);
  assert.equal(d.past.completed, 1);
  assert.equal(d.current.maintenance, 1);
  assert.equal(d.current.cost, 10000);
  assert.equal(d.past.cost, 0);
  assert.equal(d.agenda.waiting.length, 1);
  assert.equal(d.agenda.scheduled.length, 1);
  assert.equal(d.months[0].maintenance, 1);
  assert.equal(d.types[0].value, 1);
});
