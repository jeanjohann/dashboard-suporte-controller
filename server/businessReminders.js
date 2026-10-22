/** Agenda durável: escopo, identidade e relógio vêm do servidor; nenhuma coleção livre é exposta. */
import { createD1DocumentAdapter } from './persistence/d1DocumentAdapter.js';
import { createDocumentRepository } from '../src/shared/persistence/documentRepository.js';
import {
  changeReminder,
  validateReminderDocument,
} from '../src/modules/monitoring/domain/monitoringReminders.js';
import { vehicleKey } from '../src/modules/monitoring/domain/monitoring.js';

const reply = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
const recordFields = [
  'key',
  'clientId',
  'vehicleId',
  'plate',
  'clientName',
  'dueAt',
  'note',
  'status',
  'revision',
  'history',
];
const eventFields = ['action', 'at', 'dueAt', 'note', 'outcome'];
const exact = (value, keys) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => keys.includes(key));
function validateRecord(row) {
  validateReminderDocument({ version: 1, records: [row] });
  if (
    !exact(row, recordFields) ||
    row.history.some((entry) => !exact(entry, eventFields)) ||
    new TextEncoder().encode(JSON.stringify(row)).length > 128 * 1024
  )
    throw Error('Lembrete incompatível ou muito grande.');
  return true;
}
const sameRecord = (a, b) =>
  recordFields.every((key) =>
    key === 'history'
      ? a.history.length === b.history.length &&
        a.history.every((e, i) => eventFields.every((k) => e[k] === b.history[i][k]))
      : a[key] === b[key],
  );
export async function reminderDocumentId(vehicle) {
  const key = vehicleKey(vehicle);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function vehicleInput(vehicle) {
  if (
    !exact(vehicle, ['clientId', 'vehicleId', 'plate', 'clientName']) ||
    ['clientId', 'vehicleId'].some(
      (key) =>
        typeof vehicle[key] !== 'string' || !vehicle[key].trim() || vehicle[key].length > 200,
    ) ||
    ['plate', 'clientName'].some(
      (key) => typeof vehicle[key] !== 'string' || vehicle[key].length > 300,
    )
  )
    throw Error('Identificação do veículo inválida.');
  return vehicle;
}
function repository(env, user) {
  return createDocumentRepository({
    adapter: createD1DocumentAdapter(env.BUSINESS_DB),
    scope: 'addlog',
    collection: 'monitoring-reminders',
    actor: user.email,
    validate: validateRecord,
  });
}
async function bodyOf(request) {
  if (!request.headers.get('Content-Type')?.includes('application/json'))
    throw Error('Envie JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw Error('Conteúdo ausente.');
  let size = 0;
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 256 * 1024) {
      await reader.cancel();
      throw Error('Conteúdo muito grande.');
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
export async function businessRemindersResponse(request, env, user, owner) {
  const url = new URL(request.url);
  const permitted =
    user.role === 'admin' && (user.email === owner || env.BUSINESS_REMINDERS_ACCESS === 'admins');
  const enabled = Boolean(env.BUSINESS_DB);
  if (url.pathname === '/api/business/status') {
    if (request.method !== 'GET' || url.search) return reply({ error: 'Consulta inválida.' }, 405);
    if (permitted && !enabled)
      return reply(
        { error: 'Banco do sistema não configurado. Não use uma agenda local como substituição.' },
        503,
      );
    return reply({
      version: 1,
      enabled,
      permitted,
      access: env.BUSINESS_REMINDERS_ACCESS === 'admins' ? 'admins' : 'owner',
    });
  }
  if (!permitted)
    return reply(
      { error: 'A agenda do banco está restrita aos administradores autorizados no piloto.' },
      403,
    );
  if (!enabled) return reply({ error: 'Banco do sistema ainda não configurado.' }, 503);
  const importing = url.pathname === '/api/monitoring/reminders/import';
  if (importing && !user.canImport) return reply({ error: 'Importação não autorizada.' }, 403);
  if (request.method !== 'GET' && request.method !== 'POST')
    return reply({ error: 'Método não permitido.' }, 405);
  if (request.method === 'POST' && request.headers.get('Origin') !== url.origin)
    return reply({ error: 'Origem não permitida.' }, 403);
  if (request.method === 'POST' && url.search)
    return reply({ error: 'Parâmetros não permitidos.' }, 400);
  const repo = repository(env, user);
  if (request.method === 'GET') {
    if (importing) return reply({ error: 'Método não permitido.' }, 405);
    const after = url.searchParams.get('after');
    if (
      [...url.searchParams.keys()].some((key) => key !== 'after') ||
      (after && !/^[a-f0-9]{64}$/.test(after))
    )
      return reply({ error: 'Página inválida.' }, 400);
    try {
      const page = await repo.list({ after, limit: 25 });
      return reply({
        version: 1,
        records: page.items.map((row) => row.value),
        next: page.nextCursor,
      });
    } catch {
      return reply(
        {
          error:
            'Não foi possível ler a agenda do banco. Os registros anteriores foram preservados.',
        },
        503,
      );
    }
  }
  let body;
  try {
    body = await bodyOf(request);
  } catch {
    return reply({ error: 'Conteúdo inválido ou maior que 256 KB.' }, 400);
  }
  if (importing) {
    try {
      if (
        !exact(body, ['version', 'records']) ||
        body.version !== 1 ||
        !Array.isArray(body.records) ||
        !body.records.length ||
        body.records.length > 10
      )
        throw Error();
      validateReminderDocument(body);
      body.records.forEach(validateRecord);
      body.records.forEach(vehicleInputFromRecord);
    } catch {
      return reply(
        { error: 'Lote de migração inválido. Nenhum registro deste lote foi enviado ao banco.' },
        400,
      );
    }
    const results = [];
    try {
      for (const record of body.records) {
        const id = await reminderDocumentId(record);
        let previous = await repo.read(id);
        if (!previous) {
          try {
            await repo.put(id, record, { expectedRevision: 0 });
            results.push({ key: record.key, status: 'imported' });
            continue;
          } catch (error) {
            if (error.code !== 'STORAGE_CONFLICT') throw error;
            previous = await repo.read(id);
          }
        }
        results.push({
          key: record.key,
          status:
            previous && !previous.deleted && sameRecord(previous.value, record)
              ? 'identical'
              : 'conflict',
        });
      }
      return reply({ version: 1, results });
    } catch {
      return reply(
        {
          error:
            'Migração interrompida. A cópia local foi preservada; repetir reconhece os registros já gravados.',
        },
        503,
      );
    }
  }
  try {
    if (
      !exact(body, ['vehicle', 'expectedRevision', 'action', 'draft']) ||
      !Number.isSafeInteger(body.expectedRevision) ||
      body.expectedRevision < 0 ||
      !exact(body.draft, ['localDate', 'note', 'outcome'])
    )
      throw Error();
    vehicleInput(body.vehicle);
  } catch {
    return reply({ error: 'Atualização inválida.' }, 400);
  }
  try {
    const id = await reminderDocumentId(body.vehicle),
      previous = await repo.read(id);
    if (previous?.deleted || (previous?.value.revision || 0) !== body.expectedRevision)
      return reply(
        { error: 'Este lembrete foi alterado. Recarregue antes de salvar.', code: 'CONFLICT' },
        409,
      );
    let next;
    try {
      next = changeReminder(previous?.value, body.vehicle, body.action, body.draft);
      validateRecord(next);
    } catch {
      return reply(
        { error: 'Ação, conteúdo ou data do lembrete inválidos. Confira o formulário.' },
        400,
      );
    }
    const saved = await repo.put(id, next, { expectedRevision: previous?.revision || 0 });
    return reply({ version: 1, record: saved.value });
  } catch (error) {
    return error.code === 'STORAGE_CONFLICT'
      ? reply(
          { error: 'Este lembrete foi alterado. Recarregue antes de salvar.', code: 'CONFLICT' },
          409,
        )
      : reply(
          { error: 'O banco não confirmou a gravação. Recarregue antes de tentar novamente.' },
          503,
        );
  }
}
function vehicleInputFromRecord(record) {
  vehicleInput(
    Object.fromEntries(
      ['clientId', 'vehicleId', 'plate', 'clientName'].map((key) => [key, record[key]]),
    ),
  );
}
