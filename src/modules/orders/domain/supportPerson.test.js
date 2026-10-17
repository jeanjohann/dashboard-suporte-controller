/** Bases individuais, datas independentes e arquivos exportados: somente dados fictícios. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { supportPerformance } from './supportPerformance.js';
import { supportPerson } from './supportPerson.js';
import {
  supportReport,
  supportComparisonReport,
  supportCsv,
  supportWorkbook,
} from './supportReport.js';

const labels = [
  'Status',
  'Resp. Execução',
  'Resp. Agendamento',
  'Data de atendimento',
  'Agendamento',
  'Tipo de Serviço',
  'Motivo',
  'Razão Social',
  'Placa',
];
const serial = (date) => Date.parse(date + 'T00:00:00Z') / 86400000 + 25569;
const filters = { start: '2026-10-09', end: '2026-10-15' };
function fixture() {
  const values = [
    [
      'Concluída',
      ' Ana ',
      'Bia',
      serial('2026-10-15'),
      serial('2026-10-08'),
      'Implementação',
      '',
      'Cliente A',
      'ABC1D23',
    ],
    [
      'Pago',
      'Ana',
      'Bia',
      serial('2026-10-14'),
      serial('2026-10-07'),
      'Assistência Técnica',
      'Visita Improdutiva',
      'Cliente A',
      'ABC1D23',
    ],
    [
      'Concluída',
      'Bia',
      'Ana',
      serial('2026-10-13'),
      serial('2026-10-06'),
      'Assistência Técnica',
      '',
      'Cliente A',
      'ABC1D23',
    ],
    [
      'Pago',
      '',
      'Ana',
      serial('2026-10-12'),
      serial('2026-10-05'),
      'Implementação',
      '',
      'Cliente A',
      'ABC1D23',
    ],
    [
      'Agendado',
      'Ana',
      'Bia',
      serial('2026-10-11'),
      serial('2026-10-04'),
      'Assistência Técnica',
      '',
      'Cliente C',
      'DEF1G23',
    ],
    [
      'Cancelada',
      'Ana',
      'Bia',
      serial('2026-10-11'),
      serial('2026-10-04'),
      'Assistência Técnica',
      '',
      'Cliente C',
      'DEF1G23',
    ],
    [
      'Concluída',
      'Ana',
      'Bia',
      null,
      serial('2026-10-03'),
      'Assistência Técnica',
      '',
      'Cliente C',
      'sem placa',
    ],
    [
      'Pago',
      'Ana',
      'Bia',
      serial('2026-10-08'),
      serial('2026-10-01'),
      'Assistência Técnica',
      '',
      'Cliente A',
      'ABC1D23',
    ],
  ];
  return {
    columns: labels.map((label, index) => ({ label, index, letter: XLSX.utils.encode_col(index) })),
    issues: [],
    rows: values.map((row, index) => ({
      sourceRow: index + 2,
      os: index < 4 ? '100' : String(index + 100),
      cells: row.map((raw) => ({ raw, display: String(raw ?? '') })),
    })),
  };
}

test('novos indicadores usam identificações distintas e bases realizadas, incluindo improdutivas', () => {
  const data = fixture(),
    result = supportPerformance(data, filters);
  assert.equal(result.totals.vehicles, 1);
  assert.equal(result.totals.unproductiveRate, 1 / 4);
  assert.equal(result.totals.servicesPerCall, 4);
  const ana = result.groups.find((item) => item.label === 'Ana');
  assert.equal(ana.vehicles, 1);
  assert.equal(ana.servicesPerCall, 2);
  assert.equal(ana.unproductiveRate, 1 / 2);
  assert.equal(ana.share, 1 / 3); // Inclui o efetivo sem responsável na base da participação.
  assert.equal(
    result.groups.reduce((sum, item) => sum + item.vehicles, 0),
    2,
  ); // Distintos não são aditivos.
});

test('cliente/placa com erro ou marcador ficam fora; ausência de coluna difere de zero elegível', () => {
  const data = fixture();
  data.rows[0].cells[8].issue = true;
  data.rows[1].cells[7].issue = true;
  const ana = supportPerson(data, supportPerformance(data, filters), 'Ana');
  assert.equal(ana.totals.vehicles, 0);
  assert.equal(ana.totals.vehiclesMissing, 2);
  const empty = supportPerformance(data, { start: '2040-01-01', end: '2040-01-07' });
  assert.equal(empty.totals.vehicles, 0);
  assert.equal(empty.totals.unproductiveRate, null);
  assert.equal(empty.totals.servicesPerCall, null);
  data.columns.pop();
  data.rows.forEach((row) => row.cells.pop());
  assert.equal(supportPerformance(data, filters).totals.vehicles, null);
});

test('pessoa conserva nomes com espaços, linhas, clientes, evolução e comparação sem alterar origem', () => {
  const data = fixture(),
    result = supportPerformance(data, filters),
    before = structuredClone({ data, result });
  const ana = supportPerson(data, result, 'Ana');
  assert.deepEqual(
    ana.rows.map((row) => row.sourceRow),
    [2, 3],
  );
  assert.deepEqual(
    ana.periods.map((item) => [item.label, item.productive, item.unproductive]),
    [
      ['2026-10-14', 0, 1],
      ['2026-10-15', 1, 0],
    ],
  );
  assert.deepEqual(ana.clientGroups, [{ label: 'Cliente A', value: 2, rows: [2, 3] }]);
  assert.equal(ana.participationBase, 3);
  assert.equal(ana.share, 1 / 3);
  assert.equal(ana.past.totals.productive, 1);
  assert.deepEqual(
    ana.past.rows.map((row) => row.sourceRow),
    [9],
  );
  assert.equal(ana.missingDates, 1);
  assert.equal(ana.undated, 0);
  assert.deepEqual({ data, result }, before);
  const history = supportPerson(data, supportPerformance(data), 'Ana');
  assert.equal(history.totals.visits, 4);
  assert.equal(history.totals.vehicles, 1);
  assert.equal(history.totals.vehiclesMissing, 1);
  assert.equal(history.undated, 1);
  assert.equal(
    history.periods.reduce((sum, item) => sum + item.rows.length, 0),
    3,
  );
  assert.equal(history.past, null);
});

test('Ambos conserva cada data, inclusive pessoa sem registros atuais em um dos papéis', () => {
  const data = fixture(),
    execution = supportPerson(data, supportPerformance(data, filters), 'Ana'),
    scheduling = supportPerson(data, supportPerformance(data, filters, 'scheduling'), 'Ana');
  assert.equal(execution.totals.visits, 2);
  assert.equal(scheduling.totals.visits, 0);
  assert.equal(scheduling.totals.vehicles, 0);
  assert.equal(scheduling.totals.unproductiveRate, null);
  assert.equal(scheduling.share, null);
  assert.equal(scheduling.past.totals.visits, 2);
  assert.deepEqual(scheduling.periods, []);
  assert.notEqual(execution.role.date, scheduling.role.date);
});

test('XLSX/CSV da pessoa preservam unidades, percentuais, contexto e somente as linhas selecionadas', () => {
  const data = fixture(),
    person = supportPerson(data, supportPerformance(data, filters), 'Ana');
  const tables = supportReport(data, person, filters, 'ficticio.xlsx');
  assert.deepEqual(
    tables.Atendimentos.slice(1).map((row) => row[0]),
    [2, 3],
  );
  assert.deepEqual(tables.Clientes[1], ['Cliente A', 2, '2, 3']);
  assert.ok(
    tables.Contexto.some((row) => row[0] === 'Responsável selecionado' && row[1] === 'Ana'),
  );
  assert.ok(
    tables.Contexto.some((row) => row[0] === 'Efetivos na base da participação' && row[1] === 3),
  );
  const book = XLSX.read(supportWorkbook(tables), { type: 'array', cellNF: true });
  const cell = (sheet, row, column) =>
    book.Sheets[sheet][XLSX.utils.encode_cell({ r: row, c: column })];
  const rateIndex = tables.Responsáveis[0].indexOf('Percentual de visitas improdutivas');
  assert.equal(cell('Responsáveis', 1, rateIndex).v, 0.5);
  assert.equal(cell('Responsáveis', 1, rateIndex).z, '0.0%');
  assert.equal(cell('Responsáveis', 1, 6).v, 1 / 3);
  const summaryRow = tables.Resumo.findIndex(
    (row) => row[0] === 'Visitas improdutivas / total realizado',
  );
  assert.equal(cell('Resumo', summaryRow, 1).v, 0.5);
  assert.equal(cell('Resumo', summaryRow, 1).z, '0.0%');
  assert.ok(supportCsv(tables).includes('Responsável selecionado'));
});

test('exportação individual de Ambos não duplica a origem compartilhada e separa clientes e percentuais', () => {
  const data = fixture();
  data.rows[0].cells[2].raw = 'Ana';
  const execution = supportPerson(data, supportPerformance(data), 'Ana'),
    scheduling = supportPerson(data, supportPerformance(data, {}, 'scheduling'), 'Ana');
  const tables = supportComparisonReport(data, execution, scheduling, {}, 'ficticio.xlsx');
  assert.deepEqual(
    tables.Atendimentos.slice(1).map((row) => row[0]),
    [2, 3, 4, 5, 8, 9],
  );
  assert.equal(tables.Atendimentos[1].at(-1), 'Agendamento / Execução');
  assert.equal(tables.Clientes[0][0], 'Responsabilidade');
  assert.equal(tables.Clientes[1][0], 'Agendamento');
  const book = XLSX.read(supportWorkbook(tables), { type: 'array', cellNF: true });
  const index = tables.Responsáveis[0].indexOf('Percentual de visitas improdutivas');
  assert.equal(book.Sheets.Responsáveis[XLSX.utils.encode_cell({ r: 1, c: index })].z, '0.0%');
  assert.equal(book.Sheets.Atendimentos['A8'], undefined);
});
