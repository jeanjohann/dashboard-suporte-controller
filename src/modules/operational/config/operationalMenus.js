/**
 * Organização das categorias de navegação do operacional e dos cruzamentos com OS.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { parkSections } from '../../park/domain/parkAnalysis.js';
import { logisticsSections } from '../../logistics/domain/logistics.js';

export const operationalMenus = [
  { key: 'overview', label: 'Visão geral', sections: [] },
  { key: 'records', label: 'Registros', sections: ['Registros operacionais'] },
  { key: 'review', label: 'Revisão', sections: ['Revisão manual'] },
];
export const crossAnalysisMenus = [
  { key: 'overview', label: 'Visão geral', sections: [] },
  { key: 'park', label: 'Parque', sections: ['Parque por cliente, modelo, plano e situação'] },
  { key: 'maintenance', label: 'Manutenção', sections: parkSections.slice(0, 3) },
  { key: 'monthly', label: 'Valores mensais', sections: ['Valores mensais lançados'] },
  { key: 'links', label: 'Vínculos', sections: ['Vínculos com o histórico de OS'] },
  { key: 'logistics', label: 'Logística', sections: logisticsSections },
  { key: 'reports', label: 'Relatórios', sections: [parkSections[3]] },
];
/** Define as seções visíveis conforme a categoria escolhida no operacional ou em Parque e Manutenção. */
export function hiddenByOperationalMenu(analysis, key) {
  const menus = analysis ? crossAnalysisMenus : operationalMenus;
  const active = menus.find((menu) => menu.key === key) || menus[0];
  return menus.flatMap((menu) => menu.sections).filter((title) => !active.sections.includes(title));
}
