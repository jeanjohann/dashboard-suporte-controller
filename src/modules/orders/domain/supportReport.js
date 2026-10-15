/** Exportações do suporte: percentuais numéricos e registros originais, sem duplicar cálculos. */
import XLSX from 'xlsx';
import { csv } from '../../../shared/export/exports.js';

export function supportReport(data, result, filters, filename) {
  const included = new Set(result.rows.map((row) => row.sourceRow));
  return {
    Contexto: [
      ['Arquivo', filename],
      ['Papel', result.role.label],
      ['Data utilizada', result.role.date],
      ['Filtros', JSON.stringify(filters)],
      [
        'Regra',
        'Somente Concluída/Pago; visitas improdutivas separadas. Volume não mede qualidade.',
      ],
      [
        'Base da participação',
        'Todos os atendimentos efetivos do recorte, inclusive sem responsável.',
      ],
      ['Sem responsável válido', result.missing.length],
      ['Sem data excluídos do período', result.missingDates],
      ['Sem data no gráfico', result.undated],
      [
        'Comparação anterior',
        result.range
          ? `${result.range.start} a ${result.range.end}`
          : 'Indisponível sem intervalo completo',
      ],
      ['Observação', 'Chamados e clientes distintos não são aditivos entre responsáveis.'],
    ],
    Resumo: [
      ['Indicador', 'Quantidade'],
      ...Object.entries({
        'Visitas e atendimentos': result.totals.visits,
        'Atendimentos efetivos': result.totals.productive,
        'Visitas improdutivas': result.totals.unproductive,
        'Chamados distintos': result.totals.calls,
        'Clientes identificados': result.totals.clients,
      }),
    ],
    Responsáveis: [
      [
        'Responsável',
        'Atendimentos efetivos',
        'Visitas improdutivas',
        'Visitas e atendimentos',
        'Chamados distintos',
        'Clientes',
        'Participação dos efetivos',
        'Efetivos no período anterior',
        'Linhas Excel',
      ],
      ...result.groups.map((item) => [
        item.label,
        item.productive,
        item.unproductive,
        item.visits,
        item.calls,
        item.clients,
        item.share,
        item.previous,
        item.rows.join(', '),
      ]),
    ],
    Evolução: [
      ['Período', 'Efetivos', 'Improdutivas', 'Linhas Excel'],
      ...result.periods.map((item) => [
        item.label,
        item.productive,
        item.unproductive,
        item.rows.join(', '),
      ]),
    ],
    Perfil: [
      ['Responsável', 'Tipo de serviço / visita', 'Quantidade', 'Linhas Excel'],
      ...result.profiles.map((item) => [item.owner, item.type, item.value, item.rows.join(', ')]),
    ],
    Atendimentos: [
      ['Linha Excel', ...data.columns.map((column) => column.label)],
      ...data.rows
        .filter((row) => included.has(row.sourceRow))
        .map((row) => [row.sourceRow, ...row.cells.map((cell) => cell.raw ?? '')]),
    ],
  };
}
export const supportCsv = (tables) =>
  csv(Object.entries(tables).flatMap(([name, rows]) => [[name], ...rows, []]));
export function supportWorkbook(tables) {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(tables)) {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    if (name === 'Responsáveis')
      for (let row = 2; row <= rows.length; row++)
        if (sheet[`G${row}`]) sheet[`G${row}`].z = '0.0%';
    XLSX.utils.book_append_sheet(book, sheet, name);
  }
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
