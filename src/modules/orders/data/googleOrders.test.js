/** Paridade entre as duas fontes, com erros e lacunas preservados. Não acessa dados do Google. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importGoogleOrders } from './googleOrders.js';
import { importOrdersSheet } from './import.js';
import { finance } from '../domain/analysis.js';

const cell = (raw, display = String(raw), format = '') => ({
  type: typeof raw === 'number' ? 'n' : 's',
  raw,
  display,
  format,
});
function snapshot() {
  return {
    version: 1,
    sheetName: 'OS 2025_26',
    readAt: '2026-10-16T12:00:00Z',
    rows: [
      [
        '#',
        'Status',
        'Data de atendimento',
        'ID Rastreador',
        'Técnico',
        'Km',
        'Custo Total',
        'Cobrança',
        'Valor a cobrar',
        'Extra',
        'Extra',
      ].map((v) => cell(v)),
      [
        cell('#1'),
        cell('Pago'),
        cell(45678, '21/01/2025', 'dd/mm/yyyy'),
        cell('001441234567'),
        cell(100, 'R$ 100,00'),
        cell(20),
        cell(119.99),
        cell('Addlog'),
        cell(150),
        null,
        { type: 'e', raw: 'REF', display: '#REF!', format: '' },
      ],
      [],
      [null, cell('Sem chamado')],
      [cell('#1'), cell('Cancelada'), null, cell('001621234567'), cell(90), cell(30), cell(120)],
    ],
  };
}
test('Google preserva mesmas colunas, ordens, valores, erros, zeros de ID e financeiros do leitor Excel', () => {
  const input = snapshot(),
    sheet = {};
  input.rows.forEach((row, r) =>
    row.forEach((c, col) => {
      if (c)
        sheet[XLSX.utils.encode_cell({ r, c: col })] = {
          t: c.type,
          v: c.raw,
          w: c.display,
          z: c.format,
        };
    }),
  );
  sheet['!ref'] = 'A1:K5';
  const expected = importOrdersSheet(sheet, input.sheetName);
  const imported = importGoogleOrders(input);
  assert.deepEqual(imported.data, expected);
  assert.deepEqual(finance(imported.data), finance(expected));
  assert.equal(imported.data.skipped, 1);
  assert.deepEqual(
    imported.data.rows.map((row) => row.sourceRow),
    [2, 5],
  );
  assert.equal(imported.data.rows[0].cells[3].raw, '001441234567');
  assert.equal(imported.data.issues[0].address, 'K2');
  assert.equal(imported.origin, 'google');
  assert.equal(imported.googleReadAt, input.readAt);
});
test('Google recusa aba, cabeçalho, célula, limite e base vazia inesperados sem truncar dados', () => {
  const variants = [
    (s) => (s.sheetName = 'Clientes'),
    (s) => (s.rows[0][1] = cell('Coluna errada')),
    (s) => (s.rows[1][0] = cell(Infinity)),
    (s) => (s.rows[1][0].type = 'x'),
    (s) => (s.rows[1] = Array(201).fill(null)),
    (s) => (s.rows = Array.from({ length: 50001 }, () => [])),
    (s) => (s.rows = [s.rows[0], []]),
  ];
  for (const change of variants) {
    const data = snapshot();
    change(data);
    assert.throws(() => importGoogleOrders(data));
  }
});
