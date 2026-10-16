/** Controles de período, categorias, busca e visibilidade. Seleção analítica permanece nas funções de domínio. */
import React from 'react';
import { PagePersonalization } from '../../../components/ReportControls.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { periodOptions } from '../domain/lineConsumption.js';
import { filterChips, filterDisplay } from '../../../shared/filters/scopedSelection.js';
export function ConsumptionFiltersPanel({
  scope,
  selectedCount,
  actions,
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
  const labels = Object.fromEntries(fields);
  Object.assign(labels, {
    periods: 'Apurações',
    minimumMB: 'Consumo acima de MB',
    consumption: 'Consumo',
  });
  const chips = filterChips(filters, {
    labels,
    format: (value, key) =>
      key === 'periods'
        ? Object.entries(value)
            .map(
              ([operator, period]) =>
                `${operator}: ${periodOptions(statements, operator).find((option) => option.key === period)?.label || period}`,
            )
            .join('; ')
        : key === 'consumption'
          ? { positive: 'Com tráfego', zero: 'Consumo zero', attention: 'Acima da referência' }[
              value
            ] || value
          : filterDisplay(value),
    remove: (key) => {
      setFilters((previous) => ({
        ...previous,
        [key]: key === 'periods' ? {} : fields.some(([field]) => field === key) ? [] : '',
      }));
      setDetail(null);
    },
  });
  if (search)
    chips.push({
      key: 'search',
      label: 'Busca',
      value: search,
      remove: () => {
        setSearch('');
        setDetail(null);
      },
    });
  return (
    <PagePersonalization
      scope={scope}
      chips={chips}
      matched={selectedCount}
      onClear={() => {
        setFilters({});
        setSearch('');
        setDetail(null);
      }}
      actions={actions}
      help="Filtros, busca e apurações afetam somente esta categoria. Uma apuração por operadora, sem somar períodos sobrepostos. A média de investigação usa todas as linhas válidas da operadora na apuração, antes dos filtros; seu multiplicador é configuração compartilhada. A linha do tempo individual usa todo o histórico do chip, independentemente do recorte da grade. Arquivos e backups representam o histórico armazenado, sem ser apagados pelos filtros."
      source={
        operators.length
          ? operators
              .map(
                (operator) =>
                  `${operator}: ${periodOptions(statements, operator).find((period) => period.key === periods[operator])?.label || 'Sem apuração'}`,
              )
              .join(' · ')
          : 'Nenhuma apuração carregada'
      }
    >
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
            aria-label="Consumo"
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
          Referência compartilhada · destacar acima de{' '}
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
    </PagePersonalization>
  );
}
