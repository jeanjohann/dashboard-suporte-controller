import test from 'node:test';
import assert from 'node:assert/strict';
import { closureFromHistory, closureReader } from './zohoClosures.js';
import { collectZohoActivityBatch } from './zohoActivity.js';
import { zohoTeam, zohoPeriod, summarizeZohoActivity } from '../src/shared/data/zohoActivity.js';
const [eduardo, jean] = zohoTeam;
const period = zohoPeriod('2026-10-19', '2026-10-19');
const anchor = '2026-10-20T02:59:59.999Z';
const states = new Map([
  ['Aberto', 'Open'],
  ['Resolvido', 'Closed'],
  ['Fechado', 'Open'],
  ['Encerrado', 'Closed'],
]);
const ticket = { id: '5', ticketNumber: '10', assigneeId: jean.id, departmentId: '9' };
const event = (extra = {}) => ({
  eventName: 'TicketUpdated',
  eventTime: '2026-10-19T18:00:00Z',
  actor: { id: eduardo.id, name: eduardo.name, type: 'Agent' },
  source: null,
  eventInfo: [
    {
      systemProperty: true,
      propertyName: 'Status',
      propertyType: 'ValueTransition',
      propertyValue: { previousValue: 'Aberto', updatedValue: 'Resolvido' },
    },
  ],
  ...extra,
});
const change = (before, after) => [
  {
    systemProperty: true,
    propertyName: 'Status',
    propertyValue: { previousValue: before, updatedValue: after },
  },
];

test('fechamento usa executor, categoria configurada e data de Brasília, incluindo reabertura posterior', () => {
  const result = closureFromHistory(event(), ticket, period, states, anchor);
  assert.equal(result.agentId, eduardo.id);
  assert.equal(result.ownerId, jean.id);
  assert.equal(result.closedAt, '2026-10-19T18:00:00Z');
  assert.equal(
    closureFromHistory(
      event({ eventTime: '2026-10-19T02:59:59Z' }),
      ticket,
      period,
      states,
      anchor,
    ),
    null,
  );
  assert.equal(
    closureFromHistory(
      event({ eventInfo: change('Aberto', 'Fechado') }),
      ticket,
      period,
      states,
      anchor,
    ),
    null,
  );
  assert.equal(
    closureFromHistory(
      event({ eventInfo: change('Resolvido', 'Encerrado') }),
      ticket,
      period,
      states,
      anchor,
    ),
    null,
  );
  assert.equal(
    closureFromHistory(
      event({ eventInfo: change('Resolvido', 'Aberto') }),
      ticket,
      period,
      states,
      anchor,
    ),
    null,
  );
  const automatic = closureFromHistory(
    event({ actor: { type: 'Workflow', id: null } }),
    ticket,
    period,
    states,
    anchor,
  );
  assert.equal(automatic.agentId, null);
  assert.equal(automatic.executor, 'Automação/sistema');
  assert.throws(
    () => closureFromHistory(event({ eventTime: null }), ticket, period, states, anchor),
    /data/,
  );
  assert.throws(
    () =>
      closureFromHistory(
        event({ eventInfo: change('Aberto', 'Desconhecido') }),
        ticket,
        period,
        states,
        anchor,
      ),
    /categoria/,
  );
});

test('paginação, status ambíguos, histórico incompleto e duplicado não viram contagens de zero', async () => {
  const metadata = {
    data: [
      {
        apiName: 'status',
        allowedValues: [
          { value: 'Resolvido', statusType: 'Closed' },
          { value: 'Aberto', statusType: 'Open' },
        ],
      },
    ],
  };
  const fail = (s) => Error(s);
  const read = closureReader(
    async (path) => (path.startsWith('/organizationFields') ? metadata.data : [event(), event()]),
    fail,
  );
  await assert.rejects(() => read(ticket, period, anchor), /repetiu/);
  const ambiguous = closureReader(
    async () => [
      {
        apiName: 'status',
        allowedValues: [
          { value: 'Mesmo', statusType: 'Open' },
          { value: 'Mesmo', statusType: 'Closed' },
        ],
      },
    ],
    fail,
  );
  await assert.rejects(() => ambiguous(ticket, period, anchor), /ambígua/);
  const incomplete = closureReader(
    async (path) =>
      path.startsWith('/organizationFields')
        ? metadata.data
        : Array.from({ length: 50 }, (_, n) =>
            event({
              eventTime: new Date(
                Date.parse('2026-10-19T05:00:00Z') +
                  (Number(new URL('https://test' + path).searchParams.get('from')) + n) * 1000,
              ).toISOString(),
            }),
          ),
    fail,
  );
  await assert.rejects(() => incomplete(ticket, period, anchor), /200/);
});

test('maior participação inclui outros agentes, tempo anterior ao período e empates; datas futuras não entram', async () => {
  const makeEntry = (id, ownerId, hours, executedTime) => ({
    id,
    ownerId,
    hoursSpent: hours,
    minutesSpent: 0,
    secondsSpent: 0,
    executedTime,
    isTrashed: false,
    parent: { id: '5', type: 'TICKETS' },
    description: 'private-notes',
  });
  const get = async (path) => {
    if (path.startsWith('/tickets/search'))
      return { data: [{ ...ticket, createdTime: '2020-01-01T00:00:00Z', status: 'Aberto' }] };
    if (path.startsWith('/organizationFields'))
      return {
        data: [
          {
            apiName: 'status',
            allowedValues: [...states].map(([value, statusType]) => ({ value, statusType })),
          },
        ],
      };
    if (path.includes('/History'))
      return {
        data: [
          event(),
          event({
            eventTime: '2026-10-19T19:00:00Z',
            actor: { id: jean.id, name: jean.name, type: 'Agent' },
          }),
        ],
      };
    if (path.includes('/threads')) return { data: [] };
    if (path.includes('/timeEntry'))
      return {
        data: [
          makeEntry('1', eduardo.id, 1, '2026-10-18T10:00:00Z'),
          makeEntry('2', jean.id, 2, '2026-10-19T10:00:00Z'),
          makeEntry('3', '999', 2, '2026-10-19T11:00:00Z'),
          makeEntry('4', eduardo.id, 10, '2026-10-19T20:00:00Z'),
        ],
      };
    return {};
  };
  const data = await collectZohoActivityBatch(get, { period, from: 0, anchor });
  assert.equal(data.version, 2);
  assert.equal(data.closures.length, 2);
  assert.deepEqual(data.closures[0].leaderIds, [jean.id, '999']);
  assert.equal(
    data.closures[0].contributions.find((row) => row.agentId === eduardo.id).seconds,
    3600,
  );
  assert.doesNotMatch(JSON.stringify(data), /private-/);
  const summary = summarizeZohoActivity({
    ...data,
    closures: [...data.closures, ...data.closures],
  });
  assert.equal(summary.totals.closedTickets, 1);
  assert.equal(summary.agents[0].closedTickets, 1);
  assert.equal(summary.agents[1].closedTickets, 1);
  assert.equal(summary.agents[0].closedAssigned, 0);
  assert.equal(summary.agents[1].closedAssigned, 1);
  assert.equal(summary.agents[0].leadingTimeTickets, 0);
  assert.equal(summary.agents[1].leadingTimeTickets, 1);
  const missing = summarizeZohoActivity({ replies: [], entries: [], review: [] });
  assert.equal(missing.totals.closedTickets, null);
  const partial = summarizeZohoActivity({
    ...data,
    closures: [{ ...data.closures[0], effortReviewCount: 1 }],
  });
  assert.equal(partial.agents[1].leadingTimeTickets, null);
  assert.equal(partial.agents[0].closedTickets, 1);
});
