/** Estado visual compartilhado: gravação explícita, registro de capacidades e revelação temporária de relatórios. */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { readLayout, mergeLayout } from './pageLayout.js';

export const PageLayoutContext = createContext(null);

export function usePageLayout(page, legacy) {
  const key = `addlog-page-layout-${page}-v1`;
  const [reports, setReports] = useState(() => {
    try {
      return readLayout(localStorage, key, legacy);
    } catch {
      return {};
    }
  });
  const [revealed, setRevealed] = useState({});
  const effective = useMemo(() => ({ ...reports, ...revealed }), [reports, revealed]);
  const save = useCallback(
    (patch) => {
      const next = mergeLayout(reports, patch);
      let persisted = true;
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, reports: next }));
      } catch {
        persisted = false;
      }
      setReports(next);
      setRevealed((previous) =>
        Object.fromEntries(Object.entries(previous).filter(([id]) => !(id in patch))),
      );
      return persisted;
    },
    [reports, key],
  );
  // A ação Acompanhar deve abrir o histórico, mesmo se a preferência inicial o ocultar/recolher.
  const reveal = useCallback(
    (id) => setRevealed((previous) => ({ ...previous, [id]: { visible: true, mode: 'complete' } })),
    [],
  );
  return { reports, effective, save, reveal };
}

/** Definições são estáticas; a capacidade de resumo vem da Section realmente montada, sem inferência pelo título. */
export function PageLayoutProvider({ layout, definitions, activeIds, scope, children }) {
  const [capabilities, setCapabilities] = useState({});
  const knownTitles = useMemo(() => new Set(definitions.map((item) => item.title)), [definitions]);
  const register = useCallback(
    (title, hasSummary) => {
      if (!knownTitles.has(title)) return;
      setCapabilities((previous) =>
        previous[title] === hasSummary && Object.hasOwn(previous, title)
          ? previous
          : { ...previous, [title]: hasSummary },
      );
      return () =>
        setCapabilities((previous) => {
          if (!Object.hasOwn(previous, title)) return previous;
          const next = { ...previous };
          delete next[title];
          return next;
        });
    },
    [knownTitles],
  );
  const entries = useMemo(
    () => Object.fromEntries(definitions.map((item) => [item.title, layout.effective[item.id]])),
    [definitions, layout.effective],
  );
  const value = useMemo(
    () => ({ layout, definitions, activeIds, scope, capabilities, entries, register }),
    [layout, definitions, activeIds, scope, capabilities, entries, register],
  );
  return <PageLayoutContext.Provider value={value}>{children}</PageLayoutContext.Provider>;
}
export const useLayoutContext = () => useContext(PageLayoutContext);
