import test from 'node:test';
import assert from 'node:assert/strict';
import { activityParameters, collectZohoActivityBatch } from './zohoActivity.js';
import {
  zohoTeam,
  zohoPeriod,
  zohoSeconds,
  normalizeZohoReply,
  normalizeZohoEntry,
  summarizeZohoActivity,
} from '../src/shared/data/zohoActivity.js';
import { loadZohoActivity } from '../src/modules/orders/data/zohoActivityClient.js';
const [eduardo, jean] = zohoTeam;
const period = zohoPeriod('2026-10-19', '2026-10-19');
const reply = (extra = {}) => ({
  id: '100',
  responderId: eduardo.id,
  direction: 'out',
  visibility: 'public',
  status: 'SUCCESS',
  author: { type: 'AGENT' },
  channel: 'EMAIL',
  isForward: false,
  isDescriptionThread: false,
  isAutomated: false,
  sendDateTime: '2026-10-19T10:00:00Z',
  createdTime: '2026-10-18T10:00:00Z',
  ...extra,
});
const entry = (extra = {}) => ({
  id: '200',
  ownerId: eduardo.id,
  creatorId: jean.id,
  parent: { id: '5', type: 'TICKETS' },
  executedTime: '2026-10-19T10:00:00Z',
  hoursSpent: '2',
  minutesSpent: '30',
  secondsSpent: '15',
  isTrashed: 'false',
  mode: 'MANUAL',
  isBillable: false,
  ...extra,
});

test('datas em Brasília e duração usam execução, proprietário e segundos explícitos, sem inferir pelo criador', () => {
  assert.equal(period.from, '2026-10-19T03:00:00.000Z');
  assert.equal(period.to, '2026-10-20T02:59:59.999Z');
  assert.equal(zohoSeconds(entry({ hoursSpent: '32' })), 117015);
  assert.equal(zohoSeconds(entry({ hoursSpent: '0', minutesSpent: '0', secondsSpent: '0' })), 0);
  for (const extra of [
    { secondsSpent: undefined },
    { minutesSpent: 60 },
    { hoursSpent: -1 },
    { hoursSpent: '1.5' },
  ])
    assert.equal(zohoSeconds(entry(extra)), null);
  const normalized = normalizeZohoEntry(entry(), '5', period);
  assert.equal(normalized.agentId, eduardo.id);
  assert.equal(normalized.seconds, 9015);
  assert.equal(
    normalizeZohoEntry(
      entry({ executedTime: null, createdTime: '2026-10-19T12:00:00Z' }),
      '5',
      period,
    ).seconds,
    undefined,
  );
  assert.equal(
    normalizeZohoEntry(entry({ executedTime: '2026-10-19T02:59:59Z' }), '5', period).reason,
    'Fora do período',
  );
  assert.equal(normalizeZohoEntry(entry({ isTrashed: 'true' }), '5', period).seconds, undefined);
});

test('respostas exigem autoria, envio público e revisão explícita para automação/data ausentes', () => {
  assert.deepEqual(normalizeZohoReply(reply(), '5', period).review, []);
  for (const extra of [
    { direction: 'in' },
    { visibility: 'private' },
    { status: 'DRAFT' },
    { status: 'PENDING' },
    { status: 'FAILED' },
    { author: { type: 'END_USER' } },
    { isForward: true },
    { isAutomated: true },
    { source: { type: 'WORKFLOW' } },
    { responderId: null },
  ])
    assert.ok(normalizeZohoReply(reply(extra), '5', period).reason);
  const pending = normalizeZohoReply(
    reply({ isAutomated: undefined, sendDateTime: undefined, createdTime: '2026-10-19T12:00:00Z' }),
    '5',
    period,
  );
  assert.equal(pending.review.length, 2);
  const data = { replies: [pending], entries: [], review: [] };
  assert.equal(summarizeZohoActivity(data).totals.replies, null);
  assert.equal(summarizeZohoActivity(data, { reviewedReplies: true }).totals.replies, 1);
  const unknown = normalizeZohoReply(reply({ sendDateTime: undefined }), '5', period);
  assert.equal(
    summarizeZohoActivity({ replies: [], entries: [], review: [{ ...unknown, kind: 'reply' }] })
      .totals.replies,
    null,
  );
});

test('equipe contém somente Eduardo/Jean; deduplica respostas e chamados compartilhados e calcula média pelo denominador correto', () => {
  const r = normalizeZohoReply(reply(), '5', period),
    e = normalizeZohoEntry(entry(), '5', period);
  const result = summarizeZohoActivity({
    replies: [r, r, { ...r, id: '101', agentId: jean.id }, { ...r, id: '102', agentId: '999' }],
    entries: [e, e, { ...e, id: '201', agentId: jean.id, seconds: 60 }],
    review: [],
  });
  assert.equal(result.agents.length, 2);
  assert.equal(result.totals.replies, 2);
  assert.equal(result.totals.ticketsReplied, 1);
  assert.equal(
    result.agents.reduce((sum, a) => sum + a.ticketsReplied, 0),
    2,
  );
  assert.equal(result.totals.ticketsWithTime, 1);
  assert.equal(result.totals.seconds, 9075);
  assert.equal(result.totals.meanSeconds, 9075);
});

test('coleta inclui chamado antigo modificado no recorte, página todas as fontes e não devolve textos, contatos ou custos', async () => {
  const calls = [];
  const params = { period, from: 0, anchor: '2026-10-20T03:00:00.000Z' };
  const get = async (path) => {
    calls.push(path);
    if (path.startsWith('/tickets/search')) {
      const url = new URL('https://test' + path);
      assert.equal(url.searchParams.get('modifiedTimeRange'), `${period.from},${params.anchor}`);
      assert.equal(url.searchParams.has('createdTimeRange'), false);
      return { data: [{ id: '5', ticketNumber: '10', createdTime: '2020-01-01T00:00:00Z' }] };
    }
    if (path.includes('/threads'))
      return { data: [reply({ content: 'private-body', to: 'private-contact' })] };
    if (path.includes('/timeEntry'))
      return { data: [entry({ description: 'private-notes', totalCost: 'private-cost' })] };
    return {
      firstResponseTime: '01:20 hrs',
      resolutionTime: null,
      totalResponseTime: '02:00 hrs',
      private: 'private-metadata',
    };
  };
  const data = await collectZohoActivityBatch(get, params);
  assert.equal(data.next, null);
  assert.equal(data.entries.length, 1);
  assert.equal(data.replies.length, 1);
  assert.equal(data.metrics[0].firstResponse, '01:20 hrs');
  assert.doesNotMatch(JSON.stringify(data), /private-/);
  assert.equal(calls.length, 4);
});

test('limites, duplicidades, parâmetros externos e coleta incompleta são recusados', async () => {
  const now = Date.parse('2026-10-20T03:00:00Z');
  for (const query of [
    'start=2026-10-19&end=2026-10-19&from=1',
    'start=2026-10-19&end=2026-10-19&url=https://evil.test',
    'start=2026-10-19&end=2026-10-19&anchor=2030-01-01T00:00:00.000Z',
  ])
    assert.throws(() => activityParameters(new URLSearchParams(query), now));
  assert.throws(() => zohoPeriod('2026-01-01', '2026-10-19'));
  const params = { period, from: 0, anchor: new Date(now).toISOString() };
  await assert.rejects(() =>
    collectZohoActivityBatch(
      async (path) =>
        path.startsWith('/tickets/search') ? { data: [{ id: '5' }] } : { data: [reply(), reply()] },
      params,
    ),
  );
  await assert.rejects(
    () =>
      collectZohoActivityBatch(
        async (path) =>
          path.startsWith('/tickets/search')
            ? { data: [{ id: '5' }] }
            : {
                data: Array.from({ length: 100 }, (_, n) =>
                  reply({
                    id: String(
                      1000 + Number(new URL('https://test' + path).searchParams.get('from')) + n,
                    ),
                  }),
                ),
              },
        params,
      ),
    /400/,
  );
});

test('cliente só aplica coleta completa e preserva a referência ao paginar; falha ou cancelamento não retorna parcial', async () => {
  const base = {
    version: 1,
    period,
    anchor: '2026-10-20T03:00:00.000Z',
    replies: [],
    entries: [],
    review: [],
    metrics: [],
    coverage: 'teste',
  };
  const calls = [];
  const api = async (path) => {
    const p = new URL('https://test' + path).searchParams;
    calls.push(p);
    return {
      ...base,
      from: Number(p.get('from')),
      next: calls.length === 1 ? 10 : null,
      ticketIds: [String(calls.length)],
    };
  };
  const result = await loadZohoActivity({ start: period.start, end: period.end }, api);
  assert.equal(result.ticketIds.length, 2);
  assert.equal(calls[1].get('anchor'), base.anchor);
  let attempts = 0;
  await assert.rejects(
    () =>
      loadZohoActivity({ start: period.start, end: period.end }, async () => {
        if (++attempts === 2) throw Error('falha');
        return { ...base, from: 0, next: 10, ticketIds: ['1'] };
      }),
    /falha/,
  );
  const controller = new AbortController();
  controller.abort();
  let called = false;
  await assert.rejects(() =>
    loadZohoActivity(
      { start: period.start, end: period.end, signal: controller.signal },
      async () => {
        called = true;
      },
    ),
  );
  assert.equal(called, false);
});

test('resumo parcial expõe confirmados e motivos sem somar pendências aos chamados ou alterar tempos', () => {
  const confirmed = normalizeZohoReply(reply(), '5', period);
  const pending = normalizeZohoReply(reply({ id: '101', isAutomated: undefined }), '5', period);
  const unknown = {
    id: '102',
    ticketId: '6',
    agentId: jean.id,
    kind: 'reply',
    reason: 'Data de envio não identificada',
  };
  const data = {
    replies: [confirmed, pending, pending],
    entries: [normalizeZohoEntry(entry(), '5', period)],
    review: [unknown, unknown],
  };
  const result = summarizeZohoActivity(data);
  assert.equal(result.totals.ticketsReplied, null);
  assert.equal(result.totals.confirmedTicketsReplied, 1);
  assert.equal(result.totals.confirmedReplies, 1);
  assert.equal(result.totals.pendingReplyCount, 2);
  assert.equal(result.totals.pendingTicketCount, 2);
  assert.deepEqual(result.totals.reviewReasons, [
    { reason: 'Automação não informada', count: 1 },
    { reason: 'Data de envio não identificada', count: 1 },
  ]);
  assert.equal(result.totals.seconds, 9015);
  const reviewed = summarizeZohoActivity(data, { reviewedReplies: true });
  assert.equal(reviewed.totals.confirmedReplies, 2);
  assert.equal(reviewed.totals.confirmedTicketsReplied, 1);
  assert.equal(reviewed.totals.pendingReplyCount, 1);
  assert.equal(reviewed.totals.ticketsReplied, null);
  assert.equal(result.agents[0].confirmedReplies, 1);
  assert.equal(result.agents[1].pendingReplyCount, 1);
});
