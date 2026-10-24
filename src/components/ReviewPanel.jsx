import React, { useMemo, useState } from 'react';
import { reviewDiagnostics } from '../shared/data/reviewDiagnostics.js';
import { PermissionButton } from '../shared/security/Access.jsx';
import { csv, download } from '../shared/export/exports.js';
import { TableScroll } from './TableScroll.jsx';

/** Mesmo padrão de diagnóstico para OS e Operacional, com origem e orientação. */
export function ReviewPanel({ issues, data, filename = '', category = '', onCategoryChange }) {
  const diagnostics = useMemo(() => reviewDiagnostics(issues, { data }), [issues, data]);
  const [localCategory, setCategory] = useState(''),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState(null);
  const [severity, setSeverity] = useState('');
  const activeCategory = onCategoryChange ? category : localCategory;
  const filtered = diagnostics.filter(
    (item) =>
      (!activeCategory || item.category === activeCategory) &&
      (!severity || item.severity === severity) &&
      [item.address, item.column, item.value, item.reason, item.row, item.rule, item.severity]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(search.toLocaleLowerCase('pt-BR')),
  );
  const last = Math.max(0, Math.ceil(filtered.length / 15) - 1),
    current = Math.min(page, last);
  const detail = filtered.find((item) => item.key === selected);
  const row = detail && data.rows.find((item) => item.sourceRow === detail.row);
  function exportReview() {
    download(
      csv([
        ['Arquivo', filename],
        ['Aba', data.sheetName || 'Não informada'],
        ['Escopo', 'Apontamentos no recorte da página; sem correção automática'],
        [
          'Categoria',
          'Linha Excel',
          'Célula',
          'Campo',
          'Original',
          'Diagnóstico',
          'Impacto',
          'Como conferir',
          'Regra',
          'Impacto/classificação',
          'Indicadores afetados',
          'Aplicabilidade',
          'Critério de resolução',
        ],
        ...filtered.map((item) => [
          item.category,
          item.row,
          item.address,
          item.column,
          item.value,
          item.reason,
          item.impact,
          item.action,
          item.rule,
          item.severity,
          item.indicators.join(' · '),
          item.applicability,
          item.resolution,
        ]),
      ]),
      'text/csv;charset=utf-8',
      'diagnostico-revisao.csv',
    );
  }
  return (
    <div className="review-diagnostics">
      <div className="cards">
        {[
          [diagnostics.length, 'Apontamentos no recorte'],
          [new Set(diagnostics.map((item) => item.row).filter(Boolean)).size, 'Linhas apontadas'],
          [diagnostics.filter((item) => item.category === 'Formato').length, 'Pontos de formato'],
          [
            diagnostics.filter((item) => item.category === 'Possível divergência').length,
            'Possíveis divergências',
          ],
        ].map(([value, label]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="toolbar">
        <label>
          Categoria
          <select
            value={activeCategory}
            onChange={(event) => {
              (onCategoryChange || setCategory)(event.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas</option>
            {[
              ...new Set([
                ...diagnostics.map((item) => item.category),
                ...(activeCategory ? [activeCategory] : []),
              ]),
            ]
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </select>
        </label>
        <label>
          Buscar diagnóstico
          <input
            value={search}
            placeholder="Célula, campo, motivo ou linha"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </label>
        <PermissionButton action="export" onClick={exportReview}>
          Exportar diagnóstico CSV
        </PermissionButton>
        <label>
          Impacto
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos</option>
            {[...new Set(diagnostics.map((item) => item.severity))].sort().map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="scope">
        {filtered.length} de {diagnostics.length} apontamentos no recorte da página. Os valores
        originais foram preservados. Repetições são candidatos à conferência. Nenhuma alteração é
        feita na planilha.
      </p>
      {detail && (
        <section className="panel" aria-label="Detalhes do diagnóstico">
          <div className="toolbar">
            <strong>
              {detail.category} · {detail.address || 'Origem não informada'}
            </strong>
            <button onClick={() => setSelected(null)}>Fechar diagnóstico</button>
          </div>
          <p>
            <strong>Fonte:</strong> {filename || 'Arquivo carregado'} ·{' '}
            {data.sheetName || 'Aba não informada'} ·{' '}
            {detail.row ? `linha ${detail.row}` : 'linha não informada'}
          </p>
          <p>
            <strong>O que foi identificado:</strong> {detail.reason}
          </p>
          <p>
            <strong>Impacto na leitura:</strong> {detail.impact}
          </p>
          <p>
            <strong>Como conferir:</strong> {detail.action}
          </p>
          <p>
            <strong>Regra:</strong> {detail.rule} · {detail.severity}
          </p>
          <p>
            <strong>Indicadores afetados:</strong> {detail.indicators.join(' · ')}
          </p>
          <p>
            <strong>Aplicabilidade:</strong> {detail.applicability}
          </p>
          <p>
            <strong>Para resolver:</strong> {detail.resolution}
          </p>
          {row && (
            <details>
              <summary>Registro original completo</summary>
              <TableScroll label="Origem do diagnóstico">
                <table>
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Original</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.columns.map((column, index) => (
                      <tr key={index}>
                        <th>
                          {column.letter} · {column.label}
                        </th>
                        <td>{String(row.cells[index]?.display ?? row.cells[index]?.raw ?? '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            </details>
          )}
        </section>
      )}
      <TableScroll label="Diagnóstico de revisão">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Origem</th>
              <th>Campo / original</th>
              <th>Diagnóstico</th>
              <th>Conferência</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(current * 15, (current + 1) * 15).map((item) => (
              <tr key={item.key}>
                <td>
                  {item.category}
                  <small className="scope">
                    {' '}
                    · {item.rule}
                    <br />
                    {item.severity}
                  </small>
                </td>
                <td>{item.address || (item.row ? `Linha ${item.row}` : 'Origem não informada')}</td>
                <td>
                  {item.column}
                  <br />
                  {String(item.value ?? '') || 'Em branco'}
                </td>
                <td>{item.reason}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => setSelected(item.key)}
                    aria-expanded={detail?.key === item.key}
                  >
                    Ver diagnóstico
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      {!filtered.length && (
        <p>Nenhum apontamento neste recorte. Isso não confirma a correção completa da base.</p>
      )}
      {filtered.length > 15 && (
        <footer>
          <button disabled={!current} onClick={() => setPage(current - 1)}>
            Anterior
          </button>
          <span>
            {current + 1} / {last + 1}
          </span>
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
