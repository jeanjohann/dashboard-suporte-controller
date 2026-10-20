import React from 'react';
import { DashboardDialog } from './DashboardDialog.jsx';
import { dashboardModules, canUseDashboardModule } from '../domain/catalog.js';
import { dashboardTemplates, templateMetrics, createTemplate } from '../domain/templates.js';
import { timestampLabel } from '../domain/evaluate.js';
import { localId } from '../../../shared/data/localId.js';

export function DashboardTemplates({ user, onSelect, onClose }) {
  return (
    <DashboardDialog title="Começar com um modelo" onClose={onClose}>
      <p>
        Cria um novo painel editável com os indicadores permitidos para você. Carregue as fontes nos
        módulos para preencher os valores.
      </p>
      <div className="md-template-list">
        {dashboardTemplates.map((template) => {
          const metrics = templateMetrics(template, user);
          return metrics.length ? (
            <button
              type="button"
              key={template.id}
              onClick={() => onSelect(createTemplate(template, user, localId))}
            >
              <strong>{template.name}</strong>
              <span>{template.note}</span>
              <small>{metrics.length} indicadores disponíveis</small>
            </button>
          ) : null;
        })}
      </div>
    </DashboardDialog>
  );
}
export function DashboardSources({ sources, user, onPage, onClose }) {
  return (
    <DashboardDialog title="Fontes do painel" onClose={onClose}>
      <p>
        As fontes são carregadas na sessão. Abrir um módulo permite conferir ou atualizar a base;
        esta janela não dispara consultas.
      </p>
      <ul className="md-source-list">
        {Object.entries(dashboardModules)
          .filter(([key]) => canUseDashboardModule(user, key))
          .map(([key, module]) => {
            const entry = sources[key === 'park' ? 'operational' : key];
            const missing = key === 'park' && !sources.orders?.value;
            return (
              <li key={key}>
                <div>
                  <strong>{module.label}</strong>
                  <p>
                    {!entry?.value
                      ? 'Fonte não carregada'
                      : missing
                        ? 'Operacional carregada · faltam as OS'
                        : entry.value.error
                          ? 'Base carregada com aviso · confira o módulo'
                          : 'Carregada na sessão'}
                  </p>
                  {entry?.value && (
                    <small>
                      {entry.value.filename || module.label} · {timestampLabel(entry.loadedAt)}{' '}
                      (Brasília)
                    </small>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPage(module.page);
                  }}
                >
                  Abrir módulo ↗
                </button>
              </li>
            );
          })}
      </ul>
    </DashboardDialog>
  );
}
export function DashboardFilters({ filters = {}, onChange, disabled, widgets }) {
  const inherited = widgets.filter(
    (w) =>
      w.inheritFilters ||
      w.companions?.some((p) => p.inheritFilters) ||
      w.comparison?.inheritFilters,
  ).length;
  return (
    <details className="md-panel-filters">
      <summary>
        Recorte do painel · {inherited} bloco(s) vinculado(s)
        {filters.start || filters.end || filters.client ? ' · filtros ativos' : ''}
      </summary>
      <div className="md-panel-filter-fields">
        <label>
          De
          <input
            type="date"
            value={filters.start || ''}
            disabled={disabled}
            onChange={(e) => onChange({ ...filters, start: e.target.value })}
          />
        </label>
        <label>
          Até
          <input
            type="date"
            value={filters.end || ''}
            disabled={disabled}
            onChange={(e) => onChange({ ...filters, end: e.target.value })}
          />
        </label>
        <label>
          Cliente (nome exato)
          <input
            value={filters.client || ''}
            maxLength={160}
            disabled={disabled}
            placeholder="Todos"
            onChange={(e) => onChange({ ...filters, client: e.target.value })}
          />
        </label>
        <button type="button" disabled={disabled} onClick={() => onChange({})}>
          Limpar recorte
        </button>
      </div>
      <p>
        Aplicado apenas aos indicadores marcados para usar o recorte do painel. Datas: OS, eventos
        do Parque e Logística. Cliente: OS, Operacional e Parque. Zoho, Consumo e Monitoramento
        mantêm seus períodos próprios. Os filtros dos outros módulos são preservados.
      </p>
    </details>
  );
}
