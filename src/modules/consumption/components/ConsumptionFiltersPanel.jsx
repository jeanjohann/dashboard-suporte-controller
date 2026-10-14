/** Controles de período, categorias, busca e visibilidade. Seleção analítica permanece nas funções de domínio. */
import React from 'react';
import { PagePersonalization } from '../../../components/ReportControls.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { periodOptions } from '../domain/lineConsumption.js';
export function ConsumptionFiltersPanel({
  visibleSections,
  hiddenSections,
  setHiddenSections,
  operators,
  periods,
  statements,
  fields,
  allRows,
  filters,
  filter,
  archive,
  busy,
  ready,
  commit,
  search,
  setSearch,
  setDetail,
  setFilters,
}) {
  return (
    <PagePersonalization
      labels={visibleSections}
      hidden={hiddenSections}
      setHidden={setHiddenSections}
    >
      <h3>Filtros de consumo</h3>
      <div className="filter-grid">
        {operators.map((operator) => (
          <label key={operator}>
            Apuração · {operator}
            <select
              value={periods[operator]}
              onChange={(event) =>
                filter('periods', { ...periods, [operator]: event.target.value })
              }
            >
              {periodOptions(statements, operator).map((period) => (
                <option key={period.key} value={period.key}>
                  {period.label} · {period.days} dias
                </option>
              ))}
            </select>
          </label>
        ))}
        {fields.map(([key, label]) => (
          <MultiFilter
            key={key}
            label={label}
            options={[
              ...new Set(
                allRows
                  .filter((row) => row.service === 'dados')
                  .map((row) => row[key] || 'Não informado'),
              ),
            ].sort((a, b) => a.localeCompare(b, 'pt-BR'))}
            values={filters[key] || []}
            onChange={(value) => filter(key, value)}
          />
        ))}
        <label>
          Consumo acima de (MB)
          <input
            type="number"
            min="0"
            step="0.000001"
            value={filters.minimumMB || ''}
            placeholder="Sem limite"
            onChange={(event) => filter('minimumMB', event.target.value)}
          />
        </label>
        <label>
          Consumo
          <select
            value={filters.consumption || ''}
            onChange={(event) => filter('consumption', event.target.value)}
          >
            <option value="">Todos</option>
            <option value="positive">Com tráfego</option>
            <option value="zero">Consumo zero</option>
            <option value="attention">Acima da referência de investigação</option>
          </select>
        </label>
        <label>
          Destacar acima de{' '}
          <input
            type="number"
            min="1"
            max="100"
            step="0.5"
            value={archive.settings.factor}
            disabled={busy || !ready}
            onChange={(event) => {
              const factor = Number(event.target.value);
              if (Number.isFinite(factor) && factor >= 1 && factor <= 100)
                commit(
                  { ...archive, settings: { ...archive.settings, factor } },
                  'Referência de investigação salva.',
                ).catch(() => {});
            }}
          />
          <small>
            × a média geral da operadora no período, incluindo zeros. Padrão inicial: 2×; ajustável.
          </small>
        </label>
      </div>
      <label className="consumption-search">
        Buscar número, ICCID, cliente, ID, placa ou plano
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setDetail(null);
          }}
          placeholder="Digite para buscar…"
        />
      </label>
      <button
        onClick={() => {
          setFilters({});
          setSearch('');
          setDetail(null);
        }}
      >
        Limpar filtros
      </button>
      <InfoNote>
        Uma apuração por operadora. Os períodos são preservados; MB por dia ajuda a comparar
        durações diferentes. A média de investigação usa todas as linhas válidas da operadora nessa
        apuração, antes da busca e dos filtros de cliente.
      </InfoNote>
    </PagePersonalization>
  );
}
