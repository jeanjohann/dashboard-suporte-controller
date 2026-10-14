/** Testes dos limites, qualidade da coleta e relatórios, sem credenciais ou acesso à API. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { monitoringDemo } from '../data/demo.js';
import {
  monitorSnapshot,
  monitoringInstant,
  vehicleKey,
  monitoringIndicator,
  monitoringVoltage,
  recordMonitoringUpdate,
  sortMonitoringRows,
} from './monitoring.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from './monitoringReport.js';

test('fila ordena todo o recorte antes de paginar, mantém ausências no fim e IDs longos como texto', () => {
  const rows = Array.from({ length: 205 }, (_, index) => ({
    key: String(index),
    hours: 204 - index,
    trackerId: '895518082703008' + String(index).padStart(5, '0'),
  }));
  rows.push({ key: 'missing', hours: null, trackerId: null });
  const ascending = sortMonitoringRows(rows, { key: 'hours', direction: 'asc' });
  assert.equal(ascending[0].hours, 0);
  assert.equal(ascending.slice(200, 210).length, 6);
  assert.equal(ascending.at(-1).key, 'missing');
  assert.equal(sortMonitoringRows(rows, { key: 'hours', direction: 'desc' }).at(-1).key, 'missing');
  assert.equal(rows[0].hours, 204);
  assert.equal(sortMonitoringRows(rows, null), rows);
  const identifiers = sortMonitoringRows(rows, { key: 'trackerId', direction: 'desc' });
  assert.equal(identifiers[0].key, '204');
  assert.equal(identifiers[1].key, '203');
  const dates = [
    { lastRecordAt: '2026-10-14T08:00:00-03:00' },
    { lastRecordAt: '2026-10-14T10:00:00Z' },
    { lastRecordAt: 'data inválida' },
  ];
  assert.equal(sortMonitoringRows(dates, { key: 'lastRecordAt', direction: 'asc' })[0], dates[1]);
  assert.equal(
    sortMonitoringRows(dates, { key: 'lastRecordAt', direction: 'desc' }).at(-1),
    dates[2],
  );
  const stages = sortMonitoringRows(
    [{ key: 'a' }, { key: 'b' }],
    { key: 'stage', direction: 'asc' },
    { b: { status: 'Em análise' } },
  );
  assert.equal(stages[0].key, 'b');
  const volts = [{ supplyVoltageV: 12.6 }, { supplyVoltageV: 0 }, { supplyVoltageV: null }];
  assert.equal(sortMonitoringRows(volts, { key: 'supplyVoltageV', direction: 'asc' })[0], volts[1]);
  assert.equal(
    sortMonitoringRows(volts, { key: 'supplyVoltageV', direction: 'desc' }).at(-1),
    volts[2],
  );
});

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
  const sheet = book.Sheets['Veículos'];
  const columns = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
  const at = (name) => sheet[XLSX.utils.encode_cell({ r: 1, c: columns.indexOf(name) })];
  assert.equal(at('Observações').t, 's');
  assert.equal(at('Observações').v, '=1+1');
  assert.equal(book.Sheets['Resumo por base'].E2.v, 0.5);
  assert.equal(at('Horas desde a atualização').t, 'n');
});

test('sinais respeitam limites sem arredondamento e neutralizam coleta antiga/datas ausentes', () => {
  const signal = (hours, state = 'delayed') => monitoringIndicator({ hours, state });
  assert.equal(signal(47.999, 'recent').tone, 'recent');
  assert.equal(signal(48).tone, 'attention');
  assert.equal(signal(71.999).tone, 'attention');
  assert.equal(signal(72, 'recent').tone, 'high');
  assert.equal(signal(96).tone, 'critical');
  assert.equal(signal(150, 'stale').tone, 'unknown');
  assert.equal(signal(null, 'missing').tone, 'unknown');
  assert.equal(signal(null, 'invalid').tone, 'unknown');
  assert.equal(monitoringVoltage(0), '0 V');
  assert.equal(monitoringVoltage(12.6), '12,6 V');
  assert.equal(monitoringVoltage(null), 'Não informado');
});

test('tratamento só muda após registro, conserva histórico e não altera classificação técnica', () => {
  const first = recordMonitoringUpdate(
    undefined,
    { status: 'Em análise', owner: 'Equipe suporte', text: 'Contato iniciado' },
    '2026-10-14T10:00:00-03:00',
  );
  const second = recordMonitoringUpdate(
    first,
    { status: 'Manutenção agendada', owner: 'Equipe suporte', text: 'Visita combinada' },
    '2026-10-14T11:00:00-03:00',
  );
  assert.equal(first.history.length, 1);
  assert.equal(first.status, 'Em análise');
  assert.equal(second.history.length, 2);
  assert.equal(second.status, 'Manutenção agendada');
  assert.equal(second.history[0].text, 'Contato iniciado');
  assert.throws(
    () => recordMonitoringUpdate(second, { status: second.status, owner: second.owner, text: '' }),
    /Altere/,
  );
  assert.throws(
    () => recordMonitoringUpdate(second, { status: 'Qualquer', text: 'Observação' }),
    /status/,
  );
  const snapshot = monitoringDemo(),
    result = monitorSnapshot(snapshot),
    key = result.rows[0].key;
  const closed = recordMonitoringUpdate(
    second,
    { status: 'Acompanhamento encerrado', owner: 'Equipe suporte', text: 'Ação encerrada' },
    '2026-10-14T12:00:00-03:00',
  );
  assert.equal(result.rows[0].state, 'delayed');
  const tables = monitoringReport(result, {}, { [key]: closed });
  assert.equal(tables.history.length, 4);
  assert.equal(
    tables.vehicles[1][tables.vehicles[0].indexOf('Alimentação (V)')],
    snapshot.vehicles[0].supplyVoltageV,
  );
  const book = XLSX.read(monitoringWorkbook(tables), { type: 'array' });
  assert.equal(book.Sheets['Histórico'].I2.v, 'Contato iniciado');
  assert.equal(book.Sheets['Histórico'].I4.v, 'Ação encerrada');
  assert.match(monitoringCsv(tables), /Histórico do acompanhamento/);
});
