/**
 * Administração de usuários e permissões. O cadastro interno não substitui a liberação no Cloudflare Access.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React, { useEffect, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { PageConfigurationButton } from '../../../components/PageConfigurationButton.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';
import { api } from '../../../shared/security/accessClient.js';
import { moduleLabels, allowsPage } from '../../../shared/security/permissions.js';
const blank = () => ({
  email: '',
  role: 'user',
  active: true,
  pages: [],
  canImport: false,
  canExport: false,
  canDashboard: false,
  version: 0,
});
/** Lista e edita usuários por meio da API protegida. A liberação de login no Cloudflare permanece uma etapa separada. */
export function UsersPage({ onPage }) {
  const { user, reload } = useAccess(),
    [users, setUsers] = useState([]),
    [owner, setOwner] = useState(''),
    [draft, setDraft] = useState(blank),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function list() {
    try {
      const result = await api('/api/admin/users');
      setUsers(result.users);
      setOwner(result.owner);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    list();
  }, []);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      setDraft(blank());
      await list();
      await reload();
      setMessage(
        'Permissões salvas. Novos usuários também precisam estar liberados na política do Cloudflare Access.',
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const fixed = draft.email === owner || draft.email === user.email;
  return (
    <SidePanelProvider>
      <div className="app users-page">
        <Navigation page="users" onPage={onPage} />
        <main>
          <header>
            <div>
              <div className="eyebrow">ADMINISTRAÇÃO</div>
              <h1>Usuários e permissões</h1>
              <p>Defina páginas e ações disponíveis para cada pessoa.</p>
            </div>
            <div className="page-header-actions">
              <PageConfigurationButton
                scope="Usuários e permissões"
                description="Regras de acesso do aplicativo e etapas administrativas relacionadas."
              >
                <section>
                  <h3>Permissões internas</h3>
                  <p>
                    O cadastro controla páginas e ações disponíveis dentro do sistema. Perfis de
                    administrador acessam todas as ferramentas e podem gerir usuários.
                  </p>
                </section>
                <section>
                  <h3>Acesso à conta</h3>
                  <p>
                    A liberação para entrar no site também depende da política do Cloudflare Access.
                    Salvar aqui não envia convites nem altera essa política externa.
                  </p>
                </section>
                <section>
                  <h3>Exportação e privacidade</h3>
                  <p>
                    Bloquear exportação desativa os comandos de exportar e imprimir do sistema, mas
                    não impede copiar informações que já estejam visíveis na tela.
                  </p>
                </section>
              </PageConfigurationButton>
              <button
                onClick={() => {
                  setDraft(blank());
                  setMessage('');
                  setError('');
                }}
              >
                Novo usuário
              </button>
            </div>
          </header>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          <form className="panel user-form" onSubmit={save}>
            <h2>{draft.version ? 'Editar acesso' : 'Cadastrar acesso'}</h2>
            <label>
              E-mail
              <input
                type="email"
                required
                disabled={draft.version > 0 || busy}
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value.trim().toLowerCase() })}
              />
            </label>
            <label>
              Perfil
              <select
                disabled={fixed || busy}
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                disabled={fixed || busy}
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              Acesso ativo
            </label>
            <fieldset disabled={busy || draft.role === 'admin'}>
              <legend>Páginas liberadas</legend>
              <label>
                <input
                  type="checkbox"
                  checked={draft.role === 'admin' || Boolean(draft.canDashboard)}
                  onChange={(e) => setDraft({ ...draft, canDashboard: e.target.checked })}
                />
                Meu Dashboard
              </label>
              {Object.entries(moduleLabels).map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={draft.role === 'admin' || draft.pages.includes(key)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        pages: e.target.checked
                          ? [...draft.pages, key]
                          : draft.pages.filter((p) => p !== key),
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <p className="scope">
              Meu Dashboard controla a abertura do painel pessoal. Seus indicadores continuam
              limitados às bases e páginas liberadas acima. Importação depende da ação Importar e
              das bases autorizadas.
            </p>
            <details className="permission-tool-scope">
              <summary>Integrações e ferramentas adicionais · regras de acesso</summary>
              <p className="scope">
                As permissões de página não ampliam o acesso às integrações privadas. O piloto e a
                política de login permanecem separados.
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Ferramenta</th>
                      <th>Acesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>KORE e Arqia</td>
                      <td>
                        Páginas vinculadas a Consumo M2M; a integração privada conserva a restrição
                        administrativa do servidor.
                      </td>
                    </tr>
                    <tr>
                      <td>Indicadores Suporte</td>
                      <td>
                        Página administrativa. Lançamentos no D1 e consulta Zoho restritos ao
                        administrador principal no piloto.
                      </td>
                    </tr>
                    <tr>
                      <td>Zoho Desk</td>
                      <td>Consulta de chamados e tempos: administrador principal.</td>
                    </tr>
                    <tr>
                      <td>Google Sheets</td>
                      <td>
                        Leitura conectada: administradores, conforme configuração do servidor.
                      </td>
                    </tr>
                    <tr>
                      <td>Bases salvas, coleta e lembretes no D1</td>
                      <td>Piloto restrito ao proprietário; não é liberado ao marcar uma página.</td>
                    </tr>
                    <tr>
                      <td>Assistente de suporte · laboratório</td>
                      <td>Restrito ao proprietário; sem concessão a usuários comuns.</td>
                    </tr>
                    <tr>
                      <td>Usuários e permissões / Mapa de arquitetura</td>
                      <td>Administração; o mapa mantém também sua proteção própria.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
            <fieldset disabled={busy || draft.role === 'admin'}>
              <legend>Ações permitidas</legend>
              <label>
                <input
                  type="checkbox"
                  checked={draft.role === 'admin' || draft.canImport}
                  onChange={(e) => setDraft({ ...draft, canImport: e.target.checked })}
                />
                Importar arquivos
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.role === 'admin' || draft.canExport}
                  onChange={(e) => setDraft({ ...draft, canExport: e.target.checked })}
                />
                Exportar e imprimir relatórios / backups
              </label>
            </fieldset>
            {draft.role === 'admin' && (
              <p className="scope">
                Administradores acessam todas as páginas e ações e podem gerir usuários.
              </p>
            )}
            <button disabled={busy} type="submit">
              {busy ? 'Salvando…' : 'Salvar permissões'}
            </button>
          </form>
          <section className="panel">
            <h2>Acessos cadastrados</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Situação</th>
                    <th>Páginas</th>
                    <th>Importar</th>
                    <th>Meu Dashboard</th>
                    <th>Exportar</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email}>
                      <td>{u.email}</td>
                      <td>{u.role === 'admin' ? 'Administrador' : 'Usuário'}</td>
                      <td>{u.active ? 'Ativo' : 'Suspenso'}</td>
                      <td>
                        {u.role === 'admin'
                          ? 'Todas'
                          : u.pages.map((p) => moduleLabels[p]).join(', ') || 'Nenhuma'}
                      </td>
                      <td>{u.canImport ? 'Sim' : 'Não'}</td>
                      <td>{allowsPage({ ...u, active: true }, 'my-dashboard') ? 'Sim' : 'Não'}</td>
                      <td>{u.canExport ? 'Sim' : 'Não'}</td>
                      <td>
                        <button
                          disabled={busy}
                          onClick={() => {
                            const { updatedAt, ...editable } = u;
                            setDraft({
                              ...editable,
                              canDashboard: allowsPage({ ...u, active: true }, 'my-dashboard'),
                            });
                            setMessage('');
                            setError('');
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </SidePanelProvider>
  );
}
