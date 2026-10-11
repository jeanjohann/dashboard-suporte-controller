/**
 * Testes de regressão: Leitura e análise do consumo de linhas. Identificadores são preservados como texto e duplicidades exigem revisão.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCsv,
  parseMB,
  consumptionDate,
  importConsumption,
  summarizeConsumption,
  consumptionGroups,
  MB_SCALE,
} from './consumption.js';
const header = 'ICCID;MSISDN;Período Início;Período Término;Consumo (MB);Plano';
const source = (lines) => header + '\r\n' + lines.join('\r\n');
test('CSV preserva BOM, aspas escapadas, delimitador em texto e linha física', () => {
  const rows = parseCsv('\uFEFFA;B\r\n"uma; célula";"texto ""citado""\nmais"\r\nx;y');
  assert.deepEqual(rows[1].cells, ['uma; célula', 'texto "citado"\nmais']);
  assert.equal(rows[2].sourceRow, 4);
  assert.throws(() => parseCsv('A;B\n"texto;fim'), /aspas não fechadas/);
  assert.throws(() => parseCsv('A;B\n"texto"x;y'), /após aspas/);
  assert.deepEqual(parseCsv('A,B\n"x,y",z')[1].cells, ['x,y', 'z']);
});
test('MB usa precisão de seis casas, zero válido e rejeita ausência ou valor negativo', () => {
  assert.equal(parseMB('41,2178'), 41217800);
  assert.equal(parseMB('1.234,000001'), 1234000001);
  assert.equal(parseMB('0'), 0);
  for (const value of ['', '-1', '1,1234567', '41.2178', 'abc']) assert.equal(parseMB(value), null);
  assert.equal(consumptionDate('29/02/2024'), '2024-02-29');
  assert.equal(consumptionDate('29/02/2025'), null);
});
test('importação preserva identificadores longos e zeros iniciais e não infere tecnologia', () => {
  const data = importConsumption(
    source(['089551805670305208517;005511913795620;01/09/2026;28/09/2026;41,2178;Plano IoT']),
  );
  assert.equal(data.rows[0].iccid, '089551805670305208517');
  assert.equal(data.rows[0].number, '005511913795620');
  assert.equal(data.rows[0].technology, '');
  assert.equal(data.rows[0].contract, '');
  assert.deepEqual(data.missingOptional, ['technology', 'contract']);
  assert.throws(() => importConsumption('ICCID;MSISDN\n1;2'), /Colunas necessárias/);
  assert.throws(() => importConsumption(source(['1;2;01/09/2026'])), /quantidade de campos/);
});
test('cards reconciliam consumo, média por linha, ausências, zero e empates', () => {
  const data = importConsumption(
    source([
      '1;11;01/09/2026;28/09/2026;10;A',
      '2;12;01/09/2026;28/09/2026;0;A',
      '3;13;01/09/2026;28/09/2026;;B',
      '4;14;01/09/2026;28/09/2026;10;B',
    ]),
  );
  const result = summarizeConsumption(data.rows);
  assert.equal(result.units, 20 * MB_SCALE);
  assert.equal(result.average, (20 * MB_SCALE) / 3);
  assert.equal(result.validLines, 3);
  assert.equal(result.zeroLines, 1);
  assert.equal(result.excluded, 1);
  assert.equal(result.largest.length, 2);
  assert.equal(
    consumptionGroups(result, 'plan').reduce((sum, item) => sum + item.value, 0),
    20,
  );
  assert.equal(summarizeConsumption([]).units, null);
});
test('pares repetidos excluem todo grupo antes dos filtros, mesmo com período inválido', () => {
  const data = importConsumption(
    source([
      '1;11;01/09/2026;28/09/2026;10;A',
      '1;11;invalid;28/09/2026;20;B',
      '2;12;01/09/2026;28/09/2026;2;A',
    ]),
  );
  assert.equal(summarizeConsumption(data.rows).units, 2 * MB_SCALE);
  assert.equal(summarizeConsumption(data.rows.filter((row) => row.plan === 'A')).excluded, 1);
  assert.ok(data.rows[0].problems.some((value) => value.includes('repetido')));
});
test('importador lê tecnologia e contrato somente de colunas explícitas', () => {
  const data = importConsumption(
    header + ';Tecnologia;Contrato\n1;11;01/09/2026;28/09/2026;1;Plano;4G;Contrato A',
  );
  assert.equal(data.rows[0].technology, '4G');
  assert.equal(data.rows[0].contract, 'Contrato A');
  assert.deepEqual(data.missingOptional, []);
});
