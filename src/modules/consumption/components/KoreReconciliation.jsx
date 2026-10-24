import React, { useEffect, useMemo, useState } from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { csv, download } from '../../../shared/export/exports.js';
import { reconcileKoreCycle } from '../domain/koreReconciliation.js';
import { importLineStatement, VOLUME_SCALE } from '../domain/lineConsumption.js';
import { allowanceMB } from '../domain/sharedAllowance.js';

export function KoreReconciliation({ snapshot, period, files }) {
  const [reference, setReference] = useState(''),
    [page, setPage] = useState(0);
  useEffect(() => setPage(0), [snapshot, period, reference]);
  const candidates = useMemo(
    () =>
      files.filter(
        (file) =>
          file.origin !== 'kore-api' &&
          importLineStatement(file.text, file.filename, file.id).operator === 'Kore',
      ),
    [files],
  );
  const report = useMemo(() => {
    if (!reference) return null;
    try {
      return {
        result: reconcileKoreCycle(
          snapshot,
          period,
          candidates.find((f) => f.id === reference),
        ),
      };
    } catch (error) {
      return { error: error.message };
    }
  }, [snapshot, period, candidates, reference]);
  const data = report?.result;
  async function exportCsv() {
    if (!(await authorizeAction('export'))) return;
    download(
      csv([
        ['Conferência KORE; não altera o histórico', data.status],
        ['Ciclo', data.period.start, data.period.end],
        ['Coleta inicial/final', data.firstReadAt, data.readAt],
        ['CSV independente', data.filename],
        [
          'ICCID',
          'MSISDN API',
          'MSISDN CSV',
          'Situação',
          'API MB',
          'CSV MB',
          'Diferença API-CSV MB',
          'Linha CSV',
        ],
        ...data.details.map((r) => [
          r.iccid,
          r.numberApi,
          r.numberCsv,
          r.state,
          r.apiTicks == null ? '' : r.apiTicks / VOLUME_SCALE,
          r.csvTicks == null ? '' : r.csvTicks / VOLUME_SCALE,
          r.difference == null ? '' : r.difference / VOLUME_SCALE,
          r.sourceRow || '',
        ]),
      ]),
      'text/csv;charset=utf-8',
      'conferencia-kore-api-csv.csv',
    );
  }
  return (
    <details className="consumption-kore-reconciliation">
      <summary>Conferir API com extrato CSV do mesmo ciclo</summary>
      <label>
        CSV de referência
        <select
          value={reference}
          onChange={(e) => {
            setReference(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Selecione um CSV independente</option>
          {candidates.map((file) => (
            <option key={file.id} value={file.id}>
              {file.filename}
              {file.active === false ? ' · versão arquivada' : ''}
            </option>
          ))}
        </select>
      </label>
      <p className="scope">
        Usa as datas informadas acima, ICCID e MSISDN. Não soma API e CSV nem modifica a versão
        ativa. Coleta KORE pode atravessar vários lotes; apuração da operadora pode atrasar.
        Igualdade de volumes não confirma sozinha o ciclo.
      </p>
      {!candidates.length && (
        <p className="scope">Importe o extrato KORE para habilitar a comparação.</p>
      )}
      {report?.error && (
        <p role="status" className="notice">
          {report.error}
        </p>
      )}
      {data && (
        <>
          <p className="scope">
            {data.status} · {data.compared} linhas comparáveis · {data.equal} com volumes iguais ·{' '}
            {data.details.length} ICCIDs na conferência.
          </p>
          <p className="scope">
            Somente pares comparáveis: API {allowanceMB(data.totalApi)} MB · CSV{' '}
            {allowanceMB(data.totalCsv)} MB.
          </p>
          <PermissionButton action="export" onClick={exportCsv}>
            Exportar conferência CSV
          </PermissionButton>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ICCID</th>
                  <th>MSISDN API / CSV</th>
                  <th>Conferência</th>
                  <th>API MB</th>
                  <th>CSV MB</th>
                  <th>Diferença MB</th>
                </tr>
              </thead>
              <tbody>
                {data.details.slice(page * 30, page * 30 + 30).map((row, i) => (
                  <tr key={row.iccid + ':' + i}>
                    <td>{row.iccid || 'Não informado'}</td>
                    <td>
                      {row.numberApi || '—'} / {row.numberCsv || '—'}
                    </td>
                    <td>{row.state}</td>
                    <td>{allowanceMB(row.apiTicks)}</td>
                    <td>{allowanceMB(row.csvTicks)}</td>
                    <td>{allowanceMB(row.difference)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="toolbar">
            <button disabled={!page} onClick={() => setPage((p) => p - 1)}>
              Anteriores
            </button>
            <span>
              {page + 1} de {Math.max(1, Math.ceil(data.details.length / 30))}
            </span>
            <button
              disabled={(page + 1) * 30 >= data.details.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Próximos
            </button>
          </div>
        </>
      )}
    </details>
  );
}
