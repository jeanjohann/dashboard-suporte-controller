/**
 * Interface de consumo M2M: importação, histórico local, filtros, conferência e exportação.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import {
  authorizeAction,
  accessUser,
  accessManaged,
} from '../../../shared/security/accessClient.js';
import { allowsSource } from '../../../shared/security/permissions.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import {
  Section,
  PrintContext,
  ExpansionContext,
  HiddenSectionsContext,
} from '../../../components/Section.jsx';
import { ReportControls, PagePersonalization } from '../../../components/ReportControls.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { aboveConsumptionLimit, consumptionLimit } from '../domain/consumptionSelection.js';
import { LineRecordsTable } from './LineRecordsTable.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { importOperational } from '../../operational/domain/operational.js';
import {
  VOLUME_SCALE,
  importLineStatement,
  consumptionSummary,
  linkConsumption,
  baselineByPeriod,
  attachBaselines,
  chipKey,
  periodKey,
  periodOptions,
  historyStatements,
  mergeHistoryFiles,
  toggleHistoryFile,
  statementSignature,
  lineTimeline,
  consumptionEligible,
} from '../domain/lineConsumption.js';
import { emptyHistory, fileDigest, validateBackup } from '../data/consumptionHistory.js';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { consumptionHistoryRepository } from '../data/historyRepository.js';
import {
  lineHistoryReport,
  lineHistoryCsv,
  lineHistoryWorkbook,
} from '../domain/lineHistoryReport.js';
const mb = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 6 }) + ' MB';
const volume = (value) => mb(value == null ? null : value / VOLUME_SCALE);
const number = (value) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const currency = (value) =>
  value == null
    ? 'Não informado'
    : (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const categories = [
  ['overview', 'Visão geral', ['Visão geral do consumo', 'Comparativos por operadora']],
  ['investigation', 'Investigação', ['Linhas para investigar', 'Linha do tempo de consumo']],
  [
    'equipment',
    'Clientes e equipamentos',
    ['Consumo por cliente e equipamento', 'Revisão dos vínculos'],
  ],
  ['history', 'Histórico e arquivos', ['Arquivos e histórico', 'Mensalidades dos extratos']],
];
const labels = categories.flatMap(([, , sections]) => sections);
const today = () => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  return ['year', 'month', 'day']
    .map((key) => parts.find((part) => part.type === key).value)
    .join('-');
};
const decode = (buffer) => {
  let text = new TextDecoder('utf-8').decode(buffer);
  return text.includes('\uFFFD') ? new TextDecoder('windows-1252').decode(buffer) : text;
};
const sumMoney = (rows, key) => {
  const values = rows.map((row) => row[key]).filter((value) => value != null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
};
/** Coordena extratos, versões, notas e referência operacional no histórico local do navegador. */
export function LinesPage({ onPage, operational, onOperationalChange, reloadToken = 0 }) {
  const [archive, setArchive] = useState(emptyHistory),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [pending, setPending] = useState([]),
    [backup, setBackup] = useState(null),
    [category, setCategory] = useState('overview'),
    [filters, setFilters] = useState({}),
    [search, setSearch] = useState(''),
    [detail, setDetail] = useState(null),
    [tracked, setTracked] = useState(''),
    [noteText, setNoteText] = useState(''),
    [noteDate, setNoteDate] = useState(today),
    [noteStatus, setNoteStatus] = useState('Investigar'),
    [expansion, setExpansion] = useState(null),
    [hiddenSections, setHiddenSections] = useState([]),
    [rankMeasure, setRankMeasure] = useState('daily');
  const input = useRef(),
    operationalInput = useRef(),
    backupInput = useRef();
  useEffect(() => {
    let live = true;
    setReady(false);
    consumptionHistoryRepository
      .read()
      .then((value) => {
        if (live) {
          setArchive(value);
          setReady(true);
          setError('');
        }
      })
      .catch((e) => {
        if (live) {
          setError(
            'Não foi possível abrir o histórico local. Recarregue a página antes de importar arquivos: ' +
              e.message,
          );
        }
      });
    return () => {
      live = false;
    };
  }, [reloadToken]);
  async function commit(next, success) {
    setBusy(true);
    setError('');
    try {
      await consumptionHistoryRepository.write(next);
      setArchive(next);
      setMessage(success);
    } catch (e) {
      setError('Não foi possível salvar. O histórico anterior foi mantido. ' + e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const statements = useMemo(() => historyStatements(archive.files), [archive.files]);
  const reference = operational?.data ? operational : archive.operational;
  const linked = useMemo(
    () =>
      linkConsumption(
        statements.flatMap((statement) => statement.rows),
        reference,
      ),
    [statements, reference],
  );
  const baselines = useMemo(() => baselineByPeriod(linked), [linked]);
  const allRows = useMemo(
    () => attachBaselines(linked, baselines, archive.settings.factor),
    [linked, baselines, archive.settings.factor],
  );
  const operators = [...new Set(statements.map((statement) => statement.operator))].sort();
  const periods = Object.fromEntries(
    operators.map((operator) => {
      const options = periodOptions(statements, operator);
      return [
        operator,
        options.some((option) => option.key === filters.periods?.[operator])
          ? filters.periods[operator]
          : options[0]?.key,
      ];
    }),
  );
  const fields = [
    ['operator', 'Operadora'],
    ['plan', 'Plano / produto'],
    ['client', 'Cliente vinculado'],
    ['model', 'Modelo vinculado'],
    ['linkState', 'Vínculo operacional'],
    ['status', 'Situação no extrato'],
  ];
  const [lineSearch, setLineSearch] = useState('');
  const historyChoices = [
    ...new Map(
      allRows.filter((row) => row.service === 'dados').map((row) => [chipKey(row), row]),
    ).values(),
  ].sort((a, b) => a.number.localeCompare(b.number));
  const matchesHistorySearch = (row) =>
    [row.number, row.iccid, row.operator, row.link?.client, row.link?.plate].some((value) =>
      String(value || '')
        .toLocaleLowerCase('pt-BR')
        .includes(lineSearch.trim().toLocaleLowerCase('pt-BR')),
    );
  const historyMatches = lineSearch.trim() ? historyChoices.filter(matchesHistorySearch) : [];
  const selected = allRows.filter(
    (row) =>
      row.service === 'dados' &&
      periodKey(row) === periods[row.operator] &&
      fields.every(
        ([key]) => !filters[key]?.length || filters[key].includes(row[key] || 'Não informado'),
      ) &&
      aboveConsumptionLimit(row, filters.minimumMB) &&
      (!filters.consumption ||
        (filters.consumption === 'zero' && row.ticks === 0) ||
        (filters.consumption === 'positive' && row.ticks > 0) ||
        (filters.consumption === 'attention' && row.attention)) &&
      (!search ||
        [row.number, row.iccid, row.plan, row.client, row.serial, row.link?.plate].some((value) =>
          String(value || '')
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR')),
        )),
  );
  const summary = consumptionSummary(selected),
    eligible = summary.eligible,
    attention = eligible.filter((row) => row.attention),
    visibleSections = categories.find(([key]) => key === category)[2],
    shown = (label) => visibleSections.includes(label);
  const selectedDetail = selected.find((row) => row.id === detail),
    timeline = lineTimeline(allRows, tracked),
    trackedRow = timeline.at(-1),
    notes = archive.notes
      .filter(
        (note) =>
          trackedRow && note.operator === trackedRow.operator && note.iccid === trackedRow.iccid,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  function filter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setDetail(null);
  }
  async function load(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const candidates = [];
      for (const file of files) {
        const text = decode(await file.arrayBuffer()),
          id = await fileDigest(text);
        const record = { id, text, filename: file.name, importedAt: new Date().toISOString() },
          parsed = importLineStatement(text, file.name, id);
        candidates.push({ file: record, parsed });
      }
      mergeHistoryFiles(
        archive.files,
        candidates.map((item) => item.file),
      );
      setPending(candidates);
    } catch (e) {
      setError(e.message + ' Os arquivos do histórico foram mantidos.');
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function savePending() {
    if (!(await authorizeAction('import'))) return;
    try {
      const files = mergeHistoryFiles(
        archive.files,
        pending.map((item) => item.file),
      );
      await commit({ ...archive, files }, 'Extratos salvos no histórico deste navegador.');
      setPending([]);
      setFilters({});
      setDetail(null);
    } catch {}
  }
  async function loadOperational(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      if (accessManaged() && !allowsSource(accessUser(), 'operational'))
        throw Error('Importação operacional não autorizada.');
      const source = {
        filename: file.name,
        data: importOperational(await file.arrayBuffer()),
        savedAt: new Date().toISOString(),
      };
      await commit(
        { ...archive, operational: source },
        'Referência operacional salva para os vínculos.',
      );
      onOperationalChange?.(source);
      setDetail(null);
    } catch (e) {
      setError(e.message);
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function readBackup(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setBackup(await validateBackup(await file.text()));
      setCategory('history');
    } catch (e) {
      setError(e.message);
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  }
  async function restoreBackup() {
    if (!(await authorizeAction('import'))) return;
    try {
      if (accessManaged() && backup?.operational && !allowsSource(accessUser(), 'operational'))
        throw Error('Este backup contém uma base operacional que você não pode importar.');
      await commit(backup, 'Backup restaurado neste navegador.');
      if (backup.operational) onOperationalChange?.(backup.operational);
      setBackup(null);
      setFilters({});
      setDetail(null);
      setTracked('');
    } catch {}
  }
  function exportBackup() {
    download(
      JSON.stringify({ ...archive, exportedAt: new Date().toISOString() }, null, 2),
      'application/json',
      'addlog-historico-consumo-' + today() + '.json',
    );
  }
  function exportRecords(records) {
    const exporting = Array.isArray(records) ? records : selected;
    download(
      csv([
        ['Relatório', 'Consumo de linhas'],
        [
          'Escopo exportado',
          Array.isArray(records)
            ? 'Somente linhas marcadas do recorte atual'
            : 'Todas as linhas filtradas',
        ],
        ['Quantidade de registros exportados', exporting.length],
        [
          'Limite absoluto',
          filters.minimumMB === '' || filters.minimumMB == null
            ? 'Sem limite'
            : `Consumo total estritamente acima de ${filters.minimumMB} MB por apuração`,
        ],
        ['Critério', 'Dados móveis por chip e período. SMS e frete separados. KB / 1024 = MB.'],
        ['Períodos', JSON.stringify(periods)],
        ['Filtros', JSON.stringify({ ...filters, busca: search })],
        ['Referência operacional', reference?.filename || 'Não importada'],
        [
          'Investigação',
          `Acima de ${archive.settings.factor} vezes a média da operadora no período, incluindo zeros; sem inferir defeito.`,
        ],
        [],
        [
          'Operadora',
          'ICCID',
          'MSISDN',
          'Plano / produto',
          'Início',
          'Fim',
          'Dias',
          'Consumo MB',
          'MB por dia',
          'Média de referência MB',
          'Vezes a média',
          'Vínculo',
          'Cliente na referência',
          'ID equipamento na referência',
          'Placa na referência',
          'Situação no extrato',
          'Valor faturado de dados BRL',
          'Valor total de dados BRL',
          'Arquivo',
          'Linha CSV',
          'Revisão',
        ],
        ...exporting.map((row) => [
          row.operator,
          row.iccid,
          row.number,
          row.plan,
          row.start || '',
          row.end || '',
          row.days || '',
          consumptionEligible(row) ? row.ticks / VOLUME_SCALE : 'Não disponível',
          consumptionEligible(row) ? row.ticks / VOLUME_SCALE / row.days : 'Não disponível',
          row.baselineAverage == null ? '' : row.baselineAverage / VOLUME_SCALE,
          row.ratio ?? '',
          row.linkState,
          row.link?.client || '',
          row.link?.serial || '',
          row.link?.plate || '',
          row.status,
          row.billedCents == null ? '' : row.billedCents / 100,
          row.totalCents == null ? '' : row.totalCents / 100,
          row.filename,
          row.sourceRow,
          row.problems.join('; '),
        ]),
      ]),
      'text/csv;charset=utf-8',
      Array.isArray(records) ? 'consumo-linhas-selecionadas.csv' : 'consumo-linhas-filtrado.csv',
    );
  }
  async function exportLineHistory(format) {
    if (!trackedRow || !(await authorizeAction('export'))) return;
    try {
      const report = lineHistoryReport(timeline, notes);
      const filename = 'historico-linha-' + trackedRow.iccid.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (format === 'xlsx') {
        await download(
          lineHistoryWorkbook(report),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename + '.xlsx',
        );
      } else {
        await download(lineHistoryCsv(report), 'text/csv;charset=utf-8', filename + '.csv');
      }
    } catch (error) {
      setError('Não foi possível gerar o histórico. ' + error.message);
    }
  }
  async function changeVersion(file) {
    try {
      const files = toggleHistoryFile(archive.files, file.id);
      await commit(
        { ...archive, files },
        file.active === false ? 'Versão reativada.' : 'Versão arquivada; original preservado.',
      );
      setDetail(null);
    } catch (e) {
      setError(e.message);
    }
  }
  async function addNote() {
    if (
      !trackedRow ||
      !noteText.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(noteDate) ||
      !Number.isFinite(Date.parse(noteDate)) ||
      new Date(noteDate).toISOString().slice(0, 10) !== noteDate
    )
      return;
    const note = {
      id: crypto.randomUUID(),
      operator: trackedRow.operator,
      iccid: trackedRow.iccid,
      date: noteDate,
      status: noteStatus,
      text: noteText.trim(),
      client: trackedRow.link?.client || '',
      serial: trackedRow.link?.serial || '',
    };
    try {
      await commit(
        { ...archive, notes: [...archive.notes, note] },
        'Acompanhamento salvo no histórico.',
      );
      setNoteText('');
    } catch {}
  }
  function viewRow(row) {
    setDetail(row.id);
    setTracked(chipKey(row));
  }
  function rowsTable(records) {
    return <LineRecordsTable records={records} onView={viewRow} onExport={exportRecords} />;
  }
  const ranked = [...eligible].sort((a, b) =>
    rankMeasure === 'daily' ? b.ticks / b.days - a.ticks / a.days : b.ticks - a.ticks,
  );
  const rankItems = ranked.map((row) => ({
    label: `${row.operator} · ${row.number} · ICCID ${row.iccid}${row.link?.client ? ' · ' + row.link.client : ''}`,
    displayLabel: `${row.operator} · ${row.number}`,
    caption: row.link?.client || 'Cliente não vinculado',
    value: row.ticks / VOLUME_SCALE / (rankMeasure === 'daily' ? row.days : 1),
    id: row.id,
  }));
  const ranges = [
    { label: 'Zero MB', value: 0 },
    { label: 'Mais de 0 até 10 MB', value: 0 },
    { label: 'Mais de 10 até 20 MB', value: 0 },
    { label: 'Mais de 20 até 50 MB', value: 0 },
    { label: 'Mais de 50 MB', value: 0 },
  ];
  for (const row of eligible)
    ranges[
      row.ticks === 0
        ? 0
        : row.ticks <= 10 * VOLUME_SCALE
          ? 1
          : row.ticks <= 20 * VOLUME_SCALE
            ? 2
            : row.ticks <= 50 * VOLUME_SCALE
              ? 3
              : 4
    ].value++;
  const providerStats = operators
    .filter((operator) => !filters.operator?.length || filters.operator.includes(operator))
    .map((operator) => ({
      operator,
      ...consumptionSummary(selected.filter((row) => row.operator === operator)),
      period: periodOptions(statements, operator).find(
        (period) => period.key === periods[operator],
      ),
    }));
  const clientGroups = new Map();
  for (const row of eligible) {
    const label = row.link?.client || 'Não vinculado';
    if (!clientGroups.has(label)) clientGroups.set(label, { label, ticks: 0, rows: 0 });
    const group = clientGroups.get(label);
    group.ticks += row.ticks;
    group.rows++;
  }
  const chartNote =
    'Apurações: ' +
    providerStats.map((item) => item.operator + ' ' + (item.period?.label || '—')).join(' / ') +
    '. Dados móveis; SMS e frete separados. Vínculos usam a referência operacional importada.';
  const selectedIDs = new Set(
    selected.map((row) => JSON.stringify([row.operator, row.iccid, row.start, row.end])),
  );
  const invoiceRows = allRows.filter(
    (row) =>
      periodKey(row) === periods[row.operator] &&
      selectedIDs.has(JSON.stringify([row.operator, row.iccid, row.start, row.end])) &&
      !row.duplicate,
  );
  const fees = allRows.filter(
    (row) =>
      (!filters.operator?.length || filters.operator.includes(row.operator)) &&
      periodKey(row) === periods[row.operator] &&
      !['dados', 'sms'].includes(row.service),
  );

  return (
    <SidePanelProvider>
      <HiddenSectionsContext.Provider value={hiddenSections}>
        <ExpansionContext.Provider value={expansion}>
          <PrintContext.Provider
            value={{
              filename: statements.map((file) => file.filename).join(' / '),
              filters: {
                ...filters,
                busca: search,
                periodos: periods,
                referencia: reference?.filename,
                fator: archive.settings.factor,
              },
            }}
          >
            <div className="app lines-page">
              <Navigation page="lines" onPage={onPage} />
              <main>
                <SidebarContent>
                  <nav className="category-navigation" aria-label="Análises de consumo">
                    {categories.map(([key, label]) => (
                      <button
                        key={key}
                        className={category === key ? 'active' : ''}
                        onClick={() => setCategory(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                </SidebarContent>
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
                        × a média geral da operadora no período, incluindo zeros. Padrão inicial:
                        2×; ajustável.
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
                    Uma apuração por operadora. Os períodos são preservados; MB por dia ajuda a
                    comparar durações diferentes. A média de investigação usa todas as linhas
                    válidas da operadora nessa apuração, antes da busca e dos filtros de cliente.
                  </InfoNote>
                </PagePersonalization>
                <ReportControls onExpand={setExpansion} />
                <header>
                  <div>
                    <div className="eyebrow">CONTROLE DE LINHAS</div>
                    <h1>Consumo, equipamentos e acompanhamento</h1>
                    <p>Arqia e Kore · histórico salvo neste navegador, com backup exportável.</p>
                  </div>
                  <div className="line-actions">
                    <PermissionButton
                      action="import"
                      disabled={busy || !ready}
                      onClick={() => input.current.click()}
                    >
                      Importar extratos
                    </PermissionButton>
                    <PermissionButton
                      action="import"
                      source="operational"
                      disabled={busy || !ready}
                      onClick={() => operationalInput.current.click()}
                    >
                      Importar operacional
                    </PermissionButton>
                  </div>
                  <input
                    hidden
                    ref={input}
                    type="file"
                    accept=".csv,text/csv"
                    multiple
                    onChange={load}
                  />
                  <input
                    hidden
                    ref={operationalInput}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={loadOperational}
                  />
                  <input
                    hidden
                    ref={backupInput}
                    type="file"
                    accept=".json,application/json"
                    onChange={readBackup}
                  />
                </header>
                {!ready && !error && <p role="status">Abrindo histórico…</p>}
                {error && (
                  <div role="alert" className="error">
                    {error}
                  </div>
                )}
                {message && (
                  <p role="status" className="line-message">
                    {message}
                  </p>
                )}
                {!!pending.length && (
                  <section className="panel line-import-preview">
                    <h2>Conferir importação</h2>
                    {pending.map(({ file, parsed }) => (
                      <div key={file.id}>
                        <strong>
                          {file.filename} · {parsed.operator}
                        </strong>
                        <p>
                          {parsed.rows.filter((row) => row.service === 'dados').length} registros de
                          dados · {parsed.rows.filter((row) => row.service === 'sms').length} de SMS
                          ·{' '}
                          {
                            parsed.rows.filter((row) => !['dados', 'sms'].includes(row.service))
                              .length
                          }{' '}
                          de outros serviços
                        </p>
                        <p className="scope">
                          {parsed.periods.map((period) => period.label).join(' / ')} ·{' '}
                          {parsed.rows.filter((row) => row.problems.length).length} registros para
                          revisão.{' '}
                          {archive.files.some((old) => old.id === file.id)
                            ? 'Este arquivo já está no histórico; não será somado novamente.'
                            : archive.files.some(
                                  (old) =>
                                    old.active !== false &&
                                    statementSignature(
                                      importLineStatement(old.text, old.filename, old.id),
                                    ) === statementSignature(parsed),
                                )
                              ? 'A versão anterior desta apuração será arquivada e preservada.'
                              : 'Nova apuração no histórico.'}
                        </p>
                      </div>
                    ))}
                    <div className="line-actions">
                      <PermissionButton action="import" disabled={busy} onClick={savePending}>
                        Salvar no histórico
                      </PermissionButton>
                      <button disabled={busy} onClick={() => setPending([])}>
                        Cancelar importação
                      </button>
                    </div>
                  </section>
                )}
                {!!statements.length && (
                  <>
                    <div className="source">
                      <span>
                        {archive.files.length} arquivos guardados · {statements.length} versões em
                        uso
                      </span>
                      <span>{summary.lines} chips no recorte</span>
                      <span>Referência: {reference?.filename || 'operacional não importado'}</span>
                    </div>
                    <p className="scope line-periods">
                      {providerStats
                        .map(
                          (item) =>
                            `${item.operator}: ${item.period?.label || '—'} (${item.period?.days || 0} dias)`,
                        )
                        .join(' · ')}
                      . Períodos com datas diferentes não representam a mesma janela.
                    </p>
                  </>
                )}
                {!statements.length && ready && (
                  <section className="empty">
                    <h2>Guarde seus extratos e acompanhe a evolução</h2>
                    <p>
                      Importe os consolidados da Arqia e da Kore. Confira o mapeamento e salve a
                      apuração no histórico.
                    </p>
                    <PermissionButton
                      action="import"
                      disabled={busy}
                      onClick={() => input.current.click()}
                    >
                      Selecionar extratos
                    </PermissionButton>
                    <PermissionButton
                      action="import"
                      disabled={busy}
                      onClick={() => backupInput.current.click()}
                    >
                      Restaurar backup
                    </PermissionButton>
                  </section>
                )}
                <Section
                  title="Visão geral do consumo"
                  visible={shown('Visão geral do consumo') && !!statements.length}
                >
                  <div className="summary-grid line-cards">
                    {[
                      [
                        'Chips no recorte',
                        number(summary.lines),
                        'Identificação por operadora + ICCID',
                      ],
                      [
                        'Consumo total',
                        volume(summary.ticks),
                        summary.ticks == null
                          ? 'Sem consumo válido'
                          : `${number(summary.ticks / VOLUME_SCALE / 1024)} GB equivalentes · apurações selecionadas`,
                      ],
                      [
                        'Linhas com tráfego',
                        number(summary.active),
                        `${summary.samples} registros de dados válidos`,
                      ],
                      [
                        'Consumo zero',
                        number(summary.zero),
                        `${summary.samples ? number((summary.zero / summary.samples) * 100) : '—'}% dos registros válidos; sem inferir equipamento parado`,
                      ],
                      [
                        'Média geral por linha',
                        volume(summary.average),
                        `Inclui zeros · média com tráfego: ${volume(summary.activeAverage)}`,
                      ],
                      [
                        'Vínculos conferidos',
                        number(eligible.filter((row) => row.link).length),
                        'ICCID e número no mesmo registro operacional',
                      ],
                    ].map(([label, value, note]) => (
                      <div className="summary-card" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <small>{note}</small>
                      </div>
                    ))}
                  </div>
                  <p className="scope">
                    Mediana: {volume(summary.median)} · maior consumo: {volume(summary.max)} ·{' '}
                    {summary.excluded} registros de dados fora dos totais. SMS e frete não entram no
                    volume de dados. Clientes e equipamentos vêm da referência operacional, sem
                    comprovar alocação histórica.
                  </p>
                  <div className="dashboard-chart-grid">
                    <article className="panel dashboard-widget">
                      <h3>Linhas por faixa de consumo</h3>
                      <Chart
                        compact
                        exportNote={chartNote}
                        items={ranges.filter((item) => item.value > 0)}
                        type="donut"
                        title="Faixas de consumo em MB"
                      />
                    </article>
                    <article className="panel dashboard-widget">
                      <h3>Consumo por plano / produto</h3>
                      <Chart
                        compact
                        exportNote={chartNote}
                        ranking
                        items={[...new Set(eligible.map((row) => row.plan))].map((label) => ({
                          label,
                          value:
                            eligible
                              .filter((row) => row.plan === label)
                              .reduce((sum, row) => sum + row.ticks, 0) / VOLUME_SCALE,
                        }))}
                        title="Consumo por plano"
                        format={mb}
                      />
                    </article>
                  </div>
                </Section>
                <Section
                  title="Comparativos por operadora"
                  visible={shown('Comparativos por operadora') && !!statements.length}
                >
                  <InfoNote>
                    Compare MB por dia e média por linha; cada operadora tem seu tamanho de base e
                    sua apuração. Os fornecedores têm vários contratos; não há cálculo de saldo de
                    uma franquia global.
                  </InfoNote>
                  <div className="table-scroll">
                    <SortableTable>
                      <thead>
                        <tr>
                          {[
                            'Operadora',
                            'Apuração',
                            'Dias',
                            'Chips',
                            'Consumo MB',
                            'MB por dia',
                            'Média por linha MB',
                            'Média por linha / dia',
                            'Zeros',
                            'Acima da referência',
                          ].map((label) => (
                            <th key={label}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {providerStats.map((item) => (
                          <tr key={item.operator}>
                            <td>{item.operator}</td>
                            <td>{item.period?.label}</td>
                            <td>{item.period?.days}</td>
                            <td>{item.lines}</td>
                            <td data-sort={item.ticks}>{volume(item.ticks)}</td>
                            <td
                              data-sort={item.ticks == null ? null : item.ticks / item.period.days}
                            >
                              {volume(item.ticks == null ? null : item.ticks / item.period.days)}
                            </td>
                            <td data-sort={item.average}>{volume(item.average)}</td>
                            <td
                              data-sort={
                                item.average == null ? null : item.average / item.period.days
                              }
                            >
                              {volume(
                                item.average == null ? null : item.average / item.period.days,
                              )}
                            </td>
                            <td>{item.zero}</td>
                            <td>{item.eligible.filter((row) => row.attention).length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </SortableTable>
                  </div>
                </Section>
                <Section
                  title="Linhas para investigar"
                  visible={shown('Linhas para investigar') && !!statements.length}
                >
                  <p className="scope">
                    {attention.length} linhas acima de {archive.settings.factor}× a média geral da
                    própria operadora e apuração. O destaque indica consumo para investigar; não
                    confirma defeito ou bloqueio. Todas as linhas do recorte estão na tabela.
                  </p>
                  <label className="chart-order-control">
                    Ordenar gráfico por{' '}
                    <select
                      value={rankMeasure}
                      onChange={(event) => setRankMeasure(event.target.value)}
                    >
                      <option value="daily">Consumo por dia</option>
                      <option value="volume">Consumo total do período</option>
                    </select>
                  </label>
                  <Chart
                    compact
                    exportNote={chartNote}
                    ranking
                    items={rankItems}
                    title="Maiores consumos"
                    format={(value) => mb(value) + (rankMeasure === 'daily' ? '/dia' : '')}
                    onItemClick={(item) => viewRow(selected.find((row) => row.id === item.id))}
                  />
                  <div className="line-actions">
                    <PermissionButton action="export" onClick={exportRecords}>
                      Baixar linhas filtradas CSV
                    </PermissionButton>
                    <button onClick={() => filter('consumption', 'attention')}>
                      Ver somente destaques
                    </button>
                    <button onClick={() => filter('consumption', 'zero')}>Ver consumo zero</button>
                  </div>
                  <p className="scope">
                    O limite absoluto considera consumo total da apuração estritamente maior que o
                    valor em MB, combinado com os demais filtros. Valores inválidos não entram. A
                    seleção vale para o recorte atual e atravessa as páginas da tabela.
                  </p>
                  {Number.isNaN(consumptionLimit(filters.minimumMB)) && (
                    <p role="alert" className="error">
                      Informe um limite não negativo com até seis casas decimais.
                    </p>
                  )}
                  {shown('Linhas para investigar') && rowsTable(selected)}
                </Section>
                <Section
                  title="Consumo por cliente e equipamento"
                  visible={shown('Consumo por cliente e equipamento') && !!statements.length}
                >
                  <InfoNote>
                    Vínculos confirmados por ICCID e MSISDN no mesmo registro do operacional. Casos
                    sem vínculo ficam identificados; a situação e a localização da fotografia
                    operacional podem diferir da época do consumo.
                  </InfoNote>
                  <Chart
                    compact
                    exportNote={chartNote}
                    ranking
                    items={[...clientGroups.values()].map((group) => ({
                      label: group.label,
                      value: group.ticks / VOLUME_SCALE,
                    }))}
                    title="Consumo por cliente na referência"
                    format={mb}
                  />
                  {shown('Consumo por cliente e equipamento') && rowsTable(selected)}
                </Section>
                <Section
                  title="Revisão dos vínculos"
                  visible={shown('Revisão dos vínculos') && !!statements.length}
                  defaultOpen={false}
                >
                  <p className="scope">
                    {selected.filter((row) => !row.link).length} registros do recorte sem
                    confirmação pelos dois identificadores. Não escolhemos um cliente
                    automaticamente quando existem conflitos ou duplicidades.
                  </p>
                  {shown('Revisão dos vínculos') && rowsTable(selected.filter((row) => !row.link))}
                </Section>

                <Section
                  title="Linha do tempo de consumo"
                  visible={shown('Linha do tempo de consumo') && !!statements.length}
                >
                  <InfoNote>
                    Histórico local identificado por operadora + ICCID. Exibe todas as apurações em
                    uso desse chip e as observações salvas, independentemente do período e dos
                    filtros do topo. MB por dia divide o consumo pela duração da apuração; períodos
                    sobrepostos não são somados. Marcações registram ações administrativas e não
                    comprovam correção de falha. O cliente e o equipamento atuais vêm da referência
                    operacional; cada anotação preserva o vínculo exibido na ação. CSV e XLSX
                    incluem contexto, apurações e acompanhamento. Imprimir / Salvar PDF apresenta os
                    registros salvos; o formulário e rascunhos ficam fora. Sem sincronização entre
                    usuários: use o backup para proteger ou transferir os dados.
                  </InfoNote>
                  <label className="line-tracked-select" data-no-print>
                    Buscar linha no histórico
                    <input
                      type="search"
                      value={lineSearch}
                      placeholder="Cliente, placa, número ou ICCID…"
                      onChange={(event) => setLineSearch(event.target.value)}
                    />
                  </label>
                  {lineSearch.trim() && (
                    <div className="history-search-results" data-no-print>
                      <p className="scope" role="status">
                        {historyMatches.length} linhas encontradas. Clique em uma opção para abrir o
                        histórico.
                      </p>
                      {!historyMatches.length && (
                        <p className="scope">
                          Nenhuma correspondência. Cliente e placa exigem vínculo confirmado com a
                          planilha operacional; você também pode buscar pelo número ou ICCID.
                        </p>
                      )}
                      <div className="history-search-list">
                        {historyMatches.map((row) => (
                          <button
                            key={chipKey(row)}
                            type="button"
                            onClick={() => {
                              setTracked(chipKey(row));
                              setDetail(null);
                              setLineSearch('');
                            }}
                          >
                            {row.link
                              ? `${row.link.client || 'Cliente não informado'} · ${row.link.plate || 'Placa não informada'}`
                              : 'Linha não identificada'}{' '}
                            · {row.operator} · {row.number} · ICCID {row.iccid}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <label className="line-tracked-select" data-no-print>
                    Chip para acompanhar{' '}
                    <select
                      value={tracked}
                      onChange={(event) => {
                        setTracked(event.target.value);
                        setDetail(null);
                      }}
                    >
                      <option value="">Selecione uma linha na tabela ou aqui</option>
                      {[
                        ...new Map(
                          allRows
                            .filter((row) => row.service === 'dados')
                            .map((row) => [chipKey(row), row]),
                        ).values(),
                      ]
                        .filter(
                          (row) =>
                            chipKey(row) === tracked ||
                            !lineSearch.trim() ||
                            [
                              row.number,
                              row.iccid,
                              row.operator,
                              row.link?.client,
                              row.link?.plate,
                            ].some((value) =>
                              String(value || '')
                                .toLocaleLowerCase('pt-BR')
                                .includes(lineSearch.trim().toLocaleLowerCase('pt-BR')),
                            ),
                        )
                        .sort((a, b) => a.number.localeCompare(b.number))
                        .map((row) => (
                          <option key={chipKey(row)} value={chipKey(row)}>
                            {row.operator} · {row.number} · {row.iccid} ·{' '}
                            {row.link
                              ? `${row.link.client || 'Cliente não informado'} · ${row.link.plate || 'Placa não informada'}`
                              : 'Linha não identificada'}
                          </option>
                        ))}
                    </select>
                  </label>
                  {trackedRow ? (
                    <>
                      <p className="scope">
                        {trackedRow.operator} · MSISDN {trackedRow.number} · ICCID{' '}
                        {trackedRow.iccid} · referência atual:{' '}
                        {trackedRow.link
                          ? `${trackedRow.link.client || 'Cliente não informado'} · Placa ${trackedRow.link.plate || 'não informada'}`
                          : 'Linha não identificada'}{' '}
                        / ID {trackedRow.link?.serial || 'Não informado'}. A linha do tempo usa
                        todas as apurações em uso desse chip, além do período selecionado no topo.
                      </p>
                      <div className="line-actions" data-no-print>
                        <PermissionButton action="export" onClick={() => exportLineHistory('xlsx')}>
                          Exportar histórico XLSX
                        </PermissionButton>
                        <PermissionButton action="export" onClick={() => exportLineHistory('csv')}>
                          Exportar histórico CSV
                        </PermissionButton>
                      </div>
                      <p className="scope">
                        {timeline.length} apurações · {notes.length} observações salvas · última
                        marcação por data da ação: {notes.at(-1)?.status || 'Sem acompanhamento'}.
                      </p>
                      {timeline.length < 2 && (
                        <p className="notice">
                          Há uma apuração deste chip. Importe novos períodos para acompanhar
                          mudanças no consumo.
                        </p>
                      )}
                      <Chart
                        compact
                        exportNote={chartNote}
                        type="line"
                        title="Consumo médio diário por apuração"
                        items={timeline.map((row) => ({ label: row.period, value: row.mbDay }))}
                        format={(value) => mb(value) + '/dia'}
                      />
                      <div className="table-scroll">
                        <SortableTable>
                          <thead>
                            <tr>
                              {[
                                'Apuração',
                                'Dias',
                                'MSISDN',
                                'Consumo MB',
                                'MB por dia',
                                'Arquivo',
                                'Linha CSV',
                              ].map((label) => (
                                <th key={label}>{label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timeline.map((row) => (
                              <tr key={row.id}>
                                <td>{row.period}</td>
                                <td>{row.days}</td>
                                <td>{row.number}</td>
                                <td data-sort={row.ticks}>{mb(row.mb)}</td>
                                <td data-sort={row.mbDay}>{mb(row.mbDay)}</td>
                                <td>{row.filename}</td>
                                <td>{row.sourceRow}</td>
                              </tr>
                            ))}
                          </tbody>
                        </SortableTable>
                      </div>
                      <InfoNote>
                        Apurações semanais e mensais podem se sobrepor. São observações separadas,
                        sem somar snapshots ou presumir o consumo de dias individuais.
                      </InfoNote>
                      <div className="line-note-form" data-no-print>
                        <label>
                          Data da ação
                          <input
                            type="date"
                            value={noteDate}
                            onChange={(event) => setNoteDate(event.target.value)}
                          />
                        </label>
                        <label>
                          Acompanhamento
                          <select
                            value={noteStatus}
                            onChange={(event) => setNoteStatus(event.target.value)}
                          >
                            {['Investigar', 'Ação realizada', 'Acompanhar', 'Encerrado'].map(
                              (status) => (
                                <option key={status}>{status}</option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="line-note-text">
                          Anotação
                          <textarea
                            value={noteText}
                            onChange={(event) => setNoteText(event.target.value)}
                            placeholder="Descreva a investigação, ajuste ou troca realizada…"
                          />
                        </label>
                        <button disabled={busy || !noteText.trim() || !noteDate} onClick={addNote}>
                          Salvar acompanhamento
                        </button>
                      </div>
                      {!notes.length && (
                        <p className="scope">Nenhuma observação salva para esta linha.</p>
                      )}
                      {!!notes.length && (
                        <ul className="visit-timeline">
                          {notes.map((note) => (
                            <li key={note.id}>
                              <strong>{note.date.split('-').reverse().join('/')}</strong>
                              <div className="timeline-entry">
                                <span className="timeline-status">{note.status}</span>
                                <span className="timeline-text">{note.text}</span>
                                {note.serial && (
                                  <small>
                                    Equipamento registrado na ação: {note.serial} · {note.client}
                                  </small>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="scope">
                      Selecione um chip para ver seu histórico e registrar as ações de investigação.
                    </p>
                  )}
                </Section>
                <Section
                  title="Mensalidades dos extratos"
                  visible={shown('Mensalidades dos extratos') && !!statements.length}
                  defaultOpen={false}
                >
                  <InfoNote>
                    Valores da Kore separados por serviço. Arqia não informa preços neste formato.
                    Valor Faturado e Valor Total são os campos do extrato; não confirmam pagamento.
                    Frete permanece separado e sem rateio por chip.
                  </InfoNote>
                  <div className="table-scroll">
                    <SortableTable>
                      <thead>
                        <tr>
                          {[
                            'Operadora',
                            'Serviço',
                            'Registros',
                            'Valor Faturado',
                            'Valor Multa',
                            'Valor Total',
                            'Valores totais válidos',
                          ].map((label) => (
                            <th key={label}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {providerStats.flatMap(({ operator }) =>
                          ['dados', 'sms'].map((service) => {
                            const records = invoiceRows.filter(
                              (row) => row.operator === operator && row.service === service,
                            );
                            return (
                              <tr key={operator + service}>
                                <td>{operator}</td>
                                <td>{service === 'dados' ? 'Dados móveis' : 'SMS'}</td>
                                <td>{records.length}</td>
                                <td data-sort={sumMoney(records, 'billedCents')}>
                                  {currency(sumMoney(records, 'billedCents'))}
                                </td>
                                <td data-sort={sumMoney(records, 'penaltyCents')}>
                                  {currency(sumMoney(records, 'penaltyCents'))}
                                </td>
                                <td data-sort={sumMoney(records, 'totalCents')}>
                                  {currency(sumMoney(records, 'totalCents'))}
                                </td>
                                <td>
                                  {records.filter((row) => row.totalCents != null).length} /{' '}
                                  {records.length}
                                </td>
                              </tr>
                            );
                          }),
                        )}
                        {providerStats.map(({ operator }) => {
                          const records = fees.filter((row) => row.operator === operator);
                          return (
                            <tr key={operator + 'fees'}>
                              <td>{operator}</td>
                              <td>Outros serviços dos extratos completos</td>
                              <td>{records.length}</td>
                              <td>{currency(sumMoney(records, 'billedCents'))}</td>
                              <td>{currency(sumMoney(records, 'penaltyCents'))}</td>
                              <td>{currency(sumMoney(records, 'totalCents'))}</td>
                              <td>
                                {records.filter((row) => row.totalCents != null).length} /{' '}
                                {records.length}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </SortableTable>
                  </div>
                </Section>
                <Section title="Arquivos e histórico" visible={shown('Arquivos e histórico')}>
                  <p className="scope">
                    Os arquivos originais, a referência operacional e as anotações ficam neste
                    navegador e endereço do dashboard. Exporte um backup para levar a outro
                    computador ou proteger o histórico. Uma nova versão do mesmo período arquiva a
                    anterior, sem apagá-la.
                  </p>
                  <div className="line-actions">
                    <PermissionButton
                      action="export"
                      disabled={busy || !ready}
                      onClick={exportBackup}
                    >
                      Baixar backup do histórico
                    </PermissionButton>
                    <PermissionButton
                      action="import"
                      disabled={busy || !ready}
                      onClick={() => backupInput.current.click()}
                    >
                      Revisar backup para restaurar
                    </PermissionButton>
                    {operational?.data && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          commit(
                            {
                              ...archive,
                              operational: { ...operational, savedAt: new Date().toISOString() },
                            },
                            'Referência operacional guardada.',
                          ).catch(() => {})
                        }
                      >
                        Guardar operacional atual no histórico
                      </button>
                    )}
                  </div>
                  {backup && (
                    <div className="notice">
                      <strong>
                        Backup conferido: {backup.files.length} arquivos e {backup.notes.length}{' '}
                        anotações.
                      </strong>
                      <p>
                        A restauração substitui o histórico deste navegador. Baixe o backup atual
                        antes de prosseguir, se quiser preservá-lo.
                      </p>
                      <div className="line-actions">
                        <PermissionButton action="import" disabled={busy} onClick={restoreBackup}>
                          Restaurar substituindo o histórico atual
                        </PermissionButton>
                        <button disabled={busy} onClick={() => setBackup(null)}>
                          Cancelar restauração
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="table-scroll">
                    <SortableTable>
                      <thead>
                        <tr>
                          {['Arquivo', 'Operadora', 'Apuração', 'Registros', 'Versão', 'Ação'].map(
                            (label) => (
                              <th key={label}>{label}</th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {archive.files.map((file) => {
                          const parsed = importLineStatement(file.text, file.filename, file.id);
                          return (
                            <tr key={file.id}>
                              <td>{file.filename}</td>
                              <td>{parsed.operator}</td>
                              <td>{parsed.periods.map((period) => period.label).join(' / ')}</td>
                              <td>{parsed.rows.length}</td>
                              <td>{file.active === false ? 'Arquivada' : 'Em uso'}</td>
                              <td>
                                <button disabled={busy} onClick={() => changeVersion(file)}>
                                  {file.active === false ? 'Reativar versão' : 'Arquivar versão'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </SortableTable>
                  </div>
                </Section>
                {selectedDetail && (
                  <section className="panel line-source">
                    <button onClick={() => setDetail(null)}>Fechar registros de origem</button>
                    <h2>
                      {selectedDetail.operator} · {selectedDetail.number} · ICCID{' '}
                      {selectedDetail.iccid}
                    </h2>
                    <p className="scope">
                      {selectedDetail.filename} · linha {selectedDetail.sourceRow}.{' '}
                      {selectedDetail.problems.join('; ') || 'Sem problemas na apuração de dados.'}{' '}
                      {selectedDetail.linkState}.
                    </p>
                    <div className="table-scroll">
                      <SortableTable>
                        <thead>
                          <tr>
                            <th>Campo original</th>
                            <th>Valor original</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statements
                            .find((statement) => statement.id === selectedDetail.statementId)
                            .headers.map((header, index) => (
                              <tr key={index}>
                                <td>{header}</td>
                                <td>{selectedDetail.cells[index]}</td>
                              </tr>
                            ))}
                        </tbody>
                      </SortableTable>
                    </div>
                    {!!selectedDetail.candidates.length && (
                      <>
                        <h3>Registros encontrados no operacional</h3>
                        <div className="table-scroll">
                          <SortableTable>
                            <thead>
                              <tr>
                                {[
                                  'Linha Excel',
                                  'Cliente',
                                  'ID equipamento',
                                  'MSISDN',
                                  'ICCID',
                                  'Placa',
                                  'Situação',
                                ].map((label) => (
                                  <th key={label}>{label}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDetail.candidates.map((row) => (
                                <tr key={row.sourceRow}>
                                  <td>{row.sourceRow}</td>
                                  <td>{row.client}</td>
                                  <td>{row.serial}</td>
                                  <td>{row.phone}</td>
                                  <td>{row.iccid}</td>
                                  <td>{row.plate}</td>
                                  <td>{row.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </SortableTable>
                        </div>
                      </>
                    )}
                  </section>
                )}
              </main>
            </div>
          </PrintContext.Provider>
        </ExpansionContext.Provider>
      </HiddenSectionsContext.Provider>
    </SidePanelProvider>
  );
}
