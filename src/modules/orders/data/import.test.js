/**
 * Testes de regressão: Leitura da planilha de OS: mantém valores, posições e referências originais, sinalizando problemas para revisão.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import XLSX from 'xlsx';
import { importWorkbook, findOrdersSheetName } from './import.js';

test('aba atual e legada preservam os mesmos valores, cabeçalhos, chamadas e linhas de origem', () => {
  const values = [
    ['#', 'Status', 'ID Rastreador', 'Campo', 'Campo'],
    ['001', 'Pago', '001441234567', null, 'original'],
    ['001', 'Concluída', '001621234567', 'valor', null],
    [null, 'sem chamado'],
  ];
  const results = ['OS 2025_26', 'OS 2025'].map((name) => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([['Cliente'], ['não importar']]),
      'Base Clientes',
    );
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(values), name);
    return importWorkbook(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }));
  });
  const [{ sheetName: currentName, ...current }, { sheetName: legacyName, ...legacy }] = results;
  assert.equal(currentName, 'OS 2025_26');
  assert.equal(legacyName, 'OS 2025');
  assert.deepEqual(current, legacy);
  assert.equal(current.rows[0].cells[2].raw, '001441234567');
  assert.deepEqual(
    current.rows.map((row) => row.sourceRow),
    [2, 3],
  );
  assert.equal(current.calls, 1);
  assert.equal(current.skipped, 1);
});

test('não escolhe outra aba ou mistura duas bases reconhecidas; aba atual vazia informa o nome correto', () => {
  assert.equal(findOrdersSheetName(['Base Clientes', 'OS 2025_26']), 'OS 2025_26');
  assert.equal(findOrdersSheetName(['Outra']), null);
  for (const names of [
    ['OS 2025', 'OS 2025_26'],
    ['OS 2025_26', 'OS 2025'],
  ]) {
    const book = XLSX.utils.book_new();
    for (const name of names)
      XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['#'], ['1']]), name);
    assert.throws(
      () => importWorkbook(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' })),
      /duas abas/,
    );
  }
  const empty = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(empty, {}, 'OS 2025_26');
  assert.throws(
    () => importWorkbook(XLSX.write(empty, { type: 'buffer', bookType: 'xlsx' })),
    /OS 2025_26 está vazia/,
  );
});

test('preserva linhas repetidas, cabeçalhos repetidos, vazios e erros', () => {
  const sheet = XLSX.utils.aoa_to_sheet([
    ['#', 'CNPJ', 'CNPJ', 'Data'],
    ['#1', '001', null, 1440312410],
    ['#1', '002', '003'],
    [null, 'sem OS'],
  ]);
  sheet.D2.z = 'dd/mm/yyyy';
  sheet.C3 = { t: 'e', v: 23, w: '#REF!' };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'OS 2025');
  const result = importWorkbook(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  assert.equal(result.rows.length, 2);
  assert.equal(result.calls, 1);
  assert.equal(result.skipped, 1);
  assert.deepEqual(
    result.columns.map((c) => c.letter),
    ['A', 'B', 'C', 'D'],
  );
  assert.equal(result.rows[0].cells[2].raw, null);
  assert.equal(result.rows[0].cells[1].raw, '001');
  assert.equal(result.issues.length, 2);
});

test(
  'arquivo real tem 1406 atendimentos e 527 chamados, em ordem original',
  { skip: !existsSync('Ordens de Serviços 2025_26.xlsx') },
  () => {
    const result = importWorkbook(readFileSync('Ordens de Serviços 2025_26.xlsx'));
    assert.equal(result.rows.length, 1406);
    assert.equal(result.calls, 527);
    assert.equal(result.columns.length, 42);
    assert.equal(result.rows[0].os, '#6884');
    assert.equal(result.rows[0].sourceRow, 2);
    assert.ok(result.issues.some((i) => i.address === 'G563'));
  },
);
