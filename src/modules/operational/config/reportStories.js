/** Parque: fotografia, manutenção vinculada e origem permanecem conceitos separados. */
import { parkSections } from '../../park/domain/parkAnalysis.js';
export const parkStories = [
  {
    id: 'park-maintenance',
    title: 'Manutenção no parque registrado',
    description:
      'Da cobertura dos atendimentos ao detalhe por cliente/modelo e à exportação do mesmo recorte.',
    views: parkSections.map((title, index) => ({
      title,
      label: [
        'Indicadores e cobertura',
        'Comparação por cliente e modelo',
        'Perfil das intervenções',
        'Relatório e exportação',
        'Histórico individual e concentração',
      ][index],
    })),
  },
];
