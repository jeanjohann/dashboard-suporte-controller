import React, { useEffect, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';

export function RegistryEquivalences({ snapshot, operational, onChange }) {
  const { user } = useAccess();
  const key = 'monitoring-base-equivalences-v1:' + (user?.email || 'local');
  const [draft, setDraft] = useState({}),
    [base, setBase] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    let saved = {};
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      if (
        value &&
        !Array.isArray(value) &&
        typeof value === 'object' &&
        Object.values(value).every((v) => typeof v === 'string' && v.length <= 300)
      )
        saved = value;
    } catch {}
    setDraft(saved);
    onChange(saved);
  }, [key, onChange]);
  const bases = [
    ...new Map(
      snapshot.vehicles.map((row) => [row.clientId, row.clientName || row.clientId]),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1]));
  const clients = [
    ...new Set(operational.data.rows.map((row) => row.client).filter(Boolean)),
  ].sort();
  const selected = bases.some(([id]) => id === base) ? base : bases[0]?.[0] || '';
  return (
    <details className="registry-equivalences">
      <summary>Equivalências explícitas de base e cliente</summary>
      <p className="scope">
        A API é a referência do cadastro atual. Relacione nomes diferentes somente quando
        identificar a mesma base. Mapeamento salvo neste navegador e usuário; não altera planilhas.
      </p>
      <div className="monitoring-registry-controls">
        <label>
          Base da API
          <select value={selected} onChange={(e) => setBase(e.target.value)}>
            {bases.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cliente correspondente no Operacional
          <select
            value={draft[selected] || ''}
            onChange={(e) => setDraft((old) => ({ ...old, [selected]: e.target.value }))}
          >
            <option value="">Comparar nomes sem equivalência</option>
            {draft[selected] && !clients.includes(draft[selected]) && (
              <option>{draft[selected]}</option>
            )}
            {clients.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            try {
              const value = Object.fromEntries(Object.entries(draft).filter(([, v]) => v));
              localStorage.setItem(key, JSON.stringify(value));
              onChange(value);
              setMessage('Equivalências salvas neste navegador.');
            } catch {
              setMessage('Não foi possível salvar. As equivalências anteriores foram mantidas.');
            }
          }}
        >
          Aplicar equivalências
        </button>
      </div>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
