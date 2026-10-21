/** Preparação inativa: exige repositório durável com lease e commit atômico antes de ligar um agendador. */
import { normalizeMonitoringSnapshot } from '../src/modules/monitoring/data/snapshotContract.js';
import { monitoringObservationEvents } from '../src/modules/monitoring/domain/monitoringHistory.js';

export async function runMonitoringCollection({ runId, repository, collect, threshold = 48 }) {
  if (typeof runId !== 'string' || !/^[a-zA-Z0-9:_-]{1,100}$/.test(runId))
    throw Error('Identidade da execução inválida.');
  if (
    ![48, 72, 96].includes(threshold) ||
    !['claim', 'latest', 'commit', 'release'].every(
      (method) => typeof repository?.[method] === 'function',
    ) ||
    typeof collect !== 'function'
  )
    throw Error('Coletor depende de configuração e armazenamento durável.');
  const lease = await repository.claim(runId);
  if (!lease) return { status: 'busy' };
  if (lease.completed) return { status: 'already-completed' };
  try {
    const previous = await repository.latest();
    const snapshot = normalizeMonitoringSnapshot(await collect());
    if (snapshot.demonstration || snapshot.collections.some((entry) => !entry.ok))
      throw Error('Somente coleta real completa pode ser publicada.');
    const events = monitoringObservationEvents(previous?.snapshot || null, snapshot, threshold);
    // O adaptador deve gravar fotografia, eventos, revisão e conclusão da execução numa transação.
    const committed = await repository.commit({
      runId,
      lease,
      expectedRevision: previous?.revision || 0,
      snapshot,
      events,
    });
    if (!committed)
      throw Error('Conflito na publicação da coleta; a versão anterior deve permanecer.');
    return { status: 'completed', vehicles: snapshot.vehicles.length, events: events.length };
  } finally {
    await repository.release(runId, lease);
  }
}
