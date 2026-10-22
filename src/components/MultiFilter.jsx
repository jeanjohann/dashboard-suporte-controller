import { clientDisplay } from '../shared/data/clientDisplay.js';
/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { createPortal } from 'react-dom';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Permite selecionar mais de um valor no mesmo campo; a combinação entre campos é feita pelo filtro de dados. */
export function MultiFilter({ label, options, values, disabled, onChange }) {
  const clientNames = /cliente|base|razão social/i.test(label);
  const [search, setSearch] = useState('');
  const root = useRef(null);
  const menu = useRef(null);
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({});
  useLayoutEffect(() => {
    if (!open) return;
    const rect = trigger.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const up = below < 220 && above > below;
    setPosition({
      position: 'fixed',
      width: Math.min(Math.max(rect.width, 240), window.innerWidth - 24),
      left: Math.max(12, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 240) - 12)),
      ...(up ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      maxHeight: Math.max(80, up ? above : below),
      zIndex: 9000,
    });
  }, [open]);
  // Fecha o menu ao clicar fora ou pressionar Escape, mantendo as escolhas realizadas.
  useEffect(() => {
    const close = (event) => {
      if (!root.current?.querySelector('details')?.open) return;
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'scroll' && menu.current?.contains(event.target)) return;
      if (
        event.type === 'pointerdown' &&
        (root.current?.contains(event.target) || menu.current?.contains(event.target))
      )
        return;
      root.current?.querySelector('details')?.removeAttribute('open');
      setOpen(false);
      if (event.type === 'keydown') trigger.current?.focus();
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, []);
  const visible = options.filter((value) =>
    value.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
  );
  return (
    <div className="multi-filter" ref={root}>
      <span>{label}</span>
      <details onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary ref={trigger} aria-label={`Selecionar ${label}`}>
          {disabled
            ? 'Coluna ausente'
            : values.length
              ? `${values.length} ${values.length === 1 ? 'selecionado' : 'selecionados'}`
              : 'Todos'}
        </summary>
        {open &&
          !disabled &&
          createPortal(
            <div className="multi-options floating-filter-menu" ref={menu} style={position}>
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
                    <span>
                      {clientNames ? clientDisplay(value || 'Sem dados') : value || 'Sem dados'}
                    </span>
                  </label>
                ))}
                {!visible.length && <p>Nenhuma opção encontrada.</p>}
              </div>
            </div>,
            document.body,
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
