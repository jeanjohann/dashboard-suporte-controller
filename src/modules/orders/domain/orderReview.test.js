import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewOrderConsistency } from './orderReview.js';
import { summarize } from './analysis.js';

const fixture = (values) => ({
  columns: ['Status', 'Pago em'].map((label, index) => ({ label, letter: ['B', 'C'][index] })),
  rows: values.map(([status, paid], index) => ({
    sourceRow: index + 2,
    os: '#' + index,
    cells: [status, paid].map((raw) => ({ raw, display: String(raw ?? '') })),
  })),
});

test('avisos de escrita e pagamento ao técnico não corrigem células nem mudam os realizados', () => {
  const data = fixture([
    ['pago', null],
    ['Concluida', null],
    ['Pago ', null],
    ['Pago', null],
    ['Concluída', 45000],
    ['Pago', 45000],
    ['Agendar', null],
  ]);
  const before = structuredClone(data),
    totals = summarize(data);
  const issues = reviewOrderConsistency(data);
  assert.equal(issues.filter((issue) => issue.reason.includes('escrita diferente')).length, 3);
  assert.ok(
    issues.some((issue) => issue.address === 'C5' && issue.reason.includes('sem data válida')),
  );
  assert.ok(
    issues.some((issue) => issue.address === 'C6' && issue.reason.includes('status diferente')),
  );
  assert.ok(!issues.some((issue) => issue.row === 7 || issue.row === 8));
  assert.deepEqual(summarize(data), totals);
  assert.deepEqual(data, before);
});

test('ausência de Pago em não fabrica conciliação e cabeçalhos repetidos permanecem disponíveis', () => {
  const data = fixture([['Pago', 45000]]);
  data.columns = [
    { label: 'Status', letter: 'B' },
    { label: 'Status', letter: 'D' },
  ];
  const issues = reviewOrderConsistency(data);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].address, 'B1, D1');
  assert.match(issues[0].reason, /primeira ocorrência/);
  assert.equal(data.rows[0].cells[1].raw, 45000);
  assert.deepEqual(reviewOrderConsistency({ columns: [], rows: [] }), []);
});
