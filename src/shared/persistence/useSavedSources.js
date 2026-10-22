/** Bases completas do piloto: carregamento inicial e confirmação do servidor antes da troca da sessão. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createSourceSnapshotClient } from './sourceSnapshotClient.js';
export function useSavedSources({ user, managed, onApply }) {
  const client = useMemo(() => createSourceSnapshotClient(), [user?.email]);
  const [state, setState] = useState({
    loading: managed,
    busy: false,
    error: '',
    enabled: false,
    catalog: {},
    message: '',
  });
  const current = useRef(null),
    catalog = useRef({}),
    ready = useRef(!managed),
    loadGeneration = useRef(0),
    locked = useRef(false),
    apply = useRef(onApply);
  apply.current = onApply;
  current.current = client;
  async function reload() {
    if (!managed || locked.current) return;
    const target = client,
      run = ++loadGeneration.current;
    ready.current = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const status = await client.status();
      if (status.version !== 1 || typeof status.permitted !== 'boolean')
        throw Error('Configuração das bases incompatível.');
      if (current.current !== target || loadGeneration.current !== run) return;
      if (!status.permitted) {
        ready.current = true;
        setState({
          loading: false,
          busy: false,
          enabled: false,
          error: '',
          catalog: {},
          message: '',
        });
        return;
      }
      const next = await client.catalog(),
        sources = {};
      for (const [kind, head] of Object.entries(next))
        sources[kind] = await client.read(kind, head);
      if (current.current !== target || loadGeneration.current !== run) return;
      catalog.current = next;
      ready.current = true;
      apply.current(sources);
      setState({
        loading: false,
        busy: false,
        enabled: true,
        error: '',
        catalog: next,
        message: '',
      });
    } catch (error) {
      if (current.current === target && loadGeneration.current === run)
        setState((s) => ({
          ...s,
          loading: false,
          error: error.message || 'Não foi possível carregar as bases salvas.',
        }));
    }
  }
  useEffect(() => {
    current.current = client;
    ready.current = !managed;
    apply.current({ orders: null, operational: null, logistics: null });
    reload();
    return () => {
      current.current = null;
      loadGeneration.current++;
    };
  }, [client, managed]);
  async function save(sources) {
    if (!ready.current || state.error)
      throw Error('Confira o carregamento das bases salvas antes de importar.');
    if (!state.enabled) {
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
  return { ...state, reload, save };
}
