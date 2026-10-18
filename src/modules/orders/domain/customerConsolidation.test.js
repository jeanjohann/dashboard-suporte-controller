import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importWorkbook } from '../data/import.js';
import { customerIdentity, customerAnalysisIdentity } from './customerIdentity.js';
import { groupedCosts } from './insights.js';
import { periodMetrics } from './dashboard.js';
import { replacementRankings } from './replacementRankings.js';
import { descriptiveReport, descriptiveWorkbook } from './descriptive.js';
import { supportPerformance } from './supportPerformance.js';
import { fieldLife } from './fieldLife.js';

const a = '12.345.678/0001-95',
  b = '63.246.490/0001-20';
function sample(
  entries = [
    [a, 'Matriz', 'Grupo teste'],
    [b, 'Filial', 'Grupo teste'],
  ],
  headers = ['CNPJ', 'Razão Social', 'Cliente consolidado'],
) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([headers, ...entries]),
    'Base clientes',
  );
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ['#', 'Status', 'CNPJ para Cobrança', 'Razão Social', 'Custo Total', 'Placa'],
      ['#1', 'Pago', a, 'Nome original A', 10, 'ABC-1D23'],
      ['#1', 'Concluída', b, 'Nome original B', 20, 'ABC-1D23'],
      ['#2', 'Pago', a, 'Variação A', 30, 'DEF-4G56'],
    ]),
    'OS 2025_26',
  );
  return {
    ...importWorkbook(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' })),
    customerGrouping: 'consolidated',
    consolidateIdenticalNames: true,
  };
}

test('consolidação soma serviços/custos e recalcula chamados únicos sem alterar CNPJ ou veículos da origem', () => {
  const data = sample(),
    before = JSON.stringify(data.rows);
  const [group] = groupedCosts(data);
  assert.equal(groupedCosts(data).length, 1);
  assert.equal(group.label, 'Grupo teste');
  assert.equal(group.rows.length, 3);
  assert.equal(group.cost.sum, 6000);
  assert.equal(group.calls.size, 2); // #1 atravessa filiais: não somar 2 + 1 chamados.
  assert.equal(periodMetrics(data).clients, 1);
  assert.equal(periodMetrics(data).vehicles, 3); // CNPJ + placa permanece conservador.
  assert.equal(customerIdentity(data, data.rows[0]).key, '12345678000195');
  assert.equal(customerIdentity(data, data.rows[1]).key, '63246490000120');
  assert.equal(JSON.stringify(data.rows), before);
  const branches = { ...data, customerGrouping: 'cnpj' };
  assert.equal(groupedCosts(branches).length, 2);
  assert.equal(periodMetrics(branches).clients, 2);
});

test('razões sociais exatamente iguais consolidam com autorização; nomes parecidos, raiz ou ausência de cadastro não bastam', () => {
  const exact = sample([
    [a, 'Mesmo cliente', null],
    [b, 'Mesmo cliente', null],
  ]);
  assert.equal(groupedCosts(exact).length, 1);
  assert.equal(groupedCosts({ ...exact, consolidateIdenticalNames: false }).length, 2);
  const similar = sample([
    [a, 'Mesmo cliente', null],
    [b, 'Mesmo Cliente', null],
  ]);
  assert.equal(groupedCosts(similar).length, 2);
  assert.equal(groupedCosts({ ...exact, customerRegistry: null }).length, 2);
  const override = sample([
    [a, 'Mesmo cliente', 'Unidade independente'],
    [b, 'Mesmo cliente', null],
  ]);
  assert.equal(groupedCosts(override).length, 2);
});

test('cadastro divergente, mapeamento parcial e colunas duplicadas mantêm o CNPJ separado para revisão', () => {
  for (const entries of [
    [
      [a, 'Matriz', 'Grupo teste'],
      [a, 'Matriz', 'Outro grupo'],
      [b, 'Filial', 'Grupo teste'],
    ],
    [
      [a, 'Matriz', 'Grupo teste'],
      [a, 'Matriz', null],
      [b, 'Filial', 'Grupo teste'],
    ],
    [
      [a, 'Matriz', null],
      [a, 'Cadastro divergente', null],
      [b, 'Filial', null],
    ],
  ]) {
    const d = sample(entries);
    assert.equal(customerAnalysisIdentity(d, d.rows[0]).key, '12345678000195');
    assert.ok(d.customerRegistry.issues.length);
  }
  const duplicate = sample(
    [
      [a, 'Igual', 'Grupo', 'Outro'],
      [b, 'Igual', 'Grupo', 'Outro'],
    ],
    ['CNPJ', 'Razão Social', 'Cliente consolidado', 'Cliente consolidado'],
  );
  assert.equal(groupedCosts(duplicate).length, 2);
  assert.match(duplicate.customerRegistry.issues[0].reason, /Mais de uma coluna/);
});

test('ranking por cliente consolida ocorrências; veículo e detalhes mantêm o CNPJ original', () => {
  const data = sample();
  const events = data.rows.slice(0, 2).map((row) => {
    const client = customerIdentity(data, row);
    return {
      key: String(row.sourceRow),
      clientKey: client.key,
      client: client.label,
      category: 'RFID',
      plate: 'ABC-1D23',
      rows: [row.sourceRow],
    };
  });
  const result = replacementRankings(events, 'client', data);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].value, 2);
  assert.equal(result.groups[0].rfid, 2);
  assert.equal(new Set(result.groups[0].events.map((e) => e.clientKey)).size, 2);
  assert.equal(replacementRankings(events, 'vehicle', data).groups.length, 2);
  assert.equal(
    replacementRankings(events, 'client', { ...data, customerGrouping: 'cnpj' }).groups.length,
    2,
  );
});

test('relatório descritivo exporta agrupamento consolidado, chamados sem duplicar e linhas originais', () => {
  const data = sample();
  const result = descriptiveReport(data, data, null, null, ['clients']);
  assert.ok(result.records.every((r) => r.grouping === 'Cliente consolidado'));
  assert.equal(result.records.find((r) => r.indicator === 'Chamados distintos').value, 2);
  assert.ok(result.records.every((r) => r.group === 'Grupo teste'));
  const bytes = descriptiveWorkbook(result, data, {
    filename: 'teste.xlsx',
    filters: { agrupamentoClientes: 'Cliente consolidado' },
  });
  const book = XLSX.read(bytes, { type: 'array' });
  const content = JSON.stringify(
    book.SheetNames.map((n) => XLSX.utils.sheet_to_json(book.Sheets[n], { header: 1 })),
  );
  assert.ok(content.includes('Cliente consolidado'));
  assert.ok(content.includes(a));
  assert.ok(content.includes(b));
});

function appendColumn(data, label, values) {
  const index = data.columns.length;
  data.columns.push({ label, index, letter: XLSX.utils.encode_col(index) });
  data.rows.forEach((row, i) => row.cells.push({ raw: values[i], display: String(values[i]) }));
}

test('suporte consolida clientes, preservando chamados únicos e identificação dos veículos por filial', () => {
  const d = sample();
  appendColumn(d, 'Resp. Execução', ['Agente A', 'Agente A', 'Agente B']);
  appendColumn(d, 'Data de atendimento', [45658, 45658, 45659]);
  const result = supportPerformance(d);
  assert.equal(result.totals.clients, 1);
  assert.equal(result.totals.calls, 2);
  assert.equal(result.totals.vehicles, 3);
  assert.equal(result.groups.find((r) => r.label === 'Agente A').calls, 1);
  assert.equal(supportPerformance({ ...d, customerGrouping: 'cnpj' }).totals.clients, 2);
});

test('consolidar cliente nunca usa troca de outra filial para encerrar vida em campo', () => {
  const d = sample();
  // Mesmo grupo, placa e serial; implementação na matriz e troca apenas na outra filial.
  d.rows.forEach((row, i) => {
    row.os = i === 0 ? '#implantacao' : '#troca';
    row.cells[2] = { raw: i === 0 ? a : b };
    row.cells[5] = { raw: 'ABC1D23' };
  });
  appendColumn(d, 'Tipo de Serviço', [
    'Implementação',
    'Assistência Técnica',
    'Assistência Técnica',
  ]);
  appendColumn(d, 'Motivo', [
    'Instalação Business 2.1',
    'Desinstalação Business 2.1',
    'Instalação Business 2.1',
  ]);
  appendColumn(d, 'ID Rastreador', ['144000001', '144000001', '162000002']);
  appendColumn(d, 'Data de atendimento', [45658, 45689, 45689]);
  const branches = { ...d, customerGrouping: 'cnpj' };
  const result = fieldLife(d, d);
  assert.equal(result.trackerAvailable, true);
  assert.ok(result.periods.length);
  assert.equal(
    result.periods.some((p) => p.state === 'replaced'),
    false,
  );
  assert.deepEqual(result, fieldLife(branches, branches));
});
