/** Regressões de origem, datas, contagem de movimentações e duplicidade no contexto completo. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importLogistics, logisticsDate, selectLogistics } from './logistics.js';

const shipping = [
  'Chamado',
  'Envio',
  'Recebimento',
  'Cliente',
  'Equipamento',
  'ID',
  'Rastreio',
  'Cidade',
  'A/C',
];
const returning = ['Data Recebimento', 'Equipamento', 'ID', 'Cliente', 'Placa', 'Situação'];
function fixture(shipments = [], returns = [], edit) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([shipping, ...shipments]), 'Envios');
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([returning, ...returns]),
    'Devoluções',
  );
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([['Somente quantidade'], ['67 unidades']]),
    'Consertos Nicolay',
  );
  edit?.(book);
  return importLogistics(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }));
}
const shipment = (id, date = '01/01/2025', received = '03/01/2025', client = 'Cliente') => [
  '#1',
  date,
  received,
  client,
  'Rastreador + relé',
  id,
  'Rastreio',
  'Cidade',
  'Destinatário',
];
test('importa apenas envios/devoluções, preserva IDs textuais, fórmulas e todas as movimentações', () => {
  const data = fixture(
    [shipment('00144123'), shipment('')],
    [['03/01/2025', 'Coletora', '-', 'Cliente', '-', 'NOK']],
  );
  assert.equal(data.rows.length, 3);
  assert.deepEqual(
    data.sheets.map((sheet) => sheet.name),
    ['Envios', 'Devoluções'],
  );
  assert.equal(data.rows[0].id, '00144123');
  assert.equal(data.rows[0].sourceRow, 2);
  assert.equal(data.rows[2].sourceRow, 2);
  assert.equal(data.rows[2].condition, 'NOK');
  assert.equal(selectLogistics(data).returnsReceived, 1);
  assert.ok(data.issues.some((issue) => issue.address === 'F3' && issue.sheet === 'Envios'));
});
test('mesmo ID pode repetir em outra data; possível duplicidade não some ao filtrar e não exclui linhas', () => {
  const data = fixture([
    shipment('144123'),
    shipment('144123', '01/01/2025', '03/01/2025', 'Outro'),
    shipment('144123', '04/01/2025', '06/01/2025'),
  ]);
  const repeated = data.issues.filter((issue) => issue.reason.includes('possível duplicidade'));
  assert.equal(repeated.length, 2);
  assert.equal(data.rows.length, 3);
  const subset = selectLogistics(data, { search: 'Outro' });
  assert.equal(subset.rows.length, 1);
  assert.ok(subset.issues.some((issue) => issue.reason.includes('possível duplicidade')));
});
test('datas invertidas e sem data não confirmam recebimento e não dependem da situação', () => {
  const data = fixture(
    [shipment('144123', '03/01/2025', '01/01/2025')],
    [
      ['-', 'Coletora', '1234', 'Cliente', '', 'OK'],
      ['05/01/2025', 'RFID', '4567', 'Cliente', '', 'Inservível'],
    ],
  );
  const summary = selectLogistics(data);
  assert.equal(summary.shipmentsReceived, 0);
  assert.equal(summary.returnsReceived, 1);
  assert.ok(data.issues.some((issue) => issue.reason.includes('anterior')));
  assert.equal(selectLogistics(data, { receipt: 'recorded' }).rows.length, 1);
});
test('período usa envio para saídas e recebimento para devoluções, informando exclusões', () => {
  const data = fixture(
    [shipment('1', '01/01/2025', '10/01/2025')],
    [
      ['10/01/2025', 'Coletora', '2', 'Cliente', '', 'OK'],
      ['-', 'RFID', '3', 'Cliente', '', 'OK'],
    ],
  );
  const selected = selectLogistics(data, {
    start: '10/01/2025'.split('/').reverse().join('-'),
    end: '2025-01-10',
  });
  assert.equal(selected.rows.length, 1);
  assert.equal(selected.rows[0].type, 'Devolução');
  assert.equal(selected.missingDates, 1);
  assert.equal(selectLogistics(data).rows.length, 3);
  assert.equal(selectLogistics(data, { start: '2025-02-01', end: '2025-01-01' }).rows.length, 0);
});
test('datas impossíveis e números na coluna ID com formato de data exigem conferência sem apagar origem', () => {
  assert.equal(logisticsDate({ raw: '31/02/2025' }), null);
  assert.equal(logisticsDate({ raw: 60 }), null);
  assert.equal(logisticsDate({ raw: 0 }, true), '1904-01-01');
  const data = fixture([shipment(1440309691, '31/02/2025')], [], (book) => {
    book.Sheets.Envios.F2.z = 'dd/mm/yyyy';
  });
  assert.equal(data.rows[0].cells[5].raw, 1440309691);
  assert.ok(
    data.issues.some((issue) => issue.column === 'ID' && issue.reason.includes('formato de data')),
  );
  assert.equal(data.rows[0].sentAt, null);
});
test('falta de aba e cabeçalho ambíguo rejeitam a estrutura', () => {
  assert.throws(
    () =>
      fixture([], [], (book) => {
        delete book.Sheets.Devoluções;
        book.SheetNames = book.SheetNames.filter((name) => name !== 'Devoluções');
      }),
    /Devoluções/,
  );
  assert.throws(
    () =>
      fixture([], [], (book) => {
        book.Sheets.Envios.B1.v = 'Chamado';
      }),
    /cabeçalhos/,
  );
});
