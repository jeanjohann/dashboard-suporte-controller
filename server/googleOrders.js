/** Leitura privada do Google Sheets. As credenciais ficam no Worker; nenhum conteúdo é gravado no D1. */
import { SignJWT, importPKCS8 } from 'jose';
import {
  googleOrdersLimits,
  validateGoogleOrdersSnapshot,
} from '../src/shared/data/googleOrdersSnapshot.js';

const tokenUrl = 'https://oauth2.googleapis.com/token';
const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly';

class GoogleOrdersError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function googleRequest(fetchImpl, url, options, stage) {
  let response;
  try {
    response = await fetchImpl(url, options);
  } catch (error) {
    throw new GoogleOrdersError(
      'GOOGLE_CONNECTION',
      error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'O Google demorou demais para responder.'
        : 'Não foi possível conectar ao Google.',
    );
  }
  if (!response.ok) {
    const status = response.status;
    // Não lê nem devolve o corpo de erro: pode conter dados privados.
    await response.body?.cancel().catch(() => {});
    throw new GoogleOrdersError(
      stage === 'auth' ? 'GOOGLE_AUTH' : `GOOGLE_SHEETS_${status}`,
      stage === 'auth'
        ? 'O Google recusou a autenticação. Confira a chave JSON da conta de serviço no segredo do Cloudflare.'
        : status === 403
          ? 'O Google recusou a leitura. Confira a API habilitada no projeto da conta de serviço e o compartilhamento da planilha como Leitor.'
          : status === 404
            ? 'A planilha não foi encontrada ou não está acessível à conta de serviço. Confira o identificador e o compartilhamento.'
            : status === 400
              ? 'O Google recusou a consulta. Confira se o arquivo é uma Planilha Google e se a aba tem o nome configurado.'
              : `A consulta ao Google Sheets falhou (HTTP ${status}).`,
    );
  }
  return response;
}

/** A origem é fixa no servidor: o navegador não pode indicar uma URL ou outra planilha. */
export function googleOrdersConfig(env) {
  const id = env.GOOGLE_ORDERS_SPREADSHEET_ID;
  const sheetName = env.GOOGLE_ORDERS_SHEET || 'OS 2025_26';
  if (
    !/^[a-zA-Z0-9_-]{20,120}$/.test(id || '') ||
    !['OS 2025_26', 'OS 2025'].includes(sheetName) ||
    !env.GOOGLE_SHEETS_CREDENTIALS
  )
    return null;
  return { id, sheetName };
}

/** Limita também a leitura do corpo, inclusive quando o servidor não informa Content-Length. */
async function readJson(response, limit, stage) {
  try {
    return await readLimitedJson(response, limit);
  } catch (error) {
    const reason =
      error.message === 'Resposta muito grande.'
        ? 'A resposta excede o limite permitido.'
        : error.message === 'Resposta indisponível.'
          ? 'O Google não retornou uma resposta JSON válida.'
          : error instanceof SyntaxError
            ? 'O conteúdo retornado não pôde ser interpretado como JSON.'
            : 'Falha ao ler o corpo da resposta no servidor.';
    throw new GoogleOrdersError(
      `GOOGLE_${stage}_RESPONSE`,
      `${stage === 'AUTH' ? 'Autenticação' : 'Leitura da planilha'}: ${reason}`,
    );
  }
}

async function readLimitedJson(response, limit) {
  if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json'))
    throw Error('Resposta indisponível.');
  if (Number(response.headers.get('Content-Length')) > limit) throw Error('Resposta muito grande.');
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw Error('Resposta muito grande.');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Converte apenas campos úteis; erros de fórmula permanecem erros, vazios mantêm sua posição. */
function googleCell(cell) {
  const value = cell.effectiveValue;
  if (!value || !Object.keys(value).length) return null;
  const [key, raw] = Object.entries(value)[0];
  const type = { stringValue: 's', numberValue: 'n', boolValue: 'b', errorValue: 'e' }[key];
  if (!type) throw Error('Tipo de célula desconhecido.');
  return {
    type,
    raw: type === 'e' ? String(raw.type || 'ERROR') : raw,
    display: cell.formattedValue ?? String(type === 'e' ? '#ERROR!' : raw),
    format: cell.effectiveFormat?.numberFormat?.pattern || '',
  };
}

/** Consulta única da aba inteira. Sem cache de conteúdo, delegação de domínio, escrita ou retorno de tokens. */
export async function readGoogleOrders(env, { fetchImpl = fetch } = {}) {
  const config = googleOrdersConfig(env);
  if (!config) throw Error('Conexão com o Google ainda não configurada.');
  let credentials, key;
  try {
    credentials = JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS);
    if (
      !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(credentials.client_email || '') ||
      typeof credentials.private_key !== 'string'
    )
      throw Error('Credencial inválida.');
    key = await importPKCS8(credentials.private_key, 'RS256');
  } catch {
    throw new GoogleOrdersError(
      'GOOGLE_CREDENTIALS',
      'O segredo GOOGLE_SHEETS_CREDENTIALS não contém uma chave JSON válida de conta de serviço. Cadastre o conteúdo completo do arquivo JSON.',
    );
  }
  let assertion;
  try {
    assertion = await new SignJWT({ scope })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(credentials.client_email)
      .setAudience(tokenUrl)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(key);
  } catch {
    throw new GoogleOrdersError('GOOGLE_SIGN', 'Falha ao assinar a autenticação no servidor.');
  }
  const signal = AbortSignal.timeout(25000);
  const auth = await readJson(
    await googleRequest(
      fetchImpl,
      tokenUrl,
      {
        method: 'POST',
        redirect: 'manual',
        signal,
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion,
        }),
      },
      'auth',
    ),
    32 * 1024,
    'AUTH',
  );
  if (typeof auth.access_token !== 'string' || !auth.access_token)
    throw new GoogleOrdersError('GOOGLE_TOKEN', 'O Google não retornou um token de acesso válido.');
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${config.id}`);
  url.searchParams.set('ranges', `'${config.sheetName}'`);
  url.searchParams.set(
    'fields',
    'sheets(properties(title),data(startRow,startColumn,rowData(values(effectiveValue,formattedValue,effectiveFormat(numberFormat)))))',
  );
  const book = await readJson(
    await googleRequest(
      fetchImpl,
      url.toString(),
      {
        headers: { Authorization: `Bearer ${auth.access_token}` },
        redirect: 'manual',
        signal,
      },
      'sheets',
    ),
    googleOrdersLimits.bytes,
    'SHEETS',
  );
  // ranges restringe os dados, mas o Google pode retornar os metadados das demais abas.
  const matchingSheets = book.sheets?.filter(
    (sheet) => sheet.properties?.title === config.sheetName,
  );
  const sheet = matchingSheets?.[0];
  const grid = sheet?.data?.[0];
  if (
    matchingSheets?.length !== 1 ||
    sheet.data?.length !== 1 ||
    (grid.startRow || 0) !== 0 ||
    (grid.startColumn || 0) !== 0 ||
    !Array.isArray(grid.rowData) ||
    grid.rowData.length > googleOrdersLimits.rows
  )
    throw new GoogleOrdersError(
      'GOOGLE_GRID',
      'O Google respondeu, mas os dados da aba de OS estão ausentes, incompletos ou excedem o limite de linhas.',
    );
  try {
    return validateGoogleOrdersSnapshot({
      version: 1,
      sheetName: config.sheetName,
      readAt: new Date().toISOString(),
      rows: grid.rowData.map((row) => (row.values || []).map(googleCell)),
    });
  } catch {
    throw new GoogleOrdersError(
      'GOOGLE_FORMAT',
      'A aba foi lida, mas não tem o formato de OS esperado. Confira os limites e o cabeçalho na primeira linha: número da OS, Status e Data de atendimento.',
    );
  }
}

/** Chamado somente depois da autenticação e da autorização de administrador no roteador. */
export async function googleOrdersResponse(request, env, read = readGoogleOrders) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  const reply = (body, status = 200) => Response.json(body, { status, headers });
  if (request.method !== 'GET') return reply({ error: 'Método não permitido.' }, 405);
  if (new URL(request.url).pathname.endsWith('/status'))
    return reply({
      configured: !!googleOrdersConfig(env),
      sheetName: env.GOOGLE_ORDERS_SHEET || 'OS 2025_26',
    });
  if (!googleOrdersConfig(env))
    return reply({ error: 'Conexão com o Google ainda não configurada no servidor.' }, 503);
  try {
    return reply(await read(env));
  } catch (error) {
    // Nunca devolver corpo do Google, detalhes da chave ou tokens ao navegador ou ao log.
    // Apenas a posição no código, sem a mensagem/primeira linha da pilha (que pode conter segredos).
    const position = String(error?.stack || '').match(/(?:worker|googleOrders)\.js:(\d+):(\d+)/);
    const diagnostic = position ? `L${position[1]}:${position[2]}` : 'sem posição';
    return reply(
      {
        code: error instanceof GoogleOrdersError ? error.code : 'GOOGLE_UNKNOWN',
        error:
          error instanceof GoogleOrdersError
            ? `${error.message} A base anterior foi mantida.`
            : `Falha interna na consulta Google [G2 ${diagnostic}]. A base anterior foi mantida.`,
      },
      502,
    );
  }
}
