/** Mensagens de apresentação distinguem fonte ausente, recorte vazio e carregamento. */
import React from 'react';
import { Icon } from './Icon.jsx';

export function ViewState({ title, children, action, busy = false, compact = false }) {
  return (
    <div
      className={`view-state${compact ? ' view-state-compact' : ''}`}
      role={busy ? 'status' : undefined}
      aria-busy={busy || undefined}
    >
      <Icon name={busy ? 'monitoring' : 'info'} size={20} />
      <div>
        <strong>{title}</strong>
        {children && <p>{children}</p>}
        {action && (
          <div className="view-state-actions" data-no-print>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
