/** Contrato analítico Zoho: datas em Brasília, autoria explícita e durações sem inferir jornada. */
import { validISODate } from './isoDate.js';
export const zohoTeam = [
  { id: '103932000029960050', name: 'Eduardo Oliveira' },
  { id: '103932000027400001', name: 'Jean Johann' },
];
export const zohoId = (value) =>
  typeof value === 'number'
    ? Number.isSafeInteger(value) && value >= 0
      ? String(value)
      : null
    : typeof value === 'string' && /^\d{1,40}$/.test(value)
      ? value
      : null;
export const zohoDay = (value) => {
  if (
    typeof value !== 'string' ||
    !/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
};
export function zohoPeriod(start, end) {
  if (
    !validISODate(start) ||
    !validISODate(end) ||
    start > end ||
    (Date.parse(end) - Date.parse(start)) / 86400000 > 30
  )
    throw Error('Selecione um período válido de até 31 dias.');
  return {
    start,
    end,
    from: new Date(start + 'T00:00:00-03:00').toISOString(),
    to: new Date(Date.parse(end + 'T00:00:00-03:00') + 86400000 - 1).toISOString(),
  };
}
const inPeriod = (value, period) => {
  const day = zohoDay(value);
  return day && day >= period.start && day <= period.end;
};
const bool = (value) =>
  value === true || value === 'true' ? true : value === false || value === 'false' ? false : null;
const integer = (value) =>
  (typeof value === 'string' && /^\d+$/.test(value)) ||
  (typeof value === 'number' && Number.isSafeInteger(value))
    ? Number(value)
    : null;
export function zohoSeconds(entry) {
  const h = integer(entry.hoursSpent),
    m = integer(entry.minutesSpent),
    s = integer(entry.secondsSpent);
  if ([h, m, s].some((n) => n == null || !Number.isSafeInteger(n) || n < 0) || m > 59 || s > 59)
    return null;
  const total = h * 3600 + m * 60 + s;
  return Number.isSafeInteger(total) ? total : null;
}
export function normalizeZohoEntry(entry, ticketId, period) {
  const base = { id: zohoId(entry?.id), ticketId, agentId: zohoId(entry?.ownerId) };
  if (!base.id) return { ...base, reason: 'ID de apontamento inválido' };
  if (bool(entry.isTrashed) === true) return { ...base, reason: 'Apontamento excluído' };
  if (bool(entry.isTrashed) == null) return { ...base, reason: 'Exclusão não informada' };
  if (entry.parent?.type !== 'TICKETS' || zohoId(entry.parent.id) !== ticketId)
    return { ...base, reason: 'Origem do apontamento divergente' };
  if (!base.agentId) return { ...base, reason: 'Agente do apontamento não informado' };
  if (!zohoDay(entry.executedTime))
    return { ...base, reason: 'Data de execução ausente ou inválida' };
  if (!inPeriod(entry.executedTime, period)) return { ...base, reason: 'Fora do período' };
  const seconds = zohoSeconds(entry);
  if (seconds == null) return { ...base, reason: 'Duração ausente ou inválida' };
  return {
    ...base,
    executedTime: entry.executedTime,
    seconds,
    mode: ['MANUAL', 'AUTO'].includes(entry.mode) ? entry.mode : 'Não informado',
    billable: bool(entry.isBillable),
    reason: null,
  };
}
export function normalizeZohoReply(thread, ticketId, period) {
  const base = {
    id: zohoId(thread?.id),
    ticketId,
    agentId: zohoId(thread?.responderId),
    channel: typeof thread?.channel === 'string' ? thread.channel.slice(0, 40) : '',
  };
  if (!base.id) return { ...base, reason: 'ID de interação inválido' };
  if (
    thread.direction !== 'out' ||
    thread.visibility !== 'public' ||
    thread.status !== 'SUCCESS' ||
    thread.author?.type !== 'AGENT'
  )
    return { ...base, reason: 'Não é saída pública enviada por agente' };
  if (
    bool(thread.isForward) === true ||
    bool(thread.isDescriptionThread) === true ||
    bool(thread.isAutomated) === true ||
    ['AUTOMATION', 'WORKFLOW'].includes(thread.source?.type)
  )
    return { ...base, reason: 'Encaminhamento, descrição ou automação' };
  if (!base.agentId) return { ...base, reason: 'Autoria não informada' };
  const sentTime = zohoDay(thread.sendDateTime) ? thread.sendDateTime : null;
  const timestamp = sentTime || thread.createdTime;
  if (!zohoDay(timestamp)) return { ...base, reason: 'Data de envio não identificada' };
  if (!inPeriod(timestamp, period))
    return {
      ...base,
      reason: sentTime ? 'Fora do período' : 'Data de envio ausente; criação fora do período',
    };
  const review = [];
  if (!sentTime) review.push('Data baseada na criação da interação');
  if (bool(thread.isDescriptionThread) == null) review.push('Descrição inicial não informada');
  if (bool(thread.isAutomated) !== false) review.push('Automação não informada');
  if (base.channel === 'EMAIL' && bool(thread.isForward) == null)
    review.push('Encaminhamento não informado');
  return { ...base, timestamp, review, reason: null };
}
export function summarizeZohoActivity(data, { reviewedReplies = false } = {}) {
  const ids = new Set(zohoTeam.map((agent) => agent.id));
  const unique = (rows) => [
    ...new Map(rows.map((row) => [`${row.ticketId}:${row.id}`, row])).values(),
  ];
  const entries = unique(data.entries).filter((entry) => ids.has(entry.agentId));
  const candidates = unique(data.replies).filter((reply) => ids.has(reply.agentId));
  const pendingReplies = candidates.filter((reply) => reply.review.length);
  const replies = candidates.filter((reply) => !reply.review.length || reviewedReplies);
  const total = (agentIds) => {
    const e = entries.filter((row) => agentIds.has(row.agentId));
    const r = replies.filter((row) => agentIds.has(row.agentId));
    const uncertainDates = (data.review || []).some(
      (row) =>
        row.kind === 'reply' &&
        agentIds.has(row.agentId) &&
        (row.reason === 'Data de envio não identificada' ||
          (!reviewedReplies && row.reason === 'Data de envio ausente; criação fora do período')),
    );
    const pending =
      uncertainDates ||
      (!reviewedReplies && pendingReplies.some((row) => agentIds.has(row.agentId)));
    const awaiting = unique([
      ...(!reviewedReplies ? pendingReplies.filter((row) => agentIds.has(row.agentId)) : []),
      ...(data.review || []).filter(
        (row) =>
          row.kind === 'reply' &&
          agentIds.has(row.agentId) &&
          (row.reason === 'Data de envio não identificada' ||
            (!reviewedReplies && row.reason === 'Data de envio ausente; criação fora do período')),
      ),
    ]);
    const reasons = new Map();
    for (const row of awaiting)
      for (const reason of new Set(row.review?.length ? row.review : [row.reason]))
        if (reason) reasons.set(reason, (reasons.get(reason) || 0) + 1);
    const seconds = e.reduce((sum, row) => sum + row.seconds, 0);
    const ticketsWithTime = new Set(e.map((row) => row.ticketId)).size;
    return {
      seconds,
      ticketsWithTime,
      entries: e.length,
      meanSeconds: ticketsWithTime ? seconds / ticketsWithTime : null,
      replies: pending ? null : r.length,
      ticketsReplied: pending ? null : new Set(r.map((row) => row.ticketId)).size,
      confirmedReplies: r.length,
      confirmedTicketsReplied: new Set(r.map((row) => row.ticketId)).size,
      pendingReplyCount: awaiting.length,
      pendingTicketCount: new Set(awaiting.map((row) => row.ticketId)).size,
      reviewReasons: [...reasons].map(([reason, count]) => ({ reason, count })),
    };
  };
  return {
    totals: total(ids),
    agents: zohoTeam.map((agent) => ({ ...agent, ...total(new Set([agent.id])) })),
    entries,
    replies,
    pendingReplies,
    candidates,
    tickets: [...new Set(entries.map((row) => row.ticketId))].map((ticketId) => ({
      ticketId,
      seconds: entries
        .filter((row) => row.ticketId === ticketId)
        .reduce((sum, row) => sum + row.seconds, 0),
    })),
  };
}
