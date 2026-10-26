import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotTestDatabase } from './snapshotTestDatabase.mjs';
import { createSnapshotStore } from './snapshotStore.js';
import { businessSourcesResponse } from '../businessSources.js';
import {
  createSourceSnapshotClient,
  readSourceCatalog,
} from '../../src/shared/persistence/sourceSnapshotClient.js';
const owner = 'owner@example.invalid',
  user = { role: 'admin', email: owner, active: true, canImport: true };
const source = (large = false) => ({
  filename: 'ficticia.xlsx',
  data: {
    sheetName: 'OS 2025_26',
    date1904: false,
    columns: [{ index: 0, letter: 'A', label: '#' }],
    rows: [{ sourceRow: 2, cells: [{ raw: '0001', display: '0001' }] }],
    issues: large ? [{ reason: '😀ç'.repeat(700000) }] : [],
  },
});
async function setup(t, large = false) {
  const { database, sql, stats } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database },
    store = createSnapshotStore(database, { actor: owner }),
    value = source(large),
    id = await store.stage('orders', value);
  await store.publish('initial', [{ kind: 'orders', snapshotId: id, expectedRevision: 0 }]);
  const send = (path, options = {}) =>
    businessSourcesResponse(new Request('https://app.example' + path, options), env, user, owner);
  const request = async (path) => (await send(path)).json();
  return { sql, stats, env, value, id, send, request };
}
test('base grande é transferida por uma requisição, preservando unicode, zeros e integridade', async (t) => {
  const { value, send, request, stats } = await setup(t, true);
  let transfers = 0,
    progress = 0;
  const client = createSourceSnapshotClient(request, (path, options) => {
    transfers++;
    return send(path, options);
  });
  const catalog = await client.catalog(),
    before = stats.queries;
  const loaded = await client.read('orders', catalog.orders, {
    onProgress: (bytes) => {
      progress = bytes;
    },
  });
  assert.deepEqual(loaded.data, value.data);
  assert.equal(transfers, 1);
  assert.equal(progress, catalog.orders.bytes);
  assert.ok(stats.queries - before < 10);
  assert.ok(catalog.orders.partCount > 32);
});
test('base publicada é legível por usuários ativos; conteúdo incompleto ou corrompido é recusado', async (t) => {
  const { sql, env, id, send, request } = await setup(t),
    client = createSourceSnapshotClient(request, send),
    head = (await client.catalog()).orders;
  const foreign = await businessSourcesResponse(
    new Request('https://app.example/api/sources/orders/download?id=' + id),
    env,
    { ...user, email: 'other@example.invalid' },
    owner,
  );
  assert.equal(foreign.status, 200);
  assert.equal(foreign.headers.get('Cache-Control'), 'no-store');
  const reader = { ...user, email: 'reader@example.invalid', role: 'user', canImport: false };
  const read = (path, options) =>
    businessSourcesResponse(
      new Request('https://app.example/api/sources/' + path, options),
      env,
      reader,
      owner,
    );
  assert.deepEqual(Object.keys((await (await read('catalog')).json()).catalog), ['orders']);
  for (const path of [
    'operational/manifest?id=' + id,
    'orders/versions',
    'orders/download?id=' + 'f'.repeat(64),
  ])
    assert.equal((await read(path)).status, 403);
  assert.equal((await read('publish', { method: 'POST' })).status, 403);
  assert.equal(
    (
      await businessSourcesResponse(
        new Request('https://app.example/api/sources/catalog'),
        env,
        { ...reader, active: false },
        owner,
      )
    ).status,
    403,
  );
  sql
    .prepare(
      "UPDATE business_snapshot_parts SET payload_text=replace(payload_text,'ficticia','ficticib') WHERE snapshot_id=?",
    )
    .run(id);
  await assert.rejects(client.read('orders', head), /Integridade/);
  sql.prepare('DELETE FROM business_snapshot_parts WHERE snapshot_id=?').run(id);
  await assert.rejects(client.read('orders', head), /concluir a base/);
});
test('catálogo inicia as três leituras em paralelo e não devolve lote parcial se uma falhar', async () => {
  const started = [],
    finish = {};
  const client = {
    read(kind) {
      started.push(kind);
      return new Promise((resolve, reject) => {
        finish[kind] = { resolve, reject };
      });
    },
  };
  const pending = readSourceCatalog(client, { orders: {}, operational: {}, logistics: {} });
  assert.deepEqual(started, ['orders', 'operational', 'logistics']);
  finish.orders.resolve('os');
  finish.operational.reject(Error('corrompida'));
  finish.logistics.resolve('log');
  await assert.rejects(pending, /corrompida/);
});
