import test from 'node:test';
import assert from 'node:assert/strict';
import { latestConsumptionNotes } from './consumptionFollowup.js';
import { chipKey } from './lineConsumption.js';

test('última ação usa data, desempate por registro e separa operadora e ICCID', () => {
  const notes = [
    { operator: 'Arqia', iccid: '001', date: '2026-10-14', status: 'Investigar' },
    { operator: 'Arqia', iccid: '001', date: '2026-10-13', status: 'Encerrado' },
    { operator: 'Arqia', iccid: '001', date: '2026-10-14', status: 'Acompanhar' },
    { operator: 'Kore', iccid: '001', date: '2026-10-14', status: 'Encerrado' },
    { operator: 'Arqia', iccid: '002', date: '2026-10-14', status: 'Ação realizada' },
  ];
  const latest = latestConsumptionNotes(notes);
  assert.equal(latest.size, 3);
  assert.equal(latest.get(chipKey(notes[0])), notes[2]);
  assert.equal(latest.get(chipKey(notes[3])), notes[3]);
  assert.equal(latest.get(chipKey(notes[4])), notes[4]);
  assert.equal(notes.length, 5);
});
