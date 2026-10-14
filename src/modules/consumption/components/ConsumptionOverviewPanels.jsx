/** Relatórios de consumo por assunto. Recebem o recorte e preservam o domínio e contexto de impressão da página. */
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { VOLUME_SCALE } from '../domain/lineConsumption.js';
import {
  formatMB as mb,
  formatVolume as volume,
  formatNumber as number,
} from '../utils/consumptionFormatting.js';
export function ConsumptionOverviewPanels({
  shown,
  hasStatements,
  summary,
  eligible,
  ranges,
  chartNote,
  providerStats,
}) {
  return (
    <>
      <Section
        title="Visão geral do consumo"
        visible={shown('Visão geral do consumo') && hasStatements}
      >
        <div className="summary-grid line-cards">
          {[
            ['Chips no recorte', number(summary.lines), 'Identificação por operadora + ICCID'],
            [
              'Consumo total',
              volume(summary.ticks),
              summary.ticks == null
                ? 'Sem consumo válido'
                : `${number(summary.ticks / VOLUME_SCALE / 1024)} GB equivalentes · apurações selecionadas`,
            ],
            [
              'Linhas com tráfego',
              number(summary.active),
              `${summary.samples} registros de dados válidos`,
            ],
            [
              'Consumo zero',
              number(summary.zero),
              `${summary.samples ? number((summary.zero / summary.samples) * 100) : '—'}% dos registros válidos; sem inferir equipamento parado`,
            ],
            [
              'Média geral por linha',
              volume(summary.average),
              `Inclui zeros · média com tráfego: ${volume(summary.activeAverage)}`,
            ],
            [
              'Vínculos conferidos',
              number(eligible.filter((row) => row.link).length),
              'ICCID e número no mesmo registro operacional',
            ],
          ].map(([label, value, note]) => (
            <div className="summary-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
        <p className="scope">
          Mediana: {volume(summary.median)} · maior consumo: {volume(summary.max)} ·{' '}
          {summary.excluded} registros de dados fora dos totais. SMS e frete não entram no volume de
          dados. Clientes e equipamentos vêm da referência operacional, sem comprovar alocação
          histórica.
        </p>
        <div className="dashboard-chart-grid">
          <article className="panel dashboard-widget">
            <h3>Linhas por faixa de consumo</h3>
            <Chart
              compact
              exportNote={chartNote}
              items={ranges.filter((item) => item.value > 0)}
              type="donut"
              title="Faixas de consumo em MB"
            />
          </article>
          <article className="panel dashboard-widget">
            <h3>Consumo por plano / produto</h3>
            <Chart
              compact
              exportNote={chartNote}
              ranking
              items={[...new Set(eligible.map((row) => row.plan))].map((label) => ({
                label,
                value:
                  eligible
                    .filter((row) => row.plan === label)
                    .reduce((sum, row) => sum + row.ticks, 0) / VOLUME_SCALE,
              }))}
              title="Consumo por plano"
              format={mb}
            />
          </article>
        </div>
      </Section>
      <Section
        title="Comparativos por operadora"
        visible={shown('Comparativos por operadora') && hasStatements}
      >
        <InfoNote>
          Compare MB por dia e média por linha; cada operadora tem seu tamanho de base e sua
          apuração. Os fornecedores têm vários contratos; não há cálculo de saldo de uma franquia
          global.
        </InfoNote>
        <div className="table-scroll">
          <SortableTable>
            <thead>
              <tr>
                {[
                  'Operadora',
                  'Apuração',
                  'Dias',
                  'Chips',
                  'Consumo MB',
                  'MB por dia',
                  'Média por linha MB',
                  'Média por linha / dia',
                  'Zeros',
                  'Acima da referência',
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providerStats.map((item) => (
                <tr key={item.operator}>
                  <td>{item.operator}</td>
                  <td>{item.period?.label}</td>
                  <td>{item.period?.days}</td>
                  <td>{item.lines}</td>
                  <td data-sort={item.ticks}>{volume(item.ticks)}</td>
                  <td data-sort={item.ticks == null ? null : item.ticks / item.period.days}>
                    {volume(item.ticks == null ? null : item.ticks / item.period.days)}
                  </td>
                  <td data-sort={item.average}>{volume(item.average)}</td>
                  <td data-sort={item.average == null ? null : item.average / item.period.days}>
                    {volume(item.average == null ? null : item.average / item.period.days)}
                  </td>
                  <td>{item.zero}</td>
                  <td>{item.eligible.filter((row) => row.attention).length}</td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
      </Section>
    </>
  );
}
