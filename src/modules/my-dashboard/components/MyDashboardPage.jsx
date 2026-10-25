import React, { useMemo, useRef, useState } from 'react';
import { createPilotRepository } from '../../../shared/persistence/workspaceClient.js';
import { RepositoryStorageStatus } from '../../../shared/persistence/RepositoryStorageStatus.jsx';
import { dashboardRepository } from '../data/dashboardRepository.js';
import { emptyDashboardDocument } from '../domain/layout.js';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { PageConfigurationButton } from '../../../components/PageConfigurationButton.jsx';
import { Icon } from '../../../components/Icon.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';
import { useDashboardSources } from '../hooks/DashboardSources.jsx';
import { useDashboards } from '../hooks/useDashboards.js';
import {
  copyWidget,
  dashboardBackup,
  readDashboardBackup,
  placeWidget,
} from '../domain/boardActions.js';
import { organizeSections } from '../domain/presentation.js';
import { DashboardTemplates, DashboardSources, DashboardFilters } from './DashboardTools.jsx';
import { localId } from '../../../shared/data/localId.js';
import { allowsAction } from '../../../shared/security/permissions.js';
import { authorizeAction, accessUser } from '../../../shared/security/accessClient.js';
import { download } from '../../../shared/export/exports.js';
import { useDashboardArrangement } from '../hooks/useDashboardArrangement.js';
import { useDashboardPresentation } from '../hooks/useDashboardPresentation.js';
import { DashboardCatalog } from './DashboardCatalog.jsx';
import { WidgetEditor } from './WidgetEditor.jsx';
import { DashboardWidget } from './DashboardWidget.jsx';
import { DashboardDialog } from './DashboardDialog.jsx';

export function MyDashboardPage({ onPage, repository, active = true }) {
  const { user, managed } = useAccess(),
    { sources } = useDashboardSources(active);
  const owner = `${managed ? 'account' : 'local'}:${user.email.trim().toLowerCase()}`;
  const configuredRepository = useMemo(
    () =>
      createPilotRepository({
        kind: 'dashboards',
        managed,
        readLocal: dashboardRepository.read,
        writeLocal: dashboardRepository.write,
        empty: emptyDashboardDocument,
        revisionField: 'revision',
      }),
    [managed, user.email],
  );
  const selectedRepository = repository || configuredRepository;
  const state = useDashboards(owner, selectedRepository),
    { draft, setDraft } = state;
  const [catalog, setCatalog] = useState(false),
    [editor, setEditor] = useState(null),
    [pending, setPending] = useState(null),
    [organizing, setOrganizing] = useState(false),
    [reading, setReading] = useState(false),
    [tool, setTool] = useState(null);
  const pageRoot = useRef(null),
    fileInput = useRef(null);
  const presentation = useDashboardPresentation(pageRoot);
  const working = state.busy || reading;
  const available = Object.values(sources).filter(Boolean).length;
  const editWidgets = (update) =>
    setDraft((old) => ({ ...old, widgets: organizeSections(update(old.widgets)) }));
  const arrangement = useDashboardArrangement({
    enabled: organizing && !working && !presentation.presenting,
    widgets: draft.widgets,
    onChange: (widgets) => editWidgets(() => widgets),
  });
  async function exportBackup() {
    setReading(true);
    try {
      if (!(await authorizeAction('export')) || !pageRoot.current) return;
      await download(
        dashboardBackup(state.document, accessUser() || user),
        'application/json',
        'addlog-meus-dashboards.json',
      );
      state.notify(
        'Backup dos painéis salvos exportado. Alterações ainda não salvas não entram no arquivo.',
      );
    } catch (error) {
      state.reportError(error.message);
    } finally {
      setReading(false);
    }
  }
  async function chooseBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setReading(true);
    try {
      if (state.dirty) throw Error('Salve ou descarte a edição atual antes de importar um backup.');
      if (!(await authorizeAction('import')) || !pageRoot.current) return;
      if (file.size > 4000000) throw Error('O arquivo de backup excede o limite de 4 MB.');
      const boards = readDashboardBackup(await file.text(), accessUser() || user);
      if (state.document.dashboards.length + boards.length > 12)
        throw Error('O backup ultrapassaria o limite de 12 painéis. Nenhum painel foi alterado.');
      if (pageRoot.current) setPending({ kind: 'import', boards });
    } catch (error) {
      state.reportError(error.message);
    } finally {
      setReading(false);
    }
  }
  async function printPanel() {
    if (await authorizeAction('export')) presentation.print();
  }
  function request(action) {
    if (state.dirty) setPending({ kind: 'switch', action });
    else action();
  }
  function apply(widget) {
    editWidgets((rows) =>
      editor.widget ? rows.map((row) => (row.id === widget.id ? widget : row)) : [...rows, widget],
    );
    setEditor(null);
    setOrganizing(true);
  }
  return (
    <SidePanelProvider>
      <div
        ref={pageRoot}
        className={`app my-dashboard-page ${presentation.presenting ? 'md-presenting' : ''} ${organizing && !presentation.presenting ? 'md-organizing' : ''}`}
      >
        <Navigation page="my-dashboard" onPage={onPage} />
        <main>
          {presentation.presenting && (
            <header className="md-presentation-toolbar">
              <div>
                <span className="md-eyebrow">APRESENTAÇÃO</span>
                <h1>{draft.name}</h1>
                <p>
                  {state.dirty || !state.saved
                    ? 'Prévia da edição atual · ainda não salva'
                    : 'Painel salvo'}{' '}
                  · Esc para sair
                </p>
              </div>
              <div>
                <button onClick={presentation.fullscreen}>Tela cheia</button>
                <button onClick={printPanel} disabled={!allowsAction(user, 'export')}>
                  Imprimir / Salvar PDF
                </button>
                <button onClick={presentation.exit}>Sair da apresentação</button>
              </div>
            </header>
          )}
          <div className="md-print-header">
            <h1>{draft.name}</h1>
            <p>
              Meu Dashboard ·{' '}
              <time data-dashboard-print-time>
                {new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </time>{' '}
              (Brasília) · {state.dirty || !state.saved ? 'Edição não salva' : 'Painel salvo'}
            </p>
          </div>
          <header className="md-page-header">
            <div>
              <span className="md-eyebrow">SEU ESPAÇO DE ACOMPANHAMENTO</span>
              <h1>Meu Dashboard</h1>
              <p>As informações que você precisa, do seu jeito.</p>
            </div>
            <div className="md-page-actions">
              <PageConfigurationButton
                scope="Meu Dashboard"
                description="Orientações sobre organização, salvamento e atualização das fontes."
              >
                <section>
                  <h3>Organizar o painel</h3>
                  <p>
                    Use Organizar painel para mover ou redimensionar os blocos. Adicionar indicador
                    abre o catálogo; os filtros de cada bloco continuam independentes.
                  </p>
                </section>
                <section>
                  <h3>Salvar e compartilhar</h3>
                  <p>
                    Salve o painel para guardar sua disposição no armazenamento do sistema. Os
                    arquivos de origem são atualizados nos módulos correspondentes; o painel não
                    substitui essas fontes.
                  </p>
                </section>
                <section>
                  <h3>Backup e apresentação</h3>
                  <p>
                    Use as ferramentas do painel para exportar ou restaurar configurações. O modo
                    Apresentar abre uma tela limpa para exibição e impressão.
                  </p>
                </section>
              </PageConfigurationButton>
              <button
                className={organizing ? 'md-primary' : ''}
                onClick={() => {
                  arrangement.cancel();
                  setOrganizing(!organizing);
                }}
                aria-pressed={organizing}
                disabled={working || !state.ready}
              >
                {organizing ? 'Concluir organização' : 'Organizar painel'}
              </button>
              <button
                onClick={() => {
                  arrangement.cancel();
                  presentation.enter();
                }}
                disabled={!draft.widgets.length || working}
              >
                Apresentar
              </button>
              <button
                className="md-primary md-add-button"
                onClick={() => setCatalog(true)}
                disabled={draft.widgets.length >= 40 || working || !state.ready}
              >
                <span aria-hidden="true">＋</span> Adicionar indicador
              </button>
            </div>
          </header>
          <section className="md-board-controls" aria-label="Configurações do dashboard">
            <div className="md-board-name">
              <label>
                Nome do painel
                <input
                  value={draft.name}
                  maxLength={60}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  disabled={working || !state.ready}
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
                disabled={!state.ready || working}
              >
                {state.busy ? 'Aguarde…' : 'Salvar painel'}
              </button>
              <button
                onClick={() => request(() => state.newBoard())}
                disabled={working || !state.ready || state.document.dashboards.length >= 12}
              >
                Novo painel
              </button>
              <button
                onClick={() => setPending({ kind: 'discard', action: state.discard })}
                disabled={!state.dirty || working}
              >
                Descartar edição
              </button>
              <button
                onClick={() => setPending({ kind: 'delete', action: () => state.remove() })}
                disabled={!state.saved || working}
              >
                Excluir painel
              </button>
              <button
                onClick={state.duplicate}
                disabled={working || !state.ready || state.document.dashboards.length >= 12}
              >
                Duplicar painel
              </button>
              <button onClick={state.undo} disabled={working || !state.canUndo}>
                Desfazer
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
                disabled={!state.ready || working}
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
          <div className="md-backup-actions">
            <button
              type="button"
              disabled={working || !state.ready || state.document.dashboards.length >= 12}
              onClick={() => setTool('templates')}
            >
              Usar modelo
            </button>
            <button type="button" onClick={() => setTool('sources')}>
              Fontes de dados
            </button>
            <button
              onClick={exportBackup}
              disabled={
                working ||
                !state.ready ||
                !state.document.dashboards.length ||
                !allowsAction(user, 'export')
              }
            >
              Exportar painéis salvos
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              disabled={working || !state.ready || state.dirty || !allowsAction(user, 'import')}
              title={
                state.dirty
                  ? 'Salve ou descarte a edição antes de importar'
                  : 'Importar configurações como novas cópias'
              }
            >
              Importar backup
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              aria-label="Arquivo de backup dos dashboards"
              onChange={chooseBackup}
            />
            <span>
              Backup de configurações e filtros. As planilhas são carregadas separadamente.
            </span>
          </div>
          <DashboardFilters
            filters={draft.filters}
            widgets={draft.widgets}
            disabled={working || !state.ready}
            onChange={(filters) => setDraft((old) => ({ ...old, filters }))}
          />
          {organizing && (
            <p className="md-arrangement-help">
              Arraste pelo símbolo ⠿ para mover; pelo canto ◢ para ajustar tamanho. As setas também
              movem os blocos. Use Desfazer para reverter e Salvar painel para guardar.
            </p>
          )}
          <RepositoryStorageStatus
            repository={selectedRepository}
            busy={working || !state.ready}
            onMigrate={() => request(() => state.migrateLocal())}
          />
          {state.error && (
            <div className="md-error" role="alert">
              <p>{state.error}</p>
              <button disabled={working} onClick={() => state.reload()}>
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
              Configurações salvas no armazenamento indicado acima. Carregue ou atualize os dados
              nos módulos de origem.
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
                disabled={!state.ready || working}
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
            <div className="md-grid" ref={arrangement.grid} {...arrangement.handlers}>
              {draft.widgets.map((widget, index) => (
                <React.Fragment key={widget.id}>
                  {widget.section && widget.section !== draft.widgets[index - 1]?.section && (
                    <h2 className="md-section-title">{widget.section}</h2>
                  )}
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    index={index}
                    total={draft.widgets.length}
                    sources={sources}
                    user={user}
                    boardFilters={draft.filters}
                    onEdit={() => setEditor({ widget })}
                    onRemove={() =>
                      editWidgets((rows) => rows.filter((row) => row.id !== widget.id))
                    }
                    onMove={(step) =>
                      editWidgets((rows) =>
                        placeWidget(rows, widget.id, rows[index + step]?.id, step > 0),
                      )
                    }
                    onResize={(size) =>
                      editWidgets((rows) =>
                        rows.map((row) => (row.id === widget.id ? { ...row, size } : row)),
                      )
                    }
                    onPage={onPage}
                    organizing={organizing && !presentation.presenting}
                    disabled={working}
                    onDuplicate={() =>
                      editWidgets((rows) =>
                        rows.length < 40
                          ? [
                              ...rows.slice(0, index + 1),
                              copyWidget(widget, localId),
                              ...rows.slice(index + 1),
                            ]
                          : rows,
                      )
                    }
                    onGesture={(event, kind) => arrangement.start(event, widget.id, kind)}
                    preview={arrangement.preview}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
          <p className="md-bottom-note">
            Cada indicador tem seus próprios filtros e critérios; o recorte do painel é opcional. Os
            dados das fontes permanecem na sessão; salvar o painel guarda sua organização e suas
            escolhas.
          </p>
          {tool === 'templates' && (
            <DashboardTemplates
              user={user}
              onClose={() => setTool(null)}
              onSelect={(template) => {
                setTool(null);
                request(() => state.newBoard(template));
              }}
            />
          )}
          {tool === 'sources' && (
            <DashboardSources
              sources={sources}
              user={user}
              onPage={onPage}
              onClose={() => setTool(null)}
            />
          )}
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
              sections={[...new Set(draft.widgets.map((w) => w.section).filter(Boolean))]}
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
                  : pending.kind === 'import'
                    ? 'Importar painéis do backup?'
                    : pending.kind === 'discard'
                      ? 'Descartar alterações?'
                      : 'Há alterações não salvas'
              }
              onClose={() => {
                if (!working) setPending(null);
              }}
            >
              <p>
                {pending.kind === 'import'
                  ? `${pending.boards.length} painel(is) serão adicionados como novas cópias. Nomes repetidos serão diferenciados; os painéis existentes não serão substituídos. As fontes não estão no backup.`
                  : pending.kind === 'delete'
                    ? `O painel “${state.saved?.name}” será removido dos painéis salvos.`
                    : 'As alterações desta edição serão descartadas. Você pode voltar e salvar o painel antes de continuar.'}
              </p>
              {pending.kind === 'import' && (
                <ul>
                  {pending.boards.map((board) => (
                    <li key={board.id}>
                      {board.name} · {board.widgets.length} blocos
                    </li>
                  ))}
                </ul>
              )}
              <footer>
                <button disabled={working} onClick={() => setPending(null)}>
                  Voltar
                </button>
                <button
                  className="md-primary"
                  disabled={working}
                  onClick={async () => {
                    if (pending.kind === 'import') {
                      setReading(true);
                      try {
                        if ((await authorizeAction('import')) && pageRoot.current) {
                          await state.importBoards(pending.boards, accessUser() || user);
                          setPending(null);
                        }
                      } catch (error) {
                        state.reportError(error.message);
                      } finally {
                        setReading(false);
                      }
                    } else {
                      pending.action();
                      setPending(null);
                    }
                  }}
                >
                  {pending.kind === 'import'
                    ? 'Adicionar cópias'
                    : pending.kind === 'delete'
                      ? 'Excluir painel'
                      : 'Descartar e continuar'}
                </button>
              </footer>
            </DashboardDialog>
          )}
        </main>
      </div>
    </SidePanelProvider>
  );
}
