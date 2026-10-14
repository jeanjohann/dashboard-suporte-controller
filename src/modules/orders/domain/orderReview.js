/** Avisos de cadastro para conferência, sem corrigir células ou alterar a elegibilidade dos indicadores. */
import { attendanceDate } from '../../../shared/data/filters.js';

const statuses = ['Concluída', 'Pago', 'Cancelada', 'Agendar', 'Agendado'];
const normalized = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/** Audita cabeçalhos repetidos, variantes de status e coerência do pagamento ao técnico no recorte. */
export function reviewOrderConsistency(data) {
  const issues = [],
    headers = new Map();
  for (const column of data.columns) {
    if (!headers.has(column.label)) headers.set(column.label, []);
    headers.get(column.label).push(column);
  }
  for (const [label, columns] of headers)
    if (columns.length > 1)
      issues.push({
        row: 1,
        address: columns.map((column) => `${column.letter}1`).join(', '),
        column: label,
        value: label,
        reason: `Cabeçalho repetido nas colunas ${columns.map((column) => column.letter).join(', ')}. Todas foram preservadas; cálculos por nome usam a primeira ocorrência. Confira qual coluna deve orientar a análise.`,
      });
  const statusIndex = data.columns.findIndex((column) => column.label === 'Status'),
    paidIndex = data.columns.findIndex((column) => column.label === 'Pago em');
  const flag = (row, index, reason) =>
    issues.push({
      row: row.sourceRow,
      address: `${data.columns[index].letter}${row.sourceRow}`,
      column: data.columns[index].label,
      value: row.cells[index]?.display ?? '',
      reason,
    });
  if (statusIndex < 0) return issues;
  for (const row of data.rows) {
    const status = row.cells[statusIndex];
    if (!status?.issue) {
      const equivalent = statuses.find((value) => normalized(value) === normalized(status?.raw));
      if (equivalent && status?.raw !== equivalent)
        flag(
          row,
          statusIndex,
          `Status semelhante a “${equivalent}”, mas com escrita diferente. O original foi mantido; os indicadores continuam exigindo correspondência exata.`,
        );
    }
    if (paidIndex < 0 || status?.issue) continue;
    const paid = row.cells[paidIndex],
      filled = paid?.raw != null && String(paid.raw).trim() !== '';
    if (status?.raw === 'Pago' && !attendanceDate(data, row, 'Pago em'))
      flag(
        row,
        paidIndex,
        'Status Pago sem data válida em Pago em. Confira o pagamento ao técnico; os totais não foram alterados.',
      );
    else if (filled && status?.raw !== 'Pago')
      flag(
        row,
        paidIndex,
        'Pago em preenchido com status diferente de Pago. Confira o pagamento ao técnico; isso não confirma recebimento do cliente.',
      );
  }
  return issues;
}
