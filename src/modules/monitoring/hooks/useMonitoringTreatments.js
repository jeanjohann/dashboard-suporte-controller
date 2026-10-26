/** Carrega o histórico de tratamento do D1 do piloto ou do armazenamento local isolado. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';
import { treatmentScope } from '../data/treatmentRepository.js';
import { createConfiguredTreatmentRepository } from '../data/remoteTreatmentRepository.js';

function byKey(records) {
  return Object.fromEntries(records.map((record) => [record.key, record]));
}

export function useMonitoringTreatments(demo, active = true) {
  const { user, managed } = useAccess();
  const scope = treatmentScope(user, managed, demo);
  const repository = useMemo(
    () => createConfiguredTreatmentRepository({ scope, managed, demo }),
    [scope, managed, demo],
  );
  const current = useRef(repository);
  current.current = repository;
  const [state, setState] = useState({ repository: null, records: {}, loading: true, error: '' });
  const [saving, setSaving] = useState(false);

  async function reload() {
    const target = repository;
    try {
      const records = await target.read();
      if (current.current === target)
        setState({ repository: target, records: byKey(records), loading: false, error: '' });
    } catch (error) {
      if (current.current === target)
        setState((previous) => ({
          repository: target,
          records: previous.repository === target ? previous.records : {},
          loading: false,
          error: error.message || 'Não foi possível carregar o acompanhamento salvo.',
        }));
    }
  }

  useEffect(() => {
    if (!active) return;
    reload();
    const refresh = () => {
      if (document.visibilityState === 'visible') reload();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('addlog-monitoring-treatments');
        channel.onmessage = (event) => {
          if (event.data === scope) refresh();
        };
      } catch {
        channel = null;
      }
    }
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      channel?.close();
    };
  }, [repository, active]);

  const available = state.repository === repository;
  async function change(vehicle, draft, expectedRevision = 0) {
    if (!available || state.loading || state.error || saving)
      throw Error('Aguarde a leitura do acompanhamento ou carregue-o novamente.');
    const target = repository;
    setSaving(true);
    try {
      const records = await target.change(vehicle, draft, expectedRevision);
      if (current.current === target) {
        setState({ repository: target, records: byKey(records), loading: false, error: '' });
        try {
          const channel = new BroadcastChannel('addlog-monitoring-treatments');
          channel.postMessage(scope);
          channel.close();
        } catch {}
      }
    } catch (error) {
      await reload();
      throw error;
    } finally {
      setSaving(false);
    }
  }

  return {
    records: available ? state.records : {},
    loading: !available || state.loading,
    error: available ? state.error : '',
    saving,
    mode: repository.mode,
    change,
    reload,
  };
}
