/** Esboço isolado do futuro mapa OS + Zoho. Nunca associa números inventados aos responsáveis reais. */
import React, { useState } from 'react';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import {
  supportActivityPreview,
  supportActivityExample,
} from '../domain/supportActivityPreview.js';

const duration = (value) =>
  value == null ? '—' : `${Math.floor(Math.round(value) / 60)}h ${Math.round(value) % 60}min`;
export function SupportActivityPreview({ visible }) {
  const [agentId, setAgentId] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [start, setStart] = useState('2026-10-12'),
    [end, setEnd] = useState('2026-10-18');
  let result, error;
  try {
    result = supportActivityPreview(
      { ...supportActivityExample, replies: unavailable ? null : supportActivityExample.replies },
      { agentId, start, end },
    );
  } catch (reason) {
    error = reason.message;
  }
  const metrics = result && [
    ['OS · execução efetiva', result.totals.execution],
    ['OS · agendamento efetivo', result.totals.scheduling],
    ['Zoho · chamados respondidos', result.totals.tickets],
    ['Zoho · respostas enviadas', result.totals.replies],
    ['Zoho · permanência por sessões', duration(result.totals.presence)],
    ['Zoho · tempo apontado', duration(result.totals.work)],
    ['Chamados com tempo apontado', result.totals.workTickets],
    ['Média por chamado com apontamento', duration(result.totals.average)],
  ];
  const names = new Map(supportActivityExample.agents.map((agent) => [agent.id, agent.name]));
  return (
    <PrintContext.Provider
      value={{
        filename: 'DEMONSTRAÇÃO · cenário fictício OS + Zoho',
        filters: {
          inicio: start,
          fim: end,
          agenteExemplo: agentId || 'todos',
          comunicacaoIndisponivel: unavailable,
        },
        referenceDate: 'Datas normalizadas em UTC no exemplo; não são dados reais',
      }}
    >
      <Section
        title="Prévia do mapa de atividades · OS e Zoho"
        visible={visible}
        defaultOpen={false}
        help="Demonstração com agentes e dados totalmente fictícios, independente dos filtros e das OS reais. Tickets distintos da equipe são deduplicados; cada autor mantém seu chamado respondido. Somente respostas públicas enviadas pelo agente, sem automação. Permanência soma sessões encerradas recortadas no período, unindo sobreposições por agente; não mede trabalho contínuo. Tempo apontado inclui não faturável, pode ter timers simultâneos e não equivale a jornada. Média divide pelo número de tickets com apontamento. Não soma papéis, tickets e horas em uma pontuação. A integração real aguarda fontes, identificação e configuração."
        summary={
          result && (
            <ReportSummary
              metrics={metrics.slice(2, 6)}
              note="DEMONSTRAÇÃO · dados fictícios. Nenhum número deste painel pertence à equipe real."
            />
          )
        }
      >
        <p className="notice">
          <strong>PRÉVIA COM DADOS FICTÍCIOS.</strong> Consulte a fonte real pelo botão Zoho Desk no
          cabeçalho das OS. Este exemplo não utiliza os nomes nem as OS importadas e não altera os
          indicadores da equipe acima. Use os controles próprios abaixo.
        </p>
        <div className="integration-preview-controls">
          <label>
            Agente da demonstração
            <select
              aria-label="Agente da demonstração"
              value={agentId}
              onChange={(event) => setAgentId(event.target.value)}
            >
              <option value="">Equipe fictícia</option>
              {supportActivityExample.agents.map((agent) => (
                <option value={agent.id} key={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Início da demonstração
            <input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
          </label>
          <label>
            Fim da demonstração
            <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
          </label>
          <label className="integration-preview-toggle">
            <input
              type="checkbox"
              checked={unavailable}
              onChange={(event) => setUnavailable(event.target.checked)}
            />
            Simular comunicação Zoho indisponível
          </label>
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : (
          <>
            <ReportSummary
              metrics={metrics}
              note="Permanência e tempo apontado são medidas distintas. Datas em UTC no cenário fictício. O ticket compartilhado entre dois agentes conta uma vez na equipe."
            />
            {unavailable && (
              <p className="notice" role="status">
                Comunicação indisponível na simulação: chamados e respostas aparecem como
                indisponíveis, sem assumir zero.
              </p>
            )}
            <div className="table-scroll">
              <SortableTable>
                <thead>
                  <tr>
                    {[
                      'Agente fictício',
                      'OS · execução',
                      'OS · agendamento',
                      'Chamados Zoho',
                      'Respostas Zoho',
                      'Permanência',
                      'Tempo apontado',
                    ].map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      <td>{agent.execution ?? '—'}</td>
                      <td>{agent.scheduling ?? '—'}</td>
                      <td>{agent.tickets ?? '—'}</td>
                      <td>{agent.replies ?? '—'}</td>
                      <td data-sort={agent.presence}>{duration(agent.presence)}</td>
                      <td data-sort={agent.work}>{duration(agent.work)}</td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
            <details className="integration-preview">
              <summary>Conferir tickets e apontamentos fictícios</summary>
              <h3>Respostas públicas enviadas</h3>
              {result.replies == null ? (
                <p>Fonte indisponível no exemplo.</p>
              ) : (
                <ul>
                  {result.replies.map((reply) => (
                    <li key={reply.id}>
                      {names.get(reply.agentId)} · {reply.ticketId} · {reply.date}
                    </li>
                  ))}
                </ul>
              )}
              <h3>Apontamentos de tempo</h3>
              <ul>
                {result.entries.map((entry) => (
                  <li key={entry.id}>
                    {names.get(entry.agentId)} · {entry.ticketId} · {entry.date} ·{' '}
                    {duration(entry.minutes)} · {entry.billable ? 'faturável' : 'não faturável'}
                  </li>
                ))}
              </ul>
              <h3>Sessões de permanência · UTC</h3>
              <ul>
                {result.sessions.map((session) => (
                  <li key={session.id}>
                    {names.get(session.agentId)} · {session.start} → {session.end}
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
        <p className="scope">
          Próxima etapa: validar CSV de disponibilidade, vínculo explícito dos agentes, autoria das
          respostas e Time Entries. O importador real e a coleta automática aguardam as fontes da
          empresa.
        </p>
      </Section>
    </PrintContext.Provider>
  );
}
