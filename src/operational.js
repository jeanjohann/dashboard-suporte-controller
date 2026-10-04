import XLSX from 'xlsx';
import {field} from './filters.js';
export const operationalFields={number:'A',document:'B',client:'C',cycleStart:'S',cycleEnd:'T',plan:'AK',monthly:'AS',charge:'AT',status:'AU',canceled:'AV',implemented:'BC',plate:'BF',serial:'BH',model:'BJ',phone:'BM',iccid:'BN'};
const clean=value=>String(value??'').trim();
export function operationalDate(value,date1904=false){
  if(typeof value!=='number'||!Number.isFinite(value))return null;
  const d=XLSX.SSF.parse_date_code(value,{date1904});
  if(!d||d.y<1900||d.y>9999||(d.y===1900&&d.m===2&&d.d===29))return null;
  return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
}
export function importOperational(buffer){
  const book=XLSX.read(buffer,{type:'array',cellNF:true,cellText:true}),sheet=book.Sheets.Equipamentos;
  if(!sheet?.['!ref'])throw new Error('A aba “Equipamentos” não foi encontrada ou está vazia.');
  for(const [letter,label] of [['A','Nº'],['BH','Equipamentos'],['BF','Placa instalada'],['AU','Situação']])if(clean(sheet[letter+'1']?.v)!==label)throw new Error(`Confira o cabeçalho ${letter}1: esperado “${label}”. O layout não foi reconhecido.`);
  const columns=Array.from({length:77},(_,index)=>{const letter=XLSX.utils.encode_col(index);return {index,letter,label:clean(sheet[letter+'1']?.v)||letter};});
  const date1904=Boolean(book.Workbook?.WBProps?.date1904),rows=[],issues=[];
  const issue=(row,letter,reason,category='Conferência')=>issues.push({row:row.sourceRow,address:letter+row.sourceRow,column:columns.find(c=>c.letter===letter)?.label,value:row.cells[XLSX.utils.decode_col(letter)].display,reason,category});
  const last=XLSX.utils.decode_range(sheet['!ref']).e.r+1;
  let skipped=0;
  for(let r=2;r<=last;r++){
    if(!clean(sheet['A'+r]?.v)){if(columns.some(c=>clean(sheet[c.letter+r]?.v)))skipped++;continue;}
    const row={sourceRow:r,cells:columns.map(c=>{const cell=sheet[c.letter+r];return {raw:cell?.v??null,display:cell?.w??clean(cell?.v),formula:cell?.f??null,error:cell?.t==='e'};})};
    for(const [key,letter] of Object.entries(operationalFields))row[key]=clean(row.cells[XLSX.utils.decode_col(letter)].raw);
    rows.push(row);
    for(const c of columns){const cell=row.cells[c.index];if(cell.error)issue(row,c.letter,'Erro registrado no Excel','Formato');else if(cell.formula&&cell.raw==null)issue(row,c.letter,'Fórmula sem resultado armazenado; recalcular e salvar no Excel.','Formato');}
    for(const key of ['client','serial','plate','iccid'])if(!row[key])issue(row,operationalFields[key],'Campo ausente; conferir conforme a situação do equipamento.');
    for(const key of ['serial','iccid']){const cell=row.cells[XLSX.utils.decode_col(operationalFields[key])];if(row[key]&&!/^\d+$/.test(row[key]))issue(row,operationalFields[key],'Identificador contém caracteres não numéricos; conferir.','Formato');if(typeof cell.raw==='number'&&(!Number.isSafeInteger(cell.raw)||row[key].length>15))issue(row,operationalFields[key],'Identificador numérico longo: pode haver perda de precisão no Excel. Conferir e armazenar como texto.','Formato');}
    for(const key of ['cycleStart','cycleEnd','canceled','implemented']){const letter=operationalFields[key],cell=row.cells[XLSX.utils.decode_col(letter)];row[key+'Date']=cell.error?null:operationalDate(cell.raw,date1904);if(cell.raw!=null&&!row[key+'Date'])issue(row,letter,'Data incompatível; a célula original foi preservada.','Formato');}
    if(row.cycleStartDate&&row.cycleEndDate&&row.cycleStartDate>row.cycleEndDate)issue(row,'T','Fim do ciclo anterior ao início.');
    if(row.status==='Cancelado'&&!row.canceledDate)issue(row,'AV','Cancelado sem data válida: interrupção da mensalidade não confirmada.');
    if(row.status!=='Cancelado'&&row.canceledDate)issue(row,'AU','Data de cancelamento preenchida com situação diferente de Cancelado.');
    for(const key of ['monthly','charge']){const cell=row.cells[XLSX.utils.decode_col(operationalFields[key])];row[key+'Cents']=!cell.error&&typeof cell.raw==='number'&&Number.isFinite(cell.raw)?Math.round(cell.raw*100):null;if(row[key+'Cents']==null)issue(row,operationalFields[key],'Valor monetário ausente ou incompatível; excluído somente deste indicador.','Formato');}
  }
  for(const key of ['number','serial','plate','iccid']){const groups=new Map();for(const row of rows){if(!row[key])continue;const list=groups.get(row[key])||[];list.push(row);groups.set(row[key],list);}for(const list of groups.values())if(list.length>1)for(const row of list)issue(row,operationalFields[key],`Valor repetido nas linhas ${list.map(r=>r.sourceRow).join(', ')}; verificar se os vínculos são legítimos. Não houve exclusão automática.`,'Possível divergência');}
  return {rows,columns,issues,skipped,date1904};
}
export function linkOperational(data,orders){
  const index=new Map();
  const available=orders&&['ID Rastreador','Placa'].every(label=>orders.columns.some(c=>c.label===label));
  for(const row of orders?.rows||[]){const serialCell=field(orders,row,'ID Rastreador'),plateCell=field(orders,row,'Placa'),serial=clean(serialCell?.raw),plate=clean(plateCell?.raw);if(!/^\d+$/.test(serial)||!plate||serialCell?.issue||plateCell?.issue)continue;const key=JSON.stringify([serial,plate]),list=index.get(key)||[];list.push(row);index.set(key,list);}
  const counts=new Map();for(const row of data.rows){if(!row.serial||!row.plate)continue;const key=JSON.stringify([row.serial,row.plate]);counts.set(key,(counts.get(key)||0)+1);}
  return data.rows.map(row=>{const key=JSON.stringify([row.serial,row.plate]),services=index.get(key)||[];const invalid=!/^\d+$/.test(row.serial)||!row.plate||row.cells?.[59]?.error||row.cells?.[57]?.error;const state=!orders?'OS não importada':!available?'OS sem colunas para vínculo':invalid?'Identificação incompleta ou incompatível':counts.get(key)>1?'Vínculo operacional ambíguo':services.length?'Com histórico disponível':'Sem atendimento no histórico disponível';return {...row,services:state==='Com histórico disponível'?services:[],state};});
}
