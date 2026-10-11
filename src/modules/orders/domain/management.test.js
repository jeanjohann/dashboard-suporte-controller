/**
 * Testes de regressão: Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { managementMetrics } from './management.js';
import { categoryVisibility } from '../config/dashboardCategories.js';
test('execuções contam linhas realizadas e manutenção usa Assistência Técnica', () => {
  const columns = [
    'Status',
    'Tipo de Serviço',
    'Resp. Agendamento',
    'Resp. Execução',
    'Razão Social',
  ].map((label) => ({ label }));
  const rows = [
    ['Concluída', 'Assistência Técnica', 'Ana', 'Bruno', 'Cliente A'],
    ['Pago', 'Assistência Técnica', 'Ana', 'Bruno', 'Cliente A'],
    ['Agendado', 'Assistência Técnica', 'Ana', 'Bruno', 'Cliente A'],
    ['Cancelada', 'Assistência Técnica', 'Ana', 'Bruno', 'Cliente A'],
    ['Concluída', 'Implementação', 'Bruno', null, 'Cliente B'],
  ].map((values, i) => ({ sourceRow: i + 2, cells: values.map((raw) => ({ raw })) }));
  const metrics = managementMetrics({ columns, rows });
  assert.equal(metrics.completed.length, 3);
  assert.equal(metrics.maintenance.length, 2);
  assert.equal(metrics.execution.find((x) => x.label === 'Bruno').value, 2);
  assert.equal(metrics.execution.find((x) => x.label.startsWith('Sem responsável')).value, 1);
  assert.equal(metrics.clients[0].value, 2);
  assert.equal(metrics.scheduling.find((x) => x.label === 'Ana').value, 2);
  assert.equal(metrics.scheduling.find((x) => x.label === 'Bruno').value, 1);
  assert.equal(
    managementMetrics({ columns: columns.filter((c) => c.label !== 'Resp. Execução'), rows: [] })
      .execution,
    null,
  );
});
test('categorias isolam relatórios e preservam preferências', () => {
  assert.deepEqual(
    categoryVisibility({ summary: true, finance: true, filters: true, records: true }, 'overview'),
    { summary: true, finance: false, filters: true, records: false },
  );
  assert.equal(categoryVisibility({ summary: false }, 'overview').summary, false);
});

import { applyFilters } from '../../../shared/data/filters.js';
test('agendamentos e execuções respeitam suas próprias datas', () => {
  const data = {
    columns: [{ label: 'Data de atendimento' }, { label: 'Agendamento' }],
    rows: [{ sourceRow: 2, os: '#1', cells: [{ raw: 45689 }, { raw: 45658 }] }],
    issues: [],
  };
  const filters = { start: '2025-01-01', end: '2025-01-31' };
  assert.equal(applyFilters(data, filters).rows.length, 0);
  assert.equal(applyFilters(data, filters, 'Agendamento').rows.length, 1);
});
