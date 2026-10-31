import { createWorkspaceClient } from '../../../shared/persistence/workspaceClient.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { useTheme } from '../../../app/Theme.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';
import { authorizeAction, api } from '../../../shared/security/accessClient.js';
import { useDashboardSources } from '../../my-dashboard/hooks/DashboardSources.jsx';
import { loadZohoActivity } from '../../orders/data/zohoActivityClient.js';
import { loadZohoBacklog } from '../data/zohoBacklogClient.js';
import { supportPeriod } from '../../orders/domain/supportPerformance.js';
import { todaySaoPaulo } from '../../orders/domain/lifecycle.js';
import { Chart } from '../../../components/Chart.jsx';
import { SourceStatus } from '../../../components/SourceStatus.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { supportClosureBasis, zohoDay } from '../../../shared/data/zohoActivity.js';
import { csv, download } from '../../../shared/export/exports.js';
import {
  agents,
  subjects,
  manualFields,
  metricLabels,
  sections,
  periodDays,
  previousPeriod,
  manualSummary,
  ordersSummary,
  awaitingScheduleCount,
  preparedEquipmentSummary,
  zohoSummary,
  backlogSummary,
  duration,
} from '../domain/indicators.js';
import { useIndicatorRecords } from '../hooks/useIndicatorRecords.js';
import { ManualIndicatorForm } from './ManualIndicatorForm.jsx';
import { PreparedEquipmentPanel } from './PreparedEquipmentPanel.jsx';
import {
  ClosedTicketDetails,
  DrilldownDialog,
  MetricComparison,
  ResponsiveSummaryTable,
  ServiceChartDialog,
  ServiceList,
  SourceCoverage,
  Table,
} from './SupportIndicatorViews.jsx';
import { date, format, number, timestamp } from './supportIndicatorFormat.js';
import { SupportIndicatorSettingsDialog } from './SupportIndicatorSettingsDialog.jsx';
import { useDashboardPresentation } from '../../my-dashboard/hooks/useDashboardPresentation.js';

const minutesPerClosure = (seconds) =>
  seconds == null
    ? 'Sem dados'
    : `${(seconds / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`;
const valuesOf = (orders, zoho, manual) => ({
  executed: orders && !orders.unavailable ? orders.executed : null,
  scheduled: orders && !orders.unavailable ? orders.scheduled : null,
  unproductive: orders && !orders.unavailable ? orders.unproductive : null,
  created: zoho?.created ?? manual?.totals.created ?? null,
  closed: zoho?.closed ?? null,
  seconds: zoho?.seconds ?? null,
  requests: manual?.requests ?? null,
  activities: manual?.activities ?? null,
});
const sectionStories = {
  agents: 'team',
  evolution: 'service-flow',
  types: 'service-flow',
  subjects: 'support-profile',
  manual: 'support-profile',
};
const stories = {
  team: {
    title: 'Desempenho da equipe',
    description: 'Compare serviços efetivos, chamados e tempo apontado por agente.',
  },
  'service-flow': {
    title: 'Ritmo dos atendimentos',
    description: 'Acompanhe a evolução no período e a distribuição dos serviços e clientes.',
  },
  'support-profile': {
    title: 'Perfil do suporte',
    description: 'Explore as categorias dos chamados e as atividades registradas manualmente.',
  },
};
const presentationOptions = [
  { key: 'summary', label: 'Indicadores principais' },
  { key: 'agents', label: 'Resultados por agente' },
  { key: 'evolution', label: 'Evolução diária' },
  { key: 'types', label: 'Serviços e clientes' },
  { key: 'subjects', label: 'Assuntos dos chamados' },
  { key: 'manual', label: 'Atividades complementares' },
];
const configurationSections = [
  ['analysis', 'Análise', 'Período, equipe e indicadores'],
  ['presentation', 'Apresentação', 'Visualização e blocos'],
  ['sources', 'Dados e fontes', 'Cobertura, consultas e atualização'],
  ['backlog', 'Pendências Zoho', 'Carteira atual e em espera'],
];
function unavailableMetric(key, { ordersData, orders, zohoData, zoho, storeReady, periodValid }) {
  if (key === 'awaitingSchedule')
    return ordersData
      ? ['Indisponível', 'A coluna Status não foi encontrada na base de OS.']
      : ['Pendente', 'Carregue a planilha de Ordens de Serviço.'];
  if (!periodValid)
    return ['Período inválido', 'Corrija o intervalo para calcular este indicador.'];
  if (['executed', 'scheduled', 'unproductive'].includes(key)) {
    if (!ordersData) return ['Pendente', 'Carregue a planilha de Ordens de Serviço.'];
    if (!orders) return ['Aguardando cálculo', 'Ajuste o período selecionado.'];
    if (orders?.unavailable)
      return ['Indisponível', `Colunas ausentes: ${orders.unavailable.join(', ')}.`];
  }
  if (key === 'created') {
    if (zohoData && zoho?.creationUnknown)
      return ['Em conferência', 'A autoria das aberturas não foi confirmada no histórico do Zoho.'];
    if (!zohoData && !storeReady)
      return [
        'Pendente',
        'Zoho ainda não foi consultado e o banco de lançamentos manuais não está disponível.',
      ];
    if (!storeReady)
      return [
        'Indisponível',
        'A abertura não veio da consulta; o banco de lançamentos manuais está indisponível.',
      ];
    return [
      'Não informado',
      zohoData
        ? 'Não há abertura automática confirmada nem lançamento manual neste recorte.'
        : 'Zoho não consultado e sem lançamento manual neste recorte.',
    ];
  }
  if (['closed', 'seconds'].includes(key)) {
    if (!zohoData) return ['Pendente', 'Consulte o Zoho para carregar esta métrica.'];
    if (!zoho)
      return ['Cobertura parcial', 'A consulta atual não cobre todo o período selecionado.'];
    if (key === 'closed' && zohoData.closureReview?.length)
      return [
        'Em conferência',
        'O histórico não confirmou a situação de fechamento de todos os chamados.',
      ];
    return ['Indisponível', 'A fonte não forneceu um valor válido para este recorte.'];
  }
  if (!storeReady) return ['Indisponível', 'Os lançamentos manuais ainda não foram carregados.'];
  return ['Não informado', 'Nenhum valor manual foi lançado neste recorte.'];
}
function IndicatorCards({
  settings,
  values,
  oldValues,
  zoho,
  zohoData,
  weekly,
  manualMetric,
  comparisonAvailable,
  presentationMode = false,
  emptyContext,
}) {
  const cardKeys = presentationMode
    ? [
        ...settings.cards.filter((key) => key !== 'seconds'),
        ...settings.cards.filter((key) => key === 'seconds'),
      ]
    : settings.cards;
  const primaryCardKeys = ['executed', 'scheduled', 'closed', 'seconds'];
  const primaryCards = cardKeys.filter((key) => primaryCardKeys.includes(key));
  const secondaryCards = cardKeys.filter((key) => !primaryCardKeys.includes(key));
  const renderCard = (key) => {
    const empty = values[key] == null ? unavailableMetric(key, emptyContext) : null;
    return (
      <article className={`si-card si-card-${key}`} key={key}>
        <span className="si-card-label">
          {metricLabels[key]}
          <InfoNote label={`Regras de ${metricLabels[key]}`}>
            {key === 'awaitingSchedule'
              ? 'Todas as linhas com status atual Agendar, inclusive sem data ou responsável. Não usa os filtros de período ou agente; não representa histórico.'
              : key === 'executed'
                ? 'Uma linha Concluída/Pago efetiva por responsável de execução; improdutivas não contam.'
                : key === 'scheduled'
                  ? 'Uma linha com status Agendado, data de Agendamento no período e responsável de agendamento válido. Agendar, Concluída, Pago e demais status não entram.'
                  : key === 'unproductive'
                    ? 'Visitas improdutivas separadas; não entram nas execuções efetivas do suporte.'
                    : key === 'closed'
                      ? 'Somente chamados atualmente fechados, atribuídos ao agente do último fechamento confirmado dentro do período. Reabertos ficam fora.'
                      : key === 'seconds'
                        ? 'Soma de apontamentos nos chamados; não representa tempo conectado.'
                        : key === 'created'
                          ? 'Autoria de criação confirmada no histórico; alternativa manual identificada quando indisponível.'
                          : 'Quantidade informada manualmente; campos vazios não equivalem a zero.'}{' '}
            {key !== 'awaitingSchedule' &&
              'Comparação exige dados dos dois períodos e não soma indicadores manuais aos automáticos.'}
          </InfoNote>
        </span>
        {values[key] == null ? (
          <div className="si-card-empty" role="status">
            <strong>{empty[0]}</strong>
            <small>{empty[1]}</small>
          </div>
        ) : (
          <strong>{format(key, values[key])}</strong>
        )}
        {key === 'closed' && zohoData?.closureReview?.length > 0 && (
          <small>
            Histórico pendente: {zohoData.closureReview.map((row) => row.number).join(', ')}.
            Isso não significa zero fechamentos.
          </small>
        )}
        <small className="si-card-origin">
          {key === 'awaitingSchedule'
            ? 'OS · pendências atuais · toda a base'
            : key === 'created' && zoho?.created != null
              ? 'Zoho · autoria confirmada'
              : manualMetric(key)
                ? values[key] == null
                  ? 'Manual · sem valor lançado'
                  : 'Manual · total informado'
                : key === 'seconds' || key === 'closed' || key === 'created'
                  ? key === 'closed'
                    ? 'Zoho · fechados atuais'
                    : 'Zoho · eventos do período'
                  : 'OS · linhas da base'}
        </small>
        {comparisonAvailable(key) && values[key] != null && oldValues[key] != null && (
          <MetricComparison metric={key} current={values[key]} previous={oldValues[key]} />
        )}
        {key !== 'awaitingSchedule' && weekly && settings.weeklyGoals[key] != null && (
          <small>
            Meta semanal:{' '}
            {key === 'seconds'
              ? duration(settings.weeklyGoals[key] * 60)
              : number(settings.weeklyGoals[key])}
          </small>
        )}
      </article>
    );
  };
  return (
    <div className="si-cards">
      <div className="si-primary-metrics">{primaryCards.map(renderCard)}</div>
      <div className="si-secondary-metrics">{secondaryCards.map(renderCard)}</div>
    </div>
  );
}
export function SupportIndicatorsPage({ onPage, active = true }) {
  const { density, selectDensity } = useTheme();
  const presentationRoot = useRef(null);
  const presentation = useDashboardPresentation(presentationRoot);
  const { user, managed } = useAccess(),
    { sources } = useDashboardSources(),
    today = todaySaoPaulo(),
    [period, updatePeriod] = useState(() => supportPeriod('currentWeek', today)),
    [manualDirty, setManualDirty] = useState(false),
    [agentId, setAgent] = useState(''),
    [ownZoho, setOwnZoho] = useState(null),
    [drilldown, setDrilldown] = useState(null),
    [serviceChartOpen, setServiceChartOpen] = useState(false),
    [configurationOpen, setConfigurationOpen] = useState(false),
    [configurationSection, setConfigurationSection] = useState('analysis'),
    [presentationMode, setPresentationMode] = useState(false),
    [presentationStyle, setPresentationStyle] = useState(
      density === 'editorial' ? 'editorial' : 'compact',
    ),
    [presentationSelection, setPresentationSelection] = useState(
      () => new Set(presentationOptions.map((option) => option.key)),
    ),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState('');
  const [isNarrowViewport, setIsNarrowViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 600px)').matches : false,
  );
  const [supportProfileExpanded, setSupportProfileExpanded] = useState(false);
  useEffect(() => {
    const viewport = window.matchMedia('(max-width: 600px)');
    const updateViewport = () => setIsNarrowViewport(viewport.matches);
    updateViewport();
    viewport.addEventListener('change', updateViewport);
    return () => viewport.removeEventListener('change', updateViewport);
  }, []);
  const viewMode = density;
  const contentViewMode = presentationMode ? presentationStyle : viewMode;
  const wasPresenting = useRef(false);
  useEffect(() => {
    if (wasPresenting.current && !presentation.presenting && presentationMode)
      setConfigurationOpen(true);
    wasPresenting.current = presentation.presenting;
  }, [presentation.presenting, presentationMode]);
  useEffect(() => {
    if (!configurationOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setConfigurationOpen(false);
        setPresentationMode(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [configurationOpen]);
  const pending = useRef(null);
  const backlogRequest = useRef(null);
  const [ownBacklog, setOwnBacklog] = useState(null),
    [backlogBusy, setBacklogBusy] = useState(false),
    [backlogProgress, setBacklogProgress] = useState(0),
    [backlogError, setBacklogError] = useState('');
  const backlog = useMemo(() => backlogSummary(ownBacklog, agentId), [ownBacklog, agentId]);
  const [profile, setProfile] = useState(null),
    [profileBusy, setProfileBusy] = useState(false);
  async function inspectProfile() {
    if (profileBusy) return;
    setProfileBusy(true);
    setError('');
    try {
      setProfile(
        await api(
          '/api/zoho/activity?' + new URLSearchParams({ start: today, end: today, profile: '1' }),
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setProfileBusy(false);
    }
  }
  function setPeriod(next) {
    if (
      manualDirty &&
      !window.confirm('Descartar o lançamento manual ainda não salvo antes de mudar o período?')
    )
      return;
    updatePeriod(next);
  }
  let valid = true;
  try {
    periodDays(period);
  } catch {
    valid = false;
  }
  const store = useIndicatorRecords(period, managed && valid),
    rawOrders = sources.orders?.value?.data,
    logisticsData = sources.logistics?.value?.data,
    zohoData = ownZoho || sources.zoho?.value?.data;
  useEffect(() => {
    if (!managed || !active || !store.settingsReady || store.writable) return;
    let live = true;
    Promise.allSettled(
      ['zoho-indicators', 'zoho-backlog'].map((kind) => createWorkspaceClient(kind).read()),
    ).then((results) => {
      if (!live) return;
      if (results[0].status === 'fulfilled' && results[0].value.value)
        setOwnZoho(results[0].value.value.data);
      if (results[1].status === 'fulfilled' && results[1].value.value)
        setOwnBacklog(results[1].value.value.data);
      if (results.some((result) => result.status === 'rejected'))
        setError(
          'Não foi possível carregar uma consulta Zoho salva. Recarregue a página para tentar novamente.',
        );
    });
    return () => {
      live = false;
    };
  }, [managed, active, store.settingsReady, store.writable]);
  const ordersData = useMemo(
    () =>
      rawOrders
        ? { ...rawOrders, customerGrouping: 'consolidated', consolidateIdenticalNames: true }
        : null,
    [rawOrders],
  );
  const past = useMemo(() => (valid ? previousPeriod(period) : null), [period, valid]);
  const orders = useMemo(
    () => (valid ? ordersSummary(ordersData, period, agentId) : null),
    [ordersData, period, agentId, valid],
  );
  const oldOrders = useMemo(
    () => (past ? ordersSummary(ordersData, past, agentId) : null),
    [ordersData, past, agentId],
  );
  const zoho = useMemo(
    () => (valid ? zohoSummary(zohoData, period, agentId) : null),
    [zohoData, period, agentId, valid],
  );
  const oldZoho = useMemo(
    () => (past ? zohoSummary(zohoData, past, agentId) : null),
    [zohoData, past, agentId],
  );
  const manual = useMemo(
    () => (store.ready ? manualSummary(store.records, period, agentId) : null),
    [store.ready, store.records, period, agentId],
  );
  const oldManual = useMemo(
    () => (store.ready && past ? manualSummary(store.previous, past, agentId) : null),
    [store.ready, store.previous, past, agentId],
  );
  const preparedEquipment = useMemo(
    () => (valid ? preparedEquipmentSummary(logisticsData, period) : null),
    [logisticsData, period, valid],
  );
  const awaitingSchedule = useMemo(() => awaitingScheduleCount(ordersData), [ordersData]);
  const values = { ...valuesOf(orders, zoho, manual), awaitingSchedule },
    oldValues = { ...valuesOf(oldOrders, oldZoho, oldManual), awaitingSchedule },
    settings = store.settings,
    hasOrders = orders && !orders.unavailable;
  const manualMetric = (key) =>
    ['requests', 'activities'].includes(key) || (key === 'created' && zoho?.created == null);
  const comparisonAvailable = (key) => {
    if (['executed', 'scheduled', 'unproductive'].includes(key))
      return hasOrders && oldOrders && !oldOrders.unavailable;
    if (key === 'created') {
      const zohoComparison = zoho?.created != null && oldZoho?.created != null;
      const manualComparison =
        zoho?.created == null &&
        oldZoho?.created == null &&
        manual?.totals.created != null &&
        oldManual?.totals.created != null;
      return zohoComparison || manualComparison;
    }
    if (['closed', 'seconds'].includes(key)) return zoho?.[key] != null && oldZoho?.[key] != null;
    if (['requests', 'activities'].includes(key))
      return manual?.[key] != null && oldManual?.[key] != null;
    return false;
  };
  const shownAgents = agents.filter((a) => !agentId || a.id === agentId);
  const storyOrder = (
    contentViewMode === 'compact'
      ? ['service-flow', 'team', 'support-profile']
      : ['team', 'service-flow', 'support-profile']
  ).filter((storyKey) => settings.sections.some((key) => sectionStories[key] === storyKey));
  const availablePresentationOptions = presentationOptions.filter(
    (option) => option.key === 'summary' || settings.sections.includes(option.key),
  );
  const selectedPresentationCount = availablePresentationOptions.filter((option) =>
    presentationSelection.has(option.key),
  ).length;
  const agentRows = shownAgents.map((a) => {
    const os = hasOrders ? orders.agents.find((r) => r.id === a.id) : null,
      z = zoho?.agents.find((r) => r.id === a.id),
      m = manual ? manualSummary(store.records, period, a.id) : null;
    return [
      a.name,
      os?.scheduled ?? null,
      os?.executed ?? null,
      os && os.scheduled != null && os.executed != null ? os.scheduled + os.executed : null,
      z?.created ?? m?.totals.created ?? null,
      backlog?.agents.find((r) => r.id === a.id)?.pending ?? null,
      backlog?.agents.find((r) => r.id === a.id)?.onHold ?? null,
      z?.closed ?? (zohoData?.closureReview?.length ? 'Em conferência' : null),
      z?.created != null && z?.closed != null ? z.created + z.closed : null,
      duration(z?.seconds),
      m?.requests ?? null,
      m?.activities ?? null,
    ];
  });
  const agentMetricHeaders = ['Indicador', ...shownAgents.map((agent) => agent.name)];
  const agentMetricRows = [
    ['Agendados · OS', ...agentRows.map((row) => row[1])],
    ['Executados efetivos · OS', ...agentRows.map((row) => row[2])],
    ['Etapas · agenda + execução', ...agentRows.map((row) => row[3])],
    [
      zoho?.created != null ? 'Criados pelo agente · Zoho' : 'Criados · manual',
      ...agentRows.map((row) => row[4]),
    ],
    ['Pendentes agora · Zoho', ...agentRows.map((row) => row[5])],
    ['Em espera agora · Zoho', ...agentRows.map((row) => row[6])],
    ['Fechados · Zoho', ...agentRows.map((row) => row[7])],
    ['Eventos · criados + fechados', ...agentRows.map((row) => row[8])],
    ['Tempo apontado · Zoho', ...agentRows.map((row) => row[9])],
    ['Equipamentos · manual', ...agentRows.map((row) => row[10])],
    ['Atividades · manual', ...agentRows.map((row) => row[11])],
  ];
  const agentServiceRows = hasOrders
    ? orders.agentServices
        .filter((row) => !agentId || row.agentId === agentId)
        .map((row) => [
          row.agent,
          row.label,
          row.scheduled,
          row.executed,
          row.scheduled + row.executed,
        ])
    : [];
  const manualEquipmentRows = shownAgents.map((agent) => {
    const summary = store.ready ? manualSummary(store.records, period, agent.id) : null;
    return [
      agent.name,
      summary?.totals.trackers ?? null,
      summary?.totals.collectors ?? null,
      summary?.totals.identifiers ?? null,
      summary?.totals.blockers ?? null,
      summary?.requests ?? null,
      preparedEquipment?.unavailable
        ? null
        : (preparedEquipment?.agents.find((row) => row.id === agent.id)?.value ?? null),
    ];
  });
  const manualActivityRows = shownAgents.map((agent) => {
    const summary = store.ready ? manualSummary(store.records, period, agent.id) : null;
    return [
      agent.name,
      summary?.totals.videos ?? null,
      summary?.totals.technicians ?? null,
      summary?.totals.procedures ?? null,
      summary?.activities ?? null,
    ];
  });
  const manualSubjectMatrixRows = subjects.map(([key, label]) => {
    const values = shownAgents.map((agent) => {
      const summary = store.ready ? manualSummary(store.records, period, agent.id) : null;
      return summary?.totals['subject_' + key] ?? null;
    });
    const informed = values.filter((value) => value != null);
    return [
      label,
      ...values,
      informed.length ? informed.reduce((sum, value) => sum + value, 0) : null,
    ];
  });
  function showOrderDetails(title, predicate, stage = 'execution') {
    const rows = (orders?.rows || []).filter(predicate).map((row) => {
      const scheduled = stage === 'scheduling';
      return [
        row.os || 'Sem OS informada',
        row.sourceRow,
        date(scheduled ? row.scheduledAt : row.executedAt),
        row.service || 'Serviço não informado',
        scheduled ? (row.unproductive ? 'Visita improdutiva' : 'Agendamento') : 'Execução efetiva',
        scheduled ? row.schedulerName : row.executorName,
      ];
    });
    setDrilldown({
      title,
      source: 'OS · linhas da base',
      headers: ['OS', 'Linha na planilha', 'Data', 'Serviço executado', 'Etapa', 'Responsável'],
      rows,
    });
  }
  function showZohoTimeDetails(title, predicate) {
    const filtered = (zoho?.timeEntries || []).filter(predicate);
    setDrilldown({
      title,
      source: 'Zoho Desk · apontamentos do período',
      headers: ['Chamado', 'Agente', 'Data do apontamento', 'Tempo apontado'],
      rows: filtered.map((row) => [
        zoho?.closedTickets?.find((ticket) => ticket.ticketId === row.ticketId)?.number ||
          row.ticketId,
        row.agent,
        timestamp(row.executedTime),
        duration(row.seconds),
      ]),
    });
  }
  function showClosedTicketDetails(title, predicate) {
    const rows = (zoho?.closedTickets || []).filter(predicate);
    setDrilldown({
      title,
      source: 'Zoho Desk · chamados fechados atuais no período',
      headers: [
        'Chamado',
        'Agente que fechou',
        'Fechado em',
        'Categoria',
        'Subcategoria',
        'Classificação',
      ],
      rows: rows.map((row) => [
        row.number,
        row.agent,
        timestamp(row.closedAt),
        row.category,
        row.subCategory,
        row.classification,
      ]),
    });
  }
  function showManualSubjectDetails(title, key) {
    const fieldKey = `subject_${key}`;
    const rows = (manual?.entries || [])
      .filter((entry) => entry.value.values[fieldKey] != null)
      .map((entry) => [
        date(entry.value.date),
        agents.find((agent) => agent.id === entry.value.agentId)?.name || 'Sem agente',
        entry.value.values[fieldKey],
        entry.value.note || 'Sem observação',
        entry.revision,
      ]);
    setDrilldown({
      title,
      source: 'Indicadores manuais · lançamentos do período',
      headers: ['Data', 'Agente', 'Quantidade informada', 'Observação', 'Revisão'],
      rows,
    });
  }
  useEffect(
    () => () => {
      pending.current?.abort();
      backlogRequest.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (!manualDirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [manualDirty]);
  useEffect(() => {
    if (!active) {
      pending.current?.abort();
      backlogRequest.current?.abort();
    }
  }, [active]);
  async function loadZoho() {
    if (pending.current || backlogRequest.current) return;
    const c = new AbortController();
    pending.current = c;
    setBusy(true);
    setError('');
    setProgress(0);
    try {
      const result = await loadZohoActivity({
        ...period,
        indicators: true,
        signal: c.signal,
        onProgress: setProgress,
      });
      if (!c.signal.aborted) setOwnZoho(result);
    } catch (e) {
      setError(
        c.signal.aborted ? 'Consulta cancelada. A leitura anterior foi preservada.' : e.message,
      );
    } finally {
      pending.current = null;
      setBusy(false);
    }
  }
  async function loadBacklog() {
    if (backlogRequest.current || pending.current) return;
    const controller = new AbortController();
    backlogRequest.current = controller;
    setBacklogBusy(true);
    setBacklogError('');
    setBacklogProgress(0);
    try {
      const result = await loadZohoBacklog({
        signal: controller.signal,
        onProgress: setBacklogProgress,
      });
      if (!controller.signal.aborted) setOwnBacklog(result);
    } catch (e) {
      setBacklogError(
        controller.signal.aborted
          ? 'Consulta de pendências cancelada. A leitura anterior foi preservada.'
          : e.message,
      );
    } finally {
      backlogRequest.current = null;
      setBacklogBusy(false);
    }
  }
  function preset(key) {
    setPeriod(supportPeriod(key, today));
  }
  async function exportReport() {
    if (!(await authorizeAction('export'))) return;
    const report = [
      ['Indicadores Suporte'],
      ['Início', period.start],
      ['Fim', period.end],
      ['Comparação com', `${past?.start || '—'} a ${past?.end || '—'}`],
      ['Agente', agents.find((a) => a.id === agentId)?.name || 'Toda a equipe'],
      ['OS', sources.orders?.value?.filename || 'Não carregada'],
      ['Zoho consultado em', zoho ? zohoData.readAt : 'Não disponível para este período'],
      [
        'Cobertura OS',
        ordersData
          ? `${ordersData.rows.length} linhas na base · ${orders?.rows.length || 0} linhas elegíveis no recorte`
          : 'Sem base carregada',
      ],
      [
        'Cobertura Zoho',
        zoho
          ? `Consulta completa de ${zohoData.period.start} a ${zohoData.period.end}`
          : zohoData?.period
            ? `Consulta de ${zohoData.period.start} a ${zohoData.period.end}; cobertura parcial`
            : 'Sem consulta completa',
      ],
      [
        'Cobertura manual',
        store.ready
          ? `${manual?.entries.length || 0} lançamentos · ${manual?.filled || 0} campos preenchidos no recorte`
          : 'Lançamentos indisponíveis',
      ],
      [
        'Critério',
        'OS em linhas, execução efetiva exclui visita improdutiva; agenda exige status Agendado, data Agendamento no período e responsável válido. Não somar agenda e execução.',
      ],
      [
        'Manual',
        'Totais dos campos preenchidos; vazios não equivalem a zero. Criados = abertos pelo suporte.',
      ],
      [],
      ['Indicador', 'Valor atual', 'Valor anterior', 'Variação', 'Variação %', 'Unidade', 'Origem'],
    ];
    Object.entries(metricLabels).forEach(([key, label]) => {
      const comparable = comparisonAvailable(key) && values[key] != null && oldValues[key] != null;
      const difference = comparable ? values[key] - oldValues[key] : null;
      const percentage =
        comparable && oldValues[key] !== 0
          ? `${Math.round((Math.abs(difference) / oldValues[key]) * 100)}%`
          : comparable
            ? 'Base anterior zero'
            : null;
      report.push([
        label,
        values[key],
        comparable ? oldValues[key] : null,
        difference,
        percentage,
        key === 'seconds' ? 'segundos' : 'quantidade',
        key === 'awaitingSchedule'
          ? 'OS · pendências atuais de toda a base, sem filtro de período ou agente'
          : manualMetric(key)
            ? 'Manual'
            : key === 'seconds' || key === 'closed' || key === 'created'
              ? 'Zoho'
              : 'OS',
      ]);
    });
    report.push(
      [],
      [
        'Agente',
        'Agendados',
        'Executados efetivos',
        'Etapas · agenda + execução',
        zoho?.created != null ? 'Criados pelo agente · Zoho' : 'Criados · manual',
        'Pendentes agora · Zoho',
        'Em espera agora · incluídos nos pendentes',
        'Fechados · Zoho',
        'Tempo apontado',
        'Equipamentos · manual',
        'Atividades · manual',
      ],
      ...agentRows,
      [],
      [
        'Data',
        'Agente',
        ...manualFields.map(([, label]) => label),
        'Observações',
        'Algo novo?',
        'Revisão',
        'Salvo em',
        'Responsável pela gravação',
      ],
      ...(manual?.entries || []).map((r) => [
        r.value.date,
        agents.find((a) => a.id === r.value.agentId)?.name,
        ...manualFields.map(([key]) => r.value.values[key]),
        r.value.note,
        r.value.novelty,
        r.revision,
        r.updatedAt,
        r.actor,
      ]),
    );
    if (zoho?.categories)
      report.push(
        [],
        ['Categoria atual no Zoho', 'Chamados fechados distintos'],
        ...zoho.categories.map((r) => [r.label, r.value]),
      );
    if (zoho?.closedTickets)
      report.push(
        [],
        [
          'Chamado',
          'Agente que fechou',
          'Fechado em',
          'Categoria atual',
          'Subcategoria atual',
          'Classificação atual',
        ],
        ...zoho.closedTickets.map((r) => [
          r.number,
          r.agent,
          r.closedAt,
          r.category,
          r.subCategory,
          r.classification,
        ]),
      );
    if (zoho?.categoryAgents)
      report.push(
        [],
        ['Agente', 'Categoria atual', 'Fechados distintos por agente'],
        ...zoho.categoryAgents.map((r) => [r.agent, r.category, r.value]),
      );
    if (backlog)
      report.push(
        [],
        ['Pendências atuais consultadas em', backlog.readAt],
        [
          'Critério de pendências',
          'Chamados atualmente atribuídos ao agente, categorias Open ou On Hold, independentemente do período selecionado.',
        ],
        ['Chamado', 'Responsável atual', 'Status atual', 'Categoria atual', 'Subcategoria atual'],
        ...backlog.tickets.map((r) => [
          r.number,
          agents.find((a) => a.id === r.agentId)?.name,
          r.status,
          r.category,
          r.subCategory,
        ]),
      );
    await download(
      csv(report),
      'text/csv;charset=utf-8',
      `indicadores-suporte-${period.start}-${period.end}.csv`,
    );
  }
  const weekly =
    valid &&
    periodDays(period) === 7 &&
    new Date(period.start + 'T00:00:00Z').getUTCDay() === 1 &&
    !agentId;
  return (
    <SidePanelProvider>
      <div
        ref={presentationRoot}
        className={`app support-indicators-page si-configured-layout ${presentationMode ? `si-presentation-mode si-presentation-${presentationStyle} si-${presentationStyle}-mode` : `si-${viewMode}-mode`} ${presentation.presenting ? 'si-presenting' : ''}`}
      >
        <Navigation page="support-indicators" onPage={onPage} />
        <main>
          {presentation.presenting && (
            <header className="si-presentation-toolbar">
              <div>
                <span className="si-presentation-eyebrow">INDICADORES SUPORTE · APRESENTAÇÃO</span>
                <h1>
                  {agentId
                    ? agents.find((agent) => agent.id === agentId)?.name
                    : 'Resumo da equipe'}
                </h1>
                <p>
                  {date(period.start)} a {date(period.end)} ·{' '}
                  {presentationStyle === 'editorial' ? 'Editorial' : 'Compacto'} · Esc para sair
                </p>
              </div>
              <div>
                <button type="button" onClick={presentation.fullscreen}>
                  Tela cheia
                </button>
                <button
                  type="button"
                  disabled={!selectedPresentationCount}
                  onClick={async () => {
                    if (selectedPresentationCount && (await authorizeAction('export')))
                      window.print();
                  }}
                >
                  Imprimir / Salvar PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    presentation.exit();
                    setConfigurationOpen(true);
                  }}
                >
                  Voltar à seleção
                </button>
                <button
                  type="button"
                  onClick={() => {
                    presentation.exit();
                    setPresentationMode(false);
                  }}
                >
                  Sair da apresentação
                </button>
              </div>
            </header>
          )}
          <header className="si-heading">
            <div>
              <h1>Indicadores Suporte</h1>
              <p>Atendimentos, serviços e atividades da equipe.</p>
              {managed && store.settingsReady && !store.writable && (
                <p className="scope">
                  Somente visualização · bases e consultas salvas pela administração. Novas
                  consultas e alterações são restritas ao administrador principal.
                </p>
              )}
            </div>
            <div className="si-toolbar">
              <button
                disabled={!valid || busy || backlogBusy || store.loading}
                onClick={exportReport}
              >
                Exportar CSV
              </button>
              <button
                className="si-config-trigger"
                onClick={() => {
                  setPresentationMode(false);
                  setConfigurationOpen(true);
                }}
              >
                Configurações
              </button>
              <button
                onClick={() => {
                  setPresentationMode(true);
                  setConfigurationSection('presentation');
                  setConfigurationOpen(true);
                }}
              >
                Apresentação
              </button>
            </div>
          </header>
          <SupportIndicatorSettingsDialog
            open={configurationOpen && !presentation.presenting}
            onClose={() => {
              setConfigurationOpen(false);
              setPresentationMode(false);
            }}
            onStartPresentation={() => {
              setPresentationMode(true);
              setConfigurationOpen(false);
              presentation.enter();
            }}
            analysis={{
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
            }}
            display={{
              settings,
              viewMode,
              selectDensity,
              presentationStyle,
              setPresentationStyle,
              availablePresentationOptions,
              presentationSelection,
              setPresentationSelection,
              selectedPresentationCount,
            }}
            data={{
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
            }}
            actions={{
              loadZoho,
              cancelZoho: () => pending.current?.abort(),
              progress,
              inspectProfile,
              profileBusy,
              profile,
              error,
              loadBacklog,
              cancelBacklog: () => backlogRequest.current?.abort(),
              backlogBusy,
              backlogProgress,
              backlogError,
            }}
          />
          <section className="si-presentation-print-title" aria-hidden="true">
            <span>INDICADORES SUPORTE</span>
            <h1>
              {agentId ? agents.find((agent) => agent.id === agentId)?.name : 'Resumo da equipe'}
            </h1>
            <p>
              {date(period.start)} a {date(period.end)} ·{' '}
              {presentationOptions
                .filter(
                  (option) =>
                    presentationSelection.has(option.key) &&
                    availablePresentationOptions.some((available) => available.key === option.key),
                )
                .map((option) => option.label)
                .join(' · ')}
            </p>
          </section>
          <section className="si-print-summary" aria-label="Escopo e critérios do relatório">
            <h2>Escopo e critérios</h2>
            <p>
              Período: {date(period.start)} a {date(period.end)} · Agente:{' '}
              {agents.find((agent) => agent.id === agentId)?.name || 'Toda a equipe'}.
            </p>
            <p>
              OS: {sources.orders?.value?.filename || 'base não carregada'} ·{' '}
              {ordersData ? `${ordersData.rows.length} linhas na base` : 'sem cobertura confirmada'}
              . Execuções efetivas excluem visitas improdutivas; agendamentos exigem status
              Agendado, data marcada no período e responsável válido.
            </p>
            <p>
              Zoho:{' '}
              {zohoData?.period
                ? `${date(zohoData.period.start)} a ${date(zohoData.period.end)}`
                : 'sem consulta completa'}
              . Fechados usam o status atual; tempo é a soma dos apontamentos, não tempo conectado.
            </p>
            <p>
              Manual: {manual?.entries.length || 0} lançamentos no recorte. Campos vazios não
              representam zero e não são combinados com indicadores automáticos.
            </p>
          </section>
          <section className="si-panel si-filters" aria-label="Filtros dos Indicadores Suporte">
            <div className="si-toolbar">
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
                ? `${date(period.start)} a ${date(period.end)} · filtros exclusivos desta página · comparação com ${date(past.start)} a ${date(past.end)}`
                : 'Informe um intervalo válido de até 366 dias.'}
            </p>
          </section>
          {valid && (!presentationMode || presentationSelection.has('summary')) && (
            <IndicatorCards
              settings={settings}
              values={values}
              oldValues={oldValues}
              zoho={zoho}
              zohoData={zohoData}
              weekly={weekly}
              manualMetric={manualMetric}
              comparisonAvailable={comparisonAvailable}
              presentationMode={presentationMode}
              emptyContext={{
                ordersData,
                orders,
                zohoData,
                zoho,
                storeReady: store.ready,
                periodValid: valid,
              }}
            />
          )}
          {viewMode === 'editorial' && valid && !presentationMode && (
            <section className="si-editorial-lead" aria-label="Leitura do período">
              <div className="si-editorial-lead-heading">
                <span>LEITURA DO PERÍODO</span>
                <h2>
                  {agentId
                    ? agents.find((agent) => agent.id === agentId)?.name
                    : 'Resumo da equipe'}
                </h2>
                <p>
                  {date(period.start)} a {date(period.end)} · OS e Zoho são apresentados em medidas
                  separadas.
                </p>
              </div>
              <div className="si-editorial-facts">
                <article>
                  <span>Ordens de serviço</span>
                  {hasOrders ? (
                    <>
                      <p>
                        <strong>{number(orders.executed)}</strong> execuções efetivas e{' '}
                        <strong>{number(orders.unproductive)}</strong> linhas reconhecidas como
                        visita improdutiva. Improdutivas permanecem fora das execuções.
                      </p>
                      {comparisonAvailable('executed') && (
                        <MetricComparison
                          metric="executed"
                          current={orders.executed}
                          previous={oldOrders.executed}
                        />
                      )}
                    </>
                  ) : (
                    <p>Sem cobertura suficiente da base de OS para resumir este período.</p>
                  )}
                </article>
                <article>
                  <span>Zoho Desk</span>
                  {zoho ? (
                    <>
                      <p>
                        {zoho.closed == null ? (
                          'Chamados fechados não disponíveis para este recorte. '
                        ) : (
                          <>
                            <strong>{number(zoho.closed)}</strong> chamados fechados
                          </>
                        )}{' '}
                        {zoho.seconds == null ? (
                          'Tempo apontado não disponível.'
                        ) : (
                          <>
                            com <strong>{duration(zoho.seconds)}</strong> de tempo apontado.
                          </>
                        )}
                      </p>
                      {comparisonAvailable('closed') && (
                        <MetricComparison
                          metric="closed"
                          current={zoho.closed}
                          previous={oldZoho.closed}
                        />
                      )}
                    </>
                  ) : (
                    <p>
                      Consulte o Zoho com cobertura para todo o período. Os dados da OS não
                      substituem essa fonte.
                    </p>
                  )}
                </article>
              </div>
            </section>
          )}
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
          <section className="si-panel si-sources" aria-label="Fontes e atualização">
            <div className="source-status-list" aria-label="Estado das fontes dos indicadores">
              <SourceStatus
                name="Ordens de Serviço"
                state={ordersData ? (orders?.unavailable ? 'partial' : 'ready') : 'pending'}
                label={
                  !ordersData
                    ? 'Planilha não carregada'
                    : orders?.unavailable
                      ? 'Colunas necessárias ausentes'
                      : 'Planilha carregada'
                }
                detail={
                  ordersData
                    ? `${sources.orders?.value?.filename || 'Arquivo disponível'} · ${number(ordersData.rows.length)} linhas`
                    : 'Carregue a base em Importação para habilitar os indicadores de OS.'
                }
              />
              <SourceStatus
                name="Zoho Desk"
                state={zoho ? 'ready' : zohoData ? 'partial' : busy ? 'loading' : 'pending'}
                label={
                  zoho
                    ? 'Consulta cobre todo o período'
                    : zohoData
                      ? 'A consulta não cobre todo o período'
                      : busy
                        ? 'Consulta em andamento'
                        : 'Período ainda não consultado'
                }
                detail={
                  zohoData?.period
                    ? `Consulta de ${date(zohoData.period.start)} a ${date(zohoData.period.end)}${zohoData.readAt ? ` · atualizada em ${timestamp(zohoData.readAt)}` : ''}`
                    : 'Consulte o Zoho para obter os indicadores automáticos.'
                }
              />
              <SourceStatus
                name="Lançamentos manuais"
                state={store.loading ? 'loading' : store.ready ? 'ready' : 'error'}
                label={
                  store.loading
                    ? 'Carregando lançamentos'
                    : store.ready
                      ? 'Banco disponível'
                      : 'Lançamentos indisponíveis'
                }
                detail={
                  store.ready
                    ? `${number(manual?.entries.length || 0)} lançamentos no período · ${number(manual?.filled || 0)} campos preenchidos`
                    : 'Os valores manuais não são presumidos como zero.'
                }
              />
            </div>
            <div className="si-toolbar">
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
              {busy && <button onClick={() => pending.current?.abort()}>Cancelar</button>}
              <button disabled={store.loading || store.busy} onClick={store.reload}>
                Recarregar lançamentos
              </button>
            </div>
            <details className="si-source-details">
              <summary>Fontes, critérios e diagnósticos</summary>
              <p className="scope">
                Zoho: até 31 dias por consulta. Tempo é a soma dos apontamentos nos chamados, não
                tempo conectado. Aberturas exigem autoria confirmada no histórico. Assuntos usam a
                categoria atual dos chamados fechados. Sem consulta completa, os lançamentos manuais
                são apresentados separadamente como alternativa.
              </p>
              <p className="scope">
                {store.loading
                  ? 'Carregando lançamentos do banco…'
                  : store.ready
                    ? `${manual?.entries.length || 0} registros diários no recorte · ${manual?.filled || 0} campos preenchidos. Totais manuais podem estar incompletos.`
                    : managed
                      ? 'Lançamentos indisponíveis até a leitura ser confirmada.'
                      : 'Modo local: abra o sistema autenticado para ler e gravar no D1.'}
              </p>
              <details>
                <summary>Validar autoria de abertura e assuntos no Zoho</summary>
                <p className="scope">
                  Amostra dos dois chamados recentes, sem alterar os indicadores manuais. Não usa o
                  filtro de período. Importações e aberturas por clientes não contam como abertura
                  pelo suporte.
                </p>
                <button
                  disabled={!store.writable || profileBusy || busy || backlogBusy}
                  onClick={inspectProfile}
                >
                  {profileBusy
                    ? 'Conferindo amostra…'
                    : 'Consultar amostra de autoria e categorias'}
                </button>
                {profile && (
                  <>
                    <p className="scope">{profile.coverage}</p>
                    <Table
                      headers={[
                        'Chamado',
                        'Criado em',
                        'Tipo do autor',
                        'ID do agente autor',
                        'Origem',
                        'Abertura pelo suporte confirmada',
                        'Categoria',
                        'Subcategoria',
                        'Classificação',
                      ]}
                      rows={profile.samples.map((s) => [
                        s.id,
                        s.createdTime,
                        s.creation?.actorType,
                        s.creation?.agentId,
                        s.creation?.source ?? 'Não informada / nula',
                        s.creation
                          ? s.creation.confirmedSupportOpening
                            ? 'Sim'
                            : 'Não confirmada'
                          : 'Histórico incompleto ou criação não identificada',
                        s.category,
                        s.subCategory,
                        s.classification,
                      ])}
                    />
                  </>
                )}
              </details>
            </details>
            {(error || store.error) && (
              <p className="error" role="alert">
                {error || store.error}
              </p>
            )}
          </section>
          <section className="si-panel si-backlog" aria-label="Chamados pendentes atuais no Zoho">
            <div className="si-backlog-heading">
              <div>
                <h2>
                  Pendências atuais · Zoho{' '}
                  <InfoNote label="Critérios das pendências atuais">
                    Chamados atualmente atribuídos ao agente e não encerrados, incluindo em espera.
                    Não usa o filtro de período. Em espera corresponde a On Hold; os nomes dos
                    status configurados devem confirmar quando significam aguardar retorno do
                    cliente.
                    {backlog?.agents.map((agent) => (
                      <span key={agent.id} style={{ display: 'block', marginTop: 6 }}>
                        {agent.name}: {agent.holdStatuses.join(', ') || 'nenhum status em espera'}.
                      </span>
                    ))}
                  </InfoNote>
                </h2>
              </div>
              <div className="si-toolbar">
                {backlog && (
                  <strong className="si-backlog-count">
                    {number(backlog.total)} pendentes{' '}
                    <small>· {number(backlog.onHold)} em espera</small>
                  </strong>
                )}
                <button disabled={!store.writable || backlogBusy || busy} onClick={loadBacklog}>
                  {backlogBusy
                    ? `Conferindo ${backlogProgress} chamados…`
                    : 'Consultar pendências atuais'}
                </button>
                {backlogBusy && (
                  <button onClick={() => backlogRequest.current?.abort()}>
                    Cancelar pendências
                  </button>
                )}
              </div>
            </div>
            <p className="scope">
              {backlog
                ? `Consultado em ${timestamp(backlog.readAt)} · São Paulo. A carteira pode mudar após a leitura.`
                : 'Consulta da carteira atual pendente.'}
            </p>
            {backlogError && (
              <p className="error" role="alert">
                {backlogError}
              </p>
            )}
          </section>
          {valid && (
            <>
              <details className="si-rule-summary">
                <summary>Critérios da OS e cobertura</summary>
                <p className="scope si-rules">
                  Executados: Concluída/Pago, sem Visita Improdutiva. Agenda: somente status
                  Agendado, com data marcada no período e responsável de agendamento válido. Agendar
                  e serviços já realizados não entram na agenda. Visitas improdutivas realizadas
                  permanecem no indicador próprio. A agenda usa o status atual e a data marcada no
                  arquivo; não é histórico da ação de agendar. Ausência de registros na base não
                  comprova ausência de trabalho.
                </p>
              </details>
              {hasOrders &&
                (orders.unmapped > 0 ||
                  orders.missingExecutionDate > 0 ||
                  orders.missingScheduleDate > 0) && (
                  <details className="notice si-review">
                    <summary>
                      {orders.unmapped + orders.missingExecutionDate + orders.missingScheduleDate}{' '}
                      pontos na base para conferir
                    </summary>
                    <p>
                      Revisão da base: {orders.unmapped} linhas no período sem vínculo explícito com
                      Jean/Eduardo; {orders.missingExecutionDate} realizadas sem data válida e{' '}
                      {orders.missingScheduleDate} com agendamento inválido fora da seleção por
                      período. Linhas sem vínculo ficam fora dos totais da equipe. O filtro por
                      agente usa nomes exatos Jean/Jean Johann e Eduardo/Eduardo Oliveira.
                    </p>
                  </details>
                )}
              {orders?.unavailable && (
                <p className="notice">
                  OS indisponível: colunas ausentes {orders.unavailable.join(', ')}.
                </p>
              )}
              {zoho && (
                <p className="scope">
                  Tempo médio por chamado com apontamento: {duration(zoho.meanSeconds)} ·{' '}
                  {zoho.tickets} chamados com tempo · {zoho.reviewCount} apontamentos para conferir.
                </p>
              )}
              {zoho && zohoData.closureBasis !== supportClosureBasis && (
                <p className="notice">
                  Atualize a consulta Zoho nesta página para conferir fechados e categorias pelo
                  status atual. A consulta anterior continua válida para os apontamentos.
                </p>
              )}
              {zoho?.creationUnknown && zohoData?.indicatorsAvailable && (
                <p className="notice">
                  Há criação sem autoria ou data confirmada no histórico. O total automático de
                  aberturas permanece indisponível; o card usa somente o valor manual informado,
                  quando houver.
                </p>
              )}
              {zoho && zohoData?.closureReview?.length > 0 && (
                <p className="notice">
                  Fechamentos e assuntos automáticos indisponíveis: o histórico do Zoho não
                  confirmou a data de fechamento dos chamados{' '}
                  {zohoData.closureReview.map((r) => r.number).join(', ')}. Aberturas e apontamentos
                  têm conferência independente. Assuntos manuais, quando preenchidos, permanecem
                  identificados como alternativa.
                </p>
              )}
              <div className="si-sections">
                {!presentationMode && storyOrder.length > 1 && (
                  <nav className="si-story-path" aria-label="Sequência sugerida da análise">
                    <strong>Leitura sugerida</strong>
                    {storyOrder.map((storyKey, index) => (
                      <React.Fragment key={storyKey}>
                        {index > 0 && <span aria-hidden="true">→</span>}
                        <a href={`#si-story-${storyKey}`}>{stories[storyKey].title}</a>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
                {storyOrder.map((storyKey) => {
                  const story = stories[storyKey];
                  const StoryContent = storyKey === 'support-profile' ? 'details' : 'div';
                  const groupSections = settings.sections
                    .filter((key) => sectionStories[key] === storyKey)
                    .filter((key) => !presentationMode || presentationSelection.has(key));
                  if (presentationMode && !groupSections.length) return null;
                  return (
                    <section
                      className="si-panel si-story"
                      data-story={storyKey}
                      id={`si-story-${storyKey}`}
                      key={storyKey}
                      tabIndex={-1}
                    >
                      <StoryContent
                        className={`si-story-content${storyKey === 'support-profile' ? ' si-mobile-profile-toggle' : ''}`}
                        {...(storyKey === 'support-profile'
                          ? {
                              open: !isNarrowViewport || presentationMode || supportProfileExpanded,
                              onToggle: (event) => {
                                if (isNarrowViewport && !presentationMode)
                                  setSupportProfileExpanded(event.currentTarget.open);
                              },
                            }
                          : {})}
                      >
                        {storyKey === 'support-profile' ? (
                          <summary className="si-story-heading">
                            <div>
                              <h2>{story.title}</h2>
                              <p>{story.description}</p>
                            </div>
                          </summary>
                        ) : (
                          <header className="si-story-heading">
                            <div>
                              <h2>{story.title}</h2>
                              <p>{story.description}</p>
                            </div>
                          </header>
                        )}
                        <div
                          className={`si-story-sections${storyKey === 'support-profile' ? ' si-support-profile-stack' : ''}`}
                        >
                          {groupSections.map((key) => (
                            <section className="si-story-section" data-section={key} key={key}>
                              <div
                                className={`si-story-section-heading${key === 'types' ? ' si-story-section-heading-action' : ''}`}
                              >
                                <h3>
                                  {sections[key]}{' '}
                                  <InfoNote label={`Regras de ${sections[key]}`}>
                                    {key === 'agents'
                                      ? 'Atendimentos OS por linha. Criados/fechados usam o período; pendentes e espera são a carteira atual, sem filtro temporal. Em espera já está incluído nos pendentes. Eventos é a soma de criações e fechamentos confirmados; não representa chamados distintos.'
                                      : key === 'subjects'
                                        ? 'Categorias atuais do Zoho nos chamados atualmente fechados. Catálogo confirmado inclui zero. Cada chamado conta pelo último agente que o fechou; categorias não são inferidas pelo título.'
                                        : key === 'evolution'
                                          ? 'Datas próprias da fonte; dias sem dados não representam ausência de trabalho.'
                                          : key === 'types'
                                            ? 'Serviço combina Tipo de Serviço e Motivo da OS. Agenda usa a data marcada; execução efetiva usa a data de atendimento. As etapas são contadas separadamente.'
                                            : 'Lançamentos manuais por data e agente; campos vazios não são zero e não são somados ao mesmo indicador automático.'}
                                  </InfoNote>
                                </h3>
                                {key === 'types' && (
                                  <button
                                    type="button"
                                    className="si-section-expand"
                                    onClick={() => setServiceChartOpen(true)}
                                    aria-label="Ampliar a seção Serviços e clientes"
                                  >
                                    Ampliar seção
                                  </button>
                                )}
                              </div>
                              {key === 'agents' && (
                                <>
                                  <div className="si-chart-grid">
                                    <div>
                                      <h4>Execuções efetivas · OS</h4>
                                      <Chart
                                        compact
                                        title="Execuções efetivas por agente"
                                        items={
                                          hasOrders
                                            ? orders.agents
                                                .filter((a) => !agentId || a.id === agentId)
                                                .map((a) => ({
                                                  id: a.id,
                                                  label: a.name,
                                                  value: a.executed,
                                                }))
                                            : []
                                        }
                                        emptyTitle={
                                          ordersData
                                            ? 'Nenhuma execução neste recorte'
                                            : 'Planilha OS não carregada'
                                        }
                                        emptyDescription={
                                          ordersData
                                            ? 'A fonte foi lida, mas não há execuções efetivas para os filtros selecionados.'
                                            : 'Carregue a planilha de Ordens de Serviço para comparar a equipe.'
                                        }
                                        onItemClick={(item) =>
                                          showOrderDetails(
                                            `Execuções efetivas · ${item.label}`,
                                            (row) => row.execution && row.executor === item.id,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <h4>Tempo apontado · Zoho</h4>
                                      <Chart
                                        compact
                                        title="Tempo apontado por agente"
                                        items={(zoho?.agents || []).map((a) => ({
                                          id: a.id,
                                          label: a.name,
                                          value: a.seconds,
                                        }))}
                                        format={duration}
                                        emptyTitle={
                                          !zohoData
                                            ? 'Zoho ainda não consultado'
                                            : !zoho
                                              ? 'Consulta sem cobertura completa'
                                              : 'Nenhum apontamento neste recorte'
                                        }
                                        emptyDescription={
                                          !zohoData
                                            ? 'Consulte o Zoho para visualizar o tempo apontado por agente.'
                                            : !zoho
                                              ? 'Atualize a consulta para cobrir todo o período selecionado.'
                                              : 'A consulta cobre o período, mas não encontrou apontamentos válidos.'
                                        }
                                        onItemClick={(item) =>
                                          showZohoTimeDetails(
                                            `Tempo apontado · ${item.label}`,
                                            (row) => row.agentId === item.id,
                                          )
                                        }
                                      />
                                    </div>
                                    {contentViewMode === 'compact' && (
                                      <div className="si-agent-closed-rate">
                                        <h4>
                                          Tempo apontado ÷ chamados fechados · Zoho{' '}
                                          <InfoNote label="Como interpretar este indicador">
                                            Soma do tempo apontado pelo agente dividida pelos
                                            chamados fechados por ele no período. É uma razão entre
                                            totais, não a duração média de chamados
                                            individualizados; o tempo apontado também pode incluir
                                            chamados que não foram fechados no período.
                                          </InfoNote>
                                        </h4>
                                        <Chart
                                          compact
                                          title="Tempo apontado por chamado fechado · Zoho"
                                          items={(zoho?.agents || [])
                                            .filter(
                                              (agent) =>
                                                Number.isFinite(agent.seconds) &&
                                                Number.isFinite(agent.closed) &&
                                                agent.closed > 0,
                                            )
                                            .map((agent) => ({
                                              id: agent.id,
                                              label: agent.name,
                                              value: agent.seconds / agent.closed,
                                              caption: `${number(agent.closed)} fechados`,
                                            }))}
                                          format={minutesPerClosure}
                                          emptyTitle={
                                            !zohoData
                                              ? 'Zoho ainda não consultado'
                                              : !zoho
                                                ? 'Consulta sem cobertura completa'
                                                : 'Sem base para esta comparação'
                                          }
                                          emptyDescription={
                                            !zohoData
                                              ? 'Consulte o Zoho para comparar tempo apontado e chamados fechados por agente.'
                                              : !zoho
                                                ? 'Atualize a consulta para cobrir todo o período selecionado.'
                                                : 'É necessário haver chamados fechados no período para calcular a razão.'
                                          }
                                          exportNote="Razão entre o tempo total apontado e chamados fechados pelo agente no período. Não representa a duração média de chamados individualizados."
                                        />
                                        <small>
                                          Tempo apontado total ÷ fechados no período; razão entre
                                          totais.
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                  {contentViewMode === 'compact' && !isNarrowViewport ? (
                                    <div className="si-agent-metric-table">
                                      <Table headers={agentMetricHeaders} rows={agentMetricRows} />
                                    </div>
                                  ) : (
                                    <ResponsiveSummaryTable
                                      numericColumns={[1, 2, 3, 4, 5, 6, 7, 8, 10, 11]}
                                      primaryColumns={[1, 2, 3, 7, 9]}
                                      headers={[
                                        'Agente',
                                        'Agendados · OS',
                                        'Executados · OS',
                                        'Etapas · agenda + execução',
                                        zoho?.created != null
                                          ? 'Criados pelo agente · Zoho'
                                          : 'Criados · manual',
                                        'Pendentes agora · Zoho',
                                        'Em espera agora · Zoho',
                                        'Fechados · Zoho',
                                        'Eventos · criados + fechados',
                                        'Tempo · Zoho',
                                        'Equipamentos · manual',
                                        'Atividades · manual',
                                      ]}
                                      rows={agentRows}
                                    />
                                  )}
                                  <details
                                    className="si-report-expandable si-agent-service-breakdown"
                                    open={presentationMode || contentViewMode === 'compact'}
                                  >
                                    <summary>
                                      Agendados e executados por tipo de serviço e agente
                                    </summary>
                                    <Table
                                      headers={[
                                        'Agente',
                                        'Tipo de serviço · OS',
                                        'Agendados',
                                        'Executados efetivos',
                                        'Etapas · agenda + execução',
                                      ]}
                                      rows={agentServiceRows}
                                      numericColumns={[2, 3, 4]}
                                    />
                                  </details>
                                </>
                              )}
                              {key === 'evolution' && (
                                <>
                                  <div className="si-chart-grid">
                                    <div>
                                      <h4>Serviços efetivos por dia · OS</h4>
                                      <Chart
                                        compact
                                        height={contentViewMode === 'compact' ? 155 : 205}
                                        showDrilldownHint={false}
                                        title="Serviços efetivos por dia"
                                        type="line"
                                        emptyTitle={
                                          !ordersData
                                            ? 'Planilha OS não carregada'
                                            : orders?.unavailable
                                              ? 'Colunas necessárias ausentes'
                                              : 'Nenhuma execução neste recorte'
                                        }
                                        emptyDescription={
                                          !ordersData
                                            ? 'Carregue a planilha de Ordens de Serviço para ver a evolução diária.'
                                            : orders?.unavailable
                                              ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                              : 'A planilha foi lida, mas não há execuções efetivas no período e nos filtros atuais.'
                                        }
                                        items={
                                          hasOrders
                                            ? orders.daily.map((d) => ({
                                                label: date(d.label),
                                                detailKey: d.label,
                                                value: d.executed,
                                              }))
                                            : []
                                        }
                                        onItemClick={(item) =>
                                          showOrderDetails(
                                            `Execuções efetivas · ${item.label}`,
                                            (row) =>
                                              row.execution && row.executedAt === item.detailKey,
                                          )
                                        }
                                      />
                                      <small>
                                        Pela data de atendimento; improdutivas ficam fora das
                                        execuções.
                                      </small>
                                    </div>
                                    <div>
                                      <h4>Agendamentos por dia · OS</h4>
                                      <Chart
                                        compact
                                        height={contentViewMode === 'compact' ? 155 : 205}
                                        showDrilldownHint={false}
                                        title="Agendamentos por dia"
                                        type="line"
                                        emptyTitle={
                                          !ordersData
                                            ? 'Planilha OS não carregada'
                                            : orders?.unavailable
                                              ? 'Colunas necessárias ausentes'
                                              : 'Nenhum agendamento neste recorte'
                                        }
                                        emptyDescription={
                                          !ordersData
                                            ? 'Carregue a planilha de Ordens de Serviço para ver os agendamentos.'
                                            : orders?.unavailable
                                              ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                              : 'A planilha foi lida, mas não há agendamentos no período e nos filtros atuais.'
                                        }
                                        items={
                                          hasOrders
                                            ? orders.daily.map((d) => ({
                                                label: date(d.label),
                                                detailKey: d.label,
                                                value: d.scheduled,
                                              }))
                                            : []
                                        }
                                        onItemClick={(item) =>
                                          showOrderDetails(
                                            `Agendamentos · ${item.label}`,
                                            (row) =>
                                              row.scheduling && row.scheduledAt === item.detailKey,
                                            'scheduling',
                                          )
                                        }
                                      />
                                      <small>
                                        Usa a data marcada na agenda; não representa conversão das
                                        mesmas OS em execução.
                                      </small>
                                    </div>
                                    <div>
                                      <h4>Tempo apontado por dia · Zoho</h4>
                                      <Chart
                                        compact
                                        height={contentViewMode === 'compact' ? 155 : 205}
                                        showDrilldownHint={false}
                                        title="Tempo apontado por dia"
                                        type="line"
                                        emptyTitle={
                                          !zohoData
                                            ? 'Zoho ainda não consultado'
                                            : !zoho
                                              ? 'Consulta sem cobertura completa'
                                              : 'Nenhum apontamento neste recorte'
                                        }
                                        emptyDescription={
                                          !zohoData
                                            ? 'Consulte o Zoho para visualizar a evolução do tempo apontado.'
                                            : !zoho
                                              ? 'Atualize a consulta para cobrir todo o período selecionado.'
                                              : 'A consulta cobre o período, mas não encontrou apontamentos válidos.'
                                        }
                                        items={(zoho?.daily || []).map((d) => ({
                                          label: date(d.label),
                                          detailKey: d.label,
                                          value: d.value / 3600,
                                        }))}
                                        format={(n) =>
                                          `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`
                                        }
                                        onItemClick={(item) =>
                                          showZohoTimeDetails(
                                            `Tempo apontado · ${item.label}`,
                                            (row) => zohoDay(row.executedTime) === item.detailKey,
                                          )
                                        }
                                      />
                                      <small>
                                        Dias sem apontamentos não são preenchidos com tempo
                                        presumido.
                                      </small>
                                    </div>
                                  </div>
                                  {hasOrders && (
                                    <>
                                      <small className="si-stage-count-note">
                                        Total no período:{' '}
                                        <strong>{number(orders.totalStages)} etapas</strong> —
                                        agenda + execução; a mesma OS pode aparecer nas duas etapas.
                                      </small>
                                      <details
                                        className="si-report-expandable si-daily-stage-total"
                                        open={presentationMode}
                                      >
                                        <summary>Etapas por dia · agenda + execução</summary>
                                        <Table
                                          headers={[
                                            'Data',
                                            'Agendados',
                                            'Executados efetivos',
                                            'Total de etapas',
                                          ]}
                                          rows={orders.daily.map((day) => [
                                            date(day.label),
                                            day.scheduled,
                                            day.executed,
                                            day.scheduled + day.executed,
                                          ])}
                                          numericColumns={[1, 2, 3]}
                                        />
                                        <small>
                                          Total de etapas não é contagem de OS únicas; a mesma OS
                                          pode aparecer na agenda e depois na execução.
                                        </small>
                                      </details>
                                    </>
                                  )}
                                </>
                              )}
                              {key === 'types' && (
                                <>
                                  {contentViewMode === 'editorial' && (
                                    <p className="si-story-lead">
                                      Primeiro, o mix de serviços efetivamente executados; em
                                      seguida, onde esse trabalho se concentrou. O agendamento
                                      aparece à parte para não sugerir conversão automática.
                                    </p>
                                  )}
                                  {contentViewMode === 'compact' ? (
                                    <div className="si-compact-services-clients">
                                      <div className="si-compact-service-charts">
                                        <div>
                                          <h4>Serviços executados · OS</h4>
                                          <Chart
                                            compact
                                            title="Execuções efetivas por tipo de serviço · OS"
                                            emptyTitle={
                                              !ordersData
                                                ? 'Planilha OS não carregada'
                                                : orders?.unavailable
                                                  ? 'Colunas necessárias ausentes'
                                                  : 'Nenhuma execução por tipo neste recorte'
                                            }
                                            emptyDescription={
                                              !ordersData
                                                ? 'Carregue a planilha de Ordens de Serviço para ver os serviços realizados.'
                                                : orders?.unavailable
                                                  ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                                  : 'Não há execuções efetivas por tipo no período e nos filtros atuais.'
                                            }
                                            items={
                                              hasOrders
                                                ? orders.serviceTypes
                                                    .filter((d) => d.executed > 0)
                                                    .map((d) => ({
                                                      label: d.label,
                                                      value: d.executed,
                                                    }))
                                                : []
                                            }
                                            onItemClick={(item) =>
                                              showOrderDetails(
                                                `Execuções efetivas · ${item.label}`,
                                                (row) =>
                                                  row.execution &&
                                                  (row.service === item.label ||
                                                    row.service.startsWith(item.label + ' · ')),
                                              )
                                            }
                                          />
                                          <small>
                                            Tipo de serviço; somente execuções efetivas.
                                          </small>
                                        </div>
                                        <div className="si-service-reason-chart">
                                          <h4>Serviços e motivos executados · OS</h4>
                                          <Chart
                                            compact
                                            title="Serviços e motivos executados"
                                            emptyTitle={
                                              ordersData
                                                ? 'Nenhum serviço executado neste recorte'
                                                : 'Planilha OS não carregada'
                                            }
                                            emptyDescription="Os detalhes combinam tipo de serviço e motivo da OS; somente execuções efetivas."
                                            items={
                                              hasOrders
                                                ? orders.services
                                                    .filter((service) => service.executed > 0)
                                                    .slice(0, 8)
                                                    .map((service) => ({
                                                      label: service.label,
                                                      value: service.executed,
                                                    }))
                                                : []
                                            }
                                            onItemClick={(item) =>
                                              showOrderDetails(
                                                `Serviço executado · ${item.label}`,
                                                (row) =>
                                                  row.execution && row.service === item.label,
                                              )
                                            }
                                          />
                                          <small>
                                            Tipo de serviço + motivo; somente execuções efetivas.
                                          </small>
                                        </div>
                                        <div>
                                          <h4>Clientes atendidos · OS</h4>
                                          <Chart
                                            compact
                                            title="Execuções efetivas por cliente · OS"
                                            emptyTitle={
                                              !ordersData
                                                ? 'Planilha OS não carregada'
                                                : orders?.unavailable
                                                  ? 'Colunas necessárias ausentes'
                                                  : 'Nenhum cliente com execução neste recorte'
                                            }
                                            emptyDescription={
                                              !ordersData
                                                ? 'Carregue a planilha de Ordens de Serviço para comparar clientes.'
                                                : orders?.unavailable
                                                  ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                                  : 'Não há execuções efetivas por cliente no período e nos filtros atuais.'
                                            }
                                            items={
                                              hasOrders
                                                ? orders.clients
                                                    .filter((client) => client.executed > 0)
                                                    .slice(0, 5)
                                                    .map((client) => ({
                                                      label: client.label,
                                                      displayLabel: client.label.split(' · ')[0],
                                                      value: client.executed,
                                                      valueCaption: `Agenda ${number(client.scheduled)}`,
                                                    }))
                                                : []
                                            }
                                          />
                                          <small>Top 5 por execuções; agenda como referência.</small>
                                        </div>
                                      </div>
                                      <div className="si-client-service-table si-compact-client-table">
                                        <div className="si-client-table-heading">
                                          <h4>Detalhamento por cliente · OS</h4>
                                          <small>
                                            Top 8 por execuções; agenda como referência.
                                          </small>
                                        </div>
                                        <ResponsiveSummaryTable
                                          primaryColumns={[1, 2]}
                                          headers={[
                                            'Cliente',
                                            'Agendados',
                                            'Executados',
                                            'Serviço + motivo (execuções / agendamentos)',
                                          ]}
                                          rows={
                                            hasOrders
                                              ? orders.clients
                                                  .slice(0, 8)
                                                  .map((d) => [
                                                    d.label,
                                                    d.scheduled,
                                                    d.executed,
                                                    <ServiceList value={d.services} chips />,
                                                  ])
                                              : []
                                          }
                                        />
                                        <small>
                                          Em cada serviço: execuções efetivas / agendamentos.
                                        </small>
                                        {hasOrders && orders.clients.length > 8 && (
                                          <details className="si-report-expandable si-client-reasons">
                                            <summary>
                                              Ver todos os clientes ({orders.clients.length})
                                            </summary>
                                            <Table
                                              headers={[
                                                'Cliente',
                                                'Agendados',
                                                'Executados',
                                                'Serviço + motivo (execuções / agendamentos)',
                                              ]}
                                              rows={orders.clients.map((d) => [
                                                d.label,
                                                d.scheduled,
                                                d.executed,
                                                <ServiceList value={d.services} chips />,
                                              ])}
                                            />
                                          </details>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="si-chart-grid">
                                      <div>
                                        <h4>1 · O que foi executado?</h4>
                                        <Chart
                                          compact
                                          title="Execuções efetivas por tipo de serviço · OS"
                                          emptyTitle={
                                            !ordersData
                                              ? 'Planilha OS não carregada'
                                              : orders?.unavailable
                                                ? 'Colunas necessárias ausentes'
                                                : 'Nenhuma execução por tipo neste recorte'
                                          }
                                          emptyDescription={
                                            !ordersData
                                              ? 'Carregue a planilha de Ordens de Serviço para ver os serviços realizados.'
                                              : orders?.unavailable
                                                ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                                : 'Não há execuções efetivas por tipo no período e nos filtros atuais.'
                                          }
                                          items={
                                            hasOrders
                                              ? orders.serviceTypes
                                                  .filter((d) => d.executed > 0)
                                                  .map((d) => ({
                                                    label: d.label,
                                                    value: d.executed,
                                                  }))
                                              : []
                                          }
                                          onItemClick={(item) =>
                                            showOrderDetails(
                                              `Execuções efetivas · ${item.label}`,
                                              (row) =>
                                                row.execution &&
                                                (row.service === item.label ||
                                                  row.service.startsWith(item.label + ' · ')),
                                            )
                                          }
                                        />
                                        <small>Tipo de serviço; somente execuções efetivas.</small>
                                      </div>
                                      <div>
                                        <h4>2 · Onde o trabalho se concentrou?</h4>
                                        <Chart
                                          compact
                                          title="Execuções efetivas por cliente · OS"
                                          emptyTitle={
                                            !ordersData
                                              ? 'Planilha OS não carregada'
                                              : orders?.unavailable
                                                ? 'Colunas necessárias ausentes'
                                                : 'Nenhum cliente com execução neste recorte'
                                          }
                                          emptyDescription={
                                            !ordersData
                                              ? 'Carregue a planilha de Ordens de Serviço para comparar clientes.'
                                              : orders?.unavailable
                                                ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                                : 'Não há execuções efetivas por cliente no período e nos filtros atuais.'
                                          }
                                          items={
                                            hasOrders
                                              ? orders.clients
                                                  .filter((d) => d.executed > 0)
                                                  .slice(0, 5)
                                                  .map((d) => ({
                                                    label: d.label,
                                                    displayLabel: d.label.split(' · ')[0],
                                                    value: d.executed,
                                                    valueCaption: `Agenda ${number(d.scheduled)}`,
                                                  }))
                                              : []
                                          }
                                        />
                                        <small>Top 5 por execuções; agenda como referência.</small>
                                      </div>
                                    </div>
                                  )}
                                  {contentViewMode !== 'compact' && (
                                    <div className="si-type-client-details-grid">
                                      <details
                                        className="si-report-expandable si-service-type-summary"
                                        open={presentationMode || contentViewMode === 'editorial'}
                                      >
                                        <summary>Resumo por tipo de serviço</summary>
                                        <Table
                                          headers={[
                                            'Tipo de serviço · OS',
                                            'Etapas',
                                            'Participação das etapas',
                                            'Executados efetivos',
                                            'Agendamentos',
                                          ]}
                                          rows={(orders?.serviceTypes || []).map((service) => [
                                            service.label,
                                            service.stages,
                                            service.stageShare == null
                                              ? '—'
                                              : (service.stageShare * 100).toLocaleString('pt-BR', {
                                                  maximumFractionDigits: 1,
                                                }) + '%',
                                            service.executed,
                                            service.scheduled,
                                          ])}
                                          numericColumns={[1, 2, 3, 4]}
                                        />
                                      </details>
                                      <div className="si-client-service-table">
                                        <ResponsiveSummaryTable
                                          primaryColumns={[1, 2]}
                                          headers={[
                                            'Cliente',
                                            'Agendados',
                                            'Executados',
                                            'Tipo de serviço (exec. / agend.)',
                                            'Serviço + motivo (exec. / agend.)',
                                          ]}
                                          rows={
                                            hasOrders
                                              ? orders.clients.map((d) => [
                                                  d.label,
                                                  d.scheduled,
                                                  d.executed,
                                                  <ServiceList
                                                    value={d.typeServices
                                                      .map(
                                                        (item) =>
                                                          item.label +
                                                          ': ' +
                                                          item.executed +
                                                          '/' +
                                                          item.scheduled,
                                                      )
                                                      .join('; ')}
                                                  />,
                                                  <ServiceList value={d.services} />,
                                                ])
                                              : []
                                          }
                                        />
                                        <small>
                                          Em cada serviço: execuções efetivas / agendamentos.
                                        </small>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              {key === 'subjects' &&
                                (zoho?.categories != null ? (
                                  <>
                                    <div className="si-subject-comparison-grid">
                                      <div className="si-subject-zoho">
                                        <p className="scope">
                                          {zohoData?.categoryCatalog
                                            ? 'Catálogo Zoho · inclui categorias zeradas.'
                                            : 'Catálogo indisponível · somente categorias encontradas.'}
                                        </p>
                                        <Chart
                                          compact
                                          title="Categorias dos chamados fechados"
                                          emptyTitle={
                                            !zohoData
                                              ? 'Zoho ainda não consultado'
                                              : !zoho
                                                ? 'Consulta sem cobertura completa'
                                                : 'Nenhuma categoria neste recorte'
                                          }
                                          emptyDescription={
                                            !zohoData
                                              ? 'Consulte o Zoho para analisar as categorias dos chamados fechados.'
                                              : !zoho
                                                ? 'Atualize a consulta para cobrir todo o período selecionado.'
                                                : 'Nenhuma categoria foi identificada nos chamados fechados deste período.'
                                          }
                                          items={zoho.categories}
                                          onItemClick={(item) =>
                                            showClosedTicketDetails(
                                              `Chamados fechados · ${item.label}`,
                                              (row) => row.category === item.label,
                                            )
                                          }
                                        />
                                        <details
                                          className="si-report-expandable si-category-summary"
                                          open={presentationMode}
                                        >
                                          <summary>Tabela por categoria</summary>
                                          <Table
                                            headers={[
                                              'Categoria atual no Zoho',
                                              'Chamados fechados distintos',
                                            ]}
                                            rows={zoho.categories.map((r) => [r.label, r.value])}
                                          />
                                        </details>
                                      </div>
                                      <section className="si-subject-manual">
                                        <h4>Assuntos do relatório semanal</h4>
                                        <p className="scope">
                                          Lançamentos manuais por agente. Permanecem separados das
                                          categorias atuais do Zoho; não há equivalência presumida.
                                        </p>
                                        <Table
                                          headers={[
                                            'Categoria do relatório',
                                            ...shownAgents.map((agent) => agent.name),
                                            'Total informado',
                                          ]}
                                          rows={manualSubjectMatrixRows}
                                          numericColumns={[
                                            ...shownAgents.map((_, index) => index + 1),
                                            shownAgents.length + 1,
                                          ]}
                                        />
                                      </section>
                                    </div>
                                    <details
                                      className="si-report-expandable si-category-by-agent"
                                      open={presentationMode}
                                    >
                                      <summary>Distribuição por agente e categoria</summary>
                                      <Table
                                        headers={[
                                          'Agente que fechou',
                                          'Categoria atual',
                                          'Fechados distintos por agente',
                                        ]}
                                        rows={(zoho.categoryAgents || []).map((r) => [
                                          r.agent,
                                          r.category,
                                          r.value,
                                        ])}
                                      />
                                    </details>
                                    <ClosedTicketDetails
                                      key={period.start + period.end + agentId}
                                      rows={zoho.closedTickets || []}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <p className="scope">
                                      Classificação manual dos chamados atendidos. Categorias podem
                                      se sobrepor; não representam o total de chamados distintos.
                                    </p>
                                    <Chart
                                      compact
                                      title="Assuntos informados"
                                      emptyTitle={
                                        !store.ready
                                          ? 'Lançamentos manuais indisponíveis'
                                          : 'Nenhum assunto lançado neste recorte'
                                      }
                                      emptyDescription={
                                        !store.ready
                                          ? 'Confira a conexão com o banco de lançamentos manuais.'
                                          : 'Não há valores manuais de assunto informados no período e nos filtros atuais.'
                                      }
                                      items={subjects
                                        .filter(([key]) => manual?.totals[`subject_${key}`] != null)
                                        .map(([key, label]) => ({
                                          detailKey: key,
                                          label,
                                          value: manual.totals[`subject_${key}`],
                                        }))}
                                      onItemClick={(item) =>
                                        showManualSubjectDetails(item.label, item.detailKey)
                                      }
                                    />
                                    <Table
                                      headers={['Assunto', 'Quantidade informada']}
                                      rows={subjects.map(([key, label]) => [
                                        label,
                                        manual?.totals[`subject_${key}`] ?? null,
                                      ])}
                                    />
                                    <details
                                      className="si-report-expandable si-manual-subject-breakdown"
                                      open={presentationMode}
                                    >
                                      <summary>Assuntos informados por agente</summary>
                                      <Table
                                        headers={[
                                          'Categoria do relatório',
                                          ...shownAgents.map((agent) => agent.name),
                                          'Total informado',
                                        ]}
                                        rows={manualSubjectMatrixRows}
                                        numericColumns={[
                                          ...shownAgents.map((_, index) => index + 1),
                                          shownAgents.length + 1,
                                        ]}
                                      />
                                    </details>
                                  </>
                                ))}
                              {key === 'manual' && (
                                <>
                                  <PreparedEquipmentPanel
                                    summary={preparedEquipment}
                                    agentId={agentId}
                                    period={period}
                                  />
                                  <ManualIndicatorForm
                                    key={period.start + period.end}
                                    records={store.entryRecords}
                                    period={period}
                                    busy={store.busy}
                                    ready={store.ready}
                                    save={store.save}
                                    remove={store.remove}
                                    today={today}
                                    onDirty={setManualDirty}
                                    readOnly={!store.writable}
                                  />
                                  <Table
                                    headers={['Indicador manual', 'Quantidade informada']}
                                    rows={manualFields
                                      .slice(10)
                                      .map(([key, label]) => [label, manual?.totals[key] ?? null])}
                                  />
                                  <details
                                    className="si-report-expandable si-manual-agent-breakdown"
                                    open={presentationMode}
                                  >
                                    <summary>Equipamentos e atividades manuais por agente</summary>
                                    <Table
                                      headers={[
                                        'Agente',
                                        'Rastreadores',
                                        'Coletoras',
                                        'Identificadores',
                                        'Bloqueadores',
                                        'Total solicitado',
                                        'Preparados · Logística',
                                      ]}
                                      rows={manualEquipmentRows}
                                      numericColumns={[1, 2, 3, 4, 5, 6]}
                                    />
                                    {!logisticsData ? (
                                      <small className="scope">
                                        Importe a planilha de Logística para preencher a coluna de
                                        equipamentos preparados.
                                      </small>
                                    ) : preparedEquipment?.unavailable ? (
                                      <small className="scope">
                                        Adicione “Responsável Suporte” à aba Enviados e importe a
                                        planilha novamente.
                                      </small>
                                    ) : preparedEquipment?.review > 0 ? (
                                      <small className="scope">
                                        {number(preparedEquipment.review)} linhas de envio no
                                        período estão sem responsável reconhecido; confira a coluna
                                        “Responsável Suporte”.
                                      </small>
                                    ) : null}
                                    <Table
                                      headers={[
                                        'Agente',
                                        'Materiais em vídeo',
                                        'Cadastros de técnicos',
                                        'POPs',
                                        'Total de atividades',
                                      ]}
                                      rows={manualActivityRows}
                                      numericColumns={[1, 2, 3, 4]}
                                    />
                                  </details>
                                  <details
                                    className="si-report-expandable si-manual-entry-log"
                                    open={presentationMode}
                                  >
                                    <summary>Lançamentos, observações e origem</summary>
                                    <Table
                                      headers={[
                                        'Data',
                                        'Agente',
                                        'Observações',
                                        'Algo novo? · explicação',
                                      ]}
                                      rows={(manual?.entries || []).map((r) => [
                                        date(r.value.date),
                                        agents.find((a) => a.id === r.value.agentId)?.name,
                                        r.value.note,
                                        r.value.novelty,
                                      ])}
                                    />
                                  </details>
                                </>
                              )}
                            </section>
                          ))}
                        </div>
                      </StoryContent>
                    </section>
                  );
                })}
              </div>
              <details className="si-panel">
                <summary>Critérios e conferência das linhas de OS</summary>
                <p className="scope">
                  Os volumes são linhas, não chamados distintos. Trocas podem ocupar duas linhas na
                  OS. Dados manuais não substituem nem se somam ao indicador automático
                  correspondente. As metas são referências fixas e alterações valem para todas as
                  semanas.
                </p>
                <Table
                  headers={[
                    'Linha Excel',
                    'Chamado',
                    'Atendimento',
                    'Agendamento',
                    'Serviço executado',
                    'Execução no período',
                    'Agenda no período',
                  ]}
                  rows={(orders?.rows || []).map((r) => [
                    r.sourceRow,
                    r.os,
                    date(r.executedAt),
                    date(r.scheduledAt),
                    r.service,
                    r.unproductive ? 'Não · improdutiva' : r.execution ? 'Efetiva' : '—',
                    r.scheduling ? 'Sim' : '—',
                  ])}
                />
              </details>
            </>
          )}
        </main>
        <DrilldownDialog detail={drilldown} onClose={() => setDrilldown(null)} />
        <ServiceChartDialog
          open={serviceChartOpen}
          onClose={() => setServiceChartOpen(false)}
          services={hasOrders ? orders.services : []}
          clients={hasOrders ? orders.clients : []}
          daily={hasOrders ? orders.daily : []}
          zohoDaily={zoho?.daily || []}
          period={period}
        />
      </div>
    </SidePanelProvider>
  );
}
function periodDaysSafe(period) {
  try {
    return periodDays(period);
  } catch {
    return 367;
  }
}
