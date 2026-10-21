/** Site documental independente: senha compartilhada, sessão curta e nenhum binding de dados do sistema. */
import { SignJWT, jwtVerify } from 'jose';

const cookieName = '__Host-addlog-map';
const duration = 8 * 60 * 60;
const policy =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const headers = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Content-Security-Policy': policy,
};
const cookie = (value, age = duration) =>
  `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const respond = (body, status = 200, extra = {}) =>
  new Response(body, { status, headers: { ...headers, ...extra } });
const loginPage = (
  message = '',
) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Addlog · Acesso ao mapa</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef3f5;color:#19333b;font:15px/1.65 system-ui,sans-serif;padding:24px}main{width:min(100%,430px);background:white;padding:36px;border:1px solid #dce5e7;border-radius:18px;box-shadow:0 18px 60px #1233420a}.mark{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:#12695f;color:white;font-size:25px;margin-bottom:22px}.eyebrow{font-size:10px;font-weight:750;letter-spacing:1.5px;color:#12695f}h1{font-size:27px;letter-spacing:-.7px;line-height:1.2;margin:10px 0 15px}p{color:#5c7079;font-size:13px}label{display:block;font-size:12px;font-weight:650;margin-top:26px}input{display:block;width:100%;padding:13px;border:1px solid #bcced4;border-radius:7px;margin-top:8px;font:inherit}input:focus-visible,button:focus-visible{outline:2px solid #12695f;outline-offset:3px}button{width:100%;border:0;border-radius:7px;padding:13px;background:#12695f;color:white;font:600 13px system-ui;cursor:pointer;margin:17px 0 5px}.error{background:#fff0ea;color:#a33220;border-radius:6px;padding:12px;margin-top:16px}small{display:block;color:#70818a;font-size:11px;margin-top:22px;border-top:1px solid #e3e9eb;padding-top:18px}</style></head><body><main><div class="mark" aria-hidden="true">▦</div><span class="eyebrow">ADDLOG · DOCUMENTAÇÃO</span><h1>Mapa de arquitetura</h1><p>Explore a estrutura, os módulos e as conexões do sistema.</p><form action="/login" method="post"><label>Senha de acesso<input name="password" type="password" required maxlength="256" autocomplete="current-password" autofocus></label>${message ? `<p class="error" role="alert">${message}</p>` : ''}<button type="submit">Acessar mapa</button></form><small>Acesso por senha compartilhada, sem cadastro. Esta página apresenta somente a documentação técnica.</small></main></body></html>`;

async function digest(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}
async function matches(actual, expected) {
  const [left, right] = await Promise.all([digest(actual), digest(expected)]);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}
function readCookie(request) {
  const values = (request.headers.get('Cookie') || '')
    .split(';')
    .map((value) => value.trim())
    .filter((value) => value.startsWith(cookieName + '='));
  return values.length === 1 ? values[0].slice(cookieName.length + 1) : '';
}
async function sessionKey(env) {
  return digest(`${env.MAP_SESSION_SECRET}\0${env.MAP_PASSWORD}`);
}
export function createArchitectureHandler({ now = () => Date.now() } = {}) {
  return async (request, env) => {
    const url = new URL(request.url);
    if (url.pathname === '/robots.txt')
      return respond('User-agent: *\nDisallow: /\n', 200, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
    if (
      typeof env.MAP_PASSWORD !== 'string' ||
      env.MAP_PASSWORD.length < 20 ||
      typeof env.MAP_SESSION_SECRET !== 'string' ||
      env.MAP_SESSION_SECRET.length < 32 ||
      !env.MAP_LOGIN_LIMITER ||
      !env.ASSETS
    )
      return respond('Acesso temporariamente indisponível.', 503, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
    try {
      if (url.pathname === '/login' && request.method === 'GET')
        return respond(loginPage(), 200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (['/login', '/logout'].includes(url.pathname) && request.method === 'POST') {
        if (request.headers.get('Origin') !== url.origin)
          return respond('Origem não permitida.', 403);
        if (url.pathname === '/logout')
          return respond(null, 303, { Location: '/login', 'Set-Cookie': cookie('', 0) });
        const limit = await env.MAP_LOGIN_LIMITER.limit({
          key: `map-login:${request.headers.get('CF-Connecting-IP') || 'unknown'}`,
        });
        if (!limit.success)
          return respond(
            loginPage('Muitas tentativas. Aguarde um minuto e tente novamente.'),
            429,
            { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '60' },
          );
        if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))
          return respond('Formato inválido.', 415);
        // Limita também corpos sem Content-Length, antes de carregar o formulário inteiro.
        const reader = request.body?.getReader();
        let size = 0;
        const chunks = [];
        if (reader)
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 2048) {
              await reader.cancel();
              return respond('Formulário muito grande.', 413);
            }
            chunks.push(value);
          }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.length;
        }
        const form = new URLSearchParams(new TextDecoder().decode(bytes)),
          supplied = form.get('password') || '';
        if (
          supplied.length > 256 ||
          form.getAll('password').length !== 1 ||
          !(await matches(supplied, env.MAP_PASSWORD))
        )
          return respond(loginPage('Senha incorreta. Confira e tente novamente.'), 401, {
            'Content-Type': 'text/html; charset=utf-8',
          });
        const seconds = Math.floor(now() / 1000);
        const token = await new SignJWT({ scope: 'architecture-map' })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuer('addlog-map')
          .setAudience(url.origin)
          .setSubject('shared-viewer')
          .setIssuedAt(seconds)
          .setExpirationTime(seconds + duration)
          .sign(await sessionKey(env));
        return respond(null, 303, { Location: '/', 'Set-Cookie': cookie(token) });
      }
      if (!['GET', 'HEAD'].includes(request.method))
        return respond('Método não permitido.', 405, { Allow: 'GET, HEAD' });
      let authenticated = false;
      try {
        const { payload } = await jwtVerify(readCookie(request), await sessionKey(env), {
          algorithms: ['HS256'],
          issuer: 'addlog-map',
          audience: url.origin,
          subject: 'shared-viewer',
          requiredClaims: ['exp', 'iat'],
          currentDate: new Date(now()),
        });
        authenticated = payload.scope === 'architecture-map';
      } catch {}
      if (!authenticated)
        return respond(
          request.method === 'HEAD' ? null : loginPage(),
          url.pathname === '/' ? 200 : 401,
          { 'Content-Type': 'text/html; charset=utf-8' },
        );
      // Nenhuma credencial ou cookie é enviado ao armazenamento dos arquivos documentais.
      const asset = await env.ASSETS.fetch(new Request(url, { method: request.method }));
      const secured = new Headers(asset.headers);
      for (const [key, value] of Object.entries(headers)) secured.set(key, value);
      if (/\.(?:md|mmd|json)$/.test(url.pathname)) secured.set('Content-Disposition', 'attachment');
      return new Response(request.method === 'HEAD' ? null : asset.body, {
        status: asset.status,
        headers: secured,
      });
    } catch {
      return respond('Não foi possível abrir o mapa. Tente novamente.', 503, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
    }
  };
}
export default { fetch: createArchitectureHandler() };
