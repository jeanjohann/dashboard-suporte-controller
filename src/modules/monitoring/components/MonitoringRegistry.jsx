import React, { useMemo, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { PermissionButton, useAccess } from '../../../shared/security/Access.jsx';
import { allowsPage } from '../../../shared/security/permissions.js';
import { clientDisplay } from '../../../shared/data/clientDisplay.js';
import { csv, download } from '../../../shared/export/exports.js';
import {
  reconcileMonitoringRegistry,
  registryStates,
  registryExportRows,
} from '../domain/monitoringRegistry.js';
import { monitoringDate } from '../domain/monitoring.js';

/** Leitura conjunta apenas das fontes autorizadas da sessão, sem consultas ou correções automáticas. */
export function MonitoringRegistry({ snapshot, operational, onPage }) {
  const { user } = useAccess();
  const permitted = allowsPage(user, 'operational') || allowsPage(user, 'operational-analysis');
  const [state, setState] = useState('all'),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(0);
  const report = useMemo(
    () =>
      permitted && operational?.data && snapshot && !snapshot.demonstration
        ? reconcileMonitoringRegistry(snapshot, operational.data)
        : null,
    [permitted, operational, snapshot],
  );
  const rows = useMemo(
    () =>
      report?.rows.filter(
        (row) =>
          (state === 'all' || row.state === state) &&
          clientDisplay(
            [
              row.serial,
              ...row.api.flatMap((r) => [r.plate, r.clientName, r.clientId]),
              ...row.operational.flatMap((r) => [r.plate, r.client, r.sourceRow]),
            ].join(' '),
          ).includes(clientDisplay(search.trim())),
      ) || [],
    [report, state, search],
  );
  const last = Math.max(0, Math.ceil(rows.length / 20) - 1),
    current = Math.min(page, last);
  if (!permitted)
    return (
      <p className="notice">A conferência exige acesso ao Operacional ou Parque e Manutenção.</p>
    );
  if (!report)
    return (
      <Section title="Conferência de cadastros · API × Operacional">
        <p>
          Carregue a planilha Operacional ou faça sua leitura conectada; depois consulte a
          integração de monitoramento. As fontes ficam somente nesta sessão.
        </p>
        <button
          onClick={() =>
            onPage(allowsPage(user, 'operational') ? 'operational' : 'operational-analysis')
          }
        >
          Abrir base operacional
        </button>
      </Section>
    );
  return (
    <Section
      title="Conferência de cadastros · API × Operacional"
      help="Vínculo pelo serial numérico exato e único nas duas fontes. Placa não é usada para forçar correspondência. Ausência em uma fonte não comprova erro de cadastro. Bases do legado podem ter códigos diferentes da razão social; diferenças de nomes e variantes de modelo exigem conferência. Todas as linhas do Operacional são consideradas, inclusive canceladas. Nenhuma fonte é modificada."
    >
      <p className="scope">
        Operacional: {operational.filename} · {report.operationalRows} registros · API:{' '}
        {report.apiRows} registros · Coleta mais antiga {monitoringDate(report.collectionAt)} ·
        Referência da conferência {monitoringDate(report.referenceAt)}.
      </p>
      {report.stale && (
        <p role="status" className="notice">
          A coleta está antiga ou indisponível em uma ou mais bases. Esta conferência usa a frota
          anterior; atualize a API antes de concluir divergências.
        </p>
      )}
      <div className="monitoring-registry-counts">
        {registryStates.map((label) => (
          <button
            key={label}
            aria-pressed={state === label}
            onClick={() => {
              setState(state === label ? 'all' : label);
              setPage(0);
            }}
          >
            <span>{label}</span>
            <strong>{report.counts[label]}</strong>
          </button>
        ))}
      </div>
      <div className="monitoring-registry-controls">
        <label>
          Conferência
          <select
            aria-label="Conferência de cadastro"
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">Todas</option>
            {registryStates.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Buscar serial, placa, cliente ou linha
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <PermissionButton
          action="export"
          onClick={() =>
            download(
              csv(
                registryExportRows(
                  { ...report, rows },
                  { filename: operational.filename, filters: { state, search } },
                ),
              ),
              'text/csv;charset=utf-8',
              'conferencia-api-operacional.csv',
            )
          }
        >
          Exportar conferência CSV
        </PermissionButton>
      </div>
      <p className="scope">
        {rows.length} grupos no recorte. Grupos ambíguos contêm todas as ocorrências. Diferença de
        cliente/base indica necessidade de conferir nomes ou códigos, sem equivalência presumida. A
        comparação não usa os filtros das outras categorias.
      </p>
      <TableScroll label="Divergências de cadastro">
        <table>
          <thead>
            <tr>
              <th>Serial</th>
              <th>Conferência</th>
              <th>API · placa / base / modelo</th>
              <th>Operacional · linha / placa / cliente / modelo / situação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(current * 20, (current + 1) * 20).map((row) => (
              <tr key={row.key}>
                <th>{row.serial || 'Não informado'}</th>
                <td>{row.state}</td>
                <td>
                  {row.api.map((r, i) => (
                    <div key={i}>
                      {r.plate || 'Sem placa'} · {clientDisplay(r.clientName || r.clientId)} ·{' '}
                      {r.deviceModel || 'Sem modelo'}
                      <small className="monitoring-cell-note">
                        Base {r.clientId} · Veículo {r.vehicleId}
                      </small>
                    </div>
                  ))}
                </td>
                <td>
                  {row.operational.map((r, i) => (
                    <div key={i}>
                      Linha {r.sourceRow}: {r.plate || 'Sem placa'} · {clientDisplay(r.client)} ·{' '}
                      {r.model || 'Sem modelo'} · {r.status || 'Sem situação'}
                    </div>
                  ))}
                </td>
                <td>{row.issues.join(' ') || 'Sem diferenças nos campos disponíveis.'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      {!rows.length && <p role="status">Nenhum registro neste recorte.</p>}
      <footer className="monitoring-table-pagination">
        <span>
          {rows.length ? current * 20 + 1 : 0}–{Math.min((current + 1) * 20, rows.length)} de{' '}
          {rows.length} · impressão desta página; CSV do recorte completo
        </span>
        <button disabled={!current} onClick={() => setPage(current - 1)}>
          Anterior
        </button>
        <button disabled={current === last} onClick={() => setPage(current + 1)}>
          Próxima
        </button>
        <button disabled={current === last} onClick={() => setPage(last)}>
          Última
        </button>
      </footer>
    </Section>
  );
}
