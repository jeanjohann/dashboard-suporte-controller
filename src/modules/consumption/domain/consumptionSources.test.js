import test from 'node:test';
import assert from 'node:assert/strict';
import { planConsumptionSources, sourcePlanTotal } from './consumptionSources.js';
const snapshot = (overrides = {}) => ({
  kind: 'api',
  id: 'one',
  operator: 'Arqia',
  connectionKey: 'integration',
  accountKey: 'account',
  periodBasis: 'validated-days',
  start: '2026-10-01',
  end: '2026-10-15',
  observedAt: '2026-10-17T10:00:00Z',
  complete: true,
  rows: [{ iccid: '001', number: '002', ticks: 100 }],
  ...overrides,
});
test('resposta repetida e acumulado revisado não duplicam consumo nem modificam as entradas', () => {
  const first = snapshot(),
    revised = snapshot({
      id: 'two',
      observedAt: '2026-10-17T11:00:00Z',
      rows: [{ iccid: '001', number: '002', ticks: 120 }],
    });
  const original = JSON.stringify([first, revised]);
  assert.equal(sourcePlanTotal(planConsumptionSources([first, first])), 100);
  assert.equal(sourcePlanTotal(planConsumptionSources([first, revised])), 120);
  assert.equal(JSON.stringify([first, revised]), original);
});
test('CSV/API exigem escolha explícita; contas e períodos sobrepostos não são mesclados silenciosamente', () => {
  const api = snapshot(),
    csv = snapshot({ kind: 'csv', id: 'csv', connectionKey: 'file' });
  let plan = planConsumptionSources([api, csv]);
  assert.equal(sourcePlanTotal(plan), null);
  plan = planConsumptionSources([api, csv], { [plan.groups[0].key]: 'csv' });
  assert.equal(sourcePlanTotal(plan), 100);
  assert.equal(plan.selected[0].kind, 'csv');
  assert.equal(
    sourcePlanTotal(
      planConsumptionSources([
        api,
        snapshot({ id: 'overlap', start: '2026-10-10', end: '2026-10-20' }),
      ]),
    ),
    null,
  );
  assert.equal(
    planConsumptionSources([api, snapshot({ id: 'account2', accountKey: 'other' })]).groups.length,
    2,
  );
  assert.equal(
    sourcePlanTotal(
      planConsumptionSources([
        api,
        snapshot({ id: 'timezone', periodBasis: 'outra-base-temporal' }),
      ]),
    ),
    null,
  );
});
test('parcial ou inválido conserva a última completa; erro sem base anterior não é zero', () => {
  const invalid = snapshot({ id: 'bad', complete: false });
  assert.equal(sourcePlanTotal(planConsumptionSources([snapshot(), invalid])), 100);
  assert.equal(sourcePlanTotal(planConsumptionSources([invalid])), null);
  for (const value of [null, -1, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(
      planConsumptionSources([snapshot({ rows: [{ iccid: '001', number: '002', ticks: value }] })])
        .invalid.length,
      1,
    );
  assert.equal(
    sourcePlanTotal(
      planConsumptionSources([snapshot({ rows: [{ iccid: '001', number: '002', ticks: 0 }] })]),
    ),
    0,
  );
  assert.throws(
    () => planConsumptionSources([snapshot(), snapshot({ rows: [] })]),
    /identificador/,
  );
});
test('revisões conflitantes no mesmo instante e identificadores repetidos exigem revisão', () => {
  const alternative = snapshot({
    id: 'other',
    observedAt: '2026-10-17T07:00:00-03:00',
    rows: [{ iccid: '001', number: '002', ticks: 90 }],
  });
  assert.equal(sourcePlanTotal(planConsumptionSources([snapshot(), alternative])), null);
  const value = snapshot();
  value.rows.push({ ...value.rows[0] });
  assert.equal(planConsumptionSources([value]).invalid.length, 1);
});
