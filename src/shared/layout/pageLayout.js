/** Preferências visuais locais. Este contrato não contém filtros, registros ou dados importados. */
export const layoutModes = ['default', 'complete', 'summary', 'collapsed'];
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);

/** Descarta formatos desconhecidos e valores inválidos sem impedir a abertura da página. */
export function cleanLayout(value) {
  if (!object(value) || value.version !== 1 || !object(value.reports)) return null;
  return Object.fromEntries(
    Object.entries(value.reports)
      .filter(([id, item]) => id.length > 0 && id.length <= 200 && object(item))
      .map(([id, item]) => [
        id,
        {
          visible: item.visible !== false,
          mode: layoutModes.includes(item.mode) ? item.mode : 'default',
        },
      ]),
  );
}

/** Lê sem gravar: preferências anteriores de OS são usadas apenas se o formato novo não existir. */
export function readLayout(storage, key, legacy = () => ({})) {
  try {
    const parsed = cleanLayout(JSON.parse(storage.getItem(key) || 'null'));
    if (parsed) return parsed;
  } catch {}
  try {
    return legacy();
  } catch {
    return {};
  }
}

/** Atualiza somente os relatórios da categoria aberta; as outras categorias conservam suas escolhas. */
export function mergeLayout(reports, patch) {
  const sanitized = cleanLayout({ version: 1, reports: patch }) || {};
  return { ...reports, ...sanitized };
}

/** Resumo indisponível usa conteúdo completo, preservando a intenção salva para quando houver resumo. */
export function availableLayoutMode(mode, hasSummary) {
  const valid = layoutModes.includes(mode) ? mode : 'default';
  return valid === 'summary' && !hasSummary ? 'complete' : valid;
}
