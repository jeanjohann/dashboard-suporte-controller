/**
 * Contrato interno do monitoramento, independente dos nomes ainda pendentes da API.
 * Datas exigem fuso explícito. Falha ou atraso de coleta nunca confirma falha do veículo.
 */
export const monitoringStates = {
  recent: 'Abaixo do limite',
  delayed: 'Acima do limite',
  missing: 'Sem posição registrada',
  invalid: 'Data para revisão',
  stale: 'Coleta desatualizada',
};

export const monitoringStages = [
  'Não iniciado',
  'Em análise',
  'Aguardando contato',
  'Manutenção agendada',
  'Acompanhamento encerrado',
];

/** Ordena o recorte inteiro, antes de paginar. Identificadores são comparados como texto, sem perda de precisão. */
export function sortMonitoringRows(rows, sort, notes = {}) {
  const fields = {
    plate: (row) => row.plate,
    trackerId: (row) => row.trackerId,
    client: (row) => row.clientName || row.clientId,
    lastRecordAt: (row) => monitoringInstant(row.lastRecordAt),
    supplyVoltageV: (row) => row.supplyVoltageV,
    profile: (row) => row.profile,
    hours: (row) => row.hours,
    state: (row) => monitoringStates[row.state],
    stage: (row) => notes[row.key]?.status || monitoringStages[0],
  };
  const value = fields[sort?.key];
  if (!value || !['asc', 'desc'].includes(sort?.direction)) return rows;
  const comparable = (row) => {
    const raw = value(row);
    if (raw == null || (typeof raw === 'number' && !Number.isFinite(raw))) return null;
    return typeof raw === 'number' ? raw : String(raw).trim() || null;
  };
  return rows
    .map((row, index) => ({ row, index, value: comparable(row) }))
    .sort((a, b) => {
      if (a.value == null) return b.value == null ? a.index - b.index : 1;
      if (b.value == null) return -1;
      const comparison =
        typeof a.value === 'number' && typeof b.value === 'number'
          ? a.value - b.value
          : String(a.value).localeCompare(String(b.value), 'pt-BR', { numeric: true });
      return (sort.direction === 'desc' ? -comparison : comparison) || a.index - b.index;
    })
    .map((entry) => entry.row);
}

/** Sinal visual por duração utilizável; uma coleta antiga nunca recebe cor de alerta confirmado. */
export function monitoringIndicator(row) {
  if (
    !['recent', 'delayed'].includes(row.state) ||
    row.hours == null ||
    !Number.isFinite(row.hours)
  )
    return { tone: 'unknown', label: monitoringStates[row.state] || 'Sem classificação' };
  if (row.hours >= 96) return { tone: 'critical', label: '4 dias ou mais' };
  if (row.hours >= 72) return { tone: 'high', label: '3 a menos de 4 dias' };
  if (row.hours >= 48) return { tone: 'attention', label: '2 a menos de 3 dias' };
  return { tone: 'recent', label: 'Menos de 2 dias' };
}

/** Apresenta a alimentação em volts, sem criar limites de tensão ou converter unidades. */
export function monitoringVoltage(value) {
  if (value == null || value === '') return 'Não informado';
  if (typeof value === 'number' && Number.isFinite(value))
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value) + ' V';
  return typeof value === 'string' ? value + ' V' : 'Valor para revisão';
}

/** Acrescenta um registro explícito de tratamento; digitar um rascunho não muda o status publicado. */
export function recordMonitoringUpdate(previous = {}, draft, at = new Date().toISOString()) {
  if (!monitoringStages.includes(draft.status)) throw Error('Escolha um status válido.');
  if (monitoringInstant(at) == null) throw Error('Data da atualização inválida.');
  const owner = String(draft.owner ?? '').trim(),
    text = String(draft.text ?? '').trim();
  if (
    !text &&
    draft.status === (previous.status || monitoringStages[0]) &&
    owner === (previous.owner || '')
  )
    throw Error('Altere o status ou responsável, ou descreva o que foi tratado.');
  const entry = { at, status: draft.status, owner, text };
  return { ...entry, history: [...(previous.history || []), entry] };
}

/** Aceita ISO com fuso e data existente; textos brasileiros exigirão um adaptador confirmado. */
export function monitoringInstant(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  )
    return null;
  const date = value.slice(0, 10),
    calendar = new Date(date + 'T00:00:00Z');
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date)
    return null;
  const instant = Date.parse(value);
  return Number.isFinite(instant) ? instant : null;
}

export const vehicleKey = (vehicle) => JSON.stringify([vehicle.clientId, vehicle.vehicleId]);

/** Faixas exclusivas, sem arredondar a duração antes de comparar os limites. */
export function monitoringBucket(hours) {
  return hours >= 96
    ? '96 h ou mais'
    : hours >= 72
      ? '72 a <96 h'
      : hours >= 48
        ? '48 a <72 h'
        : 'Menos de 48 h';
}

/** Analisa um retrato completo antes de filtrar; chaves duplicadas são excluídas como grupo. */
export function monitorSnapshot(snapshot, { clients = [], threshold = 48, state = 'all' } = {}) {
  if (![48, 72, 96].includes(Number(threshold))) throw Error('Limite inválido.');
  if (!['all', ...Object.keys(monitoringStates)].includes(state)) throw Error('Situação inválida.');
  const reference = monitoringInstant(snapshot.referenceAt);
  if (reference == null) throw Error('Referência temporal inválida.');
  const collections = new Map(snapshot.collections.map((item) => [item.clientId, item]));
  const counts = new Map();
  for (const vehicle of snapshot.vehicles)
    counts.set(vehicleKey(vehicle), (counts.get(vehicleKey(vehicle)) || 0) + 1);
  const issues = [],
    all = [];
  for (const vehicle of snapshot.vehicles) {
    const key = vehicleKey(vehicle);
    if (!vehicle.clientId || !vehicle.vehicleId || counts.get(key) !== 1) {
      issues.push({ key, reason: 'Identificação ausente ou duplicada.' });
      continue;
    }
    const collection = collections.get(vehicle.clientId),
      collected = monitoringInstant(collection?.at);
    const last = monitoringInstant(vehicle.lastRecordAt);
    const hours = last != null && last <= reference ? (reference - last) / 3600000 : null;
    const fresh =
      collection?.ok === true &&
      collected != null &&
      collected <= reference &&
      reference - collected < 2 * 3600000;
    // A ausência de coleta prevalece: o dado antigo pode ser exibido, mas não gera novo alerta confirmado.
    const status = !fresh
      ? 'stale'
      : vehicle.lastRecordAt == null || vehicle.lastRecordAt === ''
        ? 'missing'
        : hours == null
          ? 'invalid'
          : hours >= Number(threshold)
            ? 'delayed'
            : 'recent';
    all.push({
      ...vehicle,
      key,
      hours,
      state: status,
      collectionAt: collection?.at || '',
      bucket: hours == null ? null : monitoringBucket(hours),
    });
  }
  const scoped = all.filter((row) => !clients.length || clients.includes(row.clientId));
  const usable = scoped.filter((row) => ['recent', 'delayed'].includes(row.state));
  const delayed = usable.filter((row) => row.hours >= Number(threshold));
  const rows = scoped
    .filter((row) => state === 'all' || row.state === state)
    .sort((a, b) => (b.hours ?? -1) - (a.hours ?? -1) || a.key.localeCompare(b.key));
  const groups = [...new Set(scoped.map((row) => row.clientId))].map((clientId) => {
    const vehicles = scoped.filter((row) => row.clientId === clientId),
      alerts = vehicles.filter((row) => row.state === 'delayed').length;
    return {
      clientId,
      label: vehicles[0].clientName,
      total: vehicles.length,
      alerts,
      percentage: (alerts / vehicles.length) * 100,
    };
  });
  return {
    rows,
    scoped,
    groups,
    issues,
    referenceAt: snapshot.referenceAt,
    demonstration: snapshot.demonstration === true,
    totals: {
      fleet: scoped.length,
      delayed: delayed.length,
      critical: usable.filter((row) => row.hours >= 96).length,
      missing: scoped.filter((row) => row.state === 'missing').length,
      stale: scoped.filter((row) => row.state === 'stale').length,
      invalid: scoped.filter((row) => row.state === 'invalid').length,
      percentage: scoped.length ? (delayed.length / scoped.length) * 100 : null,
    },
    buckets: ['48 a <72 h', '72 a <96 h', '96 h ou mais'].map((label) => ({
      label,
      value: usable.filter((row) => row.bucket === label).length,
    })),
  };
}

/** Formatação explícita no fuso de São Paulo; sem data válida, exibe ausência. */
export function monitoringDate(value) {
  const instant = monitoringInstant(value);
  return instant == null
    ? 'Não informado'
    : new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(instant);
}

/** Exibe dias, horas e minutos; a classificação usa a precisão original e não este texto. */
export function monitoringDuration(hours) {
  if (hours == null) return 'Indeterminado';
  const minutes = Math.floor(hours * 60);
  return `${Math.floor(minutes / 1440)} d ${Math.floor((minutes % 1440) / 60)} h ${minutes % 60} min`;
}
