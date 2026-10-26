import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { workspaceStorageResponse } from './workspaceStorage.js';
import {
  createWorkspaceClient,
  createPilotRepository,
} from '../src/shared/persistence/workspaceClient.js';
import { emptyHistory } from '../src/modules/consumption/data/consumptionHistory.js';
import { emptyDashboardDocument } from '../src/modules/my-dashboard/domain/layout.js';
import { prepareWorkspace, workspaceHash } from '../src/shared/persistence/workspacePayload.js';
const owner = 'owner@example.invalid',
  user = { email: owner, role: 'admin', active: true, canImport: true, canDashboard: true };
function database(t) {
  const db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(
      new URL('./persistence/migrations/0001_business_documents.sql', import.meta.url),
      'utf8',
    ),
  );
  t.after(() => db.close());
  const adapter = {
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
        execute() {
          return { success: true, meta: { changes: Number(db.prepare(sql).run(...args).changes) } };
        },
      };
    },
    async batch(statements) {
      db.exec('BEGIN');
      try {
        const result = [];
        for (const statement of statements) result.push(statement.execute());
        db.exec('COMMIT');
        return result;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return adapter;
}
function request(env, actor = user) {
  return async (path, options = {}) => {
    const response = await workspaceStorageResponse(
      new Request('https://app.example' + path, {
        ...options,
        headers: { Origin: 'https://app.example', ...options.headers },
      }),
      env,
      actor,
      owner,
    );
    const body = await response.json();
    if (!response.ok) throw Object.assign(Error(body.error), { status: response.status });
    return body;
  };
}
const dashboard = (name = 'Meu painel') => ({
  version: 1,
  revision: 0,
  dashboards: [
    {
      id: 'one',
      name,
      widgets: [
        {
          id: 'card',
          title: 'Atendimentos',
          metric: 'orders.completed',
          kind: 'card',
          size: 'small',
          filters: {},
        },
      ],
    },
  ],
});
test('roundtrip no D1, independência das fontes, deduplicação e conflito entre computadores', async (t) => {
  const env = { BUSINESS_DB: database(t) },
    read = request(env),
    client = createWorkspaceClient('dashboards', read);
  assert.equal((await client.read()).value, null);
  const saved = await client.write(dashboard(), 0);
  assert.equal(saved.revision, 1);
  assert.deepEqual((await client.read()).value, dashboard());
  await assert.rejects(client.write(dashboard('Outra'), 0), (e) => e.status === 409);
  await client.write(dashboard('Outra'), 1);
  assert.equal((await client.read()).revision, 2);
  const consumption = createWorkspaceClient('consumption', read);
  await consumption.write(
    {
      ...emptyHistory(),
      notes: [
        {
          operator: 'Kore',
          iccid: '0001',
          date: '2026-10-24',
          status: 'Investigar',
          text: 'x'.repeat(80000),
        },
      ],
    },
    0,
  );
  assert.equal((await consumption.read()).value.notes[0].text.length, 80000);
  const countBefore = await env.BUSINESS_DB.prepare(
    "SELECT COUNT(*) AS n FROM business_documents WHERE resource='workspace-parts'",
  ).first();
  await client.write(dashboard('Outra'), 2);
  assert.deepEqual(
    await env.BUSINESS_DB.prepare(
      "SELECT COUNT(*) AS n FROM business_documents WHERE resource='workspace-parts'",
    ).first(),
    countBefore,
  );
  assert.equal((await consumption.read()).revision, 1);
});
test('partes incompletas e corrompidas não substituem o ponteiro; publicação repetida não duplica revisão', async (t) => {
  const env = { BUSINESS_DB: database(t) },
    read = request(env),
    client = createWorkspaceClient('dashboards', read);
  await client.write(dashboard(), 0);
  const p = await prepareWorkspace('dashboards', dashboard('Novo'));
  await read('/api/workspace/dashboards/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...p, chunks: undefined, expectedRevision: 1 }),
  });
  const post = (action, body) =>
    read('/api/workspace/dashboards/' + action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  await assert.rejects(post('publish', { id: p.id, expectedRevision: 1 }), /incompleto/);
  await assert.rejects(post('part', { id: p.id, index: 0, text: 'corrompido' }), /Parte inválida/);
  assert.equal((await client.read()).value.dashboards[0].name, 'Meu painel');
  await post('part', { id: p.id, index: 0, text: p.chunks[0] });
  await post('publish', { id: p.id, expectedRevision: 1 });
  await post('publish', { id: p.id, expectedRevision: 1 });
  assert.equal((await client.read()).revision, 2);
});
test('piloto nega outros administradores, origem externa, permissões e recursos livres', async (t) => {
  const env = { BUSINESS_DB: database(t) };
  await assert.rejects(
    request(env, { ...user, email: 'other@example.invalid' })('/api/workspace/consumption'),
    (e) => e.status === 403,
  );
  await assert.rejects(
    request(env, { ...user, canDashboard: false })('/api/workspace/dashboards'),
    (e) => e.status === 403,
  );
  await assert.rejects(
    request(env, { ...user, canImport: false })('/api/workspace/consumption/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }),
    (e) => e.status === 403,
  );
  const response = await workspaceStorageResponse(
    new Request('https://app.example/api/workspace/dashboards/start', {
      method: 'POST',
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      body: '{}',
    }),
    env,
    user,
    owner,
  );
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  await assert.rejects(request(env)('/api/workspace/secrets'), (e) => e.status === 404);
  await assert.rejects(request({})('/api/workspace/status'), (e) => e.status === 503);
});
test('migração é explícita, preserva cópia local e não sobrepõe um destino diferente', async (t) => {
  const env = { BUSINESS_DB: database(t) },
    read = request(env);
  let localWrites = 0;
  const local = dashboard(),
    repo = createPilotRepository({
      kind: 'dashboards',
      managed: true,
      readLocal: async () => local,
      writeLocal: async () => {
        localWrites++;
      },
      empty: emptyDashboardDocument,
      revisionField: 'revision',
      request: read,
    });
  assert.deepEqual(await repo.read('account:' + owner), local);
  assert.equal(repo.pendingMigration, true);
  await assert.rejects(repo.write(owner, local), /Migre/);
  await repo.migrate(owner);
  assert.equal(localWrites, 0);
  assert.equal(repo.pendingMigration, false);
  await createWorkspaceClient('dashboards', read).write(dashboard('No outro computador'), 1);
  await assert.rejects(repo.migrate(owner), /diferentes/);
  await assert.rejects(repo.write(owner, { ...local, revision: 1 }), (e) => e.status === 409);
  assert.equal(localWrites, 0);
});
test('falha remota não cai para armazenamento local e payload inválido não é publicado', async (t) => {
  let localReads = 0;
  const repo = createPilotRepository({
    kind: 'consumption',
    managed: true,
    readLocal: async () => {
      localReads++;
      return emptyHistory();
    },
    writeLocal: async () => {},
    empty: emptyHistory,
    revisionField: '_revision',
    request: async () => {
      throw Error('offline');
    },
  });
  await assert.rejects(repo.read(), /offline/);
  assert.equal(localReads, 0);
  const env = { BUSINESS_DB: database(t) },
    client = createWorkspaceClient('zoho-backlog', request(env));
  await assert.rejects(
    client.write({ data: { readAt: new Date().toISOString(), complete: false, tickets: [] } }, 0),
    /incompleta/,
  );
  assert.equal((await client.read()).revision, 0);
  assert.notEqual(await workspaceHash('001'), await workspaceHash('1'));
});

test('consultas Zoho e sessões mantêm datas, identificadores e relatórios recalculados', async (t) => {
  const env = { BUSINESS_DB: database(t) },
    read = request(env),
    at = '2026-10-24T12:00:00.000Z';
  const data = {
    period: { start: '2026-10-20', end: '2026-10-24' },
    readAt: at,
    replies: [],
    entries: [],
    review: [],
    metrics: [],
    closures: [],
    ticketIds: ['0001'],
    closureBasis: 'current-status-v1',
    ticketIndicators: [],
    closureReview: [],
  };
  const client = createWorkspaceClient('zoho-indicators', read);
  await client.write({ data }, 0);
  assert.deepEqual((await client.read()).value, { data });
  const reader = request(env, { email: 'reader@example.invalid', role: 'user', active: true });
  const readerClient = createWorkspaceClient('zoho-indicators', reader);
  assert.deepEqual((await readerClient.read()).value, { data });
  assert.deepEqual((await reader('/api/workspace/status')).readKinds, [
    'zoho-indicators',
    'zoho-backlog',
  ]);
  await assert.rejects(readerClient.write({ data }, 1), (error) => error.status === 403);
  for (const kind of ['consumption', 'dashboards', 'zoho-support', 'zoho-presence'])
    await assert.rejects(reader('/api/workspace/' + kind), (error) => error.status === 403);
  await assert.rejects(
    request(env, { email: 'reader@example.invalid', role: 'user', active: false })(
      '/api/workspace/zoho-indicators',
    ),
    (error) => error.status === 403,
  );
  const support = createWorkspaceClient('zoho-support', read);
  await support.write(
    {
      data,
      mapping: { '0002:execution': 'Nome fictício', '0002:scheduling': 'Nome fictício' },
      reviewedReplies: true,
      columns: ['seconds'],
    },
    0,
  );
  assert.equal((await support.read()).value.mapping['0002:execution'], 'Nome fictício');
  const backlog = createWorkspaceClient('zoho-backlog', read);
  await backlog.write(
    {
      data: {
        complete: true,
        startedAt: at,
        readAt: at,
        tickets: [{ ticketId: '0001', agentId: '0002', state: 'ONHOLD', number: '001' }],
      },
    },
    0,
  );
  assert.equal((await backlog.read()).value.data.tickets[0].ticketId, '0001');
  const sessions = createWorkspaceClient('zoho-presence', read);
  const value = {
    source: {
      filename: 'FICTICIO.csv',
      headers: ['Agente', 'Início', 'Fim'],
      rows: [
        {
          line: 2,
          cells: ['AGENTE FICTÍCIO', '2026-10-24T09:00:00-03:00', '2026-10-24T10:00:00-03:00'],
        },
      ],
    },
    mapping: { agent: 0, start: 1, end: 2 },
    offset: '-03:00',
    start: '2026-10-24',
    end: '2026-10-24',
    report: { totalSeconds: 999999 },
  };
  await sessions.write(value, 0);
  assert.equal((await sessions.read()).value.report.totalSeconds, 3600);
  await assert.rejects(
    client.write({ data: { ...data, access_token: 'não-persistir' } }, 1),
    /Credenciais/,
  );
});

test('cota é atômica e não cobra partes repetidas; erro preserva o conteúdo publicado', async (t) => {
  const env = { BUSINESS_DB: database(t) },
    read = request(env),
    client = createWorkspaceClient('dashboards', read);
  await client.write(dashboard(), 0);
  const before = await env.BUSINESS_DB.prepare(
    "SELECT payload_json FROM business_documents WHERE resource='workspace-budget'",
  ).first();
  await client.write(dashboard(), 1);
  assert.deepEqual(
    await env.BUSINESS_DB.prepare(
      "SELECT payload_json FROM business_documents WHERE resource='workspace-budget'",
    ).first(),
    before,
  );
  await env.BUSINESS_DB.prepare(
    "UPDATE business_documents SET payload_json=? WHERE resource='workspace-budget'",
  )
    .bind(JSON.stringify({ bytes: 128 * 1024 * 1024 }))
    .run();
  await assert.rejects(client.write(dashboard('Excede cota'), 2), /128 MB/);
  assert.equal((await client.read()).revision, 2);
});
