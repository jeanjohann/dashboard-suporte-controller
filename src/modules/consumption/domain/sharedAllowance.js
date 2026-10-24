import { validISODate } from '../../../shared/data/isoDate.js';
import { consumptionEligible, exactSum, dataVolume, VOLUME_SCALE } from './lineConsumption.js';

/** Cadastro explícito por operadora/ciclo; não deduz contrato/franquia pelo nome do plano. */
export function validateAllowances(input = []) {
  if (!Array.isArray(input) || input.length > 200)
    throw Error('Limite de 200 franquias por histórico.');
  const ids = new Set(),
    assignments = new Map();
  const pools = input.map((pool) => {
    if (
      !pool ||
      typeof pool.id !== 'string' ||
      !/^[\w-]{1,120}$/.test(pool.id) ||
      ids.has(pool.id) ||
      !['Kore', 'Arqia'].includes(pool.operator) ||
      typeof pool.name !== 'string' ||
      !pool.name.trim() ||
      pool.name.length > 120 ||
      !validISODate(pool.start) ||
      !validISODate(pool.end) ||
      pool.start > pool.end ||
      !Number.isSafeInteger(pool.capacityTicks) ||
      pool.capacityTicks <= 0 ||
      pool.capacityTicks % 1024 !== 0 ||
      !Array.isArray(pool.members) ||
      !pool.members.length ||
      pool.members.length > 20000 ||
      pool.members.some(
        (id) => typeof id !== 'string' || !/^\d{1,32}$/.test(id) || /^0+$/.test(id),
      ) ||
      new Set(pool.members).size !== pool.members.length
    )
      throw Error('Franquia compartilhada inválida. Confira nome, ciclo, volume e ICCIDs únicos.');
    ids.add(pool.id);
    const result = {
      id: pool.id,
      operator: pool.operator,
      name: pool.name.trim(),
      start: pool.start,
      end: pool.end,
      capacityTicks: pool.capacityTicks,
      members: [...pool.members],
    };
    for (const id of pool.members) {
      const key = JSON.stringify([pool.operator, id]);
      if (!assignments.has(key)) assignments.set(key, []);
      assignments.get(key).push(result);
    }
    return result;
  });
  for (const list of assignments.values()) {
    list.sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < list.length; i++)
      if (list[i].start <= list[i - 1].end)
        throw Error(
          'O mesmo ICCID não pode pertencer a grupos com ciclos sobrepostos na mesma operadora.',
        );
  }
  return pools;
}
export function allowanceFromDraft(draft, id) {
  const members = draft.members.split(/[\s,;]+/).filter(Boolean);
  return validateAllowances([
    {
      id,
      operator: draft.operator,
      name: draft.name,
      start: draft.start,
      end: draft.end,
      capacityTicks: dataVolume(draft.capacityMB, 'MB'),
      members,
    },
  ])[0];
}
export function sharedAllowanceReports(pools, rows) {
  const index = new Map();
  for (const row of rows.filter((row) => row.service === 'dados')) {
    const key = JSON.stringify([row.operator, row.iccid, row.start, row.end]);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(row);
  }
  return validateAllowances(pools).map((pool) => {
    const details = pool.members.map((iccid) => {
      const matches = index.get(JSON.stringify([pool.operator, iccid, pool.start, pool.end])) || [];
      const row = matches[0];
      const expectedDays = (Date.parse(pool.end) - Date.parse(pool.start)) / 86400000 + 1;
      const valid =
        matches.length === 1 &&
        consumptionEligible(row) &&
        Number.isSafeInteger(row.ticks) &&
        row.ticks >= 0 &&
        row.days === expectedDays;
      return {
        iccid,
        row: valid ? row : null,
        state: !matches.length
          ? 'Sem apuração no ciclo'
          : matches.length > 1
            ? 'Apuração ambígua'
            : !valid
              ? 'Apuração inválida'
              : 'Apuração válida',
        ticks: valid ? row.ticks : null,
      };
    });
    const usable = details.filter((row) => row.ticks != null),
      complete = usable.length === pool.members.length;
    const consumedTicks = usable.length ? exactSum(usable.map((row) => row.ticks)) : null;
    return {
      ...pool,
      details,
      covered: usable.length,
      complete,
      consumedTicks,
      percentage: consumedTicks == null ? null : (consumedTicks / pool.capacityTicks) * 100,
      balanceTicks: complete ? pool.capacityTicks - consumedTicks : null,
      excessTicks: consumedTicks == null ? null : Math.max(0, consumedTicks - pool.capacityTicks),
      state:
        consumedTicks == null
          ? 'Sem consumo válido'
          : !complete
            ? 'Cobertura incompleta'
            : consumedTicks > pool.capacityTicks
              ? 'Franquia excedida'
              : consumedTicks === pool.capacityTicks
                ? 'Franquia atingida'
                : 'Dentro da franquia',
    };
  });
}
export const allowanceMB = (ticks) =>
  ticks == null
    ? 'Sem dados'
    : (ticks / VOLUME_SCALE).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
