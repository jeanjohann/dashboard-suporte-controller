/** Eventos observados em coletas, sem estimar início/fim de falhas entre leituras. */
export const monitoringEventLabels = {
  'first-delay-observation': 'Primeira observação em atraso',
  'delay-observed': 'Entrada em atraso observada',
  'communication-return-observed': 'Retorno de comunicação observado',
};
export function eventCursor(value) {
  if (typeof value !== 'string' || value.length > 250) throw Error('Página de avisos inválida.');
  const cursor = JSON.parse(value);
  if (
    !Array.isArray(cursor) ||
    cursor.length !== 3 ||
    typeof cursor[0] !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(cursor[0]) ||
    !Number.isFinite(Date.parse(cursor[0])) ||
    typeof cursor[1] !== 'string' ||
    !/^[\w:-]{1,100}$/.test(cursor[1]) ||
    !Number.isInteger(cursor[2]) ||
    cursor[2] < 0 ||
    cursor[2] >= 5000
  )
    throw Error('Página de avisos inválida.');
  return cursor;
}
export function eventPosition(row) {
  return [row.runAt, row.runId, row.eventIndex];
}
export function isUnseenEvent(row, seen) {
  if (!seen) return true;
  const current = eventPosition(row);
  for (let i = 0; i < 3; i++) {
    if (current[i] > seen[i]) return true;
    if (current[i] < seen[i]) return false;
  }
  return false;
}
