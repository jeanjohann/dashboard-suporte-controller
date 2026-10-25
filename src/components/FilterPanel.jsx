/** Mantém o período em uma faixa e reúne os controles secundários em um modal. */
import React, { useEffect, useId, useRef, useState } from 'react';
import { SavedViews } from '../shared/filters/SavedViews.jsx';

export function FilterPanel({
  scope,
  period,
  children,
  chips = [],
  matched,
  total,
  onClear,
  actions,
  help,
  notice,
  source,
  savedView,
}) {
  const id = useId();
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element.showModal();
    return () => {
      element.close();
      trigger.current?.focus();
    };
  }, [open]);

  return (
    <section className="filter-workspace" aria-label={`Filtros · ${scope || 'categoria atual'}`}>
      <div className="filter-workspace-heading">
        <div className="filter-workspace-title">
          <strong>Filtros</strong>
          <span>Afeta: {scope || 'somente esta categoria'}</span>
        </div>
        {period && <div className="filter-workspace-period">{period}</div>}
        <button
          ref={trigger}
          type="button"
          className="filter-options-trigger"
          data-no-print
          aria-haspopup="dialog"
          aria-controls={id}
          onClick={() => setOpen(true)}
        >
          Mais filtros
          {chips.length > 0 && <span>{chips.length}</span>}
        </button>
      </div>
      <dialog
        ref={dialog}
        id={id}
        className="page-settings-dialog page-configuration-dialog filter-options-dialog"
        aria-labelledby={`${id}-title`}
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const bounds = dialog.current.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              setOpen(false);
          }
        }}
      >
        <header>
          <div>
            <span className="page-configuration-eyebrow">{scope || 'Página'}</span>
            <h2 id={`${id}-title`}>Configurações dos filtros</h2>
            <p>Filtros avançados, visões salvas e informações da fonte desta análise.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)}>
            Fechar
          </button>
        </header>
        <div className="page-settings-body filter-options-body">
          {help && (
            <details className="filter-workspace-help">
              <summary>Como os filtros funcionam</summary>
              <p>{help}</p>
            </details>
          )}
          <SavedViews config={savedView} />
          <details className="filter-workspace-editor compact-filters" open key={scope}>
            <summary>Filtros desta página</summary>
            <div className="filter-workspace-fields">{children}</div>
          </details>
          <div className="filter-workspace-summary">
            <div className="filter-workspace-status">
              {matched != null && (
                <strong>
                  {matched.toLocaleString('pt-BR')}
                  {total != null ? ` de ${total.toLocaleString('pt-BR')}` : ''}{' '}
                  {total == null && matched === 1 ? 'registro' : 'registros'}
                </strong>
              )}
              {!chips.length && <span>Sem filtros adicionais ativos</span>}
              {chips.map((chip) => (
                <button
                  type="button"
                  className="filter-chip"
                  key={chip.key}
                  title={`${chip.label}: ${chip.value}`}
                  aria-label={`Remover filtro ${chip.label}: ${chip.value}`}
                  onClick={chip.remove}
                >
                  <span>
                    {chip.label}: {chip.value}
                  </span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <div className="filter-workspace-actions">
              {onClear && (
                <button
                  type="button"
                  aria-label="Limpar filtros desta categoria"
                  disabled={!chips.length}
                  onClick={onClear}
                >
                  Limpar filtros
                </button>
              )}
              {actions}
            </div>
          </div>
          {notice && <div className="filter-workspace-notice">{notice}</div>}
          {source && <div className="filter-workspace-source">{source}</div>}
        </div>
        <footer>
          <span>{chips.length} filtro(s) adicional(is) ativo(s)</span>
          <button type="button" className="page-settings-save" onClick={() => setOpen(false)}>
            Concluído
          </button>
        </footer>
      </dialog>
    </section>
  );
}

/** Mantém o nome acessível da categoria: o número é uma pista visual, sem alterar os atalhos existentes. */
export function FilterCount({ count }) {
  return count > 0 ? (
    <span
      aria-hidden="true"
      className="category-filter-count"
      title={`${count} filtros ativos nesta categoria`}
    >
      {count}
    </span>
  ) : null;
}
