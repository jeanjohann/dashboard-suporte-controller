import React,{createContext,useContext,useState} from 'react';
import {createPortal} from 'react-dom';
const SidePanelContext=createContext(null);
export function SidePanelProvider({children}){
  const [target,setTarget]=useState(null);
  return <SidePanelContext.Provider value={{target,setTarget}}>{children}</SidePanelContext.Provider>;
}
export function SidePanelTarget(){const context=useContext(SidePanelContext);return <div className="sidebar-tools" ref={context?.setTarget}/>;}
export function SidebarContent({children}){const context=useContext(SidePanelContext);return context?.target?createPortal(children,context.target):null;}
