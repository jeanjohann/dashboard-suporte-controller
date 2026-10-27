import { clientDisplay } from '../../../shared/data/clientDisplay.js';
/** Apresenta alimentação, posições e modelos do retrato, com cobertura e caminhos até os veículos de origem. */
import React, { useMemo } from 'react';
import { Section } from '../../../components/Section.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { MonitoringSummaryTable } from './MonitoringSummaryTable.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { monitoringTelemetry } from '../domain/monitoringTelemetry.js';

const number = (value, digits = 0) =>
  value == null
    ? 'Não informado'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: digits });

export function MonitoringTelemetry({ result, onQueue }) {
  const data = useMemo(() => monitoringTelemetry(result), [result]);
  const note = `${result.demonstration ? 'DADOS FICTÍCIOS · ' : ''}Referência ${result.referenceAt}; bases e modelos selecionados. Último estado recebido, sem diagnóstico de defeito. Posições são registros em 24 h, não MB.`;
  const cards = [
    [
      'Falha de alimentação externa',
      data.externalFailure,
      `${data.powerReadings} veículos com informação utilizável`,
      'external-power',
    ],
    [
      'Bateria interna baixa',
      data.batteryLow,
      'Estado baixa informado pelo equipamento',
      'battery-low',
    ],
    [
      'Falha da bateria interna',
      data.batteryFailure,
      'Estado falha informado pelo equipamento',
      'battery-failure',
    ],
    [
      'Bateria descarregando',
      data.batteryDischarging,
      'Último estado recebido; não confirma defeito',
      'battery-discharging',
    ],
    [
      'Sem informação de alimentação',
      data.powerUnknown,
      'Ausência do sinal ou coleta indisponível',
      'power-unknown',
    ],
  ];
  return (
    <div className="monitoring-analytics-telemetry">
      <Section
        title="Alimentação e bateria"
        help="Último estado informado pelo equipamento, que pode ser antigo mesmo com coleta recente. Contagens usam somente coletas utilizáveis; estado ausente/desconhecido permanece separado. Bateria baixa usa o código 6 da API, falha usa 2 e descarregando usa 3; não são limites de porcentagem ou tensão criados pelo painel. Nos MXT-130/160 em falha externa a tensão pode representar a bateria interna. Consulte a última comunicação antes de decidir uma ação."
        summary={
          <ReportSummary
            metrics={cards.map(([label, value]) => [label, number(value)])}
            note={note}
          />
        }
      >
        <div className="monitoring-analytics-battery-layout">
          <div className="cards monitoring-cards">
            {cards.map(([label, value, description, focus]) => (
              <button
                key={focus}
                className="summary-card monitoring-metric-card"
                onClick={() => onQueue(focus)}
                aria-label={`${label}: ${number(value)}. Abrir acompanhamento`}
              >
                <span>{label}</span>
                <strong>{number(value)}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>
          <Chart
            compact
            title="Estados da bateria interna"
            items={data.batteryStates}
            exportNote={note}
          />
        </div>
        <p className="scope">
          Alimentação: {data.powerReadings} de {data.fleet} veículos com sinal utilizável. Bateria:{' '}
          {data.batteryReadings} de {data.fleet} com estado reconhecido. Sem leitura não significa
          condição normal. Os sinais são do último registro recebido, que pode ser antigo; confira
          sua data antes de agir.
        </p>
      </Section>
      <Section
        title="Posições por base · últimas 24 horas"
        help="Soma apenas contagens recebidas em coletas utilizáveis. A média divide o total pelos veículos com contagem informada, incluindo zeros; ausência fica fora da média. Totais de cobertura parcial não representam toda a frota. A janela móvel de 24 h não é um dia civil nem histórico. Volume de posições não representa consumo M2M, disponibilidade ou qualidade do serviço."
        summary={
          <ReportSummary
            metrics={[
              ['Posições informadas', number(data.positionsTotal)],
              ['Veículos com leitura', data.positionsReadings],
              ['Com posições', number(data.positionsActive)],
              ['Com zero posições', number(data.positionsZero)],
            ]}
            note={note}
          />
        }
      >
        <div className="cards monitoring-cards">
          <article className="summary-card">
            <span>Posições informadas · 24 h</span>
            <strong>{number(data.positionsTotal)}</strong>
            <small>
              {data.positionsReadings} de {data.fleet} veículos com contagem;{' '}
              {data.positionsUnknown} sem leitura utilizável
            </small>
          </article>
          <article className="summary-card">
            <span>Média por veículo com leitura</span>
            <strong>{number(data.positionsAverage, 1)}</strong>
            <small>Inclui contagens zero; não inclui ausências</small>
          </article>
          <button
            className="summary-card monitoring-metric-card"
            onClick={() => onQueue('positions-active')}
          >
            <span>Veículos com posições</span>
            <strong>{number(data.positionsActive)}</strong>
            <small>Uma ou mais posições nas últimas 24 h</small>
          </button>
          <button
            className="summary-card monitoring-metric-card"
            onClick={() => onQueue('positions-zero')}
          >
            <span>Veículos com zero posições</span>
            <strong>{number(data.positionsZero)}</strong>
            <small>Zero explícito; não inclui contagem ausente</small>
          </button>
        </div>
        <p className="scope">
          Janela móvel calculada pela API na última consulta. Recalcular o relógio da tela não
          atualiza estas contagens; confira a data do retrato recebido.
        </p>
        <div className="monitoring-analytics-data-pair">
          <div className="monitoring-analytics-chart-panel">
            <Chart
              ranking
              title="Posições informadas por base · 24 h"
              items={data.bases
                .filter((row) => row.positionsTotal != null)
                .map((row) => ({
                  label: row.label,
                  displayLabel: clientDisplay(row.label),
                  value: row.positionsTotal,
                }))}
              exportNote={note}
            />
          </div>
          <div className="monitoring-analytics-table-panel">
            <MonitoringSummaryTable
              label="bases"
              rows={data.bases}
              columns={[
                {
                  id: 'label',
                  label: 'Base',
                  required: true,
                  value: (row) => row.label,
                  render: (row) => clientDisplay(row.label),
                },
                {
                  id: 'fleet',
                  label: 'Veículos',
                  essential: true,
                  numeric: true,
                  value: (row) => row.fleet,
                  render: (row) => <>{number(row.fleet, 0)}</>,
                },
                {
                  id: 'positionsReadings',
                  label: 'Com leitura',
                  essential: true,
                  numeric: true,
                  value: (row) => row.positionsReadings,
                  render: (row) => <>{number(row.positionsReadings, 0)}</>,
                },
                {
                  id: 'positionsTotal',
                  label: 'Posições · 24 h',
                  essential: true,
                  numeric: true,
                  value: (row) => row.positionsTotal,
                  render: (row) => <>{number(row.positionsTotal, 0)}</>,
                },
                {
                  id: 'positionsAverage',
                  label: 'Média com leitura',
                  essential: true,
                  numeric: true,
                  value: (row) => row.positionsAverage,
                  render: (row) => <>{number(row.positionsAverage, 1)}</>,
                },
                {
                  id: 'positionsActive',
                  label: 'Com posições',
                  numeric: true,
                  value: (row) => row.positionsActive,
                  render: (row) => <>{number(row.positionsActive, 0)}</>,
                },
                {
                  id: 'positionsZero',
                  label: 'Zero posições',
                  numeric: true,
                  value: (row) => row.positionsZero,
                  render: (row) => <>{number(row.positionsZero, 0)}</>,
                },
                {
                  id: 'action',
                  label: 'Conferência',
                  required: true,
                  value: (row) => row.label,
                  render: (row) => (
                    <button type="button" onClick={() => onQueue('all', row.id)}>
                      Conferir base
                    </button>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Section>
      <Section
        title="Equipamentos por modelo"
        help="Inventário dos modelos informados, uma ocorrência por veículo/base identificado. Inclui veículos com coleta antiga para preservar o inventário; sinais técnicos e posições exigem coleta utilizável. Sem modelo fica em grupo próprio. Comparações são descritivas: quantidade e percentual de comunicação não comprovam qualidade, defeito ou causa ligada ao modelo. O filtro de modelo também afeta os demais indicadores desta categoria."
        summary={
          <ReportSummary metrics={data.models.map((row) => [row.label, row.fleet])} note={note} />
        }
      >
        <div className="monitoring-analytics-data-pair">
          <div className="monitoring-analytics-chart-panel">
            <Chart
              title="Veículos por modelo de equipamento"
              ranking
              items={data.models.map((row) => ({ label: row.label, value: row.fleet }))}
              exportNote={note}
            />
          </div>
          <div className="monitoring-analytics-table-panel">
            <MonitoringSummaryTable
              label="modelos"
              rows={data.models}
              columns={[
                { id: 'label', label: 'Modelo', required: true, value: (row) => row.label },
                {
                  id: 'fleet',
                  label: 'Veículos',
                  essential: true,
                  numeric: true,
                  value: (row) => row.fleet,
                  render: (row) => <>{number(row.fleet, 0)}</>,
                },
                {
                  id: 'delayed',
                  label: 'Acima do limite',
                  essential: true,
                  numeric: true,
                  value: (row) => row.delayed,
                  render: (row) => <>{number(row.delayed, 0)}</>,
                },
                {
                  id: 'percentage',
                  label: '% do modelo',
                  essential: true,
                  numeric: true,
                  value: (row) => (row.fleet ? (row.delayed / row.fleet) * 100 : null),
                  render: (row) => (
                    <>
                      {number(row.fleet ? (row.delayed / row.fleet) * 100 : null, 1) +
                        (row.fleet ? '%' : '')}
                    </>
                  ),
                },
                {
                  id: 'externalFailure',
                  label: 'Falha externa',
                  numeric: true,
                  value: (row) => row.externalFailure,
                  render: (row) => (
                    <>
                      {number(row.externalFailure, 0)}
                      <small className="monitoring-cell-note">{row.powerReadings} com sinal</small>
                    </>
                  ),
                },
                {
                  id: 'batteryLow',
                  label: 'Bateria baixa',
                  numeric: true,
                  value: (row) => row.batteryLow,
                  render: (row) => (
                    <>
                      {number(row.batteryLow, 0)}
                      <small className="monitoring-cell-note">
                        {row.batteryReadings} com estado
                      </small>
                    </>
                  ),
                },
                {
                  id: 'batteryFailure',
                  label: 'Falha da bateria',
                  numeric: true,
                  value: (row) => row.batteryFailure,
                  render: (row) => <>{number(row.batteryFailure, 0)}</>,
                },
                {
                  id: 'positionsTotal',
                  label: 'Posições · 24 h',
                  numeric: true,
                  value: (row) => row.positionsTotal,
                  render: (row) => (
                    <>
                      {number(row.positionsTotal, 0)}
                      <small className="monitoring-cell-note">
                        {row.positionsReadings} com leitura
                      </small>
                    </>
                  ),
                },
                {
                  id: 'action',
                  label: 'Conferência',
                  required: true,
                  value: (row) => row.label,
                  render: (row) => (
                    <button type="button" onClick={() => onQueue('all', null, row.id)}>
                      Conferir modelo
                    </button>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
