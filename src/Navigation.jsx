import React from 'react';
import {ThemeToggle} from './Theme.jsx';
const pages=[['orders','Ordens de Serviço'],['operational','Operacional'],['lines','Controle de Consumo M2M'],['operational-analysis','OS x OP']];
export function Navigation({page,onPage}){
  return <aside className="app-navigation"><div className="logo" aria-label="Addlog Suporte Controller"><span className="brand-image" role="img" aria-label="Addlog"/><div className="brand-caption">SUPORTE CONTROLLER</div></div><nav className="side-navigation" aria-label="Páginas do sistema">{pages.map(([key,label])=><button type="button" key={key} className={page===key?'active':''} aria-current={page===key?'page':undefined} onClick={()=>onPage(key)}>{label}</button>)}</nav><ThemeToggle/></aside>;
}
