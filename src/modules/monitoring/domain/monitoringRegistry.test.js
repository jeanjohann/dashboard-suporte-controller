import test from 'node:test';
import assert from 'node:assert/strict';
import {
  registryComparisons,
  reconcileMonitoringRegistry,
  registryExportRows,
} from './monitoringRegistry.js';

test('cadastro compara sete campos, usa equivalência explícita e não inventa campos ausentes da API', () => {
  const api = {
    clientId: 'base',
    clientName: 'Base teste',
    plate: 'ABC-1234',
    trackerId: '00144',
    deviceModel: 'MXT-130',
    prefix: '007',
    iccid: '00001234567890123456',
    msisdn: '5511999999999',
  };
  const op = {
    client: 'Empresa teste',
    plate: 'abc1234',
    serial: '00144',
    model: 'MXT130',
    prefix: '007',
    iccid: api.iccid,
    phone: '+55 (11) 99999-9999',
  };
  assert.equal(registryComparisons(api, op).filter((r) => r.state === 'different').length, 1);
  assert.ok(registryComparisons(api, op, { base: op.client }).every((r) => r.state === 'equal'));
  const snapshot = {
    vehicles: [{ ...api, prefix: null, iccid: null, msisdn: null }],
    referenceAt: '2026-10-24T15:00:00Z',
    collections: [{ at: '2026-10-24T15:00:00Z', ok: true }],
  };
  const report = reconcileMonitoringRegistry(snapshot, { rows: [op] }, { base: op.client });
  assert.equal(report.rows[0].state, 'Compatível nos campos comparados');
  assert.deepEqual(report.missingApiFields, ['prefix', 'iccid', 'msisdn']);
  const exported = registryExportRows(report);
  assert.equal(exported[0].length, exported[1].length);
  assert.equal(JSON.parse(exported[1].at(-1)).length, 7);
  const differing = registryComparisons(api, { ...op, iccid: '999' }, { base: op.client });
  assert.equal(differing.find((r) => r.field === 'ICCID').state, 'different');
});
