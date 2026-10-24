import test from 'node:test';
import assert from 'node:assert/strict';
import { collectZohoActivityBatch } from './zohoActivity.js';
import { readZohoCategoryCatalog } from './zohoCategoryCatalog.js';
import { loadZohoActivity } from '../src/modules/orders/data/zohoActivityClient.js';
import {
  zohoSummary,
  backlogSummary,
  agents,
} from '../src/modules/support-indicators/domain/indicators.js';
const period = { start: '2026-10-19', end: '2026-10-25' },
  anchor = '2026-10-30T12:00:00.000Z';
function fixture({
  state = 'Closed',
  events = [['2026-10-20T12:00:00Z', agents[0].id]],
  closedTime = '2026-10-20T12:00:00Z',
} = {}) {
  const ticket = {
    id: '1',
    departmentId: '9',
    assigneeId: agents[1].id,
    createdTime: '2020-01-01T12:00:00Z',
    closedTime,
  };
  return async (path) => {
    if (path.startsWith('/tickets/search')) return { data: [ticket] };
    if (path === '/tickets/1') return { ...ticket, statusType: state, category: 'Configuração' };
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
    if (path.includes('/History?'))
      return {
        data: events.map(([at, id]) => ({
          eventName: 'TicketUpdated',
          eventTime: at,
          actor: id ? { type: 'Agent', id } : { type: 'System' },
          eventInfo: [
            {
              systemProperty: true,
              propertyName: 'Status',
              propertyValue: { previousValue: 'Aberto', updatedValue: 'Fechado' },
            },
          ],
        })),
      };
    if (path.endsWith('/metrics')) return {};
    return { data: [] };
  };
}
test('fechamento final do estado atual substitui eventos anteriores e respeita o período final', async () => {
  const run = (options) =>
    collectZohoActivityBatch(fixture(options), { period, anchor, from: 0, indicators: true });
  assert.equal((await run({ state: 'Open' })).closures.length, 0);
  assert.equal((await run({ state: 'On Hold' })).closures.length, 0);
  const result = await run({
    events: [
      ['2026-10-20T12:00:00Z', agents[0].id],
      ['2026-10-22T12:00:00Z', agents[1].id],
    ],
  });
  assert.equal(result.closures.length, 1);
  assert.equal(result.closures[0].agentId, agents[1].id);
  assert.equal(
    (
      await run({
        events: [
          ['2026-10-20T12:00:00Z', agents[0].id],
          ['2026-10-27T12:00:00Z', agents[1].id],
        ],
      })
    ).closures.length,
    0,
  );
  const ambiguous = await run({
    events: [
      ['2026-10-22T12:00:00Z', agents[0].id],
      ['2026-10-22T12:00:00Z', agents[1].id],
    ],
  });
  assert.equal(ambiguous.closures.length, 0);
  assert.equal(ambiguous.closureReview.length, 1);
});
test('catálogo nativo inclui categorias sem chamados e não infere catálogo ausente', async () => {
  const catalog = await readZohoCategoryCatalog(async () => ({
    data: [
      {
        apiName: 'category',
        allowedValues: ['Configuração', { value: 'Instalação' }, 'Configuração'],
      },
    ],
  }));
  assert.equal(catalog.categories.length, 2);
  await assert.rejects(readZohoCategoryCatalog(async () => ({ data: [] })));
  const batch = await collectZohoActivityBatch(fixture(), {
    period,
    anchor,
    from: 0,
    indicators: true,
  });
  const data = await loadZohoActivity({ ...period, indicators: true }, async (path) =>
    path.includes('catalog=1') ? catalog : batch,
  );
  const report = zohoSummary(data, period);
  assert.deepEqual(
    report.categories.find((r) => r.label === 'Instalação'),
    { label: 'Instalação', value: 0 },
  );
  assert.equal(report.categoryAgents.length, 4);
  assert.equal(zohoSummary({ ...data, closureBasis: 'historical-events' }, period).closed, null);
  const withoutCatalog = await loadZohoActivity({ ...period, indicators: true }, async (path) => {
    if (path.includes('catalog=1')) throw Error('Recusado');
    return batch;
  });
  assert.equal(withoutCatalog.categoryCatalog, null);
  assert.equal(zohoSummary(withoutCatalog, period).categories.length, 1);
});
test('espera por agente é subconjunto da carteira, sem somar novamente aos pendentes', () => {
  const result = backlogSummary({
    complete: true,
    tickets: [
      { agentId: agents[0].id, state: 'ONHOLD', status: 'Aguardando cliente' },
      { agentId: agents[0].id, state: 'OPEN' },
    ],
  });
  assert.equal(result.total, 2);
  assert.equal(result.agents[0].pending, 2);
  assert.equal(result.agents[0].onHold, 1);
  assert.equal(result.agents[0].open, 1);
});
