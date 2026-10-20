import test from 'node:test';
import assert from 'node:assert/strict';
import {
  placeWidget,
  widgetDimensions,
  copyWidget,
  copyDashboard,
  dashboardBackup,
  readDashboardBackup,
  appendDashboards,
} from './boardActions.js';
import { validateDashboardDocument } from './layout.js';

const user = { active: true, role: 'admin' };
const widget = {
  id: 'w1',
  metric: 'orders.completed',
  title: 'Semana',
  kind: 'card',
  size: 'small',
  filters: { start: '2026-10-01', end: '2026-10-07' },
};
const board = { id: 'b1', name: 'Operação', widgets: [widget] };
const document = () => ({ version: 1, revision: 7, dashboards: [structuredClone(board)] });
const factory = () => {
  let id = 0;
  return () => `new-${++id}`;
};

test('arraste move antes/depois em ambas as direções e não modifica blocos/filtros', () => {
  const rows = [widget, { ...widget, id: 'w2' }, { ...widget, id: 'w3' }];
  const copy = structuredClone(rows);
  assert.deepEqual(
    placeWidget(rows, 'w1', 'w3', true).map((w) => w.id),
    ['w2', 'w3', 'w1'],
  );
  assert.deepEqual(
    placeWidget(rows, 'w3', 'w1').map((w) => w.id),
    ['w3', 'w1', 'w2'],
  );
  assert.deepEqual(
    placeWidget(rows, 'w1', 'w3').map((w) => w.id),
    ['w2', 'w1', 'w3'],
  );
  assert.equal(placeWidget(rows, 'w1', 'w2'), rows);
  assert.equal(placeWidget(rows, 'w1', 'w1'), rows);
  assert.equal(placeWidget(rows, 'w1', 'ausente'), rows);
  assert.deepEqual(rows, copy);
});

test('dimensões têm encaixe e limites; layouts antigos continuam válidos', () => {
  assert.deepEqual(widgetDimensions(300, 100, 1200), { size: 'small', height: 320 });
  assert.deepEqual(widgetDimensions(600, 505, 1200), { size: 'medium', height: 500 });
  assert.deepEqual(widgetDimensions(1200, 1600, 1200), { size: 'wide', height: 960 });
  assert.deepEqual(validateDashboardDocument(document()), document());
  for (const height of [319, 961, 400.5, '400', null]) {
    const value = document();
    value.dashboards[0].widgets[0].height = height;
    assert.throws(() => validateDashboardDocument(value));
  }
  const value = document();
  value.dashboards[0].widgets[0].height = 640;
  assert.equal(validateDashboardDocument(value).dashboards[0].widgets[0].height, 640);
});

test('cópias recriam IDs e nomes sem compartilhar os filtros nem ultrapassar limites de texto', () => {
  const ids = factory(),
    item = copyWidget(widget, ids);
  item.filters.start = '2026-09-01';
  assert.equal(widget.filters.start, '2026-10-01');
  assert.notEqual(item.id, widget.id);
  const original = { ...board, name: 'Á'.repeat(60) };
  const first = copyDashboard(original, [], ids),
    second = copyDashboard(original, [first.name.toUpperCase()], ids);
  assert.notEqual(first.name, second.name);
  assert(second.name.length <= 60);
  assert.notEqual(first.widgets[0].id, second.widgets[0].id);
  first.widgets[0].filters.start = '';
  assert.equal(second.widgets[0].filters.start, '2026-10-01');
});

test('backup é configuração transportável sem identidade/revisão de origem ou resultados', () => {
  const value = document();
  value.dashboards[0].widgets[0].height = 480;
  const text = dashboardBackup(value, user),
    backup = JSON.parse(text);
  assert.deepEqual(Object.keys(backup).sort(), ['dashboards', 'format', 'version']);
  assert.deepEqual(readDashboardBackup(text, user), value.dashboards);
  const merged = appendDashboards(value, readDashboardBackup(text, user), user, factory());
  assert.equal(merged.revision, 7);
  assert.equal(merged.dashboards.length, 2);
  assert.deepEqual(merged.dashboards[0], value.dashboards[0]);
  assert.notEqual(merged.dashboards[1].id, value.dashboards[0].id);
  assert.equal(merged.dashboards[1].name, 'Operação (2)');
  assert.equal(value.dashboards.length, 1);
});

test('importação recusa campos extras, indicadores inválidos, fontes sem permissão e excesso sem alterar o destino', () => {
  const text = dashboardBackup(document(), user);
  for (const change of [
    (v) => {
      v.owner = 'outro';
    },
    (v) => {
      v.dashboards[0].widgets[0].data = [10];
    },
    (v) => {
      v.dashboards[0].widgets[0].metric = 'custom.sql';
    },
    (v) => {
      v.dashboards[0].widgets = [null];
    },
    (v) => {
      v.dashboards[0].widgets[0].height = 2000;
    },
  ]) {
    const input = JSON.parse(text);
    change(input);
    assert.throws(() => readDashboardBackup(JSON.stringify(input), user));
  }
  assert.throws(() => readDashboardBackup('x', user), /JSON/);
  assert.throws(() => readDashboardBackup(' '.repeat(1000001), user), /limite/);
  assert.throws(
    () => readDashboardBackup(text, { active: true, role: 'user', pages: ['lines'] }),
    /permissão/,
  );
  assert.throws(() => dashboardBackup(document(), { ...user, active: false }), /permissão/);
  const full = document();
  full.dashboards = Array.from({ length: 12 }, (_, i) => ({
    ...structuredClone(board),
    id: 'b' + i,
    name: 'Painel ' + i,
  }));
  const before = structuredClone(full);
  assert.throws(() => appendDashboards(full, [board], user, factory()), /12 painéis/);
  assert.deepEqual(full, before);
});
