/** Indicadores de gestão: fontes separadas, período civil e ausência distinta de zero. */
import { zohoDay, supportClosureBasis } from '../../../shared/data/zohoActivity.js';
import { attendanceDate, field } from '../../../shared/data/filters.js';
import { isUnproductive } from '../../orders/domain/attendanceKind.js';
import { customerAnalysisIdentity } from '../../orders/domain/customerIdentity.js';

import { agents, manualFields } from './contracts.js';
export {
  agents,
  subjects,
  manualFields,
  metricLabels,
  sections,
  defaultSettings,
  periodDays,
  previousPeriod,
  entryId,
  validateEntry,
  blankEntry,
  validateSettings,
  manualSummary,
} from './contracts.js';
const normalized = (value) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('pt-BR');
/** Vínculos explícitos: nenhuma aproximação de nomes é aplicada. */
export const orderAgentNames = {
  103932000029960050: ['eduardo', 'eduardo oliveira'],
  '103932000027400001': ['jean', 'jean johann'],
};
export function ordersSummary(data, period, agentId = '') {
  if (!data) return null;
  const required = [
    'Status',
    'Data de atendimento',
    'Agendamento',
    'Resp. Execução',
    'Resp. Agendamento',
    'Tipo de Serviço',
    'Motivo',
  ];
  const absent = required.filter((label) => !data.columns.some((c) => c.label === label));
  if (absent.length) return { unavailable: absent };
  const text = (row, label) => {
    const c = field(data, row, label);
    return c?.issue ? '' : String(c?.raw ?? '').trim();
  };
  const within = (date) => date && date >= period.start && date <= period.end;
  const ownerOf = (row, role) =>
    agents.find((a) => orderAgentNames[a.id].includes(normalized(text(row, role))))?.id || '';
  const selected = (id) => Boolean(id) && (!agentId || id === agentId);
  const result = {
    executed: 0,
    scheduled: 0,
    unproductive: 0,
    missingExecutionDate: 0,
    missingScheduleDate: 0,
    unmapped: 0,
    agents: agents.map((a) => ({ ...a, executed: 0, scheduled: 0, unproductive: 0 })),
    daily: new Map(),
    types: new Map(),
    clients: new Map(),
    rows: [],
  };
  const add = (map, label, key) => {
    const row = map.get(label) || { label, executed: 0, scheduled: 0 };
    row[key]++;
    map.set(label, row);
  };
  for (const row of data.rows) {
    const status = text(row, 'Status'),
      effective = ['Concluída', 'Pago'].includes(status),
      executedAt = attendanceDate(data, row),
      scheduledAt = attendanceDate(data, row, 'Agendamento'),
      executor = ownerOf(row, 'Resp. Execução'),
      scheduler = ownerOf(row, 'Resp. Agendamento');
    if (effective && !executedAt && selected(executor)) result.missingExecutionDate++;
    if (text(row, 'Agendamento') && !scheduledAt && selected(scheduler))
      result.missingScheduleDate++;
    if ((effective && within(executedAt) && !executor) || (within(scheduledAt) && !scheduler))
      result.unmapped++;
    const unproductive = isUnproductive(data, row);
    const performed = effective && within(executedAt) && selected(executor);
    const execution = performed && !unproductive;
    if (performed && unproductive) {
      result.unproductive++;
      result.agents.find((a) => a.id === executor).unproductive++;
    }
    // Agenda conta linhas com data agendada, inclusive as já realizadas, excluindo canceladas.
    const scheduling =
      within(scheduledAt) && !['Cancelado', 'Cancelada'].includes(status) && selected(scheduler);
    for (const [yes, key, owner, date] of [
      [execution, 'executed', executor, executedAt],
      [scheduling, 'scheduled', scheduler, scheduledAt],
    ]) {
      if (!yes) continue;
      result[key]++;
      const agent = result.agents.find((a) => a.id === owner);
      if (agent) agent[key]++;
      add(result.daily, date, key);
      add(result.types, text(row, 'Tipo de Serviço') || 'Não informado', key);
      add(
        result.clients,
        customerAnalysisIdentity(data, row).label.toLocaleUpperCase('pt-BR'),
        key,
      );
    }
    if (performed || scheduling)
      result.rows.push({
        sourceRow: row.sourceRow,
        os: String(row.os ?? ''),
        executedAt,
        scheduledAt,
        executor,
        scheduler,
        executorName: agents.find((a) => a.id === executor)?.name || '',
        schedulerName: agents.find((a) => a.id === scheduler)?.name || '',
        execution: Boolean(execution),
        scheduling: Boolean(scheduling),
        unproductive,
        status,
        type: text(row, 'Tipo de Serviço'),
      });
  }
  for (const key of ['daily', 'types', 'clients'])
    result[key] = [...result[key].values()].sort((a, b) =>
      key === 'daily'
        ? a.label.localeCompare(b.label)
        : b.executed - a.executed || a.label.localeCompare(b.label),
    );
  return result;
}
/** Só usa uma consulta completa que cubra o período inteiro. Filtra por data do evento, nunca pelo responsável atual. */
export function zohoSummary(data, period, agentId = '') {
  if (!data || data.period.start > period.start || data.period.end < period.end) return null;
  const ids = new Set(agents.filter((a) => !agentId || a.id === agentId).map((a) => a.id));
  const within = (time) => {
    const d = zohoDay(time);
    return d && d >= period.start && d <= period.end;
  };
  const unique = (rows) => [...new Map(rows.map((r) => [`${r.ticketId}:${r.id}`, r])).values()];
  const entries = unique(data.entries).filter((r) => ids.has(r.agentId) && within(r.executedTime));
  const latestClosures = new Map();
  const ambiguousTickets = new Set();
  for (const row of unique(data.closures || [])) {
    const old = latestClosures.get(row.ticketId);
    if (!old || Date.parse(row.closedAt) > Date.parse(old.closedAt)) {
      latestClosures.set(row.ticketId, row);
      ambiguousTickets.delete(row.ticketId);
    } else if (Date.parse(row.closedAt) === Date.parse(old.closedAt) && row.agentId !== old.agentId)
      ambiguousTickets.add(row.ticketId);
  }
  const closures =
    data.closureBasis === supportClosureBasis &&
    Array.isArray(data.closures) &&
    data.closuresComplete !== false &&
    !ambiguousTickets.size
      ? [...latestClosures.values()].filter((r) => ids.has(r.agentId) && within(r.closedAt))
      : null;
  const seconds = entries.reduce((n, r) => n + r.seconds, 0),
    tickets = new Set(entries.map((r) => r.ticketId)).size;
  const daily = new Map();
  const evidence = new Map((data.ticketIndicators || []).map((r) => [r.ticketId, r]));
  const usable = data.indicatorsAvailable === true;
  const creationUnknown =
    !usable || [...evidence.values()].some((r) => r.creation.state === 'unknown');
  const createdFor = (selectedIds) =>
    creationUnknown
      ? null
      : new Set(
          [...evidence.values()]
            .filter(
              (r) =>
                r.creation.state === 'support' &&
                selectedIds.has(r.creation.agentId) &&
                within(r.creation.at),
            )
            .map((r) => r.ticketId),
        ).size;
  const categories =
    usable && closures && closures.every((r) => evidence.has(r.ticketId))
      ? [...new Set(closures.map((r) => r.ticketId))].reduce(
          (map, id) => {
            const label = evidence.get(id).category || 'Categoria não informada';
            map.set(label, (map.get(label) || 0) + 1);
            return map;
          },
          new Map((data.categoryCatalog || []).map((label) => [label, 0])),
        )
      : null;
  const closedTickets =
    categories && closures
      ? [...new Map(closures.map((row) => [`${row.agentId}:${row.ticketId}`, row])).values()]
          .map((row) => ({
            ticketId: row.ticketId,
            number: row.number || row.ticketId,
            agentId: row.agentId,
            agent: agents.find((a) => a.id === row.agentId).name,
            closedAt: row.closedAt,
            category: evidence.get(row.ticketId).category || 'Categoria não informada',
            subCategory: evidence.get(row.ticketId).subCategory || 'Não informada',
            classification: evidence.get(row.ticketId).classification || 'Não informada',
          }))
          .sort((a, b) => b.closedAt.localeCompare(a.closedAt) || a.number.localeCompare(b.number))
      : null;
  for (const row of entries) {
    const label = zohoDay(row.executedTime);
    daily.set(label, (daily.get(label) || 0) + row.seconds);
  }
  return {
    created: createdFor(ids),
    creationUnknown,
    categories: categories
      ? [...categories]
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
      : null,
    closedTickets,
    timeEntries: entries.map((row) => ({
      ticketId: row.ticketId,
      agentId: row.agentId,
      agent: agents.find((a) => a.id === row.agentId)?.name || 'Agente não identificado',
      executedTime: row.executedTime,
      seconds: row.seconds,
    })),
    categoryAgents: closedTickets
      ? [
          ...closedTickets
            .reduce(
              (map, row) => {
                const key = `${row.agentId}:${row.category}`;
                const current = map.get(key) || {
                  agentId: row.agentId,
                  agent: row.agent,
                  category: row.category,
                  value: 0,
                };
                current.value++;
                map.set(key, current);
                return map;
              },
              new Map(
                agents
                  .filter((a) => ids.has(a.id))
                  .flatMap((a) =>
                    (data.categoryCatalog || []).map((category) => [
                      `${a.id}:${category}`,
                      { agentId: a.id, agent: a.name, category, value: 0 },
                    ]),
                  ),
              ),
            )
            .values(),
        ].sort((a, b) => a.agent.localeCompare(b.agent) || b.value - a.value)
      : null,
    seconds,
    meanSeconds: tickets ? seconds / tickets : null,
    tickets,
    closed: closures ? new Set(closures.map((r) => r.ticketId)).size : null,
    daily: [...daily]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value })),
    agents: agents
      .filter((a) => ids.has(a.id))
      .map((a) => ({
        ...a,
        created: createdFor(new Set([a.id])),
        seconds: entries.filter((r) => r.agentId === a.id).reduce((n, r) => n + r.seconds, 0),
        closed: closures
          ? new Set(closures.filter((r) => r.agentId === a.id).map((r) => r.ticketId)).size
          : null,
      })),
    reviewCount: (data.review || []).filter((r) => ids.has(r.agentId) && r.kind === 'entry').length,
  };
}
/** Fotografia atual: deliberadamente não recebe filtro de período. */
export function backlogSummary(data, agentId = '') {
  if (!data?.complete) return null;
  const selected = agents.filter((a) => !agentId || a.id === agentId);
  const ids = new Set(selected.map((a) => a.id));
  const tickets = data.tickets.filter((row) => ids.has(row.agentId));
  return {
    readAt: data.readAt,
    total: tickets.length,
    onHold: tickets.filter((row) => row.state === 'ONHOLD').length,
    agents: selected.map((agent) => ({
      ...agent,
      pending: tickets.filter((row) => row.agentId === agent.id).length,
      open: tickets.filter((row) => row.agentId === agent.id && row.state === 'OPEN').length,
      onHold: tickets.filter((row) => row.agentId === agent.id && row.state === 'ONHOLD').length,
      holdStatuses: [
        ...new Set(
          tickets
            .filter((row) => row.agentId === agent.id && row.state === 'ONHOLD')
            .map((row) => row.status || 'Status não informado'),
        ),
      ],
    })),
    tickets,
  };
}
export const duration = (seconds) =>
  seconds == null
    ? 'Sem dados'
    : `${Math.floor(seconds / 3600)}h ${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}min`;
