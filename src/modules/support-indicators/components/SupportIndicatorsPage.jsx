import { WorkspaceQueryPanel } from '../../../shared/persistence/WorkspaceQueryPanel.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';
import { authorizeAction, api } from '../../../shared/security/accessClient.js';
import { useDashboardSources } from '../../my-dashboard/hooks/DashboardSources.jsx';
import { loadZohoActivity } from '../../orders/data/zohoActivityClient.js';
import { loadZohoBacklog } from '../data/zohoBacklogClient.js';
import { supportPeriod } from '../../orders/domain/supportPerformance.js';
import { todaySaoPaulo } from '../../orders/domain/lifecycle.js';
import { Chart } from '../../../components/Chart.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { supportClosureBasis } from '../../../shared/data/zohoActivity.js';
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
export function SupportIndicatorsPage({ onPage, active = true }) {
  const { user, managed } = useAccess(),
    { sources } = useDashboardSources(),
    today = todaySaoPaulo(),
    [period, updatePeriod] = useState(() => supportPeriod('currentWeek', today)),
    [manualDirty, setManualDirty] = useState(false),
    [agentId, setAgent] = useState(''),
    [ownZoho, setOwnZoho] = useState(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState('');
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
  const shownAgents = agents.filter((a) => !agentId || a.id === agentId);
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
      ['Agente', agents.find((a) => a.id === agentId)?.name || 'Toda a equipe'],
      ['OS', sources.orders?.value?.filename || 'Não carregada'],
      ['Zoho consultado em', zoho ? zohoData.readAt : 'Não disponível para este período'],
      [
        'Critério',
        'OS em linhas, execução efetiva exclui visita improdutiva; agenda usa data Agendamento, exclui status cancelado. Não somar agenda e execução.',
      ],
      [
        'Manual',
        'Totais dos campos preenchidos; vazios não equivalem a zero. Criados = abertos pelo suporte.',
      ],
      [],
      ['Indicador', 'Valor', 'Unidade', 'Origem'],
    ];
    Object.entries(metricLabels).forEach(([key, label]) =>
      report.push([
        label,
        values[key],
        key === 'seconds' ? 'segundos' : 'quantidade',
        manualMetric(key)
          ? 'Manual'
          : key === 'seconds' || key === 'closed' || key === 'created'
            ? 'Zoho'
            : 'OS',
      ]),
    );
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
      <div className="app support-indicators-page">
        <Navigation page="support-indicators" onPage={onPage} />
        <main>
          <header className="si-heading">
            <div>
              <h1>Indicadores Suporte</h1>
              <p>Atendimentos, serviços e atividades da equipe.</p>
            </div>
            <div className="si-toolbar">
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
            <div>
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
          <section className="si-panel" aria-label="Chamados pendentes atuais no Zoho">
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
                        Histórico pendente:{' '}
                        {zohoData.closureReview.map((row) => row.number).join(', ')}. Isso não
                        significa zero fechamentos.
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
                    {values[key] != null && oldValues[key] != null && (
                      <small>
                        {values[key] != null && oldValues[key] != null
                          ? `Anterior: ${format(key, oldValues[key])} · diferença: ${format(key, Math.abs(values[key] - oldValues[key]))} ${values[key] > oldValues[key] ? 'a mais' : values[key] < oldValues[key] ? 'a menos' : '(igual)'}`
                          : ''}
                      </small>
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
                {settings.sections.map((key) => (
                  <section className="si-panel" key={key}>
                    <h2>
                      {sections[key]}{' '}
                      <InfoNote label={`Regras de ${sections[key]}`}>
                        {key === 'agents'
                          ? 'Atendimentos OS por linha. Criados/fechados usam o período; pendentes e espera são a carteira atual, sem filtro temporal. Em espera já está incluído nos pendentes.'
                          : key === 'subjects'
                            ? 'Categorias atuais do Zoho nos chamados atualmente fechados. Catálogo confirmado inclui zero. Cada chamado conta pelo último agente que o fechou; categorias não são inferidas pelo título.'
                            : key === 'evolution'
                              ? 'Datas próprias da fonte; dias sem dados não representam ausência de trabalho.'
                              : key === 'types'
                                ? 'Linhas elegíveis de OS, com agenda e execução em bases distintas.'
                                : 'Lançamentos manuais por data e agente; campos vazios não são zero e não são somados ao mesmo indicador automático.'}
                      </InfoNote>
                    </h2>
                    {key === 'agents' && (
                      <>
                        <div className="si-chart-grid">
                          <div>
                            <h3>Execuções efetivas · OS</h3>
                            <Chart
                              compact
                              title="Execuções efetivas por agente"
                              items={
                                hasOrders
                                  ? orders.agents
                                      .filter((a) => !agentId || a.id === agentId)
                                      .map((a) => ({ label: a.name, value: a.executed }))
                                  : []
                              }
                            />
                          </div>
                          <div>
                            <h3>Tempo apontado · Zoho</h3>
                            <Chart
                              compact
                              title="Tempo apontado por agente"
                              items={(zoho?.agents || []).map((a) => ({
                                label: a.name,
                                value: a.seconds,
                              }))}
                              format={duration}
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
                          <h3>Serviços efetivos por dia · OS</h3>
                          <Chart
                            compact
                            title="Serviços efetivos por dia"
                            type="line"
                            items={
                              hasOrders
                                ? orders.daily.map((d) => ({
                                    label: date(d.label),
                                    value: d.executed,
                                  }))
                                : []
                            }
                          />
                          <small>
                            Somente datas com registros nas etapas de agenda ou execução.
                          </small>
                        </div>
                        <div>
                          <h3>Tempo apontado por dia · Zoho</h3>
                          <Chart
                            compact
                            title="Tempo apontado por dia"
                            type="line"
                            items={(zoho?.daily || []).map((d) => ({
                              label: date(d.label),
                              value: d.value / 3600,
                            }))}
                            format={(n) =>
                              `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`
                            }
                          />
                          <small>
                            Dias sem apontamentos não são preenchidos com tempo presumido.
                          </small>
                        </div>
                      </div>
                    )}
                    {key === 'types' && (
                      <div className="si-chart-grid">
                        <div>
                          <h3>Tipos de serviço · OS</h3>
                          <Chart
                            compact
                            title="Execuções por tipo de serviço"
                            items={
                              hasOrders
                                ? orders.types.map((d) => ({ label: d.label, value: d.executed }))
                                : []
                            }
                          />
                          <Table
                            headers={['Tipo', 'Agendados', 'Executados efetivos']}
                            rows={
                              hasOrders
                                ? orders.types.map((d) => [d.label, d.scheduled, d.executed])
                                : []
                            }
                          />
                        </div>
                        <div>
                          <h3>Clientes · OS</h3>
                          <Table
                            headers={['Cliente', 'Agendados', 'Executados efetivos']}
                            rows={
                              hasOrders
                                ? orders.clients.map((d) => [d.label, d.scheduled, d.executed])
                                : []
                            }
                          />
                        </div>
                      </div>
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
                          />
                          <details>
                            <summary>Tabela por categoria</summary>
                            <Table
                              headers={['Categoria atual no Zoho', 'Chamados fechados distintos']}
                              rows={zoho.categories.map((r) => [r.label, r.value])}
                            />
                          </details>
                          <details>
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
                                label,
                                value: manual.totals[`subject_${key}`],
                              }))}
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
                              Object.values(r.value.values).filter((n) => n !== null).length,
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
                    'Tipo',
                    'Execução no período',
                    'Agenda no período',
                  ]}
                  rows={(orders?.rows || []).map((r) => [
                    r.sourceRow,
                    r.os,
                    date(r.executedAt),
                    date(r.scheduledAt),
                    r.type,
                    r.unproductive ? 'Não · improdutiva' : r.execution ? 'Efetiva' : '—',
                    r.scheduling ? 'Sim' : '—',
                  ])}
                />
              </details>
            </>
          )}
        </main>
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
