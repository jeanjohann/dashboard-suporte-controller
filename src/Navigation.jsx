import React,{useEffect,useState} from 'react';
import {ThemeToggle} from './Theme.jsx';
import {SidePanelTarget} from './SidePanel.jsx';
const pages=[['imports','Importação'],['orders','Ordens de Serviço'],['operational','Operacional'],['lines','Controle de Consumo M2M'],['operational-analysis','Parque e Manutenção']];
export function Navigation({page,onPage}){
  const [collapsed,setCollapsed]=useState(()=>{try{return localStorage.getItem('addlog-sidebar-collapsed')==='true';}catch{return false;}});
  useEffect(()=>{const sync=()=>{try{setCollapsed(localStorage.getItem('addlog-sidebar-collapsed')==='true');}catch{}};window.addEventListener('sidebar-change',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('sidebar-change',sync);window.removeEventListener('storage',sync);};},[]);
  const toggle=()=>{const next=!collapsed;setCollapsed(next);try{localStorage.setItem('addlog-sidebar-collapsed',String(next));}catch{}window.dispatchEvent(new Event('sidebar-change'));};
  const icons=['⇧','▤','▦','◉','◎'];
  return <aside className={`app-navigation${collapsed?' sidebar-collapsed':''}`}><button className="sidebar-toggle" type="button" onClick={toggle} aria-label={collapsed?'Expandir menu':'Recolher menu'} aria-expanded={!collapsed} title={collapsed?'Expandir menu':'Recolher menu'}>{collapsed?'»':'«'}</button><div className="logo" aria-label="Addlog Suporte Controller"><span className="brand-image" role="img" aria-label="Addlog"/><div className="brand-caption">SUPORTE CONTROLLER</div></div><nav className="side-navigation" aria-label="Páginas do sistema">{pages.map(([key,label],index)=><div className="navigation-group" key={key}><button type="button" title={label} aria-label={label} className={page===key?'active':''} aria-current={page===key?'page':undefined} onClick={()=>onPage(key)}><span className="navigation-icon" aria-hidden="true">{icons[index]}</span><span className="navigation-label">{label}</span></button>{page===key&&<SidePanelTarget/>}</div>)}</nav><ThemeToggle/></aside>;
}
