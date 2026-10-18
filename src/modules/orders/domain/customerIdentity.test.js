import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importWorkbook } from '../data/import.js';
import { customerIdentity, normalizeCnpj } from './customerIdentity.js';
import { groupedCosts } from './insights.js';
const branch1 = '12.345.678/0001-95',
  branch2 = '12.345.678/0002-76';
function imported({ registry = true, conflict = false } = {}) {
  const b = XLSX.utils.book_new();
  if (registry)
    XLSX.utils.book_append_sheet(
      b,
      XLSX.utils.aoa_to_sheet([
        ['CNPJ', 'Razão Social', 'Preço privado'],
        [branch1, 'Cliente matriz', 999],
        [branch2, 'Cliente filial', 888],
        ...(conflict ? [[branch1, 'Outro cadastro', 111]] : []),
      ]),
      'Base clientes',
    );
  const sheet = XLSX.utils.aoa_to_sheet([
    ['#', 'Status', 'CNPJ para Cobrança', 'Razão Social', 'Custo Total'],
    ['#1', 'Pago', branch1, 'Mesmo nome', 10],
    ['#2', 'Pago', branch2, 'Mesmo nome', 20],
    ['#3', 'Pago', branch1, 'Outra grafia', 30],
  ]);
  sheet.AK1 = { t: 's', v: 'CNPJ para Cobrança' };
  sheet.AK2 = { t: 's', v: branch2 };
  sheet['!ref'] = 'A1:AK4';
  XLSX.utils.book_append_sheet(b, sheet, 'OS 2025_26');
  return importWorkbook(XLSX.write(b, { type: 'buffer', bookType: 'xlsx' }));
}
test('coluna C e cadastro identificam matriz/filial; AK não muda identidade nem une raiz igual', () => {
  const d = imported();
  const before = JSON.stringify(d.rows);
  const groups = groupedCosts(d);
  assert.equal(groups.length, 2);
  assert.equal(groups.find((g) => g.label.includes('matriz')).cost.sum, 4000);
  assert.equal(groups.find((g) => g.label.includes('filial')).cost.sum, 2000);
  assert.equal(customerIdentity(d, d.rows[0]).cnpj, '12345678000195');
  assert.equal(customerIdentity(d, d.rows[0]).sourceRows[0], 2);
  assert.equal(JSON.stringify(d.rows), before);
  assert.ok(!JSON.stringify(d.customerRegistry).includes('999'));
});
test('sem cadastro, CNPJ completo ainda separa filiais e agrupa variações do nome; conflito não escolhe nome', () => {
  const d = imported({ registry: false });
  assert.equal(groupedCosts(d).length, 2);
  assert.equal(customerIdentity(d, d.rows[0]).status, 'Base clientes não disponível');
  const conflict = imported({ conflict: true });
  assert.equal(customerIdentity(conflict, conflict.rows[0]).status, 'Cadastro divergente');
  assert.match(customerIdentity(conflict, conflict.rows[0]).label, /Cadastro divergente/);
  assert.match(conflict.customerRegistry.issues[0].reason, /razões sociais diferentes/);
});
test('documentos com zeros iniciais são texto preservado; ausências, erros e precisão perdida não viram CNPJ', () => {
  assert.equal(normalizeCnpj({ raw: '01.234.567/0001-99' }), '01234567000199');
  for (const raw of [
    null,
    '12345678901',
    '1234567800019',
    '00000000000000',
    'ABC12345678000195',
    Number.MAX_SAFE_INTEGER + 1,
  ])
    assert.equal(normalizeCnpj({ raw }), null);
  assert.equal(normalizeCnpj({ raw: branch1, issue: true }), null);
});
