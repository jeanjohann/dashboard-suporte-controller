/** Arbitragem de observações normalizadas. Preparação interna: não consulta APIs nem grava o histórico. */
import { validISODate } from '../../../shared/data/isoDate.js';

const operators = ['Arqia', 'Kore'];
const keyFor = (source) =>
  JSON.stringify([
    source.operator,
    source.accountKey,
    source.periodBasis,
    source.start,
    source.end,
  ]);
const validInstant = (value) =>
  typeof value === 'string' &&
  validISODate(value.slice(0, 10)) &&
  /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value));

/** Somente o futuro adaptador pode afirmar equivalência de conta, unidade e dias inclusivos. */
export function planConsumptionSources(observations, choices = {}) {
  const invalid = [],
    groups = new Map(),
    ids = new Map();
  for (const item of observations) {
    const reason =
      !item ||
      !operators.includes(item.operator) ||
      !['csv', 'api'].includes(item.kind) ||
      ['id', 'connectionKey', 'accountKey', 'periodBasis'].some(
        (key) => typeof item[key] !== 'string' || !item[key].trim(),
      ) ||
      !validISODate(item.start) ||
      !validISODate(item.end) ||
      item.start > item.end ||
      !validInstant(item.observedAt) ||
      item.complete !== true ||
      !Array.isArray(item.rows) ||
      item.rows.some(
        (row) =>
          !row ||
          typeof row.iccid !== 'string' ||
          !/^\d+$/.test(row.iccid) ||
          /^0+$/.test(row.iccid) ||
          typeof row.number !== 'string' ||
          !/^\d+$/.test(row.number) ||
          /^0+$/.test(row.number) ||
          !Number.isSafeInteger(row.ticks) ||
          row.ticks < 0,
      ) ||
      new Set(item.rows.map((row) => row.iccid)).size !== item.rows.length;
    if (reason) {
      invalid.push({
        id: item?.id || '',
        reason: 'Observação incompleta ou sem normalização validada',
      });
      continue;
    }
    const fingerprint = JSON.stringify(item);
    if (ids.has(item.id)) {
      if (ids.get(item.id) !== fingerprint)
        throw new Error('Mesmo identificador com conteúdos diferentes.');
      continue;
    }
    ids.set(item.id, fingerprint);
    const key = keyFor(item),
      group = groups.get(key) || { key, observations: [], selected: null, reason: '' };
    group.observations.push(item);
    groups.set(key, group);
  }
  const candidates = [...groups.values()];
  for (const group of candidates) {
    const item = group.observations[0];
    // Janelas parcialmente sobrepostas ficam para conferência, mesmo que tenham fontes escolhidas.
    const overlap = candidates.some((other) => {
      if (other === group) return false;
      const value = other.observations[0];
      return (
        item.operator === value.operator &&
        item.accountKey === value.accountKey &&
        item.start <= value.end &&
        value.start <= item.end
      );
    });
    if (overlap) {
      group.reason = 'Períodos sobrepostos: revisar antes de somar';
      continue;
    }
    const latest = new Map();
    for (const source of group.observations) {
      const connection = JSON.stringify([source.kind, source.connectionKey]);
      const previous = latest.get(connection);
      if (!previous || Date.parse(source.observedAt) > Date.parse(previous.observedAt))
        latest.set(connection, source);
      else if (
        Date.parse(source.observedAt) === Date.parse(previous.observedAt) &&
        JSON.stringify(source.rows) !== JSON.stringify(previous.rows)
      )
        group.reason = 'Revisões conflitantes no mesmo instante';
    }
    if (group.reason) continue;
    const options = [...latest.values()];
    group.options = options;
    const chosen = choices[group.key];
    group.selected = chosen
      ? options.find((value) => value.id === chosen) || null
      : options.length === 1
        ? options[0]
        : null;
    if (!group.selected)
      group.reason = 'CSV e API ou conexões diferentes: escolher uma observação para este período';
  }
  return {
    groups: candidates,
    selected: candidates.filter((group) => group.selected).map((group) => group.selected),
    invalid,
  };
}

/** Total da prévia é por observação escolhida; acumulados revisados nunca são adicionados aos anteriores. */
export function sourcePlanTotal(plan) {
  const total = plan.selected.reduce(
    (sum, source) => sum + source.rows.reduce((value, row) => value + row.ticks, 0),
    0,
  );
  if (!Number.isSafeInteger(total)) throw new Error('Total excede a precisão suportada.');
  return plan.groups.some((group) => !group.selected) ||
    (!plan.selected.length && plan.invalid.length)
    ? null
    : total;
}
