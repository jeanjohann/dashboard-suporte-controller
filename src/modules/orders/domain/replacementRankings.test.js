import test from 'node:test';
import assert from 'node:assert/strict';
import { replacementRankings } from './replacementRankings.js';
test('ranking conta um par como evento, separa categorias, clientes e origens sem duplicar por número de linhas', () => {
  const events = [
    {
      key: 'a',
      clientKey: '1',
      client: 'Matriz',
      plate: 'ABC1D23',
      category: 'Rastreador/kit',
      rows: [2, 3],
      date: '2025-01-01',
    },
    {
      key: 'b',
      clientKey: '1',
      client: 'Matriz',
      plate: 'ABC1D23',
      category: 'RFID',
      rows: [4],
      date: '2025-02-01',
    },
    {
      key: 'c',
      clientKey: '2',
      client: 'Filial',
      plate: 'ABC1D23',
      category: 'Coletora',
      rows: [5],
      date: '2025-03-01',
    },
    {
      key: 'd',
      clientKey: null,
      client: 'Não resolvido',
      plate: 'XYZ2A34',
      category: 'Rastreador/kit',
      rows: [6, 7],
      date: '2025-04-01',
    },
  ];
  const value = replacementRankings(events);
  assert.equal(value.groups.length, 2);
  assert.equal(value.groups[0].value, 2);
  assert.equal(value.groups[0].trackers, 1);
  assert.equal(value.groups[0].rfid, 1);
  assert.deepEqual(value.groups[0].rows, [2, 3, 4]);
  assert.equal(value.groups[0].events[0].key, 'b');
  assert.equal(value.unidentified, 1);
  assert.equal(value.total, 4);
});
test('placa ausente não vira veículo fictício; cliente ainda pode entrar em seu próprio ranking', () => {
  const events = [
    {
      key: 'a',
      clientKey: '1',
      client: 'Cliente',
      plate: 'sem placa',
      category: 'RFID',
      rows: [2],
      date: null,
    },
  ];
  assert.equal(replacementRankings(events).groups.length, 0);
  assert.equal(replacementRankings(events, 'client').groups[0].rfid, 1);
  assert.equal(replacementRankings([], 'client').groups.length, 0);
});
