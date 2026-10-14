/**
 * Testes de regressão: Reconhecimento e montagem do lote de importação. As bases são validadas antes de atualizar o estado do aplicativo.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { inspectImportFile, assembleImportBatch, mergeBulkHistory } from './bulkImport.js';
import { emptyHistory } from '../../consumption/data/consumptionHistory.js';
function excel(names) {
  const book = XLSX.utils.book_new();
  for (const name of names) {
    const sheet =
      name === 'Equipamentos'
        ? {
            A1: { t: 's', v: 'Nº' },
            BH1: { t: 's', v: 'Equipamentos' },
            BF1: { t: 's', v: 'Placa instalada' },
            AU1: { t: 's', v: 'Situação' },
            A2: { t: 'n', v: 1 },
            BH2: { t: 's', v: '162123' },
            BF2: { t: 's', v: 'ABC1D23' },
            AU2: { t: 's', v: 'Ativo' },
            '!ref': 'A1:BY2',
          }
        : XLSX.utils.aoa_to_sheet([
            ['#', 'Status', 'Placa', 'ID Rastreador'],
            ['1', 'Pago', 'ABC1D23', '162123'],
          ]);
    XLSX.utils.book_append_sheet(book, sheet, name);
  }
  const bytes = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  return { name: 'qualquer-nome.xlsx', arrayBuffer: async () => bytes };
}
const csv =
  'ICCID;MSISDN;Período Início;Período Término;Consumo (MB);Plano\n89999999999999999999;5511999999999;01/09/2026;28/09/2026;10;20 MB';
const file = (text) => ({
  name: 'consumo.csv',
  arrayBuffer: async () => new TextEncoder().encode(text).buffer,
});

test('lote reconhece logística isolada e recusa duas referências sem depender do nome do arquivo', async () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      [
        'Chamado',
        'Envio',
        'Recebimento',
        'Cliente',
        'Equipamento',
        'ID',
        'Rastreio',
        'Cidade',
        'A/C',
      ],
      [
        '#1',
        '01/01/2025',
        '02/01/2025',
        'Cliente',
        'Coletora',
        '00123',
        'Código',
        'Cidade',
        'Destinatário',
      ],
    ]),
    'Envios',
  );
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ['Data Recebimento', 'Equipamento', 'ID', 'Cliente', 'Placa', 'Situação'],
    ]),
    'Devoluções',
  );
  const bytes = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  const item = await inspectImportFile({ name: 'modelo.xlsx', arrayBuffer: async () => bytes });
  assert.deepEqual(item.types, ['logistics']);
  assert.equal(item.logistics.data.rows[0].id, '00123');
  const batch = assembleImportBatch([item]);
  assert.equal(batch.logistics.data.rows.length, 1);
  assert.equal(batch.orders, null);
  assert.equal(batch.operational, null);
  assert.throws(() => assembleImportBatch([item, item]), /apenas um/);
});
test('lote reconhece duas abas no mesmo Excel e preserva linhas de origem', async () => {
  const item = await inspectImportFile(excel(['OS 2025', 'Equipamentos']));
  assert.deepEqual(item.types, ['orders', 'operational']);
  assert.equal(item.orders.data.rows[0].sourceRow, 2);
  assert.equal(item.operational.data.rows[0].serial, '162123');
  const batch = assembleImportBatch([item]);
  assert.ok(batch.orders && batch.operational);
  assert.throws(() => assembleImportBatch([item, item]), /apenas um/);
});

test('lote reconhece OS 2025_26 com operacional e rejeita duas bases de OS no mesmo arquivo', async () => {
  const item = await inspectImportFile(excel(['OS 2025_26', 'Equipamentos']));
  assert.deepEqual(item.types, ['orders', 'operational']);
  assert.equal(item.orders.data.sheetName, 'OS 2025_26');
  assert.equal(item.orders.data.rows[0].sourceRow, 2);
  assert.equal(item.operational.data.rows[0].serial, '162123');
  assert.equal(assembleImportBatch([item]).orders, item.orders);
  await assert.rejects(() => inspectImportFile(excel(['OS 2025', 'OS 2025_26'])), /duas abas/);
});
test('lote rejeita arquivo sem aba reconhecida e seleção vazia', async () => {
  await assert.rejects(() => inspectImportFile(excel(['Outro'])), /Nenhuma aba/);
  assert.throws(() => assembleImportBatch([]), /ao menos/);
  assert.throws(() => assembleImportBatch([{ error: 'erro' }]), /com erro/);
});
test('histórico consolidado preserva notas, configurações e evita repetir arquivo idêntico', async () => {
  const item = await inspectImportFile(file(csv));
  const archive = { ...emptyHistory(), notes: [{ text: 'revisar' }] };
  const first = mergeBulkHistory(archive, assembleImportBatch([item]));
  const second = mergeBulkHistory(first, assembleImportBatch([item]));
  assert.equal(second.files.length, 1);
  assert.deepEqual(second.notes, archive.notes);
  assert.deepEqual(second.settings, archive.settings);
  assert.equal(archive.files.length, 0);
});
test('dois consumos diferentes do mesmo período são rejeitados sem alterar histórico', async () => {
  const a = await inspectImportFile(file(csv)),
    b = await inspectImportFile(file(csv.replace(';10;', ';12;')));
  const archive = emptyHistory();
  assert.throws(() => mergeBulkHistory(archive, assembleImportBatch([a, b])));
  assert.equal(archive.files.length, 0);
});
