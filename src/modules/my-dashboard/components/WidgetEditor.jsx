import React, { useId, useState } from 'react';
import { localId } from '../../../shared/data/localId.js';
import { dashboardMetric, dashboardModules } from '../domain/catalog.js';
import { dashboardFilterOptions, dashboardPeriods, dateRange } from '../domain/evaluate.js';
import { validateDashboardDocument } from '../domain/layout.js';
import { DashboardDialog } from './DashboardDialog.jsx';

export const kindLabels = { card: 'Cartão', chart: 'Gráfico de barras', table: 'Tabela' };
export const sizeLabels = { small: 'Pequeno', medium: 'Médio', wide: 'Largura total' };
function SelectFilter({ label, value = '', options, onChange, empty = 'Todos' }) {
  const list = options.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item,
  );
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{empty}</option>
        {value && !list.some((item) => item.value === value) && (
          <option value={value}>{value} (indisponível na fonte atual)</option>
        )}
        {list.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function WidgetEditor({ metricId, widget, sources, user, onClose, onApply }) {
  const metric = dashboardMetric(widget?.metric || metricId),
    prefix = useId();
  const [draft, setDraft] = useState(
      () =>
        widget || {
          id: localId(),
          metric: metric.id,
          title: metric.label,
          kind: metric.kinds[0],
          size: metric.kinds.includes('chart') ? 'medium' : 'small',
          filters: {},
        },
    ),
    [error, setError] = useState('');
  const { module } = metric,
    options = dashboardFilterOptions(module, sources, user),
    filters = draft.filters;
  const filter = (key, value) =>
    setDraft((old) => ({ ...old, filters: { ...old.filters, [key]: value } }));
  const textFilter = (key, label, values) => (
    <label>
      {label}
      <input
        value={filters[key] || ''}
        maxLength={160}
        onChange={(e) => filter(key, e.target.value)}
        placeholder="Todos"
        list={`${prefix}-${key}`}
      />
      <datalist id={`${prefix}-${key}`}>
        {(values || []).map((value) => (
          <option value={value} key={value} />
        ))}
      </datalist>
    </label>
  );
  function submit(event) {
    event.preventDefault();
    try {
      validateDashboardDocument({
        version: 1,
        revision: 0,
        dashboards: [{ id: 'check', name: 'check', widgets: [draft] }],
      });
      onApply({ ...draft, title: draft.title.trim() || metric.label });
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <DashboardDialog
      title={widget ? 'Editar bloco' : 'Adicionar bloco'}
      onClose={onClose}
      className="md-editor"
    >
      <form onSubmit={submit}>
        <p className="md-editor-source">
          {dashboardModules[module].label} <span>→</span> {metric.label}
        </p>
        <label>
          Título do bloco
          <input
            autoFocus
            value={draft.title}
            maxLength={100}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <div className="md-form-grid">
          <label>
            Apresentação
            <select
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            >
              {metric.kinds.map((key) => (
                <option key={key} value={key}>
                  {kindLabels[key]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tamanho
            <select
              value={draft.size}
              onChange={(e) => setDraft({ ...draft, size: e.target.value })}
            >
              {Object.entries(sizeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="md-height-field">
          Altura do bloco (px; vazio = automática)
          <input
            type="number"
            min="320"
            max="960"
            step="20"
            value={draft.height ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setDraft((old) => {
                const { height, ...rest } = old;
                return value === '' ? rest : { ...rest, height: Number(value) };
              });
            }}
          />
        </label>
        <fieldset>
          <legend>Recorte deste bloco</legend>
          <div className="md-form-grid">
            {['orders', 'park', 'logistics'].includes(module) && (
              <>
                <label>
                  De
                  <input
                    type="date"
                    value={filters.start || ''}
                    onChange={(e) => filter('start', e.target.value)}
                  />
                </label>
                <label>
                  Até
                  <input
                    type="date"
                    value={filters.end || ''}
                    onChange={(e) => filter('end', e.target.value)}
                  />
                </label>
              </>
            )}
            {['orders', 'park', 'operational'].includes(module) &&
              textFilter('client', 'Cliente (nome exato)', options.clients)}
            {module === 'orders' && metric.key === 'clients' && (
              <label>
                Agrupamento de clientes
                <select
                  value={filters.grouping || 'consolidated'}
                  onChange={(e) => filter('grouping', e.target.value)}
                >
                  <option value="consolidated">Consolidado + razões sociais idênticas</option>
                  <option value="explicit">Somente consolidação explícita</option>
                  <option value="branch">Filial / CNPJ completo</option>
                </select>
              </label>
            )}
            {['park', 'operational'].includes(module) &&
              textFilter('model', 'Modelo (nome exato)', options.models)}
            {module === 'zoho' && (
              <SelectFilter
                label="Agente"
                value={filters.agent}
                options={options.agents || []}
                onChange={(value) => filter('agent', value)}
                empty="Eduardo e Jean"
              />
            )}
            {module === 'consumption' && (
              <>
                <SelectFilter
                  label="Operadora"
                  value={filters.operator}
                  options={options.operators || []}
                  onChange={(value) =>
                    setDraft((old) => ({
                      ...old,
                      filters: { ...old.filters, operator: value, period: '' },
                    }))
                  }
                />
                <SelectFilter
                  label="Apuração"
                  value={filters.period}
                  options={dashboardPeriods(sources, filters.operator).map((row) => ({
                    value: row.key,
                    label: dateRange(row.start, row.end),
                  }))}
                  onChange={(value) => filter('period', value)}
                  empty="Mais recente por operadora"
                />
              </>
            )}
            {module === 'monitoring' && (
              <>
                <SelectFilter
                  label="Base"
                  value={filters.base}
                  options={options.bases || []}
                  onChange={(value) => filter('base', value)}
                />
                <label>
                  Limite de comunicação
                  <select
                    value={filters.threshold || 48}
                    onChange={(e) => filter('threshold', Number(e.target.value))}
                  >
                    {[48, 72, 96].map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} horas
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>
          {module === 'zoho' && (
            <p className="md-muted">
              Usa o período da última coleta concluída do Zoho. Para mudar o período, faça outra
              leitura na seção Zoho das OS. Fechamentos e tempo apontado mantêm os critérios
              próprios de cada indicador.
            </p>
          )}
          {module === 'operational' && (
            <p className="md-muted">
              Retrato da base operacional carregada; não possui série histórica.
            </p>
          )}
          {module === 'consumption' && (
            <p className="md-muted">
              Uma apuração por operadora. Escolha uma operadora para fixar a apuração.
            </p>
          )}
          {module === 'park' && (
            <p className="md-muted">
              O período recorta os eventos das OS vinculadas ao parque atual.
            </p>
          )}
        </fieldset>
        {error && (
          <p className="md-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="md-primary">
            {widget ? 'Aplicar alterações' : 'Adicionar ao painel'}
          </button>
        </footer>
      </form>
    </DashboardDialog>
  );
}
