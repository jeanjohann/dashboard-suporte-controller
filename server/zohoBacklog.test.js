import test from 'node:test';
import assert from 'node:assert/strict';
import { backlogParameters, collectZohoBacklogBatch } from './zohoBacklog.js';
import { createZohoReader, zohoResponse } from './zoho.js';
import { loadZohoBacklog } from '../src/modules/support-indicators/data/zohoBacklogClient.js';
import { backlogSummary, agents } from '../src/modules/support-indicators/domain/indicators.js';

const agentId = agents[0].id;
const ticket = (id, state = 'Open', owner = agentId) => ({
  id,
  assigneeId: owner,
  ticketNumber: id,
  statusType: state,
  status: 'Status cadastrado',
  category: 'Configuração',
  subCategory: 'Equipamento',
  createdTime: '2020-01-01T00:00:00Z',
  subject: 'Não deve ser enviado',
  email: 'private@example.test',
});
const query = (extra = {}) => new URLSearchParams({ backlog: '1', agentId, from: '0', ...extra });

test('pendências aceitam apenas agentes do piloto e paginação documentada, sem recorte por período', () => {
  assert.deepEqual(backlogParameters(query()), { agentId, from: 0 });
  for (const extra of [
    { agentId: '0' },
    { from: '1' },
    { from: '5000' },
    { start: '2026-10-19' },
    { backlog: '2' },
  ])
    assert.throws(() => backlogParameters(query(extra)));
});
test('carteira inclui chamados antigos Open/On Hold, exclui Closed e não envia dados de contato', async () => {
  const result = await collectZohoBacklogBatch(
    async (path) => {
      const p = new URL(path, 'https://example.test');
      assert.equal(p.searchParams.get('assigneeId'), agentId);
      assert.equal(p.searchParams.has('modifiedTimeRange'), false);
      return { data: [ticket('1'), ticket('2', 'On Hold'), ticket('3', 'CLOSED')] };
    },
    { agentId, from: 0 },
  );
  assert.equal(result.tickets.length, 2);
  assert.equal(result.next, null);
  assert.equal(result.tickets[1].state, 'ONHOLD');
  assert.doesNotMatch(JSON.stringify(result), /private@example|Não deve ser enviado/);
  const summary = backlogSummary({
    complete: true,
    tickets: result.tickets,
    readAt: result.observedAt,
  });
  assert.equal(summary.total, 2);
  assert.equal(summary.onHold, 1);
  assert.equal(backlogSummary({ complete: true, tickets: result.tickets }, agents[1].id).total, 0);
  assert.equal(backlogSummary(null), null);
});
test('carteira não aplica status desconhecido, agente divergente, duplicação ou limite de pesquisa', async () => {
  for (const rows of [
    [ticket('1', 'Custom')],
    [ticket('1', 'Open', agents[1].id)],
    [ticket('1'), ticket('1')],
  ])
    await assert.rejects(
      collectZohoBacklogBatch(async () => ({ data: rows }), { agentId, from: 0 }),
    );
  await assert.rejects(
    collectZohoBacklogBatch(
      async () => ({ data: Array.from({ length: 100 }, (_, i) => ticket(String(i + 1))) }),
      { agentId, from: 4900 },
    ),
    /5.000/,
  );
});
function mockBatch(params, { duplicate = false, failSecond = false } = {}) {
  const owner = params.get('agentId'),
    from = Number(params.get('from'));
  if (failSecond && owner === agents[1].id) throw Error('Fonte indisponível');
  const rows =
    from === 0 && owner === agentId
      ? Array.from({ length: 100 }, (_, i) => ticket(String(i + 1)))
      : owner === agentId
        ? [ticket(duplicate ? '1' : '101')]
        : [ticket('200', 'ONHOLD', owner)];
  return collectZohoBacklogBatch(async () => ({ data: rows }), { agentId: owner, from });
}
test('cliente só retorna após completar as duas carteiras e rejeita repetição entre páginas', async () => {
  const result = await loadZohoBacklog({}, (path) =>
    mockBatch(new URL(path, 'https://example.test').searchParams),
  );
  assert.equal(result.complete, true);
  assert.equal(result.tickets.length, 102);
  await assert.rejects(
    loadZohoBacklog({}, (path) =>
      mockBatch(new URL(path, 'https://example.test').searchParams, { duplicate: true }),
    ),
    /repetiu/,
  );
  await assert.rejects(
    loadZohoBacklog({}, (path) =>
      mockBatch(new URL(path, 'https://example.test').searchParams, { failSecond: true }),
    ),
    /Fonte indisponível/,
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    loadZohoBacklog({ signal: controller.signal }, () => {
      throw Error('Não chamar');
    }),
    /abort/i,
  );
});
test('rota autenticada reutiliza organização e credenciais do piloto sem exigir data', async () => {
  const env = {
    ZOHO_ORG_ID: '9',
    ZOHO_CLIENT_ID: 'client',
    ZOHO_CLIENT_SECRET: 'secret',
    ZOHO_REFRESH_TOKEN: 'refresh',
  };
  const reader = createZohoReader({
    fetchImpl: async (url) => {
      if (url.includes('/oauth/'))
        return Response.json({ access_token: 'token', expires_in: 3600 });
      if (url.endsWith('/organizations/9')) return Response.json({ id: '9' });
      assert.match(url, /tickets\/search/);
      return Response.json({ data: [ticket('1')] });
    },
  });
  const response = await zohoResponse(
    new Request('https://example.test/api/zoho/activity?' + query()),
    env,
    reader,
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).tickets.length, 1);
});
