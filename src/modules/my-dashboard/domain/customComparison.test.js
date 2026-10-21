import test from 'node:test';
import assert from 'node:assert/strict';
import { canCompare, compareSeries } from './presentation.js';
import { validateDashboardDocument } from './layout.js';
import { dashboardBackup, readDashboardBackup } from './boardActions.js';
const widget = (id, query = { group: 'Resp. Execução', measure: 'rows', scope: 'performed' }) => ({
  id,
  metric: 'orders.custom',
  query,
  title: id,
  kind: 'columns',
  size: 'medium',
  filters: {},
});
test('comparação personalizada exige fonte, eixo e medida; filtros e escopos podem ser independentes', () => {
  const a = widget('a'),
    b = widget('b', { ...a.query, scope: 'productive' });
  b.filters = { client: 'Outro', start: '2026-01-01' };
  assert(canCompare(a, b));
  assert(!canCompare(a, { ...b, query: { ...b.query, group: 'Motivo' } }));
  assert(!canCompare(a, { ...b, query: { ...b.query, measure: 'vehicles' } }));
  assert(!canCompare(a, { ...b, metric: 'operational.custom' }));
  assert(!canCompare(a, widget('b', { ...a.query, group: 'none' })));
  const doc = {
    version: 1,
    revision: 0,
    dashboards: [{ id: 'board', name: 'Comparações', widgets: [{ ...a, comparison: b }] }],
  };
  assert.deepEqual(validateDashboardDocument(doc), doc);
  const user = { active: true, role: 'admin' };
  assert.deepEqual(readDashboardBackup(dashboardBackup(doc, user), user), doc.dashboards);
  assert.throws(() =>
    validateDashboardDocument({
      ...doc,
      dashboards: [
        {
          ...doc.dashboards[0],
          widgets: [{ ...a, comparison: { ...b, query: { ...b.query, measure: 'calls' } } }],
        },
      ],
    }),
  );
});
test('categorias ausentes ficam nulas e a comparação mensal mantém ordem cronológica', () => {
  assert.deepEqual(
    compareSeries([{ label: '2026-02', value: 0 }], [{ label: '2026-01', value: 4 }], true),
    [
      { label: '2026-01', value: null, comparison: 4 },
      { label: '2026-02', value: 0, comparison: null },
    ],
  );
});
