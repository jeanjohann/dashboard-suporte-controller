import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createArchitectureHandler } from './architectureMap.js';
const origin = 'https://map.example',
  password = 'Test-only-password-with-32-characters';
const env = () => ({
  MAP_PASSWORD: password,
  MAP_SESSION_SECRET: 'Test-only-session-signing-secret-123456789',
  MAP_LOGIN_LIMITER: { limit: async () => ({ success: true }) },
  ASSETS: {
    fetch: async () =>
      new Response('restricted-map', {
        headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=86400' },
      }),
  },
});
const form = (value = password, path = '/login', extra = {}) =>
  new Request(origin + path, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded', ...extra },
    body: new URLSearchParams({ password: value }),
  });
async function session(handler, e) {
  const response = await handler(form(), e);
  assert.equal(response.status, 303);
  return response.headers.get('Set-Cookie').split(';')[0];
}

test('nenhum documento ou diagrama é servido antes da senha, inclusive acesso direto', async () => {
  const e = env();
  let calls = 0;
  e.ASSETS.fetch = async () => {
    calls++;
    return new Response('SECRET');
  };
  const handle = createArchitectureHandler();
  for (const path of [
    '/',
    '/index.html',
    '/inventario.json',
    '/GUIA-DE-ESTUDO.md',
    '/diagramas/01-arquitetura.svg',
    '/api/me',
    '/src/main.jsx',
  ]) {
    const response = await handle(new Request(origin + path), e);
    assert.equal(response.status, path === '/' ? 200 : 401);
    assert.match(await response.text(), /Senha de acesso/);
    assert.equal(response.headers.get('Cache-Control'), 'no-store, private');
  }
  assert.equal(calls, 0);
  const robots = await handle(new Request(origin + '/robots.txt'), e);
  assert.match(await robots.text(), /Disallow: \//);
  assert.equal(calls, 0);
});
test('senha correta cria cookie curto, seguro e limitado a este site; armazenamento não recebe credenciais', async () => {
  let now = Date.parse('2026-10-21T15:00:00Z');
  const handle = createArchitectureHandler({ now: () => now }),
    e = env();
  const login = await handle(form(), e),
    setCookie = login.headers.get('Set-Cookie');
  assert.equal(login.status, 303);
  assert.equal(login.headers.get('Location'), '/');
  assert.equal(login.headers.get('Referrer-Policy'), 'same-origin');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=28800'])
    assert.ok(setCookie.includes(flag));
  const token = setCookie.split(';')[0];
  e.ASSETS.fetch = async (request) => {
    assert.equal(request.headers.get('Cookie'), null);
    assert.equal(request.headers.get('Authorization'), null);
    return new Response('restricted-map', { headers: { 'Cache-Control': 'public' } });
  };
  const response = await handle(
    new Request(origin + '/inventario.json', { headers: { Cookie: token } }),
    e,
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'restricted-map');
  assert.equal(response.headers.get('Cache-Control'), 'no-store, private');
  assert.equal(response.headers.get('Content-Disposition'), 'attachment');
  now += 28801 * 1000;
  assert.equal(
    (await handle(new Request(origin + '/index.html', { headers: { Cookie: token } }), e)).status,
    401,
  );
});
test('assinatura, audiência, cookies duplicados e rotação da senha invalidam a sessão', async () => {
  const handle = createArchitectureHandler(),
    e = env(),
    token = await session(handle, e);
  for (const cookie of [token + 'x', token + '; ' + token, '__Host-addlog-map=forged'])
    assert.equal(
      (await handle(new Request(origin + '/index.html', { headers: { Cookie: cookie } }), e))
        .status,
      401,
    );
  assert.equal(
    (
      await handle(
        new Request('https://other.example/index.html', { headers: { Cookie: token } }),
        e,
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await handle(new Request(origin + '/index.html', { headers: { Cookie: token } }), {
        ...e,
        MAP_PASSWORD: 'Rotated-password-at-least-32-chars',
      })
    ).status,
    401,
  );
});
test('login limita tentativas e corpo; recusa origem externa, senha inválida e campos repetidos', async () => {
  const handle = createArchitectureHandler(),
    e = env();
  assert.equal((await handle(form('wrong'), e)).status, 401);
  assert.equal(
    (await handle(form(password, '/login', { Origin: 'https://evil.example' }), e)).status,
    403,
  );
  assert.equal(
    (
      await handle(
        new Request(origin + '/login', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'password=x&password=' + password,
        }),
        e,
      )
    ).status,
    401,
  );
  assert.equal((await handle(form('x'.repeat(3000)), e)).status, 413);
  e.MAP_LOGIN_LIMITER.limit = async () => ({ success: false });
  const response = await handle(form(), e);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
});
test('logout exige POST da mesma origem e remove cookie; configuração ou limitador ausente recusa acesso', async () => {
  const handle = createArchitectureHandler(),
    e = env();
  assert.equal(
    (await handle(form('', '/logout', { Origin: 'https://evil.example' }), e)).status,
    403,
  );
  const response = await handle(form('', '/logout'), e);
  assert.equal(response.status, 303);
  assert.match(response.headers.get('Set-Cookie'), /Max-Age=0/);
  for (const change of [
    { MAP_PASSWORD: '' },
    { MAP_SESSION_SECRET: '' },
    { MAP_LOGIN_LIMITER: null },
    { ASSETS: null },
  ])
    assert.equal((await handle(new Request(origin + '/'), { ...e, ...change })).status, 503);
  e.MAP_LOGIN_LIMITER.limit = async () => {
    throw Error('private-binding-error');
  };
  const failure = await handle(form(), e);
  assert.equal(failure.status, 503);
  assert.ok(!(await failure.text()).includes('private-binding-error'));
});
test('configuração intercepta todos os arquivos e não possui os bindings do dashboard', () => {
  const config = JSON.parse(
    fs.readFileSync('wrangler.architecture.jsonc', 'utf8').replace(/,\s*([}\]])/g, '$1'),
  );
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.assets.not_found_handling, 'none');
  assert.equal(config.preview_urls, false);
  assert.equal(config.d1_databases, undefined);
  assert.equal(config.services, undefined);
  assert.equal(config.vars, undefined);
  assert.notEqual(config.assets.directory, './dist');
  assert.equal(config.ratelimits[0].simple.limit, 5);
});
