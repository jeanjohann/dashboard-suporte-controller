import React,{createContext,useContext,useLayoutEffect,useMemo,useState} from 'react';

const ThemeContext=createContext({theme:'light',toggleTheme:()=>{}});
const storageKey='addlog-theme-v1';
export function ThemeProvider({children}){
  const [theme,setTheme]=useState(()=>{
    try{return localStorage.getItem(storageKey)==='dark'?'dark':'light';}
    catch{return 'light';}
  });
  useLayoutEffect(()=>{
    document.documentElement.dataset.theme=theme;
    try{localStorage.setItem(storageKey,theme);}catch{}
  },[theme]);
  const value=useMemo(()=>({theme,toggleTheme:()=>setTheme(previous=>previous==='dark'?'light':'dark')}),[theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
export function ThemeToggle(){
  const {theme,toggleTheme}=useTheme(),dark=theme==='dark';
  return <button type="button" className="theme-toggle" role="switch" aria-label="Tema escuro" aria-checked={dark} title={dark?'Ativar tema claro':'Ativar tema escuro'} onClick={toggleTheme}>
    <svg aria-hidden="true" viewBox="0 0 24 24">{dark?<path d="M20.6 14A8.7 8.7 0 0 1 10 3.4 8.8 8.8 0 1 0 20.6 14Z"/>:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>}</svg>
  </button>;
}
