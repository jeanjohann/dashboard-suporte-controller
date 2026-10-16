# Filtros e apresentação

## Menu pela logo — 0.21.2

A própria logo Addlog recolhe e expande a barra lateral, substituindo a seta separada. No menu recolhido aparece somente o símbolo da marca; clicar nele abre novamente. O controle é um botão acessível por Tab, Enter e Espaço, com foco visível e indicação de estado. A preferência continua salva neste navegador e compartilhada entre as páginas, sem alterar dados ou filtros.

## Identidade visual Addlog — 0.20.0

A logo padrão fornecida pelo usuário substitui a versão monocromática: símbolo vetorial com gradiente `#FCA237` → `#F05A00`, escrita `#241F21` no claro e clara no escuro. O favicon e o menu recolhido usam só o símbolo. Os arquivos públicos são recursos vetoriais da marca, sem dados importados.

Destaques utilizam `#FCA237`, com texto escuro sobre botões. Texto de seleção no claro usa `#B44500` para conservar contraste; no escuro, `#FFB865`. Gráficos principais acompanham o laranja da marca. Superfícies continuam neutras e cores semânticas de sucesso, atenção e erro permanecem distintas. Valores das versões anteriores abaixo são registros históricos.

## Laranja de destaque — 0.18.2

Ajuste leve da paleta para avaliação: destaque `#FF943D` no claro e `#FF9E46` no escuro, com hover, texto de seleção e fundos suaves correspondentes. Os cinzas/brancos e a organização do layout permanecem. Texto sobre o destaque continua escuro; texto de seleção no claro usa laranja mais profundo para conservar legibilidade. A paleta atual é definida em `src/styles/theme.css`; os valores de 0.17.9 abaixo são referência daquela entrega.

## Temas e alinhamento — 0.17.9

O tema claro utiliza fundo cinza neutro (`#F6F7F9`), superfícies brancas e destaque laranja (`#FF8A32`). O escuro usa fundo grafite (`#191A1E`), superfícies cinza (`#22242A`) e laranja (`#FF943D`). Texto, links, alertas, tabelas e gráficos herdam a paleta de `src/styles/theme.css`; a escolha de tema continua salva no navegador. Cores de sucesso, atenção e erro permanecem distintas.

Cards e painéis usam acabamento plano. Sombras ficam reservadas às camadas flutuantes, como balões e listas; a primeira indicação executiva conserva uma linha de destaque discreta. Fonte local Inter e ícones vetoriais continuam utilizados, sem dependência de fontes externas.

Seletores simples dos relatórios e controles de participantes compartilham alinhamento de rótulo/campo. No celular, empilham quando necessário. Seletores de histórico e configurações com estrutura própria ficam fora dessa padronização. O bloco de preparação do Monitoramento recebe espaçamento interno e texto com largura de leitura limitada. Esses ajustes são de apresentação e não alteram indicadores, filtros, permissões ou armazenamento.

## Situação dos ciclos — 0.17.8

Em **OS → Equipamentos → Tempo observado em campo**, o seletor **Situação dos ciclos** permite Todos (padrão), Encerrados ou Sem retirada registrada. Atua depois dos filtros principais e somente na tabela/impressão dessa seção. A contagem informa quantos ciclos aparecem dentre os identificados, com a situação escolhida também no PDF. Nenhum vínculo é recalculado por essa escolha; os demais relatórios e avisos de revisão permanecem com suas regras. Nova importação restaura Todos.

Encerrado significa instalação e retirada registradas do mesmo serial/placa segundo os critérios de vínculo; não significa necessariamente troca, pois retiradas por cancelamento também encerram ciclos. Sem retirada registrada mede até a referência escolhida, sem comprovar atividade. Para comparar tempos até primeira troca, use a seção específica. A data de referência continua disponível e aplica-se apenas aos ciclos sem retirada.

## Responsáveis do suporte — 0.17.8

Os filtros principais das OS incluem **Suporte · execução** (responsável na coluna `Resp. Execução`) e **Suporte · agendamento** (responsável na coluna `Resp. Agendamento`). Os rótulos curtos mantêm o painel compacto; a ajuda explica os dois papéis. Cada lista aceita vários nomes. São funções distintas: selecionar Ana na execução não seleciona automaticamente linhas em que Ana aparece somente no agendamento. Ao usar ambos, a linha deve atender às duas seleções.

Os responsáveis combinam com status, cliente, técnico, serviço, motivo, cidade, UF e período, seguindo as regras de cada relatório. A seleção afeta cards, gráficos, tabelas, revisão e exportações da análise. Não atribui ao suporte o custo de um técnico nem altera a planilha. Os nomes são lidos como registrados; não há unificação automática de grafias. Coluna ausente desabilita o respectivo campo. Limpar filtros restaura todas as linhas, inclusive as sem responsável. As duas colunas deixam de aparecer no seletor de filtros adicionais porque agora são filtros principais.

Os filtros de categoria continuam combinados entre si e permitem vários valores por campo. As listas agora flutuam sobre o conteúdo: abrir uma lista não aumenta a altura do painel. Clique fora ou pressione Escape para fechar. As seleções permanecem visíveis e podem ser removidas individualmente.

Os painéis compartilhados de OS, Operacional e Consumo usam campos compactos e uma grade responsiva. O componente MultiFilter também aplica o menu compacto ao Parque e ao Monitoramento. Campos específicos de cada módulo preservam seu significado.

Nas OS, o período fica sempre disponível no topo, inclusive com os filtros da página recolhidos. Ele é o mesmo período aplicado aos indicadores, gráficos e tabelas. Registro mais antigo utiliza a primeira data válida da planilha original; Todo o período limpa apenas os limites de data e conserva os filtros de categoria. Filtros adicionais ficam em um painel recolhível. Datas ausentes ou inválidas e períodos invertidos continuam seguindo as regras documentadas do produto.

Consumo mantém a seleção de apuração própria do arquivo, Operacional não recebe um período artificial para sua fotografia do parque e Monitoramento mantém sua referência de coleta. Não há filtros locais escondidos nos cards.

As explicações dos relatórios e blocos internos que possuem título são agrupadas na linha do título, no canto direito. O componente HelpLayout organiza apenas elementos de apresentação, preservando controles, textos para impressão e cálculos. Balões continuam fechando por Escape, clique externo, rolagem e redimensionamento.

## Leitura pelo financeiro

Os balões devem explicar: campo de origem, status e filtros considerados, soma ou fórmula da média, denominador do percentual, exclusões e finalidade do indicador. Não devem sugerir recebimento ou pagamento que a planilha não comprova.

- **Valor a cobrar / Cliente:** valor contratual do serviço que será cobrado do cliente; não confirma recebimento.
- **Valor a cobrar / Addlog:** valor contratual absorvido pela empresa; não equivale necessariamente ao Custo Total lançado.
- **Custo Total:** custo do atendimento lançado na planilha, utilizado mesmo quando há divergência em relação a Técnico + Km; divergência requer revisão manual.
- **Técnico:** valor do serviço técnico. **Km:** valor em reais do deslocamento.
- **Pago:** serviço executado cujo técnico já foi pago. **Concluída:** serviço executado, sem essa confirmação de pagamento.
- **Cancelada:** atendimento não realizado; valores da linha são ignorados nas análises financeiras.
- **Média válida:** soma dos valores válidos dividida pela quantidade desses valores. Ausências não são zero; zero válido faz parte da média.

Não confundir retirada executada para cancelamento de um contrato com status Cancelada da OS. Um valor apresentado como “—” indica ausência de base disponível; não deve ser interpretado como zero.

A revisão deste ajuste detalha os cards de OS, valores de contrato, ranking de técnicos, perfil e concentração das manutenções. Regras específicas de equipamento, parque e consumo permanecem nos respectivos balões e documentação de domínio.

Os menus de seleção múltipla são renderizados em uma camada independente do painel, com posição e altura limitadas pela janela. Isso evita cortes pelas bordas dos painéis. Clique externo, Escape, rolagem da página ou redimensionamento fecham o menu; rolar as próprias opções mantém o menu aberto.

Os relatórios organizados em Section possuem comando Abrir/Recolher no cabeçalho. OS, Operacional e Consumo também oferecem comandos de abrir/recolher todos. Recolher mantém o conteúdo montado, preservando filtros e seleções; ocultar um relatório no menu é uma configuração independente. A impressão continua incluindo o conteúdo do relatório, mesmo recolhido. Na versão 0.17.6, oito análises de OS/técnicos oferecem Resumo/Completo; o comando global de visão resumida aplica síntese somente às seções que já possuem indicadores definidos. A cobertura restante está na fila.

## Controles compartilhados — 0.20.3

Cabeçalhos, ações de exportação, comandos de abrir/recolher, rolagem de tabelas, botões de ordenação e foco pelo teclado agora têm seus estilos compartilhados em `src/styles/controls.css`. A reorganização preserva tamanhos, espaçamentos, cores e comportamento nos dois temas. As regras de filtros e os ajustes compactos do Monitoramento continuam nos arquivos responsáveis por essas interfaces.

O ícone de explicação conserva tamanho e tipografia próprios, no canto direito do título; não recebe o formato de um botão de ação. A comparação antes/depois cobre 240 estados de tela, incluindo larguras intermediárias e celular. Ajuda, teclado, ordenação, controles desabilitados e impressão foram conferidos com dados fictícios. Consulte [Arquitetura](ARQUITETURA.md) antes de mudar a ordem dos estilos ou seus breakpoints.

A aba do navegador usa **Addlog | Suporte Controller**, abrangendo todos os módulos; o favicon continua sendo o símbolo da marca.

## Revisão dos balões — 0.17.7

Os cabeçalhos de relatório das páginas OS, Operacional, Consumo, Parque e Manutenção e Monitoramento passaram por conferência de cobertura. Seções que tinham ajuda apenas dentro do conteúdo agora também possuem explicação no cabeçalho. O ícone fica à direita do título, disponível nos modos completo, resumido e recolhido.

O catálogo `src/components/reportHelp.js` complementa explicações locais com fonte, população, cálculo, exclusões, finalidade e limites de interpretação. `Section` aceita `help` para uma descrição específica; sem essa propriedade utiliza o título registrado no catálogo. Títulos desconhecidos não recebem uma regra genérica inventada. Ao adicionar ou renomear um relatório, registrar sua explicação ou fornecer a propriedade e verificar o cabeçalho, incluindo o caso sem dados. Detalhes Original · linha possuem regra própria de rastreabilidade.

As explicações permanecem na impressão pelo conteúdo textual, mesmo com o relatório recolhido ou resumido. O balão não altera filtros ou resultados e fecha por clique externo, Escape, rolagem ou redimensionamento.

Nesta revisão, a comparação geográfica foi alinhada à regra já aprovada: o subconjunto de manutenção efetiva exclui Motivo Visita Improdutiva, enquanto o total de visitas e seus custos válidos continuam preservados. A tabela e o CSV seguem o mesmo subconjunto. A participação de manutenção compara esse subconjunto ao total regional; não soma as duas séries.
