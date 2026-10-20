/** Resumo executivo da mesma coleta da equipe, sem iniciar consultas ou misturar períodos de OS. */
import React, { useMemo } from 'react';
import { useZohoSession } from '../hooks/ZohoSession.jsx';
import { summarizeZohoActivity } from '../../../shared/data/zohoActivity.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { ZohoActivitySummary } from './ZohoActivitySummary.jsx';
const day = (value) => value.split('-').reverse().join('/');
export function SupportZohoOverview({ onOpen }) {
  const { managed, user } = useAccess();
  const { data, reviewedReplies } = useZohoSession();
  const summary = useMemo(
    () => (data ? summarizeZohoActivity(data, { reviewedReplies }) : null),
    [data, reviewedReplies],
  );
  if (!managed || !user?.active || user.role !== 'admin') return null;
  return (
    <section
      className="panel dashboard-widget support-zoho-overview"
      aria-label="Zoho na Visão geral do suporte"
    >
      <div className="zoho-overview-heading">
        <div>
          <h3>Equipe de suporte · Zoho Desk</h3>
          <p className="scope">
            {data
              ? `${day(data.period.start)} a ${day(data.period.end)} · período próprio do Zoho`
              : 'Atendimentos e tempo registrado por agente'}
          </p>
        </div>
        <button type="button" onClick={onOpen}>
          {data ? 'Detalhar na equipe →' : 'Consultar na equipe →'}
        </button>
      </div>
      {summary ? (
        <>
          <ZohoActivitySummary summary={summary} compact onReview={onOpen} />
          <p className="scope zoho-summary-note">
            Última coleta:{' '}
            {new Date(data.readAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Os
            filtros de OS não alteram estes indicadores.
          </p>
        </>
      ) : (
        <p className="scope">
          Consulte um período na página Equipe de suporte para preencher este resumo.
        </p>
      )}
    </section>
  );
}
