import React from 'react';
import { SortableTable } from '../../../components/SortableTable.jsx';

/** Mantém a leitura automática visível mesmo quando o modo Compacto recolhe os detalhes manuais. */
export function PreparedEquipmentPanel({ summary, agentId, period }) {
  const rows = (summary?.agents || []).filter((agent) => !agentId || agent.id === agentId);
  const total = rows.reduce((sum, agent) => sum + agent.value, 0);
  const date = (value) => value.split('-').reverse().join('/');
  return (
    <section className="si-prepared-equipment" aria-label="Equipamentos preparados por agente">
      <h4>Equipamentos preparados por agente</h4>
      <p className="scope">
        Logística · data de envio · {date(period.start)} a {date(period.end)}
      </p>
      {!summary ? (
        <p className="scope">Aguardando a base de Logística salva no banco.</p>
      ) : summary.unavailable ? (
        <p className="notice">
          A base não contém a coluna de preparação. Preencha “Responsável Suporte” na aba Enviados e
          importe a planilha novamente.
        </p>
      ) : (
        <>
          <div className="si-table">
            <SortableTable aria-label="Preparação de equipamentos por agente">
              <thead>
                <tr>
                  <th>Agente</th>
                  <th className="si-numeric">Preparados</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((agent) => (
                  <tr key={agent.id}>
                    <td>{agent.name}</td>
                    <td className="si-numeric" data-sort={agent.value}>
                      {agent.value.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total no recorte</th>
                  <td className="si-numeric">{total.toLocaleString('pt-BR')}</td>
                </tr>
              </tfoot>
            </SortableTable>
          </div>
          <small className="scope">
            Uma linha de envio com equipamento e responsável reconhecido conta uma preparação. Os
            lançamentos manuais abaixo são apurados separadamente.
          </small>
          {summary.review > 0 && (
            <p className="notice">
              {summary.review.toLocaleString('pt-BR')} linhas de envio no período estão sem
              responsável reconhecido e ficaram fora da contagem.
            </p>
          )}
        </>
      )}
    </section>
  );
}
