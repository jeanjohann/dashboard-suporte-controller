/** Regressão do recorte extraído da página: período por operadora, combinação de campos e elegibilidade. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { consumptionPeriods, selectConsumptionRows } from './consumptionFilters.js';
import { periodKey, VOLUME_SCALE, consumptionSummary } from './lineConsumption.js';

const row = (id, amount, overrides = {}) => ({
  id,
  operator: 'Arqia',
  iccid: '08955180567030520851' + id,
  number: '00551191379562' + id,
  service: 'dados',
  start: '2026-09-01',
  end: '2026-09-28',
  days: 28,
  ticks: amount * VOLUME_SCALE,
  plan: 'Plano A',
  client: 'Cliente A',
  ...overrides,
});

test('período mantém escolha existente por operadora e usa o mais recente quando ela deixa de existir', () => {
  const older = row('1', 0, { start: '2026-08-01', end: '2026-08-28' }),
    current = row('2', 20),
    other = row('3', 40, { operator: 'Kore' });
  const statements = [older, current, other].map((value) => ({
    operator: value.operator,
    periods: [{ ...value, key: periodKey(value) }],
  }));
  const periods = consumptionPeriods(statements, {
    periods: { Arqia: periodKey(older), Kore: 'inexistente' },
  });
  assert.equal(periods.Arqia, periodKey(older));
  assert.equal(periods.Kore, periodKey(other));
  assert.equal(consumptionPeriods(statements, {}).Arqia, periodKey(current));
  assert.deepEqual(consumptionPeriods([], {}), {});
});

test('seleção combina múltiplos valores, busca/limite estrito e mantém a base de referência intacta', () => {
  const rows = Object.freeze(
    [
      row('1', 20),
      row('2', 40, { plan: 'Plano B', attention: true, link: { plate: 'ABC1D23' } }),
      row('3', 80, { client: 'Outro cliente' }),
      row('4', 0),
      row('5', 120, { service: 'sms' }),
      row('6', 100, { duplicate: true }),
      row('7', 50, { start: '2026-08-01', end: '2026-08-28' }),
      row('8', 30, { client: '' }),
    ].map(Object.freeze),
  );
  const periods = { Arqia: periodKey(rows[0]) },
    before = consumptionSummary(rows).ticks;
  assert.deepEqual(
    selectConsumptionRows(
      rows,
      periods,
      { client: ['Cliente A'], plan: ['Plano A', 'Plano B'], minimumMB: '20' },
      '',
    ),
    [rows[1]],
  );
  assert.deepEqual(selectConsumptionRows(rows, periods, { consumption: 'attention' }, 'abc1d23'), [
    rows[1],
  ]);
  assert.deepEqual(selectConsumptionRows(rows, periods, { consumption: 'zero' }, ''), [rows[3]]);
  assert.deepEqual(selectConsumptionRows(rows, periods, { client: ['Não informado'] }, ''), [
    rows[7],
  ]);
  assert.ok(selectConsumptionRows(rows, periods, {}, '').includes(rows[5]));
  assert.ok(!selectConsumptionRows(rows, periods, { minimumMB: '0' }, '').includes(rows[5]));
  assert.deepEqual(selectConsumptionRows(rows, periods, { minimumMB: 'incompatível' }, ''), []);
  assert.equal(consumptionSummary(rows).ticks, before);
});
