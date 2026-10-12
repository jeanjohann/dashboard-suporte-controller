/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { InfoNote } from './InfoNote.jsx';
import React from 'react';
import { SidebarContent } from '../app/SidePanel.jsx';
import { alignHelp } from './HelpLayout.jsx';
/** Apresenta as ações compartilhadas para abrir ou recolher os relatórios. */
export function ReportControls({ onExpand }) {
  if (!onExpand) return null;
  return (
    <div className="report-expansion-controls" data-no-print>
      <button type="button" onClick={() => onExpand({ open: true })}>
        Abrir todos os relatórios
      </button>
      <button type="button" onClick={() => onExpand({ open: false })}>
        Recolher todos os relatórios
      </button>
    </div>
  );
}
/** Controla quais seções aparecem, preservando a possibilidade de reexibi-las. */
export function PagePersonalization({ labels, hidden, setHidden, children }) {
  return (
    <>
      <details className="panel personalization compact-filters">
        <summary>Filtros da página</summary>
        {alignHelp(children)}
      </details>
      <SidebarContent>
        <section className="sidebar-reports" aria-label="Relatórios exibidos">
          <h3>Relatórios exibidos</h3>
          <div className="preference-grid">
            {labels.map((label) => (
              <label key={label}>
                <input
                  type="checkbox"
                  checked={!hidden.includes(label)}
                  onChange={(event) =>
                    setHidden((previous) =>
                      event.target.checked
                        ? previous.filter((item) => item !== label)
                        : [...previous, label],
                    )
                  }
                />
                {label}
              </label>
            ))}
          </div>
          {!labels.length && <p>Esta categoria apresenta os cards de visão geral.</p>}
          <button
            onClick={() =>
              setHidden((previous) => previous.filter((title) => !labels.includes(title)))
            }
          >
            Mostrar relatórios desta categoria
          </button>
          <InfoNote>Ocultar mantém os filtros e cálculos.</InfoNote>
        </section>
      </SidebarContent>
    </>
  );
}
