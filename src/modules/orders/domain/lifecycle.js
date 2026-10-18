/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';
import { trackerMotives } from './equipment.js';
import { trackerReplacementPairs } from './trackerReplacements.js';
/** Obtém a data de referência no fuso de São Paulo para os ciclos sem retirada registrada. */
export function todaySaoPaulo(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
/** Vincula Implementação e retirada pelo mesmo serial e placa; instalações concorrentes exigem revisão. */
export function observedPeriods(data, selected, referenceDate = todaySaoPaulo()) {
  const names = [
    'Status',
    'Motivo',
    'Placa',
    'ID Rastreador',
    'Data de atendimento',
    'Tipo de Serviço',
  ];
  if (names.some((name) => !data.columns.some((col) => col.label === name)))
    return { unavailable: true, periods: [], review: [] };
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(referenceDate) ||
    !Number.isFinite(Date.parse(referenceDate + 'T00:00:00Z'))
  )
    return { unavailable: false, invalidReference: true, periods: [], review: [] };
  const selection = new Set(selected.rows.map((row) => row.sourceRow)),
    groups = new Map(),
    review = [],
    periods = [];
  const interventions = trackerReplacementPairs(data);
  const unchangedRows = new Set(interventions.withoutReplacement.flatMap((item) => item.rows));
  const unresolved = interventions.pairs.filter((pair) => !pair.lifecycleEligible);
  const issueRows = new Set(interventions.issues.map((issue) => issue.row));
  const uncertainRows = data.rows.filter((row) => issueRows.has(row.sourceRow));
  const uncertainInterval = (start, end) =>
    unresolved.some(
      (pair) =>
        pair.plate === start.plate &&
        pair.serials.includes(start.serial) &&
        (pair.dates.some((date) => !date) ||
          pair.dates.some((date) => date >= start.date && date <= end)),
    ) ||
    uncertainRows.some(
      (row) =>
        String(field(data, row, 'Placa')?.raw ?? '').trim() === start.plate &&
        String(field(data, row, 'ID Rastreador')?.raw ?? '').trim() === start.serial &&
        (!attendanceDate(data, row) ||
          (attendanceDate(data, row) >= start.date && attendanceDate(data, row) <= end)),
    );
  const flag = (row, reason) => {
    if (!selection.has(row.sourceRow)) return;
    const col = data.columns.find((col) => col.label === 'Data de atendimento');
    review.push({
      address: `${col.letter}${row.sourceRow}`,
      row: row.sourceRow,
      column: 'Data de atendimento',
      value: String(field(data, row, 'Data de atendimento')?.display ?? ''),
      reason,
    });
  };
  for (const row of data.rows) {
    if (unchangedRows.has(row.sourceRow)) continue;
    if (!['Pago', 'Concluída'].includes(field(data, row, 'Status')?.raw)) continue;
    const motive = field(data, row, 'Motivo')?.raw;
    const kind = trackerMotives.installation.includes(motive)
      ? 'installation'
      : trackerMotives.removal.includes(motive)
        ? 'removal'
        : null;
    if (!kind) continue;
    const plate = field(data, row, 'Placa'),
      serial = field(data, row, 'ID Rastreador'),
      date = attendanceDate(data, row);
    if (!plate?.raw || serial?.raw == null || serial?.issue || plate.issue || !date) {
      flag(
        row,
        'Tempo observado: data ou identificador ausente/incompatível; vínculo indisponível.',
      );
      continue;
    }
    const key = JSON.stringify([String(plate.raw), String(serial.raw)]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ row, date, kind, plate: String(plate.raw), serial: String(serial.raw) });
  }
  for (const events of groups.values()) {
    events.sort((a, b) => a.date.localeCompare(b.date) || a.row.sourceRow - b.row.sourceRow);
    let installations = [];
    for (const event of events) {
      if (event.kind === 'installation') {
        if (field(data, event.row, 'Tipo de Serviço')?.raw !== 'Implementação')
          flag(
            event.row,
            'Tempo observado: instalação fora de Implementação; início não autorizado.',
          );
        installations.push(event);
        continue;
      }
      if (installations.length !== 1 || installations[0].date >= event.date) {
        flag(
          event.row,
          installations.length > 1
            ? 'Tempo observado: várias instalações sem retirada intermediária; revisar ciclo.'
            : 'Tempo observado: instalação anterior inequívoca não encontrada.',
        );
        installations = [];
        continue;
      }
      const start = installations[0];
      if (uncertainInterval(start, event.date)) {
        flag(
          start.row,
          'Tempo observado: troca confirmada sem direção, cliente ou data comuns; duração inconclusiva.',
        );
        installations = [];
        continue;
      }
      if (field(data, start.row, 'Tipo de Serviço')?.raw !== 'Implementação') {
        flag(
          event.row,
          'Tempo observado: instalação anterior não é Implementação; revisar início.',
        );
        installations = [];
        continue;
      }
      const days =
        (Date.parse(event.date + 'T00:00:00Z') - Date.parse(start.date + 'T00:00:00Z')) / 86400000;
      if (selection.has(start.row.sourceRow) && selection.has(event.row.sourceRow))
        periods.push({
          plate: event.plate,
          serial: event.serial,
          start: start.date,
          end: event.date,
          days,
          state: 'Encerrado',
          installationRow: start.row.sourceRow,
          removalRow: event.row.sourceRow,
        });
      installations = [];
    }
    if (installations.length > 1) {
      installations.forEach((event) =>
        flag(event.row, 'Tempo observado: várias instalações sem retirada; revisar ciclo.'),
      );
      continue;
    }
    const start = installations[0];
    if (
      start &&
      field(data, start.row, 'Tipo de Serviço')?.raw === 'Implementação' &&
      selection.has(start.row.sourceRow)
    ) {
      if (start.date > referenceDate) {
        flag(
          start.row,
          'Tempo observado: Implementação posterior à referência; período não calculado.',
        );
        continue;
      }
      if (uncertainInterval(start, referenceDate)) {
        flag(
          start.row,
          'Tempo observado: troca confirmada sem direção, cliente ou data comuns; duração inconclusiva.',
        );
        continue;
      }
      periods.push({
        plate: start.plate,
        serial: start.serial,
        start: start.date,
        end: referenceDate,
        days:
          (Date.parse(referenceDate + 'T00:00:00Z') - Date.parse(start.date + 'T00:00:00Z')) /
          86400000,
        state: 'Sem retirada registrada',
        installationRow: start.row.sourceRow,
        removalRow: null,
      });
    }
  }
  return { unavailable: false, periods, review };
}
