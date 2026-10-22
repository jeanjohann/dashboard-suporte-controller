/** Separa fonte e tela. Demonstração nunca é fallback de erro; atualização real é explícita nesta etapa. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMonitoringSnapshot } from '../data/monitoringClient.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { api } from '../../../shared/security/accessClient.js';
import { fetchSavedMonitoring } from '../data/savedMonitoringClient.js';

export function useMonitoringSource() {
  const { user, managed } = useAccess();
  const persistent = useRef(false),
    ready = useRef(!managed);
  const [savedAt, setSavedAt] = useState(null),
    [savedMode, setSavedMode] = useState(false),
    [lastAttempt, setLastAttempt] = useState(null);
  const [source, setSource] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date().toISOString());
  const [nextReadAt, setNextReadAt] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const request = useRef(null),
    generation = useRef(0);
  const real = source && !source.demonstration;
  useEffect(() => {
    if (!managed) return;
    const controller = new AbortController();
    let live = true;
    ready.current = false;
    generation.current++;
    request.current?.abort();
    request.current = null;
    persistent.current = false;
    setSource(null);
    setSavedAt(null);
    setSavedMode(false);
    setLastAttempt(null);
    setBusy(true);
    async function load() {
      try {
        const status = await api('/api/sources/status', { signal: controller.signal });
        if (status.version !== 1 || typeof status.permitted !== 'boolean')
          throw Error('Configuração do monitoramento salvo incompatível.');
        if (!live) return;
        persistent.current = status.permitted;
        setSavedMode(status.permitted);
        if (status.permitted) {
          const data = await fetchSavedMonitoring({ signal: controller.signal });
          if (!live) return;
          setSource(data.snapshot);
          setSavedAt(data.savedAt);
          setLastAttempt(data.lastAttempt);
          setNow(new Date().toISOString());
        }
        ready.current = true;
        setError('');
      } catch (error) {
        if (live) setError(error.message);
      } finally {
        if (live) setBusy(false);
      }
    }
    load();
    return () => {
      live = false;
      controller.abort();
    };
  }, [managed, user?.email]);
  async function reloadSaved() {
    if (!persistent.current || request.current) return;
    const controller = new AbortController(),
      run = generation.current;
    request.current = controller;
    try {
      const data = await fetchSavedMonitoring({ signal: controller.signal });
      if (generation.current !== run) return;
      setSource(data.snapshot);
      setSavedAt(data.savedAt);
      setLastAttempt(data.lastAttempt);
      setNow(new Date().toISOString());
      setError('');
    } catch (error) {
      if (generation.current === run) setError(error.message);
    } finally {
      if (request.current === controller) request.current = null;
    }
  }
  useEffect(() => {
    if (!savedMode) return;
    const tick = () => {
      if (document.visibilityState === 'visible') reloadSaved();
    };
    const timer = setInterval(tick, 300000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', tick);
    };
  }, [savedMode]);
  useEffect(() => {
    if (!nextReadAt) return;
    const update = () => setCooldown(Math.max(0, Math.ceil((nextReadAt - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [nextReadAt]);
  useEffect(() => {
    if (!real) return;
    // Atualiza a idade dos dados localmente; isto não consulta a API nem executa o coletor.
    const timer = setInterval(() => setNow(new Date().toISOString()), 60000);
    return () => clearInterval(timer);
  }, [Boolean(real)]);
  useEffect(
    () => () => {
      generation.current++;
      request.current?.abort();
    },
    [],
  );
  async function refresh() {
    if (!ready.current) {
      setError(
        'Não foi possível conferir a base salva. Recarregue a página antes de atualizar a integração.',
      );
      return;
    }
    if (request.current || Date.now() < nextReadAt) return;
    setNextReadAt(Date.now() + 60000);
    setCooldown(60);
    const run = ++generation.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 20000);
    setBusy(true);
    setError('');
    try {
      let next;
      if (persistent.current) {
        const data = await fetchSavedMonitoring({ refresh: true, signal: controller.signal });
        if (generation.current !== run) return;
        next = data.snapshot;
        setSavedAt(data.savedAt);
        setLastAttempt(data.lastAttempt);
      } else next = await fetchMonitoringSnapshot({ signal: controller.signal });
      if (generation.current !== run) return;
      setNow(new Date().toISOString());
      setSource(next);
    } catch (failure) {
      if (generation.current !== run) return;
      setError(
        controller.signal.aborted
          ? 'A consulta demorou além do limite. Tente novamente.'
          : failure.message,
      );
      // Em falha, mantém a última frota conhecida, mas nenhuma coleta fica utilizável para novos alertas.
      setSource((previous) =>
        previous && !previous.demonstration
          ? {
              ...previous,
              collections: previous.collections.map((entry) => ({ ...entry, ok: false })),
            }
          : previous,
      );
    } finally {
      clearTimeout(timer);
      if (generation.current === run) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  const snapshot = useMemo(
    () => (real ? { ...source, referenceAt: now } : source),
    [source, now, real],
  );
  return {
    snapshot,
    source,
    busy,
    cooldown,
    error,
    refresh,
    savedMode,
    savedAt,
    lastAttempt,
    reloadSaved,
  };
}
