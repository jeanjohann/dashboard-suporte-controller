import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowanceFromDraft,
  sharedAllowanceReports,
  validateAllowances,
} from './sharedAllowance.js';
import { VOLUME_SCALE } from './lineConsumption.js';
import { emptyHistory, validateBackup } from '../data/consumptionHistory.js';
import { carrierArchive, restoreCarrierArchive } from './carrierWorkspace.js';
const pool = () =>
  allowanceFromDraft(
    {
      operator: 'Kore',
      name: 'Contrato fictício',
      start: '2026-10-01',
      end: '2026-10-24',
      capacityMB: '10',
      members: '001\n002',
    },
    'pool',
  );
const row = (iccid, mb) => ({
  operator: 'Kore',
  iccid,
  number: '5511999999',
  service: 'dados',
  start: '2026-10-01',
  end: '2026-10-24',
  days: 24,
  ticks: mb * VOLUME_SCALE,
});
test('franquia usa membros explícitos, ciclo exato e não reduz denominador por ausência ou outra operadora', () => {
  const pools = [pool()],
    rows = [
      row('001', 8),
      row('002', 4),
      row('003', 1000),
      { ...row('001', 2000), operator: 'Arqia' },
    ];
  const [complete] = sharedAllowanceReports(pools, rows);
  assert.equal(complete.consumedTicks, 12 * VOLUME_SCALE);
  assert.equal(complete.percentage, 120);
  assert.equal(complete.excessTicks, 2 * VOLUME_SCALE);
  assert.equal(complete.complete, true);
  const [partial] = sharedAllowanceReports(pools, [row('001', 8)]);
  assert.equal(partial.balanceTicks, null);
  assert.equal(partial.complete, false);
  assert.equal(partial.covered, 1);
  assert.equal(sharedAllowanceReports(pools, [])[0].consumedTicks, null);
  assert.equal(sharedAllowanceReports(pools, [row('001', 0), row('002', 0)])[0].consumedTicks, 0);
  assert.equal(
    sharedAllowanceReports(pools, [row('001', 8), row('001', 1)])[0].details[0].state,
    'Apuração ambígua',
  );
  assert.equal(
    sharedAllowanceReports(pools, [{ ...row('001', 8), end: '2026-10-23' }])[0].covered,
    0,
  );
});
test('contratos sobrepostos não contam o mesmo ICCID duas vezes e backup isola operadora sem perder grupos', async () => {
  const kore = pool(),
    arqia = { ...pool(), id: 'other', operator: 'Arqia' };
  assert.throws(() => validateAllowances([kore, { ...kore, id: 'repeat' }]), /sobrepostos/);
  assert.throws(() => validateAllowances([{ ...kore, members: ['001', '001'] }]));
  const current = { ...emptyHistory(), allowances: [kore, arqia] };
  const scoped = carrierArchive(current, 'Kore');
  assert.equal(scoped.allowances.length, 1);
  const restored = restoreCarrierArchive(
    current,
    { ...scoped, allowances: [{ ...kore, capacityTicks: 20 * VOLUME_SCALE }] },
    'Kore',
  );
  assert.equal(
    restored.allowances.find((p) => p.id === 'other').capacityTicks,
    arqia.capacityTicks,
  );
  assert.equal((await validateBackup(JSON.stringify(restored))).allowances.length, 2);
  assert.deepEqual((await validateBackup(JSON.stringify(emptyHistory()))).allowances, []);
});
