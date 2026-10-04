import {test} from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import {applyFilters,monthlyCompleted,attendanceDate} from './filters.js';
import {importWorkbook} from './import.js';
function fixture(){const wb=XLSX.utils.book_new();const sheet=XLSX.utils.aoa_to_sheet([['#','Status','Data de atendimento','UF'],['#1','Pago',new Date(2025,0,31),'SP'],['#1','Cancelada',null,'SP'],['#2','Concluída',new Date(2025,1,1),'PR'],['#3','Pago',null,'SP']]);XLSX.utils.book_append_sheet(wb,sheet,'OS 2025');return importWorkbook(XLSX.write(wb,{type:'buffer',bookType:'xlsx'}));}
test('filtros preservam ordem e incluem limites de datas',()=>{const data=fixture();assert.equal(applyFilters(data,{}).rows.length,4);const selected=applyFilters(data,{UF:'SP',start:'2025-01-31',end:'2025-01-31'});assert.equal(selected.rows.length,1);assert.equal(selected.calls,1);assert.equal(selected.missingDates,2);assert.equal(selected.rows[0].sourceRow,2);assert.equal(attendanceDate(data,data.rows[0]),'2025-01-31');});
test('gráfico exclui canceladas e realizados sem data',()=>{const result=monthlyCompleted(fixture());assert.deepEqual(result.items,[{label:'2025-01',value:1},{label:'2025-02',value:1}]);assert.equal(result.missingDates,1);});
test('período invertido e filtro sem correspondência ficam vazios',()=>{const data=fixture();const selected=applyFilters(data,{start:'2025-02-01',end:'2025-01-01'});assert.equal(selected.invalidPeriod,true);assert.equal(selected.rows.length,0);assert.equal(applyFilters(data,{UF:'XX'}).rows.length,0);});
test('calendário 1904 e texto de data têm tratamento explícito',()=>{const data={date1904:true,columns:[{label:'Data de atendimento'}]};assert.equal(attendanceDate(data,{cells:[{raw:0}]}),'1904-01-01');assert.equal(attendanceDate(data,{cells:[{raw:'31/01/2025'}]}),null);});
test('seleção múltipla usa OU no campo e E entre campos, sem duplicar linhas',()=>{
  const data=fixture();
  assert.equal(applyFilters(data,{UF:['SP','PR']}).rows.length,4);
  const selected=applyFilters(data,{UF:['SP','PR'],Status:['Pago','Concluída']});
  assert.equal(selected.rows.length,3);
  assert.equal(selected.calls,3);
  assert.deepEqual(selected.rows.map(row=>row.sourceRow),[2,4,5]);
  assert.equal(applyFilters(data,{UF:[],Status:[]}).rows.length,4);
  assert.equal(applyFilters(data,{UF:['XX']}).rows.length,0);
});
test('filtros adicionais distinguem cabeçalhos repetidos e aceitam ausência de dados',()=>{
  const data={columns:[{index:2,label:'CNPJ'},{index:36,label:'CNPJ'}],rows:[{sourceRow:2,os:'#1',cells:[{display:'A'},{display:'B'}]},{sourceRow:3,os:'#2',cells:[{display:'A'},{display:''}]}],issues:[]};
  assert.equal(applyFilters(data,{'column:36':['B']}).rows[0].os,'#1');
  assert.equal(applyFilters(data,{'column:2':['A'],'column:36':['']}).rows[0].os,'#2');
  assert.equal(applyFilters(data,{'column:36':[]}).rows.length,2);
});
test('Cidade permite seleção múltipla e combina com UF',()=>{
  const data={columns:[{index:0,label:'Cidade'},{index:1,label:'UF'}],rows:[['Curitiba','PR'],['Londrina','PR'],['São Paulo','SP']].map(([city,uf],i)=>({sourceRow:i+2,os:'#'+i,cells:[{raw:city,display:city},{raw:uf,display:uf}]})),issues:[]};
  assert.equal(applyFilters(data,{Cidade:['Curitiba','Londrina'],UF:['PR']}).rows.length,2);
  assert.equal(applyFilters(data,{Cidade:['São Paulo'],UF:['PR']}).rows.length,0);
});
