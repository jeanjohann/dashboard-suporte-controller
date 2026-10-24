/** Regressão da busca isolada e ordenação completa da tabela de OS. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { searchOrderRecords, sortOrderRecords, createOrderRecordSearch } from './orderRecords.js';

test('cache de busca preserva semântica por célula e não reutiliza conteúdo de uma nova base', () => {
  const search = createOrderRecordSearch();
  const rows = [
    { sourceRow: 2, cells: [{ display: 'Cliente ÁGUA' }, { display: '123' }] },
    { sourceRow: 3, cells: [{ display: 'ab' }, { display: 'cd' }] },
  ];
  for (const term of ['Água', '123', 'bc', '', 'não existe', 'CLI'])
    assert.deepEqual(search(rows, term), searchOrderRecords(rows, term));
  const replacement = [{ ...rows[0], cells: [{ display: 'Outro cliente' }] }];
  assert.deepEqual(search(replacement, 'água'), []);
  assert.equal(search(replacement, 'Outro').length, 1);
  assert.deepEqual(createOrderRecordSearch()(replacement, 'Água'), []);
});

test('busca usa conteúdo exibido sem alterar linhas, células ou ordem da base dos indicadores', () => {
  const rows = [
    { sourceRow: 2, cells: [{ raw: 123, display: 'R$ 123,00' }] },
    { sourceRow: 3, cells: [{ raw: 'CLIENTE ÁGUA', display: 'Cliente Água' }] },
    { sourceRow: 4, cells: [{ raw: null, display: '' }] },
  ];
  const original = structuredClone(rows);
  assert.deepEqual(searchOrderRecords(rows, 'r$'), [rows[0]]);
  assert.deepEqual(searchOrderRecords(rows, 'ÁGUA'), [rows[1]]);
  assert.equal(searchOrderRecords(rows, 'água')[0], rows[1]);
  assert.deepEqual(searchOrderRecords(rows, ''), rows);
  assert.deepEqual(searchOrderRecords(rows, 'não existe'), []);
  assert.deepEqual(rows, original);
});

test('ordena todo o recorte antes da paginação, mantém erros/ausências no fim e restaura a ordem original', () => {
  const rows = Array.from({ length: 105 }, (_, index) => ({
    sourceRow: index + 2,
    cells: [{ raw: 105 - index, display: String(105 - index), issue: false }],
  }));
  rows[0].cells[0] = { raw: 0, display: '#VALUE!', issue: true };
  rows[1].cells[0] = { raw: null, display: '', issue: false };
  rows[2].cells[0].raw = 1;
  const original = structuredClone(rows);
  const asc = sortOrderRecords(rows, { index: 0, direction: 'asc' });
  assert.equal(asc[0], rows[2]);
  assert.equal(asc[1], rows[104]);
  assert.deepEqual(asc.slice(-2), [rows[0], rows[1]]);
  const desc = sortOrderRecords(rows, { index: 0, direction: 'desc' });
  assert.equal(desc[0], rows[3]);
  assert.deepEqual(desc.slice(-2), [rows[0], rows[1]]);
  assert.equal(sortOrderRecords(rows, { index: -1, direction: 'desc' })[0], rows[104]);
  assert.equal(sortOrderRecords(rows, null), rows);
  assert.deepEqual(rows, original);
});
