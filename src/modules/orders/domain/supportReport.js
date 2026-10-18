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
      ...(result.person ? [['Responsável selecionado', result.person]] : []),
      [
        'Regra',
        'Somente Concluída/Pago; visitas improdutivas separadas. Volume não mede qualidade.',
      ],
      [
        'Base da participação',
        'Todos os atendimentos efetivos do recorte, inclusive sem responsável.',
      ],
      ['Efetivos na base da participação', result.participationBase ?? result.totals.productive],
      [
        'Base do percentual de improdutivas',
        'Visitas improdutivas / todas as visitas e atendimentos realizados do mesmo papel e recorte. Não atribui causa ao suporte.',
      ],
      [
        'Base dos registros por chamado',
        'Todas as linhas realizadas / números de chamado distintos. Não mede esforço ou tempo trabalhado.',
      ],
      [
        'Veículos',
        'Pares cliente/filial + placa utilizáveis. CNPJ completo da coluna C identifica o cliente quando disponível; sem CNPJ, nome original. Não representa frota ativa.',
      ],
      ['Linhas sem cliente + placa utilizáveis', result.totals.vehiclesMissing],
      ['Sem responsável válido', result.missing.length],
      ['Sem data excluídos do período', result.missingDates],
      ['Sem data no gráfico', result.undated],
      [
        'Comparação anterior',
        result.range
          ? `${result.range.start} a ${result.range.end}`
          : 'Indisponível sem intervalo completo',
      ],
      [
        'Observação',
        'Chamados, clientes e veículos distintos não são aditivos entre responsáveis ou papéis.',
      ],
    ],
    Resumo: [
      ['Indicador', 'Valor', 'Unidade'],
      ...Object.entries({
        'Visitas e atendimentos': result.totals.visits,
        'Atendimentos efetivos': result.totals.productive,
        'Visitas improdutivas': result.totals.unproductive,
        'Chamados distintos': result.totals.calls,
        'Clientes identificados': result.totals.clients,
      }).map((row) => [...row, 'quantidade']),
      ['Veículos identificados', result.totals.vehicles, 'quantidade'],
      ['Visitas improdutivas / total realizado', result.totals.unproductiveRate, 'percentual'],
      ['Registros por chamado', result.totals.servicesPerCall, 'registros/chamado'],
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
        'Veículos identificados',
        'Percentual de visitas improdutivas',
        'Registros por chamado',
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
        item.vehicles,
        item.unproductiveRate,
        item.servicesPerCall,
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
    ...(result.clientGroups
      ? {
          Clientes: [
            ['Cliente', 'Visitas e atendimentos', 'Linhas Excel'],
            ...result.clientGroups.map((item) => [item.label, item.value, item.rows.join(', ')]),
          ],
        }
      : {}),
  };
}
export const supportCsv = (tables) =>
  csv(Object.entries(tables).flatMap(([name, rows]) => [[name], ...rows, []]));

/** Exporta os dois papéis com bases separadas e mantém cada linha original uma única vez na aba de origem. */
export function supportComparisonReport(data, execution, scheduling, filters, filename) {
  const reports = [
    ['Agendamento', supportReport(data, scheduling, filters, filename), scheduling],
    ['Execução', supportReport(data, execution, filters, filename), execution],
  ];
  const tables = {
    Contexto: [
      ['Arquivo', filename],
      ['Papel', 'Ambos'],
      ['Filtros', JSON.stringify(filters)],
      ['Data de Agendamento', scheduling.role.date],
      ['Data de Execução', execution.role.date],
      [
        'Regra',
        'Cada papel mantém seu próprio período, contagens, exclusões e participação. Não somar agendamentos e execuções como atendimentos únicos.',
      ],
      ...reports.flatMap(([role, report]) => report.Contexto.slice(4).map((row) => [role, ...row])),
    ],
  };
  for (const name of [
    'Resumo',
    'Responsáveis',
    'Evolução',
    'Perfil',
    ...(reports[0][1].Clientes ? ['Clientes'] : []),
  ])
    tables[name] = [
      ['Responsabilidade', ...reports[0][1][name][0]],
      ...reports.flatMap(([role, report]) => report[name].slice(1).map((row) => [role, ...row])),
    ];
  const sources = reports.map(([role, , result]) => [
    role,
    new Set(result.rows.map((row) => row.sourceRow)),
  ]);
  tables.Atendimentos = [
    [
      'Linha Excel',
      ...data.columns.map((column) => column.label),
      'Responsabilidades neste recorte',
    ],
    ...data.rows
      .filter((row) => sources.some(([, rows]) => rows.has(row.sourceRow)))
      .map((row) => [
        row.sourceRow,
        ...row.cells.map((cell) => cell.raw ?? ''),
        sources
          .filter(([, rows]) => rows.has(row.sourceRow))
          .map(([role]) => role)
          .join(' / '),
      ]),
  ];
  return tables;
}
export function supportWorkbook(tables) {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(tables)) {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    const format = (row, column, code) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell?.t === 'n') cell.z = code;
    };
    if (name === 'Responsáveis') {
      for (const label of ['Participação dos efetivos', 'Percentual de visitas improdutivas']) {
        const index = rows[0].indexOf(label);
        if (index >= 0) for (let row = 1; row < rows.length; row++) format(row, index, '0.0%');
      }
      const ratioIndex = rows[0].indexOf('Registros por chamado');
      if (ratioIndex >= 0)
        for (let row = 1; row < rows.length; row++) format(row, ratioIndex, '0.00');
    }
    if (name === 'Resumo') {
      const valueIndex = rows[0].indexOf('Valor'),
        unitIndex = rows[0].indexOf('Unidade');
      for (let row = 1; row < rows.length; row++) {
        if (rows[row][unitIndex] === 'percentual') format(row, valueIndex, '0.0%');
        if (rows[row][unitIndex] === 'registros/chamado') format(row, valueIndex, '0.00');
      }
    }
    XLSX.utils.book_append_sheet(book, sheet, name);
  }
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
