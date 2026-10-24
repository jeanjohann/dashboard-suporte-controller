import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewDiagnostics } from './reviewDiagnostics.js';

test('diagnóstico contextual de estoque não inventa identificadores e preserva o original', () => {
  const data = {
    columns: [{ label: 'Situação' }],
    rows: [{ sourceRow: 4, cells: [{ raw: 'Estoque' }] }],
  };
  const before = JSON.stringify(data);
  const [result] = reviewDiagnostics(
    [{ row: 4, column: 'Placa', value: '', reason: 'Campo ausente' }],
    { data },
  );
  assert.equal(result.rule, 'RV06');
  assert.match(result.applicability, /ausência pode ser legítima/);
  assert.match(result.action, /não invente/);
  assert.equal(JSON.stringify(data), before);
});
test('diagnóstico conserva origem, valores e incerteza; reúne somente apontamentos idênticos', () => {
  const issue = {
    address: 'BH12',
    column: 'Serial',
    value: '00123',
    reason: 'Valor repetido nas linhas 12, 14; conferir.',
    category: 'Possível divergência',
  };
  const before = JSON.stringify(issue);
  const results = reviewDiagnostics([
    issue,
    { ...issue },
    { ...issue, reason: 'Identificador incompatível' },
    { address: 'C1, D1', reason: 'Cabeçalho repetido' },
  ]);
  assert.equal(results.length, 3);
  assert.equal(results[0].row, 12);
  assert.equal(results[0].value, '00123');
  assert.match(results[0].impact, /não confirma erro/);
  assert.match(results[0].action, /Não exclua/);
  assert.equal(results[2].row, null);
  assert.equal(JSON.stringify(issue), before);
});
