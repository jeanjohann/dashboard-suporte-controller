/** Visão da equipe: usa o mesmo arquivo/filtros de OS, com execução e agendamento independentes. */
import React, { useEffect, useMemo, useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { download } from '../../../shared/export/exports.js';
import { todaySaoPaulo } from '../domain/lifecycle.js';
import { supportPerformance } from '../domain/supportPerformance.js';
import {
  supportReport,
  supportComparisonReport,
  supportCsv,
  supportWorkbook,
} from '../domain/supportReport.js';
import { RecordDetails } from './RecordDetails.jsx';
import { SupportComparison } from './SupportComparison.jsx';
import { SupportMetricCards } from './SupportMetricCards.jsx';
import { SupportPeople } from './SupportPeople.jsx';
import { SupportControls } from './SupportControls.jsx';
import { SupportContext } from './SupportContext.jsx';

const percent = (value) =>
  value == null ? '—' : `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const help =
  'Mede volume atribuído ao responsável do suporte, não ao técnico prestador. Somente linhas Concluída/Pago. Execução usa Resp. Execução e Data de atendimento; agendamento usa Resp. Agendamento e Agendamento, somente dos serviços já realizados. Visitas improdutivas são separadas dos atendimentos efetivos. Cada linha é um atendimento; chamados e clientes distintos não podem ser somados entre pessoas. A participação usa todos os efetivos do recorte, inclusive sem responsável. Nomes vazios ou com erro ficam fora do ranking e são informados para revisão, sem unir nomes parecidos. Comparação usa intervalo anterior de igual duração, preservando os demais filtros; base anterior zero não gera percentual. Volume não mede qualidade, SLA ou produtividade por hora. Atalhos de período alteram somente os filtros da categoria Equipe de suporte.';

/** Componente próprio conserva a ajuda na extremidade do título, sem duplicar o alinhamento da Section. */
function EvolutionHeading({ dateField }) {
  return (
    <div className="inline-help-heading">
      <h3>Evolução de atendimentos efetivos</h3>
      <InfoNote>
        Usa {dateField}, com agrupamento diário em intervalos de até 62 dias e mensal nos demais.
        Visitas improdutivas ficam separadas na tabela; não há preenchimento artificial de dias sem
        registro. Datas inválidas ou ausentes ficam fora do gráfico.
      </InfoNote>
    </div>
  );
}

export function SupportPerformance({ original, filters, setFilters, filename, visible }) {
  const today = todaySaoPaulo();
  const [role, setRole] = useState('execution'),
    [detail, setDetail] = useState(null);
  const [metric, setMetric] = useState('productive');
  const both = role === 'both';
  const result = useMemo(
    () => supportPerformance(original, filters, both ? 'execution' : role),
    [original, filters, role],
  );
  const scheduling = useMemo(
    () => (both ? supportPerformance(original, filters, 'scheduling') : null),
    [original, filters, both],
  );
  useEffect(() => setDetail(null), [original, filters, role]);
  const exportFile = (format) => {
    const tables = both
      ? supportComparisonReport(original, result, scheduling, filters, filename)
      : supportReport(original, result, filters, filename);
    return download(
      format === 'csv' ? supportCsv(tables) : supportWorkbook(tables),
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `equipe-suporte-${both ? 'ambos' : role}.${format}`,
    );
  };
  return (
    <>
      <Section
        title="Equipe de suporte"
        visible={visible}
        help={help}
        summary={
          !result.unavailable &&
          (!both || !scheduling.unavailable) && (
            <ReportSummary
              metrics={
                both
                  ? [
                      ['Agendamentos efetivos', scheduling.totals.productive],
                      ['Execuções efetivas', result.totals.productive],
                      ['Agendamentos · improdutivas', scheduling.totals.unproductive],
                      ['Execuções · improdutivas', result.totals.unproductive],
                    ]
                  : [
                      ['Atendimentos efetivos', result.totals.productive],
                      ['Visitas improdutivas', result.totals.unproductive],
                      ['Chamados distintos', result.totals.calls],
                      ['Clientes identificados', result.totals.clients],
                    ]
              }
              note={
                both
                  ? 'Ambos · cada papel mantém sua data e base. Não somar como atendimentos únicos.'
                  : `${result.role.label} · ${result.role.date}. Somente Concluída/Pago; não mede qualidade.`
              }
            />
          )
        }
      >
        <div className="support-workspace">
          <SupportControls {...{ role, setRole, filters, setFilters, today }} />
          {both ? (
            <SupportComparison
              original={original}
              execution={result}
              scheduling={scheduling}
              metric={metric}
              setMetric={setMetric}
              filename={filename}
              filters={filters}
              onExport={exportFile}
            />
          ) : result.unavailable ? (
            <p role="status">Indisponível: faltam as colunas {result.unavailable.join(', ')}.</p>
          ) : (
            <>
              <SupportMetricCards results={[result]} collapsible />
              <SupportContext results={[result]} />
              {!result.rows.length && <p>Nenhum serviço realizado corresponde ao recorte.</p>}
              <SupportPeople
                original={original}
                results={{ [role]: result }}
                filters={filters}
                filename={filename}
              />
              <details className="support-team-details">
                <summary>Ranking, evolução e conferência da equipe</summary>
                <label>
                  Volume no ranking{' '}
                  <select value={metric} onChange={(event) => setMetric(event.target.value)}>
                    <option value="productive">Atendimentos efetivos</option>
                    <option value="unproductive">Visitas improdutivas</option>
                    <option value="visits">Todas as visitas e atendimentos</option>
                  </select>
                </label>
                <Chart
                  ranking
                  title={`Volume por responsável · ${result.role.label}`}
                  exportNote={`${filename}; ${result.role.date}; ${filters.start || 'início'} até ${filters.end || 'fim do histórico'}; filtros ${JSON.stringify(filters)}; medida ${metric}; somente Concluída/Pago, improdutivas separadas.`}
                  items={result.groups.map((item) => ({ label: item.label, value: item[metric] }))}
                />
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        {[
                          'Responsável',
                          'Efetivos',
                          'Improdutivas',
                          'Total realizado',
                          'Chamados',
                          'Clientes',
                          '% dos efetivos',
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
                      {result.groups.map((item) => (
                        <tr key={item.label}>
                          <td>{item.label}</td>
                          <td>{item.productive}</td>
                          <td>{item.unproductive}</td>
                          <td>{item.visits}</td>
                          <td>{item.calls}</td>
                          <td>{item.clients}</td>
                          <td data-sort={item.share}>{percent(item.share)}</td>
                          <td>{item.previous ?? '—'}</td>
                          <td
                            data-sort={
                              item.previous
                                ? (item.productive - item.previous) / item.previous
                                : null
                            }
                          >
                            {item.previous
                              ? percent((item.productive - item.previous) / item.previous)
                              : item.previous === 0
                                ? 'Sem base anterior'
                                : '—'}
                          </td>
                          <td>{item.vehicles ?? '—'}</td>
                          <td data-sort={item.unproductiveRate}>
                            {percent(item.unproductiveRate)}
                          </td>
                          <td data-sort={item.servicesPerCall}>
                            {item.servicesPerCall == null
                              ? '—'
                              : item.servicesPerCall.toLocaleString('pt-BR', {
                                  maximumFractionDigits: 2,
                                })}
                          </td>
                          <td>
                            <button
                              onClick={() => setDetail({ label: item.label, rows: item.rows })}
                            >
                              Conferir {item.rows.length} linhas
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
                {result.missing.length > 0 && (
                  <button
                    onClick={() =>
                      setDetail({ label: 'Sem responsável válido', rows: result.missing })
                    }
                  >
                    Conferir {result.missing.length} sem responsável
                  </button>
                )}
                {detail && (
                  <div>
                    <button data-no-print onClick={() => setDetail(null)}>
                      Fechar detalhamento
                    </button>
                    <RecordDetails
                      data={original}
                      rows={detail.rows.filter((row) =>
                        result.rows.some((record) => record.sourceRow === row),
                      )}
                      title={detail.label}
                    />
                  </div>
                )}
                <EvolutionHeading dateField={result.role.date} />
                <Chart
                  type="line"
                  title={`Evolução · ${result.role.label}`}
                  items={result.periods.map((item) => ({
                    label: item.label,
                    value: item.productive,
                  }))}
                />
                <details className="report-details">
                  <summary>Detalhar evolução e perfil dos serviços</summary>
                  <div className="table-scroll">
                    <SortableTable>
                      <thead>
                        <tr>
                          <th>Período</th>
                          <th>Efetivos</th>
                          <th>Improdutivas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.periods.map((item) => (
                          <tr key={item.label}>
                            <td>{item.label}</td>
                            <td>{item.productive}</td>
                            <td>{item.unproductive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </SortableTable>
                  </div>
                  <div className="table-scroll">
                    <SortableTable>
                      <thead>
                        <tr>
                          <th>Responsável</th>
                          <th>Tipo de serviço / visita</th>
                          <th>Quantidade</th>
                          <th>Origem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.profiles.map((item) => (
                          <tr key={JSON.stringify([item.owner, item.type])}>
                            <td>{item.owner}</td>
                            <td>{item.type}</td>
                            <td>{item.value}</td>
                            <td>
                              <button
                                onClick={() =>
                                  setDetail({
                                    label: `${item.owner} · ${item.type}`,
                                    rows: item.rows,
                                  })
                                }
                              >
                                Conferir {item.value} linhas
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </SortableTable>
                  </div>
                </details>
              </details>
              <div className="support-period-shortcuts">
                <PermissionButton action="export" onClick={() => exportFile('xlsx')}>
                  Exportar equipe XLSX
                </PermissionButton>
                <PermissionButton action="export" onClick={() => exportFile('csv')}>
                  Exportar equipe CSV
                </PermissionButton>
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
