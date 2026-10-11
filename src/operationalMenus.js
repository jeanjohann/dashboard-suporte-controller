import {parkSections} from './parkAnalysis.js';

export const operationalMenus=[
  {key:'overview',label:'Visão geral',sections:[]},
  {key:'records',label:'Registros',sections:['Registros operacionais']},
  {key:'review',label:'Revisão',sections:['Revisão manual']}
];
export const crossAnalysisMenus=[
  {key:'overview',label:'Visão geral',sections:[]},
  {key:'park',label:'Parque',sections:['Parque por cliente, modelo, plano e situação']},
  {key:'maintenance',label:'Manutenção',sections:parkSections.slice(0,3)},
  {key:'monthly',label:'Valores mensais',sections:['Valores mensais lançados']},
  {key:'links',label:'Vínculos',sections:['Vínculos com o histórico de OS']},
  {key:'reports',label:'Relatórios',sections:[parkSections[3]]}
];
export function hiddenByOperationalMenu(analysis,key){
  const menus=analysis?crossAnalysisMenus:operationalMenus;
  const active=menus.find(menu=>menu.key===key)||menus[0];
  return menus.flatMap(menu=>menu.sections).filter(title=>!active.sections.includes(title));
}
