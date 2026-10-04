import {field} from './filters.js';
import {money} from './analysis.js';
export function technicianRanking(data){
  if(['Cód.','Nome do Técnico','Status','Técnico','Km','Custo Total'].some(name=>!data.columns.some(col=>col.label===name)))return null;
  const groups=new Map();let missingCode=0;
  for(const row of data.rows){
    if(!['Pago','Concluída'].includes(field(data,row,'Status')?.raw))continue;
    const code=field(data,row,'Cód.');if(code?.raw==null||code.issue||String(code.raw).trim()===''){missingCode++;continue;}
    const key=String(code.raw);if(!groups.has(key))groups.set(key,{code:key,names:new Set(),attendances:0,calls:new Set(),cost:0,technician:0,travel:0,costCount:0,technicianCount:0,travelCount:0,chargedTravel:0,chargedCount:0,rows:[]});
    const group=groups.get(key);group.attendances++;group.calls.add(row.os);group.rows.push(row.sourceRow);const name=field(data,row,'Nome do Técnico');if(name?.raw&&!name.issue)group.names.add(String(name.raw));
    for(const [metric,label] of [['cost','Custo Total'],['technician','Técnico'],['travel','Km']]){const value=money(field(data,row,label));if(value!=null){group[metric]+=value;group[metric+'Count']++;if(metric==='travel'&&value>0){group.chargedTravel+=value;group.chargedCount++;}}}
  }
  return {missingCode,items:[...groups.values()].sort((a,b)=>b.attendances-a.attendances||a.code.localeCompare(b.code,'pt-BR',{numeric:true}))};
}
