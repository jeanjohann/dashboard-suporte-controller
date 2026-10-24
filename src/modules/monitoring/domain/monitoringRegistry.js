import { monitoringInstant } from './monitoring.js';
/** Conferência por serial exato; não infere equivalência entre bases do legado e razões sociais. */
import { operationalCell } from '../../operational/domain/operational.js';
import { clientDisplay } from '../../../shared/data/clientDisplay.js';

export const registryStates = [
  'Compatível nos campos comparados',
  'Campos para conferir',
  'Vínculo ambíguo',
  'Somente API',
  'Somente Operacional',
  'Identificação para revisão',
];
const text = (value) => String(value ?? '').trim();
const plate = (value) => text(value).toLocaleUpperCase('pt-BR').replace(/[\s-]/g, '');
const name = (value) => clientDisplay(text(value)).replace(/\s+/g, ' ');
const model = (value) => name(value).replace(/[\s-]/g, '');
const digits = (value) => text(value).replace(/[\s()+-]/g, '');
export function registryComparisons(api, op, equivalences = {}) {
  const mapped =
    Object.hasOwn(equivalences, api.clientId) && typeof equivalences[api.clientId] === 'string'
      ? equivalences[api.clientId]
      : null;
  return [
    ['Placa', api.plate, op.plate, plate, 'plate', true],
    ['Prefixo', api.prefix, op.prefix, name, 'prefix', false],
    ['ID rastreador', api.trackerId, op.serial, text, 'serial', true],
    ['Modelo', api.deviceModel, op.model, model, 'model', true],
    ['ICCID', api.iccid, op.iccid, text, 'iccid', false],
    ['MSISDN', api.msisdn, op.phone, digits, 'phone', false],
    ['Cliente/base', api.clientName || api.clientId, op.client, name, 'client', true],
  ].map(([field, reference, original, normalize, key, required]) => {
    const comparisonReference = field === 'Cliente/base' && mapped ? mapped : reference;
    const state = !text(reference)
      ? 'api-missing'
      : operationalCell(op, key)?.error || !text(original)
        ? 'operational-missing'
        : normalize(comparisonReference) === normalize(original)
          ? 'equal'
          : 'different';
    return {
      field,
      reference: text(reference),
      original: text(original),
      state,
      required,
      equivalent: field === 'Cliente/base' ? mapped : null,
      action:
        state === 'different' || state === 'operational-missing'
          ? 'Conferir e atualizar o lançamento do Operacional com a referência atual da API; confirmar troca/transferência antes de editar.'
          : state === 'api-missing'
            ? 'Campo não fornecido pela API: não concluir divergência deste campo.'
            : 'Sem divergência no campo comparado.',
    };
  });
}
function serial(row, source) {
  const value = source === 'api' ? row.trackerId : row.serial;
  const cell = source === 'operational' ? operationalCell(row, 'serial') : null;
  if (
    cell?.error ||
    (typeof cell?.raw === 'number' &&
      (!Number.isSafeInteger(cell.raw) || String(cell.raw).length > 15))
  )
    return '';
  return /^\d+$/.test(text(value)) ? text(value) : '';
}
export function reconcileMonitoringRegistry(snapshot, operational, equivalences = {}) {
  if (
    !snapshot ||
    snapshot.demonstration ||
    !Array.isArray(snapshot.vehicles) ||
    !Array.isArray(operational?.rows)
  )
    throw Error('Carregue as duas fontes reais antes de conferir os cadastros.');
  const index = new Map(),
    result = [];
  for (const [source, rows] of [
    ['api', snapshot.vehicles],
    ['operational', operational.rows],
  ]) {
    for (const [i, row] of rows.entries()) {
      const id = serial(row, source);
      if (!id) {
        result.push({
          key: `invalid:${source}:${i}`,
          serial: text(source === 'api' ? row.trackerId : row.serial),
          state: registryStates[5],
          api: source === 'api' ? [row] : [],
          operational: source === 'operational' ? [row] : [],
          issues: [
            'Serial ausente, inválido ou sem precisão confirmada. Nenhum vínculo foi presumido.',
          ],
        });
        continue;
      }
      if (!index.has(id)) index.set(id, { api: [], operational: [] });
      index.get(id)[source].push(row);
    }
  }
  for (const [id, sources] of index) {
    const { api, operational: op } = sources,
      issues = [];
    let state;
    if (api.length > 1 || op.length > 1) {
      state = registryStates[2];
      issues.push(
        `${api.length} registros na API e ${op.length} no Operacional para o mesmo serial. Conferir todas as origens.`,
      );
    } else if (!api.length) state = registryStates[4];
    else if (!op.length) state = registryStates[3];
    else {
      for (const item of registryComparisons(api[0], op[0], equivalences)) {
        if (item.state === 'different')
          issues.push(
            `${item.field}: valores diferentes. API é a referência atual; conferir o Operacional${item.field === 'Cliente/base' ? ' e equivalência de nomes/códigos' : ''}.`,
          );
        else if (item.state === 'operational-missing')
          issues.push(
            `${item.field}: informação ausente ou inválida no Operacional; referência disponível na API.`,
          );
        else if (item.state === 'api-missing' && item.required)
          issues.push(`${item.field}: API sem informação; conferência incompleta.`);
      }
      state = issues.length ? registryStates[1] : registryStates[0];
    }
    result.push({
      key: `serial:${id}`,
      serial: id,
      state,
      ...sources,
      issues,
      comparisons:
        api.length === 1 && op.length === 1 ? registryComparisons(api[0], op[0], equivalences) : [],
    });
  }
  return {
    rows: result,
    missingApiFields: ['prefix', 'iccid', 'msisdn'].filter(
      (key) => !snapshot.vehicles.some((row) => text(row[key])),
    ),
    apiRows: snapshot.vehicles.length,
    operationalRows: operational.rows.length,
    referenceAt: snapshot.referenceAt,
    collectionAt:
      [...snapshot.collections]
        .map((row) => row.at)
        .filter((at) => monitoringInstant(at) != null)
        .sort((a, b) => monitoringInstant(a) - monitoringInstant(b))[0] || null,
    stale: snapshot.collections.some(
      (row) =>
        !row.ok ||
        monitoringInstant(row.at) == null ||
        monitoringInstant(snapshot.referenceAt) - monitoringInstant(row.at) >= 7200000 ||
        monitoringInstant(row.at) > monitoringInstant(snapshot.referenceAt),
    ),
    counts: Object.fromEntries(
      registryStates.map((state) => [state, result.filter((row) => row.state === state).length]),
    ),
  };
}

export function registryExportRows(report, { filename = '', filters = {} } = {}) {
  return [
    [
      'Serial',
      'Conferência',
      'Placas API',
      'Clientes/bases API',
      'Modelos API',
      'Placas Operacional',
      'Clientes Operacional',
      'Modelos Operacional',
      'Linhas Operacional',
      'Situações Operacional',
      'Detalhes',
      'Referência API ISO',
      'Coleta mais antiga ISO',
      'Condição da coleta',
      'Arquivo Operacional',
      'Filtros da conferência',
      'Prefixos API',
      'ICCID API',
      'MSISDN API',
      'Prefixos Operacional',
      'ICCID Operacional',
      'MSISDN Operacional',
      'Comparação por campo e referência',
    ],
    ...report.rows.map((row) => [
      row.serial,
      row.state,
      row.api.map((r) => r.plate).join(' | '),
      row.api.map((r) => clientDisplay(r.clientName || r.clientId)).join(' | '),
      row.api.map((r) => r.deviceModel).join(' | '),
      row.operational.map((r) => r.plate).join(' | '),
      row.operational.map((r) => clientDisplay(r.client)).join(' | '),
      row.operational.map((r) => r.model).join(' | '),
      row.operational.map((r) => r.sourceRow).join(' | '),
      row.operational.map((r) => r.status).join(' | '),
      row.issues.join(' | '),
      report.referenceAt,
      report.collectionAt,
      report.stale ? 'Antiga ou indisponível; atualizar antes de concluir' : 'Coleta utilizável',
      filename,
      JSON.stringify(filters),
      row.api.map((r) => r.prefix ?? '').join(' | '),
      row.api.map((r) => r.iccid ?? '').join(' | '),
      row.api.map((r) => r.msisdn ?? '').join(' | '),
      row.operational.map((r) => r.prefix ?? '').join(' | '),
      row.operational.map((r) => r.iccid ?? '').join(' | '),
      row.operational.map((r) => r.phone ?? '').join(' | '),
      JSON.stringify(row.comparisons || []),
    ]),
  ];
}
