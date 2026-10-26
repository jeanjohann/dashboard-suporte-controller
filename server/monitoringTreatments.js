/** Histórico administrativo de acompanhamento, restrito ao administrador do piloto D1. */
import { createD1DocumentAdapter } from './persistence/d1DocumentAdapter.js';
import { createDocumentRepository } from '../src/shared/persistence/documentRepository.js';
import {
  monitoringStages,
  recordMonitoringUpdate,
  vehicleKey,
  monitoringInstant,
} from '../src/modules/monitoring/domain/monitoring.js';

const collection = 'monitoring-treatments';
const reply = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
const exact = (value, keys) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length === keys.length &&
  Object.keys(value).every((key) => keys.includes(key));

export function validateTreatment(value) {
  if (
    exact(value, ['key', 'deleted']) &&
    typeof value.key === 'string' &&
    value.key.length > 0 &&
    value.key.length <= 500 &&
    value.deleted === true
  )
    return true;
  const entryFields = ['at', 'status', 'owner', 'text'];
  if (
    !exact(value, ['key', 'status', 'owner', 'text', 'at', 'history']) ||
    typeof value.key !== 'string' ||
    value.key.length > 500 ||
    !monitoringStages.includes(value.status) ||
    typeof value.owner !== 'string' ||
    value.owner.length > 200 ||
    typeof value.text !== 'string' ||
    value.text.length > 2000 ||
    monitoringInstant(value.at) == null ||
    !Array.isArray(value.history) ||
    value.history.length < 1 ||
    value.history.length > 500 ||
    value.history.some(
      (entry) =>
        !exact(entry, entryFields) ||
        monitoringInstant(entry.at) == null ||
        !monitoringStages.includes(entry.status) ||
        typeof entry.owner !== 'string' ||
        entry.owner.length > 200 ||
        typeof entry.text !== 'string' ||
        entry.text.length > 2000,
    ) ||
    new TextEncoder().encode(JSON.stringify(value)).length > 128 * 1024
  )
    throw Error('Registro de tratamento incompatível ou muito grande.');
  const latest = value.history.at(-1);
  if (['at', 'status', 'owner', 'text'].some((key) => value[key] !== latest[key]))
    throw Error('O estado atual diverge do último evento.');
  return true;
}

async function treatmentId(key) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function bodyOf(request) {
  if (!request.headers.get('Content-Type')?.includes('application/json')) throw Error();
  const reader = request.body?.getReader();
  if (!reader) throw Error();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16 * 1024) {
      await reader.cancel();
      throw Error();
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function monitoringTreatmentsResponse(request, env, user, owner) {
  const url = new URL(request.url);
  if (user.role !== 'admin' || user.email !== owner)
    return reply(
      { error: 'O acompanhamento salvo está restrito ao administrador principal no piloto.' },
      403,
    );
  if (!env.BUSINESS_DB)
    return reply(
      { error: 'Banco do acompanhamento indisponível. Nenhuma alteração foi salva.' },
      503,
    );
  if (!['GET', 'POST', 'DELETE'].includes(request.method))
    return reply({ error: 'Método não permitido.' }, 405);
  if (request.method !== 'GET' && (url.search || request.headers.get('Origin') !== url.origin))
    return reply({ error: 'Origem ou parâmetros não permitidos.' }, 403);

  const repo = createDocumentRepository({
    adapter: createD1DocumentAdapter(env.BUSINESS_DB),
    scope: 'addlog',
    collection,
    actor: user.email,
    validate: validateTreatment,
  });
  if (request.method === 'GET') {
    if (url.search) return reply({ error: 'Consulta inválida.' }, 400);
    try {
      const records = [];
      let after = null;
      for (let page = 0; page < 11; page++) {
        const result = await repo.list({ after, limit: 500 });
        records.push(
          ...result.items.map((record) => ({ ...record.value, revision: record.revision })),
        );
        if (!result.nextCursor) return reply({ version: 1, records });
        after = result.nextCursor;
      }
      return reply({ error: 'O histórico excede o limite de leitura do piloto.' }, 413);
    } catch {
      return reply({ error: 'Não foi possível ler o histórico salvo de acompanhamento.' }, 503);
    }
  }

  let body;
  try {
    body = await bodyOf(request);
    const validRevision =
      Number.isSafeInteger(body?.expectedRevision) && body.expectedRevision >= 0;
    if (request.method === 'POST') {
      if (
        !exact(body, ['key', 'expectedRevision', 'draft']) ||
        typeof body.key !== 'string' ||
        body.key.length > 500 ||
        !validRevision ||
        !exact(body.draft, ['status', 'owner', 'text']) ||
        !monitoringStages.includes(body.draft.status) ||
        typeof body.draft.owner !== 'string' ||
        body.draft.owner.length > 200 ||
        typeof body.draft.text !== 'string' ||
        body.draft.text.length > 2000
      )
        throw Error();
    } else if (
      !exact(body, ['key', 'expectedRevision']) ||
      typeof body.key !== 'string' ||
      body.key.length > 500 ||
      !validRevision
    )
      throw Error();
    const parsedKey = JSON.parse(body.key);
    if (
      !Array.isArray(parsedKey) ||
      parsedKey.length !== 2 ||
      parsedKey.some((item) => typeof item !== 'string' || !item.length || item.length > 200) ||
      JSON.stringify(parsedKey) !== body.key
    )
      throw Error();
  } catch {
    return reply({ error: 'Dados do acompanhamento inválidos. Nada foi salvo.' }, 400);
  }

  try {
    const id = await treatmentId(body.key);
    const previous = await repo.read(id);
    if ((previous?.revision || 0) !== body.expectedRevision)
      return reply(
        { error: 'O acompanhamento mudou. Recarregue antes de salvar.', code: 'CONFLICT' },
        409,
      );
    if (request.method === 'DELETE') {
      if (!previous || previous.value?.deleted)
        return reply({ error: 'Este acompanhamento já foi excluído ou não existe.' }, 404);
      const saved = await repo.put(
        id,
        { key: body.key, deleted: true },
        { expectedRevision: body.expectedRevision },
      );
      return reply({ version: 1, record: { ...saved.value, revision: saved.revision } });
    }
    const next = recordMonitoringUpdate(
      previous?.value && !previous.value.deleted ? previous.value : {},
      body.draft,
      new Date().toISOString(),
    );
    const value = { key: body.key, ...next };
    validateTreatment(value);
    const saved = await repo.put(id, value, { expectedRevision: body.expectedRevision });
    return reply({ version: 1, record: { ...saved.value, revision: saved.revision } });
  } catch (error) {
    if (error.code === 'STORAGE_CONFLICT')
      return reply(
        {
          error: 'O acompanhamento mudou em outra sessão. Recarregue antes de salvar.',
          code: 'CONFLICT',
        },
        409,
      );
    return reply(
      {
        error:
          error.message ||
          'O banco não confirmou a gravação. Recarregue antes de tentar novamente.',
      },
      503,
    );
  }
}
