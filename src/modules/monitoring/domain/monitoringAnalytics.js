/** Indicadores do retrato atual: não inferem episódios, recuperação ou falha confirmada. */
import { monitoringStages } from './monitoring.js';
import { matchesTelemetryFocus } from './monitoringTelemetry.js';
import { reminderOverdue } from './monitoringReminders.js';

export const monitoringFocusLabels = {
  all: 'Todos os veículos',
  alerts: 'Acima do limite',
  critical: '96 h ou mais',
  days30: '30 dias ou mais',
  days60: '60 dias ou mais',
  days90: '90 dias ou mais',
  missing: 'Sem posição registrada',
  unknown: 'Sem classificação utilizável',
  unstarted: 'Alertas · não iniciado',
  analysis: 'Alertas · em análise',
  contact: 'Alertas · aguardando contato',
  scheduled: 'Alertas · manutenção agendada',
  closed: 'Alertas · acompanhamento encerrado',
  'external-power': 'Falha de alimentação externa',
  'battery-low': 'Bateria interna baixa',
  'battery-failure': 'Falha da bateria interna',
  'battery-discharging': 'Bateria descarregando',
  'power-unknown': 'Sem informação de alimentação',
  'positions-active': 'Com posições nas últimas 24 h',
  'positions-zero': 'Zero posições nas últimas 24 h',
  'overdue-reminders': 'Lembretes vencidos',
};
const status = (row, notes) =>
  monitoringStages.includes(notes[row.key]?.status) ? notes[row.key].status : monitoringStages[0];
const activeStages = monitoringStages.slice(1, 4);
const normalized = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

/** Usa todas as situações das bases selecionadas; filtros da fila não mudam o denominador. */
export function monitoringAnalytics(result, notes = {}) {
  const alerts = result.scoped.filter((row) => row.state === 'delayed');
  const stages = monitoringStages.map((label) => ({
    label,
    value: alerts.filter((row) => status(row, notes) === label).length,
  }));
  const active = alerts.filter((row) => activeStages.includes(status(row, notes))).length;
  return {
    alerts: alerts.length,
    stages,
    active,
    coverage: alerts.length ? active / alerts.length : null,
    affectedBases: new Set(alerts.map((row) => row.clientId)).size,
    maximumHours: alerts.length
      ? alerts.reduce((maximum, row) => Math.max(maximum, row.hours), 0)
      : null,
    unknown: result.scoped.filter((row) => !['recent', 'delayed'].includes(row.state)).length,
  };
}

/** Filtro de apresentação para a grade e exportação. Busca não altera os cards nem a origem. */
export function filterMonitoringQueue(result, filters, notes = {}, reminders = [], now = '') {
  const { focus = 'all', stage = 'all', search = '' } = filters;
  if (!(focus in monitoringFocusLabels)) throw Error('Recorte de acompanhamento inválido.');
  const tokens = normalized(search).trim().split(/\s+/).filter(Boolean);
  const overdueKeys = new Set(
    focus === 'overdue-reminders'
      ? reminders
          .filter((reminder) => reminderOverdue(reminder, now))
          .map((reminder) => reminder.key)
      : [],
  );
  const stageFocus = {
    unstarted: monitoringStages[0],
    analysis: monitoringStages[1],
    contact: monitoringStages[2],
    scheduled: monitoringStages[3],
    closed: monitoringStages[4],
  };
  return {
    ...result,
    rows: result.rows.filter((row) => {
      if (!matchesTelemetryFocus(row, focus)) return false;
      if (stage !== 'all' && status(row, notes) !== stage) return false;
      if (focus === 'alerts' && row.state !== 'delayed') return false;
      if (focus === 'critical' && (!['recent', 'delayed'].includes(row.state) || row.hours < 96))
        return false;
      if (
        { days30: 720, days60: 1440, days90: 2160 }[focus] &&
        (!['recent', 'delayed'].includes(row.state) ||
          row.hours < { days30: 720, days60: 1440, days90: 2160 }[focus])
      )
        return false;
      if (focus === 'missing' && row.state !== 'missing') return false;
      if (focus === 'unknown' && ['recent', 'delayed'].includes(row.state)) return false;
      if (focus === 'overdue-reminders' && !overdueKeys.has(row.key)) return false;
      if (
        stageFocus[focus] &&
        (row.state !== 'delayed' || status(row, notes) !== stageFocus[focus])
      )
        return false;
      const text = normalized(
        [
          row.plate,
          row.trackerId,
          row.clientName,
          row.clientId,
          row.profile,
          row.deviceModel,
          row.identifier,
          notes[row.key]?.owner,
        ].join(' '),
      );
      return tokens.every((token) => text.includes(token));
    }),
  };
}
