/** Síntese explícita do relatório: valores vêm do mesmo resultado usado no conteúdo completo. */
import React from 'react';
export function ReportSummary({ metrics, note }) {
  return (
    <div className="report-summary">
      <div className="summary-grid">
        {metrics.map(([label, value]) => (
          <article className="summary-card" key={label}>
            <span>{label}</span>
            <strong>{value ?? '—'}</strong>
          </article>
        ))}
      </div>
      <p className="scope">{note}</p>
    </div>
  );
}
