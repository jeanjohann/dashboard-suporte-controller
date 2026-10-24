import { businessReply } from './businessSources.js';
import {
  eventCursor,
  monitoringEventLabels,
} from '../src/modules/monitoring/domain/monitoringEvents.js';

/** Leitura paginada do histórico já salvo; não dispara coleta nem amplia o acesso do piloto. */
export async function monitoringEventsResponse(store, url) {
  if (
    [...url.searchParams.keys()].some((key) => !['before', 'kind'].includes(key)) ||
    [...url.searchParams.keys()].some((key) => url.searchParams.getAll(key).length !== 1)
  )
    return businessReply({ error: 'Consulta de avisos inválida.' }, 400);
  const kind = url.searchParams.get('kind') || 'all';
  if (!['all', 'delay', 'return'].includes(kind))
    return businessReply({ error: 'Tipo inválido.' }, 400);
  let cursor;
  try {
    cursor = url.searchParams.has('before') ? eventCursor(url.searchParams.get('before')) : null;
  } catch {
    return businessReply({ error: 'Página de avisos inválida.' }, 400);
  }
  const where = ["r.status='completed'"];
  const args = [];
  if (cursor) {
    where.push('(r.started_at,r.id,e.event_index)<(?,?,?)');
    args.push(...cursor);
  }
  if (kind !== 'all') {
    where.push(
      kind === 'return'
        ? "json_extract(e.event_json,'$.type')='communication-return-observed'"
        : "json_extract(e.event_json,'$.type') IN ('delay-observed','first-delay-observation')",
    );
  }
  const rows = await store.rows(
    'SELECT r.id AS runId,r.started_at AS runAt,e.event_index AS eventIndex,e.event_json AS payload FROM business_monitoring_runs r JOIN business_monitoring_events e ON e.run_id=r.id WHERE ' +
      where.join(' AND ') +
      ' ORDER BY r.started_at DESC,r.id DESC,e.event_index DESC LIMIT 31',
    ...args,
  );
  const events = rows.slice(0, 30).map((row) => {
    const event = JSON.parse(row.payload);
    if (!Object.hasOwn(monitoringEventLabels, event.type) || typeof event.key !== 'string')
      throw Error('Evento incompatível.');
    return { ...event, runId: row.runId, runAt: row.runAt, eventIndex: row.eventIndex };
  });
  const last = events.at(-1);
  return businessReply({
    version: 1,
    events,
    next: rows.length > 30 ? JSON.stringify([last.runAt, last.runId, last.eventIndex]) : null,
    retentionDays: 30,
    readAt: new Date().toISOString(),
  });
}
