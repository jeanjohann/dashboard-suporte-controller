/** Contratos do piloto, sem dependências de planilha ou interface. */
import { validISODate } from '../../../shared/data/isoDate.js';
import { zohoTeam } from '../../../shared/data/zohoActivity.js';
export const agents = zohoTeam;
export const subjects = [
  ['budget', 'Orçamento'],
  ['installation', 'Implementação / instalação'],
  ['training', 'Treinamentos'],
  ['questions', 'Dúvidas sobre o sistema'],
  ['configuration', 'Configuração'],
  ['failures', 'Falhas / manutenções / revisões'],
  ['sim', 'Problema com chip M2M'],
  ['cancellation', 'Cancelamentos / desinstalação'],
  ['other', 'Outras informações'],
];
export const manualFields = [
  ['created', 'Chamados abertos pelo suporte'],
  ...subjects.map(([key, label]) => [`subject_${key}`, label]),
  ['trackers', 'Rastreadores solicitados'],
  ['collectors', 'Coletoras solicitadas'],
  ['identifiers', 'Identificadores solicitados'],
  ['blockers', 'Bloqueadores solicitados'],
  ['videos', 'Materiais em vídeo'],
  ['technicians', 'Cadastros de técnicos'],
  ['procedures', 'POPs'],
];
export const metricLabels = {
  executed: 'Serviços efetivos executados',
  scheduled: 'Serviços na agenda',
  unproductive: 'Visitas improdutivas',
  created: 'Chamados abertos pelo suporte',
  closed: 'Chamados fechados',
  seconds: 'Tempo apontado nos chamados',
  requests: 'Equipamentos solicitados',
  activities: 'Atividades complementares',
};
export const sections = {
  agents: 'Resultados por agente',
  evolution: 'Evolução diária',
  types: 'Serviços e clientes',
  subjects: 'Assuntos dos chamados',
  manual: 'Atividades e lançamentos',
};
export const defaultSettings = {
  version: 1,
  sections: Object.keys(sections),
  cards: Object.keys(metricLabels),
  weeklyGoals: {},
};
const exact = (value, fields) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length === fields.length &&
  fields.every((key) => Object.hasOwn(value, key));
const quantity = (n) => Number.isSafeInteger(n) && n >= 0 && n <= 1000000;
export function periodDays(period) {
  if (!validISODate(period?.start) || !validISODate(period?.end) || period.start > period.end)
    throw Error('Informe início e fim válidos.');
  const days = (Date.parse(period.end) - Date.parse(period.start)) / 86400000 + 1;
  if (days > 366) throw Error('Selecione até 366 dias.');
  return days;
}
export function previousPeriod(period) {
  const days = periodDays(period),
    start = Date.parse(period.start);
  const iso = (n) => new Date(n).toISOString().slice(0, 10);
  return { start: iso(start - days * 86400000), end: iso(start - 86400000) };
}
export const entryId = (value) => `${value.date}.${value.agentId}`;
export function validateEntry(value) {
  if (
    !exact(value, ['version', 'date', 'agentId', 'values', 'note', 'novelty']) ||
    value.version !== 1 ||
    !validISODate(value.date) ||
    !agents.some((agent) => agent.id === value.agentId) ||
    !exact(
      value.values,
      manualFields.map(([key]) => key),
    ) ||
    Object.values(value.values).some((n) => n !== null && !quantity(n)) ||
    ['note', 'novelty'].some((key) => typeof value[key] !== 'string' || value[key].length > 2000)
  )
    throw Error('Lançamento inválido. Use quantidades inteiras e datas válidas.');
  return true;
}
export function blankEntry(date, agentId = agents[0].id) {
  return {
    version: 1,
    date,
    agentId,
    values: Object.fromEntries(manualFields.map(([key]) => [key, null])),
    note: '',
    novelty: '',
  };
}
export function validateSettings(value) {
  if (!exact(value, ['version', 'sections', 'cards', 'weeklyGoals']) || value.version !== 1)
    throw Error('Configuração inválida.');
  for (const [key, allowed] of [
    ['sections', sections],
    ['cards', metricLabels],
  ])
    if (
      !Array.isArray(value[key]) ||
      value[key].length > Object.keys(allowed).length ||
      new Set(value[key]).size !== value[key].length ||
      value[key].some((item) => !Object.hasOwn(allowed, item))
    )
      throw Error('Configuração inválida.');
  if (
    !value.weeklyGoals ||
    Array.isArray(value.weeklyGoals) ||
    typeof value.weeklyGoals !== 'object' ||
    Object.keys(value.weeklyGoals).some((key) => !Object.hasOwn(metricLabels, key)) ||
    Object.values(value.weeklyGoals).some((n) => !quantity(n))
  )
    throw Error('Meta semanal inválida.');
  return true;
}
export function manualSummary(records, period, agentId = '') {
  const entries = records.filter(
    (r) =>
      r.value.date >= period.start &&
      r.value.date <= period.end &&
      (!agentId || r.value.agentId === agentId),
  );
  const totals = Object.fromEntries(
    manualFields.map(([key]) => {
      const values = entries.map((r) => r.value.values[key]).filter((n) => n !== null);
      return [key, values.length ? values.reduce((a, b) => a + b, 0) : null];
    }),
  );
  const sum = (keys) => {
    const values = keys.map((key) => totals[key]).filter((n) => n !== null);
    return values.length ? values.reduce((a, b) => a + b, 0) : null;
  };
  return {
    entries,
    totals,
    requests: sum(['trackers', 'collectors', 'identifiers', 'blockers']),
    activities: sum(['videos', 'technicians', 'procedures']),
    filled: entries.reduce(
      (n, r) => n + Object.values(r.value.values).filter((v) => v !== null).length,
      0,
    ),
  };
}
