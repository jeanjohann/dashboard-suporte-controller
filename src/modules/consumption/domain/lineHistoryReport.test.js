import { test } from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { lineHistoryReport, lineHistoryCsv, lineHistoryWorkbook } from './lineHistoryReport.js';
import { createHistoryRepository } from '../data/historyRepository.js';

test('relatório preserva períodos sobrepostos, identidade textual e somente anotações do chip', () => {
  const row = {
    operator: 'Arqia',
    iccid: '089551805670305208517',
    number: '005511913795620',
    period: '01/09 a 30/09',
    days: 30,
    mb: 15,
    mbDay: 0.5,
    filename: 'extrato.csv',
    sourceRow: 2,
  };
  const report = lineHistoryReport(
    [row, { ...row, period: '01/09 a 07/09', days: 7, mb: 7, mbDay: 1 }],
    [
      {
        operator: 'Arqia',
        iccid: row.iccid,
        date: '2026-10-01',
        status: 'Investigar',
        text: '=1+1',
        client: 'Cliente original',
        serial: '00162',
      },
      {
        operator: 'Kore',
        iccid: row.iccid,
        date: '2026-10-02',
        status: 'Encerrado',
        text: 'Outro chip',
      },
    ],
    '2026-10-11T12:00:00Z',
  );
  assert.equal(report.periods.length, 3);
  assert.equal(report.notes.length, 2);
  assert.match(lineHistoryCsv(report), /'=1\+1/);
  const book = XLSX.read(lineHistoryWorkbook(report), { type: 'array' });
  assert.equal(book.Sheets.Apurações.B2.v, row.iccid);
  assert.equal(book.Sheets.Apurações.C2.v, row.number);
  assert.equal(book.Sheets.Apurações.F2.t, 'n');
  assert.equal(book.Sheets.Acompanhamento.E2.t, 's');
  assert.equal(book.Sheets.Acompanhamento.E2.f, undefined);
  assert.equal(book.Sheets.Acompanhamento.F2.v, 'Cliente original');
  assert.throws(() => lineHistoryReport([], []), /Selecione/);
});

test('contrato de armazenamento propaga falha e aguarda confirmação do adaptador', async () => {
  let stored = { notes: [] };
  const repository = createHistoryRepository({
    read: async () => stored,
    write: async (next) => {
      stored = next;
    },
  });
  const next = { notes: ['observação'] };
  await repository.write(next);
  assert.equal(await repository.read(), next);
  await assert.rejects(
    createHistoryRepository({
      read: async () => stored,
      write: async () => {
        throw new Error('Falha de gravação');
      },
    }).write(next),
    /Falha de gravação/,
  );
  assert.throws(() => createHistoryRepository({}), /leitura e gravação/);
});
