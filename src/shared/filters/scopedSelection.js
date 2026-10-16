/** Seleções são independentes por categoria; esta camada não conhece registros nem regras de cálculo. */
export const emptySelection = () => ({ filters: {}, search: '', extraColumns: [] });

export function updateScopedField(selections, scope, field, value, initial) {
  const current = selections[scope] || initial;
  return {
    ...selections,
    [scope]: { ...current, [field]: typeof value === 'function' ? value(current[field]) : value },
  };
}

/** Oculta valores padrão neutros, mas preserva zero quando ele representa uma seleção válida. */
export function activeFilterEntries(filters, defaults = {}) {
  return Object.entries(filters || {}).filter(([key, value]) => {
    if (value == null || value === '' || value === false) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object')
      return Object.values(value).some((item) => item != null && item !== '');
    return value !== defaults[key];
  });
}

export function selectionCount(selection, defaults) {
  return activeFilterEntries(selection?.filters, defaults).length + (selection?.search ? 1 : 0);
}

/** Datas de filtro são apenas datas civis; não passam por conversão de fuso horário. */
export function filterDisplay(value) {
  if (Array.isArray(value)) return value.map((item) => item || 'Sem dados').join(', ');
  if (value && typeof value === 'object')
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${item}`)
      .join('; ');
  const text = String(value ?? '');
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text.split('-').reverse().join('/') : text;
}

export function filterChips(
  filters,
  { labels = {}, defaults = {}, format = filterDisplay, remove },
) {
  return activeFilterEntries(filters, defaults).map(([key, value]) => ({
    key,
    label: labels[key] || key,
    value: format(value, key),
    remove: () => remove(key),
  }));
}
