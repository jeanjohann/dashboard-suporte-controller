/** Lembretes manuais: relógio real, identidade base/veículo e histórico independente da telemetria. */
import { monitoringInstant, vehicleKey } from './monitoring.js';

export const reminderLabels = {
  scheduled: 'Agendado',
  completed: 'Conferido',
  cancelled: 'Cancelado',
};
export const reminderActions = {
  schedule: 'Agendado',
  reschedule: 'Reagendado',
  complete: 'Conferido',
  cancel: 'Cancelado',
};

/** O formulário usa explicitamente o horário de São Paulo, independentemente do computador. */
export function reminderLocalDate(value) {
  if (monitoringInstant(value) == null) return '';
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(value))
      .map(({ type, value: part }) => [type, part]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function reminderDueAt(local) {
  if (typeof local !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))
    throw Error('Informe uma data e hora válidas.');
  const value = local + ':00-03:00';
  if (monitoringInstant(value) == null || reminderLocalDate(value) !== local)
    throw Error('Informe uma data e hora válidas.');
  return new Date(value).toISOString();
}

export function reminderOverdue(record, now) {
  return record.status === 'scheduled' && Date.parse(record.dueAt) <= Date.parse(now);
}

function text(value, max) {
  if (typeof value !== 'string' || value.length > max) throw Error('Texto do lembrete inválido.');
  return value.trim();
}

export function changeReminder(
  previous,
  vehicle,
  action,
  draft = {},
  at = new Date().toISOString(),
) {
  if (monitoringInstant(at) == null || !Object.hasOwn(reminderActions, action))
    throw Error('Atualização de lembrete inválida.');
  if (!vehicle?.clientId || !vehicle?.vehicleId) throw Error('Veículo sem identificação válida.');
  const key = vehicleKey(vehicle);
  if (previous && previous.key !== key) throw Error('O lembrete pertence a outro veículo.');
  const active = previous?.status === 'scheduled';
  if ((action === 'schedule' && active) || (action !== 'schedule' && !active))
    throw Error('O lembrete mudou. Atualize a página antes de continuar.');
  const scheduling = ['schedule', 'reschedule'].includes(action);
  const dueAt = scheduling ? reminderDueAt(draft.localDate) : previous.dueAt;
  if (scheduling && Date.parse(dueAt) <= Date.parse(at))
    throw Error('Escolha uma data e hora no futuro.');
  const note = scheduling ? text(draft.note ?? '', 2000) : previous.note;
  const outcome = action === 'complete' ? text(draft.outcome ?? '', 2000) : '';
  const status = scheduling ? 'scheduled' : action === 'complete' ? 'completed' : 'cancelled';
  if (action === 'reschedule' && dueAt === previous.dueAt && note === previous.note)
    throw Error('Altere a data, hora ou observação antes de salvar.');
  return {
    key,
    clientId: String(vehicle.clientId),
    vehicleId: String(vehicle.vehicleId),
    plate: String(vehicle.plate || ''),
    clientName: String(vehicle.clientName || vehicle.clientId),
    dueAt,
    note,
    status,
    revision: (previous?.revision || 0) + 1,
    history: [...(previous?.history || []), { action, at, dueAt, note, outcome }],
  };
}

/** Conteúdo desconhecido/corrompido bloqueia gravação, em vez de virar uma lista vazia. */
export function validateReminderDocument(document) {
  if (!document || document.version !== 1 || !Array.isArray(document.records))
    throw Error('O armazenamento de lembretes tem formato incompatível.');
  const keys = new Set();
  for (const row of document.records) {
    if (
      !row ||
      typeof row.clientId !== 'string' ||
      !row.clientId ||
      typeof row.vehicleId !== 'string' ||
      !row.vehicleId ||
      row.key !== vehicleKey(row) ||
      keys.has(row.key) ||
      typeof row.plate !== 'string' ||
      typeof row.clientName !== 'string' ||
      !Object.hasOwn(reminderLabels, row.status) ||
      monitoringInstant(row.dueAt) == null ||
      !Number.isSafeInteger(row.revision) ||
      row.revision < 1 ||
      !Array.isArray(row.history) ||
      row.history.length !== row.revision
    )
      throw Error('Há lembretes inválidos no armazenamento. Os dados foram preservados.');
    text(row.note, 2000);
    for (const entry of row.history) {
      if (
        !entry ||
        !Object.hasOwn(reminderActions, entry.action) ||
        monitoringInstant(entry.at) == null ||
        monitoringInstant(entry.dueAt) == null
      )
        throw Error('Histórico de lembrete inválido. Os dados foram preservados.');
      text(entry.note, 2000);
      text(entry.outcome, 2000);
    }
    const last = row.history.at(-1);
    const expected = ['schedule', 'reschedule'].includes(last.action)
      ? 'scheduled'
      : last.action === 'complete'
        ? 'completed'
        : 'cancelled';
    if (last.dueAt !== row.dueAt || last.note !== row.note || expected !== row.status)
      throw Error('Histórico de lembrete inconsistente. Os dados foram preservados.');
    keys.add(row.key);
  }
  return document;
}

export function reminderExportRows(records, demo = false) {
  return [
    [
      'Modo',
      'Base ID',
      'Cliente',
      'Veículo ID',
      'Placa',
      'Situação atual',
      'Ação',
      'Registro ISO',
      'Lembrete ISO',
      'Observação',
      'Resultado da conferência',
    ],
    ...records.flatMap((row) =>
      row.history.map((entry) => [
        demo ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'Lembrete manual local',
        row.clientId,
        row.clientName,
        row.vehicleId,
        row.plate,
        reminderLabels[row.status],
        reminderActions[entry.action],
        entry.at,
        entry.dueAt,
        entry.note,
        entry.outcome,
      ]),
    ),
  ];
}
