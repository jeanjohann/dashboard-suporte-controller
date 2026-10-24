/** Vínculos paginados com ordenação global e preparação integral para impressão. */
import React, { useEffect, useMemo, useState } from 'react';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { SortableTable, compareValues } from '../../../components/SortableTable.jsx';
import { usePrintMode } from '../../../shared/charts/usePrintMode.js';

export function OperationalLinksTable({ rows }) {
  const [sort, setSort] = useState(null),
    [page, setPage] = useState(0);
  const printing = usePrintMode();
  useEffect(() => setPage(0), [rows]);
  const ordered = useMemo(() => {
    if (!sort) return rows;
    const fields = ['sourceRow', 'client', 'serial', 'plate', 'state'];
    const value = (row) =>
      sort.index === 5
        ? row.state === 'Com histórico disponível'
          ? row.services.map((s) => s.sourceRow).join(', ')
          : '—'
        : row[fields[sort.index]];
    return [...rows].sort(
      (a, b) => compareValues(value(a), value(b), sort.direction) || a.sourceRow - b.sourceRow,
    );
  }, [rows, sort]);
  const last = Math.max(0, Math.ceil(ordered.length / 50) - 1),
    current = Math.min(page, last);
  const shown = printing ? ordered : ordered.slice(current * 50, current * 50 + 50);
  return (
    <>
      <TableScroll label="Vínculos do operacional">
        <SortableTable
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            setPage(0);
          }}
        >
          <thead>
            <tr>
              {['Linha operacional', 'Cliente', 'Serial', 'Placa', 'Vínculo', 'Linhas OS'].map(
                (label) => (
                  <th key={label}>{label}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.sourceRow}>
                <td>{r.sourceRow}</td>
                <td>{r.client}</td>
                <td>{r.serial}</td>
                <td>{r.plate}</td>
                <td>{r.state}</td>
                <td>
                  {r.state === 'Com histórico disponível'
                    ? r.services.map((s) => s.sourceRow).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </TableScroll>
      {!printing && (
        <footer aria-label="Paginação dos vínculos">
          <button disabled={!current} onClick={() => setPage(current - 1)}>
            Anterior
          </button>
          <span>
            {current + 1} / {last + 1} · {rows.length} vínculos · ordenação de toda a seleção
          </span>
          <button disabled={current === last} onClick={() => setPage(current + 1)}>
            Próxima
          </button>
          <button disabled={current === last} onClick={() => setPage(last)}>
            Última
          </button>
        </footer>
      )}
    </>
  );
}
