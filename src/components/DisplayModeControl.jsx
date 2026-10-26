import React from 'react';

/** O mesmo estilo global pode ser escolhido nas configurações e no seletor lateral. */
export function DisplayModeControl({ value, onChange, deferred = false }) {
  return (
    <fieldset className="page-display-mode">
      <legend>Estilo de leitura do sistema</legend>
      <div role="group" aria-label="Estilo de leitura">
        {[
          ['compact', 'Compacto'],
          ['editorial', 'Editorial'],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      <p>
        Compacto prioriza os dados em menos espaço. Editorial amplia gráficos e contexto.
        {deferred
          ? ' Ao salvar, o estilo será aplicado em todas as páginas neste navegador.'
          : ' A escolha é aplicada em todas as páginas e salva neste navegador.'}
      </p>
    </fieldset>
  );
}
