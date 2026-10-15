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
    if (response.status === 401 || response.status === 403)
      throw Error(
        'Acesso ao monitoramento não autorizado. Entre novamente ou consulte o administrador.',
      );
    if (response.status === 503)
      throw Error(
        'Integração de monitoramento ainda não configurada ou temporariamente indisponível.',
      );
    throw Error(
      'Não foi possível atualizar o monitoramento. Os dados anteriores não foram substituídos.',
    );
  }
  return normalizeMonitoringSnapshot(await readSnapshotJson(response));
}
