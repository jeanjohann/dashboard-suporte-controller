import { clientDisplay } from '../../../shared/data/clientDisplay.js';
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
    .filter((row) => ['completed', 'cancelled'].includes(row.status))
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
                {record.plate || record.vehicleId} · {clientDisplay(record.clientName)}
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
      <details className="monitoring-reminders-content">
        <summary>
          <strong>Lembretes de conferência</strong>
          <span role="status" aria-live="polite" data-overdue={due > 0}>
            {reminders.loading
              ? 'Carregando…'
              : reminders.error
                ? 'Falha ao conferir lembretes'
                : due + ' pendentes · ' + (active.length - due) + ' agendados'}
          </span>
        </summary>
        {reminders.records.length > 0 && (
          <PermissionButton action="export" onClick={exportHistory} data-no-print>
            Exportar histórico CSV
          </PermissionButton>
        )}
        <p className="scope">
          {reminders.mode === 'remote'
            ? 'Agenda salva no banco do sistema, disponível nos computadores autorizados. '
            : 'Salvos neste navegador para este usuário, sem sincronização. '}
          Horários de São Paulo; os filtros da fila não ocultam lembretes.{' '}
          {demo ? 'Lembretes fictícios separados dos reais. ' : ''}Abra o histórico de um veículo
          para agendar.{' '}
          {reminders.mode !== 'remote' && 'Limpar os dados do navegador remove estes registros.'}
        </p>
        {reminders.migration && (
          <div className="notice" role="status">
            <p>
              Há {reminders.migration.length} lembretes neste navegador para migrar, incluindo os
              encerrados e seu histórico. A cópia local será mantida. Históricos diferentes no banco
              não serão substituídos.
            </p>
            <details>
              <summary>Conferir registros locais</summary>
              <ul>
                {reminders.migration.map((row) => (
                  <li key={row.key}>
                    {row.plate || row.vehicleId} · {clientDisplay(row.clientName)} ·{' '}
                    {row.history.length} eventos · {reminderLabels[row.status]}
                    {reminders.migrationResults?.some(
                      (result) => result.key === row.key && result.status === 'conflict',
                    ) && ' · Histórico diferente no banco'}
                  </li>
                ))}
              </ul>
            </details>
            <PermissionButton
              action="import"
              disabled={reminders.saving}
              onClick={reminders.migrate}
            >
              {reminders.saving ? 'Migrando…' : 'Migrar lembretes para o banco'}
            </PermissionButton>
            <PermissionButton
              action="export"
              onClick={() =>
                download(
                  csv(reminderExportRows(reminders.migration)),
                  'text/csv;charset=utf-8',
                  'lembretes-locais-antes-da-migracao.csv',
                )
              }
            >
              Exportar cópia local CSV
            </PermissionButton>
          </div>
        )}
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
                {detail.plate} · {clientDisplay(detail.clientName)}
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
      </details>
      {reminders.error && (
        <p role="alert" className="notice">
          Os lembretes não puderam ser confirmados. Abra a seção para tentar novamente.
        </p>
      )}
    </section>
  );
}
