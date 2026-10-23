/** Só aplica bases depois da confirmação da publicação; nenhuma carga parcial substitui a sessão. */
import { api } from '../security/accessClient.js';
import { fetchSourceResponse, readSourceResponse } from './sourceDownloadClient.js';
import {
  prepareSnapshot,
  sha256,
  validateStoredSource,
  snapshotMaxParts,
  snapshotMaxBytes,
} from './snapshotPayload.js';
const post = (request, path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
export function createSourceSnapshotClient(request = api, download = fetchSourceResponse) {
  return {
    status: () => request('/api/sources/status'),
    async catalog() {
      const data = await request('/api/sources/catalog');
      if (data.version !== 1 || !data.catalog) throw Error('Catálogo incompatível.');
      return data.catalog;
    },
    async read(kind, head, { signal, onProgress } = {}) {
      if (!head) return null;
      if (
        !['orders', 'operational', 'logistics'].includes(kind) ||
        !/^[a-f0-9]{64}$/.test(head.snapshotId) ||
        !/^[a-f0-9]{64}$/.test(head.hash) ||
        !Number.isInteger(head.partCount) ||
        head.partCount < 1 ||
        head.partCount > snapshotMaxParts ||
        !Number.isSafeInteger(head.bytes) ||
        head.bytes < 1 ||
        head.bytes > snapshotMaxBytes
      )
        throw Error('Manifesto incompatível.');
      const timeout = AbortSignal.timeout(60000);
      const response = await download('/api/sources/' + kind + '/download?id=' + head.snapshotId, {
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
      const text = await readSourceResponse(response, head, { onProgress });
      if ((await sha256(text)) !== head.hash) throw Error('Integridade da base inválida.');
      const source = JSON.parse(text);
      validateStoredSource(kind, source);
      return { ...source, cloud: head };
    },
    async save(batch, catalog) {
      const selection = [],
        sources = {};
      for (const [kind, source] of Object.entries(batch)) {
        const p = await prepareSnapshot(kind, source),
          start = await post(request, `/api/sources/${kind}/start`, {
            id: p.id,
            hash: p.hash,
            kind,
            partCount: p.parts.length,
            bytes: p.bytes,
            filename: p.filename,
          });
        if (!start.complete) {
          for (let index = 0; index < p.parts.length; index++)
            await post(request, `/api/sources/${kind}/part`, {
              id: p.id,
              index,
              text: p.parts[index],
            });
          await post(request, `/api/sources/${kind}/complete`, { id: p.id });
        }
        if (catalog[kind]?.snapshotId !== p.id)
          selection.push({
            kind,
            snapshotId: p.id,
            expectedRevision: catalog[kind]?.revision || 0,
          });
        sources[kind] = source;
      }
      const next = selection.length
        ? (await post(request, '/api/sources/publish', { id: crypto.randomUUID(), selection }))
            .catalog
        : catalog;
      const merged = { ...catalog, ...next };
      return {
        catalog: merged,
        sources: Object.fromEntries(
          Object.entries(sources).map(([kind, source]) => [
            kind,
            { ...source, cloud: merged[kind] },
          ]),
        ),
      };
    },
  };
}

/** As leituras são independentes; a aplicação das três bases continua indivisível. */
export async function readSourceCatalog(client, catalog, options = {}) {
  const results = await Promise.allSettled(
    Object.entries(catalog).map(async ([kind, head]) => [
      kind,
      await client.read(kind, head, {
        ...options,
        onProgress: (bytes, total) => options.onProgress?.(kind, bytes, total),
      }),
    ]),
  );
  const failure = results.find((result) => result.status === 'rejected');
  if (failure) throw failure.reason;
  return Object.fromEntries(results.map((result) => result.value));
}
