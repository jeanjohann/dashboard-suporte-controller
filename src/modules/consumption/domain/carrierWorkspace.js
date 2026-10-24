import { importLineStatement } from './lineConsumption.js';
import { validISODate } from '../../../shared/data/isoDate.js';
import { csv } from '../../../shared/export/exports.js';

export const carrierName = (key) => (key === 'kore' ? 'Kore' : key === 'arqia' ? 'Arqia' : '');
export function carrierArchive(archive, operator) {
  if (!operator) return archive;
  return {
    ...archive,
    files: archive.files.filter(
      (file) => importLineStatement(file.text, file.filename, file.id).operator === operator,
    ),
    notes: archive.notes.filter((note) => note.operator === operator),
  };
}
export function restoreCarrierArchive(current, backup, operator) {
  if (!operator) throw Error('Selecione a página da operadora antes de restaurar.');
  const incoming = carrierArchive(backup, operator);
  return {
    ...current,
    files: [
      ...current.files.filter(
        (file) => importLineStatement(file.text, file.filename, file.id).operator !== operator,
      ),
      ...incoming.files,
    ],
    notes: [...current.notes.filter((note) => note.operator !== operator), ...incoming.notes],
  };
}
/** O período do acumulado deve ser confirmado explicitamente; não se presume o mês atual. */
export function koreStatementText(snapshot, period) {
  if (!snapshot?.complete || !Array.isArray(snapshot.rows) || !snapshot.rows.length)
    throw Error('Conclua a coleta KORE antes de preparar a apuração.');
  if (
    !validISODate(period?.start) ||
    !validISODate(period?.end) ||
    period.start > period.end ||
    !period.confirmed
  )
    throw Error('Confirme início e fim reais do acumulado KORE.');
  const date = (value) => value.split('-').reverse().join('/');
  return csv([
    [
      'Data inicio',
      'Data fim',
      'Produto',
      'Consumo total',
      'Servico',
      'Empresa',
      'Status',
      'ICCID',
      'MSISDN',
    ],
    ...snapshot.rows.map((row) => {
      if (row.bytes != null && (!Number.isSafeInteger(row.bytes) || row.bytes < 0))
        throw Error('Volume KORE inválido.');
      const mb = row.bytes == null ? '' : (row.bytes / 1000000).toFixed(6).replace('.', ',');
      return [
        date(period.start),
        date(period.end),
        'Não informado',
        mb,
        'dados',
        '',
        row.status || '',
        row.iccid || '',
        row.number || '',
      ];
    }),
  ]);
}
