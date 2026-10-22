/** Leitura de presença separada dos tempos apontados em chamados, com origem e recorte exportáveis. */
import React, { useMemo, useState } from 'react';
import { Chart } from '../../../components/Chart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { TableScroll } from '../../../components/TableScroll.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { zohoDuration as duration } from './ZohoActivitySummary.jsx';
import { zohoPresenceView, presenceDateTime } from '../domain/zohoPresenceView.js';
const dayLabel = (date) => date.split('-').reverse().join('/');
export function ZohoPresenceResults({ report, source }) {
  const [agent, setAgent] = useState('');
  const selected = report.groups.some((row) => row.agent === agent) ? agent : '';
  const view = useMemo(() => zohoPresenceView(report, selected), [report, selected]);
  const [showSessions, setShowSessions] = useState(false);
  const stamp = (value) =>
    presenceDateTime(value, report.offset).replace(/^(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
  function exportReport() {
    download(
      csv([
        ['Fonte', source.filename],
        ['Agente', selected || 'Todos'],
        ['Fuso', report.offset],
        ['Período', report.start || 'Início disponível', report.end || 'Fim disponível'],
        [
          'Critério',
          'União de sessões válidas por agente; não equivale a jornada ou tempo apontado',
        ],
        ['Agente', 'Permanência em segundos', 'Sessões', 'Sobreposições', 'Linhas de origem'],
        ...view.groups.map((row) => [
          row.agent,
          row.seconds,
          row.sessions,
          row.overlaps,
          row.rows.join(', '),
        ]),
        [],
        ['Dia no fuso informado', 'Permanência acumulada em segundos'],
        ...view.daily.map((row) => [row.date, row.seconds]),
        ...(view.dailyLimited
          ? [['Evolução diária', 'Selecione um período de até 366 dias para calcular']]
          : []),
        [],
        ['Linha CSV', 'Agente', 'Entrada recortada', 'Saída recortada'],
        ...view.sessions.map((row) => [
          row.sourceRow,
          row.agent,
          stamp(row.from),
          stamp(row.until),
        ]),
        [],
        ['Linha CSV', 'Agente', 'Conferência'],
        ...view.issues.map((row) => [row.row, row.agent, row.reason]),
      ]),
      'text/csv;charset=utf-8',
      'zoho-permanencia-conferida.csv',
    );
  }
  return (
    <div className="zoho-presence-results">
      <p className="scope">
        Fonte: {source.filename}
        {/^EXEMPLO-FICTICIO/i.test(source.filename) && (
          <strong> · DADOS FICTÍCIOS PARA TESTE</strong>
        )}
      </p>
      <div className="zoho-presence-toolbar">
        <label>
          Agente informado
          <select value={selected} onChange={(event) => setAgent(event.target.value)}>
            <option value="">Todos os agentes</option>
            {report.groups.map((row) => (
              <option key={row.agent} value={row.agent}>
                {row.agent}
              </option>
            ))}
          </select>
        </label>
        <PermissionButton action="export" onClick={exportReport}>
          Exportar recorte CSV
        </PermissionButton>
      </div>
      <div className="zoho-presence-metrics">
        {[
          [
            'Permanência registrada',
            view.groups.length ? duration(view.totalSeconds) : 'Indisponível',
            'Intervalos unidos por agente',
          ],
          ['Agentes com sessão válida', view.groups.length, 'Identificação informada no arquivo'],
          ['Sessões válidas', view.sessions.length, 'Dentro do período selecionado'],
          [
            'Apontamentos para conferir',
            view.issues.length,
            'Abertas, inválidas, repetidas ou sobrepostas',
          ],
        ].map(([label, value, note]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      <p className="scope">
        {report.start ? dayLabel(report.start) : 'Início disponível'} a{' '}
        {report.end ? dayLabel(report.end) : 'fim disponível'} · Fuso {report.offset} ·{' '}
        {report.outside} sessões fora do período no arquivo completo. Sobreposições contam uma vez
        por agente; saídas ausentes não geram duração presumida. Não comprova jornada ou trabalho
        contínuo.
      </p>
      {!!view.groups.length && (
        <div className="zoho-presence-charts">
          <section>
            <h4>Permanência por agente</h4>
            <p className="scope">
              Até 10 agentes no gráfico. Clique para conferir uma pessoa; o CSV mantém o recorte
              completo.
            </p>
            <Chart
              compact
              type="bars"
              title="Permanência por agente"
              items={view.groups
                .slice(0, 10)
                .map((row) => ({ label: row.agent, value: row.seconds }))}
              format={duration}
              onItemClick={(item) => setAgent(item.label)}
            />
          </section>
          <section>
            <h4>Evolução diária</h4>
            <p className="scope">
              Últimos 14 dias com sessão válida do recorte. A soma da equipe pode ultrapassar 24
              horas; dias sem registros não significam permanência zero.
            </p>
            {view.dailyLimited ? (
              <p>Selecione um período de até 366 dias para exibir a evolução.</p>
            ) : (
              <Chart
                compact
                type="bars"
                title="Permanência registrada por dia"
                items={view.daily.slice(-14).map((row) => ({
                  label: row.date,
                  displayLabel: dayLabel(row.date),
                  value: row.seconds,
                }))}
                format={duration}
              />
            )}
          </section>
        </div>
      )}
      {!view.groups.length && (
        <p role="status">
          Nenhuma sessão válida neste recorte. Confira os apontamentos e o período antes de
          interpretar a ausência de duração.
        </p>
      )}
      <TableScroll label="Permanência por agente">
        <SortableTable>
          <thead>
            <tr>
              <th>Agente informado</th>
              <th data-cell-type="number">Permanência</th>
              <th data-cell-type="number">Sessões</th>
              <th data-cell-type="number">Sobreposições</th>
              <th>Linhas CSV</th>
            </tr>
          </thead>
          <tbody>
            {view.groups.slice(0, 50).map((row) => (
              <tr key={row.agent}>
                <td>{row.agent}</td>
                <td data-sort={row.seconds}>{duration(row.seconds)}</td>
                <td>{row.sessions}</td>
                <td>{row.overlaps}</td>
                <td>{row.rows.length} linhas</td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </TableScroll>
      <p className="scope">
        Até 50 agentes por visualização. O CSV inclui todos os agentes, dias calculados, sessões e
        apontamentos do recorte. Nomes não são vinculados automaticamente aos responsáveis das OS.
      </p>
      <details open={showSessions} onToggle={(event) => setShowSessions(event.currentTarget.open)}>
        <summary>Sessões do recorte · {view.sessions.length}</summary>
        <p className="scope">
          Entradas e saídas recortadas pelo período; valores originais permanecem no CSV de origem.
          Mostrando até 50 sessões.
        </p>
        {showSessions && (
          <TableScroll label="Sessões de permanência">
            <SortableTable>
              <thead>
                <tr>
                  <th data-cell-type="number">Linha CSV</th>
                  <th>Agente</th>
                  <th>Entrada no recorte</th>
                  <th>Saída no recorte</th>
                </tr>
              </thead>
              <tbody>
                {view.sessions.slice(0, 50).map((row) => (
                  <tr key={row.sourceRow}>
                    <td>{row.sourceRow}</td>
                    <td>{row.agent}</td>
                    <td data-cell-type="text" data-sort={row.from}>
                      {stamp(row.from)}
                    </td>
                    <td data-cell-type="text" data-sort={row.until}>
                      {stamp(row.until)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </SortableTable>
          </TableScroll>
        )}
      </details>
      {!!view.issues.length && (
        <details>
          <summary>Registros para conferir · {view.issues.length}</summary>
          <TableScroll label="Conferência das sessões">
            <table>
              <thead>
                <tr>
                  <th>Linha CSV</th>
                  <th>Agente</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {view.issues.slice(0, 50).map((row, index) => (
                  <tr key={index}>
                    <td>{row.row}</td>
                    <td>{row.agent || 'Não identificado'}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </details>
      )}
    </div>
  );
}
