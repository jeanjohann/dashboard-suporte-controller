/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';

const text = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const done = (data, row) => ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw);
export { trackerMotives } from './trackerReplacements.js';
import { trackerReplacementPairs } from './trackerReplacements.js';
/** Classifica Coletora/Teclado/Terminal ou RFID pelas instruções. Categoria ausente ou ambígua retorna null. */
export function accessoryCategory(cell) {
  if (!cell || cell.issue || cell.raw == null) return null;
  const instruction = text(cell.raw);
  const collector = /\b(coletora|teclado|terminal(?: de jornada)?)\b/.test(instruction),
    rfid = /\brfid\b/.test(instruction);
  return collector === rfid ? null : collector ? 'Coletora' : 'RFID';
}
/** Exige indicação textual explícita de troca nas instruções; o critério fica centralizado para futuras mudanças. */
export function explicitAccessoryReplacement(cell) {
  return Boolean(cell && !cell.issue && /\b(troca|trocar)\b/.test(text(cell.raw)));
}
/** Identifica trocas no histórico completo e aplica a seleção depois, exigindo que as duas linhas do par estejam selecionadas. */
export function equipment(data, selected) {
  const has = (names) => names.every((name) => data.columns.some((col) => col.label === name));
  const replacement = trackerReplacementPairs(data),
    trackerAvailable = replacement.available;
  const accessoryAvailable = has(['Status', 'Tipo de Serviço', 'Motivo', 'Instruções']);
  const selectedRows = new Set(selected.rows.map((row) => row.sourceRow));
  const issues = replacement.issues.filter((issue) => selectedRows.has(issue.row)),
    swaps = [],
    accessories = { Coletora: 0, RFID: 0 },
    accessoryRows = { Coletora: [], RFID: [] };
  let excludedAccessories = 0,
    missingMonthlyDate = 0;
  const months = new Map();
  const flag = (row, label, reason) => {
    if (!selectedRows.has(row.sourceRow)) return;
    const col = data.columns.find((col) => col.label === label);
    issues.push({
      address: `${col.letter}${row.sourceRow}`,
      row: row.sourceRow,
      column: label,
      value: String(field(data, row, label)?.display ?? ''),
      reason,
    });
  };
  if (accessoryAvailable)
    for (const row of selected.rows) {
      if (
        !done(data, row) ||
        field(data, row, 'Tipo de Serviço')?.raw !== 'Assistência Técnica' ||
        field(data, row, 'Motivo')?.raw !== 'Manutenção de Acessório'
      )
        continue;
      const instructionCell = field(data, row, 'Instruções'),
        category = accessoryCategory(instructionCell);
      const instruction = text(instructionCell?.raw);
      const collector = /\b(coletora|teclado|terminal de jornada)\b/.test(instruction);
      const rfid = /\brfid\b/.test(instruction);
      if (!category || !explicitAccessoryReplacement(instructionCell)) {
        excludedAccessories++;
        flag(
          row,
          'Instruções',
          collector && rfid
            ? 'Acessório: ambas as categorias presentes; revisar.'
            : !collector && !rfid
              ? 'Acessório: nenhuma categoria identificada; revisar.'
              : 'Acessório: manutenção sem troca/trocar explícito; não confirma substituição.',
        );
        continue;
      }
      accessories[category]++;
      accessoryRows[category].push(row.sourceRow);
    }
  for (const pair of replacement.pairs) {
    if (!pair.rows.every((id) => selectedRows.has(id))) continue;
    swaps.push(pair);
    const month = pair.date.slice(0, 7);
    months.set(month, (months.get(month) || 0) + 1);
  }
  return {
    trackerAvailable,
    accessoryAvailable,
    swaps,
    accessories,
    accessoryRows,
    excludedAccessories,
    issues,
    missingMonthlyDate,
    months: [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value })),
  };
}
