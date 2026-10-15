/** Monitoramento em preparação: demonstração opt-in, cálculos locais e nenhum acesso à API real. */
import React, { useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { download } from '../../../shared/export/exports.js';
import { monitoringDemo } from '../data/demo.js';
import { MonitoringQueue } from './MonitoringQueue.jsx';
import { monitorSnapshot, monitoringDate, monitoringStates } from '../domain/monitoring.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from '../domain/monitoringReport.js';

/** Mantém notas somente nesta sessão; encerramento administrativo não altera a situação técnica. */
export function MonitoringPage({ onPage }) {
  const [snapshot, setSnapshot] = useState(null),
    [category, setCategory] = useState('overview');
  const [filters, setFilters] = useState({ clients: [], threshold: 48, state: 'all' });
  const [notes, setNotes] = useState({}),
    [selected, setSelected] = useState(null),
    [page, setPage] = useState(0);
  const result = snapshot ? monitorSnapshot(snapshot, filters) : null;
  const bases = snapshot
    ? [...new Set(snapshot.vehicles.map((row) => row.clientId))].map((id) => ({
        id,
        label: snapshot.vehicles.find((row) => row.clientId === id).clientName + ' · ' + id,
      }))
    : [];
  const tables = result ? monitoringReport(result, filters, notes) : null;
  const update = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setSelected(null);
    setPage(0);
  };
  function demonstration() {
    setSnapshot(snapshot ? null : monitoringDemo());
    setNotes({});
    setSelected(null);
    setPage(0);
    setFilters({ clients: [], threshold: 48, state: 'all' });
  }
  const exportFile = (format) =>
    download(
      format === 'csv' ? monitoringCsv(tables) : monitoringWorkbook(tables),
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `DEMO-monitoramento.${format}`,
    );
  const modeNotice = (
    <div className="notice">
      {snapshot
        ? 'DEMONSTRAÇÃO — Dados fictícios, referência congelada e critérios provisórios. Nenhuma API está conectada. Notas desaparecem ao recarregar ou sair da demonstração.'
        : 'Integração real ainda não ativada. Explore a demonstração para avaliar filtros e relatórios; ela não representa veículos de clientes.'}
    </div>
  );
  return (
    <SidePanelProvider>
      <div className="app monitoring-page">
        <Navigation page="monitoring" onPage={onPage} />
        <SidebarContent>
          <div className="monitoring-menu">
            {[
              ['overview', 'Visão analítica'],
              ['queue', 'Acompanhamento'],
              ['reports', 'Relatórios'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={category === key ? 'active' : ''}
                aria-pressed={category === key}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </SidebarContent>
        <PrintContext.Provider
          value={{
            filename: 'DEMONSTRAÇÃO — DADOS FICTÍCIOS',
            filters,
            referenceDate: snapshot?.referenceAt,
          }}
        >
          <main>
            <header>
              <div>
                <div className="eyebrow">MONITORAMENTO PREVENTIVO · EM PREPARAÇÃO</div>
                <h1>Monitoramento Ativo</h1>
                <p>Comunicação, prioridades e acompanhamento do suporte.</p>
              </div>
              <button onClick={demonstration}>
                {snapshot ? 'Sair da demonstração' : 'Explorar demonstração'}
              </button>
            </header>

            {!snapshot ? (
              <>
                {modeNotice}
                <section className="panel monitoring-preparation">
                  <h2>Preparado para a próxima etapa</h2>
                  <p>
                    Após confirmar o fuso, o significado da última comunicação e os limites da API,
                    conectaremos o coletor no servidor. Nenhum token é solicitado nesta tela.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section
                  className="panel monitoring-filters"
                  aria-label="Filtros do monitoramento ativo"
                >
                  <div className="inline-help-heading">
                    <h2>Filtros do monitoramento</h2>
                    <InfoNote>
                      Tempo desde o último registro até a referência congelada. Abaixo do limite não
                      significa online neste instante. Faixas 48/72/96 h e validade de coleta
                      inferior a 2 h são provisórias. Falha de coleta, data futura ou inválida e
                      ausência de posição não confirmam interrupção. Cards e gráficos abrangem todas
                      as situações das bases selecionadas; o filtro de situação afeta tabela e
                      exportação de veículos.
                    </InfoNote>
                  </div>
                  <div className="monitoring-filter-fields">
                    <MultiFilter
                      label="Bases de clientes"
                      options={bases.map((base) => base.label)}
                      values={bases
                        .filter((base) => filters.clients.includes(base.id))
                        .map((base) => base.label)}
                      onChange={(value) =>
                        update(
                          'clients',
                          bases.filter((base) => value.includes(base.label)).map((base) => base.id),
                        )
                      }
                    />
                    <label>
                      Limite de atenção
                      <select
                        aria-label="Limite de atenção"
                        value={filters.threshold}
                        onChange={(event) => update('threshold', Number(event.target.value))}
                      >
                        {[48, 72, 96].map((hours) => (
                          <option key={hours} value={hours}>
                            {hours} horas
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Situação técnica
                      <select
                        aria-label="Situação técnica"
                        value={filters.state}
                        onChange={(event) => update('state', event.target.value)}
                      >
                        <option value="all">Todas</option>
                        {Object.entries(monitoringStates).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="scope">
                    Referência: {monitoringDate(snapshot.referenceAt)} · São Paulo · Dados fictícios
                  </p>
                </section>
                {modeNotice}
                <MonitoringQueue
                  visible={category !== 'reports'}
                  result={result}
                  notes={notes}
                  onRecord={(key, value) => setNotes((previous) => ({ ...previous, [key]: value }))}
                  selected={selected}
                  onSelect={setSelected}
                  page={page}
                  setPage={setPage}
                />
                <section className="cards monitoring-cards">
                  {[
                    ['Veículos monitorados', result.totals.fleet, 'Bases selecionadas'],
                    [
                      `${filters.threshold} h ou mais`,
                      result.totals.delayed,
                      result.totals.percentage == null
                        ? 'Sem base percentual'
                        : `${result.totals.percentage.toFixed(1).replace('.', ',')}% da frota`,
                    ],
                    ['96 h ou mais', result.totals.critical, 'Prioridade provisória'],
                    ['Sem posição registrada', result.totals.missing, 'Duração indeterminada'],
                  ].map(([label, value, note]) => (
                    <article key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>{note}</small>
                    </article>
                  ))}
                </section>
                {(result.totals.stale > 0 ||
                  result.totals.invalid > 0 ||
                  result.issues.length > 0) && (
                  <p role="status" className="notice">
                    Coleta desatualizada: {result.totals.stale} · Datas para revisão:{' '}
                    {result.totals.invalid} · Registros excluídos por identificação:{' '}
                    {result.issues.length}.
                  </p>
                )}
                <div hidden={category !== 'overview'}>
                  <div className="monitoring-charts">
                    <Section title="Tempo sem comunicação">
                      <InfoNote>
                        DEMONSTRAÇÃO. Faixas exclusivas, somente datas válidas e coletas
                        utilizáveis. Abaixo de 48 h fica fora das barras; a seleção do limite não
                        altera as faixas.
                      </InfoNote>
                      <Chart
                        compact
                        title="DEMONSTRAÇÃO · tempo sem comunicação"
                        items={result.buckets}
                        exportNote="DADOS FICTÍCIOS · faixas provisórias"
                      />
                    </Section>
                    <Section title="Alertas por base">
                      <InfoNote>
                        DEMONSTRAÇÃO. Quantidade acima do limite escolhido; os percentuais usam
                        todos os veículos identificados de cada base, inclusive sem posição.
                      </InfoNote>
                      <Chart
                        compact
                        title="DEMONSTRAÇÃO · alertas por base"
                        items={result.groups.map((group) => ({
                          label: group.label,
                          value: group.alerts,
                        }))}
                        exportNote="DADOS FICTÍCIOS · não representa falhas confirmadas"
                      />
                      <div className="table-scroll">
                        <SortableTable>
                          <thead>
                            <tr>
                              <th>Base</th>
                              <th>Veículos</th>
                              <th>Acima do limite</th>
                              <th>Participação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.groups.map((group) => (
                              <tr key={group.clientId}>
                                <td>{group.label}</td>
                                <td>{group.total}</td>
                                <td>{group.alerts}</td>
                                <td data-sort={group.percentage}>{group.percentage.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </SortableTable>
                      </div>
                    </Section>
                  </div>
                  <details className="report-details">
                    <summary>Evolução ilustrativa das coletas</summary>
                    <p className="scope">
                      Todas as bases da demonstração · Limite fixo de 48 h · Os filtros acima não
                      alteram esta série fictícia.
                    </p>
                    <Chart
                      type="line"
                      title="DEMONSTRAÇÃO · observações de coleta"
                      items={snapshot.history.map((item) => ({
                        label: monitoringDate(item.at),
                        value: item.count,
                      }))}
                      exportNote="DADOS FICTÍCIOS · observações não determinam o instante exato da interrupção"
                    />
                  </details>
                </div>
                <div hidden={category !== 'reports'}>
                  <Section title="Relatório de acompanhamento">
                    <InfoNote>
                      DEMONSTRAÇÃO. Exporta todos os veículos do recorte, não apenas a página
                      exibida; inclui critério, referência, alimentação, perfil e histórico de
                      tratamento registrado. XLSX também inclui resumo por base e histórico.
                    </InfoNote>
                    <p>
                      {result.rows.length} veículos · Referência{' '}
                      {monitoringDate(snapshot.referenceAt)} · DADOS FICTÍCIOS
                    </p>
                    <div className="monitoring-actions">
                      <PermissionButton action="export" onClick={() => exportFile('xlsx')}>
                        Exportar XLSX de demonstração
                      </PermissionButton>
                      <PermissionButton action="export" onClick={() => exportFile('csv')}>
                        Exportar CSV de demonstração
                      </PermissionButton>
                    </div>
                    <p className="scope">
                      Relatório histórico de episódios, consumo e notificações serão adicionados
                      depois das definições da API.
                    </p>
                  </Section>
                </div>
              </>
            )}
          </main>
        </PrintContext.Provider>
      </div>
    </SidePanelProvider>
  );
}
