/** Formato portátil das bases: JSON validado, sem arredondar IDs ou recalcular campos. */
import { cloneDocument } from './documentRepository.js';
import { normalizeMonitoringSnapshot } from '../../modules/monitoring/data/snapshotContract.js';
export const sourceKinds = ['orders', 'operational', 'logistics'];
export const snapshotKinds = [...sourceKinds, 'monitoring'];
export const snapshotMaxBytes = 16 * 1024 * 1024;
export const snapshotMaxParts = 512;
export const snapshotPartChars = 48 * 1024;
export const sha256 = async (value) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('');
export function validateStoredSource(kind, source) {
  if (
    !sourceKinds.includes(kind) ||
    !source ||
    typeof source.filename !== 'string' ||
    !source.filename.trim() ||
    source.filename.length > 500 ||
    Object.keys(source).some(
      (key) => !['filename', 'data', 'origin', 'googleReadAt', 'savedAt'].includes(key),
    ) ||
    (source.origin != null && source.origin !== 'google')
  )
    throw Error('Base ou origem incompatível.');
  const data = source.data;
  if (
    !data ||
    !Array.isArray(data.rows) ||
    data.rows.length > 50000 ||
    !Array.isArray(data.issues) ||
    typeof data.date1904 !== 'boolean'
  )
    throw Error('Estrutura da base incompatível.');
  const columns = kind === 'logistics' ? null : data.columns;
  if (
    kind !== 'logistics' &&
    (!Array.isArray(columns) ||
      !columns.length ||
      columns.length > 200 ||
      columns.some(
        (c) =>
          !Number.isInteger(c.index) ||
          c.index < 0 ||
          typeof c.label !== 'string' ||
          typeof c.letter !== 'string',
      ))
  )
    throw Error('Colunas da base incompatíveis.');
  if (kind === 'orders' && !['OS 2025_26', 'OS 2025'].includes(data.sheetName))
    throw Error('Aba de OS incompatível.');
  if (
    kind === 'logistics' &&
    (!Array.isArray(data.sheets) ||
      data.sheets.some((s) => !['Envios', 'Devoluções'].includes(s.name)))
  )
    throw Error('Abas de logística incompatíveis.');
  for (const row of data.rows) {
    if (
      !Number.isInteger(row.sourceRow) ||
      row.sourceRow < 2 ||
      !Array.isArray(row.cells) ||
      row.cells.length > 200
    )
      throw Error('Linha de origem incompatível.');
    for (const cell of row.cells)
      if (
        !cell ||
        typeof cell.display !== 'string' ||
        !(cell.raw === null || ['string', 'number', 'boolean'].includes(typeof cell.raw)) ||
        (typeof cell.raw === 'number' && !Number.isFinite(cell.raw))
      )
        throw Error('Célula original incompatível.');
  }
  return source;
}
export function validateSnapshotValue(kind, value) {
  if (kind === 'monitoring') {
    const normalized = normalizeMonitoringSnapshot(value);
    if (normalized.vehicles.length > 5000 || normalized.collections.some((row) => !row.ok))
      throw Error('Coleta parcial ou maior que o limite do piloto.');
    return normalized;
  }
  validateStoredSource(kind, value);
  return value;
}
export function splitSnapshot(text) {
  const parts = [];
  for (let start = 0; start < text.length;) {
    let end = Math.min(start + snapshotPartChars, text.length);
    if (
      end < text.length &&
      text.charCodeAt(end - 1) >= 0xd800 &&
      text.charCodeAt(end - 1) <= 0xdbff
    )
      end--;
    parts.push(text.slice(start, end));
    start = end;
  }
  return parts;
}
export async function prepareSnapshot(kind, input) {
  if (!snapshotKinds.includes(kind)) throw Error('Tipo de base inválido.');
  const value = cloneDocument(input);
  if (kind !== 'monitoring') delete value.cloud;
  const normalized = validateSnapshotValue(kind, value),
    text = JSON.stringify(normalized),
    bytes = new TextEncoder().encode(text).length;
  if (!bytes || bytes > snapshotMaxBytes)
    throw Error(
      'A base excede 16 MB de dados processados no piloto. A versão anterior foi mantida.',
    );
  const hash = await sha256(text),
    id = await sha256(kind + '\n' + hash),
    parts = splitSnapshot(text);
  return {
    id,
    hash,
    kind,
    parts,
    bytes,
    value: normalized,
    filename: kind === 'monitoring' ? 'Monitoramento Ativo' : normalized.filename,
  };
}
