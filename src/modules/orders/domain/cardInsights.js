import { isUnproductive } from './attendanceKind.js';
/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field } from '../../../shared/data/filters.js';
import { money } from './analysis.js';
import { customerAnalysisIdentity } from './customerIdentity.js';
const completed = (data, row) => ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw);
function groupRows(data, rows, label) {
  const map = new Map();
  for (const row of rows) {
    const identity = label === 'Razão Social' ? customerAnalysisIdentity(data, row) : null;
    const cell = field(data, row, label),
      name =
        label === 'Tipo de Serviço' && isUnproductive(data, row)
          ? 'Visita Improdutiva'
          : cell?.issue
            ? 'Valor com erro'
            : String(cell?.raw ?? '').trim() || 'Não informado';
    const key = identity?.key || name;
    let group = map.get(key);
    if (!group) {
      group = {
        label: identity?.label || name,
        identified: identity
          ? identity.key !== 'Sem cliente'
          : !cell?.issue && Boolean(String(cell?.raw ?? '').trim()),
        rows: [],
        costRows: [],
        costSum: 0,
      };
      map.set(key, group);
    }
    group.rows.push(row.sourceRow);
    const cost = money(field(data, row, 'Custo Total'));
    if (cost != null) {
      group.costSum += cost;
      group.costRows.push(row.sourceRow);
    }
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      value: g.rows.length,
      cost: g.costRows.length ? g.costSum : null,
      average: g.costRows.length ? g.costSum / g.costRows.length : null,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'));
}
/** Resume os motivos das manutenções realizadas e referencia as linhas que compõem cada grupo. */
export function maintenanceInsights(data) {
  if (
    !['Status', 'Tipo de Serviço', 'Razão Social'].every((label) =>
      data.columns.some((c) => c.label === label),
    )
  )
    return null;
  const rows = data.rows.filter(
      (row) =>
        completed(data, row) &&
        !isUnproductive(data, row) &&
        field(data, row, 'Tipo de Serviço')?.raw === 'Assistência Técnica',
    ),
    groups = groupRows(data, rows, 'Razão Social'),
    clients = groups.filter((g) => g.identified),
    valid = groups.flatMap((g) => g.costRows),
    sum = groups.reduce((s, g) => s + g.costSum, 0),
    leaders = clients.slice(0, 5);
  return {
    groups,
    clients: clients.length,
    total: rows.length,
    rows: rows.map((r) => r.sourceRow),
    unidentified: groups.filter((g) => !g.identified).reduce((s, g) => s + g.value, 0),
    topFiveShare: rows.length ? leaders.reduce((s, g) => s + g.value, 0) / rows.length : null,
    leader: clients[0] || null,
    cost: valid.length ? sum : null,
    average: valid.length ? sum / valid.length : null,
    costCount: valid.length,
  };
}
/** Compara a composição dos tipos de serviço no período atual e, quando disponível, no anterior. */
export function serviceProfile(data, previous = null) {
  if (!['Status', 'Tipo de Serviço'].every((label) => data.columns.some((c) => c.label === label)))
    return null;
  const current = groupRows(
      data,
      data.rows.filter((row) => completed(data, row)),
      'Tipo de Serviço',
    ),
    past = previous
      ? groupRows(
          previous,
          previous.rows.filter((row) => completed(previous, row)),
          'Tipo de Serviço',
        )
      : null,
    total = current.reduce((s, g) => s + g.value, 0);
  const all = new Map(current.map((g) => [g.label, g]));
  for (const g of past || [])
    if (!all.has(g.label))
      all.set(g.label, {
        label: g.label,
        value: 0,
        rows: [],
        costRows: [],
        cost: null,
        average: null,
      });
  return {
    total,
    items: [...all.values()]
      .map((g) => ({
        ...g,
        share: total ? g.value / total : null,
        previous: past ? past.find((p) => p.label === g.label)?.value || 0 : null,
        difference: past ? g.value - (past.find((p) => p.label === g.label)?.value || 0) : null,
      }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR')),
  };
}
