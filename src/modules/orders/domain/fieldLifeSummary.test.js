/** Exportação do resumo: bases numéricas, frações e ausência de duração não podem divergir dos cards. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { lifeStats } from './fieldLife.js';
import { fieldLifeSummaryRows } from './fieldLifeSummary.js';
import { csv } from '../../../shared/export/exports.js';

test('resumo exporta médias com bases diferentes e participação em fração, preservando precisão', () => {
  const stats = lifeStats([
    { state: 'replaced', days: 31 },
    { state: 'observed', days: 40 },
    { state: 'canceled', days: 9 },
    { state: 'review', days: null },
  ]);
  const rows = fieldLifeSummaryRows(stats);
  const get = (label) => rows.find((row) => row[0] === label);
  assert.deepEqual(get('Tempo médio acompanhado').slice(1, 4), [80 / 3, 'dias', 3]);
  assert.deepEqual(get('Tempo médio até primeira troca').slice(1, 4), [31, 'dias', 1]);
  assert.deepEqual(get('Participação com primeira troca').slice(1, 4), [0.25, 'fração', 4]);
  assert.deepEqual(get('Excluídos do tempo médio acompanhado').slice(1, 4), [1, 'ciclos', 4]);
  assert.match(csv(rows), /0,25/);
  const empty = fieldLifeSummaryRows(lifeStats([]));
  assert.equal(empty.find((r) => r[0] === 'Tempo médio acompanhado')[1], '');
  assert.equal(empty.find((r) => r[0] === 'Participação com primeira troca')[1], '');
  const zero = fieldLifeSummaryRows(lifeStats([{ state: 'observed', days: 0 }]));
  assert.equal(zero.find((r) => r[0] === 'Tempo médio acompanhado')[1], 0);
});
