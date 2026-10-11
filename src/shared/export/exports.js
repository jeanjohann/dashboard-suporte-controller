/**
 * Exportação local de relatórios e gráficos. As ações do aplicativo verificam a permissão antes do download.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { authorizeAction } from '../security/accessClient.js';
const safeText = (value) => {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};
/** Gera CSV com separador brasileiro, BOM e proteção contra fórmulas provenientes de texto. */
export function csv(rows) {
  return (
    '\ufeff' +
    rows
      .map((row) =>
        row
          .map((value) =>
            typeof value === 'number' ? String(value).replace('.', ',') : safeText(value),
          )
          .join(';'),
      )
      .join('\r\n')
  );
}
/** Exporta os grupos do relatório com medida, contexto e referências para conferência. */
export function reportCsv(result, { grouping, measure, measureLabel, filename, filters }) {
  const monetary = ['cost', 'travel', 'client', 'absorbed'].includes(measure);
  return csv([
    ['Suporte Controller · relatório'],
    ['Arquivo', filename],
    ['Agrupamento', grouping],
    ['Medida', measureLabel],
    ['Filtros', JSON.stringify(filters)],
    ['Regra', 'Somente Concluída/Pago; valores contratuais não são recebimentos'],
    ['Elegíveis', result.eligible],
    ['Excluídos', result.excluded],
    ['Observação', 'Chamados distintos não são aditivos entre grupos'],
    [],
    [grouping, measureLabel, monetary ? 'Unidade: BRL' : 'Unidade: quantidade', 'Linhas Excel'],
    ...result.items.map((item) => [
      item.label,
      monetary ? item.value / 100 : item.value,
      '',
      item.rows.join(', '),
    ]),
  ]);
}
/** Confere a permissão de exportação, inicia o download local e libera a URL temporária. */
export async function download(content, type, filename) {
  if (!(await authorizeAction('export'))) return;
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
/** Constrói um SVG exportável, escapando textos e incluindo título, valores e contexto. */
export function chartSvg(
  items,
  {
    title,
    subtitle,
    format,
    note = 'Somente realizados · valores contratuais não são recebimentos',
  },
) {
  const width = 1200,
    labelWidth = 480,
    barWidth = 470,
    max = Math.max(1, ...items.map((item) => Math.abs(item.value))),
    signed = items.some((item) => item.value < 0);
  let cursor = 140;
  const rows = items
    .map((item) => {
      const lines = String(item.label).match(/.{1,52}(?:\s|$)|.{1,52}/g) || [''];
      const y = cursor;
      cursor += Math.max(44, lines.length * 19 + 20);
      const size = ((Math.abs(item.value) / max) * barWidth) / (signed ? 2 : 1);
      const x = signed ? labelWidth + barWidth / 2 - (item.value < 0 ? size : 0) : labelWidth;
      return `<g><text x="24" y="${y}" font-size="13">${lines.map((line, i) => `<tspan x="24" dy="${i ? 19 : 0}">${escape(line.trim())}</tspan>`).join('')}</text><rect x="${x}" y="${y - 14}" width="${size}" height="19" fill="${escape(item.color || (item.value < 0 ? '#ba5675' : '#176b5c'))}" rx="3"/><text x="1180" y="${y}" font-size="13" text-anchor="end">${escape(format(item.value))}</text></g>`;
    })
    .join('');
  const height = cursor + 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><g font-family="Arial,sans-serif" fill="#192c43"><text x="24" y="35" font-size="22" font-weight="bold">${escape(title)}</text><text x="24" y="62" font-size="12">${escape(subtitle)}</text><text x="24" y="86" font-size="11">${escape(note)}</text>${rows}</g></svg>`;
}
