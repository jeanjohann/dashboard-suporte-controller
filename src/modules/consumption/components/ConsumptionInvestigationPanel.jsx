/** Relatórios de consumo por assunto. Recebem o recorte e preservam o domínio e contexto de impressão da página. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { formatMB as mb } from '../utils/consumptionFormatting.js';
import { consumptionLimit } from '../domain/consumptionSelection.js';
export function ConsumptionInvestigationPanel({
  shown,
  hasStatements,
  attention,
  archive,
  rankMeasure,
  setRankMeasure,
  chartNote,
  rankItems,
  selected,
  viewRow,
  filter,
  exportRecords,
  filters,
}) {
  return (
    <>
      <Section
        title="Linhas para investigar"
        visible={shown('Linhas para investigar') && hasStatements}
      >
        <p className="scope">
          {attention.length} linhas acima de {archive.settings.factor}× a média geral da própria
          operadora e apuração. O destaque indica consumo para investigar; não confirma defeito ou
          bloqueio. Consulte e selecione as linhas na visualização Grade e acompanhamento.
        </p>
        <label className="chart-order-control">
          Ordenar gráfico por{' '}
          <select
            aria-label="Ordenar gráfico por"
            value={rankMeasure}
            onChange={(event) => setRankMeasure(event.target.value)}
          >
            <option value="daily">Consumo por dia</option>
            <option value="volume">Consumo total do período</option>
          </select>
        </label>
        <Chart
          compact
          exportNote={chartNote}
          ranking
          items={rankItems}
          title="Maiores consumos"
          format={(value) => mb(value) + (rankMeasure === 'daily' ? '/dia' : '')}
          onItemClick={(item) => viewRow(selected.find((row) => row.id === item.id))}
        />
        <div className="line-actions">
          <PermissionButton action="export" onClick={exportRecords}>
            Baixar linhas filtradas CSV
          </PermissionButton>
          <button onClick={() => filter('consumption', 'attention')}>Ver somente destaques</button>
          <button onClick={() => filter('consumption', 'zero')}>Ver consumo zero</button>
        </div>
        <p className="scope">
          O limite absoluto considera consumo total da apuração estritamente maior que o valor em
          MB, combinado com os demais filtros. Valores inválidos não entram. A seleção vale para o
          recorte atual e atravessa as páginas da tabela.
        </p>
        {Number.isNaN(consumptionLimit(filters.minimumMB)) && (
          <p role="alert" className="error">
            Informe um limite não negativo com até seis casas decimais.
          </p>
        )}
      </Section>
    </>
  );
}
