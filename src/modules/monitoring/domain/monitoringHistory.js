import { monitorSnapshot, monitoringInstant } from './monitoring.js';

/** Diferenças observadas entre coletas. Não reconstrói episódios ocorridos entre as consultas. */
export function monitoringObservationEvents(previous, current, threshold = 48) {
  if (current.demonstration || previous?.demonstration)
    throw Error('Demonstração não pertence ao histórico real.');
  if (previous && monitoringInstant(current.referenceAt) <= monitoringInstant(previous.referenceAt))
    throw Error('Coleta anterior ou repetida não substitui o histórico.');
  const after = monitorSnapshot(current, { threshold }),
    before = previous ? monitorSnapshot(previous, { threshold }) : null;
  if (after.issues.length || before?.issues.length)
    throw Error('Identificações ambíguas impedem comparar coletas.');
  const known = new Map((before?.scoped || []).map((row) => [row.key, row]));
  const events = [];
  for (const row of after.scoped) {
    const old = known.get(row.key);
    if (!['recent', 'delayed'].includes(row.state)) continue;
    const previousUsable = old && ['recent', 'delayed'].includes(old.state);
    let type = null;
    if (row.state === 'delayed' && (!previousUsable || old.state !== 'delayed'))
      type = previousUsable ? 'delay-observed' : 'first-delay-observation';
    if (
      row.state === 'recent' &&
      previousUsable &&
      old.state === 'delayed' &&
      monitoringInstant(row.lastRecordAt) > monitoringInstant(old.lastRecordAt)
    )
      type = 'communication-return-observed';
    if (type)
      events.push({
        type,
        key: row.key,
        clientId: row.clientId,
        vehicleId: row.vehicleId,
        plate: row.plate || null,
        clientName: row.clientName || null,
        trackerId: row.trackerId || null,
        observedAt: current.referenceAt,
        lastRecordAt: row.lastRecordAt,
        previousObservedAt: previous?.referenceAt || null,
        threshold,
      });
  }
  return events;
}

/** Horários UTC devem ser definidos na configuração futura; no máximo quatro execuções diárias. */
export function monitoringCollectionSlot(at, hoursUTC) {
  if (
    !Array.isArray(hoursUTC) ||
    !hoursUTC.length ||
    hoursUTC.length > 4 ||
    new Set(hoursUTC).size !== hoursUTC.length ||
    hoursUTC.some((hour) => !Number.isInteger(hour) || hour < 0 || hour > 23)
  )
    throw Error('Informe de um a quatro horários UTC distintos.');
  const instant = monitoringInstant(at);
  if (instant == null) throw Error('Horário da coleta inválido.');
  const date = new Date(instant);
  return hoursUTC.includes(date.getUTCHours()) ? date.toISOString().slice(0, 13) : null;
}
