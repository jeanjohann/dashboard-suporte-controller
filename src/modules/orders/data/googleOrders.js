/** Adapta os valores do Google para a mesma leitura de OS usada no Excel. */
import XLSX from 'xlsx';
import { validateGoogleOrdersSnapshot } from '../../../shared/data/googleOrdersSnapshot.js';
import { importOrdersSheet } from './import.js';

export function importGoogleOrders(input) {
  const snapshot = validateGoogleOrdersSnapshot(input);
  const sheet = googleSnapshotToSheet(snapshot);
  const data = importOrdersSheet(sheet, snapshot.sheetName);
  if (!data.rows.length)
    throw Error('Nenhum atendimento com número de OS foi encontrado no Google.');
  return {
    data,
    filename: `Google Sheets · ${snapshot.sheetName}`,
    googleReadAt: snapshot.readAt,
    origin: 'google',
  };
}

export function googleSnapshotToSheet(snapshot) {
  const sheet = {};
  let lastColumn = 0;
  snapshot.rows.forEach((row, r) => {
    lastColumn = Math.max(lastColumn, row.length - 1);
    row.forEach((cell, c) => {
      if (cell === null) return;
      sheet[XLSX.utils.encode_cell({ r, c })] = {
        t: cell.type,
        v: cell.raw,
        w: cell.display,
        z: cell.format,
      };
    });
  });
  sheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: snapshot.rows.length - 1, c: lastColumn },
  });
  return sheet;
}
