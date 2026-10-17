/** Navegação analítica: nomes históricos identificam as análises; o grupo só organiza a leitura. */
const views = (titles) => titles.map((title) => ({ title }));
export const orderStories = {
  operations: [
    {
      id: 'service-volume',
      title: 'Atendimentos e intervenções',
      description:
        'Volume, evolução e perfil dos serviços. Visitas improdutivas permanecem separadas das intervenções efetivas.',
      views: views([
        'Indicadores operacionais',
        'Evolução mensal',
        'Motivos das manutenções',
        'Perfil das intervenções por cliente',
      ]),
    },
    {
      id: 'calls-returns',
      title: 'Chamados, visitas e retornos',
      description:
        'Um chamado pode reunir vários serviços; retornos contam visitas em datas distintas.',
      views: views([
        'Atendimentos por veículo',
        'Chamados com vários serviços',
        'Detalhamento de chamados',
      ]),
    },
  ],
  clients: [
    {
      id: 'costs',
      title: 'Clientes, custos e responsabilidades',
      description:
        'Custo de execução, componentes e valores contratuais têm bases próprias; não representam recebimentos ou lucro.',
      views: views([
        'Indicadores financeiros',
        'Custo por cliente',
        'Composição do custo',
        'Evolução dos custos',
        'Serviços absorvidos pela Addlog',
      ]),
    },
  ],
  equipment: [
    {
      id: 'equipment-cycles',
      title: 'Ciclos e trocas',
      description:
        'Cada visualização usa sua própria população e evento final. Ciclos abertos não são vida útil concluída.',
      views: views([
        'Vida em campo até primeira troca',
        'Tempo observado em campo',
        'Tempo até retirada no histórico',
        'Trocas de equipamentos',
      ]),
    },
  ],
  reports: [
    {
      id: 'data-reports',
      title: 'Dados e relatórios',
      description: 'Confira a origem, personalize a análise e exporte o recorte desta categoria.',
      views: views([
        'Dados e revisão',
        'Relatório personalizado',
        'Configurações de relatório',
        'Relatório descritivo',
        'Exportações',
      ]),
    },
  ],
};
// Todos os grupos ficam montados; trocar a categoria só altera a disponibilidade das visualizações.
export const allOrderStories = Object.values(orderStories).flat();
