import { clientDisplay } from '../../../shared/data/clientDisplay.js';
/** Tabela prioritária e histórico manual de tratamento, sem confundir situação administrativa com comunicação. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { MonitoringReminderEditor } from './MonitoringReminderEditor.jsx';
import { reminderOverdue } from '../domain/monitoringReminders.js';
import {
  monitoringDate,
  monitoringDuration,
  monitoringStates,
  monitoringIndicator,
  monitoringVoltage,
  monitoringBatteryState,
  monitoringStages,
  sortMonitoringRows,
} from '../domain/monitoring.js';

const legend = [
  ['recent', 'Menos de 2 dias'],
  ['attention', '2 a <3 dias'],
  ['high', '3 a <4 dias'],
  ['critical', '4 a <30 dias'],
  ['extended', '30 a <60 dias'],
  ['long', '60 a <90 dias'],
  ['extreme', '90 dias ou mais'],
  ['unknown', 'Sem classificação'],
];

const columns = [
  ['plate', 'Placa'],
  ['trackerId', 'ID rastreador'],
  ['client', 'Cliente / base'],
  ['lastRecordAt', 'Última atualização'],
  ['supplyVoltageV', 'Alimentação'],
  ['profile', 'Perfil'],
  ['positions24h', 'Posições · 24 h'],
  ['hours', 'Sem atualização'],
  ['state', 'Situação técnica'],
  ['stage', 'Acompanhamento'],
];

const stageTones = {
  'Não iniciado': 'error',
  'Em análise': 'info',
  'Aguardando contato': 'warning',
  'Manutenção agendada': 'violet',
  'Acompanhamento encerrado': 'success',
};

const stageTone = (status) => stageTones[status] || 'info';

export function MonitoringQueue({
  result,
  notes,
  reminders,
  treatment,
  onRecord,
  selected,
  onSelect,
  page,
  setPage,
  pageSize,
  setPageSize,
  visible,
  actions,
}) {
  const detail = result.rows.find((row) => row.key === selected);
  const saved = detail ? notes[detail.key] : null;
  const [draft, setDraft] = useState({ status: monitoringStages[0], owner: '', text: '' });
  const [message, setMessage] = useState('');
  const [confirmTreatmentDelete, setConfirmTreatmentDelete] = useState(false);
  const [confirmEntryDelete, setConfirmEntryDelete] = useState(null);
  const [sort, setSort] = useState(null);
  const dialogRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaults = columns
      .map(([key]) => key)
      .filter((key) => !['supplyVoltageV', 'profile', 'positions24h'].includes(key));
    try {
      const saved = JSON.parse(localStorage.getItem('addlog-monitoring-columns-v1') || 'null');
      if (Array.isArray(saved) && saved.every((key) => columns.some(([column]) => column === key)))
        return [...new Set(['plate', ...saved])];
    } catch {}
    return defaults;
  });
  useEffect(() => {
    try {
      localStorage.setItem('addlog-monitoring-columns-v1', JSON.stringify(visibleColumns));
    } catch {}
  }, [visibleColumns]);
  const orderedRows = useMemo(
    () => sortMonitoringRows(result.rows, sort, notes),
    [result.rows, sort, notes],
  );
  const pages = Math.max(1, Math.ceil(result.rows.length / pageSize));
  useEffect(() => {
    if (page >= pages) setPage(pages - 1);
    if (selected && !detail) onSelect(null);
  }, [page, pages, selected, Boolean(detail)]);
  function orderBy(key) {
    setSort((previous) =>
      previous?.key === key
        ? previous.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
        : { key, direction: 'asc' },
    );
    setPage(0);
    onSelect(null);
  }
  useEffect(() => {
    setDraft({ status: saved?.status || monitoringStages[0], owner: saved?.owner || '', text: '' });
    setMessage('');
    setConfirmTreatmentDelete(false);
    setConfirmEntryDelete(null);
  }, [selected]);
  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onSelect(null);
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [selected, onSelect]);
  const change = (key, value) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setMessage('');
  };
  async function register() {
    try {
      await onRecord(detail, draft, saved?.revision || 0);
      setDraft((previous) => ({ ...previous, text: '' }));
      setMessage(
        treatment.mode === 'remote'
          ? 'Atualização salva no banco do sistema.'
          : 'Atualização salva neste navegador.',
      );
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function removeTreatment() {
    try {
      await treatment.remove(detail, saved.revision);
      setConfirmTreatmentDelete(false);
      setMessage('Acompanhamento e histórico excluídos. O lembrete do veículo foi preservado.');
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function removeHistoryEntry(entryIndex) {
    try {
      await treatment.removeEntry(detail, entryIndex, saved.revision);
      setConfirmEntryDelete(null);
      setMessage('Nota excluída do histórico.');
    } catch (error) {
      setMessage(error.message);
    }
  }
  const history = (saved?.history || [])
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => Date.parse(b.entry.at) - Date.parse(a.entry.at));
  return (
    <Section
      title="Fila de acompanhamento"
      visible={visible}
      help={`Uma linha por veículo/base, em ordem inicial de maior duração conhecida. Placa, ID rastreador, cliente/base, última atualização, alimentação em volts e perfil são apresentados sem inferir defeito elétrico ou configuração. Os sinais usam faixas fixas de 2/3/4/30/60/90 dias, independentemente do limite de atenção selecionado. Coleta desatualizada, data inválida/futura e ausência de registro recebem sinal neutro. Abaixo de 2 dias não confirma que está online neste instante. O status de acompanhamento é administrativo; clique nele para consultar e registrar o histórico. ${treatment.mode === 'remote' ? 'No piloto, o tratamento fica salvo no banco do sistema.' : 'No modo local, o tratamento fica salvo neste navegador.'} Lembretes e históricos de conferência são registros separados. A impressão inclui a página exibida e o histórico selecionado; CSV/XLSX incluem todo o recorte.`}
    >
      {actions && (
        <div className="monitoring-queue-actions" data-no-print>
          {actions}
        </div>
      )}
      <div className="monitoring-queue-columns">
        <span>Colunas da grade</span>
        <details className="monitoring-column-picker">
          <summary>
            Escolher colunas · {visibleColumns.length} de {columns.length}
          </summary>
          <div role="group" aria-label="Colunas visíveis">
            {columns.map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(key)}
                  disabled={key === 'plate'}
                  onChange={(event) => {
                    setVisibleColumns((previous) =>
                      event.target.checked
                        ? [...previous, key]
                        : previous.filter((column) => column !== key),
                    );
                    setSort(null);
                    setPage(0);
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </details>
      </div>
      <div className="monitoring-legend" aria-label="Legenda do tempo sem atualização">
        {legend.map(([tone, label]) => (
          <span key={tone}>
            <i className={`monitoring-age-dot monitoring-tone-${tone}`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <div className="table-scroll monitoring-queue-table">
        <table>
          <thead>
            <tr>
              {columns
                .filter(([key]) => visibleColumns.includes(key))
                .map(([key, label]) => (
                  <th
                    key={key}
                    aria-sort={
                      sort?.key === key
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button type="button" className="sort-heading" onClick={() => orderBy(key)}>
                      {label} {sort?.key === key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {orderedRows.slice(page * pageSize, page * pageSize + pageSize).map((row) => {
              const signal = monitoringIndicator(row);
              const reminder = reminders.records.find((record) => record.key === row.key);
              const stage = notes[row.key]?.status || monitoringStages[0];
              return (
                <tr key={row.key} data-signal={signal.tone}>
                  {columns
                    .filter(([key]) => visibleColumns.includes(key))
                    .map(([key]) => (
                      <td key={key}>
                        {key === 'plate' ? (
                          <span className="monitoring-plate">
                            <i
                              className={`monitoring-age-dot monitoring-tone-${signal.tone}`}
                              aria-hidden="true"
                            />
                            <span>{row.plate || 'Não informado'}</span>
                          </span>
                        ) : key === 'trackerId' ? (
                          <>
                            {row.trackerId || 'Não informado'}
                            <small className="monitoring-cell-note">
                              {row.deviceModel || 'Modelo não informado'}
                            </small>
                          </>
                        ) : key === 'client' ? (
                          <>
                            {clientDisplay(row.clientName || row.clientId)}
                            <small className="monitoring-cell-note">{row.clientId}</small>
                          </>
                        ) : key === 'lastRecordAt' ? (
                          monitoringDate(row.lastRecordAt)
                        ) : key === 'supplyVoltageV' ? (
                          monitoringVoltage(row.supplyVoltageV)
                        ) : key === 'profile' ? (
                          row.profile == null || row.profile === '' ? (
                            'Não informado'
                          ) : (
                            String(row.profile)
                          )
                        ) : key === 'positions24h' ? (
                          row.positions24h == null ? (
                            'Não informado'
                          ) : (
                            row.positions24h.toLocaleString('pt-BR')
                          )
                        ) : key === 'hours' ? (
                          <>
                            {monitoringDuration(row.hours)}
                            <small className="monitoring-cell-note">{signal.label}</small>
                          </>
                        ) : key === 'state' ? (
                          monitoringStates[row.state]
                        ) : (
                          <div className="monitoring-stage-actions">
                            <span className="monitoring-stage-label" data-stage={stageTone(stage)}>
                              <i aria-hidden="true" />
                              {stage}
                            </span>
                            <button
                              type="button"
                              className="monitoring-open-equipment"
                              aria-label={`Abrir detalhes do equipamento ${row.plate || ''}`}
                              onClick={() => onSelect(row.key)}
                            >
                              Abrir
                            </button>
                            {reminder?.status === 'scheduled' && (
                              <small
                                className="monitoring-reminder-tag"
                                data-overdue={reminderOverdue(reminder, reminders.now)}
                              >
                                {reminderOverdue(reminder, reminders.now)
                                  ? 'Conferência pendente'
                                  : 'Lembrete agendado'}
                                {' · '}
                                {monitoringDate(reminder.dueAt)}
                              </small>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!result.rows.length && (
        <p className="scope">Nenhum veículo corresponde aos filtros da tabela.</p>
      )}
      <div className="monitoring-actions monitoring-pagination" data-no-print>
        <span>
          Exibindo {result.rows.length ? page * pageSize + 1 : 0}–
          {Math.min((page + 1) * pageSize, result.rows.length)} de {result.rows.length} veículos
        </span>
        <label>
          Linhas por página
          <select
            aria-label="Linhas por página"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
              onSelect(null);
            }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={page === 0}
          onClick={() => {
            setPage((value) => value - 1);
            onSelect(null);
          }}
        >
          Anterior
        </button>
        <span>
          Página {page + 1} de {Math.max(1, Math.ceil(result.rows.length / pageSize))}
        </span>
        <button
          disabled={(page + 1) * pageSize >= result.rows.length}
          onClick={() => {
            setPage((value) => value + 1);
            onSelect(null);
          }}
        >
          Próxima
        </button>
        <button
          type="button"
          disabled={(page + 1) * pageSize >= result.rows.length}
          onClick={() => {
            setPage(Math.max(0, Math.ceil(result.rows.length / pageSize) - 1));
            onSelect(null);
          }}
        >
          Último
        </button>
      </div>
      {detail && (
        <div
          className="monitoring-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onSelect(null);
          }}
        >
          <section
            id="monitoring-selected-history"
            className="monitoring-detail monitoring-equipment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="monitoring-equipment-title"
            tabIndex={-1}
            ref={dialogRef}
          >
            <div className="monitoring-modal-heading">
              <div>
                <p className="monitoring-modal-eyebrow">DETALHES DO EQUIPAMENTO</p>
                <h2 id="monitoring-equipment-title">
                  {detail.plate || 'Veículo sem placa'} ·{' '}
                  {clientDisplay(detail.clientName || detail.clientId)}
                </h2>
              </div>
              <button
                type="button"
                className="monitoring-modal-close"
                onClick={() => onSelect(null)}
              >
                Fechar
              </button>
            </div>
            <div className="monitoring-equipment-facts" aria-label="Dados do equipamento">
              <div>
                <span>Placa</span>
                <strong>{detail.plate || 'Não informado'}</strong>
              </div>
              <div>
                <span>Cliente / base</span>
                <strong>{clientDisplay(detail.clientName || detail.clientId)}</strong>
              </div>
              <div>
                <span>ID cliente / base</span>
                <strong>{detail.clientId || 'Não informado'}</strong>
              </div>
              <div>
                <span>Prefixo</span>
                <strong>{detail.prefix || 'Não informado'}</strong>
              </div>
              <div>
                <span>ID rastreador</span>
                <strong>{detail.trackerId || 'Não informado'}</strong>
              </div>
              <div>
                <span>Modelo</span>
                <strong>{detail.deviceModel || 'Não informado'}</strong>
              </div>
              <div>
                <span>Identificador</span>
                <strong>{detail.identifier || 'Não informado'}</strong>
              </div>
              <div>
                <span>ICCID</span>
                <strong>{detail.iccid || 'Não informado'}</strong>
              </div>
              <div>
                <span>MSISDN</span>
                <strong>{detail.msisdn || 'Não informado'}</strong>
              </div>
              <div>
                <span>Veículo</span>
                <strong>{detail.vehicleId || 'Não informado'}</strong>
              </div>
              <div>
                <span>Última atualização</span>
                <strong>{monitoringDate(detail.lastRecordAt)}</strong>
              </div>
              <div>
                <span>Coleta recebida</span>
                <strong>{monitoringDate(detail.collectionAt)}</strong>
              </div>
              <div>
                <span>Tempo sem atualização</span>
                <strong>{monitoringDuration(detail.hours)}</strong>
              </div>
              <div>
                <span>Situação técnica</span>
                <strong>{monitoringStates[detail.state] || 'Não informado'}</strong>
              </div>
              <div>
                <span>Status de acompanhamento</span>
                <strong>{saved?.status || monitoringStages[0]}</strong>
              </div>
              <div>
                <span>Alimentação</span>
                <strong>{monitoringVoltage(detail.supplyVoltageV)}</strong>
              </div>
              <div>
                <span>Falha alimentação externa</span>
                <strong>
                  {detail.externalPowerFailure == null
                    ? 'Não informado'
                    : detail.externalPowerFailure
                      ? 'Sim'
                      : 'Não'}
                </strong>
              </div>
              <div>
                <span>Bateria interna</span>
                <strong>{monitoringBatteryState(detail.batteryState)}</strong>
              </div>
              <div>
                <span>Carga da bateria</span>
                <strong>
                  {detail.batteryPercent == null ? 'Não informado' : `${detail.batteryPercent}%`}
                </strong>
              </div>
              <div>
                <span>Posições · 24 h</span>
                <strong>
                  {detail.positions24h == null
                    ? 'Não informado'
                    : detail.positions24h.toLocaleString('pt-BR')}
                </strong>
              </div>
              <div>
                <span>Perfil</span>
                <strong>
                  {detail.profile == null || detail.profile === ''
                    ? 'Não informado'
                    : String(detail.profile)}
                </strong>
              </div>
            </div>
            <p className="scope monitoring-equipment-note">
              A tensão pode representar a bateria interna quando há falha externa nos MXT-130/160;
              posições não representam consumo de dados dos chips.
            </p>
            <MonitoringReminderEditor
              key={detail.key}
              vehicle={detail}
              record={reminders.records.find((record) => record.key === detail.key)}
              reminders={reminders}
            />
            <div className="monitoring-treatment-grid">
              <div className="monitoring-treatment-form" data-no-print>
                <h4>Registrar tratamento</h4>
                <div className="monitoring-fields">
                  <label>
                    Status de acompanhamento
                    <select
                      aria-label="Status de acompanhamento"
                      value={draft.status}
                      onChange={(e) => change('status', e.target.value)}
                    >
                      {monitoringStages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Responsável pelo tratamento
                    <input value={draft.owner} onChange={(e) => change('owner', e.target.value)} />
                  </label>
                  <label>
                    O que foi tratado
                    <textarea value={draft.text} onChange={(e) => change('text', e.target.value)} />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={treatment.loading || Boolean(treatment.error) || treatment.saving}
                  onClick={register}
                >
                  {treatment.saving ? 'Salvando…' : 'Salvar atualização'}
                </button>
                {message && (
                  <p className="scope" role="status">
                    {message}
                  </p>
                )}
                {treatment.canDelete && saved && !saved.deleted && (
                  <div className="monitoring-reminder-delete monitoring-treatment-delete">
                    {!confirmTreatmentDelete ? (
                      <button
                        type="button"
                        className="secondary"
                        disabled={treatment.loading || Boolean(treatment.error) || treatment.saving}
                        onClick={() => setConfirmTreatmentDelete(true)}
                      >
                        Excluir acompanhamento
                      </button>
                    ) : (
                      <div role="group" aria-label="Confirmar exclusão do acompanhamento">
                        <p>
                          Excluir o status e todo o histórico de tratamento deste veículo? A ação
                          ficará fora da consulta e não poderá ser desfeita pela tela. Os lembretes
                          serão preservados.
                        </p>
                        <div className="monitoring-actions">
                          <button
                            type="button"
                            disabled={
                              treatment.loading || Boolean(treatment.error) || treatment.saving
                            }
                            onClick={removeTreatment}
                          >
                            {treatment.saving ? 'Excluindo…' : 'Confirmar exclusão'}
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            disabled={treatment.saving}
                            onClick={() => setConfirmTreatmentDelete(false)}
                          >
                            Manter acompanhamento
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="monitoring-history">
                <h4>Histórico de tratamento · {history.length}</h4>
                {treatment.loading ? (
                  <p className="scope">Carregando histórico salvo…</p>
                ) : treatment.error ? (
                  <p className="notice" role="alert">
                    {treatment.error} O botão de gravação fica bloqueado até a leitura ser
                    confirmada.
                    <button type="button" onClick={treatment.reload}>
                      Tentar novamente
                    </button>
                  </p>
                ) : saved?.deleted ? (
                  <p className="scope">Acompanhamento e histórico excluídos pelo administrador.</p>
                ) : !history.length ? (
                  <p className="scope">Nenhuma atualização registrada para este veículo.</p>
                ) : (
                  <ol>
                    {history.map(({ entry, index }) => (
                      <li key={`${entry.at}-${index}`}>
                        {treatment.canDelete && (
                          <button
                            type="button"
                            className="monitoring-history-delete"
                            aria-label={`Excluir nota de ${monitoringDate(entry.at)}`}
                            title="Excluir esta nota"
                            disabled={
                              treatment.loading || Boolean(treatment.error) || treatment.saving
                            }
                            onClick={() => setConfirmEntryDelete(index)}
                            data-no-print
                          >
                            ×
                          </button>
                        )}
                        <div>
                          <strong
                            className="monitoring-stage-label"
                            data-stage={stageTone(entry.status)}
                          >
                            <i aria-hidden="true" />
                            {entry.status}
                          </strong>
                          <time dateTime={entry.at}>{monitoringDate(entry.at)}</time>
                        </div>
                        <small>Responsável: {entry.owner || 'Não informado'}</small>
                        <p>
                          {entry.text ||
                            'Alteração de status/responsável sem observação adicional.'}
                        </p>
                        {confirmEntryDelete === index && (
                          <div
                            className="monitoring-history-confirm"
                            role="group"
                            aria-label="Confirmar exclusão da nota"
                            data-no-print
                          >
                            <span>
                              Excluir esta nota? Se for a última, o acompanhamento também será
                              encerrado.
                            </span>
                            <button
                              type="button"
                              disabled={treatment.saving}
                              onClick={() => removeHistoryEntry(index)}
                            >
                              {treatment.saving ? 'Excluindo…' : 'Confirmar'}
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              disabled={treatment.saving}
                              onClick={() => setConfirmEntryDelete(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
            <p className="scope">
              Histórico administrativo. Encerrar acompanhamento não confirma recuperação da
              comunicação.{' '}
              {treatment.mode === 'remote'
                ? 'Salvo no banco do sistema.'
                : 'Salvo neste navegador.'}
            </p>
          </section>
        </div>
      )}
    </Section>
  );
}
