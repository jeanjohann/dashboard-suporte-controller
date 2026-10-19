/** Identidade dos indicadores do suporte; a interface recebe valores prontos do domínio. */
import React from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';

export const supportNumber = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
export const supportPercent = (value) =>
  value == null ? '—' : (value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

const metrics = [
  {
    key: 'productive',
    label: 'Atendimentos efetivos',
    icon: 'check',
    tone: 'service',
    help: 'Linhas Concluída/Pago sem Motivo Visita Improdutiva. Cada linha é um serviço registrado, não uma visita física única. Mede volume atribuído, não qualidade ou produtividade por hora.',
  },
  {
    key: 'unproductive',
    label: 'Visitas improdutivas',
    icon: 'warning',
    tone: 'attention',
    help: 'Linhas Concluída/Pago reconhecidas como Visita Improdutiva. Houve visita sem a intervenção prevista. A causa pode estar no veículo indisponível ou na liberação do cliente; não atribui falha ao responsável do suporte.',
  },
  {
    key: 'calls',
    label: 'Chamados distintos',
    icon: 'orders',
    tone: 'coverage',
    help: 'Números de OS distintos com pelo menos uma linha Concluída/Pago, incluindo improdutivas. Um chamado pode ter vários serviços e responsáveis. Não somar contagens distintas entre pessoas ou papéis.',
  },
  {
    key: 'clients',
    label: 'Clientes identificados',
    icon: 'building',
    tone: 'finance',
    help: 'Clientes distintos nas linhas Concluída/Pago, incluindo improdutivas, conforme o agrupamento desta categoria. Consolidação usa a Base clientes; sem definição segura mantém CNPJ/filial. Não soma clientes entre pessoas ou papéis.',
  },
  {
    key: 'vehicles',
    label: 'Veículos identificados',
    icon: 'vehicle',
    tone: 'coverage',
    help: 'Pares utilizáveis de cliente/filial + placa nas linhas realizadas, incluindo improdutivas. CNPJ completo da coluna C diferencia filiais; sem CNPJ, usa nome original. Mesmo par conta uma vez; placas provisórias ou com erro ficam fora. Não representa frota ativa.',
  },
  {
    key: 'unproductiveRate',
    label: 'Visitas improdutivas / total',
    icon: 'warning',
    tone: 'attention',
    unit: 'rate',
    help: 'Visitas improdutivas divididas por todas as linhas Concluída/Pago do mesmo papel e recorte. Sem visitas, não há percentual. A comparação usa pontos percentuais. Não demonstra que o responsável tenha causado a improdutividade.',
  },
  {
    key: 'servicesPerCall',
    label: 'Registros por chamado',
    icon: 'average',
    tone: 'finance',
    help: 'Todas as linhas Concluída/Pago, incluindo improdutivas, divididas pelos números de chamado distintos no mesmo papel e recorte. Sem chamados identificados, fica indisponível. Mostra chamados com vários registros; não mede horas, esforço ou dificuldade.',
  },
];

/** Variação neutra: base zero não gera crescimento percentual; taxas usam pontos percentuais. */
export function SupportDelta({ current, previous, unit }) {
  if (current == null || previous == null) return null;
  const difference = current - previous;
  const prefix = difference > 0 ? '+' : '';
  return (
    <small className="support-delta">
      {unit === 'rate'
        ? `${prefix}${supportNumber(Math.round(difference * 1000) / 10)} p.p.`
        : `${prefix}${supportNumber(difference)}${previous === 0 ? ' · base anterior zero' : ` (${difference > 0 ? '+' : ''}${supportPercent(difference / Math.abs(previous))})`}`}
      <span>vs. período anterior</span>
    </small>
  );
}

export function SupportMetricCards({ results, extraOnly = false, collapsible = false }) {
  const render = (metric) => (
    <article
      key={metric.key}
      className={`support-metric support-tone-${metric.tone}`}
      data-support-metric={metric.key}
    >
      <div className="support-metric-heading">
        <Icon name={metric.icon} size={17} />
        <span>{metric.label}</span>
        <InfoNote label={`Regras de ${metric.label} no suporte`}>
          {metric.help} Cada papel mantém sua data: Execução usa Data de atendimento; Agendamento
          usa Agendamento, somente dos serviços já realizados. A participação não mistura papéis.
          Comparação usa o intervalo anterior de igual duração e os mesmos filtros desta categoria;
          o histórico pode ser incompleto.
        </InfoNote>
      </div>
      <div className="support-metric-values">
        {results.map((result) => (
          <div key={result.role.column}>
            {!extraOnly && (
              <small className="support-role-label">
                <span className="support-role-full">{result.role.label}</span>
                <span className="support-role-compact" aria-hidden="true">
                  {result.role.label === 'Agendamento' ? 'Agend.' : 'Execução'}
                </span>
              </small>
            )}
            <strong>
              {metric.unit === 'rate'
                ? supportPercent(result.totals[metric.key])
                : supportNumber(result.totals[metric.key])}
            </strong>
            {result.past && (
              <SupportDelta
                current={result.totals[metric.key]}
                previous={result.past.totals[metric.key]}
                unit={metric.unit}
              />
            )}
          </div>
        ))}
      </div>
    </article>
  );
  return (
    <div
      className="support-metrics"
      aria-label={
        extraOnly ? 'Indicadores complementares da pessoa' : 'Indicadores da equipe de suporte'
      }
    >
      {!extraOnly && <div className="support-metric-grid">{metrics.slice(0, 4).map(render)}</div>}
      {collapsible ? (
        <details className="support-secondary-metrics">
          <summary>
            Mais indicadores{' '}
            <span>Veículos, proporção de improdutivas e registros por chamado</span>
          </summary>
          <div className="support-extra-metrics">{metrics.slice(4).map(render)}</div>
        </details>
      ) : (
        <div className="support-extra-metrics">{metrics.slice(4).map(render)}</div>
      )}
    </div>
  );
}
