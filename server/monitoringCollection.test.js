import test from 'node:test';
import assert from 'node:assert/strict';
import { runMonitoringCollection } from './monitoringCollection.js';
import {
  monitoringCollectionSlot,
  monitoringObservationEvents,
} from '../src/modules/monitoring/domain/monitoringHistory.js';
const snapshot = (at, last) => ({
  schemaVersion: 1,
  complete: true,
  referenceAt: at,
  collections: [{ clientId: 'a', at, ok: true }],
  vehicles: [{ clientId: 'a', vehicleId: '1', lastRecordAt: last }],
});
const old = snapshot('2026-10-20T12:00:00Z', '2026-10-17T12:00:00Z'),
  current = snapshot('2026-10-21T12:00:00Z', '2026-10-21T11:00:00Z');
test('histórico registra recuperação observada sem presumir momento exato nem tratar ausentes como recuperados', () => {
  const events = monitoringObservationEvents(old, current);
  assert.equal(events[0].type, 'communication-return-observed');
  assert.equal(events[0].observedAt, current.referenceAt);
  assert.equal(events[0].previousObservedAt, old.referenceAt);
  assert.equal(monitoringObservationEvents(old, { ...current, vehicles: [] }).length, 0);
  assert.equal(monitoringObservationEvents(old, snapshot(current.referenceAt, null)).length, 0);
  assert.throws(() => monitoringObservationEvents(current, old));
  assert.throws(() => monitoringObservationEvents(null, { ...current, demonstration: true }));
  assert.equal(monitoringObservationEvents(null, old)[0].type, 'first-delay-observation');
});
test('horários de coleta são explícitos, com identidade por hora e no máximo quatro ao dia', () => {
  assert.equal(monitoringCollectionSlot('2026-10-21T12:30:00Z', [12, 18]), '2026-10-21T12');
  assert.equal(monitoringCollectionSlot('2026-10-21T13:00:00Z', [12, 18]), null);
  assert.throws(() => monitoringCollectionSlot(current.referenceAt, [1, 2, 3, 4, 5]));
});
test('coletor preparado exige armazenamento, respeita idempotência e só publica uma coleta completa', async () => {
  let commits = [],
    releases = 0,
    collected = 0;
  const repository = {
    claim: async () => ({ token: 'lease' }),
    latest: async () => ({ revision: 7, snapshot: old }),
    commit: async (value) => {
      commits.push(value);
      return true;
    },
    release: async () => {
      releases++;
    },
  };
  const collect = async () => {
    collected++;
    return current;
  };
  assert.equal(
    (await runMonitoringCollection({ runId: 'slot1', repository, collect })).status,
    'completed',
  );
  assert.equal(commits[0].expectedRevision, 7);
  assert.equal(commits[0].events.length, 1);
  assert.equal(releases, 1);
  repository.claim = async () => ({ completed: true });
  assert.equal(
    (await runMonitoringCollection({ runId: 'slot1', repository, collect })).status,
    'already-completed',
  );
  assert.equal(collected, 1);
  repository.claim = async () => ({ token: 'lease2' });
  await assert.rejects(
    runMonitoringCollection({
      runId: 'slot2',
      repository,
      collect: async () => ({ ...current, collections: [{ clientId: 'a', ok: false }] }),
    }),
  );
  assert.equal(commits.length, 1);
  assert.equal(releases, 2);
  await assert.rejects(runMonitoringCollection({ runId: 'slot3', repository: null, collect }));
  repository.commit = async () => false;
  await assert.rejects(runMonitoringCollection({ runId: 'slot4', repository, collect }));
  assert.equal(releases, 3);
});
