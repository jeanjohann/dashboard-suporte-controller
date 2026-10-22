/** D1 de teste com SQLite real e batch transacional; não consulta nenhum ambiente remoto. */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export function snapshotTestDatabase(t) {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON');
  for (const name of ['0001_business_documents.sql', '0002_snapshots_and_collection.sql'])
    sql.exec(readFileSync(new URL('./migrations/' + name, import.meta.url), 'utf8'));
  t.after(() => sql.close());
  let queue = Promise.resolve();
  const stats = { queries: 0 };
  const database = {
    prepare(query) {
      let args = [];
      return {
        bind(...values) {
          args = values;
          return this;
        },
        async first() {
          stats.queries++;
          return sql.prepare(query).get(...args) || null;
        },
        async all() {
          stats.queries++;
          return { success: true, results: sql.prepare(query).all(...args) };
        },
        async run() {
          stats.queries++;
          return {
            success: true,
            meta: { changes: Number(sql.prepare(query).run(...args).changes) },
          };
        },
      };
    },
    batch(statements) {
      const task = queue.then(async () => {
        sql.exec('BEGIN IMMEDIATE');
        try {
          const result = [];
          for (const s of statements) result.push(await s.run());
          sql.exec('COMMIT');
          return result;
        } catch (error) {
          sql.exec('ROLLBACK');
          throw error;
        }
      });
      queue = task.catch(() => {});
      return task;
    },
  };
  return { database, sql, stats };
}
