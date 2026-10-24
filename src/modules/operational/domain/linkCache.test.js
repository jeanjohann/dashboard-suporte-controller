import test from 'node:test';
import assert from 'node:assert/strict';
import { cachedOperationalLinks } from './linkCache.js';

test('vínculo compartilhado é invalidado por qualquer base; OS ausente não herda histórico anterior', () => {
  const data = { rows: [{ sourceRow: 2, serial: '144001', plate: 'TST0001', cells: [] }] };
  const orders = {
    columns: ['ID Rastreador', 'Placa'].map((label) => ({ label })),
    rows: [{ sourceRow: 10, cells: [{ raw: '144001' }, { raw: 'TST0001' }] }],
  };
  const first = cachedOperationalLinks(data, orders);
  assert.equal(first[0].state, 'Com histórico disponível');
  assert.equal(cachedOperationalLinks(data, orders), first);
  assert.equal(
    cachedOperationalLinks(data, { ...orders, rows: [] })[0].state,
    'Sem atendimento no histórico disponível',
  );
  assert.equal(cachedOperationalLinks(data, null)[0].state, 'OS não importada');
  assert.notEqual(cachedOperationalLinks({ ...data }, orders), first);
  assert.equal(data.rows[0].services, undefined);
});
