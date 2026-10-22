/** Piloto KORE/Saitro: uma página por consulta, autenticação e encerramento apenas do token desta leitura. */
import { normalizeKorePage } from '../src/modules/consumption/data/koreContract.js';

const origin = 'https://kore.saitro.com';
const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
const configured = (env) =>
  Boolean(env.KORE_API_USERNAME && env.KORE_API_PASSWORD && env.KORE_API_LIMITER);
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const integer = (value) => Number.isSafeInteger(value) && value >= 0;

async function readJson(response, max = 1024 * 1024, allowHttpError = false) {
  if (
    (!response.ok && !allowHttpError) ||
    !response.headers.get('Content-Type')?.includes('application/json')
  )
    throw Error(`upstream_${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw Error('empty');
  const decoder = new TextDecoder();
  let text = '',
    bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > max) {
        await reader.cancel();
        throw Error('size');
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
const privateUrl = (path, env) => {
  const url = new URL(path, origin);
  url.searchParams.set('username', env.KORE_API_USERNAME);
  url.searchParams.set('password', env.KORE_API_PASSWORD);
  return url;
};

/** Reconstitui paginação sem seguir links do fornecedor, que podem conter credenciais ou destinos inesperados. */
export function mapKorePage(input, page, readAt = new Date().toISOString()) {
  if (
    !object(input) ||
    !object(input.meta) ||
    input.meta.pagina !== page ||
    !integer(input.meta.total_registros) ||
    !integer(input.meta.total_registros_pagina) ||
    !Array.isArray(input.objetos) ||
    input.objetos.length > input.meta.total_registros_pagina ||
    !(input.meta.proxima == null || typeof input.meta.proxima === 'string')
  )
    throw Error('contract');
  let hasNext = false;
  if (input.meta.proxima) {
    const next = new URL(input.meta.proxima, origin);
    if (
      next.origin !== origin ||
      next.pathname !== '/api/simcards/' ||
      next.username ||
      next.password ||
      next.hash ||
      next.searchParams.get('pagina') !== String(page + 1)
    )
      throw Error('pagination');
    hasNext = true;
  }
  const id = (value) => {
    if (typeof value === 'string') return value;
    if (integer(value)) return String(value);
    throw Error('id');
  };
  const text = (value) => (value === '' ? null : value);
  return normalizeKorePage({
    schemaVersion: 1,
    source: 'kore-saitro',
    period: 'unconfirmed',
    page,
    totalReported: input.meta.total_registros,
    hasNext,
    readAt,
    rows: input.objetos.map((row) => {
      if (!object(row)) throw Error('row');
      const data = row.servicos?.dados;
      if (data != null && !object(data)) throw Error('data');
      return {
        id: id(row.id_simcard),
        iccid: text(row.iccid),
        number: text(row.msisdn),
        bytes: data?.consumo_bytes ?? null,
        operator: text(row.operadora),
        status: text(row.status),
        connection: text(row.conexao),
        lastAccess: text(row.ultimo_acesso),
        apn: text(row.ultima_apn),
        technology: text(row.tecnologia),
        dataProvisioned: data?.aprovisionado ?? null,
        dataBlocked: data?.bloqueado ?? null,
        functionalBlock: row.bloqueio_funcional ?? null,
        administrativeBlock: row.bloqueio_administrativo ?? null,
        suspended: row.suspensao ?? null,
      };
    }),
  });
}

export async function koreResponse(request, env, fetcher = fetch) {
  if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);
  const url = new URL(request.url);
  if (url.pathname.endsWith('/status'))
    return json({ configured: configured(env), source: 'kore-saitro', period: 'unconfirmed' });
  if (!configured(env)) return json({ error: 'O acesso à KORE ainda não está configurado.' }, 503);
  const pageText = url.searchParams.get('pagina') ?? '1';
  if (
    [...url.searchParams.keys()].some((key) => key !== 'pagina') ||
    url.searchParams.getAll('pagina').length > 1 ||
    !/^[1-9]\d{0,5}$/.test(pageText)
  )
    return json({ error: 'Página de consulta inválida.' }, 400);
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 18000);
  let token = null,
    stage = 'authentication',
    output = null;
  try {
    if (!(await env.KORE_API_LIMITER.limit({ key: 'kore-lines-pilot' })).success)
      return json({ error: 'Aguarde um minuto entre consultas à KORE.' }, 429);
    const grantResponse = await fetcher(privateUrl('/api/token/', env), {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const grant = await readJson(grantResponse, 65536, true);
    if (!grantResponse.ok) {
      if (grantResponse.status === 403 && grant.error_code === 2000) {
        stage = 'token_wait';
        throw Error('token_wait');
      }
      if (grantResponse.status === 403 && grant.error_code === 2001) {
        stage = 'active_token';
        throw Error('active_token');
      }
      throw Error(`upstream_${grantResponse.status}`);
    }
    if (
      typeof grant.token !== 'string' ||
      !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(grant.token)
    )
      throw Error('grant');
    token = grant.token;
    if (
      typeof grant.Authorization !== 'string' ||
      !/^Basic [A-Za-z0-9+/]+={0,2}$/.test(grant.Authorization) ||
      atob(grant.Authorization.slice(6)) !== `${env.KORE_API_USERNAME}:${token}`
    )
      throw Error('grant');
    stage = 'reading';
    const pageUrl = new URL('/api/simcards/', origin);
    pageUrl.searchParams.set('pagina', pageText);
    const body = await readJson(
      await fetcher(pageUrl, {
        method: 'GET',
        redirect: 'manual',
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json', Authorization: grant.Authorization },
      }),
    );
    stage = 'contract';
    output = mapKorePage(body, Number(pageText));
    output.cleanupConfirmed = false;
  } catch (failure) {
    // Apenas códigos internos e status HTTP; nunca registrar URL, corpo ou autenticação.
    const reason =
      /^(upstream_\d{3}|token_wait|active_token|empty|size|grant|contract|pagination|id|row|data)$/.test(
        failure?.message,
      )
        ? failure.message
        : 'transport_or_shape';
    console.warn(`KORE_DIAGNOSTIC ${stage} ${reason}`);
    const messages = {
      token_wait:
        'A KORE exige aguardar 10 minutos antes de gerar um novo token. Tente novamente após esse intervalo.',
      active_token:
        'Já existe um token ativo para esta conta KORE. O administrador precisa encerrar o token anterior antes de uma nova consulta.',
      authentication:
        'A KORE não autorizou a autenticação. Confira a liberação da conta, rede e token ativo.',
      reading: 'Não foi possível consultar esta página da KORE.',
      contract: 'A KORE retornou uma página incompatível ou incompleta.',
    };
    return json(
      { code: `kore_${stage}`, error: messages[stage] || 'Não foi possível consultar a KORE.' },
      502,
    );
  } finally {
    clearTimeout(timer);
    if (token) {
      try {
        const reply = await readJson(
          await fetcher(privateUrl(`/api/token/disable/${token}/`, env), {
            method: 'GET',
            redirect: 'manual',
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
            headers: { Accept: 'application/json' },
          }),
          65536,
        );
        if (reply.status !== 'OK') throw Error('cleanup');
        if (output) output.cleanupConfirmed = true;
      } catch {
        console.warn('KORE_DIAGNOSTIC cleanup failed');
      }
    }
  }
  return output
    ? json(output)
    : json(
        {
          code: 'kore_cleanup',
          error:
            'A leitura não foi concluída porque a KORE não confirmou o encerramento do token desta consulta.',
        },
        502,
      );
}
