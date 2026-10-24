import test from 'node:test';
import assert from 'node:assert/strict';
import { createDashboardEvaluator, dashboardSourcesForWidget } from './evaluationCache.js';

const admin = { active: true, role: 'admin', email: 'a@example.invalid' };
test('cards equivalentes compartilham cálculo; mudança independente não invalida e nova OS invalida', () => {
  let calls = 0;
  const evaluate = createDashboardEvaluator(() => ({ value: ++calls }));
  const widget = { metric: 'orders.completed', filters: {} };
  const sources = { orders: { value: 1 }, monitoring: { value: 2 } };
  const a = evaluate(widget, sources, admin);
  assert.equal(
    evaluate({ ...widget, id: 'outra-copia' }, { ...sources, monitoring: {} }, admin),
    a,
  );
  assert.notEqual(evaluate(widget, { ...sources, orders: {} }, admin), a);
  assert.equal(calls, 2);
});
test('fontes de parque incluem OS e complementos; troca de conta/permissão não reutiliza resultados', () => {
  const sources = { orders: {}, operational: {}, zoho: {}, monitoring: {} };
  const selected = dashboardSourcesForWidget(
    { metric: 'park.swaps', companions: [{ metric: 'zoho.closedTickets' }] },
    sources,
  );
  assert.equal(selected.orders, sources.orders);
  assert.equal(selected.operational, sources.operational);
  assert.equal(selected.zoho, sources.zoho);
  assert.equal(selected.monitoring, undefined);
  let calls = 0;
  const evaluate = createDashboardEvaluator(() => ({ call: ++calls }));
  const widget = { metric: 'orders.completed' };
  const result = evaluate(widget, sources, admin);
  assert.notEqual(evaluate(widget, sources, { ...admin, email: 'b@example.invalid' }), result);
  assert.notEqual(evaluate(widget, sources, { ...admin, active: false }), result);
  assert.equal(calls, 3);
});
test('cache limitado descarta consultas antigas', () => {
  let calls = 0;
  const evaluate = createDashboardEvaluator(() => ++calls, 2);
  const sources = { orders: {} };
  const w = (client) => ({ metric: 'orders.completed', filters: { client } });
  evaluate(w('a'), sources, admin);
  evaluate(w('b'), sources, admin);
  evaluate(w('c'), sources, admin);
  evaluate(w('a'), sources, admin);
  assert.equal(calls, 4);
});

test('filtros e consultas diferentes não colidem; restrição é verificada antes de ler a fonte', () => {
  let calls = 0;
  const evaluate = createDashboardEvaluator(() => ++calls);
  const sources = { orders: {} };
  evaluate(
    { metric: 'orders.custom', filters: { client: 'a' }, query: { group: 'a' } },
    sources,
    admin,
  );
  evaluate(
    { metric: 'orders.custom', filters: { client: 'b' }, query: { group: 'a' } },
    sources,
    admin,
  );
  evaluate(
    { metric: 'orders.custom', filters: { client: 'a' }, query: { group: 'b' } },
    sources,
    admin,
  );
  assert.equal(calls, 3);
  const real = createDashboardEvaluator();
  const poison = new Proxy(
    {},
    {
      get() {
        throw Error('Fonte restrita foi lida');
      },
    },
  );
  assert.equal(
    real({ metric: 'orders.completed' }, poison, { active: true, role: 'user', pages: ['lines'] })
      .status,
    'restricted',
  );
});
