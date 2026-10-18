import test from 'node:test';
import assert from 'node:assert/strict';
import { queryLocalAssistant } from './assistantClient.js';

test('cliente mantém sessão em memória e envia asserção somente ao loopback fixo, sem dados livres', async () => {
  const calls = [];
  const result = await queryLocalAssistant('Quais os totais?', async (url, options) => {
    calls.push([url, options]);
    return Response.json(
      calls.length === 1
        ? { assertion: 'sessao' }
        : { metrics: {}, period: {}, source: {}, answer: 'Resultado', consulted: true },
    );
  });
  assert.equal(result.answer, 'Resultado');
  assert.equal(calls[0][0], '/api/assistant/local-session');
  assert.equal(calls[1][0], 'http://127.0.0.1:5681/v1/assistant/attendance');
  assert.equal(calls[1][1].headers.Authorization, 'Bearer sessao');
  assert.deepEqual(JSON.parse(calls[1][1].body), { question: 'Quais os totais?' });
  let count = 0;
  await assert.rejects(
    () =>
      queryLocalAssistant('Quais os totais?', async () => {
        count++;
        return Response.json({ error: 'Sem permissão' }, { status: 403 });
      }),
    /Sem permissão/,
  );
  assert.equal(count, 1);
});
