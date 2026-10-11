/**
 * Regras de análise das Ordens de Serviço. Preservam a origem das linhas e distinguem ausência de dados de valor zero.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { field, attendanceDate } from '../../../shared/data/filters.js';
import { accessoryCategory, explicitAccessoryReplacement } from './equipment.js';
import {
  trackerReplacementPairs,
  trackerKind,
  trackerMotives,
  sourceText,
  validSerial,
  validPlate,
  completed,
} from './trackerReplacements.js';
import { trackerModel } from './trackerModels.js';
const normalized = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const daysBetween = (start, end) =>
  (Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000;
/** Confere formato ISO e existência da data no calendário, evitando que datas impossíveis sejam normalizadas silenciosamente. */
export function validLifeDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + 'T00:00:00Z')) &&
    new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value
  );
}
export const lifeStates = {
  replaced: 'Primeira troca confirmada',
  observed: 'Sem troca registrada até o limite',
  canceled: 'Observação encerrada por cancelamento',
  review: 'Ciclo precisa de revisão',
};
/** Calcula média, mediana, mínimo e máximo somente das primeiras trocas confirmadas; ciclos abertos não entram nessas estatísticas. */
export function lifeStats(periods) {
  const complete = periods.filter((p) => p.state === 'replaced'),
    values = complete.map((p) => p.days).sort((a, b) => a - b),
    middle = Math.floor(values.length / 2);
  return {
    total: periods.length,
    complete: complete.length,
    observed: periods.filter((p) => p.state === 'observed').length,
    canceled: periods.filter((p) => p.state === 'canceled').length,
    review: periods.filter((p) => p.state === 'review').length,
    mean: values.length ? values.reduce((s, x) => s + x, 0) / values.length : null,
    median: values.length
      ? values.length % 2
        ? values[middle]
        : (values[middle - 1] + values[middle]) / 2
      : null,
    min: values.length ? values[0] : null,
    max: values.length ? values.at(-1) : null,
    bins: [
      { label: 'Até 30 dias', value: values.filter((x) => x <= 30).length },
      { label: '31–90 dias', value: values.filter((x) => x > 30 && x <= 90).length },
      { label: '91–180 dias', value: values.filter((x) => x > 90 && x <= 180).length },
      { label: '181–365 dias', value: values.filter((x) => x > 180 && x <= 365).length },
      { label: 'Mais de 365 dias', value: values.filter((x) => x > 365).length },
    ],
  };
}
/** Agrupa os ciclos por modelo ou outro atributo e mantém as mesmas regras estatísticas em todos os grupos. */
export function lifeGroups(periods, groupBy = 'model') {
  const groups = new Map();
  for (const p of periods) {
    const label = p[groupBy] || 'Sem identificação';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(p);
  }
  return [...groups]
    .map(([label, items]) => ({ label, periods: items, ...lifeStats(items) }))
    .sort((a, b) => b.complete - a.complete || a.label.localeCompare(b.label, 'pt-BR'));
}
function explicitAccessoryInstallation(data, row) {
  const instruction = field(data, row, 'Instruções');
  return (
    sourceText(data, row, 'Motivo') === 'Instalação de Acessório' &&
    instruction &&
    !instruction.issue &&
    !explicitAccessoryReplacement(instruction) &&
    /\b(instalacao|instalar)\b/.test(normalized(instruction.raw))
  );
}
/** Reconstrói ciclos e a primeira troca a partir do histórico completo, mantendo ambiguidades na revisão e aplicando a seleção ao resultado. */
export function fieldLife(
  original,
  selected,
  { referenceDate, basis = 'initial', scope = 'installation' } = {},
) {
  const required = [
    'Status',
    'Tipo de Serviço',
    'Motivo',
    'Razão Social',
    'Placa',
    'Data de atendimento',
  ];
  const common = required.every((label) => original.columns.some((col) => col.label === label));
  const replacement = trackerReplacementPairs(original),
    trackerAvailable = common && replacement.available,
    accessoryAvailable = common && original.columns.some((col) => col.label === 'Instruções');
  const realized = original.rows.filter((row) => completed(original, row)),
    latest =
      realized
        .map((row) => attendanceDate(original, row))
        .filter(Boolean)
        .sort()
        .at(-1) || null;
  const empty = {
    trackerAvailable,
    accessoryAvailable,
    latest,
    periods: [],
    unmeasured: [],
    review: [],
    pairs: replacement.pairs,
  };
  if (!common || (!trackerAvailable && !accessoryAvailable)) return { ...empty, unavailable: true };
  if (referenceDate != null && !validLifeDate(referenceDate))
    return { ...empty, invalidReference: true };
  if (!latest)
    return {
      ...empty,
      unavailable: true,
      reason: 'O histórico realizado não possui datas válidas.',
    };
  const limit = referenceDate && referenceDate < latest ? referenceDate : latest;
  const chosen = new Set(selected.rows.map((row) => row.sourceRow));
  const entries = realized.map((row) => ({
    row,
    id: row.sourceRow,
    client: sourceText(original, row, 'Razão Social'),
    plate: sourceText(original, row, 'Placa'),
    serial: sourceText(original, row, 'ID Rastreador'),
    date: attendanceDate(original, row),
    kind: trackerKind(original, row),
    type: sourceText(original, row, 'Tipo de Serviço'),
    category: accessoryCategory(field(original, row, 'Instruções')),
    accessoryInstallation: explicitAccessoryInstallation(original, row),
    accessorySwap:
      sourceText(original, row, 'Tipo de Serviço') === 'Assistência Técnica' &&
      sourceText(original, row, 'Motivo') === 'Manutenção de Acessório' &&
      explicitAccessoryReplacement(field(original, row, 'Instruções')),
  }));
  const byRemoval = new Map(replacement.pairs.map((p) => [p.removalRow, p])),
    byIncoming = new Map(replacement.pairs.map((p) => [p.installationRow, p]));
  const starts = [];
  for (const e of entries) {
    if (
      trackerAvailable &&
      ((basis === 'initial' &&
        e.type === 'Implementação' &&
        trackerMotives.installation.includes(sourceText(original, e.row, 'Motivo'))) ||
        (basis === 'replacement' && byIncoming.has(e.id)))
    )
      starts.push({
        ...e,
        equipment: 'Rastreador',
        model:
          trackerModel(field(original, e.row, 'ID Rastreador')) ||
          'Modelo não identificado pelo ID',
      });
    if (
      accessoryAvailable &&
      e.category &&
      ((basis === 'initial' && e.accessoryInstallation) ||
        (basis === 'replacement' && e.accessorySwap))
    )
      starts.push({ ...e, equipment: e.category, model: e.category });
  }
  const byIdDate = (id) => entries.find((e) => e.id === id)?.date;
  const allPeriods = [],
    review = [];
  for (const start of starts) {
    const base = {
      key: start.equipment + ':' + start.id,
      category: start.equipment,
      model: start.model,
      client: start.client,
      plate: start.plate,
      serial: start.equipment === 'Rastreador' ? start.serial : '',
      start: start.date,
      end: null,
      days: null,
      installationRow: start.id,
      removalRow: null,
      replacementRow: null,
      rows: [start.id],
      basis,
    };
    if (start.date && start.date > limit) continue;
    let state = 'observed',
      reason =
        'Nenhuma troca identificada no histórico consultado. A atividade atual do equipamento não é confirmada.',
      end = limit,
      endpoint = null,
      evidence = [];
    if (
      !start.date ||
      !start.client ||
      !validPlate(start.plate) ||
      (start.equipment === 'Rastreador' && !validSerial(original, start.row))
    ) {
      state = 'review';
      end = null;
      reason = 'Instalação com data, cliente, placa ou serial ausente/incompatível.';
    } else {
      // A second initial installation cannot erase an unresolved earlier start.
      const prior =
        basis === 'initial'
          ? entries
              .filter(
                (e) =>
                  e.id !== start.id &&
                  e.client === start.client &&
                  e.plate === start.plate &&
                  e.date &&
                  e.date < start.date &&
                  (start.equipment === 'Rastreador'
                    ? e.serial === start.serial && e.kind
                    : (e.category === start.equipment &&
                        (e.accessoryInstallation || e.accessorySwap)) ||
                      (e.kind === 'removal' && e.type === 'Cancelamento')),
              )
              .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)[0]
          : null;
      const duplicateStart =
        prior &&
        (start.equipment === 'Rastreador'
          ? prior.kind !== 'removal'
          : prior.type !== 'Cancelamento');
      const candidates = [];
      for (const event of entries) {
        if (
          event.id === start.id ||
          (event.date && (event.date < start.date || event.date > limit))
        )
          continue;
        const sameVehicle = event.client === start.client && event.plate === start.plate;
        let candidate = null;
        if (start.equipment === 'Rastreador') {
          const sameSerial = event.serial === start.serial && validSerial(original, event.row);
          if (!event.kind) continue;
          if (sameSerial && !sameVehicle)
            candidate = {
              state: 'review',
              reason:
                'O mesmo serial aparece instalado/retirado em outro cliente ou placa antes do encerramento deste ciclo.',
            };
          else if (
            sameVehicle &&
            event.kind === 'removal' &&
            (sameSerial || !validSerial(original, event.row))
          ) {
            if (!sameSerial)
              candidate = {
                state: 'review',
                reason:
                  'Retirada na mesma placa com serial incompatível; a primeira troca não pode ser resolvida.',
              };
            else if (event.type === 'Cancelamento')
              candidate = {
                state: 'canceled',
                reason: 'Retirada por cancelamento; não entra no tempo até troca.',
              };
            else if (byRemoval.has(event.id))
              candidate = {
                state: 'replaced',
                reason:
                  'Retirada e entrada de seriais diferentes confirmadas no mesmo chamado, cliente, placa e data.',
                pair: byRemoval.get(event.id),
              };
            else
              candidate = {
                state: 'review',
                reason:
                  'Primeira retirada sem par confirmado de substituição; não procurar uma troca posterior para completar o ciclo.',
              };
          } else if (sameVehicle && ['installation', 'reinstallation'].includes(event.kind)) {
            const incoming = byIncoming.get(event.id);
            if (incoming && incoming.oldSerial === start.serial) continue;
            candidate = {
              state: 'review',
              reason: sameSerial
                ? 'Nova instalação/reinstalação do mesmo serial sem encerramento inequívoco; revisar continuidade.'
                : 'Outro serial foi instalado na placa sem retirada vinculada deste equipamento.',
            };
          }
        } else if (sameVehicle) {
          if (event.accessorySwap && (event.category === start.equipment || !event.category))
            candidate = event.category
              ? {
                  state: 'replaced',
                  reason: 'Troca explícita da mesma categoria de acessório na placa.',
                }
              : {
                  state: 'review',
                  reason:
                    'Troca de acessório sem categoria inequívoca antes do encerramento deste ciclo.',
                };
          else if (event.accessoryInstallation && event.category === start.equipment)
            candidate = {
              state: 'review',
              reason: 'Outra instalação da mesma categoria sem troca intermediária; revisar ciclo.',
            };
          else if (event.kind === 'removal' && event.type === 'Cancelamento')
            candidate = {
              state: 'canceled',
              reason:
                'Cancelamento no veículo encerra a observação; não comprova troca do acessório.',
            };
        }
        if (candidate) candidates.push({ ...candidate, event });
      }
      const undated = candidates.filter((c) => !c.event.date);
      if (duplicateStart) {
        state = 'review';
        end = null;
        reason =
          'Instalação inicial anterior sem encerramento inequívoco; não escolher automaticamente a instalação mais recente.';
        evidence = [prior.id];
      } else if (undated.length) {
        state = 'review';
        end = null;
        reason = 'Evento relevante sem data válida impede determinar a primeira troca.';
        evidence = undated.map((c) => c.event.id);
      } else if (candidates.length) {
        candidates.sort(
          (a, b) => a.event.date.localeCompare(b.event.date) || a.event.id - b.event.id,
        );
        const first = candidates[0],
          sameDay = candidates.filter((c) => c.event.date === first.event.date);
        endpoint = first.event;
        end = endpoint.date;
        evidence = sameDay.flatMap((c) => (c.pair ? c.pair.rows : [c.event.id]));
        if (end === start.date || sameDay.length > 1) {
          state = 'review';
          reason =
            end === start.date
              ? 'Instalação e encerramento na mesma data, sem horário para estabelecer sequência.'
              : 'Vários eventos de encerramento/conflito na mesma data; vínculo ambíguo.';
        } else {
          state = first.state;
          reason = first.reason;
        }
        if (state === 'replaced') {
          base.removalRow = endpoint.id;
          base.replacementRow = first.pair?.installationRow ?? endpoint.id;
        }
      }
    }
    const period = {
      ...base,
      state,
      reason,
      end,
      days: state === 'review' || !end || !start.date ? null : daysBetween(start.date, end),
      rows: [...new Set([start.id, ...evidence])],
      endpointRow: endpoint?.id ?? null,
    };
    allPeriods.push(period);
  }
  const periods = allPeriods.filter((p) =>
    scope === 'event'
      ? p.endpointRow != null && chosen.has(p.endpointRow)
      : chosen.has(p.installationRow),
  );
  for (const p of periods.filter((p) => p.state === 'review'))
    review.push({ category: p.category, rows: p.rows, reason: p.reason });
  for (const issue of replacement.issues)
    if (chosen.has(issue.row) && (!byIdDate(issue.row) || byIdDate(issue.row) <= limit))
      review.push({ category: 'Rastreador', rows: [issue.row], reason: issue.reason });
  for (const e of entries)
    if (
      accessoryAvailable &&
      chosen.has(e.id) &&
      (!e.date || e.date <= limit) &&
      (e.accessorySwap || e.accessoryInstallation) &&
      !e.category
    )
      review.push({
        category: 'Acessório não identificado',
        rows: [e.id],
        reason: 'Categoria ausente ou ambígua; não atribuir automaticamente a RFID ou coletora.',
      });
  const unmeasured = [];
  const events = [
    ...replacement.pairs.map((pair) => ({
      category: 'Rastreador',
      date: pair.date,
      row: pair.removalRow,
      rows: pair.rows,
      client: pair.client,
      plate: pair.plate,
      serial: pair.oldSerial,
    })),
    ...entries
      .filter((e) => e.accessorySwap && e.category)
      .map((e) => ({
        category: e.category,
        date: e.date,
        row: e.id,
        rows: [e.id],
        client: e.client,
        plate: e.plate,
        serial: '',
      })),
  ];
  for (const event of events) {
    if (!chosen.has(event.row) || (event.date && event.date > limit)) continue;
    if (
      allPeriods.some(
        (p) =>
          p.state === 'replaced' && p.removalRow === event.row && p.category === event.category,
      )
    )
      continue;
    const candidates = starts.filter(
      (s) =>
        s.equipment === event.category &&
        s.client === event.client &&
        s.plate === event.plate &&
        (event.category !== 'Rastreador' || s.serial === event.serial) &&
        s.date &&
        event.date &&
        s.date <= event.date,
    );
    unmeasured.push({
      ...event,
      reason: !event.date
        ? 'Troca sem data válida.'
        : candidates.length
          ? 'Ciclo anterior já encerrado ou com vínculo que precisa de revisão.'
          : basis === 'initial'
            ? 'Instalação inicial correspondente não encontrada.'
            : 'Entrada anterior por troca não encontrada.',
    });
  }
  return {
    ...empty,
    unavailable: false,
    reference: limit,
    referenceCapped: Boolean(referenceDate && referenceDate > latest),
    periods,
    unmeasured,
    review,
    excludedAfterReference: starts.filter((s) => chosen.has(s.id) && s.date && s.date > limit)
      .length,
  };
}
