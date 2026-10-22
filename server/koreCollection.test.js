import test from 'node:test';
import assert from 'node:assert/strict';
import { koreResponse } from './kore.js';
import { appendKoreBatch } from '../src/modules/consumption/data/koreCollection.js';
const token = '00000000-0000-4000-8000-000000000001';
const env = {
  KORE_API_USERNAME: 'fixture',
  KORE_API_PASSWORD: 'fixture',
  KORE_API_LIMITER: { limit: async () => ({ success: true }) },
};
const raw = (page) => ({
  meta: {
    pagina: page,
    total_registros: 10,
    total_registros_pagina: 1,
    proxima: page < 10 ? `/api/simcards/?pagina=${page + 1}` : null,
  },
  objetos: [
    {
      id_simcard: page,
      iccid: String(1000 + page),
      msisdn: '1234',
      servicos: { dados: { consumo_bytes: page } },
    },
  ],
});
async function batch(page, fail = false) {
  const calls = [];
  const response = await koreResponse(
    new Request(`https://example.test/api/consumption/kore/batch?pagina=${page}`),
    env,
    async (url) => {
      const u = new URL(url);
      calls.push(u.pathname);
      if (u.pathname === '/api/token/')
        return Response.json({ token, Authorization: 'Basic ' + btoa(`fixture:${token}`) });
      if (u.pathname.includes('/disable/')) return Response.json({ status: true });
      const n = Number(u.searchParams.get('pagina'));
      if (fail && n === 3) return new Response('private', { status: 503 });
      return Response.json(raw(n));
    },
  );
  return { response, calls };
}
test('lotes usam até oito páginas por token e acumulam todas as linhas sem novo acesso para paginar a tabela', async () => {
  const first = await batch(1);
  assert.equal(first.response.status, 200);
  assert.equal(first.calls.length, 10);
  const partial = appendKoreBatch(null, await first.response.json());
  assert.equal(partial.rows.length, 8);
  assert.equal(partial.complete, false);
  const second = await batch(9);
  assert.equal(second.calls.length, 4);
  const full = appendKoreBatch(partial, await second.response.json());
  assert.equal(full.rows.length, 10);
  assert.equal(full.complete, true);
  assert.equal(full.cleanupConfirmed, true);
});
test('falha intermediária não publica lote truncado e encerra apenas o token usado', async () => {
  const { response, calls } = await batch(1, true);
  assert.equal(response.status, 502);
  assert.match(calls.at(-1), /\/disable\//);
  const body = await response.json();
  assert.equal(body.pages, undefined);
});
test('duplicatas, lacunas, total alterado e fim inconsistente não corrompem a coleta anterior', async () => {
  const first = appendKoreBatch(null, await (await batch(1)).response.json());
  const original = JSON.stringify(first);
  for (const mutate of [
    (b) => (b.pages[0].rows[0].id = '1'),
    (b) => (b.pages[0].rows[0].iccid = '1001'),
    (b) => (b.pages[0].page = 10),
    (b) => (b.pages[0].totalReported = 11),
    (b) => b.pages.pop(),
  ]) {
    const b = await (await batch(9)).response.json();
    mutate(b);
    if (b.pages.length === 1) b.pages[0].hasNext = false;
    assert.throws(() => appendKoreBatch(first, b));
    assert.equal(JSON.stringify(first), original);
  }
});
