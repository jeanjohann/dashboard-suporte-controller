/** Contratos e falhas da futura API, com respostas artificiais e nenhum acesso de rede. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMonitoringSnapshot,
  readSnapshotJson,
  snapshotLimitBytes,
} from './snapshotContract.js';
import { fetchMonitoringSnapshot } from './monitoringClient.js';
import { monitorSnapshot } from '../domain/monitoring.js';

export const sample = () => ({
  schemaVersion: 1,
  complete: true,
  referenceAt: '2026-10-15T12:00:00Z',
  collections: [{ clientId: 'base-1', at: '2026-10-15T12:00:00Z', ok: true }],
  vehicles: [
    {
      clientId: 'base-1',
      vehicleId: 'v-1',
      trackerId: '001620000000000001',
      plate: 'TEST-001',
      lastRecordAt: '2026-10-10T12:00:00Z',
      supplyVoltageV: 0,
      profile: 'Perfil teste',
    },
  ],
});

test('contrato v1 preserva identificadores/zero e remove campos extras de todas as camadas', () => {
  const input = sample();
  input.token = 'nao-deve-sair';
  input.vehicles[0].secret = 'nao-deve-sair';
  input.collections[0].headers = 'nao-deve-sair';
  const output = normalizeMonitoringSnapshot(input);
  assert.equal(output.vehicles[0].trackerId, '001620000000000001');
  assert.equal(output.vehicles[0].supplyVoltageV, 0);
  assert.doesNotMatch(JSON.stringify(output), /nao-deve-sair/);
  assert.equal(monitorSnapshot(output).totals.delayed, 1);
});
test('parcialidade, versão, demonstração e metadados ambíguos são recusados', () => {
  for (const mutation of [
    (value) => {
      value.complete = false;
    },
    (value) => {
      value.schemaVersion = 2;
    },
    (value) => {
      value.demonstration = true;
    },
    (value) => {
      value.collections.push(value.collections[0]);
    },
    (value) => {
      value.vehicles[0].trackerId = 123456;
    },
    (value) => {
      value.vehicles[0].clientId = 'outra-base';
    },
    (value) => {
      value.referenceAt = '2026-10-15 12:00';
    },
  ]) {
    const value = sample();
    mutation(value);
    assert.throws(() => normalizeMonitoringSnapshot(value));
  }
});
test('datas problemáticas de telemetria e duplicidades de veículo chegam à revisão, sem alertas artificiais', () => {
  const value = sample();
  value.vehicles[0].lastRecordAt = 'data incorreta';
  assert.equal(monitorSnapshot(normalizeMonitoringSnapshot(value)).totals.invalid, 1);
  value.vehicles.push({ ...value.vehicles[0] });
  const result = monitorSnapshot(normalizeMonitoringSnapshot(value));
  assert.equal(result.totals.fleet, 0);
  assert.equal(result.issues.length, 2);
});
test('cliente usa somente origem interna sem cache e recusa HTML, erros e retratos parciais', async () => {
  let called;
  const value = await fetchMonitoringSnapshot({
    fetcher: async (url, options) => {
      called = { url, options };
      return Response.json(sample());
    },
  });
  assert.equal(called.url, '/api/monitoring/snapshot');
  assert.equal(called.options.credentials, 'same-origin');
  assert.equal(called.options.cache, 'no-store');
  assert.equal(value.complete, true);
  await assert.rejects(() =>
    fetchMonitoringSnapshot({ fetcher: async () => new Response('<html>login</html>') }),
  );
  await assert.rejects(
    () =>
      fetchMonitoringSnapshot({
        fetcher: async () => Response.json({ error: 'secret' }, { status: 403 }),
      }),
    /não autorizado/,
  );
  await assert.rejects(() =>
    fetchMonitoringSnapshot({
      fetcher: async () => Response.json({ ...sample(), complete: false }),
    }),
  );
});
test('leitura limitada cancela resposta acima do limite', async () => {
  let canceled = false;
  const response = new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(snapshotLimitBytes + 1));
      },
      cancel() {
        canceled = true;
      },
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  await assert.rejects(() => readSnapshotJson(response), /limite/);
  assert.equal(canceled, true);
});
