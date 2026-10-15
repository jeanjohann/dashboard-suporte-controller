/** Porta autenticada para um futuro coletor privado. Sem binding, não há chamadas externas nem dados fictícios. */
import {
  normalizeMonitoringSnapshot,
  readSnapshotJson,
} from '../src/modules/monitoring/data/snapshotContract.js';

const json = (body, status) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });

export async function monitoringResponse(request, env) {
  if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);
  if (!env.MONITORING_SERVICE)
    return json({ error: 'Integração de monitoramento ainda não configurada.' }, 503);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    // Service Binding privado. Não encaminha cookies, JWT, e-mail ou parâmetros enviados pelo navegador.
    const response = await env.MONITORING_SERVICE.fetch(
      new Request('https://monitoring.internal/snapshot', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        redirect: 'error',
      }),
    );
    if (!response.ok) throw Error('Coletor indisponível.');
    return json(normalizeMonitoringSnapshot(await readSnapshotJson(response)), 200);
  } catch {
    return json(
      { error: 'Não foi possível obter um retrato completo e válido do monitoramento.' },
      502,
    );
  } finally {
    clearTimeout(timer);
  }
}
