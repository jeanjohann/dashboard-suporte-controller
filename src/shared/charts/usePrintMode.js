import { createContext, useContext, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

let printing = false;
const listeners = new Set();
const notify = () => {
  for (const listener of listeners) listener();
};
const before = () => {
  printing = true;
  flushSync(notify);
};
const after = () => {
  printing = false;
  notify();
};
const subscribe = (listener) => {
  if (!listeners.size) {
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
      printing = false;
    }
  };
};

/** Inclui conteúdo completo antes do snapshot de impressão, inclusive Ctrl+P. */
export function usePrintMode() {
  const preparing = useContext(PrintPreparationContext);
  const native = useSyncExternalStore(subscribe, () => printing);
  return native || preparing;
}
export const PrintPreparationContext = createContext(false);
