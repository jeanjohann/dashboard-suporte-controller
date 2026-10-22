/** Adaptador SQL do banco de negócio. Não inicializa tabelas e nunca usa USERS_DB. */
const fields =
  'workspace_id, resource, record_id, revision, payload_version, payload_json, deleted, updated_at, updated_by';
const decode = (row) =>
  row
    ? {
        version: 1,
        scope: row.workspace_id,
        collection: row.resource,
        id: row.record_id,
        revision: row.revision,
        valueVersion: row.payload_version,
        value: JSON.parse(row.payload_json),
        deleted: row.deleted === 1,
        updatedAt: row.updated_at,
        actor: row.updated_by,
      }
    : null;

/** Requer um banco de negócio separado de USERS_DB e tabelas previamente migradas. */
export function createD1DocumentAdapter(database) {
  if (typeof database?.prepare !== 'function') throw Error('Banco de documentos não configurado.');
  return Object.freeze({
    async read({ scope, collection, id }) {
      return decode(
        await database
          .prepare(
            `SELECT ${fields} FROM business_documents WHERE workspace_id = ? AND resource = ? AND record_id = ?`,
          )
          .bind(scope, collection, id)
          .first(),
      );
    },
    async list({ scope, collection, after, limit, includeDeleted }) {
      const result = await database
        .prepare(
          `SELECT ${fields} FROM business_documents WHERE workspace_id = ? AND resource = ? AND record_id > ?${includeDeleted ? '' : ' AND deleted = 0'} ORDER BY record_id LIMIT ?`,
        )
        .bind(scope, collection, after ?? '', limit)
        .all();
      if (result.success === false || !Array.isArray(result.results))
        throw Error('Leitura não confirmada pelo banco.');
      return result.results.map(decode);
    },
    async compareAndSwap({ scope, collection, id }, expectedRevision, next) {
      const values = [
        next.revision,
        next.valueVersion,
        JSON.stringify(next.value),
        next.deleted ? 1 : 0,
        next.updatedAt,
        next.actor,
      ];
      const statement =
        expectedRevision === 0
          ? database
              .prepare(
                `INSERT INTO business_documents (${fields}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(workspace_id, resource, record_id) DO NOTHING`,
              )
              .bind(scope, collection, id, ...values)
          : database
              .prepare(
                'UPDATE business_documents SET revision = ?, payload_version = ?, payload_json = ?, deleted = ?, updated_at = ?, updated_by = ? WHERE workspace_id = ? AND resource = ? AND record_id = ? AND revision = ?',
              )
              .bind(...values, scope, collection, id, expectedRevision);
      const result = await statement.run();
      if (result.success === false || !Number.isSafeInteger(result.meta?.changes))
        throw Error('Gravação não confirmada pelo banco.');
      return result.meta.changes === 1;
    },
  });
}
