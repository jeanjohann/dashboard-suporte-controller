import test from 'node:test';
import assert from 'node:assert/strict';
import { koreMegabytes, formatKoreMegabytes } from './koreDisplay.js';
import { linkConsumption } from './lineConsumption.js';
test('MB decimal preserva zero, bytes pequenos e ausência sem conversão binária', () => {
  assert.equal(koreMegabytes(1000000), 1);
  assert.equal(koreMegabytes(1048576), 1.048576);
  assert.equal(koreMegabytes(1), 0.000001);
  assert.equal(koreMegabytes(0), 0);
  for (const value of [null, undefined, -1, NaN, '1000000', Number.MAX_SAFE_INTEGER + 1])
    assert.equal(koreMegabytes(value), null);
  assert.match(formatKoreMegabytes(1), /0,000001 MB/);
  assert.equal(formatKoreMegabytes(null), 'Não informado');
});
test('linhas da API usam cadastro único conferido e não atribuem cliente por coincidência parcial', () => {
  const rows = [{ id: '1', iccid: '000123', number: '55119999', bytes: 1000000 }];
  const source = {
    data: {
      rows: [
        {
          sourceRow: 2,
          iccid: '000123',
          phone: '55119999',
          client: 'Cliente teste',
          serial: '123',
        },
      ],
    },
  };
  const linked = linkConsumption(rows, source);
  assert.equal(linked[0].client, 'Cliente teste');
  assert.equal(linked[0].linkState, 'ICCID e número conferidos');
  assert.equal(rows[0].client, undefined);
  source.data.rows.push({ ...source.data.rows[0], sourceRow: 3, client: 'Outro cliente' });
  assert.equal(linkConsumption(rows, source)[0].client, 'Não vinculado');
  assert.equal(linkConsumption(rows, source)[0].linkState, 'Vínculo ambíguo');
  assert.equal(linkConsumption(rows, null)[0].linkState, 'Operacional não importado');
});
