/** Medição reproduzível com 1.800 veículos fictícios; nenhuma chamada à API ou leitura de acervo. */
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import {
  monitorSnapshot,
  sortMonitoringRows,
} from '../src/modules/monitoring/domain/monitoring.js';
import { monitoringTelemetry } from '../src/modules/monitoring/domain/monitoringTelemetry.js';
import { filterMonitoringQueue } from '../src/modules/monitoring/domain/monitoringAnalytics.js';
import { monitoringReport } from '../src/modules/monitoring/domain/monitoringReport.js';
const referenceAt = '2026-10-21T12:00:00Z';
const snapshot = {
  schemaVersion: 1,
  complete: true,
  demonstration: true,
  positionsWindowHours: 24,
  referenceAt,
  collections: Array.from({ length: 20 }, (_, index) => ({
    clientId: 'base-' + index,
    at: referenceAt,
    ok: true,
  })),
  vehicles: Array.from({ length: 1800 }, (_, index) => ({
    clientId: 'base-' + (index % 20),
    clientName: 'Base fictícia ' + (index % 20),
    vehicleId: 'vehicle-' + index,
    plate: 'TST' + String(index).padStart(4, '0'),
    trackerId: '144' + String(index).padStart(6, '0'),
    lastRecordAt:
      index % 37 ? new Date(Date.parse(referenceAt) - (index % 150) * 3600000).toISOString() : null,
    deviceModel: ['MXT-130', 'MXT-162', 'MXT-141', 'MXT-160', 'MXT-140', 'MXT-141A'][index % 6],
    externalPowerFailure: index % 11 === 0,
    batteryState: index % 19 === 0 ? null : [0, 1, 2, 3, 5, 6][index % 6],
    positions24h: index % 23 === 0 ? null : index * 8,
    supplyVoltageV: index % 29 === 0 ? null : 12.6,
    profile: 'Perfil fictício ' + (index % 3),
  })),
};
const filters = {
  clients: [],
  models: [],
  threshold: 48,
  state: 'all',
  focus: 'all',
  stage: 'all',
  search: '',
};
const operations = { classification: () => monitorSnapshot(snapshot, filters) };
const result = operations.classification();
operations.telemetry = () => monitoringTelemetry(result);
operations.queue = () => filterMonitoringQueue(result, filters, {});
operations.sort = () =>
  sortMonitoringRows(result.rows, { key: 'positions24h', direction: 'desc' }, {});
operations.report = () => monitoringReport(result, filters, {}, []);
const timings = {};
for (const [name, run] of Object.entries(operations)) {
  const times = [];
  for (let i = 0; i < 25; i++) {
    const started = performance.now();
    run();
    if (i >= 5) times.push(performance.now() - started);
  }
  times.sort((a, b) => a - b);
  timings[name] = { medianMs: +times[10].toFixed(3), p95Ms: +times[18].toFixed(3) };
}
const output = {
  fixture: 'Somente dados fictícios',
  vehicles: snapshot.vehicles.length,
  bases: snapshot.collections.length,
  timings,
};
fs.mkdirSync('layout-review', { recursive: true });
fs.writeFileSync('layout-review/round052-benchmark.json', JSON.stringify(output, null, 2));
fs.writeFileSync('layout-review/round052-fleet.json', JSON.stringify(snapshot));
console.log(JSON.stringify(output, null, 2));
