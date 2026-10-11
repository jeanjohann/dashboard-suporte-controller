/**
 * Leitura da planilha de OS: mantém valores, posições e referências originais, sinalizando problemas para revisão.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import XLSX from 'xlsx';

/** Lê a aba OS 2025 ou a aba única aceita, preservando cabeçalhos, valores e número físico da linha para conferência. */
export function importWorkbook(buffer) {
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: false,
    cellNF: true,
    cellText: true,
  });
  const sheet = workbook.Sheets['OS 2025'];
  if (!sheet)
    throw new Error(
      'A aba “OS 2025” não foi encontrada. O arquivo deve conter uma aba com esse nome.',
    );
  if (!sheet['!ref']) throw new Error('A aba OS 2025 está vazia.');
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const columns = [];
  for (let c = 0; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c })];
    const label = String(cell?.v ?? '').trim();
    if (label) columns.push({ index: c, letter: XLSX.utils.encode_col(c), label });
  }
  if (!columns.length || columns[0].index !== 0)
    throw new Error(
      'Não foi possível identificar o cabeçalho na primeira linha e o número da OS na coluna A.',
    );
  const issues = [],
    rows = [];
  let skipped = 0;
  for (let r = 1; r <= range.e.r; r++) {
    const os = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    if (!os || os.v === null || os.v === undefined || String(os.v).trim() === '') {
      if (columns.some((col) => sheet[XLSX.utils.encode_cell({ r, c: col.index })]?.v != null))
        skipped++;
      continue;
    }
    const cells = columns.map((col) => {
      const address = XLSX.utils.encode_cell({ r, c: col.index });
      const cell = sheet[address];
      if (!cell || cell.v == null) return { display: '', raw: null, issue: false };
      let reason = cell.t === 'e' ? 'Erro registrado no Excel' : null;
      if (!reason && cell.t === 'n' && XLSX.SSF.is_date(cell.z || '')) {
        if (!XLSX.SSF.parse_date_code(cell.v)) reason = 'Valor incompatível com o formato de data';
      }
      const display = cell.w ?? String(cell.v);
      if (reason)
        issues.push({ address, row: r + 1, column: col.label, value: String(cell.v), reason });
      return { display, raw: cell.v, issue: Boolean(reason) };
    });
    rows.push({ sourceRow: r + 1, os: String(os.v), cells });
  }
  return {
    columns,
    rows,
    issues,
    skipped,
    date1904: Boolean(workbook.Workbook?.WBProps?.date1904),
    calls: new Set(rows.map((row) => row.os)).size,
  };
}
