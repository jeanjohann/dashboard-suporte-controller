/** Favoritos locais explícitos, sem registros importados nem aplicação automática. */
import { validISODate } from '../data/isoDate.js';
const todaySaoPaulo = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const relativePeriod = (mode, today) => {
  if (!validISODate(today)) throw Error('Data de referência inválida.');
  const end = Date.parse(today + 'T00:00:00Z'),
    day = 86400000;
  const iso = (n) => new Date(n).toISOString().slice(0, 10);
  if (mode === 'last7') return { start: iso(end - 6 * day), end: today };
  const monday =
    end - ((new Date(end).getUTCDay() + 6) % 7) * day - (mode === 'previousWeek' ? 7 * day : 0);
  return { start: iso(monday), end: iso(monday + 6 * day) };
};

const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
const modes = ['fixed', 'currentWeek', 'previousWeek', 'last7'];
function safe(value, depth = 0) {
  if (depth > 8) return false;
  if (value == null || typeof value === 'boolean' || typeof value === 'string') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 1000 && value.every((v) => safe(v, depth + 1));
  return (
    object(value) &&
    Object.keys(value).length <= 500 &&
    Object.entries(value).every(
      ([key, v]) => !['__proto__', 'constructor', 'prototype'].includes(key) && safe(v, depth + 1),
    )
  );
}
export function viewSnapshot(value) {
  if (!object(value) || !safe(value) || JSON.stringify(value).length > 100000)
    throw Error('A visão contém uma configuração inválida ou grande demais.');
  return JSON.parse(JSON.stringify(value));
}
export const savedViewsKey = (identity, scope) =>
  `addlog-saved-views-v1:${encodeURIComponent(identity || 'local')}:${encodeURIComponent(scope)}`;
export function readSavedViews(storage, key) {
  const raw = storage.getItem(key);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !Array.isArray(data.views) || data.views.length > 20)
    throw Error(
      'As visões salvas têm formato incompatível. Os dados existentes foram preservados.',
    );
  const ids = new Set();
  return data.views.map((view) => {
    if (
      !object(view) ||
      typeof view.id !== 'string' ||
      ids.has(view.id) ||
      typeof view.name !== 'string' ||
      !view.name.trim() ||
      view.name.length > 60 ||
      !Number.isSafeInteger(view.revision) ||
      view.revision < 1 ||
      !modes.includes(view.periodMode) ||
      typeof view.schema !== 'string'
    )
      throw Error('Uma visão salva está inválida. Os dados existentes foram preservados.');
    ids.add(view.id);
    return { ...view, state: viewSnapshot(view.state) };
  });
}
/** Releitura antes de gravar conserva favoritos criados por outra aba; revisão impede sobrescrita silenciosa. */
export function changeSavedView(storage, key, action) {
  const views = readSavedViews(storage, key);
  const old = views.find((view) => view.id === action.id);
  if (action.type === 'create' && old) throw Error('Identificador de visão já existente.');
  if (action.type !== 'create' && (!old || old.revision !== action.revision))
    throw Error('Esta visão mudou em outra aba. Atualize a lista antes de tentar novamente.');
  if (action.type === 'delete') {
    const next = views.filter((view) => view.id !== action.id);
    storage.setItem(key, JSON.stringify({ version: 1, views: next }));
    return next;
  }
  if (!['create', 'update', 'rename'].includes(action.type)) throw Error('Ação inválida.');
  const name = String(action.name || '').trim();
  if (!name || name.length > 60) throw Error('Informe um nome de até 60 caracteres.');
  if (
    views.some(
      (view) =>
        view.id !== old?.id &&
        view.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'),
    )
  )
    throw Error('Já existe uma visão com esse nome nesta categoria.');
  if (!old && views.length >= 20) throw Error('Limite de 20 visões por categoria.');
  const nextView =
    action.type === 'rename'
      ? { ...old, name, revision: old.revision + 1 }
      : {
          id: old?.id || action.id,
          name,
          revision: (old?.revision || 0) + 1,
          schema: String(action.schema || ''),
          periodMode: action.periodMode || 'fixed',
          state: viewSnapshot(action.state),
        };
  if (!modes.includes(nextView.periodMode) || !nextView.id) throw Error('Visão inválida.');
  const next = old
    ? views.map((view) => (view.id === old.id ? nextView : view))
    : [...views, nextView];
  storage.setItem(key, JSON.stringify({ version: 1, views: next }));
  return next;
}
export function applySavedView(view, schema, today = todaySaoPaulo()) {
  if (view.schema !== (schema || ''))
    throw Error(
      'A estrutura da fonte mudou. Recrie esta visão para não aplicar filtros em colunas diferentes.',
    );
  const state = viewSnapshot(view.state);
  if (!object(state.selection) || !object(state.reports)) throw Error('Visão salva incompleta.');
  if (view.periodMode !== 'fixed') {
    if (!object(state.selection?.filters)) throw Error('Esta visão não aceita período relativo.');
    Object.assign(state.selection.filters, relativePeriod(view.periodMode, today));
  }
  return state;
}
