import test from 'node:test';
import assert from 'node:assert/strict';
import { supportIndicatorsResponse } from './supportIndicators.js';
import { snapshotTestDatabase } from './persistence/snapshotTestDatabase.mjs';
import {
  blankEntry,
  agents,
  defaultSettings,
} from '../src/modules/support-indicators/domain/contracts.js';
const owner = 'owner@example.invalid',
  user = { email: owner, role: 'admin', active: true };
const req = (path, body, origin = 'https://app.example') =>
  new Request('https://app.example/api/support-indicators/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const value = () => blankEntry('2026-10-19', agents[0].id);

test('exclusão exige revisão atual, retira o lançamento dos totais e permite novo registro no mesmo dia', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  const first = value();
  first.values.trackers = 1;
  first.values.collectors = 3;
  first.values.videos = 2;
  const record = (
    await (
      await supportIndicatorsResponse(
        req('entries', { value: first, expectedRevision: 0 }),
        env,
        user,
        owner,
      )
    ).json()
  ).record;
  const deletion = (revision = record.revision, origin = 'https://app.example', id = record.id) =>
    new Request('https://app.example/api/support-indicators/entries', {
      method: 'DELETE',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, expectedRevision: revision }),
    });
  assert.equal(
    (await supportIndicatorsResponse(deletion(1, 'https://evil.example'), env, user, owner)).status,
    403,
  );
  assert.equal(
    (
      await supportIndicatorsResponse(
        deletion(),
        env,
        { ...user, email: 'other@example.invalid' },
        owner,
      )
    ).status,
    403,
  );
  assert.equal((await supportIndicatorsResponse(deletion(0), env, user, owner)).status, 400);
  assert.equal(
    (
      await supportIndicatorsResponse(
        deletion(1, 'https://app.example', '2026-10-19.999'),
        env,
        user,
        owner,
      )
    ).status,
    400,
  );
  first.values.collectors = 1;
  await supportIndicatorsResponse(
    req('entries', { value: first, expectedRevision: 1 }),
    env,
    user,
    owner,
  );
  assert.equal((await supportIndicatorsResponse(deletion(1), env, user, owner)).status, 409);
  const deleted = await supportIndicatorsResponse(deletion(2), env, user, owner);
  assert.equal(deleted.status, 200);
  const tombstone = (await deleted.json()).record;
  assert.equal(tombstone.deleted, true);
  assert.equal(tombstone.actor, owner);
  assert.equal(tombstone.revision, 3);
  const list = await (
    await supportIndicatorsResponse(
      req('entries?start=2026-10-19&end=2026-10-25'),
      env,
      user,
      owner,
    )
  ).json();
  assert.equal(list.records.length, 0);
  assert.equal(list.deletedRecords[0].revision, 3);
  const recreated = await supportIndicatorsResponse(
    req('entries', { value: first, expectedRevision: 3 }),
    env,
    user,
    owner,
  );
  assert.equal(recreated.status, 200);
  assert.equal((await recreated.json()).record.value.values.collectors, 1);
  const settingsDeletion = new Request('https://app.example/api/support-indicators/settings', {
    method: 'DELETE',
  });
  assert.equal((await supportIndicatorsResponse(settingsDeletion, env, user, owner)).status, 405);
});
test('D1 atualiza o mesmo dia/agente por CAS, preserva vazio/zero e registra ator do servidor', async (t) => {
  const { database, sql } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  const first = value();
  first.values.created = 4;
  const created = await supportIndicatorsResponse(
    req('entries', { value: first, expectedRevision: 0 }),
    env,
    user,
    owner,
  );
  assert.equal(created.status, 200);
  const record = (await created.json()).record;
  assert.equal(record.actor, owner);
  assert.equal(record.revision, 1);
  first.values.created = 0;
  const changed = await supportIndicatorsResponse(
    req('entries', { value: first, expectedRevision: 1 }),
    env,
    user,
    owner,
  );
  assert.equal(changed.status, 200);
  assert.equal((await changed.json()).record.revision, 2);
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('entries', { value: first, expectedRevision: 1 }),
        env,
        user,
        owner,
      )
    ).status,
    409,
  );
  const response = await supportIndicatorsResponse(
    req('entries?start=2026-10-19&end=2026-10-25'),
    env,
    user,
    owner,
  );
  const list = await response.json();
  assert.equal(list.records.length, 1);
  assert.equal(list.records[0].value.values.created, 0);
  assert.equal(list.records[0].value.values.videos, null);
  assert.equal(
    sql
      .prepare(
        "SELECT COUNT(*) AS n FROM business_documents WHERE resource='support-indicator-entries'",
      )
      .get().n,
    1,
  );
});
test('piloto recusa usuário comum, outro administrador, inativo, origem externa e conteúdo forjado', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database },
    input = { value: value(), expectedRevision: 0 };
  for (const denied of [{ ...user, active: false }])
    assert.equal(
      (
        await supportIndicatorsResponse(
          req('entries?start=2026-10-19&end=2026-10-25'),
          env,
          denied,
          owner,
        )
      ).status,
      403,
    );
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('entries', input, 'https://evil.example'),
        env,
        user,
        owner,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('entries', { ...input, actor: 'forjado' }),
        env,
        user,
        owner,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('entries', { ...input, value: { ...input.value, agentId: 'x' } }),
        env,
        user,
        owner,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('entries?start=2026-10-19&end=2026-10-25&scope=x'),
        env,
        user,
        owner,
      )
    ).status,
    400,
  );
  assert.equal((await supportIndicatorsResponse(req('entries'), {}, user, owner)).status, 503);
});

test('usuários ativos leem indicadores e configurações, mas não criam, editam ou excluem registros', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  const reader = { email: 'reader@example.invalid', role: 'user', active: true };
  for (const path of ['entries?start=2026-10-19&end=2026-10-25', 'settings']) {
    const response = await supportIndicatorsResponse(req(path), env, reader, owner);
    assert.equal(response.status, 200);
    if (path === 'settings') assert.equal((await response.json()).writable, false);
  }
  for (const method of ['POST', 'DELETE'])
    assert.equal(
      (
        await supportIndicatorsResponse(
          new Request('https://app.example/api/support-indicators/entries', { method }),
          env,
          reader,
          owner,
        )
      ).status,
      403,
    );
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('settings', { value: defaultSettings, expectedRevision: 0 }),
        env,
        reader,
        owner,
      )
    ).status,
    403,
  );
});
test('consulta por período pagina sem omitir o primeiro/último dia e isola outras coleções', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  for (let i = 0; i < 103; i++) {
    const day = new Date(Date.parse('2026-01-01') + i * 86400000).toISOString().slice(0, 10);
    const record = blankEntry(day);
    record.values.created = 1;
    assert.equal(
      (
        await supportIndicatorsResponse(
          req('entries', { value: record, expectedRevision: 0 }),
          env,
          user,
          owner,
        )
      ).status,
      200,
    );
  }
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('settings', { value: defaultSettings, expectedRevision: 0 }),
        env,
        user,
        owner,
      )
    ).status,
    200,
  );
  const a = await (
    await supportIndicatorsResponse(
      req('entries?start=2026-01-01&end=2026-04-13'),
      env,
      user,
      owner,
    )
  ).json();
  assert.equal(a.records.length, 100);
  assert.ok(a.next);
  const b = await (
    await supportIndicatorsResponse(
      req('entries?start=2026-01-01&end=2026-04-13&after=' + a.next),
      env,
      user,
      owner,
    )
  ).json();
  assert.equal(b.records.length, 3);
  assert.equal(b.records.at(-1).value.date, '2026-04-13');
  assert.equal(b.next, null);
  const one = await (
    await supportIndicatorsResponse(
      req('entries?start=2026-01-01&end=2026-01-01'),
      env,
      user,
      owner,
    )
  ).json();
  assert.equal(one.records.length, 1);
});
test('configuração e metas usam revisão e não alteram lançamentos', async (t) => {
  const { database } = snapshotTestDatabase(t),
    env = { BUSINESS_DB: database };
  const saved = await supportIndicatorsResponse(
    req('settings', {
      value: { ...defaultSettings, sections: ['manual', 'agents'], weeklyGoals: { executed: 20 } },
      expectedRevision: 0,
    }),
    env,
    user,
    owner,
  );
  assert.equal(saved.status, 200);
  assert.equal(
    (
      await supportIndicatorsResponse(
        req('settings', { value: defaultSettings, expectedRevision: 0 }),
        env,
        user,
        owner,
      )
    ).status,
    409,
  );
  const result = await (await supportIndicatorsResponse(req('settings'), env, user, owner)).json();
  assert.deepEqual(result.record.value.sections, ['manual', 'agents']);
  assert.equal(result.record.value.weeklyGoals.executed, 20);
});
