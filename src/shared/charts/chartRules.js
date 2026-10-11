/**
 * Critérios compartilhados de disponibilidade dos gráficos e limites de ranking.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
/** Determina quais representações são compatíveis com os valores, incluindo as restrições do gráfico de pizza. */
export function chartAvailability(items, measure) {
  if (measure === 'calls')
    return 'Chamados distintos podem participar de vários grupos; use barras, linhas ou tabela.';
  if (items.some((item) => item.value < 0)) return 'Pizza e rosca exigem valores não negativos.';
  if (items.reduce((sum, item) => sum + item.value, 0) <= 0)
    return 'Sem total positivo para pizza ou rosca.';
  return null;
}
/** Limita a apresentação do ranking sem alterar a base usada nas estatísticas. */
export function rankingItems(items, limit) {
  const sorted = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.value - a.item.value || a.index - b.index)
    .map((entry) => entry.item);
  return limit === 'all' ? sorted : sorted.slice(0, Number(limit));
}
