/** Coordena acompanhamento e análise sem misturar demonstração e integração real. */
import React, { useEffect, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider, SidebarContent } from '../../../app/SidePanel.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import { MultiFilter } from '../../../components/MultiFilter.jsx';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { download } from '../../../shared/export/exports.js';
import { MonitoringQueue } from './MonitoringQueue.jsx';
import { MonitoringAnalytics } from './MonitoringAnalytics.jsx';
import { useMonitoringSource } from '../hooks/useMonitoringSource.js';
import {
  monitorSnapshot,
  monitoringDate,
  monitoringStates,
  monitoringStages,
} from '../domain/monitoring.js';
import { filterMonitoringQueue, monitoringFocusLabels } from '../domain/monitoringAnalytics.js';
import { monitoringReport, monitoringCsv, monitoringWorkbook } from '../domain/monitoringReport.js';

const initialFilters = () => ({
  clients: [],
  threshold: 48,
  state: 'all',
  focus: 'all',
  stage: 'all',
  search: '',
});

/** Bases/limite pertencem à análise; busca, situação, status e recorte pertencem à fila/exportação. */
export function MonitoringPage({ onPage }) {
  const { snapshot, source, busy, error, demonstration, refresh } = useMonitoringSource();
  const [category, setCategory] = useState('queue');
  const [filters, setFilters] = useState(initialFilters);
  const [notes, setNotes] = useState({}),
    [selected, setSelected] = useState(null),
    [page, setPage] = useState(0);
  const result = snapshot ? monitorSnapshot(snapshot, filters) : null;
  const queue = result ? filterMonitoringQueue(result, filters, notes) : null;
  const demo = snapshot?.demonstration === true;
  // Identidades da demonstração nunca compartilham anotações com veículos reais.
  useEffect(() => {
    setNotes({});
    setSelected(null);
    setPage(0);
    setFilters(initialFilters());
  }, [source?.demonstration]);
  const bases = snapshot
    ? snapshot.collections.map((entry) => ({
        id: entry.clientId,
        label:
          (snapshot.vehicles.find((row) => row.clientId === entry.clientId)?.clientName || 'Base') +
          ' · ' +
          entry.clientId,
      }))
    : [];
  const tables = queue ? monitoringReport(queue, filters, notes) : null;
  const update = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setSelected(null);
    setPage(0);
  };
  function openQueue(focus, clientId) {
    setFilters((previous) => ({
      ...previous,
      focus,
      clients: clientId ? [clientId] : previous.clients,
      state: 'all',
      stage: 'all',
      search: '',
    }));
    setSelected(null);
    setPage(0);
    setCategory('queue');
  }
  const exportFile = (format) =>
    download(
      format === 'csv' ? monitoringCsv(tables) : monitoringWorkbook(tables),
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      (demo ? 'DEMO-' : '') + 'monitoramento.' + format,
    );
  const modeNotice = (
    <div className="notice">
      {demo
        ? 'DEMONSTRAÇÃO — Dados fictícios, referência congelada e critérios provisórios. Nenhuma API real está conectada nesta demonstração. Anotações somente nesta sessão.'
        : snapshot
          ? 'Retrato recebido da integração. Classificação recalculada a cada minuto; nova consulta é manual. Anotações somente nesta sessão, sem sincronização entre usuários.'
          : 'Integração em preparação. A consulta autenticada está pronta para receber o coletor; a demonstração usa somente dados fictícios.'}
    </div>
  );
  return (
    <SidePanelProvider>
      <div className="app monitoring-page">
        <Navigation page="monitoring" onPage={onPage} />
        <SidebarContent>
          <div className="monitoring-menu">
            {[
              ['queue', 'Acompanhamento'],
              ['overview', 'Visão analítica'],
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
            filename: demo ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'Integração de monitoramento',
            filters,
            referenceDate: snapshot?.referenceAt,
          }}
        >
          <main>
            <header>
              <div>
                <div className="eyebrow">MONITORAMENTO PREVENTIVO</div>
                <h1>Monitoramento Ativo</h1>
                <p>Comunicação, prioridades e acompanhamento do suporte.</p>
              </div>
              <div className="monitoring-actions">
                <button disabled={busy} onClick={refresh}>
                  {busy
                    ? 'Consultando integração…'
                    : snapshot && !demo
                      ? 'Atualizar dados'
                      : 'Consultar integração'}
                </button>
                <button onClick={demonstration}>
                  {demo ? 'Sair da demonstração' : 'Explorar demonstração'}
                </button>
              </div>
            </header>
            {error && (
              <p role="alert" className="notice">
                {error}{' '}
                {snapshot && !demo
                  ? 'A frota anterior foi mantida com coleta indisponível, sem novos alertas utilizáveis.'
                  : ''}
              </p>
            )}
            {!snapshot ? (
              <>
                {modeNotice}
                <section className="panel monitoring-preparation">
                  <h2>Preparado para receber a API</h2>
                  <p>
                    A conexão será feita pelo servidor após confirmar autenticação, campos, fuso e
                    paginação. Nenhum token é solicitado ou armazenado nesta tela. Histórico
                    compartilhado e coleta automática dependem da próxima etapa.
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
                      Tempo desde o último registro até a referência exibida. Faixas de 48/72/96 h e
                      validade da coleta inferior a 2 h continuam provisórias. Falha de coleta,
                      datas inválidas/futuras e ausência de posição não confirmam interrupção. Bases
                      e limite afetam a análise. Busca, situação, status e recorte afetam a fila e a
                      exportação de veículos; não mudam o denominador dos cards e gráficos. Abaixo
                      do limite não significa online neste instante.
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
                    <button
                      onClick={() => {
                        setFilters(initialFilters());
                        setSelected(null);
                        setPage(0);
                      }}
                    >
                      Limpar filtros
                    </button>
                  </div>
                  <p className="scope">
                    Referência: {monitoringDate(snapshot.referenceAt)} · São Paulo ·{' '}
                    {demo
                      ? 'Dados fictícios'
                      : 'Retrato recebido: ' + monitoringDate(source.referenceAt)}
                  </p>
                  {category !== 'overview' && (
                    <div className="monitoring-queue-filters" data-no-print>
                      <label>
                        Buscar veículo
                        <input
                          aria-label="Buscar veículo"
                          type="search"
                          placeholder="Placa, rastreador, cliente, perfil ou responsável…"
                          value={filters.search}
                          onChange={(event) => update('search', event.target.value)}
                        />
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
                      <label>
                        Status de acompanhamento
                        <select
                          aria-label="Filtrar acompanhamento"
                          value={filters.stage}
                          onChange={(event) => update('stage', event.target.value)}
                        >
                          <option value="all">Todos</option>
                          {monitoringStages.map((stage) => (
                            <option key={stage}>{stage}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Recorte da fila
                        <select
                          aria-label="Recorte da fila"
                          value={filters.focus}
                          onChange={(event) => update('focus', event.target.value)}
                        >
                          {Object.entries(monitoringFocusLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className="scope" role="status">
                        {queue.rows.length} de {result.totals.fleet} veículos no recorte da fila.
                        Exportação usa este mesmo recorte; cards usam todas as situações das bases
                        selecionadas.
                      </p>
                    </div>
                  )}
                </section>
                {modeNotice}
                {(result.totals.stale > 0 ||
                  result.totals.invalid > 0 ||
                  result.issues.length > 0) && (
                  <p role="status" className="notice">
                    Coleta desatualizada/indisponível: {result.totals.stale} · Datas para revisão:{' '}
                    {result.totals.invalid} · Registros excluídos por identificação:{' '}
                    {result.issues.length}.
                  </p>
                )}
                <MonitoringQueue
                  visible={category === 'queue'}
                  result={queue}
                  notes={notes}
                  onRecord={(key, value) => setNotes((previous) => ({ ...previous, [key]: value }))}
                  selected={selected}
                  onSelect={setSelected}
                  page={page}
                  setPage={setPage}
                />
                <MonitoringAnalytics
                  visible={category === 'overview'}
                  result={result}
                  notes={notes}
                  threshold={filters.threshold}
                  onQueue={openQueue}
                />
                <div hidden={category !== 'reports'}>
                  <Section
                    title="Relatório de acompanhamento"
                    help="Exporta todos os veículos do recorte da fila, independentemente da paginação, incluindo busca, situação, status e recorte selecionados. Inclui referência, critérios, dados recebidos, indicadores analíticos das bases e histórico de tratamento salvo. Rascunhos não são exportados. Resumo por base e indicadores abrangem todas as situações das bases selecionadas. Atualizações de tratamento permanecem somente nesta sessão; a integração não ativa armazenamento compartilhado."
                  >
                    <p>
                      {queue.rows.length} veículos · Referência{' '}
                      {monitoringDate(snapshot.referenceAt)} ·{' '}
                      {demo ? 'DADOS FICTÍCIOS' : 'Dados da integração'}
                    </p>
                    <div className="monitoring-actions">
                      <PermissionButton action="export" onClick={() => exportFile('xlsx')}>
                        Exportar XLSX{demo ? ' de demonstração' : ''}
                      </PermissionButton>
                      <PermissionButton action="export" onClick={() => exportFile('csv')}>
                        Exportar CSV{demo ? ' de demonstração' : ''}
                      </PermissionButton>
                    </div>
                    <p className="scope">
                      Histórico de episódios, recuperações, consumo e notificações dependem da
                      integração e persistência das coletas.
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
