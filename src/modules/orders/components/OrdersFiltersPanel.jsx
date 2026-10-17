/** Período, campos, seleções e origem reunidos no quadro da categoria atual de OS. */
import React from 'react';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { PeriodFilter } from '../../../components/PeriodFilter.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { ReportControls } from '../../../components/ReportControls.jsx';
import { FilterPanel } from '../../../components/FilterPanel.jsx';
import { filterChips } from '../../../shared/filters/scopedSelection.js';
import { filterFields, filterLabels } from '../../../shared/data/filters.js';
import { supportPeriod } from '../domain/supportPerformance.js';
import { todaySaoPaulo } from '../domain/lifecycle.js';

export function OrdersFiltersPanel({
  data,
  filename,
  scope,
  showWeekShortcuts = false,
  search,
  selected,
  importedPeriod,
  filters,
  setFilters,
  changeFilter,
  extraColumns,
  setExtraColumns,
  setSearch,
  setPage,
  setExpansion,
}) {
  const labels = { ...filterLabels, start: 'De', end: 'Até' };
  const shortcuts = showWeekShortcuts
    ? [
        ['currentWeek', 'Semana atual'],
        ['previousWeek', 'Semana anterior'],
      ].map(([preset, label]) => {
        const range = supportPeriod(preset, todaySaoPaulo());
        return {
          label,
          active: filters.start === range.start && filters.end === range.end,
          onSelect: () => {
            const currentRange = supportPeriod(preset, todaySaoPaulo());
            setFilters((previous) => ({ ...previous, ...currentRange }));
            setPage(0);
          },
        };
      })
    : [];
  data.columns.forEach((col) => {
    labels[`column:${col.index}`] = `${col.letter} · ${col.label}`;
  });
  const chips = filterChips(filters, {
    labels,
    remove: (key) => changeFilter(key, key === 'start' || key === 'end' ? '' : []),
  });
  if (search)
    chips.push({
      key: 'record-search',
      label: 'Busca na tabela',
      value: search,
      remove: () => {
        setSearch('');
        setPage(0);
      },
    });
  return (
    <FilterPanel
      scope={scope}
      period={
        <PeriodFilter
          start={filters.start}
          end={filters.end}
          earliest={importedPeriod.start}
          onChange={changeFilter}
          shortcuts={shortcuts}
        />
      }
      chips={chips}
      matched={selected.rows.length}
      total={data.rows.length}
      onClear={() => {
        setFilters({});
        setSearch('');
        setPage(0);
      }}
      actions={<ReportControls onExpand={setExpansion} />}
      help="Os filtros afetam somente os relatórios desta categoria. Outra categoria mantém sua própria seleção. No mesmo campo, qualquer opção marcada é aceita; entre campos, a linha precisa atender a todos. Período usa Data de atendimento, exceto agendamentos por responsável, que usam Agendamento. Suporte por execução e por agendamento consulta colunas distintas. Na vida em campo, o modo da seção define se o recorte seleciona instalações ou trocas. Sem período, registros sem data permanecem; com limite, são excluídos e contados. A busca textual é somente da tabela. Exportações e impressão seguem o contexto da categoria. Na Visão geral, os atalhos semanais usam segunda a domingo no calendário de São Paulo; os cards de agenda aberta continuam sem recorte temporal, conforme o aviso junto a eles."
      notice={
        (selected.missingDates > 0 || selected.invalidPeriod) && (
          <>
            {selected.missingDates > 0 && (
              <span>
                {selected.missingDates} registros que atendem aos demais filtros foram excluídos do
                período por data ausente ou inválida.
              </span>
            )}
            {selected.invalidPeriod && (
              <div role="alert" className="error">
                A data inicial deve ser anterior ou igual à data final.
              </div>
            )}
          </>
        )
      }
      source={
        <div className="source">
          <span className="dot" />
          <strong>{filename}</strong>
          <span>Aba {data.sheetName || 'OS 2025'}</span>
          <span>Somente leitura</span>
        </div>
      }
    >
      <div className="filter-grid">
        {filterFields.map((label) => {
          const index = data.columns.findIndex((col) => col.label === label);
          const options =
            index < 0
              ? []
              : [
                  ...new Set(
                    data.rows.map((row) => String(row.cells[index]?.raw ?? '')).filter(Boolean),
                  ),
                ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
          return (
            <MultiFilter
              key={label}
              label={filterLabels[label] || label}
              options={options}
              disabled={index < 0}
              values={filters[label] || []}
              onChange={(values) => changeFilter(label, values)}
            />
          );
        })}
      </div>
      <details className="extra-filters">
        <summary className="inline-help-heading">
          <span>Filtros adicionais da planilha</span>
          <InfoNote>
            Seleção exata pelo conteúdo exibido, incluindo Sem dados. Datas e valores adicionais não
            são intervalos. Remover a coluna limpa somente esse filtro desta categoria.
          </InfoNote>
        </summary>
        <label>
          Adicionar coluna{' '}
          <select
            value=""
            onChange={(event) => {
              if (event.target.value !== '')
                setExtraColumns((previous) => [...previous, Number(event.target.value)]);
            }}
          >
            <option value="">Escolha uma coluna…</option>
            {data.columns
              .filter(
                (col) => !filterFields.includes(col.label) && !extraColumns.includes(col.index),
              )
              .map((col) => (
                <option key={col.index} value={col.index}>
                  {col.letter} · {col.label}
                </option>
              ))}
          </select>
        </label>
        <div className="filter-grid">
          {extraColumns.map((index) => {
            const position = data.columns.findIndex((col) => col.index === index),
              col = data.columns[position];
            if (!col) return null;
            const key = `column:${index}`;
            const options = [
              ...new Set(data.rows.map((row) => String(row.cells[position]?.display ?? ''))),
            ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
            return (
              <div key={index}>
                <MultiFilter
                  label={`${col.letter} · ${col.label}`}
                  options={options}
                  values={filters[key] || []}
                  onChange={(values) => changeFilter(key, values)}
                />
                <button
                  className="remove-column-filter"
                  onClick={() => {
                    setExtraColumns((previous) => previous.filter((value) => value !== index));
                    changeFilter(key, []);
                  }}
                >
                  Remover filtro
                </button>
              </div>
            );
          })}
        </div>
      </details>
    </FilterPanel>
  );
}
