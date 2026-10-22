/** MB decimal; bytes originais permanecem inteiros no contrato e na exportação. */
export function koreMegabytes(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value / 1000000 : null;
}
export function formatKoreMegabytes(value) {
  const mb = koreMegabytes(value);
  return mb == null
    ? 'Não informado'
    : `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} MB`;
}
