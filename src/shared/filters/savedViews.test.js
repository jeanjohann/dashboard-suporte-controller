import test from 'node:test';
import assert from 'node:assert/strict';
import { applySavedView, changeSavedView, readSavedViews, savedViewsKey } from './savedViews.js';
const storage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
};
const create = (id, extra = {}) => ({
  type: 'create',
  id,
  name: id,
  schema: 'OS:CNPJ,Placa',
  periodMode: 'fixed',
  state: {
    selection: {
      filters: { Status: ['Pago'], start: '2026-01-01', end: '2026-01-31' },
      search: 'Jean',
      presentations: { support: true },
    },
    reports: { a: { visible: true, mode: 'summary' } },
  },
  ...extra,
});
test('favoritos isolam usuário/categoria, restauram cópia e preservam outros favoritos ao alterar', () => {
  const s = storage(),
    key = savedViewsKey('jean', 'orders:overview');
  changeSavedView(s, key, create('Semanal'));
  changeSavedView(s, key, create('Cliente'));
  assert.equal(readSavedViews(s, key).length, 2);
  assert.deepEqual(readSavedViews(s, savedViewsKey('eduardo', 'orders:overview')), []);
  assert.deepEqual(readSavedViews(s, savedViewsKey('jean', 'orders:support')), []);
  const v = readSavedViews(s, key)[0],
    applied = applySavedView(v, v.schema);
  applied.selection.filters.Status.push('Cancelada');
  assert.deepEqual(readSavedViews(s, key)[0].state.selection.filters.Status, ['Pago']);
  changeSavedView(s, key, { type: 'rename', id: v.id, revision: v.revision, name: 'Reunião' });
  assert.equal(readSavedViews(s, key)[1].name, 'Cliente');
  assert.throws(
    () => changeSavedView(s, key, { type: 'delete', id: v.id, revision: 1 }),
    /outra aba/,
  );
  changeSavedView(s, key, { type: 'delete', id: v.id, revision: 2 });
  assert.equal(readSavedViews(s, key).length, 1);
});
test('semanas relativas recalculam ao aplicar, datas fixas não mudam e fonte incompatível não aplica', () => {
  const v = { ...create('a'), state: create('a').state };
  assert.equal(applySavedView(v, v.schema, '2026-10-20').selection.filters.start, '2026-01-01');
  assert.deepEqual(
    applySavedView({ ...v, periodMode: 'currentWeek' }, v.schema, '2026-10-20').selection.filters,
    { Status: ['Pago'], start: '2026-10-19', end: '2026-10-25' },
  );
  assert.equal(
    applySavedView({ ...v, periodMode: 'previousWeek' }, v.schema, '2026-10-25').selection.filters
      .start,
    '2026-10-12',
  );
  assert.equal(
    applySavedView({ ...v, periodMode: 'last7' }, v.schema, '2026-01-02').selection.filters.start,
    '2025-12-27',
  );
  assert.throws(() => applySavedView(v, 'colunas diferentes'), /estrutura/);
});
test('duplicidade de nome/ID, formato inválido e falha de armazenamento não substituem favoritos', () => {
  const s = storage();
  changeSavedView(s, 'k', create('a'));
  const raw = s.getItem('k');
  assert.throws(() => changeSavedView(s, 'k', create('b', { name: 'A' })), /nome/);
  assert.throws(() => changeSavedView(s, 'k', create('a')), /Identificador/);
  assert.throws(
    () => changeSavedView(s, 'k', create('c', { state: JSON.parse('{"__proto__":{}}') })),
    /inválida/,
  );
  assert.equal(s.getItem('k'), raw);
  assert.throws(
    () =>
      changeSavedView(
        {
          ...s,
          setItem() {
            throw Error('quota');
          },
        },
        'k',
        create('d'),
      ),
    /quota/,
  );
  assert.equal(s.getItem('k'), raw);
  s.setItem('bad', '{"version":99}');
  assert.throws(() => changeSavedView(s, 'bad', create('a')), /incompatível/);
  assert.equal(s.getItem('bad'), '{"version":99}');
});
