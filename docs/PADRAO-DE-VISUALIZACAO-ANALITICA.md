# Padrão de visualização analítica

Critérios para escolher, organizar e conferir gráficos no sistema. Revisado em 25/10/2026 com base nos componentes existentes e nas boas práticas dos repositórios avaliados. Aplicar junto ao [modelo semântico analítico](MODELO-SEMANTICO-ANALITICO.md): o desenho não corrige uma definição de dado fraca.

## Escolha pelo tipo de pergunta

| Pergunta                                                       | Forma preferida                                                                | Cuidados                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quem/qual tem mais? Comparar responsáveis, bases ou categorias | Barras horizontais ordenadas                                                   | Mostrar unidade; limitar categorias só na visualização e manter total/detalhes completos.                                                                        |
| Como mudou no tempo?                                           | Linha; área apenas para volume acumulado                                       | Períodos em ordem cronológica e frequência consistente. Nulos permanecem lacunas, sem interpolação.                                                              |
| Como o total se divide?                                        | Barras empilhadas para muitas categorias; rosca apenas para composição simples | Rosca com até 3 segmentos principais e “Outros” apenas quando o agrupamento for semanticamente válido; categorias precisam ser exclusivas e somar o mesmo total. |
| Onde está a distribuição e há valores atípicos?                | Histograma/boxplot, se a métrica e a interface comportarem distribuição        | Mostrar unidade, número de observações e regra de agrupamento; não simular distribuição com totais agregados.                                                    |
| Duas medidas se relacionam?                                    | Dispersão, somente com observações pareadas                                    | Exibir unidade de cada eixo e quantidade de pares; correlação não implica causa.                                                                                 |
| Preciso conferir os valores exatos ou muitos rótulos           | Tabela ordenável/exportável                                                    | Tabela complementa o gráfico e mantém acesso a valores que não cabem na tela.                                                                                    |

Não oferecer um tipo de gráfico só porque a biblioteca o suporta. Se as medidas têm granularidades, períodos ou unidades incompatíveis, mantê-las lado a lado com definições explícitas, em vez de criar uma série enganosa.

## Regras de legibilidade e acessibilidade

- Uma visualização responde a uma pergunta principal; título afirma a métrica e o agrupamento, em vez de repetir o nome do módulo.
- Mostrar unidade, período, filtros relevantes, fonte e referência de atualização próximos ao gráfico ou em ajuda claramente acessível.
- Cor nunca é o único identificador. Combinar cor com rótulo, posição, marcador, padrão ou tabela; manter contraste nos três temas e em escala de cinza.
- Não usar eixo truncado para barras sem deixar isso muito claro. Ordenar comparações por valor, salvo quando o eixo temporal exigir ordem cronológica.
- Não confundir zero, valor ausente e fonte sem cobertura. Em série temporal, manter lacunas no lugar de conectar pontos ausentes.
- Valores devem continuar legíveis ao redimensionar cards; ajustar rótulos/legendas e, se necessário, trocar para uma visualização compacta ou tabela.
- Interação por mouse deve ter alternativa de teclado e conteúdo acessível; exportação deve conter título, unidade, período e nota de fonte.
- Evitar excesso de grades, legendas duplicadas, casas decimais sem utilidade e animação que atrase a leitura.

## Auditoria do código atual

| Área                                  | Estado observado                                                                                                                                                                               | Próximo refinamento recomendado                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Meu Dashboard (`WidgetVisualization`) | Tabela disponível, rótulo acessível do gráfico e `accessibilityLayer`; gráficos temporais mantêm lacunas com `connectNulls={false}`. Roscas agrupam a cauda em até 6 fatias e descartam zeros. | Alinhar rosca ao limite visual de no máximo 3 segmentos informativos (incluindo “Outros”) e sempre facilitar a consulta dos valores completos em tabela.        |
| Gráfico compartilhado (`Chart`)       | Barras, linha, pizza/rosca; chamados distintos já são bloqueados para pizza por poderem pertencer a mais de um grupo.                                                                          | Reforçar acessibilidade equivalente ao Dashboard e revisar quantidade de fatias: hoje a orientação aparece só depois de 8 categorias, alta para leitura rápida. |
| Relatórios com categorias             | `chartAvailability` bloqueia valores negativos e totais não positivos para circulares.                                                                                                         | Verificar exclusividade e denominador comum da partição antes de permitir pizza/rosca; não basta validar valores numéricos.                                     |
| Paletas de tema                       | Há cores por tema e categorias múltiplas.                                                                                                                                                      | Adicionar contraste/escala de cinza como critério de revisão e usar rótulos/forma além de cor para séries críticas.                                             |

## Sequência sugerida para aplicar no produto

1. Usar os contratos do [modelo semântico](MODELO-SEMANTICO-ANALITICO.md) nos retornos do MCP e nos detalhes dos indicadores.
2. Padronizar os metadados do gráfico: unidade, período, cobertura e referência da fonte.
3. Revisar pizza/rosca: liberar só partições válidas, limitar fatias e manter caminho para tabela completa.
4. Reforçar acessibilidade do componente compartilhado e testar leitura por teclado, tema claro/escuro e redimensionamento.
5. Avaliar histograma, boxplot e dispersão somente quando uma análise real tiver observações individuais apropriadas — não transformar agregados atuais em falsa distribuição.

## Inspirações consultadas

- [Visualization Builder](https://github.com/nimrodfisher/data-analytics-skills) e skills de modelo semântico/auditoria: inspiração para adequação do gráfico à pergunta, qualidade do dado e contrato de métricas.
- [Lieflat Charts](https://github.com/larashero3-dotcom/lieflat-charts): referência de padrões de visualização e storytelling (Glance para leitura rápida; Lupi para detalhe editorial). É um gerador de artefatos HTML/SVG/relatórios, não uma biblioteca a integrar diretamente no dashboard.
- [LLMQuant Skills](https://github.com/LLMQuant/skills): orientado a pesquisa financeira e ao MCP próprio; sem skill de domínio diretamente aplicável aos nossos indicadores operacionais.
- [Databricks Agent Skills](https://github.com/databricks/databricks-agent-skills): skills específicas de Databricks (Lakebase, Model Serving, Jobs, Genie e DABs); não se encaixam na arquitetura atual Cloudflare D1 + Worker + n8n.
- [OpenCode Power Pack](https://github.com/waybarrios/opencode-power-pack): workflows gerais de revisão, segurança, frontend e MCP; podem inspirar procedimentos de desenvolvimento, mas a instalação não é necessária para este padrão. Conferir licenças de skills derivadas antes de redistribuir material.

### Avaliação para adoção

| Repositório             | Aplicação no projeto                                                                                                                                                                | Decisão nesta etapa                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LLMQuant Skills         | Seus 18 conjuntos tratam de pesquisa financeira e muitos dependem de dados/MCP do próprio LLMQuant. O princípio útil é exigir fontes/evidências e separar os workflows por domínio. | Não instalar: o domínio financeiro não corresponde aos indicadores operacionais e a integração externa não acrescenta dados do nosso sistema.                                                                                                                                                                                         |
| Databricks Agent Skills | Orienta desenvolvimento em Databricks, Lakebase, Model Serving, Genie e Jobs.                                                                                                       | Não instalar: nossa arquitetura é Cloudflare D1/Workers e n8n; só reconsiderar se uma migração para Databricks for decidida.                                                                                                                                                                                                          |
| OpenCode Power Pack     | Workflows de revisão, segurança, frontend, MCP e memória de projeto.                                                                                                                | Não instalar o pacote inteiro. Pode ser útil escolher um workflow em futura tarefa de MCP/revisão; validar sua origem, escopo, licença herdada e compatibilidade antes de usar. O sandbox descrito pelo próprio projeto cita isolamento Seatbelt no macOS e Bubblewrap no Linux, então não assumir que o runner se aplica ao Windows. |
| Lieflat Charts          | Regras e exemplos para gráficos, relatórios e apresentações HTML com estilos de leitura rápida ou editorial.                                                                        | Usar como referência de design, sem incorporar templates ou código ao produto. O repositório informa licença PolyForm Noncommercial 1.0.0 e exige licença adicional para uso comercial, incompatível com adoção direta sem avaliação/licença apropriada.                                                                              |

Essa avaliação se limita às páginas, documentação e licenças visíveis nos repositórios em 25/10/2026. Ela não substitui revisão jurídica nem inspeção de cada arquivo de terceiros antes de qualquer cópia ou instalação.
