import test from 'node:test';
import assert from 'node:assert/strict';
import { monitoringDemo } from '../data/demo.js';
import { monitorSnapshot } from './monitoring.js';
import { monitoringAnalytics, filterMonitoringQueue } from './monitoringAnalytics.js';
import { monitoringReport, monitoringCsv } from './monitoringReport.js';

test('tratamento usa só alertas utilizáveis e encerrado não representa recuperação', () => {
  const result = monitorSnapshot(monitoringDemo());
  const alerts = result.rows.filter((row) => row.state === 'delayed');
  const notes = {
    [alerts[0].key]: { status: 'Em análise' },
    [alerts[1].key]: { status: 'Acompanhamento encerrado' },
  };
  const analytics = monitoringAnalytics(result, notes);
  assert.equal(analytics.alerts, 6);
  assert.equal(analytics.active, 1);
  assert.equal(analytics.coverage, 1 / 6);
  assert.equal(analytics.maximumHours, 150);
  assert.equal(analytics.affectedBases, 3);
  assert.equal(
    analytics.stages.reduce((sum, item) => sum + item.value, 0),
    6,
  );
  assert.equal(filterMonitoringQueue(result, { focus: 'closed' }, notes).rows[0].state, 'delayed');
});
test('cards e denominadores não mudam com busca/status; tokens da busca cruzam campos e ignoram acento', () => {
  const result = monitorSnapshot(monitoringDemo());
  const key = result.rows[0].key,
    notes = { [key]: { status: 'Em análise', owner: 'João' } };
  const queue = filterMonitoringQueue(
    result,
    { focus: 'analysis', search: 'joao aurora 1001' },
    notes,
  );
  assert.equal(queue.rows.length, 1);
  assert.equal(queue.totals.fleet, 12);
  assert.equal(monitoringAnalytics(queue, notes).alerts, 6);
  assert.equal(
    filterMonitoringQueue(result, { stage: 'Aguardando contato' }, notes).rows.length,
    0,
  );
  assert.equal(filterMonitoringQueue(result, { focus: 'unstarted' }, notes).rows.length, 5);
  assert.equal(filterMonitoringQueue(result, { focus: 'critical' }).rows.length, 2);
  assert.equal(filterMonitoringQueue(result, { focus: 'missing' }).rows.length, 1);
});
test('coleta ruim não gera prioridades; base vazia não produz percentual ou duração zero', () => {
  const demo = monitoringDemo();
  demo.collections.forEach((entry) => {
    entry.ok = false;
  });
  const result = monitorSnapshot(demo);
  assert.equal(monitoringAnalytics(result).maximumHours, null);
  assert.equal(monitoringAnalytics(result).coverage, null);
  assert.equal(filterMonitoringQueue(result, { focus: 'unknown' }).rows.length, 12);
  assert.equal(filterMonitoringQueue(result, { focus: 'critical' }).rows.length, 0);
  assert.equal(
    monitoringAnalytics(monitorSnapshot(demo, { clients: ['inexistente'] })).coverage,
    null,
  );
});
test('relatório exporta a busca da fila, mantendo base e indicadores analíticos explícitos', () => {
  const filters = { search: '1001', focus: 'alerts' },
    result = monitorSnapshot(monitoringDemo());
  const tables = monitoringReport(filterMonitoringQueue(result, filters), filters);
  assert.equal(tables.vehicles.length, 2);
  assert.equal(tables.indicators.find((row) => row[0] === 'Acima do limite')[1], 6);
  assert.match(monitoringCsv(tables), /Resumo por base/);
  assert.match(monitoringCsv(tables), /Indicadores das bases selecionadas/);
});
