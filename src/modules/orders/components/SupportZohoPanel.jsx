/** Primeira conferência real do Zoho. Nenhuma associação automática às pessoas das OS. */
import React, { useEffect, useRef, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';
import { api } from '../../../shared/security/accessClient.js';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { SupportZohoActivity } from './SupportZohoActivity.jsx';

const date = (value) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo',
      }).format(new Date(value))
    : 'Indisponível';

export function SupportZohoPanel({ active, onClose, ordersData }) {
  const { user, managed } = useAccess();
  const allowed = Boolean(managed && user?.active && user.role === 'admin');
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(null);
  useEffect(() => {
    setBusy(false);
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [active, allowed, user?.email]);
  useEffect(() => {
    setSnapshot(null);
    setError('');
  }, [allowed, user?.email]);
  useEffect(() => {
    if (!active || !allowed) setBusy(false);
  }, [active, allowed]);
  async function load() {
    if (!active || !allowed || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError('');
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const next = await api('/api/zoho/snapshot', { signal: controller.signal });
      if (pending.current === controller && !controller.signal.aborted) setSnapshot(next);
    } catch (error) {
      if (pending.current === controller)
        setError(
          controller.signal.aborted
            ? 'A consulta demorou demais. A leitura anterior foi mantida.'
            : error.message,
        );
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  if (!active || !allowed) return null;
  const agents = new Map((snapshot?.agents || []).map((agent) => [agent.id, agent]));
  return (
    <section
      className="orders-google-panel zoho-connection"
      aria-label="Zoho Desk · conexão de leitura"
    >
      <div className="orders-google-heading">
        <strong>Zoho Desk · conexão e atividade</strong>
        <button type="button" onClick={load} disabled={busy}>
          {busy
            ? 'Consultando Zoho…'
            : snapshot
              ? 'Atualizar leitura do Zoho'
              : 'Consultar Zoho Desk'}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Fechar conexão Zoho Desk">
            Fechar
          </button>
        )}
      </div>
      <p>
        Piloto disponível para o administrador principal. Consulta manual de agentes e até 50
        chamados mais recentes por data de criação.
      </p>
      <small>
        Fonte independente das OS. Os filtros desta página não se aplicam ao Zoho. Responsável atual
        do chamado não identifica quem enviou respostas. A atividade abaixo tem período próprio.
        Sessões de presença ainda não estão disponíveis.
      </small>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <SupportZohoActivity key={user?.email} active={active && allowed} ordersData={ordersData} />
      {snapshot && (
        <>
          <p role="status">
            Conexão confirmada · {snapshot.organization.name} · organização{' '}
            {snapshot.organization.id} · leitura em {date(snapshot.readAt)} (Brasília).
          </p>
          <p className="scope">
            {snapshot.agents.length} agentes nesta leitura
            {snapshot.coverage.agentsComplete
              ? ' · fim da listagem confirmado'
              : ' · limite de 200 atingido; listagem parcial'}
            . {snapshot.tickets.length} chamados nesta leitura
            {snapshot.coverage.ticketsComplete
              ? ' · fim da listagem acessível confirmado'
              : ' · amostra limitada aos 50 mais recentes'}
            . Acesso limitado à cobertura da conta Zoho autorizada. Esta leitura não representa
            indicadores de chamados respondidos nem histórico completo de atividade.
          </p>
          <details>
            <summary>Agentes do Zoho · conferir identificação</summary>
            <div className="table-scroll">
              <SortableTable aria-label="Agentes do Zoho">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>ID Zoho</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      <td>{agent.email || 'Indisponível'}</td>
                      <td>{agent.id}</td>
                      <td>{agent.status || 'Indisponível'}</td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
            {!snapshot.agents.length && <p>Nenhum agente foi retornado pela conta autorizada.</p>}
            <p className="scope">
              O vínculo com os responsáveis das OS será conferido explicitamente; nomes semelhantes
              não são agrupados.
            </p>
          </details>
          <details open>
            <summary>Chamados recentes do Zoho · conferência</summary>
            <div className="table-scroll">
              <SortableTable aria-label="Chamados recentes do Zoho">
                <thead>
                  <tr>
                    <th>Chamado</th>
                    <th>Assunto</th>
                    <th>Situação</th>
                    <th>Responsável atual</th>
                    <th>Criação (Brasília)</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.number || ticket.id}</td>
                      <td>{ticket.subject || 'Indisponível'}</td>
                      <td>{ticket.status || 'Indisponível'}</td>
                      <td>
                        {ticket.assigneeId
                          ? agents.get(ticket.assigneeId)?.name ||
                            `Agente ${ticket.assigneeId} (fora desta leitura)`
                          : 'Não informado'}
                      </td>
                      <td>{date(ticket.createdTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
            {!snapshot.tickets.length && <p>Nenhum chamado foi retornado pela conta autorizada.</p>}
          </details>
        </>
      )}
    </section>
  );
}
