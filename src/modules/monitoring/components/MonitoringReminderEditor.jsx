/** Agendamento manual, separado do formulário de tratamento e dos sinais de comunicação. */
import React, { useEffect, useState } from 'react';
import { monitoringDate } from '../domain/monitoring.js';
import {
  reminderActions,
  reminderLabels,
  reminderLocalDate,
  reminderOverdue,
} from '../domain/monitoringReminders.js';

export function MonitoringReminderEditor({ vehicle, record, reminders }) {
  const [localDate, setLocalDate] = useState('');
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    setLocalDate(record?.status === 'scheduled' ? reminderLocalDate(record.dueAt) : '');
    setNote(record?.status === 'scheduled' ? record.note : '');
    setOutcome('');
  }, [vehicle.key, record?.revision]);
  const active = record?.status === 'scheduled';
  const disabled = reminders.loading || Boolean(reminders.error) || reminders.saving;
  async function save(action) {
    setMessage('');
    try {
      await reminders.change(vehicle, record?.revision || 0, action, { localDate, note, outcome });
      setMessage(
        action === 'complete'
          ? 'Conferência registrada. A situação técnica do veículo permanece independente.'
          : action === 'cancel'
            ? 'Lembrete cancelado. Histórico preservado.'
            : 'Lembrete salvo neste navegador.',
      );
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <section className="monitoring-reminder-editor" aria-label={`Lembrete de ${vehicle.plate}`}>
      <h4>Lembrete de conferência</h4>
      {record && (
        <p className="scope">
          <strong>
            {reminderOverdue(record, reminders.now)
              ? 'Conferência pendente'
              : reminderLabels[record.status]}
          </strong>
          {' · '}
          <time dateTime={record.dueAt}>{monitoringDate(record.dueAt)}</time>
        </p>
      )}
      <form
        data-no-print
        onSubmit={(event) => {
          event.preventDefault();
          save(active ? 'reschedule' : 'schedule');
        }}
      >
        <div className="monitoring-fields">
          <label>
            Data e hora · São Paulo
            <input
              type="datetime-local"
              required
              value={localDate}
              disabled={disabled}
              onChange={(event) => setLocalDate(event.target.value)}
            />
          </label>
          <label>
            Observação do lembrete
            <textarea
              value={note}
              maxLength={2000}
              disabled={disabled}
              placeholder="Ex.: cliente informou saída da manutenção. Conferir comunicação."
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>
        <div className="monitoring-actions">
          <button type="submit" disabled={disabled}>
            {active ? 'Salvar reagendamento' : 'Agendar lembrete'}
          </button>
        </div>
      </form>
      {active && (
        <div data-no-print>
          <label className="monitoring-outcome">
            Resultado da conferência · opcional
            <textarea
              value={outcome}
              maxLength={2000}
              disabled={disabled}
              placeholder="Registre o que verificou antes de marcar como conferido."
              onChange={(event) => setOutcome(event.target.value)}
            />
          </label>
          <div className="monitoring-actions">
            <button type="button" disabled={disabled} onClick={() => save('complete')}>
              Marcar como conferido
            </button>
            <button type="button" disabled={disabled} onClick={() => save('cancel')}>
              Cancelar lembrete
            </button>
          </div>
        </div>
      )}
      {message && (
        <p className="scope" role="status">
          {message}
        </p>
      )}
      {record?.history.length > 0 && (
        <details className="monitoring-history">
          <summary>Histórico de lembretes · {record.history.length}</summary>
          <ol>
            {[...record.history].reverse().map((entry, index) => (
              <li key={index}>
                <div>
                  <strong>{reminderActions[entry.action]}</strong>
                  <time dateTime={entry.at}>{monitoringDate(entry.at)}</time>
                </div>
                <small>Conferência prevista: {monitoringDate(entry.dueAt)} · São Paulo</small>
                {entry.note && <p>{entry.note}</p>}
                {entry.outcome && <p>Resultado: {entry.outcome}</p>}
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
