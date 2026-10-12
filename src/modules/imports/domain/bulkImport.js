/**
 * Reconhecimento e montagem do lote de importação. As bases são validadas antes de atualizar o estado do aplicativo.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import XLSX from 'xlsx';
import { importWorkbook } from '../../orders/data/import.js';
import { importOperational } from '../../operational/domain/operational.js';
import { importLogistics } from '../../logistics/domain/logistics.js';
import {
  importLineStatement,
  mergeHistoryFiles,
} from '../../consumption/domain/lineConsumption.js';
import { fileDigest } from '../../consumption/data/consumptionHistory.js';

export const importTypeLabels = {
  orders: 'Ordens de Serviço',
  operational: 'Operacional',
  consumption: 'Consumo M2M',
  logistics: 'Logística · Envios e Devoluções',
};
const decode = (buffer) => {
  const text = new TextDecoder('utf-8').decode(buffer);
  return text.includes('\uFFFD') ? new TextDecoder('windows-1252').decode(buffer) : text;
};
/** Reconhece as bases presentes no arquivo e retorna a prévia para revisão antes de importar. */
export async function inspectImportFile(file) {
  const buffer = await file.arrayBuffer(),
    name = file.name,
    importedAt = new Date().toISOString();
  if (/\.csv$/i.test(name)) {
    const text = decode(buffer),
      id = await fileDigest(text),
      record = { id, text, filename: name, importedAt },
      parsed = importLineStatement(text, name, id);
    return {
      filename: name,
      types: ['consumption'],
      consumption: record,
      description: `${parsed.operator} · ${parsed.rows.length} registros · ${parsed.periods.map((p) => p.label).join(' / ')}`,
    };
  }
  if (!/\.(xlsx|xls)$/i.test(name))
    throw new Error('Formato não suportado. Selecione Excel (.xlsx/.xls) ou CSV de consumo.');
  const book = XLSX.read(buffer, { type: 'array', bookSheets: true }),
    types = [],
    result = { filename: name };
  if (book.SheetNames.includes('OS 2025')) {
    types.push('orders');
    result.orders = { filename: name, data: importWorkbook(buffer), savedAt: importedAt };
  }
  if (book.SheetNames.includes('Equipamentos')) {
    types.push('operational');
    result.operational = { filename: name, data: importOperational(buffer), savedAt: importedAt };
  }
  if (book.SheetNames.includes('Envios') || book.SheetNames.includes('Devoluções')) {
    types.push('logistics');
    result.logistics = { filename: name, data: importLogistics(buffer), savedAt: importedAt };
  }
  if (!types.length)
    throw new Error(
      'Nenhuma aba reconhecida: esperado OS 2025, Equipamentos ou Envios + Devoluções.',
    );
  return {
    ...result,
    types,
    description: types
      .map((type) => `${importTypeLabels[type]} · ${result[type].data.rows.length} registros`)
      .join(' / '),
  };
}
/** Valida a seleção de arquivos e reúne o lote que será aplicado à sessão. */
export function assembleImportBatch(items) {
  const batch = { orders: null, operational: null, logistics: null, consumption: [] };
  if (!items.length) throw new Error('Selecione ao menos um arquivo reconhecido.');
  for (const item of items) {
    if (item.error) throw new Error('Há arquivo selecionado com erro.');
    for (const type of ['orders', 'operational', 'logistics'])
      if (item[type]) {
        if (batch[type])
          throw new Error(`Selecione apenas um arquivo de ${importTypeLabels[type]} por lote.`);
        batch[type] = item[type];
      }
    if (item.consumption) batch.consumption.push(item.consumption);
  }
  return batch;
}
/** Incorpora os consumos do lote ao histórico local pelas mesmas regras de versão e integridade. */
export function mergeBulkHistory(archive, batch) {
  return {
    ...archive,
    files: mergeHistoryFiles(archive.files, batch.consumption),
    operational: batch.operational || archive.operational,
  };
}
