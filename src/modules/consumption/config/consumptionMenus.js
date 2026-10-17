/** Categorias do consumo. Rótulos podem mudar; chaves e títulos dos relatórios preservam preferências e impressão. */
export const consumptionCategories = [
  ['overview', 'Visão geral', ['Visão geral do consumo', 'Comparativos por operadora']],
  [
    'investigation',
    'Acompanhamento',
    ['Fila de acompanhamento do consumo', 'Linha do tempo de consumo', 'Linhas para investigar'],
  ],
  [
    'equipment',
    'Clientes e equipamentos',
    ['Consumo por cliente e equipamento', 'Revisão dos vínculos'],
  ],
  [
    'history',
    'Histórico e arquivos',
    [
      'Arquivos e histórico',
      'Mensalidades dos extratos',
      'Fontes de consumo e preparação das APIs',
    ],
  ],
];
export const consumptionLayoutDefinitions = [
  ...new Set(consumptionCategories.flatMap(([, , titles]) => titles)),
].map((title) => ({ id: title, title }));
