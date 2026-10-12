/** Textos de apoio para leitura financeira e operacional; não executam nem alteram cálculos. */
export const metricHelp = {
  productive:
    'Conta linhas Concluída ou Pago sem Motivo Visita Improdutiva. Inclui os tipos de serviço executados, não apenas manutenção. Sem motivo informado, a planilha não permite confirmar improdutividade.',
  unproductive:
    'Conta linhas Concluída ou Pago com Motivo Visita Improdutiva. Houve visita, mas não execução da intervenção prevista. Seus custos válidos continuam incluídos nos indicadores financeiros.',
  completed:
    'Conta cada linha com status Concluída ou Pago como visita ou atendimento registrado, incluindo visitas improdutivas. Não equivale à quantidade de manutenções executadas. Um mesmo chamado pode ter várias linhas. Cancelada, Agendar e Agendado ficam fora. Use para medir o volume de serviços executados; Pago informa pagamento ao técnico, não recebimento do cliente.',
  calls:
    'Conta uma vez cada número de chamado que possui pelo menos um atendimento realizado na seleção. Vários serviços do mesmo chamado não aumentam este total. Use a comparação com atendimentos para identificar chamados com várias intervenções.',
  cost: 'Soma os valores válidos da coluna Custo Total nas linhas Concluída ou Pago. O valor lançado prevalece mesmo quando difere da soma Técnico + Km; a diferença deve ser conferida na revisão. Canceladas e valores ausentes ou incompatíveis não entram. Mede o custo registrado para executar os serviços, sem comprovar pagamento ou lucro.',
  average:
    'Divide a soma válida de Custo Total pela quantidade de atendimentos realizados com Custo Total válido, incluindo valores zero. Linhas sem custo válido não entram no numerador nem no denominador. Use para comparar o custo médio registrado entre períodos ou grupos, considerando que o perfil dos serviços pode variar.',
  travel:
    'Soma a coluna Km válida dos atendimentos Concluída ou Pago. Apesar do nome, a coluna contém reais de deslocamento, e não distância percorrida. Canceladas e valores incompatíveis ficam fora. Use para acompanhar a parcela de gasto associada aos deslocamentos.',
  trackers:
    'Conta os eventos confirmados de troca, e não a quantidade de linhas de OS. Um evento reúne retirada e instalação vinculadas conforme as regras de identificação; ocorrências ambíguas ficam para revisão. Use para acompanhar substituições registradas, sem concluir automaticamente defeito ou vida útil de fábrica.',
  collector:
    'Conta as linhas reconhecidas como troca de coletora nas assistências técnicas por manutenção de acessório, conforme o critério vigente nas instruções. Teclado e terminal de jornada pertencem à mesma categoria. Ambiguidades vão para revisão. Mede substituições registradas, não o estoque total instalado.',
  rfid: 'Conta as linhas reconhecidas como troca de leitor RFID nas assistências técnicas por manutenção de acessório, conforme o critério vigente nas instruções. Cada linha representa um item. Ambiguidades vão para revisão. Mede substituições registradas, sem inferir quantidade instalada ou taxa de falha.',
  maintenance:
    'Conta as linhas realizadas classificadas como Assistência Técnica na seleção. Mede o volume de manutenção registrado; nem toda assistência envolve troca de equipamento. Um veículo ou chamado pode aparecer em mais de uma linha.',
};
