/** Contrato v1 entre coletor, Worker e tela. Nomes do fornecedor serão mapeados apenas no servidor. */
import { monitoringInstant } from '../domain/monitoring.js';

export const snapshotLimitBytes = 5 * 1024 * 1024;
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const id = (value) =>
  typeof value === 'string' && value.length > 0 && value.length <= 200 && value.trim() === value;
const optionalText = (value, limit = 300) =>
  value == null || (typeof value === 'string' && value.length <= limit);

/** Recusa retratos incompletos. Identificações de veículo duplicadas/vazias seguem para revisão do domínio. */
export function normalizeMonitoringSnapshot(input) {
  if (
    !object(input) ||
    input.schemaVersion !== 1 ||
    input.complete !== true ||
    input.demonstration === true ||
    monitoringInstant(input.referenceAt) == null ||
    !Array.isArray(input.collections) ||
    !Array.isArray(input.vehicles) ||
    input.vehicles.length > 50000
  )
    throw Error('Retrato de monitoramento inválido ou incompleto.');
  const bases = new Set();
  const collections = input.collections.map((entry) => {
    if (
      !object(entry) ||
      !id(entry.clientId) ||
      bases.has(entry.clientId) ||
      typeof entry.ok !== 'boolean' ||
      (entry.ok && monitoringInstant(entry.at) == null) ||
      !optionalText(entry.at, 100)
    )
      throw Error('Metadados de coleta inválidos.');
    bases.add(entry.clientId);
    return { clientId: entry.clientId, ok: entry.ok, at: entry.at ?? null };
  });
  const vehicles = input.vehicles.map((row) => {
    if (
      !object(row) ||
      !id(row.clientId) ||
      !bases.has(row.clientId) ||
      typeof row.vehicleId !== 'string' ||
      row.vehicleId.length > 200 ||
      !optionalText(row.trackerId, 200) ||
      !optionalText(row.plate, 100) ||
      !optionalText(row.clientName) ||
      !optionalText(row.profile) ||
      !optionalText(row.identifier, 200) ||
      !['prefix', 'iccid', 'msisdn'].every((key) => optionalText(row[key], 200)) ||
      !optionalText(row.deviceModel, 200) ||
      !(
        row.positions24h == null ||
        (Number.isSafeInteger(row.positions24h) && row.positions24h >= 0)
      ) ||
      !(row.externalPowerFailure == null || typeof row.externalPowerFailure === 'boolean') ||
      !(row.batteryState == null || Number.isSafeInteger(row.batteryState)) ||
      !(
        row.batteryPercent == null ||
        (typeof row.batteryPercent === 'number' &&
          Number.isFinite(row.batteryPercent) &&
          row.batteryPercent >= 0 &&
          row.batteryPercent <= 100)
      ) ||
      !optionalText(row.lastRecordAt, 100) ||
      !(
        row.supplyVoltageV == null ||
        (typeof row.supplyVoltageV === 'number' && Number.isFinite(row.supplyVoltageV)) ||
        optionalText(row.supplyVoltageV, 50)
      )
    )
      throw Error('Formato de veículo incompatível com o contrato de monitoramento.');
    return {
      clientId: row.clientId,
      clientName: row.clientName ?? '',
      vehicleId: row.vehicleId,
      trackerId: row.trackerId ?? '',
      plate: row.plate ?? '',
      lastRecordAt: row.lastRecordAt ?? null,
      supplyVoltageV: row.supplyVoltageV ?? null,
      profile: row.profile ?? null,
      identifier: row.identifier ?? null,
      prefix: row.prefix ?? null,
      iccid: row.iccid ?? null,
      msisdn: row.msisdn ?? null,
      deviceModel: row.deviceModel ?? null,
      positions24h: row.positions24h ?? null,
      externalPowerFailure: row.externalPowerFailure ?? null,
      batteryState: row.batteryState ?? null,
      batteryPercent: row.batteryPercent ?? null,
    };
  });
  if (
    input.source != null &&
    (input.source !== 'addlog-legacy' ||
      !optionalText(input.sourceGeneratedAt, 100) ||
      input.positionsWindowHours !== 24)
  )
    throw Error('Origem do monitoramento inválida.');
  return {
    schemaVersion: 1,
    complete: true,
    demonstration: false,
    referenceAt: input.referenceAt,
    ...(input.source === 'addlog-legacy'
      ? {
          source: input.source,
          sourceGeneratedAt: input.sourceGeneratedAt ?? null,
          positionsWindowHours: 24,
        }
      : {}),
    collections,
    vehicles,
  };
}

/** Limita a leitura real do fluxo; nunca retorna HTML de login nem mensagens internas do fornecedor. */
export async function readSnapshotJson(response) {
  if (!response.headers.get('Content-Type')?.includes('application/json'))
    throw Error('Resposta de monitoramento incompatível.');
  const reader = response.body?.getReader();
  if (!reader) throw Error('Resposta de monitoramento vazia.');
  const decoder = new TextDecoder();
  let bytes = 0,
    text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > snapshotLimitBytes) {
        await reader.cancel();
        throw Error('Retrato excede o limite de leitura.');
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
