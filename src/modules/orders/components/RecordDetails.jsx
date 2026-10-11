/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useState } from 'react';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { report } from '../domain/reports.js';
/** Mostra linhas originais selecionadas para justificar os números apresentados no relatório. */
export function RecordDetails({ data, rows, title }) {
  const wanted = new Set(rows),
    records = data.rows.filter((row) => wanted.has(row.sourceRow));
  return (
    <section className="record-details">
      <div className="inline-help-heading">
        <h3>
          {title} · {records.length} registros
        </h3>
        <InfoNote>
          Registros que compõem este resultado; linha original preservada. Clique no cabeçalho para
          ordenar.
        </InfoNote>
      </div>
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              <th>Linha Excel</th>
              {data.columns.map((col) => (
                <th key={col.index}>
                  {col.letter} · {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.sourceRow}>
                <td>{row.sourceRow}</td>
                {row.cells.map((cell, i) => (
                  <td key={i} data-sort={cell.issue ? null : cell.raw} title={String(cell.display)}>
                    {cell.display}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
    </section>
  );
}
/** Agrupa os atendimentos realizados do mês para detalhamento das linhas de origem. */
export function MonthlyBreakdown({ data }) {
  const [month, setMonth] = useState(null),
    result = report(data, 'Mês', 'attendances');
  const item = result.items.find((item) => item.label === month);
  return (
    <>
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Realizados</th>
              <th>Detalhamento</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.value}</td>
                <td className="table-action-cell">
                  <button
                    type="button"
                    className="table-record-action"
                    onClick={() => setMonth(month === item.label ? null : item.label)}
                  >
                    Conferir {item.rows.length} {item.rows.length === 1 ? 'linha' : 'linhas'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
      {item && (
        <RecordDetails data={data} rows={item.rows} title={`Atendimentos de ${item.label}`} />
      )}
    </>
  );
}
