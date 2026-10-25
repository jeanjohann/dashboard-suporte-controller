import { clientDisplay } from '../shared/data/clientDisplay.js';
/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../shared/security/Access.jsx';
import React, { useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { chartAvailability, rankingItems } from '../shared/charts/chartRules.js';
import { download, chartSvg } from '../shared/export/exports.js';
import { categoricalColors as colors, chartColors } from '../shared/charts/palette.js';
import { ViewState } from './ViewState.jsx';
/** Apresenta a série calculada, controla o formato compatível e exporta o gráfico com seu contexto. */
export function Chart({
  items: inputItems,
  type = 'bars',
  measure,
  title,
  format = (value) => value.toLocaleString('pt-BR'),
  ranking = false,
  exportNote,
  compact = false,
  onItemClick,
  height,
  showDrilldownHint = true,
}) {
  const clientNames = /cliente|base|razão social/i.test(title || '');
  const items = clientNames
    ? inputItems.map((item) => ({
        ...item,
        displayLabel: item.displayLabel || clientDisplay(item.label),
      }))
    : inputItems;
  const container = useRef();
  const [limit, setLimit] = useState('10');
  const shown = ranking && type === 'bars' ? rankingItems(items, limit) : items;
  function exportChart() {
    if (type === 'bars') {
      download(
        chartSvg(
          clientNames
            ? shown.map((item) => ({ ...item, label: clientDisplay(item.label) }))
            : shown,
          {
            title,
            subtitle: `${shown.length} de ${items.length} categorias exibidas`,
            format,
            note: exportNote,
          },
        ),
        'image/svg+xml',
        'grafico-barras.svg',
      );
      return;
    }
    const source = container.current?.querySelector('svg.recharts-surface');
    if (!source) return;
    const copy = source.cloneNode(true);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    label.textContent = title;
    copy.prepend(label);
    download(
      new XMLSerializer().serializeToString(copy),
      'image/svg+xml',
      'grafico-' + type + '.svg',
    );
  }
  const reason = chartAvailability(items, measure),
    circular = type === 'pie' || type === 'donut';
  const total = circular ? items.reduce((sum, item) => sum + item.value, 0) : 0;
  if (!items.length)
    return (
      <ViewState compact title="Sem dados para este gráfico">
        Confira a fonte, o período e os filtros desta análise.
      </ViewState>
    );
  if (circular && reason)
    return (
      <p role="status" className="notice">
        {reason}
      </p>
    );
  if (type === 'bars') {
    const max = Math.max(1, ...shown.map((item) => Math.abs(item.value))),
      signed = shown.some((item) => item.value < 0);
    return (
      <div ref={container} className="bar-chart">
        <div className="chart-heading">
          {!compact && <h3>{title}</h3>}
          {ranking && (
            <label>
              Participantes no gráfico{' '}
              <select value={limit} onChange={(event) => setLimit(event.target.value)}>
                <option value="10">10 maiores</option>
                <option value="20">20 maiores</option>
                <option value="all">Todos</option>
              </select>
            </label>
          )}
        </div>
        {compact ? (
          <details className="chart-tools">
            <summary>Detalhes e exportação</summary>
            <p className="scope">
              {shown.length} de {items.length} categorias no gráfico. Tabelas e totais continuam
              completos; nenhuma categoria foi agrupada em Outros.
              {signed ? ' Valores negativos aparecem à esquerda do centro.' : ''}
            </p>
            <PermissionButton action="export" className="chart-export" onClick={exportChart}>
              Baixar este gráfico SVG
            </PermissionButton>
          </details>
        ) : (
          <>
            <p className="scope">
              {shown.length} de {items.length} categorias no gráfico. Tabelas e totais continuam
              completos; nenhuma categoria foi agrupada em Outros.
              {signed ? ' Valores negativos aparecem à esquerda do centro.' : ''}
            </p>
            <PermissionButton action="export" className="chart-export" onClick={exportChart}>
              Baixar este gráfico SVG
            </PermissionButton>
          </>
        )}
        <div className="readable-bars">
          {shown.map((item) => {
            const width = (Math.abs(item.value) / max) * (signed ? 50 : 100);
            return (
              <div className="readable-bar-row" key={item.label}>
                {onItemClick ? (
                  <button
                    type="button"
                    className="bar-name bar-select"
                    title={item.label}
                    aria-label={`${item.label} · ${format(item.value)} · Conferir registros`}
                    onClick={() => onItemClick(item)}
                  >
                    <span className="bar-label">{item.displayLabel || item.label}</span>
                    {item.caption && <small className="bar-caption">{item.caption}</small>}
                  </button>
                ) : (
                  <span className="bar-name" title={item.label}>
                    <span className="bar-label">{item.displayLabel || item.label}</span>
                    {item.caption && <small className="bar-caption">{item.caption}</small>}
                  </span>
                )}
                <div className="readable-track">
                  <div
                    style={{
                      position: 'absolute',
                      height: '100%',
                      borderRadius: 4,
                      background: item.value < 0 ? 'var(--ui-chart-negative)' : 'var(--chart-main)',
                      left: `${signed ? (item.value < 0 ? 50 - width : 50) : 0}%`,
                      width: `${width}%`,
                    }}
                  />
                </div>
                <strong>{format(item.value)}</strong>
              </div>
            );
          })}
        </div>
        {onItemClick && (
          <small className="chart-drilldown-hint">
            Selecione uma categoria para conferir os registros que compõem o valor.
          </small>
        )}
      </div>
    );
  }
  return (
    <div ref={container}>
      {!compact && <h3>{title}</h3>}
      {compact ? (
        <details className="chart-tools">
          <summary>Exportar gráfico</summary>
          <PermissionButton action="export" className="chart-export" onClick={exportChart}>
            Baixar este gráfico SVG
          </PermissionButton>
        </details>
      ) : (
        <PermissionButton action="export" className="chart-export" onClick={exportChart}>
          Baixar este gráfico SVG
        </PermissionButton>
      )}
      <div
        style={{
          height: circular
            ? compact
              ? 240
              : 340
            : height || Math.max(300, Math.min(650, items.length * 32)),
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {circular ? (
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={items}
                dataKey="value"
                nameKey="label"
                outerRadius={120}
                innerRadius={type === 'donut' ? 65 : 0}
              >
                {items.map((item, i) => (
                  <Cell key={item.label} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={format} />
            </PieChart>
          ) : type === 'line' ? (
            <LineChart
              data={items}
              margin={{ left: 20, right: 30, bottom: 40 }}
              onClick={(event) => {
                const point = event?.activePayload?.[0]?.payload;
                if (point && onItemClick) onItemClick(point);
              }}
              style={onItemClick ? { cursor: 'crosshair' } : undefined}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-25} textAnchor="end" height={70} />
              <YAxis width={110} tickFormatter={format} />
              <Tooltip formatter={format} />
              <Line
                type="linear"
                dataKey="value"
                name="Valor"
                stroke={chartColors.primary}
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={items} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={150} />
              <Tooltip formatter={format} />
              <Bar dataKey="value" name="Valor" fill={chartColors.primary} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      {compact && type === 'line' && onItemClick && (
        <>
          {showDrilldownHint && (
            <small className="chart-drilldown-hint">
              Clique em um ponto da linha ou escolha uma data para conferir os registros.
            </small>
          )}
          <details className="chart-drilldown-picker">
            <summary>Conferir registros por data</summary>
            <div>
              {items.map((item) => (
                <button
                  type="button"
                  key={item.detailKey || item.label}
                  onClick={() => onItemClick(item)}
                >
                  {item.label} · {format(item.value)}
                </button>
              ))}
            </div>
          </details>
        </>
      )}
      {circular && (
        <>
          <p hidden={compact} className="scope">
            Todos os grupos estão incluídos; nenhuma categoria foi agrupada automaticamente em
            Outros.{items.length > 8 ? ' Muitas categorias: considere barras para comparação.' : ''}
          </p>
          <ul className="chart-legend">
            {items.map((item, i) => (
              <li key={item.label}>
                <span style={{ background: colors[i % colors.length] }} />
                {item.label}: {format(item.value)} ({((item.value / total) * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
