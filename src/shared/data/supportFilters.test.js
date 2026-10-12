/** Confere os dois papéis do suporte sem misturá-los nem modificar a base importada. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFilters } from './filters.js';
import { dashboardData } from '../../modules/orders/domain/dashboard.js';

function supportData() {
  const labels = [
    'Resp. Execução',
    'Resp. Agendamento',
    'Status',
    'Custo Total',
    'Data de atendimento',
  ];
  const values = [
    ['Ana', 'Bruno', 'Concluída', 100, 45658],
    ['Carlos', 'Bruno', 'Pago', 200, 45658],
    ['Bruno', 'Ana', 'Concluída', 300, 45658],
    ['Ana', 'Carlos', 'Concluída', 400, 45658],
    ['', 'Bruno', 'Agendado', null, null],
  ];
  return {
    columns: labels.map((label, index) => ({ label, index })),
    rows: values.map((values, index) => ({
      os: String(index + 1),
      sourceRow: index + 2,
      cells: values.map((raw) => ({ raw, display: String(raw ?? '') })),
    })),
    issues: [{ row: 4, message: 'Conferir origem' }],
  };
}

test('responsáveis aceitam vários nomes por papel e exigem ambos quando combinados', () => {
  const data = supportData();
  const selected = applyFilters(data, {
    'Resp. Execução': ['Ana', 'Carlos'],
    'Resp. Agendamento': ['Bruno'],
  });
  assert.deepEqual(
    selected.rows.map((row) => row.sourceRow),
    [2, 3],
  );
  assert.equal(selected.calls, 2);
  assert.deepEqual(selected.issues, []);
  assert.equal(selected.rows[0], data.rows[0]);
  assert.equal(data.rows.length, 5);
  assert.deepEqual(
    applyFilters(data, { 'Resp. Execução': ['Bruno'] }).rows.map((row) => row.sourceRow),
    [4],
  );
});

test('visão geral e custos usam o mesmo recorte de responsáveis', () => {
  const data = supportData();
  const result = dashboardData(data, {
    'Resp. Execução': ['Ana', 'Carlos'],
    'Resp. Agendamento': ['Bruno'],
  });
  assert.equal(result.current.completed, 2);
  assert.equal(result.current.cost, 30000);
  assert.equal(result.current.average, 15000);
  assert.equal(result.months[0].other, 2);
  assert.equal(result.agenda.scheduled.length, 0);
  assert.equal(dashboardData(data, { 'Resp. Agendamento': ['Bruno'] }).agenda.scheduled.length, 1);
});

test('limpar seleções restaura linhas sem responsável e bases sem essas colunas', () => {
  const data = supportData();
  assert.equal(
    applyFilters(data, { 'Resp. Execução': [], 'Resp. Agendamento': [] }).rows.length,
    5,
  );
  assert.equal(applyFilters({ ...data, columns: [] }, {}).rows.length, 5);
});
