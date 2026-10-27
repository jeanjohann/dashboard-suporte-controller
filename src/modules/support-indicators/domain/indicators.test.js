import test from 'node:test';
import assert from 'node:assert/strict';
import {
  agents,
  blankEntry,
  validateEntry,
  validateSettings,
  defaultSettings,
  currentSettings,
  awaitingScheduleCount,
  periodDays,
  previousPeriod,
  manualSummary,
  ordersSummary,
  zohoSummary,
} from './indicators.js';
const period = { start: '2026-10-19', end: '2026-10-25' };
const serial = (date) =>
  (Date.parse(date + 'T00:00:00Z') - Date.parse('1899-12-30T00:00:00Z')) / 86400000;
function orders() {
  const labels = [
    'Status',
    'Data de atendimento',
    'Agendamento',
    'Resp. Execução',
    'Resp. Agendamento',
    'Tipo de Serviço',
    'Motivo',
    'Razão Social',
  ];
  const rows = [
    [
      'Concluída',
      serial('2026-10-19'),
      serial('2026-10-12'),
      'Jean',
      'Eduardo',
      'Implementação',
      'Instalação',
      'CLIENTE A',
    ],
    [
      'Pago',
      serial('2026-10-20'),
      serial('2026-10-20'),
      'Eduardo Oliveira',
      'Jean Johann',
      'Assistência Técnica',
      'Visita Improdutiva',
      'CLIENTE B',
    ],
    [
      'Agendado',
      null,
      serial('2026-10-22'),
      'Jean',
      'Eduardo',
      'Assistência Técnica',
      'Revisão',
      'CLIENTE A',
    ],
    ['Cancelado', null, serial('2026-10-22'), 'Jean', 'Eduardo', 'Cancelamento', '', 'CLIENTE A'],
    ['Concluída', null, null, 'Jean', 'Jean', 'Implementação', '', 'CLIENTE A'],
    [
      'Concluída',
      serial('2026-10-23'),
      null,
      'Jean Silva',
      '',
      'Assistência Técnica',
      '',
      'CLIENTE C',
    ],
  ];
  return {
    columns: labels.map((label) => ({ label })),
    rows: rows.map((values, i) => ({
      sourceRow: i + 2,
      os: String(i + 1),
      cells: values.map((raw) => ({ raw })),
    })),
  };
}
test('períodos civis validam limites e comparação atravessa o ano', () => {
  assert.equal(periodDays(period), 7);
  assert.throws(() => periodDays({ start: '2026-02-30', end: '2026-03-01' }));
  assert.throws(() => periodDays({ start: '2025-01-01', end: '2026-01-02' }));
  assert.deepEqual(previousPeriod({ start: '2026-01-01', end: '2026-01-07' }), {
    start: '2025-12-25',
    end: '2025-12-31',
  });
});
test('manual mantém zero confirmado, vazio e filtro por data/pessoa distintos', () => {
  const a = blankEntry('2026-10-19'),
    b = blankEntry('2026-10-20', agents[1].id),
    c = blankEntry('2026-10-18');
  a.values.created = 0;
  b.values.created = 5;
  b.values.trackers = 2;
  c.values.created = 100;
  const records = [a, b, c].map((value) => ({ value }));
  const all = manualSummary(records, period);
  assert.equal(all.totals.created, 5);
  assert.equal(all.requests, 2);
  assert.equal(all.totals.procedures, null);
  const one = manualSummary(records, period, agents[0].id);
  assert.equal(one.totals.created, 0);
  assert.equal(one.requests, null);
});
test('contratos recusam agente desconhecido, campos extras, frações e metas inválidas', () => {
  const entry = blankEntry('2026-10-19');
  assert.equal(validateEntry(entry), true);
  assert.throws(() => validateEntry({ ...entry, agentId: '0' }));
  assert.throws(() => validateEntry({ ...entry, actor: 'forjado' }));
  assert.throws(() => validateEntry({ ...entry, values: { ...entry.values, created: -1 } }));
  assert.throws(() => validateEntry({ ...entry, values: { ...entry.values, created: 1.5 } }));
  assert.equal(validateSettings(defaultSettings), true);
  assert.throws(() => validateSettings({ ...defaultSettings, sections: ['manual', 'manual'] }));
  assert.throws(() => validateSettings({ ...defaultSettings, weeklyGoals: { seconds: 1.5 } }));
});
test('OS separa datas e papéis, improdutivas e canceladas, sem aproximar nome de agente', () => {
  const data = orders(),
    all = ordersSummary(data, period);
  assert.equal(all.executed, 1);
  assert.equal(all.unproductive, 1);
  assert.equal(all.scheduled, 1);
  const unproductiveRow = all.rows.find((r) => r.unproductive);
  assert.equal(unproductiveRow.execution, false);
  assert.equal(unproductiveRow.scheduling, false);
  assert.equal(all.missingExecutionDate, 1);
  assert.equal(all.unmapped, 1);
  assert.ok(
    all.services.some(
      (service) =>
        service.label === 'Implementação · Instalação' &&
        service.executed === 1 &&
        service.scheduled === 0,
    ),
  );
  assert.ok(
    all.services.some(
      (service) =>
        service.label === 'Assistência Técnica · Revisão' &&
        service.executed === 0 &&
        service.scheduled === 1,
    ),
  );
  assert.equal(
    all.clients
      .find((client) => client.label === 'CLIENTE A')
      .services.includes('Implementação · Instalação: 1/0'),
    true,
  );
  assert.equal(all.rows.find((row) => row.execution).service, 'Implementação · Instalação');
  const jean = ordersSummary(data, period, agents[1].id);
  assert.equal(jean.executed, 1);
  assert.equal(jean.scheduled, 0);
  assert.equal(jean.unproductive, 0);
  assert.equal(jean.clients[0].label, 'CLIENTE A');
  const eduardo = ordersSummary(data, period, agents[0].id);
  assert.equal(eduardo.executed, 0);
  assert.equal(eduardo.unproductive, 1);
  assert.equal(eduardo.scheduled, 1);
  assert.equal(ordersSummary(null, period), null);
  assert.ok(ordersSummary({ columns: [], rows: [] }, period).unavailable.includes('Status'));
});

test('agenda exige status Agendado, data no período e responsável identificado em todos os recortes', () => {
  const data = orders();
  const base = data.rows[2];
  const variants = [
    ['Agendado', serial(period.start), 'Eduardo'],
    ['Agendado', serial(period.end), 'Jean'],
    ...['Agendar', 'Concluída', 'Pago', 'Cancelado', 'Cancelada', '', 'Outro'].map((status) => [
      status,
      serial('2026-10-22'),
      'Eduardo',
    ]),
    ['Agendado', serial('2026-10-18'), 'Eduardo'],
    ['Agendado', serial('2026-10-26'), 'Eduardo'],
    ['Agendado', null, 'Eduardo'],
    ['Agendado', 'data inválida', 'Eduardo'],
    ['Agendado', serial('2026-10-22'), ''],
    ['Agendado', serial('2026-10-22'), 'Jean Silva'],
  ];
  data.rows = variants.map(([status, date, owner], index) => {
    const cells = base.cells.map((cell) => ({ ...cell }));
    cells[0].raw = status;
    cells[2].raw = date;
    cells[4].raw = owner;
    return { ...base, cells, os: String(index + 1), sourceRow: index + 2 };
  });
  const all = ordersSummary(data, period);
  assert.equal(all.scheduled, 2);
  assert.deepEqual(
    all.agents.map((agent) => agent.scheduled),
    [1, 1],
  );
  for (const key of ['daily', 'services', 'serviceTypes', 'agentServices', 'clients'])
    assert.equal(
      all[key].reduce((sum, row) => sum + row.scheduled, 0),
      2,
      key,
    );
  assert.deepEqual(
    all.rows.map((row) => row.os),
    ['1', '2'],
  );
  assert.equal(all.missingScheduleDate, 1);
  assert.equal(all.unmapped, 2);
  for (const agent of agents) assert.equal(ordersSummary(data, period, agent.id).scheduled, 1);
  assert.equal(ordersSummary(data, previousPeriod(period)).scheduled, 1);
});

test('Agendar conta toda a pendência atual, inclusive sem data ou responsável, e mantém ausência distinta de zero', () => {
  const data = {
    columns: [{ label: 'Status' }],
    rows: ['Agendar', 'Agendar', 'Agendado', 'Concluída', 'Pago', 'Cancelado', ''].map((raw) => ({
      cells: [{ raw }],
    })),
  };
  data.rows.push({ cells: [{ raw: 'Agendar', issue: 'inválido' }] });
  assert.equal(awaitingScheduleCount(data), 2);
  assert.equal(awaitingScheduleCount({ ...data, rows: [] }), 0);
  assert.equal(awaitingScheduleCount({ columns: [], rows: [] }), null);
  assert.equal(awaitingScheduleCount(null), null);
});

test('preferências antigas recebem o card Agendar uma vez, sem reativar cards ocultos', () => {
  const old = { ...defaultSettings, version: 1, cards: ['executed', 'scheduled'] };
  const current = currentSettings(old);
  assert.deepEqual(current.cards, ['executed', 'scheduled', 'awaitingSchedule']);
  assert.deepEqual(old.cards, ['executed', 'scheduled']);
  assert.equal(validateSettings(old), true);
  assert.equal(validateSettings(current), true);
  assert.deepEqual(currentSettings(current), current);
  const hidden = { ...current, cards: ['executed', 'scheduled'] };
  assert.deepEqual(currentSettings(hidden).cards, hidden.cards);
});

test('improdutiva não inventa agendamento quando faltam data ou responsável, nem vira execução', () => {
  const data = orders();
  const row = data.rows[1];
  const schedule = data.columns.findIndex((c) => c.label === 'Agendamento');
  row.cells[schedule] = { raw: null, display: '' };
  const result = ordersSummary(data, period, agents[0].id);
  assert.equal(result.executed, 0);
  assert.equal(result.unproductive, 1);
  assert.equal(result.rows.find((r) => r.unproductive).scheduling, false);
  assert.equal(result.rows.find((r) => r.unproductive).execution, false);
});
test('Zoho exige cobertura completa, filtra eventos em São Paulo e deduplica por ticket e evento', () => {
  const entry = {
    ticketId: '1',
    id: 'e',
    agentId: agents[1].id,
    executedTime: '2026-10-20T01:00:00Z',
    seconds: 3600,
  };
  const closure = {
    ticketId: '1',
    id: 'c',
    agentId: agents[1].id,
    closedAt: '2026-10-20T02:00:00Z',
  };
  const data = {
    period: { start: '2026-10-01', end: '2026-10-31' },
    closureBasis: 'current-status-v1',
    entries: [
      entry,
      entry,
      { ...entry, id: 'old', executedTime: '2026-10-19T01:00:00Z', seconds: 9000 },
    ],
    closures: [closure, closure],
    review: [],
  };
  const report = zohoSummary(data, period);
  assert.equal(report.seconds, 3600);
  assert.equal(report.closed, 1);
  assert.equal(report.tickets, 1);
  assert.equal(report.meanSeconds, 3600);
  assert.deepEqual(report.daily, [{ label: '2026-10-19', value: 3600 }]);
  assert.equal(zohoSummary(data, period, agents[0].id).seconds, 0);
  assert.equal(
    zohoSummary({ ...data, period: { start: '2026-10-20', end: '2026-10-25' } }, period),
    null,
  );
});
