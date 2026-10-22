/** Recortes de apresentação derivados de intervalos já validados; não estima presença sem sessão. */
const dayMs = 86400000;
const shift = (offset) =>
  offset === 'Z'
    ? 0
    : (offset[0] === '-' ? -1 : 1) *
      (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4))) *
      60000;
export function presenceDateTime(instant, offset) {
  return new Date(instant + shift(offset)).toISOString().slice(0, 19).replace('T', ' ');
}
function union(entries) {
  const merged = [];
  for (const entry of entries.toSorted((a, b) => a.from - b.from || a.until - b.until)) {
    const last = merged.at(-1);
    if (last && entry.from <= last.until) last.until = Math.max(last.until, entry.until);
    else merged.push({ from: entry.from, until: entry.until });
  }
  return merged;
}
export function zohoPresenceView(report, agent = '') {
  const groups = report.groups.filter((row) => !agent || row.agent === agent),
    sessions = report.accepted.filter((row) => !agent || row.agent === agent),
    issues = report.issues.filter((row) => !agent || row.agent === agent),
    offsetMs = shift(report.offset);
  const first = sessions.length ? Math.min(...sessions.map((row) => row.from)) : null,
    last = sessions.length ? Math.max(...sessions.map((row) => row.until)) : null;
  const spanDays =
    first == null
      ? 0
      : Math.floor((last + offsetMs) / dayMs) - Math.floor((first + offsetMs) / dayMs) + 1;
  const dailyLimited = spanDays > 366,
    daily = new Map();
  const byAgent = new Map();
  for (const row of sessions) {
    if (!byAgent.has(row.agent)) byAgent.set(row.agent, []);
    byAgent.get(row.agent).push(row);
  }
  if (!dailyLimited) {
    for (const group of groups) {
      for (const interval of union(byAgent.get(group.agent) || [])) {
        const firstDay = Math.floor((interval.from + offsetMs) / dayMs),
          lastDay = Math.floor(
            ((interval.until > interval.from ? interval.until - 1 : interval.until) + offsetMs) /
              dayMs,
          );
        for (let day = firstDay; day <= lastDay; day++) {
          const seconds =
            Math.max(
              0,
              Math.min(interval.until, (day + 1) * dayMs - offsetMs) -
                Math.max(interval.from, day * dayMs - offsetMs),
            ) / 1000;
          const date = new Date(day * dayMs).toISOString().slice(0, 10);
          daily.set(date, (daily.get(date) || 0) + seconds);
        }
      }
    }
  }
  return {
    groups,
    sessions,
    issues,
    first,
    last,
    dailyLimited,
    daily: [...daily]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, seconds]) => ({ date, seconds })),
    totalSeconds: groups.reduce((sum, row) => sum + row.seconds, 0),
  };
}
