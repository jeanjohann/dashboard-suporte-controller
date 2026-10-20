import { chipKey, consumptionEligible, VOLUME_SCALE } from './lineConsumption.js';
import { validISODate } from '../../../shared/data/isoDate.js';
export const defaultConsumptionAttention = { increase: 50, minimumDailyMB: 0 };
/** Compara o mesmo chip/operadora a uma apuração anterior não sobreposta, sem usar referência de outros chips. */
export function consumptionAttention(allRows, selected, limits = defaultConsumptionAttention) {
  const rules = Object.fromEntries(
      Object.entries(defaultConsumptionAttention).map(([key, value]) => [
        key,
        Number.isFinite(limits?.[key]) &&
        limits[key] >= (key === 'increase' ? 1 : 0) &&
        limits[key] <= (key === 'increase' ? 10000 : 1000000)
          ? limits[key]
          : value,
      ]),
    ),
    periods = new Map(),
    findings = [];
  for (const row of new Map(allRows.map((row) => [row.id, row])).values()) {
    if (
      !consumptionEligible(row) ||
      !validISODate(row.start) ||
      !validISODate(row.end) ||
      row.start > row.end ||
      row.days !== (Date.parse(row.end) - Date.parse(row.start)) / 86400000 + 1
    )
      continue;
    const key = JSON.stringify([chipKey(row), row.start, row.end]);
    if (!periods.has(key)) periods.set(key, []);
    periods.get(key).push(row);
  }
  const history = new Map();
  for (const rows of periods.values()) {
    const row = rows[0],
      key = chipKey(row);
    if (!history.has(key)) history.set(key, []);
    history.get(key).push(rows);
  }
  let compared = 0,
    withoutReference = 0,
    zeroReference = 0;
  const seen = new Set();
  for (const row of selected.filter(consumptionEligible)) {
    const key = JSON.stringify([chipKey(row), row.start, row.end]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (periods.get(key)?.length !== 1) {
      withoutReference++;
      continue;
    }
    const before = (history.get(chipKey(row)) || [])
      .filter((old) => old[0].end < row.start)
      .sort((a, b) => b[0].end.localeCompare(a[0].end));
    if (
      !before.length ||
      before[0].length !== 1 ||
      before.filter((old) => old[0].end === before[0][0].end).length !== 1
    ) {
      withoutReference++;
      continue;
    }
    const previous = before[0][0];
    if (previous.ticks === 0) {
      zeroReference++;
      continue;
    }
    const daily = row.ticks / row.days / VOLUME_SCALE,
      oldDaily = previous.ticks / previous.days / VOLUME_SCALE;
    const change = (daily / oldDaily - 1) * 100;
    compared++;
    if (change < rules.increase || daily < rules.minimumDailyMB) continue;
    const mb = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    findings.push({
      id: key,
      kind: 'Aumento de consumo por dia',
      title: `${row.number} · ${row.operator}`,
      value: `+${change.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% · ${mb(oldDaily)} → ${mb(daily)} MB/dia`,
      description: `${previous.start} a ${previous.end} (${previous.days} dias) → ${row.start} a ${row.end} (${row.days} dias). Mesmo ICCID e operadora; normalizado pelos dias informados. Não é projeção mensal nem excedente de franquia.`,
      row,
      previous,
      rank: change,
    });
  }
  return {
    findings: findings.sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id)),
    coverage: `${compared} apurações do recorte comparadas com o histórico ativo; ${withoutReference} sem referência anterior única e não sobreposta; ${zeroReference} com referência zero, sem percentual calculado. Registros inválidos/duplicados não participam. Não comprova cobertura completa dos períodos. A origem abre a linha do tempo com os arquivos e apurações.`,
  };
}
