import { emptyDashboardDocument, validateDashboardDocument } from '../domain/layout.js';

/** Guarda somente configurações. A transação impede que uma aba sobrescreva a revisão de outra. */
export function createDashboardRepository(indexedDB = globalThis.indexedDB) {
  let pending;
  function open() {
    if (!indexedDB)
      return Promise.reject(Error('O armazenamento deste navegador não está disponível.'));
    if (!pending)
      pending = new Promise((resolve, reject) => {
        const request = indexedDB.open('addlog-my-dashboard-v1', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('layouts');
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => {
            db.close();
            pending = null;
          };
          resolve(db);
        };
        request.onerror = () => {
          pending = null;
          reject(Error('Não foi possível abrir seus dashboards salvos.'));
        };
        request.onblocked = () => {
          pending = null;
          reject(Error('Feche outras abas antigas do sistema e tente novamente.'));
        };
      });
    return pending;
  }
  return {
    async read(owner) {
      if (typeof owner !== 'string' || !owner) throw Error('Identidade de configuração ausente.');
      const db = await open();
      return new Promise((resolve, reject) => {
        let result;
        const tx = db.transaction('layouts', 'readonly'),
          request = tx.objectStore('layouts').get(owner);
        request.onsuccess = () => {
          result = request.result;
        };
        tx.oncomplete = () => {
          try {
            resolve(result == null ? emptyDashboardDocument() : validateDashboardDocument(result));
          } catch (error) {
            reject(error);
          }
        };
        tx.onabort = tx.onerror = () =>
          reject(Error('Não foi possível ler seus dashboards. A cópia salva foi preservada.'));
      });
    },
    async write(owner, document) {
      if (typeof owner !== 'string' || !owner) throw Error('Identidade de configuração ausente.');
      const input = validateDashboardDocument(document),
        db = await open();
      return new Promise((resolve, reject) => {
        let failure, saved;
        const tx = db.transaction('layouts', 'readwrite'),
          store = tx.objectStore('layouts'),
          request = store.get(owner);
        request.onsuccess = () => {
          try {
            const current =
              request.result == null
                ? emptyDashboardDocument()
                : validateDashboardDocument(request.result);
            if (current.revision !== input.revision)
              throw Error(
                'Os dashboards mudaram em outra aba. Sua edição foi mantida; reabra os salvos antes de substituir configurações.',
              );
            saved = { ...input, revision: current.revision + 1 };
            store.put(saved, owner);
          } catch (error) {
            failure = error;
            tx.abort();
          }
        };
        tx.oncomplete = () => resolve(saved);
        tx.onabort = tx.onerror = () =>
          reject(
            failure || Error('Não foi possível salvar. A configuração anterior foi preservada.'),
          );
      });
    },
  };
}
export const dashboardRepository = createDashboardRepository();
