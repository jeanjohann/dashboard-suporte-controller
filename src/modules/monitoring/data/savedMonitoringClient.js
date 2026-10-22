import { api } from '../../../shared/security/accessClient.js';
import { normalizeMonitoringSnapshot } from './snapshotContract.js';
export async function fetchSavedMonitoring({ refresh = false, signal } = {}) {
  const data = await api(refresh ? '/api/monitoring/refresh' : '/api/monitoring/saved', {
    method: refresh ? 'POST' : 'GET',
    signal,
  });
  if (
    data.version !== 1 ||
    !(data.snapshot === null || (data.snapshot && typeof data.snapshot === 'object'))
  )
    throw Error('Base salva incompatível.');
  return { ...data, snapshot: data.snapshot ? normalizeMonitoringSnapshot(data.snapshot) : null };
}
