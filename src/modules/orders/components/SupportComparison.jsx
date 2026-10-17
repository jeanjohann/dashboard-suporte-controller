/** Apresentação conjunta do suporte; cada papel conserva métricas, comparação e origem independentes. */
import React, { useEffect, useState } from 'react';
import { supportComparison, supportSeries } from '../domain/supportComparison.js';
import { SupportComparisonBars, SupportComparisonEvolution } from './SupportComparisonCharts.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { SupportMetricCards } from './SupportMetricCards.jsx';
import { SupportPeople } from './SupportPeople.jsx';

const percent = (value) =>
  value == null ? '—' : `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
export function SupportComparison({
  original,
  execution,
  scheduling,
  metric,
  setMetric,
  filename,
  filters,
  onExport,
}) {
  const [detail, setDetail] = useState(null);
  useEffect(() => setDetail(null), [execution, scheduling]);
  const comparison = supportComparison(execution, scheduling, metric),
    results = { execution, scheduling };
  if (comparison.unavailable)
    return (
      <p role="status">
        Para comparar ambos, faltam as colunas {comparison.unavailable.join(', ')}. Selecione uma
        responsabilidade disponível.
      </p>
    );
  const showDetail = (roleKey, label, rows) =>
    setDetail({ roleKey, label: `${results[roleKey].role.label} · ${label}`, rows });
  const note = `${filename}; Ambos; Agendamento usa Agendamento, Execução usa Data de atendimento; filtros ${JSON.stringify(filters)}; medida ${metric}; somente Concluída/Pago; não somar papéis como atendimentos únicos.`;
  return (
    <>
      <SupportMetricCards results={[scheduling, execution]} />
      <p className="scope">
        São duas responsabilidades do mesmo serviço. Uma pessoa pode agendar e executar; os valores
        aparecem separados e não devem ser somados como total de atendimentos.
      </p>
      {supportSeries.map(({ key, label }) => (
        <div key={key}>
          <p className="scope">
            {label}: {results[key].rows.length} visitas e atendimentos ·{' '}
            {results[key].missing.length} sem responsável válido fora do ranking ·{' '}
            {results[key].missingDates} realizados sem data válida excluídos pelo período ·{' '}
            {results[key].undated} sem data fora da evolução.
          </p>
          {results[key].range ? (
            <p className="scope">
              {label} · comparação de efetivos: {results[key].range.start} até{' '}
              {results[key].range.end}: {results[key].past.totals.productive} →{' '}
              {results[key].totals.productive} no período selecionado.{' '}
              {results[key].past.missingDates} realizados sem data excluídos também da comparação.
            </p>
          ) : null}
        </div>
      ))}
      {!execution.range && (
        <p className="scope">
          Selecione início e fim para comparar cada papel com o período anterior equivalente.
        </p>
      )}
      <SupportPeople original={original} results={results} filters={filters} filename={filename} />
      <details className="support-team-details">
        <summary>Ranking, evolução e conferência da equipe</summary>
        <label>
          Volume no ranking{' '}
          <select
            aria-label="Volume no ranking"
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
          >
            <option value="productive">Atendimentos efetivos</option>
            <option value="unproductive">Visitas improdutivas</option>
            <option value="visits">Todas as visitas e atendimentos</option>
          </select>
        </label>
        <SupportComparisonBars items={comparison.groups} note={note} />
        <div className="table-scroll">
          <SortableTable>
            <thead>
              <tr>
                {[
                  'Responsável',
                  'Responsabilidade',
                  'Efetivos',
                  'Improdutivas',
                  'Total realizado',
                  'Chamados',
                  'Clientes',
                  '% dos efetivos do papel',
                  'Efetivos anteriores',
                  'Variação dos efetivos',
                  'Veículos identificados',
                  '% de improdutivas',
                  'Registros por chamado',
                  'Origem',
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.entries.map((item) => (
                <tr key={JSON.stringify([item.label, item.roleKey])}>
                  <td>{item.label}</td>
                  <td>{item.role.label}</td>
                  <td>{item.productive}</td>
                  <td>{item.unproductive}</td>
                  <td>{item.visits}</td>
                  <td>{item.calls}</td>
                  <td>{item.clients}</td>
                  <td data-sort={item.share}>{percent(item.share)}</td>
                  <td>{item.previous ?? '—'}</td>
                  <td
                    data-sort={
                      item.previous ? (item.productive - item.previous) / item.previous : null
                    }
                  >
                    {item.previous
                      ? percent((item.productive - item.previous) / item.previous)
                      : item.previous === 0
                        ? 'Sem base anterior'
                        : '—'}
                  </td>
                  <td>{item.vehicles ?? '—'}</td>
                  <td data-sort={item.unproductiveRate}>{percent(item.unproductiveRate)}</td>
                  <td data-sort={item.servicesPerCall}>
                    {item.servicesPerCall == null
                      ? '—'
                      : item.servicesPerCall.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <button onClick={() => showDetail(item.roleKey, item.label, item.rows)}>
                      Conferir {item.rows.length} linhas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
        {supportSeries.map(
          ({ key, role }) =>
            results[key].missing.length > 0 && (
              <button
                key={key}
                onClick={() => showDetail(key, 'Sem responsável válido', results[key].missing)}
              >
                Conferir {results[key].missing.length} sem responsável · {role}
              </button>
            ),
        )}
        {detail && (
          <div>
            <button data-no-print onClick={() => setDetail(null)}>
              Fechar detalhamento
            </button>
            <RecordDetails data={original} rows={detail.rows} title={detail.label} />
          </div>
        )}
        <SupportComparisonEvolution items={comparison.periods} />
        <details className="report-details">
          <summary>Detalhar evolução e perfil dos serviços</summary>
          <div className="table-scroll">
            <SortableTable>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Agendamentos efetivos</th>
                  <th>Execuções efetivas</th>
                </tr>
              </thead>
              <tbody>
                {comparison.periods.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.scheduling ?? '—'}</td>
                    <td>{item.execution ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </div>
          <div className="table-scroll">
            <SortableTable>
              <thead>
                <tr>
                  {[
                    'Responsável',
                    'Responsabilidade',
                    'Tipo de serviço / visita',
                    'Quantidade',
                    'Origem',
                  ].map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supportSeries.flatMap(({ key, role }) =>
                  results[key].profiles.map((item) => (
                    <tr key={JSON.stringify([key, item.owner, item.type])}>
                      <td>{item.owner}</td>
                      <td>{role}</td>
                      <td>{item.type}</td>
                      <td>{item.value}</td>
                      <td>
                        <button
                          onClick={() => showDetail(key, `${item.owner} · ${item.type}`, item.rows)}
                        >
                          Conferir {item.value} linhas
                        </button>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </SortableTable>
          </div>
        </details>
      </details>
      <div className="support-period-shortcuts">
        <PermissionButton action="export" onClick={() => onExport('xlsx')}>
          Exportar equipe XLSX
        </PermissionButton>
        <PermissionButton action="export" onClick={() => onExport('csv')}>
          Exportar equipe CSV
        </PermissionButton>
      </div>
    </>
  );
}
