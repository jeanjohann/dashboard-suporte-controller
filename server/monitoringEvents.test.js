import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotTestDatabase } from './persistence/snapshotTestDatabase.mjs';
import { storedMonitoringResponse } from './monitoringStorage.js';
import { eventCursor, isUnseenEvent } from '../src/modules/monitoring/domain/monitoringEvents.js';
const owner = 'owner@example.invalid',
  user = { role: 'admin', email: owner };

test('avisos paginam por execução/índice sem repetição; filtro de retorno e acesso do piloto', async (t) => {
  const { database, sql } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  for (const [id, status] of [
    ['one', 'completed'],
    ['two', 'completed'],
    ['failed', 'failed'],
  ]) {
    sql
      .prepare('INSERT INTO business_monitoring_runs(id,status,started_at) VALUES(?,?,?)')
      .run(id, status, '2026-10-24T12:00:00.000Z');
    for (let i = 0; i < 20; i++)
      sql
        .prepare(
          'INSERT INTO business_monitoring_events(run_id,event_index,event_json) VALUES(?,?,?)',
        )
        .run(
          id,
          i,
          JSON.stringify({
            type: i % 2 ? 'communication-return-observed' : 'delay-observed',
            key: '["base","' + i + '"]',
            clientId: 'base',
            vehicleId: String(i),
            observedAt: '2026-10-24T12:00:00Z',
            threshold: 48,
          }),
        );
  }
  const read = async (query) =>
    (
      await storedMonitoringResponse(
        new Request('https://app.invalid/api/monitoring/events' + query),
        env,
        user,
        owner,
      )
    ).json();
  const first = await read(''),
    second = await read('?before=' + encodeURIComponent(first.next));
  assert.equal(first.events.length, 30);
  assert.equal(second.events.length, 10);
  assert.equal(second.next, null);
  assert.equal(
    new Set([...first.events, ...second.events].map((r) => r.runId + ':' + r.eventIndex)).size,
    40,
  );
  assert.ok([...first.events, ...second.events].every((r) => r.runId !== 'failed'));
  const returns = await read('?kind=return');
  assert.equal(returns.events.length, 20);
  assert.ok(returns.events.every((r) => r.type === 'communication-return-observed'));
  assert.equal(
    (
      await storedMonitoringResponse(
        new Request('https://app.invalid/api/monitoring/events'),
        env,
        { ...user, email: 'other@example.invalid' },
        owner,
      )
    ).status,
    403,
  );
  for (const query of ['?before=bad', '?kind=unknown', '?kind=all&kind=return', '?extra=1'])
    assert.equal(
      (
        await storedMonitoringResponse(
          new Request('https://app.invalid/api/monitoring/events' + query),
          env,
          user,
          owner,
        )
      ).status,
      400,
    );
});
test('marcação de vistos é monotônica por coleta/execução/índice e não confunde eventos da mesma coleta', () => {
  const row = { runAt: '2026-10-24T12:00:00.000Z', runId: 'run', eventIndex: 4 };
  assert.equal(isUnseenEvent(row, null), true);
  assert.equal(isUnseenEvent(row, eventCursor(JSON.stringify([row.runAt, row.runId, 4]))), false);
  assert.equal(isUnseenEvent(row, [row.runAt, row.runId, 3]), true);
  assert.throws(() => eventCursor(JSON.stringify([row.runAt, 'bad;sql', 0])));
});
