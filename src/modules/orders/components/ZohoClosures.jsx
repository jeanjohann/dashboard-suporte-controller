import React, { useState } from 'react';
import { zohoTeam } from '../../../shared/data/zohoActivity.js';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { zohoDuration } from './ZohoActivitySummary.jsx';
import { ZohoColumnPicker } from './ZohoColumnPicker.jsx';

const columns = [
  ['closedAt', 'Fechamento (Brasília)'],
  ['agentId', 'Quem fechou'],
  ['ownerId', 'Responsável atual'],
  ['leaders', 'Maior tempo apontado'],
  ['contributions', 'Tempo por agente'],
  ['status', 'Status de fechamento'],
];
const defaults = columns.map(([key]) => key);
const name = (id, fallback) =>
  zohoTeam.find((agent) => agent.id === id)?.name ||
  fallback ||
  (id ? `Agente ${id}` : 'Não informado');
export function ZohoClosures({ closures }) {
  const [selected, setSelected] = useState(defaults);
  return (
    <details className="zoho-detail-group" open>
      <summary>Fechamentos e participação na resolução · {closures.length} eventos</summary>
      <p>
        Um chamado conta uma vez por agente no período, mesmo quando é fechado novamente. A tabela
        preserva cada evento, incluindo fechamentos seguidos de reabertura. O responsável é o atual,
        na coleta; não é uma atribuição histórica.
      </p>
      <p>
        Maior tempo usa apontamentos atualmente disponíveis, com execução até o fechamento, mesmo
        anteriores ao início do período. Inclui outros agentes e empates; não comprova sozinho
        esforço total ou qualidade. Nenhuma pontuação de peso foi aplicada.
      </p>
      <ZohoColumnPicker
        columns={columns}
        selected={selected}
        onChange={setSelected}
        defaults={defaults}
      />
      <div className="table-scroll" tabIndex={0}>
        <SortableTable aria-label="Fechamentos por chamado e participação dos agentes">
          <thead>
            <tr>
              <th>Chamado</th>
              {columns
                .filter(([key]) => selected.includes(key))
                .map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {closures.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.number} · ID {row.ticketId}
                </td>
                {selected.includes('closedAt') && (
                  <td data-sort={Date.parse(row.closedAt)}>
                    {new Date(row.closedAt).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                    })}
                  </td>
                )}
                {selected.includes('agentId') && (
                  <td>{row.agentId ? name(row.agentId, row.agentName) : row.executor}</td>
                )}
                {selected.includes('ownerId') && <td>{name(row.ownerId)}</td>}
                {selected.includes('leaders') && (
                  <td>
                    {row.leaderIds.length
                      ? row.leaderIds
                          .map((id) =>
                            name(id, row.contributions.find((entry) => entry.agentId === id)?.name),
                          )
                          .join(' / ')
                      : 'Sem tempo válido apontado'}
                    {row.leaderIds.length > 1 && ' · empate'}
                    {row.effortReviewCount > 0 && (
                      <small>
                        {' '}
                        · comparação parcial: {row.effortReviewCount} apontamentos para revisão
                      </small>
                    )}
                  </td>
                )}
                {selected.includes('contributions') && (
                  <td>
                    {row.contributions.length
                      ? row.contributions.map((entry) => (
                          <div key={entry.agentId}>
                            {name(entry.agentId, entry.name)}: {zohoDuration(entry.seconds)}
                          </div>
                        ))
                      : 'Sem apontamentos válidos até o fechamento'}
                  </td>
                )}
                {selected.includes('status') && <td>{row.status}</td>}
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
      {!closures.length && (
        <p>Nenhum fechamento relacionado a Eduardo ou Jean foi confirmado nesta coleta.</p>
      )}
    </details>
  );
}
