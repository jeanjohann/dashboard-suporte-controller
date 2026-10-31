import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { attendanceExtent } from '../../../shared/data/filters.js';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { csv, download } from '../../../shared/export/exports.js';
import { number, date, timestamp, format } from './supportIndicatorFormat.js';

export function MetricComparison({ metric, current, previous }) {
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
export function Table({ headers, rows, numericColumns = [] }) {
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
export function ResponsiveSummaryTable({ headers, rows, primaryColumns, numericColumns = [] }) {
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
export function ServiceList({ value, chips = false }) {
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
export function ClosedTicketDetails({ rows }) {
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
export function SourceCoverage({
  ordersData,
  orders,
  zohoData,
  zoho,
  manual,
  store,
  period,
  valid,
}) {
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
export function DrilldownDialog({ detail, onClose }) {
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
export function MiniTrend({ items, variant = 'line', label }) {
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

export function ServiceChartDialog({ open, onClose, services, clients, daily, zohoDaily, period }) {
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
