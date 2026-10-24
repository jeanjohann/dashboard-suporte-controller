import test from 'node:test';
import assert from 'node:assert/strict';
import { carrierArchive, restoreCarrierArchive, koreStatementText } from './carrierWorkspace.js';
import { attachFieldEvidence } from './consumptionFieldLink.js';
import {
  importLineStatement,
  mergeHistoryFiles,
  historyStatements,
  consumptionSummary,
  VOLUME_SCALE,
} from './lineConsumption.js';
import { emptyHistory, fileDigest, validateBackup } from '../data/consumptionHistory.js';
const period = { start: '2026-10-01', end: '2026-10-24', confirmed: true };
const snapshot = {
  complete: true,
  readAt: '2026-10-24T12:00:00Z',
  rows: [{ id: '1', bytes: 1234567, iccid: '00123456789012345678', number: '0055111111111' }],
};
const arqia = {
  id: 'arqia',
  filename: 'Arqia.csv',
  text: 'ICCID;MSISDN;Período Início;Período Término;Consumo (MB)\n00223456789012345678;0055222222222;01/10/2026;24/10/2026;1',
  importedAt: '2026-10-24T12:00:00Z',
};
test('API KORE exige coleta completa e datas confirmadas; bytes não são somados outra vez com CSV', () => {
  assert.throws(() => koreStatementText({ ...snapshot, complete: false }, period));
  assert.throws(() => koreStatementText(snapshot, { ...period, confirmed: false }));
  const text = koreStatementText(snapshot, period),
    parsed = importLineStatement(text, 'API.csv', 'kore');
  assert.equal(parsed.operator, 'Kore');
  assert.equal(consumptionSummary(parsed.rows).ticks / VOLUME_SCALE, 1.234567);
  assert.equal(parsed.rows[0].iccid, snapshot.rows[0].iccid);
  const file = { id: 'one', text, filename: 'API.csv' };
  const next = mergeHistoryFiles(
    [file],
    [{ ...file, id: 'two', text: text.replace('1,234567', '2,234567') }],
  );
  assert.equal(historyStatements(next).length, 1);
});
test('backup por operadora preserva a outra base, suas notas e referência operacional', async () => {
  const text = koreStatementText(snapshot, period),
    kore = {
      id: await fileDigest(text),
      text,
      filename: 'KORE-API.csv',
      importedAt: snapshot.readAt,
      origin: 'kore-api',
      apiReadAt: snapshot.readAt,
    };
  const original = {
    ...emptyHistory(),
    files: [arqia, kore],
    notes: [{ operator: 'Arqia', id: 'note' }],
    operational: { filename: 'Preservar' },
  };
  const scoped = carrierArchive(original, 'Kore');
  assert.equal(scoped.files.length, 1);
  assert.equal(scoped.notes.length, 0);
  const restored = restoreCarrierArchive(
    original,
    { ...scoped, files: [], operational: { filename: 'Não usar' } },
    'Kore',
  );
  assert.deepEqual(restored.files, [arqia]);
  assert.deepEqual(restored.notes, original.notes);
  assert.equal(restored.operational.filename, 'Preservar');
  const roundtrip = await validateBackup(JSON.stringify({ ...emptyHistory(), files: [kore] }));
  assert.equal(roundtrip.files[0].origin, 'kore-api');
  assert.equal(roundtrip.files[0].apiReadAt, snapshot.readAt);
});
test('API de campo só confirma o chip com ICCID/número conjuntos e coleta recente; conflito não ganha vínculo', () => {
  const ref = Date.parse('2026-10-24T12:00:00Z');
  const api = {
    referenceAt: new Date(ref).toISOString(),
    collections: [{ clientId: 'base', ok: true, at: new Date(ref).toISOString() }],
    vehicles: [
      {
        clientId: 'base',
        clientName: 'Cliente',
        vehicleId: 'v',
        trackerId: '144001',
        iccid: '001',
        msisdn: '002',
        plate: 'TST0001',
        deviceModel: 'MXT-130',
      },
    ],
  };
  const row = { iccid: '001', number: '002', link: null };
  assert.equal(attachFieldEvidence([row], api, ref)[0].serial, '144001');
  const conflict = attachFieldEvidence([{ ...row, link: { serial: '144002' } }], api, ref)[0];
  assert.equal(conflict.link, null);
  assert.match(conflict.linkState, /Conflito/);
  assert.equal(attachFieldEvidence([row], api, ref + 7200000)[0].link, null);
  assert.equal(attachFieldEvidence([{ ...row, number: '003' }], api, ref)[0].link, null);
});
