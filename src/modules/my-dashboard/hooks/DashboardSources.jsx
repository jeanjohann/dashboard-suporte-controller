import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';

const SourceContext = createContext(null);
function Session({ children }) {
  const [sources, setSources] = useState({});
  const publish = useCallback(
    (key, value) =>
      setSources((old) =>
        old[key]?.value === value
          ? old
          : { ...old, [key]: value ? { value, loadedAt: new Date().toISOString() } : null },
      ),
    [],
  );
  const value = useMemo(() => ({ sources, publish }), [sources, publish]);
  return <SourceContext.Provider value={value}>{children}</SourceContext.Provider>;
}
export function DashboardSourcesProvider({ children }) {
  const { user, managed } = useAccess();
  const key = JSON.stringify([
    managed,
    user?.email,
    user?.role,
    user?.active,
    [...(user?.pages || [])].sort(),
    user?.canImport,
    user?.canExport,
    user?.canDashboard,
  ]);
  return <Session key={key}>{children}</Session>;
}
export const useDashboardSources = () => useContext(SourceContext);
export function usePublishDashboardSource(key, value) {
  const publish = useContext(SourceContext)?.publish;
  useEffect(() => {
    publish?.(key, value);
  }, [publish, key, value]);
}
