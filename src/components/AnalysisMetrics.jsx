/** Apresentação de valores já calculados pelo módulo, sem mudar bases ou unidades. */
import React from 'react';

export function AnalysisMetrics({ items, label = 'Indicadores da análise', className = '' }) {
  return (
    <div className={`summary-grid analysis-metrics ${className}`} aria-label={label}>
      {items.map(([name, value, note]) => (
        <article className="summary-card" key={name}>
          <span>{name}</span>
          <strong>{value ?? '—'}</strong>
          {note && <small>{note}</small>}
        </article>
      ))}
    </div>
  );
}
