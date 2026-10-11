/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { InfoNote } from './InfoNote.jsx';
import React from 'react';
import { SidebarContent } from '../app/SidePanel.jsx';
/** Apresenta as ações compartilhadas para abrir ou recolher os relatórios. */
export function ReportControls({ onExpand }) {
  return null;
}
/** Controla quais seções aparecem, preservando a possibilidade de reexibi-las. */
export function PagePersonalization({ labels, hidden, setHidden, children }) {
  return (
    <>
      <details className="panel personalization">
        <summary>Filtros da página</summary>
        {children}
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
