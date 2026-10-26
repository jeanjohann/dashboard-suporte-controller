/** Tratamento administrativo local por identidade, separado dos lembretes e da telemetria. */
import {
  monitoringStages,
  vehicleKey,
  monitoringInstant,
  recordMonitoringUpdate,
} from '../domain/monitoring.js';

export function treatmentScope(user, managed, demo) {
  const identity = managed ? user?.email?.trim().toLowerCase() : 'local';
  if (!identity) throw Error('Identidade indisponível para o acompanhamento local.');
  return JSON.stringify([identity, demo ? 'demo' : 'real']);
}

function validateRecord(record) {
  if (
    record?.deleted === true &&
    typeof record.key === 'string' &&
    Number.isSafeInteger(record.revision) &&
    record.revision > 0 &&
    Object.keys(record).every((key) => ['key', 'deleted', 'revision'].includes(key))
  )
    return record;
  if (
    !record ||
    typeof record !== 'object' ||
    typeof record.key !== 'string' ||
    !Array.isArray(record.history) ||
    !record.history.length ||
    !Number.isSafeInteger(record.revision) ||
    record.revision < 1 ||
    !monitoringStages.includes(record.status) ||
    typeof record.owner !== 'string' ||
    typeof record.text !== 'string' ||
    monitoringInstant(record.at) == null ||
    record.history.some(
      (entry) =>
        !entry ||
        !monitoringStages.includes(entry.status) ||
        typeof entry.owner !== 'string' ||
        typeof entry.text !== 'string' ||
        monitoringInstant(entry.at) == null,
    )
  )
    throw Error('O histórico de acompanhamento está incompatível. Os dados foram preservados.');
  return record;
}

export function createLocalTreatmentRepository(scope, storage = globalThis.localStorage) {
  const storageKey = `addlog-monitoring-treatments-v1:${scope}`;
  function read() {
    try {
      const parsed = JSON.parse(storage.getItem(storageKey) || '{"version":1,"records":[]}');
      if (parsed.version !== 1 || !Array.isArray(parsed.records) || parsed.records.length > 5000)
        throw Error();
      const records = parsed.records.map(validateRecord);
      if (new Set(records.map((record) => record.key)).size !== records.length) throw Error();
      return records;
    } catch {
      throw Error('Não foi possível ler o histórico local de acompanhamento.');
    }
  }
  return {
    mode: 'local',
    async read() {
      return read();
    },
    async change(vehicle, draft, expectedRevision = 0) {
      const records = read();
      const key = vehicleKey(vehicle);
      const previous = records.find((record) => record.key === key);
      if ((previous?.revision || 0) !== expectedRevision)
        throw Error('O acompanhamento mudou em outra aba. Recarregue antes de salvar.');
      const next = recordMonitoringUpdate(
        previous && !previous.deleted
          ? Object.fromEntries(Object.entries(previous).filter(([name]) => name !== 'revision'))
          : {},
        draft,
      );
      const record = validateRecord({ key, ...next, revision: expectedRevision + 1 });
      const updated = [...records.filter((item) => item.key !== key), record];
      storage.setItem(storageKey, JSON.stringify({ version: 1, records: updated }));
      return updated;
    },
    async remove(vehicle, expectedRevision) {
      const records = read();
      const key = vehicleKey(vehicle);
      const previous = records.find((record) => record.key === key);
      if (!previous || previous.deleted)
        throw Error('Este acompanhamento já foi excluído ou não existe.');
      if (previous.revision !== expectedRevision)
        throw Error('O acompanhamento mudou em outra aba. Recarregue antes de excluir.');
      const tombstone = validateRecord({ key, deleted: true, revision: expectedRevision + 1 });
      const updated = [...records.filter((item) => item.key !== key), tombstone];
      storage.setItem(storageKey, JSON.stringify({ version: 1, records: updated }));
      return updated;
    },
  };
}
