/** A agenda remota nunca cai silenciosamente no IndexedDB em caso de erro. Migração é explícita. */
import { api } from '../../../shared/security/accessClient.js';
import { createReminderRepository } from './reminderRepository.js';
import { validateReminderDocument } from '../domain/monitoringReminders.js';

export function createConfiguredReminderRepository({
  scope,
  managed,
  demo,
  request = api,
  local = createReminderRepository(scope),
  storage,
}) {
  const marker = `addlog-reminders-d1-migrated-v1:${scope}`;
  const migrationStorage = () => storage || globalThis.localStorage;
  let configured = !managed || demo,
    remote = false;
  const repository = {
    mode: 'local',
    migration: null,
    migrationResults: [],
    async read() {
      if (!configured) {
        const status = await request('/api/business/status');
        if (
          status.version !== 1 ||
          typeof status.enabled !== 'boolean' ||
          typeof status.permitted !== 'boolean'
        )
          throw Error('Configuração da agenda incompatível.');
        if (status.permitted && !status.enabled)
          throw Error('Banco indisponível. A agenda local não será usada como substituição.');
        remote = status.enabled && status.permitted;
        repository.mode = remote ? 'remote' : 'local';
        configured = true;
      }
      if (!remote) return local.read();
      const records = [],
        seen = new Set();
      let after = null;
      for (let page = 0; page < 200; page++) {
        const data = await request('/api/monitoring/reminders' + (after ? `?after=${after}` : ''));
        if (
          data.version !== 1 ||
          !Array.isArray(data.records) ||
          data.records.length > 25 ||
          !(
            data.next === null ||
            (typeof data.next === 'string' &&
              /^[a-f0-9]{64}$/.test(data.next) &&
              (!after || data.next > after))
          )
        )
          throw Error('Resposta da agenda incompatível.');
        records.push(...data.records);
        for (const record of data.records) {
          if (seen.has(record.key)) throw Error('Agenda mudou durante a leitura. Recarregue.');
          seen.add(record.key);
        }
        if (!data.next) {
          validateReminderDocument({ version: 1, records });
          if (migrationStorage().getItem(marker) !== 'done') {
            const existing = await local.read();
            repository.migration = existing.length ? existing : null;
          }
          return records;
        }
        // Uma página pode conter somente exclusões ocultas; o cursor validado ainda avança.
        after = data.next;
      }
      throw Error('Agenda excede o limite de leitura. Nenhum resultado parcial foi aplicado.');
    },
    async change(vehicle, expectedRevision, action, draft) {
      if (!configured) throw Error('Carregue a agenda antes de salvar.');
      if (!remote) return local.change(vehicle, expectedRevision, action, draft);
      if (repository.migration)
        throw Error('Confira a migração dos lembretes locais antes de editar a agenda.');
      await request('/api/monitoring/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: Object.fromEntries(
            ['clientId', 'vehicleId', 'plate', 'clientName'].map((key) => [
              key,
              String(vehicle[key] || ''),
            ]),
          ),
          expectedRevision,
          action,
          draft,
        }),
      });
      return repository.read();
    },
    async migrate() {
      if (!remote || !repository.migration) throw Error('Não há migração pendente.');
      const records = repository.migration;
      const results = [];
      for (const record of records) {
        const data = await request('/api/monitoring/reminders/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: 1, records: [record] }),
        });
        if (
          data.version !== 1 ||
          !Array.isArray(data.results) ||
          data.results.length !== 1 ||
          data.results[0].key !== record.key ||
          !['imported', 'identical', 'conflict'].includes(data.results[0].status)
        )
          throw Error('O banco não confirmou a migração. A cópia local foi preservada.');
        results.push(data.results[0]);
      }
      repository.migrationResults = results;
      if (results.some((row) => row.status === 'conflict'))
        throw Error(
          'Há históricos diferentes para o mesmo veículo. A agenda do banco e a cópia local foram preservadas; revise os conflitos antes de editar.',
        );
      migrationStorage().setItem(marker, 'done');
      repository.migration = null;
      return results;
    },
  };
  return repository;
}
