import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, money, finance } from './analysis.js';
test('chamados mistos preservam contagens por linha e por chamado', () => {
  const data = { columns: [{ label: 'Status' }], rows: [['#1','Pago'],['#1','Cancelada'],['#1','Concluída'],['#2','Cancelada'],['#2','Cancelada'],['#3','Agendado'],['#4','Não reconhecido']].map(([os, raw]) => ({ os, cells: [{ raw }] })) };
  const result = summarize(data);
  assert.equal(result.completed, 2); assert.equal(result.canceled, 3);
  assert.equal(result.canceledCalls, 2); assert.equal(result.other, 2);
  assert.deepEqual(result.calls[0], { os: '#1', total: 3, completed: 2, canceled: 1, other: 0 });
});
test('sem Status a análise fica indisponível', () => {
  assert.equal(summarize({ columns: [], rows: [] }), null);
});
test('moeda brasileira preserva zero e rejeita ausências e formatos ambíguos', () => {
  assert.equal(money({raw:'R$ 1.198,00'}),119800);
  assert.equal(money({raw:0}),0);
  assert.equal(money({raw:''}),null);
  assert.equal(money({raw:'666.67'}),null);
  assert.equal(money({raw:100,issue:true}),null);
});
test('financeiro exclui canceladas e agenda, mantém total divergente e cobra por linha', () => {
  const names=['Status','Km','Técnico','Custo Total','Cobrança','Valor a cobrar'];
  const data={columns:names.map((label,i)=>({label,letter:String.fromCharCode(65+i)})),rows:[
    ['Pago',10,100,105,'Cliente','R$ 199,00'],
    ['Concluída',0,50,50,'Addlog',149],
    ['Cancelada',999,999,1998,'Cliente',999],
    ['Agendado',999,999,1998,'Cliente',999],
    ['Pago',0,0,null,'Cliente',null]
  ].map((values,i)=>({sourceRow:i+2,cells:values.map(raw=>({raw,display:String(raw)}))}))};
  const result=finance(data);
  assert.equal(result.totals.cost,15500);
  assert.equal(result.totals.client,19900);
  assert.equal(result.totals.absorbed,14900);
  assert.equal(result.issues.length,1);
  assert.equal(result.eligible,3);
  assert.equal(result.excluded.cost,1);
  assert.equal(result.excluded.contractual,1);
});
