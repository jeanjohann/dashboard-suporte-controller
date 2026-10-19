import test from 'node:test';
import assert from 'node:assert/strict';
import { createZohoReader, zohoConfigured, zohoResponse } from './zoho.js';

const env = {
  ZOHO_ORG_ID: '57912045',
  ZOHO_CLIENT_ID: 'private-client',
  ZOHO_CLIENT_SECRET: 'private-secret',
  ZOHO_REFRESH_TOKEN: 'private-refresh',
};
const agent = (n) => ({
  id: String(100 + n),
  firstName: 'Agente',
  lastName: String(n),
  emailId: `a${n}@example.test`,
  status: 'ACTIVE',
  mobile: 'private-phone',
});
const ticket = {
  id: '500',
  ticketNumber: '10',
  subject: 'Conferência',
  status: 'Open',
  assigneeId: '101',
  departmentId: '900',
  createdTime: '2026-10-19T10:00:00Z',
  description: 'private-body',
  email: 'private-contact',
};
function fixture(overrides = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url);
    calls.push({ url: parsed, options });
    assert.equal(options.redirect, 'manual');
    assert.ok(options.signal);
    if (parsed.hostname === 'accounts.zoho.com') {
      assert.equal(parsed.pathname, '/oauth/v2/token');
      assert.equal(parsed.search, '');
      assert.equal(options.method, 'POST');
      assert.equal(options.body.get('grant_type'), 'refresh_token');
      assert.equal(options.body.get('client_secret'), env.ZOHO_CLIENT_SECRET);
      return (
        overrides.auth?.(options) ??
        Response.json({ access_token: 'private-access', expires_in: 3600 })
      );
    }
    assert.equal(parsed.origin, 'https://desk.zoho.com');
    assert.equal(options.method, 'GET');
    assert.deepEqual(options.headers, {
      Authorization: 'Zoho-oauthtoken private-access',
      orgId: env.ZOHO_ORG_ID,
    });
    if (parsed.pathname.includes('/organizations/'))
      return (
        overrides.org?.() ??
        Response.json({ id: '57912045', companyName: 'Empresa teste', privateField: 'private-org' })
      );
    if (parsed.pathname.endsWith('/agents'))
      return overrides.agents?.(parsed) ?? Response.json({ data: [agent(1)] });
    assert.equal(parsed.pathname, '/api/v1/tickets');
    assert.equal(parsed.searchParams.get('sortBy'), '-createdTime');
    assert.equal(parsed.searchParams.get('limit'), '50');
    return overrides.tickets?.(parsed) ?? Response.json({ data: [ticket] });
  };
  return { calls, fetchImpl };
}
const request = (method = 'GET', path = '/api/zoho/snapshot') =>
  new Request('https://app.test' + path, { method });

test('consulta destinos fixos, devolve apenas campos necessários e reutiliza o token até expirar', async () => {
  const f = fixture();
  let time = 100000;
  const read = createZohoReader({ fetchImpl: f.fetchImpl, now: () => time });
  const first = await read(env);
  assert.equal(first.agents[0].id, '101');
  assert.equal(first.tickets[0].assigneeId, '101');
  assert.equal(first.coverage.agentsComplete, true);
  assert.equal(first.coverage.ticketsComplete, true);
  assert.doesNotMatch(JSON.stringify(first), /private-/);
  await read(env);
  assert.equal(f.calls.filter((call) => call.url.hostname === 'accounts.zoho.com').length, 1);
  time += 3600 * 1000;
  await read(env);
  assert.equal(f.calls.filter((call) => call.url.hostname === 'accounts.zoho.com').length, 2);
});

test('agentes são paginados e cobertura é parcial ao atingir o limite; chamados nunca viram totais históricos', async () => {
  const f = fixture({
    agents: (url) => {
      const from = Number(url.searchParams.get('from'));
      return Response.json({ data: Array.from({ length: 50 }, (_, n) => agent(from + n)) });
    },
    tickets: () =>
      Response.json({
        data: Array.from({ length: 50 }, (_, n) => ({ ...ticket, id: String(500 + n) })),
      }),
  });
  const result = await createZohoReader({ fetchImpl: f.fetchImpl })(env);
  assert.equal(result.agents.length, 200);
  assert.equal(result.coverage.agentsComplete, false);
  assert.equal(result.coverage.ticketsComplete, false);
  assert.deepEqual(
    f.calls
      .filter((c) => c.url.pathname.endsWith('/agents'))
      .map((c) => c.url.searchParams.get('from')),
    ['1', '51', '101', '151'],
  );
  const paged = fixture({
    agents: (url) =>
      Response.json({
        data:
          Number(url.searchParams.get('from')) === 1
            ? Array.from({ length: 50 }, (_, n) => agent(n))
            : [agent(50)],
      }),
  });
  const complete = await createZohoReader({ fetchImpl: paged.fetchImpl })(env);
  assert.equal(complete.agents.length, 51);
  assert.equal(complete.coverage.agentsComplete, true);
});

test('IDs numéricos seguros e textuais preservam identidade; números imprecisos e organizações diferentes são recusados', async () => {
  const f = fixture({
    org: () => Response.json({ id: 57912045, companyName: 'Empresa teste' }),
    agents: () => Response.json({ data: [{ ...agent(1), id: 101 }] }),
    tickets: () =>
      Response.json({ data: [{ ...ticket, id: 500, assigneeId: 101, departmentId: 900 }] }),
  });
  const result = await createZohoReader({ fetchImpl: f.fetchImpl })(env);
  assert.equal(result.organization.id, '57912045');
  assert.equal(result.agents[0].id, result.tickets[0].assigneeId);
  assert.equal(result.tickets[0].id, '500');
  for (const value of [57912046, Number.MAX_SAFE_INTEGER + 1, 57912045.5, null]) {
    const invalid = fixture({ org: () => Response.json({ id: value }) });
    await assert.rejects(
      () => createZohoReader({ fetchImpl: invalid.fetchImpl })(env),
      (error) => error.code === 'ZOHO_ORGANIZATION',
    );
    assert.equal(invalid.calls.length, 2);
  }
  const duplicate = fixture({
    agents: () => Response.json({ data: [{ ...agent(1), id: 101 }, agent(1)] }),
  });
  await assert.rejects(
    () => createZohoReader({ fetchImpl: duplicate.fetchImpl })(env),
    (error) => error.code === 'ZOHO_AGENTS',
  );
});

test('falhas de autenticação, rede, permissões e limites não retornam base parcial nem segredos', async () => {
  const scenarios = [
    { auth: () => Response.json({ error: 'invalid_client', description: 'private-secret' }) },
    { org: () => Response.json({ id: '999' }) },
    { agents: () => new Response('private-secret', { status: 403 }) },
    { tickets: () => new Response('private-secret', { status: 429 }) },
    {
      tickets: () =>
        new Response('private-secret', { status: 302, headers: { Location: 'https://evil.test' } }),
    },
    {
      tickets: () => {
        throw Error('private-secret');
      },
    },
    { agents: () => Response.json({ data: [agent(1), agent(1)] }) },
    { tickets: () => Response.json({ data: [{ ...ticket, id: 'bad' }] }) },
    { tickets: () => Response.json({ data: [] }, { headers: { 'Content-Length': '99999999' } }) },
    { tickets: () => Response.json({ data: [{ ...ticket, id: '501' }, ticket, ticket] }) },
  ];
  for (const scenario of scenarios) {
    const f = fixture(scenario);
    const response = await zohoResponse(
      request(),
      env,
      createZohoReader({ fetchImpl: f.fetchImpl }),
    );
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.match(body.code, /^ZOHO_/);
    assert.match(body.error, /leitura anterior foi mantida/);
    assert.equal(body.agents, undefined);
    assert.equal(body.tickets, undefined);
    assert.doesNotMatch(JSON.stringify(body), /private-|evil\.test/);
  }
});

test('configuração, status e método não fazem chamadas externas nem expõem credenciais', async () => {
  assert.equal(zohoConfigured(env), true);
  assert.equal(zohoConfigured({ ...env, ZOHO_REFRESH_TOKEN: '' }), false);
  assert.equal(zohoConfigured({ ...env, ZOHO_ORG_ID: 'https://evil.test' }), false);
  let calls = 0;
  const read = async () => {
    calls++;
  };
  const response = await zohoResponse(request('GET', '/api/zoho/status'), env, read);
  assert.deepEqual(await response.json(), { configured: true });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await zohoResponse(request('POST'), env, read)).status, 405);
  assert.equal((await zohoResponse(request(), {}, read)).status, 503);
  assert.equal(calls, 0);
});

test('troca de credencial invalida o cache e falha na renovação permite nova tentativa', async () => {
  let tries = 0;
  const f = fixture({
    auth: () => {
      if (++tries === 1) return Response.json({ error: 'invalid_grant' });
      return Response.json({ access_token: 'private-access', expires_in: 3600 });
    },
  });
  const read = createZohoReader({ fetchImpl: f.fetchImpl });
  await assert.rejects(() => read(env));
  await read(env);
  await read({ ...env, ZOHO_REFRESH_TOKEN: 'private-refreshed' });
  assert.equal(tries, 3);
});

test('rota de atividade valida período antes da rede, renova OAuth e exige a organização correta', async () => {
  let calls = 0;
  let denied = false;
  let wrongOrg = false;
  const reader = createZohoReader({
    now: () => Date.parse('2026-10-19T21:00:00Z'),
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(options.redirect, 'manual');
      const parsed = new URL(url);
      if (parsed.hostname === 'accounts.zoho.com')
        return Response.json({ access_token: 'private-access', expires_in: 3600 });
      assert.equal(parsed.origin, 'https://desk.zoho.com');
      assert.equal(options.headers.orgId, env.ZOHO_ORG_ID);
      if (parsed.pathname.includes('/organizations/'))
        return Response.json({ id: wrongOrg ? '999' : 57912045 });
      assert.equal(parsed.pathname, '/api/v1/tickets/search');
      assert.equal(parsed.searchParams.get('limit'), '10');
      assert.equal(
        parsed.searchParams.get('modifiedTimeRange'),
        '2026-10-19T03:00:00.000Z,2026-10-19T21:00:00.000Z',
      );
      return denied ? new Response('private-error', { status: 403 }) : Response.json({ data: [] });
    },
  });
  const path = '/api/zoho/activity?start=2026-10-19&end=2026-10-19';
  const invalid = await zohoResponse(request('GET', '/api/zoho/activity?start=bad'), env, reader);
  assert.equal(invalid.status, 400);
  assert.equal(calls, 0);
  const success = await zohoResponse(request('GET', path), env, reader);
  assert.equal(success.status, 200);
  assert.equal((await success.json()).next, null);
  denied = true;
  const failure = await zohoResponse(request('GET', path), env, reader);
  assert.equal(failure.status, 502);
  const body = await failure.json();
  assert.match(body.error, /Desk.search.READ/);
  assert.doesNotMatch(JSON.stringify(body), /private-/);
  wrongOrg = true;
  const mismatch = await zohoResponse(request('GET', path), env, reader);
  assert.equal(mismatch.status, 502);
  assert.equal((await mismatch.json()).code, 'ZOHO_ORGANIZATION');
});
