/** Mesmo contrato em memória e SQL real local. Não abre serviços nem consulta produção. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {
  createDocumentRepository,
  cloneDocument,
} from '../../src/shared/persistence/documentRepository.js';
import { createMemoryDocumentAdapter } from '../../src/shared/persistence/memoryDocumentAdapter.js';
import { createDocumentValueAdapter } from '../../src/shared/persistence/documentValueAdapter.js';
import { createD1DocumentAdapter } from './d1DocumentAdapter.js';

function sqlAdapter(t) {
  const db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(new URL('./migrations/0001_business_documents.sql', import.meta.url), 'utf8'),
  );
  t.after(() => db.close());
  const driver = {
    prepare(sql) {
      let args = [];
      return {
        bind(...values) {
          args = values;
          return this;
        },
        async first() {
          return db.prepare(sql).get(...args) || null;
        },
        async all() {
          return { results: db.prepare(sql).all(...args) };
        },
        async run() {
          return { success: true, meta: { changes: Number(db.prepare(sql).run(...args).changes) } };
        },
      };
    },
  };
  return createD1DocumentAdapter(driver);
}
const validate = (value) => {
  if (!value || !Array.isArray(value.rows)) throw Error('Formato da base inválido.');
};
const options = {
  scope: 'workspace-01',
  collection: 'orders-snapshots',
  actor: 'teste@example.invalid',
  validate,
  now: () => '2026-10-19T12:00:00.000Z',
};
const repo = (adapter, extra = {}) => createDocumentRepository({ ...options, adapter, ...extra });
const base = () => ({
  rows: [
    {
      sourceRow: 2,
      os: '0007',
      iccid: '08955000123456789012',
      raw: 'R$ 1.234,56',
      zero: 0,
      missing: null,
      plate: 'ABC-0123',
    },
    { sourceRow: 3, os: '0007', raw: 'Dado original', values: [0, null, ''] },
  ],
});

for (const [name, factory] of [
  ['memória', () => createMemoryDocumentAdapter()],
  ['SQL', sqlAdapter],
]) {
  test(`${name}: mantém originais, IDs textuais, ordem e cópias independentes`, async (t) => {
    const storage = repo(factory(t)),
      value = base();
    assert.equal(await storage.read('file-001'), null);
    const saved = await storage.put('file-001', value, { expectedRevision: 0 });
    assert.equal(saved.revision, 1);
    assert.equal(saved.actor, options.actor);
    value.rows[0].os = 'alterado';
    saved.value.rows.reverse();
    saved.value.rows[0].iccid = 'alterado';
    const loaded = await storage.read('file-001');
    assert.deepEqual(loaded.value, base());
    loaded.value.rows.length = 0;
    assert.deepEqual((await storage.read('file-001')).value, base());
  });
  test(`${name}: exige revisão e impede perda de dados em gravações concorrentes`, async (t) => {
    const adapter = factory(t),
      a = repo(adapter),
      b = repo(adapter, { actor: 'outro@example.invalid' });
    await assert.rejects(a.put('same', base()), { code: 'INVALID_DATA' });
    await a.put('same', base(), { expectedRevision: 0 });
    const results = await Promise.allSettled([
      a.put('same', { rows: ['A'] }, { expectedRevision: 1 }),
      b.put('same', { rows: ['B'] }, { expectedRevision: 1 }),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(
      results.find((result) => result.status === 'rejected').reason.code,
      'STORAGE_CONFLICT',
    );
    assert.equal((await a.read('same')).revision, 2);
    await assert.rejects(b.put('same', base(), { expectedRevision: 0 }), {
      code: 'STORAGE_CONFLICT',
    });
  });
  test(`${name}: isola espaços e módulos, sem interpretar nomes como chaves`, async (t) => {
    const adapter = factory(t),
      a = repo(adapter),
      b = repo(adapter, { scope: 'workspace-02' }),
      c = repo(adapter, { collection: 'zoho-snapshots' });
    await a.put('00001', base(), { expectedRevision: 0 });
    assert.equal(await b.read('00001'), null);
    assert.equal(await c.read('00001'), null);
    assert.deepEqual(await b.list(), { items: [], nextCursor: null });
    await assert.rejects(a.read("id' OR 1=1"), { code: 'INVALID_DATA' });
  });
  test(`${name}: exclusão mantém revisão e impede recriação por um leitor antigo`, async (t) => {
    const storage = repo(factory(t));
    await storage.put('event', base(), { expectedRevision: 0 });
    const removed = await storage.remove('event', { expectedRevision: 1 });
    assert.equal(removed.deleted, true);
    assert.equal(removed.value, null);
    assert.equal((await storage.read('event')).revision, 2);
    await assert.rejects(storage.put('event', base(), { expectedRevision: 0 }), {
      code: 'STORAGE_CONFLICT',
    });
    assert.deepEqual((await storage.list()).items, []);
    assert.equal((await storage.list({ includeDeleted: true })).items.length, 1);
    await storage.put('event', base(), { expectedRevision: 2 });
    assert.equal((await storage.read('event')).revision, 3);
  });
  test(`${name}: pagina por chave estável sem duplicar documentos nem incluir exclusões`, async (t) => {
    const storage = repo(factory(t));
    for (const id of ['003', '001', '002', '004'])
      await storage.put(id, base(), { expectedRevision: 0 });
    await storage.remove('002', { expectedRevision: 1 });
    const first = await storage.list({ limit: 2 });
    assert.deepEqual(
      first.items.map((item) => item.id),
      ['001', '003'],
    );
    assert.equal(first.nextCursor, '003');
    const last = await storage.list({ after: first.nextCursor, limit: 2 });
    assert.deepEqual(
      last.items.map((item) => item.id),
      ['004'],
    );
    assert.equal(last.nextCursor, null);
    await assert.rejects(storage.list({ limit: 0 }), { code: 'INVALID_DATA' });
  });
  test(`${name}: fontes imutáveis, validação e versões incompatíveis não são corrigidas silenciosamente`, async (t) => {
    const adapter = factory(t),
      storage = repo(adapter, { immutable: true });
    await assert.rejects(
      storage.put('bad', { rows: null }, { expectedRevision: 0 }),
      /Formato da base/,
    );
    assert.equal(await storage.read('bad'), null);
    await storage.put('source', base(), { expectedRevision: 0 });
    await assert.rejects(storage.put('source', base(), { expectedRevision: 1 }), {
      code: 'INVALID_DATA',
    });
    await assert.rejects(storage.remove('source', { expectedRevision: 1 }), {
      code: 'INVALID_DATA',
    });
    await assert.rejects(repo(adapter, { valueVersion: 2 }).read('source'), {
      code: 'INCOMPATIBLE_VERSION',
    });
  });
  test(`${name}: ponte read/write conserva formato e exige recarga após conflito`, async (t) => {
    const adapter = factory(t),
      storage = repo(adapter);
    const bridge = () =>
      createDocumentValueAdapter({
        repository: storage,
        id: 'archive',
        empty: () => ({ rows: [] }),
      });
    const a = bridge(),
      b = bridge();
    await assert.rejects(a.write(base()), { code: 'READ_REQUIRED' });
    assert.deepEqual(await a.read(), { rows: [] });
    await b.read();
    await a.write(base());
    await assert.rejects(b.write({ rows: ['stale'] }), { code: 'STORAGE_CONFLICT' });
    await assert.rejects(b.write({ rows: ['retry'] }), { code: 'READ_REQUIRED' });
    assert.deepEqual(await b.read(), base());
    await b.write({ rows: ['confirmed'] });
    assert.deepEqual(await a.read(), { rows: ['confirmed'] });
  });
}

test('serialização recusa tipos incompatíveis e conversões silenciosas, sem substituir por zero ou texto', () => {
  const circular = {};
  circular.self = circular;
  for (const value of [
    undefined,
    NaN,
    Infinity,
    1n,
    new Date(),
    circular,
    { x: undefined },
    { x: () => {} },
    { x: Symbol('id') },
    [, 1],
  ])
    assert.throws(() => cloneDocument(value), { code: 'INVALID_DATA' });
  assert.deepEqual(cloneDocument(base()), base());
});
test('falha de armazenamento não vira base vazia e não expõe mensagem interna', async () => {
  const adapter = {
    read: async () => {
      throw Error('private-database-details');
    },
    list: async () => [],
    compareAndSwap: async () => {
      throw Error('private-database-details');
    },
  };
  const storage = repo(adapter);
  await Promise.all(
    [storage.read('x'), storage.put('x', base(), { expectedRevision: 0 })].map((operation) =>
      assert.rejects(
        operation,
        (error) =>
          error.code === 'STORAGE_UNAVAILABLE' &&
          !error.message.includes('private-database-details'),
      ),
    ),
  );
});
