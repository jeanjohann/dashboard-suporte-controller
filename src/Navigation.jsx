import React from 'react';
export function Navigation({page,onPage}){
  return <aside><div className="logo">S<span>Suporte<br/><small>CONTROLLER</small></span></div><nav className="side-navigation" aria-label="Páginas do sistema"><button className={page==='orders'?'active':''} aria-current={page==='orders'?'page':undefined} onClick={()=>onPage('orders')}>Ordens de serviço</button><button className={page==='lines'?'active':''} aria-current={page==='lines'?'page':undefined} onClick={()=>onPage('lines')}>Linhas - Controle de Consumo</button></nav><div className="aside-note">Seu espaço de análise<br/><strong>Dados, relatórios e equipamentos</strong><p>Dados carregados somente nesta sessão do navegador.</p></div></aside>;
}
