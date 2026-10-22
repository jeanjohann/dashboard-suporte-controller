/** Conferência logística: dados locais, recebimentos datados e origem preservada para revisão. */
import React, { useEffect, useRef, useState } from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import {
  authorizeAction,
  accessManaged,
  accessUser,
} from '../../../shared/security/accessClient.js';
import { allowsSource } from '../../../shared/security/permissions.js';
import { Section, PrintContext } from '../../../components/Section.jsx';
import { ReportSummary } from '../../../components/ReportSummary.jsx';
import { PagePersonalization, ReportControls } from '../../../components/ReportControls.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { importLogistics, selectLogistics, logisticsSections } from '../domain/logistics.js';
import { PeriodFilter } from '../../../components/PeriodFilter.jsx';
import { filterChips, filterDisplay } from '../../../shared/filters/scopedSelection.js';

export function LogisticsPanel({ source, onImport, filters, setFilters, onExpand }) {
  const input = useRef();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [detail, setDetail] = useState(null);
  useEffect(() => {
    setDetail(null);
  }, [source]);
  const data = source?.data;
  const selected = data ? selectLogistics(data, filters) : null;
  const earliest = data?.rows
    .map((row) => row.eventDate)
    .filter(Boolean)
    .sort()[0];
  const chips = filterChips(filters, {
    labels: {
      type: 'Movimentação',
      receipt: 'Recebimento',
      start: 'De',
      end: 'Até',
      search: 'Busca',
    },
    format: (value, key) =>
      key === 'receipt'
        ? value === 'recorded'
          ? 'Com data válida'
          : 'Sem data válida / conferir'
        : filterDisplay(value),
    remove: (key) => {
      setFilters((previous) => ({ ...previous, [key]: '' }));
      setDetail(null);
    },
  });
  const update = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setDetail(null);
  };
  async function load(event) {
    if (!(await authorizeAction('import'))) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      if (accessManaged() && !allowsSource(accessUser(), 'logistics'))
        throw Error('Importação da logística não autorizada.');
      const result = importLogistics(await file.arrayBuffer());
      await onImport({ filename: file.name, data: result });
    } catch (e) {
      setError(
        (e.message || 'Não foi possível ler o arquivo.') +
          (data ? ' A base anterior foi preservada.' : ''),
      );
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }
  function exportCsv() {
    download(
      csv([
        ['Arquivo', source.filename],
        ['Filtros', JSON.stringify(filters)],
        [
          'Critério',
          'Uma linha = uma movimentação. Recebimentos exigem data válida; Envios exclui recebimento anterior ao envio. Situação não altera os cálculos. Duplicidades indicadas permanecem para revisão.',
        ],
        [],
        [
          'Aba',
          'Linha Excel',
          'Movimentação',
          'Chamado',
          'Cliente',
          'Equipamento original',
          'ID original',
          'Placa',
          'Envio',
          'Recebimento',
          'Recebimento datado',
          'Rastreio',
          'Cidade',
          'A/C',
          'Situação original',
          'Pontos de revisão',
        ],
        ...selected.rows.map((row) => [
          row.sheet,
          row.sourceRow,
          row.type,
          row.call,
          row.client,
          row.equipment,
          row.id,
          row.plate,
          row.sentAt || '',
          row.receivedAt || '',
          row.receiptRecorded ? 'Sim' : 'Sem data válida / conferir',
          row.tracking,
          row.city,
          row.recipient,
          row.condition,
          selected.issues
            .filter((issue) => issue.key === row.key)
            .map((issue) => `${issue.address}: ${issue.reason}`)
            .join(' | '),
        ]),
      ]),
      'text/csv;charset=utf-8',
      'movimentacoes-logisticas.csv',
    );
  }
  return (
    <PrintContext.Provider
      value={{
        filename: source?.filename,
        filters: { ...filters, alcance: 'Parque e Manutenção → Logística' },
      }}
    >
      <div className="logistics-import-actions" data-no-print>
        <PermissionButton action="import" disabled={busy} onClick={() => input.current.click()}>
          {busy ? 'Lendo logística…' : 'Importar envios e devoluções'}
        </PermissionButton>
        <input hidden type="file" accept=".xlsx,.xls" ref={input} onChange={load} />
        <span className="scope">Leitura de Envios e Devoluções · somente nesta sessão</span>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!data ? (
        <section className="empty">
          <h2>Envios e devoluções de equipamentos</h2>
          <p>
            Carregue o Excel com as abas Envios e Devoluções. A aba de consertos fica fora desta
            etapa.
          </p>
        </section>
      ) : (
        <>
          <PagePersonalization
            actions={<ReportControls onExpand={onExpand} />}
            scope="Parque e Manutenção → Logística"
            chips={chips}
            matched={selected.rows.length}
            total={data.rows.length}
            onClear={() => {
              setFilters({});
              setDetail(null);
            }}
            period={
              <PeriodFilter
                start={filters.start}
                end={filters.end}
                earliest={earliest}
                onChange={update}
              />
            }
            help="Filtros somente desta categoria. Período usa Envio em Envios e Data Recebimento em Devoluções. Sem limite, registros sem data permanecem; com limite, são excluídos e contados. Busca consulta células originais. A seleção é mantida ao navegar e não afeta OS, Operacional ou outras categorias de Parque e Manutenção."
            source={`${source.filename} · Envios + Devoluções · originais preservados`}
            notice={
              (selected.invalidPeriod || selected.missingDates > 0) && (
                <>
                  {selected.invalidPeriod && (
                    <p className="error" role="alert">
                      A data inicial deve ser anterior ou igual à final.
                    </p>
                  )}
                  {selected.missingDates > 0 && (
                    <span>
                      {selected.missingDates} movimentações excluídas por data ausente ou inválida
                      com período ativo.
                    </span>
                  )}
                </>
              )
            }
          >
            <div className="filter-grid">
              <label>
                Movimentação
                <select
                  aria-label="Movimentação"
                  value={filters.type || ''}
                  onChange={(e) => update('type', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option>Envio</option>
                  <option>Devolução</option>
                </select>
              </label>
              <label>
                Recebimento
                <select
                  aria-label="Recebimento"
                  value={filters.receipt || ''}
                  onChange={(e) => update('receipt', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="recorded">Com data válida</option>
                  <option value="undated">Sem data válida / conferir</option>
                </select>
              </label>
            </div>
            <label className="logistics-search">
              Buscar cliente, ID, chamado, placa ou conteúdo original
              <input
                type="search"
                value={filters.search || ''}
                onChange={(e) => update('search', e.target.value)}
              />
            </label>
          </PagePersonalization>
          <Section
            title={logisticsSections[0]}
            visible
            summary={
              <ReportSummary
                metrics={[
                  ['Envios registrados', selected.shipments],
                  ['Envios com recebimento datado', selected.shipmentsReceived],
                  ['Devoluções registradas', selected.returns],
                  ['Devoluções com recebimento datado', selected.returnsReceived],
                ]}
                note="Mesmos filtros da Logística. Cada linha é movimentação; recebimento de envio é no destinatário e de devolução é na Addlog. Sem data não significa pendência."
              />
            }
            help="Cada linha preenchida é uma movimentação, mesmo com ID ausente ou kit. Envios com recebimento datado significa chegada ao destinatário; Devoluções com recebimento datado significa chegada à Addlog. Datas precisam ser válidas; recebimento anterior ao envio fica para revisão e não confirma recebimento. Sem data não significa material pendente. Situação é preservada, sem classificar defeito, estoque ou cobrança. Os filtros locais se aplicam aos cards, à tabela, ao CSV e à impressão. Repetições apontadas não são excluídas automaticamente."
          >
            <div className="summary-grid">
              {[
                ['Envios registrados', selected.shipments],
                ['Envios com recebimento datado', selected.shipmentsReceived],
                ['Devoluções registradas', selected.returns],
                ['Devoluções com recebimento datado', selected.returnsReceived],
              ].map(([label, value]) => (
                <article className="summary-card" key={label}>
                  <span>{label}</span>
                  <strong>{value.toLocaleString('pt-BR')}</strong>
                </article>
              ))}
            </div>
            <p className="scope">
              Contagem de movimentações, não de unidades ou equipamentos distintos. Sem data válida
              de recebimento: {selected.rows.filter((row) => !row.receiptRecorded).length}. Origem e
              conteúdos completos ficam na conferência.
            </p>
            <PermissionButton action="export" onClick={exportCsv}>
              Exportar movimentações CSV
            </PermissionButton>
            <div className="table-scroll">
              <SortableTable>
                <thead>
                  <tr>
                    {[
                      'Aba / linha',
                      'Cliente',
                      'Equipamento original',
                      'ID original',
                      'Chamado',
                      'Placa',
                      'Envio',
                      'Recebimento',
                      'Conferência',
                    ].map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.rows.map((row) => (
                    <tr key={row.key}>
                      <td>
                        {row.sheet} · {row.sourceRow}
                      </td>
                      <td>{row.client || 'Não informado'}</td>
                      <td>{row.equipment}</td>
                      <td>{row.id}</td>
                      <td>{row.call}</td>
                      <td>{row.plate}</td>
                      <td>{row.sentAt || '—'}</td>
                      <td>
                        {row.receivedAt || '—'}
                        {!row.receiptRecorded && (
                          <small className="logistics-cell-note">Sem data válida / conferir</small>
                        )}
                      </td>
                      <td>
                        <button onClick={() => setDetail(row)}>Ver origem</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
            {!selected.rows.length && <p>Nenhuma movimentação corresponde aos filtros.</p>}
            {detail && (
              <div className="logistics-origin">
                <div className="inline-help-heading">
                  <h3>
                    Origem · {detail.sheet} · linha {detail.sourceRow}
                  </h3>
                  <button onClick={() => setDetail(null)}>Fechar origem</button>
                </div>
                <div className="table-scroll">
                  <SortableTable>
                    <thead>
                      <tr>
                        <th>Célula</th>
                        <th>Campo</th>
                        <th>Conteúdo original</th>
                        <th>Fórmula armazenada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.cells.map((cell, index) => (
                        <tr key={cell.address}>
                          <td>{cell.address}</td>
                          <td>{detail.columns[index].label}</td>
                          <td>{cell.display}</td>
                          <td>{cell.formula || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
              </div>
            )}
          </Section>
          <Section
            title={logisticsSections[1]}
            visible
            summary={
              <ReportSummary
                metrics={[
                  ['Pontos para conferência', selected.issues.length],
                  [
                    'Movimentações apontadas',
                    new Set(selected.issues.map((issue) => issue.key)).size,
                  ],
                ]}
                note="Uma movimentação pode ter vários pontos. Indicação para revisão, sem exclusão ou correção automática."
              />
            }
            help="Mostra campos ausentes, datas incompatíveis/invertidas, identificadores que exigem conferência e possíveis duplicidades. Mesma aba + ID numérico único + data da movimentação é sinalizada; reaparecer em outra data é permitido. A indicação usa o arquivo completo e permanece após filtrar. Uma linha pode ter vários pontos. Nenhuma correção é automática; ajuste a origem e reimporte. Situação e consertos não são usados para classificar defeitos nesta etapa."
          >
            <p className="scope">
              {selected.issues.length} pontos em{' '}
              {new Set(selected.issues.map((issue) => issue.key)).size} movimentações da seleção.
              Células vazias não confirmam pendências.
            </p>
            <div className="table-scroll">
              <SortableTable>
                <thead>
                  <tr>
                    <th>Aba</th>
                    <th>Célula</th>
                    <th>Campo</th>
                    <th>Valor original</th>
                    <th>Conferência</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.issues.map((issue, index) => (
                    <tr key={index}>
                      <td>{issue.sheet}</td>
                      <td>{issue.address}</td>
                      <td>{issue.column}</td>
                      <td>{issue.value}</td>
                      <td>{issue.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
            {!selected.issues.length && (
              <p>Nenhum ponto encontrado pelas verificações desta etapa.</p>
            )}
          </Section>
        </>
      )}
    </PrintContext.Provider>
  );
}
