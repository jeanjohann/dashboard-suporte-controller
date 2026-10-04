import React from 'react';
export function Navigation({page,onPage}){
  return <aside><div className="logo">S<span>Suporte<br/><small>CONTROLLER</small></span></div><nav className="side-navigation" aria-label="Páginas do sistema">{[['orders','Ordens de serviço'],['lines','Linhas - Controle de Consumo'],['operational','Operacional — Importação e Revisão'],['operational-analysis','Operacional × OS — Análises']].map(([key,label])=><button key={key} className={page===key?'active':''} aria-current={page===key?'page':undefined} onClick={()=>onPage(key)}>{label}</button>)}</nav><div className="aside-note">Seu espaço de análise<br/><strong>Dados, relatórios e equipamentos</strong><p>Dados carregados somente nesta sessão do navegador.</p></div></aside>;
}
