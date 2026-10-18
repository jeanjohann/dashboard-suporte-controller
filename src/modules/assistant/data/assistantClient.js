/** A asserção Access permanece na memória e só segue para o serviço loopback fixo. */
export async function queryLocalAssistant(fetcher = fetch) {
  const session = await fetcher('/api/assistant/local-session', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!session.headers.get('Content-Type')?.includes('application/json'))
    throw new Error('Entre novamente pelo Cloudflare Access para consultar o laboratório.');
  const auth = await session.json();
  if (!session.ok || !auth.assertion) throw new Error(auth.error || 'Sessão não autorizada.');
  let response;
  try {
    response = await fetcher('http://127.0.0.1:5681/v1/assistant/attendance', {
      method: 'POST',
      credentials: 'omit',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${auth.assertion}` },
      signal: AbortSignal.timeout(150000),
    });
  } catch {
    throw new Error(
      'O serviço local não respondeu. Inicie o laboratório neste computador e, se o navegador solicitar, permita o acesso à rede local para este site.',
    );
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Consulta indisponível.');
  if (!result.metrics || !result.period || !result.source || typeof result.answer !== 'string')
    throw new Error('O serviço local retornou um resultado incompleto.');
  return result;
}
