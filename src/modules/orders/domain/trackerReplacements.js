/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';
export const trackerMotives = {
  installation: [
    'Instalação Business 2.0',
    'Instalação Business 2.1',
    'Instalação Start 1.0',
    'Instalação Turbo',
  ],
  removal: [
    'Desinstalação Business 2.0',
    'Desinstalação Business 2.1',
    'Desinstalação Start 1.0',
    'Desinstalação Turbo',
  ],
  reinstallation: [
    'Reinstalação Business 2.0',
    'Reinstalação Business 2.1',
    'Reinstalação Start 1.0',
    'Reinstalação Turbo',
  ],
};
export const completed = (data, row) =>
  ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw);
/** Lê texto utilizável da origem; célula com erro ou ausência não vira um identificador válido. */
export function sourceText(data, row, label) {
  const cell = field(data, row, label);
  return !cell || cell.issue || cell.raw == null ? '' : String(cell.raw).trim();
}
/** Rejeita placas vazias e marcadores provisórios conhecidos antes de tentar vincular equipamentos. */
export function validPlate(plate) {
  return Boolean(
    plate && !['0', '-', '?', 's/placa', 'sem placa', 'sem dados'].includes(plate.toLowerCase()),
  );
}
/** Valida serial numérico positivo e precisão segura para evitar vínculos com identificadores corrompidos. */
export function validSerial(data, row) {
  const cell = field(data, row, 'ID Rastreador'),
    serial = sourceText(data, row, 'ID Rastreador');
  return Boolean(
    serial &&
    /^\d+$/.test(serial) &&
    Number(serial) > 0 &&
    (typeof cell.raw !== 'number' || Number.isSafeInteger(cell.raw)),
  );
}
/** Classifica a intervenção pelo mapeamento explícito de motivos aprovado para rastreadores. */
export function trackerKind(data, row) {
  const motive = sourceText(data, row, 'Motivo');
  return trackerMotives.removal.includes(motive)
    ? 'removal'
    : trackerMotives.installation.includes(motive)
      ? 'installation'
      : trackerMotives.reinstallation.includes(motive)
        ? 'reinstallation'
        : null;
}
/** Procura retirada e instalação compatíveis no mesmo chamado e contexto; associações ambíguas são encaminhadas à revisão. */
export function trackerReplacementPairs(data) {
  const required = [
    'Status',
    'Tipo de Serviço',
    'Motivo',
    'Razão Social',
    'Placa',
    'ID Rastreador',
    'Data de atendimento',
  ];
  if (required.some((label) => !data.columns.some((c) => c.label === label)))
    return { available: false, pairs: [], issues: [] };
  const groups = new Map(),
    pairs = [],
    issues = [];
  const flag = (row, label, reason) => {
    const col = data.columns.find((c) => c.label === label);
    issues.push({
      address: `${col.letter || ''}${row.sourceRow}`,
      row: row.sourceRow,
      column: label,
      value: String(field(data, row, label)?.display ?? ''),
      reason,
    });
  };
  for (const row of data.rows) {
    if (!completed(data, row) || sourceText(data, row, 'Tipo de Serviço') !== 'Assistência Técnica')
      continue;
    const kind = trackerKind(data, row);
    if (!kind) continue;
    const client = sourceText(data, row, 'Razão Social'),
      plate = sourceText(data, row, 'Placa'),
      date = attendanceDate(data, row);
    if (!client || !validPlate(plate) || !date) {
      flag(
        row,
        !client ? 'Razão Social' : !validPlate(plate) ? 'Placa' : 'Data de atendimento',
        'Troca de rastreador: cliente, placa e data válidos são necessários para confirmar o par.',
      );
      continue;
    }
    const key = JSON.stringify([row.os, client, plate, date]);
    if (!groups.has(key)) groups.set(key, { client, plate, date, installation: [], removal: [] });
    groups.get(key)[kind === 'removal' ? 'removal' : 'installation'].push(row);
  }
  for (const group of groups.values()) {
    const rows = [...group.installation, ...group.removal];
    if (group.installation.length !== 1 || group.removal.length !== 1) {
      rows.forEach((row) =>
        flag(
          row,
          'Motivo',
          !group.installation.length || !group.removal.length
            ? 'Troca de rastreador: par completo não encontrado no mesmo chamado, cliente, placa e data.'
            : 'Troca de rastreador: múltiplas retiradas/entradas no mesmo chamado, cliente, placa e data; vínculo ambíguo.',
        ),
      );
      continue;
    }
    const outgoing = group.removal[0],
      incoming = group.installation[0];
    if (!validSerial(data, outgoing) || !validSerial(data, incoming)) {
      rows.forEach((row) =>
        flag(
          row,
          'ID Rastreador',
          'Troca de rastreador: serial ausente, não numérico ou incompatível.',
        ),
      );
      continue;
    }
    const oldSerial = sourceText(data, outgoing, 'ID Rastreador'),
      newSerial = sourceText(data, incoming, 'ID Rastreador');
    if (oldSerial === newSerial) {
      rows.forEach((row) =>
        flag(
          row,
          'ID Rastreador',
          'Retirada e entrada do mesmo serial não confirmam substituição.',
        ),
      );
      continue;
    }
    pairs.push({
      os: incoming.os,
      client: group.client,
      plate: group.plate,
      date: group.date,
      oldSerial,
      newSerial,
      removalRow: outgoing.sourceRow,
      installationRow: incoming.sourceRow,
      rows: [outgoing.sourceRow, incoming.sourceRow],
    });
  }
  return {
    available: true,
    pairs: pairs.sort((a, b) => a.date.localeCompare(b.date) || a.removalRow - b.removalRow),
    issues,
  };
}
