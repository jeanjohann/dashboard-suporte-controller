export const MB_SCALE=1000000;
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function parseCsv(text){
  text=text.replace(/^\uFEFF/,'');
  const first=text.split(/\r?\n/,1)[0];
  const delimiter=first.includes(';')?';':first.includes('\t')?'\t':',';
  const rows=[];let cells=[],value='',quoted=false,closed=false,line=1,start=1;
  const finish=()=>{cells.push(value);value='';closed=false;};
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(quoted){if(char==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else{value+=char;if(char==='\n')line++;}continue;}
    if(char==='"'){if(value||closed)throw new Error(`Aspas inválidas na linha ${line}.`);quoted=true;}
    else if(char===delimiter)finish();
    else if(char==='\n'||char==='\r'){if(char==='\r'&&text[i+1]==='\n')i++;finish();if(cells.some(cell=>cell!==''))rows.push({sourceRow:start,cells});cells=[];line++;start=line;}
    else{if(closed&&!/\s/.test(char))throw new Error(`Conteúdo após aspas na linha ${line}.`);if(!closed)value+=char;}
  }
  if(quoted)throw new Error('CSV com aspas não fechadas.');
  finish();if(cells.some(cell=>cell!==''))rows.push({sourceRow:start,cells});return rows;
}
export function parseMB(value){
  const text=String(value).trim();
  if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,6})?$/.test(text))return null;
  const [whole,fraction='']=text.replaceAll('.','').split(',');
  const units=Number(whole)*MB_SCALE+Number(fraction.padEnd(6,'0'));
  return Number.isSafeInteger(units)?units:null;
}
export function consumptionDate(value){
  const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());if(!match)return null;
  const [,d,m,y]=match,date=new Date(Date.UTC(Number(y),Number(m)-1,Number(d)));
  return date.getUTCFullYear()===Number(y)&&date.getUTCMonth()===Number(m)-1&&date.getUTCDate()===Number(d)?`${y}-${m}-${d}`:null;
}
export const displayDate=value=>value?value.split('-').reverse().join('/'):'Não informado';
export function importConsumption(text){
  const parsed=parseCsv(text);if(parsed.length<2)throw new Error('CSV sem registros de consumo.');
  const headers=parsed[0].cells,names=headers.map(normalize);
  if(new Set(names).size!==names.length)throw new Error('CSV com cabeçalhos repetidos; revise o arquivo.');
  const aliases={iccid:['iccid'],number:['msisdn','msisn'],start:['periodo inicio'],end:['periodo termino'],consumption:['consumo (mb)'],plan:['plano'],company:['nome fantasia'],document:['cpf/cnpj'],technology:['tecnologia','tecnologia (2g/4g)'],contract:['contrato','numero do contrato','contrato vinculado']};
  const indexes=Object.fromEntries(Object.entries(aliases).map(([key,options])=>[key,names.findIndex(name=>options.includes(name))]));
  const missing=['iccid','number','start','end','consumption'].filter(key=>indexes[key]<0);if(missing.length)throw new Error(`Colunas necessárias ausentes: ${missing.map(key=>aliases[key][0]).join(', ')}.`);
  const rows=parsed.slice(1).map(source=>{
    if(source.cells.length!==headers.length)throw new Error(`Linha ${source.sourceRow}: quantidade de campos diferente do cabeçalho.`);
    const get=key=>source.cells[indexes[key]]?.trim()||'';
    const row={...source,iccid:get('iccid'),number:get('number'),start:consumptionDate(get('start')),end:consumptionDate(get('end')),units:parseMB(get('consumption')),plan:get('plan'),company:get('company'),document:get('document'),technology:get('technology'),contract:get('contract'),problems:[]};
    if(!/^\d+$/.test(row.iccid))row.problems.push('ICCID ausente ou não numérico');
    if(!/^\d+$/.test(row.number))row.problems.push('MSISDN ausente ou não numérico');
    if(!row.start||!row.end||row.start>row.end)row.problems.push('Período ausente, inválido ou invertido');
    if(row.units==null)row.problems.push('Consumo ausente ou inválido (MB brasileiro, até 6 casas decimais)');
    row.key=JSON.stringify([row.iccid,row.number]);row.period=row.start&&row.end?`${displayDate(row.start)} até ${displayDate(row.end)}`:'Período inválido';return row;
  });
  const byLine=new Map();for(const row of rows){if(!byLine.has(row.key))byLine.set(row.key,[]);byLine.get(row.key).push(row);}
  for(const entries of byLine.values())if(entries.length>1)for(const row of entries){row.overlap=true;row.problems.push('Par ICCID + MSISDN repetido no arquivo consolidado');}
  rows.forEach(row=>row.problems=[...new Set(row.problems)]);
  return {headers,rows,missingOptional:['technology','contract'].filter(key=>indexes[key]<0)};
}
export function summarizeConsumption(rows){
  const eligible=rows.filter(row=>row.units!=null&&row.start&&row.end&&row.start<=row.end&&/^\d+$/.test(row.iccid)&&/^\d+$/.test(row.number)&&!row.overlap);
  const groups=new Map();
  for(const row of rows){if(!groups.has(row.key))groups.set(row.key,{key:row.key,iccid:row.iccid,number:row.number,units:0,validCount:0,rows:[],plans:new Set(),contracts:new Set(),technologies:new Set(),companies:new Set(),periods:new Set()});const group=groups.get(row.key);group.rows.push(row);for(const [key,value] of [['plans',row.plan],['contracts',row.contract],['technologies',row.technology],['companies',row.company],['periods',row.period]])group[key].add(value||'Não informado');}
  let units=0;const validRows=new Set(eligible);
  for(const group of groups.values())for(const row of group.rows)if(validRows.has(row)){group.units+=row.units;group.validCount++;units+=row.units;if(!Number.isSafeInteger(units))throw new Error('Total de consumo excede a precisão suportada.');}
  const items=[...groups.values()],valid=items.filter(group=>group.validCount),max=valid.length?Math.max(...valid.map(group=>group.units)):null;
  return {items,units:valid.length?units:null,average:valid.length?units/valid.length:null,largest:valid.filter(group=>group.units===max),validLines:valid.length,zeroLines:valid.filter(group=>group.units===0).length,excluded:rows.length-eligible.length,eligible};
}
export function consumptionGroups(result,field){
  const groups=new Map();for(const row of result.eligible){const label=row[field]||'Não informado';groups.set(label,(groups.get(label)||0)+row.units);}
  return [...groups].map(([label,value])=>({label,value:value/MB_SCALE}));
}
