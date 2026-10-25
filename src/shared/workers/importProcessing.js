/** Importações e validações extensas ficam fora da thread que renderiza a interface. */
function runWorker(payload, transfer = []) {
  const worker = new Worker(new URL('./importProcessing.worker.js', import.meta.url), {
    type: 'module',
  });
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      worker.terminate();
      if (data?.ok) resolve(data.value);
      else reject(new Error(data?.error || 'Não foi possível processar os dados.'));
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'O processamento em segundo plano falhou.'));
    };
    worker.postMessage(payload, transfer);
  });
}

export async function importWorkbookInWorker(buffer) {
  if (typeof Worker === 'undefined') {
    const { importWorkbook } = await import('../../modules/orders/data/import.js');
    return importWorkbook(buffer);
  }
  return runWorker({ task: 'orders', buffer }, [buffer]);
}

export async function importOperationalInWorker(buffer) {
  if (typeof Worker === 'undefined') {
    const { importOperational } = await import('../../modules/operational/domain/operational.js');
    return importOperational(buffer);
  }
  return runWorker({ task: 'operational', buffer }, [buffer]);
}

export async function validateSourceInWorker(kind, text, expectedHash) {
  if (typeof Worker === 'undefined') {
    const { sha256, validateStoredSource } = await import('../persistence/snapshotPayload.js');
    if ((await sha256(text)) !== expectedHash) throw Error('Integridade da base inválida.');
    const source = JSON.parse(text);
    validateStoredSource(kind, source);
    return source;
  }
  const bytes = new TextEncoder().encode(text);
  return runWorker({ task: 'saved-source', kind, bytes: bytes.buffer, expectedHash }, [
    bytes.buffer,
  ]);
}
