/** Testes da API: JWT, autorização, cadastro SQL, suspensão e concorrência, sem acessar produção. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, SignJWT } from 'jose';
import { authenticatedEmail, createHandler } from './worker.js';
const issuer = 'https://test-team.cloudflareaccess.com',
  aud = 'expected-audience',
  owner = 'jeancjohann@gmail.com';
function database() {
  const db = new DatabaseSync(':memory:');
  return {
    prepare(sql) {
      return {
        bind(...args) {
          this.args = args;
          return this;
        },
        async first() {
          return db.prepare(sql).get(...this.args) || null;
        },
        async all() {
          return { results: db.prepare(sql).all(...(this.args || [])) };
        },
        async run() {
          const r = db.prepare(sql).run(...(this.args || []));
          return { meta: { changes: Number(r.changes) } };
        },
      };
    },
    close: () => db.close(),
  };
}
const env = (db) => ({
  USERS_DB: db,
  ACCESS_ISSUER: issuer,
  ACCESS_AUD: aud,
  BOOTSTRAP_ADMIN: owner,
  ASSETS: { fetch: () => new Response('static') },
});
const request = (method = 'GET', body, path = '/api/admin/users') =>
  new Request('https://app.example' + path, {
    method,
    headers: { Origin: 'https://app.example', 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const input = {
  email: 'user@company.com',
  role: 'user',
  active: true,
  pages: ['orders'],
  canImport: true,
  canExport: false,
  version: 0,
};

test('sessão do Assistente local exige proprietário ativo, POST e mesma origem', async () => {
  const db = database();
  try {
    const e = env(db),
      admin = createHandler(async () => owner);
    await admin(request('PUT', input), e);
    const path = '/api/assistant/local-session';
    assert.equal(
      (await createHandler(async () => input.email)(request('POST', null, path), e)).status,
      403,
    );
    assert.equal((await admin(request('GET', null, path), e)).status, 405);
    assert.equal(
      (
        await admin(
          new Request('https://app.example' + path, {
            method: 'POST',
            headers: { Origin: 'https://evil.example' },
          }),
          e,
        )
      ).status,
      403,
    );
    assert.equal((await admin(request('POST', null, path), e)).status, 401);
    const response = await admin(
      new Request('https://app.example' + path, {
        method: 'POST',
        headers: { Origin: 'https://app.example', 'Cf-Access-Jwt-Assertion': 'signed-test-token' },
      }),
      e,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { assertion: 'signed-test-token' });
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  } finally {
    db.close();
  }
});
test('Google Sheets exige sessão ativa e administrador mesmo para consultar configuração', async () => {
  const db = database();
  try {
    const e = env(db),
      admin = createHandler(async () => owner);
    await admin(request('PUT', input), e);
    const member = createHandler(async () => input.email);
    for (const path of [
      '/api/orders/google/status',
      '/api/orders/google/snapshot',
      '/api/operational/google/status',
      '/api/operational/google/snapshot',
    ]) {
      assert.equal((await member(request('GET', null, path), e)).status, 403);
      assert.equal(
        (await createHandler(async () => 'unknown@company.com')(request('GET', null, path), e))
          .status,
        403,
      );
      assert.equal(
        (
          await createHandler(async () => {
            throw Error('expired');
          })(request('GET', null, path), e)
        ).status,
        401,
      );
    }
    assert.equal((await admin(request('GET', null, '/api/orders/google/snapshot'), e)).status, 503);
    assert.deepEqual(
      await (await admin(request('GET', null, '/api/orders/google/status'), e)).json(),
      { configured: false, sheetName: 'OS 2025_26' },
    );
  } finally {
    db.close();
  }
});

test('piloto Zoho exige proprietário ativo autenticado; nem outros administradores recebem dados', async () => {
  const db = database();
  try {
    const e = env(db),
      admin = createHandler(async () => owner);
    await admin(request('PUT', input), e);
    await admin(request('PUT', { ...input, email: 'other@company.com', role: 'admin' }), e);
    for (const path of ['/api/zoho/status', '/api/zoho/snapshot', '/api/zoho/activity']) {
      for (const email of [input.email, 'other@company.com', 'unknown@company.com'])
        assert.equal(
          (await createHandler(async () => email)(request('GET', null, path), e)).status,
          403,
        );
      assert.equal(
        (
          await createHandler(async () => {
            throw Error('expired');
          })(request('GET', null, path), e)
        ).status,
        401,
      );
    }
    assert.deepEqual(await (await admin(request('GET', null, '/api/zoho/status'), e)).json(), {
      configured: false,
    });
    assert.equal((await admin(request('GET', null, '/api/zoho/snapshot'), e)).status, 503);
    assert.equal((await admin(request('POST', null, '/api/zoho/snapshot'), e)).status, 405);
  } finally {
    db.close();
  }
});
test('JWT confirma assinatura, audiência, emissor e expiração; cabeçalho de e-mail não autoriza', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const make = (audience = aud, expires = '1h') =>
    new SignJWT({ email: owner })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject('user-id')
      .setIssuedAt()
      .setExpirationTime(expires)
      .sign(privateKey);
  const req = (token) =>
    new Request('https://app.example/api/me', { headers: { 'Cf-Access-Jwt-Assertion': token } });
  assert.equal(await authenticatedEmail(req(await make()), env(null), publicKey), owner);
  await assert.rejects(() => authenticatedEmail(req('forged'), env(null), publicKey));
  await assert.rejects(async () =>
    authenticatedEmail(req(await make('another-app')), env(null), publicKey),
  );
  await assert.rejects(async () =>
    authenticatedEmail(req(await make(aud, -1)), env(null), publicKey),
  );
  await assert.rejects(() =>
    authenticatedEmail(
      new Request('https://app.example/api/me', {
        headers: { 'Cf-Access-Authenticated-User-Email': owner },
      }),
      env(null),
      publicKey,
    ),
  );
});
test('admin cadastra permissões no SQL; usuário comum não acessa administração', async () => {
  const db = database();
  try {
    const admin = createHandler(async () => owner),
      e = env(db);
    assert.equal((await admin(request('GET', null, '/api/me'), e)).status, 200);
    assert.equal((await admin(request('PUT', input), e)).status, 200);
    const member = createHandler(async () => input.email);
    assert.equal((await member(request(), e)).status, 403);
    const { user } = await (await member(request('GET', null, '/api/me'), e)).json();
    assert.deepEqual(user.pages, ['orders']);
    assert.equal(user.canExport, false);
    assert.equal(user.version, 1);
  } finally {
    db.close();
  }
});
test('bloqueia identidade desconhecida, CSRF, campos estranhos e escalada do administrador principal', async () => {
  const db = database();
  try {
    const e = env(db),
      admin = createHandler(async () => owner);
    assert.equal(
      (await createHandler(async () => 'unknown@company.com')(request(), e)).status,
      403,
    );
    const hostile = new Request('https://app.example/api/admin/users', {
      method: 'PUT',
      headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    assert.equal((await admin(hostile, e)).status, 403);
    assert.equal(
      (await admin(request('PUT', { ...input, spreadsheet: 'private data' }), e)).status,
      400,
    );
    assert.equal(
      (await admin(request('PUT', { ...input, email: owner, active: false, version: 1 }), e))
        .status,
      400,
    );
  } finally {
    db.close();
  }
});
test('versões concorrentes não sobrescrevem permissões; suspensão bloqueia a próxima consulta', async () => {
  const db = database();
  try {
    const e = env(db),
      admin = createHandler(async () => owner);
    await admin(request('PUT', input), e);
    assert.equal(
      (await admin(request('PUT', { ...input, version: 1, active: false }), e)).status,
      200,
    );
    assert.equal(
      (await admin(request('PUT', { ...input, version: 1, canExport: true }), e)).status,
      409,
    );
    assert.equal(
      (await createHandler(async () => input.email)(request('GET', null, '/api/me'), e)).status,
      403,
    );
  } finally {
    db.close();
  }
});
test('configuração incompleta recusa APIs e rotas desconhecidas não viram HTML', async () => {
  assert.equal((await createHandler()(request(), {})).status, 503);
  const db = database();
  try {
    assert.equal(
      (await createHandler(async () => owner)(request('GET', null, '/api/unknown'), env(db)))
        .status,
      404,
    );
  } finally {
    db.close();
  }
});

test('piloto KORE exige administrador ativo, inclusive quando usuário possui acesso ao consumo', async () => {
  const db = database();
  try {
    const e = env(db),
      admin = createHandler(async () => owner),
      path = '/api/consumption/kore/status';
    await admin(request('PUT', { ...input, pages: ['lines'] }), e);
    assert.equal(
      (await createHandler(async () => input.email)(request('GET', null, path), e)).status,
      403,
    );
    assert.equal((await admin(request('GET', null, path), e)).status, 200);
    assert.equal(
      (await admin(request('GET', null, '/api/consumption/kore/page?pagina=1'), e)).status,
      503,
    );
    assert.equal((await admin(request('POST', null, path), e)).status, 405);
  } finally {
    db.close();
  }
});

test('monitoramento exige página autorizada, serviço privado e GET; não encaminha identidade nem erros do fornecedor', async () => {
  const db = database();
  try {
    const admin = createHandler(async () => owner),
      e = env(db);
    const path = '/api/monitoring/snapshot';
    assert.equal((await admin(request('GET', null, path), e)).status, 503);
    await admin(request('PUT', input), e);
    let calls = 0;
    const snapshot = {
      schemaVersion: 1,
      complete: true,
      referenceAt: '2026-10-15T12:00:00Z',
      collections: [],
      vehicles: [],
      secret: 'private-token',
    };
    e.MONITORING_SERVICE = {
      async fetch(req) {
        calls++;
        assert.equal(req.url, 'https://monitoring.internal/snapshot');
        assert.equal(req.headers.get('Cookie'), null);
        assert.equal(req.headers.get('Cf-Access-Jwt-Assertion'), null);
        return Response.json(snapshot);
      },
    };
    const member = createHandler(async () => input.email);
    assert.equal((await member(request('GET', null, path), e)).status, 403);
    assert.equal(calls, 0);
    await admin(request('PUT', { ...input, version: 1, pages: ['monitoring'] }), e);
    const response = await member(request('GET', null, path), e);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.doesNotMatch(await response.text(), /private-token/);
    assert.equal((await member(request('POST', null, path), e)).status, 405);
    e.MONITORING_SERVICE = { fetch: async () => Response.json({ ...snapshot, complete: false }) };
    assert.equal((await member(request('GET', null, path), e)).status, 502);
    e.MONITORING_SERVICE = {
      fetch: async () => {
        throw Error('private-token');
      },
    };
    const failure = await member(request('GET', null, path), e);
    assert.equal(failure.status, 502);
    assert.doesNotMatch(await failure.text(), /private-token/);
    await admin(request('PUT', { ...input, version: 2, active: false }), e);
    assert.equal((await member(request('GET', null, path), e)).status, 403);
  } finally {
    db.close();
  }
});
