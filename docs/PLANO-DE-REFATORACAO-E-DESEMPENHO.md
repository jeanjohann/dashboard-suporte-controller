# Levantamento de refatoração e desempenho

## Rodada de apresentação e Dashboard — 24/10/2026, 0.68.0

Implementadas as frentes do levantamento 0.67.2: tabelas/detalhes, atividade de páginas e fontes, consultas do Dashboard e prévias de gestos. [Critérios, medições e limitações](REFATORACAO-068.md). Não houve exclusão de arquivos, migração de dados nem promessa de eliminação de toda tarefa longa. Importação em Worker, virtualização geral e retenção de memória prolongada permanecem condicionadas a evidência adicional.

## Levantamento atualizado — 24/10/2026, 0.67.2

Solicitado levantamento antes de continuar a implementação. [Evidências atuais e sequência de execução](LEVANTAMENTO-DESEMPENHO-0672.md): atividade do Monitoramento e fontes compartilhadas, vínculos sem paginação, cópias completas para impressão, auditorias fechadas, dependências dos cards e gestos. Somente documentação nesta rodada; ganhos adicionais ainda não medidos.

## Primeira rodada autorizada — 24/10/2026, 0.67.0

Executados reaproveitamento dos cálculos de OS, cache local de busca por versão da base e reaproveitamento do cruzamento Operacional × OS. Não altera critérios nem totais. Ensaio em navegador com dados fictícios e benchmark de busca isolada registrados em [Avisos, franquias e revisão](AVISOS-FRANQUIAS-E-REVISAO.md), incluindo o custo de preparação fria do cache. Os ganhos medidos não equivalem ao tempo total de abertura.

Continua pendente: páginas/gráficos inativos, demais grades extensas, isolamento de fontes do Meu Dashboard, processamento fora da interface quando justificado e divisão dos componentes maiores. CarrierPage.jsx, ConsumptionSourcesPanel.jsx e seletores theme-track são candidatos de revisão; nada foi excluído. O levantamento original abaixo é a referência histórica anterior a essa rodada.

Referência: 23/10/2026, versão 0.64.0. Levantamento inicial por leitura do código e benchmark sintético existente. Não inclui refatoração funcional, exclusões ou publicação. As prioridades abaixo são propostas para uma rodada futura.

## Diagnóstico inicial

Há oportunidades concretas de reduzir trabalho repetido e volume de interface montada. Ainda precisamos medir as páginas no navegador para atribuir os travamentos a uma causa e quantificar o ganho. Tempo de download, espera pela API, processamento dos dados e renderização devem ser registrados separadamente.

O banco guarda as fontes, mas as análises continuam sendo calculadas no navegador. Portanto, ter D1 não elimina automaticamente o custo de filtros, cruzamentos e gráficos.

## Fila sugerida

Esforço relativo: pequeno = ajuste localizado; médio = mais de um componente ou contrato; grande = alteração transversal, a dividir em entregas. Não são estimativas de prazo.

| Ordem | Frente                                        | Evidência e proposta                                                                                                                                                                                                                                                                                                                | Impacto esperado                                                                 | Esforço / cuidado                                                                               |
| ----- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1     | Medir os travamentos                          | Registrar primeira abertura, retorno à página, busca, ordenação, troca de filtros e abertura de gráficos; comparar sessão nova e sessão após visitar vários módulos.                                                                                                                                                                | Identificar a origem antes de alterar arquitetura.                               | Pequeno–médio; usar bases fictícias reproduzíveis.                                              |
| 2     | Separar cálculos da OS                        | `useOrdersSession.js` calcula filtros, resumo, custos, equipamentos, ciclos e revisão no corpo do hook. Busca e paginação também provocam renderização desse hook. Separar dependências e reaproveitar resultados que não mudaram; calcular relatórios pesados quando necessários.                                                  | Evitar repetir análises ao digitar na busca ou trocar apenas a página da tabela. | Médio; manter filtros independentes e critérios dos indicadores.                                |
| 3     | Reaproveitar vínculos do Operacional          | `OperationalPage.jsx` chama `linkOperational(data, orders?.data)` no corpo do componente antes dos filtros. Construir/reutilizar vínculos por versão das duas bases e separar busca, ordenação e agregações.                                                                                                                        | Reduzir trabalho repetido nas interações do Operacional.                         | Médio; invalidar o resultado sempre que qualquer fonte mudar.                                   |
| 4     | Controlar páginas e gráficos inativos         | `DeferredPage.jsx` mantém páginas visitadas montadas, ocultando-as com `hidden`. Medir memória e atualizações; suspender cálculos e gráficos inativos, preservando seleções fora da parte pesada.                                                                                                                                   | Reduzir o custo acumulado de uma sessão longa.                                   | Médio–grande; não perder filtros, formulários ou edição não salva.                              |
| 5     | Limitar tabelas e detalhes extensos           | Os registros principais da OS e do Operacional já têm paginação de 50 linhas. A relação de vínculos do Operacional usa `rows.map` sem esse limite. Inventariar demais grades e detalhes, paginar primeiro e avaliar virtualização onde fizer diferença.                                                                             | Diminuir elementos na tela e custo de renderização.                              | Médio; exportação deve continuar usando o recorte completo, não só a página visível.            |
| 6     | Isolar atualizações no Meu Dashboard          | `DashboardSources.jsx` publica todas as fontes em um contexto. `DashboardWidget.jsx` já usa `useMemo`, mas depende do objeto completo de fontes. Avaliar seletores por fonte e cache de consultas equivalentes entre cards. `useDashboards.js` também compara documentos com `JSON.stringify`; medir seu peso ao organizar painéis. | Evitar recalcular cards de outras fontes e melhorar painéis maiores.             | Médio; cache deve considerar usuário, permissões, versão, filtros e critérios; manter desfazer. |
| 7     | Tornar importação e abertura mais responsivas | A importação da OS executa `importWorkbook` no navegador. As bases salvas passam por reconstrução, validação e conversões. Medir essas etapas e, se dominarem as tarefas longas, avaliar Web Worker para parsing e transformações compatíveis.                                                                                      | Manter controles responsivos enquanto as bases são preparadas.                   | Médio–grande; manter validação, integridade e publicação consistente das fontes.                |
| 8     | Dividir componentes e organizar estilos       | Há páginas que acumulam filtros, importação, relatórios, revisão e tabelas, como OperationalPage, AdvancedInsights e SupportIndicatorsPage. Dividir por responsabilidade e consolidar regras de estilos após verificar a cascata.                                                                                                   | Facilitar manutenção, reduzir regressões e permitir otimizações localizadas.     | Médio–grande; tamanho de arquivo, sozinho, não comprova lentidão.                               |
| 9     | Auditar arquivos, dependências e documentação | Cruzar inventário de imports com rotas, assets, scripts, migrações, testes e referências documentais. Consolidar uma fila atual separada do histórico de entregas.                                                                                                                                                                  | Reduzir ruído e risco de trabalhar com instruções antigas.                       | Médio; nenhuma exclusão está aprovada neste levantamento.                                       |

## Medição reproduzível disponível

Executado `npm run benchmark:monitoring` nesta máquina em 23/10/2026. São 1.800 veículos fictícios em 20 bases, cinco aquecimentos e vinte amostras por operação. O script grava os resultados em `layout-review/`, fora da entrega pública.

| Operação isolada        | Mediana  | p95 conforme script existente |
| ----------------------- | -------- | ----------------------------- |
| Classificação           | 7,938 ms | 8,838 ms                      |
| Telemetria              | 0,977 ms | 1,162 ms                      |
| Filtro da fila          | 6,928 ms | 7,214 ms                      |
| Ordenação               | 0,241 ms | 0,322 ms                      |
| Preparação do relatório | 2,365 ms | 2,773 ms                      |

Esse ensaio em Node mede funções de domínio separadamente. Não mede navegador, DOM, gráficos, memória, transferência, D1 ou latência da API. Não comprova que o Monitoramento inteiro abre nesses tempos, nem descarta travamentos por repetição de cálculos ou renderização.

## Protocolo da próxima rodada

1. Reproduzir com 1.800 veículos fictícios e amostras de planilhas com volume equivalente ao uso atual. Incluir um cenário de crescimento e um painel com vários gráficos.
2. Medir no navegador: tarefas acima de 50 ms, duração dos commits React, tempo entre interação e atualização, quantidade de elementos e memória após navegar por vários módulos. Repetir nas mesmas condições, separando primeira abertura de retorno.
3. Medir rede e backend separadamente: quantidade de requisições, bytes, duração e falhas. Investigar Zoho como integração paginada, sem confundir espera de rede com bloqueio da interface.
4. Implementar uma frente por vez; comparar antes/depois e conferir que totais, filtros, exportações, origem dos dados e permissões continuam equivalentes. Estabelecer metas numéricas após a primeira medição real.
5. Só então ampliar a mudança para outros módulos e atualizar o mapa de arquitetura para refletir o código entregue.

## Limpeza segura

Ainda não há uma lista comprovada de arquivos descartáveis. Um arquivo sem import JavaScript pode ser um recurso público, template, script de manutenção, documentação ou migração necessária.

- **Excluir apenas após comprovação:** código realmente sem caminho de execução, assets substituídos sem referências e dependências sem uso nos builds, scripts e integrações.
- **Separar de código ativo:** documentos históricos e materiais de revisão, preservando referências úteis e a fila atual.
- **Tratar como artefatos locais:** builds, caches e imagens de validação podem ter política de retenção; apagá-los não corrige por si só a renderização das páginas.
- **Preservar:** dados e planilhas do usuário, backups, migrações SQL, histórico de auditoria, testes relevantes e materiais não rastreados cuja finalidade não foi confirmada.

## Ordem de execução recomendada

Começar pela medição e pelos recálculos da OS/Operacional. Depois tratar páginas inativas, grades extensas e cards do Dashboard. Usar os resultados para decidir sobre Workers e carregamento adicional sob demanda. Fazer a remoção de arquivos em uma entrega separada, com relação exata do que será removido e como foi comprovado o desuso.

Não há recomendação de trocar React, a biblioteca de gráficos ou o banco neste momento. O sistema já possui carregamento de páginas sob demanda, tabelas paginadas e cálculos memorizados em alguns módulos; a melhoria deve ampliar esses mecanismos onde a medição justificar.
