/**
 * Persistência e backup do consumo no IndexedDB deste navegador. Não envia arquivos ou registros ao servidor.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { importLineStatement } from '../domain/lineConsumption.js';
import { operationalCell, operationalLayout } from '../../operational/domain/operational.js';
import { validateAllowances } from '../domain/sharedAllowance.js';
export const emptyHistory = () => ({
  version: 1,
  files: [],
  notes: [],
  allowances: [],
  operational: null,
  settings: { periods: {}, factor: 2 },
});
const DB = 'addlog-consumption-history',
  STORE = 'archive';
async function database() {
  return new Promise((resolve, reject) => {
    let blocked = false;
    // Mantém o conteúdo existente; clientes antigos que abrem v1 precisam atualizar antes de gravar.
    const request = indexedDB.open(DB, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(
        new Error(
          'Feche outra aba do dashboard para liberar o histórico e recarregue esta página.',
        ),
      );
    };
  });
}
/** Lê o arquivo consolidado do IndexedDB local e fecha a conexão ao concluir ou falhar. */
export async function readConsumptionHistory() {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get('history');
      request.onsuccess = () =>
        resolve({
          ...(request.result || emptyHistory()),
          _revision: request.result?._revision ?? 0,
        });
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
      const transaction = db.transaction(STORE, 'readwrite'),
        store = transaction.objectStore(STORE);
      let saved, failure;
      const request = store.get('history');
      request.onsuccess = () => {
        try {
          saved = {
            ...history,
            _revision: nextConsumptionRevision(
              history._revision ?? 0,
              request.result?._revision ?? 0,
            ),
          };
          store.put(saved, 'history');
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
      transaction.oncomplete = () => resolve(saved);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(failure || transaction.error || new Error('Não foi possível salvar o histórico.'));
    });
  } finally {
    db.close();
  }
}
/** Revisão local só avança a partir do histórico lido; restauração não impõe a revisão do backup. */
export function nextConsumptionRevision(expected, current) {
  if (
    ![expected, current].every((value) => Number.isSafeInteger(value) && value >= 0) ||
    current === Number.MAX_SAFE_INTEGER
  )
    throw Error('Revisão do histórico inválida. Recarregue a página.');
  if (expected !== current)
    throw Error(
      'Outra aba atualizou o histórico. Recarregue a página antes de salvar; a versão atual foi preservada.',
    );
  return current + 1;
}
/** Calcula SHA-256 do conteúdo para reconhecer arquivos idênticos sem depender do nome. */
export async function fileDigest(text) {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      'Para importar extratos e restaurar backups de consumo, abra o sistema por HTTPS ou pelo endereço local (localhost).',
    );
  const bytes = new TextEncoder().encode(text),
    hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
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
      ...(file.origin === 'kore-api' &&
      typeof file.apiReadAt === 'string' &&
      Number.isFinite(Date.parse(file.apiReadAt))
        ? { origin: 'kore-api', apiReadAt: file.apiReadAt }
        : {}),
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
      ...(Object.hasOwn(note, 'plate') ? { plate: String(note.plate || '') } : {}),
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
    allowances: validateAllowances(value.allowances === undefined ? [] : value.allowances),
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
