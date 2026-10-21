/** Analisa o último estado recebido, com cobertura explícita; ausência e coleta antiga nunca viram zero. */
import { monitoringBatteryState } from './monitoring.js';

export const monitoringModel = (row) => row.deviceModel?.trim() || '';
export const modelLabel = (model) => model || 'Modelo não informado';
const fresh = (row) => row.state !== 'stale';
const positions = (row) =>
  fresh(row) && Number.isSafeInteger(row.positions24h) && row.positions24h >= 0;
const batteryCodes = [0, 1, 2, 3, 5, 6];
const power = (row) => fresh(row) && typeof row.externalPowerFailure === 'boolean';
const battery = (row) => fresh(row) && batteryCodes.includes(row.batteryState);

/** Predicados compartilhados pelos cards e sua fila detalhada; não dependem de limites elétricos inventados. */
export function matchesTelemetryFocus(row, focus) {
  if (focus === 'external-power') return power(row) && row.externalPowerFailure;
  if (focus === 'battery-low') return battery(row) && row.batteryState === 6;
  if (focus === 'battery-failure') return battery(row) && row.batteryState === 2;
  if (focus === 'battery-discharging') return battery(row) && row.batteryState === 3;
  if (focus === 'positions-active') return positions(row) && row.positions24h > 0;
  if (focus === 'positions-zero') return positions(row) && row.positions24h === 0;
  if (focus === 'power-unknown') return !power(row);
  return true;
}

function summarize(rows) {
  const readings = rows.filter(positions);
  const total = readings.reduce((sum, row) => sum + row.positions24h, 0);
  const validTotal = readings.length > 0 && Number.isSafeInteger(total) ? total : null;
  const powerReadings = rows.filter(power).length;
  const batteryReadings = rows.filter(battery).length;
  return {
    fleet: rows.length,
    delayed: rows.filter((row) => row.state === 'delayed').length,
    powerReadings,
    powerUnknown: rows.length - powerReadings,
    externalFailure: powerReadings
      ? rows.filter((row) => matchesTelemetryFocus(row, 'external-power')).length
      : null,
    batteryReadings,
    batteryLow: batteryReadings
      ? rows.filter((row) => matchesTelemetryFocus(row, 'battery-low')).length
      : null,
    batteryFailure: batteryReadings
      ? rows.filter((row) => matchesTelemetryFocus(row, 'battery-failure')).length
      : null,
    batteryDischarging: batteryReadings
      ? rows.filter((row) => matchesTelemetryFocus(row, 'battery-discharging')).length
      : null,
    positionsReadings: readings.length,
    positionsUnknown: rows.length - readings.length,
    positionsTotal: validTotal,
    positionsAverage: validTotal == null ? null : validTotal / readings.length,
    positionsActive: readings.length ? readings.filter((row) => row.positions24h > 0).length : null,
    positionsZero: readings.length ? readings.filter((row) => row.positions24h === 0).length : null,
  };
}

/** Usa a frota das bases/modelos selecionados; busca e recortes da fila não alteram os denominadores. */
export function monitoringTelemetry(result) {
  const rows = result.scoped;
  const groups = (key, label) => {
    const grouped = new Map();
    for (const row of rows) {
      const id = key(row);
      if (!grouped.has(id)) grouped.set(id, { id, label: label(row), rows: [] });
      grouped.get(id).rows.push(row);
    }
    return [...grouped.values()].map(({ rows, ...group }) => ({ ...group, ...summarize(rows) }));
  };
  return {
    ...summarize(rows),
    bases: groups(
      (row) => row.clientId,
      (row) => row.clientName || row.clientId,
    ),
    models: groups(monitoringModel, (row) => modelLabel(monitoringModel(row))),
    batteryStates: [
      ...batteryCodes.map((code) => ({
        label: monitoringBatteryState(code),
        value: rows.filter((row) => battery(row) && row.batteryState === code).length,
      })),
      { label: 'Sem estado utilizável', value: rows.filter((row) => !battery(row)).length },
    ],
  };
}
