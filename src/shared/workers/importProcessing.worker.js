/** Executa leituras pesadas sem bloquear a thread principal. */
self.onmessage = async ({ data }) => {
  try {
    let value;
    if (data.task === 'orders') {
      const { importWorkbook } = await import('../../modules/orders/data/import.js');
      value = importWorkbook(data.buffer);
    } else if (data.task === 'operational') {
      const { importOperational } = await import('../../modules/operational/domain/operational.js');
      value = importOperational(data.buffer);
    } else if (data.task === 'saved-source') {
      const { validateStoredSource } = await import('../persistence/snapshotPayload.js');
      const bytes = new Uint8Array(data.bytes);
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
        (byte) => byte.toString(16).padStart(2, '0'),
      ).join('');
      if (hash !== data.expectedHash) throw Error('Integridade da base inválida.');
      value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      validateStoredSource(data.kind, value);
    } else throw Error('Tipo de processamento desconhecido.');
    self.postMessage({ ok: true, value });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error?.message || 'Não foi possível processar os dados.',
    });
  }
};
