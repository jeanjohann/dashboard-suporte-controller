/** Relatórios de consumo por assunto. Recebem o recorte e preservam o domínio e contexto de impressão da página. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { VOLUME_SCALE } from '../domain/lineConsumption.js';
import { formatMB as mb } from '../utils/consumptionFormatting.js';
export function ConsumptionEquipmentPanels({
  shown,
  hasStatements,
  chartNote,
  clientGroups,
  selected,
  rowsTable,
}) {
  return (
    <>
      <Section
        title="Consumo por cliente e equipamento"
        visible={shown('Consumo por cliente e equipamento') && hasStatements}
        summary={
          <ReportSummary
            metrics={[
              ['Grupos no gráfico', clientGroups.size],
              ['Registros no recorte', selected.length],
              ['Vínculos confirmados', selected.filter((row) => row.link).length],
              ['Sem vínculo confirmado', selected.filter((row) => !row.link).length],
            ]}
            note="Vínculo por ICCID e número, na referência operacional atual. Grupos incluem identificações não vinculadas; não comprova alocação histórica."
          />
        }
      >
        <InfoNote>
          Vínculos confirmados por ICCID e MSISDN no mesmo registro do operacional. Casos sem
          vínculo ficam identificados; a situação e a localização da fotografia operacional podem
          diferir da época do consumo.
        </InfoNote>
        <Chart
          compact
          exportNote={chartNote}
          ranking
          items={[...clientGroups.values()].map((group) => ({
            label: group.label,
            value: group.ticks / VOLUME_SCALE,
          }))}
          title="Consumo por cliente na referência"
          format={mb}
        />
        {shown('Consumo por cliente e equipamento') && rowsTable(selected)}
      </Section>
      <Section
        title="Revisão dos vínculos"
        visible={shown('Revisão dos vínculos') && hasStatements}
        defaultOpen={false}
        summary={
          <ReportSummary
            metrics={[
              ['Sem confirmação', selected.filter((row) => !row.link).length],
              ['Com confirmação', selected.filter((row) => row.link).length],
            ]}
            note="Registros da seleção atual. Correspondência parcial ou ambígua não é atribuída automaticamente a um cliente."
          />
        }
      >
        <p className="scope">
          {selected.filter((row) => !row.link).length} registros do recorte sem confirmação pelos
          dois identificadores. Não escolhemos um cliente automaticamente quando existem conflitos
          ou duplicidades.
        </p>
        {shown('Revisão dos vínculos') && rowsTable(selected.filter((row) => !row.link))}
      </Section>
    </>
  );
}
