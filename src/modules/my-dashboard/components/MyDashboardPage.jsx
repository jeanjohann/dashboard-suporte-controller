import React, { useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { Icon } from '../../../components/Icon.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';
import { useDashboardSources } from '../hooks/DashboardSources.jsx';
import { useDashboards } from '../hooks/useDashboards.js';
import { moveWidget } from '../domain/layout.js';
import { DashboardCatalog } from './DashboardCatalog.jsx';
import { WidgetEditor } from './WidgetEditor.jsx';
import { DashboardWidget } from './DashboardWidget.jsx';
import { DashboardDialog } from './DashboardDialog.jsx';

export function MyDashboardPage({ onPage, repository }) {
  const { user, managed } = useAccess(),
    { sources } = useDashboardSources();
  const owner = `${managed ? 'account' : 'local'}:${user.email.trim().toLowerCase()}`;
  const state = useDashboards(owner, repository),
    { draft, setDraft } = state;
  const [catalog, setCatalog] = useState(false),
    [editor, setEditor] = useState(null),
    [pending, setPending] = useState(null);
  const available = Object.values(sources).filter(Boolean).length;
  const editWidgets = (update) => setDraft((old) => ({ ...old, widgets: update(old.widgets) }));
  function request(action) {
    if (state.dirty) setPending({ kind: 'switch', action });
    else action();
  }
  function apply(widget) {
    editWidgets((rows) =>
      editor.widget ? rows.map((row) => (row.id === widget.id ? widget : row)) : [...rows, widget],
    );
    setEditor(null);
  }
  return (
    <SidePanelProvider>
      <div className="app my-dashboard-page">
        <Navigation page="my-dashboard" onPage={onPage} />
        <main>
          <SidebarContent>
            <div className="md-sidebar-note">
              Seu espaço de acompanhamento. Escolha os indicadores que importam para você.
            </div>
          </SidebarContent>
          <header className="md-page-header">
            <div>
              <span className="md-eyebrow">SEU ESPAÇO DE ACOMPANHAMENTO</span>
              <h1>Meu Dashboard</h1>
              <p>As informações que você precisa, do seu jeito.</p>
            </div>
            <button
              className="md-primary md-add-button"
              onClick={() => setCatalog(true)}
              disabled={draft.widgets.length >= 40 || state.busy || !state.ready}
            >
              <span aria-hidden="true">＋</span> Adicionar indicador
            </button>
          </header>
          <section className="md-board-controls" aria-label="Configurações do dashboard">
            <div className="md-board-name">
              <label>
                Nome do painel
                <input
                  value={draft.name}
                  maxLength={60}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  disabled={state.busy || !state.ready}
                />
              </label>
              <span className={`md-save-status ${state.dirty ? 'md-unsaved' : ''}`}>
                {!state.ready
                  ? 'Aguardando armazenamento'
                  : !state.saved
                    ? 'Ainda não salvo'
                    : state.dirty
                      ? 'Alterações não salvas'
                      : 'Todas as alterações salvas'}
              </span>
            </div>
            <div className="md-board-buttons">
              <button
                onClick={() => state.save()}
                className="md-primary"
                disabled={!state.ready || state.busy}
              >
                {state.busy ? 'Aguarde…' : 'Salvar painel'}
              </button>
              <button
                onClick={() => request(() => state.newBoard())}
                disabled={state.busy || !state.ready || state.document.dashboards.length >= 12}
              >
                Novo painel
              </button>
              <button
                onClick={() => setPending({ kind: 'discard', action: state.discard })}
                disabled={!state.dirty || state.busy}
              >
                Descartar edição
              </button>
              <button
                onClick={() => setPending({ kind: 'delete', action: () => state.remove() })}
                disabled={!state.saved || state.busy}
              >
                Excluir painel
              </button>
            </div>
            <label className="md-saved-select">
              Abrir painel salvo
              <select
                value={state.saved ? draft.id : ''}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) request(() => state.open(id));
                }}
                disabled={!state.ready || state.busy}
              >
                <option value="" disabled>
                  Selecione um painel
                </option>
                {state.document.dashboards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </label>
          </section>
          {state.error && (
            <div className="md-error" role="alert">
              <p>{state.error}</p>
              <button disabled={state.busy} onClick={() => state.reload()}>
                Recarregar painéis salvos
              </button>
            </div>
          )}
          {state.message && (
            <p className="md-message" role="status">
              {state.message}
            </p>
          )}
          <div className="md-context">
            <p>
              <span className="md-dot" />
              {draft.widgets.length} de 40 blocos <span>·</span> {available} fonte(s) carregada(s)
              na sessão
            </p>
            <p>
              Configurações salvas por usuário neste navegador. Carregue ou atualize os dados nos
              módulos de origem.
            </p>
          </div>
          {!draft.widgets.length ? (
            <section className="md-empty-board">
              <span className="md-empty-icon">
                <Icon name="my-dashboard" size={38} />
              </span>
              <span className="md-eyebrow">COMECE COM O QUE IMPORTA</span>
              <h2>Seu painel começa aqui</h2>
              <p>
                Escolha indicadores de OS, Zoho, Consumo e dos outros módulos disponíveis para
                montar sua visão de trabalho.
              </p>
              <button
                className="md-primary"
                onClick={() => setCatalog(true)}
                disabled={!state.ready || state.busy}
              >
                ＋ Escolher meus indicadores
              </button>
              <div className="md-empty-steps">
                <span>
                  <b>01</b> Escolha as informações
                </span>
                <span>
                  <b>02</b> Organize os blocos
                </span>
                <span>
                  <b>03</b> Salve seu painel
                </span>
              </div>
            </section>
          ) : (
            <div className="md-grid">
              {draft.widgets.map((widget, index) => (
                <DashboardWidget
                  key={widget.id}
                  widget={widget}
                  index={index}
                  total={draft.widgets.length}
                  sources={sources}
                  user={user}
                  onEdit={() => setEditor({ widget })}
                  onRemove={() => editWidgets((rows) => rows.filter((row) => row.id !== widget.id))}
                  onMove={(step) => editWidgets((rows) => moveWidget(rows, widget.id, step))}
                  onResize={(size) =>
                    editWidgets((rows) =>
                      rows.map((row) => (row.id === widget.id ? { ...row, size } : row)),
                    )
                  }
                  onPage={onPage}
                />
              ))}
            </div>
          )}
          <p className="md-bottom-note">
            Cada bloco tem seus próprios filtros e critérios. Os dados das fontes permanecem na
            sessão; salvar o painel guarda sua organização e suas escolhas.
          </p>
          {catalog && (
            <DashboardCatalog
              user={user}
              sources={sources}
              onClose={() => setCatalog(false)}
              onSelect={(metric) => {
                setCatalog(false);
                setEditor({ metricId: metric.id });
              }}
            />
          )}
          {editor && (
            <WidgetEditor
              {...editor}
              sources={sources}
              user={user}
              onClose={() => setEditor(null)}
              onApply={apply}
            />
          )}
          {pending && (
            <DashboardDialog
              title={
                pending.kind === 'delete'
                  ? 'Excluir este painel?'
                  : pending.kind === 'discard'
                    ? 'Descartar alterações?'
                    : 'Há alterações não salvas'
              }
              onClose={() => setPending(null)}
            >
              <p>
                {pending.kind === 'delete'
                  ? `O painel “${state.saved?.name}” será removido dos salvos neste navegador.`
                  : 'As alterações desta edição serão descartadas. Você pode voltar e salvar o painel antes de continuar.'}
              </p>
              <footer>
                <button onClick={() => setPending(null)}>Voltar</button>
                <button
                  className="md-primary"
                  onClick={() => {
                    pending.action();
                    setPending(null);
                  }}
                >
                  {pending.kind === 'delete' ? 'Excluir painel' : 'Descartar e continuar'}
                </button>
              </footer>
            </DashboardDialog>
          )}
        </main>
      </div>
    </SidePanelProvider>
  );
}
