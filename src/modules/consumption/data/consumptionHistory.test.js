/**
 * Testes de regressão: Persistência e backup do consumo no IndexedDB deste navegador. Não envia arquivos ou registros ao servidor.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importOperational } from '../../operational/domain/operational.js';
import { fileDigest, validateBackup, emptyHistory } from './consumptionHistory.js';
const source =
  'ICCID;MSISDN;Período Início;Período Término;Consumo (MB)\n089551805670305208517;005511913795620;01/09/2026;28/09/2026;1';
const file = (text = source) => ({
  id: 'not-trusted',
  text,
  filename: 'Arqia.csv',
  importedAt: '2026-10-10T12:00:00Z',
  active: true,
});
const note = {
  id: 'n1',
  operator: 'Arqia',
  iccid: '089551805670305208517',
  date: '2026-10-10',
  text: 'Reconfigurado',
  status: 'Ação realizada',
  serial: '123',
  client: 'Cliente A',
};
test('backup confere CSV/hash e preserva versões arquivadas, notas, zeros iniciais e referência', async () => {
  const history = {
    ...emptyHistory(),
    files: [file(), { ...file(source.replace(';1', ';2')), active: false }],
    notes: [note],
    settings: { factor: 3, periods: { Arqia: 'p' } },
  };
  const parsed = await validateBackup(JSON.stringify(history));
  assert.equal(parsed.files.length, 2);
  assert.equal(parsed.files[0].id, await fileDigest(source));
  assert.equal(parsed.files[0].text, source);
  assert.equal(parsed.files[1].active, false);
  assert.deepEqual(parsed.notes, [note]);
  assert.equal(parsed.settings.factor, 3);
  assert.equal(parsed.settings.periods.Arqia, 'p');
});
test('restauração rejeita arquivos repetidos, duas versões ativas, notas com datas impossíveis e CSV incompatível', async () => {
  await assert.rejects(validateBackup('{'), /JSON inválido/);
  await assert.rejects(
    validateBackup(JSON.stringify({ ...emptyHistory(), files: [file(), file()] })),
    /arquivos repetidos/,
  );
  await assert.rejects(
    validateBackup(
      JSON.stringify({ ...emptyHistory(), files: [file(), file(source.replace(/;1$/, ';2'))] }),
    ),
    /mais de uma versão/,
  );
  await assert.rejects(
    validateBackup(JSON.stringify({ ...emptyHistory(), notes: [{ ...note, date: '2026-02-31' }] })),
    /Anotação incompatível/,
  );
  await assert.rejects(
    validateBackup(JSON.stringify({ ...emptyHistory(), files: [file('A;B\n1;2')] })),
    /Formato não reconhecido/,
  );
  await assert.rejects(
    validateBackup(
      JSON.stringify({
        ...emptyHistory(),
        operational: { filename: 'x', data: { rows: [], columns: [] } },
      }),
    ),
    /operacional incompatível/,
  );
});

test('backup guarda referência operacional real e rejeita identificadores alterados fora dos originais', async () => {
  const sheet = {};
  for (const [address, value] of Object.entries({
    A1: 'Nº',
    AU1: 'Situação',
    BF1: 'Placa instalada',
    BH1: 'Equipamentos',
    A2: 1,
    C2: 'Cliente A',
    AU2: 'Ativo',
    BF2: 'ABC1D23',
    BH2: '1440123456',
    BJ2: 'Modelo A',
    BM2: '005511913795620',
    BN2: '089551805670305208517',
  }))
    sheet[address] = { t: typeof value === 'number' ? 'n' : 's', v: value };
  sheet['!ref'] = 'A1:BY2';
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Equipamentos');
  const operational = {
    filename: 'Operacional.xlsx',
    data: importOperational(XLSX.write(book, { type: 'array', bookType: 'xlsx' })),
  };
  const backup = { ...emptyHistory(), operational };
  const restored = await validateBackup(JSON.stringify(backup));
  assert.equal(restored.operational.data.rows[0].iccid, '089551805670305208517');
  assert.equal(restored.operational.data.rows[0].phone, '005511913795620');
  operational.data.rows[0].iccid = '999';
  await assert.rejects(validateBackup(JSON.stringify(backup)), /Registro operacional incompatível/);
});
