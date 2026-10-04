import {test} from 'node:test';import assert from 'node:assert/strict';
import {trackerModel,trackerModelPrefixes} from './trackerModels.js';import {durationInsights} from './insights.js';
test('todos os prefixos aprovados classificam IDs textuais e numéricos sem alterar a origem',()=>{
 for(const [prefix,model] of Object.entries(trackerModelPrefixes)){const cell={raw:prefix+'123456'};assert.equal(trackerModel(cell),model);assert.equal(cell.raw,prefix+'123456');assert.equal(trackerModel({raw:Number(prefix+'123456')}),model);}
 for(const raw of ['',null,'999123','0162123','abc162','162.123',162.5,Number.MAX_SAFE_INTEGER+1])assert.equal(trackerModel({raw}),null);assert.equal(trackerModel({raw:'162123',issue:true}),null);
});
test('duração usa modelo por prefixo e mantém desconhecidos, originais e ciclos abertos',()=>{
 const data={columns:[{label:'ID Rastreador'},{label:'Modelo'},{label:'Tipo de Serviço'}],rows:['130111','137222','144333','999444'].map((id,i)=>({sourceRow:i+2,cells:[{raw:id},{raw:'Original'},{raw:'Implementação'}]}))};
 const periods=[{state:'Encerrado',days:10,installationRow:2,removalRow:3},{state:'Encerrado',days:30,installationRow:3,removalRow:4},{state:'Sem retirada registrada',days:500,installationRow:4,removalRow:null},{state:'Encerrado',days:40,installationRow:5,removalRow:4}];
 const result=durationInsights(data,{periods});assert.equal(result.items.find(g=>g.label==='MXT-130v1').median,20);assert.equal(result.items.find(g=>g.label==='MXT-130v2').median,null);assert.equal(result.unknownModels,1);assert.equal(result.closedCount,3);assert.equal(result.openCount,1);assert.equal(result.median,30);assert.ok(result.items.some(g=>g.label==='Modelo não identificado pelo ID'));assert.equal(durationInsights(data,{periods},'Modelo').items[0].label,'Original');
});
