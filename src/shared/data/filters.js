/**
 * Utilitários compartilhados de seleção, datas e ordenação. Preservam valores e referências das linhas originais.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
export const filterFields = [
  'Status',
  'Razão Social',
  'Nome do Técnico',
  'Resp. Execução',
  'Resp. Agendamento',
  'Tipo de Serviço',
  'Motivo',
  'Cidade',
  'UF',
];
/** Rótulos da interface separados dos cabeçalhos exatos usados na leitura da planilha. */
export const filterLabels = {
  'Razão Social': 'Cliente · razão social',
  'Resp. Execução': 'Suporte · execução',
  'Resp. Agendamento': 'Suporte · agendamento',
};
/** Localiza a célula pelo cabeçalho da coluna sem alterar seu valor original. */
export function field(data, row, label) {
  const index = data.columns.findIndex((col) => col.label === label);
  return index < 0 ? null : row.cells[index];
}
/** Obtém uma data de atendimento utilizável; datas ausentes ou incompatíveis permanecem sem valor. */
export function attendanceDate(data, row, dateField = 'Data de atendimento') {
  const cell = field(data, row, dateField);
  if (!cell || cell.issue || typeof cell.raw !== 'number') return null;
  // A análise só precisa da parte de calendário do serial. Não carregar o XLSX (500 kB)
  // na tela inicial por causa deste cálculo; a leitura do arquivo segue no Web Worker.
  const serial = Number(cell.raw.toPrecision(16));
  if (!Number.isFinite(serial) || serial < 0 || serial > 2958465) return null;
  let day = Math.floor(serial);
  const fraction = serial - day;
  if (fraction > 86399.9999 / 86400) day++;
  if (data.date1904) day += 1462;
  // O sistema Excel de 1900 inclui o dia fictício 29/02/1900 (serial 60).
  if (day === 0 || day === 60) return null;
  if (day > 60) day--;
  const parsed = new Date(Date.UTC(1900, 0, day));
  const year = parsed.getUTCFullYear();
  const month = parsed.getUTCMonth() + 1;
  const dateOfMonth = parsed.getUTCDate();
  if (year < 1900) return null;
  const date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(dateOfMonth).padStart(2, '0')}`;
  const instant = new Date(date + 'T00:00:00Z');
  return Number.isFinite(instant.getTime()) && instant.toISOString().slice(0, 10) === date
    ? date
    : null;
}
/** Calcula o primeiro e o último atendimento com data válida, independentemente da ordem das linhas. */
export function attendanceExtent(data) {
  let start = null,
    end = null,
    missing = 0;
  for (const row of data.rows) {
    const date = attendanceDate(data, row);
    if (!date) {
      missing++;
      continue;
    }
    if (!start || date < start) start = date;
    if (!end || date > end) end = date;
  }
  return { start, end, missing };
}
/** Combina opções com OU dentro de cada campo e E entre campos. Um período ativo exclui registros sem data válida. */
export function applyFilters(data, filters, dateField = 'Data de atendimento') {
  let missingDates = 0;
  const invalidPeriod = Boolean(filters.start && filters.end && filters.start > filters.end);
  const rows = data.rows.filter((row) => {
    if (
      !filterFields.every((label) => {
        const values = Array.isArray(filters[label])
          ? filters[label]
          : filters[label]
            ? [filters[label]]
            : [];
        return values.length === 0 || values.includes(String(field(data, row, label)?.raw ?? ''));
      })
    )
      return false;
    for (const col of data.columns) {
      const values = filters[`column:${col.index}`];
      if (
        Array.isArray(values) &&
        values.length &&
        !values.includes(String(row.cells[data.columns.indexOf(col)]?.display ?? ''))
      )
        return false;
    }
    if (filters.start || filters.end) {
      const date = attendanceDate(data, row, dateField);
      if (!date) {
        missingDates++;
        return false;
      }
      if (
        invalidPeriod ||
        (filters.start && date < filters.start) ||
        (filters.end && date > filters.end)
      )
        return false;
    }
    return true;
  });
  const sourceRows = new Set(rows.map((row) => row.sourceRow));
  return {
    ...data,
    rows,
    calls: new Set(rows.map((row) => row.os)).size,
    issues: data.issues.filter((issue) => sourceRows.has(issue.row)),
    missingDates,
    invalidPeriod,
  };
}
/** Agrupa somente Concluída/Pago pelo mês de atendimento e contabiliza separadamente a ausência de data. */
export function monthlyCompleted(data) {
  if (
    !data.columns.some((col) => col.label === 'Status') ||
    !data.columns.some((col) => col.label === 'Data de atendimento')
  )
    return null;
  const months = new Map();
  let missingDates = 0;
  for (const row of data.rows) {
    if (!['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw)) continue;
    const date = attendanceDate(data, row);
    if (!date) {
      missingDates++;
      continue;
    }
    const month = date.slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + 1);
  }
  return {
    items: [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value })),
    missingDates,
  };
}
