/** Ponte do piloto: loopback, origem fixa, JWT Access verificado e proprietário fixo. Sem tokens em logs. */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { timingSafeEqual } from 'node:crypto';
import { readArchive, assistantPayload } from './local-acervo.mjs';

export const assistantOrigin = 'https://dashboard-suporte-controller.jean-johann.workers.dev';
const issuer = 'https://small-grass-95ae.cloudflareaccess.com';
const audience = '2e8bc40b094fc274b05494926b0395e1df8bd5f573b76815f7e1626b5567a579';
const owner = 'jeancjohann@gmail.com';
const keys = createRemoteJWKSet(new URL(issuer + '/cdn-cgi/access/certs'));
const execute = promisify(execFile);

const failureMessages = {
  AI_UNAVAILABLE:
    'O Gemini informou indisponibilidade ou alta demanda. Aguarde alguns minutos e tente novamente.',
  ACERVO_READ:
    'Não foi possível ler o acervo local. Confira os três arquivos da pasta import e suas abas.',
  AI_LIMIT:
    'O Gemini informou um limite de uso ou cota. Aguarde a renovação do limite e confira o uso no Google AI Studio.',
  AI_AUTH: 'O Gemini recusou a credencial. Confira a credencial Google Gemini no n8n.',
  LOCAL_CONNECTION:
    'Uma conexão necessária à consulta falhou. Confira os serviços locais e a conexão com a internet.',
  RUNNER_BUSY: 'O executor local do n8n está ocupado. Aguarde e tente novamente.',
  TIMEOUT:
    'O agente não concluiu dentro de dois minutos. A consulta foi interrompida; tente novamente e confira o histórico no n8n.',
  INVALID_RESULT:
    'O n8n não retornou uma resposta completa do agente. Confira o fluxo atual e sua última execução.',
  EXECUTION_FAILED: 'A execução do agente falhou. Confira a última execução no fluxo atual do n8n.',
};

/** Classificação limitada: nunca devolve stdout, pergunta, URL com chave ou erro bruto ao navegador. */
export function assistantFailure(error) {
  let diagnostic = [error?.stdout, error?.stderr, error?.message].filter(Boolean).join('\n');
  try {
    const execution = extractExecution(error?.stdout || '');
    // Classifique o erro, não o texto da pergunta que pode aparecer no histórico bruto.
    diagnostic = JSON.stringify(execution.data?.resultData?.error || {});
  } catch {
    /* Falhas anteriores à execução podem conter apenas mensagens do processo. */
  }
  const code =
    error?.assistantCode ||
    (/RESOURCE_EXHAUSTED|\b429\b|quota.exceeded/i.test(diagnostic)
      ? 'AI_LIMIT'
      : /API_KEY_INVALID|API key.*(?:invalid|leaked|blocked)/i.test(diagnostic)
        ? 'AI_AUTH'
        : /\b503\b|\bUNAVAILABLE\b|high demand/i.test(diagnostic)
          ? 'AI_UNAVAILABLE'
          : /EADDRINUSE/.test(diagnostic)
            ? 'RUNNER_BUSY'
            : /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNABORTED/.test(diagnostic)
              ? 'LOCAL_CONNECTION'
              : error?.killed || /timed?\s*out|timeout/i.test(diagnostic)
                ? 'TIMEOUT'
                : 'EXECUTION_FAILED');
  return {
    code: Object.hasOwn(failureMessages, code) ? code : 'EXECUTION_FAILED',
    message: failureMessages[code] || failureMessages.EXECUTION_FAILED,
  };
}

export async function verifyLocalSession(token, keySet = keys) {
  const { payload } = await jwtVerify(token, keySet, {
    issuer,
    audience,
    algorithms: ['RS256'],
    requiredClaims: ['exp', 'iat', 'sub', 'email'],
  });
  if (String(payload.email).trim().toLowerCase() !== owner)
    throw new Error('Proprietário necessário.');
}

/** Localiza o JSON da execução sem confundir mensagens posteriores do processo com a resposta. */
export function extractExecution(stdout) {
  const start = stdout.search(/^\{\s*$/m);
  if (start < 0) {
    const error = new Error('Resposta do n8n ausente.');
    error.assistantCode = 'INVALID_RESULT';
    throw error;
  }
  let end = -1,
    depth = 0,
    quoted = false,
    escaped = false;
  for (let index = start; index < stdout.length; index++) {
    const character = stdout[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === '{') depth++;
    else if (character === '}' && --depth === 0) {
      end = index + 1;
      break;
    }
  }
  let execution;
  try {
    execution = JSON.parse(stdout.slice(start, end < 0 ? undefined : end));
  } catch {
    const error = new Error('Resposta inválida do n8n.');
    error.assistantCode = 'INVALID_RESULT';
    throw error;
  }
  return execution;
}

/** Retorna só o resultado esperado; stdout bruto pode conter metadados internos e nunca sai da ponte. */
export function parseAssistantExecution(stdout) {
  const execution = extractExecution(stdout);
  const result = execution.data?.resultData;
  if (execution.status !== 'success' || result?.error) {
    const error = new Error('Consulta não concluída.');
    error.stdout = stdout;
    throw error;
  }
  const text = result.runData?.['Agente de suporte']?.at(-1)?.data?.main?.[0]?.[0]?.json?.output;
  if (typeof text !== 'string' || !text.trim() || text.length > 12000) {
    const error = new Error('Resultado incompleto.');
    error.assistantCode = 'INVALID_RESULT';
    throw error;
  }
  return { answer: text };
}

export async function runLocalAssistant() {
  const runtime = join(process.env.LOCALAPPDATA, 'Addlog/n8n-lab');
  const { stdout } = await execute(
    process.execPath,
    [
      join(runtime, 'node_modules/n8n/bin/n8n'),
      'execute',
      '--id=labAssistantAgent01',
      '--rawOutput',
    ],
    {
      cwd: runtime,
      windowsHide: true,
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024,
      env: {
        ...process.env,
        N8N_USER_FOLDER: join(runtime, 'data'),
        N8N_DIAGNOSTICS_ENABLED: 'false',
        N8N_VERSION_NOTIFICATIONS_ENABLED: 'false',
        N8N_RUNNERS_BROKER_PORT: '5690',
      },
    },
  );
  return parseAssistantExecution(stdout);
}

export function validateQuestion(input) {
  if (
    !input ||
    Object.keys(input).some((key) => key !== 'question') ||
    typeof input.question !== 'string'
  )
    throw new Error('Envie somente uma pergunta em texto.');
  const question = input.question.trim();
  if (
    question.length < 3 ||
    question.length > 1000 ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(question)
  )
    throw new Error('Escreva uma pergunta entre 3 e 1.000 caracteres.');
  return question;
}

/** Um contexto por execução: a ferramenta vê o mesmo snapshot exibido nos cards. */
export function createAssistantSession({
  token,
  query = runLocalAssistant,
  readSnapshot = async () => assistantPayload(await readArchive()),
  cooldown = 15000,
} = {}) {
  if (!token || token.length < 32) throw new Error('Token interno do acervo necessário.');
  let active = null,
    busy = false,
    lastStarted = 0;
  return {
    authorized(supplied) {
      const value = Buffer.from(String(supplied || '')),
        expected = Buffer.from(token);
      return value.length === expected.length && timingSafeEqual(value, expected);
    },
    input() {
      if (!active) throw new Error('Não há pergunta em execução.');
      return { question: active.question };
    },
    tool(consulta) {
      if (!active || consulta !== 'atendimentos' || active.toolCalls >= 2)
        throw new Error('Consulta não disponível.');
      active.toolCalls++;
      const { period, metrics, criteria, completedWithoutValidDate } = active.snapshot;
      return { source: 'Acervo local de OS', period, metrics, criteria, completedWithoutValidDate };
    },
    async run(question) {
      if (busy || Date.now() - lastStarted < cooldown) {
        const error = new Error(
          'Aguarde a consulta em andamento ou tente novamente em alguns segundos.',
        );
        error.status = 429;
        throw error;
      }
      busy = true;
      lastStarted = Date.now();
      try {
        let snapshot;
        try {
          snapshot = await readSnapshot();
        } catch {
          const error = new Error(failureMessages.ACERVO_READ);
          error.assistantCode = 'ACERVO_READ';
          throw error;
        }
        active = { question, snapshot, toolCalls: 0 };
        const answer = await query();
        return {
          ...answer,
          question,
          consulted: active.toolCalls > 0,
          ...(active.toolCalls ? active.snapshot : {}),
        };
      } finally {
        active = null;
        busy = false;
      }
    },
  };
}

export function localAssistantServer({ verify = verifyLocalSession, session } = {}) {
  if (!session) throw new Error('Sessão interna não configurada.');
  return createServer(async (request, response) => {
    const send = (status, body) => response.writeHead(status).end(JSON.stringify(body));
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const internalUrl = new URL(request.url, 'http://127.0.0.1');
    if (['/v1/assistant/input', '/v1/assistant/tool'].includes(internalUrl.pathname)) {
      if (
        request.method !== 'GET' ||
        request.headers.origin ||
        !session.authorized(request.headers['x-acervo-token'])
      ) {
        send(403, { error: 'Acesso interno negado.' });
        return;
      }
      try {
        if (internalUrl.pathname.endsWith('/input')) {
          if (internalUrl.search) throw Error();
          send(200, session.input());
        } else {
          if (
            [...internalUrl.searchParams.keys()].some((key) => key !== 'consulta') ||
            internalUrl.searchParams.getAll('consulta').length !== 1
          )
            throw Error();
          send(200, session.tool(internalUrl.searchParams.get('consulta')));
        }
      } catch {
        send(409, { error: 'Consulta interna indisponível.' });
      }
      return;
    }
    if (
      request.headers.origin !== assistantOrigin ||
      ![`127.0.0.1:${request.socket.localPort}`, `localhost:${request.socket.localPort}`].includes(
        request.headers.host,
      )
    ) {
      send(403, { error: 'Origem não permitida.' });
      return;
    }
    response.setHeader('Access-Control-Allow-Origin', assistantOrigin);
    response.setHeader('Vary', 'Origin');
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'POST');
      response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      response.setHeader('Access-Control-Allow-Private-Network', 'true');
      response.writeHead(204).end();
      return;
    }
    if (request.method !== 'POST' || request.url !== '/v1/assistant/attendance') {
      send(404, { error: 'Consulta não disponível.' });
      return;
    }
    const token = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || '')?.[1];
    try {
      if (!token) throw new Error();
      await verify(token);
    } catch {
      send(401, { error: 'Sessão local não autorizada. Entre novamente no sistema.' });
      return;
    }
    let question;
    try {
      if (!request.headers['content-type']?.startsWith('application/json')) throw Error();
      const chunks = [];
      let size = 0;
      request.setTimeout(10000, () => request.destroy());
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 8192) throw Error();
        chunks.push(chunk);
      }
      request.setTimeout(0);
      question = validateQuestion(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch {
      send(400, { error: 'Envie somente uma pergunta entre 3 e 1.000 caracteres.' });
      return;
    }
    try {
      send(200, await session.run(question));
    } catch (error) {
      const failure = assistantFailure(error);
      if (error.status !== 429) {
        // Apenas código e horário; conteúdo das perguntas e credenciais não são registrados.
        const runtime =
          process.env.LOCALAPPDATA &&
          join(process.env.LOCALAPPDATA, 'Addlog/n8n-lab/assistant-last-error.json');
        if (runtime)
          await writeFile(
            runtime,
            JSON.stringify({ at: new Date().toISOString(), code: failure.code }),
          ).catch(() => {});
      }
      send(error.status === 429 ? 429 : 503, {
        error: error.status === 429 ? error.message : failure.message,
        ...(error.status !== 429 ? { code: failure.code } : {}),
      });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const token = (
    await readFile(join(process.env.LOCALAPPDATA, 'Addlog/n8n-lab/acervo-token.txt'), 'utf8')
  ).trim();
  localAssistantServer({ session: createAssistantSession({ token }) }).listen(
    5681,
    '127.0.0.1',
    () => console.log('Ponte local do Assistente disponível em 127.0.0.1:5681.'),
  );
}
