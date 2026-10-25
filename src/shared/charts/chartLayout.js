/** Reserva somente o espaço necessário para os valores do eixo, preservando suas unidades. */
export function valueAxisWidth(items, format) {
  const values = items.map((item) => item.value).filter(Number.isFinite);
  const labels = [0, Math.min(0, ...values), Math.max(0, ...values)].map((value) =>
    String(format(value)),
  );
  return Math.max(40, Math.min(100, Math.max(...labels.map((label) => label.length)) * 6 + 12));
}

/** Pagina a apresentação sem alterar a escala, os totais ou a coleção exportada. */
export function chartPage(items, page, size = 10) {
  const last = Math.max(0, Math.ceil(items.length / size) - 1);
  const current = Math.max(0, Math.min(page, last));
  return { current, last, items: items.slice(current * size, (current + 1) * size) };
}
