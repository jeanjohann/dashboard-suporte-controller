import test from 'node:test';
import assert from 'node:assert/strict';
import { orderAttention } from './orderAttention.js';
const data = (rows) => ({
  columns: ['Status', 'Motivo', 'Razão Social'].map((label) => ({ label })),
  rows: rows.map((r, i) => ({ sourceRow: i + 2, cells: r.map((raw) => ({ raw })) })),
});
const event = (n, extra = {}) => ({
  clientKey: 'CNPJ1',
  client: 'Filial 1',
  plate: 'ABC1D23',
  date: `2026-10-${String(n).padStart(2, '0')}`,
  os: `OS${n}`,
  category: 'Rastreador/kit',
  rows: [n * 2, n * 2 + 1],
  ...extra,
});
test('trocas usam eventos e não linhas, deduplicam categoria/chamado e não juntam filiais, placas ou datas ausentes', () => {
  const result = orderAttention(data([]), {
    replacementEvents: [
      event(1),
      event(1),
      event(2),
      event(3, { clientKey: 'CNPJ2' }),
      event(4, { plate: 'XYZ9Z99' }),
      event(5, { date: null }),
    ],
  });
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].value, '2 eventos de troca');
  assert.deepEqual(result.findings[0].rows, [2, 3, 4, 5]);
  assert.match(result.coverage, /1 eventos sem/);
});
test('concentração usa realizados do cliente como denominador, exclui canceladas e obedece quantidade e participação', () => {
  const d = data([
    ['Pago', 'Visita Improdutiva', 'A'],
    ['Concluída', 'Visita Improdutiva', 'A'],
    ['Pago', 'Visita Improdutiva', 'A'],
    ['Pago', 'Revisão', 'A'],
    ['Cancelada', 'Visita Improdutiva', 'A'],
    ['Pago', 'Visita Improdutiva', 'B'],
  ]);
  const result = orderAttention(d, {}, { replacements: 2, unproductive: 3, share: 70 });
  assert.equal(result.findings.length, 1);
  assert.match(result.findings[0].value, /3 de 4.*75/);
  assert.deepEqual(result.findings[0].rows, [2, 3, 4]);
  assert.equal(
    orderAttention(d, {}, { replacements: 2, unproductive: 3, share: 80 }).findings.length,
    0,
  );
  assert.equal(orderAttention(data([]), {}).findings.length, 0);
});
