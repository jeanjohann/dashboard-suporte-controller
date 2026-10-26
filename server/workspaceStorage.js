/** Publicação atômica no esquema existente; partes imutáveis e acesso exclusivo do proprietário. */
import {
  workspaceKinds,
  workspaceMaxBytes,
  workspaceHash,
  validateWorkspaceValue,
} from '../src/shared/persistence/workspacePayload.js';
import { businessReply as reply, readBusinessBody } from './businessSources.js';
import { createD1DocumentAdapter } from './persistence/d1DocumentAdapter.js';
const hex = (v) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const revision = (v) => Number.isSafeInteger(v) && v >= 0 && v < Number.MAX_SAFE_INTEGER;
export async function workspaceStorageResponse(request, env, user, owner) {
  const url = new URL(request.url),
    permitted = user.active === true && user.role === 'admin' && user.email === owner;
  const readKinds = user.active === true ? ['zoho-indicators', 'zoho-backlog'] : [];
  if (url.pathname === '/api/workspace/status') {
    if (request.method !== 'GET' || url.search) return reply({ error: 'Consulta inválida.' }, 405);
    if (permitted && !env.BUSINESS_DB) return reply({ error: 'Banco indisponível.' }, 503);
    return reply({ version: 1, permitted, kinds: permitted ? workspaceKinds : [], readKinds });
  }
  if (
    !permitted &&
    !(
      request.method === 'GET' &&
      readKinds.some((kind) => url.pathname === '/api/workspace/' + kind)
    )
  )
    return reply({ error: 'Armazenamento restrito ao administrador principal no piloto.' }, 403);
  if (!env.BUSINESS_DB) return reply({ error: 'Banco indisponível.' }, 503);
  const match = url.pathname.match(
    /^\/api\/workspace\/(consumption|dashboards|zoho-support|zoho-indicators|zoho-backlog|zoho-presence)(?:\/(start|part|publish))?$/,
  );
  if (!match || url.search) return reply({ error: 'Recurso inválido.' }, 404);
  const [, kind, action] = match;
  if (kind === 'dashboards' && user.canDashboard === false)
    return reply({ error: 'Dashboard não autorizado.' }, 403);
  if ((action ? 'POST' : 'GET') !== request.method)
    return reply({ error: 'Método não permitido.' }, 405);
  if (action && request.headers.get('Origin') !== url.origin)
    return reply({ error: 'Origem não permitida.' }, 403);
  if (action && (kind === 'dashboards' ? user.canDashboard === false : !user.canImport))
    return reply({ error: 'Gravação não autorizada.' }, 403);
  const scope = 'owner-' + (await workspaceHash(owner)),
    adapter = createD1DocumentAdapter(env.BUSINESS_DB);
  const key = (collection, id) => ({ scope, collection, id });
  const read = (resource, id) => adapter.read(key(resource, id));
  const writeImmutable = async (resource, id, value) => {
    const prior = await read(resource, id);
    if (prior) {
      if (JSON.stringify(prior.value) !== JSON.stringify(value)) throw Error('Parte divergente.');
      return;
    }
    const at = new Date().toISOString(),
      payload = JSON.stringify(value),
      size = new TextEncoder().encode(payload).length;
    if (!(await read('workspace-budget', 'total'))) {
      const used = await env.BUSINESS_DB.prepare(
        "SELECT COALESCE(SUM(length(CAST(payload_json AS BLOB))),0) AS bytes FROM business_documents WHERE workspace_id=? AND resource IN ('workspace-parts','workspace-uploads')",
      )
        .bind(scope)
        .first();
      if (!used) throw Error('Leitura de espaço não confirmada.');
      await adapter.compareAndSwap(key('workspace-budget', 'total'), 0, {
        revision: 1,
        valueVersion: 1,
        value: { bytes: used.bytes },
        deleted: false,
        updatedAt: at,
        actor: user.email,
      });
    }
    try {
      const results = await env.BUSINESS_DB.batch([
        env.BUSINESS_DB.prepare(
          "UPDATE business_documents SET revision=CASE WHEN json_extract(payload_json,'$.bytes')+?<=? THEN revision+1 ELSE 0 END,payload_json=json_set(payload_json,'$.bytes',json_extract(payload_json,'$.bytes')+?),updated_at=? WHERE workspace_id=? AND resource='workspace-budget' AND record_id='total' AND NOT EXISTS(SELECT 1 FROM business_documents WHERE workspace_id=? AND resource=? AND record_id=?)",
        ).bind(size, 128 * 1024 * 1024, size, at, scope, scope, resource, id),
        env.BUSINESS_DB.prepare(
          'INSERT INTO business_documents(workspace_id,resource,record_id,revision,payload_version,payload_json,deleted,updated_at,updated_by) VALUES(?,?,?,1,1,?,0,?,?) ON CONFLICT(workspace_id,resource,record_id) DO NOTHING',
        ).bind(scope, resource, id, payload, at, user.email),
      ]);
      if (results.some((r) => r.success === false)) throw Error('Gravação não confirmada.');
    } catch (error) {
      if (String(error.message).includes('CHECK constraint'))
        throw Error('Limite de 128 MB do acervo piloto atingido. Nada foi apagado.');
      throw error;
    }
    const saved = await read(resource, id);
    if (JSON.stringify(saved?.value) !== payload) throw Error('Parte divergente.');
  };
  const reconstruct = async (manifest, validate = true) => {
    const result = await env.BUSINESS_DB.prepare(
      "SELECT record_id,payload_json FROM business_documents WHERE workspace_id=? AND resource='workspace-parts' AND record_id IN (SELECT value FROM json_each(?))",
    )
      .bind(scope, JSON.stringify(manifest.parts))
      .all();
    if (result.success === false || !Array.isArray(result.results))
      throw Error('Leitura não confirmada.');
    const parts = new Map(
      result.results.map((r) => [r.record_id, JSON.parse(r.payload_json).text]),
    );
    if (manifest.parts.some((p) => !parts.has(p))) throw Error('Upload incompleto.');
    const text = manifest.parts.map((p) => parts.get(p)).join('');
    if (
      new TextEncoder().encode(text).length !== manifest.bytes ||
      (await workspaceHash(text)) !== manifest.hash
    )
      throw Error('Integridade inválida.');
    const value = JSON.parse(text);
    return validate ? validateWorkspaceValue(kind, value) : value;
  };
  try {
    const head = await read('workspace-heads', kind);
    if (!action) {
      if (!head) return reply({ version: 1, revision: 0, value: null, updatedAt: null });
      const manifest = await read('workspace-uploads', head.value.id);
      if (!manifest || manifest.value.kind !== kind) throw Error('Manifesto inválido.');
      return reply({
        version: 1,
        revision: head.revision,
        updatedAt: head.updatedAt,
        value: await reconstruct(manifest.value, false),
      });
    }
    const body = await readBusinessBody(request, 256 * 1024);
    if (action === 'start') {
      if (
        !hex(body.id) ||
        !hex(body.hash) ||
        body.id !== (await workspaceHash(kind + '\n' + body.hash)) ||
        !Number.isSafeInteger(body.bytes) ||
        body.bytes < 1 ||
        body.bytes > workspaceMaxBytes ||
        !Array.isArray(body.parts) ||
        !body.parts.length ||
        body.parts.length > 512 ||
        body.parts.some((p) => !hex(p)) ||
        !revision(body.expectedRevision)
      )
        throw Error('Manifesto inválido.');
      if ((head?.revision || 0) !== body.expectedRevision)
        return reply({ error: 'Outra sessão alterou os dados. Recarregue antes de salvar.' }, 409);
      const value = { kind, hash: body.hash, bytes: body.bytes, parts: body.parts };
      await writeImmutable('workspace-uploads', body.id, value);
      const existing = await env.BUSINESS_DB.prepare(
        "SELECT record_id FROM business_documents WHERE workspace_id=? AND resource='workspace-parts' AND record_id IN (SELECT value FROM json_each(?))",
      )
        .bind(scope, JSON.stringify(body.parts))
        .all();
      if (existing.success === false || !Array.isArray(existing.results))
        throw Error('Leitura não confirmada.');
      const found = new Set(existing.results.map((r) => r.record_id));
      return reply({
        version: 1,
        missing: body.parts.map((p, i) => (found.has(p) ? null : i)).filter((i) => i !== null),
      });
    }
    if (!hex(body.id)) throw Error('Identificação inválida.');
    const manifest = await read('workspace-uploads', body.id);
    if (!manifest || manifest.value.kind !== kind) throw Error('Manifesto ausente.');
    if (action === 'part') {
      if (
        !Number.isInteger(body.index) ||
        body.index < 0 ||
        body.index >= manifest.value.parts.length ||
        typeof body.text !== 'string' ||
        !body.text.length ||
        body.text.length > 32 * 1024 ||
        (await workspaceHash(body.text)) !== manifest.value.parts[body.index]
      )
        throw Error('Parte inválida.');
      await writeImmutable('workspace-parts', manifest.value.parts[body.index], {
        text: body.text,
      });
      return reply({ version: 1 });
    }
    if (!revision(body.expectedRevision)) throw Error('Revisão inválida.');
    // Reenvio após resposta perdida é reconhecido sem criar uma revisão duplicada.
    if (head?.value.id === body.id && head.revision === body.expectedRevision + 1)
      return reply({ version: 1, revision: head.revision, updatedAt: head.updatedAt });
    if ((head?.revision || 0) !== body.expectedRevision)
      return reply({ error: 'Outra sessão alterou os dados. Recarregue antes de salvar.' }, 409);
    await reconstruct(manifest.value);
    const next = {
      version: 1,
      scope,
      collection: 'workspace-heads',
      id: kind,
      revision: body.expectedRevision + 1,
      valueVersion: 1,
      value: { id: body.id },
      deleted: false,
      updatedAt: new Date().toISOString(),
      actor: user.email,
    };
    if (!(await adapter.compareAndSwap(key('workspace-heads', kind), body.expectedRevision, next)))
      return reply(
        {
          error:
            'Outra sessão alterou os dados. Sua versão foi preservada; recarregue antes de salvar.',
        },
        409,
      );
    return reply({ version: 1, revision: next.revision, updatedAt: next.updatedAt });
  } catch (error) {
    return reply({ error: 'Não foi possível concluir a persistência. ' + error.message }, 400);
  }
}
