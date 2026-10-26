/** O piloto remoto não cai silenciosamente para o navegador quando o D1 falha. */
import { api } from '../../../shared/security/accessClient.js';
import { vehicleKey, monitoringStages, monitoringInstant } from '../domain/monitoring.js';
import { createLocalTreatmentRepository } from './treatmentRepository.js';

function validateRecords(data) {
  if (
    data?.version !== 1 ||
    !Array.isArray(data.records) ||
    data.records.length > 5000 ||
    data.records.some(
      (record) =>
        !record ||
        typeof record.key !== 'string' ||
        !Number.isSafeInteger(record.revision) ||
        record.revision < 1 ||
        (record.deleted === true
          ? Object.keys(record).some((key) => !['key', 'deleted', 'revision'].includes(key))
          : !monitoringStages.includes(record.status) ||
            !Array.isArray(record.history) ||
            !record.history.length ||
            typeof record.owner !== 'string' ||
            typeof record.text !== 'string' ||
            monitoringInstant(record.at) == null ||
            record.history.some(
              (entry) =>
                !monitoringStages.includes(entry.status) ||
                typeof entry.owner !== 'string' ||
                typeof entry.text !== 'string' ||
                monitoringInstant(entry.at) == null,
            )),
    ) ||
    new Set(data.records.map((record) => record.key)).size !== data.records.length
  )
    throw Error('Resposta do histórico de acompanhamento incompatível.');
  return data.records;
}

export function createConfiguredTreatmentRepository({ scope, managed, demo, request = api }) {
  const local = createLocalTreatmentRepository(scope);
  let configured = !managed || demo;
  let remote = false;
  const repository = {
    mode: 'local',
    async configure() {
      if (configured) return;
      const status = await request('/api/business/status');
      if (
        status.version !== 1 ||
        typeof status.enabled !== 'boolean' ||
        typeof status.permitted !== 'boolean'
      )
        throw Error('Configuração do acompanhamento incompatível.');
      if (status.permitted && !status.enabled)
        throw Error('Banco do sistema indisponível. O acompanhamento não será salvo localmente.');
      remote = status.enabled && status.permitted;
      repository.mode = remote ? 'remote' : 'local';
      configured = true;
    },
    async read() {
      await repository.configure();
      if (!remote) return local.read();
      return validateRecords(await request('/api/monitoring/treatments'));
    },
    async change(vehicle, draft, expectedRevision = 0) {
      await repository.configure();
      if (!remote) return local.change(vehicle, draft, expectedRevision);
      const data = await request('/api/monitoring/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: vehicleKey(vehicle),
          expectedRevision,
          draft: {
            status: draft.status,
            owner: String(draft.owner || '').trim(),
            text: String(draft.text || '').trim(),
          },
        }),
      });
      if (data.version !== 1 || !data.record)
        throw Error('O banco não confirmou o acompanhamento.');
      const records = await repository.read();
      return [...records.filter((record) => record.key !== data.record.key), data.record];
    },
    async remove(vehicle, expectedRevision) {
      await repository.configure();
      if (!remote) return local.remove(vehicle, expectedRevision);
      const data = await request('/api/monitoring/treatments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: vehicleKey(vehicle), expectedRevision }),
      });
      if (data.version !== 1 || !data.record?.deleted)
        throw Error('O banco não confirmou a exclusão do acompanhamento.');
      const records = await repository.read();
      return [...records.filter((record) => record.key !== data.record.key), data.record];
    },
    async removeEntry(vehicle, entryIndex, expectedRevision) {
      await repository.configure();
      if (!remote) return local.removeEntry(vehicle, entryIndex, expectedRevision);
      const data = await request('/api/monitoring/treatments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: vehicleKey(vehicle), expectedRevision, entryIndex }),
      });
      if (data.version !== 1 || !data.record)
        throw Error('O banco não confirmou a exclusão da nota.');
      const records = await repository.read();
      return [...records.filter((record) => record.key !== data.record.key), data.record];
    },
  };
  return repository;
}
