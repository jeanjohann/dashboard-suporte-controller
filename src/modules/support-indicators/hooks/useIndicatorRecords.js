import { useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/security/accessClient.js';
import { previousPeriod, defaultSettings } from '../domain/indicators.js';

async function readEntries(period, signal) {
  const records = [],
    seen = new Set();
  let after;
  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams(period);
    if (after) params.set('after', after);
    const data = await api('/api/support-indicators/entries?' + params, { signal });
    if (data.version !== 1 || !Array.isArray(data.records))
      throw Error('Leitura de lançamentos incompatível.');
    for (const row of [...data.records, ...(data.deletedRecords || [])]) {
      if (!row || seen.has(row.id)) throw Error('Lançamentos repetidos na consulta.');
      seen.add(row.id);
      records.push(row);
    }
    if (!data.next) return records;
    if (data.next === after || (after && data.next < after)) throw Error('Paginação inválida.');
    after = data.next;
  }
  throw Error('O período ultrapassa o limite de lançamentos.');
}
export function useIndicatorRecords(period, enabled) {
  const key = JSON.stringify(period),
    latest = useRef(key);
  latest.current = key;
  const [state, setState] = useState({ key: '', records: [], previous: [] }),
    [token, reload] = useState(0),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [settingsRecord, setSettingsRecord] = useState(null),
    [settingsReady, setSettingsReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const c = new AbortController();
    setLoading(true);
    setError('');
    let past;
    try {
      past = previousPeriod(period);
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return;
    }
    Promise.all([readEntries(period, c.signal), readEntries(past, c.signal)])
      .then(([records, previous]) => {
        if (!c.signal.aborted) setState({ key, records, previous });
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [key, token, enabled]);
  useEffect(() => {
    if (!enabled) return;
    const c = new AbortController();
    setSettingsReady(false);
    api('/api/support-indicators/settings', { signal: c.signal })
      .then((data) => {
        if (!c.signal.aborted) {
          setSettingsRecord(data.record);
          setSettingsReady(true);
        }
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [token, enabled]);
  async function save(value, revision, settings = false, removing = false) {
    if (!enabled) throw Error('A gravação exige a sessão autenticada do piloto.');
    setBusy(true);
    setError('');
    try {
      const result = await api('/api/support-indicators/' + (settings ? 'settings' : 'entries'), {
        method: removing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          removing
            ? { id: value, expectedRevision: revision }
            : { value, expectedRevision: revision },
        ),
      });
      if (settings) setSettingsRecord(result.record);
      else
        setState((old) =>
          old.key !== latest.current
            ? old
            : {
                ...old,
                records: [
                  ...old.records.filter((r) => r.id !== result.record.id),
                  result.record,
                ].sort((a, b) => a.id.localeCompare(b.id)),
              },
        );
      return result.record;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  const ready = enabled && state.key === key && !loading && !error;
  return {
    records: state.key === key ? state.records.filter((record) => !record.deleted) : [],
    entryRecords: state.key === key ? state.records : [],
    previous: state.key === key ? state.previous.filter((record) => !record.deleted) : [],
    loading,
    busy,
    error,
    ready,
    settingsReady,
    settings: settingsRecord?.value || defaultSettings,
    settingsRevision: settingsRecord?.revision || 0,
    save,
    remove: (id, revision) => save(id, revision, false, true),
    reload: () => reload((n) => n + 1),
  };
}
