import { validPlate } from './trackerReplacements.js';
/** Uma ocorrência por par de rastreador ou por linha de troca explícita de acessório. */
export function replacementRankings(events, by = 'vehicle') {
  const groups = new Map();
  let unidentified = 0;
  for (const event of events) {
    if (!event.clientKey || (by === 'vehicle' && !validPlate(event.plate))) {
      unidentified++;
      continue;
    }
    const key = JSON.stringify(
      by === 'vehicle' ? [event.clientKey, event.plate] : [event.clientKey],
    );
    if (!groups.has(key))
      groups.set(key, {
        key,
        label: by === 'vehicle' ? `${event.plate} · ${event.client}` : event.client,
        value: 0,
        trackers: 0,
        collector: 0,
        rfid: 0,
        events: [],
        rows: new Set(),
      });
    const group = groups.get(key);
    group.value++;
    group[
      event.category === 'Rastreador/kit'
        ? 'trackers'
        : event.category === 'Coletora'
          ? 'collector'
          : 'rfid'
    ]++;
    group.events.push(event);
    event.rows.forEach((row) => group.rows.add(row));
  }
  return {
    groups: [...groups.values()]
      .map((item) => ({
        ...item,
        rows: [...item.rows].sort((a, b) => a - b),
        events: [...item.events].sort(
          (a, b) => (b.date || '').localeCompare(a.date || '') || a.rows[0] - b.rows[0],
        ),
      }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR')),
    unidentified,
    total: events.length,
  };
}
