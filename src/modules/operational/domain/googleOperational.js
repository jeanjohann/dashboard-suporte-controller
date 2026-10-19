import { validateGoogleOrdersSnapshot } from '../../../shared/data/googleOrdersSnapshot.js';
import { googleSnapshotToSheet } from '../../orders/data/googleOrders.js';
import { importOperationalSheet } from './operational.js';

export function importGoogleOperational(input) {
  const snapshot = validateGoogleOrdersSnapshot(input, 'operational');
  const data = importOperationalSheet(googleSnapshotToSheet(snapshot));
  if (!data.rows.length) throw Error('Nenhum equipamento foi encontrado na aba Equipamentos.');
  return {
    data,
    filename: `Google Sheets · ${snapshot.sheetName}`,
    origin: 'google',
    googleReadAt: snapshot.readAt,
  };
}
