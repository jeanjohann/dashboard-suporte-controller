/** Conferência das células originais e dos candidatos operacionais, sem corrigir ou atribuir vínculos. */
import React from 'react';
import { SortableTable } from '../../../components/SortableTable.jsx';
export function ConsumptionSourcePanel({ row, statements, onClose }) {
  return (
    <>
      {row && (
        <section className="panel line-source">
          <button onClick={onClose}>Fechar registros de origem</button>
          <h2>
            {row.operator} · {row.number} · ICCID {row.iccid}
          </h2>
          <p className="scope">
            {row.filename} · linha {row.sourceRow}.{' '}
            {row.problems.join('; ') || 'Sem problemas na apuração de dados.'} {row.linkState}.
          </p>
          <div className="table-scroll">
            <SortableTable>
              <thead>
                <tr>
                  <th>Campo original</th>
                  <th>Valor original</th>
                </tr>
              </thead>
              <tbody>
                {statements
                  .find((statement) => statement.id === row.statementId)
                  .headers.map((header, index) => (
                    <tr key={index}>
                      <td>{header}</td>
                      <td>{row.cells[index]}</td>
                    </tr>
                  ))}
              </tbody>
            </SortableTable>
          </div>
          {!!row.candidates.length && (
            <>
              <h3>Registros encontrados no operacional</h3>
              <div className="table-scroll">
                <SortableTable>
                  <thead>
                    <tr>
                      {[
                        'Linha Excel',
                        'Cliente',
                        'ID equipamento',
                        'MSISDN',
                        'ICCID',
                        'Placa',
                        'Situação',
                      ].map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {row.candidates.map((row) => (
                      <tr key={row.sourceRow}>
                        <td>{row.sourceRow}</td>
                        <td>{row.client}</td>
                        <td>{row.serial}</td>
                        <td>{row.phone}</td>
                        <td>{row.iccid}</td>
                        <td>{row.plate}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
