/** Valida o piloto KORE com contratos fictícios, sem chamadas de rede, credenciais reais ou alterações em SIM cards. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { koreResponse, mapKorePage } from './kore.js';
import {
  normalizeKorePage,
  korePageSummary,
} from '../src/modules/consumption/data/koreContract.js';

const token = '00000000-0000-4000-8000-000000000001';
const env = () => ({
  KORE_API_USERNAME: 'fixture-user',
  KORE_API_PASSWORD: 'fixture&password#',
  KORE_API_LIMITER: { limit: async () => ({ success: true }) },
});
const request = (query = 'pagina=1') =>
  new Request('https://app.example/api/consumption/kore/page?' + query, {
    headers: { Cookie: 'private-cookie', 'Cf-Access-Jwt-Assertion': 'private-jwt' },
  });
const sample = () => ({
  meta: {
    pagina: 1,
    proxima: '/api/simcards/?pagina=2',
    total_registros: 23,
    total_registros_pagina: 20,
  },
  objetos: [
    {
      id_simcard: 1,
      iccid: '000123456789',
      msisdn: '00123456',
      operadora: 'Operadora teste',
      status: 'desbloqueado',
      conexao: 'offline',
      ultimo_acesso: '22/10/2026 10:00:00',
      servicos: { dados: { consumo_bytes: 0, aprovisionado: true, bloqueado: false } },
      bloqueio_funcional: false,
      suspensao: false,
    },
    {
      id_simcard: 2,
      iccid: '000223456789',
      msisdn: '',
      servicos: { dados: { consumo_bytes: 1024 } },
    },
  ],
});

test('token já ativo é explicado sem limpeza automática ou exposição do retorno privado', async () => {
  let calls = 0;
  const response = await koreResponse(request(), env(), async () => {
    calls++;
    return Response.json({ error_code: 2001, txt: 'private-sentinel' }, { status: 403 });
  });
  assert.equal(response.status, 502);
  const body = await response.json();
  assert.equal(body.code, 'kore_active_token');
  assert.doesNotMatch(JSON.stringify(body), /private-sentinel/);
  assert.equal(calls, 1);
});

test('contrato preserva bytes, zeros, IDs e data literal BRT, sem inventar período', () => {
  const input = sample();
  input.password = 'private-sentinel';
  input.objetos[0].token = 'private-sentinel';
  const output = normalizeKorePage(mapKorePage(input, 1, '2026-10-22T13:00:00.000Z'));
  assert.equal(output.rows[0].iccid, '000123456789');
  assert.equal(output.rows[0].number, '00123456');
  assert.equal(output.rows[0].bytes, 0);
  assert.equal(output.rows[0].lastAccess, '22/10/2026 10:00:00');
  assert.equal(output.rows[1].number, null);
  assert.equal(output.period, 'unconfirmed');
  assert.equal(output.rows.length, 2);
  assert.equal(output.totalReported, 23);
  assert.equal(output.hasNext, true);
  assert.doesNotMatch(JSON.stringify(output), /private-sentinel|password|token/);
  assert.deepEqual(korePageSummary(output), { rows: 2, known: 2, bytes: 1024 });
});
test('ausência não vira zero e soma insegura não é arredondada', () => {
  const input = sample();
  input.objetos.forEach((row) => (row.servicos = null));
  assert.equal(korePageSummary(mapKorePage(input, 1)).bytes, null);
  input.objetos.forEach(
    (row) => (row.servicos = { dados: { consumo_bytes: Number.MAX_SAFE_INTEGER } }),
  );
  assert.equal(korePageSummary(mapKorePage(input, 1)).bytes, null);
});
test('paginação e linhas incompatíveis recusam a página inteira sem seguir URLs externas', () => {
  for (const mutate of [
    (v) => (v.meta.pagina = 2),
    (v) => (v.meta.proxima = 'https://evil.example/api/simcards/?pagina=2'),
    (v) => (v.meta.proxima = '/api/simcards/?pagina=9'),
    (v) => v.objetos.push(v.objetos[0]),
    (v) => (v.objetos[0].iccid = 123),
    (v) => (v.objetos[0].servicos.dados.consumo_bytes = -1),
    (v) => (v.objetos[0].id_simcard = Number.MAX_SAFE_INTEGER + 1),
    (v) => (v.meta.total_registros = 0),
  ]) {
    const input = sample();
    mutate(input);
    assert.throws(() => mapKorePage(input, 1));
  }
});
test('status exige configuração completa e pedidos inválidos não chegam à operadora', async () => {
  const noFetch = () => {
    throw Error('network must not happen');
  };
  assert.equal((await koreResponse(request(), {}, noFetch)).status, 503);
  assert.deepEqual(
    await (
      await koreResponse(
        new Request('https://app.example/api/consumption/kore/status'),
        {},
        noFetch,
      )
    ).json(),
    { configured: false, source: 'kore-saitro', period: 'unconfirmed' },
  );
  for (const query of [
    'pagina=0',
    'pagina=1&pagina=2',
    'pagina=1&url=https://evil.example',
    'pagina=abc',
  ])
    assert.equal((await koreResponse(request(query), env(), noFetch)).status, 400);
  const limited = env();
  limited.KORE_API_LIMITER.limit = async () => ({ success: false });
  assert.equal((await koreResponse(request(), limited, noFetch)).status, 429);
  assert.equal(
    (await koreResponse(new Request(request().url, { method: 'POST' }), env(), noFetch)).status,
    405,
  );
});
test('transporte usa token em header, não encaminha identidade e encerra somente o token utilizado', async () => {
  const e = env(),
    calls = [];
  const fetcher = async (url, options) => {
    url = new URL(url);
    calls.push(url.pathname);
    assert.equal(url.origin, 'https://kore.saitro.com');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Cookie, undefined);
    assert.equal(options.headers['Cf-Access-Jwt-Assertion'], undefined);
    if (url.pathname === '/api/token/') {
      assert.equal(url.searchParams.get('password'), e.KORE_API_PASSWORD);
      return Response.json({
        token,
        Authorization: 'Basic ' + btoa(`${e.KORE_API_USERNAME}:${token}`),
      });
    }
    if (url.pathname === '/api/simcards/') {
      assert.equal(url.searchParams.get('username'), null);
      assert.equal(url.searchParams.get('token'), null);
      assert.equal(
        options.headers.Authorization,
        'Basic ' + btoa(`${e.KORE_API_USERNAME}:${token}`),
      );
      return Response.json(sample());
    }
    assert.equal(url.pathname, `/api/token/disable/${token}/`);
    return Response.json({ status: 'OK' });
  };
  const response = await koreResponse(request(), e, fetcher);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(calls, ['/api/token/', '/api/simcards/', `/api/token/disable/${token}/`]);
  assert.doesNotMatch(
    await response.text(),
    /fixture-user|fixture.password|private-cookie|private-jwt|Authorization|00000000-0000/,
  );
});
test('falhas são sanitizadas, encerramento é tentado após falha da leitura e nunca limpa tokens alheios', async () => {
  for (const mode of ['read-error', 'cleanup-error', 'bad-grant']) {
    const e = env(),
      calls = [];
    const response = await koreResponse(request(), e, async (url) => {
      const path = new URL(url).pathname;
      calls.push(path);
      if (path === '/api/token/')
        return Response.json({
          token,
          Authorization:
            mode === 'bad-grant'
              ? 'invalid private-sentinel'
              : 'Basic ' + btoa(`${e.KORE_API_USERNAME}:${token}`),
        });
      if (path === '/api/simcards/') {
        if (mode === 'read-error') throw Error('private-sentinel ' + e.KORE_API_PASSWORD);
        return Response.json(sample());
      }
      assert.equal(path, `/api/token/disable/${token}/`);
      if (mode === 'cleanup-error') return new Response('private-sentinel', { status: 401 });
      return Response.json({ status: 'OK' });
    });
    assert.equal(response.status, mode === 'cleanup-error' ? 200 : 502);
    const body = await response.json();
    if (mode === 'cleanup-error') {
      assert.equal(body.rows.length, 2);
      assert.equal(body.cleanupConfirmed, false);
    }
    assert.doesNotMatch(JSON.stringify(body), /private-sentinel|fixture|Authorization/);
    assert.ok(calls.includes(`/api/token/disable/${token}/`));
    assert.ok(!calls.includes('/api/token/clear/'));
  }
});
