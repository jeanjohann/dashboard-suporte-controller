import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { businessRemindersResponse } from './businessReminders.js';
import { changeReminder } from '../src/modules/monitoring/domain/monitoringReminders.js';

const owner = 'owner@example.invalid',
  user = { email: owner, role: 'admin', canImport: true };
const vehicle = { clientId: 'base-1', vehicleId: '001', plate: 'TST0001', clientName: 'Fictício' };
function database(t) {
  const db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(
      new URL('./persistence/migrations/0001_business_documents.sql', import.meta.url),
      'utf8',
    ),
  );
  t.after(() => db.close());
  return {
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
          return { success: true, results: db.prepare(sql).all(...args) };
        },
        async run() {
          return { success: true, meta: { changes: Number(db.prepare(sql).run(...args).changes) } };
        },
      };
    },
  };
}
function req(path = '', body, origin = 'https://app.example') {
  return new Request('https://app.example/api/monitoring/reminders' + path, {
    method: body ? 'POST' : 'GET',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
const draft = { localDate: '2099-10-22T12:00', note: 'Conferir', outcome: '' };
const input = (expectedRevision = 0) => ({ vehicle, expectedRevision, action: 'schedule', draft });
test('agenda D1 recusa acesso indevido e origem externa; status não abre dados', async (t) => {
  const env = { BUSINESS_DB: database(t) };
  assert.equal(
    (
      await businessRemindersResponse(
        req(),
        env,
        { ...user, email: 'other@example.invalid' },
        owner,
      )
    ).status,
    403,
  );
  assert.equal(
    (await businessRemindersResponse(req('', input(), 'https://evil.example'), env, user, owner))
      .status,
    403,
  );
  assert.equal(
    (
      await businessRemindersResponse(
        req('/import', { version: 1, records: [] }),
        env,
        { ...user, canImport: false },
        owner,
      )
    ).status,
    403,
  );
  assert.equal((await businessRemindersResponse(req(), {}, user, owner)).status, 503);
  assert.equal(
    (
      await businessRemindersResponse(
        req(),
        { ...env, BUSINESS_REMINDERS_ACCESS: 'admins' },
        { ...user, email: 'other@example.invalid' },
        owner,
      )
    ).status,
    200,
  );
});
test('agenda D1 preserva histórico entre sessões, controla concorrência e usa relógio/ator do servidor', async (t) => {
  const env = { BUSINESS_DB: database(t) };
  const created = await businessRemindersResponse(req('', input()), env, user, owner);
  assert.equal(created.status, 200);
  const first = (await created.json()).record;
  assert.equal(first.revision, 1);
  assert.equal(first.history.length, 1);
  assert.equal((await businessRemindersResponse(req('', input()), env, user, owner)).status, 409);
  const other = { ...user, email: 'admin2@example.invalid' };
  const done = await businessRemindersResponse(
    req('', { ...input(1), action: 'complete', draft: { outcome: 'Verificado' } }),
    { ...env, BUSINESS_REMINDERS_ACCESS: 'admins' },
    other,
    owner,
  );
  assert.equal(done.status, 200);
  const list = await (await businessRemindersResponse(req(), env, user, owner)).json();
  assert.equal(list.records[0].history.length, 2);
  assert.equal(list.records[0].status, 'completed');
  assert.equal(list.next, null);
  assert.equal(
    (await businessRemindersResponse(req('', { ...input(2), actor: 'forged' }), env, user, owner))
      .status,
    400,
  );
  const audit = await env.BUSINESS_DB.prepare('SELECT updated_by FROM business_documents').first();
  assert.equal(audit.updated_by, other.email);
});
test('migração D1 é repetível, mantém encerrados, recusa divergências e valida lote antes de gravar', async (t) => {
  const env = { BUSINESS_DB: database(t) };
  const scheduled = changeReminder(null, vehicle, 'schedule', draft, '2026-10-22T12:00:00.000Z');
  const record = changeReminder(
    scheduled,
    vehicle,
    'complete',
    { outcome: 'Histórico local' },
    '2026-10-22T13:00:00.000Z',
  );
  const body = { version: 1, records: [record] };
  const send = async (value) =>
    (await businessRemindersResponse(req('/import', value), env, user, owner)).json();
  assert.equal((await send(body)).results[0].status, 'imported');
  assert.equal((await send(body)).results[0].status, 'identical');
  const changed = structuredClone(record);
  changed.plate = 'OUT0001';
  assert.equal((await send({ version: 1, records: [changed] })).results[0].status, 'conflict');
  const bad = { ...record, key: 'invalid' };
  assert.equal(
    (
      await businessRemindersResponse(
        req('/import', { version: 1, records: [bad] }),
        env,
        user,
        owner,
      )
    ).status,
    400,
  );
  const list = await (await businessRemindersResponse(req(), env, user, owner)).json();
  assert.deepEqual(list.records, [record]);
});
test('agenda D1 não mascara falha como vazio nem aceita cursores/escopos livres', async () => {
  const env = {
    BUSINESS_DB: {
      prepare() {
        throw Error('private-error');
      },
    },
  };
  const result = await businessRemindersResponse(req(), env, user, owner);
  assert.equal(result.status, 503);
  assert.ok(!(await result.text()).includes('private-error'));
  assert.equal(
    (await businessRemindersResponse(req('?scope=another'), env, user, owner)).status,
    400,
  );
});

test('agenda D1 pagina mais de 25 veículos sem duplicação e sem perder históricos', async (t) => {
  const env = { BUSINESS_DB: database(t) };
  for (let i = 0; i < 27; i++) {
    const v = { ...vehicle, vehicleId: String(i) };
    const record = changeReminder(null, v, 'schedule', draft, '2026-10-22T12:00:00.000Z');
    assert.equal(
      (
        await businessRemindersResponse(
          req('/import', { version: 1, records: [record] }),
          env,
          user,
          owner,
        )
      ).status,
      200,
    );
  }
  const a = await (await businessRemindersResponse(req(), env, user, owner)).json();
  assert.equal(a.records.length, 25);
  assert.match(a.next, /^[a-f0-9]{64}$/);
  const b = await (
    await businessRemindersResponse(req('?after=' + a.next), env, user, owner)
  ).json();
  assert.equal(b.records.length, 2);
  assert.equal(b.next, null);
  assert.equal(new Set([...a.records, ...b.records].map((r) => r.key)).size, 27);
});
