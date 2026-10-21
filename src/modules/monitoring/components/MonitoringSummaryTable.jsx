import React, { useMemo, useState } from 'react';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { compareValues } from '../../../shared/data/sorting.js';

/** Colunas e paginação afetam a apresentação; ordenação considera o conjunto completo. */
export function MonitoringSummaryTable({ label, rows, columns }) {
  const [complete, setComplete] = useState(false),
    [custom, setCustom] = useState(null),
    [sort, setSort] = useState(null),
    [page, setPage] = useState(0);
  const shown = columns.filter(
    (column) =>
      column.required || (custom ? custom.includes(column.id) : complete || column.essential),
  );
  const ordered = useMemo(() => {
    const column = shown[sort?.index];
    if (!column || !sort) return rows;
    return rows
      .map((row, index) => ({ row, index }))
      .sort(
        (a, b) =>
          compareValues(column.value(a.row), column.value(b.row), sort.direction) ||
          a.index - b.index,
      )
      .map((entry) => entry.row);
  }, [rows, columns, complete, custom, sort]);
  const last = Math.max(0, Math.ceil(rows.length / 15) - 1),
    current = Math.min(page, last);
  const resetView = (value) => {
    setComplete(value);
    setCustom(null);
    setSort(null);
    setPage(0);
  };
  return (
    <div className="monitoring-summary-table">
      <div className="monitoring-table-controls">
        <div role="group" aria-label={`Visualização de ${label}`}>
          <button
            type="button"
            aria-pressed={!complete && !custom}
            onClick={() => resetView(false)}
          >
            Essencial
          </button>
          <button type="button" aria-pressed={complete && !custom} onClick={() => resetView(true)}>
            Completa
          </button>
        </div>
        <details>
          <summary>Escolher colunas</summary>
          <div className="monitoring-column-options">
            {columns
              .filter((column) => !column.required)
              .map((column) => (
                <label key={column.id}>
                  <input
                    type="checkbox"
                    checked={shown.some((item) => item.id === column.id)}
                    onChange={(event) => {
                      const ids = shown.map((item) => item.id);
                      setCustom(
                        event.target.checked
                          ? [...ids, column.id]
                          : ids.filter((id) => id !== column.id),
                      );
                      setSort(null);
                    }}
                  />
                  {column.label}
                </label>
              ))}
          </div>
        </details>
        <span className="scope">
          {rows.length} {label} · {shown.length} colunas visíveis
        </span>
      </div>
      <TableScroll label={`Tabela de ${label}`}>
        <SortableTable
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(0);
          }}
        >
          <thead>
            <tr>
              {shown.map((column) => (
                <th key={column.id} data-cell-type={column.numeric ? 'number' : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.slice(current * 15, (current + 1) * 15).map((row) => (
              <tr key={row.id}>
                {shown.map((column) => (
                  <td
                    key={column.id}
                    data-cell-type={column.numeric ? 'number' : undefined}
                    data-sort={column.value(row)}
                  >
                    {column.render ? column.render(row) : column.value(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </TableScroll>
      {!rows.length && <p className="scope">Nenhum registro neste recorte.</p>}
      {last > 0 && (
        <p className="monitoring-print-scope">
          Tabela paginada: impressão das linhas {current * 15 + 1}–
          {Math.min((current + 1) * 15, rows.length)} de {rows.length}. A exportação do módulo
          contém o recorte completo.
        </p>
      )}
      {last > 0 && (
        <footer className="monitoring-table-pagination">
          <span>
            {current * 15 + 1}–{Math.min((current + 1) * 15, rows.length)} de {rows.length}
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
      )}
    </div>
  );
}
