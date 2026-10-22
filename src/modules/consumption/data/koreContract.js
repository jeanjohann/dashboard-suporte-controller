/** Contrato restrito KORE: bytes e datas literais em BRT confirmado pela operadora, sem presumir ciclo ou equivalência com CSV. */
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const integer = (value) => Number.isSafeInteger(value) && value >= 0;
const optionalText = (value, max = 300) =>
  value == null || (typeof value === 'string' && value.length <= max);
const digitText = (value) =>
  value == null || (typeof value === 'string' && /^\d{1,32}$/.test(value));
const optionalBool = (value) => value == null || typeof value === 'boolean';

export function normalizeKorePage(input) {
  if (
    !object(input) ||
    input.schemaVersion !== 1 ||
    input.source !== 'kore-saitro' ||
    !integer(input.page) ||
    input.page < 1 ||
    !integer(input.totalReported) ||
    typeof input.hasNext !== 'boolean' ||
    input.period !== 'unconfirmed' ||
    !(input.cleanupConfirmed == null || typeof input.cleanupConfirmed === 'boolean') ||
    typeof input.readAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(input.readAt) ||
    !Number.isFinite(Date.parse(input.readAt)) ||
    !Array.isArray(input.rows) ||
    input.rows.length > 100 ||
    input.rows.length > input.totalReported ||
    (input.hasNext && !input.rows.length)
  )
    throw Error('Página KORE incompatível.');
  const ids = new Set(),
    chips = new Set();
  const rows = input.rows.map((row) => {
    if (
      !object(row) ||
      typeof row.id !== 'string' ||
      !/^\d{1,24}$/.test(row.id) ||
      ids.has(row.id) ||
      !digitText(row.iccid) ||
      !digitText(row.number) ||
      (row.iccid && chips.has(row.iccid)) ||
      !(row.bytes == null || integer(row.bytes)) ||
      ['operator', 'status', 'connection', 'apn', 'technology', 'lastAccess'].some(
        (key) => !optionalText(row[key]),
      ) ||
      [
        'dataProvisioned',
        'dataBlocked',
        'functionalBlock',
        'administrativeBlock',
        'suspended',
      ].some((key) => !optionalBool(row[key]))
    )
      throw Error('Linha KORE incompatível.');
    ids.add(row.id);
    if (row.iccid) chips.add(row.iccid);
    return {
      id: row.id,
      iccid: row.iccid ?? null,
      number: row.number ?? null,
      bytes: row.bytes ?? null,
      operator: row.operator ?? null,
      status: row.status ?? null,
      connection: row.connection ?? null,
      apn: row.apn ?? null,
      technology: row.technology ?? null,
      lastAccess: row.lastAccess ?? null,
      dataProvisioned: row.dataProvisioned ?? null,
      dataBlocked: row.dataBlocked ?? null,
      functionalBlock: row.functionalBlock ?? null,
      administrativeBlock: row.administrativeBlock ?? null,
      suspended: row.suspended ?? null,
    };
  });
  return {
    schemaVersion: 1,
    source: 'kore-saitro',
    period: 'unconfirmed',
    page: input.page,
    totalReported: input.totalReported,
    hasNext: input.hasNext,
    readAt: input.readAt,
    cleanupConfirmed: input.cleanupConfirmed === true,
    rows,
  };
}

/** Subtotal apenas dos bytes informados nesta página, preservando ausência e precisão inteira. */
export function korePageSummary(page) {
  const known = page.rows.filter((row) => row.bytes != null);
  const total = known.reduce((sum, row) => sum + row.bytes, 0);
  return {
    rows: page.rows.length,
    known: known.length,
    bytes: known.length && Number.isSafeInteger(total) ? total : null,
  };
}
