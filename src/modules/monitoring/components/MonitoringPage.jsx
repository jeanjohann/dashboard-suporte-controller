import { clientDisplay } from '../../../shared/data/clientDisplay.js';
import { MonitoringRegistry } from './MonitoringRegistry.jsx';
import { MonitoringCollectionHistory } from './MonitoringCollectionHistory.jsx';
import { monitoringThresholds, monitoringPeriodLabel } from '../domain/monitoringPeriods.js';
/** Coordena acompanhamento e análise sem misturar demonstração e integração real. */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePublishDashboardSource } from '../../my-dashboard/hooks/DashboardSources.jsx';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { PermissionButton, useAccess } from '../../../shared/security/Access.jsx';
import { allowsPage } from '../../../shared/security/permissions.js';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { download } from '../../../shared/export/exports.js';
import { MonitoringQueue } from './MonitoringQueue.jsx';
import { MonitoringAnalytics } from './MonitoringAnalytics.jsx';
import { MonitoringReminders } from './MonitoringReminders.jsx';
import { useMonitoringReminders } from '../hooks/useMonitoringReminders.js';
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
export function MonitoringPage({ onPage, operational }) {
  const { user } = useAccess();
  const canReview = allowsPage(user, 'operational') || allowsPage(user, 'operational-analysis');
  const {
    snapshot,
    source,
    busy,
    cooldown,
    error,
    refresh,
    savedMode,
    savedAt,
    lastAttempt,
    reloadSaved,
  } = useMonitoringSource();
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
  const [notes, setNotes] = useState({}),
    [selected, setSelected] = useState(null),
    [page, setPage] = useState(0);
  const result = useMemo(
    () => (snapshot ? monitorSnapshot(snapshot, filters) : null),
    [snapshot, filters.clients, filters.models, filters.threshold, filters.state],
  );
  const queue = useMemo(
    () => (result ? filterMonitoringQueue(result, filters, notes) : null),
    [result, filters, notes],
  );
  const demo = snapshot?.demonstration === true;
  const reminders = useMonitoringReminders(demo);
  // Identidades da demonstração nunca compartilham anotações com veículos reais.
  useEffect(() => {
    setNotes({});
    setSelected(null);
    setPage(0);
    resetSelections();
  }, [source?.demonstration]);
  useEffect(() => {
    setPage(0);
    setSelected(null);
  }, [category]);
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
  const modeNotice = snapshot && (
    <details className="monitoring-source-note">
      <summary>Fonte, atualização e limites desta leitura</summary>
      <p>
        {savedMode
          ? 'Base salva, com coleta agendada e atualização manual opcional'
          : 'Consulta manual'}
        ; classificação recalculada a cada minuto, sem nova chamada à API. Anotações somente nesta
        sessão, sem sincronização entre usuários.
      </p>
      {snapshot.source === 'addlog-legacy' && (
        <p>
          Fonte: sistema legado Addlog · Posições são registros de comunicação, sem equivalência em
          MB. Geração informada: {snapshot.sourceGeneratedAt} (fuso não confirmado). A documentação
          do diagnóstico integrado não disponibiliza telefone, ICCID, operadora ou consumo de dados.
        </p>
      )}
    </details>
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
                  onClick={() => setCategory(key)}
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
                <button disabled={busy || cooldown > 0} onClick={refresh}>
                  {busy
                    ? 'Consultando integração…'
                    : cooldown > 0
                      ? `Aguarde ${cooldown} s`
                      : snapshot && !demo
                        ? 'Atualizar dados'
                        : 'Consultar integração'}
                </button>
              </div>
            </header>
            {savedMode && (
              <div className="monitoring-saved-status">
                <span>
                  {savedAt
                    ? `Última base salva: ${monitoringDate(savedAt)}`
                    : 'Ainda não há uma coleta salva. Faça a primeira atualização ou aguarde o próximo horário.'}{' '}
                  · Coletas às 9h, 12h, 15h e 18h (São Paulo). Histórico de 30 dias.
                </span>
                <button onClick={reloadSaved} disabled={busy}>
                  Carregar base salva
                </button>
                {lastAttempt?.status === 'failed' && (
                  <p role="status">
                    A última tentativa de coleta falhou. A base anterior foi preservada; confira sua
                    data.
                  </p>
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
                <section className="panel monitoring-preparation">
                  <h2>Conexão com o sistema de rastreamento</h2>
                  <p>
                    Use Consultar integração para carregar o diagnóstico do sistema legado Addlog. O
                    acesso é configurado pelo administrador no servidor.{' '}
                    {savedMode
                      ? 'No piloto, a última coleta válida fica salva e as próximas são agendadas às 9h, 12h, 15h e 18h (São Paulo).'
                      : 'A coleta salva está disponível apenas para o administrador principal durante o piloto.'}
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
                <MonitoringQueue
                  visible={category === 'queue'}
                  actions={exportActions}
                  result={queue}
                  notes={notes}
                  reminders={reminders}
                  onRecord={(key, value) => setNotes((previous) => ({ ...previous, [key]: value }))}
                  selected={selected}
                  onSelect={setSelected}
                  page={page}
                  setPage={setPage}
                />
                {category === 'registry' && (
                  <MonitoringRegistry
                    snapshot={snapshot}
                    operational={operational}
                    onPage={onPage}
                  />
                )}
                {analyticsOpened && (
                  <MonitoringAnalytics
                    visible={category === 'overview'}
                    result={result}
                    notes={notes}
                    threshold={filters.threshold}
                    onQueue={openQueue}
                  />
                )}
                <div hidden={category !== 'reports'}>
                  <Section
                    title="Relatório de acompanhamento"
                    help={`Exporta todos os veículos do recorte da fila, independentemente da paginação, incluindo busca, situação, status e recorte selecionados. Inclui referência, critérios, dados recebidos, indicadores analíticos das bases, histórico de tratamento e lembretes salvos dos veículos do recorte. Rascunhos não são exportados. Resumo por base e indicadores abrangem todas as situações das bases selecionadas. Tratamento permanece somente nesta sessão; ${reminders.mode === 'remote' ? 'lembretes usam o banco do sistema conforme acesso do piloto' : 'lembretes ficam neste navegador, sem armazenamento compartilhado'}. O CSV do painel Lembretes inclui todo seu histórico confirmado, independentemente da fila.`}
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
                {savedMode && category === 'reports' && <MonitoringCollectionHistory />}
                {modeNotice}
              </>
            )}
          </main>
        </PrintContext.Provider>
      </div>
    </SidePanelProvider>
  );
}
