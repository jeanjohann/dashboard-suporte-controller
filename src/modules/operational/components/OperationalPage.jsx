import { OperationalLinksTable } from './OperationalLinksTable.jsx';
/**
 * Página operacional e integração dos filtros com as análises de Parque e Manutenção.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { ReviewPanel } from '../../../components/ReviewPanel.jsx';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import {
  authorizeAction,
  accessUser,
  accessManaged,
} from '../../../shared/security/accessClient.js';
import { allowsSource } from '../../../shared/security/permissions.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { linkOperational } from '../domain/operational.js';
import { importOperationalInWorker } from '../../../shared/workers/importProcessing.js';
import {
  Section as BaseSection,
  PrintContext,
  ExpansionContext,
  HiddenSectionsContext,
} from '../../../components/Section.jsx';
import { ReportControls, PagePersonalization } from '../../../components/ReportControls.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { field, attendanceExtent } from '../../../shared/data/filters.js';
import { PeriodFilter } from '../../../components/PeriodFilter.jsx';
import { sortOperationalRecords } from '../domain/operationalRecords.js';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { ParkInsights } from '../../park/components/ParkInsights.jsx';
import { LogisticsPanel } from '../../logistics/components/LogisticsPanel.jsx';
import { parkSections } from '../../park/domain/parkAnalysis.js';
import {
  operationalMenus,
  crossAnalysisMenus,
  hiddenByOperationalMenu,
} from '../config/operationalMenus.js';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { usePageLayout, PageLayoutProvider } from '../../../shared/layout/PageLayout.jsx';
import { PageSettingsButton } from '../../../components/PageSettings.jsx';
import { useScopedSelection } from '../../../shared/filters/useScopedSelection.js';
import { filterChips, activeFilterEntries } from '../../../shared/filters/scopedSelection.js';
import { FilterCount } from '../../../components/FilterPanel.jsx';
import { ReportStories } from '../../../shared/layout/ReportStories.jsx';
import { parkStories } from '../config/reportStories.js';
import { useGoogleOrders } from '../../orders/hooks/useGoogleOrders.js';
import { OrdersGooglePanel } from '../../orders/components/OrdersGooglePanel.jsx';
import { importGoogleOperational } from '../domain/googleOperational.js';
import { ViewState } from '../../../components/ViewState.jsx';
import { AnalysisMetrics } from '../../../components/AnalysisMetrics.jsx';

const layoutDefinitions = [
  ...new Set([...operationalMenus, ...crossAnalysisMenus].flatMap((menu) => menu.sections)),
].map((title) => ({ id: title, title }));

const money = (value) =>
  (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const Section = (props) => <BaseSection visible={true} {...props} />;
/** Compartilha a base operacional entre revisão e Parque e Manutenção, mantendo filtros e categorias da página. */
export function OperationalPage({
  active = true,
  page,
  onPage,
  orders,
  source,
  setSource,
  logistics,
  setLogistics,
}) {
  const [expansion, setExpansion] = useState(null);
  const [logisticsFilters, setLogisticsFilters] = useState({});
  useEffect(() => {
    setLogisticsFilters({});
  }, [logistics]);
  const operationalLayout = usePageLayout('operational');
  const parkLayout = usePageLayout('park');
  const [menuSelections, setMenuSelections] = useState({
    operational: 'overview',
    'operational-analysis': 'overview',
  });
  const menuCategory = menuSelections[page] || 'overview';
  const { filters, setFilters, search, setSearch, resetSelections, counts } = useScopedSelection(
    `${page}:${menuCategory}`,
  );
  const category = filters.reviewCategory || '';
  const setCategory = (value) => setFilters((previous) => ({ ...previous, reviewCategory: value }));
  const scopeLabel = `${page === 'operational-analysis' ? 'Parque e Manutenção' : 'Operacional'} → ${(page === 'operational-analysis' ? crossAnalysisMenus : operationalMenus).find((menu) => menu.key === menuCategory)?.label}`;
  const filterLabels = {
    client: 'Cliente operacional',
    model: 'Modelo pelo serial',
    plan: 'Plano operacional',
    status: 'Situação operacional',
    reviewCategory: 'Categoria da revisão',
    attendanceStart: 'Atendimento de',
    attendanceEnd: 'Atendimento até',
  };
  const chips = filterChips(filters, {
    labels: filterLabels,
    remove: (key) => {
      setFilters((previous) => ({
        ...previous,
        [key]: ['reviewCategory', 'attendanceStart', 'attendanceEnd'].includes(key) ? '' : [],
      }));
      setOffset(0);
    },
  });
  if (search)
    chips.push({
      key: 'search',
      label: 'Busca',
      value: search,
      remove: () => {
        setSearch('');
        setOffset(0);
      },
    });
  const selectMenu = (key) => {
    setMenuSelections((previous) => ({ ...previous, [page]: key }));
    setExpansion(null);
  };

  const input = useRef(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [offset, setOffset] = useState(0),
    [group, setGroup] = useState('client'),
    [chartType, setChartType] = useState('bars'),
    [detail, setDetail] = useState(null);
  const [recordSort, setRecordSort] = useState(null);
  const google = useGoogleOrders({
    source,
    onImport: setSource,
    active: active && page === 'operational',
    manualBusy: busy,
    endpoint: '/api/operational/google',
    importer: importGoogleOperational,
  });
  const previousSource = useRef(source);
  useEffect(() => {
    const preserve = previousSource.current?.origin === 'google' && source?.origin === 'google';
    previousSource.current = source;
    if (!preserve) {
      resetSelections();
      setRecordSort(null);
    }
    setOffset(0);
    setDetail(null);
  }, [source]);
  useEffect(() => {
    setOffset(0);
    setDetail(null);
  }, [page, menuCategory]);
  async function load(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      if (accessManaged() && !allowsSource(accessUser(), 'operational'))
        throw Error('Importação operacional não autorizada.');
      const data = await importOperationalInWorker(await file.arrayBuffer());
      await setSource({ data, filename: file.name });
      setOffset(0);
      setDetail(null);
      setSearch('');
      setCategory('');
      resetSelections();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }
  const analysis = page === 'operational-analysis',
    logisticsView = analysis && menuCategory === 'logistics',
    data = source?.data,
    linked = useMemo(() => (data ? linkOperational(data, orders?.data) : []), [data, orders?.data]),
    rows = useMemo(
      () =>
        linked.filter(
          (row) =>
            ['client', 'model', 'plan', 'status'].every(
              (key) => !filters[key]?.length || filters[key].includes(row[key] || 'Não informado'),
            ) &&
            (!search ||
              [row.client, row.serial, row.plate, row.iccid, row.status, row.model, row.plan].some(
                (value) =>
                  value.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
              )),
        ),
      [linked, filters.client, filters.model, filters.plan, filters.status, search],
    );
  const orderedRecords = useMemo(
    () => sortOperationalRecords(rows, recordSort),
    [rows, recordSort],
  );
  const filterOptions = useMemo(
    () =>
      Object.fromEntries(
        ['client', 'model', 'plan', 'status'].map((key) => [
          key,
          [...new Set(linked.map((row) => row[key] || 'Não informado'))].sort((a, b) =>
            a.localeCompare(b, 'pt-BR'),
          ),
        ]),
      ),
    [linked],
  );
  const selected = useMemo(() => new Set(rows.map((row) => row.sourceRow)), [rows]);
  const issues = useMemo(
    () =>
      data?.issues.filter(
        (issue) => selected.has(issue.row) && (!category || issue.category === category),
      ) || [],
    [data?.issues, selected, category],
  );
  const withHistory = useMemo(
      () => rows.filter((row) => row.state === 'Com histórico disponível'),
      [rows],
    ),
    withoutHistory = useMemo(
      () => rows.filter((row) => row.state === 'Sem atendimento no histórico disponível'),
      [rows],
    ),
    ambiguous = useMemo(
      () => rows.filter((row) => row.state === 'Vínculo operacional ambíguo'),
      [rows],
    ),
    invalid = useMemo(
      () => rows.filter((row) => row.state === 'Identificação incompleta ou incompatível'),
      [rows],
    );
  const financialStats = useMemo(
    () =>
      Object.fromEntries(
        ['monthly', 'charge'].map((key) => [
          key,
          {
            totalCents: rows.reduce((sum, row) => sum + (row[key + 'Cents'] ?? 0), 0),
            missing: rows.filter((row) => row[key + 'Cents'] == null).length,
          },
        ]),
      ),
    [rows],
  );
  const canLink =
    orders &&
    ['ID Rastreador', 'Placa'].every((label) => orders.data.columns.some((c) => c.label === label));
  const items = useMemo(() => {
    const grouped = new Map();
    for (const row of rows) {
      const label = row[group] || 'Não informado';
      grouped.set(label, (grouped.get(label) || 0) + 1);
    }
    return [...grouped]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [rows, group]);
  const cards = analysis
    ? [
        ['Equipamentos na seleção', rows.length],
        ['Com histórico disponível', canLink ? withHistory.length : '—'],
        ['Sem atendimento no histórico disponível', canLink ? withoutHistory.length : '—'],
        ['Vínculos ambíguos', canLink ? ambiguous.length : '—'],
        ['Identificação incompleta ou incompatível', canLink ? invalid.length : '—'],
      ]
    : [
        ['Registros importados', data?.rows.length || 0],
        ['Pontos para revisão', data?.issues.length || 0],
        ['Linhas com revisão', new Set(data?.issues.map((i) => i.row)).size],
        ['Linhas sem Nº, não importadas', data?.skipped || 0],
      ];
  function exportLinks() {
    download(
      csv([
        ['Arquivo operacional', source.filename],
        ['Arquivo OS', orders?.filename || 'Não importado'],
        [
          'Critério',
          'Serial + placa; histórico limitado; vínculos ambíguos sem atribuição automática',
        ],
        [],
        [
          'Linha operacional',
          'Cliente',
          'Serial',
          'Placa',
          'Situação do vínculo',
          'Atendimentos realizados',
          'Linhas OS',
        ],
        ...rows.map((r) => [
          r.sourceRow,
          r.client,
          r.serial,
          r.plate,
          r.state,
          r.state === 'Com histórico disponível' &&
          orders.data.columns.some((c) => c.label === 'Status')
            ? r.services.filter((s) =>
                ['Concluída', 'Pago'].includes(field(orders.data, s, 'Status')?.raw),
              ).length
            : '',
          r.state === 'Com histórico disponível'
            ? r.services.map((s) => s.sourceRow).join(', ')
            : '',
        ]),
      ]),
      'text/csv;charset=utf-8',
      'vinculos-operacional-os.csv',
    );
  }
  return (
    <SidePanelProvider>
      <PageLayoutProvider
        layout={analysis ? parkLayout : operationalLayout}
        definitions={layoutDefinitions}
        activeIds={
          (analysis ? crossAnalysisMenus : operationalMenus).find(
            (menu) => menu.key === menuCategory,
          )?.sections || []
        }
        scope={`${analysis ? 'Parque e Manutenção' : 'Operacional'} · ${(analysis ? crossAnalysisMenus : operationalMenus).find((menu) => menu.key === menuCategory)?.label}`}
        savedView={{
          scopeKey: `${page}:${menuCategory}`,
          state: logisticsView ? { filters: logisticsFilters } : { filters, search },
          onApply: (view) => {
            if (logisticsView) setLogisticsFilters(view.filters || {});
            else {
              setFilters(view.filters || {});
              setSearch(view.search || '');
              setOffset(0);
            }
            setExpansion(null);
          },
        }}
      >
        <HiddenSectionsContext.Provider value={hiddenByOperationalMenu(analysis, menuCategory)}>
          <ExpansionContext.Provider value={expansion}>
            <PrintContext.Provider
              value={{
                filename: source?.filename,
                filters: { ...filters, busca: search, categoria: category, alcance: scopeLabel },
              }}
            >
              <div className={`app operational-page${analysis ? ' park-page' : ''}`}>
                <Navigation page={page} onPage={onPage} />
                <main>
                  <SidebarContent>
                    <nav
                      className="category-navigation"
                      aria-label={
                        analysis ? 'Categorias de Parque e Manutenção' : 'Categorias do operacional'
                      }
                    >
                      {(analysis ? crossAnalysisMenus : operationalMenus).map((menu) => (
                        <button
                          type="button"
                          key={menu.key}
                          aria-current={menuCategory === menu.key ? 'page' : undefined}
                          className={menuCategory === menu.key ? 'active' : ''}
                          onClick={() => selectMenu(menu.key)}
                        >
                          {menu.label}
                          <FilterCount
                            count={
                              menu.key === 'logistics'
                                ? activeFilterEntries(logisticsFilters).length
                                : counts[`${page}:${menu.key}`]
                            }
                          />
                        </button>
                      ))}
                    </nav>
                  </SidebarContent>
                  <header>
                    <div>
                      <div className="eyebrow">BASE OPERACIONAL</div>
                      <h1>
                        {analysis ? 'Parque e Manutenção' : 'Operacional — Importação e Revisão'}
                      </h1>
                      <p>
                        {analysis
                          ? logisticsView
                            ? 'Envios e devoluções de equipamentos · registros e conferência.'
                            : 'Parque registrado e cobertura do histórico de serviços.'
                          : 'Confira os registros originais e os pontos para revisão manual.'}
                      </p>
                    </div>
                    <div className="page-header-actions">
                      {page === 'operational' && google.allowed && (
                        <button type="button" onClick={() => google.setOpen((open) => !open)}>
                          Google Sheets
                        </button>
                      )}
                      {!logisticsView && (
                        <PermissionButton
                          className="header-import-action"
                          action="import"
                          disabled={busy}
                          onClick={() => input.current.click()}
                        >
                          {busy ? 'Lendo…' : 'Importar operacional'}
                        </PermissionButton>
                      )}
                      <PageSettingsButton
                        available={logisticsView ? !!logistics?.data : !!data}
                        help={
                          logisticsView
                            ? 'Envios e devoluções são lidos em sua categoria própria; as datas de envio e recebimento seguem campos distintos.'
                            : analysis
                              ? 'O Parque mostra o retrato da base operacional e pode ser cruzado com o histórico de OS. Divergências sinalizam revisão; a base original não é corrigida automaticamente.'
                              : 'A página preserva os dados originais da planilha. Os alertas indicam registros para conferência manual e não corrigem cadastros.'
                        }
                      />
                    </div>
                    <input hidden ref={input} type="file" accept=".xlsx,.xls" onChange={load} />
                  </header>
                  {page === 'operational' && (
                    <OrdersGooglePanel google={google} manualBusy={busy} operational />
                  )}
                  {!logisticsView && data && (analysis || menuCategory !== 'overview') && (
                    <PagePersonalization
                      scope={scopeLabel}
                      chips={chips}
                      matched={rows.length}
                      total={data.rows.length}
                      period={
                        analysis && menuCategory === 'maintenance' ? (
                          <PeriodFilter
                            start={filters.attendanceStart}
                            end={filters.attendanceEnd}
                            earliest={orders?.data ? attendanceExtent(orders.data).start : null}
                            onChange={(key, value) =>
                              setFilters((previous) => ({
                                ...previous,
                                [key === 'start' ? 'attendanceStart' : 'attendanceEnd']: value,
                              }))
                            }
                          />
                        ) : null
                      }
                      onClear={() => {
                        setFilters({});
                        setSearch('');
                        setOffset(0);
                      }}
                      actions={<ReportControls onExpand={setExpansion} />}
                      help="A busca e os campos afetam somente esta categoria: registros, análises, vínculos e revisão exibidos aqui. Operacional e Parque e Manutenção mantêm seleções separadas. Em Manutenção e relatórios, o período seleciona os atendimentos vinculados, sem reduzir o denominador de equipamentos do parque. Cards de conferência da importação representam o arquivo completo. Ausência de histórico nas OS não significa erro."
                    >
                      {data ? (
                        <>
                          <section className="panel filters">
                            <label>
                              Buscar cliente, serial, placa, ICCID, situação, plano ou modelo
                              <input
                                value={search}
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                  setOffset(0);
                                }}
                              />
                            </label>
                            <div className="filter-grid">
                              {[
                                ['client', 'Cliente operacional'],
                                ['model', 'Modelo pelo serial'],
                                ['plan', 'Plano operacional'],
                                ['status', 'Situação operacional'],
                              ].map(([key, label]) => (
                                <MultiFilter
                                  key={key}
                                  label={label}
                                  values={filters[key] || []}
                                  options={filterOptions[key]}
                                  onChange={(values) => {
                                    setFilters((previous) => ({ ...previous, [key]: values }));
                                    setOffset(0);
                                  }}
                                />
                              ))}
                            </div>
                          </section>
                        </>
                      ) : (
                        <p className="scope">Importe a planilha para disponibilizar os filtros.</p>
                      )}
                    </PagePersonalization>
                  )}
                  {error && !logisticsView && (
                    <div className="error" role="alert">
                      {error} {data && 'A importação anterior foi mantida.'}
                    </div>
                  )}
                  {logisticsView ? (
                    <LogisticsPanel
                      source={logistics}
                      onImport={setLogistics}
                      onExpand={setExpansion}
                      filters={logisticsFilters}
                      setFilters={setLogisticsFilters}
                    />
                  ) : !data ? (
                    <ViewState
                      title="Selecione a planilha operacional"
                      action={
                        <PermissionButton
                          action="import"
                          disabled={busy}
                          onClick={() => input.current.click()}
                        >
                          Importar operacional
                        </PermissionButton>
                      }
                    >
                      Aba Equipamentos, colunas originais do layout reconhecido. Dados mantidos
                      somente nesta sessão.
                    </ViewState>
                  ) : (
                    <>
                      <div className="source">
                        <strong>{source.filename}</strong>
                        <span>Aba Equipamentos · somente leitura</span>
                        <span>OS: {orders?.filename || 'não importada'}</span>
                      </div>
                      <details className="analysis-context-details">
                        <summary>Origem, histórico e leitura da planilha</summary>
                        <p className="notice">
                          O operacional é mais antigo que o histórico de OS. Ausência de atendimento
                          registrado não indica erro, falta de instalação ou ausência de manutenção
                          anterior. Fórmulas são lidas pelo resultado armazenado no Excel, sem
                          recálculo.
                        </p>
                      </details>
                      {!rows.length && data.rows.length > 0 && (
                        <ViewState
                          title="Nenhum registro corresponde a este recorte"
                          action={
                            <button
                              type="button"
                              onClick={() => {
                                setFilters({});
                                setSearch('');
                                setOffset(0);
                              }}
                            >
                              Limpar filtros desta categoria
                            </button>
                          }
                        >
                          Confira os filtros e a busca desta categoria. A base operacional importada
                          permanece disponível.
                        </ViewState>
                      )}
                      <div className="inline-help-heading" hidden={menuCategory !== 'overview'}>
                        <h2>{analysis ? 'Cobertura do histórico' : 'Resumo da importação'}</h2>
                        <InfoNote>
                          {analysis
                            ? 'Equipamentos na seleção usa filtros e busca desta página. A cobertura cruza serial + placa com o arquivo de OS completo; não aplica seus filtros. Vínculos ambíguos e identificações incompatíveis ficam separados. Sem atendimento no histórico disponível não é erro: a Operacional é mais antiga. Não comprova instalação, atividade ou ausência de manutenção anterior.'
                            : 'Contagens do arquivo operacional completo: registros importados, pontos para revisão, linhas distintas com apontamento e linhas sem Nº não importadas. Um registro pode ter vários pontos. Estes cards não seguem filtros nem busca; a tabela de revisão tem seu próprio recorte. Não confirmam divergências automaticamente nem alteram a planilha.'}
                        </InfoNote>
                      </div>
                      <div hidden={menuCategory !== 'overview'}>
                        <AnalysisMetrics
                          className={analysis ? 'park-coverage' : ''}
                          label={
                            analysis
                              ? 'Cobertura do histórico do parque'
                              : 'Resumo da importação operacional'
                          }
                          items={cards.map(([label, value]) => [
                            label,
                            typeof value === 'number' ? value.toLocaleString('pt-BR') : value,
                          ])}
                        />
                      </div>
                      {analysis ? (
                        <ReportStories groups={parkStories}>
                          <ParkInsights
                            rows={rows}
                            operational={data}
                            orders={orders?.data}
                            operationalFilename={source.filename}
                            ordersFilename={orders?.filename}
                            filters={{ ...filters, busca: search, alcance: scopeLabel }}
                            onConfigurePeriod={() =>
                              document
                                .querySelector(
                                  '.operational-page .filter-workspace input[type="date"]',
                                )
                                ?.focus()
                            }
                          />
                          <Section title="Parque por cliente, modelo, plano e situação">
                            <label>
                              Agrupar por{' '}
                              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                                {[
                                  ['client', 'Cliente'],
                                  ['model', 'Modelo lançado'],
                                  ['plan', 'Plano'],
                                  ['status', 'Situação'],
                                ].map(([key, label]) => (
                                  <option key={key} value={key}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              {' '}
                              Gráfico{' '}
                              <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                              >
                                <option value="bars">Barras</option>
                                <option value="pie">Pizza</option>
                                <option value="donut">Rosca</option>
                              </select>
                            </label>
                            <Chart
                              title="Equipamentos registrados"
                              items={items}
                              type={chartType}
                              ranking
                              exportNote="Uma linha operacional = um equipamento contratado; inclui todas as situações na seleção."
                            />
                          </Section>
                          <Section title="Valores mensais lançados">
                            <section className="cards financial-cards">
                              {['monthly', 'charge'].map((key) => (
                                <article key={key}>
                                  <span>
                                    {key === 'monthly' ? 'Mensalidade lançada' : 'Cobrança lançada'}
                                  </span>
                                  <strong>{money(financialStats[key].totalCents)}</strong>
                                  <small>
                                    {financialStats[key].missing} valores ausentes/incompatíveis
                                    excluídos
                                  </small>
                                </article>
                              ))}
                            </section>
                            <InfoNote>
                              Soma dos valores lançados em todas as situações selecionadas,
                              inclusive cancelados. Não representa faturamento, recebimento ou
                              mensalidade ativa calculada. Cancelamento interrompe mensalidade
                              somente com situação Cancelado e data válida; efeito no mês e pró-rata
                              ainda pendentes. Datas S/T não foram interpretadas como vigência de
                              contrato.
                            </InfoNote>
                          </Section>
                          <Section title="Vínculos com o histórico de OS">
                            <InfoNote>
                              Serial + placa após remoção de espaços nas extremidades, sem alterar
                              originais. Histórico completo importado, independente dos filtros da
                              página de OS. Repetição do par no operacional impede atribuição
                              automática. Um serviço pode envolver retirada ou instalação: a
                              correspondência não confirma situação atual.
                            </InfoNote>
                            <PermissionButton
                              action="export"
                              disabled={!canLink}
                              onClick={exportLinks}
                            >
                              Exportar vínculos CSV
                            </PermissionButton>
                            {!canLink && (
                              <p className="notice">
                                Importe a planilha na página Ordens de serviço com as colunas ID
                                Rastreador e Placa para habilitar o cruzamento.
                              </p>
                            )}
                            <OperationalLinksTable rows={rows} />
                          </Section>
                        </ReportStories>
                      ) : (
                        <>
                          <Section title="Revisão manual">
                            <ReviewPanel
                              issues={data.issues.filter((issue) => selected.has(issue.row))}
                              data={{ ...data, sheetName: 'Equipamentos' }}
                              filename={source.filename}
                              category={category}
                              onCategoryChange={setCategory}
                            />
                          </Section>
                          <Section title="Registros operacionais">
                            <p className="scope">
                              Modelo identificado pelo prefixo do serial. A coluna Modelo da
                              planilha permanece disponível em Original; não substitui um serial
                              desconhecido.
                            </p>
                            <TableScroll label="Registros do operacional">
                              <SortableTable
                                sort={recordSort}
                                onSortChange={(next) => {
                                  setRecordSort(next);
                                  setOffset(0);
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th>Linha</th>
                                    <th>Cliente</th>
                                    <th>Serial</th>
                                    <th>Placa</th>
                                    <th>Modelo pelo serial</th>
                                    <th>Situação</th>
                                    <th>Original</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderedRecords.slice(offset * 50, offset * 50 + 50).map((r) => (
                                    <tr key={r.sourceRow}>
                                      <td>{r.sourceRow}</td>
                                      <td>{r.client}</td>
                                      <td>{r.serial}</td>
                                      <td>{r.plate}</td>
                                      <td
                                        title={`Modelo lançado: ${r.declaredModel || 'Não informado'}`}
                                      >
                                        {r.model}
                                      </td>
                                      <td>{r.status}</td>
                                      <td>
                                        <button onClick={() => setDetail(r)}>
                                          Ver {data.columns.length} colunas
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </SortableTable>
                            </TableScroll>
                            <footer>
                              <button disabled={!offset} onClick={() => setOffset(offset - 1)}>
                                Anterior
                              </button>
                              <span>
                                {offset + 1} / {Math.max(1, Math.ceil(rows.length / 50))} ·
                                ordenação de toda a seleção
                              </span>
                              <button
                                disabled={(offset + 1) * 50 >= rows.length}
                                onClick={() => setOffset(offset + 1)}
                              >
                                Próxima
                              </button>
                              <button
                                disabled={(offset + 1) * 50 >= rows.length}
                                onClick={() =>
                                  setOffset(Math.max(0, Math.ceil(rows.length / 50) - 1))
                                }
                              >
                                Última
                              </button>
                            </footer>
                          </Section>
                          {detail && menuCategory === 'records' && (
                            <Section title={`Original · linha ${detail.sourceRow}`}>
                              <button onClick={() => setDetail(null)}>Fechar detalhe</button>
                              <TableScroll label="Registros do operacional">
                                <SortableTable>
                                  <thead>
                                    <tr>
                                      <th>Coluna</th>
                                      <th>Cabeçalho</th>
                                      <th>Conteúdo original</th>
                                      <th>Fórmula</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.columns.map((c) => (
                                      <tr key={c.index}>
                                        <td>{c.letter}</td>
                                        <td>{c.label}</td>
                                        <td>{detail.cells[c.index].display}</td>
                                        <td>{detail.cells[c.index].formula || ''}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </SortableTable>
                              </TableScroll>
                            </Section>
                          )}
                        </>
                      )}
                    </>
                  )}
                </main>
              </div>
            </PrintContext.Provider>
          </ExpansionContext.Provider>
        </HiddenSectionsContext.Provider>
      </PageLayoutProvider>
    </SidePanelProvider>
  );
}
