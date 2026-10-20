/** Coordena acompanhamento e análise sem misturar demonstração e integração real. */
import React, { useEffect, useMemo, useState } from 'react';
import { usePublishDashboardSource } from '../../my-dashboard/hooks/DashboardSources.jsx';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
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

const initialFilters = () => ({
  clients: [],
  threshold: 48,
  state: 'all',
  focus: 'all',
  stage: 'all',
  search: '',
});

/** Bases/limite pertencem à análise; busca, situação, status e recorte pertencem à fila/exportação. */
export function MonitoringPage({ onPage }) {
  const { snapshot, source, busy, error, demonstration, refresh } = useMonitoringSource();
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
  const result = snapshot ? monitorSnapshot(snapshot, filters) : null;
  const queue = result ? filterMonitoringQueue(result, filters, notes) : null;
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
          (snapshot.vehicles.find((row) => row.clientId === entry.clientId)?.clientName || 'Base') +
          ' · ' +
          entry.clientId,
      }))
    : [];
  const tables = queue ? monitoringReport(queue, filters, notes, reminders.records) : null;
  const scopeLabel = `Monitoramento Ativo → ${{ queue: 'Acompanhamento', overview: 'Visão analítica', reports: 'Relatórios' }[category]}`;
  const chips = filterChips(filters, {
    labels: {
      clients: 'Bases',
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
        : key === 'threshold'
          ? `${value} horas`
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
  function openQueue(focus, clientId) {
    setFilters(
      (previous) => ({
        ...previous,
        threshold: filters.threshold,
        focus,
        clients: clientId ? [clientId] : filters.clients,
        state: 'all',
        stage: 'all',
        search: '',
      }),
      'queue',
    );
    setSelected(null);
    setPage(0);
    setCategory('queue');
  }
  const exportFile = (format) =>
    download(
      format === 'csv' ? monitoringCsv(tables) : monitoringWorkbook(tables),
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      (demo ? 'DEMO-' : '') + 'monitoramento.' + format,
    );
  const modeNotice = (
    <div className="notice">
      {demo
        ? 'DEMONSTRAÇÃO — Dados fictícios, referência congelada e critérios provisórios. Nenhuma API real está conectada nesta demonstração. Anotações somente nesta sessão.'
        : snapshot
          ? 'Retrato recebido da integração. Classificação recalculada a cada minuto; nova consulta é manual. Anotações somente nesta sessão, sem sincronização entre usuários.'
          : 'Integração em preparação. A consulta autenticada está pronta para receber o coletor; a demonstração usa somente dados fictícios.'}
    </div>
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
            ].map(([key, label]) => (
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
                <button disabled={busy} onClick={refresh}>
                  {busy
                    ? 'Consultando integração…'
                    : snapshot && !demo
                      ? 'Atualizar dados'
                      : 'Consultar integração'}
                </button>
                <button onClick={demonstration}>
                  {demo ? 'Sair da demonstração' : 'Explorar demonstração'}
                </button>
              </div>
            </header>
            {error && (
              <p role="alert" className="notice">
                {error}{' '}
                {snapshot && !demo
                  ? 'A frota anterior foi mantida com coleta indisponível, sem novos alertas utilizáveis.'
                  : ''}
              </p>
            )}
            <MonitoringReminders key={demo ? 'demo' : 'real'} reminders={reminders} demo={demo} />
            {!snapshot ? (
              <>
                {modeNotice}
                <section className="panel monitoring-preparation">
                  <h2>Preparado para receber a API</h2>
                  <p>
                    A conexão será feita pelo servidor após confirmar autenticação, campos, fuso e
                    paginação. Nenhum token é solicitado ou armazenado nesta tela. Histórico
                    compartilhado e coleta automática dependem da próxima etapa.
                  </p>
                </section>
              </>
            ) : (
              <>
                <FilterPanel
                  savedView={{
                    scopeKey: `monitoring:${demo ? 'demo' : 'real'}:${category}`,
                    state: { filters },
                    validate: (view) =>
                      (view.filters?.clients || []).some(
                        (id) => !bases.some((base) => base.id === id),
                      )
                        ? 'Uma base desta visão não está disponível nesta fonte. Atualize a visão antes de aplicar.'
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
                  help="Cada categoria mantém filtros próprios. Tempo desde o último registro até a referência exibida. Faixas de 48/72/96 h e validade da coleta inferior a 2 h são provisórias. Falha de coleta, datas inválidas/futuras ou posição ausente não confirmam interrupção. Bases e limite afetam a análise desta categoria; busca, situação, acompanhamento e recorte afetam sua fila/exportação, sem alterar o denominador dos cards. Clicar em um card abre Acompanhamento e aplica explicitamente as bases, o limite e o recorte desse card na fila, sem modificar os filtros da visão analítica."
                  source={`Referência: ${monitoringDate(snapshot.referenceAt)} · São Paulo · Limite: ${filters.threshold} horas · ${demo ? 'Dados fictícios' : 'Retrato recebido: ' + monitoringDate(source.referenceAt)}`}
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
                          bases.filter((base) => value.includes(base.label)).map((base) => base.id),
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
                        {[48, 72, 96].map((hours) => (
                          <option key={hours} value={hours}>
                            {hours} horas
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
                          placeholder="Placa, rastreador, cliente, perfil ou responsável…"
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
                {modeNotice}
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
                  result={queue}
                  notes={notes}
                  reminders={reminders}
                  onRecord={(key, value) => setNotes((previous) => ({ ...previous, [key]: value }))}
                  selected={selected}
                  onSelect={setSelected}
                  page={page}
                  setPage={setPage}
                />
                <MonitoringAnalytics
                  visible={category === 'overview'}
                  result={result}
                  notes={notes}
                  threshold={filters.threshold}
                  onQueue={openQueue}
                />
                <div hidden={category !== 'reports'}>
                  <Section
                    title="Relatório de acompanhamento"
                    help="Exporta todos os veículos do recorte da fila, independentemente da paginação, incluindo busca, situação, status e recorte selecionados. Inclui referência, critérios, dados recebidos, indicadores analíticos das bases, histórico de tratamento e lembretes salvos dos veículos do recorte. Rascunhos não são exportados. Resumo por base e indicadores abrangem todas as situações das bases selecionadas. Tratamento permanece somente nesta sessão; lembretes ficam neste navegador, sem armazenamento compartilhado. O CSV do painel Lembretes inclui todo seu histórico local do modo atual, independentemente da fila."
                  >
                    <p>
                      {queue.rows.length} veículos · Referência{' '}
                      {monitoringDate(snapshot.referenceAt)} ·{' '}
                      {demo ? 'DADOS FICTÍCIOS' : 'Dados da integração'}
                    </p>
                    <div className="monitoring-actions">
                      <PermissionButton action="export" onClick={() => exportFile('xlsx')}>
                        Exportar XLSX{demo ? ' de demonstração' : ''}
                      </PermissionButton>
                      <PermissionButton action="export" onClick={() => exportFile('csv')}>
                        Exportar CSV{demo ? ' de demonstração' : ''}
                      </PermissionButton>
                    </div>
                    <p className="scope">
                      Histórico de episódios, recuperações, consumo e notificações dependem da
                      integração e persistência das coletas. Lembretes manuais são locais e constam
                      na aba Lembretes do XLSX.
                    </p>
                  </Section>
                </div>
              </>
            )}
          </main>
        </PrintContext.Provider>
      </div>
    </SidePanelProvider>
  );
}
