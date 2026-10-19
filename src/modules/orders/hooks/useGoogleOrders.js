/** Piloto opt-in: a base Google fica na sessão e só é atualizada na página de OS visível. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';
import { api } from '../../../shared/security/accessClient.js';
import { importGoogleOrders } from '../data/googleOrders.js';

export const googleRefreshInterval = 15 * 60 * 1000;

export function useGoogleOrders({
  source,
  onImport,
  active,
  manualBusy,
  endpoint = '/api/orders/google',
  importer = importGoogleOrders,
}) {
  const { user, managed } = useAccess();
  const allowed = managed && user?.active && user.role === 'admin';
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [automatic, setAutomatic] = useState(true);
  const request = useRef(null);
  const latest = useRef();
  latest.current = { source, onImport, active, allowed, manualBusy };
  const connected = source?.origin === 'google';

  // Ignora respostas antigas, inclusive após troca por arquivo local, navegação ou revogação de acesso.
  const cancel = useCallback(() => {
    request.current?.abort();
    request.current = null;
    setBusy(false);
  }, []);
  useEffect(() => {
    if (!active || !allowed || manualBusy) cancel();
    return cancel;
  }, [active, allowed, manualBusy, cancel]);
  useEffect(() => {
    if (!connected) cancel();
  }, [source, connected, cancel]);

  const checkStatus = useCallback(async () => {
    if (!latest.current.allowed) return;
    setError('');
    try {
      const result = await api(`${endpoint}/status`, { signal: AbortSignal.timeout(10000) });
      if (latest.current.allowed) setStatus(result);
    } catch {
      if (latest.current.allowed) setError('Não foi possível conferir a conexão. Tente novamente.');
    }
  }, [endpoint]);

  const refresh = useCallback(async () => {
    const start = latest.current;
    if (!start.allowed || !start.active || start.manualBusy || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 35000);
    setBusy(true);
    setError('');
    try {
      const snapshot = await api(`${endpoint}/snapshot`, { signal: controller.signal });
      const next = importer(snapshot);
      const current = latest.current;
      if (
        request.current === controller &&
        !controller.signal.aborted &&
        current.allowed &&
        current.active &&
        !current.manualBusy &&
        current.source === start.source
      )
        current.onImport(next);
    } catch (e) {
      if (request.current === controller && latest.current.allowed && latest.current.active)
        setError(
          controller.signal.aborted
            ? 'A consulta demorou demais. A base anterior foi mantida; tente atualizar novamente.'
            : e.message,
        );
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }, [endpoint, importer]);

  useEffect(() => {
    if (open && active && allowed) checkStatus();
  }, [open, active, allowed, checkStatus]);
  useEffect(() => {
    if (!connected || !automatic || !active || !allowed || manualBusy) return;
    // Não consulta em abas do navegador ocultas. Retomar permite nova tentativa, sem rajada de requisições.
    const tick = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - Date.parse(latest.current.source?.googleReadAt) >= googleRefreshInterval
      )
        refresh();
    };
    tick();
    const timer = setInterval(tick, googleRefreshInterval);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [connected, automatic, active, allowed, manualBusy, refresh]);

  return {
    allowed,
    open,
    setOpen,
    status,
    error,
    busy,
    automatic,
    setAutomatic,
    connected,
    refresh,
    checkStatus,
    readAt: source?.googleReadAt,
  };
}
