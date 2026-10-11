/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';
import { money } from './analysis.js';
import { trackerMotives } from './equipment.js';
import { trackerModel } from './trackerModels.js';
export const done = (data, row) => ['Pago', 'Concluída'].includes(field(data, row, 'Status')?.raw);
const value = (data, row, label) => {
  if (!row) return null;
  const cell = field(data, row, label);
  return cell?.issue || cell?.raw == null || cell.raw === '' ? null : String(cell.raw);
};
export const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
function amount() {
  return { sum: 0, count: 0 };
}
function add(metric, value) {
  if (value != null) {
    metric.sum += value;
    metric.count++;
  }
}
function financialGroup(label) {
  return {
    label,
    rows: [],
    calls: new Set(),
    cost: amount(),
    technician: amount(),
    travel: amount(),
    client: amount(),
    absorbed: amount(),
    addlogCost: amount(),
    composition: { technician: 0, travel: 0, count: 0 },
    share: { cost: 0, travel: 0, count: 0 },
  };
}
function addRow(group, data, row) {
  group.rows.push(row.sourceRow);
  group.calls.add(row.os);
  const cost = money(field(data, row, 'Custo Total')),
    tech = money(field(data, row, 'Técnico')),
    travel = money(field(data, row, 'Km')),
    charge = money(field(data, row, 'Valor a cobrar'));
  add(group.cost, cost);
  add(group.technician, tech);
  add(group.travel, travel);
  const billing = value(data, row, 'Cobrança');
  if (billing === 'Cliente') add(group.client, charge);
  if (billing === 'Addlog') {
    add(group.absorbed, charge);
    add(group.addlogCost, cost);
  }
  if (tech != null && travel != null) {
    group.composition.technician += tech;
    group.composition.travel += travel;
    group.composition.count++;
  }
  if (cost != null && travel != null) {
    group.share.cost += cost;
    group.share.travel += travel;
    group.share.count++;
  }
}
/** Agrupa custos e valores contratuais dos serviços realizados, mantendo os componentes e as exclusões separados. */
export function groupedCosts(data, groupBy = 'Razão Social') {
  if (
    !data.columns.some((col) => col.label === 'Status') ||
    !data.columns.some((col) => col.label === groupBy)
  )
    return null;
  const groups = new Map();
  for (const row of data.rows) {
    if (!done(data, row)) continue;
    const key = value(data, row, groupBy) || 'Sem dados';
    if (!groups.has(key)) groups.set(key, { ...financialGroup(key), names: new Set() });
    const group = groups.get(key);
    if (groupBy === 'Cód.') {
      group.names.add(value(data, row, 'Nome do Técnico') || 'Sem nome');
      group.label = key + ' · ' + [...group.names].join(' / ');
    }
    addRow(group, data, row);
  }
  return [...groups.values()];
}
/** Consolida linhas realizadas por número de chamado para estudar quantidade de serviços e custo acumulado. */
export function callInsights(data) {
  if (!data.columns.some((col) => col.label === 'Status')) return null;
  const groups = new Map();
  for (const row of data.rows)
    if (done(data, row)) {
      if (!groups.has(row.os)) groups.set(row.os, financialGroup(row.os));
      addRow(groups.get(row.os), data, row);
    }
  const items = [...groups.values()],
    distribution = new Map();
  for (const item of items) {
    const count = item.rows.length;
    distribution.set(count, (distribution.get(count) || 0) + 1);
  }
  return {
    items,
    multiple: items.filter((item) => item.rows.length > 1),
    distribution: [...distribution]
      .sort(([a], [b]) => a - b)
      .map(([count, value]) => ({ label: `${count} serviços realizados`, value })),
    average: items.length
      ? items.reduce((sum, item) => sum + item.rows.length, 0) / items.length
      : null,
  };
}
/** Agrupa visitas por cliente + placa + dia e mede retornos cumulativos em 30, 60 e 90 dias, sem inferir falha. */
export function recurringVisits(original, selected) {
  if (
    ['Status', 'Placa', 'Razão Social', 'Data de atendimento'].some(
      (label) => !original.columns.some((col) => col.label === label),
    )
  )
    return null;
  const selectedRows = new Set(selected.rows.map((row) => row.sourceRow)),
    groups = new Map();
  let missingIdentifier = 0,
    missingDate = 0;
  for (const row of original.rows) {
    if (!done(original, row)) continue;
    const plate = value(original, row, 'Placa'),
      client = value(original, row, 'Razão Social');
    if (!plate || !client) {
      if (selectedRows.has(row.sourceRow)) missingIdentifier++;
      continue;
    }
    const key = JSON.stringify([client, plate]);
    if (!groups.has(key))
      groups.set(key, {
        key,
        label: `${client} · ${plate}`,
        client,
        plate,
        rows: [],
        dates: new Map(),
        intervals: [],
      });
    const group = groups.get(key),
      date = attendanceDate(original, row);
    if (selectedRows.has(row.sourceRow)) {
      group.rows.push(row.sourceRow);
      if (!date) missingDate++;
    }
    if (date) {
      if (!group.dates.has(date)) group.dates.set(date, []);
      group.dates.get(date).push(row);
    }
  }
  const items = [];
  for (const group of groups.values()) {
    if (!group.rows.length) continue;
    const all = [...group.dates].sort(([a], [b]) => a.localeCompare(b));
    for (let i = 1; i < all.length; i++) {
      const [start, a] = all[i - 1],
        [end, b] = all[i];
      if (
        a.some((row) => selectedRows.has(row.sourceRow)) &&
        b.some((row) => selectedRows.has(row.sourceRow))
      )
        group.intervals.push({
          start,
          end,
          days: (Date.parse(end) - Date.parse(start)) / 86400000,
          rows: [...a, ...b]
            .filter((row) => selectedRows.has(row.sourceRow))
            .map((row) => row.sourceRow),
        });
    }
    group.visits = all
      .map(([date, rows]) => ({
        date,
        rows: rows.filter((row) => selectedRows.has(row.sourceRow)).map((row) => row.sourceRow),
      }))
      .filter((visit) => visit.rows.length);
    group.within30 = group.intervals.filter((item) => item.days <= 30).length;
    group.within60 = group.intervals.filter((item) => item.days <= 60).length;
    group.within90 = group.intervals.filter((item) => item.days <= 90).length;
    group.median = median(group.intervals.map((item) => item.days));
    items.push(group);
  }
  return { items, missingIdentifier, missingDate };
}
/** Distribui serviços realizados por categoria de intervenção e considera os eventos de troca identificados. */
export function interventionProfiles(data, devices) {
  if (
    ['Status', 'Razão Social', 'Tipo de Serviço', 'Motivo'].some(
      (label) => !data.columns.some((col) => col.label === label),
    )
  )
    return null;
  const groups = new Map(),
    source = new Map(data.rows.map((row) => [row.sourceRow, row]));
  const get = (row) => {
    const label = value(data, row, 'Razão Social') || 'Sem cliente';
    if (!groups.has(label))
      groups.set(label, {
        label,
        rows: [],
        implementation: 0,
        assistance: 0,
        removal: 0,
        trackers: 0,
        collector: 0,
        rfid: 0,
      });
    return groups.get(label);
  };
  for (const row of data.rows)
    if (done(data, row)) {
      const group = get(row);
      group.rows.push(row.sourceRow);
      const type = value(data, row, 'Tipo de Serviço');
      if (type === 'Implementação') group.implementation++;
      if (type === 'Assistência Técnica') group.assistance++;
      if (trackerMotives.removal.includes(value(data, row, 'Motivo'))) group.removal++;
    }
  for (const swap of devices?.swaps || []) {
    const row = source.get(swap.installationRow);
    if (row) get(row).trackers++;
  }
  for (const [category, key] of [
    ['Coletora', 'collector'],
    ['RFID', 'rfid'],
  ])
    for (const id of devices?.accessoryRows?.[category] || []) {
      const row = source.get(id);
      if (row) get(row)[key]++;
    }
  return [...groups.values()];
}
/** Compara duração dos ciclos observados por grupo, sem incluir períodos incompletos como retiradas confirmadas. */
export function durationInsights(data, lifecycle, groupBy = 'ID Rastreador') {
  if (
    lifecycle?.unavailable ||
    lifecycle?.invalidReference ||
    !data.columns.some((col) => col.label === groupBy)
  )
    return null;
  const source = new Map(data.rows.map((row) => [row.sourceRow, row])),
    groups = new Map(),
    closed = [],
    bins = [
      { label: 'Até 30 dias', value: 0 },
      { label: '31 a 90 dias', value: 0 },
      { label: '91 a 180 dias', value: 0 },
      { label: '181 a 365 dias', value: 0 },
      { label: 'Mais de 365 dias', value: 0 },
    ];
  let unknownModels = 0;
  for (const period of lifecycle.periods) {
    const row = source.get(period.installationRow),
      model = row ? trackerModel(field(data, row, 'ID Rastreador')) : null;
    if (!model) unknownModels++;
    const label =
      groupBy === 'ID Rastreador'
        ? model || 'Modelo não identificado pelo ID'
        : value(data, row, groupBy) || 'Sem dados';
    if (!groups.has(label))
      groups.set(label, { label, closed: [], open: [], motives: new Set(), rows: [] });
    const group = groups.get(label);
    group.rows.push(period.installationRow);
    if (period.removalRow != null) group.rows.push(period.removalRow);
    if (period.state === 'Encerrado') {
      group.closed.push(period);
      closed.push(period);
      group.motives.add(
        value(data, source.get(period.removalRow), 'Tipo de Serviço') || 'Sem dados',
      );
      bins[
        period.days <= 30
          ? 0
          : period.days <= 90
            ? 1
            : period.days <= 180
              ? 2
              : period.days <= 365
                ? 3
                : 4
      ].value++;
    } else group.open.push(period);
  }
  return {
    items: [...groups.values()].map((group) => ({
      ...group,
      median: median(group.closed.map((period) => period.days)),
    })),
    median: median(closed.map((period) => period.days)),
    closedCount: closed.length,
    openCount: lifecycle.periods.length - closed.length,
    unknownModels,
    bins,
  };
}
/** Relaciona volume e custos dos serviços realizados por mês de atendimento, preservando ausências e exclusões. */
export function monthlyCosts(data) {
  if (
    ['Status', 'Data de atendimento'].some(
      (label) => !data.columns.some((col) => col.label === label),
    )
  )
    return null;
  const groups = new Map();
  let missingDate = 0;
  for (const row of data.rows)
    if (done(data, row)) {
      const date = attendanceDate(data, row);
      if (!date) {
        missingDate++;
        continue;
      }
      const label = date.slice(0, 7);
      if (!groups.has(label)) groups.set(label, financialGroup(label));
      addRow(groups.get(label), data, row);
    }
  return {
    items: [...groups.values()].sort((a, b) => a.label.localeCompare(b.label)),
    missingDate,
  };
}
