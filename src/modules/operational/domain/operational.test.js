/**
 * Testes de regressão: Leitura, revisão e vínculo do parque operacional. Ausência no histórico limitado de OS não significa erro.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importOperational, linkOperational, operationalDate } from './operational.js';
import { linkConsumption } from '../../consumption/domain/lineConsumption.js';
import { emptyHistory, validateBackup } from '../../consumption/data/consumptionHistory.js';

function compactWorkbook({ serialError = false, duplicate = false, missing = false } = {}) {
  const sheet = {};
  const headers = {
    A: 'Nº',
    B: 'CNPJ / CPF',
    C: 'RAZÃO SOCIAL',
    S: 'Inicio ciclo',
    T: 'Fim Ciclo',
    AU: 'Plano Contratado',
    AJ: 'Mensalidade',
    AK: 'Cobrança',
    AL: 'Situação',
    AM: 'Data Cancelamento',
    AV: 'Data Implementação',
    AY: 'Placa instalada',
    BC: 'Equipamentos',
    BE: 'Modelo',
    BG: 'Telefone',
    BH: 'ICCID',
    BJ: 'APN',
    BP: 'Modelo',
    BR: 'Situação',
    BU: 'RAZÃO SOCIAL',
  };
  for (const [col, value] of Object.entries(headers)) sheet[col + '1'] = { t: 's', v: value };
  const record = {
    A: 1,
    C: 'Cliente',
    S: 46023,
    T: 46022,
    AU: 'Plano',
    AJ: 25.5,
    AK: 0,
    AL: 'Cancelado',
    AY: 'ABC1D23',
    BC: '00162',
    BE: 'Modelo original',
    BG: '005511913795620',
    BH: '089551805670305208517',
    AV: 46000,
  };
  for (const row of duplicate ? [2, 3] : [2])
    for (const [col, value] of Object.entries(record))
      sheet[col + row] = { t: typeof value === 'number' ? 'n' : 's', v: value };
  sheet.BU4 = { t: 's', v: 'Resumo auxiliar' };
  if (serialError) sheet.BC2 = { t: 'e', v: 7 };
  if (missing) delete sheet.AJ1;
  sheet['!ref'] = 'A1:CB4';
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Equipamentos');
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}

test('layout compacto preserva campos, endereços e vínculos sem importar resumos auxiliares', async () => {
  const data = importOperational(compactWorkbook());
  assert.equal(data.columns.length, 62);
  assert.equal(data.rows.length, 1);
  assert.equal(data.skipped, 0);
  const row = data.rows[0];
  assert.equal(row.serial, '00162');
  assert.equal(row.iccid, '089551805670305208517');
  assert.equal(row.phone, '005511913795620');
  assert.equal(row.plan, 'Plano');
  assert.equal(row.model, 'Modelo original');
  assert.equal(row.monthlyCents, 2550);
  assert.equal(row.chargeCents, 0);
  assert.ok(data.issues.some((issue) => issue.address === 'AM2'));
  assert.ok(data.issues.some((issue) => issue.address === 'T2'));
  const orders = {
    columns: [{ label: 'ID Rastreador' }, { label: 'Placa' }],
    rows: [{ cells: [{ raw: '00162' }, { raw: 'ABC1D23' }] }],
  };
  assert.equal(linkOperational(data, orders)[0].services.length, 1);
  const consumption = [{ iccid: row.iccid, number: row.phone }];
  assert.equal(linkConsumption(consumption, { data })[0].link.serial, '00162');
  const backup = { ...emptyHistory(), operational: { filename: 'teste.xlsx', data } };
  assert.equal(
    (await validateBackup(JSON.stringify(backup))).operational.data.rows[0].serial,
    '00162',
  );
  row.layout = 'legacy';
  await assert.rejects(validateBackup(JSON.stringify(backup)), /Registro operacional incompatível/);
});

test('layout compacto bloqueia cabeçalhos ausentes, erros no serial e vínculos duplicados', () => {
  assert.throws(() => importOperational(compactWorkbook({ missing: true })), /cabeçalhos/);
  const orders = { columns: [{ label: 'ID Rastreador' }, { label: 'Placa' }], rows: [] };
  const broken = importOperational(compactWorkbook({ serialError: true }));
  assert.equal(
    linkOperational(broken, orders)[0].state,
    'Identificação incompleta ou incompatível',
  );
  const duplicate = importOperational(compactWorkbook({ duplicate: true }));
  assert.equal(linkOperational(duplicate, orders)[0].state, 'Vínculo operacional ambíguo');
  assert.ok(
    duplicate.issues.some(
      (issue) => issue.address === 'BC2' && issue.category === 'Possível divergência',
    ),
  );
});
function workbook(records) {
  const sheet = {
    A1: { t: 's', v: 'Nº' },
    BH1: { t: 's', v: 'Equipamentos' },
    BF1: { t: 's', v: 'Placa instalada' },
    AU1: { t: 's', v: 'Situação' },
    '!ref': `A1:DO${records.length + 2}`,
  };
  records.forEach((record, index) => {
    for (const [col, value] of Object.entries(record))
      sheet[col + (index + 2)] = { t: typeof value === 'number' ? 'n' : 's', v: value };
  });
  sheet.CJ2 = { t: 's', v: 'Resumo auxiliar' };
  sheet.CJ1 = { t: 's', v: 'RAZÃO SOCIAL' };
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Equipamentos');
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
test('operacional limita tabela a A:BY, preserva IDs e revisa cancelamento sem data', () => {
  const data = importOperational(
    workbook([
      {
        A: 1,
        C: 'Cliente',
        BH: '00162',
        BF: 'ABC1D23',
        BN: '89999999999999999999',
        AU: 'Cancelado',
        AS: 10,
        AT: 0,
      },
      { A: 2, C: 'Cliente', BH: '00162', BF: 'ABC1D23', BN: '123', AU: 'Ativo', AS: 20, AT: 20 },
    ]),
  );
  assert.equal(data.columns.length, 77);
  assert.equal(data.rows.length, 2);
  assert.equal(data.rows[0].iccid, '89999999999999999999');
  assert.equal(data.rows[0].chargeCents, 0);
  assert.ok(data.issues.some((i) => i.address === 'AV2'));
  assert.ok(data.issues.some((i) => i.address === 'BH2' && i.category === 'Possível divergência'));
  assert.equal(data.rows[0].status, 'Cancelado');
});
const orders = {
  columns: [{ label: 'ID Rastreador' }, { label: 'Placa' }, { label: 'Status' }],
  rows: [
    { sourceRow: 2, cells: [{ raw: '162123' }, { raw: 'ABC1D23' }, { raw: 'Pago' }] },
    { sourceRow: 3, cells: [{ raw: '162123' }, { raw: 'OUTRA' }, { raw: 'Pago' }] },
  ],
};
test('ausência em OS é cobertura histórica e não erro; pares repetidos não recebem atribuição', () => {
  const data = {
    rows: [
      { sourceRow: 2, serial: '162123', plate: 'ABC1D23' },
      { sourceRow: 3, serial: '144456', plate: 'DEF4G56' },
    ],
    issues: [],
  };
  let links = linkOperational(data, orders);
  assert.equal(links[0].services.length, 1);
  assert.equal(links[1].state, 'Sem atendimento no histórico disponível');
  assert.equal(data.issues.length, 0);
  data.rows.push({ ...data.rows[0], sourceRow: 4 });
  links = linkOperational(data, orders);
  assert.equal(links[0].state, 'Vínculo operacional ambíguo');
  assert.equal(links[0].services.length, 0);
  assert.equal(linkOperational(data, null)[0].state, 'OS não importada');
});
test('vínculo exige cabeçalhos, serial válido e célula OS sem erro', () => {
  const data = { rows: [{ serial: '162123', plate: 'ABC1D23' }] };
  assert.equal(
    linkOperational(data, { columns: [], rows: [] })[0].state,
    'OS sem colunas para vínculo',
  );
  const broken = {
    ...orders,
    rows: [{ ...orders.rows[0], cells: [{ raw: '162123', issue: true }, { raw: 'ABC1D23' }] }],
  };
  assert.equal(linkOperational(data, broken)[0].services.length, 0);
  assert.equal(
    linkOperational({ rows: [{ serial: 'Pendente', plate: 'ABC1D23' }] }, orders)[0].state,
    'Identificação incompleta ou incompatível',
  );
});
test('datas operacionais respeitam epoch, rejeitam texto e layout diferente falha', () => {
  assert.equal(operationalDate(0, true), '1904-01-01');
  assert.equal(operationalDate('01/01/2026'), null);
  assert.equal(operationalDate(60), null);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['Outro']]), 'Equipamentos');
  assert.throws(
    () => importOperational(XLSX.write(book, { type: 'array', bookType: 'xlsx' })),
    /cabeçalho/,
  );
});
