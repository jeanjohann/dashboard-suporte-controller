/** Seleção do consumo: uma apuração por operadora e filtros combinados sobre a base já analisada. */
import { periodOptions, periodKey } from './lineConsumption.js';
import { aboveConsumptionLimit } from './consumptionSelection.js';
export const consumptionFilterFields = [
  ['operator', 'Operadora'],
  ['plan', 'Plano / produto'],
  ['client', 'Cliente vinculado'],
  ['model', 'Modelo vinculado'],
  ['linkState', 'Vínculo operacional'],
  ['status', 'Situação no extrato'],
];

/** Mantém uma apuração por operadora; seleção ausente no histórico retorna ao período mais recente disponível. */
export function consumptionPeriods(statements, filters) {
  const operators = [...new Set(statements.map((statement) => statement.operator))].sort();
  const periods = Object.fromEntries(
    operators.map((operator) => {
      const options = periodOptions(statements, operator);
      return [
        operator,
        options.some((option) => option.key === filters.periods?.[operator])
          ? filters.periods[operator]
          : options[0]?.key,
      ];
    }),
  );

  return periods;
}
/** Aplica OU nas opções do mesmo campo e E entre os campos, preservando a ordem e as referências da base. */
export function selectConsumptionRows(allRows, periods, filters, search) {
  const fields = consumptionFilterFields;
  const selected = allRows.filter(
    (row) =>
      row.service === 'dados' &&
      periodKey(row) === periods[row.operator] &&
      fields.every(
        ([key]) => !filters[key]?.length || filters[key].includes(row[key] || 'Não informado'),
      ) &&
      aboveConsumptionLimit(row, filters.minimumMB) &&
      (!filters.consumption ||
        (filters.consumption === 'zero' && row.ticks === 0) ||
        (filters.consumption === 'positive' && row.ticks > 0) ||
        (filters.consumption === 'attention' && row.attention)) &&
      (!search ||
        [row.number, row.iccid, row.plan, row.client, row.serial, row.link?.plate].some((value) =>
          String(value || '')
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR')),
        )),
  );

  return selected;
}
