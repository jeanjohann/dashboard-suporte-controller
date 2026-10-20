/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React from 'react';
import { alignHelp } from './HelpLayout.jsx';
import { FilterPanel } from './FilterPanel.jsx';
import { Icon } from './Icon.jsx';
/** Apresenta as ações compartilhadas para abrir ou recolher os relatórios. */
export function ReportControls({ onExpand }) {
  if (!onExpand) return null;
  return (
    <div
      className="report-expansion-controls report-icon-controls"
      role="group"
      aria-label="Apresentação dos relatórios"
      data-no-print
    >
      <button
        type="button"
        aria-label="Abrir todos os relatórios"
        title="Abrir todos os relatórios"
        onClick={() => onExpand({ open: true, mode: 'complete' })}
      >
        <Icon name="down" size={17} />
      </button>
      <button
        type="button"
        aria-label="Visão resumida dos relatórios"
        title="Visão resumida dos relatórios"
        onClick={() => onExpand({ open: true, mode: 'summary' })}
      >
        <Icon name="operational" size={17} />
      </button>
      <button
        type="button"
        aria-label="Recolher todos os relatórios"
        title="Recolher todos os relatórios"
        onClick={() => onExpand({ open: false })}
      >
        <Icon name="up" size={17} />
      </button>
    </div>
  );
}
/** Agrupa filtros locais; as escolhas de apresentação ficam no modal de personalização do cabeçalho. */
export function PagePersonalization({ children, ...props }) {
  return <FilterPanel {...props}>{alignHelp(children)}</FilterPanel>;
}
