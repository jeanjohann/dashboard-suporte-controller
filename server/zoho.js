/** Piloto Zoho somente leitura. Segredos e tokens permanecem no Worker. */
const accountUrl = 'https://accounts.zoho.com/oauth/v2/token';
const apiRoot = 'https://desk.zoho.com/api/v1';
const idPattern = /^\d{1,40}$/;
const maxBytes = 2 * 1024 * 1024;
const pageSize = 50;

class ZohoError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
export function zohoConfigured(env) {
  return (
    idPattern.test(env.ZOHO_ORG_ID || '') &&
    ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'].every(
      (name) => typeof env[name] === 'string' && !!env[name].trim(),
    )
  );
}
const failure = (stage, message) => new ZohoError(`ZOHO_${stage}`, message);
const text = (value, limit = 200) => (typeof value === 'string' ? value.slice(0, limit) : '');
const id = (value) => (typeof value === 'string' && idPattern.test(value) ? value : null);

async function readJson(response, stage) {
  if (!response.headers.get('Content-Type')?.includes('application/json') || !response.body)
    throw failure(stage, 'O Zoho retornou uma resposta em formato inesperado.');
  if (Number(response.headers.get('Content-Length')) > maxBytes) {
    await response.body.cancel().catch(() => {});
    throw failure(stage, 'A resposta do Zoho excedeu o limite de leitura do piloto.');
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes)
        throw failure(stage, 'A resposta do Zoho excedeu o limite de leitura do piloto.');
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
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw failure(stage, 'Não foi possível interpretar a resposta do Zoho.');
  }
}

/** Cache efêmero de autenticação, isolado por credencial e organização; não persiste dados do Desk. */
export function createZohoReader({ fetchImpl = fetch, now = Date.now } = {}) {
  let current;
  async function request(url, options, stage) {
    let response;
    try {
      response = await fetchImpl(url, { ...options, redirect: 'manual' });
    } catch {
      throw failure(stage, 'Não foi possível conectar ao Zoho ou a consulta demorou demais.');
    }
    if (response.status === 204) return { data: [] };
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      if (response.status === 401 && current) current.token = null;
      const message =
        response.status === 429
          ? 'O Zoho atingiu um limite de chamadas. Aguarde antes de consultar novamente.'
          : response.status === 401
            ? 'O Zoho recusou a autenticação. Confira cliente, token de renovação e região da conta.'
            : response.status === 403
              ? 'O Zoho recusou a leitura. Confira as permissões do token e o acesso à organização.'
              : response.status === 404
                ? 'O recurso não foi encontrado no Zoho. Confira organização e região da conta.'
                : `O Zoho não concluiu a consulta (HTTP ${response.status}).`;
      throw failure(stage, message);
    }
    return readJson(response, stage);
  }
  async function accessToken(env, signal) {
    const key = [
      env.ZOHO_ORG_ID,
      env.ZOHO_CLIENT_ID,
      env.ZOHO_CLIENT_SECRET,
      env.ZOHO_REFRESH_TOKEN,
    ].join('\0');
    if (!current || current.key !== key)
      current = { key, token: null, expiresAt: 0, pending: null };
    const state = current;
    if (state.token && now() < state.expiresAt) return state.token;
    if (!state.pending) {
      state.pending = (async () => {
        const result = await request(
          accountUrl,
          {
            method: 'POST',
            signal,
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: env.ZOHO_CLIENT_ID,
              client_secret: env.ZOHO_CLIENT_SECRET,
              refresh_token: env.ZOHO_REFRESH_TOKEN,
            }),
          },
          'AUTH',
        );
        if (
          !result ||
          result.error ||
          typeof result.access_token !== 'string' ||
          !result.access_token ||
          /[\r\n]/.test(result.access_token)
        )
          throw failure(
            'AUTH',
            'O Zoho não renovou o acesso. Confira os segredos, o token de renovação e a região da conta.',
          );
        const seconds = Number(result.expires_in);
        if (!Number.isFinite(seconds) || seconds <= 0)
          throw failure('AUTH', 'O Zoho retornou uma validade de autenticação inválida.');
        state.token = result.access_token;
        state.expiresAt = now() + Math.max(0, Math.min(seconds, 3600) - 60) * 1000;
        return state.token;
      })();
    }
    try {
      return await state.pending;
    } finally {
      state.pending = null;
    }
  }
  return async function readZoho(env) {
    if (!zohoConfigured(env))
      throw failure('CONFIG', 'A conexão Zoho ainda precisa ser configurada no servidor.');
    const signal = AbortSignal.timeout(25000);
    const token = await accessToken(env, signal);
    const options = {
      method: 'GET',
      signal,
      headers: { Authorization: `Zoho-oauthtoken ${token}`, orgId: env.ZOHO_ORG_ID },
    };
    const organization = await request(
      `${apiRoot}/organizations/${env.ZOHO_ORG_ID}`,
      options,
      'ORGANIZATION',
    );
    if (!organization || id(organization.id) !== env.ZOHO_ORG_ID)
      throw failure(
        'ORGANIZATION',
        'A organização retornada pelo Zoho não corresponde à configurada.',
      );
    const agents = new Map();
    let agentsComplete = false;
    for (let page = 0; page < 4; page++) {
      const result = await request(
        `${apiRoot}/agents?from=${1 + page * pageSize}&limit=${pageSize}`,
        options,
        'AGENTS',
      );
      if (!Array.isArray(result?.data) || result.data.length > pageSize)
        throw failure('AGENTS', 'A listagem de agentes do Zoho está em formato inesperado.');
      for (const agent of result.data) {
        if (!agent || !id(agent.id) || agents.has(agent.id))
          throw failure(
            'AGENTS',
            'A listagem de agentes contém identificadores inválidos ou repetidos. Tente novamente.',
          );
        agents.set(agent.id, {
          id: agent.id,
          name:
            [text(agent.firstName), text(agent.lastName)].filter(Boolean).join(' ') ||
            'Nome indisponível',
          email: text(agent.emailId),
          status: text(agent.status),
        });
      }
      if (result.data.length < pageSize) {
        agentsComplete = true;
        break;
      }
    }
    const result = await request(
      `${apiRoot}/tickets?from=1&limit=${pageSize}&sortBy=-createdTime`,
      options,
      'TICKETS',
    );
    if (!Array.isArray(result?.data) || result.data.length > pageSize)
      throw failure('TICKETS', 'A listagem de chamados do Zoho está em formato inesperado.');
    const tickets = new Map();
    for (const ticket of result.data) {
      if (!ticket || !id(ticket.id) || tickets.has(ticket.id))
        throw failure(
          'TICKETS',
          'A listagem de chamados contém identificadores inválidos ou repetidos. Tente novamente.',
        );
      tickets.set(ticket.id, {
        id: ticket.id,
        number: text(ticket.ticketNumber, 50),
        subject: text(ticket.subject, 300),
        status: text(ticket.status),
        assigneeId: id(ticket.assigneeId),
        departmentId: id(ticket.departmentId),
        createdTime:
          typeof ticket.createdTime === 'string' && Number.isFinite(Date.parse(ticket.createdTime))
            ? ticket.createdTime
            : null,
      });
    }
    return {
      version: 1,
      readAt: new Date(now()).toISOString(),
      organization: { id: env.ZOHO_ORG_ID, name: text(organization.companyName) || 'Addlog' },
      agents: [...agents.values()],
      tickets: [...tickets.values()],
      coverage: {
        agentsComplete,
        agentLimit: 200,
        ticketLimit: pageSize,
        ticketsComplete: result.data.length < pageSize,
        order: 'createdTime:desc',
      },
    };
  };
}
const readZoho = createZohoReader();
export async function zohoResponse(request, env, read = readZoho) {
  const reply = (body, status = 200) =>
    Response.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  if (request.method !== 'GET') return reply({ error: 'Método não permitido.' }, 405);
  if (new URL(request.url).pathname === '/api/zoho/status')
    return reply({ configured: zohoConfigured(env) });
  if (!zohoConfigured(env))
    return reply(
      { error: 'A conexão Zoho ainda precisa ser configurada no servidor.', code: 'ZOHO_CONFIG' },
      503,
    );
  try {
    return reply(await read(env));
  } catch (error) {
    return reply(
      {
        code: error instanceof ZohoError ? error.code : 'ZOHO_UNKNOWN',
        error: `${error instanceof ZohoError ? error.message : 'Não foi possível concluir a consulta ao Zoho.'} A leitura anterior foi mantida.`,
      },
      502,
    );
  }
}
