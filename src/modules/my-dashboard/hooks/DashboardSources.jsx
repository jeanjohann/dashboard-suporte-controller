import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';
import { createSourceStore } from '../domain/sourceStore.js';

const SourceContext = createContext(null);
function Session({ children }) {
  const [store] = useState(createSourceStore);
  return <SourceContext.Provider value={store}>{children}</SourceContext.Provider>;
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
const empty = {};
const noop = () => () => {};
export function useDashboardSources(active = true) {
  const store = useContext(SourceContext);
  const retained = useRef(store?.getSnapshot() || empty);
  const sources = useSyncExternalStore(active ? store?.subscribe || noop : noop, () =>
    active ? store?.getSnapshot() || empty : retained.current,
  );
  if (active) retained.current = sources;
  return { sources, publish: store?.publish };
}
export function useDashboardSource(key) {
  const store = useContext(SourceContext);
  return useSyncExternalStore(store?.subscribe || noop, () => store?.getSnapshot()[key]);
}
export function usePublishDashboardSource(key, value) {
  const publish = useContext(SourceContext)?.publish;
  useEffect(() => {
    publish?.(key, value);
  }, [publish, key, value]);
}
