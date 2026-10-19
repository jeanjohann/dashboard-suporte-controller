/** Contrato restrito do piloto: uma aba completa, apenas valores/formatação, sem credenciais ou metadados do Drive. */
export const googleOrdersLimits = { rows: 50000, columns: 200, bytes: 10 * 1024 * 1024 };

/** Recusa respostas incompletas ou grandes demais; nunca corta silenciosamente linhas/colunas. */
export function validateGoogleOrdersSnapshot(snapshot, kind = 'orders') {
  if (
    snapshot?.version !== 1 ||
    !(kind === 'operational' ? ['Equipamentos'] : ['OS 2025_26', 'OS 2025']).includes(
      snapshot.sheetName,
    ) ||
    !Number.isFinite(Date.parse(snapshot.readAt)) ||
    !Array.isArray(snapshot.rows) ||
    snapshot.rows.length < 2 ||
    snapshot.rows.length > googleOrdersLimits.rows
  )
    throw Error('A leitura do Google não contém uma aba completa no formato esperado.');
  for (const row of snapshot.rows) {
    if (!Array.isArray(row) || row.length > googleOrdersLimits.columns)
      throw Error('A leitura do Google excede o limite de colunas ou tem linhas inválidas.');
    for (const cell of row) {
      if (cell === null) continue;
      if (
        !cell ||
        !['s', 'n', 'b', 'e'].includes(cell.type) ||
        typeof cell.display !== 'string' ||
        typeof cell.format !== 'string' ||
        (cell.type === 'n' && (typeof cell.raw !== 'number' || !Number.isFinite(cell.raw))) ||
        (cell.type === 'b' && typeof cell.raw !== 'boolean') ||
        (['s', 'e'].includes(cell.type) && typeof cell.raw !== 'string')
      )
        throw Error('A leitura do Google contém uma célula inválida.');
    }
  }
  const headers = snapshot.rows[0];
  if (
    kind !== 'operational' &&
    (!headers[0]?.display.trim() ||
      !headers.some((cell) => cell?.display.trim() === 'Status') ||
      !headers.some((cell) => cell?.display.trim() === 'Data de atendimento'))
  )
    throw Error(
      'Confira o cabeçalho na primeira linha: número da OS, Status e Data de atendimento.',
    );
  return snapshot;
}
