import React, { useEffect, useRef, useState } from 'react';
import { useAccess } from '../security/Access.jsx';
import { api } from '../security/accessClient.js';
import { createWorkspaceClient } from './workspaceClient.js';

/** Última consulta independente: restaura sem consultar o fornecedor e salva por ação explícita. */
export function WorkspaceQueryPanel({ kind, value, onLoad, disabled = false }) {
  const labels = {
    'zoho-support': 'Atividade do suporte',
    'zoho-indicators': 'Indicadores do suporte',
    'zoho-backlog': 'Pendências · fotografia da consulta',
    'zoho-presence': 'Sessões dos agentes',
  };
  const { managed, user } = useAccess();
  const [state, setState] = useState({
    loading: managed,
    permitted: false,
    loaded: false,
    revision: 0,
    at: null,
    error: '',
    fingerprint: null,
  });
  const current = useRef({ value, onLoad, disabled });
  current.current = { value, onLoad, disabled };
  const fingerprint = React.useMemo(
    () => JSON.stringify(value),
    [
      value?.data,
      value?.source,
      value?.mapping,
      value?.columns,
      value?.reviewedReplies,
      value?.offset,
      value?.start,
      value?.end,
      value?.report,
    ],
  );
  const client = React.useMemo(() => createWorkspaceClient(kind), [kind, user.email]);
  useEffect(() => {
    if (!managed) return;
    let live = true;
    (async () => {
      try {
        const status = await api('/api/workspace/status');
        if (status.version !== 1 || typeof status.permitted !== 'boolean')
          throw Error('Configuração inválida.');
        if (!status.permitted && !status.readKinds?.includes(kind)) {
          if (live) setState((s) => ({ ...s, loading: false }));
          return;
        }
        if (live) setState((s) => ({ ...s, permitted: true }));
        const saved = await client.read();
        if (!live) return;
        if (saved.value !== null && current.current.value === null && !current.current.disabled)
          current.current.onLoad(saved.value);
        setState({
          loading: false,
          permitted: true,
          readOnly: !status.permitted,
          loaded: true,
          revision: saved.revision,
          at: saved.updatedAt,
          error: '',
          fingerprint: JSON.stringify(saved.value),
        });
      } catch (e) {
        if (live) setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    })();
    return () => {
      live = false;
    };
  }, [client, managed]);
  async function action(load) {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const result = load ? await client.read() : await client.write(value, state.revision);
      if (load && result.value !== null) current.current.onLoad(result.value);
      setState((s) => ({
        ...s,
        loading: false,
        revision: result.revision,
        loaded: true,
        at: result.updatedAt,
        error: '',
        fingerprint: JSON.stringify(result.value),
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }
  if (!managed || (!state.permitted && !state.error && !state.loading)) return null;
  return (
    <div
      className="workspace-storage-status"
      aria-label={'Consulta salva · ' + labels[kind]}
      data-no-print
    >
      <strong>{labels[kind]}</strong>
      <small>
        {state.loading
          ? 'Acessando banco…'
          : state.at
            ? 'Consulta salva em ' +
              new Date(state.at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) +
              ' · São Paulo. Não é uma nova leitura do Zoho.'
            : 'Nenhuma consulta salva no banco para esta seção.'}
      </small>
      {value !== null && state.loaded && !state.loading && fingerprint !== state.fingerprint && (
        <small role="status">Leitura ou ajustes em tela ainda não salvos.</small>
      )}
      {state.permitted && (
        <>
          {!state.readOnly && (
            <button
              type="button"
              disabled={disabled || state.loading || !state.loaded || value === null}
              onClick={() => action(false)}
            >
              Salvar consulta no banco
            </button>
          )}
          <button type="button" disabled={disabled || state.loading} onClick={() => action(true)}>
            Carregar consulta salva
          </button>
        </>
      )}
      {state.error && <p role="alert">{state.error} A leitura em tela foi preservada.</p>}
    </div>
  );
}
