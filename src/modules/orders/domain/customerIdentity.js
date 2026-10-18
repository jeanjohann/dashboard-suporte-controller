/** Identidade por CNPJ completo; cadastro local não altera nomes ou documentos da OS original. */
export function normalizeCnpj(cell) {
  if (
    !cell ||
    cell.issue ||
    cell.error ||
    (typeof cell.raw === 'number' && !Number.isSafeInteger(cell.raw))
  )
    return null;
  const text = String(cell.raw ?? '').trim();
  if (!/^[\d.\s/-]+$/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  return /^\d{14}$/.test(digits) && !/^(\d)\1{13}$/.test(digits) ? digits : null;
}
export function formatCnpj(value) {
  return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
/** Coluna C foi confirmada como cliente/filial; AK continua exclusivamente com seu papel original. */
export function customerIdentity(data, row) {
  if (!row)
    return {
      key: 'Sem cliente',
      label: 'Sem cliente',
      cnpj: null,
      status: 'Sem linha de origem',
      originalName: '',
      sourceRows: [],
    };
  const column = data.columns.findIndex(
    (c) => c.letter === 'C' && c.label === 'CNPJ para Cobrança',
  );
  const cnpj = column < 0 ? null : normalizeCnpj(row.cells[column]);
  const nameIndex = data.columns.findIndex((c) => c.label === 'Razão Social');
  const nameCell = row.cells[nameIndex];
  const originalName = !nameCell?.issue ? String(nameCell?.raw ?? '').trim() : '';
  if (!cnpj)
    return {
      key: originalName || 'Sem cliente',
      label: originalName || 'Sem cliente',
      cnpj: null,
      status: 'Sem CNPJ utilizável',
      originalName,
      sourceRows: [],
    };
  const entries = (data.customerRegistry?.rows || []).filter((r) => r.cnpj === cnpj);
  const names = [...new Set(entries.map((r) => r.name).filter(Boolean))];
  const status = !data.customerRegistry?.available
    ? 'Base clientes não disponível'
    : !entries.length
      ? 'Não encontrado na Base clientes'
      : names.length !== 1
        ? 'Cadastro divergente'
        : 'Identificado na Base clientes';
  const name =
    names.length === 1
      ? names[0]
      : names.length > 1
        ? 'Cadastro divergente'
        : originalName || 'Cliente sem nome';
  return {
    key: cnpj,
    label: `${name} · ${formatCnpj(cnpj)}`,
    cnpj,
    status,
    originalName,
    sourceRows: entries.map((r) => r.sourceRow),
  };
}

export function customerGroupingLabel(data) {
  return data.customerGrouping === 'consolidated' ? 'Cliente consolidado' : 'CNPJ / filial';
}

export function customerGroupingRule(data) {
  return data.customerGrouping !== 'consolidated'
    ? 'CNPJ completo da coluna C; sem CNPJ utilizável, nome original'
    : data.consolidateIdenticalNames
      ? 'Cliente consolidado explícito; sem preenchimento, razões sociais exatamente iguais na Base clientes'
      : 'Somente Cliente consolidado explícito na Base clientes; demais CNPJs separados';
}

/** Camada de apresentação: jamais substitui a identidade por CNPJ usada nos vínculos e ciclos. */
export function customerAnalysisIdentity(data, row) {
  const branch = customerIdentity(data, row);
  if (data.customerGrouping !== 'consolidated' || !branch.cnpj) return branch;
  const entries = (data.customerRegistry?.rows || []).filter((r) => r.cnpj === branch.cnpj);
  if (entries.some((r) => r.groupingInvalid)) return branch;
  const groups = [...new Set(entries.map((r) => r.group).filter(Boolean))];
  // Um cadastro contraditório ou parcialmente preenchido permanece separado para conferência.
  if (groups.length > 1 || (groups.length && entries.some((r) => !r.group))) return branch;
  if (groups.length === 1)
    return {
      ...branch,
      key: `group:${groups[0]}`,
      label: groups[0],
      groupingSource: 'Cadastro explícito',
    };
  const names = [...new Set(entries.map((r) => r.name).filter(Boolean))];
  if (data.consolidateIdenticalNames && names.length === 1)
    return {
      ...branch,
      key: `group:${names[0]}`,
      label: names[0],
      groupingSource: 'Razão social idêntica na Base clientes',
    };
  return branch;
}
