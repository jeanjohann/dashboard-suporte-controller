import { allowsPage } from '../../../shared/security/permissions.js';

export const dashboardModules = {
  orders: { label: 'Ordens de Serviço', page: 'orders' },
  zoho: { label: 'Zoho Desk', page: 'orders' },
  consumption: { label: 'Consumo M2M', page: 'lines' },
  operational: { label: 'Operacional', page: 'operational' },
  park: { label: 'Parque e Manutenção', page: 'operational-analysis' },
  logistics: { label: 'Logística', page: 'operational-analysis' },
  monitoring: { label: 'Monitoramento', page: 'monitoring' },
};
const scalar = (module, key, label, unit = 'count') => ({
  id: `${module}.${key}`,
  module,
  key,
  label,
  unit,
  kinds: ['card', 'table'],
});
const series = (module, key, label, unit = 'count') => ({
  ...scalar(module, key, label, unit),
  kinds: ['chart', 'table'],
});
export const dashboardCatalog = [
  ...[
    ['completed', 'Visitas e atendimentos'],
    ['productive', 'Intervenções executadas'],
    ['unproductive', 'Visitas improdutivas'],
    ['maintenance', 'Manutenções realizadas'],
    ['implementations', 'Implementações realizadas'],
    ['calls', 'Chamados atendidos'],
    ['clients', 'Clientes com atendimento'],
    ['vehicles', 'Veículos identificados'],
  ].map(([key, label]) => scalar('orders', key, label)),
  scalar('orders', 'cost', 'Custo total lançado', 'money'),
  scalar('orders', 'average', 'Custo médio válido', 'money'),
  series('orders', 'months', 'Atendimentos por mês'),
  series('orders', 'types', 'Atendimentos por tipo'),
  series('orders', 'execution', 'Execuções por responsável'),
  series('orders', 'scheduling', 'Agendamentos por responsável'),
  ...[
    ['closedTickets', 'Chamados fechados'],
    ['closedAssigned', 'Fechados sob responsabilidade atual'],
    ['confirmedTicketsReplied', 'Chamados com resposta confirmada'],
    ['confirmedReplies', 'Respostas confirmadas'],
    ['pendingReplyCount', 'Interações pendentes de revisão'],
    ['ticketsWithTime', 'Chamados com tempo apontado'],
    ['leadingTimeTickets', 'Maior tempo em chamados fechados'],
  ].map(([key, label]) => scalar('zoho', key, label)),
  scalar('zoho', 'seconds', 'Tempo apontado', 'seconds'),
  scalar('zoho', 'meanSeconds', 'Média por chamado com tempo', 'seconds'),
  series('zoho', 'closedByAgent', 'Fechados por agente'),
  series('zoho', 'timeByAgent', 'Tempo apontado por agente', 'seconds'),
  ...[
    ['lines', 'Linhas identificadas'],
    ['samples', 'Amostras de consumo válidas'],
    ['active', 'Amostras com tráfego'],
    ['zero', 'Amostras sem tráfego'],
    ['excluded', 'Amostras excluídas do cálculo'],
  ].map(([key, label]) => scalar('consumption', key, label)),
  scalar('consumption', 'ticks', 'Consumo total', 'mb'),
  scalar('consumption', 'average', 'Consumo médio por amostra', 'mb'),
  series('consumption', 'operators', 'Consumo por operadora', 'mb'),
  scalar('operational', 'records', 'Registros operacionais'),
  scalar('operational', 'issues', 'Pontos para revisão'),
  series('operational', 'models', 'Registros por modelo'),
  series('operational', 'clients', 'Registros por cliente'),
  series('operational', 'statuses', 'Registros por situação'),
  ...[
    ['base', 'Equipamentos vinculáveis'],
    ['withServices', 'Equipamentos com atendimento'],
    ['withAssistance', 'Equipamentos com assistência'],
    ['assistance', 'Assistências vinculadas'],
    ['swaps', 'Trocas vinculadas'],
  ].map(([key, label]) => scalar('park', key, label)),
  scalar('park', 'rate', 'Assistências por 100 registros', 'percent'),
  ...[
    ['shipments', 'Envios registrados'],
    ['shipmentsReceived', 'Envios com recebimento'],
    ['returns', 'Devoluções registradas'],
    ['returnsReceived', 'Devoluções com recebimento'],
  ].map(([key, label]) => scalar('logistics', key, label)),
  ...[
    ['fleet', 'Veículos identificados'],
    ['delayed', 'Veículos acima do limite'],
    ['critical', 'Veículos com 96h ou mais'],
    ['missing', 'Veículos sem comunicação informada'],
    ['stale', 'Veículos com coleta indisponível'],
    ['invalid', 'Veículos com data inválida'],
  ].map(([key, label]) => scalar('monitoring', key, label)),
  series('monitoring', 'bases', 'Veículos acima do limite por base'),
];
export const dashboardMetric = (id) => dashboardCatalog.find((item) => item.id === id);
export function canUseDashboardModule(user, module) {
  const item = dashboardModules[module];
  return Boolean(
    item && allowsPage(user, item.page) && (module !== 'zoho' || user.role === 'admin'),
  );
}
export const permittedCatalog = (user) =>
  dashboardCatalog.filter((item) => canUseDashboardModule(user, item.module));
