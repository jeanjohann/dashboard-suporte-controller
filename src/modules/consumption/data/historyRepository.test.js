/** Homologa a troca do adaptador usando o formato real do backup, sem acessar o IndexedDB. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHistoryRepository } from './historyRepository.js';
import { emptyHistory, validateBackup } from './consumptionHistory.js';
import { createDocumentRepository } from '../../../shared/persistence/documentRepository.js';
import { createMemoryDocumentAdapter } from '../../../shared/persistence/memoryDocumentAdapter.js';
import { createDocumentValueAdapter } from '../../../shared/persistence/documentValueAdapter.js';

test('histórico usa o adaptador versionado sem mudar CSV, backup v1 ou identificadores', async () => {
  const text =
    'ICCID;MSISDN;Período Início;Período Término;Consumo (MB)\n089551805670305208517;005511913795620;01/09/2026;28/09/2026;0';
  const history = await validateBackup(
    JSON.stringify({
      ...emptyHistory(),
      files: [{ filename: 'ficticio.csv', text, importedAt: '2026-10-19T12:00:00Z', active: true }],
    }),
  );
  const documents = createDocumentRepository({
    adapter: createMemoryDocumentAdapter(),
    scope: 'test-workspace',
    collection: 'consumption-archives',
    actor: 'teste@example.invalid',
    validate: async (value) => {
      await validateBackup(JSON.stringify(value));
    },
  });
  const repository = createHistoryRepository(
    createDocumentValueAdapter({ repository: documents, id: 'history', empty: emptyHistory }),
  );
  assert.deepEqual(await repository.read(), emptyHistory());
  await repository.write(history);
  const loaded = await repository.read();
  assert.deepEqual(loaded, history);
  assert.equal(loaded.version, 1);
  assert.equal(loaded.files[0].text, text);
  assert.deepEqual(await validateBackup(JSON.stringify(loaded)), history);
  const invalid = { ...loaded, files: [...loaded.files, ...loaded.files] };
  await assert.rejects(repository.write(invalid), /arquivos repetidos/);
  assert.deepEqual(await repository.read(), history);
});

test('a fachada encaminha opções ao adaptador, sem introduzir rede ou depender do formato do armazenamento', async () => {
  const controller = new AbortController(),
    options = { signal: controller.signal },
    history = emptyHistory(),
    calls = [];
  const repository = createHistoryRepository({
    read: async (received) => {
      calls.push(received);
      return history;
    },
    write: async (value, received) => {
      assert.equal(value, history);
      calls.push(received);
    },
  });
  assert.equal(await repository.read(options), history);
  await repository.write(history, options);
  assert.deepEqual(calls, [options, options]);
});
