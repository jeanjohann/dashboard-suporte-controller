# Guia de uso e manutenção

## Detalhes, ordenação, impressão e técnicos — versão 0.8.0

Conferir linhas abre abaixo uma tabela com todos os registros do mês ou grupo do relatório. A seleção respeita filtros e exclusões da medida. Cabeçalhos alternam crescente, decrescente e ordem padrão; linha Excel permanece como referência. Na tabela principal a ordenação vale para todos os resultados, antes das páginas.

Imprimir / Salvar PDF abre o diálogo do navegador para a seção. Escolha impressora ou Salvar como PDF. Impressão inclui arquivo, filtros, referência e conteúdo atual, sem botões; detalhes recolhidos são expandidos na cópia. Tabela principal imprime a página exibida; para imprimir o conjunto de um mês, abra o detalhamento. Tabelas muito largas podem exigir ajuste da escala no diálogo. Gráficos usam a visualização selecionada. O PDF não é criado automaticamente.

Ranking de técnicos é seção personalizável com código, nomes, realizados, chamados, custos, médias e exclusões. Custo técnico e deslocamento separados; média total usa Custo Total lançado. Há média do deslocamento em todos os valores válidos (inclui zero) e quando cobrado (somente positivos). CSV inicial do ranking inclui código, nome, volume, custo total e linhas de origem. Sem dado válido para média aparece —.

Módulos: src/RecordDetails.jsx, src/SortableTable.jsx, src/sorting.js, src/technicians.js e src/Technicians.jsx. Section.jsx gera cópia isolada para impressão. Nenhuma alteração na planilha.

## Cidade e paginação — versão 0.7.1

Cidade está nos filtros principais, com múltiplas seleções, combinadas com UF e demais campos. Grafias originais são preservadas; não há associação automática entre nomes iguais de cidades de estados diferentes. Use UF junto de Cidade quando necessário.

Na tabela de atendimentos, Última abre a última página dos resultados da seleção e da busca textual. Fica desativado quando a página atual já é a última, inclusive em seleção vazia. Cada página mantém até 50 registros.

## Organização da tela e gráficos — versão 0.7.0

O sistema mantém uma única tela. Cada seção pode ser recolhida pelo título. Personalizar o que aparece na tela permite mostrar/ocultar filtros, indicadores, relatórios, histórico, trocas e revisão. Todas começam visíveis; a preferência de visibilidade é salva no navegador e Mostrar todas as seções restaura o padrão. Recolhimento é apenas da sessão. Ocultar não limpa filtros nem altera cálculos. O resumo dos filtros continua acessível, com botão de limpeza.

Gráficos possuem barras, linhas, pizza e rosca, com detalhes ao passar o cursor. O relatório mantém tabela e salva também o tipo de gráfico. Pizza/rosca não representam chamados distintos por grupo, pois grupos podem se sobrepor; essas medidas usam barras/linhas/tabela. Valores negativos e total não positivo também impedem pizza/rosca. Todas as categorias são incluídas sem agrupamento automático em Outros. Muitas categorias favorecem barras. Linhas em categorias não temporais não representam evolução temporal.

Baixar este gráfico SVG exporta a visualização selecionada. O arquivo contém título, mas filtros e exclusões completos ficam no CSV. Baixar barras SVG na seção Exportações mantém a exportação anterior com metadados. A legenda de pizza está na tela; detalhes completos dos grupos permanecem na tabela/CSV.

Módulos: src/Section.jsx, src/preferences.js, src/Chart.jsx e src/chartRules.js. Recharts consta no arquivo de dependências. Ocultação de seções preserva estados das consultas; nenhum dado da planilha é salvo junto da preferência visual.

## Data de referência — versão 0.6.1

Na seção Tempo observado em campo, escolha a data de referência para equipamentos sem retirada. O padrão é a data atual de São Paulo; Usar data atual restaura esse valor. O cálculo exige instalação realizada com Tipo de Serviço Implementação. Períodos sem retirada mostram a referência e a situação Sem retirada registrada. Períodos encerrados mantêm a data efetiva de retirada.

Referência vazia impede o cálculo. Data anterior à instalação, várias instalações e início não marcado como Implementação exigem revisão. A ausência de retirada não confirma ausência de problemas. A opção não altera a planilha nem os filtros de período; fica apenas na sessão, fora das configurações salvas do relatório.

## Configurações e períodos encerrados — versão 0.6.0

Escolha relatório e filtros, dê um nome e use Salvar configuração atual. Aplicar recupera as escolhas sobre a importação atual. Excluir remove a configuração. O armazenamento é local ao navegador/origem; outra porta ou navegador pode ter lista diferente. Planilhas e registros não são persistidos, mas nomes/identificadores presentes nos filtros são. Mudança de estrutura das colunas exige nova configuração. Falha de armazenamento é informada.

Tempo observado em campo mostra somente ciclos encerrados com instalação e retirada do mesmo serial/placa. Vínculos incompletos/ambíguos ficam para revisão. São dias corridos entre datas; não há cálculo de equipamentos sem retirada e nem inferência de vida útil completa. Módulos: src/lifecycle.js e src/lifecycle.test.js.

## Exportação — versão 0.6.0

Selecione agrupamento, medida e filtros e use Baixar relatório CSV ou Baixar gráfico SVG. CSV inclui arquivo de origem, filtros, regras, exclusões e linhas Excel. Valores monetários são exportados em reais, com vírgula decimal. Separador ponto e vírgula e UTF-8 com marcador de codificação facilitam abertura no Excel. Textos que poderiam ser interpretados como fórmulas recebem prefixo de proteção apenas na exportação.

SVG é imagem vetorial do gráfico personalizado, incluindo arquivo, elegíveis e exclusões. Os filtros detalhados acompanham o CSV. Baixar histórico CSV fica disponível após uma consulta com registros. Nenhum arquivo de origem é alterado. Módulos: src/exports.js e src/exports.test.js.

## Filtros adicionais — versão 0.5.1

Em Filtros adicionais da planilha, escolha uma coluna para adicionar e marque seus valores. Estão disponíveis as colunas com cabeçalho que não fazem parte dos filtros básicos: placa, serial, CNPJs, cobrança, responsável de suporte, notas, datas e demais campos. Cabeçalhos repetidos são identificados pela letra do Excel.

A comparação é exata pelo conteúdo exibido; datas e valores adicionais não funcionam como intervalos. Sem dados seleciona células vazias. OU dentro do campo, E entre campos. Remover filtro limpa a condição. Limpar filtros e busca mantém os campos adicionais visíveis, mas sem seleção; nova importação remove os campos adicionais. Não há correção automática.

## Relatórios e histórico — versão 0.5.0

Em Relatório personalizado, escolha agrupamento, medida e visualização. Os filtros globais restringem a análise; a busca textual da tabela original não afeta esse relatório. Confira elegíveis e exclusões. Em cada grupo da tabela, Conferir linhas mostra os números das linhas de origem. Para conferir chamados distintos, lembre que o mesmo chamado pode aparecer em vários grupos.

Em Histórico de equipamentos, escolha Placa ou ID Rastreador e digite/escolha o valor exato. O histórico está limitado pelos filtros atuais; limpe-os para consultar toda a importação. Registros aparecem por data, com os sem data no final. Cancelada permanece visível quando incluída na seleção, sem ser considerada execução. A consulta não mede tempo em campo nesta versão.

Módulos: src/reports.js (agregação e histórico), src/reports.test.js e src/Explorers.jsx (interface). Não há exportação nem persistência das configurações nesta etapa.

## Equipamentos — versão 0.4.0

A seção Trocas de equipamentos mostra acessórios por categoria, rastreadores por mês e tabela dos pares com chamado, placa, seriais e linhas Excel. O gráfico usa a data da instalação substituta. Os pares são resolvidos antes dos filtros; somente pares com ambas as linhas selecionadas entram. Filtrar apenas desinstalações, por exemplo, não deixa um par completo.

Revisão inclui reinstalações, vínculos ambíguos, seriais ausentes/iguais e instruções sem categoria ou com categorias conflitantes. Esses registros continuam nos demais indicadores. Para acessórios, ative Exigir a palavra troca para testar uma condição mais restrita; a opção começa desativada em uma nova sessão.

Módulos: src/equipment.js e src/equipment.test.js. Mapeamento explícito dos motivos em trackerMotives. Tempo observado em campo ainda não é calculado.

## Seleção múltipla — versão 0.3.1

Abra o filtro e marque quantos itens desejar. Use a busca de opções para localizar nomes; buscar opções não altera a seleção. Os itens selecionados aparecem abaixo do campo e podem ser removidos individualmente. Limpar seleção retorna o campo a Todos.

Exemplo: UF = SP ou PR, junto com Status = Pago ou Concluída. Dentro do campo vale qualquer item selecionado; entre campos, todas as condições precisam ser atendidas. Período continua sendo um intervalo de datas. As seleções afetam indicadores, gráficos e tabelas. Módulo visual: src/MultiFilter.jsx.

## Filtros e gráfico — versão 0.3.0

Combine período, status, cliente por razão social, nome do técnico, tipo de serviço, motivo e UF. Cada campo permite várias seleções ou Todos; itens combinam-se por OU e campos por E. Categorias permanecem exatamente como no arquivo, sem agrupamento automático de grafias ou filiais.

Os filtros afetam os cartões, gráfico, detalhamento de chamados, revisão e tabela. A busca textual filtra apenas a tabela. Chamados são contados dentro da seleção, e seu detalhamento mostra apenas as linhas selecionadas. As opções dos filtros vêm da importação completa. Limpar filtros e busca remove todas as seleções; importar outro arquivo também reinicia os filtros.

O período usa Data de atendimento, com limites inclusivos. Sem período, datas ausentes não eliminam registros. Com período, a quantidade excluída por data ausente/inválida é informada após os filtros de categoria. Data inicial posterior à final produz aviso e seleção vazia.

O gráfico mensal conta somente Concluída/Pago e informa realizados excluídos por data. Meses sem registros não são exibidos. Datas devem ser valores numéricos do Excel; texto de data permanece sem conversão automática. O calendário 1904 é respeitado. A análise depende dos cabeçalhos necessários.

Módulos adicionados: src/filters.js (datas, seleção e agregação mensal), src/filters.test.js (verificações) e src/BarChart.jsx (visualização de barras).

Esta seção substitui as orientações da versão anterior sobre totais referentes a toda a importação.

## Indicadores financeiros da versão 0.2.0

Os cartões apresentam custo total, deslocamento e valores contratuais separados entre Cliente e Addlog; custo técnico aparece no texto explicativo. Somente Concluída/Pago entram. Valores vazios/incompatíveis são excluídos apenas das respectivas medidas, com contagens informadas. Moeda textual brasileira é interpretada para análise; o arquivo permanece intacto.

A revisão agora inclui divergências de Custo Total versus Técnico + Km dos serviços realizados, comparados em centavos. O total lançado é mantido. As contagens e totais usam toda a importação, independentemente da busca. As descrições anteriores de revisão exclusivamente estrutural devem ser lidas com esta ampliação. Os totais não representam faturamento ou recebimento.

## Importação

1. Use Excel `.xlsx` ou `.xls`, com a aba **OS 2025**.
2. Mantenha cabeçalhos na primeira linha e número da OS na coluna A.
3. Clique em Importar planilha e escolha o arquivo.
4. Confira contagens, registros e a aba Revisão.
5. Corrija eventuais problemas no arquivo original e importe novamente.

O arquivo pode ter apenas uma aba. Bases de clientes e técnicos não são exigidas na implementação atual. Somente colunas com cabeçalho não vazio são exibidas, na ordem original; cabeçalhos repetidos são diferenciados pela letra da coluna. Linhas preenchidas sem número de OS não entram e sua quantidade é informada.

A busca consulta todas as colunas exibidas. A tabela tem páginas de 50 registros. Revisão mostra endereço da célula, coluna, conteúdo original e motivo. Atualmente detecta erros do Excel e números incompatíveis com formato de data; não verifica todas as regras de negócio, inclusive divergências de custo.

O sistema não altera o arquivo nem recalcula suas fórmulas. Quando necessário, atualize os resultados e salve no Excel antes de importar.

## Sessão

Desde a versão 0.2.0, os cartões mostram realizados, cancelados, chamados com cancelamento e demais status. Abra Detalhamento dos chamados para ver as quantidades de cada chamado. Essas contagens usam toda a importação; a busca filtra somente a tabela de atendimentos. Indicadores financeiros ainda estão pendentes de definição.

Dados ficam na memória do navegador; atualizar ou fechar a página perde a importação. Um novo arquivo válido substitui a importação anterior. Se falhar, os dados anteriores permanecem. A aplicação não envia a planilha a uma API. O módulo de consumo possui persistência local em IndexedDB e backup; as importações de OS continuam somente na sessão.

## Execução e verificações

Pré-requisito: Node.js compatível com Vite 6; desenvolvimento inicial com Node.js 24.

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo terminal; a porta pode mudar se já estiver ocupada.

```sh
npm test
npm run build
```

A compilação gera `dist`. A compilação não substitui conferência visual.

## Estrutura técnica

| Arquivo | Responsabilidade |
| --- | --- |
| src/import.js | Leitura, cabeçalhos, registros e revisão estrutural |
| src/analysis.js | Classificação operacional e agrupamento por chamado |
| src/analysis.test.js | Casos de chamados mistos e cabeçalho ausente |
| src/main.jsx | Interface, estado de sessão, busca e paginação |
| src/style.css | Aparência e adaptação de tela |
| src/import.test.js | Testes de importação |
| package.json / package-lock.json | Scripts e dependências |
| index.html | Entrada da aplicação |

React executa no navegador; Vite serve e compila. SheetJS lê o Excel e é obtido da distribuição oficial 0.20.3 indicada em package.json. Usar package-lock.json para instalações reproduzíveis.

## Contrato do importador

`importWorkbook(buffer)` retorna:

| Propriedade | Conteúdo |
| --- | --- |
| columns | index (base zero), letter e label |
| rows | sourceRow (linha Excel base um), os e cells |
| cells | display, raw e issue |
| issues | address, row, column, value e reason |
| skipped | Linhas com dados nas colunas reconhecidas, mas sem OS |
| calls | Quantidade de números de OS distintos |

raw preserva o valor lido; display usa a representação disponível da célula. Erros podem ter códigos internos em raw. Não há avaliação de fórmulas. Datas numéricas não são automaticamente convertidas em objetos Date; a futura análise deverá interpretá-las explicitamente.

OS identifica o chamado, não a linha. sourceRow localiza a linha apenas dentro do arquivo importado; não é chave permanente entre arquivos ou após ordenação na origem.

## Testes atuais

Cobrem chamados e cabeçalhos repetidos, vazios, identificadores textuais com zero inicial, erros e formatos de data incompatíveis. O teste com arquivo real depende de `Ordens de Serviços 2025_26.xlsx` na raiz e espera 1.406 linhas, 527 chamados e 42 colunas da versão inicial. Se o arquivo mudar, conferir o motivo antes de atualizar expectativas.

Ao implementar KPIs, verificar Cancelada com valores preenchidos, total divergente, zero versus ausente, status mistos no chamado, data ausente e pagamento sem data. Comparar cálculos com resultado independente. Conferir também importação, busca, paginação, revisão e preservação dos dados anteriores após falha.

## Evolução e atualização da documentação

- Consultar as regras e decisões pendentes em PRODUTO.md antes de alterar comportamentos.
- Separar dados originais da interpretação de negócio em módulos de análise próprios.
- Usar Custo Total como fonte oficial; excluir Cancelada de cálculos financeiros.
- Documentar unidade, fórmula, campos necessários, filtros e exclusões de cada medida.
- Registrar novas decisões aprovadas e atualizar guia, versão e CHANGELOG nas entregas.
- Manter clara a distinção entre implementado, aprovado e proposto.
- Evitar incluir planilhas ou dados reais em uma distribuição pública sem autorização.

Persistência, acesso compartilhado, autenticação, histórico de importações e exportação ainda exigem definição e implementação.

## Cards e leitura dos gráficos — 0.9.0

O Resumo numérico fica no topo após importar. Clique em um card para abrir/fechar as linhas originais que compõem o indicador. A média usa apenas custos totais válidos, incluindo zero; não divide por linhas com valores ausentes.

Nos rankings de barras, selecione 10 maiores, 20 maiores ou Todos. A seleção limita somente a apresentação e o SVG daquele gráfico; o relatório, CSV, cards e tabela permanecem completos. Use Ver tabela completa de técnicos, custos e médias para acessar os detalhes ordenáveis.

Clique no título de uma seção recolhida para abri-la. Em Personalizar, escolha quais seções aparecem, incluindo o resumo. A visibilidade continua salva no navegador; a abertura/recolhimento e o limite do ranking são temporários. Impressão preserva os cards e todas as barras exibidas, inclusive as que exigiam rolagem.

## Período do resumo e início mais antigo — 0.9.1

O resumo mostra o intervalo solicitado quando há filtro temporal, além das datas efetivamente presentes na seleção. Sem filtro temporal, mostra a menor e a maior Data de atendimento válida dos registros selecionados e quantifica registros sem data mantidos. Datas do resumo abrangem todos os status selecionados; cada card mantém sua regra de elegibilidade. Seleção vazia e período invertido são explicitados.

Usar registro mais antigo preenche a data inicial com a menor data válida de toda a planilha importada, independentemente dos demais filtros. Não altera a data final nem corrige células. Com período ativo, registros sem data válida são excluídos conforme a regra existente. Botão desativado se não houver data válida. Limpar filtros remove a data preenchida pelo atalho.

## Módulo de consumo — 0.10.0

Nova página Linhas - Controle de Consumo, independente das ordens de serviço. Regras, importação e indicadores descritos em [CONSUMO-DE-LINHAS.md](CONSUMO-DE-LINHAS.md). Planilha de OS, filtros, ciclos, financeiro e interpretações aprovadas mantidos. As OS permanecem na sessão. Na evolução atual, consumo Arqia/Kore, referência operacional guardada e anotações têm histórico local com backup JSON. Consulte o guia do módulo para os critérios de vínculos e comparação.

## Análises de OS — 0.11.0

Implementadas sete análises descritas em [ANALISES-DE-OS.md](ANALISES-DE-OS.md). Abrem pelos títulos das novas seções e podem ser ocultadas em Personalizar. Reincidência confirmada por cliente + placa, serviços do mesmo dia agrupados como visita, retornos cumulativos em 30/60/90 dias. Custos seguem total lançado e realizados; ciclos abertos ficam fora da mediana de retiradas. Consumo possui módulo próprio; a comparação com contratos permanece fora desta etapa.

## Relatório descritivo — 0.12.0

Resumo em uma linha por grupo/indicador com quantitativos, percentuais, bases e descrição, mais atendimentos originais filtrados. Usuário confirmou exportar ambos. XLSX com três abas e CSVs separados. Critérios, precisão e populações em [RELATORIO-DESCRITIVO.md](RELATORIO-DESCRITIVO.md).

## Modelos pelo ID — 0.12.1

Mapa aprovado: 162 → MXT-162; 144 → MXT-130v2; 130 ou 137 → MXT-130v1; 141, 142 ou 143 → MXT-141. A classificação usa o prefixo do ID Rastreador da Implementação e não altera ID ou Modelo originais. IDs desconhecidos, ausentes ou incompatíveis ficam no grupo Modelo não identificado pelo ID; os ciclos continuam contados e elegíveis para as mesmas medidas de duração. Um card quantifica esses ciclos.

Tempo observado dos rastreadores passa a comparar por Modelo pelo prefixo do ID como padrão. Também permite Modelo original da planilha e Razão Social. O relatório descritivo XLSX/CSV usa a mesma classificação por prefixo. Filtros da coluna Modelo continuam referindo-se ao conteúdo original. Mediana permanece restrita a encerrados; vínculo de ciclos não mudou. Regras centralizadas em src/trackerModels.js para extensão futura.

## Abrir e recolher relatórios — 0.12.2

No topo da página de OS, após a importação, Abrir todos os relatórios e Recolher todos os relatórios controlam todas as seções principais. Não mudam filtros, cálculos ou quais seções foram escolhidas em Personalizar. A abertura continua podendo ser alterada individualmente pelo título. Painéis internos (filtros, detalhes e tabelas) conservam seu estado. O comando não é persistido entre sessões.

## Operacional — 0.13.0

Importe a aba Equipamentos na página Operacional — Importação e Revisão. Confira os pontos e exporte o CSV para ajustar a planilha de origem. Importe as OS em sua página e abra Operacional × OS — Análises. Ambos os arquivos permanecem em memória durante a navegação. Não interpretar ausência nas OS como erro. Leia [regras e manutenção do módulo](OPERACIONAL.md) antes de alterar os vínculos. Código: src/operational.js, src/OperationalPage.jsx e src/operational.test.js.

## Manutenção do parque — 0.14.0

Indicadores exploratórios sobre a base operacional vinculável, filtros múltiplos e relatório XLSX/CSV com seleção de colunas implementados. Regras financeiras e de titularidade histórica continuam pendentes. Consulte [Manutenção do parque e relatórios](PARQUE-E-MANUTENCAO.md).

## Menus por categoria — 0.14.1

Operacional: Visão geral, Registros e Revisão. OS x OP: Visão geral, Parque, Manutenção, Valores mensais, Vínculos e Relatórios. A seleção é independente por página e não limpa filtros ou dados. Visão geral concentra os cards de cobertura; cada categoria mostra seus relatórios, respeitando as escolhas de visibilidade. Agrupamento do relatório fica na categoria Relatórios, com período informado e atalho para Manutenção. Seções recolhíveis continuam disponíveis. O painel de checkboxes integrado ao menu e os blocos abertos são propostas para revisão futura, ainda não implementadas.

## Navegação e importação conjunta (0.15.0)
Consulte [Importação e navegação](IMPORTACAO.md) para o menu lateral compacto, categorias aninhadas, seleção de relatórios e carregamento em lote. A antiga página OS x OP agora se chama Parque e Manutenção.

## Explicações dos indicadores (0.15.2)
Clique no pequeno ícone ⓘ para consultar critérios e regras. Nos relatórios principais, explicações diretas são agrupadas ao lado do título; ferramentas e cards têm ajuda própria. O balão fecha ao clicar novamente, fora dele, no botão Fechar ou com Escape. Escape e Fechar devolvem o foco ao ícone. Rolagem externa e mudança de tamanho da janela fecham o balão para não deslocar sua referência. Período, filtros, valores válidos/excluídos e avisos dinâmicos permanecem visíveis. Explicações continuam incluídas na impressão/PDF de cada seção.
Implementação compartilhada em src/InfoNote.jsx; adicionar uma explicação estática com InfoNote. Não envolver contagens de revisão ou alertas nesse componente. Section agrupa filhos diretos InfoNote no título e mantém o texto na cópia impressa. Nenhuma regra de cálculo foi alterada.

### Posição e ícones (0.15.3)
A ajuda agrupada dos relatórios principais fica no canto superior direito do cabeçalho. Os cards mantêm sua ajuda no canto superior direito. O espaço do cabeçalho é reservado para evitar sobreposição com o título ou a impressão. Os ícones do menu e da ajuda são SVGs compartilhados em src/Icon.jsx, com cor herdada do tema e rótulos acessíveis nos botões. As explicações específicas de ferramentas permanecem junto ao seu contexto.
