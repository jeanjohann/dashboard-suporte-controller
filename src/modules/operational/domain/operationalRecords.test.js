import test from 'node:test';
import assert from 'node:assert/strict';
import { sortOperationalRecords } from './operationalRecords.js';

test('operacional ordena o recorte completo antes das páginas, mantém origem e retorna à ordem original', () => {
  const rows = Array.from({ length: 105 }, (_, i) => ({
    sourceRow: i + 2,
    client: `Cliente ${105 - i}`,
  }));
  const before = structuredClone(rows);
  const ordered = sortOperationalRecords(rows, { index: 1, direction: 'asc' });
  assert.equal(ordered[0].client, 'Cliente 1');
  assert.equal(ordered.slice(50, 100)[0].client, 'Cliente 51');
  assert.equal(ordered.at(-1).client, 'Cliente 105');
  assert.equal(
    sortOperationalRecords(rows, { index: 1, direction: 'desc' })[0].client,
    'Cliente 105',
  );
  assert.strictEqual(sortOperationalRecords(rows, null), rows);
  assert.deepEqual(rows, before);
});

test('seriais longos mantêm precisão textual; empates preservam linha e ausências ficam no fim em ambas as direções', () => {
  const rows = [
    { sourceRow: 2, serial: '9007199254740993' },
    { sourceRow: 3, serial: '' },
    { sourceRow: 4, serial: '9007199254740992' },
    { sourceRow: 5, serial: '9007199254740993' },
    { sourceRow: 6, serial: '00162' },
  ];
  assert.deepEqual(
    sortOperationalRecords(rows, { index: 2, direction: 'asc' }).map((r) => r.sourceRow),
    [6, 4, 2, 5, 3],
  );
  assert.deepEqual(
    sortOperationalRecords(rows, { index: 2, direction: 'desc' }).map((r) => r.sourceRow),
    [2, 5, 4, 6, 3],
  );
  assert.equal(rows[4].serial, '00162');
});
