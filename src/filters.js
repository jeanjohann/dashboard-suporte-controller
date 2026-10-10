import XLSX from 'xlsx';

export const filterFields = ['Status','Razão Social','Nome do Técnico','Tipo de Serviço','Motivo','Cidade','UF'];
export function field(data, row, label) {
  const index = data.columns.findIndex(col => col.label === label);
  return index < 0 ? null : row.cells[index];
}
export function attendanceDate(data, row, dateField='Data de atendimento') {
  const cell = field(data,row,dateField);
  if (!cell || cell.issue || typeof cell.raw !== 'number') return null;
  const parsed = XLSX.SSF.parse_date_code(cell.raw, {date1904: data.date1904});
  if (!parsed || parsed.y < 1900 || (parsed.y === 1900 && parsed.m === 2 && parsed.d === 29)) return null;
  const date=`${String(parsed.y).padStart(4,'0')}-${String(parsed.m).padStart(2,'0')}-${String(parsed.d).padStart(2,'0')}`;
  const instant=new Date(date+'T00:00:00Z');
  return Number.isFinite(instant.getTime())&&instant.toISOString().slice(0,10)===date?date:null;
}
export function attendanceExtent(data) {
  let start=null,end=null,missing=0;
  for(const row of data.rows){const date=attendanceDate(data,row);if(!date){missing++;continue;}if(!start||date<start)start=date;if(!end||date>end)end=date;}
  return {start,end,missing};
}
export function applyFilters(data, filters, dateField='Data de atendimento') {
  let missingDates = 0;
  const invalidPeriod = Boolean(filters.start && filters.end && filters.start > filters.end);
  const rows = data.rows.filter(row => {
    if (!filterFields.every(label => {
      const values = Array.isArray(filters[label]) ? filters[label] : filters[label] ? [filters[label]] : [];
      return values.length === 0 || values.includes(String(field(data,row,label)?.raw ?? ''));
    })) return false;
    for (const col of data.columns) {
      const values = filters[`column:${col.index}`];
      if (Array.isArray(values) && values.length && !values.includes(String(row.cells[data.columns.indexOf(col)]?.display ?? ''))) return false;
    }
    if (filters.start || filters.end) {
      const date = attendanceDate(data,row,dateField);
      if (!date) { missingDates++; return false; }
      if (invalidPeriod || (filters.start && date < filters.start) || (filters.end && date > filters.end)) return false;
    }
    return true;
  });
  const sourceRows = new Set(rows.map(row => row.sourceRow));
  return { ...data, rows, calls: new Set(rows.map(row => row.os)).size, issues: data.issues.filter(issue => sourceRows.has(issue.row)), missingDates, invalidPeriod };
}
export function monthlyCompleted(data) {
  if (!data.columns.some(col => col.label === 'Status') || !data.columns.some(col => col.label === 'Data de atendimento')) return null;
  const months = new Map();
  let missingDates = 0;
  for (const row of data.rows) {
    if (!['Concluída','Pago'].includes(field(data,row,'Status')?.raw)) continue;
    const date = attendanceDate(data,row);
    if (!date) { missingDates++; continue; }
    const month = date.slice(0,7);
    months.set(month,(months.get(month) ?? 0)+1);
  }
  return { items: [...months.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([label,value]) => ({label,value})), missingDates };
}
