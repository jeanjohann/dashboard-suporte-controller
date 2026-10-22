/** Separa fonte e tela. Demonstração nunca é fallback de erro; atualização real é explícita nesta etapa. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMonitoringSnapshot } from '../data/monitoringClient.js';

export function useMonitoringSource() {
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
      const next = await fetchMonitoringSnapshot({ signal: controller.signal });
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
  return { snapshot, source, busy, cooldown, error, refresh };
}
