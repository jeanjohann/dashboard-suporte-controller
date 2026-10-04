import {test} from 'node:test';
import assert from 'node:assert/strict';
import {technicianRanking} from './technicians.js';
const labels=['Cód.','Nome do Técnico','Status','Técnico','Km','Custo Total'];
function fixture(){return {columns:labels.map(label=>({label})),rows:[['#1',1,'Ana','Pago',100,0,100],['#1',1,'Ana','Concluída',100,50,155],['#2',2,'Bruno','Pago',null,0,null],['#3',1,'Ana','Cancelada',999,999,1998],['#4',null,'Sem código','Pago',10,0,10]].map(([os,...values],i)=>({os,sourceRow:i+2,cells:values.map(raw=>({raw}))}))};}
test('ranking identifica por código, inclui zeros válidos e usa total lançado',()=>{const result=technicianRanking(fixture());const ana=result.items[0];assert.equal(ana.code,'1');assert.equal(ana.attendances,2);assert.equal(ana.calls.size,1);assert.equal(ana.cost,25500);assert.equal(ana.costCount,2);assert.equal(ana.travel,5000);assert.equal(ana.travelCount,2);assert.equal(ana.chargedCount,1);assert.equal(ana.travel/ana.travelCount,2500);assert.equal(ana.chargedTravel/ana.chargedCount,5000);assert.equal(result.missingCode,1);assert.equal(result.items[1].costCount,0);});
test('sem cabeçalho necessário ranking é indisponível',()=>{assert.equal(technicianRanking({columns:[],rows:[]}),null);});
