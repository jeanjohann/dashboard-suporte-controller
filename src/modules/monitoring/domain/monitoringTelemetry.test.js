/** Valida cobertura, zeros, coleta antiga, filtros e exportação com telemetria inteiramente fictícia. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { monitoringDemo } from '../data/demo.js';
import { monitorSnapshot } from './monitoring.js';
import { monitoringTelemetry } from './monitoringTelemetry.js';
import { filterMonitoringQueue } from './monitoringAnalytics.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from './monitoringReport.js';
import XLSX from 'xlsx';

function fixture() {
  const data = monitoringDemo();
  data.vehicles = data.vehicles.slice(0, 4).map((row, i) => ({
    ...row,
    clientId: 'demo-0',
    deviceModel: i === 3 ? null : i < 2 ? 'MXT-130' : 'MXT-160',
    positions24h: [0, 100, null, 300][i],
    externalPowerFailure: [true, false, null, false][i],
    batteryState: [6, 2, null, 3][i],
  }));
  return data;
}
test('telemetria separa ausência de zero e usa a cobertura correta nas médias e grupos', () => {
  const result = monitorSnapshot(fixture());
  const data = monitoringTelemetry(result);
  assert.equal(data.positionsTotal, 400);
  assert.equal(data.positionsAverage, 400 / 3);
  assert.equal(data.positionsReadings, 3);
  assert.equal(data.positionsZero, 1);
  assert.equal(data.positionsActive, 2);
  assert.equal(data.powerReadings, 3);
  assert.equal(data.externalFailure, 1);
  assert.equal(data.batteryLow, 1);
  assert.equal(data.batteryFailure, 1);
  assert.equal(data.batteryDischarging, 1);
  assert.equal(data.models.length, 3);
  assert.equal(data.models.find((row) => row.id === '').fleet, 1);
  assert.equal(
    data.batteryStates.reduce((sum, row) => sum + row.value, 0),
    4,
  );
  assert.equal(data.bases[0].positionsTotal, 400);
});
test('coleta indisponível preserva inventário, exclui sinais técnicos e mantém totais ausentes', () => {
  const input = fixture();
  input.collections.forEach((row) => (row.ok = false));
  const result = monitorSnapshot(input);
  const data = monitoringTelemetry(result);
  assert.equal(data.fleet, 4);
  assert.equal(data.models.length, 3);
  assert.equal(data.positionsTotal, null);
  assert.equal(data.positionsAverage, null);
  assert.equal(data.positionsZero, null);
  assert.equal(data.externalFailure, null);
  assert.equal(data.powerUnknown, 4);
  assert.equal(data.batteryStates.at(-1).value, 4);
  assert.equal(filterMonitoringQueue(result, { focus: 'external-power' }).rows.length, 0);
  assert.equal(filterMonitoringQueue(result, { focus: 'positions-zero' }).rows.length, 0);
});
test('recortes técnicos abrem exatamente os veículos contados, sem alterar o total analítico', () => {
  const input = fixture();
  const result = monitorSnapshot(input);
  for (const [focus, total] of [
    ['external-power', 1],
    ['battery-low', 1],
    ['battery-failure', 1],
    ['battery-discharging', 1],
    ['positions-active', 2],
    ['positions-zero', 1],
    ['power-unknown', 1],
  ])
    assert.equal(filterMonitoringQueue(result, { focus }).rows.length, total);
  const queue = filterMonitoringQueue(result, { search: 'MXT-130' });
  assert.equal(queue.rows.length, 2);
  assert.equal(monitoringTelemetry(queue).positionsTotal, 400);
  const model = monitorSnapshot(input, { models: ['MXT-130'] });
  assert.equal(model.totals.fleet, 2);
  assert.equal(monitoringTelemetry(model).positionsTotal, 100);
  assert.equal(monitorSnapshot(input, { models: [''] }).totals.fleet, 1);
});
test('soma insegura não é arredondada, e recorte vazio não inventa médias ou sinais', () => {
  const input = fixture();
  input.vehicles.forEach((row) => (row.positions24h = Number.MAX_SAFE_INTEGER));
  assert.equal(monitoringTelemetry(monitorSnapshot(input)).positionsTotal, null);
  const empty = monitoringTelemetry(monitorSnapshot(input, { clients: ['ausente'] }));
  assert.equal(empty.positionsTotal, null);
  assert.equal(empty.batteryLow, null);
  assert.equal(empty.models.length, 0);
});
test('exportação mantém agregados de todas as bases/modelos do recorte analítico, mesmo com busca na fila', () => {
  const result = filterMonitoringQueue(monitorSnapshot(fixture()), { search: '1001' });
  const tables = monitoringReport(result, {});
  assert.equal(tables.vehicles.length, 2);
  assert.equal(tables.positions[1][5], 400);
  assert.match(monitoringCsv(tables), /Equipamentos por modelo/);
  const book = XLSX.read(monitoringWorkbook(tables), { type: 'array' });
  for (const name of ['Alimentação por base', 'Posições por base', 'Modelos'])
    assert.ok(book.SheetNames.includes(name));
});
