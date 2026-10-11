/**
 * Controle compartilhado de páginas e ações. A produção exige identidade validada; as planilhas continuam locais.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { allowsAction } from './permissions.js';
let current = null,
  refresh = null;
export const accessManaged = () => Boolean(import.meta.env?.PROD);
/** Mantém a identidade e a função de atualização usadas pelas ações locais do aplicativo. */
export function setAccessSession(user, reload) {
  current = user;
  refresh = reload;
}
/** Reconsulta as permissões em produção antes de importar ou exportar; falha de consulta recusa a ação. */
export async function authorizeAction(action) {
  if (!accessManaged()) return true;
  try {
    const user = await refresh?.();
    if (allowsAction(user, action)) return true;
  } catch {}
  globalThis.alert?.(
    'Você não tem permissão para ' +
      (action === 'import' ? 'importar arquivos.' : 'exportar ou imprimir relatórios.'),
  );
  return false;
}
export const accessUser = () => current;
/** Consulta a API autenticada na mesma origem, exige JSON e apresenta erros sem fallback de administrador. */
export async function api(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options });
  if (!response.headers.get('Content-Type')?.includes('application/json'))
    throw Error('Serviço de permissões ainda não configurado.');
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Não foi possível verificar o acesso.');
  return data;
}
