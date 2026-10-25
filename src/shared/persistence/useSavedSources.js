/** Carrega bases salvas sob demanda e só aplica cada conjunto após confirmar sua integridade. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createSourceSnapshotClient, readSourceCatalog } from './sourceSnapshotClient.js';

const sourceKinds = ['orders', 'operational', 'logistics'];

export function useSavedSources({ user, managed, onApply, requiredKinds = [] }) {
  const client = useMemo(() => createSourceSnapshotClient(), [user?.email]);
  const [state, setState] = useState({
    loading: managed,
    busy: false,
    error: '',
    enabled: false,
    initialized: !managed,
    catalog: {},
    message: '',
    progress: 0,
  });
  const current = useRef(client),
    catalog = useRef({}),
    ready = useRef(!managed),
    enabled = useRef(false),
    initialization = useRef(null),
    loadingRequest = useRef(null),
    loadGeneration = useRef(0),
    loadQueue = useRef(Promise.resolve()),
    loadedKinds = useRef(new Set()),
    locked = useRef(false),
    apply = useRef(onApply);
  apply.current = onApply;
  current.current = client;

  async function initialize() {
    if (!managed) return false;
    if (ready.current) return enabled.current;
    if (initialization.current) return initialization.current;
    const target = client;
    setState((s) => ({ ...s, loading: true, error: '', progress: 0 }));
    const task = (async () => {
      const status = await client.status();
      if (status.version !== 1 || typeof status.permitted !== 'boolean')
        throw Error('Configuração das bases incompatível.');
      if (current.current !== target) return false;
      if (!status.permitted) {
        catalog.current = {};
        enabled.current = false;
        ready.current = true;
        setState({
          loading: false,
          busy: false,
          error: '',
          enabled: false,
          initialized: true,
          catalog: {},
          message: '',
          progress: 0,
        });
        return false;
      }
      const next = await client.catalog();
      if (current.current !== target) return false;
      catalog.current = next;
      enabled.current = true;
      ready.current = true;
      setState((s) => ({
        ...s,
        loading: false,
        busy: false,
        error: '',
        enabled: true,
        initialized: true,
        catalog: next,
        progress: 0,
      }));
      return true;
    })();
    initialization.current = task;
    try {
      return await task;
    } catch (error) {
      if (current.current === target) {
        ready.current = false;
        initialization.current = null;
        setState((s) => ({
          ...s,
          loading: false,
          initialized: false,
          error: error.message || 'Não foi possível conferir as bases salvas.',
        }));
      }
      throw error;
    }
  }

  async function loadKindsNow(kinds) {
    if (!(await initialize())) return;
    if (!ready.current || !enabled.current || current.current !== client) return;
    const requested = [...new Set(kinds)].filter((kind) => sourceKinds.includes(kind));
    const missing = requested.filter((kind) => !loadedKinds.current.has(kind));
    if (!missing.length) return;
    const heads = Object.fromEntries(
      missing.filter((kind) => catalog.current[kind]).map((kind) => [kind, catalog.current[kind]]),
    );
    if (!Object.keys(heads).length) {
      missing.forEach((kind) => loadedKinds.current.add(kind));
      return;
    }
    if (locked.current) throw Error('Aguarde a gravação das bases antes de carregá-las.');

    const target = client,
      run = loadGeneration.current,
      totalBytes = Object.values(heads).reduce((sum, head) => sum + (head?.bytes || 0), 0),
      received = {};
    const controller = new AbortController();
    loadingRequest.current = controller;
    setState((s) => ({ ...s, loading: true, error: '', progress: 0 }));
    try {
      const sources = await readSourceCatalog(client, heads, {
        signal: controller.signal,
        onProgress: (kind, bytes) => {
          if (current.current !== target || loadGeneration.current !== run) return;
          received[kind] = bytes;
          const progress = totalBytes
            ? Math.min(
                99,
                Math.floor(
                  (Object.values(received).reduce((sum, value) => sum + value, 0) / totalBytes) *
                    100,
                ),
              )
            : 0;
          setState((s) => (s.progress === progress ? s : { ...s, progress }));
        },
      });
      if (current.current !== target || loadGeneration.current !== run) return;
      missing.forEach((kind) => loadedKinds.current.add(kind));
      apply.current(sources);
      setState((s) => ({ ...s, loading: false, error: '', progress: 100 }));
    } catch (error) {
      if (current.current === target && loadGeneration.current === run)
        setState((s) => ({
          ...s,
          loading: false,
          error: error.message || 'Não foi possível carregar as bases solicitadas.',
        }));
      throw error;
    } finally {
      if (loadingRequest.current === controller) loadingRequest.current = null;
    }
  }

  function loadKinds(kinds) {
    const task = loadQueue.current.catch(() => {}).then(() => loadKindsNow(kinds));
    loadQueue.current = task.catch(() => {});
    return task;
  }

  async function reload() {
    if (!managed || locked.current) return;
    loadGeneration.current++;
    loadingRequest.current?.abort();
    loadingRequest.current = null;
    loadQueue.current = Promise.resolve();
    loadedKinds.current.clear();
    catalog.current = {};
    enabled.current = false;
    ready.current = false;
    initialization.current = null;
    apply.current({ orders: null, operational: null, logistics: null });
    setState((s) => ({
      ...s,
      loading: true,
      error: '',
      initialized: false,
      catalog: {},
      progress: 0,
    }));
    try {
      if (await initialize()) await loadKinds(sourceKinds);
    } catch {}
  }

  useEffect(() => {
    current.current = client;
    loadedKinds.current = new Set();
    catalog.current = {};
    enabled.current = false;
    ready.current = !managed;
    initialization.current = null;
    loadQueue.current = Promise.resolve();
    apply.current({ orders: null, operational: null, logistics: null });
    if (managed) initialize().catch(() => {});
    else
      setState({
        loading: false,
        busy: false,
        error: '',
        enabled: false,
        initialized: true,
        catalog: {},
        message: '',
        progress: 0,
      });
    return () => {
      current.current = null;
      loadingRequest.current?.abort();
      loadGeneration.current++;
    };
  }, [client, managed]);

  const requiredKey = requiredKinds.join('|');
  useEffect(() => {
    if (managed && state.initialized && state.enabled) loadKinds(requiredKinds).catch(() => {});
  }, [managed, state.initialized, state.enabled, requiredKey]);

  async function save(sources) {
    if (!ready.current) {
      await initialize();
      if (!ready.current) throw Error('Confira o carregamento das bases salvas antes de importar.');
    }
    if (state.error) throw Error('Confira o carregamento das bases salvas antes de importar.');
    if (!enabled.current) {
      apply.current(sources);
      return;
    }
    if (locked.current) throw Error('Aguarde a gravação da base em andamento.');
    locked.current = true;
    setState((s) => ({ ...s, busy: true, message: 'Salvando a base completa no banco…' }));
    const target = client;
    try {
      const result = await client.save(sources, catalog.current);
      if (current.current !== target) return;
      catalog.current = result.catalog;
      for (const kind of Object.keys(result.sources)) loadedKinds.current.add(kind);
      apply.current(result.sources);
      setState((s) => ({
        ...s,
        busy: false,
        catalog: result.catalog,
        message: 'Base completa salva. Os relatórios usam somente a versão ativa.',
      }));
    } catch (error) {
      if (current.current === target)
        setState((s) => ({ ...s, busy: false, message: '', error: error.message }));
      throw error;
    } finally {
      locked.current = false;
    }
  }
  return { ...state, reload, loadKinds, save };
}
