/** Critérios e exclusões acessíveis sem competir com a leitura dos indicadores. */
import React from 'react';

const day = (value) => value.split('-').reverse().join('/');
export function SupportContext({ results }) {
  const missing = results.some(
    (result) => result.missing.length || result.missingDates || result.undated,
  );
  return (
    <details className="support-context">
      <summary>
        Base de cálculo e comparação
        {missing && <span className="support-context-flag">Há registros para conferir</span>}
      </summary>
      <p className="scope">
        Volume atribuído ao suporte, não ao técnico prestador. Cada linha é um atendimento.
        Agendamento considera serviços já realizados, não a agenda futura. Os atalhos alteram
        somente a categoria Equipe de suporte. Datas e responsáveis também podem ser ajustados nos
        filtros da página. Em Ambos, cada papel mantém sua data e base; não somar como atendimentos
        únicos.
      </p>
      <div className="support-context-grid">
        {results.map((result) => (
          <div key={result.role.column}>
            <h4>
              {result.role.label} · {result.role.date}
            </h4>
            <p className="scope">
              {result.rows.length} visitas e atendimentos · {result.missing.length} sem responsável
              válido fora do ranking · {result.missingDates} realizados sem data válida excluídos
              pelo período · {result.undated} sem data fora da evolução.
            </p>
            {result.range ? (
              <p className="scope">
                Comparação: {day(result.range.start)} até {day(result.range.end)} ·{' '}
                {result.past.totals.productive} efetivos → {result.totals.productive} no período
                selecionado (
                {result.totals.productive - result.past.totals.productive >= 0 ? '+' : ''}
                {result.totals.productive - result.past.totals.productive}).{' '}
                {result.past.missingDates} realizados sem data excluídos também da comparação.
              </p>
            ) : (
              <p className="scope">
                Selecione início e fim para comparar com o período anterior equivalente.
              </p>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}
