import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const MAX_SESSIONS = 4;
const SESSION_TTL_MS = 5 * 60 * 1000;
const CHARACTER_LIMIT = 25_000;
const periods = [
  'ultimo_mes',
  'semana_atual',
  'semana_anterior',
  'ultimos_7_dias',
  'personalizado',
  'total',
];

export const assistantMcpQuerySchema = z
  .object({
    periodo: z
      .enum(periods)
      .describe(
        'Recorte de OS: ultimo_mes, semana_atual, semana_anterior, ultimos_7_dias, personalizado ou total.',
      )
      .optional(),
    inicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('Data inicial AAAA-MM-DD; use somente com periodo personalizado.')
      .optional(),
    fim: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('Data final AAAA-MM-DD; use somente com periodo personalizado.')
      .optional(),
    responsavel: z
      .string()
      .min(1)
      .max(100)
      .describe('Nome exato de um responsável disponível no catálogo fictício.')
      .optional(),
    papel: z
      .enum(['execucao', 'agendamento'])
      .describe('Atribuição do responsável: execução ou agendamento. Padrão: execução.')
      .optional(),
    cliente: z
      .string()
      .min(1)
      .max(100)
      .describe('Nome de cliente consolidado, conforme o catálogo fictício.')
      .optional(),
    placa: z
      .string()
      .min(1)
      .max(20)
      .describe('Placa exata do veículo no acervo de teste.')
      .optional(),
    agrupar: z
      .enum(['responsavel', 'cliente', 'placa', 'modelo'])
      .describe('Dimensão do ranking; modelo somente para a fotografia do parque.')
      .optional(),
    limite: z
      .number()
      .int()
      .min(1)
      .max(20)
      .describe('Máximo de grupos ou detalhes, entre 1 e 20.')
      .optional(),
    situacao: z
      .enum(['Ativo', 'Cancelado'])
      .describe('Filtro disponível somente para parque.')
      .optional(),
    semHistorico: z
      .boolean()
      .describe('Filtra equipamentos sem OS efetiva vinculada na amostra.')
      .optional(),
    detalhar: z.boolean().describe('Inclui até limite registros de origem quando true.').optional(),
    ordenar: z
      .enum(['total', 'efetivos', 'improdutivos', 'custo'])
      .describe('Ordenação de ranking de atendimentos; custo está em reais.')
      .optional(),
  })
  .strict();

function sourceSummary(result) {
  const allowed = ['kind', 'filename', 'sheets', 'records', 'modifiedAt'];
  return Object.fromEntries(Object.entries(result).filter(([key]) => allowed.includes(key)));
}

function safeResult(result) {
  const { sources, source, ...payload } = result;
  return {
    ...payload,
    source: source ? sourceSummary(source) : null,
    sources: Array.isArray(sources) ? sources.map(sourceSummary) : [],
  };
}

function toolResult(result) {
  const structuredContent = safeResult(result);
  const text = JSON.stringify(structuredContent);
  if (text.length > CHARACTER_LIMIT)
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: 'A resposta excedeu o limite de contexto. Reduza o limite de detalhes ou aplique um filtro mais específico.',
        },
      ],
    };
  return { content: [{ type: 'text', text }], structuredContent };
}

function createServerForSession(query) {
  const server = new McpServer(
    { name: 'addlog-analytics-mcp-server', version: '0.1.0' },
    { capabilities: { tools: {} }, maxToolInputElements: 40 },
  );
  const register = (name, title, type, description) =>
    server.registerTool(
      name,
      {
        title,
        description,
        inputSchema: assistantMcpQuerySchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (parameters) => {
        const parsed = assistantMcpQuerySchema.safeParse(parameters);
        if (!parsed.success)
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: 'Parâmetros inválidos. Confira filtros, período e limite (1 a 20).',
              },
            ],
          };
        try {
          return toolResult(await query({ ...parsed.data, tipo: type }));
        } catch (error) {
          const known =
            error instanceof Error &&
            /filtro|período|agrupamento|Parque|ordenação|Datas|data|limite|responsável|Cliente/i.test(
              error.message,
            );
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: known
                  ? `Consulta não concluída: ${error.message}`
                  : 'Consulta indisponível. Confira se as duas planilhas fictícias estão na pasta import e tente novamente.',
              },
            ],
          };
        }
      },
    );

  register(
    'addlog_consultar_atendimentos',
    'Consultar atendimentos de teste',
    'atendimentos',
    'Consulta somente as planilhas fictícias de OS e Operacional. Retorna totais calculados pelo sistema, período, filtros aplicados, critérios, rankings e até 20 detalhes. Linhas são serviços; chamados distintos são uma métrica separada. Nunca acessa dados reais, Zoho, monitoramento ou arquivos escolhidos pela pergunta.',
  );
  register(
    'addlog_consultar_trocas',
    'Consultar trocas de teste',
    'trocas',
    'Consulta trocas confirmadas nas amostras fictícias: rastreador, RFID e coletora, ciclos encerrados e durações. Troca de rastreador requer par de retirada/instalação da mesma placa e chamado com IDs diferentes; ciclos incompletos não geram duração.',
  );
  register(
    'addlog_consultar_parque',
    'Consultar parque de teste',
    'parque',
    'Consulta a fotografia da planilha Operacional fictícia, com ativos, cancelados, modelo e cobertura de OS. Exige período total; ausência de OS na amostra não prova ausência de manutenção no mundo real.',
  );
  return server;
}

/** Servidor MCP limitado ao arquivo de demonstração e protegido por token local. */
export function createAssistantMcpService({
  token,
  query = createAssistantMcpQuery(token),
  sessionTtlMs = SESSION_TTL_MS,
} = {}) {
  if (typeof token !== 'string' || token.length < 32)
    throw new Error('Defina ACERVO_LOCAL_TOKEN com pelo menos 32 caracteres.');
  const app = express();
  app.disable('x-powered-by');
  app.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    response.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use((request, response, next) => {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(request.headers.host || ''))
      return response.status(403).json({ error: 'Host local não permitido.' });
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  const matchesToken = (request) => {
    const suppliedHeader = request.get('x-acervo-token');
    const supplied = Buffer.from(
      suppliedHeader || /^Bearer ([^\s]+)$/.exec(request.get('authorization') || '')?.[1] || '',
    );
    const expected = Buffer.from(token);
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  };
  const authenticate = (request, response, next) => {
    if (!matchesToken(request))
      return response.status(401).json({ error: 'Autorização local inválida.' });
    if (request.get('origin')) return response.status(403).json({ error: 'Origem não permitida.' });
    next();
  };

  const touch = (id) => {
    if (id && sessions.has(id)) sessionLastActivity.set(id, Date.now());
  };
  const sessions = new Map();
  const sessionLastActivity = new Map();
  const clearExpiredSessions = async () => {
    const cutoff = Date.now() - sessionTtlMs;
    for (const [id, lastActivity] of sessionLastActivity) {
      if (lastActivity < cutoff) {
        const transport = sessions.get(id);
        sessionLastActivity.delete(id);
        sessions.delete(id);
        await transport?.close().catch(() => {});
      }
    }
  };

  app.get('/health', authenticate, (_request, response) => response.json({ status: 'ok' }));
  app.post('/mcp', authenticate, async (request, response) => {
    try {
      await clearExpiredSessions();
      const sessionId = request.get('mcp-session-id');
      let transport = sessionId ? sessions.get(sessionId) : null;
      if (!transport && !sessionId && isInitializeRequest(request.body)) {
        if (sessions.size >= MAX_SESSIONS)
          return response
            .status(503)
            .json({ error: 'Limite de sessões MCP atingido; tente novamente.' });
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: (id) => {
            sessions.set(id, transport);
            sessionLastActivity.set(id, Date.now());
          },
        });
        const currentTransport = transport;
        transport.onclose = () => {
          if (currentTransport.sessionId) {
            sessions.delete(currentTransport.sessionId);
            sessionLastActivity.delete(currentTransport.sessionId);
          }
        };
        await createServerForSession(query).connect(transport);
      }
      if (!transport)
        return response.status(sessionId ? 404 : 400).json({ error: 'Sessão MCP inválida.' });
      touch(sessionId);
      await transport.handleRequest(request, response, request.body);
    } catch {
      if (!response.headersSent)
        response.status(500).json({ error: 'Não foi possível processar a consulta MCP.' });
    }
  });
  app.get('/mcp', authenticate, async (request, response) => {
    await clearExpiredSessions();
    const transport = sessions.get(request.get('mcp-session-id'));
    if (!transport) return response.status(404).end();
    touch(request.get('mcp-session-id'));
    await transport.handleRequest(request, response);
  });
  app.delete('/mcp', authenticate, async (request, response) => {
    await clearExpiredSessions();
    const transport = sessions.get(request.get('mcp-session-id'));
    if (!transport) return response.status(404).end();
    touch(request.get('mcp-session-id'));
    await transport.handleRequest(request, response);
  });
  app.use((error, _request, response, _next) => {
    if (response.headersSent) return;
    const status =
      Number.isInteger(error?.status) && error.status >= 400 && error.status < 500
        ? error.status
        : 400;
    response.status(status).json({
      error:
        status === 413
          ? 'A requisição MCP excedeu o limite permitido.'
          : 'Requisição MCP inválida.',
    });
  });

  const httpServer = createServer(app);
  return {
    httpServer,
    async close() {
      await Promise.all(
        [...sessions.values()].map((transport) => transport.close().catch(() => {})),
      );
      sessions.clear();
      sessionLastActivity.clear();
      if (httpServer.listening)
        await new Promise((resolve, reject) =>
          httpServer.close((error) => (error ? reject(error) : resolve())),
        );
    },
  };
}

/** Encaminha somente a consulta MCP ativa para a sessão temporária da página. */
export function createAssistantMcpQuery(token, fetcher = fetch) {
  return async (parameters) => {
    const url = new URL('/v1/assistant/tool', 'http://127.0.0.1:5681');
    url.searchParams.set('consulta', 'atendimentos');
    url.searchParams.set('parametros', JSON.stringify(parameters));
    if (url.href.length > 4096) throw new Error('A consulta excedeu o limite permitido.');
    let response;
    try {
      response = await fetcher(url, {
        headers: { 'x-acervo-token': token },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new Error('A ponte local do Assistente não respondeu.');
    }
    if (response.status === 409)
      throw new Error('A chamada não está vinculada a uma pergunta ativa na página.');
    if (!response.ok) throw new Error('A consulta local foi recusada.');
    const result = await response.json().catch(() => null);
    if (!result || typeof result !== 'object' || Array.isArray(result))
      throw new Error('A consulta local retornou uma resposta inválida.');
    return result;
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!process.argv.includes('--serve')) throw new Error('Use --serve para iniciar o MCP local.');
  const service = createAssistantMcpService({ token: process.env.ACERVO_LOCAL_TOKEN });
  service.httpServer.listen(5682, '127.0.0.1', () => {
    process.stderr.write('MCP local de demonstração disponível em 127.0.0.1:5682/mcp.\n');
  });
  const stop = () => service.close().finally(() => process.exit(0));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
