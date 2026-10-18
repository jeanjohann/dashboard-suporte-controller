/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';
import { isUnproductive } from './attendanceKind.js';
import { customerIdentity } from './customerIdentity.js';
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
/** Cliente usa a identidade analítica por CNPJ; os demais textos preservam o conteúdo utilizável da origem. */
export function sourceText(data, row, label) {
  if (label === 'Razão Social')
    return customerIdentity(data, row).label === 'Sem cliente'
      ? ''
      : customerIdentity(data, row).label;
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
/** Classifica no arquivo completo: uma linha/ID é sem troca; duas linhas/IDs distintos confirmam um evento. */
export function trackerReplacementPairs(data) {
  const required = ['Status', 'Tipo de Serviço', 'Motivo', 'Placa', 'ID Rastreador'];
  if (required.some((label) => !data.columns.some((c) => c.label === label)))
    return { available: false, pairs: [], withoutReplacement: [], issues: [] };
  const groups = new Map(),
    pairs = [],
    withoutReplacement = [],
    issues = [];
  const flag = (row, label, reason) => {
    const col = data.columns.find((c) => c.label === label);
    issues.push({
      address: col ? `${col.letter || ''}${row.sourceRow}` : '—',
      row: row.sourceRow,
      column: label,
      value: String(field(data, row, label)?.display ?? ''),
      reason,
    });
  };
  for (const row of data.rows) {
    if (
      !completed(data, row) ||
      isUnproductive(data, row) ||
      sourceText(data, row, 'Tipo de Serviço') !== 'Assistência Técnica' ||
      sourceText(data, row, 'Motivo') === 'Manutenção de Acessório'
    )
      continue;
    const plate = sourceText(data, row, 'Placa');
    if (!validPlate(plate) || !String(row.os ?? '').trim()) {
      flag(
        row,
        'Placa',
        'Manutenção: chamado e placa válidos são necessários para classificar a intervenção.',
      );
      continue;
    }
    const key = JSON.stringify([String(row.os).trim(), plate]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const rows of groups.values()) {
    if (rows.length > 2 || rows.some((row) => !validSerial(data, row))) {
      rows.forEach((row) =>
        flag(
          row,
          'ID Rastreador',
          rows.length > 2
            ? 'Manutenção: mais de duas linhas no mesmo chamado e veículo; revisar os eventos.'
            : 'Manutenção: identificador ausente ou incompatível; não presumir ausência de troca.',
        ),
      );
      continue;
    }
    if (rows.length === 1) {
      const row = rows[0];
      withoutReplacement.push({
        os: row.os,
        plate: sourceText(data, row, 'Placa'),
        serial: sourceText(data, row, 'ID Rastreador'),
        rows: [row.sourceRow],
      });
      continue;
    }
    const serials = rows.map((row) => sourceText(data, row, 'ID Rastreador'));
    if (serials[0] === serials[1]) {
      rows.forEach((row) =>
        flag(
          row,
          'ID Rastreador',
          'Retirada e entrada do mesmo serial não confirmam substituição.',
        ),
      );
      continue;
    }
    const removals = rows.filter((row) => trackerKind(data, row) === 'removal');
    const installations = rows.filter((row) =>
      ['installation', 'reinstallation'].includes(trackerKind(data, row)),
    );
    const directed = removals.length === 1 && installations.length === 1;
    const outgoing = directed ? removals[0] : null,
      incoming = directed ? installations[0] : null;
    const dates = rows.map((row) => attendanceDate(data, row));
    const date = dates.every((d) => d && d === dates[0]) ? dates[0] : null;
    if (!date) {
      rows.forEach((row) =>
        flag(
          row,
          'Data de atendimento',
          'Troca de rastreador: as duas linhas precisam ter a mesma data válida de atendimento.',
        ),
      );
      continue;
    }
    const clients = rows.map((row) => customerIdentity(data, row));
    const client = clients.every((c) => c.key !== 'Sem cliente' && c.key === clients[0].key)
      ? clients[0].label
      : null;
    // A confirmação de troca não autoriza inventar direção, cliente histórico ou data.
    const lifecycleEligible = Boolean(directed && date && client);
    pairs.push({
      os: rows[0].os,
      client,
      clientKey: client ? clients[0].key : null,
      plate: sourceText(data, rows[0], 'Placa'),
      date,
      dates,
      serials,
      lifecycleEligible,
      oldSerial: outgoing ? sourceText(data, outgoing, 'ID Rastreador') : null,
      newSerial: incoming ? sourceText(data, incoming, 'ID Rastreador') : null,
      removalRow: outgoing?.sourceRow ?? null,
      installationRow: incoming?.sourceRow ?? null,
      rows: directed ? [outgoing.sourceRow, incoming.sourceRow] : rows.map((row) => row.sourceRow),
    });
  }
  return {
    available: true,
    pairs: pairs.sort(
      (a, b) => (a.date || '').localeCompare(b.date || '') || a.rows[0] - b.rows[0],
    ),
    withoutReplacement,
    issues,
  };
}
