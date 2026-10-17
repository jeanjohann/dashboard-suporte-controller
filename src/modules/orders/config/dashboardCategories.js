/**
 * Configuração de categorias e visibilidade dos relatórios de Ordens de Serviço. Não contém dados das planilhas.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
export const dashboardCategories = [
  { key: 'overview', label: 'Visão geral', sections: ['summary', 'monthly'] },
  {
    key: 'operations',
    label: 'Operação',
    sections: [
      'maintenanceReasons',
      'operations',
      'monthly',
      'recurrence',
      'multiCalls',
      'interventions',
      'calls',
      'geography',
    ],
  },
  {
    key: 'clients',
    label: 'Clientes e custos',
    sections: ['absorbedAnalysis', 'clientCosts', 'costComposition', 'costEvolution', 'finance'],
  },
  { key: 'technicians', label: 'Técnicos', sections: ['technicians', 'technicianContext'] },
  { key: 'support', label: 'Equipe de suporte', sections: ['supportPerformance'] },
  {
    key: 'equipment',
    label: 'Equipamentos',
    sections: ['fieldLife', 'swaps', 'history', 'lifecycle', 'durationAnalysis'],
  },
  {
    key: 'reports',
    label: 'Dados e relatórios',
    sections: ['records', 'report', 'saved', 'descriptive', 'export', 'extras'],
  },
];
/** Combina a categoria ativa com as preferências de exibição, sem eliminar dados da sessão. */
export function categoryVisibility(preferences, category) {
  const allowed = dashboardCategories.find((item) => item.key === category)?.sections || [];
  return Object.fromEntries(
    Object.entries(preferences).map(([key, value]) => [
      key,
      value && (key === 'filters' || allowed.includes(key)),
    ]),
  );
}
