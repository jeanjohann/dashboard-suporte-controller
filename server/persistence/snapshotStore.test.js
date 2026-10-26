import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { snapshotTestDatabase } from './snapshotTestDatabase.mjs';
import { createSnapshotStore } from './snapshotStore.js';
import {
  prepareSnapshot,
  splitSnapshot,
  sha256,
} from '../../src/shared/persistence/snapshotPayload.js';
import { importOrdersSheet } from '../../src/modules/orders/data/import.js';
import { importOperationalSheet } from '../../src/modules/operational/domain/operational.js';
import { importLogistics } from '../../src/modules/logistics/domain/logistics.js';
import { createSourceSnapshotClient } from '../../src/shared/persistence/sourceSnapshotClient.js';
import { businessSourcesResponse } from '../businessSources.js';
const owner = 'owner@example.invalid',
  user = { email: owner, role: 'admin', active: true, canImport: true };
const orders = (label = 'sample') => ({
  filename: label + '.xlsx',
  data: importOrdersSheet(
    XLSX.utils.aoa_to_sheet([
      ['#', 'Status', 'Serial'],
      ['0001', 'Pago', '001441234567'],
      ['0001', 'Pago', '001621234567'],
    ]),
    'OS 2025_26',
  ),
});
function operational() {
  const sheet = { '!ref': 'A1:CB2' };
  for (const [col, v] of Object.entries({
    A: 'Nº',
    B: 'CNPJ / CPF',
    C: 'RAZÃO SOCIAL',
    S: 'Inicio ciclo',
    T: 'Fim Ciclo',
    AU: 'Plano Contratado',
    AJ: 'Mensalidade',
    AK: 'Cobrança',
    AL: 'Situação',
    AM: 'Data Cancelamento',
    AV: 'Data Implementação',
    AY: 'Placa instalada',
    BC: 'Equipamentos',
    BE: 'Modelo',
    BG: 'Telefone',
    BH: 'ICCID',
    BJ: 'APN',
    BP: 'Modelo',
    BR: 'Situação',
    BU: 'RAZÃO SOCIAL',
  }))
    sheet[col + '1'] = { t: 's', v };
  for (const [col, v] of Object.entries({
    A: '1',
    C: 'FICTÍCIO',
    BC: '00144',
    BG: '005511',
    BH: '08955001',
  }))
    sheet[col + '2'] = { t: 's', v };
  return { filename: 'op.xlsx', data: importOperationalSheet(sheet) };
}
function logistics() {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      [
        'Chamado',
        'Envio',
        'Recebimento',
        'Cliente',
        'Equipamento',
        'ID',
        'Rastreio',
        'Cidade',
        'A/C',
      ],
      ['1', '01/10/2026', '02/10/2026', 'FICTÍCIO', 'Rastreador', '00144', '', '', ''],
    ]),
    'Envios',
  );
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ['Data Recebimento', 'Equipamento', 'ID', 'Cliente', 'Placa', 'Situação'],
      ['02/10/2026', 'Rastreador', '00144', 'FICTÍCIO', 'AAA1A11', 'Recebido'],
    ]),
    'Devoluções',
  );
  return {
    filename: 'log.xlsx',
    data: importLogistics(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' })),
  };
}
test('bases reais dos importadores sobrevivem a JSON/SQL, com células, zeros e ocorrências repetidas preservados', async (t) => {
  const { database } = snapshotTestDatabase(t),
    store = createSnapshotStore(database, { actor: owner });
  for (const [kind, source] of [
    ['orders', orders()],
    ['operational', operational()],
    ['logistics', logistics()],
  ]) {
    const id = await store.stage(kind, source);
    assert.deepEqual(await store.read(id), source);
    await store.publish('publish_' + kind, [{ kind, snapshotId: id, expectedRevision: 0 }]);
    assert.equal((await store.head(kind)).row_count, source.data.rows.length);
  }
  assert.equal((await store.read((await store.head('orders')).snapshot_id)).data.rows.length, 2);
});
test('upload parcial, reenvio divergente e hash inválido não substituem a última base publicada', async (t) => {
  const { database } = snapshotTestDatabase(t),
    store = createSnapshotStore(database, { actor: owner }),
    first = await store.stage('orders', orders('first'));
  await store.publish('first', [{ kind: 'orders', snapshotId: first, expectedRevision: 0 }]);
  const large = orders('large');
  large.data.issues = [{ reason: 'ç😀'.repeat(30000) }];
  const p = await prepareSnapshot('orders', large);
  await store.start({ ...p, partCount: p.parts.length });
  await store.part(p.id, 0, p.parts[0]);
  await assert.rejects(store.complete(p.id), /partes ausentes/);
  await assert.rejects(
    store.publish('incomplete', [{ kind: 'orders', snapshotId: p.id, expectedRevision: 1 }]),
    /alterada/,
  );
  await assert.rejects(store.part(p.id, 0, 'different'), /divergente/);
  assert.equal((await store.head('orders')).snapshot_id, first);
  assert.equal(splitSnapshot('😀'.repeat(100000)).join(''), '😀'.repeat(100000));
});
test('publicação conjunta é atômica em conflito e repetição não incrementa revisão', async (t) => {
  const { database, sql } = snapshotTestDatabase(t),
    store = createSnapshotStore(database, { actor: owner });
  const a = await store.stage('orders', orders('a')),
    b = await store.stage('operational', operational());
  await store.publish('one', [{ kind: 'orders', snapshotId: a, expectedRevision: 0 }]);
  await assert.rejects(
    store.publish('conflict', [
      { kind: 'orders', snapshotId: a, expectedRevision: 0 },
      { kind: 'operational', snapshotId: b, expectedRevision: 0 },
    ]),
    /alterada/,
  );
  assert.equal(await store.head('operational'), null);
  assert.equal(
    sql.prepare("SELECT COUNT(*) AS c FROM business_publications WHERE id='conflict'").get().c,
    0,
  );
  await store.publish('both', [
    { kind: 'orders', snapshotId: a, expectedRevision: 1 },
    { kind: 'operational', snapshotId: b, expectedRevision: 0 },
  ]);
  await store.publish('both', [
    { kind: 'orders', snapshotId: a, expectedRevision: 1 },
    { kind: 'operational', snapshotId: b, expectedRevision: 0 },
  ]);
  assert.equal((await store.head('orders')).revision, 2);
  assert.equal((await store.head('operational')).revision, 1);
});
test('retenção conserva cinco versões publicadas por base, mantém a ativa e não remove lembretes', async (t) => {
  const { database, sql } = snapshotTestDatabase(t);
  let count = 0;
  const store = createSnapshotStore(database, {
    actor: owner,
    now: () => new Date(Date.UTC(2026, 9, 1, 0, 0, count++)).toISOString(),
  });
  for (let i = 0; i < 7; i++) {
    const id = await store.stage('orders', orders(String(i)));
    await store.publish('p' + i, [{ kind: 'orders', snapshotId: id, expectedRevision: i }]);
  }
  await store.pruneSources();
  assert.equal(
    sql.prepare("SELECT COUNT(*) AS c FROM business_snapshots WHERE kind='orders'").get().c,
    5,
  );
  assert.equal((await store.head('orders')).filename, '6.xlsx');
  assert.equal(sql.prepare('SELECT COUNT(*) AS c FROM business_documents').get().c, 0);
});
test('cliente ponta a ponta restaura a versão ativa, reimporta sem somar linhas e respeita permissões/origem', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  const send = async (path, options = {}) =>
    businessSourcesResponse(
      new Request('https://app.example' + path, {
        ...options,
        headers: { Origin: 'https://app.example', ...options.headers },
      }),
      env,
      user,
      owner,
    );
  const request = async (path, options = {}) => {
    const r = await send(path, options);
    const data = await r.json();
    if (!r.ok) throw Error(data.error);
    return data;
  };
  const client = createSourceSnapshotClient(request, send),
    batch = { orders: orders() };
  const saved = await client.save(batch, await client.catalog());
  const repeated = await client.save(batch, saved.catalog);
  assert.equal(repeated.catalog.orders.revision, 1);
  assert.equal((await client.read('orders', repeated.catalog.orders)).data.rows.length, 2);
  const mixed = await client.save(
    { orders: orders(), operational: operational() },
    repeated.catalog,
  );
  assert.equal(mixed.sources.orders.cloud.revision, 1);
  assert.equal(mixed.sources.operational.cloud.revision, 1);
  const mixedRepeated = await client.save(mixed.sources, mixed.catalog);
  assert.equal(mixedRepeated.catalog.orders.revision, 1);
  assert.equal(mixedRepeated.catalog.operational.revision, 1);
  assert.equal(
    (
      await businessSourcesResponse(
        new Request('https://app.example/api/sources/catalog'),
        env,
        { ...user, email: 'other@example.invalid' },
        owner,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await businessSourcesResponse(
        new Request('https://app.example/api/sources/publish', {
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
  const p = await prepareSnapshot('orders', orders());
  assert.equal(await sha256(JSON.stringify(p.value)), p.hash);
});
test('duas sessões não substituem silenciosamente a mesma revisão', async (t) => {
  const { database } = snapshotTestDatabase(t),
    store = createSnapshotStore(database, { actor: owner });
  const a = await store.stage('orders', orders('a')),
    b = await store.stage('orders', orders('b'));
  const results = await Promise.allSettled([
    store.publish('race_a', [{ kind: 'orders', snapshotId: a, expectedRevision: 0 }]),
    store.publish('race_b', [{ kind: 'orders', snapshotId: b, expectedRevision: 0 }]),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'CONFLICT');
  assert.equal((await store.head('orders')).revision, 1);
});
test('corrupção de uma parte impede conclusão e não substitui a base ativa', async (t) => {
  const { database, sql } = snapshotTestDatabase(t),
    store = createSnapshotStore(database, { actor: owner });
  const first = await store.stage('orders', orders('valid'));
  await store.publish('valid', [{ kind: 'orders', snapshotId: first, expectedRevision: 0 }]);
  const p = await prepareSnapshot('orders', orders('candidate'));
  await store.start({ ...p, partCount: p.parts.length });
  for (let i = 0; i < p.parts.length; i++) await store.part(p.id, i, p.parts[i]);
  sql
    .prepare(
      'UPDATE business_snapshot_parts SET payload_text=? WHERE snapshot_id=? AND part_index=0',
    )
    .run('corrupted', p.id);
  await assert.rejects(store.complete(p.id), /Integridade/);
  assert.equal((await store.head('orders')).snapshot_id, first);
});
