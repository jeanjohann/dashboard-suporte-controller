/**
 * Estrutura do aplicativo: navegação, tema e ferramentas da barra lateral.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
const SidePanelContext = createContext(null);
/** Compartilha o destino dos controles específicos de cada página na barra lateral. */
export function SidePanelProvider({ children }) {
  const [target, setTarget] = useState(null);
  return (
    <SidePanelContext.Provider value={{ target, setTarget }}>{children}</SidePanelContext.Provider>
  );
}
/** Registra o elemento que receberá os controles da página ativa. */
export function SidePanelTarget() {
  const context = useContext(SidePanelContext);
  return <div className="sidebar-tools" ref={context?.setTarget} />;
}
/** Renderiza os controles no destino lateral por portal, preservando o contexto React da página. */
export function SidebarContent({ children }) {
  const context = useContext(SidePanelContext);
  return context?.target ? createPortal(children, context.target) : null;
}
