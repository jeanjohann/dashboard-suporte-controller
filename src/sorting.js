export function sortValue(value){
  if(typeof value==='number')return Number.isFinite(value)?value:null;
  const text=String(value??'').trim();
  if(!text||text==='—'||text==='Sem data válida')return null;
  if(/^\d{4}-\d{2}-\d{2}$/.test(text))return Date.parse(text+'T00:00:00Z');
  if(/^\d{2}\/\d{2}\/\d{4}$/.test(text)){const [d,m,y]=text.split('/');return Date.parse(`${y}-${m}-${d}T00:00:00Z`);}
  const numeric=text.replace(/^R\$\s*/,'').replace(/\s/g,'');
  if(/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(numeric))return Number(numeric.replaceAll('.','').replace(',','.'));
  return text;
}
export function compareValues(a,b,direction='asc'){
  const x=sortValue(a),y=sortValue(b);
  if(x==null)return y==null?0:1;if(y==null)return -1;
  const comparison=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),'pt-BR',{numeric:true});
  return direction==='desc'?-comparison:comparison;
}
