export const dashboardCategories=[
  {key:'overview',label:'Visão geral',sections:['summary','monthly']},
  {key:'operations',label:'Operação',sections:['maintenanceReasons','operations','monthly','recurrence','multiCalls','interventions','calls']},
  {key:'clients',label:'Clientes e custos',sections:['absorbedAnalysis','clientCosts','costComposition','costEvolution','finance']},
  {key:'technicians',label:'Técnicos',sections:['technicians','technicianContext']},
  {key:'equipment',label:'Equipamentos',sections:['fieldLife','parkLinks','swaps','history','lifecycle','durationAnalysis']},
  {key:'regions',label:'Regiões',sections:['geography']},
  {key:'reports',label:'Relatórios personalizados',sections:['report','saved','descriptive','export','extras']},
  {key:'data',label:'Dados e revisão',sections:['records']}
];
export function categoryVisibility(preferences,category){
  const allowed=dashboardCategories.find(item=>item.key===category)?.sections||[];
  return Object.fromEntries(Object.entries(preferences).map(([key,value])=>[key,value&&(key==='filters'||allowed.includes(key))]));
}
