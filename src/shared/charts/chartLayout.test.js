import test from 'node:test';
import assert from 'node:assert/strict';
import { chartPage, valueAxisWidth } from './chartLayout.js';

test('páginas mantêm acesso a todas as categorias e limitam a página após mudar o recorte', () => {
  const rows = Array.from({ length: 23 }, (_, value) => ({ label: String(value), value }));
  const pages = [0, 1, 2].flatMap((page) => chartPage(rows, page).items);
  assert.deepEqual(pages, rows);
  assert.equal(chartPage(rows.slice(0, 6), 2).current, 0);
  assert.equal(chartPage(rows, 2).items.length, 3);
  assert.deepEqual(chartPage([], 2), { current: 0, last: 0, items: [] });
  assert.equal(rows.length, 23);
});

test('eixos preservam unidade e sinal, sem reservar largura excessiva para contagens pequenas', () => {
  const format = (value) => value.toLocaleString('pt-BR');
  assert.equal(valueAxisWidth([{ value: 4 }, { value: null }], format), 40);
  assert(valueAxisWidth([{ value: -1400000 }], format) > 40);
  assert(valueAxisWidth([{ value: 12 }], (value) => `R$ ${value},00`) > 40);
  assert.equal(valueAxisWidth([], format), 40);
});
