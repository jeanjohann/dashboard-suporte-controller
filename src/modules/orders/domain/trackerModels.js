/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
// Regras de classificação fornecidas pelo usuário; não alteram o ID original.
export const trackerModelPrefixes = {
  162: 'MXT-162',
  144: 'MXT-130v2',
  130: 'MXT-130v1',
  137: 'MXT-130v1',
  141: 'MXT-141',
  142: 'MXT-141',
  143: 'MXT-141',
};
/** Classifica o modelo pelos prefixos de ID aprovados, sem substituir o modelo nem o ID da planilha. */
export function trackerModel(cell) {
  if (!cell || cell.issue || cell.raw == null || cell.raw === '') return null;
  if (typeof cell.raw === 'number' && (!Number.isSafeInteger(cell.raw) || cell.raw < 0))
    return null;
  const id = String(cell.raw).trim();
  if (!/^\d{3,}$/.test(id)) return null;
  return trackerModelPrefixes[id.slice(0, 3)] || null;
}
