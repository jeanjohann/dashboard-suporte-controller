import { clientDisplay } from '../../../shared/data/clientDisplay.js';
import { MonitoringRegistry } from './MonitoringRegistry.jsx';
import { MonitoringPriorityCards } from './MonitoringPriorityCards.jsx';
import { MonitoringCollectionHistory } from './MonitoringCollectionHistory.jsx';
import { MonitoringEvents } from './MonitoringEvents.jsx';
import { MonitoringApiCoverage } from './MonitoringApiCoverage.jsx';
import { RetainedContent } from '../../../components/RetainedContent.jsx';
import { useRetainedValue } from '../../../shared/data/useRetainedValue.js';
import { monitoringThresholds, monitoringPeriodLabel } from '../domain/monitoringPeriods.js';
/** Coordena acompanhamento e análise sem misturar demonstração e integração real. */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePublishDashboardSource } from '../../my-dashboard/hooks/DashboardSources.jsx';
import { Navigation } from '../../../app/Navigation.jsx';
import { PageConfigurationButton } from '../../../components/PageConfigurationButton.jsx';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { PermissionButton, useAccess } from '../../../shared/security/Access.jsx';
import { allowsPage } from '../../../shared/security/permissions.js';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { SourceStatus } from '../../../components/SourceStatus.jsx';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { download } from '../../../shared/export/exports.js';
import { MonitoringQueue } from './MonitoringQueue.jsx';
import { MonitoringAnalytics } from './MonitoringAnalytics.jsx';
import { MonitoringReminders } from './MonitoringReminders.jsx';
import { useMonitoringReminders } from '../hooks/useMonitoringReminders.js';
import { useMonitoringTreatments } from '../hooks/useMonitoringTreatments.js';
import { useMonitoringSource } from '../hooks/useMonitoringSource.js';
import {
  monitorSnapshot,
  monitoringDate,
  monitoringStates,
  monitoringStages,
} from '../domain/monitoring.js';
import { filterMonitoringQueue, monitoringFocusLabels } from '../domain/monitoringAnalytics.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from '../domain/monitoringReport.js';
import { useScopedSelection } from '../../../shared/filters/useScopedSelection.js';
import { filterChips, filterDisplay } from '../../../shared/filters/scopedSelection.js';
import { FilterPanel, FilterCount } from '../../../components/FilterPanel.jsx';
import { modelLabel, monitoringModel } from '../domain/monitoringTelemetry.js';
import { reconcileMonitoringRegistry } from '../domain/monitoringRegistry.js';
import { reminderOverdue } from '../domain/monitoringReminders.js';

const initialFilters = () => ({
  clients: [],
  models: [],
  threshold: 48,
  state: 'all',
  focus: 'all',
  stage: 'all',
  search: '',
});

/** Bases/limite pertencem à análise; busca, situação, status e recorte pertencem à fila/exportação. */
export function MonitoringPage({ onPage, operational, active = true, sourceActive = active }) {
  const { user } = useAccess();
  const canReview = allowsPage(user, 'operational') || allowsPage(user, 'operational-analysis');
  const {
    snapshot,
    source,
    busy,
    loadingSaved,
    cooldown,
    error,
    refresh,
    savedMode,
    savedAt,
    lastAttempt,
    reloadSaved,
  } = useMonitoringSource(sourceActive);
  const dashboardSource = useMemo(
    () => (snapshot ? { snapshot, error } : null),
    [source, snapshot?.referenceAt, error],
  );
  usePublishDashboardSource('monitoring', dashboardSource);
  const [category, setCategory] = useState('queue');
  const { filters, setFilters, resetSelections, counts } = useScopedSelection(
    category,
    initialFilters,
  );
  const [eventTarget, setEventTarget] = useState(null),
    [selected, setSelected] = useState(null),
    [page, setPage] = useState(0),
    [pageSize, setPageSize] = useState(10),
    [registryEquivalences, setRegistryEquivalences] = useState({}),
    [registryFilter, setRegistryFilter] = useState('all');
  const demo = snapshot?.demonstration === true;
  const reminders = useMonitoringReminders(demo, active);
  const treatments = useMonitoringTreatments(demo, active);
  const notes = treatments.records;
  const analysisSnapshot = useRetainedValue(snapshot, active);
  const result = useMemo(
    () => (analysisSnapshot ? monitorSnapshot(analysisSnapshot, filters) : null),
    [analysisSnapshot, filters.clients, filters.models, filters.threshold, filters.state],
  );
  const queue = useMemo(
    () =>
      result
        ? filterMonitoringQueue(result, filters, notes, reminders.records, reminders.now)
        : null,
    [result, filters, notes, reminders.records, reminders.now],
  );
  const registryReport = useMemo(
    () =>
      canReview && operational?.data && snapshot && !demo
        ? reconcileMonitoringRegistry(snapshot, operational.data, registryEquivalences)
        : null,
    [canReview, operational?.data, snapshot, demo, registryEquivalences],
  );
  useEffect(() => {
    let saved = {};
    try {
      const value = JSON.parse(
        localStorage.getItem(`monitoring-base-equivalences-v1:${user?.email || 'local'}`) || '{}',
      );
      if (
        value &&
        !Array.isArray(value) &&
        typeof value === 'object' &&
        Object.values(value).every((entry) => typeof entry === 'string' && entry.length <= 300)
      )
        saved = value;
    } catch {}
    setRegistryEquivalences(saved);
  }, [user?.email]);
  const overdueCount = useMemo(() => {
    if (!result) return 0;
    const keys = new Set(
      reminders.records
        .filter((record) => reminderOverdue(record, reminders.now))
        .map((record) => record.key),
    );
    return result.scoped.filter((row) => keys.has(row.key)).length;
  }, [result, reminders.records, reminders.now]);
  // Identidades da demonstração nunca compartilham tratamento com veículos reais.
  useEffect(() => {
    setSelected(null);
    setPage(0);
    resetSelections();
  }, [source?.demonstration]);
  useEffect(() => {
    setPage(0);
    setSelected(null);
  }, [category]);
  useEffect(() => {
    if (category !== 'queue' || !eventTarget) return;
    const index = queue?.rows.findIndex((row) => row.key === eventTarget) ?? -1;
    if (index >= 0) {
      setSelected(eventTarget);
      setPage(Math.floor(index / pageSize));
      setEventTarget(null);
    }
  }, [category, queue, eventTarget, pageSize]);
  function openEventVehicle(row) {
    setFilters(
      { ...initialFilters(), clients: [row.clientId], search: row.plate || row.trackerId || '' },
      'queue',
    );
    setCategory('queue');
    setEventTarget(JSON.stringify([row.clientId, row.vehicleId]));
  }
  const bases = snapshot
    ? snapshot.collections.map((entry) => ({
        id: entry.clientId,
        label:
          clientDisplay(
            snapshot.vehicles.find((row) => row.clientId === entry.clientId)?.clientName || 'Base',
          ) +
          ' · ' +
          entry.clientId,
      }))
    : [];
  const [analyticsOpened, setAnalyticsOpened] = useState(false);
  useEffect(() => {
    if (category === 'overview') setAnalyticsOpened(true);
  }, [category]);
  const models = snapshot
    ? [...new Set(snapshot.vehicles.map(monitoringModel))]
        .sort()
        .map((id) => ({ id, label: modelLabel(id) }))
    : [];
  const scopeLabel = `Monitoramento Ativo → ${{ queue: 'Acompanhamento', overview: 'Visão analítica', reports: 'Relatórios', registry: 'Conferência de cadastros' }[category]}`;
  const chips = filterChips(filters, {
    labels: {
      clients: 'Bases',
      models: 'Modelos',
      threshold: 'Limite',
      state: 'Situação técnica',
      focus: 'Recorte da fila',
      stage: 'Acompanhamento',
      search: 'Busca',
    },
    defaults: initialFilters(),
    format: (value, key) =>
      key === 'clients'
        ? value.map((id) => bases.find((base) => base.id === id)?.label || id).join(', ')
        : key === 'models'
          ? value.map(modelLabel).join(', ')
          : key === 'threshold'
            ? monitoringPeriodLabel(value)
            : key === 'state'
              ? monitoringStates[value] || value
              : key === 'focus'
                ? monitoringFocusLabels[value] || value
                : filterDisplay(value),
    remove: (key) => {
      setFilters((previous) => ({ ...previous, [key]: initialFilters()[key] }));
      setSelected(null);
      setPage(0);
    },
  });
  const update = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setSelected(null);
    setPage(0);
  };
  const openQueue = useCallback(
    (focus, clientId, model) => {
      setFilters(
        (previous) => ({
          ...previous,
          threshold: filters.threshold,
          focus,
          clients: clientId ? [clientId] : filters.clients,
          models: model == null ? filters.models : [model],
          state: 'all',
          stage: 'all',
          search: '',
        }),
        'queue',
      );
      setSelected(null);
      setPage(0);
      setCategory('queue');
    },
    [setFilters, filters.threshold, filters.clients, filters.models],
  );
  const [exportBusy, setExportBusy] = useState(false),
    [exportError, setExportError] = useState('');
  async function exportFile(format) {
    if (exportBusy || !queue) return;
    setExportBusy(true);
    setExportError('');
    try {
      const tables = monitoringReport(queue, filters, notes, reminders.records, reminders.mode);
      const content =
        format === 'xlsx'
          ? monitoringWorkbook(tables)
          : monitoringCsv(tables, { vehiclesOnly: format === 'csv' });
      await download(
        content,
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=utf-8',
        'monitoramento-' +
          (format === 'sections'
            ? 'completo'
            : { queue: 'acompanhamento', reports: 'relatorios', overview: 'analitico' }[category] ||
              'cadastros') +
          '.' +
          (format === 'xlsx' ? 'xlsx' : 'csv'),
      );
    } catch {
      setExportError('Não foi possível exportar. Tente novamente ou use o outro formato.');
    } finally {
      setExportBusy(false);
    }
  }
  const exportActions = (
    <>
      <PermissionButton action="export" disabled={exportBusy} onClick={() => exportFile('xlsx')}>
        Exportar XLSX
      </PermissionButton>
      <PermissionButton action="export" disabled={exportBusy} onClick={() => exportFile('csv')}>
        CSV da grade
      </PermissionButton>
      <span className="scope">
        {queue?.rows.length || 0} veículos · recorte completo da categoria atual
      </span>
    </>
  );
  return (
    <SidePanelProvider>
      <div className="app monitoring-page">
        <Navigation page="monitoring" onPage={onPage} />
        <SidebarContent>
          <div className="monitoring-menu">
            {[
              ['queue', 'Acompanhamento'],
              ['overview', 'Visão analítica'],
              ['reports', 'Relatórios'],
              ['registry', 'Conferência de cadastros'],
            ]
              .filter(([key]) => key !== 'registry' || canReview)
              .map(([key, label]) => (
                <button
                  key={key}
                  className={category === key ? 'active' : ''}
                  aria-pressed={category === key}
                  onClick={() => {
                    if (key === 'registry') setRegistryFilter('all');
                    setCategory(key);
                  }}
                >
                  {label}
                  <FilterCount count={counts[key]} />
                </button>
              ))}
          </div>
        </SidebarContent>
        <PrintContext.Provider
          value={{
            filename: demo ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'Integração de monitoramento',
            filters: { ...filters, alcance: scopeLabel },
            referenceDate: snapshot?.referenceAt,
          }}
        >
          <main>
            <header>
              <div>
                <div className="eyebrow">MONITORAMENTO PREVENTIVO</div>
                <h1>Monitoramento Ativo</h1>
                <p>Comunicação, prioridades e acompanhamento do suporte.</p>
              </div>
              <div className="monitoring-actions">
                <PageConfigurationButton
                  scope="Monitoramento ativo"
                  description="Fonte, agenda de coleta e limites dos dados desta página."
                >
                  <section>
                    <h3>Atualização dos dados</h3>
                    <p>
                      {savedMode
                        ? 'A base é salva com coletas agendadas às 9h, 12h, 15h e 18h (São Paulo). A atualização manual permanece disponível.'
                        : 'A leitura atual é uma consulta manual à integração.'}{' '}
                      A classificação da fila é recalculada localmente a cada minuto, sem nova
                      chamada à API.
                    </p>
                  </section>
                  <section>
                    <h3>Limites da fonte</h3>
                    <p>
                      {snapshot?.source === 'addlog-legacy'
                        ? `A fonte é o sistema legado Addlog. Posições são registros de comunicação e não equivalem a megabytes. Geração informada: ${snapshot.sourceGeneratedAt} (fuso não confirmado). A API atual não disponibiliza telefone, ICCID, operadora ou consumo de dados.`
                        : 'A origem e o escopo da leitura aparecem no status da coleta. Campos não fornecidos pela API não são estimados.'}
                    </p>
                  </section>
                  <section>
                    <h3>Anotações e filtros</h3>
                    <p>
                      Os filtros da análise e da fila permanecem visíveis na página. Anotações de
                      acompanhamento são temporárias nesta sessão e não sincronizam entre usuários.
                    </p>
                  </section>
                </PageConfigurationButton>
                <button disabled={busy || loadingSaved || cooldown > 0} onClick={refresh}>
                  {loadingSaved
                    ? 'Carregando base salva…'
                    : busy
                      ? 'Consultando integração…'
                      : cooldown > 0
                        ? `Aguarde ${cooldown} s`
                        : snapshot && !demo
                          ? 'Atualizar dados'
                          : 'Consultar integração'}
                </button>
              </div>
            </header>
            {(savedMode || snapshot || error) && (
              <div className="monitoring-saved-status">
                <div className="source-status-list" aria-label="Estado da fonte de monitoramento">
                  <SourceStatus
                    name="Monitoramento ativo"
                    state={
                      loadingSaved
                        ? 'loading'
                        : error && !snapshot
                          ? 'error'
                          : snapshot
                            ? 'ready'
                            : 'pending'
                    }
                    label={
                      loadingSaved
                        ? 'Carregando base salva'
                        : error && !snapshot
                          ? 'Falha ao consultar a fonte'
                          : snapshot
                            ? `Última leitura: ${monitoringDate(snapshot.referenceAt)}`
                            : 'Aguardando primeira coleta'
                    }
                    detail={
                      savedMode
                        ? 'Coletas às 9h, 12h, 15h e 18h · histórico de 30 dias.'
                        : snapshot
                          ? 'Consulta manual · a data da leitura identifica este retrato.'
                          : 'Use Consultar integração para iniciar uma leitura.'
                    }
                  />
                  {lastAttempt?.status === 'failed' && (
                    <SourceStatus
                      name="Última tentativa"
                      state="error"
                      label="Coleta não concluída"
                      detail={
                        snapshot
                          ? 'A base anterior foi preservada; confira a data antes de usar os dados.'
                          : 'Tente consultar novamente. Ainda não há uma base válida para esta sessão.'
                      }
                    />
                  )}
                </div>
                {savedMode && (
                  <button onClick={reloadSaved} disabled={busy || loadingSaved}>
                    {loadingSaved ? 'Carregando base salva…' : 'Carregar base salva'}
                  </button>
                )}
              </div>
            )}
            {error && (
              <p role="alert" className="notice">
                {error}{' '}
                {snapshot && !demo
                  ? 'A frota anterior foi mantida com coleta indisponível, sem novos alertas utilizáveis.'
                  : ''}
              </p>
            )}

            {!snapshot ? (
              <>
                <MonitoringReminders reminders={reminders} demo={false} />
                {savedMode && ['queue', 'reports'].includes(category) && (
                  <MonitoringEvents
                    savedAt={savedAt}
                    snapshot={source}
                    onVehicle={openEventVehicle}
                  />
                )}
                <section className="panel monitoring-preparation">
                  <h2>
                    {error
                      ? 'A consulta não foi concluída'
                      : savedMode
                        ? 'Aguardando a primeira coleta'
                        : 'Consulta ainda não realizada'}
                  </h2>
                  <p>
                    {error
                      ? 'A conexão ou a leitura da base falhou. Confira a mensagem acima e tente consultar novamente; a consulta não será tratada como uma frota vazia.'
                      : savedMode
                        ? 'Ainda não existe um retrato válido salvo. Faça a primeira coleta; depois, as próximas serão agendadas às 9h, 12h, 15h e 18h (São Paulo).'
                        : 'A conexão com o sistema legado Addlog é configurada pelo administrador no servidor. Consulte a integração para obter o retrato atual.'}
                  </p>
                </section>
              </>
            ) : (
              <>
                {category !== 'registry' && (
                  <FilterPanel
                    savedView={{
                      scopeKey: `monitoring:${demo ? 'demo' : 'real'}:${category}`,
                      state: { filters },
                      validate: (view) =>
                        (view.filters?.models || []).some(
                          (id) => !models.some((model) => model.id === id),
                        ) ||
                        (view.filters?.clients || []).some(
                          (id) => !bases.some((base) => base.id === id),
                        )
                          ? 'Uma base ou modelo desta visão não está disponível nesta fonte. Atualize a visão antes de aplicar.'
                          : '',
                      onApply: (view) => {
                        setFilters({ ...initialFilters(), ...view.filters });
                        setPage(0);
                        setSelected(null);
                      },
                    }}
                    scope={scopeLabel}
                    chips={chips}
                    matched={category === 'overview' ? result.totals.fleet : queue.rows.length}
                    total={snapshot.vehicles.length}
                    onClear={() => {
                      setFilters(initialFilters());
                      setSelected(null);
                      setPage(0);
                    }}
                    help="Cada categoria mantém filtros próprios. Tempo desde o último registro até a referência exibida. Faixas de 48/72/96 horas e 30/60/90 dias e validade da coleta inferior a 2 h são provisórias. Falha de coleta, datas inválidas/futuras ou posição ausente não confirmam interrupção. Bases, modelos e limite afetam a análise desta categoria; busca, situação, acompanhamento e recorte afetam sua fila/exportação, sem alterar o denominador dos cards. Clicar em um card abre Acompanhamento e aplica explicitamente as bases, os modelos, o limite e o recorte desse card na fila, sem modificar os filtros da visão analítica."
                    source={`Referência: ${monitoringDate(snapshot.referenceAt)} · São Paulo · Limite: ${monitoringPeriodLabel(filters.threshold)} · ${demo ? 'Dados fictícios' : 'Retrato recebido: ' + monitoringDate(source.referenceAt)}`}
                  >
                    <div className="monitoring-filter-fields">
                      <MultiFilter
                        label="Bases de clientes"
                        options={bases.map((base) => base.label)}
                        values={bases
                          .filter((base) => filters.clients.includes(base.id))
                          .map((base) => base.label)}
                        onChange={(value) =>
                          update(
                            'clients',
                            bases
                              .filter((base) => value.includes(base.label))
                              .map((base) => base.id),
                          )
                        }
                      />
                      <MultiFilter
                        label="Modelos de equipamento"
                        options={models.map((model) => model.label)}
                        values={models
                          .filter((model) => filters.models.includes(model.id))
                          .map((model) => model.label)}
                        onChange={(value) =>
                          update(
                            'models',
                            models
                              .filter((model) => value.includes(model.label))
                              .map((model) => model.id),
                          )
                        }
                      />
                      <label>
                        Limite de atenção
                        <select
                          aria-label="Limite de atenção"
                          value={filters.threshold}
                          onChange={(event) => update('threshold', Number(event.target.value))}
                        >
                          {monitoringThresholds.map((hours) => (
                            <option key={hours} value={hours}>
                              {monitoringPeriodLabel(hours)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {category !== 'overview' && (
                      <div className="monitoring-queue-filters" data-no-print>
                        <label>
                          Buscar veículo
                          <input
                            aria-label="Buscar veículo"
                            type="search"
                            placeholder="Placa, rastreador, modelo, cliente, perfil ou responsável…"
                            value={filters.search}
                            onChange={(event) => update('search', event.target.value)}
                          />
                        </label>
                        <label>
                          Situação técnica
                          <select
                            aria-label="Situação técnica"
                            value={filters.state}
                            onChange={(event) => update('state', event.target.value)}
                          >
                            <option value="all">Todas</option>
                            {Object.entries(monitoringStates).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Status de acompanhamento
                          <select
                            aria-label="Filtrar acompanhamento"
                            value={filters.stage}
                            onChange={(event) => update('stage', event.target.value)}
                          >
                            <option value="all">Todos</option>
                            {monitoringStages.map((stage) => (
                              <option key={stage}>{stage}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Recorte da fila
                          <select
                            aria-label="Recorte da fila"
                            value={filters.focus}
                            onChange={(event) => update('focus', event.target.value)}
                          >
                            {Object.entries(monitoringFocusLabels).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <p className="scope" role="status">
                          {queue.rows.length} de {result.totals.fleet} veículos no recorte da fila.
                          Exportação usa este mesmo recorte; cards usam todas as situações das bases
                          selecionadas.
                        </p>
                      </div>
                    )}
                  </FilterPanel>
                )}
                {category === 'queue' && result && (
                  <MonitoringPriorityCards
                    result={result}
                    overdue={overdueCount}
                    canReview={canReview}
                    registryCount={
                      registryReport?.rows.filter(
                        (row) => row.state !== 'Compatível nos campos comparados',
                      ).length
                    }
                    registryReady={!!registryReport}
                    activeFocus={filters.focus}
                    onFocus={(focus) => openQueue(focus)}
                    onRegistry={() => {
                      setRegistryFilter('review');
                      setCategory('registry');
                    }}
                  />
                )}
                <MonitoringReminders reminders={reminders} demo={false} />
                {exportError && (
                  <p role="alert" className="notice">
                    {exportError}
                  </p>
                )}
                {(result.totals.stale > 0 ||
                  result.totals.invalid > 0 ||
                  result.issues.length > 0) && (
                  <p role="status" className="notice">
                    Coleta desatualizada/indisponível: {result.totals.stale} · Datas para revisão:{' '}
                    {result.totals.invalid} · Registros excluídos por identificação:{' '}
                    {result.issues.length}.
                  </p>
                )}
                {category === 'queue' && treatment.loading && (
                  <p className="scope" role="status">
                    Carregando histórico de tratamento salvo…
                  </p>
                )}
                {category === 'queue' && treatment.error && (
                  <p className="notice" role="alert">
                    {treatment.error} O status e o histórico não foram presumidos.
                    <button type="button" onClick={treatment.reload}>
                      Tentar novamente
                    </button>
                  </p>
                )}
                <RetainedContent active={active && category === 'queue'}>
                  <MonitoringQueue
                    visible={category === 'queue'}
                    actions={exportActions}
                    result={queue}
                    notes={notes}
                    reminders={reminders}
                    onRecord={(vehicle, draft, revision) =>
                      treatments.change(vehicle, draft, revision)
                    }
                    treatment={treatments}
                    selected={selected}
                    onSelect={setSelected}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                  />
                </RetainedContent>
                {savedMode && category === 'queue' && (
                  <MonitoringEvents
                    savedAt={savedAt}
                    snapshot={source}
                    onVehicle={openEventVehicle}
                  />
                )}
                {category === 'registry' && (
                  <MonitoringRegistry
                    snapshot={snapshot}
                    operational={operational}
                    report={registryReport}
                    initialState={registryFilter}
                    onEquivalences={setRegistryEquivalences}
                    onPage={onPage}
                  />
                )}
                {analyticsOpened && (
                  <RetainedContent active={active && category === 'overview'}>
                    <MonitoringAnalytics
                      visible={category === 'overview'}
                      result={result}
                      notes={notes}
                      threshold={filters.threshold}
                      onQueue={openQueue}
                    />
                  </RetainedContent>
                )}
                <div hidden={category !== 'reports'}>
                  <Section
                    title="Relatório de acompanhamento"
                    help={`Exporta todos os veículos do recorte da fila, independentemente da paginação, incluindo busca, situação, status e recorte selecionados. Inclui referência, critérios, dados recebidos, indicadores analíticos das bases, histórico de tratamento e lembretes salvos dos veículos do recorte. Rascunhos não são exportados. Resumo por base e indicadores abrangem todas as situações das bases selecionadas. ${treatments.mode === 'remote' ? 'Tratamentos e lembretes usam o banco do sistema conforme acesso do piloto.' : 'Tratamentos e lembretes ficam neste navegador.'} O CSV do painel Lembretes inclui todo seu histórico confirmado, independentemente da fila.`}
                  >
                    <p>
                      {queue.rows.length} veículos · Referência{' '}
                      {monitoringDate(snapshot.referenceAt)} ·{' '}
                      {demo ? 'DADOS FICTÍCIOS' : 'Dados da integração'}
                    </p>
                    <div className="monitoring-actions">
                      {exportActions}
                      <PermissionButton
                        action="export"
                        disabled={exportBusy}
                        onClick={() => exportFile('sections')}
                      >
                        CSV completo por seções
                      </PermissionButton>
                    </div>
                    <p className="scope">
                      {savedMode
                        ? 'Fotografias e eventos observados são guardados por 30 dias no piloto; o relatório exporta a fotografia atual.'
                        : 'Histórico de episódios e recuperações depende da persistência das coletas.'}{' '}
                      Consumo da linha e notificações são etapas separadas. Lembretes confirmados
                      constam na aba Lembretes do XLSX.
                    </p>
                  </Section>
                </div>
                {savedMode && category === 'reports' && (
                  <MonitoringEvents
                    savedAt={savedAt}
                    snapshot={source}
                    onVehicle={openEventVehicle}
                  />
                )}
                {savedMode && category === 'reports' && <MonitoringCollectionHistory />}
                {['registry', 'reports'].includes(category) && (
                  <MonitoringApiCoverage source={source} />
                )}
              </>
            )}
          </main>
        </PrintContext.Provider>
      </div>
    </SidePanelProvider>
  );
}
