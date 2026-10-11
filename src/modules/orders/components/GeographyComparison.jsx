/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useContext, useState } from 'react';
import { PrintContext } from '../../../components/Section.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { groupedCosts } from '../domain/insights.js';
import { field } from '../../../shared/data/filters.js';
import { rankingItems } from '../../../shared/charts/chartRules.js';
import { csv, download, chartSvg } from '../../../shared/export/exports.js';

const currency = (value) =>
  (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const count = (value) => value.toLocaleString('pt-BR');
const percent = (value) =>
  value.toLocaleString('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
const metrics = {
  volume: 'Atendimentos',
  cost: 'Custo total lançado',
  travel: 'Despesa de deslocamento',
};
const series = [
  { key: 'all', label: 'Total de atendimentos', color: '#357a9a' },
  { key: 'maintenance', label: 'Manutenções', color: '#328b7d' },
];
const amount = (group, key) => (group?.[key]?.count ? group[key].sum : null);
const measureValue = (group, measure) =>
  measure === 'volume'
    ? group?.rows.length || 0
    : amount(group, measure === 'travel' ? 'travel' : 'cost');
const monetary = (group, key) =>
  amount(group, key) == null ? 'Sem valor válido' : currency(amount(group, key));
const average = (group) => (group?.cost.count ? currency(group.cost.sum / group.cost.count) : '—');

/** Compara indicadores por cidade ou UF com nomes e valores disponíveis para conferência. */
export function GeographyComparison({ data, column }) {
  const [measure, setMeasure] = useState('volume'),
    [limit, setLimit] = useState('10'),
    [selection, setSelection] = useState(null);
  const context = useContext(PrintContext);
  const all = groupedCosts(data, column);
  if (!all || !data.columns.some((col) => col.label === 'Tipo de Serviço'))
    return (
      <p className="scope">A comparação precisa das colunas Status, Tipo de Serviço e {column}.</p>
    );
  if (!all.length)
    return <p className="scope">Sem atendimentos Concluída/Pago para esta seleção.</p>;
  const maintenance = groupedCosts(
    {
      ...data,
      rows: data.rows.filter(
        (row) => field(data, row, 'Tipo de Serviço')?.raw === 'Assistência Técnica',
      ),
    },
    column,
  );
  const maintenanceByRegion = new Map(maintenance.map((group) => [group.label, group]));
  const groups = all.map((group) => ({
    label: group.label,
    all: group,
    maintenance: maintenanceByRegion.get(group.label),
    value: measureValue(group, measure) ?? 0,
  }));
  const shown = rankingItems(groups, limit),
    format = measure === 'volume' ? count : currency;
  const total = all.reduce((sum, group) => sum + group.rows.length, 0),
    maintenanceTotal = maintenance.reduce((sum, group) => sum + group.rows.length, 0);
  const max = Math.max(
    1,
    ...shown.flatMap((group) =>
      series.map((item) => Math.abs(measureValue(group[item.key], measure) ?? 0)),
    ),
  );
  const signed = shown.some((group) =>
    series.some((item) => (measureValue(group[item.key], measure) ?? 0) < 0),
  );
  const selectedGroup = groups.find((group) => group.label === selection?.label)?.[
    selection?.series
  ];
  function exportChart() {
    const items = shown.flatMap((group) =>
      series.flatMap((item) => {
        const value = measureValue(group[item.key], measure);
        return value == null
          ? []
          : [{ label: group.label + ' · ' + item.label, value, color: item.color }];
      }),
    );
    download(
      chartSvg(items, {
        title: `Distribuição geográfica · ${column} · ${metrics[measure]}`,
        subtitle: `${shown.length} de ${groups.length} regiões · duas barras por região`,
        format,
        note: 'Somente Concluída/Pago. Manutenções são parte do total; as barras não devem ser somadas. Valores ausentes não viram zero.',
      }),
      'image/svg+xml',
      'distribuicao-geografica.svg',
    );
  }
  function exportTable() {
    const financial = (group, key) => (amount(group, key) == null ? '' : amount(group, key) / 100);
    download(
      csv([
        ['Distribuição geográfica dos serviços'],
        ['Arquivo', context.filename || '—'],
        ['Filtros', JSON.stringify(context.filters || {})],
        ['Região', column],
        [
          'Regra',
          'Somente Concluída/Pago. Manutenções = Assistência Técnica e estão incluídas no total. Valores ausentes são excluídos das médias; zeros são mantidos.',
        ],
        [],
        [
          column,
          'Total de atendimentos',
          'Manutenções',
          'Manutenções (%)',
          'Custo total (BRL)',
          'Custo das manutenções (BRL)',
          'Média do custo total (BRL)',
          'Média do custo das manutenções (BRL)',
          'Custos válidos no total',
          'Custos válidos nas manutenções',
          'Deslocamento total (BRL)',
          'Deslocamento das manutenções (BRL)',
          'Contrato absorvido total (BRL)',
          'Contrato absorvido nas manutenções (BRL)',
          'Linhas Excel do total',
          'Linhas Excel das manutenções',
        ],
        ...groups.map((group) => [
          group.label,
          group.all.rows.length,
          group.maintenance?.rows.length || 0,
          ((group.maintenance?.rows.length || 0) / group.all.rows.length) * 100,
          financial(group.all, 'cost'),
          financial(group.maintenance, 'cost'),
          group.all.cost.count ? group.all.cost.sum / group.all.cost.count / 100 : '',
          group.maintenance?.cost.count
            ? group.maintenance.cost.sum / group.maintenance.cost.count / 100
            : '',
          group.all.cost.count,
          group.maintenance?.cost.count || 0,
          financial(group.all, 'travel'),
          financial(group.maintenance, 'travel'),
          financial(group.all, 'absorbed'),
          financial(group.maintenance, 'absorbed'),
          group.all.rows.join(', '),
          group.maintenance?.rows.join(', ') || '',
        ]),
      ]),
      'text/csv;charset=utf-8',
      'distribuicao-geografica.csv',
    );
  }
  return (
    <div className="geography-comparison">
      <InfoNote>
        Serviços Concluída/Pago no período e filtros selecionados. Manutenções são os atendimentos
        de Assistência Técnica e já estão incluídas no total.
      </InfoNote>
      <div className="geography-summary">
        <div>
          <span>Total de atendimentos</span>
          <strong>{count(total)}</strong>
        </div>
        <div>
          <span>Manutenções</span>
          <strong>{count(maintenanceTotal)}</strong>
        </div>
        <div>
          <span>Participação das manutenções</span>
          <strong>{percent(maintenanceTotal / total)}</strong>
        </div>
      </div>
      <div className="chart-heading geography-controls">
        <label>
          Comparar por{' '}
          <select value={measure} onChange={(event) => setMeasure(event.target.value)}>
            {Object.entries(metrics).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Regiões no gráfico{' '}
          <select value={limit} onChange={(event) => setLimit(event.target.value)}>
            <option value="10">10 maiores</option>
            <option value="20">20 maiores</option>
            <option value="all">Todas</option>
          </select>
        </label>
      </div>
      <ul className="chart-legend geography-legend">
        {series.map((item) => (
          <li key={item.key}>
            <span style={{ background: item.color }} />
            {item.label}
          </li>
        ))}
      </ul>
      <p className="scope">
        {shown.length} de {groups.length} regiões, ordenadas pelo total de{' '}
        {metrics[measure].toLocaleLowerCase('pt-BR')}. Clique em uma barra para conferir os
        atendimentos. As duas barras usam a mesma escala.
        {signed ? ' Valores negativos aparecem à esquerda do centro.' : ''}
      </p>
      <details className="chart-tools">
        <summary>Detalhes e exportação</summary>
        <InfoNote>
          A tabela e o CSV incluem todas as regiões, mesmo quando o gráfico mostra apenas as
          maiores. Regiões sem identificação permanecem como “Sem dados”.
        </InfoNote>
        <div className="report-downloads">
          <PermissionButton action="export" className="chart-export" onClick={exportChart}>
            Baixar este gráfico SVG
          </PermissionButton>
          <PermissionButton action="export" className="chart-export" onClick={exportTable}>
            Baixar comparação CSV
          </PermissionButton>
        </div>
      </details>
      <div
        className="readable-bars geography-bars"
        aria-label={`Comparação por ${column}: ${metrics[measure]}`}
      >
        {shown.map((group) => (
          <div className="geography-row" key={group.label}>
            <button
              className="geography-region bar-select"
              onClick={() => setSelection({ label: group.label, series: 'all' })}
              aria-label={`Conferir todos os atendimentos de ${group.label}`}
            >
              {group.label}
            </button>
            <div className="geography-series-list">
              {series.map((item) => {
                const value = measureValue(group[item.key], measure),
                  text = value == null ? 'Sem valor válido' : format(value),
                  width = (Math.abs(value ?? 0) / max) * (signed ? 50 : 100),
                  left = signed ? (value < 0 ? 50 - width : 50) : 0;
                return (
                  <button
                    key={item.key}
                    className="geography-series"
                    disabled={!group[item.key]?.rows.length}
                    onClick={() => setSelection({ label: group.label, series: item.key })}
                    aria-label={`${item.label} de ${group.label}: ${text}. Conferir atendimentos`}
                  >
                    <span className="geography-series-label">{item.label}</span>
                    <span className="geography-track">
                      {signed && <span className="geography-zero" />}
                      <span
                        className="geography-fill"
                        style={{ background: item.color, width: `${width}%`, left: `${left}%` }}
                      />
                    </span>
                    <strong>{text}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <InfoNote>
        Compare as barras; não some total e manutenção. Custos usam Custo Total e deslocamento usa
        Km como despesa. Valores ausentes são excluídos das médias; zeros são mantidos.
      </InfoNote>
      <details className="report-details">
        <summary>Comparação completa e bases de cálculo</summary>
        <div className="table-scroll">
          <SortableTable>
            <thead>
              <tr>
                {[
                  column,
                  'Total de atendimentos',
                  'Manutenções',
                  'Manutenções / total',
                  'Custo total',
                  'Custo das manutenções',
                  'Média do custo total',
                  'Média do custo das manutenções',
                  'Custos válidos no total',
                  'Custos válidos nas manutenções',
                  'Deslocamento total',
                  'Deslocamento das manutenções',
                  'Contrato absorvido total',
                  'Contrato absorvido nas manutenções',
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.label}>
                  <td>
                    <button
                      type="button"
                      className="table-label-action"
                      title={group.label}
                      onClick={() => setSelection({ label: group.label, series: 'all' })}
                    >
                      {group.label}
                    </button>
                  </td>
                  <td>{group.all.rows.length}</td>
                  <td>
                    <button
                      disabled={!group.maintenance}
                      onClick={() => setSelection({ label: group.label, series: 'maintenance' })}
                    >
                      {group.maintenance?.rows.length || 0}
                    </button>
                  </td>
                  <td data-sort={(group.maintenance?.rows.length || 0) / group.all.rows.length}>
                    {percent((group.maintenance?.rows.length || 0) / group.all.rows.length)}
                  </td>
                  <td data-sort={amount(group.all, 'cost')}>{monetary(group.all, 'cost')}</td>
                  <td data-sort={amount(group.maintenance, 'cost')}>
                    {monetary(group.maintenance, 'cost')}
                  </td>
                  <td
                    data-sort={
                      group.all.cost.count ? group.all.cost.sum / group.all.cost.count : null
                    }
                  >
                    {average(group.all)}
                  </td>
                  <td
                    data-sort={
                      group.maintenance?.cost.count
                        ? group.maintenance.cost.sum / group.maintenance.cost.count
                        : null
                    }
                  >
                    {average(group.maintenance)}
                  </td>
                  <td>{group.all.cost.count}</td>
                  <td>{group.maintenance?.cost.count || 0}</td>
                  <td data-sort={amount(group.all, 'travel')}>{monetary(group.all, 'travel')}</td>
                  <td data-sort={amount(group.maintenance, 'travel')}>
                    {monetary(group.maintenance, 'travel')}
                  </td>
                  <td data-sort={amount(group.all, 'absorbed')}>
                    {monetary(group.all, 'absorbed')}
                  </td>
                  <td data-sort={amount(group.maintenance, 'absorbed')}>
                    {monetary(group.maintenance, 'absorbed')}
                  </td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
      </details>
      <InfoNote>
        Valor contratual absorvido usa Valor a cobrar e Cobrança = Addlog; não indica recebimento ou
        lucro.
      </InfoNote>
      {selectedGroup && (
        <>
          <button onClick={() => setSelection(null)}>Fechar atendimentos selecionados</button>
          <RecordDetails
            data={data}
            rows={selectedGroup.rows}
            title={`${column} · ${selection.label} · ${series.find((item) => item.key === selection.series).label}`}
          />
        </>
      )}
    </div>
  );
}
