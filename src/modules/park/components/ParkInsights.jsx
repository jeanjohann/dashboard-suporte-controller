/**
 * Interface dos cruzamentos entre o parque operacional e o histórico de Ordens de Serviço.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { TableScroll } from '../../../components/TableScroll.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useMemo, useState } from 'react';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { ParkHistoryPanel } from './ParkHistoryPanel.jsx';
import { AnalysisMetrics } from '../../../components/AnalysisMetrics.jsx';
import { ViewState } from '../../../components/ViewState.jsx';
import { download, csv } from '../../../shared/export/exports.js';
import {
  parkAnalysis,
  parkReportTables,
  parkReportCsv,
  parkReportWorkbook,
  parkSections,
  parkColumns,
} from '../domain/parkAnalysis.js';
const number = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const percent = (value) =>
  value == null ? '—' : (value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

/** Apresenta indicadores e relatórios do parque vinculado ao histórico, com bases percentuais explícitas. */
export function ParkInsights({
  rows,
  operational,
  orders,
  operationalFilename,
  ordersFilename,
  filters,
  onConfigurePeriod,
}) {
  const [columns, setColumns] = useState(Object.keys(parkColumns));
  const start = filters.attendanceStart || '',
    end = filters.attendanceEnd || '';
  const [group, setGroup] = useState('client'),
    [measure, setMeasure] = useState('assistance'),
    [type, setType] = useState('bars'),
    [includeOriginal, setIncludeOriginal] = useState(true),
    [message, setMessage] = useState('');
  const result = useMemo(
    () => parkAnalysis(rows, orders, { start, end, group }),
    [rows, orders, start, end, group],
  );
  const context = { operationalFilename, ordersFilename, filters, start, end, columns };
  function tables() {
    return parkReportTables(result, operational, orders, context);
  }
  function exportReport(format) {
    try {
      const report = tables();
      if (format === 'xlsx')
        download(
          parkReportWorkbook(report, operational, orders, { includeOriginal }),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'parque-manutencao.xlsx',
        );
      else download(parkReportCsv(report), 'text/csv;charset=utf-8', 'parque-manutencao.csv');
      setMessage('Relatório gerado com os filtros e período atuais.');
    } catch (error) {
      setMessage('Não foi possível gerar: ' + error.message);
    }
  }
  const cards = [
    [
      'Rastreador/kit sem troca',
      result.devices?.trackerAvailable ? result.devices.withoutReplacement.length : null,
      'Uma linha/ID no chamado e placa; assistência efetiva vinculada',
    ],
    ['Base vinculável', result.base, 'Registros com serial + placa válidos e sem ambiguidade'],
    [
      'Com atendimento realizado',
      result.withServices,
      'Um ou mais serviços no período selecionado',
    ],
    [
      'Com assistência técnica',
      result.withAssistance,
      percent(result.share) + ' da base vinculável',
    ],
    ['Assistências realizadas', result.assistance, 'Concluída ou Pago · tipo Assistência Técnica'],
    [
      'Assistências por 100 registros',
      result.rate,
      'Assistências ÷ base vinculável × 100; pode superar 100',
    ],
    [
      'Veículos com várias visitas',
      result.recurringVehicles,
      'Cliente + placa da OS · datas distintas na seleção',
    ],
    [
      'Trocas de rastreador',
      result.devices?.trackerAvailable ? result.swaps.length : null,
      'Par completo no período; ao menos um serial vinculado',
    ],
    [
      'Coletora / RFID trocados',
      result.devices?.accessoryAvailable
        ? `${result.devices.accessories.Coletora} / ${result.devices.accessories.RFID}`
        : '—',
      'Mesmos critérios atuais das OS; não inclui categorias ambíguas',
    ],
  ];
  const primaryCards = [cards[1], cards[2], cards[3], cards[4]];
  const secondaryCards = [cards[0], ...cards.slice(5)];
  const displayCards = (items) =>
    items.map(([label, value, note]) => [
      label,
      value == null ? '—' : typeof value === 'number' ? number(value) : value,
      note,
    ]);
  const items = result.items
    .map((item) => ({ label: item.label, value: item[measure] }))
    .filter((item) => item.value != null)
    .sort((a, b) => b.value - a.value);
  const circular = ['pie', 'donut'].includes(type),
    nonAdditive = ['rate', 'share'].includes(measure);
  return (
    <PrintContext.Provider
      value={{
        filename: `${operationalFilename} | OS: ${ordersFilename || 'não importada'}`,
        filters: {
          ...filters,
          atendimentoDe: start,
          atendimentoAte: end,
          agrupamento: group,
          indicador: measure,
        },
      }}
    >
      <Section
        visible
        title={parkSections[0]}
        summary={
          !result.unavailable &&
          !result.invalidPeriod && (
            <ReportSummary
              metrics={primaryCards.map(([label, value]) => [label, number(value)])}
              note={`Base vinculável: ${result.base} de ${result.total} registros. OS realizadas no período ${start || 'sem limite'} a ${end || 'sem limite'}; fotografia operacional, sem inferir frota ativa ou falha.`}
            />
          )
        }
      >
        {result.unavailable ? (
          <ViewState title="Carregue as Ordens de Serviço para cruzar os dados">
            Importe a OS com Status, ID Rastreador, Placa, Tipo de Serviço, Motivo e Data de
            atendimento para habilitar estes indicadores.
          </ViewState>
        ) : result.invalidPeriod ? (
          <p className="error" role="alert">
            A data inicial deve ser anterior ou igual à final.
          </p>
        ) : (
          <>
            <p className="analysis-context">
              {result.base} de {result.total} registros operacionais vinculáveis ·{' '}
              {result.total - result.base} fora desta base. Fotografia do parque; não representa
              taxa de falha.
            </p>
            <AnalysisMetrics
              items={displayCards(primaryCards)}
              label="Indicadores principais do parque"
            />
            <details className="analysis-secondary">
              <summary>Trocas, retornos e indicadores complementares</summary>
              <AnalysisMetrics
                items={displayCards(secondaryCards)}
                label="Indicadores complementares do parque"
              />
            </details>
            <details className="analysis-context-details">
              <summary>Base, período e critérios dos indicadores</summary>
              <p className="notice">
                {result.base} de {result.total} registros operacionais selecionados podem ser
                vinculados. Os demais ficam fora desta base. Registros sem atendimento disponível
                permanecem no denominador; isso não comprova ausência de manutenção. A taxa compara
                os serviços observados à fotografia importada do parque, não mede probabilidade de
                falha ou disponibilidade.
              </p>
              <p className="scope">
                Período solicitado: {start || 'sem limite inicial'} até {end || 'sem limite final'}.
                Datas dos serviços incluídos: {result.period?.start || '—'} a{' '}
                {result.period?.end || '—'}. {result.missingDates} realizados excluídos por data
                ausente/inválida com período ativo; {result.undated} incluídos sem data quando não
                há limite de período.
              </p>
              <p className="scope">
                Retornos cumulativos: até 30 dias{' '}
                {result.recurringAvailable ? result.returns[30] : '—'}, até 60 dias{' '}
                {result.recurringAvailable ? result.returns[60] : '—'}, até 90 dias{' '}
                {result.recurringAvailable ? result.returns[90] : '—'}; base:{' '}
                {result.recurringAvailable ? result.intervals : '—'} intervalos entre visitas
                consecutivas dentro da seleção. Serviços no mesmo dia formam uma visita. Nova
                intervenção não confirma falha. {result.devices?.excludedAccessories ?? 0}{' '}
                manutenções de acessório com categoria não confirmada ficaram para revisão.
                Manutenções sem troca ficam separadas das substituições.
              </p>
            </details>
          </>
        )}
      </Section>
      {!result.unavailable && !result.invalidPeriod && (
        <>
          <ParkHistoryPanel result={result} orders={orders} context={context} />
          <Section
            visible
            title={parkSections[1]}
            summary={
              <ReportSummary
                metrics={[
                  ['Grupos na comparação', result.items.length],
                  ['Base vinculável', result.base],
                  ['Assistências', result.assistance],
                  ['Com assistência', result.withAssistance],
                ]}
                note="Mesmo agrupamento e período da análise completa. Assistências são serviços; base e equipamentos com assistência são registros operacionais distintos."
              />
            }
          >
            <div className="filter-grid">
              <label>
                Agrupar por
                <select value={group} onChange={(e) => setGroup(e.target.value)}>
                  {[
                    ['client', 'Cliente operacional'],
                    ['model', 'Modelo pelo serial'],
                    ['plan', 'Plano operacional'],
                    ['status', 'Situação operacional'],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Indicador
                <select value={measure} onChange={(e) => setMeasure(e.target.value)}>
                  {[
                    ['assistance', 'Assistências realizadas'],
                    ['withAssistance', 'Registros com assistência'],
                    ['rate', 'Assistências por 100 registros'],
                    ['share', 'Percentual com assistência'],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Gráfico
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="bars">Barras</option>
                  <option value="pie">Pizza</option>
                  <option value="donut">Rosca</option>
                </select>
              </label>
            </div>
            <InfoNote>
              Cliente e plano são os lançados no operacional atual; modelo vem do prefixo do serial.
              O modelo lançado continua nos dados originais. Esses campos não confirmam a
              titularidade ou o contrato à época do serviço. Nenhum custo é atribuído ao contrato
              atual.
            </InfoNote>
            {circular && nonAdditive ? (
              <p className="notice">
                Taxas e percentuais de bases diferentes não formam uma composição. Use barras para
                comparar este indicador.
              </p>
            ) : (
              <Chart
                title="Manutenção no histórico vinculado"
                items={items}
                type={type}
                ranking
                format={measure === 'share' ? percent : number}
                exportNote="Base vinculável da fotografia operacional; OS com histórico limitado. Não representa taxa de falhas."
              />
            )}
            <TableScroll label="Análise do parque e registros de origem">
              <SortableTable>
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Base vinculável</th>
                    <th>Com atendimento</th>
                    <th>Com assistência</th>
                    <th>Assistências</th>
                    <th>Por 100 registros</th>
                    <th>% com assistência</th>
                    <th>Linhas operacional</th>
                    <th>Linhas OS</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>{item.base}</td>
                      <td>{item.withServices}</td>
                      <td>{item.withAssistance}</td>
                      <td>{item.assistance}</td>
                      <td data-sort={item.rate}>{number(item.rate)}</td>
                      <td data-sort={item.share}>{percent(item.share)}</td>
                      <td>{item.operationalRows.join(', ')}</td>
                      <td>{item.serviceRows.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </TableScroll>
          </Section>
          <Section
            visible
            title={parkSections[2]}
            defaultOpen={false}
            summary={
              <ReportSummary
                metrics={[
                  ['Serviços realizados', result.services.length],
                  ['Tipos / categorias', result.categories.length],
                  ['Assistências efetivas', result.assistance],
                  [
                    'Visitas improdutivas',
                    result.categories.find((item) => item.label === 'Visita Improdutiva')?.value ||
                      0,
                  ],
                ]}
                note="Concluída/Pago no recorte. Improdutivas ficam separadas; trocas são subconjuntos, não categorias adicionais para somar."
              />
            }
          >
            <Chart
              title="Tipos de serviço realizados"
              items={result.categories}
              type="bars"
              ranking
              exportNote="Somente Concluída/Pago vinculados ao parque selecionado."
            />
            <TableScroll label="Análise do parque e registros de origem">
              <SortableTable>
                <thead>
                  <tr>
                    <th>Tipo de serviço</th>
                    <th>Quantidade</th>
                    <th>Participação nos realizados</th>
                    <th>Linhas OS</th>
                  </tr>
                </thead>
                <tbody>
                  {result.categories.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>{item.value}</td>
                      <td>
                        {percent(
                          result.services.length ? item.value / result.services.length : null,
                        )}
                      </td>
                      <td>{item.rows.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </TableScroll>
            <details>
              <summary>Conferir trocas de rastreador ({result.swaps.length})</summary>
              <TableScroll label="Análise do parque e registros de origem">
                <SortableTable>
                  <thead>
                    <tr>
                      <th>Chamado</th>
                      <th>Placa</th>
                      <th>Retirado</th>
                      <th>Instalado</th>
                      <th>Data</th>
                      <th>Linhas OS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.swaps.map((pair) => (
                      <tr key={pair.rows.join('-')}>
                        <td>{pair.os}</td>
                        <td>{pair.plate}</td>
                        <td>
                          {pair.oldSerial || `Direção não definida: ${pair.serials.join(' / ')}`}
                        </td>
                        <td>{pair.newSerial || 'Direção não definida'}</td>
                        <td>{pair.date || 'Sem data comum'}</td>
                        <td>{pair.rows.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </TableScroll>
            </details>
            <InfoNote>
              Trocas são subconjuntos dos tipos de serviço, não categorias adicionais para somar.
              Uma troca de rastreador conta um evento mesmo quando seus dois seriais estão no
              parque.
            </InfoNote>
          </Section>
          <Section visible title={parkSections[3]} defaultOpen={false}>
            <p className="scope">
              Período dos atendimentos: {start || 'sem limite inicial'} a{' '}
              {end || 'sem limite final'}.
            </p>
            {onConfigurePeriod && (
              <button onClick={onConfigurePeriod}>Ajustar período desta categoria</button>
            )}
            <label>
              Agrupamento do relatório
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                {[
                  ['client', 'Cliente operacional'],
                  ['model', 'Modelo pelo serial'],
                  ['plan', 'Plano operacional'],
                  ['status', 'Situação operacional'],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="inline-help-heading">
              <h3>Colunas do resumo</h3>
              <InfoNote>
                Grupo e base vinculável permanecem para interpretar os resultados. Escolha as demais
                colunas do resumo exportado.
              </InfoNote>
            </div>
            <div className="preference-grid">
              {Object.entries(parkColumns).map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={columns.includes(key)}
                    onChange={(e) =>
                      setColumns((previous) =>
                        e.target.checked
                          ? [...previous, key]
                          : previous.filter((value) => value !== key),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <label>
              <input
                type="checkbox"
                checked={includeOriginal}
                onChange={(e) => setIncludeOriginal(e.target.checked)}
              />{' '}
              Incluir originais operacionais e OS no XLSX
            </label>
            <div className="report-downloads">
              <PermissionButton action="export" onClick={() => exportReport('xlsx')}>
                Exportar relatório XLSX
              </PermissionButton>
              <PermissionButton action="export" onClick={() => exportReport('csv')}>
                Exportar resumo CSV
              </PermissionButton>
              <button
                onClick={() =>
                  download(csv(tables().original), 'text/csv;charset=utf-8', 'parque-original.csv')
                }
              >
                Operacional original CSV
              </button>
              <button
                onClick={() =>
                  download(csv(tables().serviceRows), 'text/csv;charset=utf-8', 'os-vinculadas.csv')
                }
              >
                OS e contexto de trocas CSV
              </button>
            </div>
            <p role="status" className="scope">
              {message}
            </p>
            <InfoNote>
              Resumo por grupo, indicadores e critérios sempre incluídos. Valores e percentuais
              numéricos no XLSX; originais selecionados opcionais, incluindo a contraparte das
              trocas para conferência. Sem planilhas ou registros salvos no navegador. CSV mantém o
              contexto dos filtros e arquivos.
            </InfoNote>
          </Section>
        </>
      )}
    </PrintContext.Provider>
  );
}
