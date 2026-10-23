import { zohoDay, zohoId } from '../src/shared/data/zohoActivity.js';

/** Só transições para a categoria Closed configurada no departamento; nunca infere pelo rótulo. */
export function closureFromHistory(event, ticket, period, states, anchor) {
  const changes = (Array.isArray(event?.eventInfo) ? event.eventInfo : []).filter(
    (item) => item.systemProperty === true && item.propertyName === 'Status',
  );
  if (!['TicketUpdated', 'TicketCreated'].includes(event?.eventName) || !changes.length)
    return null;
  const change = changes[0];
  const transition = event.eventName === 'TicketUpdated';
  const before = transition ? change.propertyValue?.previousValue : null;
  const after = transition ? change.propertyValue?.updatedValue : change.propertyValue;
  if (typeof after !== 'string') throw Error('Histórico de status em formato inesperado.');
  const afterType = states.get(after);
  if (!afterType) throw Error('O histórico contém status sem categoria identificada.');
  if (afterType !== 'Closed') return null;
  if (transition && before != null && !states.has(before))
    throw Error('O status anterior ao fechamento não foi identificado.');
  if (transition && states.get(before) === 'Closed') return null;
  const day = zohoDay(event.eventTime);
  if (!day) throw Error('A data de um fechamento não foi identificada.');
  if (day < period.start || day > period.end || Date.parse(event.eventTime) > Date.parse(anchor))
    return null;
  const actorId = event.actor?.type === 'Agent' ? zohoId(event.actor.id) : null;
  const actorName =
    actorId && typeof event.actor.name === 'string' ? event.actor.name.slice(0, 100) : null;
  const ticketId = zohoId(ticket.id);
  return {
    id: JSON.stringify([ticketId, event.eventTime, actorId, before, after]),
    ticketId,
    number: typeof ticket.ticketNumber === 'string' ? ticket.ticketNumber.slice(0, 50) : ticketId,
    agentId: actorId,
    agentName: actorName,
    executor: actorId
      ? 'Agente'
      : ['Workflow', 'Supervise', 'Macro', 'System', 'Blueprint'].includes(event.actor?.type)
        ? 'Automação/sistema'
        : 'Executor não identificado',
    ownerId: zohoId(ticket.assigneeId),
    closedAt: event.eventTime,
    status: after.slice(0, 120),
  };
}

export function closureReader(fetchPage, fail, { unfiltered = false } = {}) {
  const catalogs = new Map();
  return async (ticket, period, anchor) => {
    const departmentId = zohoId(ticket.departmentId);
    if (!departmentId)
      throw fail('O departamento de um chamado não foi identificado para conferir os fechamentos.');
    let states = catalogs.get(departmentId);
    if (!states) {
      const fields = await fetchPage(
        `/organizationFields?module=tickets&apiNames=status&departmentId=${departmentId}`,
      );
      const status = fields.filter((field) => field.apiName === 'status');
      if (status.length !== 1 || !Array.isArray(status[0].allowedValues))
        throw fail('Não foi possível conferir a categoria dos status de fechamento.');
      states = new Map();
      for (const item of status[0].allowedValues) {
        if (
          typeof item.value !== 'string' ||
          !['Open', 'Closed', 'On Hold'].includes(item.statusType) ||
          (states.has(item.value) && states.get(item.value) !== item.statusType)
        )
          throw fail('A configuração dos status de fechamento está incompleta ou ambígua.');
        states.set(item.value, item.statusType);
      }
      if (![...states.values()].includes('Closed'))
        throw fail('Nenhum status da categoria Closed foi identificado.');
      catalogs.set(departmentId, states);
    }
    const closures = [],
      seen = new Set();
    for (let page = 0; page < 4; page++) {
      const rows = await fetchPage(
        `/tickets/${zohoId(ticket.id)}/History?from=${page * 50}&limit=50${unfiltered ? '' : '&fieldName=status'}`,
      );
      if (rows.length > 50) throw fail('O histórico não respeitou a paginação de fechamentos.');
      for (const event of rows) {
        // Histórico completo contém notificações e apontamentos com a mesma assinatura
        // resumida. Apenas mudanças reais de Status entram na conferência de fechamento.
        if (
          !['TicketUpdated', 'TicketCreated'].includes(event?.eventName) ||
          !Array.isArray(event.eventInfo) ||
          !event.eventInfo.some(
            (item) => item.systemProperty === true && item.propertyName === 'Status',
          )
        )
          continue;
        const signature = JSON.stringify([
          event.eventTime,
          event.eventName,
          event.actor?.id,
          event.eventInfo,
        ]);
        if (seen.has(signature))
          throw fail('O histórico de status mudou ou repetiu registros durante a coleta.');
        seen.add(signature);
        try {
          const closure = closureFromHistory(event, ticket, period, states, anchor);
          if (closure) closures.push(closure);
        } catch (error) {
          throw fail(error.message);
        }
      }
      if (rows.length < 50) return closures;
    }
    throw fail('Um chamado excedeu 200 eventos de status. A coleta não foi aplicada.');
  };
}
