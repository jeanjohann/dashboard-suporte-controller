/** Porta autenticada do diagnóstico legado Addlog ou de um coletor privado, com leitura limitada e falhas sanitizadas. */
import { diagnosticUrl, normalizeAddlogDiagnostic } from './addlogDiagnostic.js';
import {
  normalizeMonitoringSnapshot,
  readSnapshotJson,
} from '../src/modules/monitoring/data/snapshotContract.js';

const json = (body, status) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });

export async function monitoringResponse(request, env, fetcher = fetch) {
  if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);
  const direct = Boolean(env.MONITORING_DIAGNOSTIC_URL && env.MONITORING_DIAGNOSTIC_TOKEN);
  if (!env.MONITORING_SERVICE && !direct)
    return json({ error: 'Integração de monitoramento ainda não configurada.' }, 503);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let stage = 'configuration';
  const startedAt = Date.now();
  try {
    if (!env.MONITORING_SERVICE) {
      const url = diagnosticUrl(env.MONITORING_DIAGNOSTIC_URL);
      if (!env.MONITORING_DIAGNOSTIC_LIMITER)
        return json({ error: 'Integração de monitoramento ainda não configurada.' }, 503);
      stage = 'limiter';
      const allowed = await env.MONITORING_DIAGNOSTIC_LIMITER.limit({
        key: 'addlog-legacy-diagnostic',
      });
      if (!allowed.success)
        return json({ error: 'Aguarde um minuto entre consultas ao monitoramento.' }, 429);
      stage = 'transport';
      const response = await fetcher(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'manual',
        cache: 'no-store',
        headers: { Accept: 'application/json', Token: env.MONITORING_DIAGNOSTIC_TOKEN },
      });
      if (!response.ok) {
        stage = response.status === 401 || response.status === 403 ? 'credential' : 'http';
        throw Error('Diagnóstico indisponível.');
      }
      stage = 'read';
      const body = await readSnapshotJson(response);
      stage = 'contract';
      return json(normalizeAddlogDiagnostic(body), 200);
    }
    // Service Binding privado. Não encaminha cookies, JWT, e-mail ou parâmetros enviados pelo navegador.
    const response = await env.MONITORING_SERVICE.fetch(
      new Request('https://monitoring.internal/snapshot', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        redirect: 'manual',
      }),
    );
    if (!response.ok) throw Error('Coletor indisponível.');
    return json(normalizeMonitoringSnapshot(await readSnapshotJson(response)), 200);
  } catch (error) {
    if (direct) {
      const code =
        stage === 'read' && error.message === 'Retrato excede o limite de leitura.'
          ? 'size'
          : stage;
      // Somente etapa fixa e erro de validação local; nunca resposta bruta ou credencial.
      console.warn(
        'monitoring-diagnostic-failure',
        code,
        stage === 'contract' ? error.message : '',
        Date.now() - startedAt,
        ['AbortError', 'TypeError'].includes(error.name) ? error.name : 'Error',
        controller.signal.aborted ? 'timeout' : 'not-timeout',
      );
      return json(
        { error: 'Não foi possível obter um retrato completo e válido do monitoramento.', code },
        502,
      );
    }
    return json(
      { error: 'Não foi possível obter um retrato completo e válido do monitoramento.' },
      502,
    );
  } finally {
    clearTimeout(timer);
  }
}
