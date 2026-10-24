import { dashboardMetric, canUseDashboardModule } from './catalog.js';
import { evaluateDashboardWidget } from './evaluate.js';

const keys = ['orders', 'operational', 'logistics', 'monitoring', 'consumption', 'zoho'];
/** Formato fixo para dependências React, incluindo complementos e comparação do parque com OS. */
export function dashboardSourcesForWidget(widget, sources) {
  const needed = new Set();
  for (const part of [widget, ...(widget.companions || []), widget.comparison].filter(Boolean)) {
    const module = dashboardMetric(part.metric)?.module;
    if (module === 'park') {
      needed.add('operational');
      needed.add('orders');
    } else if (module) needed.add(module);
  }
  return Object.fromEntries(keys.map((key) => [key, needed.has(key) ? sources[key] : undefined]));
}

/** Cache limitado por sessão, sem reter versões antigas das fontes. Permissão precede a leitura. */
export function createDashboardEvaluator(evaluate = evaluateDashboardWidget, limit = 200) {
  let owner = null;
  const entries = new Map();
  const versions = new Map();
  return (widget, sources, user) => {
    const module = dashboardMetric(widget.metric)?.module;
    if (!module || !canUseDashboardModule(user, module)) return evaluate(widget, sources, user);
    const identity = JSON.stringify(user);
    if (identity !== owner) {
      owner = identity;
      entries.clear();
      versions.clear();
    }
    const key = JSON.stringify([widget.metric, widget.filters || {}, widget.query || null]);
    const relevant = dashboardSourcesForWidget({ metric: widget.metric }, sources);
    const dependencies = module === 'park' ? ['operational', 'orders'] : [module];
    for (const dependency of dependencies) {
      if (versions.has(dependency) && versions.get(dependency) !== relevant[dependency]) {
        for (const [cachedKey, entry] of entries) {
          if (entry.dependencies.includes(dependency)) entries.delete(cachedKey);
        }
      }
      versions.set(dependency, relevant[dependency]);
    }
    const previous = entries.get(key);
    if (previous && keys.every((key) => previous.sources[key] === relevant[key])) {
      entries.delete(key);
      entries.set(key, previous);
      return previous.result;
    }
    const result = evaluate(widget, sources, user);
    entries.delete(key);
    entries.set(key, { sources: relevant, result, dependencies });
    if (entries.size > limit) entries.delete(entries.keys().next().value);
    return result;
  };
}
export const evaluateCachedWidget = createDashboardEvaluator();
