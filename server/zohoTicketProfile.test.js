import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectZohoTicketProfile } from './zohoTicketProfile.js';
test('amostra distingue agente, importação e contato e não revela títulos ou descrições', async () => {
  for (const [type, source, confirmed] of [
    ['Agent', null, true],
    ['Agent', 'Import', false],
    ['Contact', 'Email', false],
  ]) {
    const result = await inspectZohoTicketProfile(async (path) =>
      path.startsWith('/tickets?')
        ? { data: [{ id: '1' }] }
        : path.includes('/History?')
          ? {
              data: [
                {
                  eventName: 'TicketCreated',
                  eventTime: '2026-10-23T10:00:00Z',
                  actor: { id: '2', type },
                  source,
                },
              ],
            }
          : {
              id: '1',
              subject: 'Privado',
              description: 'Privado',
              category: 'Treinamento',
              classification: 'Question',
            },
    );
    assert.equal(result.samples[0].creation.confirmedSupportOpening, confirmed);
    assert.equal(result.samples[0].category, 'Treinamento');
    assert.equal(JSON.stringify(result).includes('Privado'), false);
  }
});
test('histórico truncado não confirma autor nem infere criação pelo responsável atual', async () => {
  const result = await inspectZohoTicketProfile(async (path) =>
    path.startsWith('/tickets?')
      ? { data: [{ id: '1' }] }
      : path.includes('/History?')
        ? { data: Array.from({ length: 50 }, () => ({ eventName: 'TicketUpdated' })) }
        : { id: '1', assigneeId: '2' },
  );
  assert.equal(result.samples[0].historyComplete, false);
  assert.equal(result.samples[0].creation, null);
});
