/** Um único quadro reúne alcance, período, filtros recolhíveis, seleções ativas e ações dos relatórios. */
import React from 'react';
import { InfoNote } from './InfoNote.jsx';
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
  return (
    <section className="filter-workspace" aria-label={`Filtros · ${scope || 'categoria atual'}`}>
      <div className="filter-workspace-heading">
        <div className="filter-workspace-title">
          <strong>Filtros</strong>
          <span>Afeta: {scope || 'somente esta categoria'}</span>
        </div>
        {period && <div className="filter-workspace-period">{period}</div>}
        {help && <InfoNote label={`Alcance dos filtros · ${scope}`}>{help}</InfoNote>}
      </div>
      <SavedViews config={savedView} />
      <details className="filter-workspace-editor compact-filters" key={scope}>
        <summary>
          Filtros da página · {chips.length ? `${chips.length} ativo(s)` : 'nenhum adicional'}
        </summary>
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
