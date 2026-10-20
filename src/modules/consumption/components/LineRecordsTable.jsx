/**
 * Interface de consumo M2M: importação, histórico local, filtros, conferência e exportação.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { TableScroll } from '../../../components/TableScroll.jsx';
import React, { useEffect, useState } from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { compareValues } from '../../../shared/data/sorting.js';
import { chipKey, consumptionEligible } from '../domain/lineConsumption.js';
import { formatVolume as mb } from '../utils/consumptionFormatting.js';
import { latestConsumptionNotes } from '../domain/consumptionFollowup.js';
const recordColumns = [
  ['Operadora', (row) => row.operator],
  ['MSISDN', (row) => row.number],
  ['ICCID', (row) => 'ICCID ' + row.iccid],
  ['Cliente vinculado', (row) => row.link?.client || null],
  ['ID equipamento', (row) => (row.link?.serial ? 'ID ' + row.link.serial : null)],
  ['Consumo MB', (row) => (consumptionEligible(row) ? row.ticks : null)],
  ['MB por dia', (row) => (consumptionEligible(row) ? row.ticks / row.days : null)],
  ['Vezes a média', (row) => row.ratio],
  ['Plano / produto', (row) => row.plan],
  ['Vínculo', (row) => row.linkState],
];
/** Ordena e pagina os registros de consumo antes de apresentar a conferência de cada linha. */
export function LineRecordsTable({ records, onView, onExport, followup }) {
  const latest = latestConsumptionNotes(followup?.notes || []);
  const columns = followup
    ? [
        ...recordColumns.slice(0, 3),
        ['Cliente vinculado', (row) => row.link?.client || null],
        ['Placa', (row) => row.link?.plate || null],
        ['Apuração', (row) => row.start],
        ['Consumo MB', (row) => (consumptionEligible(row) ? row.ticks : null)],
        ['MB por dia', (row) => (consumptionEligible(row) ? row.ticks / row.days : null)],
        ['Última ação', (row) => latest.get(chipKey(row))?.date || null],
        ['Acompanhamento', (row) => latest.get(chipKey(row))?.status || 'Sem acompanhamento'],
      ]
    : recordColumns;
  const [checked, setChecked] = useState([]);
  // Somente linhas do recorte atual podem ser exportadas; seleção preservada entre páginas.
  const selected = records.filter((row) => checked.includes(row.id));
  useEffect(() => {
    const ids = new Set(records.map((row) => row.id));
    setChecked((previous) => {
      const next = previous.filter((id) => ids.has(id));
      return next.length === previous.length ? previous : next;
    });
  }, [records]);
  const [sort, setSort] = useState(null),
    [page, setPage] = useState(0),
    size = followup ? 10 : 100;
  const recordSignature = records.map((row) => row.id).join('\u001f');
  useEffect(() => setPage(0), [recordSignature]);
  const ordered = sort
    ? records
        .map((row, index) => ({ row, index }))
        .sort(
          (a, b) =>
            compareValues(
              columns[sort.index][1](a.row),
              columns[sort.index][1](b.row),
              sort.direction,
            ) || a.index - b.index,
        )
        .map((item) => item.row)
    : followup
      ? [...records].sort((a, b) => b.ticks - a.ticks)
      : records;
  const offset = Math.min(page * size, Math.max(0, Math.floor((ordered.length - 1) / size) * size)),
    shown = ordered.slice(offset, offset + size);
  return (
    <div className={`line-records${followup ? ' consumption-followup-queue' : ''}`}>
      <div className="line-actions table-selection-actions" data-no-print>
        <button onClick={() => setChecked(records.map((row) => row.id))} disabled={!records.length}>
          Selecionar todas as linhas filtradas
        </button>
        <button onClick={() => setChecked([])} disabled={!selected.length}>
          Limpar seleção
        </button>
        <span className="scope selection-count">{selected.length} linhas selecionadas</span>
        <PermissionButton
          action="export"
          disabled={!selected.length}
          onClick={() => onExport(selected)}
        >
          Exportar seleção CSV
        </PermissionButton>
      </div>
      <p className="scope">
        {ordered.length ? `${offset + 1} a ${offset + shown.length}` : '0'} de {ordered.length}{' '}
        registros. A ordenação considera o recorte completo; o CSV inclui todos os registros
        filtrados.
      </p>
      <TableScroll label="Registros de consumo">
        <table>
          <thead>
            <tr>
              <th data-no-print>Selecionar</th>
              {columns.map(([label], index) => (
                <th
                  key={label}
                  data-cell-type={
                    ['Consumo MB', 'MB por dia', 'Vezes a média'].includes(label)
                      ? 'number'
                      : undefined
                  }
                  aria-sort={
                    sort?.index === index
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <button
                    className="sort-heading"
                    onClick={() => {
                      setPage(0);
                      setSort((previous) =>
                        previous?.index === index
                          ? previous.direction === 'asc'
                            ? { index, direction: 'desc' }
                            : null
                          : { index, direction: 'asc' },
                      );
                    }}
                  >
                    {label} {sort?.index === index ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
              ))}
              <th data-no-print>Conferir</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td data-no-print>
                  <input
                    type="checkbox"
                    aria-label={`Selecionar linha ${row.operator} ${row.number} ${row.iccid}`}
                    checked={checked.includes(row.id)}
                    onChange={(event) =>
                      setChecked((previous) =>
                        event.target.checked
                          ? [...previous, row.id]
                          : previous.filter((id) => id !== row.id),
                      )
                    }
                  />
                </td>
                <td>{row.operator}</td>
                <td className="cell-identifier">{row.number}</td>
                <td className="cell-identifier">{row.iccid}</td>
                {followup ? (
                  <>
                    <td>
                      <span
                        className="table-cell-text"
                        title={row.link?.client || 'Linha não identificada'}
                      >
                        {row.link?.client || 'Linha não identificada'}
                      </span>
                    </td>
                    <td>{row.link?.plate || 'Não informada'}</td>
                    <td>{row.period}</td>
                    <td data-cell-type="number">
                      {mb(consumptionEligible(row) ? row.ticks : null)}
                      {!consumptionEligible(row) && (
                        <small className="line-attention">Fora dos totais</small>
                      )}
                      {row.attention && (
                        <small className="line-attention">Investigar consumo</small>
                      )}
                    </td>
                    <td data-cell-type="number">
                      {mb(consumptionEligible(row) ? row.ticks / row.days : null)}
                    </td>
                    <td>{latest.get(chipKey(row))?.date?.split('-').reverse().join('/') || '—'}</td>
                    <td>
                      <span className="info-print">
                        {latest.get(chipKey(row))?.status || 'Sem acompanhamento'}
                      </span>
                      <button
                        type="button"
                        className="consumption-followup-button"
                        aria-label={`Acompanhar ${row.operator} ${row.iccid}`}
                        aria-expanded={followup.tracked === chipKey(row)}
                        onClick={() => followup.onSelect(row)}
                      >
                        {latest.get(chipKey(row))?.status || 'Sem acompanhamento'}
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <span className="table-cell-text" title={row.link?.client || 'Não vinculado'}>
                        {row.link?.client || 'Não vinculado'}
                      </span>
                    </td>
                    <td className="cell-identifier">{row.link?.serial || 'Não informado'}</td>
                    <td data-cell-type="number">
                      {mb(consumptionEligible(row) ? row.ticks : null)}
                    </td>
                    <td data-cell-type="number">
                      {mb(consumptionEligible(row) ? row.ticks / row.days : null)}
                    </td>
                    <td data-cell-type="number">
                      {row.ratio == null
                        ? '—'
                        : row.ratio.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '×'}
                      {row.attention && (
                        <small className="line-attention">Investigar consumo</small>
                      )}
                    </td>
                    <td>
                      <span className="table-cell-text" title={row.plan}>
                        {row.plan}
                      </span>
                    </td>
                    <td>
                      <span className="table-cell-text" title={row.linkState}>
                        {row.linkState}
                      </span>
                    </td>
                  </>
                )}
                <td data-no-print>
                  <button onClick={() => onView(row)}>
                    {followup ? 'Conferir origem' : 'Conferir e acompanhar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <div
        className="line-actions table-pagination"
        role="navigation"
        aria-label="Paginação dos registros de consumo"
        data-no-print
      >
        <button disabled={offset === 0} onClick={() => setPage(Math.max(0, page - 1))}>
          Anterior
        </button>
        <span className="scope">
          Página {ordered.length ? Math.floor(offset / size) + 1 : 0} de{' '}
          {Math.ceil(ordered.length / size)}
        </span>
        <button disabled={offset + size >= ordered.length} onClick={() => setPage(page + 1)}>
          Próxima
        </button>
        <button
          type="button"
          disabled={offset + size >= ordered.length}
          onClick={() => setPage(Math.max(0, Math.ceil(ordered.length / size) - 1))}
        >
          Último
        </button>
      </div>
    </div>
  );
}
