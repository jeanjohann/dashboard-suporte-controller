import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
import {
  verifyLocalSession,
  localAssistantServer,
  assistantOrigin,
  parseAssistantExecution,
  createAssistantSession,
  validateQuestion,
} from './local-assistant.mjs';
import { assistantPayload } from './local-acervo.mjs';
import { assistantLiveWorkflow } from './assistant-live-workflow.mjs';
import { assistantAgentWorkflow } from './assistant-agent-workflow.mjs';

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
  const session = createAssistantSession({
    token: 'a'.repeat(48),
    readSnapshot: async () => ({}),
    query: async () => {
      calls++;
      return { answer: 'Ok' };
    },
  });
  const server = localAssistantServer({
    verify: async (token) => {
      if (token !== 'valido') throw Error();
    },
    session,
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
    assert.equal((await fetch(url.replace('/attendance', '/input'))).status, 403);
    assert.equal(
      (
        await fetch(url.replace('/attendance', '/input'), {
          headers: { 'x-acervo-token': 'a'.repeat(48) },
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await fetch(url.replace('/attendance', '/input'), {
          headers: { 'x-acervo-token': 'a'.repeat(48), Origin: assistantOrigin },
        })
      ).status,
      403,
    );
    const preflight = await fetch(url, { method: 'OPTIONS', headers });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), assistantOrigin);
    const input = {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Quais os totais?' }),
    };
    assert.equal((await fetch(url, input)).status, 200);
    assert.equal((await fetch(url, input)).status, 429);
    assert.equal(calls, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('erro descarta contexto e duas perguntas simultâneas não compartilham sessão', async () => {
  let release;
  const session = createAssistantSession({
    token: 'z'.repeat(48),
    cooldown: 0,
    readSnapshot: async () => ({}),
    query: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  const first = session.run('Primeira pergunta');
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(
    () => session.run('Segunda pergunta'),
    (error) => error.status === 429,
  );
  assert.equal(session.input().question, 'Primeira pergunta');
  release({ answer: 'Resposta' });
  await first;
  assert.throws(() => session.input());
  const failed = createAssistantSession({
    token: 'z'.repeat(48),
    readSnapshot: async () => ({}),
    query: async () => {
      throw Error('Falha');
    },
  });
  await assert.rejects(() => failed.run('Uma pergunta'));
  assert.throws(() => failed.input());
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
    'Agente de suporte': [{ data: { main: [[{ json: { output: 'Duas visitas' } }]] } }],
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

test('contexto só existe durante a pergunta e ferramenta usa snapshot único sem fonte identificável', async () => {
  let reads = 0;
  let session;
  session = createAssistantSession({
    token: 's'.repeat(48),
    cooldown: 0,
    readSnapshot: async () => {
      reads++;
      return {
        metrics: { completed: 20 },
        period: { start: '2026-05-01' },
        source: { filename: 'PRIVADO' },
        criteria: ['Critério'],
      };
    },
    query: async () => {
      assert.equal(session.input().question, 'Quantos atendimentos?');
      assert.throws(() => session.tool('shell'));
      const result = session.tool('atendimentos');
      assert.equal(JSON.stringify(result).includes('PRIVADO'), false);
      assert.equal(result.metrics.completed, 20);
      session.tool('atendimentos');
      assert.throws(() => session.tool('atendimentos'));
      return { answer: '20 atendimentos' };
    },
  });
  assert.throws(() => session.input());
  assert.equal(session.authorized('s'.repeat(48)), true);
  assert.equal(session.authorized('errado'), false);
  const result = await session.run('Quantos atendimentos?');
  assert.equal(reads, 1);
  assert.equal(result.consulted, true);
  assert.equal(result.source.filename, 'PRIVADO');
  assert.throws(() => session.input());
  assert.throws(() => session.tool('atendimentos'));
});

test('perguntas inválidas não viram parâmetros e agente sem ferramenta não recebe cards', async () => {
  for (const input of [
    { question: 'Oi' },
    { question: 'abc', command: 'shell' },
    { question: 'a'.repeat(1001) },
    { question: '\u0000abc' },
  ])
    assert.throws(() => validateQuestion(input));
  assert.equal(validateQuestion({ question: ' Qual o período? ' }), 'Qual o período?');
  const session = createAssistantSession({
    token: 't'.repeat(48),
    query: async () => ({ answer: 'Não tenho essa ferramenta.' }),
    readSnapshot: async () => ({ metrics: { completed: 20 } }),
  });
  const result = await session.run('Qual o custo?');
  assert.equal(result.consulted, false);
  assert.equal(result.metrics, undefined);
  const workflow = assistantAgentWorkflow({ id: 'g', name: 'Gemini' }, { id: 'a', name: 'Acervo' });
  assert.equal(workflow.nodes.filter((node) => node.type.endsWith('.agent')).length, 1);
  assert.equal(workflow.nodes.filter((node) => node.type.endsWith('httpRequestTool')).length, 1);
  assert.equal(workflow.connections.consultar_atendimentos.ai_tool[0][0].node, 'Agente de suporte');
});
