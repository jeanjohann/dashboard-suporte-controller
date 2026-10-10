import React from 'react';
export function ReportControls({onExpand}){
 return <div className="report-downloads report-icon-controls" aria-label="Abertura dos relatórios"><button type="button" title="Abrir todos os relatórios" aria-label="Abrir todos os relatórios" onClick={()=>onExpand({open:true})}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 8 6 6 6-6M6 14l6 6 6-6"/></svg></button><button type="button" title="Recolher todos os relatórios" aria-label="Recolher todos os relatórios" onClick={()=>onExpand({open:false})}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 10 6-6 6 6M6 16l6-6 6 6"/></svg></button></div>;
}
export function PagePersonalization({labels,hidden,setHidden,children}){
 return <details className="panel personalization"><summary>Personalizar o que aparece na tela</summary>{children}<h3>Relatórios visíveis</h3><div className="preference-grid">{labels.map(label=><label key={label}><input type="checkbox" checked={!hidden.includes(label)} onChange={event=>setHidden(previous=>event.target.checked?previous.filter(item=>item!==label):[...previous,label])}/>{label}</label>)}</div><button onClick={()=>setHidden([])}>Mostrar todas as seções</button><p className="scope">Ocultar uma seção mantém os filtros e os cálculos.</p></details>;
}
