import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dataVolume,lineMoney,VOLUME_SCALE,importLineStatement,consumptionEligible,consumptionSummary,linkConsumption,baselineByPeriod,attachBaselines,mergeHistoryFiles,toggleHistoryFile,historyStatements,periodOptions,lineTimeline,chipKey} from './lineConsumption.js';
export const arqia=(rows)=>'ICCID;MSISDN;Período Início;Período Término;Consumo (MB);Plano\n'+rows.join('\n');
export const kore=(rows)=>'ICCID;MSISDN;Data Início;Data Fim;Consumo Total;Serviço;Produto;Valor Total;Valor Faturado\n'+rows.join('\n');
const period='01/09/2026;28/09/2026';
const entry=(iccid,number,mb,plan='20 MB')=>`${iccid};${number};${period};${mb};${plan}`;
const file=(id,text)=>({id,text,filename:id+'.csv',importedAt:'2026-10-10T12:00:00Z'});
const op=(sourceRow,iccid,phone,serial='123',client='Cliente A')=>({sourceRow,iccid,phone,serial,client,model:'Modelo',status:'Ativo',plate:'ABC1D23'});
test('conversão KB, MB e GB soma sem arredondamento por linha; dinheiro inclui desconto negativo',()=>{
 assert.equal(dataVolume('1 KB'),1000000);assert.equal(dataVolume('1,5 MB'),VOLUME_SCALE*1.5);assert.equal(dataVolume('1 GB'),VOLUME_SCALE*1024);
 assert.equal(dataVolume('0 KB'),0);for(const text of ['', '-1 MB','0 Un','12.34 MB','1,1234567 KB'])assert.equal(dataVolume(text),null);
 assert.equal(lineMoney('1.234,56'),123456);assert.equal(lineMoney('-2,05'),-205);assert.equal(lineMoney('0'),0);assert.equal(lineMoney(''),null);assert.equal(lineMoney('1,001'),null);
});
test('Kore contabiliza dados, mantém SMS/frete separados e preserva IDs longos e cancelamentos',()=>{
 const iccid='089551805670305208517',phone='005511913795620';
 const parsed=importLineStatement(kore([`${iccid};${phone};24/08/2026;23/09/2026;1 KB;dados;IoT;4,17;4,00`,`${iccid};${phone};24/08/2026;23/09/2026;0 Un;SMS;SMS;0,05;0,00`,';;24/08/2026;23/09/2026;;frete;Envio;6,00;6,00']),'kore.csv','k');
 assert.equal(parsed.operator,'Kore');assert.equal(parsed.rows.length,3);assert.equal(parsed.rows[0].iccid,iccid);assert.equal(parsed.rows[0].number,phone);assert.equal(parsed.rows[0].days,31);assert.equal(parsed.rows[0].sourceRow,2);assert.equal(parsed.rows[0].totalCents,417);assert.ok(parsed.rows.every(row=>!row.duplicate));
 const result=consumptionSummary(parsed.rows);assert.equal(result.lines,1);assert.equal(result.samples,1);assert.equal(result.ticks,1000000);assert.equal(result.ticks/VOLUME_SCALE,1/1024);
 const canceled=importLineStatement(kore([`1;11;24/08/2026;23/09/2026;0 KB;dados;IoT;0;0`]).replace('Valor Faturado','Valor Faturado;Status').replace(';IoT;0;0',';IoT;0;0;Cancelado'));
 assert.ok(consumptionEligible(canceled.rows[0]));
});
test('zero participa da média e mediana; ausências e IDs inválidos não viram zero ou chip',()=>{
 const rows=importLineStatement(arqia([entry('1','11','10'),entry('2','12','0'),entry('3','13',''),entry('4','14','30'),entry('','15','4')])).rows;
 const result=consumptionSummary(rows);assert.equal(result.lines,4);assert.equal(result.samples,3);assert.equal(result.zero,1);assert.equal(result.active,2);assert.equal(result.excluded,2);assert.equal(result.ticks,40*VOLUME_SCALE);assert.equal(result.average,40*VOLUME_SCALE/3);assert.equal(result.activeAverage,20*VOLUME_SCALE);assert.equal(result.median,10*VOLUME_SCALE);
 assert.equal(consumptionSummary([]).ticks,null);
});
test('duas ocorrências do mesmo chip/serviço/período são excluídas antes de filtrar, números iguais com chips distintos não',()=>{
 const rows=importLineStatement(arqia([entry('1','11','10','A'),entry('1','99','20','B'),entry('2','11','5','A')])).rows;
 assert.equal(consumptionSummary(rows.filter(row=>row.plan==='A')).ticks,5*VOLUME_SCALE);assert.ok(rows[0].duplicate);assert.ok(rows[1].duplicate);assert.equal(consumptionSummary(rows).lines,2);
 const different=importLineStatement(arqia([entry('1','11','10'),entry('2','11','20')]));assert.equal(consumptionSummary(different.rows).samples,2);
});
test('vínculo exige os dois identificadores únicos no mesmo registro; conflitos e identificadores numéricos inseguros ficam para revisão',()=>{
 const rows=importLineStatement(arqia([entry('1','11','1'),entry('2','12','1'),entry('3','13','1'),entry('4','14','1'),entry('5','15','1'),entry('6','16','1'),entry('7','17','1')])).rows;
 const cells=Array.from({length:77},()=>({raw:null,display:'',error:false}));cells[65]={raw:12345678901234567,display:'4',error:false};
 const operational={rows:[op(2,'1','11'),op(3,'2','99'),op(4,'99','12'),op(5,'3','13'),op(6,'3','98'),{...op(7,'4','14'),cells},op(8,'98','15'),op(9,'6','98'),op(10,'7','17','')]};
 const linked=linkConsumption(rows,operational);assert.equal(linked[0].linkState,'ICCID e número conferidos');assert.equal(linked[0].serial,'123');assert.equal(linked[1].linkState,'Chip e número apontam para registros diferentes');assert.equal(linked[1].client,'Não vinculado');assert.equal(linked[2].linkState,'Vínculo ambíguo');assert.equal(linked[3].linkState,'Somente número corresponde — revisar');assert.equal(linked[4].linkState,'Somente número corresponde — revisar');assert.equal(linked[5].linkState,'Somente ICCID corresponde — revisar');assert.equal(linked[6].linkState,'ICCID e número conferidos');assert.equal(linked[6].serial,'Não informado');
 assert.equal(linkConsumption(rows,null)[0].client,'Não vinculado');
});
test('referência de investigação usa operadora/período completos incluindo zeros, mesmo após filtrar cliente',()=>{
 const rows=importLineStatement(arqia([entry('1','11','0'),entry('2','12','10'),entry('3','13','50')])).rows,baseline=baselineByPeriod(rows),enriched=attachBaselines(rows,baseline,2);
 const single=enriched.filter(row=>row.iccid==='3');assert.equal(single[0].ratio,2.5);assert.equal(single[0].baselineSamples,3);assert.ok(single[0].attention);assert.equal(attachBaselines(rows,baseline,3)[2].attention,false);
});
test('histórico mantém meses, ignora arquivo idêntico, arquiva correção e rejeita dois extratos concorrentes',()=>{
 const original=file('a',arqia([entry('1','11','10')])),corrected=file('b',arqia([entry('1','11','20')])),older=file('c',arqia([entry('1','11','8')]).replaceAll('01/09/2026','01/08/2026').replaceAll('28/09/2026','31/08/2026'));
 let history=mergeHistoryFiles([], [original]);history=mergeHistoryFiles(history,[original]);assert.equal(history.length,1);
 history=mergeHistoryFiles(history,[corrected,older]);assert.equal(history.length,3);assert.equal(history[0].active,false);assert.equal(history[1].active,true);const reverted=toggleHistoryFile(history,'a');assert.equal(reverted[0].active,true);assert.equal(reverted[1].active,false);assert.equal(toggleHistoryFile(reverted,'a')[0].active,false);const active=historyStatements(history);assert.equal(active.length,2);assert.equal(periodOptions(active,'Arqia')[0].days,28);
 const rows=active.flatMap(file=>file.rows),timeline=lineTimeline(rows,chipKey(rows[0]));assert.equal(timeline.length,2);assert.equal(timeline[0].days,31);assert.equal(timeline[1].mbDay,20/28);
 assert.throws(()=>mergeHistoryFiles([],[original,corrected]),/mesma operadora e período/);assert.equal(original.active,undefined);
 const multi=file('m',arqia([entry('1','11','10'),entry('1','11','8').replace('01/09/2026','01/08/2026').replace('28/09/2026','31/08/2026')]));
 assert.throws(()=>mergeHistoryFiles([multi],[original]),/outros períodos/);assert.throws(()=>toggleHistoryFile([{...multi,active:false},{...original,active:true}],'m'),/outros períodos/);
});
test('formatos e datas incompatíveis são sinalizados sem alterar os registros de origem',()=>{
 assert.throws(()=>importLineStatement('Cliente;Motivo\nA;B'),/Formato não reconhecido/);
 assert.throws(()=>importLineStatement(arqia(['1;11;01/09/2026'])),/campos diferentes/);
 const parsed=importLineStatement(arqia([entry('1','11','1').replace('01/09/2026','31/02/2026')]));assert.equal(parsed.rows[0].cells[2],'31/02/2026');assert.equal(parsed.rows[0].days,null);assert.equal(consumptionSummary(parsed.rows).excluded,1);
});
