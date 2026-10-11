/** Limite absoluto em MB, na precisão de seis casas dos extratos. */
import { consumptionEligible, VOLUME_SCALE } from './lineConsumption.js';

export function consumptionLimit(value) {
  if (value == null || value === '') return null;
  const match = /^(\d+)(?:[.,](\d{1,6}))?$/.exec(String(value));
  if (!match) return NaN;
  const ticks =
    Number(match[1]) * VOLUME_SCALE +
    Number((match[2] || '').padEnd(6, '0')) * (VOLUME_SCALE / 1_000_000);
  return Number.isSafeInteger(ticks) ? ticks : NaN;
}

export function aboveConsumptionLimit(row, value) {
  const limit = consumptionLimit(value);
  return limit == null || (Number.isFinite(limit) && consumptionEligible(row) && row.ticks > limit);
}
