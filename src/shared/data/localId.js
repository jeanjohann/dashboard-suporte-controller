/** Identificadores de configurações/anotações locais. Não são tokens de autenticação nem substituem hashes de arquivos. */
let sequence = 0;

/** Mantém compatibilidade em navegadores sem randomUUID; IDs já salvos continuam válidos. */
export function localId(cryptoSource = globalThis.crypto) {
  if (typeof cryptoSource?.randomUUID === 'function') return cryptoSource.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof cryptoSource?.getRandomValues === 'function') cryptoSource.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return `local-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
}
