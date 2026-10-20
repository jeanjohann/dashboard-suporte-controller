import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardMetric, dashboardModules } from '../domain/catalog.js';
import { evaluateDashboardWidget, formatMetric, timestampLabel } from '../domain/evaluate.js';
import { sizeLabels } from './WidgetEditor.jsx';

function ValuesTable({ rows, unit }) {
  const [page, setPage] = useState(0),
    last = Math.max(0, Math.ceil(rows.length / 10) - 1),
    current = Math.min(page, last);
  return (
    <>
      <div className="md-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Informação</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(current * 10, current * 10 + 10).map((row, index) => (
              <tr key={`${row.label}:${index}`}>
                <th scope="row">{row.label}</th>
                <td>{formatMetric(row.value, unit)}</td>
              </tr>
            ))}
          </tbody>
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
function WidgetValue({ widget, result }) {
  if (widget.kind === 'card')
    return <div className="md-widget-value">{formatMetric(result.value, result.unit)}</div>;
  const rows = result.series || [{ label: widget.title, value: result.value }];
  if (!rows.length)
    return <p className="md-widget-empty">Nenhum registro corresponde a este recorte.</p>;
  if (widget.kind === 'table') return <ValuesTable rows={rows} unit={result.unit} />;
  const visible = rows.slice(0, 20);
  return (
    <>
      <div
        className="md-chart"
        role="img"
        aria-label={`${widget.title}. ${visible.map((row) => `${row.label}: ${formatMetric(row.value, result.unit)}`).join('; ')}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visible}
            layout="vertical"
            margin={{ top: 8, right: 20, bottom: 8, left: 5 }}
            accessibilityLayer
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tickFormatter={(value) => formatMetric(value, result.unit)}
            />
            <YAxis type="category" dataKey="label" width={115} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [formatMetric(value, result.unit), widget.title]}
              cursor={{ fill: 'var(--md-soft)' }}
            />
            <Bar dataKey="value" fill="var(--md-accent)" radius={[0, 4, 4, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {rows.length > 20 && (
        <p className="md-muted">
          Primeiros 20 de {rows.length} itens. Edite para usar a tabela e conferir todos.
        </p>
      )}
      {rows.some((row) => row.value == null) && (
        <p className="md-muted">Valores indisponíveis não são representados como zero.</p>
      )}
    </>
  );
}
export function DashboardWidget({
  widget,
  index,
  total,
  sources,
  user,
  onEdit,
  onRemove,
  onMove,
  onResize,
  onPage,
}) {
  const metric = dashboardMetric(widget.metric);
  const result = useMemo(
    () => evaluateDashboardWidget(widget, sources, user),
    [widget, sources, user],
  );
  const restricted = result.status === 'restricted';
  return (
    <article
      className={`md-widget md-size-${widget.size} md-module-${metric?.module}`}
      aria-label={restricted ? 'Indicador sem acesso' : widget.title}
    >
      <header>
        <div>
          <span className="md-source-tag">
            {restricted ? 'Acesso indisponível' : dashboardModules[metric.module].label}
          </span>
          <h2>{restricted ? 'Indicador sem acesso' : widget.title}</h2>
        </div>
        <div className="md-widget-actions">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={!index}
            aria-label={`Mover ${widget.title} para antes`}
            title="Mover para antes"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Mover ${widget.title} para depois`}
            title="Mover para depois"
          >
            →
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={restricted}
            aria-label={`Editar ${widget.title}`}
            title="Editar bloco"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${widget.title}`}
            title="Remover bloco"
          >
            ✕
          </button>
        </div>
      </header>
      {result.status === 'ready' ? (
        <>
          {result.demonstration && <p className="md-demo">Demonstração · dados fictícios</p>}
          <WidgetValue widget={widget} result={result} />
          <div className="md-widget-meta">
            {result.scope && (
              <p>
                <strong>Recorte:</strong> {result.scope}
              </p>
            )}
            <p>
              <strong>Período:</strong> {result.period}
            </p>
            <p>
              <strong>Fonte:</strong> {result.source}
            </p>
            <p>
              <strong>{result.updateLabel}:</strong>{' '}
              {result.collectionLabel || timestampLabel(result.updatedAt)}
              {!result.collectionLabel ? ' (Brasília)' : ''}
            </p>
            <details>
              <summary>Critérios do indicador</summary>
              <p>{result.note}</p>
            </details>
          </div>
        </>
      ) : (
        <div className="md-widget-empty">
          <p>{result.message}</p>
        </div>
      )}
      <footer>
        <label>
          <span className="sr-only">Tamanho de {widget.title}</span>
          <select
            aria-label={`Tamanho de ${widget.title}`}
            value={widget.size}
            onChange={(e) => onResize(e.target.value)}
          >
            {Object.entries(sizeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {result.page && (
          <button type="button" className="md-source-link" onClick={() => onPage(result.page)}>
            Abrir módulo ↗
          </button>
        )}
      </footer>
    </article>
  );
}
