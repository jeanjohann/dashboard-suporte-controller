import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfiguredReminderRepository } from './remoteReminderRepository.js';
import { changeReminder } from '../domain/monitoringReminders.js';
const vehicle = { clientId: 'base', vehicleId: '1', plate: 'TST0001', clientName: 'Fictício' };
const record = () =>
  changeReminder(
    null,
    vehicle,
    'schedule',
    { localDate: '2099-10-22T12:00', note: 'Teste' },
    '2026-10-22T12:00:00.000Z',
  );
function setup(request, records = []) {
  let marker;
  const local = {
    read: async () => structuredClone(records),
    change: async () => {
      throw Error('Não deve gravar localmente');
    },
  };
  return {
    local,
    repo: createConfiguredReminderRepository({
      scope: 'test',
      managed: true,
      demo: false,
      request,
      local,
      storage: { getItem: () => marker, setItem: (_, value) => (marker = value) },
    }),
  };
}

test('leitura atravessa página composta somente por exclusões sem ocultar lembretes seguintes', async () => {
  const { repo } = setup(async (path) => {
    if (path === '/api/business/status') return { version: 1, enabled: true, permitted: true };
    if (path.includes('?after=')) return { version: 1, records: [record()], next: null };
    return { version: 1, records: [], next: 'a'.repeat(64) };
  });
  assert.equal((await repo.read()).length, 1);
});
test('agenda remota falha sem fallback; somente status explícito permite modo local', async () => {
  let reads = 0;
  const { repo } = setup(async () => {
    throw Error('offline');
  });
  await assert.rejects(repo.read(), /offline/);
  const { repo: local } = setup(
    async () => ({ version: 1, enabled: true, permitted: false }),
    [record()],
  );
  assert.equal((await local.read()).length, 1);
  assert.equal(local.mode, 'local');
  assert.equal(reads, 0);
});
test('migração exige escolha explícita, preserva cópia local e reconhece repetição', async () => {
  const saved = [];
  let imports = 0;
  const { repo, local } = setup(
    async (path, options) => {
      if (path === '/api/business/status') return { version: 1, enabled: true, permitted: true };
      if (path.endsWith('/import')) {
        imports++;
        const row = JSON.parse(options.body).records[0];
        saved.push(row);
        return { version: 1, results: [{ key: row.key, status: 'imported' }] };
      }
      return { version: 1, records: saved, next: null };
    },
    [record()],
  );
  assert.deepEqual(await repo.read(), []);
  assert.equal(imports, 0);
  assert.equal(repo.migration.length, 1);
  await assert.rejects(repo.change(vehicle, 0, 'schedule', {}), /migração/);
  await repo.migrate();
  assert.equal(repo.migration, null);
  assert.equal((await repo.read()).length, 1);
  assert.equal((await local.read()).length, 1);
  assert.equal(imports, 1);
});
test('históricos divergentes não concluem migração nem liberam edição', async () => {
  const row = record();
  const { repo } = setup(
    async (path) =>
      path === '/api/business/status'
        ? { version: 1, enabled: true, permitted: true }
        : path.endsWith('/import')
          ? { version: 1, results: [{ key: row.key, status: 'conflict' }] }
          : { version: 1, records: [], next: null },
    [row],
  );
  await repo.read();
  await assert.rejects(repo.migrate(), /históricos diferentes/);
  assert.equal(repo.migration.length, 1);
  assert.equal(repo.migrationResults[0].status, 'conflict');
});

test('falha na segunda página não publica uma agenda parcial nem lê a cópia local', async () => {
  let localReads = 0;
  const repo = createConfiguredReminderRepository({
    scope: 'test',
    managed: true,
    demo: false,
    storage: { getItem: () => null },
    local: {
      read: async () => {
        localReads++;
        return [];
      },
    },
    request: async (path) => {
      if (path === '/api/business/status') return { version: 1, enabled: true, permitted: true };
      if (path.includes('?after=')) throw Error('Segunda página indisponível');
      return { version: 1, records: [record()], next: 'a'.repeat(64) };
    },
  });
  await assert.rejects(repo.read(), /Segunda página/);
  assert.equal(localReads, 0);
});
