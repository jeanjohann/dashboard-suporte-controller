/** O navegador consulta somente a própria origem; credenciais do fornecedor não entram neste contrato. */
import { normalizeMonitoringSnapshot, readSnapshotJson } from './snapshotContract.js';

export async function fetchMonitoringSnapshot({ signal, fetcher = fetch } = {}) {
  const response = await fetcher('/api/monitoring/snapshot', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'error',
    signal,
  });
  if (!response.ok) {
    if (response.status === 429)
      throw Error(
        'Aguarde um minuto entre consultas ao monitoramento, inclusive de outros usuários.',
      );
    if (response.status === 401 || response.status === 403)
      throw Error(
        'Acesso ao monitoramento não autorizado. Entre novamente ou consulte o administrador.',
      );
    if (response.status === 503)
      throw Error(
        'Integração de monitoramento ainda não configurada ou temporariamente indisponível.',
      );
    if (response.status === 502) {
      const body = await response.json().catch(() => null);
      const messages = {
        credential:
          'A API de rastreamento não autorizou a credencial configurada. Consulte o administrador.',
        size: 'O diagnóstico excedeu o limite de leitura. A frota anterior foi mantida.',
        contract:
          'O diagnóstico retornou dados incompletos ou incompatíveis. A frota anterior foi mantida.',
        http: 'O serviço de rastreamento retornou uma falha. A frota anterior foi mantida.',
        transport:
          'Não foi possível conectar ao serviço de rastreamento. A frota anterior foi mantida.',
        read: 'A resposta do serviço de rastreamento não pôde ser lida. A frota anterior foi mantida.',
      };
      if (Object.hasOwn(messages, body?.code)) throw Error(messages[body.code]);
    }
    throw Error(
      'Não foi possível atualizar o monitoramento. Os dados anteriores não foram substituídos.',
    );
  }
  return normalizeMonitoringSnapshot(await readSnapshotJson(response));
}
