import { validateDashboardDocument } from './layout.js';
import { canUseDashboardModule, dashboardMetric } from './catalog.js';

/** Reordena pelo destino, sem alterar o original nem os filtros dos blocos. */
export function placeWidget(widgets, id, target, after = false) {
  if (id === target || !widgets.some((w) => w.id === id) || !widgets.some((w) => w.id === target))
    return widgets;
  const next = widgets.filter((w) => w.id !== id);
  next.splice(
    next.findIndex((w) => w.id === target) + Number(after),
    0,
    widgets.find((w) => w.id === id),
  );
  return next.every((w, i) => w === widgets[i]) ? widgets : next;
}

export function widgetDimensions(width, height, gridWidth) {
  const fraction = width / Math.max(1, gridWidth);
  return {
    size: fraction < 5 / 12 ? 'small' : fraction < 9 / 12 ? 'medium' : 'wide',
    height: Math.min(960, Math.max(320, Math.round(height / 20) * 20)),
  };
}

const clone = (value) => JSON.parse(JSON.stringify(value));
function uniqueName(name, names, limit) {
  let next = name.slice(0, limit),
    n = 2;
  const used = new Set(names.map((v) => v.trim().toLocaleLowerCase('pt-BR')));
  while (used.has(next.trim().toLocaleLowerCase('pt-BR'))) {
    const suffix = ` (${n++})`;
    next = name.slice(0, limit - suffix.length) + suffix;
  }
  return next;
}

export function copyWidget(widget, makeId) {
  return { ...clone(widget), id: makeId(), title: `Cópia de ${widget.title}`.slice(0, 100) };
}

export function copyDashboard(board, names, makeId, label = `Cópia de ${board.name}`) {
  return {
    id: makeId(),
    name: uniqueName(label, names, 60),
    widgets: board.widgets.map((w) => ({ ...clone(w), id: makeId() })),
  };
}

function checkModules(boards, user) {
  for (const board of boards)
    for (const widget of board.widgets)
      if (!canUseDashboardModule(user, dashboardMetric(widget.metric)?.module))
        throw Error('O backup contém indicadores de módulos sem permissão para este usuário.');
}

/** Backup de configurações: sem identidade, revisão de destino, fontes ou resultados calculados. */
export function dashboardBackup(document, user) {
  const value = validateDashboardDocument(document);
  checkModules(value.dashboards, user);
  return JSON.stringify(
    { format: 'addlog-dashboard-layouts', version: 1, dashboards: value.dashboards },
    null,
    2,
  );
}

export function readDashboardBackup(text, user) {
  if (typeof text !== 'string' || text.length > 1000000)
    throw Error('Backup excede o limite permitido.');
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw Error('O arquivo não contém um backup JSON válido.');
  }
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !['format', 'version', 'dashboards'].includes(k)) ||
    value.format !== 'addlog-dashboard-layouts' ||
    value.version !== 1
  )
    throw Error('Este arquivo não é um backup compatível de Meu Dashboard.');
  const result = validateDashboardDocument({
    version: 1,
    revision: 0,
    dashboards: value.dashboards,
  });
  if (!result.dashboards.length) throw Error('O backup não contém painéis.');
  checkModules(result.dashboards, user);
  return result.dashboards;
}

/** Importação aditiva: recria IDs/nomes e respeita a revisão do destino; nada é substituído. */
export function appendDashboards(document, boards, user, makeId) {
  const current = validateDashboardDocument(document);
  const input = validateDashboardDocument({
    version: 1,
    revision: 0,
    dashboards: boards,
  }).dashboards;
  checkModules(input, user);
  if (current.dashboards.length + input.length > 12)
    throw Error(
      'O conjunto importado ultrapassaria o limite de 12 painéis. Nenhum painel foi alterado.',
    );
  for (const board of input)
    current.dashboards.push(
      copyDashboard(
        board,
        current.dashboards.map((b) => b.name),
        makeId,
        board.name,
      ),
    );
  return validateDashboardDocument(current);
}
