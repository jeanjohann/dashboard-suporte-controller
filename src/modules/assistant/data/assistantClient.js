/** A asserção Access permanece na memória e só segue para o serviço loopback fixo. */
export async function queryLocalAssistant(
  question,
  fetcher = fetch,
  hostname = globalThis.location?.hostname,
) {
  if (typeof question !== 'string' || question.trim().length < 3 || question.length > 1000)
    throw new Error('Escreva uma pergunta entre 3 e 1.000 caracteres.');
  const session = await fetcher('/api/assistant/local-session', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!session.headers.get('Content-Type')?.includes('application/json')) {
    if (hostname === 'localhost' || hostname === '127.0.0.1')
      throw new Error(
        'A versão local não recebe a sessão do Cloudflare Access. Abra o sistema autenticado para consultar o laboratório.',
      );
    throw new Error('Sua sessão do Cloudflare Access expirou. Entre novamente no sistema.');
  }
  const auth = await session.json();
  if (!session.ok || !auth.assertion) throw new Error(auth.error || 'Sessão não autorizada.');
  let response;
  try {
    response = await fetcher('http://127.0.0.1:5681/v1/assistant/attendance', {
      method: 'POST',
      credentials: 'omit',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${auth.assertion}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() }),
      signal: AbortSignal.timeout(150000),
    });
  } catch {
    throw new Error(
      'O serviço local não respondeu. Inicie o laboratório neste computador e, se o navegador solicitar, permita o acesso à rede local para este site.',
    );
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Consulta indisponível.');
  if (
    typeof result.answer !== 'string' ||
    typeof result.consulted !== 'boolean' ||
    (result.consulted && (!result.metrics || !result.period || !result.source))
  )
    throw new Error('O serviço local retornou um resultado incompleto.');
  return result;
}
