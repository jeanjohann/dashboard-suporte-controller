/** Adaptador de referência para testes e sessões; não persiste nem sincroniza dados. */
import { cloneDocument } from './documentRepository.js';

export function createMemoryDocumentAdapter() {
  const records = new Map();
  const address = ({ scope, collection, id }) => JSON.stringify([scope, collection, id]);
  return Object.freeze({
    async read(key) {
      const value = records.get(address(key));
      return value ? cloneDocument(value) : null;
    },
    async list({ scope, collection, after, limit, includeDeleted }) {
      return [...records.values()]
        .filter(
          (record) =>
            record.scope === scope &&
            record.collection === collection &&
            (after === null || record.id > after) &&
            (includeDeleted || !record.deleted),
        )
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
        .slice(0, limit)
        .map(cloneDocument);
    },
    async compareAndSwap(key, expectedRevision, next) {
      const id = address(key),
        current = records.get(id);
      if ((current?.revision ?? 0) !== expectedRevision) return false;
      records.set(id, cloneDocument(next));
      return true;
    },
  });
}
