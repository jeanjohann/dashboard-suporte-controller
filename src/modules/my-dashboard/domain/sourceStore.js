/** Assinaturas por fonte; publicar não obriga os produtores a assinarem todas as bases. */
export function createSourceStore() {
  let sources = {};
  const listeners = new Set();
  return {
    getSnapshot: () => sources,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish(key, value) {
      if (sources[key]?.value === value || (!sources[key] && !value)) return;
      sources = { ...sources, [key]: value ? { value, loadedAt: new Date().toISOString() } : null };
      for (const listener of listeners) listener();
    },
  };
}
