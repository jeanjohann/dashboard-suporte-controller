/** Histórico por par serial + placa já validado, junto à origem; busca e paginação afetam só a grade. */
import React, { useEffect, useMemo, useState } from 'react';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { RecordDetails } from '../../orders/components/RecordDetails.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { parkHistory, parkHistoryReference, sortParkHistoryRows } from '../domain/parkHistory.js';

const pct = (value) =>
  value == null ? '—' : (value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
export const parkHistoryTitle = 'Histórico individual do parque';
const rules =
  'Somente pares serial + placa já vinculáveis, no recorte de Parque e Manutenção. Intervenção efetiva é qualquer linha Concluída/Pago sem Visita Improdutiva; várias linhas no mesmo chamado são serviços distintos. Última intervenção usa a maior Data de atendimento válida desses efetivos no recorte. Dias = referência − última data, sem inferir atraso, falha, atividade atual ou necessidade de manutenção. Ausência de histórico não comprova ausência de intervenção. Cliente/modelo são da fotografia operacional atual. Concentração usa assistências técnicas efetivas vinculadas, com grupos não identificados incluídos; não mede taxa de falha.';

export function ParkHistoryPanel({ result, orders, context }) {
  const defaultReference = parkHistoryReference(orders);
  const [chosenReference, setChosenReference] = useState(null);
  const reference = chosenReference ?? defaultReference;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [dimension, setDimension] = useState('clients');
  const history = useMemo(
    () => parkHistory(result, orders, reference),
    [result, orders, reference],
  );
  useEffect(() => {
    setChosenReference(null);
    setDetailId(null);
    setPage(0);
  }, [orders]);
  useEffect(() => {
    setDetailId(null);
    setPage(0);
  }, [result]);
  const query = search.trim().toLocaleLowerCase('pt-BR');
  const rows = sortParkHistoryRows(
    history.devices.filter(
      (row) =>
        !query ||
        [row.client, row.model, row.serial, row.plate, row.state].some((value) =>
          String(value || '')
            .toLocaleLowerCase('pt-BR')
            .includes(query),
        ),
    ),
    sort,
  );
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const currentPage = Math.min(page, pages - 1);
  const detail = history.devices.find((row) => row.sourceRow === detailId);
  const metrics = [
    ['Base vinculável', result.base],
    ['Com última data e referência utilizáveis', history.dated],
    ['Sem intervenção efetiva no recorte', history.withoutEffective],
    ['Cinco maiores clientes · assistências', pct(history.clients.topFive)],
  ];
  const exportRows = () =>
    download(
      csv([
        ['Arquivo operacional', context.operationalFilename],
        ['Arquivo OS', context.ordersFilename],
        ['Filtros', JSON.stringify(context.filters)],
        ['Referência', reference || 'indisponível'],
        ['Busca da grade', search],
        ['Critérios', rules],
        [],
        [
          'Cliente operacional',
          'Modelo operacional',
          'Serial',
          'Placa',
          'Efetivos',
          'Improdutivas',
          'Última intervenção no recorte',
          'Dias observados',
          'Situação da data',
          'Efetivos sem data',
          'Linha operacional',
          'Linhas OS',
        ],
        ...rows.map((row) => [
          row.client,
          row.model,
          row.serial,
          row.plate,
          row.effective,
          row.unproductive,
          row.last,
          row.days,
          row.state,
          row.undated,
          row.sourceRow,
          row.serviceRows.join(', '),
        ]),
      ]),
      'text/csv;charset=utf-8',
      'historico-parque.csv',
    );
  return (
    <PrintContext.Provider
      value={{
        filename: `${context.operationalFilename} | OS: ${context.ordersFilename}`,
        filters: { ...context.filters, buscaGrade: search, concentracao: dimension },
        referenceDate: reference || 'indisponível',
      }}
    >
      <Section
        title={parkHistoryTitle}
        help={rules}
        summary={
          <ReportSummary
            metrics={metrics}
            note={`Referência ${reference || 'indisponível'} · última intervenção efetiva no recorte. Base com histórico limitado, sem inferir manutenção vencida.`}
          />
        }
      >
        <div className="park-history-controls">
          <label>
            Referência para os dias observados
            <input
              type="date"
              value={reference}
              onChange={(event) => setChosenReference(event.target.value)}
            />
          </label>
          <button type="button" onClick={() => setChosenReference(null)}>
            Usar limite do arquivo
          </button>
        </div>
        <p className="scope">
          Referência inicial: maior data válida de todos os atendimentos realizados no arquivo OS.
          Período de serviços: {context.start || 'sem limite'} até {context.end || 'sem limite'}.
          Última intervenção é a última no recorte, não necessariamente em todo o histórico.
        </p>
        {!history.referenceValid && (
          <p className="notice" role="status">
            Defina uma referência válida para calcular dias; as contagens e as datas encontradas
            continuam disponíveis.
          </p>
        )}
        <ReportSummary
          metrics={metrics}
          note={`${history.withoutDate} registros com efetivos sem nenhuma data válida; ${history.future} com última intervenção posterior à referência, sem duração negativa.`}
        />
        <div className="dashboard-chart-grid park-history-charts">
          <article className="panel dashboard-widget">
            <label>
              Concentração das assistências
              <select value={dimension} onChange={(event) => setDimension(event.target.value)}>
                <option value="clients">Por cliente operacional</option>
                <option value="models">Por modelo operacional</option>
              </select>
            </label>
            <p className="scope">
              Cinco maiores: {pct(history[dimension].topFive)} de {result.assistance} assistências
              efetivas vinculadas. Tamanho da base fica na tabela; concentração não mede falha.
            </p>
            <Chart
              compact
              ranking
              title="Concentração das assistências"
              items={history[dimension].items.filter((item) => item.value > 0)}
              exportNote={`${rules} Referência ${reference}; filtros ${JSON.stringify(context.filters)}`}
            />
            <details className="park-history-groups">
              <summary>
                Conferir grupos e tamanho da base ({history[dimension].items.length})
              </summary>
              <div className="table-scroll park-history-group-table">
                <SortableTable>
                  <thead>
                    <tr>
                      <th>Grupo</th>
                      <th>Base vinculável</th>
                      <th>Assistências</th>
                      <th>Linhas OS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history[dimension].items.map((item) => (
                      <tr key={item.label}>
                        <td>{item.label}</td>
                        <td>{item.base}</td>
                        <td>{item.value}</td>
                        <td>{item.rows.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </details>
          </article>
          <article className="panel dashboard-widget">
            <h3>Tempo desde a última intervenção no recorte</h3>
            <Chart
              compact
              title="Dias observados desde a última intervenção"
              items={history.buckets}
              exportNote={`${rules} Referência ${reference}`}
            />
            <p className="scope">
              Faixas exclusivas somente dos {history.dated} registros com duração utilizável. Os
              demais ficam identificados na grade. Tempo sem OS não comprova falha ou atraso de
              manutenção.
            </p>
          </article>
        </div>
        <label className="park-history-search">
          Buscar no histórico do parque
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
              setDetailId(null);
            }}
            placeholder="Cliente, modelo, serial, placa ou situação da data"
          />
        </label>
        <p className="scope">
          {rows.length} de {history.devices.length} registros vinculáveis na grade. Esta busca não
          altera cards, concentração nem faixas. Exportação CSV inclui toda a grade filtrada;
          impressão mostra a página exibida e o detalhe aberto.
        </p>
        <PermissionButton action="export" onClick={exportRows}>
          Exportar histórico do parque CSV
        </PermissionButton>
        <div className="table-scroll">
          <SortableTable
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(0);
              setDetailId(null);
            }}
          >
            <thead>
              <tr>
                {[
                  'Cliente / modelo',
                  'Serial / placa',
                  'Efetivos',
                  'Improdutivas',
                  'Última intervenção',
                  'Dias',
                  'Situação da data',
                  'Origem',
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(currentPage * 10, currentPage * 10 + 10).map((row) => (
                <tr key={row.sourceRow}>
                  <td>
                    {row.client || 'Não informado'}
                    <small className="park-history-secondary">
                      {row.model || 'Modelo não informado'}
                    </small>
                  </td>
                  <td>
                    {row.serial}
                    <small className="park-history-secondary">{row.plate}</small>
                  </td>
                  <td>{row.effective}</td>
                  <td>{row.unproductive}</td>
                  <td>{row.last || '—'}</td>
                  <td data-sort={row.days}>{row.days ?? '—'}</td>
                  <td>
                    {row.state}
                    {row.undated ? ` · ${row.undated} efetivos sem data` : ''}
                  </td>
                  <td>
                    <button
                      type="button"
                      aria-expanded={detailId === row.sourceRow}
                      onClick={() => setDetailId(detailId === row.sourceRow ? null : row.sourceRow)}
                    >
                      Conferir linha {row.sourceRow}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
        {!rows.length && <p role="status">Nenhum registro vinculável corresponde à busca.</p>}
        <div className="park-history-controls" data-no-print>
          <button disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>
            Anterior
          </button>
          <span>
            Página {currentPage + 1} de {pages}
          </span>
          <button disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)}>
            Próxima
          </button>
          <button disabled={currentPage === pages - 1} onClick={() => setPage(pages - 1)}>
            Último
          </button>
        </div>
        {detail && (
          <div className="panel park-history-detail">
            <h3>
              {detail.serial} · {detail.plate}
            </h3>
            <p className="scope">
              {detail.client || 'Cliente não informado'} · linha operacional {detail.sourceRow}.
              Todas as linhas realizadas vinculadas no recorte, incluindo improdutivas, sem alterar
              o original.
            </p>
            <RecordDetails
              data={orders}
              rows={detail.serviceRows}
              title="Atendimentos do equipamento no recorte"
              compact
              onClose={() => setDetailId(null)}
            />
          </div>
        )}
      </Section>
    </PrintContext.Provider>
  );
}
