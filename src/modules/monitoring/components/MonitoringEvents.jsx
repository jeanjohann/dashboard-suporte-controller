import React, { useEffect, useRef, useState } from 'react';
import { api, authorizeAction } from '../../../shared/security/accessClient.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { monitoringDate } from '../domain/monitoring.js';
import {
  eventCursor,
  eventPosition,
  isUnseenEvent,
  monitoringEventLabels,
} from '../domain/monitoringEvents.js';

export function MonitoringEvents({ savedAt, snapshot, onVehicle }) {
  const { user } = useAccess();
  const key = 'monitoring-events-seen-v1:' + user.email;
  const [seen, setSeen] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? eventCursor(v) : null;
    } catch {
      return null;
    }
  });
  const [viewPage, setViewPage] = useState(0);
  const [kind, setKind] = useState('all'),
    [open, setOpen] = useState(false);
  const [state, setState] = useState({
    rows: [],
    next: null,
    busy: false,
    error: '',
    readAt: null,
  });
  const request = useRef(null),
    generation = useRef(0);
  useEffect(() => {
    setState({ rows: [], next: null, busy: false, error: '', readAt: null });
    setViewPage(0);
    try {
      const value = localStorage.getItem(key);
      setSeen(value ? eventCursor(value) : null);
    } catch {
      setSeen(null);
    }
  }, [key]);
  async function load(more = false) {
    const run = ++generation.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((s) => ({ ...s, busy: true, error: '' }));
    try {
      const query = new URLSearchParams({ kind });
      if (more && state.next) query.set('before', state.next);
      const page = await api('/api/monitoring/events?' + query, { signal: controller.signal });
      if (
        page.version !== 1 ||
        !Array.isArray(page.events) ||
        page.events.length > 30 ||
        page.events.some(
          (row) =>
            !Object.hasOwn(monitoringEventLabels, row.type) || !Array.isArray(eventPosition(row)),
        )
      )
        throw Error('Avisos incompatíveis.');
      for (const row of page.events) eventCursor(JSON.stringify(eventPosition(row)));
      if (page.next) eventCursor(page.next);
      if (run !== generation.current) return;
      setViewPage(more ? Math.floor(state.rows.length / 30) : 0);
      setState((s) => ({
        rows: more
          ? [
              ...new Map(
                [...s.rows, ...page.events].map((r) => [JSON.stringify(eventPosition(r)), r]),
              ).values(),
            ]
          : page.events,
        next: page.next,
        busy: false,
        error: '',
        readAt: page.readAt,
      }));
    } catch (error) {
      if (run === generation.current)
        setState((s) => ({ ...s, busy: false, error: error.message }));
    } finally {
      if (request.current === controller) request.current = null;
    }
  }
  useEffect(() => {
    load();
    return () => {
      generation.current++;
      request.current?.abort();
    };
  }, [kind, savedAt, key]);
  const unseen = state.rows.filter((row) => isUnseenEvent(row, seen)).length;
  function markSeen() {
    const value = eventPosition(state.rows[0]);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setSeen(value);
    } catch {
      setState((s) => ({ ...s, error: 'Não foi possível guardar a leitura neste navegador.' }));
    }
  }
  async function exportEvents() {
    if (!(await authorizeAction('export'))) return;
    download(
      csv([
        ['Avisos consultados; não inclui páginas ainda não carregadas', state.readAt || ''],
        [
          'Evento',
          'Observado em',
          'Placa na coleta',
          'Base na coleta',
          'Veículo ID',
          'Rastreador na coleta',
          'Última posição',
          'Limite horas',
          'Execução',
        ],
        ...state.rows.map((r) => [
          monitoringEventLabels[r.type],
          r.observedAt,
          r.plate || '',
          r.clientName || r.clientId,
          r.vehicleId,
          r.trackerId || '',
          r.lastRecordAt,
          r.threshold,
          r.runId,
        ]),
      ]),
      'text/csv;charset=utf-8',
      'avisos-monitoramento.csv',
    );
  }
  const vehicles = new Map(
    (snapshot?.vehicles || []).map((row) => [JSON.stringify([row.clientId, row.vehicleId]), row]),
  );
  return (
    <section className="panel monitoring-events" aria-label="Avisos observados nas coletas">
      <div className="monitoring-events-heading">
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          Avisos das coletas · {state.rows.length} carregados
          {unseen ? ` · ${unseen} não vistos` : ''}
        </button>
        <InfoNote label="Critérios dos avisos">
          Histórico de 30 dias, com limite de atenção de 48 horas da coleta. Entrada em atraso e
          retorno são observações entre leituras, sem estimar o instante da falha. Primeira
          observação em atraso não prova uma nova ocorrência. Independente dos filtros da grade.
          Vistos são salvos por usuário neste navegador; os eventos permanecem no banco.
        </InfoNote>
      </div>
      {state.error && <p role="alert">{state.error}</p>}
      {open && (
        <>
          <div className="toolbar" data-no-print>
            <label>
              Eventos{' '}
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="all">Todos</option>
                <option value="delay">Atrasos observados</option>
                <option value="return">Retornos observados</option>
              </select>
            </label>
            <button disabled={state.busy} onClick={() => load()}>
              Atualizar avisos
            </button>
            <button
              disabled={state.busy || !state.rows.length || kind !== 'all'}
              onClick={markSeen}
            >
              Marcar até a última coleta exibida como vistos
            </button>
            <button disabled={!state.rows.length || state.busy} onClick={exportEvents}>
              CSV dos avisos carregados
            </button>
          </div>
          {state.busy && <p role="status">Consultando avisos salvos…</p>}
          {!state.busy && !state.rows.length && (
            <p className="scope">
              Nenhum evento encontrado nesta consulta; isso não significa ausência de veículos em
              atraso.
            </p>
          )}
          {!!state.rows.length && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Veículo / base</th>
                    <th>Observado · São Paulo</th>
                    <th>Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.slice(viewPage * 30, viewPage * 30 + 30).map((row) => {
                    const current = vehicles.get(row.key);
                    return (
                      <tr key={JSON.stringify(eventPosition(row))}>
                        <td>
                          {isUnseenEvent(row, seen) ? '● ' : ''}
                          {monitoringEventLabels[row.type]}
                        </td>
                        <td>
                          {row.plate || current?.plate || row.vehicleId} ·{' '}
                          {(
                            row.clientName ||
                            current?.clientName ||
                            row.clientId
                          ).toLocaleUpperCase('pt-BR')}
                          <small>
                            {!row.plate && current ? ' · Identificação da fotografia atual' : ''}
                          </small>
                        </td>
                        <td>{monitoringDate(row.observedAt)}</td>
                        <td>
                          <button disabled={!current} onClick={() => onVehicle(current)}>
                            Ver veículo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!!state.rows.length && (
            <div className="toolbar">
              <button disabled={state.busy || !viewPage} onClick={() => setViewPage((p) => p - 1)}>
                Página anterior
              </button>
              <span>
                {viewPage + 1} de {Math.ceil(state.rows.length / 30)}
              </span>
              <button
                disabled={state.busy || (viewPage + 1) * 30 >= state.rows.length}
                onClick={() => setViewPage((p) => p + 1)}
              >
                Próxima página carregada
              </button>
            </div>
          )}
          {state.next && (
            <button disabled={state.busy} onClick={() => load(true)}>
              Carregar anteriores
            </button>
          )}
          <p className="scope">
            Somente avisos carregados nesta consulta. Eventos antigos não determinam o estado atual
            do veículo.
          </p>
        </>
      )}
    </section>
  );
}
