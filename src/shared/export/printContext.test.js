import test from 'node:test';
import assert from 'node:assert/strict';
import { printContextEntries } from './printContext.js';

test('impressão identifica apurações sem expor sua serialização e preserva identificadores', () => {
  const context = {
    filename: 'Originais.csv',
    filters: {
      alcance: 'Consumo → Visão geral',
      periodos: { Arqia: '["2026-09-01","2026-09-28"]', Kore: '["2026-09-01","2026-09-30"]' },
      iccid: '089551805670305208517',
      busca: '',
      fator: 2,
    },
  };
  const copy = structuredClone(context),
    entries = printContextEntries(context);
  assert.deepEqual(entries, [
    ['Arquivo', 'Originais.csv'],
    ['Análise', 'Consumo → Visão geral'],
    ['Apurações', 'Arqia: 01/09/2026 a 28/09/2026 · Kore: 01/09/2026 a 30/09/2026'],
    ['iccid', '089551805670305208517'],
    ['Multiplicador da média', '2'],
  ]);
  assert.deepEqual(context, copy);
});
test('impressão mantém zero, falso, categorias e campos adicionais sem criar conversões financeiras', () => {
  assert.deepEqual(
    printContextEntries({
      filters: {
        minimumMB: 0,
        includeOriginal: false,
        client: ['Cliente A', 'Cliente B'],
        extra: [{ column: 4, values: ['001', 'R$ 1.234,56'] }],
        start: '2026-09-01',
        end: '',
      },
      referenceDate: '2026-09-30',
    }),
    [
      ['Arquivo', 'Não informado'],
      ['Consumo acima de (MB)', '0'],
      ['includeOriginal', 'Não'],
      ['Cliente', 'Cliente A, Cliente B'],
      ['extra', 'column: 4 · values: 001, R$ 1.234,56'],
      ['De', '01/09/2026'],
      ['Referência temporal', '30/09/2026'],
    ],
  );
});
test('chaves de período desconhecidas e textos especiais continuam texto; ausência é explícita', () => {
  assert.deepEqual(
    printContextEntries({
      filters: { periodos: { Arqia: 'não identificado' }, busca: '<cliente & equipamento>' },
    }),
    [
      ['Arquivo', 'Não informado'],
      ['Apurações', 'Arqia: não identificado'],
      ['Busca', '<cliente & equipamento>'],
    ],
  );
  assert.deepEqual(printContextEntries(), [
    ['Arquivo', 'Não informado'],
    ['Filtros', 'Sem filtros informados'],
  ]);
});
test('datas são formatadas somente nos campos de período, preservando buscas e nomes originais', () => {
  const entries = printContextEntries({
    filters: {
      start: '2026-09-01',
      busca: '2026-09-01',
      client: ['2026-09-01'],
      agrupamento: 'client',
      indicador: 'assistance',
    },
  });
  assert.deepEqual(entries.slice(1), [
    ['De', '01/09/2026'],
    ['Busca', '2026-09-01'],
    ['Cliente', '2026-09-01'],
    ['Agrupamento', 'Cliente'],
    ['Indicador', 'Assistências realizadas'],
  ]);
});
