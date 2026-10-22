/** Histórico técnico sob demanda, separado da grade de trabalho e sem nova coleta no fornecedor. */
import React, { useState } from 'react';
import { api } from '../../../shared/security/accessClient.js';
import { monitoringDate } from '../domain/monitoring.js';
export function MonitoringCollectionHistory() {
  const [state, setState] = useState({
    rows: [],
    next: null,
    loaded: false,
    busy: false,
    error: '',
  });
  async function load(more = false) {
    if (state.busy) return;
    setState((s) => ({ ...s, busy: true, error: '' }));
    try {
      const page = await api(
        '/api/monitoring/history' + (more ? '?before=' + encodeURIComponent(state.next) : ''),
      );
      if (page.version !== 1 || !Array.isArray(page.runs)) throw Error('Histórico incompatível.');
      setState((s) => ({
        rows: more ? [...s.rows, ...page.runs] : page.runs,
        next: page.next,
        loaded: true,
        busy: false,
        error: '',
      }));
    } catch (error) {
      setState((s) => ({ ...s, busy: false, error: error.message }));
    }
  }
  return (
    <details
      className="panel monitoring-collection-history"
      onToggle={(event) => {
        if (event.currentTarget.open && !state.loaded && !state.busy) load();
      }}
    >
      <summary>Histórico de coletas salvas</summary>
      <p className="scope">
        Retenção de 30 dias; a última coleta válida é preservada. Retornos e atrasos são observados
        entre coletas, sem estimar o instante exato. Esta consulta não chama o fornecedor.
      </p>
      <button onClick={() => load()} disabled={state.busy}>
        Atualizar histórico
      </button>
      {state.busy && <p role="status">Carregando histórico…</p>}
      {state.error && <p role="alert">{state.error}</p>}
      {state.loaded && !state.rows.length && <p>Nenhuma coleta registrada.</p>}
      {!!state.rows.length && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Início · São Paulo</th>
                <th>Situação</th>
                <th>Veículos</th>
                <th>Eventos observados</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row) => (
                <tr key={row.id}>
                  <td>{monitoringDate(row.started_at)}</td>
                  <td>
                    {{
                      completed: 'Concluída',
                      failed: 'Falhou — base anterior preservada',
                      running: 'Em andamento',
                    }[row.status] || 'A conferir'}
                  </td>
                  <td>{row.vehicle_count ?? '—'}</td>
                  <td>{row.event_count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {state.next && (
        <button onClick={() => load(true)} disabled={state.busy}>
          Carregar anteriores
        </button>
      )}
    </details>
  );
}
