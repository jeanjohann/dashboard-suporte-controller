/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { isUnproductive } from '../domain/attendanceKind.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { GeographyComparison } from './GeographyComparison.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { groupedCosts } from '../domain/insights.js';
import { field } from '../../../shared/data/filters.js';
const currency = (value) =>
  (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const metric = (value) => (value.count ? currency(value.sum) : 'Sem valor válido');
function Groups({ data, column, maintenance = false, absorbed = false }) {
  const [measure, setMeasure] = useState('volume'),
    [detail, setDetail] = useState(null);
  const scoped = {
    ...data,
    rows: data.rows.filter(
      (row) =>
        (!maintenance ||
          (!isUnproductive(data, row) &&
            field(data, row, 'Tipo de Serviço')?.raw === 'Assistência Técnica')) &&
        (!absorbed || field(data, row, 'Cobrança')?.raw === 'Addlog'),
    ),
  };
  const groups = groupedCosts(scoped, column);
  if (!groups) return <p>Colunas necessárias indisponíveis.</p>;
  const total = groups.reduce((sum, g) => sum + g.rows.length, 0);
  const items = groups
    .map((g) => ({
      label: g.label,
      value:
        measure === 'volume'
          ? g.rows.length
          : measure === 'travel'
            ? g.travel.sum
            : measure === 'absorbed'
              ? g.absorbed.sum
              : g.cost.sum,
    }))
    .sort((a, b) => b.value - a.value);
  return (
    <>
      <p className="scope">
        {total} atendimentos Concluída/Pago{maintenance ? ' de Assistência Técnica' : ''}
        {absorbed ? ' com Cobrança = Addlog' : ''}. Valores ausentes são excluídos das médias; zeros
        são mantidos. Km representa despesa de deslocamento.
      </p>
      <label>
        Comparar por{' '}
        <select value={measure} onChange={(e) => setMeasure(e.target.value)}>
          <option value="volume">Atendimentos</option>
          <option value="cost">Custo total lançado</option>
          <option value="travel">Despesa de deslocamento</option>
          {absorbed && <option value="absorbed">Valor contratual absorvido</option>}
        </select>
      </label>
      <Chart
        items={items}
        title={column}
        compact
        ranking
        format={measure === 'volume' ? undefined : currency}
        onItemClick={(item) => setDetail(groups.find((g) => g.label === item.label))}
      />
      <details className="report-details">
        <summary>Comparação completa e bases de cálculo</summary>
        <div className="table-scroll">
          <SortableTable>
            <thead>
              <tr>
                {[
                  column,
                  'Atendimentos',
                  'Participação',
                  'Custo total',
                  'Média do custo',
                  'Valores válidos',
                  'Deslocamento',
                  'Valor contratual absorvido',
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.label}>
                  <td>
                    <button
                      type="button"
                      className="table-label-action"
                      title={g.label}
                      onClick={() => setDetail(g)}
                    >
                      {g.label}
                    </button>
                  </td>
                  <td>{g.rows.length}</td>
                  <td>{total ? ((g.rows.length / total) * 100).toFixed(1) + '%' : '—'}</td>
                  <td data-sort={g.cost.count ? g.cost.sum : null}>{metric(g.cost)}</td>
                  <td data-sort={g.cost.count ? g.cost.sum / g.cost.count : null}>
                    {g.cost.count ? currency(g.cost.sum / g.cost.count) : '—'}
                  </td>
                  <td>{g.cost.count}</td>
                  <td>{metric(g.travel)}</td>
                  <td>{metric(g.absorbed)}</td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
      </details>
      <InfoNote>
        Custo Total é o valor lançado na planilha. Valor contratual absorvido usa Valor a cobrar e
        Cobrança = Addlog; não indica pagamento ou lucro. Grupos sem identificação permanecem na
        base.
      </InfoNote>
      {detail && (
        <>
          <button onClick={() => setDetail(null)}>Fechar atendimentos selecionados</button>
          <RecordDetails data={data} rows={detail.rows} title={detail.label} />
        </>
      )}
    </>
  );
}
/** Apresenta recortes complementares de manutenção, custos absorvidos e geografia. */
export function ExtendedInsights({ data, visibility }) {
  const [absorbedBy, setAbsorbedBy] = useState('Razão Social'),
    [regionBy, setRegionBy] = useState('UF');
  return (
    <>
      <Section
        title="Motivos das manutenções"
        visible={visibility.maintenanceReasons}
        defaultOpen={false}
      >
        <Groups data={data} column="Motivo" maintenance />
        <InfoNote>
          Assistências Concluída/Pago com Motivo Visita Improdutiva ficam fora desta análise de
          manutenção efetiva. Os custos dessas visitas continuam nos indicadores financeiros gerais.
          Motivos registrados não comprovam falha do equipamento ou responsabilidade do técnico.
        </InfoNote>
      </Section>
      <Section
        title="Serviços absorvidos pela Addlog"
        visible={visibility.absorbedAnalysis}
        defaultOpen={false}
      >
        <label>
          Agrupar por{' '}
          <select value={absorbedBy} onChange={(e) => setAbsorbedBy(e.target.value)}>
            {['Razão Social', 'Motivo', 'UF'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <Groups key={absorbedBy} data={data} column={absorbedBy} absorbed />
      </Section>
      <Section
        title="Distribuição geográfica dos serviços"
        visible={visibility.geography}
        defaultOpen={false}
      >
        <label>
          Região{' '}
          <select value={regionBy} onChange={(e) => setRegionBy(e.target.value)}>
            <option>UF</option>
            <option>Cidade</option>
          </select>
        </label>
        <GeographyComparison key={regionBy} data={data} column={regionBy} />
      </Section>
      <Section
        title="Contexto da rede de técnicos"
        visible={visibility.technicianContext}
        defaultOpen={false}
      >
        <Groups data={data} column="Cód." />
        <InfoNote>
          Volume e custo dependem dos serviços e regiões atendidos; não constituem avaliação de
          qualidade. Para examinar o contexto, use os filtros de tipo, motivo, cliente e região no
          topo.
        </InfoNote>
      </Section>
    </>
  );
}
