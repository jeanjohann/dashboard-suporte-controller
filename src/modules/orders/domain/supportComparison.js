/** Comparação dos papéis do suporte, sem somar agendamentos e execuções como atendimentos únicos. */
export const supportSeries = [
  { key: 'scheduling', label: 'Agendamentos', role: 'Agendamento' },
  { key: 'execution', label: 'Execuções', role: 'Execução' },
];

/** Mantém cada recorte calculado por sua própria data; junta apenas os eixos dos gráficos. */
export function supportComparison(execution, scheduling, metric = 'productive') {
  if (!['productive', 'unproductive', 'visits'].includes(metric)) throw Error('Volume inválido.');
  const results = { execution, scheduling };
  const unavailable = [
    ...new Set(supportSeries.flatMap(({ key }) => results[key].unavailable || [])),
  ];
  if (unavailable.length) return { unavailable };
  const indexes = Object.fromEntries(
    supportSeries.map(({ key }) => [
      key,
      new Map(results[key].groups.map((group) => [group.label, group])),
    ]),
  );
  const names = new Set(
    supportSeries.flatMap(({ key }) => results[key].groups.map((group) => group.label)),
  );
  const groups = [...names]
    .map((label) => ({
      label,
      scheduling: indexes.scheduling.get(label)?.[metric] ?? 0,
      execution: indexes.execution.get(label)?.[metric] ?? 0,
    }))
    .sort(
      (a, b) =>
        Math.max(b.scheduling, b.execution) - Math.max(a.scheduling, a.execution) ||
        a.label.localeCompare(b.label, 'pt-BR'),
    );
  const periods = new Map();
  for (const { key } of supportSeries)
    for (const period of results[key].periods) {
      const entry = periods.get(period.label) || {
        label: period.label,
        scheduling: null,
        execution: null,
      };
      entry[key] = period.productive;
      periods.set(period.label, entry);
    }
  return {
    groups,
    periods: [...periods.values()].sort((a, b) => a.label.localeCompare(b.label)),
    // As linhas da tabela mantêm papel, participação, comparação anterior e origem próprios.
    entries: groups.flatMap(({ label }) =>
      supportSeries.flatMap(({ key }) => {
        const group = indexes[key].get(label);
        return group ? [{ ...group, roleKey: key, role: results[key].role }] : [];
      }),
    ),
  };
}
