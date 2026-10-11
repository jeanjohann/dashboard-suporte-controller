/** Relatórios locais do retrato analisado; demonstração é identificada no contexto e em cada linha. */
import XLSX from 'xlsx';
import { csv } from '../../../shared/export/exports.js';
import { monitoringStates } from './monitoring.js';

/** Monta o recorte completo e o resumo das bases; a situação filtra somente as linhas detalhadas. */
export function monitoringReport(result, filters, notes = {}) {
  const mode = result.demonstration ? 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' : 'Dados de monitoramento';
  return {
    context: [
      ['Modo', mode],
      ['Referência', result.referenceAt],
      ['Filtros', JSON.stringify(filters)],
      ['Critério', 'Limites provisórios 48/72/96 h; coleta utilizável há menos de 2 h.'],
      [
        'Base dos cards',
        'Todas as situações dos clientes selecionados; tabela respeita o filtro de situação.',
      ],
      ['Persistência', 'Acompanhamento nesta etapa: apenas memória da sessão.'],
    ],
    vehicles: [
      [
        'Modo',
        'Base',
        'Placa',
        'Veículo ID',
        'Rastreador ID',
        'Último registro ISO',
        'Horas desde o registro',
        'Situação técnica',
        'Última coleta ISO',
        'Acompanhamento',
        'Responsável',
        'Observações',
      ],
      ...result.rows.map((row) => [
        mode,
        row.clientName,
        row.plate,
        row.vehicleId,
        row.trackerId,
        row.lastRecordAt || '',
        row.hours ?? '',
        monitoringStates[row.state],
        row.collectionAt,
        notes[row.key]?.status || 'Não iniciado',
        notes[row.key]?.owner || '',
        notes[row.key]?.text || '',
      ]),
    ],
    summary: [
      ['Modo', 'Base', 'Veículos', 'Acima do limite', 'Percentual da frota'],
      ...result.groups.map((group) => [
        mode,
        group.label,
        group.total,
        group.alerts,
        group.percentage / 100,
      ]),
    ],
  };
}

/** Exporta contexto e veículos com proteção de texto contra fórmulas de planilha. */
export function monitoringCsv(tables) {
  return csv([...tables.context, [], ...tables.vehicles]);
}

/** Gera três abas, mantendo identificadores como texto e percentuais como frações numéricas. */
export function monitoringWorkbook(tables) {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of [
    ['Contexto', tables.context],
    ['Veículos', tables.vehicles],
    ['Resumo por base', tables.summary],
  ]) {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    if (name === 'Resumo por base')
      for (let row = 2; row <= rows.length; row++)
        if (sheet[`E${row}`]) sheet[`E${row}`].z = '0.0%';
    XLSX.utils.book_append_sheet(book, sheet, name);
  }
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
