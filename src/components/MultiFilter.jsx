/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React, { useEffect, useRef, useState } from 'react';

/** Permite selecionar mais de um valor no mesmo campo; a combinação entre campos é feita pelo filtro de dados. */
export function MultiFilter({ label, options, values, disabled, onChange }) {
  const [search, setSearch] = useState('');
  const root = useRef(null);
  // Fecha o menu ao clicar fora ou pressionar Escape, mantendo as escolhas realizadas.
  useEffect(() => {
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && root.current?.contains(event.target)) return;
      root.current?.querySelector('details')?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);
  const visible = options.filter((value) =>
    value.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
  );
  return (
    <div className="multi-filter" ref={root}>
      <span>{label}</span>
      <details>
        <summary aria-label={`Selecionar ${label}`}>
          {disabled ? 'Coluna ausente' : values.length ? `${values.length} selecionados` : 'Todos'}
        </summary>
        {!disabled && (
          <div className="multi-options">
            <input
              aria-label={`Buscar opções de ${label}`}
              placeholder="Buscar opções…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setSearch('');
              }}
            >
              Limpar seleção · Todos
            </button>
            <div className="option-list">
              {visible.map((value) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    checked={values.includes(value)}
                    onChange={(event) =>
                      onChange(
                        event.target.checked
                          ? [...values, value]
                          : values.filter((item) => item !== value),
                      )
                    }
                  />
                  <span>{value || 'Sem dados'}</span>
                </label>
              ))}
              {!visible.length && <p>Nenhuma opção encontrada.</p>}
            </div>
          </div>
        )}
      </details>
      {values.length > 0 && (
        <div className="selected-values">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Remover ${value || 'Sem dados'} de ${label}`}
              onClick={() => onChange(values.filter((item) => item !== value))}
            >
              {value || 'Sem dados'} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
