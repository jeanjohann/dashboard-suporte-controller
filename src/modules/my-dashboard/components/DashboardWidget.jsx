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
          <tbody className="md-screen-rows">
            {rows.slice(current * 10, current * 10 + 10).map((row, index) => (
              <tr key={`${row.label}:${index}`}>
                <th scope="row">{row.label}</th>
                <td>{formatMetric(row.value, unit)}</td>
              </tr>
            ))}
          </tbody>
          <tbody className="md-print-rows">
            {rows.map((row, index) => (
              <tr key={index}>
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
  organizing = false,
  disabled = false,
  onDuplicate,
  onGesture,
  preview,
}) {
  const metric = dashboardMetric(widget.metric);
  const result = useMemo(
    () => evaluateDashboardWidget(widget, sources, user),
    [widget, sources, user],
  );
  const restricted = result.status === 'restricted';
  const dimensions = preview?.kind === 'resize' && preview.id === widget.id ? preview : widget;
  const target = preview?.target === widget.id && preview.id !== widget.id;
  return (
    <article
      className={`md-widget md-size-${dimensions.size} md-module-${metric?.module} ${target ? (preview.after ? 'md-drop-after' : 'md-drop-before') : ''} ${preview?.id === widget.id ? 'md-gesture-active' : ''}`}
      data-widget-id={widget.id}
      style={dimensions.height ? { height: dimensions.height } : undefined}
      aria-label={restricted ? 'Indicador sem acesso' : widget.title}
    >
      <header>
        <div>
          <span className="md-source-tag">
            {restricted ? 'Acesso indisponível' : dashboardModules[metric.module].label}
          </span>
          <h2>{restricted ? 'Indicador sem acesso' : widget.title}</h2>
        </div>
        {organizing && (
          <div className="md-widget-actions">
            <button
              type="button"
              className="md-drag-handle"
              disabled={disabled}
              aria-label={`Arrastar ${widget.title}`}
              title="Arrastar; setas do teclado também movem"
              onPointerDown={(e) => onGesture(e, 'move')}
              onKeyDown={(e) => {
                if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault();
                  onMove(['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1);
                }
              }}
            >
              ⠿
            </button>
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={disabled || !index}
              aria-label={`Mover ${widget.title} para antes`}
              title="Mover para antes"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={disabled || index === total - 1}
              aria-label={`Mover ${widget.title} para depois`}
              title="Mover para depois"
            >
              →
            </button>
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled || restricted}
              aria-label={`Editar ${widget.title}`}
              title="Editar bloco"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              disabled={disabled || restricted || total >= 40}
              aria-label={`Duplicar ${widget.title}`}
              title="Duplicar bloco"
            >
              ⧉
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label={`Remover ${widget.title}`}
              title="Remover bloco"
            >
              ✕
            </button>
          </div>
        )}
      </header>
      <div className="md-widget-content">
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
      </div>
      <footer>
        {organizing && (
          <label>
            <span className="sr-only">Tamanho de {widget.title}</span>
            <select
              aria-label={`Tamanho de ${widget.title}`}
              value={widget.size}
              onChange={(e) => onResize(e.target.value)}
              disabled={disabled}
            >
              {Object.entries(sizeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        {result.page && (
          <button type="button" className="md-source-link" onClick={() => onPage(result.page)}>
            Abrir módulo ↗
          </button>
        )}
        {organizing && (
          <button
            type="button"
            className="md-resize-handle"
            disabled={disabled}
            onPointerDown={(e) => onGesture(e, 'resize')}
            onClick={(e) => {
              if (e.detail === 0) onEdit();
            }}
            aria-label={`Redimensionar ${widget.title}`}
            title="Arraste para ajustar largura e altura; Enter abre o editor"
          >
            ◢
          </button>
        )}
      </footer>
    </article>
  );
}
