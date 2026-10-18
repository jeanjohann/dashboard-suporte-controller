/** Fluxo manual de homologação: somente números fictícios, sem acesso a arquivos ou ferramentas. */
export function geminiDemoWorkflow(credential) {
  return {
    id: 'labGeminiDemo01',
    name: 'LAB · Gemini · Consulta fictícia de atendimentos',
    active: false,
    nodes: [
      {
        id: 'manual-gemini-demo',
        name: 'Iniciar teste fictício',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [260, 260],
        parameters: {},
      },
      {
        id: 'answer-gemini-demo',
        name: 'Explicar indicadores fictícios',
        type: '@n8n/n8n-nodes-langchain.chainLlm',
        typeVersion: 1.9,
        position: [520, 260],
        parameters: {
          promptType: 'define',
          text: 'Você é um assistente de análise de suporte. Responda em português em até 150 palavras, usando exclusivamente os dados fictícios abaixo. Não invente causas, clientes, custos ou tendências. Informe que é demonstração, o período, a fonte, os critérios e que o mês não está completo. Não trate linhas como chamados distintos. Não sugira que consultou arquivos reais.\n\nPergunta: Quantos chamados distintos e atendimentos efetivos tivemos no mês disponível? Separe as visitas improdutivas.\n\nDADOS FICTÍCIOS: fonte DEMONSTRACAO.xlsx, aba OS DEMO, período 01/05/2026 a 31/05/2026, últimos realizados em 08/05/2026. Visitas e atendimentos realizados: 20; efetivos: 18; improdutivos: 2; chamados distintos entre realizados: 15; realizados sem data válida excluídos: 1. Critérios: realizados têm Status Concluída ou Pago e Data de atendimento válida no período; efetivos excluem Motivo Visita Improdutiva. Os números foram calculados previamente, não precisam ser recalculados.',
        },
      },
      {
        id: 'model-gemini-demo',
        name: 'Gemini · Credencial cadastrada',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        typeVersion: 1.2,
        position: [540, 480],
        parameters: {
          modelName: 'models/gemini-flash-latest',
          options: { temperature: 0.2, maxOutputTokens: 2048 },
        },
        credentials: { googlePalmApi: { id: credential.id, name: credential.name } },
      },
    ],
    connections: {
      'Iniciar teste fictício': {
        main: [[{ node: 'Explicar indicadores fictícios', type: 'main', index: 0 }]],
      },
      'Gemini · Credencial cadastrada': {
        ai_languageModel: [
          [{ node: 'Explicar indicadores fictícios', type: 'ai_languageModel', index: 0 }],
        ],
      },
    },
    settings: { executionOrder: 'v1', saveManualExecutions: true },
    pinData: {},
  };
}
