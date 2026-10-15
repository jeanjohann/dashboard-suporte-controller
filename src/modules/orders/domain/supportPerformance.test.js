/** Casos sintéticos: calendário, atribuição, improdutivas, comparação e exportação sem dados reais. */
import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { supportPeriod, supportPerformance } from './supportPerformance.js';
import { supportReport, supportCsv, supportWorkbook } from './supportReport.js';

const labels = [
  'Status',
  'Resp. Execução',
  'Resp. Agendamento',
  'Data de atendimento',
  'Agendamento',
  'Tipo de Serviço',
  'Motivo',
  'Razão Social',
];
const serial = (date) =>
  (Date.parse(date + 'T00:00:00Z') - Date.parse('1899-12-30T00:00:00Z')) / 86400000;
function fixture() {
  const values = [
    [
      'Concluída',
      'Ana',
      'Bia',
      serial('2026-10-15'),
      serial('2026-10-08'),
      'Implementação',
      'Implementação',
      'A',
    ],
    [
      'Pago',
      'Ana',
      'Bia',
      serial('2026-10-14'),
      serial('2026-10-07'),
      'Assistência Técnica',
      'Visita Improdutiva',
      'A',
    ],
    [
      'Concluída',
      'Bia',
      'Ana',
      serial('2026-10-13'),
      serial('2026-10-06'),
      'Desinstalação',
      'Cancelamento',
      'B',
    ],
    [
      'Concluída',
      '',
      'Ana',
      serial('2026-10-12'),
      serial('2026-10-05'),
      'Assistência Técnica',
      'Manutenção',
      'B',
    ],
    [
      'Agendado',
      'Ana',
      'Bia',
      serial('2026-10-11'),
      serial('2026-10-04'),
      'Assistência Técnica',
      '',
      'C',
    ],
    [
      'Cancelada',
      'Ana',
      'Bia',
      serial('2026-10-11'),
      serial('2026-10-04'),
      'Assistência Técnica',
      '',
      'C',
    ],
    ['Concluída', 'Ana', 'Bia', null, serial('2026-10-03'), 'Assistência Técnica', '', 'A'],
    [
      'Concluída',
      'Ana',
      'Bia',
      serial('2026-10-08'),
      serial('2026-10-01'),
      'Assistência Técnica',
      '',
      'A',
    ],
  ];
  return {
    columns: labels.map((label, index) => ({ label, index, letter: XLSX.utils.encode_col(index) })),
    issues: [],
    rows: values.map((values, index) => ({
      sourceRow: index + 2,
      os: index < 2 ? '100' : String(index + 100),
      cells: values.map((raw) => ({ raw, display: String(raw ?? '') })),
    })),
  };
}

test('períodos civis respeitam segunda/domingo, virada de ano e fevereiro bissexto', () => {
  assert.deepEqual(supportPeriod('last7', '2026-01-03'), {
    start: '2025-12-28',
    end: '2026-01-03',
  });
  assert.deepEqual(supportPeriod('previousWeek', '2026-10-12'), {
    start: '2026-10-05',
    end: '2026-10-11',
  });
  assert.deepEqual(supportPeriod('previousWeek', '2026-10-18'), {
    start: '2026-10-05',
    end: '2026-10-11',
  });
  assert.deepEqual(supportPeriod('month', '2026-10-15', '2024-02'), {
    start: '2024-02-01',
    end: '2024-02-29',
  });
  assert.deepEqual(supportPeriod('year', '2026-10-15', undefined, '2025'), {
    start: '2025-01-01',
    end: '2025-12-31',
  });
  assert.deepEqual(supportPeriod('total', '2026-10-15'), { start: '', end: '' });
  assert.throws(() => supportPeriod('last7', '2026-02-30'));
  assert.throws(() => supportPeriod('month', '2026-10-15', '2026-13'));
});
test('efetivos e improdutivas separados; chamados compartilhados não são somados', () => {
  const data = fixture(),
    before = JSON.stringify(data);
  const result = supportPerformance(data, { start: '2026-10-09', end: '2026-10-15' });
  assert.deepEqual(result.totals, {
    visits: 4,
    productive: 3,
    unproductive: 1,
    calls: 3,
    clients: 2,
  });
  assert.equal(result.groups.find((item) => item.label === 'Ana').share, 1 / 3);
  assert.deepEqual(result.missing, [5]);
  assert.equal(result.missingDates, 1);
  assert.equal(result.past.totals.productive, 1);
  assert.equal(result.groups.find((item) => item.label === 'Ana').previous, 1);
  assert.equal(result.groups.find((item) => item.label === 'Bia').previous, 0);
  assert.equal(result.unit, 'day');
  assert.equal(JSON.stringify(data), before);
  data.rows[2].os = '100';
  const shared = supportPerformance(data, { start: '2026-10-09', end: '2026-10-15' });
  assert.equal(shared.totals.calls, 2);
  assert.equal(
    shared.groups.reduce((sum, item) => sum + item.calls, 0),
    2,
  );
  // O chamado sem responsável também participa do total; somá-lo ao ranking geraria 3, não 2.
  assert.equal(shared.missing.length, 1);
});
test('agendamento usa a própria data, não cria agenda aberta e conserva filtros de cliente', () => {
  const data = fixture();
  const filters = { start: '2026-10-09', end: '2026-10-15' };
  assert.equal(supportPerformance(data, filters, 'scheduling').totals.visits, 0);
  const result = supportPerformance(
    data,
    { start: '2026-10-01', end: '2026-10-08', 'Razão Social': ['A'] },
    'scheduling',
  );
  assert.equal(result.totals.visits, 4);
  assert.equal(result.totals.unproductive, 1);
  assert.equal(result.groups[0].label, 'Bia');
  assert.equal(result.missingDates, 0);
  assert.equal(result.profiles.find((item) => item.type === 'Visita improdutiva').value, 1);
});
test('total mantém realizados sem data fora apenas da evolução; ausência de coluna e erro de nome ficam explícitos', () => {
  const data = fixture();
  data.rows[0].cells[1].issue = 'Erro';
  const result = supportPerformance(data);
  assert.equal(result.totals.visits, 6);
  assert.equal(result.undated, 1);
  assert.equal(result.missingDates, 0);
  assert.equal(result.missing.length, 2);
  assert.equal(result.range, null);
  assert.equal(result.unit, 'month');
  assert.deepEqual(
    supportPerformance(
      { ...data, columns: data.columns.filter((column) => column.label !== 'Agendamento') },
      {},
      'scheduling',
    ).unavailable,
    ['Agendamento'],
  );
  assert.equal(
    supportPerformance(data, { start: '2026-10-15', end: '2026-10-01' }).totals.visits,
    0,
  );
});
test('exportação preserva números, percentual fracionário e linhas originais do recorte', () => {
  const data = fixture();
  data.rows[0].cells[1].raw = '=1+1';
  const filters = { start: '2026-10-09', end: '2026-10-15' };
  const tables = supportReport(data, supportPerformance(data, filters), filters, 'sintetico.xlsx');
  assert.match(supportCsv(tables), /'=1\+1/);
  const book = XLSX.read(supportWorkbook(tables), { type: 'array', cellNF: true });
  assert.equal(book.Sheets.Responsáveis.G2.t, 'n');
  assert.equal(book.Sheets.Responsáveis.G2.v, 1 / 3);
  assert.equal(book.Sheets.Responsáveis.G2.z, '0.0%');
  assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Atendimentos, { header: 1 }).length, 5);
  assert.equal(book.Sheets.Responsáveis.A2.t, 's');
});
