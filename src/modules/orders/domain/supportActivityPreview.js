/** Modelo interno da prévia, com dados normalizados fictícios. Não é um adaptador da API do Zoho. */
import { validISODate } from '../../../shared/data/isoDate.js';

const inDayRange = (day, start, end) => validISODate(day) && day >= start && day <= end;
const unique = (rows) => [...new Map(rows.map((row) => [row.id, row])).values()];
const minutes = (sessions, start, end) => {
  const from = Date.parse(start + 'T00:00:00Z'),
    to = Date.parse(end + 'T00:00:00Z') + 86400000;
  const intervals = sessions
    .map((session) => [
      Math.max(from, Date.parse(session.start)),
      Math.min(to, Date.parse(session.end)),
    ])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a)
    .sort((a, b) => a[0] - b[0]);
  let total = 0,
    previous = null;
  for (const [a, b] of intervals) {
    if (previous && a <= previous[1]) previous[1] = Math.max(previous[1], b);
    else {
      if (previous) total += previous[1] - previous[0];
      previous = [a, b];
    }
  }
  if (previous) total += previous[1] - previous[0];
  return { minutes: total / 60000, count: intervals.length };
};

/** Tickets são deduplicados na equipe, autoria é preservada; presença e apontamentos ficam separados. */
export function supportActivityPreview(
  data,
  { agentId = '', start = '2026-10-12', end = '2026-10-18' } = {},
) {
  if (!validISODate(start) || !validISODate(end) || start > end)
    throw new Error('Período inválido na prévia.');
  const agents = data.agents.filter((agent) => !agentId || agent.id === agentId);
  const agentIds = new Set(agents.map((agent) => agent.id));
  const orders =
    data.orders?.filter((row) => agentIds.has(row.agentId) && inDayRange(row.date, start, end)) ??
    null;
  const replies =
    data.replies == null
      ? null
      : unique(data.replies).filter(
          (row) =>
            agentIds.has(row.agentId) &&
            inDayRange(row.date, start, end) &&
            row.visibility === 'public' &&
            row.direction === 'out' &&
            row.state === 'sent' &&
            row.automated === false,
        );
  const entries =
    data.entries == null
      ? null
      : unique(data.entries).filter(
          (row) =>
            agentIds.has(row.agentId) &&
            inDayRange(row.date, start, end) &&
            Number.isFinite(row.minutes) &&
            row.minutes >= 0,
        );
  const sessions =
    data.sessions == null
      ? null
      : unique(data.sessions).filter(
          (row) =>
            agentIds.has(row.agentId) &&
            /Z$/.test(row.start) &&
            /Z$/.test(row.end) &&
            Date.parse(row.end) > Date.parse(row.start) &&
            Date.parse(row.start) < Date.parse(end + 'T00:00:00Z') + 86400000 &&
            Date.parse(row.end) > Date.parse(start + 'T00:00:00Z'),
        );
  const aggregate = (ids) => {
    const selected = (rows) => (rows == null ? null : rows.filter((row) => ids.has(row.agentId)));
    const r = selected(replies),
      e = selected(entries),
      s = selected(sessions),
      o = selected(orders);
    const presence =
      s == null
        ? null
        : [...ids].map((id) =>
            minutes(
              s.filter((row) => row.agentId === id),
              start,
              end,
            ),
          );
    const work = e == null ? null : e.reduce((sum, row) => sum + row.minutes, 0);
    const workTickets = e == null ? null : new Set(e.map((row) => row.ticketId)).size;
    return {
      execution:
        o == null ? null : o.filter((row) => row.role === 'execution' && row.effective).length,
      scheduling:
        o == null ? null : o.filter((row) => row.role === 'scheduling' && row.effective).length,
      tickets: r == null ? null : new Set(r.map((row) => row.ticketId)).size,
      replies: r?.length ?? null,
      presence: presence == null ? null : presence.reduce((sum, row) => sum + row.minutes, 0),
      sessions: presence == null ? null : presence.reduce((sum, row) => sum + row.count, 0),
      work,
      workTickets,
      average: workTickets ? work / workTickets : null,
    };
  };
  return {
    totals: aggregate(agentIds),
    agents: agents.map((agent) => ({ ...agent, ...aggregate(new Set([agent.id])) })),
    replies,
    entries,
    sessions,
  };
}

/** Todos os nomes, OS, tickets e durações deste cenário são inventados. */
export const supportActivityExample = {
  agents: [
    { id: 'agent-a', name: 'Agente de exemplo A' },
    { id: 'agent-b', name: 'Agente de exemplo B' },
  ],
  orders: [
    { id: 'os-demo-1', agentId: 'agent-a', date: '2026-10-13', role: 'execution', effective: true },
    { id: 'os-demo-2', agentId: 'agent-b', date: '2026-10-13', role: 'execution', effective: true },
    {
      id: 'os-demo-3',
      agentId: 'agent-a',
      date: '2026-10-14',
      role: 'scheduling',
      effective: true,
    },
  ],
  replies: [
    {
      id: 'reply-1',
      agentId: 'agent-a',
      ticketId: 'TICKET-DEMO-1',
      date: '2026-10-13',
      visibility: 'public',
      direction: 'out',
      state: 'sent',
      automated: false,
    },
    {
      id: 'reply-2',
      agentId: 'agent-b',
      ticketId: 'TICKET-DEMO-1',
      date: '2026-10-14',
      visibility: 'public',
      direction: 'out',
      state: 'sent',
      automated: false,
    },
    {
      id: 'reply-3',
      agentId: 'agent-a',
      ticketId: 'TICKET-DEMO-2',
      date: '2026-10-14',
      visibility: 'public',
      direction: 'out',
      state: 'sent',
      automated: false,
    },
  ],
  sessions: [
    {
      id: 'session-1',
      agentId: 'agent-a',
      start: '2026-10-13T12:00:00Z',
      end: '2026-10-13T16:00:00Z',
    },
    {
      id: 'session-2',
      agentId: 'agent-b',
      start: '2026-10-13T12:00:00Z',
      end: '2026-10-13T15:00:00Z',
    },
  ],
  entries: [
    {
      id: 'entry-1',
      agentId: 'agent-a',
      ticketId: 'TICKET-DEMO-1',
      date: '2026-10-13',
      minutes: 45,
      billable: false,
    },
    {
      id: 'entry-2',
      agentId: 'agent-a',
      ticketId: 'TICKET-DEMO-2',
      date: '2026-10-14',
      minutes: 15,
      billable: true,
    },
    {
      id: 'entry-3',
      agentId: 'agent-b',
      ticketId: 'TICKET-DEMO-1',
      date: '2026-10-14',
      minutes: 30,
      billable: false,
    },
  ],
};
