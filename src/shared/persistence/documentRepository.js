/** Contrato de documentos versionados, independente de React, rede e banco de dados. */
export class PersistenceError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = 'PersistenceError';
    this.code = code;
  }
}

function invalid(message) {
  throw new PersistenceError('INVALID_DATA', message);
}
export function documentKey(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:@-]{0,199}$/.test(value))
    invalid('Identificação de armazenamento inválida.');
  return value;
}
function revision(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value >= Number.MAX_SAFE_INTEGER)
    invalid('Informe a revisão conhecida antes de salvar.');
  return value;
}
function instant(value) {
  if (
    typeof value !== 'string' ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  )
    invalid('Data de gravação inválida.');
  return value;
}

/** Recusa conversões silenciosas: IDs, moedas, datas e células exigem adaptação explícita. */
export function cloneDocument(value) {
  const seen = new Set();
  function check(item) {
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return;
    if (typeof item === 'number' && Number.isFinite(item)) return;
    if (
      !item ||
      typeof item !== 'object' ||
      (!Array.isArray(item) && ![Object.prototype, null].includes(Object.getPrototypeOf(item))) ||
      seen.has(item)
    )
      invalid('O documento deve conter somente dados JSON sem conversões ou ciclos.');
    seen.add(item);
    for (const key of Reflect.ownKeys(item)) {
      if (Array.isArray(item) && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value'))
        invalid('Documento com campos incompatíveis ou calculados.');
    }
    if (Array.isArray(item)) {
      if (Object.keys(item).length !== item.length)
        invalid('Lista com posições ausentes ou campos extras.');
      for (const child of item) check(child);
    } else {
      for (const key of Object.keys(item)) check(item[key]);
    }
    seen.delete(item);
  }
  check(value);
  return JSON.parse(JSON.stringify(value));
}

/**
 * adapter: read(key), list({scope, collection, after, limit, includeDeleted}),
 * compareAndSwap(key, expectedRevision, next) -> boolean, atômico no armazenamento.
 * scope e actor devem vir da sessão validada no servidor ao usar armazenamento remoto.
 */
export function createDocumentRepository({
  adapter,
  scope,
  collection,
  actor,
  validate,
  valueVersion = 1,
  immutable = false,
  now = () => new Date().toISOString(),
}) {
  if (['read', 'list', 'compareAndSwap'].some((method) => typeof adapter?.[method] !== 'function'))
    invalid('Adaptador de documentos incompleto.');
  documentKey(scope);
  documentKey(collection);
  if (
    typeof actor !== 'string' ||
    !actor.trim() ||
    actor.length > 254 ||
    typeof validate !== 'function' ||
    !Number.isSafeInteger(valueVersion) ||
    valueVersion < 1 ||
    typeof immutable !== 'boolean'
  )
    invalid('Configuração de documentos inválida.');
  const key = (id) => ({ scope, collection, id: documentKey(id) });
  const check = async (record, id) => {
    if (
      !record ||
      record.version !== 1 ||
      record.scope !== scope ||
      record.collection !== collection ||
      (id != null && record.id !== id) ||
      !Number.isSafeInteger(record.revision) ||
      record.revision < 1 ||
      typeof record.deleted !== 'boolean' ||
      typeof record.actor !== 'string' ||
      !record.actor.trim() ||
      record.actor.length > 254
    )
      invalid('Documento armazenado incompatível.');
    documentKey(record.id);
    instant(record.updatedAt);
    if (record.valueVersion !== valueVersion)
      throw new PersistenceError(
        'INCOMPATIBLE_VERSION',
        'O documento exige uma migração de formato.',
      );
    if (record.deleted) {
      if (record.value !== null) invalid('Exclusão incompatível.');
    } else if ((await validate(record.value)) === false) invalid('Conteúdo do documento inválido.');
    return record;
  };
  async function storage(operation) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof PersistenceError) throw error;
      throw new PersistenceError(
        'STORAGE_UNAVAILABLE',
        'Não foi possível acessar o armazenamento. Os dados anteriores devem ser mantidos.',
        { cause: error },
      );
    }
  }
  async function commit(id, value, expectedRevision, deleted) {
    const address = key(id);
    revision(expectedRevision);
    if ((immutable && (expectedRevision !== 0 || deleted)) || (deleted && expectedRevision === 0))
      invalid('Esta operação não é permitida para o documento.');
    const next = {
      version: 1,
      ...address,
      revision: expectedRevision + 1,
      valueVersion,
      deleted,
      updatedAt: instant(now()),
      actor,
      value: deleted ? null : cloneDocument(value),
    };
    await check(next, id);
    const confirmed = await storage(() =>
      adapter.compareAndSwap(address, expectedRevision, cloneDocument(next)),
    );
    if (typeof confirmed !== 'boolean')
      throw new PersistenceError(
        'STORAGE_UNAVAILABLE',
        'O armazenamento não confirmou a gravação. Recarregue antes de tentar novamente.',
      );
    if (!confirmed)
      throw new PersistenceError(
        'STORAGE_CONFLICT',
        'Os dados mudaram em outra sessão. Recarregue antes de salvar; nenhuma alteração foi sobrescrita.',
      );
    return cloneDocument(next);
  }
  return Object.freeze({
    async read(id) {
      const record = await storage(() => adapter.read(key(id)));
      return record === null ? null : check(cloneDocument(record), id);
    },
    async list({ after = null, limit = 100, includeDeleted = false } = {}) {
      if (after !== null) documentKey(after);
      if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 500 ||
        typeof includeDeleted !== 'boolean'
      )
        invalid('Paginação de documentos inválida.');
      const records = await storage(() =>
        adapter.list({ scope, collection, after, limit: limit + 1, includeDeleted }),
      );
      if (!Array.isArray(records) || records.length > limit + 1)
        invalid('Página de documentos incompatível.');
      let previous = after;
      const checked = [];
      for (const record of records) {
        const item = await check(cloneDocument(record));
        if ((previous !== null && item.id <= previous) || (!includeDeleted && item.deleted))
          invalid('Ordem ou conteúdo da página incompatível.');
        previous = item.id;
        checked.push(item);
      }
      const items = checked.slice(0, limit);
      return { items, nextCursor: checked.length > limit ? items.at(-1).id : null };
    },
    put: (id, value, { expectedRevision } = {}) => commit(id, value, expectedRevision, false),
    remove: (id, { expectedRevision } = {}) => commit(id, null, expectedRevision, true),
  });
}
