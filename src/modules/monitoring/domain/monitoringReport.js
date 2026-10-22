import { monitoringBands, monitoringPeriodLabel } from './monitoringPeriods.js';
import { clientDisplay } from '../../../shared/data/clientDisplay.js';
/** Relatórios locais do retrato analisado; demonstração é identificada no contexto e em cada linha. */
import XLSX from 'xlsx';
import { csv } from '../../../shared/export/exports.js';
import { monitoringStates, monitoringIndicator } from './monitoring.js';
import { monitoringAnalytics } from './monitoringAnalytics.js';
import { reminderExportRows } from './monitoringReminders.js';
import { monitoringTelemetry } from './monitoringTelemetry.js';

/** Monta o recorte completo e o resumo das bases; a situação filtra somente as linhas detalhadas. */
export function monitoringReport(
  result,
  filters,
  notes = {},
  reminders = [],
  reminderStorage = 'local',
) {
  const analysis = monitoringAnalytics(result, notes);
  const telemetry = monitoringTelemetry(result);
  const vehicleKeys = new Set(result.rows.map((row) => row.key));
  const mode = result.demonstration ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'Dados de monitoramento';
  return {
    context: [
      ['Modo', mode],
      ['Referência', result.referenceAt],
      ['Filtros', JSON.stringify(filters)],
      ['Limite de atenção', monitoringPeriodLabel(filters.threshold || 48)],
      ['Critério', 'Faixas de 48/72/96 h e 30/60/90 dias; coleta utilizável há menos de 2 h.'],
      [
        'Base dos cards',
        'Todas as situações das bases e modelos selecionados; veículos respeitam situação, status, recorte e busca da fila.',
      ],
      [
        'Persistência',
        reminderStorage === 'remote'
          ? 'Tratamento: memória da sessão. Lembretes e seu histórico: banco do sistema, conforme acesso do piloto.'
          : 'Tratamento: memória da sessão. Lembretes e seu histórico: somente neste navegador/usuário, sem sincronização.',
      ],
      [
        'Telemetria',
        'Alimentação em volts; perfil preservado como configuração. Nenhum alerta de tensão/perfil.',
      ],
      [
        'Histórico',
        'Somente atualizações registradas pelo usuário; rascunhos não alteram status e não entram no relatório.',
      ],
    ],
    vehicles: [
      [
        'Modo',
        'Base',
        'Placa',
        'Veículo ID',
        'Rastreador ID',
        'Alimentação (V)',
        'Perfil',
        'Última atualização ISO',
        'Horas desde a atualização',
        'Faixa visual',
        'Situação técnica',
        'Última coleta ISO',
        'Acompanhamento',
        'Responsável',
        'Observações',
        'Identificador legado',
        'Modelo do rastreador',
        'Posições nas últimas 24 h (registros, não MB)',
        'Falha de alimentação externa',
        'Estado da bateria interna (código)',
        'Carga da bateria interna (%)',
        'Base ID',
        'Referência do relatório ISO',
        'Limite de atenção (horas)',
        'Filtros da categoria',
      ],
      ...result.rows.map((row) => [
        mode,
        clientDisplay(row.clientName),
        row.plate,
        row.vehicleId,
        row.trackerId,
        row.supplyVoltageV ?? '',
        row.profile ?? '',
        row.lastRecordAt || '',
        row.hours ?? '',
        monitoringIndicator(row).label,
        monitoringStates[row.state],
        row.collectionAt,
        notes[row.key]?.status || 'Não iniciado',
        notes[row.key]?.owner || '',
        notes[row.key]?.text || '',
        row.identifier ?? '',
        row.deviceModel ?? '',
        row.positions24h ?? '',
        row.externalPowerFailure == null ? '' : row.externalPowerFailure ? 'Sim' : 'Não',
        row.batteryState ?? '',
        row.batteryPercent ?? '',
        row.clientId,
        result.referenceAt,
        filters.threshold || 48,
        JSON.stringify(filters),
      ]),
    ],
    summary: [
      ['Modo', 'Base', 'Veículos', 'Acima do limite', 'Percentual da frota'],
      ...result.groups.map((group) => [
        mode,
        clientDisplay(group.label),
        group.total,
        group.alerts,
        group.percentage / 100,
      ]),
    ],
    indicators: [
      ['Indicador', 'Valor', 'Base / unidade'],
      [
        'Veículos monitorados',
        result.totals.fleet,
        'Todas as situações das bases e modelos selecionados',
      ],
      ['Acima do limite', analysis.alerts, 'Coleta utilizável; limite selecionado'],
      ['96 h ou mais', result.totals.critical, 'Coleta utilizável'],
      ...monitoringBands.map((band) => [
        band.label,
        result.buckets.find((row) => row.label === band.label)?.value ?? 0,
        'Faixa exclusiva; coleta utilizável',
      ]),
      ['Bases afetadas', analysis.affectedBases, 'Bases com ao menos um veículo acima do limite'],
      [
        'Maior tempo acima do limite',
        analysis.maximumHours,
        'Horas; datas válidas e coleta utilizável',
      ],
      [
        'Sem classificação utilizável',
        analysis.unknown,
        'Sem posição, data inválida ou coleta desatualizada',
      ],
      [
        'Em acompanhamento',
        analysis.active,
        'Em análise, Aguardando contato ou Manutenção agendada, acima do limite',
      ],
      [
        'Cobertura de acompanhamento',
        analysis.coverage,
        'Fração 0–1 sobre os veículos acima do limite; não é recuperação',
      ],
      ...analysis.stages.map((item) => [item.label, item.value, 'Veículos acima do limite']),
      [
        'Falha de alimentação externa',
        telemetry.externalFailure,
        `${telemetry.powerReadings} veículos com sinal utilizável; último estado recebido`,
      ],
      [
        'Bateria interna baixa',
        telemetry.batteryLow,
        `${telemetry.batteryReadings} veículos com estado reconhecido`,
      ],
      [
        'Falha da bateria interna',
        telemetry.batteryFailure,
        'Código 2 informado no último registro',
      ],
      [
        'Bateria descarregando',
        telemetry.batteryDischarging,
        'Código 3 informado no último registro',
      ],
      [
        'Posições informadas em 24 h',
        telemetry.positionsTotal,
        `${telemetry.positionsReadings} de ${telemetry.fleet} veículos com leitura; não MB`,
      ],
      [
        'Média de posições por veículo com leitura',
        telemetry.positionsAverage,
        'Inclui zeros; exclui ausência e coleta indisponível',
      ],
    ],
    power: [
      [
        'Modo',
        'Base',
        'Veículos',
        'Com sinal utilizável',
        'Falha externa',
        'Com estado de bateria reconhecido',
        'Bateria baixa',
        'Falha de bateria',
        'Descarregando',
      ],
      ...telemetry.bases.map((row) => [
        mode,
        clientDisplay(row.label),
        row.fleet,
        row.powerReadings,
        row.externalFailure,
        row.batteryReadings,
        row.batteryLow,
        row.batteryFailure,
        row.batteryDischarging,
      ]),
    ],
    positions: [
      [
        'Modo',
        'Base',
        'Veículos',
        'Com leitura utilizável',
        'Sem leitura utilizável',
        'Posições em 24 h (não MB)',
        'Média por veículo com leitura',
        'Com posições',
        'Com zero posições',
      ],
      ...telemetry.bases.map((row) => [
        mode,
        clientDisplay(row.label),
        row.fleet,
        row.positionsReadings,
        row.positionsUnknown,
        row.positionsTotal,
        row.positionsAverage,
        row.positionsActive,
        row.positionsZero,
      ]),
    ],
    models: [
      [
        'Modo',
        'Modelo',
        'Veículos',
        'Acima do limite',
        'Fração acima do limite',
        'Com sinal de alimentação',
        'Falha externa',
        'Com estado de bateria',
        'Bateria baixa',
        'Falha da bateria',
        'Com leitura de posições',
        'Posições em 24 h (não MB)',
      ],
      ...telemetry.models.map((row) => [
        mode,
        clientDisplay(row.label),
        row.fleet,
        row.delayed,
        row.delayed / row.fleet,
        row.powerReadings,
        row.externalFailure,
        row.batteryReadings,
        row.batteryLow,
        row.batteryFailure,
        row.positionsReadings,
        row.positionsTotal,
      ]),
    ],
    reminders: reminderExportRows(
      reminders.filter((record) => vehicleKeys.has(record.key)),
      result.demonstration,
    ),
    history: [
      [
        'Modo',
        'Base',
        'Placa',
        'Veículo ID',
        'Rastreador ID',
        'Registro ISO',
        'Status',
        'Responsável',
        'O que foi tratado',
      ],
      ...result.rows.flatMap((row) =>
        (notes[row.key]?.history || []).map((entry) => [
          mode,
          clientDisplay(row.clientName),
          row.plate,
          row.vehicleId,
          row.trackerId,
          entry.at,
          entry.status,
          entry.owner,
          entry.text,
        ]),
      ),
    ],
  };
}

/** Exporta contexto e veículos com proteção de texto contra fórmulas de planilha. */
export function monitoringCsv(tables, { vehiclesOnly = false } = {}) {
  if (vehiclesOnly) return csv(tables.vehicles);
  return csv([
    ...tables.context,
    [],
    ...tables.vehicles,
    [],
    ['Resumo por base'],
    ...tables.summary,
    [],
    ['Indicadores das bases e modelos selecionados'],
    ...tables.indicators,
    [],
    ['Alimentação por base — último estado recebido'],
    ...tables.power,
    [],
    ['Posições por base — janela móvel de 24 h, não MB'],
    ...tables.positions,
    [],
    ['Equipamentos por modelo'],
    ...tables.models,
    [],
    ['Histórico do acompanhamento'],
    ...tables.history,
    [],
    ['Lembretes de conferência do recorte'],
    ...tables.reminders,
  ]);
}

/** Mantém identificadores como texto, volts numéricos, percentuais e o histórico registrado em aba própria. */
export function monitoringWorkbook(tables) {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of [
    ['Contexto', tables.context],
    ['Veículos', tables.vehicles],
    ['Resumo por base', tables.summary],
    ['Indicadores', tables.indicators],
    ['Alimentação por base', tables.power],
    ['Posições por base', tables.positions],
    ['Modelos', tables.models],
    ['Histórico', tables.history],
    ['Lembretes', tables.reminders],
  ]) {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    if (name === 'Resumo por base')
      for (let row = 2; row <= rows.length; row++)
        if (sheet[`E${row}`]) sheet[`E${row}`].z = '0.0%';
    if (name === 'Indicadores') {
      const row = rows.findIndex((entry) => entry[0] === 'Cobertura de acompanhamento') + 1;
      if (sheet[`B${row}`]) sheet[`B${row}`].z = '0.0%';
    }
    const columns = Math.max(...rows.map((row) => row.length), 1);
    sheet['!cols'] = Array.from({ length: columns }, (_, index) => ({
      wch: Math.min(
        52,
        Math.max(14, ...rows.slice(0, 200).map((row) => String(row[index] ?? '').length)),
      ),
    }));
    if (name !== 'Contexto' && rows.length > 1)
      sheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: rows.length - 1, c: columns - 1 },
        }),
      };
    if (name === 'Modelos')
      for (let row = 2; row <= rows.length; row++)
        if (sheet['E' + row]) sheet['E' + row].z = '0.0%';
    if (name === 'Veículos')
      for (let row = 2; row <= rows.length; row++)
        if (sheet['U' + row]) sheet['U' + row].z = '0.0"%"';
    XLSX.utils.book_append_sheet(book, sheet, name);
  }
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
