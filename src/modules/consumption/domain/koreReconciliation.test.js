import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileKoreCycle } from './koreReconciliation.js';
import { koreStatementText } from './carrierWorkspace.js';
import { VOLUME_SCALE } from './lineConsumption.js';
const period = { start: '2026-10-01', end: '2026-10-24', confirmed: true };
const snapshot = {
  complete: true,
  readAt: '2026-10-24T12:00:00Z',
  rows: [{ id: '1', iccid: '001', number: '005511111111', bytes: 1234567 }],
};
const file = {
  id: 'csv',
  filename: 'Extrato fictício.csv',
  text: koreStatementText(snapshot, period),
};
test('conferência exata não homologa ciclo por igualdade nem soma API e CSV', () => {
  const report = reconcileKoreCycle(snapshot, { ...period, confirmed: false }, file);
  assert.equal(report.equal, 1);
  assert.equal(report.compared, 1);
  assert.match(report.status, /Prévia/);
  assert.equal(report.totalApi, report.totalCsv);
  const different = reconcileKoreCycle(
    { ...snapshot, rows: [{ ...snapshot.rows[0], bytes: 2234567 }] },
    period,
    file,
  );
  assert.equal(different.details[0].difference, VOLUME_SCALE);
  const mismatch = reconcileKoreCycle(
    { ...snapshot, rows: [{ ...snapshot.rows[0], number: '999' }] },
    period,
    file,
  );
  assert.equal(mismatch.compared, 0);
  assert.match(mismatch.details[0].state, /MSISDN/);
});
test('coleta incompleta, ciclo distinto e referência gerada pela própria API são recusados', () => {
  assert.throws(() => reconcileKoreCycle({ ...snapshot, complete: false }, period, file));
  assert.throws(
    () => reconcileKoreCycle(snapshot, { ...period, end: '2026-10-23' }, file),
    /datas exatas/,
  );
  assert.throws(
    () => reconcileKoreCycle(snapshot, period, { ...file, origin: 'kore-api' }),
    /independente/,
  );
  const ambiguous = reconcileKoreCycle(
    { ...snapshot, rows: [...snapshot.rows, ...snapshot.rows] },
    period,
    file,
  );
  assert.equal(ambiguous.compared, 0);
  assert.equal(ambiguous.details[0].state, 'ICCID ambíguo');
});
