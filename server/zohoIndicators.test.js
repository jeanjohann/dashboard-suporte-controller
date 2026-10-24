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
      { ...c, id: 'c', agentId: agents[1].id, closedAt: '2026-10-22T11:00:00Z' },
      { ...c, id: 'd', ticketId: '2' },
    ],
    review: [],
    ticketIndicators: evidence,
    indicatorsAvailable: true,
    closureBasis: 'current-status-v1',
    categoryCatalog: ['Cancelamentos/Desinstalação', 'Outras Informações', 'Configuração'],
  };
  const total = zohoSummary(data, period);
  assert.equal(total.created, 1);
  assert.equal(total.closedTickets.length, 2);
  assert.equal(total.closedTickets.filter((r) => r.ticketId === '1').length, 1);
  assert.equal(total.closedTickets.find((r) => r.ticketId === '1').subCategory, 'Desinstalação');
  assert.equal(total.closedTickets.find((r) => r.ticketId === '2').subCategory, 'Não informada');
  assert.equal(
    total.categoryAgents.reduce((n, r) => n + r.value, 0),
    2,
  );
  assert.equal(zohoSummary(data, period, agents[0].id).closedTickets.length, 1);
  assert.equal(zohoSummary(data, period, agents[1].id).closedTickets.length, 1);
  assert.deepEqual(total.categories, [
    { label: 'Cancelamentos/Desinstalação', value: 1 },
    { label: 'Outras Informações', value: 1 },
    { label: 'Configuração', value: 0 },
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
test('indicadores excluem reabertos e contam o fechamento final atualmente encerrado', async () => {
  let includeClosure = true;
  let currentState = 'Open';
  const t = {
    ...ticket,
    createdTime: '2020-01-01T10:00:00Z',
    closedTime: '2026-10-22T10:00:00Z',
    status: 'Aberto',
    assigneeId: agents[0].id,
  };
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
        data: includeClosure
          ? [
              {
                eventName: 'TimeEntryCreated',
                eventTime: '2026-10-22T10:02:00Z',
                actor: event.actor,
              },
              {
                eventName: 'TimeEntryCreated',
                eventTime: '2026-10-22T10:02:00Z',
                actor: event.actor,
              },
              {
                eventName: 'TicketUpdated',
                eventTime: '2026-10-22T10:02:00Z',
                actor: event.actor,
                eventInfo: [
                  {
                    systemProperty: true,
                    propertyName: 'Status',
                    propertyValue: { previousValue: 'Aberto', updatedValue: 'Fechado' },
                  },
                ],
              },
              {
                eventName: 'TicketUpdated',
                eventTime: '2026-10-23T10:00:00Z',
                actor: null,
                source: 'IncomingResponse',
                eventInfo: [
                  {
                    systemProperty: true,
                    propertyName: 'Status',
                    propertyValue: { previousValue: 'Fechado', updatedValue: 'Aberto' },
                  },
                ],
              },
            ]
          : [],
      };
    if (path === '/tickets/1') return { ...t, statusType: currentState, category: 'Treinamento' };
    if (path.endsWith('/metrics')) return {};
    return { data: [] };
  };
  const result = await collectZohoActivityBatch(get, { period, anchor, from: 0, indicators: true });
  assert.equal(result.closures.length, 0);
  assert.equal(result.closureReview.length, 0);
  currentState = 'Closed';
  const closed = await collectZohoActivityBatch(get, { period, anchor, from: 0, indicators: true });
  assert.equal(closed.closures.length, 1);
  assert.equal(closed.closures[0].agentId, event.actor.id);
  assert.equal(closed.closures[0].ownerId, agents[0].id);
  includeClosure = false;
  const unknown = await collectZohoActivityBatch(get, {
    period,
    anchor,
    from: 0,
    indicators: true,
  });
  assert.equal(unknown.closures.length, 0);
  assert.equal(unknown.closureReview.length, 1);
});
