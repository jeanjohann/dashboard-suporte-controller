/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { isUnproductive } from './attendanceKind.js';
import { field } from '../../../shared/data/filters.js';
import { money } from './analysis.js';
/** Reúne indicadores de volume, chamados e finanças para os cards, usando as bases já analisadas. */
export function summaryMetrics(data, financial, devices) {
  const statusAvailable = data.columns.some((col) => col.label === 'Status');
  const completed = data.rows.filter((row) =>
    ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw),
  );
  const costs = completed.filter((row) => money(field(data, row, 'Custo Total')) != null);
  const travel = completed.filter((row) => money(field(data, row, 'Km')) != null);
  const rows = (values) => values.map((row) => row.sourceRow);
  return [
    {
      key: 'completed',
      label: 'Visitas e atendimentos',
      value: statusAvailable ? completed.length : null,
      note: 'Concluída ou Pago',
      rows: rows(completed),
    },
    {
      key: 'calls',
      label: 'Chamados com realizados',
      value: statusAvailable ? new Set(completed.map((row) => row.os)).size : null,
      note: 'Chamados distintos com serviço realizado',
      rows: rows(completed),
    },
    {
      key: 'cost',
      label: 'Custo total',
      value: financial?.totals.cost ?? null,
      currency: true,
      note: `${costs.length} valores válidos · total lançado`,
      rows: rows(costs),
    },
    {
      key: 'average',
      label: 'Custo médio por atendimento',
      value: financial && costs.length ? financial.totals.cost / costs.length : null,
      currency: true,
      note: `Denominador: ${costs.length} custos válidos`,
      rows: rows(costs),
    },
    {
      key: 'travel',
      label: 'Deslocamento total',
      value: financial?.totals.travel ?? null,
      currency: true,
      note: `${travel.length} valores válidos · reais, não km`,
      rows: rows(travel),
    },
    {
      key: 'trackers',
      label: 'Trocas de rastreadores',
      value: devices?.trackerAvailable ? devices.swaps.length : null,
      note: 'Eventos de troca · duas linhas por evento',
      rows:
        devices?.swaps.flatMap((swap) => swap.rows ?? [swap.removalRow, swap.installationRow]) ??
        [],
    },
    {
      key: 'collector',
      label: 'Trocas de coletoras',
      value: devices?.accessoryAvailable ? devices.accessories.Coletora : null,
      note: 'Inclui teclado e terminal de jornada',
      rows: devices?.accessoryRows.Coletora ?? [],
    },
    {
      key: 'rfid',
      label: 'Trocas de RFID',
      value: devices?.accessoryAvailable ? devices.accessories.RFID : null,
      note: 'Uma linha por troca de leitor',
      rows: devices?.accessoryRows.RFID ?? [],
    },
    {
      key: 'productive',
      label: 'Intervenções executadas',
      value: statusAvailable ? completed.filter((row) => !isUnproductive(data, row)).length : null,
      note: 'Concluída/Pago sem Motivo Visita Improdutiva',
      rows: rows(completed.filter((row) => !isUnproductive(data, row))),
    },
    {
      key: 'unproductive',
      label: 'Visitas improdutivas',
      value: statusAvailable ? completed.filter((row) => isUnproductive(data, row)).length : null,
      note: 'Motivo Visita Improdutiva',
      rows: rows(completed.filter((row) => isUnproductive(data, row))),
    },
  ];
}
