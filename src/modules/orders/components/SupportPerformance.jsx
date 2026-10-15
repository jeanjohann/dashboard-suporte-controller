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
import { supportPeriod, supportPerformance, supportRoles } from '../domain/supportPerformance.js';
import { supportReport, supportCsv, supportWorkbook } from '../domain/supportReport.js';
import { RecordDetails } from './RecordDetails.jsx';

const percent = (value) =>
  value == null ? '—' : `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const presets = [
  ['last7', 'Últimos 7 dias'],
  ['previousWeek', 'Semana anterior'],
  ['month', 'Mês'],
  ['year', 'Ano'],
  ['total', 'Todo o histórico'],
];
const help =
  'Mede volume atribuído ao responsável do suporte, não ao técnico prestador. Somente linhas Concluída/Pago. Execução usa Resp. Execução e Data de atendimento; agendamento usa Resp. Agendamento e Agendamento, somente dos serviços já realizados. Visitas improdutivas são separadas dos atendimentos efetivos. Cada linha é um atendimento; chamados e clientes distintos não podem ser somados entre pessoas. A participação usa todos os efetivos do recorte, inclusive sem responsável. Nomes vazios ou com erro ficam fora do ranking e são informados para revisão, sem unir nomes parecidos. Comparação usa intervalo anterior de igual duração, preservando os demais filtros; base anterior zero não gera percentual. Volume não mede qualidade, SLA ou produtividade por hora. Atalhos de período alteram os filtros compartilhados das OS.';

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
  const [month, setMonth] = useState(today.slice(0, 7)),
    [year, setYear] = useState(today.slice(0, 4));
  const [metric, setMetric] = useState('productive');
  const result = useMemo(
    () => supportPerformance(original, filters, role),
    [original, filters, role],
  );
  useEffect(() => setDetail(null), [original, filters, role]);
  const apply = (preset, nextMonth = month, nextYear = year) => {
    setFilters((previous) => ({
      ...previous,
      ...supportPeriod(preset, today, nextMonth, nextYear),
    }));
    setDetail(null);
  };
  const exportFile = (format) => {
    const tables = supportReport(original, result, filters, filename);
    return download(
      format === 'csv' ? supportCsv(tables) : supportWorkbook(tables),
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `equipe-suporte-${role}.${format}`,
    );
  };
  return (
    <Section
      title="Equipe de suporte"
      visible={visible}
      help={help}
      summary={
        !result.unavailable && (
          <ReportSummary
            metrics={[
              ['Atendimentos efetivos', result.totals.productive],
              ['Visitas improdutivas', result.totals.unproductive],
              ['Chamados distintos', result.totals.calls],
              ['Clientes identificados', result.totals.clients],
            ]}
            note={`${result.role.label} · ${result.role.date}. Somente Concluída/Pago; não mede qualidade.`}
          />
        )
      }
    >
      <div className="support-controls" data-no-print>
        <label>
          Responsabilidade
          <select
            aria-label="Responsabilidade"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setDetail(null);
            }}
          >
            {Object.entries(supportRoles).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="support-period-shortcuts" aria-label="Atalhos de período do suporte">
          {presets.map(([key, label]) => (
            <button key={key} type="button" onClick={() => apply(key)}>
              {label}
            </button>
          ))}
        </div>
        <label>
          Mês de referência
          <input
            aria-label="Mês de referência"
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value))
                apply('month', event.target.value);
            }}
          />
        </label>
        <label>
          Ano de referência
          <input
            aria-label="Ano de referência"
            type="number"
            min="1900"
            max="9999"
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              if (/^\d{4}$/.test(event.target.value) && Number(event.target.value) >= 1900)
                apply('year', month, event.target.value);
            }}
          />
        </label>
      </div>
      <p className="scope">
        {result.role.label} · Data utilizada: {result.role.date} · Período:{' '}
        {filters.start || 'início do histórico'} até {filters.end || 'fim do histórico'}. Datas
        personalizadas e responsáveis: filtros da página. Os atalhos atualizam o período de toda a
        análise de OS.
      </p>
      {result.unavailable ? (
        <p role="status">Indisponível: faltam as colunas {result.unavailable.join(', ')}.</p>
      ) : (
        <>
          <div className="summary-grid">
            {[
              [
                'Atendimentos efetivos',
                result.totals.productive,
                'Concluída/Pago, sem visitas improdutivas',
              ],
              [
                'Visitas improdutivas',
                result.totals.unproductive,
                'Realizadas, sem intervenção efetiva',
              ],
              [
                'Chamados distintos',
                result.totals.calls,
                'Entre todas as visitas e atendimentos realizados',
              ],
              [
                'Clientes identificados',
                result.totals.clients,
                'Razões sociais distintas nos realizados',
              ],
            ].map(([label, value, note]) => (
              <article className="summary-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>
          <p className="scope" role="status">
            {result.rows.length} visitas e atendimentos · {result.missing.length} sem responsável
            válido fora do ranking · {result.missingDates} realizados sem data válida excluídos pelo
            período. {result.undated} realizados sem data fora da evolução.
          </p>
          {result.range ? (
            <p className="scope">
              Comparação: {result.range.start} até {result.range.end} ·{' '}
              {result.past.totals.productive} efetivos → {result.totals.productive} no período
              selecionado (
              {result.totals.productive - result.past.totals.productive >= 0 ? '+' : ''}
              {result.totals.productive - result.past.totals.productive}).{' '}
              {result.past.missingDates} realizados sem data excluídos também da comparação.
            </p>
          ) : (
            <p className="scope">
              Selecione início e fim para comparar com o período anterior equivalente.
            </p>
          )}
          {!result.rows.length && <p>Nenhum serviço realizado corresponde ao recorte.</p>}
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
                        item.previous ? (item.productive - item.previous) / item.previous : null
                      }
                    >
                      {item.previous
                        ? percent((item.productive - item.previous) / item.previous)
                        : item.previous === 0
                          ? 'Sem base anterior'
                          : '—'}
                    </td>
                    <td>
                      <button onClick={() => setDetail({ label: item.label, rows: item.rows })}>
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
              onClick={() => setDetail({ label: 'Sem responsável válido', rows: result.missing })}
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
            items={result.periods.map((item) => ({ label: item.label, value: item.productive }))}
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
                            setDetail({ label: `${item.owner} · ${item.type}`, rows: item.rows })
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
    </Section>
  );
}
