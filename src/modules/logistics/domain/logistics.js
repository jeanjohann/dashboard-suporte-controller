/** Leitura logística local. Uma linha é uma movimentação; não representa estoque ou quantidade de unidades. Reconhece as abas Envios/Devoluções e Enviados/Recebidos. */
import XLSX from 'xlsx';

export const logisticsSections = ['Movimentações logísticas', 'Revisão da logística'];
const layouts = [
  {
    sheet: 'Envios',
    sheetAliases: ['Envios', 'Enviados'],
    type: 'Envio',
    required: [
      'Chamado',
      'Envio',
      'Recebimento',
      'Cliente',
      'Equipamento',
      'ID',
      'Rastreio',
      'Cidade',
      'A/C',
    ],
    columnAliases: {
      'Responsável pela preparação': [
        'Responsável pela preparação',
        'Responsável Suporte',
        'Preparado por',
        'Responsável',
      ],
    },
  },
  {
    sheet: 'Devoluções',
    sheetAliases: ['Devoluções', 'Recebidos'],
    type: 'Devolução',
    required: ['Data Recebimento', 'Equipamento', 'ID', 'Cliente', 'Placa', 'Situação'],
    columnAliases: {
      'Data Recebimento': ['Data Recebimento', 'Data Rec.'],
      Placa: ['Placa', 'Placa/Prefixo'],
      Situação: ['Situação', 'Obs'],
    },
  },
];
const text = (value) => String(value ?? '').trim();
const missing = (value) => ['', '-'].includes(text(value));

/** Interpreta datas do Excel ou textos brasileiros/ISO completos apenas para análise. */
export function logisticsDate(cell, date1904 = false) {
  if (!cell || cell.error || missing(cell.raw)) return null;
  let parts;
  if (typeof cell.raw === 'number') {
    const parsed = XLSX.SSF.parse_date_code(cell.raw, { date1904 });
    if (parsed) parts = [parsed.y, parsed.m, parsed.d];
  } else if (typeof cell.raw === 'string') {
    const raw = text(cell.raw),
      br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw),
      iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (br) parts = [Number(br[3]), Number(br[2]), Number(br[1])];
    else if (iso) parts = iso.slice(1).map(Number);
  }
  if (
    !parts ||
    parts[0] < 1900 ||
    parts[0] > 9999 ||
    (parts[0] === 1900 && parts[1] === 2 && parts[2] === 29)
  )
    return null;
  const value = parts.map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
  const instant = new Date(value + 'T00:00:00Z');
  return Number.isFinite(+instant) && instant.toISOString().slice(0, 10) === value ? value : null;
}

/** Preserva cabeçalhos, células, fórmulas armazenadas e linhas; não expande kits ou listas de IDs. */
export function importLogistics(buffer) {
  const book = XLSX.read(buffer, {
    type: 'array',
    cellNF: true,
    cellText: true,
  });
  const date1904 = Boolean(book.Workbook?.WBProps?.date1904),
    rows = [],
    issues = [],
    sheets = [];
  for (const layout of layouts) {
    const matches = layout.sheetAliases.filter((name) => book.Sheets[name]?.['!ref']);
    if (matches.length !== 1)
      throw Error(
        matches.length
          ? `Mais de uma aba corresponde a ${layout.sheet}: ${matches.join(', ')}.`
          : `A aba “${layout.sheet}” (${layout.sheetAliases.join(' ou ')}) não foi encontrada ou está vazia.`,
      );
    const sourceSheet = matches[0],
      sheet = book.Sheets[sourceSheet],
      range = XLSX.utils.decode_range(sheet['!ref']);
    const canonicalHeader = (label) =>
      Object.entries(layout.columnAliases || {}).find(([, aliases]) =>
        aliases.includes(label),
      )?.[0] || label;
    const columns = Array.from({ length: range.e.c + 1 }, (_, index) => ({
      index,
      letter: XLSX.utils.encode_col(index),
      sourceLabel: text(sheet[XLSX.utils.encode_cell({ r: 0, c: index })]?.v),
      label: canonicalHeader(text(sheet[XLSX.utils.encode_cell({ r: 0, c: index })]?.v)),
    })).filter((column) => column.label);
    if (
      layout.required.some(
        (label) => columns.filter((column) => column.label === label).length !== 1,
      )
    )
      throw Error(
        `Confira os cabeçalhos da primeira linha de ${sourceSheet}: ${layout.required.join(', ')}.`,
      );
    let emptyRows = 0;
    for (let r = 1; r <= range.e.r; r++) {
      const cells = columns.map((column) => {
        const cell = sheet[XLSX.utils.encode_cell({ r, c: column.index })];
        return {
          raw: cell?.v ?? null,
          display: cell?.w ?? text(cell?.v),
          formula: cell?.f ?? null,
          error: cell?.t === 'e',
          format: cell?.z ?? '',
          address: `${column.letter}${r + 1}`,
        };
      });
      if (cells.every((cell) => cell.raw == null && !cell.formula)) {
        emptyRows++;
        continue;
      }
      const row = {
        key: `${layout.sheet}:${r + 1}`,
        sheet: layout.sheet,
        sourceSheet,
        type: layout.type,
        sourceRow: r + 1,
        columns,
        cells,
      };
      const get = (label) => cells[columns.findIndex((column) => column.label === label)];
      const flag = (label, reason) => {
        const cell = get(label);
        issues.push({
          key: row.key,
          sheet: row.sheet,
          row: row.sourceRow,
          address: cell.address,
          column: label,
          value: cell.display,
          reason,
        });
      };
      for (const column of columns) {
        const cell = get(column.label);
        if (cell.error) flag(column.label, 'Erro registrado no Excel.');
        else if (cell.formula && cell.raw == null)
          flag(column.label, 'Fórmula sem resultado armazenado; recalcular e salvar no Excel.');
      }
      for (const key of ['Cliente', 'Equipamento', 'ID'])
        if (missing(get(key)?.raw)) flag(key, 'Campo ausente; identificação para conferência.');
      for (const [key, label] of Object.entries({
        id: 'ID',
        client: 'Cliente',
        equipment: 'Equipamento',
        call: 'Chamado',
        plate: 'Placa',
        tracking: 'Rastreio',
        city: 'Cidade',
        recipient: 'A/C',
        condition: 'Situação',
      }))
        row[key] = text(get(label)?.raw);
      row.preparedBy = text(get('Responsável pela preparação')?.raw);
      const idCell = get('ID');
      if (!missing(row.id) && !/^\d+$/.test(row.id))
        flag(
          'ID',
          'ID não é um identificador numérico único; não dividir ou corrigir automaticamente.',
        );
      if (
        typeof idCell.raw === 'number' &&
        (!Number.isSafeInteger(idCell.raw) || row.id.length > 15)
      )
        flag('ID', 'Identificador numérico pode ter perdido precisão no Excel.');
      if (idCell.format && XLSX.SSF.is_date(idCell.format))
        flag('ID', 'Coluna ID com formato de data; conferir a formatação original.');
      const dateLabels = layout.type === 'Envio' ? ['Envio', 'Recebimento'] : ['Data Recebimento'];
      const dates = Object.fromEntries(
        dateLabels.map((label) => {
          const cell = get(label),
            value = logisticsDate(cell, date1904);
          if (!value)
            flag(
              label,
              missing(cell.raw)
                ? 'Sem data registrada; não comprova pendência ou ausência de recebimento.'
                : 'Data incompatível; excluída dos indicadores temporais.',
            );
          return [label, value];
        }),
      );
      row.sentAt = dates.Envio ?? null;
      row.receivedAt = dates.Recebimento ?? dates['Data Recebimento'] ?? null;
      row.eventDate = layout.type === 'Envio' ? row.sentAt : row.receivedAt;
      const inverted = row.sentAt && row.receivedAt && row.receivedAt < row.sentAt;
      if (inverted) flag('Recebimento', 'Recebimento anterior ao envio; conferir datas.');
      row.receiptRecorded = Boolean(row.receivedAt && !inverted);
      rows.push(row);
    }
    sheets.push({ name: layout.sheet, sourceName: sourceSheet, columns, emptyRows });
  }
  // Repetição é verificada no arquivo completo; filtros não apagam sua indicação.
  const groups = new Map();
  for (const row of rows) {
    if (!/^\d+$/.test(row.id) || !row.eventDate) continue;
    const key = JSON.stringify([row.sheet, row.id, row.eventDate]);
    groups.set(key, [...(groups.get(key) || []), row]);
  }
  for (const group of groups.values())
    if (group.length > 1)
      for (const row of group) {
        const cell = row.cells[row.columns.findIndex((column) => column.label === 'ID')];
        issues.push({
          key: row.key,
          sheet: row.sheet,
          row: row.sourceRow,
          address: cell.address,
          column: 'ID',
          value: cell.display,
          reason:
            'Mesmo ID e data na mesma aba: possível duplicidade, mantida para revisão manual.',
        });
      }
  return { rows, issues, sheets, date1904 };
}

/** Recorta movimentações; data de evento é envio na saída e recebimento na devolução. */
export function selectLogistics(
  data,
  { type = '', receipt = '', start = '', end = '', search = '' } = {},
) {
  const query = search.trim().toLocaleLowerCase('pt-BR');
  const invalidPeriod = Boolean(start && end && start > end);
  let missingDates = 0;
  const rows = data.rows.filter((row) => {
    if (
      (type && row.type !== type) ||
      (receipt === 'recorded' && !row.receiptRecorded) ||
      (receipt === 'undated' && row.receiptRecorded) ||
      (query &&
        !row.cells.some((cell) =>
          (text(cell.raw) + ' ' + cell.display).toLocaleLowerCase('pt-BR').includes(query),
        ))
    )
      return false;
    if (start || end) {
      if (!row.eventDate) {
        missingDates++;
        return false;
      }
      if (invalidPeriod || (start && row.eventDate < start) || (end && row.eventDate > end))
        return false;
    }
    return true;
  });
  const keys = new Set(rows.map((row) => row.key));
  const shipments = rows.filter((row) => row.type === 'Envio'),
    returns = rows.filter((row) => row.type === 'Devolução');
  return {
    rows,
    issues: data.issues.filter((issue) => keys.has(issue.key)),
    invalidPeriod,
    missingDates,
    shipments: shipments.length,
    shipmentsReceived: shipments.filter((row) => row.receiptRecorded).length,
    returns: returns.length,
    returnsReceived: returns.filter((row) => row.receiptRecorded).length,
  };
}
