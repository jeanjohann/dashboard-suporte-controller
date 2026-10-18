/** Ponte do piloto: loopback, origem fixa, JWT Access verificado e proprietário fixo. Sem tokens em logs. */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const assistantOrigin = 'https://dashboard-suporte-controller.jean-johann.workers.dev';
const issuer = 'https://small-grass-95ae.cloudflareaccess.com';
const audience = '2e8bc40b094fc274b05494926b0395e1df8bd5f573b76815f7e1626b5567a579';
const owner = 'jeancjohann@gmail.com';
const keys = createRemoteJWKSet(new URL(issuer + '/cdn-cgi/access/certs'));
const execute = promisify(execFile);

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

/** Retorna só o resultado esperado; stdout bruto pode conter metadados internos e nunca sai da ponte. */
export function parseAssistantExecution(stdout) {
  const start = stdout.search(/^\{\s*$/m);
  if (start < 0) throw new Error('Resposta do n8n ausente.');
  const execution = JSON.parse(stdout.slice(start).trim());
  const result = execution.data?.resultData;
  if (execution.status !== 'success' || result?.error) throw new Error('Consulta não concluída.');
  const snapshot = result.runData?.['Totais locais de OS']?.at(-1)?.data?.main?.[0]?.[0]?.json;
  const text =
    result.runData?.['Explicar totais do acervo']?.at(-1)?.data?.main?.[0]?.[0]?.json?.text;
  if (!snapshot?.metrics || typeof text !== 'string' || !text.trim() || text.length > 12000)
    throw new Error('Resultado incompleto.');
  return { ...snapshot, answer: text };
}

export async function runLocalAssistant() {
  const runtime = join(process.env.LOCALAPPDATA, 'Addlog/n8n-lab');
  const { stdout } = await execute(
    process.execPath,
    [
      join(runtime, 'node_modules/n8n/bin/n8n'),
      'execute',
      '--id=labAssistantLive01',
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

export function localAssistantServer({
  verify = verifyLocalSession,
  query = runLocalAssistant,
} = {}) {
  let busy = false;
  let lastStarted = 0;
  return createServer(async (request, response) => {
    const send = (status, body) => response.writeHead(status).end(JSON.stringify(body));
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
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
    // Sem parâmetros: nenhuma pergunta livre, caminho de arquivo ou comando é aceito.
    if (
      request.headers['transfer-encoding'] ||
      Number(request.headers['content-length'] || 0) > 0
    ) {
      send(400, { error: 'Esta consulta não recebe parâmetros.' });
      return;
    }
    if (busy || Date.now() - lastStarted < 15000) {
      send(429, {
        error: 'Aguarde a consulta em andamento ou tente novamente em alguns segundos.',
      });
      return;
    }
    busy = true;
    lastStarted = Date.now();
    try {
      send(200, await query());
    } catch {
      send(503, {
        error:
          'Não foi possível concluir a consulta. Confira o acervo, o n8n e a disponibilidade do Gemini.',
      });
    } finally {
      busy = false;
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  localAssistantServer().listen(5681, '127.0.0.1', () =>
    console.log('Ponte local do Assistente disponível em 127.0.0.1:5681.'),
  );
}
