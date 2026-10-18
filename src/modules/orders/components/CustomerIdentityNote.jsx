import React from 'react';
import {
  customerIdentity,
  customerAnalysisIdentity,
  customerGroupingLabel,
  customerGroupingRule,
  formatCnpj,
} from '../domain/customerIdentity.js';
import { SortableTable } from '../../../components/SortableTable.jsx';
/** Conferência do cadastro no mesmo relatório de clientes, sem criar outro destino no menu. */
export function CustomerIdentityNote({ data }) {
  const hasCnpj = data.columns.some((c) => c.letter === 'C' && c.label === 'CNPJ para Cobrança');
  if (!hasCnpj)
    return (
      <p className="scope">
        Identificação por CNPJ indisponível: falta a coluna C · CNPJ para Cobrança. Agrupamento por
        nome original.
      </p>
    );
  const groups = new Map();
  for (const row of data.rows) {
    const item = customerIdentity(data, row);
    const key = item.cnpj || `sem-cnpj:${row.sourceRow}`;
    if (!groups.has(key))
      groups.set(key, {
        ...item,
        analysis: customerAnalysisIdentity(data, row),
        rows: [],
        names: new Set(),
      });
    const group = groups.get(key);
    group.rows.push(row.sourceRow);
    group.names.add(item.originalName);
  }
  const items = [...groups.values()];
  return (
    <details className="report-details">
      <summary>Conferir clientes e filiais por CNPJ</summary>
      <p className="scope">
        Agrupamento: {customerGroupingLabel(data)}. CNPJ completo da coluna C; AK não participa da
        identidade. Cada filial continua identificada na origem.{' '}
        {data.customerRegistry?.available
          ? `${data.customerRegistry.rows.length} registros lidos da aba ${data.customerRegistry.sheetName}; ${data.customerRegistry.issues.length} apontamentos no cadastro.`
          : 'Aba Base clientes não disponível nesta importação; os CNPJs permanecem separados com o nome da OS.'}
      </p>
      <p className="scope">
        Para reunir CNPJs ou nomes diferentes, adicione a coluna Cliente consolidado na aba Base
        clientes e preencha o mesmo nome de grupo para cada CNPJ correspondente. Reimporte a
        planilha para atualizar. Para manter uma filial separada, use um nome de grupo próprio.
        Nomes semelhantes e raízes de CNPJ não são usados para inferir grupos.
      </p>
      <p className="scope">{customerGroupingRule(data)}.</p>
      <div className="table-scroll">
        <SortableTable>
          <thead>
            <tr>
              <th>CNPJ do cliente/filial</th>
              <th>Identificação</th>
              <th>Cliente na análise</th>
              <th>Critério do agrupamento</th>
              <th>Nome original na OS</th>
              <th>Cadastro</th>
              <th>Linhas Base clientes</th>
              <th>Linhas OS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.cnpj || i}>
                <td>{item.cnpj ? formatCnpj(item.cnpj) : 'Não informado'}</td>
                <td>{item.label}</td>
                <td>{item.analysis.label}</td>
                <td>{item.analysis.groupingSource || 'CNPJ / filial original'}</td>
                <td>{[...item.names].join(' / ')}</td>
                <td>{item.status}</td>
                <td>{item.sourceRows.join(', ') || '—'}</td>
                <td>{item.rows.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
      {data.customerRegistry?.issues.length > 0 && (
        <p className="scope">
          Cadastro:{' '}
          {data.customerRegistry.issues
            .map((issue) => `${issue.row ? `Linha ${issue.row}: ` : ''}${issue.reason}`)
            .join(' ')}
        </p>
      )}
    </details>
  );
}
