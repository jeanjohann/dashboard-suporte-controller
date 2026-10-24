/** Lê ao abrir/retornar à página. O relógio dos lembretes não usa a referência congelada da demonstração. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';
import { reminderScope } from '../data/reminderRepository.js';
import { createConfiguredReminderRepository } from '../data/remoteReminderRepository.js';

export function useMonitoringReminders(demo, active = true) {
  const { user, managed } = useAccess();
  const scope = reminderScope(user, managed, demo);
  const repository = useMemo(
    () => createConfiguredReminderRepository({ scope, managed, demo }),
    [scope, managed, demo],
  );
  const current = useRef(repository);
  current.current = repository;
  const [state, setState] = useState({ repository: null, records: [], loading: true, error: '' });
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date().toISOString());
  const channel = useRef(null);
  async function reload() {
    const target = repository;
    try {
      const records = await target.read();
      if (current.current === target)
        setState({ repository: target, records, loading: false, error: '' });
    } catch (error) {
      if (current.current === target)
        setState((previous) => ({
          repository: target,
          records: previous.repository === target ? previous.records : [],
          loading: false,
          error: error.message || 'Não foi possível carregar os lembretes.',
        }));
    }
  }
  useEffect(() => {
    if (!active) return;
    reload();
    const refresh = () => {
      setNow(new Date().toISOString());
      reload();
    };
    const visibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const timer = setInterval(() => setNow(new Date().toISOString()), 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visibility);
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel.current = new BroadcastChannel('addlog-monitoring-reminders');
        channel.current.onmessage = (event) => {
          if (event.data === scope) refresh();
        };
      } catch {
        // Alguns navegadores restringem o canal; leitura ao retornar à aba continua disponível.
        channel.current = null;
      }
    }
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', visibility);
      channel.current?.close();
    };
  }, [repository, active]);
  const available = state.repository === repository;
  async function change(vehicle, revision, action, draft) {
    if (!available || state.loading || state.error || saving)
      throw Error('Aguarde a leitura dos lembretes ou tente carregá-los novamente.');
    const target = repository;
    setSaving(true);
    try {
      const records = await target.change(vehicle, revision, action, draft);
      if (current.current === target) {
        setState({ repository: target, records, loading: false, error: '' });
        channel.current?.postMessage(scope);
      }
    } catch (error) {
      await reload();
      throw error;
    } finally {
      setSaving(false);
    }
  }
  async function migrate() {
    if (saving || state.loading) return;
    setSaving(true);
    try {
      await repository.migrate();
      await reload();
    } catch (error) {
      if (current.current === repository)
        setState((previous) => ({ ...previous, error: error.message }));
    } finally {
      setSaving(false);
    }
  }
  return {
    records: available ? state.records : [],
    now,
    loading: !available || state.loading,
    error: available ? state.error : '',
    saving,
    change,
    reload,
    migrate,
    mode: repository.mode,
    migration: repository.migration,
    migrationResults: repository.migrationResults,
  };
}
