import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeZohoPresence, presenceInstant } from './zohoPresence.js';
const mapping = { agent: 0, start: 1, end: 2 };
const rows = (values) => values.map((cells, index) => ({ sourceRow: index + 2, cells }));
test('permanência une sobreposições por agente e mantém duplicadas/abertas na revisão', () => {
  const input = rows([
    ['A', '21/10/2026 08:00', '21/10/2026 10:00'],
    ['A', '21/10/2026 09:00', '21/10/2026 11:00'],
    ['A', '21/10/2026 08:00', '21/10/2026 10:00'],
    ['A', '21/10/2026 12:00', ''],
    ['B', '21/10/2026 08:00', '21/10/2026 09:00'],
  ]);
  const original = JSON.stringify(input),
    result = analyzeZohoPresence(input, mapping, { offset: '-03:00' });
  assert.equal(result.totalSeconds, 4 * 3600);
  assert.equal(result.validSessions, 3);
  assert.equal(result.groups[0].seconds, 3 * 3600);
  assert.equal(result.groups[0].overlaps, 1);
  assert.equal(result.issues.length, 3);
  assert.equal(JSON.stringify(input), original);
});
test('período recorta sessões pela meia-noite no fuso confirmado, com origem preservada', () => {
  const result = analyzeZohoPresence(
    rows([
      ['A', '20/10/2026 23:00', '21/10/2026 02:00'],
      ['A', '22/10/2026 00:00', '22/10/2026 01:00'],
    ]),
    mapping,
    { offset: '-03:00', start: '2026-10-21', end: '2026-10-21' },
  );
  assert.equal(result.totalSeconds, 7200);
  assert.equal(result.outside, 1);
  assert.deepEqual(result.groups[0].rows, [2]);
});
test('fuso e calendário são explícitos; durações negativas ou totalmente inválidas não viram zero', () => {
  assert.equal(presenceInstant('31/02/2026 09:00', '-03:00'), null);
  assert.equal(presenceInstant('21/10/2026 24:00', 'Z'), null);
  assert.equal(presenceInstant('2026-10-21T09:00:00-03:00'), Date.parse('2026-10-21T12:00:00Z'));
  assert.throws(() => analyzeZohoPresence([], mapping, {}));
  assert.throws(() => analyzeZohoPresence([], { ...mapping, end: 1 }, { offset: 'Z' }));
  const result = analyzeZohoPresence(
    rows([['A', '21/10/2026 10:00', '21/10/2026 09:00']]),
    mapping,
    { offset: 'Z' },
  );
  assert.equal(result.groups.length, 0);
  assert.equal(result.issues.length, 1);
});
