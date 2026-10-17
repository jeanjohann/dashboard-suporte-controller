/** Visão analítica separada da fila; cada card abre seu recorte sem alterar as bases selecionadas. */
import React from 'react';
import { Chart } from '../../../components/Chart.jsx';
import { Section } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { monitoringDuration, monitoringStages } from '../domain/monitoring.js';
import { monitoringAnalytics } from '../domain/monitoringAnalytics.js';

const pct = (value) =>
  value == null ? '—' : `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
export function MonitoringAnalytics({ result, notes, threshold, onQueue, visible }) {
  const analysis = monitoringAnalytics(result, notes);
  const chartTitle = (value) => (result.demonstration ? 'DEMONSTRAÇÃO · ' : '') + value;
  const exportNote = `${result.demonstration ? 'DADOS FICTÍCIOS · ' : ''}Referência ${result.referenceAt}; limite ${threshold} h; todas as situações das bases selecionadas. Coletas utilizáveis; não confirma defeito.`;
  const stages = Object.fromEntries(analysis.stages.map((entry) => [entry.label, entry.value]));
  const cards = [
    [
      'Veículos monitorados',
      result.totals.fleet,
      'Todas as situações das bases selecionadas',
      'all',
    ],
    [
      `${threshold} h ou mais`,
      analysis.alerts,
      `${pct(result.totals.percentage == null ? null : result.totals.percentage / 100)} da frota identificada`,
      'alerts',
    ],
    ['96 h ou mais', result.totals.critical, 'Datas válidas e coletas utilizáveis', 'critical'],
    [
      'Sem posição registrada',
      result.totals.missing,
      'Tempo sem comunicação indeterminado',
      'missing',
    ],
    [
      'Alertas não iniciados',
      stages[monitoringStages[0]],
      'Acima do limite, sem tratamento iniciado',
      'unstarted',
    ],
    [
      'Alertas em análise',
      stages[monitoringStages[1]],
      'Acima do limite, com status Em análise',
      'analysis',
    ],
    [
      'Aguardando contato',
      stages[monitoringStages[2]],
      'Somente veículos acima do limite',
      'contact',
    ],
    [
      'Manutenção agendada',
      stages[monitoringStages[3]],
      'Somente veículos acima do limite',
      'scheduled',
    ],
    ['Bases afetadas', analysis.affectedBases, 'Com ao menos um veículo acima do limite', 'alerts'],
    [
      'Maior tempo sem comunicação',
      monitoringDuration(analysis.maximumHours),
      'Entre veículos acima do limite, com coleta utilizável',
      'alerts',
    ],
    [
      'Sem classificação utilizável',
      analysis.unknown,
      'Sem posição, data para revisão ou coleta desatualizada',
      'unknown',
    ],
    [
      'Encerrados ainda acima do limite',
      stages[monitoringStages[4]],
      'Encerrar o tratamento não confirma recuperação',
      'closed',
    ],
  ];
  return (
    <div hidden={!visible}>
      <Section
        title="Indicadores do monitoramento"
        summary={
          <ReportSummary
            metrics={[
              ['Veículos no retrato', result.totals.fleet],
              [`${threshold} h ou mais`, analysis.alerts],
              ['Bases afetadas', analysis.affectedBases],
              ['Sem classificação utilizável', analysis.unknown],
            ]}
            note={`${result.demonstration ? 'DEMONSTRAÇÃO · dados fictícios. ' : ''}Mesmo retrato e bases da visão completa. Limite ${threshold} h; acompanhamento administrativo não comprova recuperação.`}
          />
        }
        help="Todos os cards usam a frota identificada das bases selecionadas, independentemente dos filtros da fila. Alertas significam tempo desde o último registro acima do limite, com coleta válida e recente, sem confirmar defeito. Status administrativos usam apenas atualizações salvas nesta sessão. Em acompanhamento inclui Em análise, Aguardando contato e Manutenção agendada; seu percentual divide esse número pelo total de veículos acima do limite. Encerrados não contam como recuperados. Clique em um card para abrir a fila correspondente; busca, situação e status anteriores da fila serão limpos, mantendo as bases e o limite."
      >
        <div className="cards monitoring-cards">
          {cards.map(([label, value, note, focus]) => (
            <button
              className="summary-card monitoring-metric-card"
              key={label}
              onClick={() => onQueue(focus)}
              aria-label={`${label}: ${value}. Abrir acompanhamento`}
            >
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </button>
          ))}
        </div>
        <p className="scope">
          Em acompanhamento: {analysis.active} de {analysis.alerts} veículos acima do limite (
          {pct(analysis.coverage)}). Esta cobertura representa tratamento administrativo ativo, não
          recuperação da comunicação.
        </p>
      </Section>
      <div className="monitoring-charts">
        <Section
          title="Tempo sem comunicação"
          summary={
            <ReportSummary
              metrics={result.buckets.map((item) => [item.label, item.value])}
              note={`${result.demonstration ? 'DEMONSTRAÇÃO. ' : ''}Faixas exclusivas, fixas a partir de 48 h, com coleta utilizável. Não representa histórico de interrupções.`}
            />
          }
          help="Faixas exclusivas com datas válidas e coleta utilizável: 48 a menos de 72 h, 72 a menos de 96 h e 96 h ou mais. Abaixo de 48 h fica fora das barras. O limite selecionado não altera estas faixas fixas; não se trata de histórico de interrupções."
        >
          <Chart
            compact
            title={chartTitle('Tempo sem comunicação')}
            exportNote={exportNote}
            items={result.buckets}
          />
        </Section>
        <Section
          title="Tratamento dos veículos acima do limite"
          summary={
            <ReportSummary
              metrics={analysis.stages.map((item) => [item.label, item.value])}
              note={`${result.demonstration ? 'DEMONSTRAÇÃO. ' : ''}Último status administrativo salvo dos veículos acima do limite. Encerrado não significa comunicando.`}
            />
          }
          help="Distribuição do último status administrativo salvo de cada veículo acima do limite escolhido. Cada veículo aparece uma vez. Sem atualização salva equivale a Não iniciado; rascunhos não entram na contagem. Encerrado não significa comunicação recuperada."
        >
          <Chart
            compact
            title={chartTitle('Tratamento dos veículos acima do limite')}
            exportNote={exportNote}
            items={analysis.stages}
          />
        </Section>
      </div>
      <Section
        title="Alertas por base"
        summary={
          <ReportSummary
            metrics={[
              ['Bases no recorte', result.groups.length],
              ['Bases afetadas', analysis.affectedBases],
              ['Veículos acima do limite', analysis.alerts],
            ]}
            note={`${result.demonstration ? 'DEMONSTRAÇÃO. ' : ''}Compare alertas com o tamanho da frota de cada base; não é taxa de defeitos nem disponibilidade histórica.`}
          />
        }
        help="Quantidade de veículos acima do limite por base, com coleta utilizável. Percentuais usam todos os veículos identificados da base, incluindo os sem posição e os de coleta desatualizada. Compare quantidade e tamanho da frota ao interpretar percentuais. Não é taxa de defeitos nem disponibilidade histórica."
      >
        <Chart
          ranking
          title={chartTitle('Alertas por base')}
          exportNote={exportNote}
          items={result.groups.map((group) => ({
            label: group.label || group.clientId,
            value: group.alerts,
          }))}
        />
        <div className="table-scroll">
          <SortableTable>
            <thead>
              <tr>
                <th>Base</th>
                <th>Veículos</th>
                <th>Acima do limite</th>
                <th>% da frota</th>
                <th>Detalhamento</th>
              </tr>
            </thead>
            <tbody>
              {result.groups.map((group) => (
                <tr key={group.clientId}>
                  <td>{group.label || group.clientId}</td>
                  <td>{group.total}</td>
                  <td>{group.alerts}</td>
                  <td data-sort={group.percentage}>
                    {group.percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
                  </td>
                  <td>
                    <button onClick={() => onQueue('alerts', group.clientId)}>
                      Conferir veículos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
      </Section>
      <p className="scope">
        Indicadores do retrato atual. Evolução real, recuperações e reincidências estarão
        disponíveis após integrar e armazenar as coletas.
      </p>
    </div>
  );
}
