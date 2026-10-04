import {test} from 'node:test';import assert from 'node:assert/strict';import XLSX from 'xlsx';
import {descriptiveReport,descriptiveCsv,descriptiveWorkbook} from './descriptive.js';
const names=['Status','Razão Social','Placa','Data de atendimento','Custo Total','Técnico','Km','Cobrança','Valor a cobrar'];
const fixture=()=>({columns:names.map((label,index)=>({label,letter:String.fromCharCode(65+index)})),issues:[],rows:[['Pago','A','001',45658,100,70,20,'Cliente',200],['Concluída','B','002',45658,0,0,0,'Addlog',0],['Cancelada','A','003',45658,999,999,999,'Cliente',999]].map((values,i)=>({sourceRow:i+2,os:String(i+1),cells:values.map(raw=>({raw,display:typeof raw==='number'&&raw===45658?'01/01/2025':String(raw)}))}))});
test('resumo quantitativo exporta participação com base explícita e exclui canceladas',()=>{
 const d=fixture(),result=descriptiveReport(d,d,null,null,['clients']),record=result.records.find(r=>r.group==='A'&&r.indicator==='Atendimentos realizados');assert.equal(record.value,1);assert.equal(record.base,2);assert.equal(record.percentage,0.5);assert.equal(result.records.find(r=>r.group==='A'&&r.indicator==='Custo total lançado').value,100);assert.equal(result.records.find(r=>r.indicator==='Custo médio válido').percentage,null);
 const csv=descriptiveCsv(result,{filename:'teste.xlsx',filters:{UF:['SP']}});assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes('0,5'));assert.ok(csv.includes('teste.xlsx'));assert.ok(csv.includes('SP'));
});
test('XLSX usa números e percentual fracionário, mantém originais e textos sem fórmulas',()=>{
 const d=fixture();d.rows[0].cells[1]={raw:'=texto',display:'=texto'};const result=descriptiveReport(d,d,null,null,['clients']),buffer=descriptiveWorkbook(result,d,{filename:'teste.xlsx',filters:{},referenceDate:'2026-10-04'}),book=XLSX.read(buffer,{type:'array'});assert.deepEqual(book.SheetNames,['Relatório','Critérios','Atendimentos']);
 const percent=Object.values(book.Sheets['Relatório']).find(cell=>cell?.t==='n'&&cell.v===0.5);assert.ok(percent);assert.equal(book.Sheets.Atendimentos.D2.t,'s');assert.equal(book.Sheets.Atendimentos.D2.v,'001');assert.equal(book.Sheets.Atendimentos.C2.f,undefined);assert.equal(book.Sheets.Atendimentos.C2.v,'=texto');assert.equal(book.Sheets.Atendimentos.A4.v,4);
});
test('base zero não fabrica percentual e ausência não vira valor zero',()=>{
 const d=fixture();d.rows=d.rows.slice(1,2);d.rows[0].cells[4]={raw:'',display:''};const result=descriptiveReport(d,d,null,null,['clients']);assert.equal(result.records.find(r=>r.indicator==='Custo total lançado').value,null);assert.equal(result.records.find(r=>r.indicator==='Contratual Addlog').value,0);assert.equal(result.records.find(r=>r.indicator==='Contratual Addlog').percentage,null);
});
test('seleção vazia e análise indisponível são explícitas',()=>{
 const d=fixture();assert.equal(descriptiveReport(d,d,null,null,[]).records.length,0);assert.ok(descriptiveReport(d,d,null,{unavailable:true},['duration']).notes.length);
});
