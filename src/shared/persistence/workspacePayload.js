/** Contratos fechados do piloto: consumo, configurações e últimas consultas Zoho. */
import { validateBackup, emptyHistory } from '../../modules/consumption/data/consumptionHistory.js';
import {
  validateDashboardDocument,
  emptyDashboardDocument,
} from '../../modules/my-dashboard/domain/layout.js';
import { zohoPeriod } from '../data/zohoActivity.js';
import { analyzeZohoPresence } from '../../modules/orders/domain/zohoPresence.js';
export const workspaceKinds = [
  'consumption',
  'dashboards',
  'zoho-support',
  'zoho-indicators',
  'zoho-backlog',
  'zoho-presence',
];
export const workspaceMaxBytes = 16 * 1024 * 1024;
export async function workspaceHash(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function emptyWorkspace(kind) {
  return kind === 'consumption'
    ? { ...emptyHistory(), _revision: 0 }
    : kind === 'dashboards'
      ? emptyDashboardDocument()
      : null;
}
export async function validateWorkspaceValue(kind, value) {
  if (!workspaceKinds.includes(kind)) throw Error('Recurso inválido.');
  if (kind === 'consumption') {
    if (!Array.isArray(value?.files) || value.files.length > 300)
      throw Error('Limite de 300 arquivos por histórico.');
    const { _revision, ...input } = value;
    return validateBackup(JSON.stringify(input));
  }
  if (kind === 'dashboards') return validateDashboardDocument({ ...value, revision: 0 });
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Consulta inválida.');
  if (kind === 'zoho-presence') {
    if (
      !value.source ||
      !Array.isArray(value.source.headers) ||
      !Array.isArray(value.source.rows) ||
      value.source.rows.length > 10000 ||
      value.source.headers.length > 100
    )
      throw Error('Fonte Session inválida.');
    if (
      Object.keys(value).some(
        (key) => !['source', 'mapping', 'offset', 'start', 'end', 'report'].includes(key),
      ) ||
      Object.keys(value.source).some((key) => !['filename', 'headers', 'rows'].includes(key)) ||
      typeof value.source.filename !== 'string' ||
      value.source.filename.length > 500 ||
      !value.mapping ||
      typeof value.mapping !== 'object' ||
      Object.keys(value.mapping).some((key) => !['agent', 'start', 'end'].includes(key)) ||
      ['agent', 'start', 'end'].some(
        (key) =>
          !Number.isInteger(value.mapping[key]) ||
          value.mapping[key] < -1 ||
          value.mapping[key] >= value.source.headers.length,
      ) ||
      !['', 'Z', '-03:00', '-04:00', '-05:00'].includes(value.offset) ||
      typeof value.start !== 'string' ||
      typeof value.end !== 'string' ||
      value.source.rows.some(
        (r) =>
          !Array.isArray(r.cells) ||
          r.cells.length > 100 ||
          r.cells.some((c) => typeof c !== 'string'),
      ) ||
      value.source.headers.some((c) => typeof c !== 'string')
    )
      throw Error('Linhas Session incompatíveis.');
    return {
      source: value.source,
      mapping: value.mapping,
      offset: value.offset,
      start: value.start,
      end: value.end,
      report: value.report
        ? analyzeZohoPresence(value.source.rows, value.mapping, {
            offset: value.offset,
            start: value.start,
            end: value.end,
          })
        : null,
    };
  }
  const data = value.data;
  if (!data || !Number.isFinite(Date.parse(data.readAt))) throw Error('Data da consulta ausente.');
  if (kind === 'zoho-backlog') {
    if (
      data.complete !== true ||
      !Array.isArray(data.tickets) ||
      data.tickets.length > 10000 ||
      data.tickets.some((r) => !['OPEN', 'ONHOLD'].includes(r.state))
    )
      throw Error('Carteira incompleta.');
  } else {
    zohoPeriod(data.period?.start, data.period?.end);
    if (
      !['entries', 'replies', 'review', 'metrics', 'closures', 'ticketIds'].every(
        (key) => Array.isArray(data[key]) && data[key].length <= 100000,
      )
    )
      throw Error('Consulta incompleta.');
    if (kind === 'zoho-indicators' && data.closureBasis !== 'current-status-v1')
      throw Error('Regra de fechamentos incompatível.');
  }
  const allowed =
    kind === 'zoho-backlog' ? ['data'] : ['data', 'reviewedReplies', 'mapping', 'columns'];
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw Error('Campos de consulta incompatíveis.');
  if (value.reviewedReplies !== undefined && typeof value.reviewedReplies !== 'boolean')
    throw Error('Revisão de respostas inválida.');
  if (
    value.mapping !== undefined &&
    (!value.mapping ||
      typeof value.mapping !== 'object' ||
      Array.isArray(value.mapping) ||
      Object.entries(value.mapping).some(
        ([key, item]) =>
          !/^\d{1,40}(?::execution|:scheduling)?$/.test(key) ||
          typeof item !== 'string' ||
          item.length > 200,
      ))
  )
    throw Error('Vínculo de agentes inválido.');
  if (
    value.columns !== undefined &&
    (!Array.isArray(value.columns) ||
      value.columns.length > 30 ||
      value.columns.some((c) => typeof c !== 'string' || c.length > 100))
  )
    throw Error('Colunas de consulta inválidas.');
  const text = JSON.stringify(value);
  if (
    /"(?:access_token|refresh_token|authorization|password|client_secret|api_key)"\s*:/i.test(text)
  )
    throw Error('Credenciais não pertencem ao acervo.');
  return JSON.parse(text);
}
export async function prepareWorkspace(kind, value) {
  const canonical = await validateWorkspaceValue(kind, value);
  const text = JSON.stringify(canonical),
    bytes = new TextEncoder().encode(text).length;
  if (bytes > workspaceMaxBytes)
    throw Error('O histórico excede 16 MB; exporte e revise antes de salvar.');
  const chunks = [];
  // Não quebra pares substitutos UTF-16, preservando caracteres e hashes.
  for (let at = 0; at < text.length;) {
    let end = Math.min(text.length, at + 32 * 1024);
    if (end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1])) end--;
    chunks.push(text.slice(at, end));
    at = end;
  }
  const parts = await Promise.all(chunks.map(workspaceHash)),
    hash = await workspaceHash(text);
  return { id: await workspaceHash(kind + '\n' + hash), hash, bytes, parts, chunks };
}
