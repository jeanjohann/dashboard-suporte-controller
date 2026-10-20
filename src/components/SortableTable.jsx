/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React, { Children, cloneElement, useState } from 'react';
import { compareValues } from '../shared/data/sorting.js';
export { compareValues } from '../shared/data/sorting.js';

/** Extrai texto das células React para a comparação usada na ordenação da tabela. */
export function plainText(value) {
  if (value == null || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(plainText).join(' ');
  return plainText(value.props?.children);
}
/** Ordena linhas pelos cabeçalhos selecionados mantendo os filhos React e as referências de origem. */
export function SortableTable({ children, sort: controlledSort, onSortChange, ...props }) {
  const [localSort, setLocalSort] = useState(null);
  // Em tabelas paginadas, o chamador ordena o recorte completo antes de fornecer a página.
  const controlled = typeof onSortChange === 'function';
  const sort = controlled ? controlledSort : localSort;
  const setSort = controlled ? onSortChange : setLocalSort;
  return (
    <table {...props}>
      {Children.map(children, (part) => {
        if (part?.type === 'thead')
          return cloneElement(
            part,
            {},
            Children.map(part.props.children, (row) =>
              cloneElement(
                row,
                {},
                Children.map(row.props.children, (cell, index) =>
                  cloneElement(
                    cell,
                    {
                      'aria-sort':
                        sort?.index === index
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none',
                    },
                    <button
                      className="sort-heading"
                      onClick={() =>
                        setSort((previous) =>
                          previous?.index === index
                            ? previous.direction === 'asc'
                              ? { index, direction: 'desc' }
                              : null
                            : { index, direction: 'asc' },
                        )
                      }
                    >
                      {cell.props.children}{' '}
                      {sort?.index === index ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>,
                  ),
                ),
              ),
            ),
          );
        if (part?.type === 'tbody') {
          const rows = Children.toArray(part.props.children);
          const value = (row) => {
            const cell = Children.toArray(row.props.children)[sort?.index];
            return cell?.props?.['data-sort'] ?? plainText(cell);
          };
          const ordered =
            sort && !controlled
              ? rows
                  .map((row, index) => ({ row, index }))
                  .sort(
                    (a, b) =>
                      compareValues(value(a.row), value(b.row), sort.direction) ||
                      a.index - b.index,
                  )
                  .map((item) => item.row)
              : rows;
          return cloneElement(
            part,
            {},
            ordered.map((row) =>
              row.type === 'tr'
                ? cloneElement(
                    row,
                    {},
                    Children.map(row.props.children, (cell) =>
                      cell?.type === 'td'
                        ? cloneElement(cell, {
                            'data-cell-type':
                              cell.props['data-cell-type'] ||
                              (typeof cell.props.children === 'number' ||
                              typeof cell.props['data-sort'] === 'number'
                                ? 'number'
                                : undefined),
                          })
                        : cell,
                    ),
                  )
                : row,
            ),
          );
        }
        return part;
      })}
    </table>
  );
}
