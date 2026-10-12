import { isUnproductive } from '../../orders/domain/attendanceKind.js';
/**
 * Cruzamentos entre operacional e OS, com vínculo conservador, denominadores explícitos e linhas de origem.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import XLSX from 'xlsx';
import { field, attendanceDate, attendanceExtent } from '../../../shared/data/filters.js';
import { equipment } from '../../orders/domain/equipment.js';
import { validPlate } from '../../orders/domain/trackerReplacements.js';
import { csv } from '../../../shared/export/exports.js';

export const parkSections = [
  'Indicadores de manutenção do parque',
  'Manutenção por cliente e modelo',
  'Perfil das intervenções vinculadas',
  'Relatório do parque e atendimentos',
];
export const parkColumns = {
  withServices: 'Com atendimento realizado',
  withAssistance: 'Com assistência',
  services: 'Atendimentos realizados',
  assistance: 'Assistências',
  rate: 'Assistências por 100 registros',
  share: 'Fração com assistência',
  operationalRows: 'Linhas operacional',
  serviceRows: 'Linhas OS',
};
const labels = {
  client: 'Cliente operacional',
  model: 'Modelo operacional',
  plan: 'Plano operacional',
  status: 'Situação operacional',
};
/** Analisa intervenções no parque vinculável, com período, denominadores e exclusões explícitos. */
export function parkAnalysis(linked, orders, { start = '', end = '', group = 'client' } = {}) {
  const required = [
    'Status',
    'ID Rastreador',
    'Placa',
    'Tipo de Serviço',
    'Motivo',
    'Data de atendimento',
  ];
  const unavailable =
    !orders || required.some((label) => !orders.columns.some((c) => c.label === label));
  const invalidPeriod = Boolean(start && end && start > end),
    active = Boolean(start || end);
  const eligible = linked.filter(
    (row) =>
      ['Com histórico disponível', 'Sem atendimento no histórico disponível'].includes(row.state) &&
      /^\d+$/.test(row.serial) &&
      Number(row.serial) > 0 &&
      validPlate(row.plate) &&
      (typeof row.cells?.[59]?.raw !== 'number' || Number.isSafeInteger(row.cells[59].raw)),
  );
  const missingDates = new Set(),
    selectedServices = new Map();
  const byEquipment = eligible.map((row) => {
    const services = row.services.filter((service) => {
      if (!['Concluída', 'Pago'].includes(field(orders, service, 'Status')?.raw)) return false;
      const date = attendanceDate(orders, service);
      if (active && !date) {
        missingDates.add(service.sourceRow);
        return false;
      }
      return !invalidPeriod && (!start || date >= start) && (!end || date <= end);
    });
    services.forEach((service) => selectedServices.set(service.sourceRow, service));
    return {
      ...row,
      services,
      assistance: services.filter(
        (service) =>
          !isUnproductive(orders, service) &&
          field(orders, service, 'Tipo de Serviço')?.raw === 'Assistência Técnica',
      ),
    };
  });
  const services = [...selectedServices.values()].sort((a, b) => a.sourceRow - b.sourceRow);
  const selected = orders ? { ...orders, rows: services } : null;
  const devices = !unavailable ? equipment(orders, selected) : null;
  // A replacement is identified in the whole OS file. Both rows must meet the period,
  // but only one of its serials may be present in the operational snapshot.
  const inPeriod = (row) => {
    const date = attendanceDate(orders, row);
    return !invalidPeriod && (!start || (date && date >= start)) && (!end || (date && date <= end));
  };
  const periodData = orders ? { ...orders, rows: orders.rows.filter(inPeriod) } : null;
  const allPairs = !unavailable ? equipment(orders, periodData).swaps : [];
  const ids = new Set(services.map((row) => row.sourceRow));
  const swaps = allPairs.filter((pair) => pair.rows.some((id) => ids.has(id)));
  const visits = new Map(),
    recurringAvailable = Boolean(orders?.columns.some((col) => col.label === 'Razão Social'));
  for (const service of services) {
    const date = attendanceDate(orders, service),
      client = field(orders, service, 'Razão Social')?.raw,
      plate = field(orders, service, 'Placa')?.raw;
    if (!date || !client || !plate) continue;
    const key = JSON.stringify([String(client), String(plate)]);
    const dates = visits.get(key) || new Set();
    dates.add(date);
    visits.set(key, dates);
  }
  let recurringVehicles = 0,
    intervals = 0;
  const returns = { 30: 0, 60: 0, 90: 0 };
  for (const dates of visits.values()) {
    const sorted = [...dates].sort();
    if (sorted.length > 1) recurringVehicles++;
    for (let i = 1; i < sorted.length; i++) {
      intervals++;
      const days =
        (Date.parse(sorted[i] + 'T00:00:00Z') - Date.parse(sorted[i - 1] + 'T00:00:00Z')) /
        86400000;
      for (const limit of [30, 60, 90]) if (days <= limit) returns[limit]++;
    }
  }
  const groups = new Map();
  for (const row of byEquipment) {
    const label = row[group] || 'Não informado',
      item = groups.get(label) || {
        label,
        base: 0,
        withServices: 0,
        withAssistance: 0,
        services: 0,
        assistance: 0,
        operationalRows: [],
        serviceRows: new Set(),
      };
    item.base++;
    item.withServices += Boolean(row.services.length);
    item.withAssistance += Boolean(row.assistance.length);
    item.services += row.services.length;
    item.assistance += row.assistance.length;
    item.operationalRows.push(row.sourceRow);
    row.services.forEach((s) => item.serviceRows.add(s.sourceRow));
    groups.set(label, item);
  }
  const items = [...groups.values()]
    .map((item) => ({
      ...item,
      rate: item.base ? (item.assistance / item.base) * 100 : null,
      share: item.base ? item.withAssistance / item.base : null,
      serviceRows: [...item.serviceRows].sort((a, b) => a - b),
    }))
    .sort((a, b) => b.assistance - a.assistance || a.label.localeCompare(b.label, 'pt-BR'));
  const categories = new Map();
  for (const service of services) {
    const label = isUnproductive(orders, service)
        ? 'Visita Improdutiva'
        : String(field(orders, service, 'Tipo de Serviço')?.raw || 'Não informado'),
      item = categories.get(label) || { label, value: 0, rows: [] };
    item.value++;
    item.rows.push(service.sourceRow);
    categories.set(label, item);
  }
  const assistance = services.filter(
    (row) =>
      !isUnproductive(orders, row) &&
      field(orders, row, 'Tipo de Serviço')?.raw === 'Assistência Técnica',
  );
  return {
    unavailable,
    invalidPeriod,
    linked,
    eligible: byEquipment,
    services,
    items,
    group,
    base: eligible.length,
    total: linked.length,
    withServices: byEquipment.filter((r) => r.services.length).length,
    withAssistance: byEquipment.filter((r) => r.assistance.length).length,
    assistance: assistance.length,
    rate: eligible.length ? (assistance.length / eligible.length) * 100 : null,
    share: eligible.length
      ? byEquipment.filter((r) => r.assistance.length).length / eligible.length
      : null,
    missingDates: missingDates.size,
    undated: services.filter((row) => !attendanceDate(orders, row)).length,
    period: orders ? attendanceExtent(selected) : null,
    categories: [...categories.values()].sort((a, b) => b.value - a.value),
    swaps,
    devices,
    recurringAvailable,
    recurringVehicles: recurringAvailable ? recurringVehicles : null,
    visits: visits.size,
    intervals,
    returns,
  };
}

/** Monta critérios, indicadores e resumo tabular para exportar os cruzamentos de Parque e Manutenção. */
export function parkReportTables(result, operational, orders, context = {}) {
  const columns = Object.keys(parkColumns).filter(
    (key) => !Array.isArray(context.columns) || context.columns.includes(key),
  );
  const groupHeader = [
    labels[result.group],
    'Base vinculável',
    ...columns.map((key) => parkColumns[key]),
  ];
  const summary = [
    groupHeader,
    ...result.items.map((g) => [
      g.label,
      g.base,
      ...columns.map((key) => (Array.isArray(g[key]) ? g[key].join(', ') : g[key])),
    ]),
  ];
  const criteria = [
    ['Campo', 'Valor'],
    ['Arquivo operacional', context.operationalFilename || ''],
    ['Arquivo OS', context.ordersFilename || ''],
    ['Filtros', JSON.stringify(context.filters || {})],
    ['Período inicial', context.start || 'Sem limite'],
    ['Período final', context.end || 'Sem limite'],
    ['Agrupamento', labels[result.group]],
    [
      'Base',
      'Registros operacionais selecionados com par serial + placa válido e sem ambiguidade; inclui registros sem atendimento no histórico disponível.',
    ],
    [
      'Taxa',
      'Assistências realizadas vinculadas / base vinculável × 100. Pode superar 100; não é percentual de falha ou taxa histórica do parque.',
    ],
    [
      'Percentual',
      'Registros com ao menos uma assistência / base vinculável. Fração 0,1 corresponde a 10%.',
    ],
    [
      'Histórico',
      'Operacional é fotografia do parque e OS têm histórico limitado. Ausência nas OS não é divergência. Situação operacional inclui todos os status selecionados; não é parque ativo calculado.',
    ],
    [
      'Titularidade',
      'Agrupamento utiliza cliente/modelo/plano do operacional atual, sem confirmar o cliente ou contrato à época do serviço.',
    ],
    ['Realizados', 'Somente Concluída ou Pago; Cancelada excluída.'],
    [
      'Datas',
      `${result.missingDates} realizados excluídos por falta de data com período ativo; ${result.undated} realizados sem data incluídos quando não há limite de período.`,
    ],
    [
      'Retornos',
      'Cliente + placa da OS; serviços do mesmo dia são uma visita. Intervalos entre visitas consecutivas dentro da seleção; 30/60/90 dias cumulativos. Não afirma falha.',
    ],
    [
      'Trocas',
      'Critérios existentes do módulo OS; pares de rastreador identificados no arquivo completo, ambas as linhas no período, ao menos uma vinculada ao parque. Contados uma vez globalmente.',
    ],
    [
      'Custos',
      'Não atribui custos ou faturamento ao contrato atual. Regras financeiras e de titularidade pendentes.',
    ],
  ];
  const sources = new Set(result.linked.map((r) => r.sourceRow)),
    opRows = operational.rows.filter((r) => sources.has(r.sourceRow));
  const original = [
    ['Linha Excel', ...operational.columns.map((c) => c.letter + ' · ' + c.label)],
    ...opRows.map((r) => [r.sourceRow, ...r.cells.map((c) => c.raw ?? '')]),
  ];
  const serviceIds = new Set([
    ...result.services.map((row) => row.sourceRow),
    ...result.swaps.flatMap((pair) => pair.rows),
  ]);
  const serviceRows = [
    ['Linha Excel', ...orders.columns.map((c) => c.letter + ' · ' + c.label)],
    ...orders.rows
      .filter((row) => serviceIds.has(row.sourceRow))
      .map((r) => [r.sourceRow, ...r.cells.map((c) => c.raw ?? '')]),
  ];
  criteria.push([
    'Originais OS',
    'Inclui serviços vinculados e, para auditar trocas de rastreador, a contraparte do par mesmo quando seu serial não está no parque. Essa contraparte não aumenta atendimentos, assistências ou taxas.',
  ]);
  criteria.push(['Colunas do resumo', groupHeader.join(' | ')]);
  const indicators = [
    ['Indicador', 'Valor', 'Unidade'],
    ['Base vinculável', result.base, 'registros'],
    ['Com assistência', result.withAssistance, 'registros'],
    ['Assistências realizadas', result.assistance, 'serviços'],
    ['Assistências por 100 registros', result.rate, 'por 100'],
    [
      'Trocas de rastreador',
      result.devices?.trackerAvailable ? result.swaps.length : null,
      'eventos',
    ],
    [
      'Trocas de Coletora',
      result.devices?.accessoryAvailable ? result.devices.accessories.Coletora : null,
      'serviços',
    ],
    [
      'Trocas de RFID',
      result.devices?.accessoryAvailable ? result.devices.accessories.RFID : null,
      'serviços',
    ],
    ['Veículos com várias visitas', result.recurringVehicles, 'cliente + placa'],
    ...Object.entries(result.returns).map(([days, value]) => [
      'Retornos em até ' + days + ' dias',
      result.recurringAvailable ? value : null,
      'intervalos',
    ]),
  ];
  return { summary, criteria, original, serviceRows, indicators };
}
/** Serializa critérios e indicadores do cruzamento em CSV, mantendo o contexto da análise. */
export function parkReportCsv(tables) {
  return csv([...tables.criteria, [], ...tables.indicators, [], ...tables.summary]);
}
/** Gera o XLSX do cruzamento com contexto e bases originais opcionais para conferência. */
export function parkReportWorkbook(tables, operational, orders, { includeOriginal = true } = {}) {
  const book = XLSX.utils.book_new();
  const append = (rows, name) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = rows[0].map((_, i) => ({ wch: i === 0 ? 38 : 24 }));
    sheet['!autofilter'] = { ref: sheet['!ref'] };
    XLSX.utils.book_append_sheet(book, sheet, name);
    return sheet;
  };
  const summary = append(tables.summary, 'Resumo');
  for (let r = 1; r < tables.summary.length; r++) {
    for (const label of [parkColumns.rate, parkColumns.share]) {
      const c = tables.summary[0].indexOf(label);
      if (c < 0) continue;
      const cell = summary[XLSX.utils.encode_cell({ r, c })];
      if (cell) cell.z = label === parkColumns.share ? '0.00%' : '0.00';
    }
  }
  append(tables.indicators, 'Indicadores');
  const criteria = append(tables.criteria, 'Critérios');
  criteria['!cols'] = [{ wch: 25 }, { wch: 110 }];
  // Convert date serials to original displayed text when epochs of the sources differ.
  // IDs remain original text; never let Excel interpret them as formulas or numbers.
  if (includeOriginal) {
    for (const [rows, data, name] of [
      [tables.original, operational, 'Operacional original'],
      [tables.serviceRows, orders, 'OS realizadas'],
    ]) {
      const sheet = append(rows, name);
      const originals = new Map(data.rows.map((r) => [r.sourceRow, r]));
      for (let r = 1; r < rows.length; r++) {
        const source = originals.get(rows[r][0]);
        source?.cells.forEach((cell, index) => {
          if (typeof cell.raw === 'number' && /^\d{2}\/\d{2}\/\d{4}/.test(String(cell.display))) {
            sheet[XLSX.utils.encode_cell({ r, c: index + 1 })] = {
              t: 's',
              v: String(cell.display),
            };
          }
        });
      }
    }
  }
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
