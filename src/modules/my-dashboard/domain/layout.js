import { validISODate } from '../../../shared/data/isoDate.js';
import { dashboardMetric } from './catalog.js';

const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
const keys = (v, allowed) => object(v) && Object.keys(v).every((key) => allowed.includes(key));
const id = (v) => typeof v === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
export const emptyDashboardDocument = () => ({ version: 1, revision: 0, dashboards: [] });
export function validateDashboardDocument(value) {
  if (
    !keys(value, ['version', 'revision', 'dashboards']) ||
    value.version !== 1 ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    !Array.isArray(value.dashboards) ||
    value.dashboards.length > 12
  )
    throw Error('As configurações salvas são incompatíveis. A cópia existente foi preservada.');
  const ids = new Set(),
    names = new Set();
  for (const board of value.dashboards) {
    if (
      !keys(board, ['id', 'name', 'widgets']) ||
      !id(board.id) ||
      ids.has(board.id) ||
      typeof board.name !== 'string' ||
      !board.name.trim() ||
      board.name.length > 60 ||
      names.has(board.name.trim().toLocaleLowerCase('pt-BR')) ||
      !Array.isArray(board.widgets) ||
      board.widgets.length > 40
    )
      throw Error(
        'Informe dashboards com nomes únicos de até 60 caracteres e no máximo 40 blocos.',
      );
    ids.add(board.id);
    names.add(board.name.trim().toLocaleLowerCase('pt-BR'));
    const widgets = new Set();
    for (const widget of board.widgets) {
      const metric = dashboardMetric(widget?.metric);
      if (
        !keys(widget, ['id', 'metric', 'title', 'kind', 'size', 'height', 'filters']) ||
        !id(widget.id) ||
        widgets.has(widget.id) ||
        !metric ||
        typeof widget.title !== 'string' ||
        widget.title.length > 100 ||
        !metric.kinds.includes(widget.kind) ||
        !['small', 'medium', 'wide'].includes(widget.size) ||
        (widget.height !== undefined &&
          (!Number.isInteger(widget.height) || widget.height < 320 || widget.height > 960)) ||
        !keys(widget.filters, [
          'start',
          'end',
          'client',
          'model',
          'operator',
          'period',
          'agent',
          'base',
          'threshold',
          'grouping',
        ])
      )
        throw Error('Um bloco contém uma configuração inválida.');
      widgets.add(widget.id);
      for (const [key, item] of Object.entries(widget.filters)) {
        if (key === 'grouping' && !['branch', 'consolidated', 'explicit'].includes(item))
          throw Error('Agrupamento de clientes inválido.');
        if (key === 'threshold') {
          if (![48, 72, 96].includes(item)) throw Error('Limite de comunicação inválido.');
        } else if (typeof item !== 'string' || item.length > 160) throw Error('Filtro inválido.');
      }
      const { start, end } = widget.filters;
      if (
        (start && !validISODate(start)) ||
        (end && !validISODate(end)) ||
        (start && end && start > end)
      )
        throw Error('O período do bloco é inválido.');
    }
  }
  if (JSON.stringify(value).length > 300000)
    throw Error('O conjunto de dashboards excedeu o limite de configuração.');
  return JSON.parse(JSON.stringify(value));
}
export function moveWidget(widgets, id, step) {
  const index = widgets.findIndex((item) => item.id === id),
    target = index + step;
  if (index < 0 || target < 0 || target >= widgets.length) return widgets;
  const next = [...widgets];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
