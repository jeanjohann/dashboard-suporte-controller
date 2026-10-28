import { WorkspaceQueryPanel } from '../../../shared/persistence/WorkspaceQueryPanel.jsx';
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
  awaitingScheduleCount,
  preparedEquipmentSummary,
  zohoSummary,
  backlogSummary,
  duration,
} from '../domain/indicators.js';
import { useIndicatorRecords } from '../hooks/useIndicatorRecords.js';
import { ManualIndicatorForm } from './ManualIndicatorForm.jsx';
import { PreparedEquipmentPanel } from './PreparedEquipmentPanel.jsx';
import { IndicatorSettings } from './IndicatorSettings.jsx';
import { useDashboardPresentation } from '../../my-dashboard/hooks/useDashboardPresentation.js';

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
function ResponsiveSummaryTable({ headers, rows, primaryColumns, numericColumns = [] }) {
  const primary = new Set([0, ...primaryColumns]);
  return (
    <>
      <div className="si-mobile-summary-cards">
        {rows.map((row, index) => (
          <article className="si-mobile-summary-card" key={index}>
            <h4>{row[0] ?? 'Sem identificação'}</h4>
            <dl>
              {primaryColumns.map((column) => (
                <div key={column}>
                  <dt>{headers[column]}</dt>
                  <dd>{row[column] ?? 'Sem dados'}</dd>
                </div>
              ))}
            </dl>
            <details>
              <summary>Ver todos os dados</summary>
              <dl className="si-mobile-summary-details">
                {headers.map((header, column) =>
                  primary.has(column) ? null : (
                    <div key={header}>
                      <dt>{header}</dt>
                      <dd>{row[column] ?? 'Sem dados'}</dd>
                    </div>
                  ),
                )}
              </dl>
            </details>
          </article>
        ))}
        {!rows.length && <p className="scope">Nenhum registro neste recorte.</p>}
      </div>
      <div className="si-desktop-summary-table">
        <Table headers={headers} rows={rows} numericColumns={numericColumns} />
      </div>
    </>
  );
}
function ServiceList({ value, chips = false }) {
  const services = String(value || '')
    .split('; ')
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*): (\d+)\/(\d+)$/);
      return match
        ? { label: match[1], executed: Number(match[2]), scheduled: Number(match[3]) }
        : { label: entry, executed: null, scheduled: null };
    });
  return (
    <ul
      className={`si-client-service-list${chips ? ' si-client-service-chips' : ''}`}
      aria-label="Serviços por cliente"
    >
      {services.map((service) => (
        <li key={service.label}>
          <span>{service.label}</span>
          {service.executed != null && (
            <strong title="Execuções efetivas / agendamentos">
              {service.executed}/{service.scheduled}
            </strong>
          )}
        </li>
      ))}
    </ul>
  );
}
function ClosedTicketDetails({ rows }) {
  const [page, setPage] = useState(0);
  const last = Math.max(0, Math.ceil(rows.length / 25) - 1),
    current = Math.min(page, last);
  return (
    <details className="si-closed-ticket-records">
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
  return (
    <div className="si-cards">
      {cardKeys.map((key) => {
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
      })}
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
function MiniTrend({ items, variant = 'line', label }) {
  const values = (items || []).filter((item) => Number.isFinite(item.value));
  if (!values.length) return <span className="si-mini-trend-empty">Sem dados</span>;
  const width = 156;
  const height = 48;
  const inset = 5;
  const max = Math.max(1, ...values.map((item) => item.value));
  const points = values.map((item, index) => ({
    x:
      values.length === 1 ? width / 2 : inset + (index * (width - inset * 2)) / (values.length - 1),
    y: height - inset - (Math.max(0, item.value) / max) * (height - inset * 2),
  }));
  const barGap = 3;
  const barWidth = Math.max(2, (width - inset * 2 - barGap * (values.length - 1)) / values.length);
  return (
    <svg
      className={`si-mini-trend si-mini-trend-${variant}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      {variant === 'bars' ? (
        values.map((item, index) => {
          const barHeight = (Math.max(0, item.value) / max) * (height - inset * 2);
          return (
            <rect
              key={`${item.label}-${index}`}
              x={inset + index * (barWidth + barGap)}
              y={height - inset - barHeight}
              width={barWidth}
              height={Math.max(1, barHeight)}
              rx="2"
            />
          );
        })
      ) : (
        <>
          <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} />
          {points.map((point, index) => (
            <circle key={`${values[index].label}-${index}`} cx={point.x} cy={point.y} r="2.5" />
          ))}
        </>
      )}
    </svg>
  );
}

function ServiceChartDialog({ open, onClose, services, clients, daily, zohoDaily, period }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [open]);
  if (!open) return null;
  const serviceRows = (services || []).map((service) => [
    'Serviço',
    '',
    service.label,
    service.executed,
    service.scheduled,
  ]);
  const clientRows = (clients || []).map((client) => [
    'Cliente',
    client.label,
    client.services || '',
    client.executed,
    client.scheduled,
  ]);
  const exportRows = [
    ['Visão', 'Cliente', 'Serviço · motivo', 'Execuções efetivas', 'Agendamentos'],
    ...serviceRows,
    ...clientRows,
  ];
  async function exportCsv() {
    if (!(await authorizeAction('export'))) return;
    await download(
      csv(exportRows),
      'text/csv;charset=utf-8',
      'indicadores-suporte-servicos-e-clientes.csv',
    );
  }
  return (
    <dialog
      ref={dialog}
      className="si-service-chart-dialog"
      aria-labelledby="si-service-chart-title"
      onClose={onClose}
    >
      <header>
        <div>
          <span className="si-dialog-kicker">Análise operacional · OS</span>
          <h2 id="si-service-chart-title">Ritmo dos atendimentos</h2>
        </div>
        <div className="si-service-chart-actions">
          <span className="si-preview-period">
            <small>Período selecionado</small>
            <strong>
              {date(period.start)} a {date(period.end)}
            </strong>
          </span>
          <button
            type="button"
            onClick={async () => {
              if (await authorizeAction('export')) window.print();
            }}
          >
            Imprimir
          </button>
          <button type="button" onClick={exportCsv}>
            Exportar CSV
          </button>
          <button type="button" onClick={() => dialog.current?.close()}>
            Fechar
          </button>
        </div>
      </header>
      <div className="si-service-preview-metrics">
        <article className="si-service-preview-card">
          <div>
            <h3>Serviços efetivos por dia</h3>
            <small>Execuções concluídas</small>
          </div>
          <MiniTrend
            items={(daily || []).map((item) => ({ label: item.label, value: item.executed }))}
            label="Tendência diária de serviços efetivos"
          />
        </article>
        <article className="si-service-preview-card si-service-preview-bars">
          <div>
            <h3>Agendamentos por dia</h3>
            <small>Volume previsto</small>
          </div>
          <MiniTrend
            variant="bars"
            items={(daily || []).map((item) => ({ label: item.label, value: item.scheduled }))}
            label="Volume diário de agendamentos"
          />
        </article>
        <article className="si-service-preview-card si-service-preview-time">
          <div>
            <h3>Tempo apontado · Zoho</h3>
            <small>Apontamentos registrados</small>
          </div>
          <MiniTrend
            items={(zohoDaily || []).map((item) => ({ label: item.label, value: item.value }))}
            label="Tendência diária de tempo apontado no Zoho"
          />
        </article>
      </div>
      <div className="si-service-chart-content">
        <section className="si-service-client-breakdown">
          <div className="si-service-preview-table-heading">
            <div>
              <h3>Clientes e serviços executados</h3>
              <small>
                Serviço e motivo em cada cliente · fonte compacta para leitura da carteira
              </small>
            </div>
          </div>
          <Table
            headers={['Cliente', 'Agend.', 'Exec.', 'Serviço · motivo (exec. / agend.)']}
            rows={(clients || []).map((client) => [
              client.label,
              client.scheduled,
              client.executed,
              <ServiceList value={client.services} chips />,
            ])}
            numericColumns={[1, 2]}
          />
          <small>
            <span className="si-legend-dot si-legend-execution" /> Execução efetiva
            <span className="si-legend-dot si-legend-schedule" /> Agendamento sem execução efetiva
          </small>
        </section>
      </div>
    </dialog>
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
  const storyOrder = ['team', 'service-flow', 'support-profile'].filter((storyKey) =>
    settings.sections.some((key) => sectionStories[key] === storyKey),
  );
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
  const agentServiceRows = hasOrders
    ? orders.agentServices
        .filter((row) => !agentId || row.agentId === agentId)
        .map((row) => [row.agent, row.label, row.scheduled, row.executed])
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
  const manualSubjectRows = subjects.flatMap(([key, label]) =>
    shownAgents.map((agent) => {
      const summary = store.ready ? manualSummary(store.records, period, agent.id) : null;
      return [agent.name, label, summary?.totals[`subject_${key}`] ?? null];
    }),
  );
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
          {configurationOpen && !presentation.presenting && (
            <div
              className="si-config-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setConfigurationOpen(false);
                  setPresentationMode(false);
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
                      setConfigurationOpen(false);
                      setPresentationMode(false);
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
                        <div
                          className="si-view-modes"
                          role="group"
                          aria-label="Modo de visualização"
                        >
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
                            Selecione os blocos e o estilo. Inicie para abrir a tela limpa de
                            apresentação.
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
                            setPresentationMode(true);
                            setConfigurationOpen(false);
                            presentation.enter();
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
                          {ordersData && (
                            <small>{number(ordersData.rows.length)} linhas disponíveis</small>
                          )}
                        </div>
                        <div>
                          <strong>Zoho Desk</strong>
                          <span>
                            {zoho
                              ? `Consulta ${date(zohoData.period.start)} a ${date(zohoData.period.end)}`
                              : 'Sem consulta completa para o período'}
                          </span>
                          {zohoData?.readAt && (
                            <small>Atualizado em {timestamp(zohoData.readAt)}</small>
                          )}
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
                        {busy
                          ? `Consultando ${progress} chamados…`
                          : 'Consultar Zoho neste período'}
                      </button>
                      {busy && <button onClick={() => pending.current?.abort()}>Cancelar</button>}
                      <button disabled={store.loading || store.busy} onClick={store.reload}>
                        Recarregar lançamentos
                      </button>
                    </div>
                    <details className="si-source-details">
                      <summary>Diagnósticos, critérios e validações</summary>
                      <p className="scope">
                        Zoho: até 31 dias por consulta. Tempo é a soma dos apontamentos nos
                        chamados, não tempo conectado. Aberturas exigem autoria confirmada no
                        histórico. Assuntos usam a categoria atual dos chamados fechados. Sem
                        consulta completa, os lançamentos manuais são apresentados separadamente
                        como alternativa.
                      </p>
                      <p className="scope">
                        Agenda e execução são etapas distintas. Execuções efetivas: Concluída/Pago,
                        sem Visita Improdutiva. Agenda: status Agendado, data e responsável válidos.
                        Campos manuais vazios não representam zero.
                      </p>
                      <details>
                        <summary>Validar autoria de abertura e assuntos no Zoho</summary>
                        <p className="scope">
                          Amostra recente para conferir autoria de abertura e categorias, sem
                          alterar os indicadores.
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
                        Chamados atribuídos e não encerrados, inclusive os em espera. Não usa o
                        filtro de período.
                      </p>
                    </div>
                    <div className="si-config-actions">
                      {backlog && (
                        <strong>
                          {number(backlog.total)} pendentes · {number(backlog.onHold)} em espera
                        </strong>
                      )}
                      <button
                        disabled={!store.writable || backlogBusy || busy}
                        onClick={loadBacklog}
                      >
                        {backlogBusy
                          ? `Conferindo ${backlogProgress} chamados…`
                          : 'Consultar pendências atuais'}
                      </button>
                      {backlogBusy && (
                        <button onClick={() => backlogRequest.current?.abort()}>Cancelar</button>
                      )}
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
                      setConfigurationOpen(false);
                      setPresentationMode(false);
                    }}
                  >
                    Concluído
                  </button>
                </footer>
              </section>
            </div>
          )}
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
                        <div className="si-story-sections">
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
                                  </div>
                                  <ResponsiveSummaryTable
                                    numericColumns={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                                    primaryColumns={[1, 2, 6, 8]}
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
                                      'Eventos · criados + fechados',
                                      'Tempo · Zoho',
                                      'Equipamentos · manual',
                                      'Atividades · manual',
                                    ]}
                                    rows={agentRows}
                                  />
                                  <details
                                    className="si-report-expandable si-agent-service-breakdown"
                                    open={presentationMode}
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
                                      ]}
                                      rows={agentServiceRows}
                                      numericColumns={[2, 3]}
                                    />
                                  </details>
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
                                      height={250}
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
                                      height={250}
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
                                      Dias sem apontamentos não são preenchidos com tempo presumido.
                                    </small>
                                  </div>
                                </div>
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
                                  <div className="si-chart-grid">
                                    <div>
                                      <h4>
                                        {contentViewMode === 'editorial'
                                          ? '1 · O que foi executado?'
                                          : 'Serviços executados · OS'}
                                      </h4>
                                      <Chart
                                        compact
                                        title="Execuções efetivas por serviço · OS"
                                        emptyTitle={
                                          !ordersData
                                            ? 'Planilha OS não carregada'
                                            : orders?.unavailable
                                              ? 'Colunas necessárias ausentes'
                                              : 'Nenhuma execução por serviço neste recorte'
                                        }
                                        emptyDescription={
                                          !ordersData
                                            ? 'Carregue a planilha de Ordens de Serviço para ver os serviços realizados.'
                                            : orders?.unavailable
                                              ? `Confira as colunas: ${orders.unavailable.join(', ')}.`
                                              : 'Não há execuções efetivas por serviço no período e nos filtros atuais.'
                                        }
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
                                        {contentViewMode === 'editorial'
                                          ? '2 · Onde o trabalho se concentrou?'
                                          : 'Clientes atendidos · OS'}
                                      </h4>
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
                                  <details
                                    className="si-report-expandable si-service-type-summary"
                                    open={presentationMode}
                                  >
                                    <summary>Resumo por tipo de serviço</summary>
                                    <Table
                                      headers={[
                                        'Tipo de serviço · OS',
                                        'Executados efetivos',
                                        'Participação',
                                        'Agendamentos',
                                      ]}
                                      rows={(orders?.serviceTypes || []).map((service) => [
                                        service.label,
                                        service.executed,
                                        service.share == null
                                          ? '—'
                                          : `${(service.share * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`,
                                        service.scheduled,
                                      ])}
                                      numericColumns={[1, 2, 3]}
                                    />
                                  </details>
                                  <div className="si-client-service-table">
                                    <ResponsiveSummaryTable
                                      primaryColumns={[1, 2]}
                                      headers={[
                                        'Cliente',
                                        'Agendados',
                                        'Executados',
                                        'Serviços (exec. / agend.)',
                                      ]}
                                      rows={
                                        hasOrders
                                          ? orders.clients
                                              .slice(
                                                0,
                                                contentViewMode === 'compact' ? 8 : undefined,
                                              )
                                              .map((d) => [
                                                d.label,
                                                d.scheduled,
                                                d.executed,
                                                <ServiceList
                                                  value={d.services}
                                                  chips={contentViewMode === 'compact'}
                                                />,
                                              ])
                                          : []
                                      }
                                    />
                                    <small>
                                      Em cada serviço: execuções efetivas / agendamentos.
                                    </small>
                                    {contentViewMode === 'compact' &&
                                      orders?.clients.length > 8 && (
                                        <details
                                          className="si-report-expandable si-client-reasons"
                                          open={presentationMode}
                                        >
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
                                              <ServiceList
                                                value={d.services}
                                                chips={contentViewMode === 'compact'}
                                              />,
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
                                        headers={['Agente', 'Assunto', 'Quantidade informada']}
                                        rows={manualSubjectRows}
                                        numericColumns={[2]}
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
