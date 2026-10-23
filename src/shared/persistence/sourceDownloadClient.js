/** Confere tamanho e identidade durante a transferência; dados incompletos nunca chegam à sessão. */
export const fetchSourceResponse = (path, options = {}) =>
  fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options });
export async function readSourceResponse(response, head, { onProgress } = {}) {
  if (!response.ok) {
    const error = response.headers.get('Content-Type')?.includes('application/json')
      ? await response.json()
      : null;
    throw Error(
      error?.error ||
        'Não foi possível carregar a base salva. Entre novamente se a sessão expirou.',
    );
  }
  if (
    !response.headers.get('Content-Type')?.includes('application/json') ||
    response.headers.get('X-Snapshot-Id') !== head.snapshotId ||
    response.headers.get('X-Snapshot-SHA256') !== head.hash ||
    Number(response.headers.get('X-Snapshot-Bytes')) !== head.bytes ||
    !response.body
  ) {
    await response.body?.cancel().catch(() => {});
    throw Error('A resposta da base salva não corresponde à versão solicitada.');
  }
  const reader = response.body.getReader(),
    decoder = new TextDecoder('utf-8', { fatal: true }),
    parts = [];
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > head.bytes) throw Error('Tamanho da base divergente.');
      parts.push(decoder.decode(value, { stream: true }));
      onProgress?.(bytes, head.bytes);
    }
    parts.push(decoder.decode());
    if (bytes !== head.bytes) throw Error('Base incompleta.');
    return parts.join('');
  } catch (error) {
    await reader.cancel().catch(() => {});
    if (error instanceof TypeError || ['AbortError', 'TimeoutError'].includes(error.name))
      throw Error(
        'A conexão foi interrompida durante o carregamento. Tente carregar as bases novamente.',
      );
    throw error;
  } finally {
    reader.releaseLock();
  }
}
