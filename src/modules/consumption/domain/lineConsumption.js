/**
 * Leitura e análise do consumo de linhas. Identificadores são preservados como texto e duplicidades exigem revisão.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { parseCsv, parseMB, consumptionDate, displayDate, MB_SCALE } from './consumption.js';
import { operationalCell } from '../../operational/domain/operational.js';
import { trackerModel } from '../../orders/domain/trackerModels.js';
import { attachFieldEvidence } from './consumptionFieldLink.js';

// MB and KB are summed exactly, without rounding each CSV row.
export const VOLUME_SCALE = MB_SCALE * 1024;
const clean = (value) => String(value ?? '').trim();
const name = (value) =>
  clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
const validID = (value) => /^\d+$/.test(value) && !/^0+$/.test(value);
export const periodKey = (row) => JSON.stringify([row.start, row.end]);
export const chipKey = (row) => JSON.stringify([row.operator, row.iccid]);
export const periodLabel = (row) => `${displayDate(row.start)} a ${displayDate(row.end)}`;
/** Converte KB, MB ou GB em unidades inteiras comuns, evitando arredondamento por linha. */
export function dataVolume(text, defaultUnit = 'MB') {
  const match = /^([\d.,]+)\s*(KB|MB|GB)?$/i.exec(clean(text));
  if (!match) return null;
  const value = parseMB(match[1]);
  if (value == null) return null;
  const unit = (match[2] || defaultUnit).toUpperCase(),
    ticks = value * { KB: 1, MB: 1024, GB: 1048576 }[unit];
  return Number.isSafeInteger(ticks) ? ticks : null;
}
/** Interpreta os valores monetários do extrato, incluindo ajustes negativos válidos. */
export function lineMoney(text) {
  const raw = clean(text);
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(raw)) return null;
  const result = Math.round(Number(raw.replaceAll('.', '').replace(',', '.')) * 100);
  return Number.isSafeInteger(result) ? result : null;
}
/** Reconhece o extrato Arqia/Kore, interpreta unidades e períodos e preserva as linhas originais. */
export function importLineStatement(text, filename = 'CSV', id = 'preview') {
  const parsed = parseCsv(text);
  if (parsed.length < 2) throw new Error('CSV sem registros.');
  const headers = parsed[0].cells,
    names = headers.map(name);
  if (new Set(names).size !== names.length)
    throw new Error('Cabeçalhos repetidos; confira o arquivo.');
  const kore = names.includes('consumo total') && names.includes('servico'),
    arqia = names.includes('consumo (mb)') && names.includes('periodo inicio');
  if (!kore && !arqia)
    throw new Error('Formato não reconhecido. Use o consolidado de consumo da Arqia ou da Kore.');
  const operator = kore ? 'Kore' : 'Arqia';
  const aliases = kore
    ? {
        start: ['data inicio'],
        end: ['data fim'],
        plan: ['produto'],
        volume: ['consumo total'],
        company: ['empresa'],
        service: ['servico'],
        status: ['status'],
        document: ['cpnj', 'cnpj'],
        available: ['consumo disponivel'],
        billed: ['valor faturado'],
        total: ['valor total'],
        product: ['valor produto'],
        adjust: ['valor ajuste'],
        discount: ['valor desconto'],
        penalty: ['valor multa'],
      }
    : {
        start: ['periodo inicio'],
        end: ['periodo termino'],
        plan: ['plano'],
        volume: ['consumo (mb)'],
        company: ['nome fantasia'],
        document: ['cpf/cnpj'],
        technology: ['tecnologia', 'tecnologia (2g/4g)'],
        imsi2: ['imsi 2'],
        number2: ['msisdn 2'],
      };
  const indexes = Object.fromEntries(
    Object.entries({ ...aliases, iccid: ['iccid'], number: ['msisdn', 'msisn'] }).map(
      ([key, labels]) => [key, names.findIndex((label) => labels.includes(label))],
    ),
  );
  for (const key of ['start', 'end', 'volume', 'iccid', 'number', ...(kore ? ['service'] : [])])
    if (indexes[key] < 0)
      throw new Error(`Coluna obrigatória ausente: ${aliases[key]?.[0] || key}.`);
  const rows = parsed.slice(1).map((source) => {
    if (source.cells.length !== headers.length)
      throw new Error(`Linha ${source.sourceRow}: campos diferentes do cabeçalho.`);
    const get = (key) => clean(source.cells[indexes[key]]),
      start = consumptionDate(get('start')),
      end = consumptionDate(get('end')),
      service = kore ? name(get('service')) : 'dados';
    const row = {
      ...source,
      id: `${id}:${source.sourceRow}`,
      statementId: id,
      filename,
      operator,
      iccid: get('iccid'),
      number: get('number'),
      start,
      end,
      service,
      plan: get('plan').replace(/\s+/g, ' '),
      company: get('company'),
      document: get('document'),
      status: get('status'),
      technology: get('technology'),
      imsi2: get('imsi2'),
      number2: get('number2'),
      rawVolume: get('volume'),
      ticks: service === 'dados' ? dataVolume(get('volume')) : null,
      availableRaw: get('available'),
      billedCents: kore ? lineMoney(get('billed')) : null,
      totalCents: kore ? lineMoney(get('total')) : null,
      productCents: kore ? lineMoney(get('product')) : null,
      adjustCents: kore ? lineMoney(get('adjust')) : null,
      discountCents: kore ? lineMoney(get('discount')) : null,
      penaltyCents: kore ? lineMoney(get('penalty')) : null,
      problems: [],
    };
    row.period = periodLabel(row);
    row.days =
      start && end && start <= end ? (Date.parse(end) - Date.parse(start)) / 86400000 + 1 : null;
    if (service === 'dados' || service === 'sms') {
      if (!validID(row.iccid)) row.problems.push('ICCID ausente ou incompatível');
      if (!validID(row.number)) row.problems.push('MSISDN ausente ou incompatível');
    }
    if (!row.days) row.problems.push('Período ausente, inválido ou invertido');
    if (service === 'dados' && row.ticks == null)
      row.problems.push('Consumo de dados ausente ou incompatível');
    if (kore && row.totalCents == null) row.problems.push('Valor Total ausente ou incompatível');
    return row;
  });
  const groups = new Map();
  for (const row of rows) {
    if (!['dados', 'sms'].includes(row.service)) continue;
    const key = JSON.stringify([row.iccid, row.start, row.end, row.service]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const entries of groups.values())
    if (entries.length > 1)
      for (const row of entries) {
        row.duplicate = true;
        row.problems.push(
          'Chip, serviço e período repetidos no mesmo extrato; revisar antes de somar',
        );
      }
  const periods = [
    ...new Map(
      rows
        .filter((row) => row.days)
        .map((row) => [
          periodKey(row),
          {
            key: periodKey(row),
            start: row.start,
            end: row.end,
            label: row.period,
            days: row.days,
          },
        ]),
    ).values(),
  ].sort((a, b) => a.end.localeCompare(b.end));
  return { id, filename, operator, headers, rows, periods };
}
export const consumptionEligible = (row) =>
  row.service === 'dados' &&
  row.ticks != null &&
  row.days &&
  validID(row.iccid) &&
  validID(row.number) &&
  !row.duplicate;
/** Soma unidades inteiras e recusa totais que excedam a precisão segura do JavaScript. */
export function exactSum(values) {
  let sum = 0;
  for (const value of values) {
    sum += value;
    if (!Number.isSafeInteger(sum)) throw new Error('Total excede a precisão suportada.');
  }
  return sum;
}
/** Calcula estatísticas somente do consumo elegível; zero participa e ausência não é convertida em zero. */
export function consumptionSummary(rows) {
  const dataRows = rows.filter((row) => row.service === 'dados'),
    eligible = dataRows.filter(consumptionEligible),
    ticks = eligible.length ? exactSum(eligible.map((row) => row.ticks)) : null,
    active = eligible.filter((row) => row.ticks > 0),
    sorted = eligible.map((row) => row.ticks).sort((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return {
    dataRows,
    eligible,
    ticks,
    lines: new Set(dataRows.filter((row) => validID(row.iccid)).map(chipKey)).size,
    samples: eligible.length,
    active: active.length,
    zero: eligible.filter((row) => row.ticks === 0).length,
    excluded: dataRows.length - eligible.length,
    average: eligible.length ? ticks / eligible.length : null,
    activeAverage: active.length ? ticks / active.length : null,
    median: sorted.length
      ? sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2
      : null,
    max: sorted.length ? sorted.at(-1) : null,
  };
}
/** Calcula a base de comparação por operadora e período antes dos recortes de apresentação. */
export function baselineByPeriod(rows) {
  const groups = new Map();
  for (const row of rows.filter(consumptionEligible)) {
    const key = JSON.stringify([row.operator, row.start, row.end]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return new Map([...groups].map(([key, records]) => [key, consumptionSummary(records)]));
}
/** Acrescenta razão e sinalização acima do fator escolhido, sem modificar o consumo original. */
export function attachBaselines(rows, baselines, factor = 2) {
  return rows.map((row) => {
    const baseline = baselines.get(JSON.stringify([row.operator, row.start, row.end])),
      ratio =
        consumptionEligible(row) && baseline?.average > 0 ? row.ticks / baseline.average : null;
    return {
      ...row,
      baselineAverage: baseline?.average ?? null,
      baselineSamples: baseline?.samples ?? 0,
      ratio,
      attention: ratio != null && ratio > factor,
    };
  });
}
/** Vincula linhas ao parque por identificadores e mantém ambiguidades ou ausência de referência para revisão. */
export function linkConsumption(rows, source, monitoring) {
  const operational = source?.data || source;
  if (!operational?.rows)
    return attachFieldEvidence(
      rows.map((row) => ({
        ...row,
        linkState: 'Operacional não importado',
        link: null,
        candidates: [],
        client: 'Não vinculado',
        serial: 'Não informado',
        model: 'Não informado',
      })),
      monitoring,
    );
  const indexes = { iccid: new Map(), phone: new Map() };
  for (const row of operational.rows)
    for (const key of ['iccid', 'phone']) {
      const value = clean(row[key]),
        cell = operationalCell(row, key);
      if (
        !validID(value) ||
        cell?.error ||
        (typeof cell?.raw === 'number' &&
          (!Number.isSafeInteger(cell.raw) || (key === 'iccid' && value.length > 15)))
      )
        continue;
      if (!indexes[key].has(value)) indexes[key].set(value, []);
      indexes[key].get(value).push(row);
    }
  return attachFieldEvidence(
    rows.map((row) => {
      const a = indexes.iccid.get(row.iccid) || [],
        b = indexes.phone.get(row.number) || [],
        candidates = [...new Map([...a, ...b].map((item) => [item.sourceRow, item])).values()];
      let linkState,
        link = null;
      if (a.length > 1 || b.length > 1) linkState = 'Vínculo ambíguo';
      else if (a.length && b.length) {
        if (a[0].sourceRow === b[0].sourceRow) {
          linkState = 'ICCID e número conferidos';
          link = a[0];
          const serialCell = operationalCell(link, 'serial');
          if (
            !validID(link.serial) ||
            serialCell?.error ||
            (typeof serialCell?.raw === 'number' &&
              (!Number.isSafeInteger(serialCell.raw) || link.serial.length > 15))
          )
            link = { ...link, serial: '' };
        } else linkState = 'Chip e número apontam para registros diferentes';
      } else if (a.length) linkState = 'Somente ICCID corresponde — revisar';
      else if (b.length) linkState = 'Somente número corresponde — revisar';
      else linkState = 'Sem correspondência';
      return {
        ...row,
        linkState,
        link,
        candidates,
        client: link?.client || 'Não vinculado',
        serial: link?.serial || 'Não informado',
        model: link
          ? trackerModel({ raw: link.serial, issue: operationalCell(link, 'serial')?.error }) ||
            'Modelo não identificado pelo serial'
          : 'Não informado',
      };
    }),
    monitoring,
  );
}
/** Identifica o conjunto de operadora e períodos do extrato para controlar versões do histórico. */
export function statementSignature(statement) {
  return JSON.stringify([statement.operator, statement.periods.map((period) => period.key)]);
}
/** Mescla arquivos no histórico local com controle de duplicidades e versões do mesmo período. */
export function mergeHistoryFiles(existing, incoming) {
  const next = existing.map((file) => ({ ...file })),
    known = new Set(next.map((file) => file.id));
  const incomingSignatures = new Set();
  for (const file of incoming) {
    if (known.has(file.id)) continue;
    const parsed = importLineStatement(file.text, file.filename, file.id),
      signature = statementSignature(parsed);
    if (incomingSignatures.has(signature))
      throw new Error(
        'Há dois arquivos da mesma operadora e período na seleção. Importe uma versão por vez.',
      );
    incomingSignatures.add(signature);
    for (const old of next) {
      if (old.active === false) continue;
      const previous = importLineStatement(old.text, old.filename, old.id);
      if (statementSignature(previous) === signature) old.active = false;
      else if (
        previous.operator === parsed.operator &&
        previous.periods.some((period) =>
          parsed.periods.some((incoming) => incoming.key === period.key),
        )
      )
        throw new Error(
          'Apuração já presente em arquivo com outros períodos. Revise ou arquive a versão anterior antes de importar.',
        );
    }
    next.push({ ...file, active: true });
    known.add(file.id);
  }
  return next;
}
/** Alterna a versão ativa do histórico mantendo a consistência das seleções por período. */
export function toggleHistoryFile(existing, id) {
  const target = existing.find((file) => file.id === id);
  if (!target) throw new Error('Arquivo não encontrado no histórico.');
  if (target.active !== false)
    return existing.map((file) => (file.id === id ? { ...file, active: false } : { ...file }));
  const parsed = importLineStatement(target.text, target.filename, target.id),
    signature = statementSignature(parsed);
  return existing.map((file) => {
    if (file.id === id) return { ...file, active: true };
    if (file.active === false) return { ...file };
    const previous = importLineStatement(file.text, file.filename, file.id);
    if (
      previous.operator !== parsed.operator ||
      !previous.periods.some((period) => parsed.periods.some((item) => item.key === period.key))
    )
      return { ...file };
    if (statementSignature(previous) !== signature)
      throw new Error(
        'Apuração em uso em arquivo com outros períodos. Arquive essa versão antes de reativar.',
      );
    return { ...file, active: false };
  });
}
/** Reinterpreta os arquivos ativos do histórico usando as mesmas regras do importador. */
export function historyStatements(files) {
  return files
    .filter((file) => file.active !== false)
    .map((file) => importLineStatement(file.text, file.filename, file.id));
}
/** Lista períodos disponíveis de uma operadora em ordem cronológica inversa. */
export function periodOptions(statements, operator) {
  return [
    ...new Map(
      statements
        .filter((file) => file.operator === operator)
        .flatMap((file) => file.periods.map((period) => [period.key, period])),
    ).values(),
  ].sort((a, b) => b.end.localeCompare(a.end) || b.start.localeCompare(a.start));
}
/** Ordena o consumo elegível de um chip e apresenta MB total e MB/dia por período. */
export function lineTimeline(rows, key) {
  return rows
    .filter((row) => chipKey(row) === key && consumptionEligible(row))
    .sort((a, b) => a.end.localeCompare(b.end) || a.start.localeCompare(b.start))
    .map((row) => ({
      ...row,
      mb: row.ticks / VOLUME_SCALE,
      mbDay: row.ticks / VOLUME_SCALE / row.days,
    }));
}
