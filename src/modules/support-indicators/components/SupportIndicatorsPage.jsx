import { WorkspaceQueryPanel } from '../../../shared/persistence/WorkspaceQueryPanel.jsx';
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
import { InfoNote } from '../../../components/InfoNote.jsx';
import { supportClosureBasis, zohoDay } from '../../../shared/data/zohoActivity.js';
import { attendanceExtent } from '../../../shared/data/filters.js';
import { SortableTable } from '../../../components/SortableTable.jsx';
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
  zohoSummary,
  backlogSummary,
  duration,
} from '../domain/indicators.js';
import { useIndicatorRecords } from '../hooks/useIndicatorRecords.js';
import { ManualIndicatorForm } from './ManualIndicatorForm.jsx';
import { IndicatorSettings } from './IndicatorSettings.jsx';

const number = (n) => (n == null ? 'Sem dados' : n.toLocaleString('pt-BR'));
const date = (d) => (d ? d.split('-').reverse().join('/') : '—');
const timestamp = (value) =>
  new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
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
const format = (key, value) => (key === 'seconds' ? duration(value) : number(value));
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
function MetricComparison({ metric, current, previous }) {
  const difference = current - previous;
  const percentage = previous === 0 ? null : Math.round((Math.abs(difference) / previous) * 100);
  const change =
    difference === 0
      ? 'sem variação'
      : `${difference > 0 ? '↑' : '↓'} ${format(metric, Math.abs(difference))} ${difference > 0 ? 'a mais' : 'a menos'}${percentage == null ? ' · base anterior zero' : ` · ${percentage}%`}`;
  return (
    <small
      className="si-card-comparison"
      title="Variação quantitativa em relação ao período equivalente anterior; aumento não significa melhora."
    >
      Anterior: {format(metric, previous)} · {change}
    </small>
  );
}
function Table({ headers, rows, numericColumns = [] }) {
  const numeric = new Set([
    ...numericColumns,
    ...headers.map((_, index) => (rows.some((row) => typeof row[index] === 'number') ? index : -1)),
  ]);
  return (
    <div className="si-table">
      <SortableTable>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className={numeric.has(headers.indexOf(h)) ? 'si-numeric' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td
                  key={j}
                  className={numeric.has(j) ? 'si-numeric' : undefined}
                  data-sort={typeof v === 'number' ? v : undefined}
                >
                  {v ?? 'Sem dados'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </SortableTable>
      {!rows.length && <p className="scope">Nenhum registro neste recorte.</p>}
    </div>
  );
}
function ClosedTicketDetails({ rows }) {
  const [page, setPage] = useState(0);
  const last = Math.max(0, Math.ceil(rows.length / 25) - 1),
    current = Math.min(page, last);
  return (
    <details>
      <summary>Conferir {rows.length} chamados por agente e categoria</summary>
      <Table
        headers={[
          'Chamado',
          'Agente que fechou',
          'Fechado em · São Paulo',
          'Categoria atual',
          'Subcategoria atual',
          'Classificação atual',
        ]}
        rows={rows
          .slice(current * 25, current * 25 + 25)
          .map((r) => [
            r.number,
            r.agent,
            timestamp(r.closedAt),
            r.category,
            r.subCategory,
            r.classification,
          ])}
      />
      {last > 0 && (
        <div className="si-toolbar">
          <button disabled={!current} onClick={() => setPage(current - 1)}>
            Anterior
          </button>
          <span>
            Página {current + 1} de {last + 1}
          </span>
          <button disabled={current === last} onClick={() => setPage(current + 1)}>
            Próxima
          </button>
        </div>
      )}
    </details>
  );
}
function IndicatorCards({
  settings,
  values,
  oldValues,
  zohoData,
  weekly,
  manualMetric,
  comparisonAvailable,
}) {
  return (
    <div className="si-cards">
      {settings.cards.map((key) => (
        <article className={`si-card si-card-${key}`} key={key}>
          <span className="si-card-label">
            {metricLabels[key]}
            <InfoNote label={`Regras de ${metricLabels[key]}`}>
              {key === 'executed'
                ? 'Uma linha Concluída/Pago efetiva por responsável de execução; improdutivas não contam.'
                : key === 'scheduled'
                  ? 'Uma linha com data de Agendamento e responsável válidos; exclui canceladas e pode incluir improdutivas.'
                  : key === 'unproductive'
                    ? 'Visitas improdutivas separadas; não entram nas execuções efetivas do suporte.'
                    : key === 'closed'
                      ? 'Somente chamados atualmente fechados, atribuídos ao agente do último fechamento confirmado dentro do período. Reabertos ficam fora.'
                      : key === 'seconds'
                        ? 'Soma de apontamentos nos chamados; não representa tempo conectado.'
                        : key === 'created'
                          ? 'Autoria de criação confirmada no histórico; alternativa manual identificada quando indisponível.'
                          : 'Quantidade informada manualmente; campos vazios não equivalem a zero.'}{' '}
              Comparação exige dados dos dois períodos e não soma indicadores manuais aos
              automáticos.
            </InfoNote>
          </span>
          <strong>
            {key === 'closed' && values[key] == null && zohoData?.closureReview?.length
              ? 'Em conferência'
              : format(key, values[key])}
          </strong>
          {key === 'closed' && zohoData?.closureReview?.length > 0 && (
            <small>
              Histórico pendente: {zohoData.closureReview.map((row) => row.number).join(', ')}. Isso
              não significa zero fechamentos.
            </small>
          )}
          <small className="si-card-origin">
            {manualMetric(key)
              ? 'Manual · total informado'
              : key === 'seconds' || key === 'closed' || key === 'created'
                ? key === 'closed'
                  ? 'Zoho · fechados atuais'
                  : 'Zoho · eventos do período'
                : 'OS · linhas da base'}
          </small>
          {comparisonAvailable(key) && values[key] != null && oldValues[key] != null && (
            <MetricComparison metric={key} current={values[key]} previous={oldValues[key]} />
          )}
          {weekly && settings.weeklyGoals[key] != null && (
            <small>
              Meta semanal:{' '}
              {key === 'seconds'
                ? duration(settings.weeklyGoals[key] * 60)
                : number(settings.weeklyGoals[key])}
            </small>
          )}
        </article>
      ))}
    </div>
  );
}
function SourceCoverage({ ordersData, orders, zohoData, zoho, manual, store, period, valid }) {
  const extent = useMemo(() => (ordersData ? attendanceExtent(ordersData) : null), [ordersData]);
  const fullZoho = Boolean(zoho && zohoData);
  const zohoRange = zohoData?.period;
  const manualStatus = store.loading
    ? 'Carregando os lançamentos manuais.'
    : store.ready
      ? `${manual?.entries.length || 0} lançamentos no recorte · ${manual?.filled || 0} campos preenchidos.`
      : 'Lançamentos manuais indisponíveis.';
  return (
    <section className="si-coverage" aria-label="Cobertura das fontes no período">
      <div>
        <strong>OS</strong>
        <span>
          {!valid
            ? 'Período inválido; ajuste o intervalo para conferir a cobertura.'
            : !ordersData
              ? 'Base ainda não carregada.'
              : orders?.unavailable
                ? `Indisponível · faltam ${orders.unavailable.join(', ')}.`
                : `${ordersData.rows.length.toLocaleString('pt-BR')} linhas na base · ${orders?.rows.length || 0} linhas elegíveis no recorte.`}
        </span>
        {extent?.start && (
          <small>
            Datas de atendimento presentes: {date(extent.start)} a {date(extent.end)}
            {extent.missing ? ` · ${extent.missing} sem data válida na base` : ''}
          </small>
        )}
        {orders &&
          !orders.unavailable &&
          (orders.missingExecutionDate > 0 || orders.missingScheduleDate > 0) && (
            <small>
              Fora dos totais por falta de data: {orders.missingExecutionDate} execuções e{' '}
              {orders.missingScheduleDate} agendamentos.
            </small>
          )}
      </div>
      <div>
        <strong>Zoho Desk</strong>
        <span>
          {!valid
            ? 'A cobertura será conferida após corrigir o período.'
            : fullZoho
              ? `Consulta cobre todo o período · ${(zoho.timeEntries?.length || 0).toLocaleString('pt-BR')} apontamentos válidos.`
              : zohoRange
                ? `Consulta de ${date(zohoRange.start)} a ${date(zohoRange.end)} · não cobre todo o recorte.`
                : 'Sem consulta que cubra todo o período.'}
        </span>
        {zohoData?.readAt && <small>Atualizado em {timestamp(zohoData.readAt)}.</small>}
      </div>
      <div>
        <strong>Manual</strong>
        <span>{manualStatus}</span>
        <small>
          Campos vazios não equivalem a zero; dados manuais permanecem separados dos automáticos.
        </small>
      </div>
      <p className="si-coverage-period">
        Recorte analisado: {date(period.start)} a {date(period.end)}. Linhas sem evidência
        suficiente ficam fora dos totais, sem serem tratadas como zero.
      </p>
    </section>
  );
}
function DrilldownDialog({ detail, onClose }) {
  const dialog = useRef(null);
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [detail]);
  useEffect(() => {
    if (detail && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [detail]);
  if (!detail) return null;
  const pageSize = 25;
  const lastPage = Math.max(0, Math.ceil(detail.rows.length / pageSize) - 1);
  const selectedPage = Math.min(page, lastPage);
  return (
    <dialog
      ref={dialog}
      className="si-drilldown"
      onClose={onClose}
      aria-labelledby="si-drilldown-title"
    >
      <header>
        <div>
          <h2 id="si-drilldown-title">{detail.title}</h2>
          <p>
            {detail.source} · {detail.rows.length.toLocaleString('pt-BR')} registros
          </p>
        </div>
        <div className="si-toolbar">
          <button
            type="button"
            onClick={async () => {
              if (!(await authorizeAction('export'))) return;
              const filename = detail.title
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase('pt-BR')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              await download(
                csv([detail.headers, ...detail.rows]),
                'text/csv;charset=utf-8',
                `indicadores-suporte-${filename || 'detalhes'}.csv`,
              );
            }}
          >
            Exportar CSV
          </button>
          <button type="button" onClick={() => dialog.current?.close()}>
            Fechar
          </button>
        </div>
      </header>
      {detail.rows.length ? (
        <>
          <Table
            headers={detail.headers}
            rows={detail.rows.slice(selectedPage * pageSize, selectedPage * pageSize + pageSize)}
          />
          {lastPage > 0 && (
            <div className="si-toolbar">
              <button disabled={!selectedPage} onClick={() => setPage(selectedPage - 1)}>
                Anterior
              </button>
              <span>
                Página {selectedPage + 1} de {lastPage + 1}
              </span>
              <button
                disabled={selectedPage === lastPage}
                onClick={() => setPage(selectedPage + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="scope">Nenhum registro compõe este valor no recorte atual.</p>
      )}
    </dialog>
  );
}
export function SupportIndicatorsPage({ onPage, active = true }) {
  const { density, selectDensity } = useTheme();
  const { user, managed } = useAccess(),
    { sources } = useDashboardSources(),
    today = todaySaoPaulo(),
    [period, updatePeriod] = useState(() => supportPeriod('currentWeek', today)),
    [manualDirty, setManualDirty] = useState(false),
    [agentId, setAgent] = useState(''),
    [ownZoho, setOwnZoho] = useState(null),
    [drilldown, setDrilldown] = useState(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState('');
  const viewMode = density;
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
    zohoData = ownZoho || sources.zoho?.value?.data;
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
  const values = valuesOf(orders, zoho, manual),
    oldValues = valuesOf(oldOrders, oldZoho, oldManual),
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
  const storyOrder = [...new Set(settings.sections.map((key) => sectionStories[key]))];
  const agentRows = shownAgents.map((a) => {
    const os = hasOrders ? orders.agents.find((r) => r.id === a.id) : null,
      z = zoho?.agents.find((r) => r.id === a.id),
      m = manual ? manualSummary(store.records, period, a.id) : null;
    return [
      a.name,
      os?.scheduled ?? null,
      os?.executed ?? null,
      z?.created ?? m?.totals.created ?? null,
      backlog?.agents.find((r) => r.id === a.id)?.pending ?? null,
      backlog?.agents.find((r) => r.id === a.id)?.onHold ?? null,
      z?.closed ?? (zohoData?.closureReview?.length ? 'Em conferência' : null),
      duration(z?.seconds),
      m?.requests ?? null,
      m?.activities ?? null,
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
        'OS em linhas, execução efetiva exclui visita improdutiva; agenda usa data Agendamento, exclui status cancelado. Não somar agenda e execução.',
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
        manualMetric(key)
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
      <div className={`app support-indicators-page si-${viewMode}-mode`}>
        <Navigation page="support-indicators" onPage={onPage} />
        <main>
          <header className="si-heading">
            <div>
              <h1>Indicadores Suporte</h1>
              <p>Atendimentos, serviços e atividades da equipe.</p>
            </div>
            <div className="si-toolbar">
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
              <button
                disabled={!valid || busy || backlogBusy || store.loading}
                onClick={exportReport}
              >
                Exportar CSV
              </button>
              <button
                onClick={async () => {
                  if (await authorizeAction('export')) window.print();
                }}
              >
                Imprimir / PDF
              </button>
            </div>
          </header>
          <section className="si-print-summary" aria-label="Escopo e critérios do relatório">
            <h2>Escopo e critérios</h2>
            <p>
              Período: {date(period.start)} a {date(period.end)} · Agente:{' '}
              {agents.find((agent) => agent.id === agentId)?.name || 'Toda a equipe'}.
            </p>
            <p>
              OS: {sources.orders?.value?.filename || 'base não carregada'} ·{' '}
              {ordersData ? `${ordersData.rows.length} linhas na base` : 'sem cobertura confirmada'}
              . Execuções efetivas excluem visitas improdutivas; agendamentos usam a data marcada e
              não devem ser somados às execuções.
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
            <IndicatorSettings
              settings={settings}
              revision={store.settingsRevision}
              ready={store.settingsReady && !manualDirty}
              busy={store.busy}
              save={store.save}
            />
          </section>
          {valid && (
            <IndicatorCards
              settings={settings}
              values={values}
              oldValues={oldValues}
              zohoData={zohoData}
              weekly={weekly}
              manualMetric={manualMetric}
              comparisonAvailable={comparisonAvailable}
            />
          )}
          {viewMode === 'editorial' && valid && (
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
            <div className="si-source-status">
              <strong>OS</strong>
              <small>{sources.orders?.value?.filename || 'Carregue a base em Importação.'}</small>
              <strong>Zoho</strong>
              <small>
                {zoho
                  ? `Consulta de ${date(zohoData.period.start)} a ${date(zohoData.period.end)} · ${new Date(zohoData.readAt).toLocaleString('pt-BR')}`
                  : 'Sem consulta que cubra todo o período.'}
              </small>
            </div>
            <div className="si-toolbar">
              <button
                disabled={
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
                <button disabled={profileBusy || busy || backlogBusy} onClick={inspectProfile}>
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
                <button disabled={backlogBusy || busy} onClick={loadBacklog}>
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
                  Agenda e execução são etapas diferentes e podem conter o mesmo serviço.
                  Executados: Concluída/Pago, sem Visita Improdutiva. Improdutivas contam somente na
                  agenda, pela data e responsável de agendamento, e nunca como execução. A agenda
                  não é histórico da ação de agendar: usa a data marcada no arquivo. Ausência de
                  registros na base não comprova ausência de trabalho.
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
                {storyOrder.map((storyKey) => {
                  const story = stories[storyKey];
                  const groupSections = settings.sections.filter(
                    (key) => sectionStories[key] === storyKey,
                  );
                  return (
                    <section className="si-panel si-story" data-story={storyKey} key={storyKey}>
                      <header className="si-story-heading">
                        <div>
                          <h2>{story.title}</h2>
                          <p>{story.description}</p>
                        </div>
                      </header>
                      <div className="si-story-sections">
                        {groupSections.map((key) => (
                          <section className="si-story-section" data-section={key} key={key}>
                            <h3>
                              {sections[key]}{' '}
                              <InfoNote label={`Regras de ${sections[key]}`}>
                                {key === 'agents'
                                  ? 'Atendimentos OS por linha. Criados/fechados usam o período; pendentes e espera são a carteira atual, sem filtro temporal. Em espera já está incluído nos pendentes.'
                                  : key === 'subjects'
                                    ? 'Categorias atuais do Zoho nos chamados atualmente fechados. Catálogo confirmado inclui zero. Cada chamado conta pelo último agente que o fechou; categorias não são inferidas pelo título.'
                                    : key === 'evolution'
                                      ? 'Datas próprias da fonte; dias sem dados não representam ausência de trabalho.'
                                      : key === 'types'
                                        ? 'Serviço combina Tipo de Serviço e Motivo da OS. Agenda usa a data marcada; execução efetiva usa a data de atendimento. As etapas são contadas separadamente.'
                                        : 'Lançamentos manuais por data e agente; campos vazios não são zero e não são somados ao mesmo indicador automático.'}
                              </InfoNote>
                            </h3>
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
                                      onItemClick={(item) =>
                                        showZohoTimeDetails(
                                          `Tempo apontado · ${item.label}`,
                                          (row) => row.agentId === item.id,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <Table
                                  numericColumns={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                                  headers={[
                                    'Agente',
                                    'Agendados · OS',
                                    'Executados · OS',
                                    zoho?.created != null
                                      ? 'Criados pelo agente · Zoho'
                                      : 'Criados · manual',
                                    'Pendentes agora · Zoho',
                                    'Em espera agora · Zoho',
                                    'Fechados · Zoho',
                                    'Tempo · Zoho',
                                    'Equipamentos · manual',
                                    'Atividades · manual',
                                  ]}
                                  rows={agentRows}
                                />
                              </>
                            )}
                            {key === 'evolution' && (
                              <div className="si-chart-grid">
                                <div>
                                  <h4>Serviços efetivos por dia · OS</h4>
                                  <Chart
                                    compact
                                    height={250}
                                    showDrilldownHint={false}
                                    title="Serviços efetivos por dia"
                                    type="line"
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
                                        (row) => row.execution && row.executedAt === item.detailKey,
                                      )
                                    }
                                  />
                                  <small>
                                    Pela data de atendimento; improdutivas ficam fora das execuções.
                                  </small>
                                </div>
                                <div>
                                  <h4>Agendamentos por dia · OS</h4>
                                  <Chart
                                    compact
                                    height={250}
                                    showDrilldownHint={false}
                                    title="Agendamentos por dia"
                                    type="line"
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
                                    height={250}
                                    showDrilldownHint={false}
                                    title="Tempo apontado por dia"
                                    type="line"
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
                                    Dias sem apontamentos não são preenchidos com tempo presumido.
                                  </small>
                                </div>
                              </div>
                            )}
                            {key === 'types' && (
                              <>
                                {viewMode === 'editorial' && (
                                  <p className="si-story-lead">
                                    Primeiro, o mix de serviços efetivamente executados; em seguida,
                                    onde esse trabalho se concentrou. O agendamento aparece à parte
                                    para não sugerir conversão automática.
                                  </p>
                                )}
                                <div className="si-chart-grid">
                                  <div>
                                    <h4>
                                      {viewMode === 'editorial'
                                        ? '1 · O que foi executado?'
                                        : 'Serviços executados · OS'}
                                    </h4>
                                    <Chart
                                      compact
                                      title="Execuções efetivas por serviço · OS"
                                      items={
                                        hasOrders
                                          ? orders.services
                                              .filter((d) => d.executed > 0)
                                              .map((d) => ({ label: d.label, value: d.executed }))
                                          : []
                                      }
                                      onItemClick={(item) =>
                                        showOrderDetails(
                                          `Execuções efetivas · ${item.label}`,
                                          (row) => row.execution && row.service === item.label,
                                        )
                                      }
                                    />
                                    <small>
                                      Tipo de Serviço + Motivo; somente execuções efetivas.
                                    </small>
                                  </div>
                                  <div>
                                    <h4>
                                      {viewMode === 'editorial'
                                        ? '2 · Onde o trabalho se concentrou?'
                                        : 'Clientes atendidos · OS'}
                                    </h4>
                                    <Chart
                                      compact
                                      title="Execuções efetivas por cliente · OS"
                                      items={
                                        hasOrders
                                          ? orders.clients
                                              .filter((d) => d.executed > 0)
                                              .slice(0, 5)
                                              .map((d) => ({
                                                label: d.label,
                                                value: d.executed,
                                                caption: `${number(d.scheduled)} agendados`,
                                              }))
                                          : []
                                      }
                                    />
                                    <small>Top 5 por execuções; agenda como referência.</small>
                                  </div>
                                </div>
                                <div className="si-client-service-table">
                                  <Table
                                    headers={[
                                      'Cliente',
                                      'Agendados',
                                      'Executados',
                                      'Serviços (exec. / agend.)',
                                    ]}
                                    rows={
                                      hasOrders
                                        ? orders.clients
                                            .slice(0, viewMode === 'compact' ? 8 : undefined)
                                            .map((d) => [
                                              d.label,
                                              d.scheduled,
                                              d.executed,
                                              d.services,
                                            ])
                                        : []
                                    }
                                  />
                                  <small>Em cada serviço: execuções efetivas / agendamentos.</small>
                                  {viewMode === 'compact' && orders?.clients.length > 8 && (
                                    <details className="si-report-expandable si-client-reasons">
                                      <summary>
                                        Ver todos os clientes ({orders.clients.length})
                                      </summary>
                                      <Table
                                        headers={[
                                          'Cliente',
                                          'Agendados',
                                          'Executados',
                                          'Serviços (exec. / agend.)',
                                        ]}
                                        rows={orders.clients.map((d) => [
                                          d.label,
                                          d.scheduled,
                                          d.executed,
                                          d.services,
                                        ])}
                                      />
                                    </details>
                                  )}
                                </div>
                              </>
                            )}
                            {key === 'subjects' &&
                              (zoho?.categories != null ? (
                                <>
                                  <p className="scope">
                                    {zohoData?.categoryCatalog
                                      ? 'Catálogo Zoho · inclui categorias zeradas.'
                                      : 'Catálogo indisponível · somente categorias encontradas.'}
                                  </p>
                                  <Chart
                                    compact
                                    title="Categorias dos chamados fechados"
                                    items={zoho.categories}
                                    onItemClick={(item) =>
                                      showClosedTicketDetails(
                                        `Chamados fechados · ${item.label}`,
                                        (row) => row.category === item.label,
                                      )
                                    }
                                  />
                                  <details className="si-report-expandable">
                                    <summary>Tabela por categoria</summary>
                                    <Table
                                      headers={[
                                        'Categoria atual no Zoho',
                                        'Chamados fechados distintos',
                                      ]}
                                      rows={zoho.categories.map((r) => [r.label, r.value])}
                                    />
                                  </details>
                                  <details className="si-report-expandable">
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
                                    Classificação manual dos chamados atendidos. Categorias podem se
                                    sobrepor; não representam o total de chamados distintos.
                                  </p>
                                  <Chart
                                    compact
                                    title="Assuntos informados"
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
                                </>
                              ))}
                            {key === 'manual' && (
                              <>
                                <ManualIndicatorForm
                                  key={period.start + period.end}
                                  records={store.records}
                                  period={period}
                                  busy={store.busy}
                                  ready={store.ready}
                                  save={store.save}
                                  today={today}
                                  onDirty={setManualDirty}
                                />
                                <Table
                                  headers={['Indicador manual', 'Quantidade informada']}
                                  rows={manualFields
                                    .slice(10)
                                    .map(([key, label]) => [label, manual?.totals[key] ?? null])}
                                />
                                <details>
                                  <summary>Lançamentos, observações e origem</summary>
                                  <Table
                                    headers={[
                                      'Data',
                                      'Agente',
                                      'Campos informados',
                                      'Observações',
                                      'Algo novo?',
                                      'Revisão',
                                      'Salvo em',
                                    ]}
                                    rows={(manual?.entries || []).map((r) => [
                                      date(r.value.date),
                                      agents.find((a) => a.id === r.value.agentId)?.name,
                                      Object.values(r.value.values).filter((n) => n !== null)
                                        .length,
                                      r.value.note,
                                      r.value.novelty,
                                      r.revision,
                                      new Date(r.updatedAt).toLocaleString('pt-BR'),
                                    ])}
                                  />
                                </details>
                              </>
                            )}
                          </section>
                        ))}
                      </div>
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
