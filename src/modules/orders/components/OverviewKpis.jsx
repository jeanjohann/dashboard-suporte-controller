/** Cards do resumo: cor organiza a informação, sem julgar a direção da variação como boa ou ruim. */
import React from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { metricHelp } from '../config/metricHelp.js';
import { change } from '../domain/dashboard.js';

const number = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const currency = (value) =>
  value == null
    ? '—'
    : (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const cards = [
  ['completed', 'Visitas e atendimentos', 'operation', 'orders'],
  ['productive', 'Intervenções executadas', 'service', 'check'],
  ['unproductive', 'Visitas improdutivas', 'attention', 'warning'],
  ['maintenance', 'Manutenções realizadas', 'service', 'maintenance'],
  ['implementations', 'Implementações realizadas', 'service', 'implementation'],
  ['calls', 'Chamados atendidos', 'coverage', 'orders'],
  ['clients', 'Clientes com atendimento', 'coverage', 'building'],
  ['vehicles', 'Veículos identificados', 'coverage', 'vehicle'],
  ['cost', 'Custo total lançado', 'finance', 'wallet'],
  ['average', 'Custo médio válido', 'finance', 'average'],
];

function baseLabel(key, current) {
  if (key === 'clients')
    return current.clients == null
      ? 'Identificação de clientes indisponível'
      : current.clientsMissing
        ? `${number(current.clientsMissing)} ${current.clientsMissing === 1 ? 'linha sem cliente utilizável' : 'linhas sem cliente utilizável'}`
        : 'Razões sociais distintas';
  if (key === 'vehicles')
    return current.vehicles == null
      ? 'Identificação de veículos indisponível'
      : current.vehiclesMissing
        ? `${number(current.vehiclesMissing)} ${current.vehiclesMissing === 1 ? 'linha sem cliente + placa utilizáveis' : 'linhas sem cliente + placa utilizáveis'}`
        : 'Pares cliente + placa distintos';
  if (key === 'cost' || key === 'average')
    return `${number(current.costCount)} custos válidos · zeros mantidos`;
  return {
    completed: 'Linhas Concluída ou Pago',
    productive: 'Sem visitas improdutivas',
    unproductive: 'Motivo: Visita Improdutiva',
    maintenance: 'Assistências técnicas efetivas',
    implementations:
      current.implementations == null
        ? 'Colunas necessárias indisponíveis'
        : 'Serviços de implementação efetivos',
    calls: 'Números de chamado distintos',
  }[key];
}

export function OverviewKpis({ current, past }) {
  return (
    <div className="executive-cards overview-kpis" aria-label="Indicadores do resumo de OS">
      {cards.map(([key, label, tone, icon]) => {
        const format = ['cost', 'average'].includes(key) ? currency : number;
        const delta = past ? change(current[key], past[key]) : null;
        return (
          <article
            key={key}
            className={`executive-card-help overview-kpi kpi-${tone}`}
            aria-label={label}
            data-metric={key}
          >
            <span className="overview-kpi-icon" aria-hidden="true">
              <Icon name={icon} size={19} />
            </span>
            <InfoNote label={`Regras de ${label}`}>
              {metricHelp[key]} Os filtros são somente da categoria Visão geral das OS. A comparação
              usa intervalo imediatamente anterior de igual duração e mesmos filtros. Variação
              percentual = diferença dividida pelo valor absoluto da base anterior; base anterior
              zero não permite percentual. As cores organizam grupos e a variação não é uma
              avaliação automática de desempenho.
            </InfoNote>
            <span className="overview-kpi-label">{label}</span>
            <strong>{format(current[key])}</strong>
            <small className="overview-kpi-base">{baseLabel(key, current)}</small>
            {delta && (
              <small className="overview-kpi-change">
                <span aria-hidden="true">
                  {delta.difference > 0 ? '↑' : delta.difference < 0 ? '↓' : '→'}
                </span>{' '}
                {delta.difference > 0 ? '+' : ''}
                {format(delta.difference)}
                {delta.percent == null
                  ? ' · base anterior zero'
                  : ` (${delta.percent > 0 ? '+' : ''}${number(delta.percent)}%)`}
                <span>vs. período anterior</span>
              </small>
            )}
          </article>
        );
      })}
    </div>
  );
}
