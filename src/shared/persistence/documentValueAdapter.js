/** Ponte para módulos que usam read()/write(value), como o histórico de consumo. */
import { cloneDocument, documentKey, PersistenceError } from './documentRepository.js';

/** Criar uma instância por identidade/escopo; nunca compartilhar a revisão entre usuários. */
export function createDocumentValueAdapter({ repository, id, empty }) {
  documentKey(id);
  if (
    typeof repository?.read !== 'function' ||
    typeof repository?.put !== 'function' ||
    typeof empty !== 'function'
  )
    throw new PersistenceError('INVALID_DATA', 'Adaptador de valor incompleto.');
  let knownRevision = null;
  let queue = Promise.resolve();
  const enqueue = (operation) => {
    const pending = queue.then(operation);
    queue = pending.catch(() => {});
    return pending;
  };
  return Object.freeze({
    read: () =>
      enqueue(async () => {
        knownRevision = null;
        const document = await repository.read(id);
        const value = cloneDocument(!document || document.deleted ? empty() : document.value);
        knownRevision = document?.revision ?? 0;
        return value;
      }),
    write(value) {
      // A intenção é capturada agora, antes de aguardar uma operação anterior.
      const captured = cloneDocument(value);
      return enqueue(async () => {
        if (knownRevision === null)
          throw new PersistenceError('READ_REQUIRED', 'Leia novamente os dados antes de salvar.');
        try {
          const document = await repository.put(id, captured, { expectedRevision: knownRevision });
          knownRevision = document.revision;
        } catch (error) {
          knownRevision = null;
          throw error;
        }
      });
    },
  });
}
