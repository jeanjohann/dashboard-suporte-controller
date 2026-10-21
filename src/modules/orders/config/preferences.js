/**
 * Configuração de categorias e visibilidade dos relatórios de Ordens de Serviço. Não contém dados das planilhas.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
export const sectionLabels = {
  supportPerformance: 'Equipe de suporte',
  maintenanceMatrix: 'Modelo × motivo da manutenção',
  fieldLife: 'Vida em campo até primeira troca',
  maintenanceReasons: 'Motivos das manutenções',
  absorbedAnalysis: 'Serviços absorvidos pela Addlog',
  geography: 'Distribuição geográfica',
  technicianContext: 'Contexto da rede de técnicos',
  parkLinks: 'Validação dos vínculos com o parque',
  descriptive: 'Relatório descritivo',
  clientCosts: 'Custo por cliente',
  costComposition: 'Composição do custo',
  recurrence: 'Atendimentos por veículo',
  multiCalls: 'Chamados com vários serviços',
  interventions: 'Perfil das intervenções por cliente',
  durationAnalysis: 'Tempo até retirada no histórico',
  costEvolution: 'Evolução dos custos',
  summary: 'Resumo numérico',
  technicians: 'Ranking de técnicos',
  filters: 'Filtros principais',
  monthly: 'Evolução mensal',
  report: 'Relatório personalizado',
  saved: 'Configurações de relatório',
  export: 'Exportações',
  history: 'Histórico de equipamentos',
  lifecycle: 'Tempo observado em campo',
  extras: 'Filtros adicionais',
  swaps: 'Trocas de equipamentos',
  finance: 'Indicadores financeiros',
  operations: 'Indicadores operacionais',
  calls: 'Detalhamento de chamados',
  records: 'Dados e revisão',
};
/** Aceita apenas as seções conhecidas e mantém seções novas visíveis por padrão. */
export function cleanPreferences(value) {
  return Object.fromEntries(Object.keys(sectionLabels).map((key) => [key, value?.[key] !== false]));
}
/** Chaves históricas preservadas; o título real vincula a apresentação à Section correspondente. */
export const orderLayoutDefinitions = Object.entries(sectionLabels)
  .filter(([id]) => !['filters', 'extras'].includes(id))
  .map(([id, label]) => ({
    id,
    label,
    title: id === 'geography' ? 'Distribuição geográfica dos serviços' : label,
  }));

export function legacyOrderLayout() {
  const preferences = cleanPreferences(
    JSON.parse(localStorage.getItem('suporte-layout-v1') || '{}'),
  );
  return Object.fromEntries(
    Object.entries(preferences).map(([id, visible]) => [id, { visible, mode: 'default' }]),
  );
}
