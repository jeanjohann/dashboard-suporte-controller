/** Adaptadores do catálogo. Reutilizam regras dos módulos e nunca juntam totais de fontes diferentes. */
import { evaluateCustomQuery } from './customQuery.js';
import { dashboardMetric, dashboardModules, canUseDashboardModule } from './catalog.js';
import { validISODate } from '../../../shared/data/isoDate.js';
import { field, attendanceExtent } from '../../../shared/data/filters.js';
import { dashboardData } from '../../orders/domain/dashboard.js';
import { supportPerformance, supportRoles } from '../../orders/domain/supportPerformance.js';
import { summarizeZohoActivity, zohoTeam } from '../../../shared/data/zohoActivity.js';
import { linkOperational } from '../../operational/domain/operational.js';
import { parkAnalysis } from '../../park/domain/parkAnalysis.js';
import { selectLogistics } from '../../logistics/domain/logistics.js';
import {
  consumptionSummary,
  periodOptions,
  VOLUME_SCALE,
} from '../../consumption/domain/lineConsumption.js';
import {
  consumptionPeriods,
  selectConsumptionRows,
} from '../../consumption/domain/consumptionFilters.js';
import { monitorSnapshot } from '../../monitoring/domain/monitoring.js';

export const shortDate = (value) =>
  validISODate(value) ? value.split('-').reverse().join('/') : value || 'não informado';
export const dateRange = (start, end) =>
  `${start ? shortDate(start) : 'Início disponível'} a ${end ? shortDate(end) : 'fim disponível'}`;
export const timestampLabel = (value) =>
  value && Number.isFinite(+new Date(value))
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'não informado';
export function formatMetric(value, unit = 'count') {
  if (value == null || !Number.isFinite(value)) return 'Indisponível';
  if (unit === 'money')
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      value / 100,
    );
  if (unit === 'seconds') {
    const seconds = Math.round(value);
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min ${seconds % 60}s`;
  }
  if (unit === 'mb')
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value / VOLUME_SCALE)} MB`;
  return (
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: unit === 'percent' ? 2 : 0 }).format(
      value,
    ) + (unit === 'percent' ? ' / 100' : '')
  );
}
const group = (rows, key) => {
  const groups = new Map();
  for (const row of rows) {
    const label = String(row[key] || 'Não informado');
    groups.set(label, (groups.get(label) || 0) + 1);
  }
  return [...groups]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'));
};
export function dashboardFilterOptions(module, sources, user) {
  if (!canUseDashboardModule(user, module)) return {};
  const source = sources[module === 'park' ? 'operational' : module]?.value;
  if (module === 'orders')
    return {
      clients: [
        ...new Set(
          (source?.data.rows || [])
            .map((row) => String(field(source.data, row, 'Razão Social')?.raw || ''))
            .filter(Boolean),
        ),
      ].sort(),
    };
  if (['park', 'operational'].includes(module)) {
    const rows = source ? linkOperational(source.data, null) : [];
    return {
      clients: [...new Set(rows.map((row) => row.client).filter(Boolean))].sort(),
      models: [...new Set(rows.map((row) => row.model).filter(Boolean))].sort(),
    };
  }
  if (module === 'zoho')
    return { agents: zohoTeam.map((row) => ({ value: row.id, label: row.name })) };
  if (module === 'consumption')
    return {
      operators: [...new Set((source?.statements || []).map((row) => row.operator))].sort(),
    };
  if (module === 'monitoring')
    return {
      bases: (source?.snapshot.collections || []).map((row) => ({
        value: row.clientId,
        label:
          (source.snapshot.vehicles.find((v) => v.clientId === row.clientId)?.clientName ||
            'Base') +
          ' · ' +
          row.clientId,
      })),
    };
  return {};
}
export function dashboardPeriods(sources, operator) {
  return periodOptions(sources.consumption?.value?.statements || [], operator);
}

export function evaluateDashboardWidget(widget, sources, user) {
  const metric = dashboardMetric(widget.metric);
  if (!metric || !canUseDashboardModule(user, metric.module))
    return { status: 'restricted', message: 'Você não tem acesso a este indicador.' };
  const { module, key } = metric,
    filters = widget.filters || {},
    page = dashboardModules[module].page;
  const unavailable = (message) => ({ status: 'unavailable', message, page });
  const sourceKey = module === 'park' ? 'operational' : module,
    entry = sources[sourceKey],
    source = entry?.value;
  if (!source)
    return unavailable('Carregue a fonte no módulo de origem para visualizar este bloco.');
  if (
    (filters.start && !validISODate(filters.start)) ||
    (filters.end && !validISODate(filters.end)) ||
    (filters.start && filters.end && filters.start > filters.end)
  )
    return unavailable('O período configurado é inválido.');
  const result = {
    status: 'ready',
    page,
    unit: metric.unit,
    source: source.filename || dashboardModules[module].label,
    updatedAt: source.googleReadAt || entry.loadedAt,
    updateLabel: source.googleReadAt ? 'Leitura do Google' : 'Carregada na sessão',
    period: 'Base carregada · sem recorte temporal',
    note: '',
    scope: [
      filters.client && `Cliente: ${filters.client}`,
      filters.model && `Modelo: ${filters.model}`,
    ]
      .filter(Boolean)
      .join(' · '),
    value: null,
    series: null,
  };
  try {
    if (key === 'custom')
      return {
        ...result,
        ...evaluateCustomQuery(module, source.data, widget.query, filters),
        demonstration: Boolean(source.demonstration || source.data.demonstration),
      };
    if (module === 'orders') {
      const data = {
        ...source.data,
        customerGrouping: filters.grouping === 'branch' ? 'branch' : 'consolidated',
        consolidateIdenticalNames: filters.grouping !== 'explicit',
      };
      const required = [
        'Status',
        ...(['maintenance', 'implementations', 'types'].includes(key) ? ['Tipo de Serviço'] : []),
        ...(filters.start || filters.end || key === 'months'
          ? [supportRoles[key]?.date || 'Data de atendimento']
          : []),
      ];
      if (required.some((label) => !data.columns.some((col) => col.label === label)))
        return unavailable(
          'A base de OS não possui todas as colunas necessárias para este indicador.',
        );
      const query = {
        start: filters.start || '',
        end: filters.end || '',
        ...(filters.client ? { 'Razão Social': [filters.client] } : {}),
      };
      const analysis = dashboardData(data, query),
        extent = attendanceExtent(data);
      result.period = dateRange(filters.start || extent?.start, filters.end || extent?.end);
      result.note = 'OS concluídas ou pagas. Data de atendimento.';
      if (key === 'clients')
        result.scope = [
          result.scope,
          filters.grouping === 'branch'
            ? 'Clientes por filial/CNPJ'
            : filters.grouping === 'explicit'
              ? 'Cliente consolidado explícito'
              : 'Cliente consolidado · nomes idênticos habilitados',
        ]
          .filter(Boolean)
          .join(' · ');
      if (filters.client) result.note += ` Cliente: ${filters.client}.`;
      if (key === 'months')
        result.series = analysis.months.map((row) => ({
          label: row.label,
          value: row.implementation + row.maintenance + row.other + (row.unproductive || 0),
        }));
      else if (key === 'types') result.series = analysis.types;
      else if (['execution', 'scheduling'].includes(key)) {
        const performance = supportPerformance(data, query, key);
        if (performance.unavailable)
          return unavailable(
            'Colunas de responsabilidade ou data ausentes: ' + performance.unavailable.join(', '),
          );
        result.series = performance.groups.map((row) => ({
          label: row.label,
          value: row.productive,
        }));
        result.note = `Intervenções produtivas por responsável. Data: ${supportRoles[key].date}. ${performance.missing.length} linha(s) sem responsável.`;
        result.period = dateRange(filters.start, filters.end);
      } else result.value = analysis.current[key];
    } else if (module === 'zoho') {
      if (filters.agent && !zohoTeam.some((row) => row.id === filters.agent))
        return unavailable('O agente selecionado não pertence à equipe configurada.');
      const summary = summarizeZohoActivity(source.data, {
        reviewedReplies: source.reviewedReplies,
      });
      const agents = summary.agents.filter((row) => !filters.agent || row.id === filters.agent);
      result.value = (filters.agent ? agents[0] : summary.totals)?.[key] ?? null;
      if (['closedByAgent', 'timeByAgent'].includes(key))
        result.series = agents.map((row) => ({
          label: row.name,
          value: row[key === 'closedByAgent' ? 'closedTickets' : 'seconds'],
        }));
      result.period = dateRange(source.data.period?.start, source.data.period?.end);
      result.scope = agents.map((row) => row.name).join(' e ');
      result.updatedAt = source.data.fetchedAt || source.data.readAt || entry.loadedAt;
      result.updateLabel = 'Leitura do Zoho';
      result.note = `Equipe: ${agents.map((row) => row.name).join(', ')}. Fechamentos pela autoria no histórico; tempo pelos apontamentos. Maior tempo considera os apontamentos do chamado fechado. Cobertura limitada à coleta disponível; respostas pendentes não entram nas confirmadas.`;
    } else if (module === 'consumption') {
      if (source.error)
        return unavailable('O histórico de consumo precisa de revisão no módulo de origem.');
      const statements = source.statements,
        operators = [...new Set(statements.map((row) => row.operator))];
      if (filters.operator && !operators.includes(filters.operator))
        return unavailable('A operadora selecionada não está disponível no histórico carregado.');
      if (
        filters.period &&
        (!filters.operator ||
          !periodOptions(statements, filters.operator).some((row) => row.key === filters.period))
      )
        return unavailable(
          'A apuração salva não está disponível. Edite o bloco para escolher outra apuração.',
        );
      const query = {
        operator: filters.operator ? [filters.operator] : [],
        periods: filters.period ? { [filters.operator]: filters.period } : {},
      };
      const periods = consumptionPeriods(statements, query),
        rows = selectConsumptionRows(source.rows, periods, query, ''),
        summary = consumptionSummary(rows);
      result.value = summary[key];
      if (key === 'operators')
        result.series = (filters.operator ? [filters.operator] : operators).map((operator) => ({
          label: operator,
          value: consumptionSummary(rows.filter((row) => row.operator === operator)).ticks,
        }));
      result.period = (filters.operator ? [filters.operator] : operators)
        .map((operator) => {
          const period = periodOptions(statements, operator).find(
            (row) => row.key === periods[operator],
          );
          return `${operator}: ${dateRange(period?.start, period?.end)}`;
        })
        .join(' · ');
      result.note = `Uma apuração por operadora. ${filters.period ? 'Apuração fixa.' : 'Mais recente disponível em cada operadora.'} ${summary.excluded} amostra(s) excluída(s). Média por amostra válida, incluindo zeros.`;
    } else if (module === 'operational' || module === 'park') {
      const rows = linkOperational(source.data, null).filter(
        (row) =>
          (!filters.client || row.client === filters.client) &&
          (!filters.model || row.model === filters.model),
      );
      result.note =
        [
          filters.client && `Cliente: ${filters.client}`,
          filters.model && `Modelo: ${filters.model}`,
        ]
          .filter(Boolean)
          .join(' · ') || 'Todos os registros da base operacional carregada.';
      if (module === 'operational') {
        if (key === 'records') result.value = rows.length;
        else if (key === 'issues') {
          const ids = new Set(rows.map((row) => row.sourceRow));
          result.value = source.data.issues.filter((row) => ids.has(row.row)).length;
        } else
          result.series = group(
            rows,
            { models: 'model', clients: 'client', statuses: 'status' }[key],
          );
      } else {
        const orders = sources.orders?.value;
        if (!orders)
          return unavailable(
            'Carregue também as Ordens de Serviço para calcular os indicadores do parque.',
          );
        const linked = linkOperational(source.data, orders.data).filter(
          (row) =>
            (!filters.client || row.client === filters.client) &&
            (!filters.model || row.model === filters.model),
        );
        const analysis = parkAnalysis(linked, orders.data, filters);
        if (analysis.unavailable)
          return unavailable(
            'As bases não possuem as colunas necessárias para vincular o parque às OS.',
          );
        result.value = key === 'swaps' ? analysis.swaps.length : analysis[key];
        result.source = `${source.filename || 'Operacional'} + ${orders.filename || 'OS'}`;
        result.period = dateRange(filters.start, filters.end) + ' · eventos das OS';
        result.note += ` Parque atual vinculado por serial e placa; ${analysis.missingDates} atendimento(s) sem data excluído(s) do recorte. OS carregadas em ${timestampLabel(sources.orders.loadedAt)}. O denominador é o parque atual, não um retrato histórico.`;
      }
    } else if (module === 'logistics') {
      const analysis = selectLogistics(source.data, filters);
      result.value = analysis[key];
      result.period = dateRange(filters.start, filters.end);
      result.note = `Saídas pela data de envio; devoluções pela data de recebimento. ${analysis.missingDates} registro(s) sem data excluído(s) do recorte. Recebimento exige registro válido.`;
    } else if (module === 'monitoring') {
      if (filters.base && !source.snapshot.collections.some((row) => row.clientId === filters.base))
        return unavailable('A base selecionada não está presente na coleta disponível.');
      const analysis = monitorSnapshot(source.snapshot, {
        clients: filters.base ? [filters.base] : [],
        threshold: filters.threshold || 48,
      });
      result.value = analysis.totals[key];
      if (key === 'bases')
        result.series = analysis.groups.map((row) => ({
          label: `${row.label} · ${row.clientId}`,
          value: row.alerts,
        }));
      result.demonstration = analysis.demonstration;
      result.scope = `${filters.base ? 'Base: ' + filters.base + ' · ' : ''}Limite de ${filters.threshold || 48}h`;
      result.period = `Referência: ${timestampLabel(analysis.referenceAt)} (Brasília)`;
      result.updateLabel = 'Coletas';
      result.updatedAt = null;
      result.collectionLabel = source.snapshot.collections
        .filter((row) => !filters.base || row.clientId === filters.base)
        .map(
          (row) => `${row.clientId}: ${timestampLabel(row.at)}${row.ok ? '' : ' · indisponível'}`,
        )
        .join(' · ');
      result.note = `Limite: ${filters.threshold || 48}h. Coletas antigas, datas inválidas e comunicações ausentes ficam separadas dos atrasos confirmados. ${source.error ? 'A última atualização falhou. ' : ''}${analysis.issues.length} veículo(s) com identificação inválida excluído(s).`;
    }
    return result;
  } catch {
    return unavailable(
      'Não foi possível calcular este bloco. Confira a fonte no módulo de origem.',
    );
  }
}
