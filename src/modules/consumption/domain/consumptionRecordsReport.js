/** CSV do recorte ou seleção explícita. Preserva unidades, identificadores, regras e proteção contra fórmulas. */
import { csv } from '../../../shared/export/exports.js';
import { consumptionEligible, VOLUME_SCALE } from './lineConsumption.js';
export function consumptionRecordsCsv(
  exporting,
  { selectedOnly, filters, periods, search, reference, factor },
) {
  return csv([
    ['Relatório', 'Consumo de linhas'],
    [
      'Escopo exportado',
      selectedOnly ? 'Somente linhas marcadas do recorte atual' : 'Todas as linhas filtradas',
    ],
    ['Quantidade de registros exportados', exporting.length],
    [
      'Limite absoluto',
      filters.minimumMB === '' || filters.minimumMB == null
        ? 'Sem limite'
        : `Consumo total estritamente acima de ${filters.minimumMB} MB por apuração`,
    ],
    ['Critério', 'Dados móveis por chip e período. SMS e frete separados. KB / 1024 = MB.'],
    ['Períodos', JSON.stringify(periods)],
    ['Filtros', JSON.stringify({ ...filters, busca: search })],
    ['Referência operacional', reference?.filename || 'Não importada'],
    [
      'Investigação',
      `Acima de ${factor} vezes a média da operadora no período, incluindo zeros; sem inferir defeito.`,
    ],
    [],
    [
      'Operadora',
      'ICCID',
      'MSISDN',
      'Plano / produto',
      'Início',
      'Fim',
      'Dias',
      'Consumo MB',
      'MB por dia',
      'Média de referência MB',
      'Vezes a média',
      'Vínculo',
      'Cliente na referência',
      'ID equipamento na referência',
      'Placa na referência',
      'Situação no extrato',
      'Valor faturado de dados BRL',
      'Valor total de dados BRL',
      'Arquivo',
      'Linha CSV',
      'Revisão',
    ],
    ...exporting.map((row) => [
      row.operator,
      row.iccid,
      row.number,
      row.plan,
      row.start || '',
      row.end || '',
      row.days || '',
      consumptionEligible(row) ? row.ticks / VOLUME_SCALE : 'Não disponível',
      consumptionEligible(row) ? row.ticks / VOLUME_SCALE / row.days : 'Não disponível',
      row.baselineAverage == null ? '' : row.baselineAverage / VOLUME_SCALE,
      row.ratio ?? '',
      row.linkState,
      row.link?.client || '',
      row.link?.serial || '',
      row.link?.plate || '',
      row.status,
      row.billedCents == null ? '' : row.billedCents / 100,
      row.totalCents == null ? '' : row.totalCents / 100,
      row.filename,
      row.sourceRow,
      row.problems.join('; '),
    ]),
  ]);
}
