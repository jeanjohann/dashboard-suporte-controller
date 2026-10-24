import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceQueryPanel } from '../../../shared/persistence/WorkspaceQueryPanel.jsx';
import { zohoTeam, summarizeZohoActivity } from '../../../shared/data/zohoActivity.js';
import { todaySaoPaulo } from '../domain/lifecycle.js';
import { supportPerformance } from '../domain/supportPerformance.js';
import { loadZohoActivity } from '../data/zohoActivityClient.js';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { useZohoSession } from '../hooks/ZohoSession.jsx';
import { ZohoActivitySummary, zohoDuration as duration } from './ZohoActivitySummary.jsx';
import { ZohoPresencePanel } from './ZohoPresencePanel.jsx';
import { ZohoClosures } from './ZohoClosures.jsx';

const date = (text) =>
  text ? new Date(text).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '—';
export function SupportZohoActivity({ active, ordersData }) {
  const {
    data,
    setData,
    reviewedReplies,
    setReviewedReplies,
    mapping,
    setMapping,
    columns,
    setColumns,
  } = useZohoSession();
  const today = todaySaoPaulo();
  const [start, setStart] = useState(data?.period.start || today),
    [end, setEnd] = useState(data?.period.end || today);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0);
  const pending = useRef(null);
  const reviewAnchor = useRef(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  useEffect(() => {
    if (reviewOpen) reviewAnchor.current?.scrollIntoView({ block: 'nearest' });
  }, [reviewOpen]);
  useEffect(() => {
    setBusy(false);
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [active]);
  const summary = useMemo(
    () => (data ? summarizeZohoActivity(data, { reviewedReplies }) : null),
    [data, reviewedReplies],
  );
  const period = data?.period;
  const relevantTickets = new Set(
    [...(summary?.entries || []), ...(summary?.candidates || [])].map((row) => row.ticketId),
  );
  const ticketMetrics = (data?.metrics || []).filter(
    (metric) =>
      relevantTickets.has(metric.ticketId) ||
      zohoTeam.some((agent) => agent.id === metric.assigneeId),
  );
  const os = useMemo(
    () =>
      ordersData
        ? Object.fromEntries(
            ['execution', 'scheduling'].map((role) => [
              role,
              supportPerformance(ordersData, period || {}, role),
            ]),
          )
        : null,
    [ordersData, period],
  );
  const names = useMemo(
    () =>
      ordersData
        ? Object.fromEntries(
            ['execution', 'scheduling'].map((role) => [
              role,
              supportPerformance(ordersData, {}, role).groups?.map((group) => group.label) || [],
            ]),
          )
        : null,
    [ordersData],
  );
  async function load() {
    if (!active || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setProgress(0);
    setError('');
    try {
      const next = await loadZohoActivity({
        start,
        end,
        signal: controller.signal,
        onProgress: setProgress,
      });
      if (pending.current === controller) {
        setData(next);
        setReviewedReplies(false);
      }
    } catch (error) {
      if (pending.current === controller)
        setError(
          controller.signal.aborted
            ? 'Coleta cancelada. A leitura anterior foi mantida.'
            : error.message,
        );
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  if (!active) return null;
  return (
    <section className="zoho-activity" aria-label="Atividade Zoho de Eduardo e Jean">
      <WorkspaceQueryPanel
        kind="zoho-support"
        value={data ? { data, reviewedReplies, mapping, columns } : null}
        disabled={busy}
        onLoad={(saved) => {
          setData(saved.data);
          setReviewedReplies(!!saved.reviewedReplies);
          setMapping(saved.mapping || {});
          if (saved.columns) setColumns(saved.columns);
          setStart(saved.data.period.start);
          setEnd(saved.data.period.end);
        }}
      />
      <div className="orders-google-actions zoho-period-toolbar">
        <label>
          De{' '}
          <input
            type="date"
            aria-label="Início do período do Zoho"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={busy}
          />
        </label>
        <label>
          Até{' '}
          <input
            type="date"
            aria-label="Fim do período do Zoho"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            disabled={busy}
          />
        </label>
        <button type="button" onClick={load} disabled={busy}>
          {busy ? `Conferindo ${progress} chamados…` : 'Consultar atividade e tempos'}
        </button>
        {busy && (
          <button type="button" onClick={() => pending.current?.abort()}>
            Cancelar coleta
          </button>
        )}
      </div>
      <small className="zoho-period-hint">
        Até 31 dias por consulta · datas em Brasília · não altera os filtros das OS.
      </small>
      {data && (start !== period.start || end !== period.end) && (
        <p role="status" className="zoho-period-changed">
          Período alterado. Consulte novamente para atualizar os indicadores abaixo.
        </p>
      )}
      {!data && !busy && !error && (
        <div className="zoho-empty-state">
          <strong>Como a equipe está atendendo?</strong>
          <p>
            Escolha um período e consulte os chamados fechados, respondidos, o tempo apontado e a
            comparação entre os agentes.
          </p>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <ZohoPresencePanel />
      {data && summary && (
        <>
          <p role="status" className="zoho-read-status">
            <strong>
              {data.period.start.split('-').reverse().join('/')} a{' '}
              {data.period.end.split('-').reverse().join('/')}
            </strong>
            <span>
              {data.ticketIds.length} chamados conferidos · coleta em {date(data.readAt)} (Brasília)
            </span>
          </p>
          <ZohoActivitySummary summary={summary} onReview={() => setReviewOpen(true)} />
          {Array.isArray(data.closures) ? (
            <ZohoClosures closures={summary.closures} />
          ) : (
            <p className="scope">Consulte novamente para carregar o histórico de fechamentos.</p>
          )}
          {!!(summary.totals.pendingReplyCount || reviewedReplies) && (
            <details
              className="zoho-review-notice"
              ref={reviewAnchor}
              open={reviewOpen}
              onToggle={(event) => setReviewOpen(event.currentTarget.open)}
            >
              <summary>
                {summary.totals.pendingReplyCount ? (
                  <>
                    Respostas aguardando conferência · {summary.totals.pendingReplyCount}{' '}
                    {summary.totals.pendingReplyCount === 1 ? 'interação' : 'interações'}
                  </>
                ) : (
                  'Conferência das respostas · confirmada nesta sessão'
                )}
              </summary>
              <p>
                Os indicadores mostram somente as respostas confirmadas. Confira os motivos acima e
                as origens em “Respostas e candidatas” e “Registros para revisão”. Datas não
                identificadas continuam pendentes.
              </p>
              {!!summary.pendingReplies.length && (
                <label>
                  <input
                    type="checkbox"
                    checked={reviewedReplies}
                    onChange={(e) => setReviewedReplies(e.target.checked)}
                  />{' '}
                  Conferi as interações abaixo no Zoho: a data corresponde ao envio e não há
                  automações/encaminhamentos entre as candidatas.
                </label>
              )}
              {reviewedReplies && (
                <p>Critérios confirmados pelo administrador nesta sessão, para esta coleta.</p>
              )}
            </details>
          )}
          <details className="zoho-detail-group">
            <summary>Vínculos dos agentes com as Ordens de Serviço</summary>
            {!ordersData && (
              <p className="scope">
                Carregue a base de OS pelo Google Sheets ou pela importação de Excel para escolher
                os responsáveis de execução e agendamento nesta seção.
              </p>
            )}
            <div className="table-scroll">
              <SortableTable aria-label="Atividade de Eduardo e Jean">
                <thead>
                  <tr>
                    <th>Agente Zoho</th>
                    <th>Responsável de execução nas OS</th>
                    <th>OS efetivas</th>
                    <th>Responsável de agendamento nas OS</th>
                    <th>Agendamentos efetivos</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      {['execution', 'scheduling'].map((role) => (
                        <React.Fragment key={role}>
                          <td>
                            <select
                              aria-label={`${role === 'execution' ? 'Execução' : 'Agendamento'} OS de ${agent.name}`}
                              value={mapping[`${agent.id}:${role}`] || ''}
                              onChange={(e) =>
                                setMapping((old) => ({
                                  ...old,
                                  [`${agent.id}:${role}`]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Sem vínculo confirmado</option>
                              {(names?.[role] || []).map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {!names?.[role]?.includes(mapping[`${agent.id}:${role}`]) ||
                            !os?.[role] ||
                            os[role].unavailable
                              ? '—'
                              : (os[role].groups.find(
                                  (group) => group.label === mapping[`${agent.id}:${role}`],
                                )?.productive ?? 0)}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
            <p className="scope">
              O vínculo vale somente nesta sessão e usa a grafia exata selecionada. OS usam o mesmo
              período: Execução pela data de atendimento; Agendamento pela data de agendamento de
              serviços já realizados. Outros filtros das OS não se aplicam aqui. Não são somados
              chamados de OS e Zoho.
            </p>
          </details>
          <details className="zoho-evidence-group">
            <summary>
              Conferência dos atendimentos <span>Respostas, tempos e registros de origem</span>
            </summary>
            <details>
              <summary>Respostas e candidatas · conferir origem e critérios</summary>
              <div className="table-scroll">
                <SortableTable aria-label="Origens das respostas Zoho">
                  <thead>
                    <tr>
                      <th>Agente</th>
                      <th>Chamado / interação</th>
                      <th>Data usada (Brasília)</th>
                      <th>Canal</th>
                      <th>Conferência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.candidates.map((reply) => (
                      <tr key={`${reply.ticketId}:${reply.id}`}>
                        <td>{zohoTeam.find((agent) => agent.id === reply.agentId)?.name}</td>
                        <td>
                          {reply.ticketId} / {reply.id}
                        </td>
                        <td>{date(reply.timestamp)}</td>
                        <td>{reply.channel}</td>
                        <td>
                          {reply.review.join('; ') || 'Campos de envio e automação informados'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
            <details>
              <summary>Tempo por chamado e métricas do Zoho</summary>
              <p className="scope">
                Tempo registrado nesta tabela usa apenas os apontamentos de Eduardo e Jean
                executados no período. Primeira resposta e resolução são métricas acumuladas do
                chamado fornecidas pelo Zoho, sem recorte por agente ou período; não representam
                horas trabalhadas.
              </p>
              <div className="table-scroll">
                <SortableTable aria-label="Tempos por chamado Zoho">
                  <thead>
                    <tr>
                      <th>Chamado</th>
                      <th>Tempo apontado no período</th>
                      <th>Primeira resposta (Zoho)</th>
                      <th>Resposta acumulada (Zoho)</th>
                      <th>Resolução (Zoho)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketMetrics.map((metric) => (
                      <tr key={metric.ticketId}>
                        <td>
                          {metric.number} · ID {metric.ticketId}
                        </td>
                        <td>
                          {duration(
                            summary.tickets.find((ticket) => ticket.ticketId === metric.ticketId)
                              ?.seconds ?? null,
                          )}
                        </td>
                        <td>{metric.firstResponse || 'Indisponível'}</td>
                        <td>{metric.totalResponse || 'Indisponível'}</td>
                        <td>{metric.resolution || 'Indisponível'}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
            <details>
              <summary>Apontamentos válidos · {summary.entries.length} registros</summary>
              <div className="table-scroll">
                <SortableTable aria-label="Apontamentos de tempo Zoho">
                  <thead>
                    <tr>
                      <th>Agente</th>
                      <th>Chamado / apontamento</th>
                      <th>Execução (Brasília)</th>
                      <th>Duração</th>
                      <th>Modo</th>
                      <th>Faturável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.entries.map((entry) => (
                      <tr key={`${entry.ticketId}:${entry.id}`}>
                        <td>{zohoTeam.find((agent) => agent.id === entry.agentId)?.name}</td>
                        <td>
                          {entry.ticketId} / {entry.id}
                        </td>
                        <td>{date(entry.executedTime)}</td>
                        <td>{duration(entry.seconds)}</td>
                        <td>{entry.mode}</td>
                        <td>
                          {entry.billable == null ? 'Indisponível' : entry.billable ? 'Sim' : 'Não'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
            <details>
              <summary>Registros excluídos ou pendentes · {data.review.length}</summary>
              <div className="table-scroll">
                <SortableTable aria-label="Conferência de registros Zoho">
                  <thead>
                    <tr>
                      <th>Chamado</th>
                      <th>Registro</th>
                      <th>Fonte</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.review.map((row, index) => (
                      <tr key={index}>
                        <td>{row.ticketId}</td>
                        <td>{row.id || 'Sem ID'}</td>
                        <td>{row.kind === 'entry' ? 'Apontamento' : 'Interação'}</td>
                        <td>{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
          </details>
          <details className="zoho-detail-group">
            <summary>Fonte, cobertura e critérios da coleta</summary>
            <p>
              {data.coverage} Arquivados não são consultados. A pesquisa considera chamados
              modificados desde o início do período, incluindo chamados antigos. Refaça a leitura
              para refletir alterações posteriores.
            </p>
            <p>
              Tempo apontado inclui faturável e não faturável. Apontamentos simultâneos podem se
              sobrepor; a soma não equivale a jornada. Sem apontamento não significa ausência de
              trabalho. O total de chamados da equipe é deduplicado.
            </p>
            <p>
              Responsável atual do chamado não identifica quem enviou respostas. Contas
              compartilhadas e outros agentes ficam fora dos totais. Sessões de presença ainda não
              estão disponíveis.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
