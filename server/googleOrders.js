/** Leitura privada do Google Sheets. As credenciais ficam no Worker; nenhum conteúdo é gravado no D1. */
import { SignJWT, importPKCS8 } from 'jose';
import {
  googleOrdersLimits,
  validateGoogleOrdersSnapshot,
} from '../src/shared/data/googleOrdersSnapshot.js';

const tokenUrl = 'https://oauth2.googleapis.com/token';
const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly';

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
async function readJson(response, limit) {
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
  const credentials = JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS);
  if (
    !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(credentials.client_email || '') ||
    typeof credentials.private_key !== 'string'
  )
    throw Error('Credencial inválida.');
  const key = await importPKCS8(credentials.private_key, 'RS256');
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(credentials.client_email)
    .setAudience(tokenUrl)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(key);
  const signal = AbortSignal.timeout(25000);
  const auth = await readJson(
    await fetchImpl(tokenUrl, {
      method: 'POST',
      redirect: 'error',
      signal,
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    }),
    32 * 1024,
  );
  if (typeof auth.access_token !== 'string' || !auth.access_token)
    throw Error('Token não disponível.');
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${config.id}`);
  url.searchParams.set('ranges', `'${config.sheetName}'`);
  url.searchParams.set(
    'fields',
    'sheets(properties(title),data(startRow,startColumn,rowData(values(effectiveValue,formattedValue,effectiveFormat(numberFormat)))))',
  );
  const book = await readJson(
    await fetchImpl(url.toString(), {
      headers: { Authorization: `Bearer ${auth.access_token}` },
      redirect: 'error',
      signal,
    }),
    googleOrdersLimits.bytes,
  );
  const sheet = book.sheets?.[0];
  const grid = sheet?.data?.[0];
  if (
    book.sheets?.length !== 1 ||
    sheet.properties.title !== config.sheetName ||
    sheet.data?.length !== 1 ||
    (grid.startRow || 0) !== 0 ||
    (grid.startColumn || 0) !== 0 ||
    !Array.isArray(grid.rowData) ||
    grid.rowData.length > googleOrdersLimits.rows
  )
    throw Error('Aba inesperada ou leitura incompleta.');
  return validateGoogleOrdersSnapshot({
    version: 1,
    sheetName: config.sheetName,
    readAt: new Date().toISOString(),
    rows: grid.rowData.map((row) => (row.values || []).map(googleCell)),
  });
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
  } catch {
    // Nunca devolver corpo do Google, detalhes da chave ou tokens ao navegador ou ao log.
    return reply(
      {
        error:
          'Não foi possível atualizar as OS pelo Google. Confira a configuração, a permissão de leitura e o nome da aba. A base anterior foi mantida.',
      },
      502,
    );
  }
}
