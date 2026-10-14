/** Período, filtros principais/adicionais e resumo da seleção de OS. */
import React from 'react';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { PeriodFilter } from '../../../components/PeriodFilter.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { ReportControls } from '../../../components/ReportControls.jsx';
import { filterFields, filterLabels } from '../../../shared/data/filters.js';
import { OrdersReportChoices } from './OrdersReportMenu.jsx';

/** Apresenta o recorte e as ações recebidas; a base original permanece no controlador. */
export function OrdersFiltersPanel({
  data,
  filename,
  selected,
  importedPeriod,
  filters,
  setFilters,
  changeFilter,
  extraColumns,
  setExtraColumns,
  setSearch,
  setPage,
  category,
  preferences,
  setVisibility,
  layoutMessage,
  setExpansion,
}) {
  return (
    <>
      <PeriodFilter
        start={filters.start}
        end={filters.end}
        earliest={importedPeriod.start}
        onChange={changeFilter}
      />
      <details className="panel personalization compact-filters">
        <summary>Filtros da página</summary>
        <section className="panel filters">
          <div className="inline-help-heading">
            <h2>Filtros da análise</h2>
            <InfoNote label="Como os filtros da OS são aplicados">
              Filtros combinados aplicados aos indicadores, gráficos, chamados e revisão. Em um
              mesmo campo, qualquer valor selecionado é aceito; entre campos, a linha precisa
              atender a todos os filtros. Responsáveis do suporte pelo agendamento e pela execução
              são filtrados separadamente: cada seleção consulta sua própria coluna, Resp.
              Agendamento ou Resp. Execução, sem unir os dois papéis. Os relatórios de agendamentos
              por responsável usam Agendamento; os demais indicadores de OS usam Data de
              atendimento. A busca textual filtra somente a tabela. Na vida em campo, os filtros
              selecionam instalações ou eventos de troca conforme o modo escolhido na seção. O
              período acima é compartilhado por toda a análise; registros sem data válida são
              excluídos apenas quando há limite de data ativo. As contagens e exclusões continuam
              visíveis para conferência.
            </InfoNote>
          </div>
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
          <button
            onClick={() => {
              setFilters({});
              setSearch('');
              setPage(0);
            }}
          >
            Limpar filtros e busca
          </button>
          <p className="scope">
            {selected.rows.length} de {data.rows.length} registros na seleção.
          </p>
          {selected.missingDates > 0 && (
            <p className="scope">
              {selected.missingDates} registros que atendem aos filtros de categoria foram excluídos
              do período por data ausente ou inválida.
            </p>
          )}
          {selected.invalidPeriod && (
            <div role="alert" className="error">
              A data inicial deve ser anterior ou igual à data final.
            </div>
          )}
        </section>

        <details className="extra-filters">
          <summary className="inline-help-heading">
            <span>Filtros adicionais da planilha</span>{' '}
            <InfoNote>
              Seleção exata pelo conteúdo exibido. Datas e valores adicionais não são intervalos.
              Inclui opção Sem dados. Remover uma coluna também limpa sua seleção. Estes filtros
              afetam toda a análise.
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
              const position = data.columns.findIndex((col) => col.index === index);
              const col = data.columns[position];
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
                    style={{ marginTop: 8, padding: 8 }}
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
        <OrdersReportChoices
          category={category}
          preferences={preferences}
          setVisibility={setVisibility}
          layoutMessage={layoutMessage}
        />
      </details>

      <div className="active-filters">
        <strong>
          {selected.rows.length} de {data.rows.length} registros
        </strong>
        <span>
          {Object.entries(filters)
            .filter(([, value]) => (Array.isArray(value) ? value.length : value))
            .map(([key, value]) => {
              const col = key.startsWith('column:')
                ? data.columns.find((col) => col.index === Number(key.slice(7)))
                : null;
              return (
                (col
                  ? col.letter + ' · ' + col.label
                  : key === 'start'
                    ? 'De'
                    : key === 'end'
                      ? 'Até'
                      : key) +
                ': ' +
                (Array.isArray(value) ? value.map((item) => item || 'Sem dados').join(', ') : value)
              );
            })
            .join(' | ') || 'Sem filtros ativos'}
        </span>
        <div className="active-filter-actions">
          <button
            onClick={() => {
              setFilters({});
              setSearch('');
              setPage(0);
            }}
          >
            Limpar filtros
          </button>
          <ReportControls onExpand={setExpansion} />
        </div>
      </div>
      <div className="source">
        <span className="dot" /> <strong>{filename}</strong>
        <span>Aba {data.sheetName || 'OS 2025'}</span>
        <span>Somente leitura</span>
      </div>
    </>
  );
}
