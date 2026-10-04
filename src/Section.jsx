import React,{createContext,useContext,useRef,useEffect} from 'react';
export const PrintContext=createContext({});
export const ExpansionContext=createContext(null);
export function Section({title,visible,children,defaultOpen}){
  const section=useRef(),context=useContext(PrintContext);
  const expansion=useContext(ExpansionContext);
  const [expanded,setExpanded]=React.useState(defaultOpen ?? !['Histórico de equipamentos','Dados e revisão','Configurações de relatório','Exportações','Filtros adicionais','Detalhamento de chamados','Tempo observado em campo','Indicadores financeiros','Indicadores operacionais'].includes(title));
  useEffect(()=>{if(expansion)setExpanded(expansion.open);},[expansion]);
  function print(){
    const frame=document.createElement('iframe');frame.title='Impressão da seção';frame.style.cssText='position:fixed;width:1px;height:1px;left:-9999px';document.body.append(frame);
    const doc=frame.contentDocument;const heading=doc.createElement('h1');heading.textContent=title;
    const metadata=doc.createElement('p');metadata.textContent=`Arquivo: ${context.filename||'—'} | Filtros: ${JSON.stringify(context.filters||{})} | Referência temporal: ${context.referenceDate||'—'}`;
    const clone=section.current.cloneNode(true);clone.querySelectorAll('.summary-card').forEach(element=>{const card=doc.createElement('div');card.className='summary-card';card.innerHTML=element.innerHTML;element.replaceWith(card);});clone.querySelectorAll('.sort-heading').forEach(element=>element.replaceWith(doc.createTextNode(element.textContent)));clone.querySelectorAll('button,input,select,.recharts-tooltip-wrapper').forEach(element=>element.remove());clone.querySelectorAll('details').forEach(element=>element.open=true);
    const style=doc.createElement('style');style.textContent='@page{size:landscape;margin:12mm}body{font:11px Arial;color:#192c43}h1{font-size:20px}h2{font-size:15px}table{border-collapse:collapse;width:100%}th,td{padding:5px;border:1px solid #ccd5dd;white-space:normal!important;max-width:none!important;overflow:visible!important}thead{display:table-header-group}.table-scroll,.chart-bars,.readable-bars{max-height:none!important;overflow:visible!important}.panel{break-inside:auto}.scope{font-size:10px}svg{max-width:100%}th{position:static}.cards{display:flex;gap:15px}.chart-legend{list-style:none;padding:0}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summary-card{border:1px solid #ccd5dd;padding:12px;display:flex;flex-direction:column;gap:8px}.summary-card strong{font-size:20px}.readable-bar-row{display:grid;grid-template-columns:34% 1fr 100px;gap:16px;align-items:center;padding:12px 0;break-inside:avoid}.bar-name{overflow-wrap:anywhere}.readable-track{position:relative;height:18px;background:#edf2f4;print-color-adjust:exact}.readable-track div{print-color-adjust:exact}.stack-track{display:flex;height:20px;background:#edf2f4;print-color-adjust:exact}.stack-track span{display:block;height:100%;print-color-adjust:exact}.visit-timeline li{margin:12px 0;break-inside:avoid}';
    doc.head.append(style);doc.title=title;doc.body.append(heading,metadata,clone);
    frame.contentWindow.addEventListener('afterprint',()=>frame.remove(),{once:true});
    setTimeout(()=>{frame.contentWindow.focus();frame.contentWindow.print();},200);
  }
  return <div hidden={!visible}><details className="workspace-section" open={expanded} onToggle={event=>setExpanded(event.currentTarget.open)}><summary>{title}</summary><div className="section-body"><div className="section-actions"><button onClick={print}>Imprimir / Salvar PDF</button></div><div ref={section}>{children}</div></div></details></div>;
}
