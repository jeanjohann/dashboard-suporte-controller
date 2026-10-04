import {test} from 'node:test';
import assert from 'node:assert/strict';
import {observedPeriods,todaySaoPaulo} from './lifecycle.js';
function fixture(events){return {columns:['Status','Motivo','Placa','ID Rastreador','Data de atendimento','Tipo de Serviço'].map((label,i)=>({label,letter:String.fromCharCode(65+i)})),rows:events.map(([kind,date],i)=>({sourceRow:i+2,cells:['Pago',kind==='i'?'Instalação Business 2.1':'Desinstalação Business 2.1','ABC',123,date,'Implementação'].map(raw=>({raw,display:String(raw)}))}))};}
test('ciclo encerrado mede diferença entre datas e não depende do filtro para resolver vínculo',()=>{const d=fixture([['i',45000],['r',45010]]);assert.equal(observedPeriods(d,d).periods[0].days,10);assert.equal(observedPeriods(d,{...d,rows:d.rows.slice(1)}).periods.length,0);});
test('instalações repetidas, retirada sem início e eventos no mesmo dia exigem revisão',()=>{for(const values of [[['i',45000],['i',45001],['r',45010]],[['r',45010]],[['i',45000],['r',45000]]]){const d=fixture(values);const result=observedPeriods(d,d);assert.equal(result.periods.length,0);assert.equal(result.review.length,1);}});
test('sem retirada usa referência e exige Implementação',()=>{
  const d=fixture([['i',45000]]);const r=observedPeriods(d,d,'2023-03-25');assert.equal(r.periods[0].days,10);assert.equal(r.periods[0].state,'Sem retirada registrada');
  d.rows[0].cells[5].raw='Assistência Técnica';assert.equal(observedPeriods(d,d,'2023-03-25').periods.length,0);assert.equal(observedPeriods(d,d,'2023-03-25').review.length,1);
});
test('referência inválida e anterior à instalação não produzem duração',()=>{const d=fixture([['i',45000]]);assert.equal(observedPeriods(d,d,'').invalidReference,true);assert.equal(observedPeriods(d,d,'2023-01-01').periods.length,0);});
test('data padrão usa São Paulo mesmo após meia-noite UTC',()=>{assert.equal(todaySaoPaulo(new Date('2026-10-04T01:00:00Z')),'2026-10-03');});
