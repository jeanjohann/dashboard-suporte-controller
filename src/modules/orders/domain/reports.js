/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';
import { money } from './analysis.js';

export const groupings = [
  'Mês',
  'Razão Social',
  'Nome do Técnico',
  'UF',
  'Tipo de Serviço',
  'Motivo',
  'Status',
];
export const measures = {
  attendances: 'Atendimentos realizados',
  calls: 'Chamados distintos com realizados',
  cost: 'Custo total realizado',
  travel: 'Deslocamento realizado',
  client: 'Valor contratual · Cliente',
  absorbed: 'Valor contratual · Addlog',
};
/** Agrupa a medida escolhida mantendo os critérios de realização, a unidade e os registros que sustentam os valores. */
export function report(data, grouping, measure) {
  const required = [
    'Status',
    ...(grouping === 'Mês' ? ['Data de atendimento'] : [grouping]),
    ...(measure === 'cost'
      ? ['Custo Total']
      : measure === 'travel'
        ? ['Km']
        : ['client', 'absorbed'].includes(measure)
          ? ['Cobrança', 'Valor a cobrar']
          : []),
  ];
  if (required.some((name) => !data.columns.some((col) => col.label === name)))
    return { unavailable: true, items: [], excluded: 0, eligible: 0 };
  const groups = new Map();
  let excluded = 0,
    eligible = 0;
  for (const row of data.rows) {
    if (!['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw)) continue;
    if (
      ['client', 'absorbed'].includes(measure) &&
      field(data, row, 'Cobrança')?.raw !== (measure === 'client' ? 'Cliente' : 'Addlog')
    )
      continue;
    eligible++;
    const cell = grouping === 'Mês' ? null : field(data, row, grouping);
    const key =
      grouping === 'Mês'
        ? attendanceDate(data, row)?.slice(0, 7)
        : cell?.issue
          ? null
          : String(cell?.raw ?? '');
    const amount =
      measure === 'cost'
        ? money(field(data, row, 'Custo Total'))
        : measure === 'travel'
          ? money(field(data, row, 'Km'))
          : ['client', 'absorbed'].includes(measure)
            ? money(field(data, row, 'Valor a cobrar'))
            : 1;
    if (!key || amount == null) {
      excluded++;
      continue;
    }
    if (!groups.has(key)) groups.set(key, { label: key, value: 0, calls: new Set(), rows: [] });
    const group = groups.get(key);
    group.rows.push(row.sourceRow);
    group.calls.add(row.os);
    group.value += amount;
  }
  const items = [...groups.values()].map((group) => ({
    label: group.label,
    value: measure === 'calls' ? group.calls.size : group.value,
    rows: group.rows,
  }));
  items.sort(
    grouping === 'Mês'
      ? (a, b) => a.label.localeCompare(b.label)
      : (a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'),
  );
  return { items, excluded, eligible, unavailable: false };
}
/** Seleciona intervenções por placa ou serial e apresenta a sequência com suas referências originais. */
export function history(data, kind, value) {
  if (!value) return [];
  return data.rows
    .filter((row) => String(field(data, row, kind)?.raw ?? '') === value)
    .map((row) => ({ row, date: attendanceDate(data, row) }))
    .sort((a, b) =>
      a.date && b.date
        ? a.date.localeCompare(b.date) || a.row.sourceRow - b.row.sourceRow
        : a.date
          ? -1
          : b.date
            ? 1
            : a.row.sourceRow - b.row.sourceRow,
    );
}
