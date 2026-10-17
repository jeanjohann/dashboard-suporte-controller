# Filtros independentes por categoria

## Critério aprovado

Em 16/10/2026, o proprietário escolheu filtros **por aba/categoria**, não por relatório individual. Dentro da categoria, os relatórios utilizam o mesmo recorte, respeitando suas bases de cálculo próprias. Exemplo: selecionar Cliente A em OS → Equipamentos não altera OS → Operação, que pode continuar mostrando todos os clientes.

Versão inicial: 0.24.0. Não foi criado um novo filtro global nem uma combinação oculta de global + local. A seleção pertence ao espaço identificado no quadro: **Afeta: módulo → categoria**.

## Como usar

Na organização 0.27.0, Regiões integra OS → Operação; Dados e revisão integra OS → Dados e relatórios; Parque integra a Visão geral de Parque e Manutenção; Manutenção e Relatórios formam uma categoria. Os painéis agrupados compartilham o recorte da categoria, sem filtros ocultos por visualização. [Localização das análises](ORGANIZACAO-DAS-ANALISES.md).

1. Abra a categoria no menu lateral.
2. Confira o alcance no topo do quadro de filtros.
3. Nas OS, Logística e Parque → Manutenção e relatórios, o período fica visível; Registro mais antigo usa a primeira data válida da respectiva base, independentemente dos outros filtros. No Parque, são datas de atendimento das OS vinculadas, sem reduzir o denominador de equipamentos. Todo o período limpa somente as duas datas desta categoria.
4. Abra Filtros da página para acessar campos, buscas e filtros adicionais disponíveis no módulo. Campos ficam recolhidos inicialmente, sem ocultar as seleções ativas.
5. As seleções aparecem em chips mesmo com os campos recolhidos. Clique no × de um chip para remover apenas aquele campo; ao selecionar várias opções no mesmo campo, o chip reúne essas opções. O conteúdo completo permanece no título e no nome acessível do controle.
6. Limpar filtros desta categoria remove os campos e a busca somente desse espaço. Categorias vizinhas permanecem como estavam.
7. O número junto à categoria no menu informa quantos campos estão ativos, não quantos valores foram marcados. Campos vazios e critérios padrão neutros não contam.

Período, resumo e comandos de abrir/recolher relatórios fazem parte do mesmo quadro. Cabeçalho/importação continuam acima dele. A personalização visual permanece na engrenagem; selecionar relatórios não altera os filtros.

Na Visão geral de OS, Semana atual e Semana anterior preenchem De/Até com semanas de segunda a domingo, pelo calendário de São Paulo, preservando os demais campos e as outras categorias. Os cards de agenda aberta continuam sendo uma fotografia das pendências sem recorte temporal; a conferência abre junto ao card. [Detalhes de alcance](CARDS-DE-OS.md#agenda-e-atalhos-semanais).

## Alcance por módulo

| Módulo              | Seleção independente                                                                                                                                    | Regras preservadas                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OS                  | Cada categoria: Visão geral, Operação, Clientes e custos, Técnicos, Equipe de suporte, Equipamentos, Regiões, Relatórios personalizados e Dados/revisão | Datas e campos principais/adicionais; busca da tabela somente dos registros. Atalhos da Equipe de suporte alteram apenas sua categoria.                      |
| Operacional         | Registros e Revisão                                                                                                                                     | Cliente, modelo, plano, situação, busca e categoria da revisão. Visão geral de importação mostra o arquivo completo e não apresenta filtros sem efeito.      |
| Parque e Manutenção | Cada categoria, separada também do Operacional                                                                                                          | Recortes de cliente/modelo/plano/situação e busca; não infere falha pela ausência de OS.                                                                     |
| Logística           | Categoria própria de Parque e Manutenção                                                                                                                | Tipo, recebimento, período e busca mantidos ao navegar; usa a data de evento própria de Envios ou Devoluções.                                                |
| Consumo             | Visão geral, Acompanhamento, Clientes/equipamentos e Histórico/arquivos                                                                                 | Campos, busca, consumo mínimo/situação e escolha de apuração por operadora. A referência mais recente continua como padrão quando não há uma escolha válida. |
| Monitoramento       | Acompanhamento, Visão analítica e Relatórios                                                                                                            | Bases e limite afetam a análise da categoria; busca/situação/acompanhamento/recorte afetam sua fila e exportação.                                            |

## Exceções explícitas

- **Consumo:** o multiplicador da referência de investigação é uma configuração compartilhada e salva, não um filtro. Seu rótulo agora informa isso. A média continua sendo calculada antes dos filtros de cliente/busca, com todas as linhas válidas da operadora/apuração e zeros. Alterar o multiplicador não muda essa regra.
- **Linha do tempo de consumo:** a seleção do chip é uma ferramenta de acompanhamento; seu histórico completo continua visível além da apuração/recorte da grade. Arquivos e backups representam o histórico armazenado, não uma exclusão provocada pelos filtros.
- **Monitoramento:** clicar em um card analítico é uma ação explícita de investigação. O sistema abre Acompanhamento e aplica ali bases, limite e recorte do card, limpando busca/situação/status anteriores da fila. Os filtros da Visão analítica são preservados.
- **OS:** situação dos ciclos continua sendo um seletor somente da tabela de Tempo observado em campo. Modos e datas de referência dos relatórios mantêm seu alcance específico. Não foram criados filtros independentes dentro de cada relatório.
- **Cards de importação operacional:** continuam descrevendo o arquivo completo, em vez do recorte dos registros. A Visão geral operacional não mostra um quadro que não alteraria esses cards.

## Sessão, importação e relatórios

Seleções são mantidas apenas na memória da sessão. Recarregar o navegador retorna aos padrões; não houve migração de localStorage/IndexedDB nem alteração de backup. Preferências de apresentação e configurações de relatórios previamente salvas continuam com seus formatos.

Uma nova importação válida de OS ou Operacional limpa os espaços da respectiva base. Novo extrato/aplicação do histórico de consumo reinicia seus recortes conforme o fluxo de importação; os registros e anotações não são apagados. Trocar a fonte de demonstração/real do Monitoramento limpa as seleções e mantém a separação das identidades fictícias. Importação inválida não limpa nenhuma seleção.

Atualizações da mesma fonte Google de OS conservam os recortes de todas as categorias; trocar de arquivo/fonte reinicia os filtros. A logística possui estado separado: atualizar a base operacional não apaga seu recorte, e uma nova planilha logística reinicia somente sua seleção.

Exportações utilizam o recorte atual da categoria onde a ação está sendo executada, além dos critérios próprios de cada relatório. Aplicar uma configuração salva de relatório altera apenas a categoria atual. A impressão inclui alcance no contexto das OS, Operacional/Parque e Consumo. A quantidade de registros do quadro de OS reflete os filtros analíticos; uma busca apenas da tabela aparece como chip, sem reduzir os indicadores gerais.

## Código e verificação

`shared/filters/scopedSelection.js` contém atualizações imutáveis, contagem e descrições. `useScopedSelection.js` mantém os espaços por categoria. `components/FilterPanel.jsx` e `styles/filter-workspace.css` são a apresentação comum. Cálculos e importadores permanecem nos módulos existentes.

Conferir isolamento e restauração ao voltar, limpeza individual/total, períodos e colunas adicionais, contagem no menu, busca local, importação inválida, atualização Google, exports e impressão. Monitoramento precisa conferir o encaminhamento explícito dos cards e as anotações; Consumo precisa preservar bases de investigação e histórico individual. Usar dados fictícios e verificar os dois temas em desktop/celular.

Conferência local em 16/10/2026: 203 testes aprovados e um opcional sem arquivo real ignorado. Navegação e restauração conferidas nos módulos, incluindo os períodos independentes de Parque → Manutenção/Relatórios; nova OS reinicia somente suas categorias e mantém a seleção operacional. CSV do consumo conferido contra as linhas filtradas, impressão de Vida em campo com alcance e critérios específicos preservados, e Google simulado mantendo duas categorias após atualização automática. Layout conferido nos dois temas, em 1440/390 px. Isso não ativa a integração Google real, que continua pendente do escritório.
