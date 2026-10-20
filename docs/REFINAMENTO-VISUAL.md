# Refinamento visual — 0.40.0

Rodada A17 executada na ordem: Consumo e Parque, tabelas, filtros/ações, impressão e telas menores. Usa as fontes, cálculos, permissões e armazenamento existentes. Não exige configuração externa.

## Consumo e Parque

Consumo destaca quatro indicadores: chips no recorte, consumo total, linhas com tráfego e consumo zero. **Médias, extremos e vínculos** conserva média geral, média com tráfego, mediana, máximo e vínculos conferidos. A quantidade de registros válidos/excluídos e o alcance da referência operacional continuam explícitos. Gráficos, tabelas por operadora e origens permanecem disponíveis.

Parque apresenta a cobertura com cinco contagens próprias da seleção. Em **Manutenção e relatórios → Indicadores e cobertura**, destaca base vinculável, registros com atendimento, registros com assistência e assistências realizadas. **Trocas, retornos e indicadores complementares** conserva os cinco indicadores restantes. **Base, período e critérios** mantém datas, exclusões, retornos cumulativos e limites da fotografia operacional. Trocas e taxas continuam com as mesmas definições.

Notas extensas sobre origem/leitura do Operacional ficam em bloco expansível. Quantidades, arquivos e alcance permanecem disponíveis. Escolhas de visibilidade, resumo, visualização e filtros por categoria conservam seus identificadores e preferências.

## Tabelas e ações

- `TableScroll` identifica os quadros com conteúdo horizontal excedente. A indicação de rolagem só aparece quando necessária; a região pode receber foco e ser percorrida pelas setas do teclado.
- Aplicado às grades principais de Consumo, Parque, Operacional, OS e seus detalhes de origem. Rolagem fica no quadro; nomes e valores continuam completos na conferência original.
- `SortableTable` alinha à direita células que já recebem números ou uma chave numérica explícita de ordenação. Não interpreta strings de identificadores como números e não muda a ordenação.
- Consumo distingue números de tráfego e identificadores textuais; seleção, paginação, origem e exportação mantêm o conjunto anterior. A seleção continua atravessando páginas e não sai do recorte.
- Abrir, resumir e recolher relatórios usam ícones com nome acessível e descrição ao passar o cursor, ao lado de Limpar filtros. O alcance da categoria e a origem permanecem visíveis.
- Períodos invertidos recebem aviso no próprio controle; o comportamento analítico existente permanece.

## Mensagens e responsividade

`ViewState` apresenta instruções para fonte ausente, carregamento, gráfico vazio e recorte sem resultados. Limpar filtros continua restrito à categoria e não apaga arquivos/anotações. As mensagens não transformam ausência ou erro em consumo zero.

Cards e ações se reorganizam em telas menores, com conferência de 320 a 1440 px nos temas claro/escuro. Tabelas largas continuam com rolagem própria; a página não precisa acompanhar a largura da tabela. Botões de ação e ícones conservam nomes acessíveis e foco visível.

## Impressão

O botão **Imprimir / Salvar PDF** continua criando uma cópia da análise ativa, com seus dados e critérios. Abre os blocos complementares na cópia, sem alterar o que está aberto na tela. Contexto passa a mostrar rótulos, períodos e apurações legíveis, preservando campos desconhecidos e identificadores. Textos são inseridos como texto, sem interpretar HTML.

Tabelas repetem cabeçalhos, liberam textos truncados e a altura de rolagem, e mantêm valores numéricos e origens. Na grade de consumo, controles de seleção/origem e paginação ficam fora da impressão; as colunas de dados e o intervalo de registros exibido são preservados. **A impressão da tabela paginada continua mostrando a página atual**; CSV/XLSX conservam seus escopos completos existentes.

Gráficos e cards usam cores/texto legíveis no documento; detalhes de exportação sem conteúdo de dados não geram títulos soltos. A impressão da seção conserva nome da análise, arquivos, filtros, referência e critérios. A impressão geral do navegador retém o contexto de filtros e esconde controles de navegação/edição.

## Manutenção e validação

Componentes de apresentação: `AnalysisMetrics`, `TableScroll`, `ViewState`. Estilos: `styles/analysis-workspace.css`. Contexto e estilos de impressão: `shared/export/printContext.js` e `reportPrintStyles.js`.

Testes do contexto de impressão cobrem períodos de durações diferentes, zeros, booleanos, campos adicionais, datas e identificadores textuais. Conferência no Edge com bases fictícias: importação conjunta, indicadores, seleção/paginação/CSV, filtros por categoria, datas invertidas, teclado, tabelas, exportação XLSX e temas/tamanhos. PDF gerado e renderizado para inspeção de cortes, alinhamento e conteúdo complementar. As planilhas reais não são alteradas.
