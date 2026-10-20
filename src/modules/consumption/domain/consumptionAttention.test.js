import test from 'node:test';
import assert from 'node:assert/strict';
import { consumptionAttention } from './consumptionAttention.js';
import { VOLUME_SCALE } from './lineConsumption.js';
const row = (id, start, end, daily, extra = {}) => {
  const days = (Date.parse(end) - Date.parse(start)) / 86400000 + 1;
  return {
    id,
    operator: 'Arqia',
    iccid: '089551805670305208511',
    number: '005511913795621',
    service: 'dados',
    start,
    end,
    days,
    ticks: days * daily * VOLUME_SCALE,
    ...extra,
  };
};
test('compara MB por dia do mesmo chip/operadora e mantém ambas as origens; períodos de tamanhos distintos não inflam o resultado', () => {
  const a = row('a', '2026-08-01', '2026-08-31', 2),
    b = row('b', '2026-09-01', '2026-09-15', 4);
  const result = consumptionAttention([a, b], [b]);
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].rank, 100);
  assert.equal(result.findings[0].previous, a);
  assert.equal(result.findings[0].row, b);
  assert.equal(
    consumptionAttention([a, b], [b], { increase: 150, minimumDailyMB: 0 }).findings.length,
    0,
  );
  assert.equal(
    consumptionAttention([a, b], [b], { increase: 50, minimumDailyMB: 5 }).findings.length,
    0,
  );
});
test('não compara operadoras/chips distintos, períodos sobrepostos, referência zero ou apuração ambígua', () => {
  const a = row('a', '2026-08-01', '2026-08-31', 1),
    b = row('b', '2026-09-01', '2026-09-30', 10);
  for (const before of [
    { ...a, operator: 'Kore' },
    { ...a, iccid: '123456789012345678' },
    { ...a, ticks: 0 },
    { ...a, duplicate: true },
    row('a', '2026-08-15', '2026-09-15', 1),
  ])
    assert.equal(consumptionAttention([before, b], [b]).findings.length, 0);
  assert.equal(consumptionAttention([a, { ...a, id: 'outro-arquivo' }, b], [b]).findings.length, 0);
  const older = row('older', '2026-07-01', '2026-07-31', 1);
  assert.equal(
    consumptionAttention([older, a, { ...a, id: 'ambiguous' }, b], [b]).findings.length,
    0,
  );
  assert.equal(
    consumptionAttention([a, { ...b, days: 1 }], [{ ...b, days: 1 }]).findings.length,
    0,
  );
});
