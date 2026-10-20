/** Contexto legível de impressão; preserva identificadores e filtros desconhecidos. */
const labels = {
  alcance: 'Análise',
  busca: 'Busca',
  referencia: 'Referência operacional',
  fator: 'Multiplicador da média',
  start: 'De',
  end: 'Até',
  atendimentoDe: 'Atendimentos de',
  atendimentoAte: 'Atendimentos até',
  attendanceStart: 'Atendimentos de',
  attendanceEnd: 'Atendimentos até',
  client: 'Cliente',
  model: 'Modelo',
  plan: 'Plano',
  status: 'Situação',
  operator: 'Operadora',
  serial: 'ID do equipamento',
  plate: 'Placa',
  minimumMB: 'Consumo acima de (MB)',
  agrupamento: 'Agrupamento',
  indicador: 'Indicador',
  agrupamentoClientes: 'Agrupamento de clientes',
  criterioClientes: 'Critério de clientes',
  executionOwner: 'Responsável pela execução',
  schedulingOwner: 'Responsável pelo agendamento',
};
const day = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').reverse().join('/') : value;
const dateFields = new Set([
  'start',
  'end',
  'attendanceStart',
  'attendanceEnd',
  'atendimentoDe',
  'atendimentoAte',
]);
const choices = {
  agrupamento: { client: 'Cliente', model: 'Modelo', plan: 'Plano', status: 'Situação' },
  indicador: {
    assistance: 'Assistências realizadas',
    withAssistance: 'Registros com assistência',
    rate: 'Assistências por 100 registros',
    share: 'Percentual com assistência',
  },
  consumption: {
    positive: 'Com tráfego',
    zero: 'Consumo zero',
    attention: 'Acima da referência de investigação',
  },
};
const present = (value) =>
  value !== null &&
  value !== undefined &&
  value !== '' &&
  (!Array.isArray(value) || value.length > 0) &&
  (typeof value !== 'object' || Object.keys(value).length > 0);
function display(value, periods = false, formatDates = false) {
  if (periods && typeof value === 'string') {
    try {
      const range = JSON.parse(value);
      if (
        Array.isArray(range) &&
        range.length === 2 &&
        range.every((part) => typeof part === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(part))
      )
        return range.map(day).join(' a ');
    } catch {
      /* Chaves desconhecidas permanecem como texto. */
    }
  }
  if (Array.isArray(value))
    return value.map((part) => display(part, periods, formatDates)).join(', ');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value && typeof value === 'object')
    return Object.entries(value)
      .filter(([, part]) => present(part))
      .map(([key, part]) => `${labels[key] || key}: ${display(part, periods)}`)
      .join(' · ');
  return formatDates ? day(String(value)) : String(value);
}
export function printContextEntries({ filename, filters = {}, referenceDate } = {}) {
  const entries = [['Arquivo', filename || 'Não informado']];
  for (const [key, value] of Object.entries(filters)) {
    if (present(value))
      entries.push([
        key === 'periodos' ? 'Apurações' : labels[key] || key,
        typeof value === 'string' && choices[key]?.[value]
          ? choices[key][value]
          : display(value, key === 'periodos', dateFields.has(key)),
      ]);
  }
  if (referenceDate) entries.push(['Referência temporal', display(referenceDate, false, true)]);
  if (entries.length === 1) entries.push(['Filtros', 'Sem filtros informados']);
  return entries;
}
