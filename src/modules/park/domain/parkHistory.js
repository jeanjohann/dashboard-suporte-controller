/** Aprofundamento da mesma base vinculável do Parque; não cria novos vínculos nem infere falhas. */
import { attendanceDate, field } from '../../../shared/data/filters.js';
import { isUnproductive } from '../../orders/domain/attendanceKind.js';
import { validISODate } from '../../../shared/data/isoDate.js';
import { compareValues } from '../../../shared/data/sorting.js';

export const validParkDate = validISODate;

/** A ordenação da grade é aplicada antes de paginar e mantém ausências ao final. */
export function sortParkHistoryRows(rows, sort) {
  const values = (row) => [
    `${row.client || 'Não informado'} ${row.model || 'Modelo não informado'}`,
    `${row.serial} ${row.plate}`,
    row.effective,
    row.unproductive,
    row.last || null,
    row.days,
    row.state,
    row.sourceRow,
  ];
  return [...rows].sort(
    (a, b) =>
      (sort ? compareValues(values(a)[sort.index], values(b)[sort.index], sort.direction) : 0) ||
      a.sourceRow - b.sourceRow,
  );
}

/** Referência global dos realizados: filtros do parque não fazem o relógio recuar silenciosamente. */
export function parkHistoryReference(orders) {
  return (
    (orders?.rows || [])
      .filter((row) => ['Concluída', 'Pago'].includes(field(orders, row, 'Status')?.raw))
      .map((row) => attendanceDate(orders, row))
      .filter(Boolean)
      .sort()
      .at(-1) || ''
  );
}

export function parkHistory(result, orders, reference = parkHistoryReference(orders)) {
  const referenceValid = validParkDate(reference);
  const devices = result.eligible.map((row) => {
    const effective = row.services.filter((service) => !isUnproductive(orders, service));
    const dates = effective
      .map((service) => attendanceDate(orders, service))
      .filter(Boolean)
      .sort();
    const last = dates.at(-1) || '';
    const afterReference = Boolean(referenceValid && last && last > reference);
    const days =
      referenceValid && last && !afterReference
        ? Math.round((Date.parse(reference) - Date.parse(last)) / 86400000)
        : null;
    const state = !effective.length
      ? 'Sem intervenção efetiva no recorte'
      : !last
        ? 'Sem data válida'
        : !referenceValid
          ? 'Referência indisponível'
          : afterReference
            ? 'Posterior à referência'
            : 'Com data observada';
    return {
      ...row,
      effective: effective.length,
      unproductive: row.services.length - effective.length,
      undated: effective.length - dates.length,
      last,
      days,
      state,
      serviceRows: row.services.map((service) => service.sourceRow),
    };
  });
  const concentration = (key) => {
    const groups = new Map();
    for (const row of result.eligible) {
      const label = row[key] || 'Não informado';
      const item = groups.get(label) || { label, base: 0, records: new Set() };
      item.base++;
      row.assistance.forEach((service) => item.records.add(service.sourceRow));
      groups.set(label, item);
    }
    const items = [...groups.values()]
      .map(({ records, ...item }) => ({
        ...item,
        value: records.size,
        rows: [...records].sort((a, b) => a - b),
      }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'));
    return {
      items,
      topFive: result.assistance
        ? items.slice(0, 5).reduce((sum, item) => sum + item.value, 0) / result.assistance
        : null,
    };
  };
  const buckets = [
    ['Até 30 dias', (days) => days <= 30],
    ['31 a 90 dias', (days) => days > 30 && days <= 90],
    ['91 a 180 dias', (days) => days > 90 && days <= 180],
    ['Mais de 180 dias', (days) => days > 180],
  ].map(([label, test]) => ({
    label,
    value: devices.filter((row) => row.days != null && test(row.days)).length,
  }));
  return {
    devices,
    reference,
    referenceValid,
    clients: concentration('client'),
    models: concentration('model'),
    buckets,
    dated: devices.filter((row) => row.days != null).length,
    withoutEffective: devices.filter((row) => !row.effective).length,
    withoutDate: devices.filter((row) => row.effective && !row.last).length,
    future: devices.filter((row) => row.state === 'Posterior à referência').length,
  };
}
