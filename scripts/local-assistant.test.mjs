import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
import {
  verifyLocalSession,
  localAssistantServer,
  assistantOrigin,
  parseAssistantExecution,
} from './local-assistant.mjs';
import { assistantPayload } from './local-acervo.mjs';
import { assistantLiveWorkflow } from './assistant-live-workflow.mjs';

test('ponte verifica assinatura, audiência, expiração e proprietário', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const token = (
    email = 'jeancjohann@gmail.com',
    aud = '2e8bc40b094fc274b05494926b0395e1df8bd5f573b76815f7e1626b5567a579',
    exp = '5m',
  ) =>
    new SignJWT({ email })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('https://small-grass-95ae.cloudflareaccess.com')
      .setAudience(aud)
      .setSubject('test')
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(privateKey);
  await verifyLocalSession(await token(), publicKey);
  await assert.rejects(() => verifyLocalSession('forjado', publicKey));
  await assert.rejects(async () => verifyLocalSession(await token('outro@example.com'), publicKey));
  await assert.rejects(async () => verifyLocalSession(await token(undefined, 'outra'), publicKey));
  await assert.rejects(async () =>
    verifyLocalSession(await token(undefined, undefined, -1), publicKey),
  );
});

test('ponte bloqueia origem externa, ausência de sessão e parâmetros; não chama IA nessas falhas', async () => {
  let calls = 0;
  const server = localAssistantServer({
    verify: async (token) => {
      if (token !== 'valido') throw Error();
    },
    query: async () => {
      calls++;
      return { ok: true };
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/v1/assistant/attendance`;
  const headers = {
    Origin: assistantOrigin,
    Authorization: 'Bearer valido',
  };
  try {
    assert.equal(
      (
        await fetch(url, {
          method: 'POST',
          headers: { ...headers, Origin: 'https://evil.example' },
        })
      ).status,
      403,
    );
    assert.equal(
      (await fetch(url, { method: 'POST', headers: { ...headers, Authorization: '' } })).status,
      401,
    );
    assert.equal((await fetch(url, { method: 'POST', headers, body: 'comando' })).status, 400);
    assert.equal(calls, 0);
    const preflight = await fetch(url, { method: 'OPTIONS', headers });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), assistantOrigin);
    assert.equal((await fetch(url, { method: 'POST', headers })).status, 200);
    assert.equal((await fetch(url, { method: 'POST', headers })).status, 429);
    assert.equal(calls, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('payload e prompt não encaminham evidências, identificadores ou credenciais', () => {
  const payload = assistantPayload({
    generatedAt: 'hoje',
    manifest: [{ kind: 'orders', filename: 'OS.xlsx', sheets: ['OS'], sha256: 'hash' }],
    attendance: {
      period: {},
      metrics: {},
      criteria: [],
      completedWithoutValidDate: 1,
      evidence: [{ call: 'SEGREDO' }],
      client: 'SEGREDO',
    },
  });
  assert.equal(JSON.stringify(payload).includes('SEGREDO'), false);
  const workflow = assistantLiveWorkflow(
    { id: 'gemini', name: 'Gemini' },
    { id: 'archive', name: 'Arquivo' },
  );
  const prompt = workflow.nodes.find((node) => node.name === 'Explicar totais do acervo').parameters
    .text;
  assert.equal(prompt.includes('$json.source'), false);
  assert.equal(prompt.includes('$json.evidence'), false);
  assert.equal(workflow.active, false);
  assert.equal(
    workflow.nodes.some((node) => /webhook|executeCommand/.test(node.type)),
    false,
  );
});

test('extrai somente saída de sucesso; falha não vira resposta vazia nem revela metadados', () => {
  const runData = {
    'Totais locais de OS': [{ data: { main: [[{ json: { metrics: { completed: 2 } } }]] } }],
    'Explicar totais do acervo': [{ data: { main: [[{ json: { text: 'Duas visitas' } }]] } }],
  };
  const stdout =
    'Log interno\n' +
    JSON.stringify(
      { status: 'success', data: { resultData: { runData } }, resumeToken: 'SEGREDO' },
      null,
      2,
    );
  assert.equal(parseAssistantExecution(stdout).answer, 'Duas visitas');
  assert.equal(JSON.stringify(parseAssistantExecution(stdout)).includes('SEGREDO'), false);
  assert.throws(() => parseAssistantExecution(stdout.replace('success', 'error')));
  assert.throws(() => parseAssistantExecution('{}'));
});
