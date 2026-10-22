/** Coletor privado, com lease, publicação atômica e retenção aprovada; nunca armazena resposta parcial. */
import { createSnapshotStore } from './persistence/snapshotStore.js';
import { runMonitoringCollection } from './monitoringCollection.js';
import { monitoringResponse } from './monitoring.js';
import { businessReply } from './businessSources.js';

export const monitoringCron = '0 12,15,18,21 * * *'; // 09, 12, 15 e 18h em São Paulo (UTC-03).
export function createMonitoringCollectionRepository(
  env,
  { now = () => new Date().toISOString() } = {},
) {
  const store = createSnapshotStore(env.BUSINESS_DB, { actor: 'monitoring-collector', now });
  return {
    store,
    async claim(runId) {
      const previous = await store
        .statement('SELECT status FROM business_monitoring_runs WHERE id=?', runId)
        .first();
      if (previous?.status === 'completed') return { completed: true };
      const token = crypto.randomUUID(),
        at = now(),
        expires = new Date(Date.parse(at) + 120000).toISOString();
      const r = await store
        .statement(
          "INSERT INTO business_collection_leases(name,token,expires_at) VALUES('monitoring',?,?) ON CONFLICT(name) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at WHERE business_collection_leases.expires_at<=?",
          token,
          expires,
          at,
        )
        .run();
      if (r.meta?.changes !== 1) return null;
      const inserted = await store
        .statement(
          "INSERT INTO business_monitoring_runs(id,status,started_at) VALUES(?,'running',?) ON CONFLICT(id) DO UPDATE SET status='running',started_at=excluded.started_at,failure_code=NULL WHERE business_monitoring_runs.status!='completed'",
          runId,
          at,
        )
        .run();
      if (inserted.meta?.changes !== 1) {
        await store
          .statement(
            "DELETE FROM business_collection_leases WHERE name='monitoring' AND token=?",
            token,
          )
          .run();
        return { completed: true };
      }
      await store
        .statement(
          "UPDATE business_monitoring_runs SET status='failed',failure_code='expired-run' WHERE status='running' AND started_at<? AND id!=?",
          new Date(Date.parse(at) - 120000).toISOString(),
          runId,
        )
        .run();
      return { token, runId };
    },
    async latest() {
      const head = await store.head('monitoring');
      return head
        ? { revision: head.revision, snapshot: await store.read(head.snapshot_id) }
        : null;
    },
    async commit({ runId, lease, expectedRevision, snapshot, events }) {
      if (events.length > 5000) throw Error('Limite de eventos do piloto.');
      const id = await store.stage('monitoring', snapshot),
        at = now(),
        extra = [];
      for (let i = 0; i < events.length; i += 500)
        extra.push(
          store.statement(
            'INSERT INTO business_monitoring_events(run_id,event_index,event_json) SELECT ?,CAST(key AS INTEGER)+?,value FROM json_each(?)',
            runId,
            i,
            JSON.stringify(events.slice(i, i + 500)),
          ),
        );
      extra.push(
        store.statement(
          "UPDATE business_monitoring_runs SET status='completed',completed_at=?,snapshot_id=?,vehicle_count=?,event_count=? WHERE id=? AND status='running'",
          at,
          id,
          snapshot.vehicles.length,
          events.length,
          runId,
        ),
      );
      try {
        await store.publish(
          runId,
          [{ kind: 'monitoring', snapshotId: id, expectedRevision }],
          extra,
          {
            sql: "EXISTS(SELECT 1 FROM business_collection_leases WHERE name='monitoring' AND token=? AND expires_at>?)",
            args: [lease.token, at],
          },
        );
        return true;
      } catch (error) {
        if (error.code === 'CONFLICT') return false;
        throw error;
      }
    },
    async release(runId, lease) {
      await store
        .statement(
          "UPDATE business_monitoring_runs SET status='failed',failure_code='collection-not-completed' WHERE id=? AND status='running' AND EXISTS(SELECT 1 FROM business_collection_leases WHERE name='monitoring' AND token=?)",
          runId,
          lease.token,
        )
        .run();
      await store
        .statement(
          "DELETE FROM business_collection_leases WHERE name='monitoring' AND token=?",
          lease.token,
        )
        .run();
    },
  };
}
export async function pruneStoredSnapshots(env, { now = new Date().toISOString() } = {}) {
  const store = createSnapshotStore(env.BUSINESS_DB, { actor: 'retention' });
  const cutoff = new Date(Date.parse(now) - 30 * 86400000).toISOString(),
    stagingCutoff = new Date(Date.parse(now) - 86400000).toISOString();
  await store
    .statement(
      'DELETE FROM business_monitoring_runs WHERE started_at<? AND (snapshot_id IS NULL OR snapshot_id NOT IN (SELECT snapshot_id FROM business_snapshot_heads))',
      cutoff,
    )
    .run();
  await store
    .statement(
      "DELETE FROM business_snapshots WHERE kind='monitoring' AND created_at<? AND id NOT IN (SELECT snapshot_id FROM business_snapshot_heads) AND id NOT IN (SELECT snapshot_id FROM business_monitoring_runs WHERE snapshot_id IS NOT NULL)",
      cutoff,
    )
    .run();
  await store
    .statement(
      'DELETE FROM business_snapshots WHERE published_at IS NULL AND created_at<? AND id NOT IN (SELECT snapshot_id FROM business_snapshot_heads) AND id NOT IN (SELECT snapshot_id FROM business_monitoring_runs WHERE snapshot_id IS NOT NULL)',
      stagingCutoff,
    )
    .run();
  await store.pruneSources();
}
export async function collectAndStoreMonitoring(
  env,
  { runId = 'manual_' + crypto.randomUUID(), fetcher = fetch } = {},
) {
  const repository = createMonitoringCollectionRepository(env);
  try {
    return await runMonitoringCollection({
      runId,
      repository,
      collect: async () => {
        const response = await monitoringResponse(
          new Request('https://monitoring.internal/snapshot'),
          env,
          fetcher,
        );
        if (!response.ok) throw Error('Coleta indisponível.');
        return response.json();
      },
    });
  } finally {
    try {
      await pruneStoredSnapshots(env);
    } catch {
      console.warn('snapshot-retention-pending');
    }
  }
}
export async function storedMonitoringResponse(request, env, user, owner) {
  if (user.role !== 'admin' || user.email !== owner)
    return businessReply(
      { error: 'O monitoramento salvo está restrito ao administrador principal no piloto.' },
      403,
    );
  if (!env.BUSINESS_DB)
    return businessReply({ error: 'Banco do monitoramento indisponível.' }, 503);
  const url = new URL(request.url),
    refresh = url.pathname === '/api/monitoring/refresh';
  const history = url.pathname === '/api/monitoring/history';
  if ((!history && url.search) || request.method !== (refresh ? 'POST' : 'GET'))
    return businessReply({ error: 'Consulta inválida.' }, 405);
  if (refresh && request.headers.get('Origin') !== url.origin)
    return businessReply({ error: 'Origem não permitida.' }, 403);
  const store = createSnapshotStore(env.BUSINESS_DB, { actor: user.email });
  try {
    if (history) {
      if ([...url.searchParams.keys()].some((key) => key !== 'before'))
        return businessReply({ error: 'Consulta inválida.' }, 400);
      const raw = url.searchParams.get('before');
      let before = null;
      if (raw) {
        try {
          before = JSON.parse(raw);
          if (
            !Array.isArray(before) ||
            before.length !== 2 ||
            typeof before[0] !== 'string' ||
            !Number.isFinite(Date.parse(before[0])) ||
            typeof before[1] !== 'string' ||
            !/^[A-Za-z0-9:_-]{1,100}$/.test(before[1])
          )
            throw Error();
        } catch {
          return businessReply({ error: 'Página do histórico inválida.' }, 400);
        }
      }
      const runs = await store.rows(
        'SELECT id,status,started_at,completed_at,vehicle_count,event_count,failure_code FROM business_monitoring_runs' +
          (before ? ' WHERE started_at<? OR (started_at=? AND id<?)' : '') +
          ' ORDER BY started_at DESC,id DESC LIMIT 31',
        ...(before ? [before[0], before[0], before[1]] : []),
      );
      const more = runs.length > 30,
        page = runs.slice(0, 30),
        last = page.at(-1);
      return businessReply({
        version: 1,
        runs: page,
        next: more ? JSON.stringify([last.started_at, last.id]) : null,
        retentionDays: 30,
        hoursSaoPaulo: [9, 12, 15, 18],
      });
    }
    if (refresh) {
      const result = await collectAndStoreMonitoring(env);
      if (result.status === 'busy')
        return businessReply(
          { error: 'Uma coleta já está em andamento. Aguarde e carregue a última base salva.' },
          409,
        );
    }
    const head = await store.head('monitoring');
    if (!head)
      return businessReply({
        version: 1,
        snapshot: null,
        savedAt: null,
        hoursSaoPaulo: [9, 12, 15, 18],
      });
    const snapshot = await store.read(head.snapshot_id),
      latest = await store
        .statement(
          'SELECT status,started_at FROM business_monitoring_runs ORDER BY started_at DESC,id DESC LIMIT 1',
        )
        .first();
    return businessReply({
      version: 1,
      snapshot,
      savedAt: head.updated_at,
      hoursSaoPaulo: [9, 12, 15, 18],
      lastAttempt: latest,
    });
  } catch {
    return businessReply(
      {
        error:
          'Não foi possível confirmar a coleta salva. A última versão válida foi preservada no banco.',
      },
      503,
    );
  }
}
export async function scheduledMonitoring(controller, env) {
  if (controller.cron !== monitoringCron) throw Error('Agendamento desconhecido.');
  const date = new Date(controller.scheduledTime);
  if (
    !Number.isFinite(date.getTime()) ||
    ![12, 15, 18, 21].includes(date.getUTCHours()) ||
    date.getUTCMinutes() !== 0
  )
    throw Error('Horário de coleta inválido.');
  const result = await collectAndStoreMonitoring(env, {
    runId:
      'scheduled_' +
      date
        .toISOString()
        .slice(0, 16)
        .replaceAll(/[^0-9T]/g, '_'),
  });
  if (result.status === 'busy') throw Error('Coleta agendada encontrou execução ativa.');
  return result;
}
