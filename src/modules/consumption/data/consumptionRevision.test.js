import test from 'node:test';
import assert from 'node:assert/strict';
import { nextConsumptionRevision } from './consumptionHistory.js';
test('revisão local impede gravação atrasada sem importar a revisão de outro navegador', () => {
  assert.equal(nextConsumptionRevision(0, 0), 1);
  assert.equal(nextConsumptionRevision(2, 2), 3);
  assert.throws(() => nextConsumptionRevision(1, 2), /Outra aba/);
  for (const [a, b] of [
    [-1, 0],
    [0, -1],
    [0, NaN],
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ])
    assert.throws(() => nextConsumptionRevision(a, b));
});
