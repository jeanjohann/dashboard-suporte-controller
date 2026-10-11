import React,{useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
/** Explicação sob demanda; o texto também permanece disponível na impressão. */
export function InfoNote({children,label='Como este resultado é calculado'}){
  const [open,setOpen]=useState(false),[position,setPosition]=useState({}),trigger=useRef(null),bubble=useRef(null),id=useId();
  useEffect(()=>{
    if(!open)return;
    const rect=trigger.current.getBoundingClientRect(),width=Math.min(380,window.innerWidth-24);
    const below=window.innerHeight-rect.bottom-16,above=rect.top-16;
    setPosition({width,left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12)),...(below>=Math.min(240,above)?{top:rect.bottom+8,maxHeight:Math.max(80,below)}:{bottom:window.innerHeight-rect.top+8,maxHeight:Math.max(80,above)})});
    const outside=event=>{if(!trigger.current?.contains(event.target)&&!bubble.current?.contains(event.target))setOpen(false);};
    const escape=event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();}};
    const close=event=>{if(!bubble.current?.contains(event.target))setOpen(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);window.removeEventListener('resize',close);window.removeEventListener('scroll',close,true);};
  },[open]);
  return <span className="info-note"><button ref={trigger} type="button" className="info-trigger" aria-label={label} aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>setOpen(value=>!value)}>ⓘ</button><span className="info-print">{children}</span>{open&&createPortal(<div ref={bubble} id={id} className="info-popover" role="region" aria-label={label} style={position}><div className="info-popover-heading"><strong>{label}</strong><button type="button" aria-label="Fechar explicação" onClick={()=>{setOpen(false);trigger.current?.focus();}}>×</button></div><div>{children}</div></div>,document.body)}</span>;
}
