/** Regras de agenda e isolamento, sem fornecedor real nem uso de notificações. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { monitoringDemo } from '../data/demo.js';
import { monitorSnapshot, vehicleKey } from './monitoring.js';
import {
  changeReminder,
  reminderDueAt,
  reminderLocalDate,
  reminderOverdue,
  validateReminderDocument,
  reminderExportRows,
  matchesReminderRevision,
} from './monitoringReminders.js';
import { reminderScope } from '../data/reminderRepository.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from './monitoringReport.js';

const vehicle = {
  clientId: '0001',
  vehicleId: '000000017',
  plate: 'ABC-1234',
  clientName: 'Base A',
};
const at = '2026-10-19T12:00:00Z';
const draft = { localDate: '2026-10-20T15:00', note: 'Saída da manutenção' };
const schedule = () => changeReminder(null, vehicle, 'schedule', draft, at);

test('exclusão aceita agendas ativas ou encerradas e novo ciclo conserva revisão para recusar edição antiga', () => {
  for (const action of [null, 'complete', 'cancel']) {
    const first = schedule(),
      previous = action ? changeReminder(first, vehicle, action, {}, at) : first;
    const deleted = changeReminder(previous, vehicle, 'delete', {}, at);
    assert.equal(deleted.status, 'deleted');
    assert.equal(deleted.history.at(-1).action, 'delete');
    assert.equal(deleted.revision, previous.revision + 1);
    assert.equal(reminderOverdue(deleted, '2099-01-01T00:00:00Z'), false);
    assert.equal(validateReminderDocument({ version: 1, records: [deleted] }).records.length, 1);
    assert.throws(() => changeReminder(deleted, vehicle, 'delete', {}, at), /mudou/);
    assert.equal(matchesReminderRevision(deleted, 0, 'schedule'), true);
    const next = changeReminder(
      deleted,
      vehicle,
      'schedule',
      { ...draft, localDate: '2099-10-22T12:00' },
      at,
    );
    assert.equal(next.revision, deleted.revision + 1);
    assert.equal(matchesReminderRevision(next, first.revision, 'complete'), false);
  }
  assert.throws(() => changeReminder(null, vehicle, 'delete', {}, at), /mudou/);
});

test('agenda usa São Paulo explicitamente e rejeita datas normalizadas, ausentes e horários inválidos', () => {
  assert.equal(reminderDueAt('2026-10-20T15:00'), '2026-10-20T18:00:00.000Z');
  assert.equal(reminderLocalDate('2026-10-20T02:00:00Z'), '2026-10-19T23:00');
  for (const value of [
    '',
    null,
    '2026-02-30T15:00',
    '2026-10-20T24:00',
    '2026-10-20T12:60',
    '20/10/2026 15:00',
  ])
    assert.throws(() => reminderDueAt(value), /válid/);
  assert.equal(reminderLocalDate('inválida'), '');
});

test('só aceita agenda futura; vencimento é inclusivo e independe da telemetria', () => {
  for (const localDate of ['2026-10-19T09:00', '2026-10-19T08:59'])
    assert.throws(() => changeReminder(null, vehicle, 'schedule', { localDate }, at), /futuro/);
  const record = schedule();
  assert.equal(reminderOverdue(record, '2026-10-20T17:59:59Z'), false);
  assert.equal(reminderOverdue(record, '2026-10-20T18:00:00Z'), true);
  assert.equal(reminderOverdue(record, '2026-10-21T18:00:00Z'), true);
  assert.equal(record.vehicleId, '000000017');
});

test('um ativo por veículo: reagendamento, conferência, cancelamento e novo ciclo conservam o histórico', () => {
  const first = schedule();
  assert.throws(() => changeReminder(first, vehicle, 'schedule', draft, at), /mudou/);
  assert.throws(() => changeReminder(first, vehicle, 'reschedule', draft, at), /Altere/);
  const moved = changeReminder(
    first,
    vehicle,
    'reschedule',
    { ...draft, localDate: '2026-10-21T16:00' },
    at,
  );
  const done = changeReminder(
    moved,
    vehicle,
    'complete',
    { outcome: 'Cliente pediu nova revisão' },
    '2026-10-22T12:00:00Z',
  );
  assert.equal(done.status, 'completed');
  assert.equal(done.history.at(-1).outcome, 'Cliente pediu nova revisão');
  assert.equal(reminderOverdue(done, '2026-11-01T00:00:00Z'), false);
  assert.throws(() => changeReminder(done, vehicle, 'cancel', {}, at), /mudou/);
  const next = changeReminder(
    done,
    vehicle,
    'schedule',
    { ...draft, localDate: '2026-11-02T16:00' },
    '2026-11-01T12:00:00Z',
  );
  const cancelled = changeReminder(next, vehicle, 'cancel', {}, '2026-11-01T13:00:00Z');
  assert.deepEqual(
    cancelled.history.map((row) => row.action),
    ['schedule', 'reschedule', 'complete', 'schedule', 'cancel'],
  );
  assert.equal(cancelled.revision, 5);
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(first.history.length, 1);
  assert.equal(
    validateReminderDocument({ version: 1, records: [cancelled] }).records[0],
    cancelled,
  );
});

test('placa igual em outra base não recebe o mesmo lembrete, e usuários/modos possuem espaços separados', () => {
  const first = schedule();
  const other = { ...vehicle, clientId: '0002' };
  assert.notEqual(vehicleKey(other), first.key);
  assert.throws(() => changeReminder(first, other, 'complete', {}, at), /outro veículo/);
  const user = { email: 'Pessoa@Empresa.com' };
  assert.notEqual(reminderScope(user, true, true), reminderScope(user, true, false));
  assert.notEqual(
    reminderScope(user, true, false),
    reminderScope({ email: 'outra@empresa.com' }, true, false),
  );
  assert.equal(
    reminderScope(user, true, false),
    reminderScope({ email: ' pessoa@empresa.com ' }, true, false),
  );
  assert.throws(() => reminderScope(null, true, false), /Identidade/);
});

test('conteúdo incompatível ou corrompido nunca é aceito como agenda vazia', () => {
  const record = schedule();
  for (const document of [
    null,
    { version: 2, records: [] },
    { version: 1 },
    { version: 1, records: [record, record] },
    { version: 1, records: [{ ...record, dueAt: 'inválida' }] },
    { version: 1, records: [{ ...record, revision: 2 }] },
    { version: 1, records: [{ ...record, status: 'completed' }] },
    { version: 1, records: [{ ...record, note: 'texto alterado fora do histórico' }] },
  ])
    assert.throws(() => validateReminderDocument(document));
});

test('confirmação e dados novos do rastreador não alteram notas nem criam recuperação técnica', () => {
  const snapshot = monitoringDemo();
  const row = monitorSnapshot(snapshot).rows[0];
  const first = changeReminder(null, row, 'schedule', draft, at);
  const done = changeReminder(first, row, 'complete', {}, at);
  assert.equal(done.status, 'completed');
  assert.equal(done.state, undefined);
  assert.equal(done.lastRecordAt, undefined);
  assert.equal(first.status, 'scheduled');
  assert.deepEqual(monitorSnapshot(snapshot).rows[0], row);
});

test('CSV e XLSX incluem lembretes somente do recorte; CSV global conserva encerrados, IDs e proteção de fórmulas', () => {
  const result = monitorSnapshot(monitoringDemo());
  const row = result.rows[0];
  const first = changeReminder(null, row, 'schedule', { ...draft, note: '=1+1' }, at);
  const done = changeReminder(first, row, 'complete', { outcome: 'Conferido manualmente' }, at);
  const outside = schedule();
  const tables = monitoringReport(result, {}, {}, [done, outside]);
  assert.equal(tables.reminders.length, 3);
  assert.equal(tables.reminders[1][0], 'DEMONSTRAÇÃO — DADOS FICTÍCIOS');
  assert.match(monitoringCsv(tables), /Conferido manualmente/);
  assert.match(monitoringCsv(tables), /'=1\+1/);
  const book = XLSX.read(monitoringWorkbook(tables));
  assert.equal(book.Sheets.Lembretes.K3.v, 'Conferido manualmente');
  assert.equal(book.Sheets.Lembretes.J2.t, 's');
  assert.equal(reminderExportRows([outside])[1][3], '000000017');
  const empty = monitoringReport({ ...result, rows: [] }, {}, {}, [done]);
  assert.equal(empty.reminders.length, 1);
  const remote = monitoringReport({ ...result, demonstration: false }, {}, {}, [done], 'remote');
  assert.match(remote.context.find((row) => row[0] === 'Persistência')[1], /banco do sistema/);
  assert.doesNotMatch(
    remote.context.find((row) => row[0] === 'Persistência')[1],
    /somente neste navegador/,
  );
});
