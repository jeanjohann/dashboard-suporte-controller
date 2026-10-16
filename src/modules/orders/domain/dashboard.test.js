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

test('cards de cobertura contam identificações distintas e implementações efetivas, sem alterar custos ou origem', () => {
  const columns = [
    'Status',
    'Razão Social',
    'Placa',
    'Tipo de Serviço',
    'Motivo',
    'Custo Total',
  ].map((label) => ({ label }));
  const values = [
    ['Pago', 'Cliente A', 'ABC1D23', 'Implementação', '', 100],
    ['Concluída', ' Cliente A ', 'ABC1D23', 'Assistência Técnica', '', 200],
    ['Concluída', 'Cliente B', 'ABC1D23', 'Assistência Técnica', 'Visita Improdutiva', 50],
    ['Pago', 'Cliente B', 'DEF1G23', 'Implementação', 'Visita Improdutiva', 20],
    ['Pago', '', 'GHI1J23', 'Implementação', '', 0],
    ['Pago', 'Cliente C', 'sem placa', 'Assistência Técnica', '', null],
    ['Cancelada', 'Cliente D', 'JKL1M23', 'Implementação', '', 999],
    ['Agendado', 'Cliente E', 'NOP1Q23', 'Implementação', '', 999],
  ];
  const data = {
    columns,
    rows: values.map((row, i) => ({
      os: '#1',
      sourceRow: i + 2,
      cells: row.map((raw) => ({ raw })),
    })),
  };
  const before = structuredClone(data),
    result = periodMetrics(data);
  assert.equal(result.completed, 6);
  assert.equal(result.clients, 3);
  assert.equal(result.vehicles, 3);
  assert.equal(result.implementations, 2);
  assert.equal(result.clientsMissing, 1);
  assert.equal(result.vehiclesMissing, 2);
  assert.equal(result.unproductive, 2);
  assert.equal(result.calls, 1);
  assert.equal(result.cost, 37000);
  assert.equal(result.costCount, 5);
  assert.equal(result.average, 7400);
  assert.deepEqual(data, before);
});

test('identificações com erro e marcadores de placa não entram; coluna ausente difere de base vazia válida', () => {
  const columns = ['Status', 'Razão Social', 'Placa', 'Tipo de Serviço'].map((label) => ({
    label,
  }));
  const markers = ['0', '-', '?', 's/placa', 'SEM PLACA', 'sem dados', ''];
  const rows = markers.map((raw) => ({
    os: '#1',
    cells: [{ raw: 'Pago' }, { raw: 'Cliente A' }, { raw }, { raw: 'Implementação' }],
  }));
  rows.push({
    os: '#2',
    cells: [
      { raw: 'Pago' },
      { raw: 'Cliente com erro', issue: true },
      { raw: 'ABC1D23' },
      { raw: 'Assistência Técnica' },
    ],
  });
  rows.push({
    os: '#3',
    cells: [
      { raw: 'Pago' },
      { raw: 'Cliente B' },
      { raw: 'ABC1D23', issue: true },
      { raw: 'Assistência Técnica' },
    ],
  });
  const result = periodMetrics({ columns, rows });
  assert.equal(result.clients, 2);
  assert.equal(result.vehicles, 0);
  assert.equal(result.vehiclesMissing, rows.length);
  assert.equal(result.clientsMissing, 1);
  assert.equal(periodMetrics({ columns, rows: [] }).clients, 0);
  assert.equal(periodMetrics({ columns, rows: [] }).vehicles, 0);
  assert.equal(periodMetrics({ columns: [], rows: [] }).clients, null);
  assert.equal(periodMetrics({ columns: [], rows: [] }).vehicles, null);
  assert.equal(periodMetrics({ columns: [], rows: [] }).implementations, null);
});

test('novos cards respeitam período, cliente e comparação da mesma duração', () => {
  const columns = ['Status', 'Razão Social', 'Placa', 'Tipo de Serviço', 'Data de atendimento'].map(
    (label) => ({ label }),
  );
  const values = [
    ['Pago', 'A', 'ABC1D23', 'Implementação', 45658],
    ['Concluída', 'A', 'DEF1G23', 'Implementação', 45658],
    ['Pago', 'A', 'ABC1D23', 'Assistência Técnica', 45657],
    ['Pago', 'B', 'GHI1J23', 'Implementação', 45658],
  ];
  const data = {
    columns,
    issues: [],
    rows: values.map((row, i) => ({
      os: '#' + i,
      sourceRow: i + 2,
      cells: row.map((raw) => ({ raw })),
    })),
  };
  const d = dashboardData(data, { start: '2025-01-01', end: '2025-01-01', 'Razão Social': ['A'] });
  assert.equal(d.current.clients, 1);
  assert.equal(d.past.clients, 1);
  assert.equal(d.current.vehicles, 2);
  assert.equal(d.past.vehicles, 1);
  assert.equal(d.current.implementations, 2);
  assert.equal(d.past.implementations, 0);
  assert.deepEqual(change(d.current.implementations, d.past.implementations), {
    difference: 2,
    percent: null,
  });
});
