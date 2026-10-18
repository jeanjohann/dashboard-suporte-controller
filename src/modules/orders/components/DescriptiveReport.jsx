/**
 * Interface de Ordens de Serviço: apresenta análises, contexto e registros de origem sem modificar a planilha.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { customerGroupingLabel, customerGroupingRule } from '../domain/customerIdentity.js';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { InfoNote } from '../../../components/InfoNote.jsx';
import React, { useState } from 'react';
import { Section } from '../../../components/Section.jsx';
import { SortableTable } from '../../../components/SortableTable.jsx';
import {
  descriptiveAnalyses,
  descriptiveHeaders,
  descriptiveReport,
  descriptiveValues,
  descriptiveCsv,
  descriptiveWorkbook,
  originalRows,
} from '../domain/descriptive.js';
import { csv, download } from '../../../shared/export/exports.js';
/** Permite selecionar indicadores e exportar resumo e atendimentos originais em XLSX ou CSV. */
export function DescriptiveReport({
  original,
  data,
  devices,
  lifecycle,
  filename,
  filters,
  referenceDate,
  visible,
}) {
  const [selection, setSelection] = useState(Object.keys(descriptiveAnalyses)),
    [error, setError] = useState('');
  const result = descriptiveReport(original, data, devices, lifecycle, selection),
    context = {
      filename,
      filters: {
        ...filters,
        agrupamentoClientes: customerGroupingLabel(data),
        criterioClientes: customerGroupingRule(data),
      },
      referenceDate,
    };
  function exportXlsx() {
    setError('');
    try {
      download(
        descriptiveWorkbook(result, data, context),
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'relatorio-descritivo-os.xlsx',
      );
    } catch (e) {
      setError('Não foi possível gerar o XLSX: ' + e.message);
    }
  }
  return (
    <Section title="Relatório descritivo" visible={visible} defaultOpen={false}>
      <InfoNote>
        Uma linha por grupo e indicador. Quantitativos e valores numéricos, unidades, base do
        percentual e descrição dos critérios. Segue os filtros da análise; a busca da tabela de
        atendimentos não altera este relatório.
      </InfoNote>
      <div className="preference-grid">
        {Object.entries(descriptiveAnalyses).map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={selection.includes(key)}
              onChange={(event) =>
                setSelection((previous) =>
                  event.target.checked
                    ? [...previous, key]
                    : previous.filter((item) => item !== key),
                )
              }
            />
            {label}
          </label>
        ))}
      </div>
      <p className="scope">
        {result.records.length.toLocaleString('pt-BR')} linhas no resumo ·{' '}
        {data.rows.length.toLocaleString('pt-BR')} atendimentos originais na seleção. Os originais
        incluem todos os status; cada indicador usa sua população elegível. Percentuais são
        exportados como fração: 0,1 = 10%. Base zero ou indisponível deixa percentual vazio. Médias
        e medianas não têm percentual de participação.
      </p>
      <div className="report-downloads">
        <PermissionButton action="export" disabled={!result.records.length} onClick={exportXlsx}>
          Baixar XLSX · resumo + atendimentos + critérios
        </PermissionButton>
        <PermissionButton
          action="export"
          disabled={!result.records.length}
          onClick={() =>
            download(
              descriptiveCsv(result, context),
              'text/csv;charset=utf-8',
              'relatorio-descritivo-os.csv',
            )
          }
        >
          Baixar resumo CSV
        </PermissionButton>
        <PermissionButton
          action="export"
          disabled={!data.rows.length}
          onClick={() =>
            download(
              csv(originalRows(data)),
              'text/csv;charset=utf-8',
              'atendimentos-filtrados.csv',
            )
          }
        >
          Baixar atendimentos CSV
        </PermissionButton>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {result.notes.map((note, i) => (
        <p className="scope" key={i}>
          {note}
        </p>
      ))}
      <InfoNote>
        Prévia das primeiras 200 linhas; os arquivos exportam todas as linhas do resumo. As linhas
        Excel indicam o contexto do grupo, que pode incluir registros fora de um indicador
        específico. Composição agrupada por cliente; duração agrupada por modelo identificado pelo
        prefixo do ID.
      </InfoNote>
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              {descriptiveHeaders.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.records.slice(0, 200).map((record, i) => (
              <tr key={i}>
                {descriptiveValues(record).map((cell, index) => (
                  <td key={index} data-sort={typeof cell === 'number' ? cell : undefined}>
                    {cell == null
                      ? '—'
                      : index === 7
                        ? (cell * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%'
                        : typeof cell === 'number'
                          ? cell.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                          : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
    </Section>
  );
}
