import React from 'react';
export function ZohoColumnPicker({
  columns,
  selected,
  onChange,
  defaults,
  label = 'Colunas da tabela',
}) {
  return (
    <details className="zoho-column-picker" data-no-print>
      <summary>
        {label} · {selected.length + 1}
      </summary>
      <p>Agente ou chamado permanece visível para identificar cada linha.</p>
      <div className="zoho-column-options">
        {columns.map(([key, title]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={(event) =>
                onChange(
                  event.target.checked ? [...selected, key] : selected.filter((id) => id !== key),
                )
              }
            />
            {title}
          </label>
        ))}
      </div>
      <div className="orders-google-actions">
        <button type="button" onClick={() => onChange(columns.map(([key]) => key))}>
          Mostrar todas
        </button>
        <button type="button" onClick={() => onChange(defaults)}>
          Restaurar padrão
        </button>
      </div>
      <small>A escolha vale nesta sessão e não altera os indicadores.</small>
    </details>
  );
}
