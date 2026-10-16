/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React from 'react';
import { alignHelp } from './HelpLayout.jsx';
/** Apresenta as ações compartilhadas para abrir ou recolher os relatórios. */
export function ReportControls({ onExpand }) {
  if (!onExpand) return null;
  return (
    <div className="report-expansion-controls" data-no-print>
      <button type="button" onClick={() => onExpand({ open: true, mode: 'complete' })}>
        Abrir todos os relatórios
      </button>
      <button type="button" onClick={() => onExpand({ open: true, mode: 'summary' })}>
        Visão resumida dos relatórios
      </button>
      <button type="button" onClick={() => onExpand({ open: false })}>
        Recolher todos os relatórios
      </button>
    </div>
  );
}
/** Agrupa filtros locais; as escolhas de apresentação ficam no modal de personalização do cabeçalho. */
export function PagePersonalization({ children }) {
  return (
    <>
      <details className="panel personalization compact-filters">
        <summary>Filtros da página</summary>
        {alignHelp(children)}
      </details>
    </>
  );
}
