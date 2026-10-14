/** CSV extraído da página mantém conteúdo analítico, valores financeiros e identificadores textuais. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { consumptionRecordsCsv } from './consumptionRecordsReport.js';
import { parseCsv } from './consumption.js';
import { VOLUME_SCALE } from './lineConsumption.js';

test('relatório de seleção preserva unidade, zero financeiro, ausências e proteção contra fórmulas', () => {
  const row = {
    operator: 'Arqia',
    iccid: '089551805670305208517',
    number: '005511913795620',
    plan: '=1+1',
    start: '2026-09-01',
    end: '2026-09-28',
    days: 28,
    ticks: 20 * VOLUME_SCALE,
    service: 'dados',
    linkState: 'Não vinculado',
    status: 'Ativo',
    billedCents: 0,
    totalCents: -100,
    filename: 'ficticio.csv',
    sourceRow: 2,
    problems: [],
  };
  const context = {
    selectedOnly: true,
    filters: { minimumMB: '10' },
    periods: { Arqia: 'período' },
    search: '0055',
    reference: { filename: 'referencia.xlsx' },
    factor: 2,
  };
  const result = consumptionRecordsCsv([row, { ...row, ticks: null, sourceRow: 3 }], context);
  const table = parseCsv(result).map((value) => value.cells),
    head = table.findIndex((value) => value[0] === 'Operadora');
  const column = (label) => table[head].indexOf(label),
    first = table[head + 1],
    second = table[head + 2];
  assert.equal(first[column('ICCID')], row.iccid);
  assert.equal(first[column('MSISDN')], row.number);
  assert.equal(Number(first[column('Consumo MB')]), 20);
  assert.equal(first[column('Valor faturado de dados BRL')], '0');
  assert.equal(first[column('Valor total de dados BRL')], '-1');
  assert.equal(second[column('Consumo MB')], 'Não disponível');
  assert.match(result, /'=1\+1/);
  assert.match(result, /Somente linhas marcadas do recorte atual/);
  assert.match(result, /referencia.xlsx/);
  assert.match(
    consumptionRecordsCsv([], { ...context, selectedOnly: false }),
    /Todas as linhas filtradas/,
  );
});
