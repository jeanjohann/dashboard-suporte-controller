/** Destaques descritivos: o usuário escolhe os critérios e confere as mesmas linhas de origem. */
import React, { useState } from 'react';
export function AttentionPanel({ scope, findings, coverage, children, onInspect }) {
  const [all, setAll] = useState(false);
  return (
    <details className="attention-panel">
      <summary>
        <strong>O que merece atenção</strong>
        <span>
          {findings.length} {findings.length === 1 ? 'destaque' : 'destaques'} · {scope}
        </span>
      </summary>
      <div className="attention-panel-body">
        <p className="scope">
          Sinais para investigação sobre os dados disponíveis, sem diagnóstico automático de falha
          ou avaliação de produtividade.
        </p>
        <details className="attention-criteria">
          <summary>Critérios e limites</summary>
          <div>{children}</div>
        </details>
        {!findings.length && (
          <p role="status">
            Nenhum destaque pelos critérios atuais. Isso não comprova ausência de ocorrências fora
            da base ou do recorte.
          </p>
        )}
        <div className="attention-findings">
          {(all ? findings : findings.slice(0, 6)).map((finding) => (
            <article key={finding.id}>
              <span>{finding.kind}</span>
              <h4>{finding.title}</h4>
              <strong>{finding.value}</strong>
              <p>{finding.description}</p>
              <button type="button" onClick={() => onInspect(finding)}>
                Conferir origem
              </button>
            </article>
          ))}
        </div>
        {findings.length > 6 && (
          <button type="button" onClick={() => setAll((value) => !value)}>
            {all ? 'Mostrar somente 6' : `Mostrar os ${findings.length} destaques`}
          </button>
        )}
        <p className="scope">{coverage}</p>
      </div>
    </details>
  );
}
