/** Cliente autenticado: upload deduplicado em partes e confirmação por revisão. */
import { api } from '../security/accessClient.js';
import { prepareWorkspace, validateWorkspaceValue } from './workspacePayload.js';
export function createWorkspaceClient(kind, request = api) {
  const root = '/api/workspace/' + kind;
  const call = (path, body) =>
    request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
  return {
    async read() {
      const result = await request(root, { signal: AbortSignal.timeout(60000) });
      if (
        result.version !== 1 ||
        !Number.isSafeInteger(result.revision) ||
        result.revision < 0 ||
        (result.revision === 0) !== (result.value === null)
      )
        throw Error('Resposta do banco incompatível.');
      return {
        ...result,
        value: result.value === null ? null : await validateWorkspaceValue(kind, result.value),
      };
    },
    async write(value, expectedRevision) {
      const prepared = await prepareWorkspace(kind, value);
      const { chunks, ...metadata } = prepared;
      const started = await call(root + '/start', { ...metadata, expectedRevision });
      if (
        started.version !== 1 ||
        !Array.isArray(started.missing) ||
        new Set(started.missing).size !== started.missing.length ||
        started.missing.some((i) => !Number.isInteger(i) || i < 0 || i >= chunks.length)
      )
        throw Error('Upload incompatível.');
      // Até quatro partes independentes por lote; publicação só após todas confirmarem.
      for (let at = 0; at < started.missing.length; at += 4) {
        await Promise.all(
          started.missing
            .slice(at, at + 4)
            .map((index) => call(root + '/part', { id: prepared.id, index, text: chunks[index] })),
        );
      }
      const saved = await call(root + '/publish', { id: prepared.id, expectedRevision });
      if (saved.version !== 1 || saved.revision !== expectedRevision + 1)
        throw Error('Gravação não confirmada. Recarregue os salvos antes de tentar novamente.');
      return { ...saved, value: await validateWorkspaceValue(kind, value) };
    },
  };
}

/** O banco nunca usa uma cópia local silenciosa após falha. Migração é explícita e só para destino vazio. */
export function createPilotRepository({
  kind,
  managed,
  readLocal,
  writeLocal,
  empty,
  revisionField,
  request = api,
}) {
  const remote = createWorkspaceClient(kind, request);
  let mode = managed ? 'checking' : 'local',
    pendingMigration = false;
  const withRevision = (value, revision) => ({ ...value, [revisionField]: revision });
  async function configure() {
    if (mode !== 'checking') return;
    const status = await request('/api/workspace/status');
    if (status.version !== 1 || typeof status.permitted !== 'boolean')
      throw Error('Configuração do banco incompatível.');
    mode = status.permitted ? 'remote' : 'local';
  }
  return {
    get mode() {
      return mode;
    },
    get pendingMigration() {
      return pendingMigration;
    },
    async read(...args) {
      await configure();
      if (mode === 'local') return readLocal(...args);
      const saved = await remote.read();
      if (saved.value !== null) {
        pendingMigration = false;
        return withRevision(saved.value, saved.revision);
      }
      const local = await readLocal(...args);
      pendingMigration =
        kind === 'consumption'
          ? !!(
              local.files.length ||
              local.notes.length ||
              local.allowances?.length ||
              local.operational ||
              JSON.stringify(local.settings) !== JSON.stringify(empty().settings)
            )
          : local.dashboards.length > 0;
      return pendingMigration ? withRevision(local, 0) : withRevision(empty(), 0);
    },
    async write(...args) {
      await configure();
      if (mode === 'local') return writeLocal(...args);
      if (pendingMigration) throw Error('Migre a cópia local antes de alterar os dados no banco.');
      const value = args.at(-1),
        saved = await remote.write(value, value[revisionField] ?? 0);
      return withRevision(saved.value, saved.revision);
    },
    async migrate(...args) {
      await configure();
      if (mode !== 'remote') throw Error('Migração indisponível.');
      const current = await remote.read(),
        local = await readLocal(...args);
      if (current.value !== null) {
        const a = await prepareWorkspace(kind, current.value),
          b = await prepareWorkspace(kind, local);
        if (a.hash !== b.hash)
          throw Error(
            'O banco já contém dados diferentes. Exporte a cópia local para conferir; nenhuma mesclagem foi presumida.',
          );
        pendingMigration = false;
        return withRevision(current.value, current.revision);
      }
      const saved = await remote.write(local, 0);
      pendingMigration = false;
      return withRevision(saved.value, saved.revision);
    },
  };
}
