/** Persistência exclusivamente local. Transação serializa abas; revisão impede edição sobre dados antigos. */
import {
  changeReminder,
  validateReminderDocument,
  matchesReminderRevision,
} from '../domain/monitoringReminders.js';
import { vehicleKey } from '../domain/monitoring.js';

export function reminderScope(user, managed, demo) {
  const identity = managed ? user?.email?.trim().toLowerCase() : 'local';
  if (!identity) throw Error('Identidade indisponível para os lembretes locais.');
  return JSON.stringify([identity, demo ? 'demo' : 'real']);
}

export function createReminderRepository(scope) {
  async function run(write, update) {
    return new Promise((resolve, reject) => {
      let connection,
        result,
        failure,
        refused = false;
      const fail = (error) => {
        refused = true;
        reject(error || Error('Não foi possível acessar os lembretes neste navegador.'));
      };
      let open;
      try {
        open = indexedDB.open('addlog-monitoring-reminders', 1);
      } catch (error) {
        fail(error);
        return;
      }
      open.onupgradeneeded = () => {
        if (refused) open.transaction.abort();
        else open.result.createObjectStore('reminders');
      };
      open.onerror = () => fail(open.error);
      open.onblocked = () => fail(Error('Feche as outras abas do sistema e tente novamente.'));
      open.onsuccess = () => {
        connection = open.result;
        if (refused) {
          connection.close();
          return;
        }
        connection.onversionchange = () => connection.close();
        let transaction;
        try {
          transaction = connection.transaction('reminders', write ? 'readwrite' : 'readonly');
          transaction.oncomplete = () => {
            connection.close();
            resolve(result);
          };
          transaction.onabort = () => {
            connection.close();
            fail(failure || transaction.error);
          };
          const store = transaction.objectStore('reminders');
          const request = store.get(scope);
          request.onsuccess = () => {
            try {
              const document = validateReminderDocument(
                request.result === undefined ? { version: 1, records: [] } : request.result,
              );
              result = update ? update(document.records) : document.records;
              if (write)
                store.put(validateReminderDocument({ version: 1, records: result }), scope);
            } catch (error) {
              failure = error;
              transaction.abort();
            }
          };
        } catch (error) {
          connection.close();
          fail(error);
        }
      };
    });
  }
  return {
    read: async () => (await run(false)).filter((row) => row.status !== 'deleted'),
    change: (vehicle, expectedRevision, action, draft) =>
      run(true, (records) => {
        const previous = records.find((row) => row.key === vehicleKey(vehicle));
        if (!matchesReminderRevision(previous, expectedRevision, action))
          throw Error('Este lembrete foi alterado em outra aba. Reabra-o antes de salvar.');
        const next = changeReminder(previous, vehicle, action, draft);
        return [...records.filter((row) => row.key !== next.key), next];
      }).then((records) => records.filter((row) => row.status !== 'deleted')),
  };
}
