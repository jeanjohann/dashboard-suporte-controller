/** Resumo global do modo atual: filtros da fila não escondem lembretes vencidos. */
import React, { useState } from 'react';
import { monitoringDate } from '../domain/monitoring.js';
import {
  reminderExportRows,
  reminderLabels,
  reminderOverdue,
} from '../domain/monitoringReminders.js';
import { MonitoringReminderEditor } from './MonitoringReminderEditor.jsx';
import { PermissionButton, useAccess } from '../../../shared/security/Access.jsx';
import { allowsAction } from '../../../shared/security/permissions.js';
import { csv, download } from '../../../shared/export/exports.js';

export function MonitoringReminders({ reminders, demo }) {
  const [selected, setSelected] = useState(null);
  const { user } = useAccess();
  const active = reminders.records
    .filter((row) => row.status === 'scheduled')
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  const closed = reminders.records
    .filter((row) => row.status !== 'scheduled')
    .sort((a, b) => Date.parse(b.history.at(-1).at) - Date.parse(a.history.at(-1).at));
  const due = active.filter((row) => reminderOverdue(row, reminders.now)).length;
  const detail = reminders.records.find((row) => row.key === selected);
  function exportHistory() {
    if (!allowsAction(user, 'export')) return;
    download(
      csv(reminderExportRows(reminders.records, demo)),
      'text/csv;charset=utf-8',
      `${demo ? 'DEMO-' : ''}lembretes-monitoramento.csv`,
    );
  }
  function list(rows) {
    return (
      <ul className="monitoring-reminder-list">
        {rows.map((record) => (
          <li key={record.key} data-overdue={reminderOverdue(record, reminders.now)}>
            <div>
              <strong>
                {record.plate || record.vehicleId} · {record.clientName}
              </strong>
              <small>
                Veículo {record.vehicleId} · Base {record.clientId}
              </small>
              <span>
                {reminderOverdue(record, reminders.now)
                  ? 'Conferência pendente'
                  : reminderLabels[record.status]}
                {' · '}
                <time dateTime={record.dueAt}>{monitoringDate(record.dueAt)}</time>
              </span>
              {record.note && <p>{record.note}</p>}
            </div>
            <button
              type="button"
              aria-expanded={selected === record.key}
              onClick={() => setSelected(selected === record.key ? null : record.key)}
            >
              Ver lembrete
            </button>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <section className="panel monitoring-reminders" aria-label="Lembretes de conferência">
      <div className="monitoring-reminder-heading">
        <div>
          <h2>Lembretes de conferência{demo ? ' · Demonstração' : ''}</h2>
          <p role="status" aria-live="polite">
            {reminders.loading
              ? 'Carregando lembretes salvos…'
              : reminders.error
                ? 'Não foi possível confirmar os lembretes salvos.'
                : `${due} pendente${due === 1 ? '' : 's'} de conferência · ${active.length - due} agendado${active.length - due === 1 ? '' : 's'}`}
          </p>
        </div>
        {reminders.records.length > 0 && (
          <PermissionButton action="export" onClick={exportHistory} data-no-print>
            Exportar histórico CSV
          </PermissionButton>
        )}
      </div>
      <p className="scope">
        Salvos neste navegador para este usuário, sem sincronização. Horários de São Paulo; os
        filtros da fila não ocultam lembretes.{' '}
        {demo ? 'Lembretes fictícios separados dos reais. ' : ''}Abra o histórico de um veículo para
        agendar. Limpar os dados do navegador remove estes registros.
      </p>
      {reminders.error && (
        <div role="alert">
          <p>{reminders.error}</p>
          <button onClick={reminders.reload}>Tentar carregar lembretes novamente</button>
        </div>
      )}
      {active.length > 0 && (
        <details open={due > 0 || undefined}>
          <summary>Próximas conferências · {active.length}</summary>
          {list(active)}
        </details>
      )}
      {!reminders.loading && !reminders.error && !active.length && (
        <p className="scope">Nenhum lembrete ativo.</p>
      )}
      {closed.length > 0 && (
        <details>
          <summary>Conferidos e cancelados · {closed.length}</summary>
          {list(closed)}
        </details>
      )}
      {detail && (
        <div className="monitoring-reminder-detail">
          <div className="monitoring-actions">
            <h3>
              {detail.plate} · {detail.clientName}
            </h3>
            <button onClick={() => setSelected(null)}>Fechar lembrete</button>
          </div>
          <MonitoringReminderEditor
            key={detail.key}
            vehicle={detail}
            record={detail}
            reminders={reminders}
          />
        </div>
      )}
    </section>
  );
}
