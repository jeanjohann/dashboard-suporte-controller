/** Consultas determinísticas somente às amostras aprovadas. O modelo não executa código nem SQL. */
import { field, attendanceDate, applyFilters } from '../src/shared/data/filters.js';
import { periodMetrics } from '../src/modules/orders/domain/dashboard.js';
import { customerAnalysisIdentity } from '../src/modules/orders/domain/customerIdentity.js';
import { equipment } from '../src/modules/orders/domain/equipment.js';
import { fieldLife, lifeStats, validLifeDate } from '../src/modules/orders/domain/fieldLife.js';
import { linkOperational } from '../src/modules/operational/domain/operational.js';

const normalize = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const done = (data, row) => ['Concluída', 'Pago'].includes(field(data, row, 'Status')?.raw);
const productive = (data, row) =>
  done(data, row) && field(data, row, 'Motivo')?.raw !== 'Visita Improdutiva';
const move = (date, days) =>
  new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
const keys = [
  'tipo',
  'periodo',
  'inicio',
  'fim',
  'responsavel',
  'papel',
  'cliente',
  'placa',
  'agrupar',
  'limite',
  'situacao',
  'semHistorico',
  'detalhar',
  'ordenar',
];

export function validateDemoQuery(input = {}) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => !keys.includes(key))
  )
    throw Error('Parâmetros de consulta não reconhecidos.');
  const q = {
    tipo: 'atendimentos',
    periodo: 'ultimo_mes',
    papel: 'execucao',
    agrupar: '',
    limite: 10,
    semHistorico: false,
    detalhar: false,
    ordenar: 'total',
    ...input,
  };
  for (const key of [
    'tipo',
    'periodo',
    'inicio',
    'fim',
    'responsavel',
    'papel',
    'cliente',
    'placa',
    'agrupar',
    'situacao',
    'ordenar',
  ]) {
    if (q[key] != null && (typeof q[key] !== 'string' || q[key].length > 100))
      throw Error('Filtro de texto inválido.');
    if (typeof q[key] === 'string') q[key] = q[key].trim();
  }
  if (
    !['atendimentos', 'trocas', 'parque'].includes(q.tipo) ||
    ![
      'ultimo_mes',
      'semana_atual',
      'semana_anterior',
      'ultimos_7_dias',
      'personalizado',
      'total',
    ].includes(q.periodo) ||
    !['execucao', 'agendamento'].includes(q.papel) ||
    !['', 'responsavel', 'cliente', 'placa', 'modelo'].includes(q.agrupar)
  )
    throw Error('Tipo, período, papel ou agrupamento indisponível.');
  if (
    !Number.isInteger(q.limite) ||
    q.limite < 1 ||
    q.limite > 20 ||
    typeof q.semHistorico !== 'boolean' ||
    typeof q.detalhar !== 'boolean'
  )
    throw Error('Limite de 1 a 20 e opções booleanas obrigatórios.');
  if (q.periodo === 'personalizado') {
    if (!validLifeDate(q.inicio) || !validLifeDate(q.fim) || q.inicio > q.fim)
      throw Error('Informe início e fim válidos em AAAA-MM-DD.');
  } else if (q.inicio || q.fim) throw Error('Datas explícitas exigem período personalizado.');
  if (
    q.tipo === 'parque' &&
    (q.periodo !== 'total' ||
      q.responsavel ||
      !['', 'cliente', 'modelo', 'placa'].includes(q.agrupar))
  )
    throw Error('Parque é fotografia atual. Use período total, sem responsável.');
  if (q.tipo !== 'parque' && (q.situacao || q.semHistorico))
    throw Error('Situação e semHistorico aplicam-se somente ao parque.');
  if (q.situacao && !['Ativo', 'Cancelado'].includes(q.situacao))
    throw Error('Situação deve ser Ativo ou Cancelado.');
  if (q.tipo !== 'parque' && q.agrupar === 'modelo')
    throw Error('Agrupamento por modelo disponível somente para parque.');
  if (
    !['total', 'efetivos', 'improdutivos', 'custo'].includes(q.ordenar) ||
    (q.tipo !== 'atendimentos' && q.ordenar !== 'total')
  )
    throw Error('Ordenação alternativa disponível apenas para ranking de atendimentos.');
  return q;
}
function matched(value, options, label) {
  if (!value) return null;
  const exact = options.filter((option) => normalize(option) === normalize(value));
  const candidates = exact.length
    ? exact
    : options.filter((option) => normalize(option).includes(normalize(value)));
  if (candidates.length !== 1)
    throw Error(`${label}: filtro ausente ou ambíguo. Use o nome exato do catálogo.`);
  return candidates[0];
}
function periodFor(q, reference, extent) {
  let start = null,
    end = null;
  if (q.periodo === 'ultimo_mes') {
    start = reference.slice(0, 7) + '-01';
    end = new Date(Date.UTC(Number(reference.slice(0, 4)), Number(reference.slice(5, 7)), 0))
      .toISOString()
      .slice(0, 10);
  } else if (q.periodo === 'personalizado') {
    start = q.inicio;
    end = q.fim;
  } else if (q.periodo === 'ultimos_7_dias') {
    start = move(reference, -6);
    end = reference;
  } else if (['semana_atual', 'semana_anterior'].includes(q.periodo)) {
    const weekday = new Date(reference + 'T00:00:00Z').getUTCDay();
    start = move(reference, -((weekday + 6) % 7) - (q.periodo === 'semana_anterior' ? 7 : 0));
    end = move(start, 6);
  }
  return {
    start: start || extent.start,
    end: end || extent.end,
    latestCompletedDate: reference,
    referenceDate: reference,
    mode: q.periodo,
    completeCalendarMonth: false,
  };
}
function bounded(items, q, comparator) {
  const sorted = comparator ? [...items].sort(comparator) : items;
  return {
    rows: sorted.slice(0, q.limite),
    total: items.length,
    truncated: items.length > q.limite,
  };
}
const newestFirst = (a, b) =>
  (b.data || '').localeCompare(a.data || '') || (a.chamado || '').localeCompare(b.chamado || '');
function durationSummary(periods) {
  const stats = lifeStats(periods);
  return {
    closedCycles: stats.complete,
    meanDays: stats.mean,
    medianDays: stats.median,
    categories: ['Rastreador', 'RFID', 'Coletora'].map((category) => {
      const subset = lifeStats(periods.filter((period) => period.category === category));
      return {
        category,
        closedCycles: subset.complete,
        meanDays: subset.mean,
        medianDays: subset.median,
      };
    }),
  };
}
function summaries(items, q, labelFor, summarize) {
  if (!q.agrupar) return null;
  const groups = new Map();
  for (const item of items) {
    const label = labelFor(item);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(item);
  }
  return bounded(
    [...groups].map(([label, group]) => ({ label, ...summarize(group) })),
    q,
    (a, b) =>
      (b[q.ordenar === 'custo' ? 'custoReais' : q.ordenar] || 0) -
        (a[q.ordenar === 'custo' ? 'custoReais' : q.ordenar] || 0) ||
      a.label.localeCompare(b.label, 'pt-BR'),
  );
}

export function createDemoQueries(archive) {
  if (
    archive.profile !== 'demo' ||
    archive.manifest.length !== 2 ||
    archive.manifest.some((source) => !source.filename.startsWith('DEMO-'))
  )
    throw Error('Consultas ampliadas exigem exclusivamente as duas amostras fictícias.');
  const orders = { ...archive.datasets.orders, customerGrouping: 'consolidated' };
  const operational = archive.datasets.operational;
  const reference = archive.attendance.period.latestCompletedDate;
  const dates = orders.rows
    .map((row) => attendanceDate(orders, row))
    .filter(Boolean)
    .sort();
  const extent = { start: dates[0], end: dates.at(-1) };
  const agentNames = [
    ...new Set(
      orders.rows
        .flatMap((row) =>
          ['Resp. Execução', 'Resp. Agendamento'].map((label) => field(orders, row, label)?.raw),
        )
        .filter(Boolean),
    ),
  ].sort();
  const customerNames = [
    ...new Set(orders.rows.map((row) => customerAnalysisIdentity(orders, row).label)),
  ].sort();
  const linked = linkOperational(operational, orders).map((row) => ({
    ...row,
    client: customerAnalysisIdentity(orders, {
      cells: orders.columns.map((column) => ({
        raw:
          column.letter === 'C'
            ? row.document
            : column.label === 'Razão Social'
              ? row.client
              : null,
      })),
    }).label,
  }));
  const catalog = {
    profile: 'demo',
    referenceDate: reference,
    ordersRows: orders.rows.length,
    operationalRows: operational.rows.length,
    extent,
    responsaveis: agentNames,
    clientes: customerNames,
    tools:
      'atendimentos (totais, custos, ranking e até 20 registros), trocas (rastreadores, RFID e coletoras), parque (situação, modelo e cobertura de OS).',
  };
  return {
    catalog,
    query(input) {
      const q = validateDemoQuery(input);
      const client = matched(q.cliente, customerNames, 'Cliente');
      const agent = matched(q.responsavel, agentNames, 'Responsável');
      const period = periodFor(q, reference, extent);
      const base = {
        profile: 'demo',
        query: q,
        period,
        generatedAt: archive.generatedAt,
        sources: archive.manifest.map((source) => ({ ...source })),
        source: archive.manifest.find(
          (source) => source.kind === (q.tipo === 'parque' ? 'operational' : 'orders'),
        ),
        criteria: [
          'Amostras inteiramente fictícias, exclusivamente para testes.',
          'Períodos relativos usam a última data de atendimento do arquivo, indicada como referência.',
          'Rankings exibem no máximo 20 grupos. Detalhes exibem no máximo 20 registros. Totais usam o conjunto completo filtrado.',
        ],
      };
      const filters = {
        start: q.periodo === 'total' ? '' : period.start,
        end: q.periodo === 'total' ? '' : period.end,
      };
      if (agent)
        filters[q.papel === 'agendamento' ? 'Resp. Agendamento' : 'Resp. Execução'] = [agent];
      let selected = applyFilters(orders, filters);
      selected = {
        ...selected,
        rows: selected.rows.filter(
          (row) =>
            (!client || customerAnalysisIdentity(orders, row).label === client) &&
            (!q.placa || normalize(field(orders, row, 'Placa')?.raw) === normalize(q.placa)),
        ),
      };
      base.appliedFilters = {
        cliente: client,
        responsavel: agent,
        papel: q.papel,
        placa: q.placa || null,
      };
      if (q.tipo === 'parque') {
        const rows = linked.filter(
          (row) =>
            (!client || row.client === client) &&
            (!q.placa || normalize(row.plate) === normalize(q.placa)) &&
            (!q.situacao || row.status === q.situacao) &&
            (!q.semHistorico || !row.services.some((service) => productive(orders, service))),
        );
        const metrics = {
          total: rows.length,
          active: rows.filter((row) => row.status === 'Ativo').length,
          canceled: rows.filter((row) => row.status === 'Cancelado').length,
          withoutHistory: rows.filter(
            (row) => !row.services.some((service) => productive(orders, service)),
          ).length,
        };
        return {
          ...base,
          metrics,
          cards: [
            ['Equipamentos', metrics.total],
            ['Ativos', metrics.active],
            ['Cancelados', metrics.canceled],
            ['Sem OS efetiva na amostra', metrics.withoutHistory],
          ],
          ranking: summaries(
            rows,
            q,
            (row) =>
              q.agrupar === 'cliente' ? row.client : q.agrupar === 'placa' ? row.plate : row.model,
            (group) => ({ total: group.length }),
          ),
          details: q.detalhar
            ? bounded(
                rows.map((row) => ({
                  placa: row.plate,
                  cliente: row.client,
                  rastreador: row.serial,
                  modelo: row.model,
                  situacao: row.status,
                  atendimentosEfetivos: row.services.filter((service) =>
                    productive(orders, service),
                  ).length,
                })),
                q,
              )
            : null,
          criteria: [
            ...base.criteria,
            'Parque representa a fotografia da Operacional, sem filtro temporal de OS.',
            'Ausência de OS nesta amostra não significa equipamento sem manutenção ou manutenção atrasada.',
          ],
        };
      }
      const metrics = periodMetrics(selected);
      const common = {
        ...base,
        completedWithoutValidDate: orders.rows.filter(
          (row) => done(orders, row) && !attendanceDate(orders, row),
        ).length,
        criteria: [
          ...base.criteria,
          'Realizados: Status Concluída ou Pago. Data usada: Data de atendimento.',
          'Efetivos excluem Motivo Visita Improdutiva. Custos mantêm as visitas improdutivas e são expressos em reais.',
          'Chamados distintos não equivalem a linhas de atendimento. Clientes consolidados seguem a Base clientes.',
        ],
        metrics: {
          completed: metrics.completed,
          productive: metrics.productive,
          unproductive: metrics.unproductive,
          distinctCompletedCalls: metrics.calls,
          costReais: metrics.cost == null ? null : metrics.cost / 100,
        },
      };
      if (q.tipo === 'trocas') {
        const replacement = equipment(orders, selected);
        const pairs = replacement.swaps || [];
        const swaps = [
          ...pairs.map((pair) => ({
            categoria: 'Rastreador',
            placa: pair.plate,
            cliente: customerAnalysisIdentity(
              orders,
              orders.rows.find((row) => row.sourceRow === pair.rows[0]),
            ).label,
            chamado: pair.os,
            data: pair.date,
          })),
          ...replacement.replacementEvents
            .filter((item) => item.category !== 'Rastreador/kit')
            .map((item) => ({
              categoria: item.category,
              placa: item.plate,
              cliente: customerAnalysisIdentity(
                orders,
                orders.rows.find((row) => row.sourceRow === item.rows[0]),
              ).label,
              chamado: item.os,
              data: item.date,
            })),
        ];
        const ids = new Set(replacement.replacementEvents.flatMap((event) => event.rows));
        const life = fieldLife(orders, orders, { referenceDate: reference });
        const closed = life.periods.filter(
          (item) => item.state === 'replaced' && ids.has(item.removalRow),
        );
        const subsequent = fieldLife(orders, orders, {
          referenceDate: reference,
          basis: 'replacement',
        }).periods.filter((item) => item.state === 'replaced' && ids.has(item.removalRow));
        return {
          ...common,
          metrics: {
            tracker: pairs.length,
            rfid: replacement.accessories.RFID,
            collector: replacement.accessories.Coletora,
          },
          cards: [
            ['Trocas de rastreador', pairs.length],
            ['Trocas de RFID', replacement.accessories.RFID],
            ['Trocas de coletora', replacement.accessories.Coletora],
            ['Eventos de troca', swaps.length],
          ],
          ranking: summaries(
            swaps,
            q,
            (item) =>
              q.agrupar === 'cliente'
                ? item.cliente
                : q.agrupar === 'placa'
                  ? item.placa
                  : field(
                      orders,
                      selected.rows.find((row) => row.os === item.chamado),
                      q.papel === 'execucao' ? 'Resp. Execução' : 'Resp. Agendamento',
                    )?.raw || 'Sem responsável',
            (group) => ({
              total: group.length,
              rastreadores: group.filter((item) => item.categoria === 'Rastreador').length,
              rfid: group.filter((item) => item.categoria === 'RFID').length,
              coletoras: group.filter((item) => item.categoria === 'Coletora').length,
            }),
          ),
          details: q.detalhar ? bounded(swaps, q, newestFirst) : null,
          life: durationSummary(closed),
          lifeAfterReplacement: durationSummary(subsequent),
          criteria: [
            ...common.criteria,
            'Troca de rastreador exige duas linhas do mesmo chamado e placa com IDs diferentes. Filtros precisam incluir as duas linhas.',
            'Trocas de acessório exigem categoria explícita e troca nas instruções.',
            'Vida até a primeira troca considera apenas ciclos encerrados identificados desde a implementação. Ciclos abertos não são vida útil final.',
          ],
        };
      }
      const realized = selected.rows.filter((row) => done(orders, row));
      return {
        ...common,
        cards: [
          ['Visitas e atendimentos', metrics.completed],
          ['Atendimentos efetivos', metrics.productive],
          ['Visitas improdutivas', metrics.unproductive],
          ['Chamados distintos', metrics.calls],
        ],
        ranking: summaries(
          realized,
          q,
          (row) =>
            q.agrupar === 'cliente'
              ? customerAnalysisIdentity(orders, row).label
              : q.agrupar === 'placa'
                ? field(orders, row, 'Placa')?.raw
                : field(
                    orders,
                    row,
                    q.papel === 'execucao' ? 'Resp. Execução' : 'Resp. Agendamento',
                  )?.raw || 'Sem responsável',
          (group) => {
            const m = periodMetrics({ ...orders, rows: group });
            return {
              total: m.completed,
              efetivos: m.productive,
              improdutivos: m.unproductive,
              chamados: m.calls,
              custoReais: m.cost == null ? null : m.cost / 100,
            };
          },
        ),
        details: q.detalhar
          ? bounded(
              realized.map((row) => ({
                chamado: row.os,
                data: attendanceDate(orders, row),
                placa: field(orders, row, 'Placa')?.raw,
                cliente: customerAnalysisIdentity(orders, row).label,
                responsavel: field(
                  orders,
                  row,
                  q.papel === 'execucao' ? 'Resp. Execução' : 'Resp. Agendamento',
                )?.raw,
                motivo: field(orders, row, 'Motivo')?.raw,
              })),
              q,
              newestFirst,
            )
          : null,
      };
    },
  };
}
