import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoQueries, validateDemoQuery } from './assistant-demo-queries.mjs';
import { attendanceQuery } from './local-acervo.mjs';
const excel = (date) => (Date.parse(date + 'T00:00:00Z') - Date.UTC(1899, 11, 30)) / 86400000;
function sample() {
  const labels = [
    '#',
    'Status',
    'CNPJ para Cobrança',
    'Razão Social',
    'Placa',
    'ID Rastreador',
    'Tipo de Serviço',
    'Motivo',
    'Instruções',
    'Data de atendimento',
    'Resp. Execução',
    'Resp. Agendamento',
    'Custo Total',
  ];
  const entries = [
    [
      '1',
      'Pago',
      '99000001000101',
      'Demo',
      'TST0A01',
      '1440000001',
      'Implementação',
      'Instalação Business 2.1',
      'Kit',
      excel('2026-08-01'),
      'Jean',
      'Camila Demo',
      10,
    ],
    [
      '2',
      'Concluída',
      '99000001000101',
      'Demo',
      'TST0A01',
      '1440000001',
      'Assistência Técnica',
      'Desinstalação Business 2.1',
      'Retirar',
      excel('2026-10-12'),
      'Jean',
      'Camila Demo',
      20,
    ],
    [
      '2',
      'Concluída',
      '99000001000101',
      'Demo',
      'TST0A01',
      '1440000002',
      'Assistência Técnica',
      'Instalação Business 2.1',
      'Instalar',
      excel('2026-10-12'),
      'Jean',
      'Camila Demo',
      30,
    ],
    [
      '3',
      'Pago',
      '99000001000284',
      'Demo',
      'TST0A02',
      '1300000001',
      'Assistência Técnica',
      'Visita Improdutiva',
      'Indisponível',
      excel('2026-10-13'),
      'Jean',
      'Camila Demo',
      40,
    ],
    [
      '4',
      'Pago',
      '99000001000101',
      'Demo',
      'TST0A01',
      '1440000002',
      'Assistência Técnica',
      'Revisão da Instalação',
      'Sem troca',
      excel('2026-10-19'),
      'Camila Demo',
      'Jean',
      50,
    ],
    [
      '5',
      'Pago',
      '99000001000101',
      'Demo',
      'TST0A01',
      '1440000002',
      'Assistência Técnica',
      'Revisão da Instalação',
      'Sem data',
      null,
      'Jean',
      'Jean',
      60,
    ],
    [
      '6',
      'Agendado',
      '99000001000101',
      'Demo',
      'TST0A01',
      '1440000002',
      'Assistência Técnica',
      'Revisão da Instalação',
      'Pendente',
      null,
      'Jean',
      'Jean',
      null,
    ],
  ];
  const orders = {
    columns: labels.map((label, index) => ({ label, letter: String.fromCharCode(65 + index) })),
    rows: entries.map((entry, index) => ({
      os: entry[0],
      sourceRow: index + 2,
      cells: entry.map((raw) => ({ raw, display: String(raw ?? '') })),
    })),
    issues: [],
    customerRegistry: {
      available: true,
      rows: ['99000001000101', '99000001000284'].map((cnpj) => ({
        cnpj,
        name: 'Demo',
        group: 'Cliente Demo',
      })),
    },
  };
  const operational = {
    rows: [
      ['TST0A01', '1440000002', 'Ativo', 'Demo'],
      ['TST0A02', '1300000001', 'Ativo', 'Demo'],
      ['TST0A03', '1620000001', 'Cancelado', 'Demo'],
    ].map(([plate, serial, status, client]) => ({
      layout: 'legacy',
      plate,
      serial,
      status,
      client,
      model: 'Não usar modelo declarado',
      cells: Array.from({ length: 77 }, () => ({ raw: null })),
    })),
  };
  // Operacional resolve nomes por CNPJ, sem depender de variações no texto declarado.
  operational.rows.forEach((row, index) => {
    row.document = index === 1 ? '99000001000284' : '99000001000101';
    row.cells[59] = { raw: row.serial };
  });
  return {
    profile: 'demo',
    manifest: [
      { kind: 'orders', filename: 'DEMO-OS.xlsx', sheets: ['OS 2025_26'] },
      { kind: 'operational', filename: 'DEMO-Operacional.xlsx', sheets: ['Equipamentos'] },
    ],
    datasets: { orders, operational },
    attendance: attendanceQuery(orders),
    generatedAt: '2026-10-19T12:00:00Z',
  };
}
test('consultas ampliadas recusam perfil real, fontes misturadas e parâmetros fora do contrato', () => {
  const archive = sample();
  assert.throws(() => createDemoQueries({ ...archive, profile: 'real' }));
  assert.throws(() => createDemoQueries({ ...archive, manifest: [{ filename: 'Real.xlsx' }] }));
  for (const q of [
    { arquivo: '../real.xlsx' },
    { tipo: 'sql' },
    { limite: 21 },
    { detalhar: 'true' },
    { periodo: 'personalizado', inicio: '2026-02-30', fim: '2026-03-01' },
    { inicio: '2026-01-01' },
    { tipo: 'parque', responsavel: 'Jean', periodo: 'total' },
    { tipo: 'parque', periodo: 'semana_anterior' },
  ])
    assert.throws(() => validateDemoQuery(q));
});
test('semana anterior filtra data e responsável, mantém custo improdutivo e deduplica chamados', () => {
  const result = createDemoQueries(sample()).query({
    periodo: 'semana_anterior',
    responsavel: 'jean',
    detalhar: true,
    limite: 2,
  });
  assert.equal(result.period.start, '2026-10-12');
  assert.equal(result.period.end, '2026-10-18');
  assert.deepEqual(result.metrics, {
    completed: 3,
    productive: 2,
    unproductive: 1,
    distinctCompletedCalls: 2,
    costReais: 90,
  });
  assert.equal(result.details.total, 3);
  assert.equal(result.details.rows.length, 2);
  assert.equal(result.details.truncated, true);
  assert.equal(result.completedWithoutValidDate, 1);
});
test('consolidação reúne filiais, datas ausentes só entram no total e filtro desconhecido não é ignorado', () => {
  const engine = createDemoQueries(sample());
  const total = engine.query({ periodo: 'total', cliente: 'Cliente Demo', agrupar: 'cliente' });
  assert.equal(total.metrics.completed, 6);
  assert.equal(total.ranking.total, 1);
  assert.equal(total.ranking.rows[0].total, 6);
  assert.equal(
    engine.query({ periodo: 'semana_atual', papel: 'agendamento', responsavel: 'Jean' }).metrics
      .completed,
    1,
  );
  assert.equal(
    engine.query({ periodo: 'personalizado', inicio: '2024-01-01', fim: '2024-12-31' }).metrics
      .completed,
    0,
  );
  assert.throws(() => engine.query({ responsavel: 'Inexistente' }));
  assert.throws(() => engine.query({ cliente: 'Outro cliente' }));
});
test('troca é evento único e vida observada usa ciclo fechado; filtro não inclui outro responsável', () => {
  const engine = createDemoQueries(sample());
  const result = engine.query({
    tipo: 'trocas',
    periodo: 'total',
    agrupar: 'placa',
    detalhar: true,
  });
  assert.deepEqual(result.metrics, { tracker: 1, rfid: 0, collector: 0 });
  assert.equal(result.details.total, 1);
  assert.equal(result.life.closedCycles, 1);
  assert.equal(result.life.meanDays, 72);
  assert.equal(
    engine.query({ tipo: 'trocas', periodo: 'total', responsavel: 'Camila Demo' }).metrics.tracker,
    0,
  );
});
test('parque conta ausência de OS efetiva e usa serial para modelo, não confunde improdutiva com intervenção', () => {
  const engine = createDemoQueries(sample());
  const result = engine.query({
    tipo: 'parque',
    periodo: 'total',
    situacao: 'Ativo',
    semHistorico: true,
    agrupar: 'modelo',
    detalhar: true,
  });
  assert.deepEqual(result.metrics, { total: 1, active: 1, canceled: 0, withoutHistory: 1 });
  assert.equal(result.details.rows[0].placa, 'TST0A02');
  assert.equal(result.ranking.rows[0].label, 'MXT-130v1');
});

test('ranking por improdutivas ordena antes de limitar, sem substituir por volume total', () => {
  const archive = sample();
  archive.datasets.orders.customerRegistry.rows[1].group = 'Outra filial consolidada';
  const engine = createDemoQueries(archive);
  const visits = engine.query({ periodo: 'total', agrupar: 'cliente', limite: 1 });
  const unproductive = engine.query({
    periodo: 'total',
    agrupar: 'cliente',
    ordenar: 'improdutivos',
    limite: 1,
  });
  assert.equal(visits.ranking.rows[0].label, 'Cliente Demo');
  assert.equal(unproductive.ranking.rows[0].label, 'Outra filial consolidada');
  assert.equal(unproductive.ranking.rows[0].improdutivos, 1);
  assert.equal(unproductive.ranking.truncated, true);
});
