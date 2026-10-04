import React,{useState} from 'react';
import {Section} from './Section.jsx';
import {RecordDetails} from './RecordDetails.jsx';
import {summaryMetrics} from './summary.js';
import {attendanceExtent} from './filters.js';
const currency=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dateLabel=date=>date?date.split('-').reverse().join('/'):'Sem limite';
export function SummaryCards({data,financial,devices,visible,filters={}}){
  const [detail,setDetail]=useState(null),metrics=summaryMetrics(data,financial,devices),selected=metrics.find(item=>item.key===detail);
  const period=attendanceExtent(data),active=Boolean(filters.start||filters.end);
  return <Section title="Resumo numérico" visible={visible}><div className="summary-period"><strong>{active?`Período consultado: ${dateLabel(filters.start)} até ${dateLabel(filters.end)}`:period.start?`Período dos registros selecionados: ${dateLabel(period.start)} até ${dateLabel(period.end)}`:'Sem datas de atendimento válidas na seleção'}</strong><p className="scope">{active&&(period.start?`Datas presentes na seleção: ${dateLabel(period.start)} até ${dateLabel(period.end)}. `:'Nenhum registro com data válida neste período. ')}{data.invalidPeriod?'Período inválido: a data inicial é posterior à final. ':''}{active?`${data.missingDates||0} registros excluídos do período por data ausente ou inválida.`:`${period.missing} registros sem data válida mantidos nas demais análises.`} Datas referentes à seleção de registros; cada indicador mantém seus critérios de status.</p></div><p className="scope">Resumo dos filtros atuais. Contagens e valores financeiros usam as regras aprovadas. Clique em um card para conferir a origem.</p><div className="summary-grid">{metrics.map(item=><button key={item.key} className={`summary-card ${detail===item.key?'chosen':''}`} disabled={item.value==null} onClick={()=>setDetail(detail===item.key?null:item.key)}><span>{item.label}</span><strong>{item.value==null?'—':item.currency?currency(item.value):item.value.toLocaleString('pt-BR')}</strong><small>{item.note}</small></button>)}</div>{selected&&<RecordDetails data={data} rows={selected.rows} title={selected.label}/>}</Section>;
}
