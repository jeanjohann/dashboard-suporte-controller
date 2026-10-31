import React from 'react';
import { WorkspaceQueryPanel } from '../../../shared/persistence/WorkspaceQueryPanel.jsx';
import { agents } from '../domain/indicators.js';
import { SourceCoverage } from './SupportIndicatorViews.jsx';
import { IndicatorSettings } from './IndicatorSettings.jsx';
import { date, number, timestamp } from './supportIndicatorFormat.js';

const configurationSections = [
  ['analysis', 'Análise', 'Período, equipe e indicadores'],
  ['presentation', 'Apresentação', 'Visualização e blocos'],
  ['sources', 'Dados e fontes', 'Cobertura, consultas e atualização'],
  ['backlog', 'Pendências Zoho', 'Carteira atual e em espera'],
];

export function SupportIndicatorSettingsDialog({
  open,
  onClose,
  onStartPresentation,
  analysis,
  display,
  data,
  actions,
}) {
  const {
    configurationSection,
    setConfigurationSection,
    period,
    setPeriod,
    busy,
    agentId,
    setAgent,
    past,
    valid,
    preset,
    today,
    manualDirty,
  } = analysis;
  const {
    settings,
    viewMode,
    selectDensity,
    presentationStyle,
    setPresentationStyle,
    availablePresentationOptions,
    presentationSelection,
    setPresentationSelection,
    selectedPresentationCount,
  } = display;
  const {
    ordersData,
    orders,
    zohoData,
    zoho,
    manual,
    store,
    sources,
    ownZoho,
    setOwnZoho,
    ownBacklog,
    setOwnBacklog,
    backlog,
  } = data;
  const {
    loadZoho,
    cancelZoho,
    progress,
    inspectProfile,
    profileBusy,
    profile,
    error,
    loadBacklog,
    cancelBacklog,
    backlogBusy,
    backlogProgress,
    backlogError,
  } = actions;
  if (!open) return null;
  return (
    <div
      className="si-config-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="si-config-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="si-config-title"
      >
        <header className="si-config-dialog-heading">
          <div>
            <span>INDICADORES SUPORTE</span>
            <h2 id="si-config-title">Configurações e fontes</h2>
            <p>Filtros, apresentação, atualizações e critérios da análise.</p>
          </div>
          <button
            type="button"
            aria-label="Fechar configurações"
            onClick={() => {
              onClose();
            }}
          >
            Fechar
          </button>
        </header>
        <nav className="si-config-tabs" role="tablist" aria-label="Seções de configuração">
          {configurationSections.map(([key, label, description]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`si-config-tab-${key}`}
              aria-controls={`si-config-panel-${key}`}
              aria-selected={configurationSection === key}
              tabIndex={configurationSection === key ? 0 : -1}
              onClick={() => setConfigurationSection(key)}
              onKeyDown={(event) => {
                const keys = configurationSections.map(([sectionKey]) => sectionKey);
                const focusedKey = event.currentTarget.id.replace('si-config-tab-', '');
                const currentIndex = keys.indexOf(focusedKey);
                const nextIndex =
                  event.key === 'ArrowRight'
                    ? (currentIndex + 1) % keys.length
                    : event.key === 'ArrowLeft'
                      ? (currentIndex - 1 + keys.length) % keys.length
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? keys.length - 1
                          : currentIndex;
                if (nextIndex !== currentIndex) {
                  event.preventDefault();
                  setConfigurationSection(keys[nextIndex]);
                  document.getElementById(`si-config-tab-${keys[nextIndex]}`)?.focus();
                }
              }}
            >
              <strong>{label}</strong>
              <small>{description}</small>
            </button>
          ))}
        </nav>
        <div className="si-config-dialog-content">
          <section
            className="si-config-section"
            id="si-config-panel-analysis"
            role="tabpanel"
            aria-labelledby="si-config-tab-analysis"
            hidden={configurationSection !== 'analysis'}
            aria-label="Filtros da análise"
          >
            <h3>Período e equipe</h3>
            <div className="si-toolbar si-config-filters">
              <label>
                De
                <input
                  type="date"
                  value={period.start}
                  disabled={busy}
                  onChange={(e) => setPeriod({ ...period, start: e.target.value })}
                />
              </label>
              <label>
                Até
                <input
                  type="date"
                  value={period.end}
                  disabled={busy}
                  onChange={(e) => setPeriod({ ...period, end: e.target.value })}
                />
              </label>
              <label>
                Agente
                <select value={agentId} onChange={(e) => setAgent(e.target.value)}>
                  <option value="">Toda a equipe</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="si-shortcuts">
                {[
                  ['currentWeek', 'Semana atual'],
                  ['previousWeek', 'Semana anterior'],
                  ['month', 'Mês atual'],
                ].map(([key, label]) => (
                  <button key={key} disabled={busy} onClick={() => preset(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="scope">
              {valid
                ? `${date(period.start)} a ${date(period.end)} · comparação com ${date(past.start)} a ${date(past.end)}`
                : 'Informe um intervalo válido de até 366 dias.'}
            </p>
            {store.writable && (
              <IndicatorSettings
                settings={settings}
                revision={store.settingsRevision}
                ready={store.settingsReady && !manualDirty}
                busy={store.busy}
                save={store.save}
              />
            )}
          </section>
          <div
            id="si-config-panel-presentation"
            role="tabpanel"
            aria-labelledby="si-config-tab-presentation"
            hidden={configurationSection !== 'presentation'}
            className="si-config-tab-panel"
          >
            <section className="si-config-section" aria-label="Visualização da página">
              <div className="si-config-section-heading">
                <div>
                  <h3>Visualização da página</h3>
                  <p>Escolha como os gráficos e tabelas são organizados nesta tela.</p>
                </div>
                <div className="si-view-modes" role="group" aria-label="Modo de visualização">
                  <button
                    type="button"
                    aria-pressed={viewMode === 'compact'}
                    onClick={() => selectDensity('compact')}
                  >
                    Compacto
                  </button>
                  <button
                    type="button"
                    aria-pressed={viewMode === 'editorial'}
                    onClick={() => selectDensity('editorial')}
                  >
                    Editorial
                  </button>
                </div>
              </div>
            </section>
            <section
              className="si-config-section si-config-presentation"
              aria-label="Configuração da apresentação"
            >
              <div className="si-config-section-heading">
                <div>
                  <h3>Apresentação</h3>
                  <p>
                    Selecione os blocos e o estilo. Inicie para abrir a tela limpa de apresentação.
                  </p>
                </div>
                <div
                  className="si-presentation-style"
                  role="group"
                  aria-label="Estilo da apresentação"
                >
                  <button
                    type="button"
                    aria-pressed={presentationStyle === 'compact'}
                    onClick={() => setPresentationStyle('compact')}
                  >
                    Compacto
                  </button>
                  <button
                    type="button"
                    aria-pressed={presentationStyle === 'editorial'}
                    onClick={() => setPresentationStyle('editorial')}
                  >
                    Editorial
                  </button>
                </div>
              </div>
              <div className="si-presentation-options">
                {availablePresentationOptions.map((option) => (
                  <label key={option.key}>
                    <input
                      type="checkbox"
                      checked={presentationSelection.has(option.key)}
                      onChange={(event) =>
                        setPresentationSelection((current) => {
                          const next = new Set(current);
                          if (event.target.checked) next.add(option.key);
                          else next.delete(option.key);
                          return next;
                        })
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <div className="si-config-actions">
                <button
                  type="button"
                  onClick={() =>
                    setPresentationSelection(
                      new Set(availablePresentationOptions.map((option) => option.key)),
                    )
                  }
                >
                  Selecionar tudo
                </button>
                <button type="button" onClick={() => setPresentationSelection(new Set())}>
                  Limpar seleção
                </button>
                <button
                  type="button"
                  className="si-presentation-start"
                  disabled={!selectedPresentationCount}
                  onClick={() => {
                    onStartPresentation();
                  }}
                >
                  Iniciar apresentação
                </button>
              </div>
            </section>
          </div>
          <section
            className="si-config-section"
            id="si-config-panel-sources"
            role="tabpanel"
            aria-labelledby="si-config-tab-sources"
            hidden={configurationSection !== 'sources'}
            aria-label="Cobertura e fontes"
          >
            <h3>Dados usados na análise</h3>
            <SourceCoverage
              ordersData={ordersData}
              orders={orders}
              zohoData={zohoData}
              zoho={zoho}
              manual={manual}
              store={store}
              period={period}
              valid={valid}
            />
            <div className="si-config-source-group">
              <h4>Bases disponíveis</h4>
              <div className="si-config-source-status">
                <div>
                  <strong>OS</strong>
                  <span>{sources.orders?.value?.filename || 'Base não carregada'}</span>
                  {ordersData && <small>{number(ordersData.rows.length)} linhas disponíveis</small>}
                </div>
                <div>
                  <strong>Zoho Desk</strong>
                  <span>
                    {zoho
                      ? `Consulta ${date(zohoData.period.start)} a ${date(zohoData.period.end)}`
                      : 'Sem consulta completa para o período'}
                  </span>
                  {zohoData?.readAt && <small>Atualizado em {timestamp(zohoData.readAt)}</small>}
                </div>
                <div>
                  <strong>Manual</strong>
                  <span>
                    {store.loading
                      ? 'Carregando banco'
                      : store.ready
                        ? `${number(manual?.entries.length || 0)} lançamentos no recorte`
                        : 'Sem dados carregados'}
                  </span>
                  <small>Campos vazios não equivalem a zero.</small>
                </div>
              </div>
            </div>
            <div className="si-config-query-group">
              <h4>Consultas salvas</h4>
              <WorkspaceQueryPanel
                kind="zoho-indicators"
                value={ownZoho ? { data: ownZoho } : null}
                disabled={busy || backlogBusy || manualDirty}
                onLoad={(saved) => setOwnZoho(saved.data)}
              />
              <WorkspaceQueryPanel
                kind="zoho-backlog"
                value={ownBacklog ? { data: ownBacklog } : null}
                disabled={busy || backlogBusy}
                onLoad={(saved) => setOwnBacklog(saved.data)}
              />
            </div>
            <div className="si-config-actions si-config-data-actions">
              <strong>Atualizar dados</strong>
              <button
                disabled={
                  !store.writable ||
                  !valid ||
                  busy ||
                  backlogBusy ||
                  periodDaysSafe(period) > 31 ||
                  period.start > today
                }
                onClick={loadZoho}
              >
                {busy ? `Consultando ${progress} chamados…` : 'Consultar Zoho neste período'}
              </button>
              {busy && <button onClick={() => cancelZoho()}>Cancelar</button>}
              <button disabled={store.loading || store.busy} onClick={store.reload}>
                Recarregar lançamentos
              </button>
            </div>
            <details className="si-source-details">
              <summary>Diagnósticos, critérios e validações</summary>
              <p className="scope">
                Zoho: até 31 dias por consulta. Tempo é a soma dos apontamentos nos chamados, não
                tempo conectado. Aberturas exigem autoria confirmada no histórico. Assuntos usam a
                categoria atual dos chamados fechados. Sem consulta completa, os lançamentos manuais
                são apresentados separadamente como alternativa.
              </p>
              <p className="scope">
                Agenda e execução são etapas distintas. Execuções efetivas: Concluída/Pago, sem
                Visita Improdutiva. Agenda: status Agendado, data e responsável válidos. Campos
                manuais vazios não representam zero.
              </p>
              <details>
                <summary>Validar autoria de abertura e assuntos no Zoho</summary>
                <p className="scope">
                  Amostra recente para conferir autoria de abertura e categorias, sem alterar os
                  indicadores.
                </p>
                <button
                  disabled={!store.writable || profileBusy || busy || backlogBusy}
                  onClick={inspectProfile}
                >
                  {profileBusy
                    ? 'Conferindo amostra…'
                    : 'Consultar amostra de autoria e categorias'}
                </button>
                {profile?.coverage && <p className="scope">{profile.coverage}</p>}
              </details>
            </details>
            {(error || store.error) && (
              <p className="error" role="alert">
                {error || store.error}
              </p>
            )}
          </section>
          <section
            className="si-config-section si-config-backlog"
            id="si-config-panel-backlog"
            role="tabpanel"
            aria-labelledby="si-config-tab-backlog"
            hidden={configurationSection !== 'backlog'}
            aria-label="Pendências atuais no Zoho"
          >
            <div>
              <h3>Pendências atuais · Zoho</h3>
              <p>
                Chamados atribuídos e não encerrados, inclusive os em espera. Não usa o filtro de
                período.
              </p>
            </div>
            <div className="si-config-actions">
              {backlog && (
                <strong>
                  {number(backlog.total)} pendentes · {number(backlog.onHold)} em espera
                </strong>
              )}
              <button disabled={!store.writable || backlogBusy || busy} onClick={loadBacklog}>
                {backlogBusy
                  ? `Conferindo ${backlogProgress} chamados…`
                  : 'Consultar pendências atuais'}
              </button>
              {backlogBusy && <button onClick={() => cancelBacklog()}>Cancelar</button>}
            </div>
            <small>
              {backlog
                ? `Consultado em ${timestamp(backlog.readAt)} · carteira pode mudar após a leitura.`
                : 'Consulta da carteira atual pendente.'}
            </small>
            {backlogError && (
              <p className="error" role="alert">
                {backlogError}
              </p>
            )}
          </section>
        </div>
        <footer className="si-config-dialog-footer">
          <span>
            {valid
              ? `${date(period.start)} a ${date(period.end)} · ${selectedPresentationCount} blocos selecionados`
              : 'Período inválido'}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
            }}
          >
            Concluído
          </button>
        </footer>
      </section>
    </div>
  );
}
