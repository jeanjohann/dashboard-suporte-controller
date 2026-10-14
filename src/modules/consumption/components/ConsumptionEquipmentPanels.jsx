/** Relatórios de consumo por assunto. Recebem o recorte e preservam o domínio e contexto de impressão da página. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { Chart } from '../../../components/Chart.jsx';
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
