/** Busca isolada com dados sintéticos; não mede abertura, React, DOM, rede ou banco. */
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createOrderRecordSearch } from '../src/modules/orders/domain/orderRecords.js';

const rows = Array.from({ length: 1000 }, (_, i) => ({
  sourceRow: i + 2,
  cells: Array.from({ length: 70 }, (_, j) => ({ display: `FICTÍCIO ${i} campo ${j}` })),
}));
const legacy = (rows, search) =>
  rows.filter(
    (row) =>
      !search ||
      row.cells.some((cell) =>
        String(cell.display).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
      ),
  );
const cached = createOrderRecordSearch();
const measure = (fn, term) => {
  const start = performance.now();
  const result = fn(rows, term);
  return { ms: performance.now() - start, result };
};
const cold = measure(cached, '999999999999');
for (const term of ['FICTÍCIO', '999999999999', 'campo 69', '', 'não existe'])
  assert.deepEqual(cached(rows, term), legacy(rows, term));
const percentile = (values, p) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const before = [],
  after = [];
for (let i = 0; i < 20; i++) {
  before.push(measure(legacy, '99999999999' + i).ms);
  after.push(measure(cached, '99999999999' + i).ms);
}
const result = {
  rows: 1000,
  columns: 70,
  samples: 20,
  coldCacheMs: cold.ms,
  before: { medianMs: percentile(before, 0.5), p95Ms: percentile(before, 0.95) },
  after: { medianMs: percentile(after, 0.5), p95Ms: percentile(after, 0.95) },
  scope: 'Busca pura em Node, cache preparado; não representa latência total do sistema.',
};
fs.mkdirSync('layout-review', { recursive: true });
fs.writeFileSync('layout-review/benchmark-orders.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
