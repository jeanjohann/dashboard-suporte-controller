import { field } from '../../../shared/data/filters.js';
import { isUnproductive } from './attendanceKind.js';
import { customerAnalysisIdentity } from './customerIdentity.js';
import { validPlate } from './trackerReplacements.js';
import { validISODate } from '../../../shared/data/isoDate.js';
export const defaultOrderAttention = { replacements: 2, unproductive: 3, share: 10 };
export function orderAttention(selected, devices, limits = defaultOrderAttention) {
  const rules = Object.fromEntries(
      Object.entries(defaultOrderAttention).map(([key, value]) => [
        key,
        Number.isFinite(limits?.[key]) &&
        limits[key] >= (key === 'replacements' ? 2 : 1) &&
        limits[key] <= (key === 'share' ? 100 : 1000)
          ? limits[key]
          : value,
      ]),
    ),
    findings = [],
    events = new Map();
  let excludedEvents = 0;
  for (const event of devices?.replacementEvents || []) {
    if (
      !event.clientKey ||
      !validPlate(event.plate) ||
      !validISODate(event.date) ||
      !String(event.os || '').trim()
    ) {
      excludedEvents++;
      continue;
    }
    const key = JSON.stringify([
      event.clientKey,
      event.plate,
      event.date,
      event.os,
      event.category,
    ]);
    const old = events.get(key);
    events.set(key, old ? { ...old, rows: [...new Set([...old.rows, ...event.rows])] } : event);
  }
  const vehicles = new Map();
  for (const event of events.values()) {
    const key = JSON.stringify([event.clientKey, event.plate]);
    if (!vehicles.has(key)) vehicles.set(key, []);
    vehicles.get(key).push(event);
  }
  for (const [key, items] of vehicles) {
    if (items.length < rules.replacements) continue;
    const categories = [...new Set(items.map((item) => item.category))];
    findings.push({
      id: `replacements:${key}`,
      kind: 'Trocas repetidas',
      title: `${items[0].plate} · ${items[0].client}`,
      value: `${items.length} eventos de troca`,
      description: `${categories.join(', ')}. Mesmo cliente/filial e placa; duas linhas de rastreador contam um evento. Volume não comprova falha recorrente.`,
      rows: [...new Set(items.flatMap((item) => item.rows))],
      rank: items.length,
    });
  }
  const required = ['Status', 'Motivo', 'Razão Social'];
  const available = required.every((label) => selected.columns.some((col) => col.label === label));
  const clients = new Map();
  let missingClients = 0;
  if (available)
    for (const row of selected.rows) {
      if (!['Concluída', 'Pago'].includes(field(selected, row, 'Status')?.raw)) continue;
      const client = customerAnalysisIdentity(selected, row);
      if (client.key === 'Sem cliente') {
        missingClients++;
        continue;
      }
      if (!clients.has(client.key))
        clients.set(client.key, { label: client.label, total: 0, rows: [] });
      const group = clients.get(client.key);
      group.total++;
      if (isUnproductive(selected, row)) group.rows.push(row.sourceRow);
    }
  for (const [key, item] of clients) {
    const share = (item.rows.length / item.total) * 100;
    if (item.rows.length < rules.unproductive || share < rules.share) continue;
    findings.push({
      id: `unproductive:${key}`,
      kind: 'Concentração de visitas improdutivas',
      title: item.label,
      value: `${item.rows.length} de ${item.total} registros realizados (${share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)`,
      description:
        'Denominador: linhas Concluída/Pago deste cliente no recorte, incluindo improdutivas. Segue o agrupamento de clientes da categoria; não representa visitas físicas distintas.',
      rows: item.rows,
      rank: item.rows.length,
    });
  }
  return {
    findings: findings.sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id)),
    coverage: `Filtros da Visão geral aplicados. Trocas usam os eventos já confirmados no histórico, exigindo suas linhas no recorte; ${excludedEvents} eventos sem data/cliente/placa/chamado utilizáveis fora do agrupamento. ${available ? `${missingClients} realizados sem cliente fora da concentração.` : 'Concentração indisponível: faltam Status, Motivo ou Razão Social.'} ${devices?.trackerAvailable ? '' : 'Trocas de rastreador indisponíveis nesta fonte.'} ${devices?.accessoryAvailable ? '' : 'Trocas de acessórios indisponíveis nesta fonte.'}`,
  };
}
