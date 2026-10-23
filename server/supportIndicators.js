/** Piloto do proprietário: documentos diários por agente, CAS e auditoria do adaptador D1 existente. */
import { createD1DocumentAdapter } from './persistence/d1DocumentAdapter.js';
import { createDocumentRepository } from '../src/shared/persistence/documentRepository.js';
import {
  validateEntry,
  validateSettings,
  entryId,
  periodDays,
} from '../src/modules/support-indicators/domain/contracts.js';

const reply = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
export async function supportIndicatorsResponse(request, env, user, owner) {
  if (!user?.active || user.role !== 'admin' || user.email !== owner)
    return reply(
      { error: 'Indicadores Suporte está restrito ao administrador principal no piloto.' },
      403,
    );
  if (!env.BUSINESS_DB) return reply({ error: 'Banco de negócio não configurado.' }, 503);
  const url = new URL(request.url),
    settings = url.pathname === '/api/support-indicators/settings';
  if (!settings && url.pathname !== '/api/support-indicators/entries')
    return reply({ error: 'Rota inválida.' }, 404);
  if (!['GET', 'POST'].includes(request.method))
    return reply({ error: 'Método não permitido.' }, 405);
  const repo = createDocumentRepository({
    adapter: createD1DocumentAdapter(env.BUSINESS_DB),
    scope: 'addlog',
    collection: settings ? 'support-indicator-settings' : 'support-indicator-entries',
    actor: user.email,
    validate: settings ? validateSettings : validateEntry,
  });
  try {
    if (request.method === 'GET') {
      if (settings) {
        if (url.search) return reply({ error: 'Parâmetros inválidos.' }, 400);
        return reply({ version: 1, record: await repo.read('settings') });
      }
      const start = url.searchParams.get('start'),
        end = url.searchParams.get('end');
      try {
        periodDays({ start, end });
        if ([...url.searchParams.keys()].some((k) => !['start', 'end', 'after'].includes(k)))
          throw Error();
      } catch {
        return reply({ error: 'Período inválido, máximo de 366 dias.' }, 400);
      }
      const after = url.searchParams.get('after');
      if (
        after &&
        (!/^\d{4}-\d{2}-\d{2}\.\d{1,40}$/.test(after) || after < start || after > end + '.z')
      )
        return reply({ error: 'Cursor inválido.' }, 400);
      // A consulta SQL fica limitada ao intervalo e à coleção, sem varrer todo o histórico.
      const rows = await env.BUSINESS_DB.prepare(
        'SELECT record_id FROM business_documents WHERE workspace_id = ? AND resource = ? AND deleted = 0 AND record_id > ? AND record_id < ? ORDER BY record_id LIMIT 101',
      )
        .bind('addlog', 'support-indicator-entries', after || start, end + '.z')
        .all();
      if (rows.success === false || !Array.isArray(rows.results))
        throw Error('Leitura não confirmada');
      const records = await Promise.all(
        rows.results.slice(0, 100).map((r) => repo.read(r.record_id)),
      );
      return reply({
        version: 1,
        records,
        next: rows.results.length > 100 ? records.at(-1).id : null,
      });
    }
    if (request.headers.get('Origin') !== url.origin)
      return reply({ error: 'Origem não permitida.' }, 403);
    if (url.search || !request.headers.get('Content-Type')?.includes('application/json'))
      return reply({ error: 'Envie JSON sem parâmetros.' }, 400);
    let body;
    try {
      const reader = request.body?.getReader();
      if (!reader) throw Error();
      const chunks = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 24000) {
          await reader.cancel();
          throw Error();
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      if (
        !body ||
        Object.keys(body).sort().join(',') !== 'expectedRevision,value' ||
        !Number.isSafeInteger(body.expectedRevision) ||
        body.expectedRevision < 0
      )
        throw Error();
      (settings ? validateSettings : validateEntry)(body.value);
    } catch {
      return reply({ error: 'Dados inválidos. Confira os campos e tente novamente.' }, 400);
    }
    const id = settings ? 'settings' : entryId(body.value);
    const saved = await repo.put(id, body.value, { expectedRevision: body.expectedRevision });
    return reply({ version: 1, record: saved });
  } catch (error) {
    return error.code === 'STORAGE_CONFLICT'
      ? reply(
          {
            error: 'Alterado em outra sessão. Recarregue os lançamentos antes de salvar.',
            code: 'CONFLICT',
          },
          409,
        )
      : reply(
          { error: 'O banco não confirmou a operação. Recarregue antes de tentar novamente.' },
          503,
        );
  }
}
