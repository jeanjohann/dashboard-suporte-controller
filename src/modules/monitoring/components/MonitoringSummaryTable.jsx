import React, { useMemo, useRef, useState } from 'react';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { compareValues } from '../../../shared/data/sorting.js';

const PAGE_SIZE = 10;

function sortRows(rows, columns, sort) {
  const column = columns[sort?.index];
  if (!column || !sort) return rows;
  return rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        compareValues(column.value(a.row), column.value(b.row), sort.direction) ||
        a.index - b.index,
    )
    .map((entry) => entry.row);
}

function TablePagination({ rows, page, onPage }) {
  const last = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
  const current = Math.min(page, last);
  if (last === 0) return null;

  return (
    <footer className="monitoring-table-pagination">
      <span>
        {current * PAGE_SIZE + 1}–{Math.min((current + 1) * PAGE_SIZE, rows.length)} de{' '}
        {rows.length}
      </span>
      <button disabled={!current} onClick={() => onPage(current - 1)}>
        Anterior
      </button>
      <button disabled={current === last} onClick={() => onPage(current + 1)}>
        Próxima
      </button>
      <button disabled={current === last} onClick={() => onPage(last)}>
        Última
      </button>
    </footer>
  );
}

function SummaryGrid({ label, columns, rows, sort, onSort, page, onPage, className = '' }) {
  const last = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
  const current = Math.min(page, last);
  const ordered = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);

  return (
    <>
      <TableScroll label={`Tabela de ${label}`} className={className}>
        <SortableTable sort={sort} onSortChange={onSort}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} data-cell-type={column.numeric ? 'number' : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE).map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
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
          Tabela paginada: impressão das linhas {current * PAGE_SIZE + 1}–
          {Math.min((current + 1) * PAGE_SIZE, rows.length)} de {rows.length}. A exportação do
          módulo contém o recorte completo.
        </p>
      )}
      <TablePagination rows={rows} page={page} onPage={onPage} />
    </>
  );
}

/** Grade essencial compacta com acesso às colunas completas em um modal próprio. */
export function MonitoringSummaryTable({ label, rows, columns, title }) {
  const [custom, setCustom] = useState(null);
  const [inlineSort, setInlineSort] = useState(null);
  const [modalSort, setModalSort] = useState(null);
  const [inlinePage, setInlinePage] = useState(0);
  const [modalPage, setModalPage] = useState(0);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const modalHeading = useRef(null);

  const essentialColumns = columns.filter((column) => column.required || column.essential);
  const modalColumns = columns.filter(
    (column) => column.required || (custom ? custom.includes(column.id) : true),
  );

  function openCompleteView() {
    if (dialog.current?.open) return;
    dialog.current?.showModal();
    modalHeading.current?.focus();
  }

  function toggleColumn(columnId, checked) {
    const visible = custom || columns.map((column) => column.id);
    setCustom(checked ? [...visible, columnId] : visible.filter((id) => id !== columnId));
    setModalSort(null);
    setModalPage(0);
  }

  return (
    <div className="monitoring-summary-table">
      <div className="monitoring-summary-table-heading">
        <h3>{title || `Resumo · ${label}`}</h3>
        <button ref={trigger} type="button" aria-haspopup="dialog" onClick={openCompleteView}>
          Abrir tabela completa
        </button>
      </div>
      <p className="monitoring-summary-table-meta scope">
        {rows.length} {label} · {essentialColumns.length} colunas essenciais
      </p>
      <SummaryGrid
        label={label}
        columns={essentialColumns}
        rows={rows}
        sort={inlineSort}
        onSort={(value) => {
          setInlineSort(value);
          setInlinePage(0);
        }}
        page={inlinePage}
        onPage={setInlinePage}
      />

      <dialog
        ref={dialog}
        className="page-settings-dialog page-settings-dialog-wide monitoring-analytics-table-dialog"
        aria-labelledby={`monitoring-table-${label.replace(/[^a-z0-9]+/gi, '-')}-title`}
        onClose={() => trigger.current?.focus()}
      >
        <header className="monitoring-analytics-table-dialog-heading">
          <div>
            <span className="monitoring-analytics-table-eyebrow">MONITORAMENTO ATIVO</span>
            <h2
              ref={modalHeading}
              tabIndex={-1}
              id={`monitoring-table-${label.replace(/[^a-z0-9]+/gi, '-')}-title`}
            >
              Visão completa · {label}
            </h2>
            <p>{rows.length} registros · selecione colunas para ajustar a tabela.</p>
          </div>
          <button type="button" onClick={() => dialog.current?.close()}>
            Fechar
          </button>
        </header>
        <div className="page-settings-body monitoring-analytics-table-dialog-body">
          <details className="monitoring-analytics-column-picker">
            <summary>Escolher colunas</summary>
            <div className="monitoring-column-options">
              {columns
                .filter((column) => !column.required)
                .map((column) => (
                  <label key={column.id}>
                    <input
                      type="checkbox"
                      checked={modalColumns.some((item) => item.id === column.id)}
                      onChange={(event) => toggleColumn(column.id, event.target.checked)}
                    />
                    {column.label}
                  </label>
                ))}
            </div>
          </details>
          <SummaryGrid
            label={label}
            columns={modalColumns}
            rows={rows}
            sort={modalSort}
            onSort={(value) => {
              setModalSort(value);
              setModalPage(0);
            }}
            page={modalPage}
            onPage={setModalPage}
            className="monitoring-analytics-complete-grid"
          />
        </div>
      </dialog>
    </div>
  );
}
