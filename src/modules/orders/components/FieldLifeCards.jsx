/** Cards de cobertura e duração: distingue tempo acompanhado de tempo até primeira troca. */
import React from 'react';
import { InfoNote } from '../../../components/InfoNote.jsx';

const number = (value) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const days = (value) => (value == null ? '—' : number(value) + ' dias');
const percentage = (value) =>
  value == null
    ? '—'
    : value.toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
const cycles = (value) => number(value) + (value === 1 ? ' ciclo' : ' ciclos');

/** Ajuda permanece à direita do título, com a mesma apresentação dos outros cards. */
function LifeCard({ title, value, base, children }) {
  return (
    <article>
      <div className="inline-help-heading">
        <span>{title}</span>
        <InfoNote label={'Como interpretar ' + title}>{children}</InfoNote>
      </div>
      <strong>{value}</strong>
      <small>{base}</small>
    </article>
  );
}

/** Categoria e modo definem a nomenclatura; estatísticas recebem o mesmo recorte dos ciclos da tabela. */
export function FieldLifeCards({ stats, category, basis, scope, unmeasured }) {
  const totalTitle =
    scope === 'event'
      ? 'Ciclos no recorte de encerramento'
      : basis === 'replacement'
        ? 'Entradas por troca identificadas'
        : category === 'Rastreador'
          ? 'Implementações identificadas'
          : 'Instalações identificadas';
  const denominator =
    cycles(stats.total) + (stats.total === 1 ? ' identificado' : ' identificados');
  return (
    <div className="life-cards">
      <LifeCard
        title={totalTitle}
        value={number(stats.total)}
        base={`${stats.followup.count} com duração válida · ${stats.review} em revisão`}
      >
        Total dos ciclos identificados na categoria, início, filtros e limite escolhidos. Inclui
        primeira troca, sem troca registrada, cancelamento e revisão. Na instalação inicial,
        rastreadores usam Implementação realizada com motivo de instalação reconhecido; acessórios
        exigem instalação explícita da categoria. No modo por evento, este total representa os
        ciclos cujo encerramento atende aos filtros, não todas as implementações. Registros
        posteriores ao limite e instalações sem os critérios de início não entram. Não é o tamanho
        de todo o parque.
      </LifeCard>
      <LifeCard
        title="Primeiras trocas registradas"
        value={number(stats.complete)}
        base={`${percentage(stats.replacementShare)} de ${denominator}`}
      >
        Quantidade de ciclos com primeira troca confirmada. Percentual = essa quantidade dividida
        por todos os ciclos identificados no recorte, incluindo os casos de revisão no denominador.
        A entrada por troca mede a próxima troca daquele ciclo. É participação registrada, não taxa
        de falha; tempos de acompanhamento e cobertura do histórico podem ser diferentes.
      </LifeCard>
      <LifeCard
        title="Sem primeira troca registrada"
        value={number(stats.observed)}
        base={`${percentage(stats.observedShare)} de ${denominator}`}
      >
        Ciclos sem troca ou outro encerramento identificado até o limite consultado. Participação
        sobre todos os ciclos identificados. Cancelamentos e revisão ficam separados. Ausência de
        troca no arquivo não confirma funcionamento, permanência em campo ou ausência de problemas.
      </LifeCard>
      <LifeCard
        title="Tempo médio acompanhado"
        value={days(stats.followup.mean)}
        base={`${cycles(stats.followup.count)} com duração · ${stats.followup.excluded} ${stats.followup.excluded === 1 ? 'excluído' : 'excluídos'}`}
      >
        Soma dos dias desde o início de cada ciclo até primeira troca, cancelamento ou limite do
        histórico, dividida pela quantidade de ciclos com duração válida. Inclui equipamentos sem
        troca registrada e cancelamentos com duração válida. Revisão e durações incompatíveis ficam
        fora, sem virar zero; zero válido participa. Descreve tempo acompanhado, não estima vida
        útil final, tempo de funcionamento comprovado ou previsão de duração do parque.
      </LifeCard>
      <LifeCard
        title="Tempo médio até primeira troca"
        value={days(stats.mean)}
        base={`${cycles(stats.complete)} com troca confirmada`}
      >
        Soma dos dias dos ciclos com primeira troca confirmada dividida pela quantidade desses
        ciclos. Sem troca, cancelamentos e revisão ficam fora. É a média das trocas documentadas,
        separada do tempo médio acompanhado. Mediana complementar: {days(stats.median)}.
      </LifeCard>
      <LifeCard
        title="Encerrados por cancelamento"
        value={number(stats.canceled)}
        base="Duração válida entra no tempo acompanhado"
      >
        Ciclos encerrados por cancelamento identificado. Não entram na média até troca. Seu tempo
        até cancelamento participa somente da média acompanhada quando a duração é válida;
        cancelamento não comprova defeito ou troca do equipamento.
      </LifeCard>
      <LifeCard
        title="Menor tempo até troca"
        value={days(stats.min)}
        base={`${cycles(stats.complete)} com troca confirmada`}
      >
        Menor duração entre os ciclos com primeira troca confirmada. Usa a mesma amostra da média
        até troca; não inclui o tempo dos ciclos sem troca ou dos cancelamentos.
      </LifeCard>
      <LifeCard
        title="Maior tempo até troca"
        value={days(stats.max)}
        base={`${cycles(stats.complete)} com troca confirmada`}
      >
        Maior duração entre os ciclos com primeira troca confirmada. Não indica a maior idade dos
        equipamentos sem troca registrada e não representa um limite de vida útil.
      </LifeCard>
      <LifeCard
        title="Trocas sem duração resolvida"
        value={number(unmeasured)}
        base="Eventos selecionados pelos filtros do topo"
      >
        Trocas cuja instalação anterior não foi encontrada ou cujo ciclo precisa de revisão. A base
        é a retirada/troca selecionada pelos filtros, independentemente do modo dos ciclos. Não
        entram como duração zero nem são somadas ao denominador dos ciclos identificados.
      </LifeCard>
    </div>
  );
}
