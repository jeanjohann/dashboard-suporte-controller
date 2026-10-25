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
import { download, chartSvg, csv } from '../shared/export/exports.js';
import { categoricalColors as colors, chartColors } from '../shared/charts/palette.js';
import { chartPage, valueAxisWidth } from '../shared/charts/chartLayout.js';
import { usePrintMode } from '../shared/charts/usePrintMode.js';
import { ViewState } from './ViewState.jsx';

function ChartTools({ items, title, format, exportChart, note }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="chart-tools" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Valores e exportação</summary>
      {open && (
        <>
          <div className="chart-actions">
            <PermissionButton action="export" className="chart-export" onClick={exportChart}>
              Baixar SVG
            </PermissionButton>
            <PermissionButton
              action="export"
              className="chart-export"
              onClick={() =>
                download(
                  csv([
                    [title],
                    [note || ''],
                    ['Categoria', 'Valor', 'Valor formatado'],
                    ...items.map((item) => [
                      item.label,
                      item.value,
                      item.value == null ? 'Sem dados' : format(item.value),
                    ]),
                  ]),
                  'text/csv;charset=utf-8',
                  'dados-grafico.csv',
                )
              }
            >
              Baixar CSV
            </PermissionButton>
          </div>
          {note && <p className="scope">{note}</p>}
          <table className="chart-values-table">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">Categoria</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.label}>
                  <th scope="row">{item.displayLabel || item.label}</th>
                  <td>{item.value == null ? 'Sem dados' : format(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </details>
  );
}
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
  const [page, setPage] = useState(0);
  const printing = usePrintMode();
  const shown = ranking && type === 'bars' ? rankingItems(items, limit) : items;
  const paged = chartPage(shown, page);
  const visible = printing ? shown : paged.items;
  const axisWidth = valueAxisWidth(items, format);
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
            note:
              exportNote || 'Dados do recorte exibido; confira a fonte e os filtros da análise.',
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
    // O SVG baixado precisa carregar as cores resolvidas, mesmo fora da página e do tema.
    const originals = [source, ...source.querySelectorAll('*')];
    const copies = [copy, ...copy.querySelectorAll('*')];
    originals.forEach((node, index) => {
      const style = getComputedStyle(node);
      for (const property of ['fill', 'stroke', 'color', 'font-family', 'font-size']) {
        copies[index].style.setProperty(property, style.getPropertyValue(property));
      }
    });
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute(
      'fill',
      getComputedStyle(container.current).getPropertyValue('--ui-surface').trim() || '#fff',
    );
    copy.prepend(background);
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
      <div ref={container} className="bar-chart chart-shared" role="region" aria-label={title}>
        <div className="chart-heading">
          {!compact && <h3>{title}</h3>}
          {ranking && (
            <label>
              Participantes no gráfico{' '}
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(event.target.value);
                  setPage(0);
                }}
              >
                <option value="10">10 maiores</option>
                <option value="20">20 maiores</option>
                <option value="all">Todos</option>
              </select>
            </label>
          )}
        </div>
        <ChartTools
          items={shown}
          title={title}
          format={format}
          exportChart={exportChart}
          note={`${shown.length} de ${items.length} categorias incluídas. Tabela e exportação incluem todo este recorte.${signed ? ' Valores negativos aparecem à esquerda do centro.' : ''}${exportNote ? ' ' + exportNote : ''}`}
        />
        <div className="readable-bars">
          {visible.map((item) => {
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
        {paged.last > 0 && (
          <nav className="chart-pagination" aria-label={`Páginas de ${title}`}>
            <button
              type="button"
              disabled={!paged.current}
              onClick={() => setPage(paged.current - 1)}
            >
              Anterior
            </button>
            <span aria-live="polite">
              {paged.current * 10 + 1}–{Math.min((paged.current + 1) * 10, shown.length)} de{' '}
              {shown.length}
            </span>
            <button
              type="button"
              disabled={paged.current === paged.last}
              onClick={() => setPage(paged.current + 1)}
            >
              Próxima
            </button>
          </nav>
        )}
        {onItemClick && (
          <small className="chart-drilldown-hint">
            Selecione uma categoria para conferir os registros que compõem o valor.
          </small>
        )}
      </div>
    );
  }
  return (
    <div ref={container} className="chart-shared" role="region" aria-label={title}>
      {!compact && <h3>{title}</h3>}
      <ChartTools
        items={items}
        title={title}
        format={format}
        exportChart={exportChart}
        note={exportNote}
      />
      <div
        className="chart-plot"
        style={{
          height: circular
            ? compact
              ? 240
              : 340
            : height ||
              (type === 'line'
                ? compact
                  ? 220
                  : 300
                : Math.max(240, Math.min(650, items.length * 32))),
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {circular ? (
            <PieChart accessibilityLayer>
              <Pie
                isAnimationActive={false}
                data={items}
                dataKey="value"
                nameKey="label"
                outerRadius="82%"
                innerRadius={type === 'donut' ? '52%' : 0}
              >
                {items.map((item, i) => (
                  <Cell key={item.label} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={format} />
            </PieChart>
          ) : type === 'line' ? (
            <LineChart
              accessibilityLayer
              data={items}
              margin={{ top: 8, left: 0, right: 14, bottom: 0 }}
              onClick={(event) => {
                const point = event?.activePayload?.[0]?.payload;
                if (point && onItemClick) onItemClick(point);
              }}
              style={onItemClick ? { cursor: 'crosshair' } : undefined}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                textAnchor="middle"
                height={32}
                padding={{ left: 24, right: 28 }}
                minTickGap={16}
                interval="preserveStartEnd"
                tickLine={false}
              />
              <YAxis width={axisWidth} tickFormatter={format} tickCount={5} tickLine={false} />
              <Tooltip formatter={format} />
              <Line
                type="linear"
                dataKey="value"
                name="Valor"
                stroke={chartColors.primary}
                strokeWidth={2}
                dot={items.length <= 24 ? { r: 2.5 } : false}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          ) : (
            <BarChart
              accessibilityLayer
              data={items}
              layout="vertical"
              margin={{ left: 0, right: 14 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={150} />
              <Tooltip formatter={format} />
              <Bar
                dataKey="value"
                name="Valor"
                fill={chartColors.primary}
                isAnimationActive={false}
              />
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
            Outros.{items.length > 3 ? ' Para comparar muitas categorias, prefira barras.' : ''}
          </p>
          <ul className="chart-legend">
            {items.map((item, i) => (
              <li key={item.label}>
                <span style={{ background: colors[i % colors.length] }} />
                {item.label}: {format(item.value)} (
                {((item.value / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                %)
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
