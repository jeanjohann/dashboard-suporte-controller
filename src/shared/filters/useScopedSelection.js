/** Estado somente da sessão: navegar conserva cada seleção; outra categoria nunca herda filtros silenciosamente. */
import { useCallback, useState } from 'react';
import { emptySelection, selectionCount, updateScopedField } from './scopedSelection.js';

export function useScopedSelection(scope, createFilters = () => ({})) {
  const [initial] = useState(() => ({ ...emptySelection(), filters: createFilters() }));
  const [selections, setSelections] = useState({});
  const setFilters = useCallback(
    (value, target = scope) =>
      setSelections((previous) => updateScopedField(previous, target, 'filters', value, initial)),
    [scope, initial],
  );
  const setSearch = useCallback(
    (value) =>
      setSelections((previous) => updateScopedField(previous, scope, 'search', value, initial)),
    [scope, initial],
  );
  const setExtraColumns = useCallback(
    (value) =>
      setSelections((previous) =>
        updateScopedField(previous, scope, 'extraColumns', value, initial),
      ),
    [scope, initial],
  );
  const resetSelections = useCallback(() => setSelections({}), []);
  const current = selections[scope] || initial;
  return {
    ...current,
    setFilters,
    setSearch,
    setExtraColumns,
    resetSelections,
    counts: Object.fromEntries(
      Object.entries(selections).map(([key, value]) => [
        key,
        selectionCount(value, initial.filters),
      ]),
    ),
  };
}
