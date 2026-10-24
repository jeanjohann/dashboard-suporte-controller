/** Reaproveita vínculos por identidade imutável das bases, usando referências fracas. */
import { linkOperational } from './operational.js';

// As bases importadas são imutáveis; referências fracas deixam versões antigas livres para coleta.
const cache = new WeakMap();
export function cachedOperationalLinks(data, orders) {
  let entry = cache.get(data);
  if (!entry) {
    entry = { standalone: null, orders: new WeakMap() };
    cache.set(data, entry);
  }
  if (!orders) return entry.standalone || (entry.standalone = linkOperational(data, null));
  if (!entry.orders.has(orders)) entry.orders.set(orders, linkOperational(data, orders));
  return entry.orders.get(orders);
}
