/** Adapta o diagnóstico documentado do legado Addlog, sem expor credenciais ou tratar posições como tráfego M2M. */
import { normalizeMonitoringSnapshot } from '../src/modules/monitoring/data/snapshotContract.js';

const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const text = (value, max = 200) =>
  typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= max;
const identifier = (value) => {
  if (text(value)) return value;
  if (Number.isSafeInteger(value) && value >= 0) return String(value);
  throw Error('Identificador incompatível.');
};

/** Destino fixo de confiança: nenhum endereço ou parâmetro do navegador participa da consulta. */
export function diagnosticUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'sistema.addlog.com.br' ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/api\/[a-z0-9-]+\/diagnostic$/.test(url.pathname)
  )
    throw Error('Endereço de diagnóstico inválido.');
  return url.href;
}

/** lastUpdate é UTC na documentação. Datas inexistentes permanecem explícitas para revisão, sem correção automática. */
export function diagnosticInstant(value) {
  if (value === null) return null;
  if (typeof value !== 'string' || value.length > 100) throw Error('Data incompatível.');
  const parts = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!parts) return value;
  const [, day, month, year, hour, minute, second] = parts;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  const parsed = new Date(iso);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === iso.replace('Z', '.000Z')
    ? iso
    : value;
}

/** Uma base com erro invalida o retrato inteiro. A tela conserva a frota anterior com coleta indisponível. */
export function normalizeAddlogDiagnostic(input, receivedAt = new Date().toISOString()) {
  if (
    !object(input) ||
    !text(input.generatedAt, 100) ||
    input.windowHours !== 24 ||
    !object(input.errors) ||
    Object.keys(input.errors).length ||
    !Array.isArray(input.vehicles) ||
    input.vehicles.length > 50000
  )
    throw Error('Diagnóstico inválido ou parcial.');
  const bases = new Set();
  const keys = new Set();
  const vehicles = input.vehicles.map((row) => {
    if (!object(row)) throw Error('Veículo incompatível com o diagnóstico.');
    const checks = {
      base: text(row.base),
      vehicleId: text(row.vehicleId),
      positions24h: Number.isSafeInteger(row.positions24h) && row.positions24h >= 0,
      profiles:
        row.profiles == null ||
        (Array.isArray(row.profiles) &&
          row.profiles.every(
            (profile) =>
              object(profile) &&
              (profile.name == null ||
                (typeof profile.name === 'string' && profile.name.length <= 300)),
          )),
      power: row.power == null || object(row.power),
      externalFailure:
        row.power?.externalFailure == null || typeof row.power.externalFailure === 'boolean',
      supply:
        row.power?.supply == null ||
        (typeof row.power.supply === 'number' && Number.isFinite(row.power.supply)),
      batteryState: row.power?.batteryState == null || Number.isSafeInteger(row.power.batteryState),
      batteryPercent:
        row.power?.batteryPercent == null ||
        (typeof row.power.batteryPercent === 'number' &&
          Number.isFinite(row.power.batteryPercent) &&
          row.power.batteryPercent >= 0 &&
          row.power.batteryPercent <= 100),
    };
    const invalid = Object.keys(checks).filter((field) => !checks[field]);
    if (invalid.length) throw Error('Campos incompatíveis: ' + invalid.join(', '));
    const key = JSON.stringify([row.base, row.vehicleId]);
    if (keys.has(key)) throw Error('Veículo duplicado no diagnóstico.');
    keys.add(key);
    bases.add(row.base);
    return {
      clientId: row.base,
      clientName: row.base,
      vehicleId: row.vehicleId,
      trackerId: identifier(row.deviceId),
      identifier: identifier(row.identifier),
      plate: row.plate,
      deviceModel: row.deviceModel,
      lastRecordAt: diagnosticInstant(row.lastUpdate),
      positions24h: row.positions24h,
      supplyVoltageV: row.power?.supply ?? null,
      externalPowerFailure: row.power?.externalFailure ?? null,
      batteryState: row.power?.batteryState ?? null,
      batteryPercent: row.power?.batteryPercent ?? null,
      profile:
        (row.profiles ?? [])
          .map((profile) => profile.name?.trim() || 'Perfil sem nome')
          .join(' · ') || null,
    };
  });
  return normalizeMonitoringSnapshot({
    schemaVersion: 1,
    complete: true,
    referenceAt: receivedAt,
    source: 'addlog-legacy',
    sourceGeneratedAt: input.generatedAt,
    positionsWindowHours: 24,
    collections: [...bases].map((clientId) => ({ clientId, ok: true, at: receivedAt })),
    vehicles,
  });
}
