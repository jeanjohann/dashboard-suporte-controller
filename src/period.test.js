import {test} from 'node:test';
import assert from 'node:assert/strict';
import {attendanceExtent,applyFilters} from './filters.js';
test('período ignora datas inválidas e não depende da ordem das linhas',()=>{
 const data={columns:[{label:'Data de atendimento'}],issues:[],rows:[45000,'',44000,46000,'01/01/2025'].map((raw,i)=>({sourceRow:i+2,os:String(i),cells:[{raw}]}))};
 const extent=attendanceExtent(data);assert.equal(extent.start,'2020-06-18');assert.equal(extent.end,'2025-12-09');assert.equal(extent.missing,2);
 const selected=applyFilters(data,{start:extent.start});assert.equal(selected.rows.length,3);assert.equal(selected.missingDates,2);assert.deepEqual(attendanceExtent(selected),{start:extent.start,end:extent.end,missing:0});
});
test('período sem datas e seleção vazia não inventam limites',()=>{
 assert.deepEqual(attendanceExtent({columns:[],rows:[{cells:[]}]}),{start:null,end:null,missing:1});
 assert.deepEqual(attendanceExtent({columns:[],rows:[]}),{start:null,end:null,missing:0});
});
