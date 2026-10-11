/** Testes dos limites, qualidade da coleta e relatórios, sem credenciais ou acesso à API. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { monitoringDemo } from '../data/demo.js';
import { monitorSnapshot, monitoringInstant, vehicleKey } from './monitoring.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from './monitoringReport.js';

test('limites em horas são inclusivos e faixas exclusivas; ausência não vira zero', () => {
  const snapshot = monitoringDemo(),
    result = monitorSnapshot(snapshot);
  assert.equal(result.totals.fleet, 12);
  assert.equal(result.totals.delayed, 6);
  assert.equal(result.totals.critical, 2);
  assert.equal(result.totals.missing, 1);
  assert.equal(result.totals.percentage, 50);
  assert.deepEqual(
    result.buckets.map((item) => item.value),
    [2, 2, 2],
  );
  assert.equal(monitorSnapshot(snapshot, { threshold: 72 }).totals.delayed, 4);
  assert.equal(monitorSnapshot(snapshot, { threshold: 96 }).totals.delayed, 2);
  const source = snapshot.vehicles.find((row) => row.lastRecordAt == null);
  assert.equal(result.rows.find((row) => row.key === vehicleKey(source)).hours, null);
});

test('mesma placa em bases diferentes não colide; duplicidade exclui todo grupo antes do filtro', () => {
  const snapshot = monitoringDemo();
  snapshot.vehicles[1].plate = snapshot.vehicles[0].plate;
  assert.equal(monitorSnapshot(snapshot).totals.fleet, 12);
  snapshot.vehicles.push({ ...snapshot.vehicles[0] });
  const result = monitorSnapshot(snapshot, { clients: ['demo-0'] });
  assert.equal(result.totals.fleet, 3);
  assert.equal(result.issues.length, 2);
});

test('falha de coleta preserva duração conhecida e não confirma alerta novo', () => {
  const snapshot = monitoringDemo();
  snapshot.collections[0].ok = false;
  const result = monitorSnapshot(snapshot, { clients: ['demo-0'] });
  assert.equal(result.totals.stale, 4);
  assert.equal(result.totals.delayed, 0);
  assert.equal(result.rows[0].hours, 150);
  snapshot.collections[0] = { clientId: 'demo-0', at: '2026-10-11T08:00:00-03:00', ok: true };
  assert.equal(monitorSnapshot(snapshot, { clients: ['demo-0'] }).totals.stale, 4);
});

test('datas sem fuso, impossíveis ou futuras não produzem zero nem alerta', () => {
  assert.equal(monitoringInstant('2026-10-11T10:00:00'), null);
  assert.equal(monitoringInstant('2026-02-30T10:00:00Z'), null);
  assert.equal(monitoringInstant('2026-10-11T10:00:00-03:00'), Date.parse('2026-10-11T13:00:00Z'));
  const snapshot = monitoringDemo();
  snapshot.vehicles[0].lastRecordAt = '2026-10-12T10:00:00Z';
  snapshot.vehicles[1].lastRecordAt = 'data incompatível';
  assert.equal(monitorSnapshot(snapshot).totals.invalid, 2);
  assert.equal(monitorSnapshot(snapshot).totals.delayed, 4);
  assert.throws(() => monitorSnapshot({ ...snapshot, referenceAt: 'errado' }));
});

test('situação filtra tabela mas conserva base percentual; XLSX/CSV identifica demonstração e notas', () => {
  const snapshot = monitoringDemo(),
    filters = { clients: ['demo-0'], threshold: 48, state: 'delayed' };
  const result = monitorSnapshot(snapshot, filters);
  assert.equal(result.rows.length, 2);
  assert.equal(result.totals.fleet, 4);
  assert.equal(result.totals.percentage, 50);
  const key = result.rows[0].key;
  const tables = monitoringReport(result, filters, {
    [key]: { status: 'Acompanhamento encerrado', owner: 'Equipe suporte', text: '=1+1' },
  });
  assert.equal(result.rows[0].state, 'delayed');
  assert.match(monitoringCsv(tables), /DADOS FICTÍCIOS/);
  assert.match(monitoringCsv(tables), /'=1\+1/);
  const book = XLSX.read(monitoringWorkbook(tables), { type: 'array' });
  assert.equal(book.Sheets['Veículos'].L2.t, 's');
  assert.equal(book.Sheets['Veículos'].L2.v, '=1+1');
  assert.equal(book.Sheets['Resumo por base'].E2.v, 0.5);
  assert.equal(book.Sheets['Veículos'].G2.t, 'n');
});
