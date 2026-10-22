import { useZohoSession } from '../hooks/ZohoSession.jsx';
import { parseCsv } from '../../consumption/domain/consumption.js';
import React, { useEffect, useId, useState } from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { authorizeAction } from '../../../shared/security/accessClient.js';
import { csv, download } from '../../../shared/export/exports.js';
import { analyzeZohoPresence } from '../domain/zohoPresence.js';
import { ZohoPresenceResults } from './ZohoPresenceResults.jsx';

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
      <summary>Permanência no Zoho · sessões dos agentes</summary>
      <details className="zoho-presence-setup" open={!report}>
        <summary>Fonte, colunas e período</summary>
        <p>
          Importe o CSV de Agent Availability → Session e confirme as colunas e o fuso. Os dados
          ficam nesta sessão do navegador. Permanência por sessões e tempo apontado em chamados são
          medidas distintas.
        </p>
        {!source && (
          <p className="scope">
            No Zoho: Analytics → Reports → Static Reports → Agent Availability → Session → exportar
            CSV. Confirme o fuso no arquivo antes de calcular. A leitura automática de sessões ainda
            depende de uma fonte validada.
          </p>
        )}
        <PermissionButton
          action="import"
          disabled={busy}
          onClick={() => document.getElementById(fileId).click()}
        >
          {busy ? 'Lendo CSV…' : 'Selecionar CSV Session'}
        </PermissionButton>
        <input id={fileId} type="file" accept=".csv,text/csv" hidden onChange={load} />
        <PermissionButton
          action="export"
          onClick={() =>
            download(
              csv([
                ['Agente fictício', 'Entrada', 'Saída'],
                ['Agente fictício A', '21/10/2026 08:00', '21/10/2026 10:00'],
                ['Agente fictício A', '21/10/2026 09:00', '21/10/2026 11:00'],
                ['Agente fictício B', '21/10/2026 08:00', '21/10/2026 09:00'],
                ['Agente fictício A', '21/10/2026 13:00', ''],
              ]),
              'text/csv;charset=utf-8',
              'EXEMPLO-FICTICIO-sessoes-zoho.csv',
            )
          }
        >
          Baixar exemplo fictício
        </PermissionButton>
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
      </details>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {report && <ZohoPresenceResults key={source.filename} report={report} source={source} />}
    </details>
  );
}
