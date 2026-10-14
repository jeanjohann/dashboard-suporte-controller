/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import XLSX from 'xlsx';
import {
  groupedCosts,
  callInsights,
  recurringVisits,
  interventionProfiles,
  durationInsights,
  monthlyCosts,
} from './insights.js';
import { csv } from '../../../shared/export/exports.js';
export const descriptiveAnalyses = {
  clients: 'Custo por cliente',
  composition: 'Composição do custo',
  recurrence: 'Reincidência por veículo',
  calls: 'Chamados com vários serviços',
  profiles: 'Perfil das intervenções',
  duration: 'Tempo observado dos rastreadores',
  monthly: 'Evolução dos custos',
};
export const descriptiveHeaders = [
  'Análise',
  'Agrupamento',
  'Grupo',
  'Indicador',
  'Valor',
  'Unidade',
  'Base do percentual',
  'Percentual',
  'Descrição / critérios',
  'Linhas Excel (contexto)',
];
/** Gera uma linha por grupo e indicador com unidade, base percentual, critérios e linhas de origem. */
export function descriptiveReport(
  original,
  data,
  devices,
  lifecycle,
  selection = Object.keys(descriptiveAnalyses),
) {
  const records = [],
    notes = [];
  const emit = (analysis, grouping, group, indicator, value, unit, base, description, rows = []) =>
    records.push({
      analysis,
      grouping,
      group,
      indicator,
      value,
      unit,
      base,
      percentage: value != null && base > 0 ? value / base : null,
      description,
      rows: [...new Set(rows)],
    });
  const unavailable = (key) =>
    notes.push(
      `${descriptiveAnalyses[key]}: indisponível por colunas ausentes ou referência inválida.`,
    );
  for (const key of selection) {
    const title = descriptiveAnalyses[key];
    if (key === 'clients' || key === 'composition') {
      const groups = groupedCosts(data);
      if (!groups) {
        unavailable(key);
        continue;
      }
      if (key === 'clients') {
        const fields = [
          ['cost', 'Custo total lançado'],
          ['technician', 'Serviço técnico'],
          ['travel', 'Deslocamento'],
          ['client', 'Contratual Cliente'],
          ['absorbed', 'Contratual Addlog'],
          ['addlogCost', 'Custo total em cobranças Addlog'],
        ];
        const totalRows = groups.reduce((s, g) => s + g.rows.length, 0),
          calls = new Set(groups.flatMap((group) => [...group.calls])).size,
          financialBases = Object.fromEntries(
            fields.map(([field]) => [
              field,
              {
                total: groups.reduce((sum, group) => sum + group[field].sum, 0),
                negative: groups.some((group) => group[field].count && group[field].sum < 0),
              },
            ]),
          );
        for (const g of groups) {
          emit(
            title,
            'Razão Social',
            g.label,
            'Atendimentos realizados',
            g.rows.length,
            'serviços',
            totalRows,
            'Participação nos serviços realizados da seleção.',
            g.rows,
          );
          emit(
            title,
            'Razão Social',
            g.label,
            'Chamados distintos',
            g.calls.size,
            'chamados',
            calls,
            'Participação nos chamados distintos da seleção. Um chamado pode estar em vários grupos; percentuais não são aditivos.',
            g.rows,
          );
          for (const [field, label] of fields) {
            const { total, negative } = financialBases[field];
            emit(
              title,
              'Razão Social',
              g.label,
              label,
              g[field].count ? g[field].sum / 100 : null,
              'BRL',
              !negative && total > 0 ? total / 100 : null,
              `${g[field].count} valores válidos em ${g.rows.length} realizados. Total lançado mantido; valores contratuais não são recebimentos. ${negative ? 'Percentual indisponível: grupos com valores negativos.' : ''}`,
              g.rows,
            );
          }
          emit(
            title,
            'Razão Social',
            g.label,
            'Custo médio válido',
            g.cost.count ? g.cost.sum / g.cost.count / 100 : null,
            'BRL',
            null,
            `Denominador da média: ${g.cost.count} custos válidos; zero incluído. Média não possui percentual de participação.`,
            g.rows,
          );
        }
      } else
        for (const g of groups) {
          const c = g.composition,
            total = c.technician + c.travel;
          for (const [field, label] of [
            ['technician', 'Serviço técnico'],
            ['travel', 'Deslocamento'],
          ])
            emit(
              title,
              'Razão Social',
              g.label,
              label,
              c.count ? c[field] / 100 : null,
              'BRL',
              total > 0 && c.technician >= 0 && c.travel >= 0 ? total / 100 : null,
              `${c.count} linhas com ambos os componentes válidos; percentual dentro do grupo sobre Técnico + Km, sem substituir Custo Total.`,
              g.rows,
            );
        }
    } else if (key === 'calls') {
      const result = callInsights(data);
      if (!result) {
        unavailable(key);
        continue;
      }
      const total = result.items.reduce((s, g) => s + g.rows.length, 0),
        cost = result.items.reduce((s, g) => s + g.cost.sum, 0),
        negative = result.items.some((g) => g.cost.sum < 0);
      for (const g of result.items) {
        emit(
          title,
          'Chamado',
          g.label,
          'Atendimentos realizados',
          g.rows.length,
          'serviços',
          total,
          'Quantidade individual por chamado; percentual sobre realizados da seleção.',
          g.rows,
        );
        emit(
          title,
          'Chamado',
          g.label,
          'Custo total lançado',
          g.cost.count ? g.cost.sum / 100 : null,
          'BRL',
          cost > 0 && !negative ? cost / 100 : null,
          `${g.cost.count} custos válidos em ${g.rows.length} realizados.`,
          g.rows,
        );
      }
    } else if (key === 'recurrence') {
      const result = recurringVisits(original, data);
      if (!result) {
        unavailable(key);
        continue;
      }
      notes.push(
        `Reincidência: ${result.missingIdentifier} realizados sem identificação, ${result.missingDate} sem data válida.`,
      );
      const total = result.items.reduce((s, g) => s + g.visits.length, 0);
      for (const g of result.items) {
        emit(
          title,
          'Cliente + placa',
          g.label,
          'Visitas datadas',
          g.visits.length,
          'visitas',
          total,
          'Serviços do mesmo dia agrupados; percentual sobre visitas da seleção.',
          g.rows,
        );
        for (const [field, label] of [
          ['within30', 'Retornos até 30 dias'],
          ['within60', 'Retornos até 60 dias'],
          ['within90', 'Retornos até 90 dias'],
        ])
          emit(
            title,
            'Cliente + placa',
            g.label,
            label,
            g[field],
            'intervalos',
            g.intervals.length,
            'Percentual sobre intervalos elegíveis deste grupo. Janelas cumulativas; não comprovam falha. Histórico completo define consecutividade antes dos filtros.',
            g.rows,
          );
        emit(
          title,
          'Cliente + placa',
          g.label,
          'Mediana entre visitas',
          g.median,
          'dias',
          null,
          `${g.intervals.length} intervalos elegíveis; sem percentual para mediana.`,
          g.rows,
        );
      }
    } else if (key === 'profiles') {
      const groups = interventionProfiles(data, devices);
      if (!groups) {
        unavailable(key);
        continue;
      }
      const fields = [
        ['implementation', 'Implementações', 'serviços'],
        ['assistance', 'Assistências técnicas', 'serviços'],
        ['removal', 'Retiradas de rastreador', 'serviços'],
        ['trackers', 'Trocas de rastreador', 'eventos'],
        ['collector', 'Trocas de coletora', 'trocas'],
        ['rfid', 'Trocas de RFID', 'trocas'],
      ];
      for (const [field, label, unit] of fields) {
        const available =
          field === 'trackers'
            ? devices?.trackerAvailable
            : ['collector', 'rfid'].includes(field)
              ? devices?.accessoryAvailable
              : true;
        const total = available ? groups.reduce((s, g) => s + g[field], 0) : null;
        for (const g of groups)
          emit(
            title,
            'Razão Social',
            g.label,
            label,
            available ? g[field] : null,
            unit,
            total,
            'Percentual entre clientes para esta categoria. Categorias se sobrepõem e não devem ser somadas como serviços. Troca de rastreador = evento com duas linhas. Manutenção sem troca não classificada.',
            g.rows,
          );
      }
    } else if (key === 'duration') {
      const result = durationInsights(data, lifecycle);
      if (!result) {
        unavailable(key);
        continue;
      }
      for (const g of result.items) {
        emit(
          title,
          'Modelo pelo prefixo do ID na Implementação',
          g.label,
          'Ciclos encerrados',
          g.closed.length,
          'ciclos',
          result.closedCount,
          'Percentual nos ciclos encerrados; retiradas podem decorrer de cancelamento.',
          g.rows,
        );
        emit(
          title,
          'Modelo pelo prefixo do ID na Implementação',
          g.label,
          'Sem retirada registrada',
          g.open.length,
          'ciclos',
          result.openCount,
          'Percentual nos ciclos sem retirada registrada; não comprova atividade ou ausência de problemas.',
          g.rows,
        );
        emit(
          title,
          'Modelo pelo prefixo do ID na Implementação',
          g.label,
          'Mediana até retirada',
          g.median,
          'dias',
          null,
          `Somente ${g.closed.length} ciclos encerrados; ciclos abertos fora da mediana. Não estima vida útil completa.`,
          g.rows,
        );
      }
    } else if (key === 'monthly') {
      const result = monthlyCosts(data);
      if (!result) {
        unavailable(key);
        continue;
      }
      notes.push(`Evolução mensal: ${result.missingDate} realizados sem data válida excluídos.`);
      const total = result.items.reduce((s, g) => s + g.rows.length, 0),
        cost = result.items.reduce((s, g) => s + g.cost.sum, 0),
        negative = result.items.some((g) => g.cost.sum < 0);
      for (const g of result.items) {
        emit(
          title,
          'Mês de atendimento',
          g.label,
          'Atendimentos realizados',
          g.rows.length,
          'serviços',
          total,
          'Percentual entre meses com data válida.',
          g.rows,
        );
        emit(
          title,
          'Mês de atendimento',
          g.label,
          'Custo total lançado',
          g.cost.count ? g.cost.sum / 100 : null,
          'BRL',
          cost > 0 && !negative ? cost / 100 : null,
          `${g.cost.count} custos válidos no mês; percentual entre meses elegíveis.`,
          g.rows,
        );
        emit(
          title,
          'Mês de atendimento',
          g.label,
          'Custo médio válido',
          g.cost.count ? g.cost.sum / g.cost.count / 100 : null,
          'BRL',
          null,
          `Denominador da média: ${g.cost.count} custos válidos.`,
          g.rows,
        );
        emit(
          title,
          'Mês de atendimento',
          g.label,
          'Deslocamento em pares válidos',
          g.share.count ? g.share.travel / 100 : null,
          'BRL',
          g.share.count && g.share.cost > 0 ? g.share.cost / 100 : null,
          `${g.share.count} linhas com Km e Custo Total válidos; percentual = Km/Custo Total na mesma população, pode ultrapassar 100% em divergências.`,
          g.rows,
        );
      }
    }
  }
  return { records, notes };
}
export const descriptiveValues = (record) => {
  const value =
    record.value == null
      ? 'indisponível'
      : record.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' ' + record.unit;
  const participation =
    record.percentage == null
      ? 'Percentual indisponível ou não aplicável.'
      : `Participação: ${(record.percentage * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%.`;
  return [
    record.analysis,
    record.grouping,
    record.group,
    record.indicator,
    record.value,
    record.unit,
    record.base,
    record.percentage,
    `${record.group}: ${record.indicator} = ${value}. ${participation} ${record.description}`,
    record.rows.join(', '),
  ];
};
/** Serializa o resumo descritivo com arquivo, filtros e data de referência para análise fora do sistema. */
export function descriptiveCsv(result, context = {}) {
  return csv([
    [...descriptiveHeaders, 'Arquivo', 'Filtros', 'Referência dos ciclos'],
    ...result.records.map((record) => [
      ...descriptiveValues(record),
      context.filename || '',
      JSON.stringify(context.filters || {}),
      context.referenceDate || '',
    ]),
  ]);
}
/** Monta uma tabela com as células originais e o número da linha, sem substituir dados por valores calculados. */
export function originalRows(data) {
  return [
    ['Linha Excel', ...data.columns.map((col) => col.letter + ' · ' + col.label)],
    ...data.rows.map((row) => [row.sourceRow, ...row.cells.map((cell) => cell.raw ?? '')]),
  ];
}
/** Cria o XLSX com resumo, contexto e atendimentos originais opcionais, mantendo identificadores textuais. */
export function descriptiveWorkbook(
  result,
  data,
  { filename, filters, referenceDate, includeOriginal = true },
) {
  const book = XLSX.utils.book_new(),
    sheet = XLSX.utils.aoa_to_sheet([descriptiveHeaders, ...result.records.map(descriptiveValues)]);
  sheet['!cols'] = [
    { wch: 32 },
    { wch: 24 },
    { wch: 42 },
    { wch: 32 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 80 },
    { wch: 35 },
  ];
  for (let i = 0; i < result.records.length; i++) {
    const value = sheet['E' + (i + 2)],
      base = sheet['G' + (i + 2)],
      percentage = sheet['H' + (i + 2)];
    if (value?.t === 'n') value.z = result.records[i].unit === 'BRL' ? '#,##0.00' : '0.##';
    if (base?.t === 'n') base.z = result.records[i].unit === 'BRL' ? '#,##0.00' : '#,##0';
    if (percentage?.t === 'n') percentage.z = '0.00%';
  }
  sheet['!autofilter'] = { ref: sheet['!ref'] };
  XLSX.utils.book_append_sheet(book, sheet, 'Relatório');
  const criteria = XLSX.utils.aoa_to_sheet([
    ['Campo', 'Valor'],
    ['Arquivo', filename],
    ['Filtros', JSON.stringify(filters)],
    ['Referência dos ciclos abertos', referenceDate],
    ['Regra', 'Somente Concluída/Pago nos indicadores; Cancelada sem custo'],
    [
      'Percentual',
      'Valor/Base do percentual; armazenado como fração (0,1 = 10%). Base ausente ou zero deixa percentual vazio.',
    ],
    [
      'Original',
      'Atendimentos originais abrangem todos os status selecionados; não são os denominadores de todos os indicadores.',
    ],
    [
      'Ausências',
      'Valor ausente não é zero; média e mediana não possuem percentual de participação.',
    ],
    [
      'Origem',
      'Linhas referem-se ao arquivo importado; algumas populações elegíveis são subconjuntos das linhas de contexto.',
    ],
    ...result.notes.map((note) => ['Observação', note]),
  ]);
  criteria['!cols'] = [{ wch: 30 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(book, criteria, 'Critérios');
  if (includeOriginal) {
    const original = XLSX.utils.aoa_to_sheet(originalRows(data));
    for (let r = 0; r < data.rows.length; r++)
      for (let c = 0; c < data.columns.length; c++) {
        const cell = data.rows[r].cells[c],
          target = original[XLSX.utils.encode_cell({ r: r + 1, c: c + 1 })];
        if (target?.t === 'n' && /^\d{2}\/\d{2}\/\d{4}/.test(String(cell.display)))
          target.z = 'dd/mm/yyyy';
      }
    original['!cols'] = [{ wch: 12 }, ...data.columns.map(() => ({ wch: 24 }))];
    original['!autofilter'] = { ref: original['!ref'] };
    XLSX.utils.book_append_sheet(book, original, 'Atendimentos');
  }
  book.Workbook = { WBProps: { date1904: Boolean(data.date1904) } };
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
