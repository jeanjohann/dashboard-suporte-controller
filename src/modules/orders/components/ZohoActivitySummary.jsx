/** Mesma coleta nas duas telas; a Visão geral usa a apresentação compacta. */
import React, { useId, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { chartColors } from '../../../shared/charts/palette.js';
export function zohoDuration(seconds, compact = false) {
  if (seconds == null) return '—';
  const n = Math.round(seconds),
    h = Math.floor(n / 3600),
    m = Math.floor((n % 3600) / 60),
    s = n % 60;
  if (compact) return h ? `${h}h ${String(m).padStart(2, '0')}min` : m ? `${m}min` : `${s}s`;
  return `${h}h ${String(m).padStart(2, '0')}min ${String(s).padStart(2, '0')}s`;
}
const metrics = {
  seconds: 'Tempo apontado',
  confirmedTicketsReplied: 'Chamados com resposta confirmada',
  confirmedReplies: 'Respostas confirmadas',
  ticketsWithTime: 'Chamados com tempo',
  meanSeconds: 'Média por chamado com tempo',
};
export function ZohoActivitySummary({ summary, compact = false, onReview }) {
  const [metric, setMetric] = useState('seconds');
  const id = useId();
  const time = metric === 'seconds' || metric === 'meanSeconds';
  const items = summary.agents.map((agent, index) => ({
    name: agent.name,
    label: agent.name.split(' ')[0],
    value: agent[metric] == null ? null : agent[metric] / (time ? 60 : 1),
    color: index ? chartColors.primary : chartColors.blue,
  }));
  const totals = summary.totals;
  const cards = [
    [
      'Chamados respondidos',
      totals.confirmedTicketsReplied,
      'coverage',
      'Chamados distintos com resposta pública validada no período da coleta. Havendo pendências, mostra somente os confirmados. Um chamado pode ter respostas confirmadas e pendentes; não somar esses grupos.',
    ],
    [
      'Tempo apontado',
      zohoDuration(totals.seconds, true),
      'finance',
      'Tempo registrado pelos agentes no período. Não equivale a jornada ou tempo de presença.',
    ],
    [
      'Chamados com tempo',
      totals.ticketsWithTime,
      'service',
      'Chamados distintos com apontamento válido. O total da equipe não soma chamados repetidos entre pessoas.',
    ],
    [
      'Média por chamado',
      zohoDuration(totals.meanSeconds, true),
      'attention',
      'Tempo apontado dividido pelos chamados com tempo registrado. Sem chamados elegíveis, a média fica indisponível.',
    ],
  ];
  const columns = [
    ['name', 'Agente'],
    ['confirmedTicketsReplied', 'Respondidos confirmados'],
    ...(!compact ? [['confirmedReplies', 'Respostas confirmadas']] : []),
    ['seconds', 'Tempo apontado'],
    ...(!compact ? [['ticketsWithTime', 'Com tempo']] : []),
    ['meanSeconds', 'Média/chamado'],
  ];
  return (
    <div className={`zoho-summary${compact ? ' zoho-summary-compact' : ''}`}>
      <div className="zoho-kpis">
        {cards.map(([label, result, tone, help]) => (
          <article className={`zoho-kpi support-tone-${tone}`} key={label}>
            <div className="zoho-kpi-heading">
              <span>{label}</span>
              <InfoNote>{help}</InfoNote>
            </div>
            <strong
              title={
                label === 'Tempo apontado'
                  ? zohoDuration(totals.seconds)
                  : label === 'Média por chamado'
                    ? zohoDuration(totals.meanSeconds)
                    : undefined
              }
            >
              {result ?? 'A conferir'}
            </strong>
            {label === 'Chamados respondidos' && (
              <small>
                {totals.pendingReplyCount ? 'Confirmados · total parcial' : 'Confirmados na coleta'}
              </small>
            )}
          </article>
        ))}
      </div>
      {totals.pendingReplyCount > 0 && (
        <div className="zoho-confirmation-status" role="status">
          <div>
            <strong>
              {totals.pendingReplyCount}{' '}
              {totals.pendingReplyCount === 1 ? 'interação pendente' : 'interações pendentes'} de
              conferência
            </strong>
            <span>
              Em {totals.pendingTicketCount}{' '}
              {totals.pendingTicketCount === 1 ? 'chamado' : 'chamados'}. Podem incluir chamados já
              contados entre os confirmados.
            </span>
          </div>
          <details>
            <summary>Por que há pendências?</summary>
            <ul>
              {totals.reviewReasons.map(({ reason, count }) => (
                <li key={reason}>
                  {reason}: {count}
                </li>
              ))}
            </ul>
            <p>
              Uma interação pode ter mais de um motivo. Os tempos apontados são calculados
              separadamente.
            </p>
          </details>
          {onReview && (
            <button type="button" onClick={onReview}>
              Conferir interações
            </button>
          )}
        </div>
      )}
      <div className="zoho-summary-grid">
        <div className="zoho-agent-chart">
          <div className="zoho-subheading">
            <h4>Comparação por agente</h4>
            <select
              aria-label={`Indicador Zoho${compact ? ' da Visão geral' : ' da equipe'}`}
              value={metric}
              onChange={(event) => setMetric(event.target.value)}
            >
              {Object.entries(metrics).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {items.some((item) => item.value != null) ? (
            <div
              className="zoho-plot"
              role="img"
              aria-label={`${metrics[metric]} por agente, ${time ? 'em minutos' : 'em quantidade'}. Valores completos na tabela.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={items}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--ui-border)" />
                  <XAxis
                    type="number"
                    allowDecimals={time}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={68}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                    formatter={(value) => [
                      time ? zohoDuration(Number(value) * 60) : value,
                      metrics[metric],
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    maxBarSize={25}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                  >
                    {items.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="scope zoho-no-metric">
              Indicador aguardando conferência na página da equipe.
            </p>
          )}
          <span className="scope zoho-chart-unit">
            {time ? 'Eixo em minutos' : 'Quantidade por agente'}
          </span>
        </div>
        <div className="zoho-agent-table">
          <h4 id={id}>Resumo por agente</h4>
          {!compact && (
            <p className="zoho-table-hint">Deslize a tabela para ver todos os indicadores →</p>
          )}
          <div className="table-scroll" tabIndex={compact ? undefined : 0}>
            <SortableTable
              aria-labelledby={id}
              aria-label={`Resumo Zoho por agente${compact ? ' na Visão geral' : ' na equipe'}`}
            >
              <thead>
                <tr>
                  {columns.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.agents.map((agent) => (
                  <tr key={agent.id}>
                    {columns.map(([key]) => (
                      <td
                        key={key}
                        data-sort={agent[key] ?? null}
                        title={
                          key === 'name'
                            ? agent.name
                            : ['seconds', 'meanSeconds'].includes(key)
                              ? zohoDuration(agent[key])
                              : undefined
                        }
                      >
                        {key === 'name'
                          ? compact
                            ? agent.name.split(' ')[0]
                            : agent.name
                          : ['seconds', 'meanSeconds'].includes(key)
                            ? zohoDuration(agent[key], true)
                            : (agent[key] ?? 'A conferir')}
                        {key === 'confirmedTicketsReplied' && agent.pendingReplyCount > 0 && (
                          <small className="zoho-pending-agent">
                            {agent.pendingReplyCount}{' '}
                            {agent.pendingReplyCount === 1
                              ? 'interação pendente'
                              : 'interações pendentes'}
                          </small>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </div>
        </div>
      </div>
    </div>
  );
}
