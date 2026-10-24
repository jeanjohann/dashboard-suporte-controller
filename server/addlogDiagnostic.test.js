/** Homologa o contrato documentado do diagnóstico usando somente frota e credenciais fictícias. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticInstant, diagnosticUrl, normalizeAddlogDiagnostic } from './addlogDiagnostic.js';
import { monitoringResponse } from './monitoring.js';
import { monitorSnapshot } from '../src/modules/monitoring/domain/monitoring.js';
import { monitoringReport } from '../src/modules/monitoring/domain/monitoringReport.js';
import { normalizeMonitoringSnapshot } from '../src/modules/monitoring/data/snapshotContract.js';

const endpoint = 'https://sistema.addlog.com.br/api/base-teste/diagnostic';
const at = '2026-10-21T20:00:00.000Z';
const sample = () => ({
  generatedAt: '21-10-2026 20:00:00',
  windowHours: 24,
  errors: {},
  vehicles: [
    {
      base: 'base-teste',
      vehicleId: 'v1',
      identifier: '0001',
      plate: 'TEST-001',
      deviceId: 1440471773,
      deviceModel: 'MXT-130',
      lastUpdate: '18-10-2026 20:00:00',
      positions24h: 0,
      power: { externalFailure: false, supply: 0, batteryState: 0, batteryPercent: 0 },
      profiles: [{ type: 33, id: 7, name: 'Perfil de teste' }],
    },
  ],
});

test('campos explícitos de chip/prefixo preservam zeros; identificadores numéricos não são presumidos', () => {
  const input = sample();
  Object.assign(input.vehicles[0], {
    prefix: '007',
    iccid: '00001234567890123456',
    msisdn: '05511999999999',
  });
  const row = normalizeMonitoringSnapshot(normalizeAddlogDiagnostic(input, at)).vehicles[0];
  assert.equal(row.prefix, '007');
  assert.equal(row.iccid, input.vehicles[0].iccid);
  assert.equal(row.msisdn, input.vehicles[0].msisdn);
  input.vehicles[0].iccid = 123456;
  assert.throws(() => normalizeAddlogDiagnostic(input, at));
});

test('diagnóstico preserva zeros, IDs, UTC e metadados em ambas as validações e na exportação', () => {
  const input = sample();
  input.token = 'private-sentinel';
  input.vehicles[0].secret = 'private-sentinel';
  const output = normalizeMonitoringSnapshot(normalizeAddlogDiagnostic(input, at));
  const row = output.vehicles[0];
  assert.equal(row.identifier, '0001');
  assert.equal(row.trackerId, '1440471773');
  assert.equal(row.lastRecordAt, '2026-10-18T20:00:00Z');
  assert.equal(row.supplyVoltageV, 0);
  assert.equal(row.positions24h, 0);
  assert.equal(row.batteryPercent, 0);
  assert.equal(row.externalPowerFailure, false);
  assert.equal(output.source, 'addlog-legacy');
  assert.equal(output.referenceAt, at);
  assert.equal(output.collections[0].at, at);
  assert.doesNotMatch(JSON.stringify(output), /private-sentinel/);
  const result = monitorSnapshot(output);
  assert.equal(result.totals.delayed, 1);
  const report = monitoringReport(result, {});
  const positions = report.vehicles[0].findIndex((value) => value.startsWith('Posições'));
  assert.equal(report.vehicles[1][positions], 0);
});

test('ausência de posição não vira defeito ou consumo zero; perfis vazios continuam ausentes', () => {
  const input = sample();
  input.vehicles[0].lastUpdate = null;
  input.vehicles[0].power = null;
  input.vehicles[0].profiles = [];
  const output = normalizeAddlogDiagnostic(input, at);
  assert.equal(output.vehicles[0].supplyVoltageV, null);
  assert.equal(output.vehicles[0].profile, null);
  assert.equal(monitorSnapshot(output).totals.missing, 1);
  input.vehicles[0].power = { supply: 12.4 };
  const partialPower = normalizeAddlogDiagnostic(input, at).vehicles[0];
  assert.equal(partialPower.supplyVoltageV, 12.4);
  assert.equal(partialPower.externalPowerFailure, null);
  assert.equal(partialPower.batteryPercent, null);
  input.vehicles[0].profiles = [{ type: 33, id: 7, name: null }];
  assert.equal(normalizeAddlogDiagnostic(input, at).vehicles[0].profile, 'Perfil sem nome');
});

test('datas impossíveis ou futuras ficam neutras para revisão, incluindo hora e minuto inválidos', () => {
  for (const value of [
    '31-02-2026 12:00:00',
    '21-10-2026 24:00:00',
    '21-10-2026 12:60:00',
    'data incorreta',
    '23-10-2026 12:00:00',
  ]) {
    const input = sample();
    input.vehicles[0].lastUpdate = value;
    assert.equal(monitorSnapshot(normalizeAddlogDiagnostic(input, at)).totals.invalid, 1);
  }
  assert.equal(diagnosticInstant('29-02-2024 12:00:00'), '2024-02-29T12:00:00Z');
});

test('erros por base, duplicidade, janela diferente e identificadores numéricos imprecisos recusam o retrato inteiro', () => {
  for (const mutate of [
    (v) => {
      v.errors = { 'base-falha': 'private-sentinel' };
    },
    (v) => {
      delete v.errors;
    },
    (v) => {
      v.windowHours = 12;
    },
    (v) => {
      v.vehicles.push(v.vehicles[0]);
    },
    (v) => {
      v.vehicles[0].deviceId = Number.MAX_SAFE_INTEGER + 1;
    },
    (v) => {
      v.vehicles[0].positions24h = -1;
    },
    (v) => {
      v.vehicles[0].power.batteryPercent = 101;
    },
  ]) {
    const input = sample();
    mutate(input);
    assert.throws(() => normalizeAddlogDiagnostic(input, at));
  }
  const input = sample();
  input.vehicles.push({ ...input.vehicles[0], base: 'outra-base' });
  assert.equal(normalizeAddlogDiagnostic(input, at).collections.length, 2);
});

test('destino HTTPS restrito não permite redirecionamento, credenciais em URL ou parâmetros', () => {
  assert.equal(diagnosticUrl(endpoint), endpoint);
  for (const url of [
    'http://sistema.addlog.com.br/api/base-teste/diagnostic',
    'https://evil.example/api/base-teste/diagnostic',
    endpoint + '?token=private',
    endpoint + '#secret',
    'https://user:password@sistema.addlog.com.br/api/base-teste/diagnostic',
    'https://sistema.addlog.com.br/api/base-teste/vehicle',
  ])
    assert.throws(() => diagnosticUrl(url));
});

test('servidor envia somente Token/Accept, não encaminha sessão nem parâmetros e sanitiza erros', async () => {
  const env = {
    MONITORING_DIAGNOSTIC_URL: endpoint,
    MONITORING_DIAGNOSTIC_TOKEN: 'private-sentinel',
    MONITORING_DIAGNOSTIC_LIMITER: { limit: async () => ({ success: true }) },
  };
  const request = new Request('https://app.example/api/monitoring/snapshot?base=evil', {
    headers: { Cookie: 'user-cookie', 'Cf-Access-Jwt-Assertion': 'user-jwt' },
  });
  let calls = 0;
  const fetcher = async (url, options) => {
    calls++;
    assert.equal(url, endpoint);
    assert.equal(options.redirect, 'manual');
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(options.headers, { Accept: 'application/json', Token: 'private-sentinel' });
    return Response.json(sample());
  };
  const response = await monitoringResponse(request, env, fetcher);
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.doesNotMatch(await response.text(), /private-sentinel|user-cookie|user-jwt/);
  env.MONITORING_DIAGNOSTIC_LIMITER.limit = async () => ({ success: false });
  assert.equal((await monitoringResponse(request, env, fetcher)).status, 429);
  assert.equal(calls, 1);
  env.MONITORING_DIAGNOSTIC_LIMITER.limit = async () => ({ success: true });
  for (const fetchBad of [
    async () => new Response(null, { status: 302, headers: { Location: 'https://evil.example' } }),
    async () => new Response('private-sentinel', { status: 401 }),
    async () => new Response('<html>private-sentinel</html>'),
    async () => Response.json({ ...sample(), errors: { test: 'private-sentinel' } }),
    async () => {
      throw Error('private-sentinel');
    },
  ]) {
    const failure = await monitoringResponse(request, env, fetchBad);
    assert.equal(failure.status, 502);
    assert.doesNotMatch(await failure.text(), /private-sentinel/);
  }
  assert.equal(
    (await monitoringResponse(new Request(request.url, { method: 'POST' }), env, fetcher)).status,
    405,
  );
});
