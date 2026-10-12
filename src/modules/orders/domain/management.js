import { isUnproductive } from './attendanceKind.js';
/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field } from '../../../shared/data/filters.js';
/** Resume realizados e agenda, permitindo uma base própria para previsões sem misturá-las aos custos realizados. */
export function managementMetrics(data, schedulingData = data) {
  const completed = data.rows.filter((row) =>
    ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw),
  );
  const maintenance = completed.filter(
    (row) =>
      !isUnproductive(data, row) &&
      field(data, row, 'Tipo de Serviço')?.raw === 'Assistência Técnica',
  );
  const group = (rows, label) => {
    if (!data.columns.some((col) => col.label === label)) return null;
    const groups = new Map();
    for (const row of rows) {
      const cell = field(data, row, label);
      const name = cell?.issue
        ? 'Valor com erro'
        : String(cell?.raw ?? '').trim() || 'Sem responsável / identificação';
      const item = groups.get(name) || { label: name, value: 0, rows: [] };
      item.value++;
      item.rows.push(row.sourceRow);
      groups.set(name, item);
    }
    return [...groups.values()].sort(
      (a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'),
    );
  };
  const schedulingAvailable = schedulingData.columns.some(
    (col) => col.label === 'Resp. Agendamento',
  );
  const scheduled = schedulingData.rows.filter(
    (row) =>
      ['Concluída', 'Pago'].includes(field(schedulingData, row, 'Status')?.raw) &&
      !field(schedulingData, row, 'Resp. Agendamento')?.issue &&
      String(field(schedulingData, row, 'Resp. Agendamento')?.raw ?? '').trim(),
  );
  const schedulingGroups = new Map();
  for (const row of scheduled) {
    const name = String(field(schedulingData, row, 'Resp. Agendamento').raw).trim();
    const item = schedulingGroups.get(name) || { label: name, value: 0, rows: [] };
    item.value++;
    item.rows.push(row.sourceRow);
    schedulingGroups.set(name, item);
  }
  return {
    completed,
    maintenance,
    scheduled,
    scheduling: schedulingAvailable
      ? [...schedulingGroups.values()].sort((a, b) => b.value - a.value)
      : null,
    execution: group(
      completed.filter((row) => !isUnproductive(data, row)),
      'Resp. Execução',
    ),
    clients: group(maintenance, 'Razão Social'),
  };
}
