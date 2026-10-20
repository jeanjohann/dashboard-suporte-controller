/** Contrato de persistência do consumo. O adaptador atual é exclusivamente local. */
import { readConsumptionHistory, writeConsumptionHistory } from './consumptionHistory.js';

/** Um adaptador futuro deverá autenticar, autorizar e tratar conflitos antes de confirmar a gravação. */
export function createHistoryRepository(adapter) {
  if (typeof adapter?.read !== 'function' || typeof adapter?.write !== 'function') {
    throw new Error('O armazenamento precisa fornecer leitura e gravação.');
  }
  return Object.freeze({
    read: (options) => adapter.read(options),
    write: (history, options) => adapter.write(history, options),
  });
}

export const consumptionHistoryRepository = createHistoryRepository({
  read: readConsumptionHistory,
  write: writeConsumptionHistory,
});
