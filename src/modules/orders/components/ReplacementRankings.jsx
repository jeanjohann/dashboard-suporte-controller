import React, { useState, useContext, useEffect } from 'react';
import { replacementRankings } from '../domain/replacementRankings.js';
import { Chart } from '../../../components/Chart.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { PrintContext } from '../../../components/Section.jsx';
import { csv, download } from '../../../shared/export/exports.js';
import { RecordDetails } from './RecordDetails.jsx';
/** Rankings complementam o relatório existente; o detalhe conserva cada substituição e suas origens. */
export function ReplacementRankings({ data, events }) {
  const [by, setBy] = useState('vehicle'),
    [chosen, setChosen] = useState(''),
    [detail, setDetail] = useState(null);
  const context = useContext(PrintContext);
  useEffect(() => {
    setChosen('');
    setDetail(null);
  }, [data]);
  const result = replacementRankings(events, by);
  const selected = result.groups.find((group) => group.key === chosen);
  const details =
    selected?.events ||
    [...events].sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.rows[0] - b.rows[0]);
  return (
    <details className="report-details">
      <summary>Veículos e clientes com mais trocas · {events.length} ocorrências</summary>
      <label>
        Agrupar trocas por{' '}
        <select
          aria-label="Agrupamento do ranking de trocas"
          value={by}
          onChange={(e) => {
            setBy(e.target.value);
            setChosen('');
            setDetail(null);
          }}
        >
          <option value="vehicle">Cliente e placa</option>
          <option value="client">Cliente / filial</option>
        </select>
      </label>
      <p className="scope">
        Uma ocorrência por troca de rastreador/kit ou linha de troca de acessório.{' '}
        {result.unidentified} sem identificação suficiente ficam fora do ranking, mas permanecem no
        detalhe completo. Quantidade não mede taxa de falha: tamanho da frota e tempo de
        acompanhamento podem diferir.
      </p>
      <Chart
        title={by === 'vehicle' ? 'Veículos com mais trocas' : 'Clientes com mais trocas'}
        ranking
        compact
        items={result.groups}
        onItemClick={(item) =>
          setChosen(result.groups.find((group) => group.label === item.label)?.key || '')
        }
      />
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              <th>{by === 'vehicle' ? 'Cliente e placa' : 'Cliente / filial'}</th>
              <th>Ocorrências</th>
              <th>Rastreador/kit</th>
              <th>Coletora</th>
              <th>RFID</th>
              <th>Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {result.groups.map((group) => (
              <tr key={group.key}>
                <td>{group.label}</td>
                <td>{group.value}</td>
                <td>{group.trackers}</td>
                <td>{group.collector}</td>
                <td>{group.rfid}</td>
                <td>
                  <button onClick={() => setChosen(group.key)}>Conferir trocas</button>
                </td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
      <h3>{selected ? `Trocas de ${selected.label}` : 'Todas as trocas da seleção'}</h3>
      {selected && <button onClick={() => setChosen('')}>Mostrar todas as trocas</button>}
      <PermissionButton
        action="export"
        onClick={() =>
          download(
            csv([
              ['Arquivo', context.filename || ''],
              ['Filtros', JSON.stringify(context.filters || {})],
              ['Grupo', selected?.label || 'Todos'],
              [
                'Regra',
                'Ocorrências de troca, não quantidade física de equipamentos ou taxa de falha',
              ],
              [],
              [
                'Cliente / filial',
                'Placa',
                'Chamado',
                'Data',
                'Categoria',
                'Substituição / instruções',
                'Linhas Excel',
              ],
              ...details.map((e) => [
                e.client,
                e.plate,
                e.os,
                e.date,
                e.category,
                e.description,
                e.rows.join(', '),
              ]),
            ]),
            'text/csv;charset=utf-8',
            'trocas-por-cliente-veiculo.csv',
          )
        }
      >
        Exportar trocas CSV
      </PermissionButton>
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              <th>Cliente / filial</th>
              <th>Placa</th>
              <th>Chamado</th>
              <th>Data</th>
              <th>Categoria</th>
              <th>Substituição / instruções</th>
              <th>Linhas Excel</th>
            </tr>
          </thead>
          <tbody>
            {details.map((event) => (
              <tr key={event.key}>
                <td>{event.client}</td>
                <td>{event.plate || 'Não informada'}</td>
                <td>{event.os}</td>
                <td>{event.date?.split('-').reverse().join('/') || 'Sem data válida'}</td>
                <td>{event.category}</td>
                <td>{event.description}</td>
                <td>
                  <button onClick={() => setDetail(event)}>
                    Conferir linhas {event.rows.join(', ')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
      {detail && details.some((event) => event.key === detail.key) && (
        <RecordDetails
          data={data}
          rows={detail.rows}
          title={`Originais da troca · ${detail.os} · ${detail.category}`}
          compact
          onClose={() => setDetail(null)}
        />
      )}
    </details>
  );
}
