import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDashboardWidget, dashboardFilterOptions, formatMetric } from './evaluate.js';
import { permittedCatalog } from './catalog.js';
import { dashboardData } from '../../orders/domain/dashboard.js';
import { summarizeZohoActivity, zohoTeam } from '../../../shared/data/zohoActivity.js';
import { VOLUME_SCALE, periodKey } from '../../consumption/domain/lineConsumption.js';
import { linkOperational } from '../../operational/domain/operational.js';
import { parkAnalysis } from '../../park/domain/parkAnalysis.js';
import { selectLogistics } from '../../logistics/domain/logistics.js';

const admin = { active: true, role: 'admin', email: 'test@example.invalid', pages: [] };
const evaluate = (metric, source, filters = {}, user = admin) =>
  evaluateDashboardWidget({ metric, filters }, source, user);
const entry = (value) => ({ value, loadedAt: '2026-10-20T12:00:00Z' });
const orders = {
  filename: 'OS de teste',
  data: {
    columns: [
      'Status',
      'Data de atendimento',
      'Tipo de Serviço',
      'Custo Total',
      'Razão Social',
      'Placa',
      'Motivo',
      'Resp. Execução',
      'Resp. Agendamento',
      'Agendamento',
    ].map((label) => ({ label })),
    issues: [],
    rows: [
      ['Pago', 45658, 'Implementação', 100, 'A', 'ABC1D23', 'Instalação', 'Jean', 'Eduardo', 45659],
      [
        'Concluída',
        45658,
        'Assistência Técnica',
        0,
        'A',
        'ABC1D24',
        'Manutenção',
        'Eduardo',
        'Jean',
        45659,
      ],
      [
        'Pago',
        45659,
        'Assistência Técnica',
        500,
        'B',
        'ABC1D25',
        'Manutenção',
        'Jean',
        'Jean',
        45659,
      ],
      ['Agendado', null, 'Implementação', 900, 'A', 'ABC1D26', '', 'Jean', 'Jean', 45659],
    ].map((values, index) => ({
      os: String(index),
      sourceRow: index + 2,
      cells: values.map((raw) => ({ raw })),
    })),
  },
};

test('o catálogo e o avaliador verificam as permissões antes de ler fontes', () => {
  const user = { active: true, role: 'user', pages: ['lines'] };
  assert.ok(permittedCatalog(user).every((metric) => metric.module === 'consumption'));
  const poison = new Proxy(
    {},
    {
      get() {
        throw Error('Fonte restrita foi lida');
      },
    },
  );
  assert.equal(evaluate('zoho.closedTickets', poison, {}, user).status, 'restricted');
  assert.equal(evaluate('orders.completed', poison, {}, user).status, 'restricted');
  assert.deepEqual(dashboardFilterOptions('orders', poison, user), {});
  assert.equal(
    evaluate('orders.completed', {}, {}, { ...admin, active: false }).status,
    'restricted',
  );
});
test('fonte não carregada não produz zero e aponta o módulo necessário', () => {
  const result = evaluate('orders.completed', {});
  assert.equal(result.status, 'unavailable');
  assert.equal(result.page, 'orders');
  assert.equal(result.value, undefined);
});
test('OS usa o mesmo período e filtro de cliente do relatório, sem somar bases', () => {
  const filters = { start: '2025-01-01', end: '2025-01-01', client: 'A' };
  const source = { orders: entry(orders), zoho: entry({ data: {} }) };
  const expected = dashboardData(orders.data, {
    start: filters.start,
    end: filters.end,
    'Razão Social': ['A'],
  });
  for (const key of [
    'completed',
    'productive',
    'maintenance',
    'implementations',
    'cost',
    'average',
    'calls',
    'vehicles',
    'clients',
  ]) {
    const result = evaluate('orders.' + key, source, filters);
    assert.equal(result.status, 'ready', key);
    assert.equal(result.value, expected.current[key], key);
  }
  assert.equal(evaluate('orders.cost', source, filters).value, 10000);
  assert.equal(evaluate('orders.cost', source, { client: 'inexistente' }).value, null);
  assert.equal(evaluate('orders.completed', source, { client: 'inexistente' }).value, 0);
  assert.equal(evaluate('orders.completed', source, { start: '2025-02-30' }).status, 'unavailable');
});
test('séries OS preservam meses e responsabilidade de execução/agendamento', () => {
  const source = { orders: entry(orders) },
    filters = { start: '2025-01-01', end: '2025-01-01' };
  assert.deepEqual(evaluate('orders.months', source, filters).series, [
    { label: '2025-01', value: 2 },
  ]);
  assert.equal(
    evaluate('orders.execution', source, filters).series.reduce((sum, row) => sum + row.value, 0),
    2,
  );
  assert.deepEqual(evaluate('orders.scheduling', source, filters).series, []);
  assert.match(evaluate('orders.scheduling', source, filters).note, /Agendamento/);
});
test('colunas essenciais ausentes não aparentam uma leitura sem atendimentos', () => {
  assert.equal(
    evaluate('orders.completed', {
      orders: entry({ ...orders, data: { ...orders.data, columns: [] } }),
    }).status,
    'unavailable',
  );
});
test('clientes usa consolidação padrão do módulo e permite escolher filial no próprio bloco', () => {
  const names = ['Status', 'Razão Social', 'CNPJ para Cobrança'];
  const data = {
    columns: names.map((label, index) => ({ label, letter: index === 2 ? 'C' : undefined })),
    issues: [],
    customerRegistry: {
      rows: [
        { cnpj: '12345678000190', name: 'Empresa', group: 'Grupo' },
        { cnpj: '12345678000270', name: 'Empresa', group: 'Grupo' },
      ],
    },
    rows: ['12345678000190', '12345678000270'].map((cnpj, index) => ({
      os: String(index),
      sourceRow: index + 2,
      cells: ['Pago', 'Empresa', cnpj].map((raw) => ({ raw })),
    })),
  };
  const sources = { orders: entry({ data }) };
  assert.equal(evaluate('orders.clients', sources).value, 1);
  assert.equal(evaluate('orders.clients', sources, { grouping: 'branch' }).value, 2);
  assert.match(evaluate('orders.clients', sources).scope, /consolidado/);
});
test('Parque preserva vínculos e denominador do domínio; Logística usa o evento correto', () => {
  const labels = [
    'Status',
    'ID Rastreador',
    'Placa',
    'Tipo de Serviço',
    'Motivo',
    'Data de atendimento',
    'Razão Social',
    'Instruções',
  ];
  const os = {
    data: {
      columns: labels.map((label) => ({ label })),
      issues: [],
      rows: [
        {
          sourceRow: 2,
          os: '1',
          cells: [
            'Pago',
            '162001',
            'ABC1D23',
            'Assistência Técnica',
            'Revisão da Instalação',
            46314,
            'Cliente',
            '',
          ].map((raw) => ({ raw, display: String(raw) })),
        },
      ],
    },
  };
  const operational = {
    data: {
      issues: [],
      rows: [
        { sourceRow: 2, client: 'A', serial: '162001', plate: 'ABC1D23', cells: [] },
        { sourceRow: 3, client: 'A', serial: '144002', plate: 'DEF4G56', cells: [] },
      ],
    },
  };
  const expected = parkAnalysis(linkOperational(operational.data, os.data), os.data, {});
  const sources = { orders: entry(os), operational: entry(operational) };
  for (const key of ['base', 'withServices', 'withAssistance', 'assistance', 'rate'])
    assert.equal(evaluate('park.' + key, sources).value, expected[key], key);
  assert.equal(evaluate('park.swaps', sources).value, expected.swaps.length);
  const data = {
    issues: [],
    rows: [
      { key: '1', type: 'Envio', eventDate: '2026-10-19', receiptRecorded: true, cells: [] },
      { key: '2', type: 'Devolução', eventDate: null, receiptRecorded: false, cells: [] },
    ],
  };
  const filters = { start: '2026-10-19', end: '2026-10-19' },
    selection = selectLogistics(data, filters);
  for (const key of ['shipments', 'shipmentsReceived', 'returns', 'returnsReceived'])
    assert.equal(
      evaluate('logistics.' + key, { logistics: entry({ data }) }, filters).value,
      selection[key],
      key,
    );
  assert.match(
    evaluate('logistics.returns', { logistics: entry({ data }) }, filters).note,
    /1 registro/,
  );
});
test('Zoho diferencia autor do fechamento, responsável e maior tempo e mantém null', () => {
  const [eduardo, jean] = zohoTeam;
  const data = {
    period: { start: '2026-10-19', end: '2026-10-19' },
    readAt: '2026-10-20T12:00:00Z',
    entries: [{ id: '1', ticketId: '9', agentId: jean.id, seconds: 1800 }],
    replies: [],
    review: [],
    closures: [
      {
        id: 'c1',
        ticketId: '9',
        agentId: eduardo.id,
        ownerId: jean.id,
        leaderIds: [jean.id],
        effortReviewCount: 0,
      },
    ],
  };
  const sources = { zoho: entry({ data, reviewedReplies: false }) },
    summary = summarizeZohoActivity(data);
  assert.equal(evaluate('zoho.closedTickets', sources, { agent: eduardo.id }).value, 1);
  assert.equal(evaluate('zoho.closedTickets', sources, { agent: jean.id }).value, 0);
  assert.equal(evaluate('zoho.closedAssigned', sources, { agent: jean.id }).value, 1);
  assert.equal(evaluate('zoho.leadingTimeTickets', sources, { agent: jean.id }).value, 1);
  assert.equal(evaluate('zoho.seconds', sources).value, summary.totals.seconds);
  assert.equal(evaluate('zoho.meanSeconds', sources, { agent: eduardo.id }).value, null);
  assert.deepEqual(evaluate('zoho.closedByAgent', sources).series, [
    { label: eduardo.name, value: 1 },
    { label: jean.name, value: 0 },
  ]);
  assert.equal(
    evaluate('zoho.seconds', sources, { agent: 'conta-compartilhada' }).status,
    'unavailable',
  );
  assert.match(evaluate('zoho.seconds', sources).period, /19\/10\/2026/);
});
const consumptionRow = (id, amount, extra = {}) => ({
  id,
  operator: 'Arqia',
  iccid: '08955180567030520851' + id,
  number: '00551191379562' + id,
  service: 'dados',
  start: '2026-09-01',
  end: '2026-09-28',
  days: 28,
  ticks: amount * VOLUME_SCALE,
  ...extra,
});
test('Consumo usa uma apuração por operadora e não soma períodos sobrepostos', () => {
  const rows = [
    consumptionRow('1', 10),
    consumptionRow('2', 0),
    consumptionRow('3', 100, { start: '2026-08-01', end: '2026-08-28' }),
    consumptionRow('4', 30, { operator: 'Kore' }),
  ];
  const statements = rows.map((row) => ({
      operator: row.operator,
      periods: [{ ...row, key: periodKey(row) }],
    })),
    sources = { consumption: entry({ rows, statements }) };
  assert.equal(evaluate('consumption.ticks', sources).value, 40 * VOLUME_SCALE);
  assert.equal(
    evaluate('consumption.average', sources, { operator: 'Arqia' }).value,
    5 * VOLUME_SCALE,
  );
  assert.equal(
    evaluate('consumption.ticks', sources, { operator: 'Arqia', period: periodKey(rows[2]) }).value,
    100 * VOLUME_SCALE,
  );
  assert.equal(
    evaluate('consumption.ticks', sources, { operator: 'Arqia', period: 'apagado' }).status,
    'unavailable',
  );
  assert.equal(
    evaluate('consumption.ticks', sources, { period: periodKey(rows[0]) }).status,
    'unavailable',
  );
  assert.equal(
    evaluate('consumption.ticks', sources, { operator: 'Ausente' }).status,
    'unavailable',
  );
});
test('Operacional recorta registros e pontos de revisão sem alterar a fonte', () => {
  const source = {
    data: {
      rows: [
        { client: 'A', sourceRow: 2, serial: '1', plate: 'ABC1D23', model: 'Texto livre' },
        { client: 'B', sourceRow: 3, serial: '2', plate: 'ABC1D24' },
      ],
      issues: [{ row: 2 }, { row: 2 }, { row: 3 }],
    },
  };
  const before = JSON.stringify(source);
  assert.equal(
    evaluate('operational.records', { operational: entry(source) }, { client: 'A' }).value,
    1,
  );
  assert.equal(
    evaluate('operational.issues', { operational: entry(source) }, { client: 'A' }).value,
    2,
  );
  assert.equal(evaluate('park.base', { operational: entry(source) }).status, 'unavailable');
  assert.equal(JSON.stringify(source), before);
});
test('Monitoramento mantém demonstração explícita e separa coleta antiga de atraso', () => {
  const snapshot = {
    demonstration: true,
    referenceAt: '2026-10-20T12:00:00Z',
    collections: [
      { clientId: 'A', at: '2026-10-20T11:50:00Z', ok: true },
      { clientId: 'B', at: '2026-10-19T12:00:00Z', ok: true },
    ],
    vehicles: [
      { clientId: 'A', vehicleId: '1', clientName: 'Teste', lastRecordAt: '2026-10-17T12:00:00Z' },
      { clientId: 'B', vehicleId: '2', clientName: 'Antiga', lastRecordAt: '2026-10-10T12:00:00Z' },
    ],
  };
  const sources = { monitoring: entry({ snapshot }) };
  assert.equal(evaluate('monitoring.delayed', sources).value, 1);
  assert.equal(evaluate('monitoring.stale', sources).value, 1);
  assert.equal(evaluate('monitoring.delayed', sources, { threshold: 96 }).value, 0);
  assert.equal(evaluate('monitoring.delayed', sources).demonstration, true);
  assert.match(evaluate('monitoring.delayed', sources).collectionLabel, /19\/10\/2026/);
  assert.equal(evaluate('monitoring.delayed', sources, { base: 'Ausente' }).status, 'unavailable');
});
test('formatação respeita centavos, precisão do consumo, segundos e ausência', () => {
  assert.match(formatMetric(10000, 'money'), /100,00/);
  assert.equal(formatMetric(VOLUME_SCALE / 2, 'mb'), '0,5 MB');
  assert.equal(formatMetric(3661, 'seconds'), '1h 1min 1s');
  assert.equal(formatMetric(0), '0');
  assert.equal(formatMetric(null), 'Indisponível');
});
