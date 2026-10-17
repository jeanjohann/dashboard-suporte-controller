/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { SortableTable, compareValues } from '../../../components/SortableTable.jsx';
import { RecordDetails, MonthlyBreakdown } from './RecordDetails.jsx';
import React, { useState } from 'react';
import { groupings, measures, report, history } from '../domain/reports.js';
import { field } from '../../../shared/data/filters.js';
import { Chart } from '../../../components/Chart.jsx';
import { Section } from '../../../components/Section.jsx';
import { reportCsv, chartSvg, csv, download } from '../../../shared/export/exports.js';
import { localId } from '../../../shared/data/localId.js';
const currency = (value) =>
  (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
/** Permite agrupar medidas, consultar histórico e salvar somente configurações de relatório no navegador. */
export function Explorers({ data, filename, filters, onRestoreFilters, visibility }) {
  const [grouping, setGrouping] = useState('Mês'),
    [measure, setMeasure] = useState('attendances'),
    [display, setDisplay] = useState('both');
  const [chartType, setChartType] = useState('bars');
  const [kind, setKind] = useState('Placa'),
    [identifier, setIdentifier] = useState('');
  const [detail, setDetail] = useState(null);
  const [saved, setSaved] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem('suporte-reports-v1') || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });
  const [saveName, setSaveName] = useState(''),
    [saveMessage, setSaveMessage] = useState('');
  const schema = JSON.stringify(data.columns.map((col) => [col.index, col.label]));
  function persist(next) {
    try {
      localStorage.setItem('suporte-reports-v1', JSON.stringify(next));
      setSaved(next);
      setSaveMessage('Configurações atualizadas neste navegador.');
    } catch {
      setSaveMessage('Não foi possível salvar neste navegador.');
    }
  }
  const result = report(data, grouping, measure);
  const format = ['cost', 'travel', 'client', 'absorbed'].includes(measure)
    ? currency
    : (value) => value.toLocaleString('pt-BR');
  const options = [
    ...new Set(data.rows.map((row) => String(field(data, row, kind)?.raw ?? '')).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const events = history(data, kind, identifier);
  const details = detail ? (result.items.find((item) => item.label === detail)?.rows ?? []) : [];
  return (
    <>
      <Section title="Configurações de relatório" visible={visibility.saved}>
        <section className="panel chart-panel">
          <h2>Configurações de relatório</h2>
          <p className="scope">
            Configuração atual: {measures[measure]} por {grouping}. Agrupamento, medida, gráfico e
            filtros são compartilhados com a visualização Relatório personalizado.
          </p>
          <div className="filter-grid">
            <label>
              Nome da configuração
              <input
                value={saveName}
                onChange={(event) => setSaveName(event.target.value)}
                placeholder="Ex.: custos por cliente"
              />
            </label>
          </div>
          <button
            disabled={!saveName.trim()}
            onClick={() => {
              persist([
                ...saved,
                {
                  id: localId(),
                  name: saveName.trim(),
                  schema,
                  grouping,
                  measure,
                  display,
                  chartType,
                  filters,
                },
              ]);
              setSaveName('');
            }}
          >
            Salvar configuração atual
          </button>
          <InfoNote>
            Guarda somente agrupamento, medida, visualização e filtros neste navegador. Os filtros
            podem conter nomes ou identificadores selecionados; registros e planilha não são salvos.
            Configurações de colunas diferentes precisam ser refeitas.
          </InfoNote>
          {saveMessage && <p role="status">{saveMessage}</p>}
          {saved.map((config) => (
            <div key={config.id} className="saved-report-config">
              <span title={config.name}>{config.name}</span>
              <button
                onClick={() => {
                  if (
                    config.schema !== schema ||
                    !groupings.includes(config.grouping) ||
                    !measures[config.measure] ||
                    !['both', 'bars', 'table'].includes(config.display)
                  ) {
                    setSaveMessage('Configuração incompatível com estas colunas.');
                    return;
                  }
                  setGrouping(config.grouping);
                  setMeasure(config.measure);
                  setDisplay(config.display);
                  setChartType(
                    ['bars', 'line', 'pie', 'donut'].includes(config.chartType)
                      ? config.chartType
                      : 'bars',
                  );
                  setDetail(null);
                  onRestoreFilters(config.filters || {});
                  setSaveMessage('Configuração aplicada; confira os filtros na planilha atual.');
                }}
              >
                Aplicar
              </button>
              <button onClick={() => persist(saved.filter((item) => item.id !== config.id))}>
                Excluir configuração
              </button>
            </div>
          ))}
        </section>
      </Section>
      <Section title="Exportações" visible={visibility.export}>
        <section className="panel chart-panel">
          <h2>Exportar análise atual</h2>
          <p className="scope">
            {measures[measure]} por {grouping}. Ajuste a análise na visualização Relatório
            personalizado antes de exportar.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <PermissionButton
              action="export"
              disabled={result.unavailable || !result.items.length}
              onClick={() =>
                download(
                  reportCsv(result, {
                    grouping,
                    measure,
                    measureLabel: measures[measure],
                    filename,
                    filters,
                  }),
                  'text/csv;charset=utf-8',
                  'relatorio-suporte.csv',
                )
              }
            >
              Baixar relatório CSV
            </PermissionButton>
            <PermissionButton
              action="export"
              disabled={result.unavailable || !result.items.length}
              onClick={() =>
                download(
                  chartSvg(result.items, {
                    title: `${measures[measure]} por ${grouping}`,
                    subtitle: `${filename} · ${result.eligible} elegíveis · ${result.excluded} excluídos`,
                    format,
                  }),
                  'image/svg+xml',
                  'grafico-suporte.svg',
                )
              }
            >
              Baixar barras SVG
            </PermissionButton>
          </div>
          <InfoNote>
            CSV inclui filtros e linhas de origem. SVG é uma imagem vetorial do relatório, para
            apresentações; filtros detalhados ficam no CSV. Agrupamento e medida são definidos na
            visualização Relatório personalizado. A exportação do histórico fica junto à consulta em
            Equipamentos, com os filtros daquela categoria.
          </InfoNote>
        </section>
      </Section>
      <Section title="Relatório personalizado" visible={visibility.report}>
        <section className="panel chart-panel">
          <h2>Relatório personalizado</h2>
          <div className="filter-grid">
            <label>
              Agrupar por
              <select
                value={grouping}
                onChange={(event) => {
                  setGrouping(event.target.value);
                  setDetail(null);
                }}
              >
                {groupings.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Medida
              <select
                value={measure}
                onChange={(event) => {
                  setMeasure(event.target.value);
                  if (
                    event.target.value === 'calls' &&
                    (chartType === 'pie' || chartType === 'donut')
                  )
                    setChartType('bars');
                  setDetail(null);
                }}
              >
                {Object.entries(measures).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo de gráfico
              <select value={chartType} onChange={(event) => setChartType(event.target.value)}>
                <option value="bars">Barras</option>
                <option value="line">Linhas</option>
                <option value="pie" disabled={measure === 'calls'}>
                  Pizza
                </option>
                <option value="donut" disabled={measure === 'calls'}>
                  Rosca
                </option>
              </select>
            </label>
            <label>
              Visualização
              <select value={display} onChange={(event) => setDisplay(event.target.value)}>
                <option value="both">Gráfico e tabela</option>
                <option value="bars">Barras</option>
                <option value="table">Tabela</option>
              </select>
            </label>
          </div>
          <p className="scope">
            Segue os filtros da análise. Somente realizados. Linhas em agrupamentos não temporais
            conectam categorias, não representam evolução no tempo. {result.eligible} registros
            elegíveis; {result.excluded} excluídos por agrupamento ou valor ausente/incompatível.
            Valores contratuais não são recebimentos. Um chamado pode participar de vários grupos;
            suas contagens não devem ser somadas.
          </p>
          {result.unavailable ? (
            <p role="status">Relatório indisponível: faltam colunas necessárias.</p>
          ) : (
            <>
              {display !== 'table' && (
                <Chart
                  ranking={grouping !== 'Mês'}
                  title={`${measures[measure]} por ${grouping}`}
                  type={chartType}
                  measure={measure}
                  items={result.items}
                  format={format}
                />
              )}
              {display !== 'bars' && (
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        <th>{grouping}</th>
                        <th>{measures[measure]}</th>
                        <th>Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.items.map((item) => (
                        <tr key={item.label}>
                          <td>{item.label}</td>
                          <td>{format(item.value)}</td>
                          <td className="table-action-cell">
                            <button
                              type="button"
                              className="table-record-action"
                              onClick={() => setDetail(detail === item.label ? null : item.label)}
                            >
                              Conferir {item.rows.length}{' '}
                              {item.rows.length === 1 ? 'linha' : 'linhas'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                  {!result.items.length && <p>Sem dados para esta seleção.</p>}
                </div>
              )}
              {detail && (
                <RecordDetails data={data} rows={details} title={`Detalhamento de ${detail}`} />
              )}
            </>
          )}
        </section>
      </Section>
      <Section title="Histórico de equipamentos" visible={visibility.history}>
        <section className="panel chart-panel">
          <h2>Histórico de equipamentos</h2>
          <PermissionButton
            action="export"
            disabled={!events.length}
            onClick={() =>
              download(
                csv([
                  ['Histórico de equipamentos'],
                  ['Arquivo', filename],
                  ['Consulta', kind, identifier],
                  ['Filtros', JSON.stringify(filters)],
                  [
                    'Data',
                    'Chamado',
                    'Status',
                    'Placa',
                    'Rastreador',
                    'Motivo',
                    'Instruções',
                    'Linha Excel',
                  ],
                  ...events.map(({ row, date }) => [
                    date || 'Sem data válida',
                    row.os,
                    ...['Status', 'Placa', 'ID Rastreador', 'Motivo', 'Instruções'].map((label) =>
                      String(field(data, row, label)?.display ?? ''),
                    ),
                    row.sourceRow,
                  ]),
                ]),
                'text/csv;charset=utf-8',
                'historico-equipamento.csv',
              )
            }
          >
            Baixar histórico CSV
          </PermissionButton>
          <div className="filter-grid">
            <label>
              Consultar por
              <select
                value={kind}
                onChange={(event) => {
                  setKind(event.target.value);
                  setIdentifier('');
                }}
              >
                <option>Placa</option>
                <option>ID Rastreador</option>
              </select>
            </label>
            <label>
              Identificador
              <input
                list={`history-${kind}`}
                value={identifier}
                placeholder="Digite ou escolha o valor exato"
                onChange={(event) => setIdentifier(event.target.value)}
              />
              <datalist id={`history-${kind}`}>
                {options.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </label>
          </div>
          <InfoNote>
            Histórico dentro dos filtros atuais, por correspondência exata. Inclui todos os status
            selecionados; cancelamentos não significam atendimento executado. Eventos sem data ficam
            ao final. A consulta por placa mostra os seriais vinculados em cada registro. Consulte
            períodos encerrados na visualização Tempo observado em campo.
          </InfoNote>
          {identifier ? (
            <>
              <p>{events.length} registros encontrados.</p>
              <div className="table-scroll">
                <SortableTable>
                  <thead>
                    <tr>
                      {[
                        'Data',
                        'Chamado',
                        'Status',
                        'Placa',
                        'Rastreador',
                        'Motivo',
                        'Instruções',
                        'Linha Excel',
                      ].map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(({ row, date }) => (
                      <tr key={row.sourceRow}>
                        <td>{date || 'Sem data válida'}</td>
                        <td>{row.os}</td>
                        {['Status', 'Placa', 'ID Rastreador', 'Motivo', 'Instruções'].map(
                          (label) => (
                            <td key={label} title={String(field(data, row, label)?.display ?? '')}>
                              {field(data, row, label)?.display ?? ''}
                            </td>
                          ),
                        )}
                        <td>{row.sourceRow}</td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
              </div>
            </>
          ) : (
            <p className="scope">
              Escolha uma placa ou serial para consultar os eventos registrados.
            </p>
          )}
        </section>
      </Section>
    </>
  );
}
