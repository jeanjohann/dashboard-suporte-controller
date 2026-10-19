/** Integração privada simulada: autenticação Google, destino fixo, limites e erros sem segredos. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportPKCS8, decodeJwt } from 'jose';
import { googleOrdersConfig, googleOrdersResponse, readGoogleOrders } from './googleOrders.js';
const { privateKey } = await generateKeyPair('RS256', { extractable: true });
const credentials = JSON.stringify({
  client_email: 'reader@test.iam.gserviceaccount.com',
  private_key: await exportPKCS8(privateKey),
});
const env = {
  GOOGLE_ORDERS_SPREADSHEET_ID: 'synthetic-spreadsheet-id-123',
  GOOGLE_ORDERS_SHEET: 'OS 2025_26',
  GOOGLE_SHEETS_CREDENTIALS: credentials,
};
const str = (v) => ({ effectiveValue: { stringValue: v }, formattedValue: v });
const book = () => ({
  sheets: [
    {
      properties: { title: 'OS 2025_26' },
      data: [
        {
          rowData: [
            { values: ['#', 'Status', 'Data de atendimento'].map(str) },
            {
              values: [
                str('#1'),
                str('Pago'),
                {
                  effectiveValue: { numberValue: 45678 },
                  formattedValue: '21/01/2025',
                  effectiveFormat: { numberFormat: { pattern: 'dd/mm/yyyy' } },
                },
              ],
            },
            {},
            {
              values: [
                str('#2'),
                {
                  effectiveValue: {
                    errorValue: { type: 'REF', message: 'detalhe não necessário' },
                  },
                  formattedValue: '#REF!',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

test('diagnóstico distingue chave, autenticação, acesso e formato sem expor respostas privadas', async () => {
  const request = new Request('https://app.example/api/orders/google/snapshot');
  const cases = [
    { credentials: 'json quebrado', code: 'GOOGLE_CREDENTIALS' },
    { credentials: 'null', code: 'GOOGLE_CREDENTIALS' },
    { authStatus: 400, code: 'GOOGLE_AUTH' },
    { authStatus: 302, code: 'GOOGLE_AUTH' },
    { sheetStatus: 302, code: 'GOOGLE_SHEETS_302' },
    { sheetStatus: 403, code: 'GOOGLE_SHEETS_403' },
    { sheetStatus: 404, code: 'GOOGLE_SHEETS_404' },
    { sheetStatus: 400, code: 'GOOGLE_SHEETS_400' },
    { invalidHeaders: true, code: 'GOOGLE_FORMAT' },
    { brokenAuth: true, code: 'GOOGLE_AUTH_RESPONSE' },
    { brokenSheet: true, code: 'GOOGLE_SHEETS_RESPONSE' },
  ];
  for (const scenario of cases) {
    let calls = 0;
    const response = await googleOrdersResponse(request, env, () =>
      readGoogleOrders(
        { ...env, GOOGLE_SHEETS_CREDENTIALS: scenario.credentials ?? credentials },
        {
          fetchImpl: async () => {
            calls++;
            const status = calls === 1 ? scenario.authStatus : scenario.sheetStatus;
            if (status) return new Response('private-response-secret', { status });
            if ((calls === 1 && scenario.brokenAuth) || (calls === 2 && scenario.brokenSheet))
              return new Response('private-response-secret', {
                headers: { 'Content-Type': 'application/json' },
              });
            if (calls === 1) return Response.json({ access_token: 'private-token' });
            const data = book();
            if (scenario.invalidHeaders) data.sheets[0].data[0].rowData[0] = {};
            return Response.json(data);
          },
        },
      ),
    );
    const body = await response.json();
    assert.equal(response.status, 502);
    assert.equal(body.code, scenario.code);
    assert.match(body.error, /A base anterior foi mantida/);
    assert.doesNotMatch(JSON.stringify(body), /private-response-secret|private-token|PRIVATE KEY/);
    if (scenario.credentials) assert.equal(calls, 0);
  }
});
test('assina JWT somente leitura e consulta apenas aba fixa; não devolve token/chave/comentários', async () => {
  const calls = [];
  const result = await readGoogleOrders(env, {
    fetchImpl: async (url, options) => {
      calls.push(String(url));
      assert.equal(options.redirect, 'manual');
      if (calls.length === 1) {
        const jwt = decodeJwt(options.body.get('assertion'));
        assert.equal(jwt.scope, 'https://www.googleapis.com/auth/spreadsheets.readonly');
        assert.equal(jwt.iss, 'reader@test.iam.gserviceaccount.com');
        assert.equal(jwt.sub, undefined);
        return Response.json({ access_token: 'private-access-token' });
      }
      const target = new URL(url);
      assert.equal(target.origin, 'https://sheets.googleapis.com');
      assert.equal(target.searchParams.get('ranges'), "'OS 2025_26'");
      assert.equal(options.headers.Authorization, 'Bearer private-access-token');
      const data = book();
      data.sheets.unshift({ properties: { title: 'Base clientes' } });
      data.sheets.push({ properties: { title: 'Guia de testes' } });
      return Response.json(data);
    },
  });
  assert.equal(calls.length, 2);
  assert.equal(result.rows[1][2].raw, 45678);
  assert.equal(result.rows[1][2].display, '21/01/2025');
  assert.deepEqual(result.rows[2], []);
  assert.equal(result.rows[3][1].type, 'e');
  for (const secret of ['PRIVATE KEY', 'private-access-token', 'detalhe não necessário'])
    assert.ok(!JSON.stringify(result).includes(secret));
});
test('falha, aba incorreta e limite de corpo impedem substituição parcial e vazamento de erro', async () => {
  const request = new Request('https://app.example/api/orders/google/snapshot');
  const response = await googleOrdersResponse(request, env, async () => {
    throw Error('private-access-token ' + credentials);
  });
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.ok(!(await response.text()).includes('private-access-token'));
  for (const invalid of [
    () => Response.json({ sheets: [] }),
    () => Response.json(book(), { headers: { 'Content-Length': '99999999' } }),
    () => new Response('Google token secreto', { status: 403 }),
  ]) {
    let n = 0;
    await assert.rejects(() =>
      readGoogleOrders(env, {
        fetchImpl: async () => (++n === 1 ? Response.json({ access_token: 'token' }) : invalid()),
      }),
    );
  }
});
test('configuração ausente não consulta Google; status não informa credenciais e métodos não GET são recusados', async () => {
  assert.equal(googleOrdersConfig({}), null);
  assert.equal(
    googleOrdersConfig({ ...env, GOOGLE_ORDERS_SPREADSHEET_ID: 'https://evil.example' }),
    null,
  );
  let called = false;
  const read = async () => {
    called = true;
  };
  assert.equal(
    (
      await googleOrdersResponse(
        new Request('https://app.example/api/orders/google/snapshot'),
        {},
        read,
      )
    ).status,
    503,
  );
  const status = await googleOrdersResponse(
    new Request('https://app.example/api/orders/google/status'),
    env,
    read,
  );
  assert.deepEqual(await status.json(), { configured: true, sheetName: 'OS 2025_26' });
  assert.equal(
    (
      await googleOrdersResponse(
        new Request('https://app.example/api/orders/google/snapshot', { method: 'POST' }),
        env,
        read,
      )
    ).status,
    405,
  );
  assert.equal(called, false);
});
