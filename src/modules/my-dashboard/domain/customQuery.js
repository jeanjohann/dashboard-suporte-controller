import { field, attendanceDate } from '../../../shared/data/filters.js';
import { money } from '../../orders/domain/analysis.js';
import { isUnproductive } from '../../orders/domain/attendanceKind.js';
import { linkOperational } from '../../operational/domain/operational.js';

export const queryGroups = {
  orders: [
    'none',
    'month',
    'Razão Social',
    'Resp. Execução',
    'Resp. Agendamento',
    'Tipo de Serviço',
    'Motivo',
    'Status',
    'Placa',
    'Nome do Técnico',
    'Cidade',
    'UF',
  ],
  operational: ['none', 'client', 'model', 'status', 'plan', 'plate'],
};
export const queryLabels = {
  none: 'Sem agrupamento',
  month: 'Mês do atendimento',
  client: 'Cliente',
  model: 'Modelo pelo serial',
  status: 'Situação',
  plan: 'Plano',
  plate: 'Placa',
  rows: 'Quantidade de registros',
  calls: 'Chamados distintos',
  vehicles: 'Placas distintas',
  serials: 'Seriais distintos',
  sumCost: 'Soma do custo total',
  meanCost: 'Média do custo total válido',
  sumMonthly: 'Soma da mensalidade',
  meanMonthly: 'Média da mensalidade válida',
};
export const queryMeasures = {
  orders: ['rows', 'calls', 'vehicles', 'serials', 'sumCost', 'meanCost'],
  operational: ['rows', 'vehicles', 'serials', 'sumMonthly', 'meanMonthly'],
};
export const defaultQuery = (module) => ({
  group: module === 'orders' ? 'Motivo' : 'model',
  measure: 'rows',
  scope: module === 'orders' ? 'performed' : 'all',
});
export function validQuery(module, query) {
  return (
    query &&
    Object.keys(query).length === 3 &&
    Object.keys(query).every((key) => ['group', 'measure', 'scope'].includes(key)) &&
    queryGroups[module]?.includes(query.group) &&
    queryMeasures[module]?.includes(query.measure) &&
    (module === 'orders'
      ? ['all', 'performed', 'productive'].includes(query.scope)
      : query.scope === 'all')
  );
}
export const queryUnit = (query) => (/Cost|Monthly/.test(query.measure) ? 'money' : 'count');

/** Cálculos locais sobre campos aprovados; campos ausentes nunca viram zeros. */
export function evaluateCustomQuery(module, data, query, filters = {}) {
  if (!validQuery(module, query)) throw Error('Configuração da análise personalizada inválida.');
  const orders = module === 'orders';
  const needed = orders
    ? [
        ...(query.scope !== 'all' ? ['Status'] : []),
        ...(query.scope === 'productive' ? ['Motivo'] : []),
        ...(!['none', 'month'].includes(query.group) ? [query.group] : []),
        ...(query.group === 'month' || filters.start || filters.end ? ['Data de atendimento'] : []),
        ...(filters.client ? ['Razão Social'] : []),
        ...(['sumCost', 'meanCost'].includes(query.measure) ? ['Custo Total'] : []),
        ...(query.measure === 'vehicles'
          ? ['Placa']
          : query.measure === 'serials'
            ? ['ID Rastreador']
            : []),
      ]
    : [];
  if (needed.some((name) => !data.columns.some((column) => column.label === name)))
    throw Error('A fonte não possui todos os campos necessários para esta análise.');
  let excludedDates = 0;
  const text = (row, name) => {
    const cell = field(data, row, name);
    return !cell || cell.issue ? '' : String(cell.raw ?? '').trim();
  };
  const rows = (orders ? data.rows : linkOperational(data, null)).filter((row) => {
    if (!orders)
      return (
        (!filters.client || row.client === filters.client) &&
        (!filters.model || row.model === filters.model)
      );
    if (filters.client && text(row, 'Razão Social') !== filters.client) return false;
    if (query.scope !== 'all' && !['Concluída', 'Pago'].includes(text(row, 'Status'))) return false;
    if (query.scope === 'productive' && isUnproductive(data, row)) return false;
    const date = attendanceDate(data, row);
    if ((filters.start || filters.end || query.group === 'month') && !date) {
      excludedDates++;
      return false;
    }
    return (!filters.start || date >= filters.start) && (!filters.end || date <= filters.end);
  });
  const groups = new Map();
  for (const row of rows) {
    const label =
      query.group === 'none'
        ? 'Total da seleção'
        : orders
          ? query.group === 'month'
            ? attendanceDate(data, row).slice(0, 7)
            : text(row, query.group) || 'Não informado'
          : row[query.group] || 'Não informado';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(row);
  }
  if (query.group === 'none' && !groups.size) groups.set('Total da seleção', []);
  const series = [...groups]
    .map(([label, records]) => {
      const values = records
        .map((row) =>
          query.measure === 'rows'
            ? 1
            : query.measure === 'calls'
              ? String(row.os ?? '').trim() || null
              : query.measure === 'vehicles'
                ? (orders ? text(row, 'Placa') : row.plate) || null
                : query.measure === 'serials'
                  ? (orders ? text(row, 'ID Rastreador') : row.serial) || null
                  : orders
                    ? money(field(data, row, 'Custo Total'))
                    : (row.monthlyCents ?? null),
        )
        .filter((value) => value != null);
      const distinct = ['calls', 'vehicles', 'serials'].includes(query.measure);
      const numeric = queryUnit(query) === 'money';
      const sum = numeric ? values.reduce((total, value) => total + value, 0) : 0;
      return {
        label,
        value: numeric
          ? values.length
            ? query.measure.startsWith('mean')
              ? sum / values.length
              : sum
            : null
          : distinct
            ? new Set(values).size
            : records.length,
        valid: values.length,
        excluded: records.length - values.length,
        rows: records.map((row) => row.sourceRow),
      };
    })
    .sort((a, b) =>
      query.group === 'month'
        ? a.label.localeCompare(b.label)
        : (b.value ?? -Infinity) - (a.value ?? -Infinity) ||
          a.label.localeCompare(b.label, 'pt-BR'),
    );
  return {
    unit: queryUnit(query),
    value: query.group === 'none' ? series[0].value : null,
    series: query.group === 'none' ? null : series,
    queryAudit: series,
    chronological: query.group === 'month',
    period: orders
      ? `${filters.start || 'Início disponível'} a ${filters.end || 'fim disponível'}`
      : 'Retrato da base operacional carregada',
    note: `${queryLabels[query.measure]} por ${queryLabels[query.group] || query.group}. ${orders ? `Escopo: ${query.scope === 'all' ? 'todos os status' : query.scope === 'productive' ? 'Concluída/Pago sem visitas improdutivas' : 'Concluída/Pago'}.` : 'Uma linha operacional é um registro, não necessariamente um equipamento único.'} ${excludedDates} registros sem data válida excluídos pelo recorte temporal. Valores financeiros usam somente células válidas, incluindo zeros; somas são por registro, não por chamado. Distintos são calculados dentro de cada grupo e não devem ser somados entre grupos. Ausência de valor financeiro válido aparece como indisponível.`,
  };
}
