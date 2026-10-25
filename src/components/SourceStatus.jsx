import React from 'react';

const stateLabels = {
  ready: 'Disponível',
  pending: 'Pendente',
  partial: 'Cobertura parcial',
  loading: 'Carregando',
  error: 'Indisponível',
};

/** Estado textual e visual comum para fontes independentes entre módulos. */
export function SourceStatus({ name, state = 'pending', label, detail, children }) {
  const safeState = Object.hasOwn(stateLabels, state) ? state : 'pending';
  return (
    <div className={`source-status-item is-${safeState}`} role="group" aria-label={`Fonte ${name}`}>
      <span className="source-status-dot" aria-hidden="true" />
      <div className="source-status-copy">
        <strong>{name}</strong>
        <span className="source-status-label">{label || stateLabels[safeState]}</span>
        {detail && <small>{detail}</small>}
        {children}
      </div>
    </div>
  );
}
