/**
 * Testes de regressão: Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipment } from './equipment.js';
const labels = [
  'Status',
  'Motivo',
  'Placa',
  'ID Rastreador',
  'Tipo de Serviço',
  'Instruções',
  'Data de atendimento',
  'Razão Social',
];
function data(values) {
  return {
    columns: labels.map((label, i) => ({ label, letter: String.fromCharCode(65 + i) })),
    rows: values.map(([os, ...raw], i) => ({
      os,
      sourceRow: i + 2,
      cells: [...raw.slice(0, 7), 'Cliente A'].map((value) => ({
        raw: value,
        display: String(value ?? ''),
      })),
    })),
  };
}
const removal = [
  '#1',
  'Pago',
  'Desinstalação Business 2.1',
  'ABC',
  123,
  'Assistência Técnica',
  '',
  45000,
];
const installation = [
  '#1',
  'Concluída',
  'Instalação Business 2.1',
  'ABC',
  456,
  'Assistência Técnica',
  '',
  45000,
];
test('troca vincula chamado e placa, exige realizados e seriais distintos', () => {
  const d = data([removal, installation]);
  const result = equipment(d, d);
  assert.equal(result.swaps.length, 1);
  assert.equal(result.swaps[0].oldSerial, '123');
  assert.equal(result.months[0].value, 1);
  const mixed = data([
    removal,
    [...installation.slice(0, 1), 'Cancelada', ...installation.slice(2)],
  ]);
  assert.equal(equipment(mixed, mixed).swaps.length, 0);
});
test('ambiguidade original não desaparece ao filtrar e par parcial não entra', () => {
  const d = data([removal, installation, installation]);
  const filtered = { ...d, rows: d.rows.slice(0, 2) };
  assert.equal(equipment(d, filtered).swaps.length, 0);
  assert.equal(equipment(d, filtered).issues.length, 2);
  const pair = data([removal, installation]);
  assert.equal(equipment(pair, { ...pair, rows: pair.rows.slice(0, 1) }).swaps.length, 0);
});
test('seriais iguais e ausentes exigem revisão; uma reinstalação com um ID é sem troca', () => {
  const same = data([removal, [...installation.slice(0, 4), 123, ...installation.slice(5)]]);
  assert.equal(equipment(same, same).issues.length, 2);
  const absent = data([removal, [...installation.slice(0, 4), null, ...installation.slice(5)]]);
  assert.equal(equipment(absent, absent).swaps.length, 0);
  assert.equal(equipment(absent, absent).issues.length, 2);
  const re = data([
    ['#1', 'Pago', 'Reinstalação Business 2.1', 'ABC', 123, 'Assistência Técnica', '', 45000],
  ]);
  assert.equal(equipment(re, re).issues.length, 0);
  assert.equal(equipment(re, re).withoutReplacement.length, 1);
});
test('acessórios exigem troca ou trocar explícito, preservam sinônimos e revisam conflitos', () => {
  const d = data(
    [
      'Troca de Teclado',
      'Trocar terminal de jornada',
      'Troca RFID',
      'Troca Coletora RFID',
      'Troca de acessório',
      'Verificar RFID',
      'RFID solto',
      'Teclado travado',
    ].map((instruction, i) => [
      '#' + i,
      'Pago',
      'Manutenção de Acessório',
      'ABC',
      123,
      'Assistência Técnica',
      instruction,
    ]),
  );
  const result = equipment(d, d);
  assert.deepEqual(result.accessories, { Coletora: 2, RFID: 1 });
  assert.equal(result.excludedAccessories, 2);
  assert.deepEqual(result.accessoryWithoutReplacement, { Coletora: [9], RFID: [7, 8] });
});

test('datas distintas revisam o par; clientes diferentes impedem duração automática', () => {
  const re = [...installation];
  re[2] = 'Reinstalação Business 2.1';
  const d = data([removal, re]);
  assert.equal(equipment(d, d).swaps.length, 1);
  const dated = data([removal, [...installation.slice(0, 7), 45001]]);
  assert.equal(equipment(dated, dated).swaps.length, 0);
  assert.equal(equipment(dated, dated).issues.length, 2);
  const other = data([removal, installation]);
  other.rows[1].cells[7] = { raw: 'Outro cliente' };
  assert.equal(equipment(other, other).swaps.length, 1);
  assert.equal(equipment(other, other).swaps[0].lifecycleEligible, false);
});
