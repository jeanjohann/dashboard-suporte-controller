/** Evidências para indicadores: criação exige evento explícito; categoria é o cadastro atual. */
import { zohoDay, zohoId } from '../src/shared/data/zohoActivity.js';
export async function ticketIndicatorEvidence(ticket, period, anchor, detail, fetchPage) {
  const ticketId = zohoId(ticket.id),
    day = zohoDay(ticket.createdTime),
    createdInPeriod = day && day >= period.start && day <= period.end;
  let creation = day ? { state: 'outside' } : { state: 'unknown' };
  if (createdInPeriod) {
    const events = [];
    let complete = false;
    for (let offset = 0; offset < 200; offset += 50) {
      const rows = await fetchPage(`/tickets/${ticketId}/History?from=${offset}&limit=50`);
      if (rows.length > 50) throw Error('Histórico de criação incompatível.');
      events.push(...rows.filter((e) => e.eventName === 'TicketCreated'));
      if (rows.length < 50) {
        complete = true;
        break;
      }
    }
    const event = complete && events.length === 1 ? events[0] : null;
    const sameDay =
      event &&
      zohoDay(event.eventTime) === day &&
      Date.parse(event.eventTime) <= Date.parse(anchor);
    if (!sameDay) creation = { state: 'unknown' };
    else if (event.actor?.type === 'Agent' && zohoId(event.actor.id) && event.source === null)
      creation = { state: 'support', agentId: zohoId(event.actor.id), at: event.eventTime };
    else if (event.actor?.type === 'Contact' || event.source === 'Import')
      creation = { state: 'excluded' };
    else creation = { state: 'unknown' };
  }
  const label = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 160) : null);
  return {
    ticketId,
    creation,
    category: label(detail.category),
    subCategory: label(detail.subCategory),
    classification: label(detail.classification),
  };
}
