import { useZohoSession } from '../hooks/ZohoSession.jsx';
import { parseCsv } from '../../consumption/domain/consumption.js';
import React, { useEffect, useId, useState } from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { csv, download } from '../../../shared/export/exports.js';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { analyzeZohoPresence } from '../domain/zohoPresence.js';
import { zohoDuration } from './ZohoActivitySummary.jsx';

/** Piloto local com mapeamento explícito; não consulta endpoint de presença nem persiste dados. */
export function ZohoPresencePanel() {
  const fileId = useId();
  const session = useZohoSession();
  const stored = session?.presence;
  const savePresence = session?.setPresence;
  const [source, setSource] = useState(stored?.source || null),
    [mapping, setMapping] = useState(stored?.mapping || { agent: -1, start: -1, end: -1 }),
    [offset, setOffset] = useState(stored?.offset || ''),
    [start, setStart] = useState(stored?.start || ''),
    [end, setEnd] = useState(stored?.end || ''),
    [report, setReport] = useState(stored?.report || null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    savePresence?.({ source, mapping, offset, start, end, report });
  }, [source, mapping, offset, start, end, report, savePresence]);
  async function load(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!(await authorizeAction('import'))) return;
    setBusy(true);
    setError('');
    try {
      if (!/\.csv$/i.test(file.name) || file.size > 2 * 1024 * 1024)
        throw Error('Use um CSV Session de até 2 MB.');
      const parsed = parseCsv(await file.text());
      if (!parsed.length) throw Error('CSV vazio.');
      if (parsed.length > 10001 || parsed.some((row) => row.cells.length > 100))
        throw Error('Limite do piloto: 10 mil linhas e 100 colunas.');
      const headers = parsed[0].cells;
      const rows = parsed.slice(1);
      setSource({ filename: file.name, headers, rows });
      setMapping({ agent: -1, start: -1, end: -1 });
      setReport(null);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  const change = (setter, value) => {
    setter(value);
    setReport(null);
    setError('');
  };
  return (
    <details className="zoho-detail-group zoho-presence">
      <summary>Permanência por sessões · importação local</summary>
      <p>
        Importe o CSV de Agent Availability → Session e confirme as colunas e o fuso. Os dados ficam
        nesta sessão do navegador. Permanência por sessões e tempo apontado em chamados são medidas
        distintas.
      </p>
      <PermissionButton
        action="import"
        disabled={busy}
        onClick={() => document.getElementById(fileId).click()}
      >
        {busy ? 'Lendo CSV…' : 'Selecionar CSV Session'}
      </PermissionButton>
      <input id={fileId} type="file" accept=".csv,text/csv" hidden onChange={load} />
      {source && (
        <>
          <p className="scope">
            {source.filename} · {source.rows.length} linhas · cabeçalhos preservados. Prefira o ID
            do agente; nomes não são vinculados automaticamente às OS.
          </p>
          <div className="zoho-presence-fields">
            {Object.entries({
              agent: 'Agente · ID ou nome único',
              start: 'Entrada da sessão',
              end: 'Saída da sessão',
            }).map(([key, label]) => (
              <label key={key}>
                {label}
                <select
                  aria-label={label}
                  value={mapping[key]}
                  onChange={(event) =>
                    change(setMapping, { ...mapping, [key]: Number(event.target.value) })
                  }
                >
                  <option value={-1}>Escolha a coluna</option>
                  {source.headers.map((header, index) => (
                    <option key={index} value={index}>
                      {index + 1} · {header || 'Sem cabeçalho'}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              Fuso das datas sem indicação
              <select
                aria-label="Fuso do CSV Session"
                value={offset}
                onChange={(event) => change(setOffset, event.target.value)}
              >
                <option value="">Confirme o fuso do arquivo</option>
                {[
                  ['-03:00', 'UTC−03:00'],
                  ['Z', 'UTC'],
                  ['-04:00', 'UTC−04:00'],
                  ['-05:00', 'UTC−05:00'],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              De · sessões
              <input
                type="date"
                value={start}
                onChange={(event) => change(setStart, event.target.value)}
              />
            </label>
            <label>
              Até · sessões
              <input
                type="date"
                value={end}
                onChange={(event) => change(setEnd, event.target.value)}
              />
            </label>
          </div>
          <p className="scope">
            Formatos aceitos: dd/mm/aaaa hh:mm[:ss] ou ISO. Datas ISO com fuso mantêm seu próprio
            deslocamento. O período é independente da consulta de chamados.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                setReport(analyzeZohoPresence(source.rows, mapping, { offset, start, end }));
                setError('');
              } catch (failure) {
                setError(failure.message);
              }
            }}
          >
            Conferir permanência
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {report && (
        <>
          <div className="cards">
            <article>
              <span>Permanência acumulada por agente</span>
              <strong>
                {report.groups.length ? zohoDuration(report.totalSeconds) : 'Indisponível'}
              </strong>
            </article>
            <article>
              <span>Sessões válidas no período</span>
              <strong>{report.validSessions}</strong>
            </article>
            <article>
              <span>Apontamentos para conferência</span>
              <strong>{report.issues.length}</strong>
            </article>
          </div>
          <p className="scope">
            A tela mostra até 50 agentes e 50 apontamentos; a exportação contém a conferência
            completa. Sobreposições contam uma vez por agente. Sessões abertas ou inválidas ficam
            fora das durações; não é aplicado timeout presumido. {report.outside} sessões fora do
            período. Não comprova jornada ou trabalho contínuo.
          </p>
          <TableScroll label="Permanência por agente">
            <table>
              <thead>
                <tr>
                  <th>Agente informado</th>
                  <th>Permanência</th>
                  <th>Sessões</th>
                  <th>Sobreposições</th>
                  <th>Linhas Excel/CSV</th>
                </tr>
              </thead>
              <tbody>
                {report.groups.slice(0, 50).map((row) => (
                  <tr key={row.agent}>
                    <th>{row.agent}</th>
                    <td>{zohoDuration(row.seconds)}</td>
                    <td>{row.sessions}</td>
                    <td>{row.overlaps}</td>
                    <td>{row.rows.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          <PermissionButton
            action="export"
            onClick={() =>
              download(
                csv([
                  ['Fonte', source.filename],
                  ['Fuso', report.offset],
                  ['Período', report.start || 'Início disponível', report.end || 'Fim disponível'],
                  [
                    'Agente',
                    'Permanência em segundos',
                    'Sessões',
                    'Sobreposições',
                    'Linhas de origem',
                  ],
                  ...report.groups.map((row) => [
                    row.agent,
                    row.seconds,
                    row.sessions,
                    row.overlaps,
                    row.rows.join(', '),
                  ]),
                  [],
                  ['Linha', 'Agente', 'Conferência'],
                  ...report.issues.map((row) => [row.row, row.agent, row.reason]),
                ]),
                'text/csv;charset=utf-8',
                'zoho-permanencia-conferida.csv',
              )
            }
          >
            Exportar conferência de sessões
          </PermissionButton>
          {!!report.issues.length && (
            <details>
              <summary>Registros para conferir ({report.issues.length})</summary>
              <TableScroll label="Conferência das sessões">
                <table>
                  <thead>
                    <tr>
                      <th>Linha CSV</th>
                      <th>Agente</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.issues.slice(0, 50).map((row, index) => (
                      <tr key={index}>
                        <td>{row.row}</td>
                        <td>{row.agent}</td>
                        <td>{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            </details>
          )}
        </>
      )}
    </details>
  );
}
