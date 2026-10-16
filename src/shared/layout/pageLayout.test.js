/** Preferências de apresentação, com armazenamento artificial e sem dados operacionais. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanLayout, readLayout, mergeLayout, availableLayoutMode } from './pageLayout.js';
import { orderLayoutDefinitions } from '../../modules/orders/config/preferences.js';

test('aceita somente visibilidade e modos conhecidos, sem transportar outros campos', () => {
  assert.equal(cleanLayout({ version: 2, reports: {} }), null);
  assert.equal(cleanLayout([]), null);
  const result = cleanLayout({
    version: 1,
    reports: {
      A: { visible: false, mode: 'summary', rows: ['dado privado'] },
      B: { visible: true, mode: 'invalido' },
      C: null,
    },
  });
  assert.deepEqual(result, {
    A: { visible: false, mode: 'summary' },
    B: { visible: true, mode: 'default' },
  });
  assert.doesNotMatch(JSON.stringify(result), /privado/);
});
test('leitura preserva o formato novo e só usa legado se necessário; nunca grava automaticamente', () => {
  let writes = 0;
  const storage = {
    getItem: () =>
      JSON.stringify({ version: 1, reports: { A: { visible: false, mode: 'collapsed' } } }),
    setItem: () => writes++,
  };
  assert.deepEqual(
    readLayout(storage, 'test', () => {
      throw Error('Legado não deve ser usado');
    }),
    { A: { visible: false, mode: 'collapsed' } },
  );
  assert.equal(writes, 0);
  assert.deepEqual(
    readLayout({ getItem: () => '{quebrado' }, 'test', () => ({
      A: { visible: false, mode: 'default' },
    })),
    { A: { visible: false, mode: 'default' } },
  );
  assert.deepEqual(
    readLayout(
      {
        getItem() {
          throw Error('Bloqueado');
        },
      },
      'test',
    ),
    {},
  );
});
test('salvar categoria preserva as demais e não altera objetos recebidos', () => {
  const previous = {
    A: { visible: false, mode: 'collapsed' },
    B: { visible: false, mode: 'summary' },
  };
  const patch = { A: { visible: true, mode: 'default' } };
  const next = mergeLayout(previous, patch);
  assert.deepEqual(next.B, previous.B);
  assert.equal(previous.A.visible, false);
  assert.equal(next.A.visible, true);
  assert.notEqual(next.A, patch.A);
});
test('resumo só é oferecido quando existe e chaves antigas de OS continuam ligadas aos títulos reais', () => {
  assert.equal(availableLayoutMode('summary', true), 'summary');
  assert.equal(availableLayoutMode('summary', false), 'complete');
  assert.equal(availableLayoutMode('collapsed', false), 'collapsed');
  assert.equal(availableLayoutMode(undefined, true), 'default');
  assert.equal(
    orderLayoutDefinitions.find((entry) => entry.id === 'geography').title,
    'Distribuição geográfica dos serviços',
  );
  assert.equal(
    orderLayoutDefinitions.some((entry) => ['filters', 'extras'].includes(entry.id)),
    false,
  );
});
