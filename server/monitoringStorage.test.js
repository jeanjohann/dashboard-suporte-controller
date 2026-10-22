import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotTestDatabase } from './persistence/snapshotTestDatabase.mjs';
import {
  createMonitoringCollectionRepository,
  pruneStoredSnapshots,
  storedMonitoringResponse,
  scheduledMonitoring,
  monitoringCron,
  collectAndStoreMonitoring,
} from './monitoringStorage.js';
import { runMonitoringCollection } from './monitoringCollection.js';
const owner = 'owner@example.invalid',
  user = { role: 'admin', email: owner };
const snapshot = (at = '2026-10-22T12:00:00.000Z', last = '2026-10-19T12:00:00.000Z') => ({
  schemaVersion: 1,
  complete: true,
  demonstration: false,
  referenceAt: at,
  collections: [{ clientId: 'base', at, ok: true }],
  vehicles: [
    {
      clientId: 'base',
      vehicleId: '001',
      trackerId: '00144',
      plate: 'TST0001',
      clientName: 'FICTÍCIO',
      lastRecordAt: last,
    },
  ],
});
test('coletas publicam fotografia, execução e retorno observado em transação, sem duplicar execução', async (t) => {
  const { database, sql } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  let at = '2026-10-22T12:00:00.000Z';
  const repo = createMonitoringCollectionRepository(env, { now: () => at });
  let calls = 0;
  const first = () =>
    runMonitoringCollection({
      runId: 'first',
      repository: repo,
      collect: async () => {
        calls++;
        return snapshot(at);
      },
    });
  assert.equal((await first()).status, 'completed');
  assert.equal((await first()).status, 'already-completed');
  assert.equal(calls, 1);
  at = '2026-10-22T15:00:00.000Z';
  await runMonitoringCollection({
    runId: 'second',
    repository: repo,
    collect: async () => snapshot(at, at),
  });
  assert.equal((await repo.latest()).revision, 2);
  assert.equal(
    sql.prepare("SELECT COUNT(*) AS c FROM business_monitoring_runs WHERE status='completed'").get()
      .c,
    2,
  );
  assert.equal(
    JSON.parse(
      sql.prepare("SELECT event_json FROM business_monitoring_events WHERE run_id='second'").get()
        .event_json,
    ).type,
    'communication-return-observed',
  );
});
test('falha parcial preserva última coleta e lease impede concorrência; lease vencido não publica', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  let at = '2026-10-22T12:00:00.000Z';
  const repo = createMonitoringCollectionRepository(env, { now: () => at });
  await runMonitoringCollection({
    runId: 'valid',
    repository: repo,
    collect: async () => snapshot(at),
  });
  const lease = await repo.claim('busy');
  assert.equal(await repo.claim('other'), null);
  await repo.release('busy', lease);
  const partial = snapshot('2026-10-22T15:00:00.000Z');
  partial.collections[0].ok = false;
  await assert.rejects(
    runMonitoringCollection({ runId: 'partial', repository: repo, collect: async () => partial }),
    /completa/,
  );
  assert.equal((await repo.latest()).revision, 1);
  const expired = await repo.claim('expired');
  at = '2026-10-22T12:03:00.000Z';
  assert.equal(
    await repo.commit({
      runId: 'expired',
      lease: expired,
      expectedRevision: 1,
      snapshot: snapshot(at),
      events: [],
    }),
    false,
  );
  await repo.release('expired', expired);
  assert.equal((await repo.latest()).revision, 1);
});
test('retenção remove fotografias/eventos com mais de 30 dias, conservando a última válida', async (t) => {
  const { database, sql } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  let at = '2026-09-01T12:00:00.000Z';
  const repo = createMonitoringCollectionRepository(env, { now: () => at });
  await runMonitoringCollection({
    runId: 'old',
    repository: repo,
    collect: async () => snapshot(at, '2026-08-20T00:00:00.000Z'),
  });
  await pruneStoredSnapshots(env, { now: '2026-10-22T18:00:00.000Z' });
  assert.ok(await repo.latest());
  at = '2026-10-22T12:00:00.000Z';
  await runMonitoringCollection({
    runId: 'current',
    repository: repo,
    collect: async () => snapshot(at, at),
  });
  await pruneStoredSnapshots(env, { now: '2026-10-22T18:00:00.000Z' });
  assert.equal(sql.prepare('SELECT COUNT(*) AS c FROM business_monitoring_runs').get().c, 1);
  assert.equal(
    sql.prepare("SELECT COUNT(*) AS c FROM business_snapshots WHERE kind='monitoring'").get().c,
    1,
  );
});
test('API salva não chama fornecedor ao abrir e cron aceita apenas horários aprovados', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  let calls = 0;
  env.MONITORING_SERVICE = {
    fetch: async () => {
      calls++;
      return Response.json(snapshot());
    },
  };
  const response = await storedMonitoringResponse(
    new Request('https://app.example/api/monitoring/saved'),
    env,
    user,
    owner,
  );
  assert.equal((await response.json()).snapshot, null);
  assert.equal(calls, 0);
  assert.equal(
    (
      await storedMonitoringResponse(
        new Request('https://app.example/api/monitoring/saved'),
        env,
        { ...user, email: 'other@example.invalid' },
        owner,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await storedMonitoringResponse(
        new Request('https://app.example/api/monitoring/refresh', {
          method: 'POST',
          headers: { Origin: 'https://evil.example' },
        }),
        env,
        user,
        owner,
      )
    ).status,
    403,
  );
  await assert.rejects(
    scheduledMonitoring(
      { cron: monitoringCron, scheduledTime: Date.parse('2026-10-22T11:00:00.000Z') },
      env,
    ),
    /Horário/,
  );
  await scheduledMonitoring(
    { cron: monitoringCron, scheduledTime: Date.parse('2026-10-22T12:00:00.000Z') },
    env,
  );
  assert.equal(calls, 1);
  await scheduledMonitoring(
    { cron: monitoringCron, scheduledTime: Date.parse('2026-10-22T12:00:00.000Z') },
    env,
  );
  assert.equal(calls, 1);
  const saved = await storedMonitoringResponse(
    new Request('https://app.example/api/monitoring/saved'),
    env,
    user,
    owner,
  );
  assert.equal((await saved.json()).snapshot.vehicles.length, 1);
  assert.equal(calls, 1);
});

test('coleta de 1.800 veículos e retenção cabem em 50 consultas por execução; histórico pagina sem repetir', async (t) => {
  const { database, sql, stats } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  const data = snapshot(new Date().toISOString());
  data.vehicles = Array.from({ length: 1800 }, (_, i) => ({
    ...data.vehicles[0],
    vehicleId: String(i),
    trackerId: String(1440000000 + i),
  }));
  env.MONITORING_SERVICE = { fetch: async () => Response.json(data) };
  await collectAndStoreMonitoring(env, { runId: 'fleet_first' });
  assert.ok(stats.queries <= 50, `${stats.queries} consultas`);
  assert.equal(
    (await createMonitoringCollectionRepository(env).latest()).snapshot.vehicles.length,
    1800,
  );
  for (let i = 0; i < 35; i++)
    sql
      .prepare("INSERT INTO business_monitoring_runs(id,status,started_at) VALUES(?,'failed',?)")
      .run('history_' + i, new Date(Date.UTC(2026, 9, 1 + (i % 20), 0, i)).toISOString());
  const first = await (
    await storedMonitoringResponse(
      new Request('https://app.example/api/monitoring/history'),
      env,
      user,
      owner,
    )
  ).json();
  assert.equal(first.runs.length, 30);
  assert.ok(first.next);
  const second = await (
    await storedMonitoringResponse(
      new Request(
        'https://app.example/api/monitoring/history?before=' + encodeURIComponent(first.next),
      ),
      env,
      user,
      owner,
    )
  ).json();
  assert.equal(new Set([...first.runs, ...second.runs].map((r) => r.id)).size, 36);
  assert.equal(second.next, null);
});
