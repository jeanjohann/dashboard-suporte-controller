/**
 * API de usuários do Worker. Autentica a identidade e autoriza cada operação no servidor.
 * Arquivos manuais continuam locais; o piloto Google consulta uma aba privada somente para administradores.
 * A porta de telemetria usa serviço privado, sem coletor configurado nem armazenamento de frota nesta entrega.
 */
import { usersSchema } from './schema.js';
import { monitoringResponse } from './monitoring.js';
import { googleOrdersResponse } from './googleOrders.js';
import { zohoResponse } from './zoho.js';
import { koreResponse } from './kore.js';
import { businessRemindersResponse } from './businessReminders.js';
import { businessSourcesResponse } from './businessSources.js';
import { supportIndicatorsResponse } from './supportIndicators.js';
import { storedMonitoringResponse, scheduledMonitoring } from './monitoringStorage.js';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import {
  normalizeEmail,
  validEmail,
  moduleKeys,
  validateUser,
} from '../src/shared/security/permissions.js';
const keySets = new Map();
/** Valida assinatura, emissor, audiência e validade do JWT do Access; um cabeçalho de e-mail isolado não autoriza. */
export async function authenticatedEmail(request, env, keySet) {
  const issuer = env.ACCESS_ISSUER,
    audience = env.ACCESS_AUD;
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer || '') || !audience)
    throw Error('Configuração de autenticação incompleta.');
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) throw Error('Autenticação necessária.');
  if (!keySet) {
    if (!keySets.has(issuer))
      keySets.set(issuer, createRemoteJWKSet(new URL(issuer + '/cdn-cgi/access/certs')));
    keySet = keySets.get(issuer);
  }
  const { payload } = await jwtVerify(token, keySet, {
    issuer,
    audience,
    algorithms: ['RS256'],
    requiredClaims: ['exp', 'iat', 'sub', 'email'],
  });
  const email = normalizeEmail(payload.email);
  if (!validEmail(email)) throw Error('Identidade inválida.');
  return email;
}
const reply = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
/** Converte o registro D1 para o contrato de usuário usado pela interface e pelas permissões. */
export function recordUser(row) {
  return row
    ? {
        email: row.email,
        role: row.role,
        active: Boolean(row.active),
        pages: JSON.parse(row.pages),
        canImport: Boolean(row.can_import),
        canExport: Boolean(row.can_export),
        canDashboard: row.can_dashboard == null ? null : Boolean(row.can_dashboard),
        version: row.version,
        updatedAt: row.updated_at,
      }
    : null;
}
/** Cria o roteador da API; a função de autenticação pode ser injetada nos testes, mantendo o JWT como padrão de produção. */
export function createHandler(authenticate = authenticatedEmail) {
  return async (request, env) => {
    const url = new URL(request.url);
    // Os arquivos estáticos também exigem a política Access de todo o Worker, configurada no Cloudflare.
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (
      !env.USERS_DB ||
      !env.ACCESS_AUD ||
      !env.ACCESS_ISSUER ||
      !validEmail(normalizeEmail(env.BOOTSTRAP_ADMIN))
    )
      return reply({ error: 'Configuração de usuários pendente.' }, 503);
    let email;
    try {
      email = await authenticate(request, env);
    } catch {
      return reply({ error: 'Sessão inválida. Entre novamente pelo Cloudflare Access.' }, 401);
    }
    try {
      // Inicialização idempotente da tabela. Alterações futuras exigem migração explícita.
      await env.USERS_DB.prepare(usersSchema).run();
      const owner = normalizeEmail(env.BOOTSTRAP_ADMIN);
      if (email === owner)
        await env.USERS_DB.prepare(
          "INSERT OR IGNORE INTO app_users (email,role,active,pages,can_import,can_export,version,updated_at,updated_by) VALUES (?,'admin',1,?,1,1,1,?,?)",
        )
          .bind(owner, JSON.stringify(moduleKeys), new Date().toISOString(), owner)
          .run();
      const row = await env.USERS_DB.prepare('SELECT * FROM app_users WHERE email = ?')
          .bind(email)
          .first(),
        user = recordUser(row);
      if (!user?.active)
        return reply(
          { error: 'Seu acesso ao sistema ainda não foi liberado ou está suspenso.' },
          403,
        );
      if (url.pathname === '/api/me' && request.method === 'GET') return reply({ user });
      if (url.pathname.startsWith('/api/support-indicators/'))
        return supportIndicatorsResponse(request, env, user, owner);
      if (url.pathname.startsWith('/api/sources/'))
        return businessSourcesResponse(request, env, user, owner);
      if (
        [
          '/api/monitoring/saved',
          '/api/monitoring/refresh',
          '/api/monitoring/history',
          '/api/monitoring/events',
        ].includes(url.pathname)
      )
        return storedMonitoringResponse(request, env, user, owner);
      if (
        [
          '/api/business/status',
          '/api/monitoring/reminders',
          '/api/monitoring/reminders/import',
        ].includes(url.pathname)
      ) {
        return businessRemindersResponse(request, env, user, owner);
      }
      if (['/api/zoho/status', '/api/zoho/snapshot', '/api/zoho/activity'].includes(url.pathname)) {
        if (user.role !== 'admin' || email !== owner)
          return reply(
            { error: 'O piloto Zoho está disponível somente para o administrador principal.' },
            403,
          );
        return zohoResponse(request, env);
      }
      // Piloto local vinculado ao proprietário: a asserção assinada só segue para o seu loopback.
      if (url.pathname === '/api/assistant/local-session') {
        if (user.role !== 'admin' || email !== owner)
          return reply(
            { error: 'O piloto local está disponível somente para o administrador principal.' },
            403,
          );
        if (request.method !== 'POST') return reply({ error: 'Método não permitido.' }, 405);
        if (request.headers.get('Origin') !== url.origin)
          return reply({ error: 'Origem não permitida.' }, 403);
        const assertion = request.headers.get('Cf-Access-Jwt-Assertion');
        if (!assertion) return reply({ error: 'Sessão Access ausente.' }, 401);
        return reply({ assertion });
      }
      if (
        [
          '/api/orders/google/status',
          '/api/orders/google/snapshot',
          '/api/operational/google/status',
          '/api/operational/google/snapshot',
        ].includes(url.pathname)
      ) {
        if (user.role !== 'admin')
          return reply(
            { error: 'O piloto Google Sheets está disponível apenas para administradores.' },
            403,
          );
        return googleOrdersResponse(
          request,
          env,
          undefined,
          url.pathname.startsWith('/api/operational/') ? 'operational' : 'orders',
        );
      }
      if (
        [
          '/api/consumption/kore/status',
          '/api/consumption/kore/page',
          '/api/consumption/kore/batch',
        ].includes(url.pathname)
      ) {
        if (user.role !== 'admin')
          return reply(
            { error: 'O piloto KORE está disponível somente para administradores.' },
            403,
          );
        return koreResponse(request, env);
      }
      if (url.pathname === '/api/monitoring/snapshot') {
        if (user.role !== 'admin' && !user.pages.includes('monitoring'))
          return reply({ error: 'Acesso ao monitoramento não autorizado.' }, 403);
        return monitoringResponse(request, env);
      }
      if (url.pathname !== '/api/admin/users') return reply({ error: 'Rota não encontrada.' }, 404);
      if (user.role !== 'admin')
        return reply({ error: 'Somente administradores podem gerir usuários.' }, 403);
      if (request.method === 'GET') {
        const result = await env.USERS_DB.prepare('SELECT * FROM app_users ORDER BY email').all();
        return reply({ users: result.results.map(recordUser), owner });
      }
      if (request.method !== 'PUT') return reply({ error: 'Método não permitido.' }, 405);
      if (request.headers.get('Origin') !== url.origin)
        return reply({ error: 'Origem não permitida.' }, 403);
      if (!request.headers.get('Content-Type')?.startsWith('application/json'))
        return reply({ error: 'Envie somente o cadastro JSON.' }, 415);
      const body = await request.text();
      if (new TextEncoder().encode(body).length > 8192)
        return reply({ error: 'Cadastro muito grande.' }, 413);
      let input;
      try {
        input = validateUser(JSON.parse(body));
      } catch (e) {
        return reply({ error: e.message }, 400);
      }
      if (input.email === owner && (input.role !== 'admin' || !input.active))
        return reply(
          { error: 'O administrador principal não pode ser suspenso ou rebaixado.' },
          400,
        );
      if (input.email === email && (input.role !== 'admin' || !input.active))
        return reply({ error: 'Você não pode suspender ou rebaixar seu próprio acesso.' }, 400);
      // A versão no WHERE impede que duas sessões sobrescrevam permissões silenciosamente.
      const now = new Date().toISOString();
      const statement =
        input.version === 0
          ? env.USERS_DB.prepare(
              'INSERT OR IGNORE INTO app_users (email,role,active,pages,can_import,can_export,version,updated_at,updated_by,can_dashboard) VALUES (?,?,?,?,?,?,1,?,?,?)',
            ).bind(
              input.email,
              input.role,
              +input.active,
              JSON.stringify(input.pages),
              +input.canImport,
              +input.canExport,
              now,
              email,
              input.canDashboard == null ? null : +input.canDashboard,
            )
          : env.USERS_DB.prepare(
              'UPDATE app_users SET role=?,active=?,pages=?,can_import=?,can_export=?,version=version+1,updated_at=?,updated_by=?,can_dashboard=CASE WHEN ? THEN ? ELSE can_dashboard END WHERE email=? AND version=?',
            ).bind(
              input.role,
              +input.active,
              JSON.stringify(input.pages),
              +input.canImport,
              +input.canExport,
              now,
              email,
              Object.hasOwn(input, 'canDashboard') ? 1 : 0,
              input.canDashboard == null ? null : +input.canDashboard,
              input.email,
              input.version,
            );
      const result = await statement.run();
      if (!result.meta.changes)
        return reply(
          { error: 'Cadastro alterado por outra sessão. Atualize a lista antes de salvar.' },
          409,
        );
      return reply({ saved: true });
    } catch {
      return reply(
        { error: 'Não foi possível consultar ou salvar as permissões. Tente novamente.' },
        503,
      );
    }
  };
}
export default { fetch: createHandler(), scheduled: scheduledMonitoring };
