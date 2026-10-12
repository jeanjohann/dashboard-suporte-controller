/**
 * Página de Ordens de Serviço: mantém filtros e apresentação, recebendo a base da sessão pelo Workspace.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { FieldLifePanel } from './FieldLifePanel.jsx';
import { ExtendedInsights } from './ExtendedInsights.jsx';
import { SortableTable, compareValues } from '../../../components/SortableTable.jsx';
import { RecordDetails, MonthlyBreakdown } from './RecordDetails.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { importWorkbook } from '../data/import.js';
import { summarize, finance } from '../domain/analysis.js';
import {
  applyFilters,
  filterFields,
  filterLabels,
  monthlyCompleted,
  attendanceExtent,
} from '../../../shared/data/filters.js';
import { BarChart } from '../../../components/BarChart.jsx';
import { PeriodFilter } from '../../../components/PeriodFilter.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { equipment } from '../domain/equipment.js';
import { Explorers } from './Explorers.jsx';
import { observedPeriods, todaySaoPaulo } from '../domain/lifecycle.js';
import { Section, PrintContext, ExpansionContext } from '../../../components/Section.jsx';
import { Technicians } from './Technicians.jsx';
import { sectionLabels, cleanPreferences } from '../config/preferences.js';
import { SummaryCards } from './SummaryCards.jsx';
import { Navigation } from '../../../app/Navigation.jsx';
import { AdvancedInsights } from './AdvancedInsights.jsx';
import { DescriptiveReport } from './DescriptiveReport.jsx';
import { ReportControls } from '../../../components/ReportControls.jsx';
import { DashboardOverview } from './DashboardOverview.jsx';
import { dashboardCategories, categoryVisibility } from '../config/dashboardCategories.js';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';

/** Coordena filtros, seleção de linhas e relatórios de OS. A base original recebida não é corrigida na interface. */
export function OrdersPage({ onPage, onImport, operational, source }) {
  const input = useRef();
  const [expansion, setExpansion] = useState(null);
  const [category, setCategory] = useState('overview');
  const [recordSort, setRecordSort] = useState(null);
  const [preferences, setVisible] = useState(() => {
    try {
      return cleanPreferences(JSON.parse(localStorage.getItem('suporte-layout-v1') || '{}'));
    } catch {
      return cleanPreferences({});
    }
  });
  const visible = categoryVisibility(preferences, category);
  const [layoutMessage, setLayoutMessage] = useState('');
  function setVisibility(next) {
    setVisible(next);
    try {
      localStorage.setItem('suporte-layout-v1', JSON.stringify(next));
      setLayoutMessage('Preferência salva neste navegador.');
    } catch {
      setLayoutMessage('Preferência aplicada só nesta sessão; não foi possível salvar.');
    }
  }
  const data = source?.data || null,
    filename = source?.filename || '';
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const [search, setSearch] = useState(''),
    [page, setPage] = useState(0),
    [view, setView] = useState('records');
  const [filters, setFilters] = useState({});
  const [extraColumns, setExtraColumns] = useState([]);
  const [referenceDate, setReferenceDate] = useState(todaySaoPaulo);
  const [cycleState, setCycleState] = useState('Todos');
  const changeFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(0);
  };
  async function load(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const result = importWorkbook(await file.arrayBuffer());
      setPage(0);
      setSearch('');
      setView('records');
      onImport({ data: result, filename: file.name });
      setFilters({});
      setExtraColumns([]);
      setRecordSort(null);
    } catch (e) {
      setError(e.message || 'Não foi possível ler o arquivo.');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }
  useEffect(() => {
    setFilters({});
    setCycleState('Todos');
    setExtraColumns([]);
    setRecordSort(null);
    setPage(0);
    setSearch('');
    setView('records');
  }, [source]);
  const importedPeriod = data ? attendanceExtent(data) : null;
  const selected = data ? applyFilters(data, filters) : null;
  const filtered =
    selected?.rows.filter(
      (row) =>
        !search ||
        row.cells.some((cell) =>
          String(cell.display)
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR')),
        ),
    ) ?? [];
  const orderedRecords = recordSort
    ? [...filtered].sort(
        (a, b) =>
          compareValues(
            recordSort.index === -1
              ? a.sourceRow
              : a.cells[recordSort.index]?.issue
                ? null
                : a.cells[recordSort.index]?.raw,
            recordSort.index === -1
              ? b.sourceRow
              : b.cells[recordSort.index]?.issue
                ? null
                : b.cells[recordSort.index]?.raw,
            recordSort.direction,
          ) || a.sourceRow - b.sourceRow,
      )
    : filtered;
  const pageCount = Math.max(1, Math.ceil(filtered.length / 50));
  const summary = selected ? summarize(selected) : null;
  const financial = selected ? finance(selected) : null;
  const monthly = selected ? monthlyCompleted(selected) : null;
  const devices = selected ? equipment(data, selected) : null;
  const lifecycle = selected ? observedPeriods(data, selected, referenceDate) : null;
  // Recorte local de apresentação: não altera os vínculos, a revisão ou outros relatórios.
  const displayedPeriods = (lifecycle?.periods ?? []).filter(
    (period) => cycleState === 'Todos' || period.state === cycleState,
  );
  const review = selected
    ? [
        ...selected.issues,
        ...(financial?.issues ?? []),
        ...(devices?.issues ?? []),
        ...(lifecycle?.review ?? []),
      ]
    : [];
  const currency = (cents) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return (
    <SidePanelProvider>
      <ExpansionContext.Provider value={expansion}>
        <PrintContext.Provider value={{ filename, filters, referenceDate }}>
          <div className="app">
            <Navigation page="orders" onPage={onPage} />
            <main>
              <header>
                <div>
                  <div className="eyebrow">CONTROLE DE SERVIÇOS</div>
                  <h1>Ordens de serviço</h1>
                  <p>Importe sua planilha e confira os atendimentos antes de analisar.</p>
                </div>
                <PermissionButton
                  action="import"
                  onClick={() => input.current.click()}
                  disabled={busy}
                >
                  {busy ? 'Lendo arquivo…' : '↑ Importar planilha'}
                </PermissionButton>
                <input ref={input} type="file" accept=".xlsx,.xls" hidden onChange={load} />
              </header>
              {error && (
                <div role="alert" className="error">
                  {error}
                  {data && ' A importação anterior continua disponível.'}
                </div>
              )}
              {!data ? (
                <section className="empty">
                  <div className="file-icon">▤</div>
                  <h2>Sua operação começa pela planilha</h2>
                  <p>
                    Selecione o Excel que contém a aba <strong>OS 2025</strong>.<br />A ordem dos
                    registros e das colunas será preservada.
                  </p>
                  <PermissionButton
                    action="import"
                    onClick={() => input.current.click()}
                    disabled={busy}
                  >
                    Selecionar arquivo Excel
                  </PermissionButton>
                  <div className="principles">
                    <span>✓ Uma linha = um atendimento</span>
                    <span>✓ Chamados podem se repetir</span>
                    <span>✓ Sem correções automáticas</span>
                  </div>
                </section>
              ) : (
                <>
                  <SidebarContent>
                    <nav className="category-navigation" aria-label="Categorias de análise">
                      {dashboardCategories.map((item) => (
                        <button
                          key={item.key}
                          aria-current={category === item.key ? 'page' : undefined}
                          className={category === item.key ? 'active' : ''}
                          onClick={() => {
                            setCategory(item.key);
                            setExpansion(null);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </SidebarContent>

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
                          Filtros combinados aplicados aos indicadores, gráficos, chamados e
                          revisão. Em um mesmo campo, qualquer valor selecionado é aceito; entre
                          campos, a linha precisa atender a todos os filtros. Responsáveis do
                          suporte pelo agendamento e pela execução são filtrados separadamente: cada
                          seleção consulta sua própria coluna, Resp. Agendamento ou Resp. Execução,
                          sem unir os dois papéis. Os relatórios de agendamentos por responsável
                          usam Agendamento; os demais indicadores de OS usam Data de atendimento. A
                          busca textual filtra somente a tabela. Na vida em campo, os filtros
                          selecionam instalações ou eventos de troca conforme o modo escolhido na
                          seção. O período acima é compartilhado por toda a análise; registros sem
                          data válida são excluídos apenas quando há limite de data ativo. As
                          contagens e exclusões continuam visíveis para conferência.
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
                                    data.rows
                                      .map((row) => String(row.cells[index]?.raw ?? ''))
                                      .filter(Boolean),
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
                          {selected.missingDates} registros que atendem aos filtros de categoria
                          foram excluídos do período por data ausente ou inválida.
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
                          Seleção exata pelo conteúdo exibido. Datas e valores adicionais não são
                          intervalos. Inclui opção Sem dados. Remover uma coluna também limpa sua
                          seleção. Estes filtros afetam toda a análise.
                        </InfoNote>
                      </summary>
                      <label>
                        Adicionar coluna{' '}
                        <select
                          value=""
                          onChange={(event) => {
                            if (event.target.value !== '')
                              setExtraColumns((previous) => [
                                ...previous,
                                Number(event.target.value),
                              ]);
                          }}
                        >
                          <option value="">Escolha uma coluna…</option>
                          {data.columns
                            .filter(
                              (col) =>
                                !filterFields.includes(col.label) &&
                                !extraColumns.includes(col.index),
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
                            ...new Set(
                              data.rows.map((row) => String(row.cells[position]?.display ?? '')),
                            ),
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
                                  setExtraColumns((previous) =>
                                    previous.filter((value) => value !== index),
                                  );
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
                    <SidebarContent>
                      <section className="sidebar-reports" aria-label="Relatórios exibidos">
                        <h3>Relatórios exibidos</h3>
                        <div className="preference-grid">
                          {Object.entries(sectionLabels)
                            .filter(
                              ([key]) =>
                                category !== 'overview' &&
                                !['filters', 'extras'].includes(key) &&
                                categoryVisibility(cleanPreferences({}), category)[key],
                            )
                            .map(([key, label]) => (
                              <label key={key}>
                                <input
                                  type="checkbox"
                                  checked={preferences[key]}
                                  onChange={(event) =>
                                    setVisibility({ ...preferences, [key]: event.target.checked })
                                  }
                                />
                                {label}
                              </label>
                            ))}
                        </div>
                        <button onClick={() => setVisibility(cleanPreferences({}))}>
                          Mostrar todas as seções
                        </button>
                        <p className="scope">
                          Ocultar não altera cálculos nem filtros. As seleções ativas permanecem no
                          resumo abaixo. {layoutMessage}
                        </p>
                        {category === 'overview' && (
                          <p className="scope">
                            Selecione uma categoria para escolher os relatórios exibidos.
                          </p>
                        )}
                      </section>
                    </SidebarContent>
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
                            (Array.isArray(value)
                              ? value.map((item) => item || 'Sem dados').join(', ')
                              : value)
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
                    <span>Aba OS 2025</span>
                    <span>Somente leitura</span>
                  </div>

                  {category === 'overview' && (
                    <DashboardOverview
                      original={data}
                      filters={filters}
                      operational={operational}
                      onPage={onPage}
                    />
                  )}
                  <SummaryCards
                    data={selected}
                    financial={financial}
                    devices={devices}
                    visible={visible.summary && category !== 'overview'}
                    filters={filters}
                  />
                  <Section
                    title={sectionLabels.monthly}
                    visible={visible.monthly && category !== 'overview'}
                  >
                    {monthly ? (
                      <BarChart
                        title="Visitas e atendimentos registrados por mês"
                        description={`Data de atendimento · somente Concluída e Pago · ${monthly.missingDates} realizados excluídos deste gráfico por data ausente ou inválida. Meses sem registros não são exibidos.`}
                        items={monthly.items}
                      />
                    ) : (
                      <div className="notice">
                        Gráfico indisponível: faltam Status ou Data de atendimento.
                      </div>
                    )}
                    {category !== 'overview' && <MonthlyBreakdown data={selected} />}
                  </Section>
                  <Technicians data={selected} visible={visible.technicians} />
                  <DescriptiveReport
                    original={data}
                    data={selected}
                    devices={devices}
                    lifecycle={lifecycle}
                    filename={filename}
                    filters={filters}
                    referenceDate={referenceDate}
                    visible={visible.descriptive}
                  />
                  <FieldLifePanel
                    original={data}
                    data={selected}
                    filename={filename}
                    filters={filters}
                    visible={visible.fieldLife}
                  />
                  <ExtendedInsights
                    original={data}
                    data={selected}
                    visibility={visible}
                    operational={operational?.data || operational}
                  />
                  <AdvancedInsights
                    original={data}
                    data={selected}
                    devices={devices}
                    lifecycle={lifecycle}
                    visibility={visible}
                    filename={filename}
                    filters={filters}
                  />
                  <Explorers
                    key={filename}
                    visibility={visible}
                    data={selected}
                    filename={filename}
                    filters={filters}
                    onRestoreFilters={(saved) => {
                      setFilters(saved);
                      setExtraColumns(
                        Object.keys(saved)
                          .filter((key) => key.startsWith('column:'))
                          .map((key) => Number(key.slice(7))),
                      );
                      setPage(0);
                      setSearch('');
                    }}
                  />
                  <Section title={sectionLabels.lifecycle} visible={visible.lifecycle}>
                    <section className="panel chart-panel">
                      <h2>Tempo observado em campo</h2>
                      <div className="lifecycle-controls" data-no-print>
                        <label>
                          Situação dos ciclos{' '}
                          <select
                            value={cycleState}
                            onChange={(event) => setCycleState(event.target.value)}
                          >
                            <option value="Todos">Todos</option>
                            <option value="Encerrado">Encerrados</option>
                            <option value="Sem retirada registrada">Sem retirada registrada</option>
                          </select>
                        </label>
                        <label>
                          Referência para períodos sem retirada{' '}
                          <input
                            type="date"
                            value={referenceDate}
                            onChange={(event) => setReferenceDate(event.target.value)}
                          />
                        </label>
                        <button onClick={() => setReferenceDate(todaySaoPaulo())}>
                          Usar data atual
                        </button>
                      </div>
                      <InfoNote>
                        Mesmo serial e placa, instalação anterior à retirada. Vínculos analisados no
                        arquivo completo; ambos os registros precisam atender aos filtros. Várias
                        instalações sem retirada intermediária vão para Revisão. Início somente por
                        Implementação. Sem retirada registrada: duração até a referência, sem
                        confirmar atividade ou ausência de problemas. A referência afeta apenas
                        ciclos sem retirada; ciclos encerrados mantêm suas datas reais. Dias
                        corridos até retirada, inclusive cancelamento. Para medir até primeira
                        troca, use a seção Vida em campo até primeira troca. Situação dos ciclos
                        filtra somente a tabela e a impressão desta seção, depois de aplicar os
                        filtros principais. Não modifica os demais indicadores nem remove avisos de
                        revisão. Encerrado significa retirada registrada, não necessariamente troca
                        de equipamento.
                      </InfoNote>
                      {lifecycle.unavailable ? (
                        <p>Indisponível: faltam colunas.</p>
                      ) : lifecycle.invalidReference ? (
                        <p role="alert">Escolha uma data de referência válida.</p>
                      ) : (
                        <>
                          <p>
                            {displayedPeriods.length} de {lifecycle.periods.length} períodos
                            exibidos. Situação:{' '}
                            {cycleState === 'Encerrado' ? 'Encerrados' : cycleState}.
                          </p>
                          {!displayedPeriods.length && (
                            <p>
                              Nenhum ciclo corresponde à situação selecionada e aos filtros da
                              página.
                            </p>
                          )}
                          <div className="table-scroll">
                            <SortableTable>
                              <thead>
                                <tr>
                                  <th>Placa</th>
                                  <th>Serial</th>
                                  <th>Instalação</th>
                                  <th>Retirada / referência</th>
                                  <th>Situação</th>
                                  <th>Dias</th>
                                  <th>Linhas Excel</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayedPeriods.map((period) => (
                                  <tr key={period.installationRow}>
                                    <td>{period.plate}</td>
                                    <td>{period.serial}</td>
                                    <td>{period.start}</td>
                                    <td>{period.end}</td>
                                    <td>{period.state}</td>
                                    <td>{period.days}</td>
                                    <td>
                                      {period.installationRow} →{' '}
                                      {period.removalRow ?? 'sem retirada'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </SortableTable>
                          </div>
                        </>
                      )}
                    </section>
                  </Section>

                  <Section title={sectionLabels.swaps} visible={visible.swaps}>
                    <section className="panel chart-panel">
                      <div className="inline-help-heading">
                        <h2>Trocas de equipamentos</h2>
                        <InfoNote>
                          Troca/trocar explícito nas instruções, somente Assistência Técnica /
                          Manutenção de Acessório Concluída/Pago. Coletora, teclado e terminal
                          pertencem à mesma categoria. Uma linha = um acessório. Categoria ausente
                          ou ambígua e manutenção sem troca confirmada ficam na revisão.
                        </InfoNote>
                      </div>
                      {devices.accessoryAvailable ? (
                        <BarChart
                          title="Trocas de acessórios por categoria"
                          description={`${devices.excludedAccessories} linhas excluídas desta contagem para revisão. Somente Assistência Técnica / Manutenção de Acessório realizada.`}
                          items={Object.entries(devices.accessories).map(([label, value]) => ({
                            label,
                            value,
                          }))}
                        />
                      ) : (
                        <p>Acessórios indisponíveis: faltam cabeçalhos.</p>
                      )}
                      {devices.trackerAvailable ? (
                        <>
                          <BarChart
                            title="Trocas de rastreador por mês"
                            description={`${devices.swaps.length} trocas identificadas; ${devices.missingMonthlyDate} sem data da instalação no gráfico. O par é identificado na importação completa e só entra se ambas as linhas atenderem aos filtros. Reinstalações entram somente quando há o par completo de retirada/entrada, na mesma data e cliente, com seriais diferentes.`}
                            items={devices.months}
                          />
                          <details className="report-details">
                            <summary>
                              Conferir pares de rastreadores ({devices.swaps.length})
                            </summary>
                            <div className="table-scroll">
                              <SortableTable>
                                <thead>
                                  <tr>
                                    <th>Chamado</th>
                                    <th>Placa</th>
                                    <th>Retirado</th>
                                    <th>Instalado</th>
                                    <th>Linhas Excel</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {devices.swaps.map((swap) => (
                                    <tr key={swap.installationRow}>
                                      <td>{swap.os}</td>
                                      <td>{swap.plate}</td>
                                      <td>{swap.oldSerial}</td>
                                      <td>{swap.newSerial}</td>
                                      <td>
                                        {swap.removalRow} → {swap.installationRow}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </SortableTable>
                            </div>
                          </details>
                        </>
                      ) : (
                        <p>Rastreadores indisponíveis: faltam cabeçalhos.</p>
                      )}
                      <InfoNote>
                        Períodos encerrados aparecem na seção Tempo observado em campo. Períodos sem
                        retirada usam a referência escolhida na seção Tempo observado em campo.
                      </InfoNote>
                    </section>
                  </Section>
                  <Section title={sectionLabels.finance} visible={visible.finance}>
                    {financial ? (
                      <>
                        <section className="cards financial-cards" style={{ marginBottom: 18 }}>
                          {[
                            ['cost', 'Custo total realizado'],
                            ['client', 'Valor contratual · Cliente'],
                            ['absorbed', 'Valor contratual · Addlog'],
                            ['travel', 'Deslocamento realizado'],
                          ].map(([key, label]) => (
                            <article key={key}>
                              <span>{label}</span>
                              <strong style={{ fontSize: 22 }}>
                                {currency(financial.totals[key])}
                              </strong>
                            </article>
                          ))}
                        </section>
                        <p className="scope">
                          Somente Concluída e Pago ({financial.eligible} linhas). Cancelada e demais
                          status não entram. Custo técnico: {currency(financial.totals.technician)}.
                          Valores contratuais não representam recebimentos. Células excluídas por
                          ausência/incompatibilidade: custo total {financial.excluded.cost},
                          deslocamento {financial.excluded.travel}, técnico{' '}
                          {financial.excluded.technician}; linhas excluídas dos valores contratuais{' '}
                          {financial.excluded.contractual}. {financial.issues.length} divergências
                          de custo; total lançado mantido.
                        </p>
                      </>
                    ) : (
                      <div className="notice">
                        Indicadores financeiros indisponíveis: faltam cabeçalhos necessários.
                      </div>
                    )}
                  </Section>
                  <Section title={sectionLabels.operations} visible={visible.operations}>
                    {summary ? (
                      <section className="cards" style={{ marginBottom: 18 }}>
                        {[
                          [summary.completed, 'Atendimentos realizados'],
                          [summary.canceled, 'Atendimentos cancelados'],
                          [summary.canceledCalls, 'Chamados com cancelamento'],
                          [summary.other, 'Demais status'],
                        ].map(([value, label]) => (
                          <article key={label}>
                            <span>{label}</span>
                            <strong>{value.toLocaleString('pt-BR')}</strong>
                          </article>
                        ))}
                      </section>
                    ) : (
                      <div className="notice">
                        Indicadores operacionais indisponíveis: cabeçalho Status não encontrado.
                      </div>
                    )}
                  </Section>
                  <p hidden={category !== 'operations'} className="scope">
                    Contagens sobre a seleção dos filtros, independentemente da busca textual.
                    Realizados: Concluída ou Pago. Chamados com cancelamento: ao menos uma linha
                    Cancelada na seleção. Demais status inclui pendências e valores não
                    reconhecidos.
                  </p>
                  <Section title={sectionLabels.calls} visible={visible.calls}>
                    {summary && (
                      <details className="panel" style={{ marginBottom: 18 }}>
                        <summary style={{ padding: 18, cursor: 'pointer' }}>
                          Detalhamento dos {summary.calls.length} chamados
                        </summary>
                        <div className="table-scroll">
                          <SortableTable>
                            <thead>
                              <tr>
                                <th>Chamado</th>
                                <th>Linhas</th>
                                <th>Realizados</th>
                                <th>Cancelados</th>
                                <th>Demais status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.calls.map((call) => (
                                <tr key={call.os}>
                                  <td>{call.os}</td>
                                  <td>{call.total}</td>
                                  <td>{call.completed}</td>
                                  <td>{call.canceled}</td>
                                  <td>{call.other}</td>
                                </tr>
                              ))}
                            </tbody>
                          </SortableTable>
                        </div>
                      </details>
                    )}
                  </Section>
                  <Section title={sectionLabels.records} visible={visible.records}>
                    <section className="cards">
                      {[
                        [selected.rows.length.toLocaleString('pt-BR'), 'Atendimentos na seleção'],
                        [selected.calls.toLocaleString('pt-BR'), 'Chamados na seleção'],
                        [data.columns.length, 'Colunas com cabeçalho'],
                        [selected.issues.length, 'Erros estruturais na seleção'],
                      ].map(([value, label]) => (
                        <article key={label}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </article>
                      ))}
                    </section>
                    <div className="notice">
                      Os valores originais foram preservados. Células vazias ficam em branco e erros
                      aparecem destacados. Os cálculos financeiros consideram somente serviços
                      realizados e preservam o total lançado.
                      {data.skipped > 0 &&
                        ` ${data.skipped} linhas preenchidas sem número de OS não foram importadas.`}
                    </div>
                    <section className="panel">
                      <div className="toolbar">
                        <div className="tabs">
                          <button
                            className={view === 'records' ? 'selected' : ''}
                            onClick={() => setView('records')}
                          >
                            Atendimentos
                          </button>
                          <button
                            className={view === 'issues' ? 'selected' : ''}
                            onClick={() => setView('issues')}
                          >
                            Revisão ({review.length})
                          </button>
                        </div>
                        {view === 'records' && (
                          <input
                            aria-label="Buscar em todas as colunas"
                            placeholder="Buscar em todas as colunas…"
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(0);
                            }}
                          />
                        )}
                      </div>
                      {view === 'records' ? (
                        <>
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>
                                    <button
                                      className="sort-heading"
                                      onClick={() => {
                                        setRecordSort((previous) =>
                                          previous?.index === -1
                                            ? previous.direction === 'asc'
                                              ? { index: -1, direction: 'desc' }
                                              : null
                                            : { index: -1, direction: 'asc' },
                                        );
                                        setPage(0);
                                      }}
                                    >
                                      Linha Excel{' '}
                                      {recordSort?.index === -1
                                        ? recordSort.direction === 'asc'
                                          ? '↑'
                                          : '↓'
                                        : '↕'}
                                    </button>
                                  </th>
                                  {data.columns.map((col) => (
                                    <th
                                      key={col.index}
                                      aria-sort={
                                        recordSort?.index === data.columns.indexOf(col)
                                          ? recordSort.direction === 'asc'
                                            ? 'ascending'
                                            : 'descending'
                                          : 'none'
                                      }
                                    >
                                      <button
                                        className="sort-heading"
                                        onClick={() => {
                                          const index = data.columns.indexOf(col);
                                          setRecordSort((previous) =>
                                            previous?.index === index
                                              ? previous.direction === 'asc'
                                                ? { index, direction: 'desc' }
                                                : null
                                              : { index, direction: 'asc' },
                                          );
                                          setPage(0);
                                        }}
                                      >
                                        <small>{col.letter}</small>
                                        {col.label}{' '}
                                        {recordSort?.index === data.columns.indexOf(col)
                                          ? recordSort.direction === 'asc'
                                            ? '↑'
                                            : '↓'
                                          : '↕'}
                                      </button>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {orderedRecords.slice(page * 50, (page + 1) * 50).map((row) => (
                                  <tr key={row.sourceRow}>
                                    <td className="row-number">{row.sourceRow}</td>
                                    {row.cells.map((cell, i) => (
                                      <td
                                        key={i}
                                        className={cell.issue ? 'invalid' : ''}
                                        title={
                                          cell.issue
                                            ? `Conteúdo original: ${cell.raw}. Revisar na planilha.`
                                            : String(cell.display)
                                        }
                                      >
                                        {cell.display}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <footer>
                            <span>
                              {filtered.length.toLocaleString('pt-BR')} atendimentos · ordem
                              original da planilha
                            </span>
                            <div>
                              <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                                Anterior
                              </button>
                              <span>
                                {page + 1} / {pageCount}
                              </span>
                              <button
                                disabled={page + 1 >= pageCount}
                                onClick={() => setPage(page + 1)}
                              >
                                Próxima
                              </button>
                              <button
                                disabled={page + 1 >= pageCount}
                                onClick={() => setPage(pageCount - 1)}
                              >
                                Última
                              </button>
                            </div>
                          </footer>
                        </>
                      ) : (
                        <div className="table-scroll">
                          <SortableTable>
                            <thead>
                              <tr>
                                <th>Célula</th>
                                <th>Coluna</th>
                                <th>Conteúdo original</th>
                                <th>Motivo para revisão</th>
                              </tr>
                            </thead>
                            <tbody>
                              {review.map((issue, index) => (
                                <tr key={issue.address + index}>
                                  <td>{issue.address}</td>
                                  <td>{issue.column}</td>
                                  <td>{issue.value}</td>
                                  <td>{issue.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </SortableTable>
                          {!review.length && (
                            <p className="review-empty">
                              Nenhum erro do Excel ou valor incompatível com formato de data foi
                              detectado. Isso não valida as regras de negócio.
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                    <InfoNote>
                      Conferência estrutural: erros do Excel e formatos de data inválidos.
                      Divergências de custo dos serviços realizados também são sinalizadas. Outras
                      validações serão definidas com você.
                    </InfoNote>
                  </Section>
                </>
              )}
            </main>
          </div>
        </PrintContext.Provider>
      </ExpansionContext.Provider>
    </SidePanelProvider>
  );
}
