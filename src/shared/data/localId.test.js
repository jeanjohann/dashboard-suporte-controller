import test from 'node:test';
import assert from 'node:assert/strict';
import { localId } from './localId.js';

test('configurações e anotações podem gerar identificadores únicos sem randomUUID', () => {
  assert.equal(localId({ randomUUID: () => 'uuid-existente' }), 'uuid-existente');
  const source = { getRandomValues: (bytes) => bytes.fill(0) };
  const ids = Array.from({ length: 100 }, () => localId(source));
  assert.equal(new Set(ids).size, 100);
  assert.ok(ids.every((id) => typeof id === 'string' && id.startsWith('local-')));
  assert.ok(localId(null).startsWith('local-'));
});
