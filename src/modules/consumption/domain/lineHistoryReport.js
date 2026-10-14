/** Relatório de um chip: preserva apurações separadas e observações, sem somar períodos sobrepostos. */
import XLSX from 'xlsx';
import { csv } from '../../../shared/export/exports.js';

export function lineHistoryReport(timeline, notes, generatedAt = new Date().toISOString()) {
  const current = timeline.at(-1);
  if (!current) throw new Error('Selecione uma linha com histórico disponível.');
  const selectedNotes = notes
    .filter((note) => note.operator === current.operator && note.iccid === current.iccid)
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    context: [
      ['Relatório', 'Histórico de consumo e acompanhamento de uma linha'],
      ['Gerado em', generatedAt],
      ['Armazenamento', 'Local neste navegador; sem sincronização entre usuários'],
      ['Operadora', current.operator],
      ['ICCID', current.iccid],
      ['MSISDN na apuração mais recente', current.number],
      ['Cliente na referência operacional atual', current.link?.client || 'Linha não identificada'],
      ['Placa na referência operacional atual', current.link?.plate || 'Linha não identificada'],
      ['Equipamento na referência operacional atual', current.link?.serial || 'Não informado'],
      ['Apurações', timeline.length],
      ['Observações salvas', selectedNotes.length],
      ['Última marcação por data da ação', selectedNotes.at(-1)?.status || 'Sem acompanhamento'],
      [
        'Escopo',
        'Todas as apurações em uso de operadora + ICCID; independente dos filtros do topo',
      ],
      [
        'Regra',
        'MB por dia = consumo da apuração / dias da apuração. Períodos podem se sobrepor e não são somados.',
      ],
      [
        'Referência',
        'O vínculo operacional atual não comprova localização histórica. As ações preservam o vínculo exibido no registro.',
      ],
    ],
    periods: [
      [
        'Operadora',
        'ICCID',
        'MSISDN',
        'Apuração',
        'Dias',
        'Consumo MB',
        'MB por dia',
        'Arquivo',
        'Linha CSV',
      ],
      ...timeline.map((row) => [
        row.operator,
        row.iccid,
        row.number,
        row.period,
        row.days,
        row.mb,
        row.mbDay,
        row.filename,
        row.sourceRow,
      ]),
    ],
    notes: [
      [
        'Operadora',
        'ICCID',
        'Data da ação',
        'Marcação',
        'Observação',
        'Cliente registrado na ação',
        'Equipamento registrado na ação',
        'Placa registrada na ação',
      ],
      ...selectedNotes.map((note) => [
        note.operator,
        note.iccid,
        note.date,
        note.status,
        note.text,
        note.client || '',
        note.serial || '',
        note.plate || '',
      ]),
    ],
  };
}

export function lineHistoryCsv(report) {
  return csv([
    ...report.context,
    [],
    ['APURAÇÕES'],
    ...report.periods,
    [],
    ['ACOMPANHAMENTO'],
    ...report.notes,
  ]);
}

/** Identificadores e textos permanecem strings; o Excel recebe MB e dias como números. */
export function lineHistoryWorkbook(report) {
  const book = XLSX.utils.book_new();
  for (const [name, rows] of [
    ['Contexto', report.context],
    ['Apurações', report.periods],
    ['Acompanhamento', report.notes],
  ]) {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = rows[0].map(() => ({ wch: 24 }));
    XLSX.utils.book_append_sheet(book, sheet, name);
  }
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}
