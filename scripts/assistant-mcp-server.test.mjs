import test from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createAssistantMcpQuery, createAssistantMcpService } from './assistant-mcp-server.mjs';

const token = 'm'.repeat(48);

test('MCP exige token e bloqueia origem de navegador e Host externo', async () => {
  const service = createAssistantMcpService({ token, query: async () => ({}) });
  await new Promise((resolve) => service.httpServer.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${service.httpServer.address().port}`;
  try {
    assert.equal((await fetch(`${url}/health`)).status, 401);
    assert.equal(
      (
        await fetch(`${url}/health`, {
          headers: { 'x-acervo-token': token, Origin: 'https://example.invalid' },
        })
      ).status,
      403,
    );
    const badHostStatus = await new Promise((resolve, reject) => {
      const request = httpRequest(new URL('/health', url), {
        headers: { 'x-acervo-token': token, Host: 'example.invalid' },
      });
      request.on('response', (response) => {
        response.resume();
        resolve(response.statusCode);
      });
      request.on('error', reject);
      request.end();
    });
    assert.equal(badHostStatus, 403);
    assert.equal(
      (
        await fetch(`${url}/health`, {
          headers: { 'x-acervo-token': token },
        })
      ).status,
      200,
    );
  } finally {
    await service.close();
  }
});

test('cliente MCP descobre somente consultas de demonstração e encaminha parâmetros validados', async () => {
  const calls = [];
  const service = createAssistantMcpService({
    token,
    query: async (parameters) => {
      calls.push(parameters);
      return {
        profile: 'demo',
        period: { start: '2026-10-19', end: '2026-10-25' },
        metrics: { completed: 7, productive: 6, unproductive: 1 },
        source: { kind: 'orders', filename: 'DEMO-Ordens.xlsx', records: 1000 },
      };
    },
  });
  await new Promise((resolve) => service.httpServer.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${service.httpServer.address().port}`;
  const client = new Client({ name: 'mcp-test-client', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL('/mcp', baseUrl), {
    requestInit: { headers: { 'x-acervo-token': token } },
  });
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    assert.deepEqual(
      tools.tools.map((tool) => tool.name),
      ['addlog_consultar_atendimentos', 'addlog_consultar_trocas', 'addlog_consultar_parque'],
    );
    assert.ok(tools.tools.every((tool) => tool.annotations?.readOnlyHint === true));
    const result = await client.callTool({
      name: 'addlog_consultar_atendimentos',
      arguments: { periodo: 'semana_anterior', responsavel: 'Jean', limite: 5 },
    });
    assert.notEqual(result.isError, true);
    assert.equal(result.structuredContent.metrics.completed, 7);
    assert.deepEqual(calls, [
      { periodo: 'semana_anterior', responsavel: 'Jean', limite: 5, tipo: 'atendimentos' },
    ]);
  } finally {
    await client.close().catch(() => {});
    await service.close();
  }
});

test('proxy usa somente a sessão localhost e transforma falhas em mensagens seguras', async () => {
  const payload = { metrics: { completed: 3 } };
  const query = createAssistantMcpQuery(token, async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'http://127.0.0.1:5681');
    assert.equal(parsed.pathname, '/v1/assistant/tool');
    assert.equal(parsed.searchParams.get('consulta'), 'atendimentos');
    assert.deepEqual(JSON.parse(parsed.searchParams.get('parametros')), { tipo: 'parque' });
    assert.equal(options.headers['x-acervo-token'], token);
    return Response.json(payload);
  });
  assert.deepEqual(await query({ tipo: 'parque' }), payload);

  const unavailable = createAssistantMcpQuery(token, async () =>
    Response.json({}, { status: 409 }),
  );
  await assert.rejects(() => unavailable({}), /pergunta ativa na página/);
  const refused = createAssistantMcpQuery(token, async () => {
    throw new Error(`Falha contendo ${token}`);
  });
  await assert.rejects(
    () => refused({}),
    (error) => {
      assert.match(error.message, /ponte local do Assistente não respondeu/);
      assert.equal(error.message.includes(token), false);
      return true;
    },
  );
});
