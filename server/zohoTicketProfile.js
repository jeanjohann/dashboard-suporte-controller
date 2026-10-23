/** Amostra limitada, sem títulos, contatos ou descrições; não calcula totais a partir de amostragem. */
import { zohoId } from '../src/shared/data/zohoActivity.js';
export async function inspectZohoTicketProfile(get) {
  const page = await get('/tickets?from=0&limit=2&sortBy=-createdTime');
  if (!Array.isArray(page?.data) || page.data.length > 2)
    throw Error('Amostra de chamados inválida.');
  const samples = [];
  for (const row of page.data) {
    const id = zohoId(row?.id);
    if (!id || samples.some((s) => s.id === id))
      throw Error('Amostra repetida ou sem identificação.');
    const ticket = await get(`/tickets/${id}`);
    if (zohoId(ticket?.id) !== id) throw Error('Detalhe do chamado divergente.');
    const created = [];
    let complete = false;
    for (let offset = 0; offset < 200; offset += 50) {
      const history = await get(`/tickets/${id}/History?from=${offset}&limit=50`);
      if (!Array.isArray(history?.data) || history.data.length > 50)
        throw Error('Histórico inválido.');
      created.push(...history.data.filter((event) => event.eventName === 'TicketCreated'));
      if (history.data.length < 50) {
        complete = true;
        break;
      }
    }
    const event = complete && created.length === 1 ? created[0] : null;
    const label = (v) => (typeof v === 'string' ? v.slice(0, 160) : null);
    samples.push({
      id,
      createdTime: label(ticket.createdTime),
      historyComplete: complete,
      creation: event
        ? {
            actorType: label(event.actor?.type),
            agentId: event.actor?.type === 'Agent' ? zohoId(event.actor.id) : null,
            source: label(event.source),
            time: label(event.eventTime),
            confirmedSupportOpening:
              event.actor?.type === 'Agent' &&
              Boolean(zohoId(event.actor.id)) &&
              event.source === null,
          }
        : null,
      category: label(ticket.category),
      subCategory: label(ticket.subCategory),
      classification: label(ticket.classification),
    });
  }
  return {
    version: 1,
    readAt: new Date().toISOString(),
    samples,
    coverage:
      'Amostra dos dois chamados mais recentes acessíveis, independente do filtro da página. Não representa totais do período. Histórico limitado a 200 eventos por chamado. Categorias são os valores atuais do cadastro.',
  };
}
