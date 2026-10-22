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
export function reconcileMonitoringRegistry(snapshot, operational) {
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
      const pairs = [
        ['Placa', api[0].plate, op[0].plate, plate],
        ['Cliente/base', api[0].clientName || api[0].clientId, op[0].client, name],
        ['Modelo', api[0].deviceModel, op[0].model, model],
      ];
      for (const [label, left, right, normalize] of pairs) {
        const field = label === 'Cliente/base' ? 'client' : label === 'Placa' ? 'plate' : 'model';
        if (operationalCell(op[0], field)?.error || !text(left) || !text(right))
          issues.push(`${label}: informação ausente ou inválida em uma das fontes.`);
        else if (normalize(left) !== normalize(right))
          issues.push(
            label === 'Placa'
              ? 'Placa: valores diferentes nas duas fontes.'
              : `${label}: valores diferentes; conferir equivalência de nomes/códigos${label === 'Modelo' ? ' e variante do modelo' : ''}.`,
          );
      }
      state = issues.length ? registryStates[1] : registryStates[0];
    }
    result.push({ key: `serial:${id}`, serial: id, state, ...sources, issues });
  }
  return {
    rows: result,
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
    ]),
  ];
}
