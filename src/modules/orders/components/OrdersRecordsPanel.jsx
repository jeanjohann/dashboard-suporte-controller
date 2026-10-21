/** Conferência das células originais, revisão e tabela paginada/ordenada de OS. */
import { TableScroll } from '../../../components/TableScroll.jsx';
import React from 'react';
import { Section } from '../../../components/Section.jsx';
import { sectionLabels } from '../config/preferences.js';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { ReviewPanel } from '../../../components/ReviewPanel.jsx';

/** Apresenta o recorte e as ações recebidas; a base original permanece no controlador. */
export function OrdersRecordsPanel({ data, selected, review, visible, records, filename }) {
  const {
    search,
    setSearch,
    page,
    setPage,
    view,
    setView,
    filtered,
    orderedRecords,
    pageCount,
    recordSort,
    setRecordSort,
  } = records;
  return (
    <Section title={sectionLabels.records} visible={visible}>
      <section className="cards">
        {[
          [selected.rows.length.toLocaleString('pt-BR'), 'Atendimentos na seleção'],
          [selected.calls.toLocaleString('pt-BR'), 'Chamados na seleção'],
          [data.columns.length, 'Colunas com cabeçalho'],
          [selected.issues.length, 'Erros estruturais na seleção'],
        ].map(([value, label]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <div className="notice">
        Os valores originais foram preservados. Células vazias ficam em branco e erros aparecem
        destacados. Os cálculos financeiros consideram somente serviços realizados e preservam o
        total lançado.
        {data.skipped > 0 &&
          ` ${data.skipped} linhas preenchidas sem número de OS não foram importadas.`}
      </div>
      <section className="panel">
        <div className="toolbar">
          <div className="tabs">
            <button
              className={view === 'records' ? 'selected' : ''}
              onClick={() => setView('records')}
            >
              Atendimentos
            </button>
            <button
              className={view === 'issues' ? 'selected' : ''}
              onClick={() => setView('issues')}
            >
              Revisão ({review.length})
            </button>
          </div>
          {view === 'records' && (
            <input
              aria-label="Buscar em todas as colunas"
              placeholder="Buscar em todas as colunas…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          )}
        </div>
        {view === 'records' ? (
          <>
            <TableScroll label="Registros e revisão das OS">
              <table>
                <thead>
                  <tr>
                    <th>
                      <button
                        className="sort-heading"
                        onClick={() => {
                          setRecordSort((previous) =>
                            previous?.index === -1
                              ? previous.direction === 'asc'
                                ? { index: -1, direction: 'desc' }
                                : null
                              : { index: -1, direction: 'asc' },
                          );
                          setPage(0);
                        }}
                      >
                        Linha Excel{' '}
                        {recordSort?.index === -1
                          ? recordSort.direction === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </button>
                    </th>
                    {data.columns.map((col) => (
                      <th
                        key={col.index}
                        aria-sort={
                          recordSort?.index === data.columns.indexOf(col)
                            ? recordSort.direction === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        <button
                          className="sort-heading"
                          onClick={() => {
                            const index = data.columns.indexOf(col);
                            setRecordSort((previous) =>
                              previous?.index === index
                                ? previous.direction === 'asc'
                                  ? { index, direction: 'desc' }
                                  : null
                                : { index, direction: 'asc' },
                            );
                            setPage(0);
                          }}
                        >
                          <small>{col.letter}</small>
                          {col.label}{' '}
                          {recordSort?.index === data.columns.indexOf(col)
                            ? recordSort.direction === 'asc'
                              ? '↑'
                              : '↓'
                            : '↕'}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderedRecords.slice(page * 50, (page + 1) * 50).map((row) => (
                    <tr key={row.sourceRow}>
                      <td className="row-number">{row.sourceRow}</td>
                      {row.cells.map((cell, i) => (
                        <td
                          key={i}
                          className={cell.issue ? 'invalid' : ''}
                          title={
                            cell.issue
                              ? `Conteúdo original: ${cell.raw}. Revisar na planilha.`
                              : String(cell.display)
                          }
                        >
                          {cell.display}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <footer>
              <span>
                {filtered.length.toLocaleString('pt-BR')} atendimentos · ordem original da planilha
              </span>
              <div>
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Anterior
                </button>
                <span>
                  {page + 1} / {pageCount}
                </span>
                <button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>
                  Próxima
                </button>
                <button disabled={page + 1 >= pageCount} onClick={() => setPage(pageCount - 1)}>
                  Última
                </button>
              </div>
            </footer>
          </>
        ) : (
          <ReviewPanel issues={review} data={data} filename={filename} />
        )}
      </section>
      <InfoNote>
        Conferência estrutural: erros do Excel e formatos de data inválidos. Divergências de custo
        dos serviços realizados, cabeçalhos repetidos, variações de escrita do status e coerência
        entre Pago e Pago em também são sinalizados. Os avisos não corrigem células nem confirmam
        recebimento do cliente.
      </InfoNote>
    </Section>
  );
}
