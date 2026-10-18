/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useMemo, useState, useEffect, useContext } from 'react';
import { fieldLife, lifeStats, lifeGroups, lifeStates } from '../domain/fieldLife.js';
import { fieldLifeSummaryRows } from '../domain/fieldLifeSummary.js';
import { FieldLifeCards } from './FieldLifeCards.jsx';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { RecordDetails } from './RecordDetails.jsx';
import { csv, download } from '../../../shared/export/exports.js';
const number = (value) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const date = (value) => (value ? value.split('-').reverse().join('/') : '—');
/** Apresenta ciclos até primeira troca, estatísticas de duração, exclusões e contexto exportável. */
export function FieldLifePanel({ original, data, filename, filters, visible }) {
  const printContext = useContext(PrintContext);
  const [category, setCategory] = useState('Rastreador'),
    [basis, setBasis] = useState('initial'),
    [scope, setScope] = useState('installation'),
    [reference, setReference] = useState(''),
    [groupBy, setGroupBy] = useState('model'),
    [detail, setDetail] = useState(null);
  useEffect(() => {
    setReference('');
    setDetail(null);
  }, [original]);
  const result = useMemo(
    () => fieldLife(original, data, { basis, scope, referenceDate: reference || undefined }),
    [original, data, basis, scope, reference],
  );
  const periods = result.periods.filter((p) => p.category === category),
    unmeasured = result.unmeasured.filter((p) => p.category === category),
    review = result.review.filter(
      (p) => p.category === category || p.category === 'Acessório não identificado',
    );
  const stats = lifeStats(periods),
    groups = lifeGroups(periods, groupBy),
    cohorts = lifeGroups(
      periods.map((p) => ({ ...p, month: p.start?.slice(0, 7) || 'Sem data' })),
      'month',
    ).sort((a, b) => a.label.localeCompare(b.label));
  const show = (rows, title) => setDetail({ rows: [...new Set(rows)], title });
  const change = (setter, value) => {
    setter(value);
    setDetail(null);
  };
  function exportRows() {
    download(
      csv([
        ['Análise', 'Tempo em campo até primeira troca'],
        ['Arquivo', filename],
        ['Categoria', category],
        [
          'Início',
          basis === 'initial'
            ? 'Implementação ou instalação explícita da categoria'
            : 'Troca anterior da mesma categoria',
        ],
        [
          'Seleção',
          scope === 'installation' ? 'Filtros na instalação' : 'Filtros no evento de encerramento',
        ],
        ['Limite do histórico', result.reference || ''],
        ['Filtros', JSON.stringify(filters)],
        [
          'Critério',
          'Tempo médio acompanhado inclui durações válidas até troca, cancelamento ou limite; revisão fica fora. Média até primeira troca usa somente trocas confirmadas. Percentuais usam todos os ciclos identificados no recorte e não são taxas de falha.',
        ],
        ['Comparar por', groupBy === 'model' ? 'Modelo / categoria' : 'Cliente'],
        ['Resumo do acompanhamento'],
        ...fieldLifeSummaryRows(stats),
        [
          'Trocas sem duração resolvida',
          unmeasured.length,
          'eventos',
          '',
          'Base própria: retirada/troca que atende aos filtros do topo.',
        ],
        [],
        ['Resumo por grupo'],
        [
          'Grupo',
          'Ciclos identificados',
          'Primeiras trocas',
          'Participação com troca (fração)',
          'Sem troca',
          'Cancelamentos',
          'Revisão',
          'Durações acompanhadas válidas',
          'Tempo médio acompanhado (dias)',
          'Tempo médio até troca (dias)',
          'Mínimo até troca (dias)',
          'Máximo até troca (dias)',
        ],
        ...groups.map((g) => [
          g.label,
          g.total,
          g.complete,
          g.replacementShare ?? '',
          g.observed,
          g.canceled,
          g.review,
          g.followup.count,
          g.followup.mean ?? '',
          g.mean ?? '',
          g.min ?? '',
          g.max ?? '',
        ]),
        [],
        [
          'Cliente',
          'Placa',
          'Categoria',
          'Modelo',
          'Serial',
          'Início utilizado',
          'Instalação',
          'Troca / limite',
          'Situação',
          'Dias corridos',
          'Critério / motivo',
          'Linhas Excel',
        ],
        ...periods.map((p) => [
          p.client,
          p.plate,
          p.category,
          p.model,
          p.serial,
          p.origin,
          p.start || '',
          p.end || '',
          lifeStates[p.state],
          p.days,
          p.reason,
          p.rows.join(', '),
        ]),
      ]),
      'text/csv;charset=utf-8',
      'vida-em-campo-' + category.toLowerCase() + '.csv',
    );
  }
  return (
    <PrintContext.Provider
      value={{
        ...printContext,
        referenceDate: result.reference,
        filters: {
          ...printContext.filters,
          ...filters,
          'Categoria de equipamento': category,
          'Início do ciclo':
            basis === 'initial' ? 'Instalação inicial' : 'Entrada em troca anterior',
          'Aplicar filtros à': scope === 'installation' ? 'Instalação' : 'Retirada ou troca',
          'Comparar por': groupBy === 'model' ? 'Modelo / categoria' : 'Cliente',
        },
      }}
    >
      <Section
        title="Vida em campo até primeira troca"
        visible={visible}
        defaultOpen={true}
        summary={
          !result.unavailable &&
          (category === 'Rastreador' ? result.trackerAvailable : result.accessoryAvailable) && (
            <ReportSummary
              metrics={[
                ['Ciclos identificados', stats.total],
                ['Primeiras trocas confirmadas', stats.complete],
                [
                  'Média até primeira troca',
                  stats.mean == null ? '—' : number(stats.mean) + ' dias',
                ],
                [
                  'Tempo médio acompanhado',
                  stats.followup.mean == null ? '—' : number(stats.followup.mean) + ' dias',
                ],
              ]}
              note={`${category} · ${basis === 'initial' ? 'instalação inicial' : 'entrada em troca anterior'} · filtros na ${scope === 'installation' ? 'instalação' : 'troca/encerramento'} · limite ${result.reference || 'indisponível'}. Média até troca usa somente trocas confirmadas; tempo acompanhado inclui outros encerramentos e observações. Não é vida útil concluída de toda a base.`}
            />
          )
        }
      >
        <div className="life-panel">
          <div className="life-categories" role="group" aria-label="Categoria de equipamento">
            {[
              ['Rastreador', 'Rastreadores'],
              ['Coletora', 'Coletora / teclado / terminal'],
              ['RFID', 'RFID'],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={category === value}
                className={category === value ? 'active' : ''}
                onClick={() => change(setCategory, value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="filter-grid life-settings">
            <label>
              Início do ciclo
              <select value={basis} onChange={(e) => change(setBasis, e.target.value)}>
                <option value="initial">Implementação / instalação até primeira troca</option>
                <option value="replacement">Entrada em uma troca até próxima troca</option>
              </select>
            </label>
            <label>
              Aplicar filtros do topo à
              <select value={scope} onChange={(e) => change(setScope, e.target.value)}>
                <option value="installation">Instalação que inicia o ciclo</option>
                <option value="event">Troca ou encerramento do ciclo</option>
              </select>
            </label>
            <label>
              Consultar histórico até
              <input
                type="date"
                aria-label="Limite do histórico de vida em campo"
                value={reference || result.latest || ''}
                max={result.latest || undefined}
                onChange={(e) => change(setReference, e.target.value)}
              />
              <button onClick={() => change(setReference, '')}>
                Usar última data do histórico
              </button>
            </label>
          </div>
          <p className="scope life-method">
            Acessórios: primeira troca desde a implementação do cliente/placa, ou instalação
            explícita mais precisa. Depois, desde a troca anterior da mesma categoria. Manutenção
            sem troca não reinicia o ciclo.{' '}
            {scope === 'installation'
              ? 'O período e os demais filtros selecionam as instalações. A troca pode ocorrer depois do período selecionado, até o limite do histórico.'
              : 'O período e os demais filtros selecionam a retirada do rastreador ou a troca do acessório. A instalação é procurada no histórico completo.'}{' '}
            Somente Concluída/Pago. Limite consultado: <strong>{date(result.reference)}</strong>.
            Ausência de troca no arquivo não confirma funcionamento atual.
          </p>
          {result.unavailable ? (
            <p role="status">
              Análise indisponível: {result.reason || 'faltam colunas para identificar os ciclos.'}
            </p>
          ) : result.invalidReference ? (
            <p role="alert">Escolha uma data de referência válida.</p>
          ) : (category === 'Rastreador' && !result.trackerAvailable) ||
            (category !== 'Rastreador' && !result.accessoryAvailable) ? (
            <p>Colunas necessárias para esta categoria indisponíveis.</p>
          ) : (
            <>
              {result.referenceCapped && (
                <p className="notice">
                  A referência foi limitada à última data de atendimento realizado do arquivo:{' '}
                  {date(result.latest)}.
                </p>
              )}
              <FieldLifeCards
                stats={stats}
                category={category}
                basis={basis}
                scope={scope}
                unmeasured={unmeasured.length}
              />
              <p className="scope">
                Tempo médio acompanhado inclui ciclos com troca, sem troca e cancelamentos com
                duração válida; {stats.followup.excluded} ciclos ficam fora por revisão ou duração
                incompatível. Média até troca, mínimo e máximo usam somente primeiras trocas
                confirmadas; {stats.canceled} cancelamentos e {stats.review} ciclos em revisão ficam
                fora dessa amostra. Nenhuma dessas médias estima a vida útil final do parque.{' '}
                {result.excludedAfterReference > 0
                  ? result.excludedAfterReference +
                    ' instalações selecionadas posteriores ao limite ficam fora da observação.'
                  : ''}{' '}
                {scope === 'event'
                  ? 'Períodos sem troca registrada não possuem evento de encerramento para esta seleção.'
                  : ''}
              </p>
              <div className="dashboard-chart-grid life-charts">
                <article className="dashboard-widget">
                  <div className="inline-help-heading">
                    <h3>Tempo até troca dos ciclos completos</h3>
                    <InfoNote>
                      Distribui a quantidade de ciclos completos nas faixas de dias corridos entre
                      início e troca identificada. Cada ciclo entra em uma faixa; cancelamentos, sem
                      troca e vínculos não resolvidos ficam fora. A base segue categoria, início do
                      ciclo, filtros e limite do histórico escolhidos. Não é distribuição da idade
                      de todos os equipamentos instalados.
                    </InfoNote>
                  </div>
                  <p className="scope">
                    Quantidade de ciclos por faixa de duração. Base: {stats.complete}.
                  </p>
                  <Chart items={stats.bins} title="Distribuição até primeira troca" compact />
                </article>
                <article className="dashboard-widget">
                  <div className="inline-help-heading">
                    <h3>Comparação da duração</h3>
                    <InfoNote>
                      Média em dias, somente grupos com ciclos completos. Soma das durações dividida
                      pelo número de ciclos com troca confirmada; menor e maior tempo usam a mesma
                      base. A mediana permanece complementar na tabela detalhada. Confira o tamanho
                      da amostra.
                    </InfoNote>
                  </div>
                  <label>
                    Comparar por
                    <select value={groupBy} onChange={(e) => change(setGroupBy, e.target.value)}>
                      <option value="model">Modelo / categoria</option>
                      <option value="client">Cliente</option>
                    </select>
                  </label>
                  <Chart
                    items={groups
                      .filter((g) => g.complete)
                      .map((g) => ({ label: g.label, value: g.mean }))}
                    title="Tempo médio observado até a primeira troca"
                    compact
                    ranking
                    format={(value) => number(value) + ' dias'}
                    onItemClick={(item) => {
                      const group = groups.find((g) => g.label === item.label);
                      show(
                        group.periods.flatMap((p) => p.rows),
                        group.label,
                      );
                    }}
                  />
                </article>
              </div>
              <div className="life-group-summary">
                <div className="inline-help-heading">
                  <h3>Tempo por {groupBy === 'model' ? 'modelo / tipo' : 'cliente'}</h3>
                  <InfoNote>
                    Cada grupo mostra todos os seus ciclos identificados. Participação com troca
                    divide as primeiras trocas pelo total do grupo, incluindo revisão no
                    denominador. Tempo médio acompanhado usa durações válidas até troca,
                    cancelamento ou limite; média, mínimo e máximo até troca usam somente trocas
                    confirmadas. Bases diferentes permanecem separadas. Percentuais não são taxas de
                    falha nem comparações ajustadas pela idade dos equipamentos.
                  </InfoNote>
                </div>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        {[
                          'Grupo',
                          'Ciclos identificados',
                          'Primeiras trocas',
                          'Com troca (%)',
                          'Tempo médio acompanhado (dias)',
                          'Média até troca (dias)',
                          'Mínimo (dias)',
                          'Máximo (dias)',
                          'Origem',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <tr key={g.label}>
                          <td>{g.label}</td>
                          <td>{g.total}</td>
                          <td>{g.complete}</td>
                          <td data-sort={g.replacementShare}>
                            {g.replacementShare == null
                              ? '—'
                              : number(g.replacementShare * 100) + '%'}
                          </td>
                          <td data-sort={g.followup.mean}>{number(g.followup.mean)}</td>
                          <td data-sort={g.mean}>{number(g.mean)}</td>
                          <td data-sort={g.min}>{number(g.min)}</td>
                          <td data-sort={g.max}>{number(g.max)}</td>
                          <td>
                            <button
                              onClick={() =>
                                show(
                                  g.periods
                                    .filter((p) => p.state === 'replaced')
                                    .flatMap((p) => p.rows),
                                  g.label + ' · ciclos com primeira troca',
                                )
                              }
                              disabled={!g.complete}
                            >
                              Conferir ciclos
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </div>
              <details className="life-details">
                <summary>Comparação completa e tamanho das amostras</summary>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        {[
                          'Grupo',
                          'Ciclos identificados',
                          'Durações acompanhadas válidas',
                          'Tempo médio acompanhado (dias)',
                          'Com troca (%)',
                          'Ciclos completos',
                          'Média (dias)',
                          'Mediana (dias)',
                          'Menor (dias)',
                          'Maior (dias)',
                          'Sem troca',
                          'Cancelamento',
                          'Revisar',
                          'Origem',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => (
                        <tr key={g.label}>
                          <td>{g.label}</td>
                          <td>{g.total}</td>
                          <td>{g.followup.count}</td>
                          <td data-sort={g.followup.mean}>{number(g.followup.mean)}</td>
                          <td data-sort={g.replacementShare}>
                            {g.replacementShare == null
                              ? '—'
                              : number(g.replacementShare * 100) + '%'}
                          </td>
                          <td>{g.complete}</td>
                          <td data-sort={g.mean}>{number(g.mean)}</td>
                          <td data-sort={g.median}>{number(g.median)}</td>
                          <td>{number(g.min)}</td>
                          <td>{number(g.max)}</td>
                          <td>{g.observed}</td>
                          <td>{g.canceled}</td>
                          <td>{g.review}</td>
                          <td>
                            <button
                              onClick={() =>
                                show(
                                  g.periods.flatMap((p) => p.rows),
                                  g.label,
                                )
                              }
                            >
                              Conferir registros
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </details>
              <details className="life-details">
                <summary>Acompanhamento pelo mês de instalação</summary>
                <InfoNote>
                  Equipamentos instalados recentemente tiveram menos tempo de observação. As
                  contagens não são taxas históricas de falha.
                </InfoNote>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        {[
                          'Mês de instalação',
                          'Ciclos selecionados',
                          'Primeira troca',
                          'Com troca (%)',
                          'Tempo médio acompanhado (dias)',
                          'Sem troca registrada',
                          'Cancelamento',
                          'Revisar',
                          'Origem',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map((g) => (
                        <tr key={g.label}>
                          <td>{g.label}</td>
                          <td>{g.total}</td>
                          <td>{g.complete}</td>
                          <td data-sort={g.replacementShare}>
                            {g.replacementShare == null
                              ? '—'
                              : number(g.replacementShare * 100) + '%'}
                          </td>
                          <td data-sort={g.followup.mean}>{number(g.followup.mean)}</td>
                          <td>{g.observed}</td>
                          <td>{g.canceled}</td>
                          <td>{g.review}</td>
                          <td>
                            <button
                              onClick={() =>
                                show(
                                  g.periods.flatMap((p) => p.rows),
                                  'Instalações ' + g.label,
                                )
                              }
                            >
                              Conferir registros
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </details>
              <details className="life-details">
                <summary>Detalhes dos ciclos ({periods.length})</summary>
                <PermissionButton action="export" onClick={exportRows}>
                  Baixar ciclos CSV
                </PermissionButton>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        {[
                          'Cliente',
                          'Placa',
                          'Modelo / categoria',
                          'Serial',
                          'Início utilizado',
                          'Instalação',
                          'Troca / limite',
                          'Situação',
                          'Dias corridos',
                          'Origem',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((p) => (
                        <tr key={p.key}>
                          <td>{p.client || 'Sem cliente'}</td>
                          <td>{p.plate || 'Sem placa'}</td>
                          <td>{p.model}</td>
                          <td>{p.serial || 'Não utilizado'}</td>
                          <td>{p.origin}</td>
                          <td data-sort={p.start}>{date(p.start)}</td>
                          <td data-sort={p.end}>{date(p.end)}</td>
                          <td title={p.reason}>
                            {lifeStates[p.state]}
                            <small className="life-reason">{p.reason}</small>
                          </td>
                          <td data-sort={p.days}>{number(p.days)}</td>
                          <td>
                            <button
                              onClick={() => show(p.rows, p.plate + ' · ' + lifeStates[p.state])}
                            >
                              Conferir {p.rows.length} {p.rows.length === 1 ? 'linha' : 'linhas'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </details>
              <details className="life-details">
                <summary>Trocas com duração não resolvida ({unmeasured.length})</summary>
                <InfoNote>
                  Esta lista usa os filtros na retirada/troca, independentemente do modo de seleção
                  dos ciclos. Instalação ausente não vira duração zero.
                </InfoNote>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        {[
                          'Cliente',
                          'Placa',
                          'Serial retirado',
                          'Data da troca',
                          'Motivo',
                          'Origem',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {unmeasured.map((p, i) => (
                        <tr key={i}>
                          <td>{p.client}</td>
                          <td>{p.plate}</td>
                          <td>{p.serial || 'Não utilizado'}</td>
                          <td>{date(p.date)}</td>
                          <td>{p.reason}</td>
                          <td>
                            <button onClick={() => show(p.rows, p.plate + ' · troca sem duração')}>
                              Conferir registros
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </details>
              <details className="life-details">
                <summary>Vínculos e categorias para revisão ({review.length})</summary>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Motivo</th>
                        <th>Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {review.map((item, i) => (
                        <tr key={i}>
                          <td>{item.category}</td>
                          <td>{item.reason}</td>
                          <td>
                            <button
                              title={'Linhas Excel: ' + item.rows.join(', ')}
                              onClick={() => show(item.rows, item.reason)}
                            >
                              Conferir {item.rows.length}{' '}
                              {item.rows.length === 1 ? 'linha' : 'linhas'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </details>
            </>
          )}
          <details className="life-details">
            <summary>Critérios usados nesta análise</summary>
            <InfoNote>
              Critérios confirmados: acessórios iniciam pela implementação do cliente/placa ou
              instalação explícita mais precisa; próximos ciclos usam a troca anterior da categoria.
              Rastreadores usam retirada e instalação no mesmo chamado, placa e data, com IDs
              diferentes.
            </InfoNote>
            <InfoNote>
              Rastreador inicial: Implementação com motivo de instalação e serial válido. Troca:
              duas linhas de Assistência Técnica realizadas, retirada + instalação/reinstalação, com
              mesmo chamado, cliente, placa e data e seriais diferentes. Apenas a primeira saída
              inequívoca encerra o ciclo; uma retirada incompleta não é ignorada para procurar uma
              troca posterior.
            </InfoNote>
            <InfoNote>
              Acessório inicial: implementação do cliente/placa como referência, com categoria
              identificada no histórico; instalação explícita anterior ao primeiro atendimento tem
              prioridade. Troca: Assistência Técnica / Manutenção de Acessório com troca/trocar
              explícito da mesma categoria, cliente e placa. Coletora, teclado e terminal
              compartilham categoria. Serial do acessório não é utilizado. A referência da
              implementação não prova a instalação física diária; manutenção sem troca não reinicia
              o ciclo.
            </InfoNote>
            <InfoNote>
              Instalações na mesma data do encerramento, duplicidades, identificação incompatível e
              eventos intermediários que interrompem o vínculo vão para revisão. Na opção de entrada
              por troca, mede-se o próximo ciclo instalado, sem presumir equipamento novo de
              fábrica. Dias corridos de instalação até troca; não representam idade de fabricação ou
              previsão de duração do parque. A planilha mantém todos os valores originais.
            </InfoNote>
          </details>
          {detail && (
            <div className="life-source">
              <button onClick={() => setDetail(null)}>Fechar conferência de vida em campo</button>
              <RecordDetails data={original} rows={detail.rows} title={detail.title} />
            </div>
          )}
        </div>
      </Section>
    </PrintContext.Provider>
  );
}
