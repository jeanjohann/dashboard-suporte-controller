import { validISODate } from '../../../shared/data/isoDate.js';

/** Somente datas explícitas: ISO com fuso ou data civil com deslocamento escolhido pelo usuário. */
export function presenceInstant(value, offset = '') {
  const text = String(value ?? '').trim();
  let match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})?$/.exec(
    text,
  );
  if (!match) {
    const br = /^(\d{2})\/(\d{2})\/(\d{4})[ ,]+(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(text);
    if (br) match = [br[0], br[3], br[2], br[1], br[4], br[5], br[6], ''];
  }
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '00', zone] = match;
  const date = `${year}-${month}-${day}`,
    suffix = zone || offset;
  if (
    !validISODate(date) ||
    +hour > 23 ||
    +minute > 59 ||
    +second > 59 ||
    !/^(Z|[+-]\d{2}:\d{2})$/.test(suffix)
  )
    return null;
  if (
    suffix !== 'Z' &&
    (+suffix.slice(1, 3) > 14 ||
      +suffix.slice(4) > 59 ||
      (+suffix.slice(1, 3) === 14 && +suffix.slice(4) !== 0))
  )
    return null;
  const instant = Date.parse(`${date}T${hour}:${minute}:${second}${suffix}`);
  return Number.isFinite(instant) ? instant : null;
}

/** União por agente evita contar duas vezes intervalos sobrepostos; abertos nunca são extrapolados. */
export function analyzeZohoPresence(rows, mapping, { offset, start = '', end = '' } = {}) {
  if (
    ![mapping.agent, mapping.start, mapping.end].every(
      (value) => Number.isInteger(value) && value >= 0,
    ) ||
    new Set(Object.values(mapping)).size !== 3
  )
    throw Error('Escolha três colunas distintas para agente, entrada e saída.');
  if (!['Z', '-03:00', '-04:00', '-05:00', '+00:00'].includes(offset))
    throw Error('Informe o fuso das datas do arquivo.');
  if (
    (start && !validISODate(start)) ||
    (end && !validISODate(end)) ||
    (start && end && start > end)
  )
    throw Error('Período de sessões inválido.');
  const lower = start ? presenceInstant(start + 'T00:00:00', offset) : -Infinity;
  const upper = end ? presenceInstant(end + 'T00:00:00', offset) + 86400000 : Infinity;
  const agents = new Map(),
    issues = [],
    seen = new Set(),
    accepted = [];
  let outside = 0;
  for (const row of rows) {
    const agent = String(row.cells[mapping.agent] ?? '').trim();
    const from = presenceInstant(row.cells[mapping.start], offset),
      until = presenceInstant(row.cells[mapping.end], offset);
    const issue = (reason) => issues.push({ row: row.sourceRow, agent, reason });
    if (!agent) {
      issue('Agente ausente; não foi atribuída uma pessoa.');
      continue;
    }
    if (from == null) {
      issue('Entrada ausente ou data incompatível; conferir formato e fuso.');
      continue;
    }
    if (until == null) {
      issue('Saída ausente ou incompatível; sessão aberta não gera duração presumida.');
      continue;
    }
    if (until < from) {
      issue('Saída anterior à entrada.');
      continue;
    }
    const key = JSON.stringify([agent, from, until]);
    if (seen.has(key)) {
      issue('Sessão repetida; duração não contada novamente.');
      continue;
    }
    seen.add(key);
    if (until === from ? from < lower || from >= upper : until <= lower || from >= upper) {
      outside++;
      continue;
    }
    const entry = {
      agent,
      from: Math.max(from, lower),
      until: Math.min(until, upper),
      sourceRow: row.sourceRow,
    };
    if (!agents.has(agent)) agents.set(agent, []);
    agents.get(agent).push(entry);
    accepted.push(entry);
  }
  const groups = [...agents]
    .map(([agent, entries]) => {
      const ordered = entries.toSorted((a, b) => a.from - b.from || a.until - b.until);
      let from = null,
        until = null,
        milliseconds = 0,
        overlaps = 0;
      for (const entry of ordered) {
        if (from == null) {
          from = entry.from;
          until = entry.until;
        } else if (entry.from <= until) {
          if (entry.from < until) {
            overlaps++;
            issues.push({
              row: entry.sourceRow,
              agent,
              reason: 'Intervalo sobreposto; contado uma vez na permanência do agente.',
            });
          }
          until = Math.max(until, entry.until);
        } else {
          milliseconds += until - from;
          from = entry.from;
          until = entry.until;
        }
      }
      if (from != null) milliseconds += until - from;
      return {
        agent,
        seconds: milliseconds / 1000,
        sessions: entries.length,
        overlaps,
        rows: entries.map((entry) => entry.sourceRow),
      };
    })
    .sort((a, b) => b.seconds - a.seconds || a.agent.localeCompare(b.agent, 'pt-BR'));
  return {
    groups,
    issues,
    accepted,
    outside,
    totalSeconds: groups.reduce((sum, row) => sum + row.seconds, 0),
    validSessions: accepted.length,
    sourceRows: rows.length,
    offset,
    start,
    end,
  };
}
