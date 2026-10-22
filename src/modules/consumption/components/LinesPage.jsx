/**
 * Interface de consumo M2M: importação, histórico local, filtros, conferência e exportação.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { consumptionRecordsCsv } from '../domain/consumptionRecordsReport.js';
import { usePublishDashboardSource } from '../../my-dashboard/hooks/DashboardSources.jsx';
import {
  consumptionCategories as categories,
  consumptionLayoutDefinitions,
} from '../config/consumptionMenus.js';
import { usePageLayout, PageLayoutProvider } from '../../../shared/layout/PageLayout.jsx';
import { ConsumptionOverviewPanels } from './ConsumptionOverviewPanels.jsx';
import { ConsumptionInvestigationPanel } from './ConsumptionInvestigationPanel.jsx';
import { ConsumptionEquipmentPanels } from './ConsumptionEquipmentPanels.jsx';
import { ConsumptionInvoicesPanel } from './ConsumptionInvoicesPanel.jsx';
import { ConsumptionSourcePanel } from './ConsumptionSourcePanel.jsx';
import { ConsumptionImportPreview } from './ConsumptionImportPreview.jsx';
import { ConsumptionImportHeader } from './ConsumptionImportHeader.jsx';
import { ConsumptionFiltersPanel } from './ConsumptionFiltersPanel.jsx';
import { useConsumptionImports } from '../hooks/useConsumptionImports.js';
import {
  consumptionFilterFields,
  consumptionPeriods,
  selectConsumptionRows,
} from '../domain/consumptionFilters.js';

import { PermissionButton } from '../../../shared/security/Access.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { Section, PrintContext, ExpansionContext } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { ReportControls } from '../../../components/ReportControls.jsx';
import { useScopedSelection } from '../../../shared/filters/useScopedSelection.js';
import { FilterCount } from '../../../components/FilterPanel.jsx';
import { LineRecordsTable } from './LineRecordsTable.jsx';
import { download } from '../../../shared/export/exports.js';
import {
  VOLUME_SCALE,
  consumptionSummary,
  consumptionEligible,
  linkConsumption,
  baselineByPeriod,
  attachBaselines,
  chipKey,
  periodKey,
  periodOptions,
  historyStatements,
} from '../domain/lineConsumption.js';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { LineHistoryPanel } from './LineHistoryPanel.jsx';
import { ConsumptionArchivePanel } from './ConsumptionArchivePanel.jsx';
import { ConsumptionSourcesPanel } from './ConsumptionSourcesPanel.jsx';
import { useLineFollowup } from '../hooks/useLineFollowup.js';
import { useConsumptionArchive } from '../hooks/useConsumptionArchive.js';
import { ReportStories } from '../../../shared/layout/ReportStories.jsx';
import { consumptionStories } from '../config/reportStories.js';
import { ViewState } from '../../../components/ViewState.jsx';
import { AttentionPanel } from '../../../components/AttentionPanel.jsx';
import {
  consumptionAttention,
  defaultConsumptionAttention,
} from '../domain/consumptionAttention.js';
/** Coordena extratos, versões, notas e referência operacional no histórico local do navegador. */
export function LinesPage({
  onPage,
  operational,
  onOperationalChange,
  reloadToken = 0,
  repository,
  centralSources = false,
}) {
  const history = useConsumptionArchive(reloadToken, repository);
  const layout = usePageLayout('consumption');
  const [attentionLimits, setAttentionLimits] = useState(defaultConsumptionAttention);
  const { archive, ready, busy, error, message, setError, commit } = history;
  const [category, setCategory] = useState('overview'),
    [detail, setDetail] = useState(null),
    [expansion, setExpansion] = useState(null),
    [rankMeasure, setRankMeasure] = useState('daily'),
    [queueView, setQueueView] = useState('eligible');
  const { filters, setFilters, search, setSearch, resetSelections, counts } =
    useScopedSelection(category);
  useEffect(() => {
    setDetail(null);
  }, [category]);
  const historyAnchor = useRef();
  const sourceAnchor = useRef();
  const [historyReveal, setHistoryReveal] = useState(0);
  const statements = useMemo(() => historyStatements(archive.files), [archive.files]);
  const reference = centralSources
    ? operational
    : operational?.data
      ? operational
      : archive.operational;
  const linked = useMemo(
    () =>
      linkConsumption(
        statements.flatMap((statement) => statement.rows),
        reference,
      ),
    [statements, reference],
  );
  const baselines = useMemo(() => baselineByPeriod(linked), [linked]);
  const allRows = useMemo(
    () => attachBaselines(linked, baselines, archive.settings.factor),
    [linked, baselines, archive.settings.factor],
  );
  const followup = useLineFollowup({ allRows, archive, commit, setError });
  const dashboardSource = useMemo(
    () => (ready && statements.length ? { rows: allRows, statements, error } : null),
    [ready, statements, allRows, error],
  );
  usePublishDashboardSource('consumption', dashboardSource);
  const { tracked, setTracked, setLineSearch } = followup;
  function selectTracked(key) {
    setTracked(key);
    setDetail(null);
  }
  const operators = [...new Set(statements.map((statement) => statement.operator))].sort();
  const periods = consumptionPeriods(statements, filters),
    fields = consumptionFilterFields;
  const selected = selectConsumptionRows(allRows, periods, filters, search);
  const summary = consumptionSummary(selected),
    eligible = summary.eligible,
    attention = eligible.filter((row) => row.attention),
    visibleSections = categories.find(([key]) => key === category)[2],
    shown = (label) => visibleSections.includes(label);
  const selectedDetail = selected.find((row) => row.id === detail);
  const highlights = useMemo(
    () => consumptionAttention(allRows, selected, attentionLimits),
    [allRows, selected, attentionLimits],
  );
  useEffect(() => {
    if (selectedDetail) sourceAnchor.current?.scrollIntoView({ block: 'nearest' });
  }, [detail]);
  function filter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setDetail(null);
  }
  useEffect(() => {
    if (historyReveal)
      historyAnchor.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  }, [historyReveal]);
  function followLine(row) {
    setTracked(chipKey(row));
    setDetail(null);
    setLineSearch('');
    layout.reveal('Linha do tempo de consumo');
    setExpansion(null);
    setHistoryReveal((previous) => previous + 1);
  }
  const imports = useConsumptionImports({
    centralSources,
    history,
    operational,
    onOperationalChange,
    onResetFilters: resetSelections,
    onClearDetail: () => setDetail(null),
    onClearTracked: () => setTracked(''),
    onReviewBackup: () => setCategory('history'),
  });
  const {
    pending,
    setPending,
    backup,
    setBackup,
    input,
    backupInput,
    savePending,
    restoreBackup,
    exportBackup,
    changeVersion,
    saveOperationalReference,
  } = imports;
  function exportRecords(records) {
    const selectedOnly = Array.isArray(records),
      exporting = selectedOnly ? records : selected;
    download(
      consumptionRecordsCsv(exporting, {
        selectedOnly,
        filters,
        periods,
        search,
        reference,
        factor: archive.settings.factor,
      }),
      'text/csv;charset=utf-8',
      selectedOnly ? 'consumo-linhas-selecionadas.csv' : 'consumo-linhas-filtrado.csv',
    );
  }
  function viewRow(row) {
    setDetail(row.id);
    setTracked(chipKey(row));
  }
  function rowsTable(records) {
    return <LineRecordsTable records={records} onView={viewRow} onExport={exportRecords} />;
  }
  const ranked = [...eligible].sort((a, b) =>
    rankMeasure === 'daily' ? b.ticks / b.days - a.ticks / a.days : b.ticks - a.ticks,
  );
  const rankItems = ranked.map((row) => ({
    label: `${row.operator} · ${row.number} · ICCID ${row.iccid}${row.link?.client ? ' · ' + row.link.client : ''}`,
    displayLabel: `${row.operator} · ${row.number}`,
    caption: row.link?.client || 'Cliente não vinculado',
    value: row.ticks / VOLUME_SCALE / (rankMeasure === 'daily' ? row.days : 1),
    id: row.id,
  }));
  const ranges = [
    { label: 'Zero MB', value: 0 },
    { label: 'Mais de 0 até 10 MB', value: 0 },
    { label: 'Mais de 10 até 20 MB', value: 0 },
    { label: 'Mais de 20 até 50 MB', value: 0 },
    { label: 'Mais de 50 MB', value: 0 },
  ];
  for (const row of eligible)
    ranges[
      row.ticks === 0
        ? 0
        : row.ticks <= 10 * VOLUME_SCALE
          ? 1
          : row.ticks <= 20 * VOLUME_SCALE
            ? 2
            : row.ticks <= 50 * VOLUME_SCALE
              ? 3
              : 4
    ].value++;
  const providerStats = operators
    .filter((operator) => !filters.operator?.length || filters.operator.includes(operator))
    .map((operator) => ({
      operator,
      ...consumptionSummary(selected.filter((row) => row.operator === operator)),
      period: periodOptions(statements, operator).find(
        (period) => period.key === periods[operator],
      ),
    }));
  const clientGroups = new Map();
  for (const row of eligible) {
    const label = row.link?.client || 'Não vinculado';
    if (!clientGroups.has(label)) clientGroups.set(label, { label, ticks: 0, rows: 0 });
    const group = clientGroups.get(label);
    group.ticks += row.ticks;
    group.rows++;
  }
  const chartNote =
    'Apurações: ' +
    providerStats.map((item) => item.operator + ' ' + (item.period?.label || '—')).join(' / ') +
    '. Dados móveis; SMS e frete separados. Vínculos usam a referência operacional importada.';
  const selectedIDs = new Set(
    selected.map((row) => JSON.stringify([row.operator, row.iccid, row.start, row.end])),
  );
  const invoiceRows = allRows.filter(
    (row) =>
      periodKey(row) === periods[row.operator] &&
      selectedIDs.has(JSON.stringify([row.operator, row.iccid, row.start, row.end])) &&
      !row.duplicate,
  );
  const fees = allRows.filter(
    (row) =>
      (!filters.operator?.length || filters.operator.includes(row.operator)) &&
      periodKey(row) === periods[row.operator] &&
      !['dados', 'sms'].includes(row.service),
  );

  return (
    <SidePanelProvider>
      <PageLayoutProvider
        layout={layout}
        definitions={consumptionLayoutDefinitions}
        activeIds={visibleSections}
        scope={`Consumo M2M · ${categories.find(([key]) => key === category)[1]}`}
        savedView={{
          scopeKey: `consumption:${category}`,
          state: {
            filters: { ...filters, periods },
            search,
            rankMeasure,
            queueView,
            attentionLimits,
          },
          validate: (view) =>
            Object.entries(view.filters?.periods || {}).some(
              ([operator, key]) =>
                !periodOptions(statements, operator).some((option) => option.key === key),
            )
              ? 'Uma apuração desta visão não está disponível. Importe a fonte ou atualize a visão antes de aplicar.'
              : '',
          onApply: (view) => {
            setFilters(view.filters || {});
            setSearch(view.search || '');
            setDetail(null);
            setRankMeasure(view.rankMeasure || 'daily');
            setQueueView(view.queueView || 'eligible');
            setExpansion(null);
            setAttentionLimits(view.attentionLimits || defaultConsumptionAttention);
          },
        }}
      >
        <ExpansionContext.Provider value={expansion}>
          <PrintContext.Provider
            value={{
              filename: statements.map((file) => file.filename).join(' / '),
              filters: {
                ...filters,
                alcance: `Consumo → ${categories.find(([key]) => key === category)[1]}`,
                busca: search,
                periodos: periods,
                referencia: reference?.filename,
                fator: archive.settings.factor,
              },
            }}
          >
            <div className="app lines-page">
              <Navigation page="lines" onPage={onPage} />
              <main>
                <SidebarContent>
                  <nav className="category-navigation" aria-label="Análises de consumo">
                    {categories.map(([key, label]) => (
                      <button
                        key={key}
                        className={category === key ? 'active' : ''}
                        onClick={() => setCategory(key)}
                      >
                        {label}
                        <FilterCount count={counts[key]} />
                      </button>
                    ))}
                  </nav>
                </SidebarContent>
                <ConsumptionImportHeader
                  busy={busy}
                  ready={ready}
                  imports={imports}
                  settingsAvailable={ready && (!!statements.length || category === 'history')}
                />
                {category !== 'kore' && (
                  <ConsumptionFiltersPanel
                    scope={`Consumo → ${categories.find(([key]) => key === category)[1]}`}
                    selectedCount={selected.length}
                    actions={<ReportControls onExpand={setExpansion} />}
                    operators={operators}
                    periods={periods}
                    statements={statements}
                    fields={fields}
                    allRows={allRows}
                    filters={filters}
                    filter={filter}
                    archive={archive}
                    busy={busy}
                    ready={ready}
                    commit={commit}
                    search={search}
                    setSearch={setSearch}
                    setDetail={setDetail}
                    setFilters={setFilters}
                  />
                )}
                {!ready && !error && (
                  <ViewState busy compact title="Abrindo histórico…">
                    Os arquivos e as anotações serão exibidos após a leitura do armazenamento local.
                  </ViewState>
                )}
                {error && (
                  <div role="alert" className="error">
                    {error}
                  </div>
                )}
                {message && (
                  <p role="status" className="line-message">
                    {message}
                  </p>
                )}
                <ConsumptionImportPreview
                  pending={pending}
                  archive={archive}
                  busy={busy}
                  savePending={savePending}
                  setPending={setPending}
                />
                {!!statements.length && category !== 'kore' && (
                  <>
                    <div className="source">
                      <span>
                        {archive.files.length} arquivos guardados · {statements.length} versões em
                        uso
                      </span>
                      <span>{summary.lines} chips no recorte</span>
                      <span>Referência: {reference?.filename || 'operacional não importado'}</span>
                    </div>
                    <p className="scope line-periods">
                      {providerStats
                        .map(
                          (item) =>
                            `${item.operator}: ${item.period?.label || '—'} (${item.period?.days || 0} dias)`,
                        )
                        .join(' · ')}
                      . Períodos com datas diferentes não representam a mesma janela.
                    </p>
                  </>
                )}
                {!statements.length && ready && category !== 'kore' && (
                  <ViewState
                    title="Guarde seus extratos e acompanhe a evolução"
                    action={
                      <>
                        <PermissionButton
                          action="import"
                          disabled={busy}
                          onClick={() => input.current.click()}
                        >
                          Selecionar extratos
                        </PermissionButton>
                        <PermissionButton
                          action="import"
                          disabled={busy}
                          onClick={() => backupInput.current.click()}
                        >
                          Restaurar backup
                        </PermissionButton>
                      </>
                    }
                  >
                    Importe os consolidados da Arqia e da Kore. Confira o mapeamento e salve a
                    apuração no histórico.
                  </ViewState>
                )}
                {ready &&
                  !!statements.length &&
                  !selected.length &&
                  category !== 'history' &&
                  category !== 'kore' && (
                    <ViewState
                      title="Nenhum registro corresponde a este recorte"
                      action={
                        <button
                          type="button"
                          onClick={() => {
                            setFilters({});
                            setSearch('');
                            setDetail(null);
                          }}
                        >
                          Limpar filtros desta categoria
                        </button>
                      }
                    >
                      Confira a apuração, os filtros e a busca. Os arquivos e as anotações do
                      histórico permanecem guardados.
                    </ViewState>
                  )}
                {category === 'overview' && ready && !!statements.length && (
                  <AttentionPanel
                    scope="Consumo · apurações e filtros atuais"
                    findings={highlights.findings}
                    coverage={highlights.coverage}
                    onInspect={(finding) => {
                      setCategory('investigation');
                      followLine(finding.row);
                    }}
                  >
                    <label>
                      Aumento mínimo de MB/dia (%)
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        aria-label="Aumento mínimo de consumo (%)"
                        value={attentionLimits.increase}
                        onChange={(e) => {
                          const n = e.target.valueAsNumber;
                          if (Number.isFinite(n) && n >= 1 && n <= 10000)
                            setAttentionLimits((old) => ({ ...old, increase: n }));
                        }}
                      />
                    </label>
                    <label>
                      Consumo mínimo atual (MB/dia)
                      <input
                        type="number"
                        min="0"
                        max="1000000"
                        aria-label="Consumo mínimo atual em MB por dia"
                        value={attentionLimits.minimumDailyMB}
                        onChange={(e) => {
                          const n = e.target.valueAsNumber;
                          if (Number.isFinite(n) && n >= 0 && n <= 1000000)
                            setAttentionLimits((old) => ({ ...old, minimumDailyMB: n }));
                        }}
                      />
                    </label>
                    <p className="scope">
                      A referência é a apuração anterior mais recente e não sobreposta do mesmo
                      chip/operadora. O histórico de referência não recebe os filtros de
                      cliente/plano da apuração atual. Referência zero não gera percentual.
                    </p>
                  </AttentionPanel>
                )}
                <ConsumptionOverviewPanels
                  shown={shown}
                  hasStatements={!!statements.length}
                  summary={summary}
                  eligible={eligible}
                  ranges={ranges}
                  chartNote={chartNote}
                  providerStats={providerStats}
                />
                <ReportStories groups={consumptionStories}>
                  <Section
                    title="Fila de acompanhamento do consumo"
                    visible={shown('Fila de acompanhamento do consumo') && !!statements.length}
                    summary={
                      <ReportSummary
                        metrics={[
                          [
                            'Registros na grade',
                            queueView === 'eligible'
                              ? eligible.length
                              : selected.length - eligible.length,
                          ],
                          ['Consumo válido no recorte', eligible.length],
                          ['Fora dos totais no recorte', selected.length - eligible.length],
                          ['Acima da referência', attention.length],
                        ]}
                        note={`Visualização: ${queueView === 'eligible' ? 'consumo válido' : 'fora dos totais'}. Mesmas apurações, busca e filtros da grade; registros inválidos/duplicados não entram no consumo. Notas locais não confirmam resolução.`}
                      />
                    }
                    help="Uma única grade para consulta, seleção e acompanhamento. Registros válidos entram nos totais; a opção Fora dos totais permite conferir dados inválidos/duplicados do mesmo recorte, sem somá-los. Respeita operadora, apuração, busca e filtros da categoria. Ordem inicial: maior consumo total em MB, sem somar períodos sobrepostos. Compare períodos de durações diferentes também por MB por dia. Clique nas colunas para ordenar o recorte antes de paginar. Acompanhamento mostra a última ação salva por data para operadora + ICCID; empates usam a última entrada. Clicar no status abre o histórico abaixo com todas as apurações em uso do chip. As notas são confirmadas em Salvar acompanhamento e ficam neste navegador. Cliente e placa vêm da referência operacional atual. Consumo alto e status administrativo não confirmam defeito nem resolução."
                  >
                    <label className="consumption-queue-view">
                      Registros da grade
                      <select
                        aria-label="Registros da grade"
                        value={queueView}
                        onChange={(event) => setQueueView(event.target.value)}
                      >
                        <option value="eligible">Consumo válido · {eligible.length}</option>
                        <option value="review">
                          Fora dos totais · {selected.length - eligible.length}
                        </option>
                      </select>
                    </label>
                    <p className="scope">
                      A exportação da seleção usa apenas as linhas marcadas nesta grade. O CSV do
                      recorte completo continua disponível na visualização Ranking e prioridades.
                      Fora dos totais inclui somente registros mantidos pelos filtros atuais.
                    </p>
                    {shown('Fila de acompanhamento do consumo') && (
                      <LineRecordsTable
                        records={
                          queueView === 'eligible'
                            ? eligible
                            : selected.filter((row) => !consumptionEligible(row))
                        }
                        onView={viewRow}
                        onExport={exportRecords}
                        followup={{ notes: archive.notes, tracked, onSelect: followLine }}
                      />
                    )}
                  </Section>
                  <div ref={historyAnchor} className="consumption-history-anchor" />
                  <LineHistoryPanel
                    visible={shown('Linha do tempo de consumo') && !!statements.length}
                    revealToken={historyReveal}
                    chartNote={chartNote}
                    busy={busy}
                    followup={followup}
                    onSelect={selectTracked}
                  />
                  <ConsumptionInvestigationPanel
                    shown={shown}
                    hasStatements={!!statements.length}
                    attention={attention}
                    archive={archive}
                    rankMeasure={rankMeasure}
                    setRankMeasure={setRankMeasure}
                    chartNote={chartNote}
                    rankItems={rankItems}
                    selected={selected}
                    viewRow={followLine}
                    filter={filter}
                    exportRecords={exportRecords}
                    filters={filters}
                  />
                </ReportStories>
                <ConsumptionEquipmentPanels
                  shown={shown}
                  hasStatements={!!statements.length}
                  chartNote={chartNote}
                  clientGroups={clientGroups}
                  selected={selected}
                  rowsTable={rowsTable}
                />
                <ConsumptionInvoicesPanel
                  shown={shown}
                  hasStatements={!!statements.length}
                  providerStats={providerStats}
                  invoiceRows={invoiceRows}
                  fees={fees}
                />
                <ConsumptionArchivePanel
                  visible={shown('Arquivos e histórico')}
                  archive={archive}
                  operational={operational}
                  ready={ready}
                  busy={busy}
                  backup={backup}
                  onExport={exportBackup}
                  onReview={() => backupInput.current.click()}
                  onRestore={restoreBackup}
                  onCancel={() => setBackup(null)}
                  onSaveOperational={saveOperationalReference}
                  onChangeVersion={changeVersion}
                />
                <ConsumptionSourcesPanel
                  archive={archive}
                  visible={shown('Fontes de consumo e preparação das APIs')}
                />
                <div ref={sourceAnchor}>
                  <ConsumptionSourcePanel
                    row={selectedDetail}
                    statements={statements}
                    onClose={() => setDetail(null)}
                  />
                </div>
              </main>
            </div>
          </PrintContext.Provider>
        </ExpansionContext.Provider>
      </PageLayoutProvider>
    </SidePanelProvider>
  );
}
