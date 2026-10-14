import test from 'node:test';
import assert from 'node:assert/strict';
import { financialFields, insightExportValues } from './insightExport.js';
import { csv } from '../../../shared/export/exports.js';

const metric = (sum, count = 1) => ({ sum, count });
const group = () => ({
  label: '=Cliente',
  rows: [2, 3, 4],
  calls: new Set(['#1', '#2']),
  ...Object.fromEntries(financialFields.map(([key]) => [key, metric(0, 0)])),
  cost: metric(125000, 2),
  technician: metric(0),
  travel: metric(-100),
  composition: { technician: 7500, travel: 2500, count: 2 },
  share: { travel: 2500, cost: 10000, count: 2 },
});

test('exportações financeiras contêm números em reais, incluindo zero e negativos, e não convertem ausências em zero', () => {
  const item = group(),
    before = structuredClone(item);
  const clients = insightExportValues('clients', item);
  assert.deepEqual(clients, ['=Cliente', 3, 2, 1250, 0, -1, null, null, null, '2 / 3']);
  const text = csv([clients]);
  assert.ok(text.includes("'=Cliente"));
  assert.ok(!text.includes('R$'));
  assert.ok(text.includes(';1250;0;-1;"";"";"";'));
  assert.deepEqual(item, before);
});

test('composição, médias e percentuais são exportados sem arredondar os valores do domínio', () => {
  const item = group();
  assert.deepEqual(insightExportValues('composition', item), [
    '=Cliente',
    75,
    25,
    25,
    '2 / 3',
    1250,
  ]);
  assert.deepEqual(insightExportValues('calls', item), ['=Cliente', 3, 1250, 625, '2 / 3']);
  assert.deepEqual(insightExportValues('monthly', item), [
    '=Cliente',
    3,
    1250,
    625,
    -1,
    25,
    '2 / 3',
    2,
  ]);
  item.cost = metric(10001, 3);
  assert.equal(insightExportValues('calls', item)[3], 10001 / 3 / 100);
  item.cost = metric(0, 0);
  item.share.cost = 0;
  item.composition = { count: 0, technician: 0, travel: 0 };
  assert.deepEqual(insightExportValues('composition', item), [
    '=Cliente',
    null,
    null,
    null,
    '0 / 3',
    null,
  ]);
  assert.equal(insightExportValues('monthly', item)[5], null);
});
