import test from 'node:test';
import assert from 'node:assert/strict';
import { ticketIndicatorEvidence } from './zohoIndicators.js';
import { collectZohoActivityBatch } from './zohoActivity.js';
import { zohoSummary, agents } from '../src/modules/support-indicators/domain/indicators.js';
const period = { start: '2026-10-19', end: '2026-10-25' },
  anchor = '2026-10-23T12:00:00.000Z',
  ticket = { id: '1', departmentId: '9', createdTime: '2026-10-22T10:00:00Z' },
  event = {
    eventName: 'TicketCreated',
    eventTime: ticket.createdTime,
    actor: { type: 'Agent', id: agents[1].id },
    source: null,
  };
test('criação exige evento completo, data consistente, agente e ausência de importação', async () => {
  for (const [entry, state] of [
    [event, 'support'],
    [{ ...event, source: 'Import' }, 'excluded'],
    [{ ...event, actor: { type: 'Contact' } }, 'excluded'],
    [{ ...event, eventTime: '2026-10-21T10:00:00Z' }, 'unknown'],
  ]) {
    const r = await ticketIndicatorEvidence(
      ticket,
      period,
      anchor,
      { category: 'Cancelamentos/Desinstalação' },
      async () => [entry],
    );
    assert.equal(r.creation.state, state);
  }
  const incomplete = await ticketIndicatorEvidence(ticket, period, anchor, {}, async () =>
    Array.from({ length: 50 }, () => event),
  );
  assert.equal(incomplete.creation.state, 'unknown');
});
test('coleta de indicadores adiciona evidências sem modificar respostas e tempos existentes', async () => {
  const get = async (path) => {
    if (path.startsWith('/tickets/search')) return { data: [ticket] };
    if (path.startsWith('/organizationFields'))
      return {
        data: [
          {
            apiName: 'status',
            allowedValues: [
              { value: 'Aberto', statusType: 'Open' },
              { value: 'Fechado', statusType: 'Closed' },
            ],
          },
        ],
      };
    if (path.includes('fieldName=status')) return { data: [] };
    if (path.includes('/History?')) return { data: [event] };
    if (path === '/tickets/1') return { ...ticket, category: 'Cancelamentos/Desinstalação' };
    if (path.endsWith('/metrics')) return {};
    return { data: [] };
  };
  const result = await collectZohoActivityBatch(get, { period, anchor, from: 0, indicators: true });
  assert.equal(result.ticketIndicators[0].creation.agentId, agents[1].id);
  assert.equal(result.ticketIndicators[0].category, 'Cancelamentos/Desinstalação');
});
test('assuntos contam fechados únicos por agente e a criação não usa o responsável atual', () => {
  const creation = { state: 'support', agentId: agents[1].id, at: ticket.createdTime };
  const evidence = [
    {
      ticketId: '1',
      creation,
      category: 'Cancelamentos/Desinstalação',
      subCategory: 'Desinstalação',
      classification: 'Solicitação',
    },
    { ticketId: '2', creation: { state: 'excluded' }, category: 'Outras Informações' },
  ];
  const c = { ticketId: '1', id: 'a', agentId: agents[0].id, closedAt: ticket.createdTime };
  const data = {
    period,
    entries: [],
    closures: [
      c,
      { ...c, id: 'b' },
      { ...c, id: 'c', agentId: agents[1].id },
      { ...c, id: 'd', ticketId: '2' },
    ],
    review: [],
    ticketIndicators: evidence,
    indicatorsAvailable: true,
  };
  const total = zohoSummary(data, period);
  assert.equal(total.created, 1);
  assert.equal(total.closedTickets.length, 3);
  assert.equal(total.closedTickets.filter((r) => r.ticketId === '1').length, 2);
  assert.equal(total.closedTickets.find((r) => r.ticketId === '1').subCategory, 'Desinstalação');
  assert.equal(total.closedTickets.find((r) => r.ticketId === '2').subCategory, 'Não informada');
  assert.equal(
    total.categoryAgents.reduce((n, r) => n + r.value, 0),
    3,
  );
  assert.equal(zohoSummary(data, period, agents[0].id).closedTickets.length, 2);
  assert.equal(zohoSummary(data, period, agents[1].id).closedTickets.length, 1);
  assert.deepEqual(total.categories, [
    { label: 'Cancelamentos/Desinstalação', value: 1 },
    { label: 'Outras Informações', value: 1 },
  ]);
  assert.equal(zohoSummary(data, period, agents[0].id).created, 0);
  assert.equal(zohoSummary(data, period, agents[1].id).created, 1);
  assert.equal(zohoSummary({ ...data, closuresComplete: false }, period).created, 1);
  assert.equal(zohoSummary({ ...data, closuresComplete: false }, period).closed, null);
  assert.equal(zohoSummary({ ...data, closuresComplete: false }, period).categories, null);
  assert.equal(zohoSummary({ ...data, closuresComplete: false }, period).closedTickets, null);
  evidence[0].creation = { state: 'unknown' };
  assert.equal(zohoSummary(data, period).created, null);
  assert.equal(zohoSummary({ ...data, indicatorsAvailable: false }, period).categories, null);
});
test('histórico completo recupera fechamento omitido pelo filtro sem inventar autoria', async () => {
  const t = { ...ticket, createdTime: '2020-01-01T10:00:00Z', closedTime: '2026-10-22T10:00:00Z' };
  const get = async (path) => {
    if (path.startsWith('/tickets/search')) return { data: [t] };
    if (path.startsWith('/organizationFields'))
      return {
        data: [
          {
            apiName: 'status',
            allowedValues: [
              { value: 'Aberto', statusType: 'Open' },
              { value: 'Fechado', statusType: 'Closed' },
            ],
          },
        ],
      };
    if (path.includes('fieldName=status')) return { data: [] };
    if (path.includes('/History?'))
      return {
        data: [
          {
            eventName: 'TicketUpdated',
            eventTime: t.closedTime,
            actor: event.actor,
            eventInfo: [
              {
                systemProperty: true,
                propertyName: 'Status',
                propertyValue: { previousValue: 'Aberto', updatedValue: 'Fechado' },
              },
            ],
          },
        ],
      };
    if (path === '/tickets/1') return { ...t, category: 'Treinamento' };
    if (path.endsWith('/metrics')) return {};
    return { data: [] };
  };
  const result = await collectZohoActivityBatch(get, { period, anchor, from: 0, indicators: true });
  assert.equal(result.closures.length, 1);
  assert.equal(result.closures[0].agentId, event.actor.id);
});
