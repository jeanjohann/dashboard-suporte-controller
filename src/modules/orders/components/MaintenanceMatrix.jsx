import React, { useMemo, useState } from 'react';
import { maintenanceMatrix } from '../domain/maintenanceMatrix.js';
import { Section } from '../../../components/Section.jsx';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { csv, download } from '../../../shared/export/exports.js';

export function MaintenanceMatrix({ original, data, visible, filename }) {
  const analysis = useMemo(() => maintenanceMatrix(original, data), [original, data]);
  const [model, setModel] = useState(''),
    [reason, setReason] = useState(''),
    [detail, setDetail] = useState(null);
  const groups = analysis.groups.filter(
    (item) => (!model || item.model === model) && (!reason || item.reason === reason),
  );
  const models = [...new Set(groups.map((item) => item.model))],
    reasons = [...new Set(groups.map((item) => item.reason))];
  const selection = groups.find((item) => JSON.stringify([item.model, item.reason]) === detail);
  const total = groups.reduce((sum, item) => sum + item.value, 0);
  return (
    <Section title="Modelo × motivo da manutenção" visible={visible}>
      <p className="scope">
        Assistências técnicas efetivas de rastreadores. Cada troca é um evento, atribuído ao serial
        retirado; a entrada não é contada novamente. O motivo é o registrado na retirada. Acessórios
        ficam fora desta matriz. Volumes observados não representam taxa de falha nem vida útil.
      </p>
      {!analysis.available ? (
        <p>Faltam campos necessários para classificar as manutenções nesta fonte.</p>
      ) : (
        <>
          <div className="cards maintenance-matrix-cards">
            {[
              [total, 'Eventos no recorte da matriz'],
              [groups.reduce((sum, item) => sum + item.swaps, 0), 'Com troca identificada'],
              [analysis.undirected, 'Trocas sem direção · fora da matriz'],
              [analysis.partial, 'Trocas parcialmente filtradas · fora da matriz'],
              [analysis.flaggedRows, 'Linhas com classificação a conferir'],
            ].map(([value, label]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <div className="toolbar">
            <label>
              Modelo
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                <option value="">Todos</option>
                {[...new Set(analysis.groups.map((item) => item.model))].sort().map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Motivo
              <select value={reason} onChange={(event) => setReason(event.target.value)}>
                <option value="">Todos</option>
                {[...new Set(analysis.groups.map((item) => item.reason))].sort().map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <PermissionButton
              action="export"
              onClick={() =>
                download(
                  csv([
                    ['Arquivo', filename],
                    [
                      'Critério',
                      'Um evento por assistência; troca atribuída ao serial retirado. Acessórios excluídos.',
                    ],
                    ['Modelo', 'Motivo', 'Eventos', 'Com troca', 'Linhas Excel'],
                    ...groups.map((item) => [
                      item.model,
                      item.reason,
                      item.value,
                      item.swaps,
                      item.rows.join(', '),
                    ]),
                  ]),
                  'text/csv;charset=utf-8',
                  'matriz-modelo-motivo.csv',
                )
              }
            >
              Exportar matriz CSV
            </PermissionButton>
          </div>
          <TableScroll label="Matriz de modelos e motivos">
            <table>
              <thead>
                <tr>
                  <th>Modelo</th>
                  {reasons.map((value) => (
                    <th key={value}>{value}</th>
                  ))}
                  <th>Total de eventos</th>
                </tr>
              </thead>
              <tbody>
                {models.map((value) => (
                  <tr key={value}>
                    <th>{value}</th>
                    {reasons.map((motive) => {
                      const cell = groups.find(
                        (item) => item.model === value && item.reason === motive,
                      );
                      return (
                        <td
                          key={motive}
                          style={
                            cell
                              ? {
                                  background: `color-mix(in srgb, var(--chart-primary, #278c79) ${Math.round(10 + (30 * cell.value) / Math.max(...groups.map((item) => item.value)))}%, transparent)`,
                                }
                              : undefined
                          }
                        >
                          {cell ? (
                            <button
                              type="button"
                              onClick={() => setDetail(JSON.stringify([value, motive]))}
                              aria-label={`${value}, ${motive}: ${cell.value} ${cell.value === 1 ? 'evento' : 'eventos'}`}
                            >
                              {cell.value}
                            </button>
                          ) : (
                            '0'
                          )}
                        </td>
                      );
                    })}
                    <td>
                      {groups
                        .filter((item) => item.model === value)
                        .reduce((sum, item) => sum + item.value, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          {!groups.length && <p>Nenhum evento classificável neste recorte.</p>}
          {selection && (
            <RecordDetails
              compact
              data={original}
              rows={selection.rows}
              title={`${selection.model} · ${selection.reason} · ${selection.value} ${selection.value === 1 ? 'evento' : 'eventos'}`}
              onClose={() => setDetail(null)}
            />
          )}
        </>
      )}
    </Section>
  );
}
