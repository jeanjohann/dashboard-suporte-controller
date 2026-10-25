import React, { useEffect, useState } from 'react';
import {
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
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatMetric } from '../domain/evaluate.js';
import { compareSeries, donutSeries } from '../domain/presentation.js';
import { VOLUME_SCALE } from '../../consumption/domain/lineConsumption.js';
import { categoricalColors } from '../../../shared/charts/palette.js';
import { usePrintMode } from '../../../shared/charts/usePrintMode.js';

const colors = categoricalColors;
export function ValuesTable({ rows, unit, titles, pageSize = 5 }) {
  const printing = usePrintMode();
  const [page, setPage] = useState(0),
    last = Math.max(0, Math.ceil(rows.length / pageSize) - 1),
    current = Math.min(page, last);
  const body = (values) =>
    values.map((row, index) => (
      <tr key={`${row.label}:${index}`}>
        <th scope="row">{row.label}</th>
        <td>{formatMetric(row.value, unit)}</td>
        {titles && <td>{formatMetric(row.comparison, unit)}</td>}
      </tr>
    ));
  return (
    <>
      <div className="md-table-scroll" tabIndex={0} role="region" aria-label="Valores do indicador">
        <table>
          <thead>
            <tr>
              <th scope="col">Informação</th>
              <th scope="col">{titles?.[0] || 'Valor'}</th>
              {titles && <th scope="col">{titles[1]}</th>}
            </tr>
          </thead>
          <tbody className="md-screen-rows">
            {body(rows.slice(current * pageSize, current * pageSize + pageSize))}
          </tbody>
          {printing && <tbody className="md-print-rows">{body(rows)}</tbody>}
        </table>
      </div>
      {rows.length > 10 && (
        <div className="md-pagination">
          <button type="button" disabled={!current} onClick={() => setPage(current - 1)}>
            Anterior
          </button>
          <span>
            {current + 1} de {last + 1} · {rows.length} itens
          </span>
          <button type="button" disabled={current === last} onClick={() => setPage(current + 1)}>
            Próxima
          </button>
        </div>
      )}
    </>
  );
}
function useSize() {
  const [node, ref] = useState(null),
    [size, setSize] = useState({ width: 400, height: 250 });
  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((old) =>
        Math.abs(old.width - width) < 1 && Math.abs(old.height - height) < 1
          ? old
          : { width, height },
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [ref, size];
}
function compact(value, unit) {
  const raw =
    value / (unit === 'money' ? 100 : unit === 'mb' ? VOLUME_SCALE : unit === 'seconds' ? 3600 : 1);
  return (
    (unit === 'money' ? 'R$ ' : '') +
    new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(raw) +
    (unit === 'seconds' ? 'h' : unit === 'mb' ? ' MB' : '')
  );
}
function CategoryTick({ x, y, payload, width }) {
  const text = String(payload.value),
    chars = Math.max(7, Math.floor(width / 6.7));
  return (
    <text x={x - 4} y={y} textAnchor="end" dominantBaseline="central" fill="var(--md-muted)">
      <title>{text}</title>
      {text.length > chars ? text.slice(0, chars - 1) + '…' : text}
    </text>
  );
}
export const WidgetVisualization = React.memo(function WidgetVisualization({
  widget,
  result,
  comparison,
  asTable = false,
  expanded = false,
}) {
  const [ref, size] = useSize();
  const titles = comparison ? [widget.title, widget.comparison.title] : undefined;
  const rows = comparison
    ? compareSeries(
        result.series || [],
        comparison.series || [],
        result.chronological || widget.metric === 'orders.months',
      )
    : result.series || [{ label: widget.title, value: result.value }];
  if (widget.kind === 'card')
    return <div className="md-widget-value">{formatMetric(result.value, result.unit)}</div>;
  if (!rows.length)
    return <p className="md-widget-empty">Nenhum registro corresponde a este recorte.</p>;
  if (widget.kind === 'table' || asTable)
    return (
      <ValuesTable rows={rows} unit={result.unit} titles={titles} pageSize={expanded ? 10 : 5} />
    );
  const isDonut = widget.kind === 'donut';
  const slices = isDonut ? donutSeries(rows) : null;
  if (isDonut && (!slices || !slices.length))
    return (
      <>
        <p className="md-muted">
          {!slices
            ? 'Há valores indisponíveis. Confira a tabela; o total não pode ser representado por uma rosca.'
            : 'Não há valores positivos para desenhar a rosca.'}
        </p>
        <ValuesTable rows={rows} unit={result.unit} />
      </>
    );
  const capacity =
    widget.kind === 'chart'
      ? Math.max(1, Math.floor((size.height - 34) / (comparison ? 40 : 27)))
      : Math.max(1, Math.floor((size.width - 90) / 110));
  const visible =
    widget.kind === 'line'
      ? rows
      : rows.slice(0, Math.min(expanded ? 40 : 20, Math.max(1, capacity)));
  const axisWidth = Math.max(65, Math.min(170, size.width * 0.29));
  const chartProps = {
    data: visible,
    margin: { top: 8, right: 20, bottom: 8, left: 5 },
    accessibilityLayer: true,
  };
  const tooltip = (
    <Tooltip
      formatter={(value, key) => [
        formatMetric(value, result.unit),
        key === 'comparison' ? titles?.[1] : widget.title,
      ]}
      cursor={{ fill: 'var(--md-soft)' }}
      contentStyle={{
        background: 'var(--md-surface)',
        borderColor: 'var(--md-border)',
        color: 'inherit',
      }}
    />
  );
  const axes = (
    <>
      <CartesianGrid
        strokeDasharray="3 3"
        vertical={widget.kind === 'chart'}
        horizontal={widget.kind !== 'chart'}
        stroke="var(--md-border)"
      />
      {widget.kind === 'chart' ? (
        <>
          <XAxis
            type="number"
            allowDecimals={result.unit !== 'count'}
            tickFormatter={(v) => compact(v, result.unit)}
            tick={{ fill: 'var(--md-muted)' }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={axisWidth}
            interval={0}
            tick={<CategoryTick width={axisWidth} />}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey="label"
            interval={widget.kind === 'line' ? 'preserveStartEnd' : 0}
            minTickGap={24}
            height={46}
            tick={{ fontSize: 11, fill: 'var(--md-muted)' }}
            tickFormatter={(v) => (String(v).length > 13 ? String(v).slice(0, 12) + '…' : v)}
          />
          <YAxis
            width={65}
            allowDecimals={result.unit !== 'count'}
            tickFormatter={(v) => compact(v, result.unit)}
            tick={{ fill: 'var(--md-muted)' }}
          />
        </>
      )}
      {tooltip}
    </>
  );
  return (
    <>
      {titles && (
        <div className="md-series-key">
          <span>
            <i />
            {titles[0]}
          </span>
          <span>
            <i />
            {titles[1]}
          </span>
        </div>
      )}
      <div
        className={`md-chart ${isDonut ? 'md-donut-chart' : ''}`}
        ref={ref}
        role="img"
        aria-label={`${widget.title}. ${rows.map((row) => `${row.label}: ${formatMetric(row.value, result.unit)}${titles ? '; ' + titles[1] + ': ' + formatMetric(row.comparison, result.unit) : ''}`).join('; ')}`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          {isDonut ? (
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius="48%"
                outerRadius="80%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {slices.map((row, i) => (
                  <Cell key={row.label} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatMetric(v, result.unit)}
                contentStyle={{ background: 'var(--md-surface)', borderColor: 'var(--md-border)' }}
              />
            </PieChart>
          ) : widget.kind === 'line' ? (
            <LineChart {...chartProps}>
              {axes}
              <Line
                dataKey="value"
                type="linear"
                stroke="var(--md-accent)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              {comparison && (
                <Line
                  dataKey="comparison"
                  type="linear"
                  stroke="var(--md-compare)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          ) : (
            <BarChart {...chartProps} layout={widget.kind === 'chart' ? 'vertical' : 'horizontal'}>
              {axes}
              <Bar
                dataKey="value"
                fill="var(--md-accent)"
                radius={widget.kind === 'chart' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={32}
                isAnimationActive={false}
              />
              {comparison && (
                <Bar
                  dataKey="comparison"
                  fill="var(--md-compare)"
                  radius={widget.kind === 'chart' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      {isDonut ? (
        <ul className="md-donut-key">
          {slices.map((row, i) => (
            <li key={row.label}>
              <i style={{ background: colors[i] }} />
              <span>{row.label}</span>
              <strong>
                {formatMetric(row.value, result.unit)} ·{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'percent',
                  maximumFractionDigits: 1,
                }).format(row.value / slices.reduce((sum, r) => sum + r.value, 0))}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        visible.length < rows.length && (
          <p className="md-chart-note">
            Exibindo {visible.length} de {rows.length} categorias para manter a leitura. Amplie ou
            consulte a tabela completa.
          </p>
        )
      )}
      {comparison && (
        <p className="md-chart-note">
          Categorias por nome exato; ausências permanecem indisponíveis. As séries não são somadas.
        </p>
      )}
      {!comparison && rows.some((row) => row.value == null) && (
        <p className="md-chart-note">
          Valores indisponíveis não são representados como zero. Confira a tabela completa.
        </p>
      )}
    </>
  );
});
