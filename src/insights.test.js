import {test} from 'node:test';import assert from 'node:assert/strict';
import {groupedCosts,callInsights,recurringVisits,interventionProfiles,durationInsights,monthlyCosts,median} from './insights.js';
const names=['Status','Razão Social','Placa','Data de atendimento','Tipo de Serviço','Motivo','Custo Total','Técnico','Km','Cobrança','Valor a cobrar','Modelo','Cód.','Nome do Técnico'];
const serial=date=>(Date.parse(date+'T00:00:00Z')-Date.parse('1899-12-30T00:00:00Z'))/86400000;
function data(records){return {columns:names.map(label=>({label})),issues:[],rows:records.map((record,i)=>({os:record.os||'1',sourceRow:i+2,cells:names.map(label=>({raw:record[label]??null}))}))};}
const base={Status:'Pago','Razão Social':'Cliente','Placa':'ABC','Tipo de Serviço':'Assistência Técnica','Custo Total':100,'Técnico':80,'Km':10,'Cobrança':'Cliente','Valor a cobrar':200,'Modelo':'M'};
test('custos por cliente mantêm total divergente, exclusões e cobrança Addlog separada',()=>{
 const d=data([base,{...base,'Cobrança':'Addlog','Custo Total':0,'Técnico':0,'Km':0},{...base,'Custo Total':'','Km':'',Status:'Concluída'},{...base,Status:'Cancelada'}]);const [item]=groupedCosts(d);
 assert.equal(item.rows.length,3);assert.equal(item.cost.sum,10000);assert.equal(item.cost.count,2);assert.equal(item.composition.count,2);assert.equal(item.composition.technician,8000);assert.equal(item.composition.travel,1000);assert.equal(item.absorbed.sum,20000);assert.equal(item.addlogCost.sum,0);
});
test('composição por técnico agrupa pelo código mesmo com nomes divergentes',()=>{
 const items=groupedCosts(data([{...base,'Cód.':'01','Nome do Técnico':'A'},{...base,'Cód.':'01','Nome do Técnico':'B'}]),'Cód.');assert.equal(items.length,1);assert.equal(items[0].rows.length,2);assert.ok(items[0].label.includes('A / B'));
});
test('chamados contam linhas realizadas e distribuição reconcilia sem canceladas',()=>{
 const result=callInsights(data([base,{...base,os:'1'},{...base,os:'2'},{...base,os:'1',Status:'Cancelada'}]));assert.equal(result.items.length,2);assert.equal(result.multiple.length,1);assert.equal(result.average,1.5);assert.equal(result.distribution.reduce((s,item)=>s+item.value,0),2);
});
test('visitas agrupam mesmo dia e cliente, retornos cumulativos, sem atalhos após filtro',()=>{
 const d=data([{...base,'Data de atendimento':serial('2025-01-01')},{...base,'Data de atendimento':serial('2025-01-01')},{...base,'Data de atendimento':serial('2025-01-20')},{...base,'Data de atendimento':serial('2025-03-01')},{...base,'Razão Social':'Outro','Data de atendimento':serial('2025-01-10')}]);const full=recurringVisits(d,d);assert.equal(full.items[0].visits.length,3);assert.equal(full.items[0].intervals.length,2);assert.equal(full.items[0].within30,1);assert.equal(full.items[0].within60,2);assert.equal(full.items[0].within90,2);
 const selected={...d,rows:d.rows.filter(row=>![4,6].includes(row.sourceRow))};assert.equal(recurringVisits(d,selected).items[0].intervals.length,0);
});
test('perfil preserva categorias sobrepostas e conta pares como eventos',()=>{
 const d=data([{...base,'Tipo de Serviço':'Implementação'},{...base,'Motivo':'Desinstalação Business 2.1'}]);const [item]=interventionProfiles(d,{swaps:[{installationRow:2,removalRow:3}],accessoryRows:{Coletora:[3],RFID:[]}});assert.equal(item.implementation,1);assert.equal(item.assistance,1);assert.equal(item.removal,1);assert.equal(item.trackers,1);assert.equal(item.collector,1);
});
test('mediana de duração exclui períodos sem retirada e contabiliza amostras',()=>{
 const d=data([base,{...base,'Tipo de Serviço':'Cancelamento'},{...base,Modelo:'M2'}]);const result=durationInsights(d,{periods:[{state:'Encerrado',days:10,installationRow:2,removalRow:3},{state:'Encerrado',days:30,installationRow:2,removalRow:3},{state:'Sem retirada registrada',days:500,installationRow:4,removalRow:null}]});assert.equal(result.median,20);assert.equal(result.closedCount,2);assert.equal(result.openCount,1);assert.equal(result.bins[0].value,2);assert.equal(result.items[1].median,null);assert.equal(median([]),null);
});
test('evolução mensal usa datas de atendimento e percentual com denominador compatível',()=>{
 const d=data([{...base,'Data de atendimento':serial('2025-01-01')},{...base,'Data de atendimento':serial('2025-01-02'),'Custo Total':'','Km':20},{...base,'Data de atendimento':null},{...base,Status:'Cancelada','Data de atendimento':serial('2025-01-03')}]);const result=monthlyCosts(d),item=result.items[0];assert.equal(result.missingDate,1);assert.equal(item.rows.length,2);assert.equal(item.cost.count,1);assert.equal(item.travel.sum,3000);assert.equal(item.share.count,1);assert.equal(item.share.travel/item.share.cost,0.1);
});
