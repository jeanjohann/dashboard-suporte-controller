/**
 * Persistência e backup do consumo no IndexedDB deste navegador. Não envia arquivos ou registros ao servidor.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { importLineStatement } from '../domain/lineConsumption.js';
import { operationalCell, operationalLayout } from '../../operational/domain/operational.js';
export const emptyHistory = () => ({
  version: 1,
  files: [],
  notes: [],
  operational: null,
  settings: { periods: {}, factor: 2 },
});
const DB = 'addlog-consumption-history',
  STORE = 'archive';
async function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('Feche outra aba do dashboard para liberar o histórico.'));
  });
}
/** Lê o arquivo consolidado do IndexedDB local e fecha a conexão ao concluir ou falhar. */
export async function readConsumptionHistory() {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get('history');
      request.onsuccess = () => resolve(request.result || emptyHistory());
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
/** Grava o histórico local em uma transação; só confirma o salvamento após a conclusão. */
export async function writeConsumptionHistory(history) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(history, 'history');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(transaction.error || new Error('Não foi possível salvar o histórico.'));
    });
  } finally {
    db.close();
  }
}
/** Calcula SHA-256 do conteúdo para reconhecer arquivos idênticos sem depender do nome. */
export async function fileDigest(text) {
  const bytes = new TextEncoder().encode(text),
    hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, '0')).join('');
}
/** Confere estrutura, conteúdo e integridade do backup antes de permitir a restauração local. */
export async function validateBackup(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('Backup JSON inválido.');
  }
  if (value?.version !== 1 || !Array.isArray(value.files) || !Array.isArray(value.notes))
    throw new Error('Formato de backup não reconhecido.');
  const files = [];
  for (const file of value.files) {
    if (
      !file ||
      typeof file.text !== 'string' ||
      typeof file.filename !== 'string' ||
      typeof file.importedAt !== 'string'
    )
      throw new Error('Arquivo sem origem válida no backup.');
    const id = await fileDigest(file.text);
    importLineStatement(file.text, file.filename, id);
    files.push({
      id,
      filename: file.filename,
      text: file.text,
      importedAt: file.importedAt,
      active: file.active !== false,
    });
  }
  if (new Set(files.map((file) => file.id)).size !== files.length)
    throw new Error('Backup contém arquivos repetidos.');
  const activePeriods = new Set();
  for (const file of files.filter((file) => file.active)) {
    const parsed = importLineStatement(file.text, file.filename, file.id);
    for (const period of parsed.periods) {
      const key = JSON.stringify([parsed.operator, period.key]);
      if (activePeriods.has(key))
        throw new Error('Backup tem mais de uma versão em uso da mesma apuração.');
      activePeriods.add(key);
    }
  }
  const notes = value.notes.map((note) => {
    if (
      !note ||
      !['Arqia', 'Kore'].includes(note.operator) ||
      !/^\d+$/.test(note.iccid) ||
      typeof note.text !== 'string' ||
      typeof note.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(note.date) ||
      !Number.isFinite(Date.parse(note.date)) ||
      new Date(note.date).toISOString().slice(0, 10) !== note.date ||
      !['Investigar', 'Ação realizada', 'Acompanhar', 'Encerrado'].includes(note.status)
    )
      throw new Error('Anotação incompatível no backup.');
    return {
      id: String(note.id),
      operator: note.operator,
      iccid: note.iccid,
      date: note.date,
      text: note.text,
      status: note.status,
      serial: String(note.serial || ''),
      client: String(note.client || ''),
    };
  });
  let operational = null;
  if (value.operational) {
    const op = value.operational,
      columns = op.data?.columns,
      rows = op.data?.rows;
    const letter = (index) => {
      let name = '';
      for (let value = index + 1; value; value = Math.floor((value - 1) / 26))
        name = String.fromCharCode(65 + ((value - 1) % 26)) + name;
      return name;
    };
    if (
      typeof op.filename !== 'string' ||
      !Array.isArray(rows) ||
      !Array.isArray(columns) ||
      ![62, 77].includes(columns.length) ||
      columns.some(
        (col, index) =>
          !col ||
          col.index !== index ||
          col.letter !== letter(index) ||
          typeof col.label !== 'string',
      )
    )
      throw new Error('Referência operacional incompatível.');
    const layout = operationalLayout(columns);
    if (columns.length !== layout.count) throw new Error('Referência operacional incompatível.');
    const seen = new Set();
    for (const row of rows) {
      if (
        !row ||
        (row.layout ?? 'legacy') !== layout.name ||
        !Number.isInteger(row.sourceRow) ||
        row.sourceRow < 2 ||
        seen.has(row.sourceRow) ||
        !Array.isArray(row.cells) ||
        row.cells.length !== columns.length ||
        row.cells.some(
          (cell) =>
            !cell ||
            typeof cell.display !== 'string' ||
            (cell.raw != null && !['string', 'number', 'boolean'].includes(typeof cell.raw)),
        ) ||
        ['iccid', 'phone', 'client', 'serial', 'model', 'status', 'plate'].some(
          (key) =>
            typeof row[key] !== 'string' ||
            row[key] !== String(operationalCell(row, key)?.raw ?? '').trim(),
        )
      )
        throw new Error('Registro operacional incompatível no backup.');
      seen.add(row.sourceRow);
    }
    operational = op;
  }

  const factor = Number(value.settings?.factor),
    periods = value.settings?.periods;
  return {
    version: 1,
    files,
    notes,
    operational,
    settings: {
      factor: Number.isFinite(factor) && factor >= 1 && factor <= 100 ? factor : 2,
      periods:
        periods && typeof periods === 'object' && !Array.isArray(periods)
          ? {
              Arqia: typeof periods.Arqia === 'string' ? periods.Arqia : '',
              Kore: typeof periods.Kore === 'string' ? periods.Kore : '',
            }
          : {},
    },
  };
}
