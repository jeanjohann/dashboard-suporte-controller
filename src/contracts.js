import {field} from './filters.js';
import {money} from './analysis.js';
export function contractualSummary(data){
 if(!['Status','Cobrança','Valor a cobrar'].every(label=>data.columns.some(c=>c.label===label)))return null;
 const groups={Cliente:{sum:0,rows:[],missing:0},Addlog:{sum:0,rows:[],missing:0}};
 let unclassified=0;
 for(const row of data.rows){
  if(!['Concluída','Pago'].includes(field(data,row,'Status')?.raw))continue;
  const billing=field(data,row,'Cobrança');const group=!billing?.issue?groups[billing?.raw]:null;
  if(!group){unclassified++;continue;}
  const amount=money(field(data,row,'Valor a cobrar'));
  if(amount==null){group.missing++;continue;}group.sum+=amount;group.rows.push(row.sourceRow);
 }
 for(const g of Object.values(groups)){g.count=g.rows.length;g.total=g.count?g.sum:null;g.average=g.count?g.sum/g.count:null;}
 const count=groups.Cliente.count+groups.Addlog.count;
 return {groups,count,total:count?groups.Cliente.sum+groups.Addlog.sum:null,average:count?(groups.Cliente.sum+groups.Addlog.sum)/count:null,unclassified};
}
