import XLSX from 'xlsx';
import { normalizeCnpj } from '../domain/customerIdentity.js';
const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
/** Lê somente CNPJ e razão social; tabelas de preços e demais campos do cadastro não são importados. */
export function importCustomerRegistry(book) {
  const found = book.SheetNames.filter((n) => normalize(n) === 'base clientes');
  const empty = { available: false, sheetName: found[0] || null, rows: [], issues: [] };
  if (found.length !== 1)
    return {
      ...empty,
      issues:
        found.length > 1
          ? [{ reason: 'Mais de uma aba Base clientes; cadastro não escolhido automaticamente.' }]
          : [],
    };
  const sheet = book.Sheets[found[0]];
  if (!sheet?.['!ref']) return empty;
  const values = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });
  const headers = (values[0] || []).map(normalize);
  if (
    headers.filter((x) => x === 'cnpj').length !== 1 ||
    headers.filter((x) => x === 'razao social').length !== 1
  )
    return {
      ...empty,
      issues: [{ reason: 'Base clientes sem cabeçalhos únicos CNPJ e Razão Social.' }],
    };
  const rows = [],
    issues = [];
  for (let i = 1; i < values.length; i++) {
    const ci = headers.indexOf('cnpj'),
      ni = headers.indexOf('razao social');
    const cell = sheet[XLSX.utils.encode_cell({ r: i, c: ci })];
    const raw = values[i][ci],
      name = String(values[i][ni] ?? '').trim();
    if (raw == null && !name) continue;
    const cnpj = normalizeCnpj({ raw, error: cell?.t === 'e' });
    const nameError = sheet[XLSX.utils.encode_cell({ r: i, c: ni })]?.t === 'e';
    if (!cnpj || !name || nameError) {
      issues.push({ row: i + 1, reason: 'CNPJ ou razão social ausente/incompatível no cadastro.' });
      continue;
    }
    rows.push({ cnpj, name, sourceRow: i + 1 });
  }
  const byCnpj = new Map();
  for (const row of rows) byCnpj.set(row.cnpj, [...(byCnpj.get(row.cnpj) || []), row]);
  for (const group of byCnpj.values())
    if (new Set(group.map((row) => row.name)).size > 1)
      issues.push({
        row: group[0].sourceRow,
        reason: `Mesmo CNPJ com razões sociais diferentes nas linhas ${group.map((row) => row.sourceRow).join(', ')}; nenhum nome escolhido automaticamente.`,
      });
  return { available: true, sheetName: found[0], rows, issues };
}
