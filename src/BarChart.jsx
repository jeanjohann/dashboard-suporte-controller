import React,{useState} from 'react';
import {Chart} from './Chart.jsx';
export function BarChart({title,description,items,format=value=>value.toLocaleString('pt-BR')}){
 const [type,setType]=useState('bars');
 return <section className="panel chart-panel"><div className="chart-heading"><h2>{title}</h2><label>Gráfico <select value={type} onChange={event=>setType(event.target.value)}><option value="bars">Barras</option><option value="line">Linhas</option><option value="pie">Pizza</option><option value="donut">Rosca</option></select></label></div><p className="scope">{description}</p><Chart items={items} type={type} title={title} format={format}/></section>;
}
