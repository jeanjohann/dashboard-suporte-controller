/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { PermissionButton } from '../../../shared/security/Access.jsx';
import React, { useState } from 'react';
import { technicianRanking } from '../domain/technicians.js';
import { Section } from '../../../components/Section.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import { Chart } from '../../../components/Chart.jsx';
import { csv, download } from '../../../shared/export/exports.js';
const currency = (value) =>
  (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const avg = (sum, count) => (count ? currency(sum / count) : '—');
/** Apresenta o ranking por código do técnico, nome e componentes de custo, com detalhamento de origem. */
export function Technicians({ data, visible }) {
  const [detail, setDetail] = useState(null);
  const result = technicianRanking(data);
  return (
    <Section title="Ranking de técnicos" visible={visible}>
      {!result ? (
        <p>Indisponível: faltam colunas necessárias.</p>
      ) : (
        <>
          <p className="scope">
            Somente realizados. Identificação pelo código; nomes diferentes no mesmo código aparecem
            juntos para conferência. {result.missingCode} realizados sem código válido excluídos.
            Médias usam os valores válidos de cada campo, incluindo zeros. Deslocamento quando
            cobrado usa apenas valores positivos. Volume não mede qualidade ou produtividade.
          </p>
          <Chart
            ranking
            title="Atendimentos realizados por técnico"
            items={result.items.map((item) => ({
              label: `${[...item.names].join(' / ') || 'Sem nome'} · ${item.code}`,
              value: item.attendances,
            }))}
          />
          <PermissionButton
            action="export"
            className="report-download"
            onClick={() =>
              download(
                csv([
                  [
                    'Código',
                    'Técnico',
                    'Realizados',
                    'Chamados',
                    'Custo total BRL',
                    'Linhas Excel',
                  ],
                  ...result.items.map((item) => [
                    item.code,
                    [...item.names].join(' / '),
                    item.attendances,
                    item.calls.size,
                    item.cost / 100,
                    item.rows.join(', '),
                  ]),
                ]),
                'text/csv;charset=utf-8',
                'ranking-tecnicos.csv',
              )
            }
          >
            Baixar ranking CSV
          </PermissionButton>
          <details className="report-details">
            <summary>Ver tabela completa de técnicos, custos e médias</summary>
            <div className="table-scroll">
              <SortableTable>
                <thead>
                  <tr>
                    {[
                      'Código',
                      'Técnico',
                      'Realizados',
                      'Chamados',
                      'Custo total',
                      'Serviço técnico',
                      'Deslocamento',
                      'Média total',
                      'Média técnico',
                      'Média deslocamento',
                      'Média desloc. cobrado',
                      'Exclusões total / técnico / desloc.',
                      'Origem',
                    ].map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.code}>
                      <td>{item.code}</td>
                      <td>{[...item.names].join(' / ') || 'Sem nome'}</td>
                      <td>{item.attendances}</td>
                      <td>{item.calls.size}</td>
                      <td>{currency(item.cost)}</td>
                      <td>{currency(item.technician)}</td>
                      <td>{currency(item.travel)}</td>
                      <td>{avg(item.cost, item.costCount)}</td>
                      <td>{avg(item.technician, item.technicianCount)}</td>
                      <td>{avg(item.travel, item.travelCount)}</td>
                      <td>{avg(item.chargedTravel, item.chargedCount)}</td>
                      <td>
                        {item.attendances - item.costCount} /{' '}
                        {item.attendances - item.technicianCount} /{' '}
                        {item.attendances - item.travelCount}
                      </td>
                      <td className="table-action-cell">
                        <button
                          type="button"
                          className="table-record-action"
                          onClick={() => setDetail(detail === item.code ? null : item.code)}
                        >
                          Conferir {item.rows.length} {item.rows.length === 1 ? 'linha' : 'linhas'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </SortableTable>
            </div>
          </details>
          {detail && (
            <p className="scope">
              Código {detail} · linhas Excel:{' '}
              {result.items.find((item) => item.code === detail)?.rows.join(', ')}
            </p>
          )}
        </>
      )}
    </Section>
  );
}
