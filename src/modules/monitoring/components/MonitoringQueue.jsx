/** Tabela prioritária e histórico manual de tratamento, sem confundir situação administrativa com comunicação. */
import React, { useEffect, useRef, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { Icon } from '../../../components/Icon.jsx';
import {
  monitoringDate,
  monitoringDuration,
  monitoringStates,
  monitoringIndicator,
  monitoringVoltage,
  monitoringStages,
  recordMonitoringUpdate,
  sortMonitoringRows,
} from '../domain/monitoring.js';

const legend = [
  ['recent', 'Menos de 2 dias'],
  ['attention', '2 a <3 dias'],
  ['high', '3 a <4 dias'],
  ['critical', '4 dias ou mais'],
  ['unknown', 'Sem classificação'],
];

const columns = [
  ['plate', 'Placa'],
  ['trackerId', 'ID rastreador'],
  ['client', 'Cliente / base'],
  ['lastRecordAt', 'Última atualização'],
  ['supplyVoltageV', 'Alimentação'],
  ['profile', 'Perfil'],
  ['hours', 'Sem atualização'],
  ['state', 'Situação técnica'],
  ['stage', 'Acompanhamento'],
];

export function MonitoringQueue({
  result,
  notes,
  onRecord,
  selected,
  onSelect,
  page,
  setPage,
  visible,
}) {
  const detail = result.rows.find((row) => row.key === selected);
  const saved = detail ? notes[detail.key] : null;
  const historyPanel = useRef();
  const [draft, setDraft] = useState({ status: monitoringStages[0], owner: '', text: '' });
  const [message, setMessage] = useState('');
  const [sort, setSort] = useState(null);
  const orderedRows = sortMonitoringRows(result.rows, sort, notes);
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
    if (selected)
      historyPanel.current?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  }, [selected]);
  const change = (key, value) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setMessage('');
  };
  function register() {
    try {
      const next = recordMonitoringUpdate(saved, draft);
      onRecord(detail.key, next);
      setDraft((previous) => ({ ...previous, text: '' }));
      setMessage('Atualização registrada nesta sessão de demonstração.');
    } catch (error) {
      setMessage(error.message);
    }
  }
  const history = [...(saved?.history || [])].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <Section
      title="Fila de acompanhamento"
      visible={visible}
      help="Demonstração com dados fictícios. Uma linha por veículo/base, em ordem inicial de maior duração conhecida. Placa, ID rastreador, cliente/base, última atualização, alimentação em volts e perfil são apresentados sem inferir defeito elétrico ou configuração. Os sinais usam faixas fixas de 2/3/4 dias, independentemente do limite de atenção selecionado. Coleta desatualizada, data inválida/futura e ausência de registro recebem sinal neutro. Abaixo de 2 dias não confirma que está online neste instante. O status de acompanhamento é administrativo; clique nele para consultar o histórico e registre atualizações explicitamente. Tudo permanece somente nesta sessão. A impressão inclui a página exibida e o histórico selecionado; CSV/XLSX incluem todo o recorte."
    >
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
              {columns.map(([key, label]) => (
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
            {orderedRows.slice(page * 10, page * 10 + 10).map((row) => {
              const signal = monitoringIndicator(row);
              return (
                <tr key={row.key} data-signal={signal.tone}>
                  <td>
                    <span className="monitoring-plate">
                      <i
                        className={`monitoring-age-dot monitoring-tone-${signal.tone}`}
                        aria-hidden="true"
                      />
                      <span>{row.plate || 'Não informado'}</span>
                    </span>
                  </td>
                  <td>{row.trackerId || 'Não informado'}</td>
                  <td>
                    {row.clientName || row.clientId}
                    <small className="monitoring-cell-note">{row.clientId}</small>
                  </td>
                  <td>{monitoringDate(row.lastRecordAt)}</td>
                  <td>{monitoringVoltage(row.supplyVoltageV)}</td>
                  <td>
                    {row.profile == null || row.profile === ''
                      ? 'Não informado'
                      : String(row.profile)}
                  </td>
                  <td>
                    {monitoringDuration(row.hours)}
                    <small className="monitoring-cell-note">{signal.label}</small>
                  </td>
                  <td>{monitoringStates[row.state]}</td>
                  <td>
                    <button
                      type="button"
                      className="monitoring-followup-button"
                      aria-label={`Histórico de ${row.plate} · ${row.clientName}`}
                      aria-expanded={selected === row.key}
                      aria-controls={
                        selected === row.key ? 'monitoring-selected-history' : undefined
                      }
                      onClick={() => onSelect(selected === row.key ? null : row.key)}
                    >
                      {notes[row.key]?.status || monitoringStages[0]}
                      <Icon name={selected === row.key ? 'up' : 'down'} size={12} />
                    </button>
                  </td>
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
        <span>{result.rows.length} veículos no recorte</span>
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
          Página {page + 1} de {Math.max(1, Math.ceil(result.rows.length / 10))}
        </span>
        <button
          disabled={(page + 1) * 10 >= result.rows.length}
          onClick={() => {
            setPage((value) => value + 1);
            onSelect(null);
          }}
        >
          Próxima
        </button>
        <button
          type="button"
          disabled={(page + 1) * 10 >= result.rows.length}
          onClick={() => {
            setPage(Math.max(0, Math.ceil(result.rows.length / 10) - 1));
            onSelect(null);
          }}
        >
          Último
        </button>
      </div>
      {detail && (
        <section
          id="monitoring-selected-history"
          ref={historyPanel}
          className="monitoring-detail"
          aria-label="Histórico e tratamento selecionado"
        >
          <div className="monitoring-actions">
            <h3>
              {detail.plate} · {detail.clientName}
            </h3>
            <button onClick={() => onSelect(null)}>Fechar histórico</button>
          </div>
          <p className="scope">
            Rastreador: {detail.trackerId} · Veículo: {detail.vehicleId} · Coleta:{' '}
            {monitoringDate(detail.collectionAt)} · Alimentação:{' '}
            {monitoringVoltage(detail.supplyVoltageV)} · Perfil:{' '}
            {detail.profile == null || detail.profile === ''
              ? 'Não informado'
              : String(detail.profile)}
          </p>
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
              <button type="button" onClick={register}>
                Salvar atualização
              </button>
              {message && (
                <p className="scope" role="status">
                  {message}
                </p>
              )}
            </div>
            <div className="monitoring-history">
              <h4>Histórico de tratamento · {history.length}</h4>
              {!history.length ? (
                <p className="scope">Nenhuma atualização registrada nesta sessão.</p>
              ) : (
                <ol>
                  {history.map((entry, index) => (
                    <li key={index}>
                      <div>
                        <strong>{entry.status}</strong>
                        <time dateTime={entry.at}>{monitoringDate(entry.at)}</time>
                      </div>
                      <small>Responsável: {entry.owner || 'Não informado'}</small>
                      <p>
                        {entry.text || 'Alteração de status/responsável sem observação adicional.'}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
          <p className="scope">
            Histórico manual desta sessão de demonstração. Encerrar acompanhamento não confirma
            recuperação da comunicação. A API e a persistência ainda serão conectadas.
          </p>
        </section>
      )}
    </Section>
  );
}
