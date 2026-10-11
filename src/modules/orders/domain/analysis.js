/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
/** Converte uma célula monetária válida em centavos; ausência ou formato incompatível retorna null, nunca zero. */
export function money(cell) {
  if (!cell || cell.issue || cell.raw == null) return null;
  let value = cell.raw;
  if (typeof value === 'string') {
    const text = value.trim().replace(/^R\$\s*/, '');
    if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text)) return null;
    value = Number(text.replaceAll('.', '').replace(',', '.'));
  }
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round((value + Number.EPSILON) * 100)
    : null;
}

/** Totaliza somente serviços realizados. O custo total lançado é a referência; diferenças com técnico + deslocamento são sinalizadas. */
export function finance(data) {
  const index = (name) => data.columns.findIndex((col) => col.label === name);
  const fields = Object.fromEntries(
    ['Status', 'Km', 'Técnico', 'Custo Total', 'Cobrança', 'Valor a cobrar'].map((name) => [
      name,
      index(name),
    ]),
  );
  if (Object.values(fields).some((i) => i < 0)) return null;
  const totals = { cost: 0, travel: 0, technician: 0, client: 0, absorbed: 0 };
  const excluded = { cost: 0, travel: 0, technician: 0, contractual: 0 };
  const issues = [];
  let eligible = 0;
  for (const row of data.rows) {
    const cell = (name) => row.cells[fields[name]];
    if (!['Concluída', 'Pago'].includes(cell('Status')?.raw)) continue;
    eligible++;
    const cost = money(cell('Custo Total')),
      travel = money(cell('Km')),
      technician = money(cell('Técnico')),
      value = money(cell('Valor a cobrar'));
    for (const [key, amount] of Object.entries({ cost, travel, technician })) {
      if (amount == null) excluded[key]++;
      else totals[key] += amount;
    }
    const billing = cell('Cobrança')?.raw;
    if (value == null || !['Cliente', 'Addlog'].includes(billing)) excluded.contractual++;
    else totals[billing === 'Cliente' ? 'client' : 'absorbed'] += value;
    if (cost != null && travel != null && technician != null && cost !== travel + technician) {
      const column = data.columns[fields['Custo Total']];
      issues.push({
        address: `${column.letter}${row.sourceRow}`,
        column: 'Custo Total',
        value: cell('Custo Total').display,
        reason: `Divergência: Técnico + Km = ${((technician + travel) / 100).toFixed(2)}; total lançado mantido.`,
      });
    }
  }
  return { totals, excluded, issues, eligible };
}

/** Conta serviços por linha e chamados por número de OS, mantendo cancelamentos separados dos realizados. */
export function summarize(data) {
  const index = data.columns.findIndex((column) => column.label === 'Status');
  if (index < 0) return null;
  const calls = new Map();
  let completed = 0,
    canceled = 0,
    other = 0;
  for (const row of data.rows) {
    const status = row.cells[index]?.raw;
    const group =
      status === 'Pago' || status === 'Concluída'
        ? 'completed'
        : status === 'Cancelada'
          ? 'canceled'
          : 'other';
    if (group === 'completed') completed++;
    else if (group === 'canceled') canceled++;
    else other++;
    if (!calls.has(row.os))
      calls.set(row.os, { os: row.os, total: 0, completed: 0, canceled: 0, other: 0 });
    const call = calls.get(row.os);
    call.total++;
    call[group]++;
  }
  return {
    completed,
    canceled,
    other,
    canceledCalls: [...calls.values()].filter((call) => call.canceled > 0).length,
    calls: [...calls.values()],
  };
}
