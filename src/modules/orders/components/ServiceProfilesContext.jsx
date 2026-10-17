/** Preserva os resumos especializados antes exibidos na Visão geral, junto ao perfil completo. */
import React, { useEffect, useState } from 'react';
import { applyFilters } from '../../../shared/data/filters.js';
import { previousPeriod } from '../domain/dashboard.js';
import { MaintenanceSummary, ServiceProfileSummary } from './CardInsights.jsx';
import { RecordDetails } from './RecordDetails.jsx';

export function ServiceProfilesContext({ original, data, filters }) {
  const [client, setClient] = useState('');
  const [detail, setDetail] = useState(null);
  const range = previousPeriod(filters);
  const previous = range
    ? applyFilters(original, { ...filters, start: range.start, end: range.end })
    : null;
  useEffect(() => {
    setDetail(null);
  }, [data]);
  return (
    <>
      <details className="panel">
        <summary>Concentração das manutenções por cliente</summary>
        <MaintenanceSummary
          data={data}
          selectedClient={client}
          onSelect={setClient}
          onDetail={setDetail}
        />
      </details>
      <details className="panel">
        <summary>Quantidade, custos e comparação por tipo de serviço</summary>
        <ServiceProfileSummary data={data} previous={previous} onDetail={setDetail} />
      </details>
      {detail && (
        <div className="panel">
          <button type="button" onClick={() => setDetail(null)}>
            Fechar conferência do perfil
          </button>
          <RecordDetails data={detail.data} rows={detail.rows} title={detail.label} />
        </div>
      )}
    </>
  );
}
