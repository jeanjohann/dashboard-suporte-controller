import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDashboardDocument, validateDashboardDocument, moveWidget } from './layout.js';
import { allowsPage, validateUser } from '../../../shared/security/permissions.js';
import { createDashboardRepository } from '../data/dashboardRepository.js';
const widget = {
  id: 'w1',
  metric: 'zoho.closedTickets',
  title: 'Fechados',
  kind: 'card',
  size: 'small',
  filters: { agent: '103932000029960050' },
};
const document = () => ({
  ...emptyDashboardDocument(),
  dashboards: [{ id: 'board1', name: 'Minha equipe', widgets: [structuredClone(widget)] }],
});
test('configurações aceitam apenas escolhas de apresentação e recusam dados, métricas e períodos inválidos', () => {
  const input = document(),
    output = validateDashboardDocument(input);
  assert.deepEqual(output, input);
  assert.notEqual(output, input);
  for (const change of [
    (value) => {
      value.sources = { secret: 'x' };
    },
    (value) => {
      value.dashboards[0].widgets[0].data = [1];
    },
    (value) => {
      value.dashboards[0].widgets[0].metric = 'livre.sql';
    },
    (value) => {
      value.dashboards[0].widgets[0].kind = 'chart';
    },
    (value) => {
      value.dashboards[0].widgets[0].filters.start = '2026-02-30';
    },
    (value) => {
      value.dashboards[0].widgets[0].filters = { start: '2026-10-20', end: '2026-10-01' };
    },
    (value) => {
      value.dashboards[0].widgets[0].filters.threshold = 12;
    },
    (value) => {
      value.dashboards.push({ ...value.dashboards[0], id: 'board2', name: ' MINHA EQUIPE ' });
    },
    (value) => {
      value.dashboards[0].widgets.push({ ...widget });
    },
  ]) {
    const value = document();
    change(value);
    assert.throws(() => validateDashboardDocument(value));
  }
});
test('limites do layout são verificados antes de gravar e reordenação conserva configurações', () => {
  const value = document();
  value.dashboards = Array.from({ length: 13 }, (_, index) => ({
    id: 'b' + index,
    name: 'Painel ' + index,
    widgets: [],
  }));
  assert.throws(() => validateDashboardDocument(value));
  const rows = [
      widget,
      { ...widget, id: 'w2', size: 'wide' },
      { ...widget, id: 'w3', kind: 'table' },
    ],
    copy = structuredClone(rows);
  assert.deepEqual(
    moveWidget(rows, 'w2', -1).map((row) => row.id),
    ['w2', 'w1', 'w3'],
  );
  assert.deepEqual(rows, copy);
  assert.equal(moveWidget(rows, 'w1', -1), rows);
});
test('Meu Dashboard deriva das páginas existentes e não cria uma permissão de dados', () => {
  const user = {
    email: 'test@example.invalid',
    active: true,
    role: 'user',
    pages: ['lines'],
    canImport: false,
    canExport: false,
    version: 0,
  };
  assert.equal(allowsPage(user, 'my-dashboard'), true);
  assert.equal(allowsPage({ ...user, pages: [] }, 'my-dashboard'), false);
  assert.equal(allowsPage({ ...user, active: false }, 'my-dashboard'), false);
  assert.throws(() => validateUser({ ...user, pages: ['my-dashboard'] }), /Páginas inválidas/);
});
test('sem armazenamento o salvamento falha explicitamente e documentos inválidos não são enviados', async () => {
  const repository = createDashboardRepository(null);
  await assert.rejects(repository.read('user'), /não está disponível/);
  await assert.rejects(repository.write('user', document()), /não está disponível/);
  await assert.rejects(repository.write('user', { ...document(), rows: [] }), /incompatíveis/);
  await assert.rejects(repository.read(''), /Identidade/);
});
