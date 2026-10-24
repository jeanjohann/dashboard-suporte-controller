import React, { useMemo, useState } from 'react';
import { dashboardMetric, dashboardModules } from '../domain/catalog.js';
import { timestampLabel, formatMetric } from '../domain/evaluate.js';
import { effectiveWidget, sizeLabels } from '../domain/presentation.js';
import { WidgetVisualization } from './WidgetVisualization.jsx';
import { DashboardDialog } from './DashboardDialog.jsx';
import { usePrintMode } from '../../../shared/charts/usePrintMode.js';
import { dashboardSourcesForWidget, evaluateCachedWidget } from '../domain/evaluationCache.js';

export function WidgetContext({ result, title }) {
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditPage, setAuditPage] = useState(0);
  const printing = usePrintMode();
  const auditLast = Math.max(0, Math.ceil((result.queryAudit?.length || 0) / 25) - 1);
  const current = Math.min(auditPage, auditLast);
  return (
    <div className="md-widget-meta">
      {title && <strong>{title}</strong>}
      {result.scope && (
        <p>
          <strong>Recorte:</strong> {result.scope}
        </p>
      )}
      <p>
        <strong>Período:</strong> {result.period}
      </p>
      <details>
        <summary>Fonte e critérios</summary>
        <p>
          <strong>Fonte:</strong> {result.source}
        </p>
        <p>
          <strong>{result.updateLabel}:</strong>{' '}
          {result.collectionLabel || timestampLabel(result.updatedAt)}
          {!result.collectionLabel ? ' (Brasília)' : ''}
        </p>
        <p>{result.note}</p>
        {result.queryAudit && (
          <details
            onToggle={(event) => {
              if (event.target === event.currentTarget) setAuditOpen(event.currentTarget.open);
            }}
          >
            <summary>Conferir cálculo e linhas de origem</summary>
            {(auditOpen || printing) && (
              <>
                <div className="md-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Grupo</th>
                        <th>Valor</th>
                        <th>Válidos / excluídos da medida</th>
                        <th>Linhas Excel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(printing
                        ? result.queryAudit
                        : result.queryAudit.slice(current * 25, current * 25 + 25)
                      ).map((item) => (
                        <tr key={item.label}>
                          <th>{item.label}</th>
                          <td>{formatMetric(item.value, result.unit)}</td>
                          <td>
                            {item.valid} / {item.excluded}
                          </td>
                          <td>{item.rows.join(', ') || 'Nenhuma'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {auditLast > 0 && !printing && (
                  <div className="md-pagination">
                    <button disabled={!current} onClick={() => setAuditPage(current - 1)}>
                      Anterior
                    </button>
                    <span>
                      {current + 1} de {auditLast + 1} · {result.queryAudit.length} grupos
                    </span>
                    <button
                      disabled={current === auditLast}
                      onClick={() => setAuditPage(current + 1)}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </details>
        )}
      </details>
    </div>
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
  boardFilters,
}) {
  const metric = dashboardMetric(widget.metric);
  const relevantSources = dashboardSourcesForWidget(widget, sources);
  // Entradas estáveis: fonte não relacionada não invalida os cálculos deste bloco.
  const selectedSources = useMemo(() => relevantSources, Object.values(relevantSources));
  const result = useMemo(
    () => evaluateCachedWidget(effectiveWidget(widget, boardFilters), selectedSources, user),
    [widget, boardFilters, selectedSources, user],
  );
  const [expanded, setExpanded] = useState(false),
    [asTable, setAsTable] = useState(false);
  const extras = useMemo(
    () =>
      (widget.companions || []).map((part) => ({
        widget: part,
        result: evaluateCachedWidget(effectiveWidget(part, boardFilters), selectedSources, user),
      })),
    [widget.companions, boardFilters, selectedSources, user],
  );
  const comparison = useMemo(
    () =>
      widget.comparison
        ? evaluateCachedWidget(
            effectiveWidget(widget.comparison, boardFilters),
            selectedSources,
            user,
          )
        : null,
    [widget.comparison, boardFilters, selectedSources, user],
  );
  const restricted = result.status === 'restricted';
  const comparisonReady = comparison?.status === 'ready' ? comparison : null;
  const showContent =
    result.status === 'ready' ||
    (widget.kind === 'card' && extras.some((item) => item.result.status === 'ready'));
  const content = (zoom = false) => (
    <>
      {result.demonstration && <p className="md-demo">Demonstração · dados fictícios</p>}
      <div
        className={
          widget.kind === 'card' && extras.length ? 'md-combined-values' : 'md-widget-visual'
        }
      >
        <div className={extras.length ? 'md-combined-item' : 'md-primary-visual'}>
          {extras.length > 0 && (
            <strong>{restricted ? 'Indicador sem acesso' : widget.title}</strong>
          )}
          <WidgetVisualization
            widget={widget}
            result={result}
            comparison={comparisonReady}
            asTable={zoom && asTable}
            expanded={zoom}
          />
          {result.status !== 'ready' && <p className="md-chart-note">{result.message}</p>}
          {extras.length > 0 && result.status === 'ready' && (
            <p className="md-chart-note">{result.period}</p>
          )}
        </div>
        {extras.map(({ widget: part, result: item }) => (
          <div className="md-combined-item" key={part.id}>
            <strong>{item.status === 'restricted' ? 'Indicador sem acesso' : part.title}</strong>
            <div className="md-widget-value">
              {item.status === 'ready' ? formatMetric(item.value, item.unit) : 'Indisponível'}
            </div>
            <p className="md-chart-note">{item.status === 'ready' ? item.period : item.message}</p>
            {item.demonstration && <span className="md-demo">Dados fictícios</span>}
          </div>
        ))}
      </div>
      {comparison && !comparisonReady && (
        <p className="md-chart-note">
          Comparação indisponível: {comparison.message}. A série principal foi preservada.
        </p>
      )}
      <div className="md-contexts">
        {result.status === 'ready' && (
          <WidgetContext
            result={result}
            title={extras.length || comparison ? widget.title : undefined}
          />
        )}
        {extras.map(({ widget: part, result: item }) =>
          item.status === 'ready' ? (
            <WidgetContext key={part.id} result={item} title={part.title} />
          ) : null,
        )}
        {comparisonReady && <WidgetContext result={comparison} title={widget.comparison.title} />}
      </div>
    </>
  );
  const dimensions = preview?.kind === 'resize' && preview.id === widget.id ? preview : widget;
  const target = preview?.target === widget.id && preview.id !== widget.id;
  return (
    <article
      className={`md-widget md-kind-${widget.kind} ${dimensions.height ? 'md-fixed-height' : ''} md-size-${dimensions.size} md-module-${metric?.module} ${target ? (preview.after ? 'md-drop-after' : 'md-drop-before') : ''} ${preview?.id === widget.id ? 'md-gesture-active' : ''}`}
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
        <div className="md-widget-header-tools">
          {showContent && (
            <button
              type="button"
              className="md-expand"
              aria-label={`Ampliar ${widget.title}`}
              title="Ampliar e conferir valores"
              onClick={() => setExpanded(true)}
            >
              ⛶
            </button>
          )}
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
        </div>
      </header>
      <div className="md-widget-content">
        {showContent ? (
          content()
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
      {expanded && showContent && (
        <DashboardDialog
          title={widget.title}
          className="md-expanded-dialog"
          onClose={() => setExpanded(false)}
        >
          {!['card', 'table'].includes(widget.kind) && (
            <div className="md-detail-actions">
              <button type="button" aria-pressed={!asTable} onClick={() => setAsTable(false)}>
                Gráfico
              </button>
              <button type="button" aria-pressed={asTable} onClick={() => setAsTable(true)}>
                Tabela completa
              </button>
            </div>
          )}
          <div className="md-expanded-content">{content(true)}</div>
          <p className="md-muted">
            Valores do recorte calculado pelo sistema. Os filtros e a organização do painel são
            preservados.
          </p>
        </DashboardDialog>
      )}
    </article>
  );
}
