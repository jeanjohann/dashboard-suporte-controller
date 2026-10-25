# Revisão dos gráficos — 25/10/2026

Revisão dos componentes usados pelos módulos: `Chart`, `WidgetVisualization`, gráficos da Visão geral, comparação da equipe e resumo Zoho. Os componentes compartilhados atendem também Monitoramento, Operacional, Consumo e Parque. As definições e agregações dos indicadores foram preservadas.

## Ajustes aplicados

| Problema observado                                                               | Ajuste                                                                                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Eixo vertical fixo de 110 px e reserva inferior de até 110 px em linhas pequenas | Largura calculada pelos valores formatados e datas horizontais com espaçamento automático.                                                 |
| Raio circular fixo de 120 px em cards pequenos                                   | Raio proporcional à área disponível.                                                                                                       |
| Listas de barras com rolagem interna                                             | Dez categorias por página; escala comum entre páginas e exportação do recorte completo. Impressão inclui todas as categorias selecionadas. |
| Séries extensas desenhando um círculo para cada observação                       | Marcadores fixos apenas até 24 pontos; ponto ativo permanece disponível por interação. Lacunas continuam lacunas.                          |
| Valores de gráficos temporais/circulares dependiam do tooltip                    | Tabela e CSV em “Valores e exportação”, carregados ao abrir as ferramentas. CSV inclui valor original e valor formatado.                   |
| SVG temporal dependia dos estilos da página                                      | Cores e fontes resolvidas no arquivo, com fundo do tema.                                                                                   |
| Tabela com cinco linhas por página e paginação só acima de dez itens             | Paginação exibida sempre que existir outra página.                                                                                         |
| Regra global de impressão podia ocultar o aplicativo inteiro                     | Isolamento aplicado somente quando o modal de serviços está aberto, com contraste próprio para papel.                                      |

## Referências aplicadas

- [Visualization Builder](https://github.com/nimrodfisher/data-analytics-skills/tree/main/04-data-storytelling-visualization/visualization-builder): adequar escalas e eixos à leitura, reduzir ruído visual e oferecer valores acessíveis.
- Theme Factory: respeitar as paletas já escolhidas e manter contraste dos rótulos.
- Webapp Testing / Playwright: conferir os componentes reais com dados sintéticos, incluindo redimensionamento, ações e impressão.

## Limite da verificação

A conferência visual usa dados sintéticos nos componentes reais: sete temas, larguras de 390, 1024 e 1440 px e modos compacto/editorial (42 combinações), sem erros de JavaScript. Paginação, rótulos de datas, CSV, SVG e impressão foram conferidos. A suíte geral terminou com 502 testes aprovados e um ignorado. Essa verificação não substitui a inspeção de cada relatório com os dados operacionais reais.

## Próximas oportunidades

- Revisar cada relatório real com maior número de categorias para escolher entre ranking, comparação temporal e tabela.
- Evoluir metadados de unidade, fonte e cobertura onde o módulo ainda não os fornece ao componente.
- Reavaliar o agrupamento de fatias do Meu Dashboard com aprovação explícita, preservando sua composição atual nesta rodada.
