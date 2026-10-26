/** Somente fontes conhecidas; piloto do proprietário, sem credenciais ou coleções livres. */
import { createSnapshotStore } from './persistence/snapshotStore.js';
import { sourceKinds } from '../src/shared/persistence/snapshotPayload.js';
import { snapshotDownload } from './persistence/snapshotDownload.js';
export const businessReply = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
export async function readBusinessBody(request, limit = 512 * 1024) {
  if (!request.headers.get('Content-Type')?.includes('application/json'))
    throw Error('JSON obrigatório.');
  const reader = request.body?.getReader();
  if (!reader) throw Error('Conteúdo ausente.');
  const chunks = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw Error('Limite de requisição.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
const publicHead = (h) =>
  h
    ? {
        snapshotId: h.snapshot_id,
        revision: h.revision,
        filename: h.filename,
        rows: h.row_count,
        bytes: h.byte_count,
        savedAt: h.updated_at,
        hash: h.payload_hash,
        partCount: h.part_count,
      }
    : null;
export async function businessSourcesResponse(request, env, user, owner) {
  const url = new URL(request.url),
    root = url.pathname === '/api/sources/status';
  const writable = user.active === true && user.role === 'admin' && user.email === owner;
  const permitted = user.active === true;
  if (root) {
    if (request.method !== 'GET') return businessReply({ error: 'Método não permitido.' }, 405);
    if (permitted && !env.BUSINESS_DB) return businessReply({ error: 'Banco indisponível.' }, 503);
    return businessReply({ version: 1, permitted, writable });
  }
  if (!permitted)
    return businessReply(
      { error: 'As bases salvas estão restritas ao administrador principal no piloto.' },
      403,
    );
  if (!writable && request.method !== 'GET')
    return businessReply({ error: 'Alteração de bases não autorizada.' }, 403);
  if (
    !writable &&
    url.pathname !== '/api/sources/catalog' &&
    !/^\/api\/sources\/orders\/(manifest|parts|download)$/.test(url.pathname)
  )
    return businessReply({ error: 'Fonte não autorizada para visualização dos indicadores.' }, 403);
  if (!env.BUSINESS_DB) return businessReply({ error: 'Banco indisponível.' }, 503);
  if (!['GET', 'POST'].includes(request.method))
    return businessReply({ error: 'Método não permitido.' }, 405);
  if (request.method === 'POST' && !user.canImport)
    return businessReply({ error: 'Importação não autorizada.' }, 403);
  if (request.method === 'POST' && (request.headers.get('Origin') !== url.origin || url.search))
    return businessReply({ error: 'Origem ou parâmetros não permitidos.' }, 403);
  const store = createSnapshotStore(env.BUSINESS_DB, { actor: user.email });
  try {
    if (url.pathname === '/api/sources/catalog' && request.method === 'GET' && !url.search) {
      const catalog = {};
      for (const kind of writable ? sourceKinds : ['orders'])
        catalog[kind] = publicHead(await store.head(kind));
      return businessReply({ version: 1, catalog });
    }
    if (url.pathname === '/api/sources/publish' && request.method === 'POST') {
      const body = await readBusinessBody(request);
      if (
        !Array.isArray(body.selection) ||
        body.selection.some((s) => !sourceKinds.includes(s.kind))
      )
        return businessReply({ error: 'Seleção de fontes inválida.' }, 400);
      await store.publish(body.id, body.selection);
      try {
        await store.pruneSources();
      } catch {
        console.warn('source-retention-pending');
      }
      const catalog = {};
      for (const s of body.selection) catalog[s.kind] = publicHead(await store.head(s.kind));
      return businessReply({ version: 1, catalog });
    }
    const match = url.pathname.match(
      /^\/api\/sources\/(orders|operational|logistics)\/(start|part|complete|manifest|parts|versions|download)$/,
    );
    if (!match) return businessReply({ error: 'Rota não encontrada.' }, 404);
    const [, kind, action] = match;
    if (!writable && (kind !== 'orders' || !['manifest', 'parts', 'download'].includes(action)))
      return businessReply(
        { error: 'Fonte não autorizada para visualização dos indicadores.' },
        403,
      );
    if (request.method === 'GET') {
      if (action === 'versions' && !url.search) {
        const versions = await store.rows(
          "SELECT id,filename,row_count,created_at,completed_at,published_at FROM business_snapshots WHERE kind=? AND state='complete' AND published_at IS NOT NULL ORDER BY published_at DESC,id DESC LIMIT 5",
          kind,
        );
        return businessReply({ version: 1, versions });
      }
      const id = url.searchParams.get('id');
      if (!writable && id !== (await store.head('orders'))?.snapshot_id)
        return businessReply({ error: 'Somente a base publicada pode ser visualizada.' }, 403);
      if (!/^[a-f0-9]{64}$/.test(id || '')) throw Error('Identificação inválida.');
      const manifest = await store.manifest(id);
      if (!manifest || manifest.kind !== kind || manifest.state !== 'complete')
        return businessReply({ error: 'Base concluída não encontrada.' }, 404);
      if (action === 'download' && [...url.searchParams.keys()].every((key) => key === 'id'))
        return snapshotDownload(request, store, manifest);
      if (action === 'manifest' && [...url.searchParams.keys()].every((k) => k === 'id'))
        return businessReply({
          version: 1,
          manifest: {
            id,
            kind,
            hash: manifest.payload_hash,
            partCount: manifest.part_count,
            bytes: manifest.byte_count,
          },
        });
      if (
        action === 'parts' &&
        [...url.searchParams.keys()].every((k) => ['id', 'after'].includes(k))
      ) {
        const after = Number(url.searchParams.get('after') ?? -1);
        if (!Number.isInteger(after) || after < -1 || after >= manifest.part_count) throw Error();
        const parts = await store.rows(
          'SELECT part_index AS partIndex,payload_text AS text FROM business_snapshot_parts WHERE snapshot_id=? AND part_index>? ORDER BY part_index LIMIT 4',
          id,
          after,
        );
        return businessReply({ version: 1, parts });
      }
      return businessReply({ error: 'Consulta inválida.' }, 400);
    }
    if (!user.canImport) return businessReply({ error: 'Importação não autorizada.' }, 403);
    const body = await readBusinessBody(request);
    if (action === 'start') {
      if (body.kind !== kind) throw Error();
      const m = await store.start(body);
      return businessReply({ version: 1, complete: m.state === 'complete' });
    }
    const m = await store.manifest(body.id);
    if (!m || m.kind !== kind) throw Error('Base inválida.');
    if (action === 'part') {
      await store.part(body.id, body.index, body.text);
      return businessReply({ version: 1, saved: true });
    }
    if (action === 'complete') {
      await store.complete(body.id);
      return businessReply({ version: 1, complete: true });
    }
    return businessReply({ error: 'Ação inválida.' }, 400);
  } catch (error) {
    if (error.code === 'CONFLICT')
      return businessReply({ error: error.message, code: 'CONFLICT' }, 409);
    console.warn('business-source-operation-failed');
    return businessReply(
      {
        error:
          'O banco não confirmou a base. A versão anterior foi preservada; confira o arquivo ou tente novamente.',
      },
      400,
    );
  }
}
