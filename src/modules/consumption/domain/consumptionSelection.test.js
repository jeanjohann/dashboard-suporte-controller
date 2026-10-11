import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aboveConsumptionLimit, consumptionLimit } from './consumptionSelection.js';
import { VOLUME_SCALE } from './lineConsumption.js';

test('limite em MB mantém precisão e exige consumo estritamente acima em linha elegível', () => {
  const row = {
    service: 'dados',
    iccid: '089551805670305208517',
    number: '005511913795620',
    ticks: 100 * VOLUME_SCALE + VOLUME_SCALE / 1_000_000,
    days: 30,
    valid: true,
    problems: [],
  };
  assert.equal(consumptionLimit('100,000001'), row.ticks);
  assert.equal(consumptionLimit(''), null);
  assert.ok(Number.isNaN(consumptionLimit('-1')));
  assert.ok(Number.isNaN(consumptionLimit('1.0000001')));
  assert.equal(aboveConsumptionLimit(row, '100.000001'), false);
  assert.equal(aboveConsumptionLimit(row, '100'), true);
  assert.equal(aboveConsumptionLimit({ ...row, ticks: null }, '100'), false);
  assert.equal(aboveConsumptionLimit(row, ''), true);
});
