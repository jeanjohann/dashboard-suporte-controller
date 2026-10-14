/** Valores numéricos das análises estratégicas; os formatos de tela não participam da exportação. */
export const financialFields = [
  ['cost', 'Custo total lançado'],
  ['technician', 'Serviço técnico'],
  ['travel', 'Deslocamento'],
  ['client', 'Contratual Cliente'],
  ['absorbed', 'Contratual Addlog'],
  ['addlogCost', 'Custo total em cobranças Addlog'],
];
const reais = (metric) => (metric?.count ? metric.sum / 100 : null);
const average = (metric) => (metric?.count ? metric.sum / metric.count / 100 : null);

/** Moedas em reais e percentuais em pontos percentuais; ausência permanece null, inclusive no CSV. */
export function insightExportValues(kind, item) {
  if (kind === 'clients')
    return [
      item.label,
      item.rows.length,
      item.calls.size,
      ...financialFields.map(([key]) => reais(item[key])),
      `${item.cost.count} / ${item.rows.length}`,
    ];
  if (kind === 'composition') {
    const c = item.composition,
      total = c.technician + c.travel;
    return [
      item.label,
      c.count ? c.technician / 100 : null,
      c.count ? c.travel / 100 : null,
      total > 0 ? (c.travel / total) * 100 : null,
      `${c.count} / ${item.rows.length}`,
      reais(item.cost),
    ];
  }
  if (kind === 'calls')
    return [
      item.label,
      item.rows.length,
      reais(item.cost),
      average(item.cost),
      `${item.cost.count} / ${item.rows.length}`,
    ];
  if (kind === 'monthly')
    return [
      item.label,
      item.rows.length,
      reais(item.cost),
      average(item.cost),
      reais(item.travel),
      item.share.count && item.share.cost !== 0
        ? (item.share.travel / item.share.cost) * 100
        : null,
      `${item.cost.count} / ${item.rows.length}`,
      item.share.count,
    ];
  throw new Error('Análise sem contrato de exportação numérica.');
}
