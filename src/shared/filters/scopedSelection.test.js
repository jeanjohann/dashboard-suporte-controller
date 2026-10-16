/** Confere isolamento, atualização funcional e descrição dos recortes, sem alterar dados do domínio. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptySelection,
  updateScopedField,
  activeFilterEntries,
  selectionCount,
  filterChips,
  filterDisplay,
} from './scopedSelection.js';

test('categorias conservam período, busca e colunas próprias; limpar uma não altera as demais', () => {
  const initial = emptySelection();
  let states = updateScopedField(
    {},
    'OS:equipment',
    'filters',
    { start: '2025-01-01', 'Razão Social': ['A'] },
    initial,
  );
  states = updateScopedField(states, 'OS:operations', 'filters', { Status: ['Pago'] }, initial);
  states = updateScopedField(states, 'OS:equipment', 'extraColumns', [12], initial);
  states = updateScopedField(states, 'OS:data', 'search', 'ABC1D23', initial);
  const before = structuredClone(states);
  const next = updateScopedField(
    states,
    'OS:equipment',
    'filters',
    (old) => ({ ...old, end: '2025-12-31' }),
    initial,
  );
  assert.deepEqual(states, before);
  assert.deepEqual(next['OS:operations'].filters, { Status: ['Pago'] });
  assert.equal(next['OS:equipment'].filters.start, '2025-01-01');
  assert.equal(next['OS:data'].search, 'ABC1D23');
  const cleared = updateScopedField(next, 'OS:equipment', 'filters', {}, initial);
  assert.deepEqual(cleared['OS:equipment'].extraColumns, [12]);
  assert.deepEqual(cleared['OS:operations'], states['OS:operations']);
  assert.deepEqual(initial, emptySelection());
});
test('Operacional e Parque não compartilham seleção; navegação analítica pode endereçar explicitamente a fila', () => {
  const initial = { ...emptySelection(), filters: { clients: [], threshold: 48, focus: 'all' } };
  let states = updateScopedField({}, 'operational:records', 'filters', { client: ['A'] }, initial);
  states = updateScopedField(states, 'park:maintenance', 'filters', { client: ['B'] }, initial);
  states = updateScopedField(
    states,
    'overview',
    'filters',
    { clients: ['A'], threshold: 72, focus: 'all' },
    initial,
  );
  const next = updateScopedField(
    states,
    'queue',
    'filters',
    (old) => ({ ...old, clients: ['A'], threshold: 72, focus: 'critical' }),
    initial,
  );
  assert.deepEqual(next['operational:records'].filters.client, ['A']);
  assert.deepEqual(next['park:maintenance'].filters.client, ['B']);
  assert.equal(next.overview.filters.focus, 'all');
  assert.equal(next.queue.filters.focus, 'critical');
});
test('indicadores e chips ignoram padrões neutros, mostram zero útil e preservam datas civis', () => {
  const defaults = { clients: [], threshold: 48, state: 'all', search: '' };
  assert.equal(selectionCount({ filters: defaults }, defaults), 0);
  assert.deepEqual(
    activeFilterEntries(
      { ...defaults, threshold: 72, periods: {}, empty: [], zero: 0 },
      defaults,
    ).map(([key]) => key),
    ['threshold', 'zero'],
  );
  assert.equal(selectionCount({ filters: { Status: ['Pago'] }, search: 'ABC' }), 2);
  let removed;
  const chips = filterChips(
    { start: '2025-02-01', Status: ['Pago', 'Concluída'], empty: [] },
    { labels: { start: 'De' }, remove: (key) => (removed = key) },
  );
  assert.equal(chips.length, 2);
  assert.equal(chips[0].value, '01/02/2025');
  chips[0].remove();
  assert.equal(removed, 'start');
  assert.equal(filterDisplay(['', 'A']), 'Sem dados, A');
});
