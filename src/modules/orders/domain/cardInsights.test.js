/**
 * Testes de regressão: Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { maintenanceInsights, serviceProfile } from './cardInsights.js';
const columns = ['Status', 'Tipo de Serviço', 'Razão Social', 'Custo Total'].map((label) => ({
  label,
}));
const data = (values) => ({
  columns,
  rows: values.map((v, i) => ({ sourceRow: i + 2, cells: v.map((raw) => ({ raw })) })),
});
test('manutenção mantém base completa, ausência de cliente, custo zero e exclui não realizados', () => {
  const d = data([
    ['Pago', 'Assistência Técnica', 'A', 100],
    ['Concluída', 'Assistência Técnica', 'A', 0],
    ['Concluída', 'Assistência Técnica', 'B', null],
    ['Concluída', 'Assistência Técnica', null, 50],
    ['Cancelada', 'Assistência Técnica', 'A', 900],
    ['Pago', 'Implementação', 'C', 1000],
  ]);
  const m = maintenanceInsights(d);
  assert.equal(m.total, 4);
  assert.equal(m.clients, 2);
  assert.equal(m.unidentified, 1);
  assert.equal(m.topFiveShare, 3 / 4);
  assert.equal(m.cost, 15000);
  assert.equal(m.costCount, 3);
  assert.equal(m.average, 5000);
  assert.equal(m.leader.label, 'A');
  assert.equal(m.leader.average, 5000);
  assert.equal(m.groups.find((g) => g.label === 'B').cost, null);
});
test('perfil mantém Cancelamento realizado e tipos exclusivos do período anterior', () => {
  const current = data([
    ['Pago', 'Assistência Técnica', 'A', 100],
    ['Concluída', 'Cancelamento', 'A', null],
    ['Agendado', 'Implementação', 'A', 100],
  ]);
  const previous = data([
    ['Pago', 'Implementação', 'A', 200],
    ['Pago', 'Assistência Técnica', 'A', 10],
    ['Pago', 'Assistência Técnica', 'B', 20],
  ]);
  const p = serviceProfile(current, previous);
  assert.equal(p.total, 2);
  assert.equal(p.items.find((g) => g.label === 'Cancelamento').share, 0.5);
  assert.equal(p.items.find((g) => g.label === 'Cancelamento').cost, null);
  assert.equal(p.items.find((g) => g.label === 'Implementação').difference, -1);
  assert.equal(p.items.find((g) => g.label === 'Assistência Técnica').difference, -1);
  assert.equal(
    p.items.reduce((sum, g) => sum + g.share, 0),
    1,
  );
});
test('seleção vazia e colunas ausentes não fabricam custo ou participação', () => {
  const m = maintenanceInsights(data([]));
  assert.equal(m.cost, null);
  assert.equal(m.topFiveShare, null);
  assert.equal(m.leader, null);
  assert.equal(maintenanceInsights({ columns: [], rows: [] }), null);
  assert.equal(serviceProfile({ columns: [], rows: [] }), null);
  assert.equal(serviceProfile(data([])).total, 0);
});
