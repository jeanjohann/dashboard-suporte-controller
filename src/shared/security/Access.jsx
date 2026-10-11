/**
 * Controle compartilhado de páginas e ações. A produção exige identidade validada; as planilhas continuam locais.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { accessManaged, api, setAccessSession } from './accessClient.js';
import { allowsAction, allowsSource, moduleKeys } from './permissions.js';
const legacy = {
  email: 'Modo local / sem gestão ativada',
  role: 'admin',
  active: true,
  pages: moduleKeys,
  canImport: true,
  canExport: true,
};
export const AccessContext = createContext({ user: legacy, managed: false });
export const useAccess = () => useContext(AccessContext);
/** Oculta ações não concedidas. A ação executada também deve revalidar a permissão, além deste controle visual. */
export function PermissionButton({ action, source, children, ...props }) {
  const { user } = useAccess();
  return allowsAction(user, action) && (!source || allowsSource(user, source)) ? (
    <button {...props}>{children}</button>
  ) : null;
}
/** Em produção, aguarda a API antes de montar o aplicativo e recusa acesso quando a identidade não pode ser confirmada. */
export function AccessProvider({ children }) {
  const managed = accessManaged(),
    [user, setUser] = useState(managed ? null : legacy),
    [error, setError] = useState('');
  async function reload() {
    try {
      const { user: next } = await api('/api/me');
      setUser(next);
      setError('');
      setAccessSession(next, reload);
      return next;
    } catch (e) {
      setUser(null);
      setError(e.message);
      setAccessSession(null, reload);
      throw e;
    }
  }
  useEffect(() => {
    setAccessSession(user, reload);
    if (!managed) return;
    const refresh = () => reload().catch(() => {});
    refresh();
    const timer = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [managed]);
  if (managed && !user)
    return (
      <main className="access-status" role="status">
        <h1>{error ? 'Acesso indisponível' : 'Verificando seu acesso…'}</h1>
        <p>{error || 'Aguarde a confirmação das permissões.'}</p>
        {error && <button onClick={() => reload().catch(() => {})}>Tentar novamente</button>}
      </main>
    );
  return (
    <AccessContext.Provider value={{ user, managed, reload }}>{children}</AccessContext.Provider>
  );
}
