/** Atalho de período que edita os mesmos filtros da página, sem criar uma segunda base de cálculo. */
import React from 'react';

export function PeriodFilter({ start, end, earliest, onChange }) {
  return (
    <div className="period-filter" aria-label="Período da análise">
      <strong>Período</strong>
      <label>
        De
        <input
          type="date"
          value={start || ''}
          onChange={(event) => onChange('start', event.target.value)}
        />
      </label>
      <label>
        Até
        <input
          type="date"
          value={end || ''}
          onChange={(event) => onChange('end', event.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={!earliest}
        title={
          earliest
            ? `Primeira data válida: ${earliest.split('-').reverse().join('/')}`
            : 'Sem datas válidas'
        }
        onClick={() => onChange('start', earliest)}
      >
        Registro mais antigo
      </button>
      <button
        type="button"
        onClick={() => {
          onChange('start', '');
          onChange('end', '');
        }}
      >
        Todo o período
      </button>
    </div>
  );
}
