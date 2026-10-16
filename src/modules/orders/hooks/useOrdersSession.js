/** Estado da base de OS: importação autorizada, filtros, busca/paginação, referência e resultados. */
import { useEffect, useRef, useState } from 'react';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { importWorkbook } from '../data/import.js';
import { summarize, finance } from '../domain/analysis.js';
import { applyFilters, attendanceExtent, monthlyCompleted } from '../../../shared/data/filters.js';
import { equipment } from '../domain/equipment.js';
import { observedPeriods, todaySaoPaulo } from '../domain/lifecycle.js';
import { searchOrderRecords, sortOrderRecords } from '../domain/orderRecords.js';
import { reviewOrderConsistency } from '../domain/orderReview.js';

/** A base pertence ao Workspace; falhas de importação não a substituem. Busca textual afeta apenas a tabela. */
export function useOrdersSession({ source, onImport }) {
  const input = useRef();
  const previousSource = useRef(source);
  const [recordSort, setRecordSort] = useState(null);
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
  /** Reconsulta a autorização antes da leitura e aplica a base somente após o importador concluir. */
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
  // Mudança de fonte inclui importação conjunta; trocar de categoria ou página não reinicia a seleção.
  useEffect(() => {
    const isRefresh = source?.origin === 'google' && previousSource.current?.origin === 'google';
    previousSource.current = source;
    if (isRefresh) {
      setPage(0);
      return;
    }
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
  const filtered = searchOrderRecords(selected?.rows ?? [], search);
  const orderedRecords = sortOrderRecords(filtered, recordSort);
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
        ...reviewOrderConsistency(selected),
        ...(financial?.issues ?? []),
        ...(devices?.issues ?? []),
        ...(lifecycle?.review ?? []),
      ]
    : [];
  /** Recria filtros adicionais da configuração e reinicia somente busca e paginação. */
  function restoreFilters(saved) {
    setFilters(saved);
    setExtraColumns(
      Object.keys(saved)
        .filter((key) => key.startsWith('column:'))
        .map((key) => Number(key.slice(7))),
    );
    setPage(0);
    setSearch('');
  }
  return {
    input,
    data,
    filename,
    error,
    busy,
    load,
    filters,
    setFilters,
    changeFilter,
    extraColumns,
    setExtraColumns,
    referenceDate,
    setReferenceDate,
    cycleState,
    setCycleState,
    importedPeriod,
    selected,
    summary,
    financial,
    monthly,
    devices,
    lifecycle,
    displayedPeriods,
    review,
    restoreFilters,
    records: {
      search,
      setSearch,
      page,
      setPage,
      view,
      setView,
      filtered,
      orderedRecords,
      pageCount,
      recordSort,
      setRecordSort,
    },
  };
}
