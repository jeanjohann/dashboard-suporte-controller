/** Apresenta a mesma coleta da seção Zoho, sem disparar consultas nem misturar recortes de OS. */
import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useZohoSession } from '../hooks/ZohoSession.jsx';
import { summarizeZohoActivity } from '../../../shared/data/zohoActivity.js';
import { chartColors } from '../../../shared/charts/palette.js';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { useAccess } from '../../../shared/security/Access.jsx';

const duration = (seconds) => {
  if (seconds == null) return 'A conferir';
  const n = Math.round(seconds);
  return `${Math.floor(n / 3600)}h ${String(Math.floor((n % 3600) / 60)).padStart(2, '0')}min ${String(n % 60).padStart(2, '0')}s`;
};
const day = (value) => value.split('-').reverse().join('/');
const metrics = {
  seconds: 'Tempo apontado',
  meanSeconds: 'Média por chamado com apontamento',
  ticketsWithTime: 'Chamados com tempo registrado',
  replies: 'Respostas enviadas',
  ticketsReplied: 'Chamados respondidos',
};
export function SupportZohoOverview() {
  const { managed, user } = useAccess();
  const { data, reviewedReplies, setOpen } = useZohoSession();
  const [metric, setMetric] = useState('seconds');
  const summary = useMemo(
    () => (data ? summarizeZohoActivity(data, { reviewedReplies }) : null),
    [data, reviewedReplies],
  );
  const time = metric === 'seconds' || metric === 'meanSeconds';
  const items =
    summary?.agents.map((agent) => ({
      label: agent.name,
      value: agent[metric] == null ? null : agent[metric] / (time ? 60 : 1),
    })) || [];
  const open = () => {
    setOpen(true);
    document.getElementById('zoho-desk')?.scrollIntoView({ block: 'start' });
  };
  if (!managed || !user?.active || user.role !== 'admin') return null;
  return (
    <section className="support-zoho-overview" aria-label="Zoho na Visão geral do suporte">
      <h4>Zoho Desk · Eduardo e Jean</h4>
      {!data ? (
        <p className="scope">
          Consulte a atividade na seção Zoho Desk para exibir os indicadores reais aqui.
        </p>
      ) : (
        <>
          <p className="scope">
            Período do Zoho: {day(data.period.start)} a {day(data.period.end)} (Brasília). Leitura:{' '}
            {new Date(data.readAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Os
            filtros de OS desta Visão geral não alteram esta coleta.
          </p>
          <label className="support-zoho-chart-control">
            Indicador Zoho{' '}
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              {Object.entries(metrics).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {items.some((item) => item.value != null) ? (
            <>
              <p className="scope">
                {metrics[metric]} · {time ? 'eixo em minutos' : 'quantidade por agente'}
              </p>
              <div
                className="dashboard-plot"
                role="img"
                aria-label={`Zoho: ${metrics[metric]}. Valores na tabela abaixo.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={items} margin={{ left: 0, right: 12, bottom: 16 }}>
                    <CartesianGrid vertical={false} stroke="#edf1f4" />
                    <XAxis dataKey="label" tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={time} width={42} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value) => [
                        time ? duration(Number(value) * 60) : value,
                        metrics[metric],
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      name={metrics[metric]}
                      fill={chartColors.blue}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="scope">
              Este indicador está indisponível ou aguardando conferência na seção Zoho Desk.
            </p>
          )}
          <div className="table-scroll">
            <SortableTable aria-label="Indicadores Zoho na Visão geral">
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Tempo apontado</th>
                  <th>Chamados com tempo</th>
                  <th>Média por chamado</th>
                  <th>Respostas</th>
                  <th>Chamados respondidos</th>
                </tr>
              </thead>
              <tbody>
                {summary.agents.map((agent) => (
                  <tr key={agent.id}>
                    <td>{agent.name}</td>
                    <td>{duration(agent.seconds)}</td>
                    <td>{agent.ticketsWithTime}</td>
                    <td>{agent.meanSeconds == null ? '—' : duration(agent.meanSeconds)}</td>
                    <td>{agent.replies ?? 'A conferir'}</td>
                    <td>{agent.ticketsReplied ?? 'A conferir'}</td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </div>
          <p className="scope">
            Fonte e cobertura da última coleta do Zoho. Tempo apontado não equivale a jornada.
            Respostas pendentes de revisão não aparecem como zero.
          </p>
        </>
      )}
      <button type="button" onClick={open}>
        {data ? 'Abrir detalhes e período do Zoho' : 'Consultar Zoho Desk'}
      </button>
    </section>
  );
}
