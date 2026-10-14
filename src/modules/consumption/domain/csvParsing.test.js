import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from './consumption.js';
import { importLineStatement } from './lineConsumption.js';

test('reconhecimento ignora separadores e aspas escapadas dentro dos cabeçalhos nos três formatos', () => {
  for (const delimiter of [',', ';', '\t']) {
    const text = `\ufeff"Razão; Social, Matriz\tcom ""aspas"""${delimiter}ICCID${delimiter}MSISDN\r\n"Cliente; filial"${delimiter}00123${delimiter}00456`;
    const parsed = parseCsv(text);
    assert.deepEqual(parsed[0].cells, ['Razão; Social, Matriz\tcom "aspas"', 'ICCID', 'MSISDN']);
    assert.deepEqual(parsed[1].cells, ['Cliente; filial', '00123', '00456']);
    assert.equal(parsed[1].sourceRow, 2);
  }
});

test('cabeçalho multilinha preserva o número físico de origem e arquivos inválidos continuam recusados', () => {
  const parsed = parseCsv('"Razão\nSocial; Matriz",ICCID,MSISDN\nCliente,123,456');
  assert.deepEqual(parsed[0].cells, ['Razão\nSocial; Matriz', 'ICCID', 'MSISDN']);
  assert.equal(parsed[1].sourceRow, 3);
  assert.throws(() => parseCsv('"Cabeçalho,sem fechamento'), /aspas não fechadas/);
  assert.throws(() => parseCsv('A,B\n"texto"inválido,2'), /Conteúdo após aspas/);
});

test('Arqia com coluna adicional contendo ponto e vírgula no cabeçalho importa identificadores e consumo corretamente', () => {
  const text =
    'ICCID,MSISDN,Período Início,Período Término,Consumo (MB),"Observação; origem"\n00123,00456,01/09/2026,28/09/2026,"1,500000",original';
  const statement = importLineStatement(text);
  assert.equal(statement.operator, 'Arqia');
  assert.equal(statement.rows[0].iccid, '00123');
  assert.equal(statement.rows[0].number, '00456');
  assert.equal(statement.rows[0].ticks, 1536000000);
  assert.equal(statement.rows[0].cells[5], 'original');
});
