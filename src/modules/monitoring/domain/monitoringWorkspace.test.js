import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { monitorSnapshot, monitoringIndicator } from './monitoring.js';
import { filterMonitoringQueue } from './monitoringAnalytics.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from './monitoringReport.js';
import {
  reconcileMonitoringRegistry,
  registryStates,
  registryExportRows,
} from './monitoringRegistry.js';

const at = '2026-10-22T12:00:00Z';
const snapshot = (hours) => ({
  schemaVersion: 1,
  complete: true,
  referenceAt: at,
  collections: [{ clientId: 'base', at, ok: true }],
  vehicles: hours.map((h, i) => ({
    clientId: 'base',
    clientName: 'cliente teste',
    vehicleId: String(i),
    trackerId: '144' + String(i).padStart(6, '0'),
    plate: 'ABC1D23',
    deviceModel: 'MXT-130',
    lastRecordAt: h == null ? null : new Date(Date.parse(at) - h * 3600000).toISOString(),
  })),
});
test('30/60/90 dias são inclusivos, faixas exclusivas e ausência permanece neutra', () => {
  const source = snapshot([48, 72, 96, 719.99, 720, 1439.99, 1440, 2159.99, 2160, null]);
  const result = monitorSnapshot(source, { threshold: 720 });
  assert.deepEqual(
    result.buckets.map((row) => row.value),
    [1, 1, 2, 2, 2, 1],
  );
  assert.equal(result.totals.delayed, 5);
  assert.equal(monitorSnapshot(source, { threshold: 1440 }).totals.delayed, 3);
  assert.equal(monitorSnapshot(source, { threshold: 2160 }).totals.delayed, 1);
  assert.equal(filterMonitoringQueue(result, { focus: 'days90' }).rows.length, 1);
  assert.equal(filterMonitoringQueue(result, { focus: 'days30' }).rows.length, 5);
  assert.equal(monitoringIndicator(result.rows.find((row) => row.hours === 2160)).tone, 'extreme');
  assert.equal(monitoringIndicator(result.rows.find((row) => row.hours === null)).tone, 'unknown');
  const stale = monitorSnapshot({ ...source, collections: [{ clientId: 'base', at, ok: false }] });
  assert.equal(filterMonitoringQueue(stale, { focus: 'days90' }).rows.length, 0);
});

test('CSV da grade é retangular; XLSX inclui todo o recorte, zeros, IDs como texto e filtros', () => {
  const source = snapshot(Array.from({ length: 1800 }, () => 720));
  source.vehicles[0].trackerId = '001440001';
  source.vehicles[0].supplyVoltageV = 0;
  source.vehicles[0].positions24h = 0;
  const filters = { threshold: 720, search: 'ABC1D23' };
  const tables = monitoringReport(
    filterMonitoringQueue(monitorSnapshot(source, filters), filters),
    filters,
  );
  const body = monitoringCsv(tables, { vehiclesOnly: true });
  const csvBook = XLSX.read(body, { type: 'string', raw: true, FS: ';' });
  const csvRows = XLSX.utils.sheet_to_json(csvBook.Sheets[csvBook.SheetNames[0]], { header: 1 });
  assert.equal(csvRows.length, 1801);
  assert(csvRows.every((row) => row.length === tables.vehicles[0].length));
  const book = XLSX.read(monitoringWorkbook(tables), { type: 'array', cellNF: true });
  assert.equal(book.Sheets['Veículos'].E2.t, 's');
  assert.equal(book.Sheets['Veículos'].E2.v, '001440001');
  assert.equal(book.Sheets['Veículos'].F2.v, 0);
  assert.equal(book.Sheets['Veículos'].R2.v, 0);
  assert.equal(book.Sheets['Veículos'].X2.v, 720);
  assert.equal(book.Sheets['Veículos'].Y2.v, JSON.stringify(filters));
  assert.equal(book.Sheets['Modelos'].E2.z, '0.0%');
  assert.equal(book.Sheets['Veículos']['!autofilter'].ref, 'A1:Y1801');
  assert.match(body, /CLIENTE TESTE/);
});

const op = (
  serial,
  plate = 'ABC-1D23',
  client = 'CLIENTE TESTE',
  model = 'MXT-130',
  sourceRow = 2,
) => ({ serial, plate, client, model, sourceRow, status: 'Ativo', cells: [] });
test('conferência usa somente serial único e preserva origens, ausências e duplicatas', () => {
  const source = snapshot([12, 12, 12, 12]);
  source.vehicles[1].plate = 'OUT0001';
  const operational = {
    rows: [
      op(source.vehicles[0].trackerId),
      op(source.vehicles[1].trackerId),
      op('999999'),
      op(source.vehicles[2].trackerId),
      op(source.vehicles[2].trackerId, 'ABC1D23', 'Outro', 'MXT-162', 3),
      op(''),
    ],
  };
  const before = JSON.stringify([source, operational]);
  const result = reconcileMonitoringRegistry(source, operational);
  assert.equal(result.counts[registryStates[0]], 1);
  assert.equal(result.counts[registryStates[1]], 1);
  assert.equal(result.counts[registryStates[2]], 1);
  assert.equal(result.counts[registryStates[3]], 1);
  assert.equal(result.counts[registryStates[4]], 1);
  assert.equal(result.counts[registryStates[5]], 1);
  assert.equal(result.rows.find((row) => row.state === registryStates[2]).operational.length, 2);
  assert.equal(JSON.stringify([source, operational]), before);
  assert.equal(registryExportRows(result).length, result.rows.length + 1);
  assert.equal(result.stale, false);
  const old = reconcileMonitoringRegistry(
    { ...source, collections: [{ clientId: 'base', at: '2026-10-22T10:00:00Z', ok: true }] },
    operational,
  );
  assert.equal(old.stale, true);
  assert.equal(old.collectionAt, '2026-10-22T10:00:00Z');
  assert.throws(() => reconcileMonitoringRegistry({ ...source, demonstration: true }, operational));
});

test('serial operacional impreciso e erro no Excel não criam vínculo; nomes diferentes exigem conferência', () => {
  const source = snapshot([12]);
  const row = op(source.vehicles[0].trackerId, 'ABC1D23', 'Nome legal diferente');
  const result = reconcileMonitoringRegistry(source, { rows: [row] });
  assert.equal(result.rows[0].state, registryStates[1]);
  assert.match(result.rows[0].issues[0], /Cliente\/base/);
  row.cells[59] = { raw: 14400000000000000, error: false }; // BH no layout legado
  assert.equal(reconcileMonitoringRegistry(source, { rows: [row] }).counts[registryStates[5]], 1);
  row.cells[59] = { raw: row.serial, error: true };
  assert.equal(reconcileMonitoringRegistry(source, { rows: [row] }).counts[registryStates[5]], 1);
});
