## 0.69.53 — 27/10/2026

- Integra a contagem de equipamentos enviados por agente à grade existente de equipamentos em Atividades e lançamentos; mantém os apontamentos manuais.

## 0.69.52 — 27/10/2026

- Reconhece Enviados/Recebidos na etapa Conferir arquivos e orienta o formato na página de importação.

## 0.69.51 — 27/10/2026

- Permite importar a planilha de logística com as abas Enviados/Recebidos e converte os cabeçalhos Data Rec., Placa/Prefixo e Obs para os campos logísticos correspondentes.

## 0.69.50 — 27/10/2026

- Corrige Serviços na agenda para contar somente OS com status Agendado, data de agendamento no período e responsável válido.
- Adiciona o card Aguardando agendamento: todas as OS com status Agendar na base atual, inclusive sem data ou responsável e sem filtro de período/agente, preservando o layout existente.
- Aplica a mesma regra aos totais por agente, gráficos, detalhes, exportações e comparação com o período anterior; atualiza as explicações e a documentação.

## 0.69.49 — 27/10/2026

- Aplica à Visão Analítica do Monitoramento o conceito compacto aprovado de Indicadores do suporte: cards de 84 px, valores proporcionais e espaçamentos menores.
- Remove margens e preenchimentos sobrepostos nos gráficos, preservando o modo Editorial e os demais módulos.
- Registra o padrão visual compacto como referência para as próximas melhorias.
- Corrige a página inicial para usuários com apenas Indicadores do suporte liberado.

## 0.69.48 — 27/10/2026

- Mantém os menus de seleção de bases e modelos na camada do modal de filtros do Monitoramento.
- Move “Abrir tabela completa” para a faixa de ações da seção na Visão Analítica.
- Adiciona Indicadores do suporte às permissões individuais e exige essa permissão também na API de leitura.

## 0.69.47 — 27/10/2026

- Alinha os cabeçalhos e grades da Visão Analítica do Monitoramento e deixa explícita a ação para abrir a tabela completa em modal.

## 0.69.46 — 27/10/2026

- Mantém a grade essencial da Visão Analítica compacta e abre a visão completa das tabelas em um modal com seleção de colunas e paginação própria.

## 0.69.45 — 27/10/2026

- Repagina a Visão Analítica do Monitoramento Ativo, alinhando gráficos, tabelas e indicadores em uma grade compacta e responsiva.

## 0.69.42 — 26/10/2026

- Simplifica a ação de excluir nota no Monitoramento: ícone × vermelho sem fundo nem contorno.

## 0.69.41 — 26/10/2026

- Adiciona exclusão administrativa de notas individuais no histórico de tratamento, com confirmação, controle de revisão e preservação dos lembretes.

## 0.69.40 — 26/10/2026

- Adiciona exclusão administrativa do acompanhamento manual, com confirmação e revisão concorrente.
- Restaura a última página principal acessada após atualização, por usuário e respeitando permissões.

## 0.69.39 — 26/10/2026

- Corrige as referências do estado de persistência que impediam abrir o Monitoramento Ativo.

## 0.69.38 — 26/10/2026

- Persiste o histórico manual de acompanhamento dos veículos no D1 do piloto, com revisão concorrente e acesso restrito ao administrador principal.
- Nos demais escopos, salva o histórico localmente por usuário/navegador e distingue falha do banco de ausência de registros.

## 0.69.37 — 25/10/2026

- Disponibiliza Compacto e Editorial no topo dos modais de configuração, preservando salvar, cancelar e restaurar padrão nas preferências.
- Recolhe fontes e consultas sob demanda abaixo das opções de relatório e corrige o contraste do botão Salvar preferências.

## 0.69.36 — 25/10/2026

- Separa o modo Compacto do Editorial na Visão geral: compacta indicadores e espaçamentos sem perder dados, e dá mais presença aos textos e gráficos editoriais.
- Alinha os cards de gráficos na mesma linha e remove rolagem interna dos resumos.

## 0.69.35 — 25/10/2026

- Adiciona os temas Arctic Frost, Sunset Boulevard e Tech Innovation com paletas próprias para interface, estados e gráficos.
- Adapta tabelas de resumo e perfil do suporte a telas menores e inclui atalhos contextuais na visão geral do Operacional.

## 0.69.34 — 25/10/2026

- Reposiciona os ícones de ajuda junto aos títulos dos painéis e libera espaço para os botões de ação, evitando sobreposição e corte em telas menores.

## 0.69.33 — 25/10/2026

- Padroniza estados de origem e última leitura entre OS, Operacional, Indicadores Suporte e Monitoramento.
- Distingue dados pendentes, cobertura parcial, fonte indisponível, ausência de lançamento e recortes válidos sem resultados.
- Organiza os Indicadores Suporte em uma sequência sugerida de leitura e oferece novas mensagens específicas para gráficos vazios.
- Permite tentar abrir novamente um módulo com falha antes de recarregar o sistema, explicando o impacto sobre fontes apenas da sessão.

## 0.69.32 — 25/10/2026

- Compacta a faixa de filtros das análises e recolhe fontes, contagem e controles avançados em opções secundárias.
- Leva as conexões Google Sheets e Zoho Desk da página de Ordens de Serviço para Configurações, mantendo importação rápida disponível.

## 0.69.31 — 25/10/2026

- Padroniza o acesso às configurações com botão azul identificado por texto, em vez de ícone isolado.
- Move a escolha de visualização Compacto/Editorial dos Indicadores Suporte para o modal e corrige o contraste do botão.

## 0.69.30 — 25/10/2026

- Padroniza as configurações e informações secundárias em modais acessíveis nas páginas principais, mantendo filtros e ações frequentes à vista.
- Clareia o tema Claro para superfícies brancas e fundo neutro suave; ações primárias ficam azuis com texto branco.
- Move orientações extensas da página de Importação e os critérios de fonte do Monitoramento para seus modais.

## 0.69.29 — 25/10/2026

- Reúne período, agente, fontes, cobertura, diagnósticos, pendências e critérios do Indicadores Suporte em um modal de configurações.
- Leva seleção dos blocos e estilo Compacto/Editorial para a configuração da apresentação.
- Abre a apresentação em uma tela limpa, com tela cheia, impressão/PDF e retorno à seleção; Esc também retorna à configuração.

## 0.69.28 — 25/10/2026

- Adiciona modo Apresentação aos Indicadores Suporte, com seleção dos blocos visuais e estilos Compacto ou Editorial.
- Imprime somente os blocos selecionados, com período e agente no cabeçalho e sem painéis operacionais de consulta e diagnóstico.
- Completa a cobertura semanal: categorias Zoho por agente; agenda/execução por agente e tipo; participação por tipo; equipamentos e atividades manuais por agente.
- Reorganiza Serviços e Clientes: agenda em legenda dos totais, alturas alinhadas e opção de ampliar a seção; serviços por cliente ficam em linha no modo compacto.
- No tema Claro, troca o realce verde pelo azul vibrante de Grafite e Azul, mantendo texto e gráficos com contraste adequado.

## 0.69.27 — 25/10/2026

- Atualiza o modo compacto global com superfícies, hierarquia tipográfica e tabelas mais consistentes entre os módulos.
- Recompõe a ampliação de Serviços e Clientes com três tendências compactas e a tabela completa em primeiro plano.
- Mantém a identidade de cor do tema selecionado e os controles de impressão e exportação.

## 0.69.26 — 25/10/2026

- Desmonta o conteúdo pesado de relatórios recolhidos ou de páginas inativas, reduzindo elementos e gráficos mantidos no DOM durante a navegação.
- Alinha as grades de serviços executados e clientes atendidos no Indicadores do Suporte.
- Amplia a visualização detalhada para incluir rankings de serviços e clientes e a composição dos serviços por cliente.

## 0.69.25 — 25/10/2026

- Aperfeiçoa a densidade compacta global, com controles menores em telas amplas e alvos adequados em dispositivos móveis.
- Distingue a leitura do retrato salvo da consulta ativa à integração no Monitoramento.

## 0.69.24 — 25/10/2026

- Integra o Assistente local ao MCP com ferramentas somente de leitura para atendimentos, trocas e parque, limitadas às amostras fictícias.
- Vincula consultas MCP à sessão temporária da página, preservando indicadores, período, fontes e filtros no resultado.
- Expira sessões MCP inativas, restringe origens/Host e melhora mensagens para falhas de autenticação no endereço local.
- Adiciona teste ponta a ponta do n8n/Gemini/MCP e instruções de backup e restauração do fluxo local.

## 0.69.23 — 25/10/2026

- Aproveita melhor a área dos gráficos temporais, com eixos menores, datas horizontais e menos marcadores em séries extensas.
- Adapta o raio de pizzas e roscas ao espaço disponível e oferece valores completos e CSV nas ferramentas do gráfico compartilhado.
- Pagina rankings extensos sem rolagem interna, preservando a escala e o recorte completo na exportação e impressão.
- Corrige acesso aos itens finais das tabelas do Meu Dashboard e isola a impressão do modal de serviços sem afetar os demais relatórios.

## 0.69.22 — 25/10/2026

- Abre o gráfico de serviços em modal com detalhamento, impressão e exportação CSV e SVG.
- Amplia a coluna de serviços e apresenta cada serviço do cliente em linha própria, com fonte de 9 px e mais espaçamento.

## 0.69.21 — 25/10/2026

- Adiciona Ocean Depths, Modern Minimalist, Forest Canopy e Botanical Garden como opções de aparência.
- Harmoniza superfícies, estados e cores de gráficos em cada paleta, preservando Claro, Grafite e Azul e Lima e Grafite.

## 0.69.20 — 24/10/2026

- Adiciona gráfico de área para séries mensais no Meu Dashboard, com suporte a comparação de períodos compatíveis.
- Mantém ausências como lacunas visuais e limita a opção a dados temporais, sem aplicá-la a rankings categóricos.

## 0.69.19 — 24/10/2026

- Compacta o Meu Dashboard em telas amplas: quatro cartões ou três gráficos médios por linha, com controles e margens menores.
- Reduz a altura padrão de gráficos e tabelas; tabelas mostram cinco linhas por página e mantêm paginação, ampliação e impressão completa.
- Preserva dimensões personalizadas dos blocos e mantém a composição anterior em telas menores.

## 0.69.18 — 24/10/2026

- Carrega do banco somente as bases necessárias à página aberta, preservando a troca atômica de cada lote solicitado.
- Processa importações de OS e Operacional e validação de integridade das bases salvas em Web Workers para reduzir bloqueios da interface.
- Mantém paginação nas tabelas existentes e evita acrescentar virtualização sem necessidade comprovada.
- Torna mais vibrantes os realces secundários e as séries de dados do tema Grafite e Azul.
- Define o modo compacto como padrão também para navegadores com preferência anterior, mantendo a escolha editável em Aparência.

## 0.69.17 — 24/10/2026

- Evita refazer filtros, estatísticas, rankings e grupos de cliente do Consumo ao alterar estado visual que não muda os dados.
- Reutiliza listas de revisão e totais financeiros da Operacional enquanto o recorte de registros permanecer igual.

## 0.69.16 — 24/10/2026

- Uniformiza filtros recolhíveis e mostra quantos recortes estão ativos nas categorias que usam o painel compartilhado.
- Padroniza espaçamentos e tamanhos dos grupos de ações no modo compacto e mantém os cabeçalhos das tabelas visíveis durante a rolagem.
- Ajusta o ritmo de filtros, resumos e tabelas sem ocultar colunas nem reduzir a legibilidade dos valores.

## 0.69.15 — 24/10/2026

- Define o espaçamento compacto como padrão em todos os módulos do sistema, aproximando o conteúdo e liberando mais área útil.
- Mantém a opção de espaçamento confortável disponível em Aparência para quem preferir mais respiro.

## 0.69.14 — 24/10/2026

- Compacta a interface do Meu Dashboard, reduzindo margens, controles, botões e espaços entre ferramentas.
- Amplia a área útil para montar painéis e tabelas sem diminuir a tipografia dos dados exibidos.

## 0.69.13 — 24/10/2026

- Reduz o espaço ocupado por filtros, cartões de prioridade, lembretes e indicadores do Monitoramento Ativo.
- Move o histórico de avisos para depois da fila de acompanhamento e amplia a área útil da grade.
- Compacta também as páginas analítica e de conferência, preservando notas explicativas dos dados.

## 0.69.12 — 24/10/2026

- Adiciona atalhos de prioridade no Monitoramento Ativo para alertas, veículos há 4 dias sem atualização, lembretes vencidos e cadastros a conferir.
- Compara os campos da API e do Operacional lado a lado, distinguindo divergências e dados ausentes sem presumir erro.
- Permite escolher colunas e exibir 10, 25, 50 ou 100 linhas por página na fila.

## 0.69.11 — 24/10/2026

- Adiciona uma preferência global opcional de layout compacto na área de aparência, válida nos módulos do sistema.
- Reduz espaços de filtros, cards, tabelas, gráficos e cabeçalhos sem ocultar conteúdo; preserva a leitura confortável como padrão e mantém a escolha salva no navegador.

## 0.69.10 — 24/10/2026

- Adiciona um modo compacto aos Indicadores Suporte, com filtros e cards mais enxutos e análises organizadas em duas colunas.
- Mantém o resumo por agente visível e adapta a composição para telas menores; o modo completo segue disponível.

## 0.69.9 — 24/10/2026

- Evolui o tema Escuro para Grafite e Azul, com azul profundo e realces luminosos.
- Mantém três temas e preserva os nomes e preferências salvos dos demais.

## 0.69.8 — 24/10/2026

- Remove o fundo do controle da logo e alterna entre variantes claras/escuras conforme o tema.
- Recupera a paleta anterior de Lima e Grafite.

## 0.69.7 — 24/10/2026

- Mantém somente os temas Claro, Escuro e Lima e Grafite.
- Renova as três paletas com superfícies off-white, grafite e acentos mais claros, mantendo contraste e distinção nos gráficos.
- Migra preferências salvas dos temas removidos para uma opção equivalente.

## 0.69.6 — 24/10/2026

- Permite abrir e exportar os registros de OS e Zoho que formam categorias e pontos dos gráficos.
- Expõe a cobertura do período e o estado de cada fonte junto aos indicadores.
- Adiciona leitura compacta e melhora o relatório para impressão/PDF com escopo, fontes, critérios e comparações.

## 0.69.5 — 24/10/2026

- Agrupa os gráficos dos Indicadores Suporte em três blocos de leitura: equipe, ritmo dos atendimentos e perfil do suporte.
- Mostra nos cards a comparação com o período equivalente anterior em valor e percentual, somente quando as fontes são compatíveis.

## 0.69.4 — 24/10/2026

- Aplica o alinhamento ao bloco correto de status das fontes, mantendo título e barra de filtros inalterados.

## 0.69.3 — 24/10/2026

- Identifica explicitamente o bloco das fontes em Indicadores Suporte para alinhar os rótulos mesmo quando os painéis de consulta do banco estão visíveis.

## 0.69.2 — 24/10/2026

- Alinha os nomes e os valores das fontes de Indicadores Suporte para facilitar a conferência da base e da consulta Zoho.

## 0.69.1 — 24/10/2026

- Coloca os cards principais logo após os filtros em Indicadores Suporte e reduz espaçamentos de cards e gráficos.
- Mantém a ordem do conteúdo igual para leitura visual, teclado e tecnologias assistivas.

## 0.69.0 — 24/10/2026

- Amplia o D1 para consumo/franquias, painéis e últimas consultas Zoho, no piloto exclusivo do proprietário.
- Migração local explícita, revisões atômicas, upload deduplicado e indicação da origem/data de dados salvos; cópias locais preservadas.
- Mantém esquema, permissões das outras contas e agendamento existentes. Preparação e homologação não migram dados reais automaticamente.

## 0.68.0 — 24/10/2026

- Pagina vínculos operacionais e monta tabelas completas/auditorias apenas quando necessárias, preservando impressão e exportação.
- Pausa atualizações de apresentação inativa e controla atividade do Monitoramento sem alterar o agendamento remoto.
- Isola assinaturas por fonte, compartilha consultas equivalentes e vínculos do Dashboard com invalidação por identidade, permissões e bases.
- Agrupa prévias de gestos por quadro e reaproveita detecção de edição do painel; levantamento e medições registrados.

## 0.67.2 — 24/10/2026

- Preserva o contraste do título dos avisos ao passar o mouse, em todos os temas.

## 0.67.1 — 24/10/2026

- Exibe os avisos das coletas também quando o Monitoramento já tem uma fotografia carregada. Mantém a leitura do histórico no estado sem fotografia.

## 0.67.0 — 24/10/2026

- Avisos internos dos atrasos/retornos salvos, com paginação, vistos locais, CSV e acesso ao veículo; cobertura dos campos da API visível.
- Franquias compartilhadas por operadora/grupo/ciclo/ICCID, com cobertura, consumo e excesso observado; conferência KORE API × CSV sem presumir ciclo.
- Proteção do histórico local contra gravações concorrentes e clientes antigos, com dados existentes preservados.
- Reaproveitamento de cálculos OS/Operacional e cache de busca por base; benchmark sintético e revisão inicial de candidatos sem exclusões.

## 0.66.2 — 24/10/2026

- Restaura Claro e Escuro como opções próprias, além das quatro paletas.
- Claro com off-white, texto grafite e botões cinza-escuro; Escuro com cinza profundo e detalhes neon moderados.
- Preserva IDs light/dark e preferências atuais; contraste dos novos tokens conferido.

## 0.66.1 — 24/10/2026

- Seletor reduzido a Grafite e Lima, Azul e Âmbar, Noite e Bruma Azul, com fonte compacta.
- Duas paletas claras off-white e duas escuras grafite com destaques luminosos moderados; cores semânticas preservadas.
- Migração de preferências antigas, contraste dos principais tokens conferido e impressão independente da aparência de tela.

## 0.66.0 — 24/10/2026

- Indicadores Suporte compacto, com ajuda contextual, categorias zeradas quando o catálogo é confirmado, espera por agente e fechados pelo status atual/último autor confirmado.
- Conferência API × Operacional em sete campos, equivalências explícitas de bases e diagnósticos de revisão com regra, impacto e aplicabilidade.
- Consumo reorganizado por operadora, acompanhamento e relatórios consolidados, prévia de coleta KORE com período confirmado e backups isolados.
- Preserva contagem OS por linha, improdutivas separadas, CNPJ C, dados manuais e regras de equipamentos. Nenhuma migração D1.

## Análises complementares do suporte

- Motivos de manutenção, serviços absorvidos pela Addlog e distribuição por UF/cidade.
- Visitas repetidas por cliente/placa, contexto financeiro da rede de técnicos e cobertura dos vínculos com o parque.
- Comparação por volume, custo e deslocamento com acesso às linhas de origem.
- Estoque e novas análises de contratos fora do escopo; indicadores por equipamento aguardam validação dos vínculos.

# Histórico de versões

## 0.69.44 — 26/10/2026

- Indicadores Suporte fica visível para todos os usuários ativos, em modo de visualização. Carrega lançamentos, configurações, base de OS publicada e consultas Zoho de indicadores e pendências já salvas.
- Servidor mantém criação, edição, exclusão, publicação de bases e novas consultas ao Zoho restritas ao administrador principal. Não libera outras bases, versões históricas ou acervos privados.

## 0.69.43 — 26/10/2026

- Indicadores Suporte mostra os lançamentos manuais salvos no período com ações Editar e Excluir por data/agente. A edição carrega os campos existentes e atualiza o mesmo registro, sem duplicar contagens.
- Exclusão confirmada retira o registro diário completo dos indicadores, com revisão e autoria no banco. Preserva proteção contra alterações concorrentes e permite novo lançamento na mesma data após exclusão e recarga.

## 0.65.0 — 24/10/2026

- Alinha o detalhamento dos Indicadores Suporte aos totais: visita improdutiva nunca é execução efetiva; conta na agenda somente pela data e pelo responsável de agendamento válidos.
- Acrescenta consulta independente da carteira atual de chamados atribuídos a cada agente, incluindo Open e On Hold, sem restringir pela data de criação ou pelo período dos eventos. Consultas incompletas não aplicam totais parciais.
- Distingue criados pelo agente, pendentes atuais e fechados pelo agente na tabela. Categorias dos fechados ganham distribuição por agente e relação paginada por chamado, com data, categoria, subcategoria e classificação atuais; CSV inclui a relação completa. Autoria continua exigindo evidência no histórico e categorias ausentes não são inventadas.

## 0.64.5 — 23/10/2026

- Consulta Zoho aceita eventos idênticos de alteração de status repetidos no histórico, contando cada evento uma única vez, inclusive quando há sobreposição entre páginas.
- Preserva a autoria e as transições distintas. Páginas inteiras repetidas sem avanço, categorias ambíguas e históricos truncados continuam bloqueando resultados incompletos.

## 0.64.4 — 23/10/2026

- Indicadores Suporte consulta o histórico completo de cada chamado para conferir fechamentos, inclusive quando houve reabertura. Um evento válido não é descartado por divergir da data resumida closedTime.
- Preserva autoria por evento, deduplicação e bloqueio quando não há evidência de fechamento. Não substitui executor pelo responsável atual nem altera a coleta antiga de OS.

## 0.64.3 — 23/10/2026

- Alinha cabeçalhos e valores numéricos das tabelas de Indicadores Suporte, com ordenação compacta, larguras mínimas e rolagem horizontal.
- Fechamentos sem conferência completa passam a mostrar Em conferência e as referências pendentes no card, em vez de apresentar ausência genérica de dados. Não altera a autoria nem substitui o histórico pelo responsável atual.

## 0.64.2 — 23/10/2026

- Substitui o aviso de carregamento das bases por uma janela compacta central, fora do fluxo da página, sem deslocar o conteúdo.
- Mostra progresso de leitura, confirmação de gravação e tentativa de recarga em caso de erro. Fechar a janela ou pressionar Escape permite continuar navegando sem interromper a operação.

## 0.64.1 — 23/10/2026

- Acrescenta Bruma Azul e Jardim ao seletor compacto de temas, com preferência salva no navegador.
- Distribui as cores solicitadas entre superfícies, textos, ações e gráficos, com tons derivados para legibilidade. Principais pares de texto/fundo conferidos com contraste mínimo de 5:1; estados de alerta preservam distinção semântica.

## 0.64.0 — 23/10/2026

- Menu expande somente páginas com categorias: OS, Operacional, Consumo, Parque e Monitoramento. Páginas sem submenu não exibem setas, explicações ou espaço de expansão.
- Usuários e permissões inclui controle próprio de abertura do Meu Dashboard e as regras de acesso das ferramentas novas e integrações. Liberar o painel não concede acesso às fontes de dados.
- Campo opcional no banco de usuários preserva a regra de acesso dos cadastros existentes. Nenhum usuário recebe permissões novas automaticamente; pilotos e permissões de importação/exportação mantêm suas restrições.

## 0.63.0 — 23/10/2026

- Confere autoria de abertura dos chamados por evento TicketCreated e exclui clientes/importações. Histórico ausente ou ambíguo mantém o total automático indisponível, sem substituir por zero.
- Indicadores Suporte passa a consultar categorias atuais dos chamados fechados pelo agente, deduplicando chamados por pessoa e no total da equipe. Não interpreta título livre como categoria nem soma dados automáticos aos manuais.
- Acrescenta diagnóstico limitado de autoria e categorias, validado em amostra real. Consulta ampliada é optativa desta página, preservando o custo e comportamento das demais consultas Zoho. Exportação inclui categorias e origem dos valores.

## 0.62.0 — 23/10/2026

- Acrescenta Indicadores Suporte como página independente no menu, com período e agente próprios, atalhos de semanas/mês, cards, gráficos, tabelas e exportação CSV/impresso.
- Combina execução/agenda da OS e eventos de fechamento/tempo apontado do Zoho com atividades manuais por data e agente. Fontes, cobertura e campos sem informação ficam explícitos; agenda e execução não são somadas como serviços distintos.
- Salva lançamentos e configurações no D1 do proprietário, sem duplicar a mesma data/agente, com proteção contra revisões concorrentes. Permite escolher cards, ordem de seções e metas semanais opcionais. [Critérios e uso](docs/INDICADORES-SUPORTE.md).
- Chamados criados pelo suporte e assuntos permanecem manuais até validar autoria e categorias reais da API. Não altera as fontes, permissões ou retenções existentes.

## 0.61.0 — 22/10/2026

- Acrescenta Excluir lembrete no Monitoramento, com confirmação por veículo, exclusão sincronizada e histórico interno preservado. Novo agendamento mantém revisão crescente para recusar ações de telas antigas. [Funcionamento](docs/EXCLUSAO-DE-LEMBRETES.md).
- Corrige carregamento lento das bases: uma transferência por fonte, leitura em paralelo e progresso visível, com integridade e publicação completa preservadas. Para as duas bases remotas verificadas, reduz 81 requisições de abertura para quatro.
- O servidor lê as partes em lotes internos e transmite o JSON original sem montar a base inteira na memória. Recusa respostas incompletas, versões divergentes e corrupção; cancelamento interrompe carregamentos antigos. [Diagnóstico e limites](docs/BASES-SALVAS-E-COLETA.md).

## 0.60.0 — 22/10/2026

- Amplia a leitura de permanência por CSV Session do Zoho: filtro e comparação por agente, evolução diária com união de sobreposições, detalhes e exportação do recorte. Corrige sessão válida de duração zero no início do período. CSV real e fonte automática continuam pendentes.
- Refina cards, tabelas e configuração da permanência, com cabeçalhos fixos e layout responsivo. Acrescenta exemplo fictício identificado para testar a importação.
- Uniformiza o botão Adicionar indicador do Meu Dashboard e corrige contraste das ações principais nas paletas. [Uso, critérios e validação](docs/PERMANENCIA-ZOHO-E-REFINAMENTO.md).

## 0.59.0 — 22/10/2026

- Salva bases completas de OS, Operacional e Logística no D1 do piloto do proprietário. Carrega a versão ativa ao abrir; publicação transacional, hash e revisão evitam cargas parciais ou sobrescrita silenciosa. Mantém cinco versões sem somá-las nos relatórios.
- Conecta Monitoramento ao banco: leitura salva ao abrir, atualização manual e agendamento às 9h, 12h, 15h e 18h de São Paulo. Retém fotografias e eventos observados por 30 dias, preservando a última válida e os lembretes existentes.
- Acrescenta estado de salvamento na importação e histórico paginado das coletas nos relatórios. Extratos de consumo e demais fontes continuam nos armazenamentos anteriores. [Funcionamento, limites e ativação](docs/BASES-SALVAS-E-COLETA.md).

## 0.58.0 — 22/10/2026

- Cria banco D1 de negócio separado do banco de usuários, com migração SQL explícita e exportação manual com hash SHA-256. Não ativa coleta automática ou armazenamento das demais bases.
- Conecta a agenda de lembretes ao Worker autenticado no piloto do administrador principal: documentos por veículo, revisão atômica, horário do servidor e preservação dos históricos.
- Migra os lembretes reais de cada navegador mediante conferência e ação explícita. Reconhece reenvio, recusa históricos divergentes e conserva a cópia local. Falhas remotas não acionam fallback local. [Escopo e ativação](docs/BANCO-CLOUDFLARE.md).

## 0.57.0 — 22/10/2026

- Exibe consumo KORE em MB decimais (1 MB = 1.000.000 bytes), preservando os bytes originais e incluindo ambas as unidades no CSV.
- Vincula a coleta ao Operacional carregado na sessão com as regras existentes: cliente, serial e modelo por serial somente quando ICCID e número conferem no mesmo cadastro único. Ausências, ambiguidades e divergências permanecem visíveis para revisão.
- Exportação inclui estado do vínculo e referências do cadastro, sem modificar a fonte ou os indicadores CSV. Consulta completa segue paginada: não há opção documentada de retorno integral em uma chamada.

## 0.56.0 — 22/10/2026

- Coleta KORE acumula lotes de até oito páginas por token, com continuação a cada dez minutos enquanto a página estiver aberta. Progresso, pausa, retomada e reinício preservam a distinção entre coleta parcial e completa.
- Confere páginas consecutivas, IDs/ICCIDs duplicados e estabilidade do total informado. Falhas não publicam lotes truncados nem substituem a coleta anterior. Exportação inclui cobertura e intervalo de leitura.
- Navegação da tabela em blocos de 20 linhas utiliza os dados já coletados, sem novas chamadas à operadora. Dados e progresso permanecem apenas na memória da sessão.

## 0.55.1 — 22/10/2026

- Reconhece a confirmação real de encerramento KORE `status: true`, além do formato documentado `"OK"`. Preserva páginas válidas com aviso separado se esse encerramento falhar.
- Ajusta a espera da interface para 10 minutos entre leituras, conforme exigência real do serviço de tokens.

## 0.55.0 — 22/10/2026

- Adiciona páginas KORE e Arqia ao menu principal, herdando a permissão de Consumo M2M. O piloto KORE/Saitro permite consulta manual por administradores: linhas paginadas, consumo em bytes, situação, conexão, bloqueios e último acesso BRT. Exporta somente a página exibida. Arqia aguarda documentação e acesso.
- Credenciais ficam em segredos do Cloudflare. Autenticação por token no servidor, leitura de uma página e encerramento somente do token usado; sem limpeza global de tokens ou comandos de alteração dos chips. Intervalo de um minuto, limites de leitura e preservação da página anterior em falha.
- Mantém o piloto separado dos indicadores, arquivos, notas e backups CSV. A operadora confirmou bytes, BRT (UTC-03:00) e atualização de sessões abertas entre 5 minutos e 1 hora. Período do acumulado e regras divergentes de limite/paginação precisam de confirmação antes da integração dos totais.

## 0.54.1 — 22/10/2026

- Simplifica a seleção de temas para nomes em fonte de 12 px, mantendo a indicação da opção ativa e a preferência salva.
- Troca os blocos escuros da conferência API × Operacional por cards neutros com números em destaque e seleção discreta. Busca, filtro e exportação passam a usar uma grade responsiva.
- Equilibra larguras e quebra de texto na tabela de conferência, preservando o cabeçalho durante a rolagem. Alinha títulos, ações e ajuda nos cabeçalhos compartilhados dos relatórios.

## 0.54.0 — 22/10/2026

- Adiciona cinco temas a partir das paletas fornecidas: Sálvia e Areia, Lagoa, Azul e Âmbar, Noite Azul e Lima Elétrica. Preserva as três opções anteriores e a preferência já salva.
- Amplia o seletor com amostras das cinco cores originais e rolagem limitada à altura da tela. Tons derivados sustentam o contraste; avisos e indicadores de status mantêm seus significados. Impressão e exportações conservam cores próprias. [Paletas e critérios](docs/TEMAS-DO-SISTEMA.md).

## 0.53.0 — 22/10/2026

- Prioriza a grade de Monitoramento com filtros/lembretes compactos, acompanhamento acessível na rolagem e telemetria opcional. Retira a demonstração da interface; indicadores maiores e mais vibrantes, com texto e estado neutro preservados.
- Corrige o alinhamento dos filtros abertos e separa gráficos dos controles de tabela. Apresenta clientes/bases em caixa alta sem alterar fontes, IDs ou agrupamentos.
- Adiciona limites e recortes de 30/60/90 dias, faixas analíticas exclusivas e compatibilidade com o Meu Dashboard.
- Adiciona conferência API × Operacional por serial exato, com vínculos ambíguos, valores lado a lado, referências da planilha, busca e CSV. Nenhuma correção automática; nomes de bases e razões sociais não têm equivalência presumida.
- Exporta diretamente da fila: CSV retangular do recorte completo e XLSX com filtros, contexto e percentuais formatados. Preserva CSV completo por seções em Relatórios. Consumo e dados da linha não constam no contrato integrado documentado e não foram inferidos de posições. [Critérios e limites](docs/MONITORAMENTO-TRABALHO-E-CADASTROS.md).

## 0.52.0 — 21/10/2026

- Monitoramento com tabelas essenciais/completas, escolha de colunas, cabeçalhos e números alinhados, cobertura separada do valor principal e paginação das bases. Ordenação considera todas as linhas; impressão identifica o recorte paginado e exportações mantêm o conjunto completo.
- Evita repetir classificação e ordenação durante a espera entre consultas; carrega a visão analítica quando aberta e prepara relatórios somente ao exportar. Ensaio reproduzível com 1.800 veículos fictícios, sem chamadas à API real.
- Meu Dashboard compara análises personalizadas da mesma fonte, agrupamento e medida, com filtros e escopos próprios. Categorias ausentes permanecem indisponíveis; comparação mensal conserva a ordem cronológica e o backup mantém as duas consultas.
- Piloto de CSV Session do Zoho: colunas e fuso explícitos, período independente, união de sobreposições por agente e revisão/exportação dos registros inválidos ou abertos. Dados somente na memória da sessão; validação com o arquivo real ainda pendente.
- Preparação inativa do coletor com identidade por execução, contrato de publicação atômica e eventos de atraso/retorno observados. Nenhum banco, rota, cron ou histórico remoto foi ativado. [Critérios e limites](docs/LAYOUT-E-CONSULTAS-052.md).

## 0.51.0 — 21/10/2026

- Amplia o Monitoramento Ativo com alimentação/bateria, posições por base e inventário por modelo. Coberturas e médias distinguem zeros, ausências e coleta indisponível; os sinais representam o último estado recebido.
- Filtro de modelos, busca por modelo/identificador e acesso dos indicadores às respectivas filas. CSV/XLSX incluem agregados por base/modelo, com contexto e denominadores.
- Adiciona o tema Grafite e Lima, inspirado na paleta do proprietário, com branco, azul petróleo e cores complementares. Um seletor mantém Claro e Escuro disponíveis e preserva a preferência neste navegador; impressão mantém cores próprias.

## 0.50.0 — 21/10/2026

- Conecta o Monitoramento Ativo ao diagnóstico do sistema legado Addlog pelo servidor, com endereço e token em segredos do Cloudflare. Mantém autenticação e permissão de monitoramento; a leitura abrange todas as bases retornadas pelo legado.
- Converte a última comunicação UTC, preserva identificadores e mostra posições nas últimas 24 horas. Modelo, identificador, alimentação externa e bateria ficam no detalhe e na exportação; posições não são consumo M2M.
- Consulta manual com intervalo de um minuto, limite no servidor, timeout e leitura limitada. Falhas por base, duplicidades, HTML e respostas incompatíveis mantêm a frota anterior com coleta indisponível. Não ativa histórico compartilhado ou coleta agendada.

## 0.49.1 — 21/10/2026

- Retira o roteiro pessoal e suas notas da versão compartilhada do mapa, inclusive HTML, guia para download e apresentação. Mantém os diagramas técnicos e o restante da documentação.
- Preserva a edição completa em pasta local ignorada pelo Git. A geração recompõe essa edição somente quando os arquivos privados estão presentes; o empacotamento recusa conteúdo privado na saída compartilhável.

## 0.49.0 — 21/10/2026

- Publica o mapa em endereço independente com senha compartilhada, sem cadastro no sistema. Todos os documentos/diagramas exigem sessão assinada de oito horas; cookie seguro, limitação de tentativas, saída, proteção de cache e invalidação ao trocar a senha.
- Adiciona atalho ao mapa no menu de administradores. O site documental não recebe bindings de dados, usuários ou integrações do dashboard; somente os documentos aprovados são empacotados.
- Automatiza a regeneração do mapa com versão e arquivos atuais antes da publicação documental. A cópia local continua disponível offline; links online de código apontam ao GitHub, sem copiar fontes ao site.
- [Uso, publicação e rotação](docs/MAPA-COMPARTILHADO.md).

## 0.48.0 — 21/10/2026

- Meu Dashboard ganha análises personalizadas de OS e Operacional: campos de agrupamento, contagem de registros/distintos e soma/média financeira com denominadores válidos e linhas de origem. Configurações acompanham salvamento, cópia e backup; séries personalizadas ficam lado a lado, sem comparação automática de eixos distintos.
- Equipamentos ganha matriz modelo × motivo: eventos de assistência de rastreador, trocas atribuídas ao serial retirado, cobertura das exclusões e conferência dos registros.
- Revisões de OS e Operacional usam diagnóstico comum com busca, categorias, paginação, origem, impacto, orientação e exportação CSV. As planilhas originais permanecem intactas.
- Mapa local de apresentação atualizado com os novos arquivos e conexões; banco e assistente permanecem fora desta rodada.

## 0.47.0 — 20/10/2026

- Renova o tema claro com superfícies suaves, verde petróleo, azul e violeta; no escuro, usa grafite e séries mais luminosas. Menus, filtros, botões, cards, tabelas e Meu Dashboard compartilham os tokens do tema.
- Restaura a logo branca antiga, com base escura para contraste, símbolo no menu recolhido e favicon correspondente. Mantém o clique na marca para expandir/recolher.
- Faz as cores das séries acompanharem o tema e preserva cores concretas em SVGs exportados e nas cópias isoladas de impressão. Estados de atenção/críticos conservam distinção semântica; limites, valores e cálculos permanecem iguais.
- Confere 22 pares de texto/fundo, todos acima de 5:1, e evita quebra excessiva dos valores financeiros nos cards da Visão geral.

## 0.46.0 — 20/10/2026

- Corrige conteúdo dos blocos redimensionados: gráficos usam o espaço disponível, tipografia proporcional com limites de legibilidade e rótulos/categorias ajustados, com aviso e acesso à tabela completa. Ampliação em janela própria preserva o recorte e a organização.
- Acrescenta colunas, linhas para evolução mensal e roscas para partições válidas, com cauda agrupada sem perder o total; mantém barras horizontais e tabelas. Categorias indisponíveis não viram zero.
- Permite até quatro indicadores complementares no mesmo card e comparação de duas séries com eixo/unidade compatíveis. Cada fonte conserva seus filtros, período e critérios; não há soma automática nem associação de nomes diferentes.
- Adiciona seções, quatro modelos editáveis, central de fontes e recorte optativo de período/cliente por indicador. Preserva permissões, salvamento explícito, backups, desfazer e layouts anteriores.
- Registra na fila a futura troca para a logo branca antiga e renovação das paletas clara/escura solicitadas pelo proprietário; essa rodada visual ainda não foi aplicada.

## 0.45.0 — 20/10/2026

- Acrescenta modo Organizar no Meu Dashboard: mover por arraste, toque/caneta ou setas, ajustar largura/altura e desfazer até 30 alterações da edição. Cada gesto é confirmado ao soltar; Escape cancela o gesto. Salvar painel continua explícito.
- Permite duplicar blocos e criar uma cópia da edição atual como novo painel, com IDs independentes e nomes diferenciados.
- Exporta configurações dos painéis salvos e importa JSON validado como novas cópias, com prévia, permissões, limites e revisão transacional. Não transporta planilhas, valores calculados, credenciais ou identidade. Configurações antigas sem altura continuam válidas.
- Adiciona apresentação sem menu/controles de edição, tela cheia opcional, saída por botão/Escape e impressão/PDF com título, contexto, critérios e todas as linhas das tabelas do recorte. Demonstração e indisponibilidade permanecem identificadas.

## 0.44.0 — 20/10/2026

- Entrega **Meu Dashboard**: página em branco com catálogo pesquisável de 55 indicadores de OS, Zoho, Consumo M2M, Operacional, Parque, Logística e Monitoramento, conforme permissões existentes.
- Permite cartões, gráficos de barras e tabelas, títulos, filtros próprios, tamanhos e reordenação. Cada bloco mostra fonte, período, recorte e atualização; reutiliza os cálculos dos módulos sem misturar bases ou transformar ausência em zero.
- Salva até 12 painéis por usuário neste navegador, com até 40 blocos cada, criação, edição, renomeação, descarte e exclusão. IndexedDB transacional com revisão protege gravações concorrentes e mantém cópia/edição em caso de falha.
- Fontes continuam na sessão e são carregadas nos módulos de origem. Não há consultas automáticas, sincronização entre dispositivos ou fórmulas livres nesta etapa. [Funcionamento e limites](docs/MEU-DASHBOARD.md).

## 0.43.0 — 20/10/2026

- Destaca chamados fechados por Eduardo e Jean na seção Zoho e na Visão geral. Usa executor e data das transições para status da categoria Closed, conforme configuração do departamento. Reaberturas não apagam o evento anterior; repetições do mesmo chamado são deduplicadas por agente e na equipe.
- Separa responsável atual, executor do fechamento e maior tempo válido apontado até cada fechamento. Compara todos os participantes encontrados, inclui apontamentos anteriores ao período e preserva empates. Dados de tempo incompletos exigem revisão; nenhum peso numérico foi inventado.
- Acrescenta conferência dos fechamentos por chamado, datas, status e participação de cada agente. Permite escolher colunas no resumo por agente e na conferência de fechamentos, com mostrar todas e restaurar padrão; escolhas na sessão.
- Reduz lotes para cinco chamados e mantém coleta completa antes de substituir dados, com validação da categoria de status e limite de histórico. Sem executar mudanças de status no Zoho, persistência ou novas permissões.

## 0.42.0 — 20/10/2026

- Mostra respostas e chamados confirmados no Zoho mesmo quando a coleta contém pendências. Informa interações/chamados pendentes, motivos por contagem e acesso à conferência; datas não identificadas continuam sem confirmação. Preserva os totais finais, os tempos apontados e a deduplicação da equipe.
- Adiciona visões favoritas locais por usuário e categoria aos filtros de OS, Consumo, Operacional, Parque/Logística e Monitoramento. Salva filtros/busca, apresentação dos relatórios registrados e grupos da Visão geral de OS, com criar, aplicar, atualizar, renomear e remover. Sem aplicação automática, consultas novas ou sincronização; semanas relativas são recalculadas ao aplicar em OS.
- Inclui “O que merece atenção” nas Visões gerais de OS e Consumo, com limites ajustáveis e acesso à origem. Aponta trocas repetidas por cliente/filial e placa, concentração de improdutivas por cliente e aumentos de MB/dia do mesmo chip/operadora sobre apuração anterior não sobreposta.
- Recusa fonte de OS incompatível e apuração/base ausente ao aplicar favoritos. Releitura e revisões protegem alterações entre abas; falhas de armazenamento preservam os favoritos anteriores. Comparações ambíguas ou com referência zero ficam explícitas, sem percentual inventado.

## 0.41.2 — 20/10/2026

- Alinha a altura dos três quadros iniciais de apresentação na Visão geral e permite rolar seus conteúdos mais longos, com cabeçalhos acessíveis e recolhimento preservados. Evita lacunas antes dos relatórios seguintes.
- Mantém altura livre no celular e conteúdo integral na impressão. Em telas intermediárias, custos ocupa a largura disponível para evitar uma coluna vazia.

## 0.41.1 — 20/10/2026

- Move a escolha de gráficos e os atalhos da Visão geral para um bloco recolhível logo abaixo do título, antes dos indicadores. O cabeçalho informa quantos grupos estão abertos e os controles deixam de interromper a sequência dos gráficos.
- Preserva apresentação individual/conjunta, navegação, filtros e estado dos gráficos. Oculta os controles de apresentação na impressão.

## 0.41.0 — 19/10/2026

- Adiciona um lembrete ativo por base/ID de veículo no Monitoramento Ativo, com data e hora de São Paulo e observação. Permite reagendar, cancelar, conferir manualmente com resultado opcional e iniciar novo ciclo sem apagar eventos antigos.
- Salva lembretes e seu histórico no IndexedDB deste navegador, separados por usuário e demonstração/dados reais. Resumo no topo mostra pendentes e agendados ao abrir, mesmo antes de consultar a frota e independentemente dos filtros; a fila recebe indicador discreto.
- Compara vencimentos com o relógio real ao abrir, retornar à página e a cada 30 segundos. Não solicita notificações nem executa com a página fechada. Conferência não confirma recuperação e não muda situação técnica, acompanhamento ou indicadores.
- Inclui CSV de todo o histórico local de lembretes e aba Lembretes nas exportações do recorte. Transações e revisões protegem edições entre abas; erro de leitura/gravação é explícito e não substitui dados por uma agenda vazia.
- Mantém anotações de tratamento na sessão e a integração de telemetria em preparação. Sem D1 de negócio, sincronização entre computadores ou envio de lembretes ao servidor.

## 0.40.0 — 19/10/2026

- Aplica apresentação mais enxuta em Consumo e Parque, destacando indicadores principais e mantendo médias, extremos, trocas, taxas, bases e critérios em blocos expansíveis.
- Identifica tabelas com rolagem horizontal e permite navegação por teclado nas grades principais e origens. Alinha valores numéricos e preserva identificadores textuais completos, seleção, ordenação, paginação e exportações.
- Compacta ações de abrir/resumir/recolher em ícones acessíveis junto à limpeza de filtros. Acrescenta aviso de período invertido e mensagens para fonte ausente, carregamento e recorte vazio.
- Melhora impressão com contexto legível, apurações próprias, detalhes complementares, cabeçalhos e textos integrais. Mantém a página atual das grades paginadas e as exportações completas existentes.
- Confere temas claro/escuro e telas de 320 a 1440 px, sem exigir banco, APIs ou novas configurações. Regras analíticas, dados e armazenamento preservados.

## 0.39.0 — 19/10/2026

- Prepara contrato de persistência independente do banco, com revisão obrigatória, isolamento por espaço/coleção, conteúdo versionado, paginação, fontes imutáveis e exclusão lógica.
- Inclui adaptador de referência em memória, ponte read/write e adaptador SQL com migração isolada do banco de usuários. Sem ativar banco de negócio, rotas remotas, sincronização ou envio de dados.
- Centraliza o acesso ao histórico de consumo pelo repositório existente, inclusive na importação conjunta; permite injeção no hook. IndexedDB e backup versão 1 preservados.
- Documenta o mapa dos módulos, limites de tamanho, validação das fontes, autorização e roteiro de migração/homologação. Testes usam memória e SQLite local com o mesmo contrato.

## 0.38.1 — 19/10/2026

- Simplifica a página Equipe de suporte, com identificação das fontes Zoho/OS, cards mais sóbrios, alinhamento dos controles e comparação por agente ao lado da tabela em telas amplas.
- Reúne os períodos das OS em um seletor com mês, ano e datas personalizadas, usando os mesmos filtros da categoria. Preserva Execução, Agendamento e Ambos com suas próprias datas.
- Mantém os quatro indicadores principais em destaque; veículos, proporção de improdutivas, registros por chamado, bases e comparações ficam em blocos expansíveis. Cards por pessoa, ranking, origens, exportação e impressão continuam disponíveis.
- Organiza a conferência do Zoho em grupos e informa quando as datas foram alteradas sem refazer a consulta. A coleta anterior permanece identificada por seu período original.
- Ajusta os dois temas e a leitura em celular, sem mudar a apresentação da Visão geral ou as regras de cálculo.

## 0.38.0 — 19/10/2026

- Reorganiza o Zoho na Visão geral em quatro cards, gráfico por agente e tabela compacta, usando a última coleta concluída e mantendo seu período próprio.
- Concentra a consulta e os detalhes do Zoho na página Equipe de suporte. O botão do cabeçalho e o atalho do resumo levam ao mesmo painel, disponível também antes de importar OS.
- Recolhe vínculos com OS, respostas, métricas por chamado, apontamentos e conferência da conexão. Mostra primeiro os indicadores e mantém pendências como “A conferir”.
- Reutiliza a mesma apresentação e cálculo nas duas telas, com cores dos temas e ordenação numérica de tempos e contagens. A navegação preserva a coleta na sessão.

## Ajustes locais preservados — Assistente

- Conecta o agente às duas amostras fictícias de 1.000 registros por perfil local explícito, sem misturar as fontes reais ou a logística no teste.
- Amplia a ferramenta para atendimentos por período, execução/agendamento, cliente e placa, custos, trocas e fotografia do parque. Cálculos usam as mesmas regras do painel, com parâmetros validados e resultados limitados.
- Mostra cards, rankings, detalhes e fontes de cada consulta efetivamente realizada. Períodos relativos usam a última data realizada do arquivo e ficam identificados no resultado.
- Restringe a leitura detalhada às amostras, mantém o acervo real no contrato anterior e preserva autenticação, contexto por pergunta e limite de duas chamadas à ferramenta.

## 0.37.1 — 19/10/2026

- Dá largura completa ao gráfico Zoho do suporte na Visão geral, abaixo dos gráficos de OS, para acomodar a tabela sem comprimir as colunas nem deixar um painel vizinho vazio. Mantém a mesma coleta e critérios da versão anterior.

## 0.37.0 — 19/10/2026

- Inclui os dados reais do Zoho no quadro **Atuação da equipe de suporte** da Visão geral, com gráfico por Eduardo/Jean e escolha entre tempo apontado, média por chamado, chamados com tempo, respostas e chamados respondidos. Durações usam eixo em minutos e os valores completos ficam na tabela.
- Reaproveita a última coleta concluída na seção Zoho, sem consulta automática. Mostra período próprio e horário da leitura; filtros de OS não alteram os dados do Zoho. Indicadores pendentes continuam em conferência, sem virar zero.
- Conserva leitura, revisão e vínculos em memória ao fechar a seção ou navegar entre categorias; troca de identidade/permissão limpa a sessão. O acesso aos detalhes abre a seção Zoho a partir do gráfico.

## 0.36.1 — 19/10/2026

- Centraliza o mapa real de atividades e tempos, o vínculo com as OS e a conferência de conexão na seção **OS → Zoho Desk**. Indicadores e período ficam em primeiro plano; agentes e amostra de chamados recentes ficam em um quadro complementar recolhível.
- Retira dos relatórios de Equipe de suporte a prévia com dados fictícios, substituída pela seção real. Orienta carregar as OS quando a base necessária aos vínculos ainda não estiver disponível.
- Consulta real por período confirmada após renovação da autorização de pesquisa: apontamentos e métricas por chamado recebidos. Respostas com critérios incompletos continuam em conferência; permanência por sessões continua indisponível.

## 0.36.0 — 19/10/2026

- Adiciona consulta manual de atividade e tempos do Zoho para Eduardo Oliveira e Jean Johann, com período próprio de até 31 dias em Brasília. Pesquisa chamados modificados, incluindo chamados criados antes do período, e aplica a leitura somente após concluir a paginação.
- Mostra tempo apontado por pessoa e chamado, chamados com apontamento e média por chamado, com autoria pelo responsável do apontamento e data de execução. Primeira resposta e resolução permanecem métricas acumuladas do chamado, separadas das horas trabalhadas.
- Conta respostas públicas enviadas pelo autor e chamados distintos, com revisão explícita quando a fonte não comprova data de envio ou ausência de automação. Permite selecionar os vínculos exatos dos dois agentes com execução/agendamento das OS, somente na sessão.
- Mantém acesso exclusivo do administrador principal e preserva a leitura anterior em erros ou cancelamentos. Sessões, armazenamento e atualização automática continuam pendentes. Conexão inicial confirmada pelo proprietário com seis agentes e 50 chamados; os novos indicadores aguardam comparação real com o Zoho.

## 0.35.0 — 19/10/2026

- Normaliza identificadores Zoho retornados como número inteiro seguro ou texto, incluindo organização e vínculo entre responsável/agente. Mantém recusa de números sem precisão e de organizações divergentes, com diagnóstico específico.

- Correção de acesso ao piloto: botão Zoho Desk no cabeçalho das OS, ao lado de Google Sheets, independente da categoria, das preferências dos relatórios e da importação de planilha. Quadro abre por ação explícita e preserva a leitura ao fechar.

- Adiciona primeira conexão Zoho Desk em OS → Equipe de suporte, com consulta manual da organização, agentes paginados e amostra de até 50 chamados recentes por criação. A cobertura da conta e os limites ficam explícitos.
- Renova OAuth somente no servidor e restringe as rotas ao administrador principal ativo. Destinos fixos, redirecionamentos recusados, resposta limitada e erros sem segredos. Falhas preservam a leitura anterior.
- Mantém Zoho separado dos indicadores de OS, sem associação automática de pessoas nem atribuição da autoria ao responsável atual. Respostas, tempos, sessões, histórico e automação ainda aguardam validação. Leitura real pendente na página autenticada.

## 0.34.0 — 19/10/2026

- Prepara leitura privada do Operacional pelo Google Sheets, com aba fixa Equipamentos e identificador independente das OS. Ativação real aguarda a planilha escolhida e a comparação com Excel.
- Reutiliza a leitura compacta da área preenchida e o importador operacional existente, preservando layouts, identificadores, datas, valores e revisão.
- Oferece carregamento explícito e atualização opcional de 15 minutos para administradores na página Operacional. Atualizações preservam filtros, busca e ordenação; falhas mantêm a base anterior. Importação local desliga a fonte Google.

## 0.33.1 — 19/10/2026

- Troca o alias Gemini Flash Latest por `gemini-3.5-flash-lite` no agente após reprodução de timeout e resposta 503 de alta demanda do modelo anterior. Credencial preservada, com consulta real validada usando a ferramenta.
- Acrescenta link direto para o fluxo atual do agente na página; fluxos antigos de teste permanecem separados.
- Mostra diagnósticos específicos para limite, indisponibilidade, credencial, conexão, timeout, acervo e resultado incompleto. O registro local de falhas contém somente código e horário, sem chaves, perguntas ou erro bruto.
- Torna a leitura do resultado da execução tolerante a mensagens do processo após o JSON.

## 0.33.0 — 18/10/2026

- Adiciona campo de perguntas e sugestões ao Assistente do laboratório, ligado ao nó AI Agent 3.1 do n8n com Gemini. Instruções fixas ficam no agente e a pergunta digitada é enviada separadamente.
- Disponibiliza a ferramenta somente leitura `consultar_atendimentos`, limitada aos totais do último mês com realizados na OS. O agente pode consultar números/critérios e deve explicar a limitação para filtros e assuntos indisponíveis.
- Contexto efêmero por execução e snapshot único; cards e fonte só aparecem quando a ferramenta é chamada. Sem memória entre perguntas, MCP, comandos dinâmicos, alteração de planilhas ou acesso livre a arquivos.
- Mantém a autenticação do piloto local, limita tamanho do pedido e restringe o uso da ferramenta. Perguntas digitadas seguem para o Gemini; os resultados automáticos continuam sem identificadores dos clientes.

## 0.32.0 — 18/10/2026

- Conecta o Assistente do laboratório à consulta fixa de volume de atendimentos do acervo local e à explicação do Gemini pelo n8n. Cards mostram os cálculos do sistema; fonte, período, revisão e critérios ficam disponíveis para conferência.
- Piloto exclusivo do administrador principal, com sessão Cloudflare Access verificada no serviço loopback. Origem e rotas fixas, sem comandos, caminhos de arquivo ou perguntas livres recebidos do navegador.
- O Gemini recebe somente totais, período e critérios. Identificadores, linhas, nomes dos arquivos e credenciais não entram no prompt. Sem exposição pública do n8n, agendamento ou dependência dos filtros das outras páginas.
- Requer os serviços locais ligados; indisponibilidade, sessão recusada e consultas simultâneas têm mensagens explícitas. Adiciona inicializador e documentação do laboratório.

## 0.31.1 — 18/10/2026

- Adiciona atalho do Assistente de suporte ao lado do seletor de tema, com ícone de laboratório, nome acessível e indicação de página ativa. Visível somente para administradores ativos, inclusive com menu recolhido; consultas permanecem desativadas.

## 0.31.0 — 18/10/2026

- Cria módulo separado Assistente de suporte, oculto do menu e acessível somente a administradores ativos pelo endereço `#assistente-laboratorio`.
- Estrutura inicial com sugestões de perguntas, rascunho na sessão e recursos futuros identificados. Consulta desabilitada; sem acesso às bases, IA, MCP ou n8n. Página/CSS carregados apenas ao abrir o laboratório.
- Retorno ao sistema preserva o funcionamento das páginas e remove o fragmento experimental. Documentação e fila atualizadas; consulta real e integrações seguem pendentes.

## 0.30.0 — 18/10/2026

- Agrupamento analítico por Cliente consolidado ou CNPJ / filial, independente por categoria de OS. Razões sociais exatamente iguais na Base clientes são consolidadas por padrão, conforme autorização do proprietário; a opção pode ser desativada.
- Coluna opcional Cliente consolidado permite reunir nomes diferentes ou separar exceções. Divergências permanecem para revisão; sem cadastro utilizável mantém CNPJ original. Não infere grupos por nomes semelhantes ou raiz de documento.
- Custos, atendimentos, perfil de intervenções, contagens de clientes e ranking de trocas por cliente usam o agrupamento escolhido. Chamados únicos são recalculados no conjunto, sem somar subtotais de filiais. Conferência, exportações e impressão explicam o critério.
- Veículos, reincidência, ciclos e vida em campo preservam cliente/filial original. Nenhuma planilha de origem ou integração externa foi alterada. [Uso e critérios](docs/AGRUPAMENTO-DE-CLIENTES.md).

## 0.29.0 — 18/10/2026

- Classifica Assistência Técnica efetiva por chamado/placa no arquivo completo: uma linha/ID é manutenção sem troca; duas linhas com IDs distintos e mesma data confirmam um evento. Filtrar uma ponta não muda a classificação. Acessórios separam troca explícita de manutenção sem troca, preservando revisão de categoria incerta e todos os custos válidos.
- Vida em campo dos acessórios usa a implementação do cliente/placa como referência inicial, com prioridade para instalação explícita mais precisa. Ciclos seguintes começam na troca anterior da mesma categoria; revisão sem troca não reinicia o intervalo. Origem aparece na tabela e no CSV; direção/data/cliente incertos impedem duração automática de rastreador.
- Ranking de ocorrências de troca por cliente/placa e cliente/filial no relatório existente, separado por rastreador/kit, coletora e RFID, com detalhe de datas, IDs/modelos, instruções, origens e CSV.
- OS manual lê CNPJ e razão social da Base clientes. Coluna C identifica cliente/filial pelo CNPJ completo; AK não participa da identidade. Custos, cards e suporte preservam filiais, nomes originais e conferência do cadastro. Google continua lendo somente OS.
- Modelo prioriza o serial nos painéis operacionais, Parque e referência do Consumo. Prefixos 81, 82, 83, 84 e 85 passam a MXT-141; coluna Modelo original e backups permanecem intactos.

## 0.28.1 — 17/10/2026

- Tema claro usa texto e links pretos, navegação em tons neutros e botões principais em cinza escuro. Acentos da marca, cores dos indicadores e tema escuro preservados.

## 0.28.0 — 17/10/2026

- Parque e Manutenção ganha Histórico individual e concentração no painel existente: assistências por cliente/modelo com tamanho da base, efetivos/improdutivos por equipamento, última intervenção no recorte, referência ajustável, faixas de dias e conferência das OS originais. Intervenção considera qualquer Concluída/Pago sem Visita Improdutiva; referência inicial usa a maior data realizada do arquivo. Sem histórico, sem data e posterior à referência ficam separados. Grade ordenada antes da paginação, com Último e CSV completo do recorte.
- Resumos ampliados em OS, Parque, Consumo, Logística e Monitoramento, com filtros, população, exclusões e limites próprios. Cabeçalhos da apresentação reservam espaço para o ícone de informação; cards de suporte ficam separados dos gráficos abaixo.
- Histórico e arquivos do Consumo apresenta as fontes atuais e laboratório fictício de coexistência CSV/API. Política interna testada evita somar acumulados revisados/repetidos e exige conferência entre fontes e períodos sobrepostos. Sem chamadas externas, gravação, migração ou mudança dos totais reais.
- Equipe de suporte inclui prévia recolhível OS + Zoho, com agentes fictícios, filtros próprios, tickets deduplicados na equipe, autoria, sessões de permanência e tempo apontado separados. Fonte indisponível não vira zero; impressão identifica demonstração. CSV real, OAuth e APIs continuam pendentes.

## 0.27.2 — 17/10/2026

- Apresentação da Visão geral retoma três quadros lado a lado em telas largas: manutenções por cliente, perfil dos serviços e composição dos custos. Resumos de concentração, quantidade/custo por tipo e médias dos componentes voltam a acompanhar seus gráficos, usando os cálculos existentes.
- Mostrar/recolher por assunto, abertura conjunta e navegação completa mantidos. Cada quadro conserva ajuda e impressão; os controles se adaptam a telas menores. O ranking de Custo Total por cliente permanece em um bloco recolhível junto à composição.
- Composição do parque volta a mostrar registros operacionais, clientes identificados e registros sem serial. Usa o arquivo operacional completo, com alcance explícito e permissão do módulo, sem aplicar filtros de OS.

## 0.27.1 — 17/10/2026

- Cards de destino da Visão geral passam a oferecer Mostrar gráficos aqui, além do atalho para a análise completa. É possível abrir várias áreas simultaneamente ou usar Mostrar todos os gráficos e Recolher gráficos da apresentação.
- Resumos incorporados de operação, clientes/custos, suporte e equipamentos usam os filtros da Visão geral e os mesmos cálculos existentes. A composição do parque usa o arquivo operacional completo, com indicação e contexto de impressão próprios, somente para usuários com permissão de Parque e Manutenção.
- Conteúdo é montado ao abrir cada área; recolher preserva seus controles enquanto a Visão geral permanece aberta. Ajuda, títulos e impressão por seção mantidos. A abertura das apresentações não modifica preferências nem filtros das categorias de destino.
- Proposta de integração com Zoho Desk documentada: chamados respondidos, respostas enviadas e tempo apontado por agente. Integração permanece sem implementação/ativação; configuração, critérios finais, permissões e armazenamento dependem de validação.

## 0.27.0 — 17/10/2026

- OS com sete categorias: regiões incorporadas a Operação; registros, revisão e análises personalizadas reunidos em Dados e relatórios. Relatórios relacionados usam um painel com seletor Visualização, preservando títulos, regras, estado, ajuda e preferências individuais.
- Visão geral concentra dez cards, agenda e duas tendências compactas, com atalhos aos detalhes. Resumos de concentração/perfil foram movidos para Operação; resumo contratual fica nos indicadores financeiros. Conferência completa de vínculos centralizada em Parque e Manutenção.
- Parque reúne composição e cobertura na Visão geral; indicadores, comparações e exportação ficam em Manutenção e relatórios. Operacional permanece dedicado à conferência da fonte.
- Consumo com uma única grade de acompanhamento e visualização de ranking sem tabela repetida. Fora dos totais conserva registros inválidos/duplicados para conferir a origem, sem somá-los; seleção CSV, notas e histórico local mantidos.
- Filtros seguem por categoria; cálculos, populações, acesso e permissões de exportação preservados. Impressão identifica a visualização ativa. Documentação de navegação e uso atualizada; integrações externas continuam pendentes.

## 0.26.0 — 17/10/2026

- Equipe de suporte com cards gerais coloridos, ajuda e comparação por indicador; faixa complementar mostra veículos identificados, percentual de improdutivas e registros por chamado. Contagens distintas e bases temporais permanecem próprias de cada papel.
- Cards compactos por responsável com efetivos, improdutivas, chamados, clientes, participação e comparação anterior. Busca visual e limite inicial de seis pessoas não filtram os indicadores nem a exportação da equipe; nomes não são unidos por grafia semelhante.
- Clicar na pessoa abre o detalhamento logo abaixo: novos indicadores, perfil, clientes, evolução e originais sob demanda. Em Ambos, agendamento/execução permanecem lado a lado com datas próprias, sem pontuação somada. Ranking e conferência geral passam a um bloco recolhível.
- XLSX/CSV da pessoa incluem apenas seu recorte; em Ambos, papéis e clientes ficam identificados e originais compartilhados não são duplicados. Exportação geral incorpora indicadores, unidades e bases; percentuais são frações numéricas formatadas, razões usam duas casas.
- Impressão preserva nomes dos cards e detalhamento aberto; acesso, permissão de exportação, fontes e regras financeiras mantidos. Documentação e testes de identificação, períodos, zero/ausência, participação e arquivos atualizados.

## 0.25.2 — 17/10/2026

- Agendados e Aguardando agendamento abrem a conferência imediatamente abaixo dos cards da Visão geral, antes dos gráficos. Clicar novamente recolhe; seleção e vínculo acessível indicam o card aberto. Fechar devolve foco ao card.
- Conferência da agenda mais compacta: título e ação na mesma faixa, linhas menores e rolagem limitada. Mantém todas as colunas, valores, linhas de origem e ordenação. Outros detalhes conservam sua apresentação; mudar base/filtros fecha a conferência antiga.
- Semana atual e Semana anterior nos filtros da Visão geral, de segunda a domingo, pelo calendário de São Paulo. Editam somente o período dessa categoria e preservam os demais critérios. A agenda aberta continua sem recorte temporal, conforme indicação junto aos cards; nenhuma pendência é ocultada pelo atalho.

## 0.25.1 — 17/10/2026

- Cores dos dez cards da Visão geral de OS um pouco mais vivas, mantendo fundos suaves, números neutros e contraste próprio nos temas claro/escuro.
- Paleta de séries compartilhada por gráficos de pizza/rosca, linhas e barras; evolução mensal, equipe e comparações geográficas usam tons mais nítidos. Barras compartilhadas, impressão e SVG acompanham a nova apresentação.
- Legendas dos gráficos mantêm texto neutro e marcador colorido para preservar o contraste.
- Composição mantém serviço técnico verde e deslocamento azul, alinhando o desenho à legenda. Categorias, cálculos, filtros, permissões e dados preservados.

## 0.25.0 — 16/10/2026

- Visão geral de OS passa a dez cards, acrescentando Implementações realizadas, Clientes com atendimento e Veículos identificados. Os sete cálculos anteriores permanecem iguais.
- Implementações contam serviços realizados sem Visita Improdutiva. Clientes contam razões sociais utilizáveis distintas; veículos contam pares utilizáveis cliente + placa. Cobertura inclui visitas improdutivas, não representa carteira ou parque ativo e informa linhas sem identificação. Coluna ausente exibe indisponibilidade; base vazia válida exibe zero.
- Paleta suave por grupo, ícones vetoriais, borda discreta, valores neutros e legendas de base substituem o aviso repetido em cada card. Ajuda no canto superior direito; adaptação aos temas claro/escuro e telas menores. Cores organizam informações sem julgar a variação como desempenho.
- Com início e fim válidos, os dez indicadores comparam o intervalo anterior de igual duração e mesmos filtros; base anterior zero não gera percentual. Documentação de cálculo e testes de identificações, improdutivas, custos e recortes atualizados.

## 0.24.0 — 16/10/2026

- Filtros independentes por aba/categoria, conforme escolha do proprietário: OS, Operacional e Parque em espaços distintos, Consumo e Monitoramento. Seleções permanecem na sessão ao navegar; não há mais herança silenciosa entre categorias.
- Quadro único com alcance explícito, período, campos recolhíveis, chips para remover filtros, contagem, origem e ações dos relatórios. Limpar atua somente na categoria atual; menu indica a quantidade de campos ativos em cada categoria.
- Busca, colunas adicionais de OS e apurações por operadora também são independentes. Logística conserva a seleção ao sair e voltar; conferência de importação operacional continua sobre o arquivo completo, sem exibir filtros sem efeito nessa visão.
- Cards do Monitoramento encaminham explicitamente bases, limite e recorte à fila, preservando a Visão analítica. Referência de investigação do consumo continua compartilhada; linha do tempo individual continua abrangendo todo o histórico do chip.
- Nova importação válida reinicia as seleções da base; falhas conservam todas. Atualização Google → Google preserva os recortes das categorias. Fórmulas financeiras, denominadores, vínculos e formatos de armazenamento mantidos.

## 0.23.0 — 16/10/2026

- Piloto de OS com Google Sheets: fonte fixa, conta de serviço somente leitura e rotas autenticadas exclusivas de administradores. Credenciais e tokens permanecem no servidor; sem gravação das planilhas no D1 ou cache persistente.
- Carregamento explícito, última leitura bem-sucedida, atualização manual e automática opcional de 15 minutos na página OS visível. Falhas conservam a base anterior, arquivo local desliga a fonte e respostas antigas são ignoradas.
- Adaptador Google reutiliza o leitor do Excel, preservando posições, linhas de origem, identificadores textuais e erros. Atualizações da mesma fonte preservam filtros, busca e ordenação, voltando à primeira página.
- Engrenagem arredondada de 20 px em controle quadrado, proporções vetoriais protegidas e remoção de estilos sem uso da antiga seleção lateral de relatórios.
- Documentação e testes com dados fictícios. Aba `OS 2025_26` confirmada. Ativação real será retomada no escritório: conferir conta de serviço/API, compartilhar como leitor, configurar segredo no Cloudflare e comparar com o Excel.

## 0.22.0 — 16/10/2026

- Configuração de relatórios transferida da lateral para engrenagem no cabeçalho de OS, Operacional, Parque/Logística e Consumo. Categorias sem relatórios configuráveis não exibem o controle.
- Modal com visibilidade e apresentação inicial por relatório: padrão, completo, resumido quando disponível e recolhido. Salvar confirma; Cancelar/Escape/fechar descartam rascunhos; Restaurar padrão exige confirmação por Salvar.
- Preferências locais independentes por módulo, com preservação do legado de OS e tratamento explícito de falha de gravação. Filtros, cálculos, dados importados e permissões preservados.
- Registro de capacidades pela Section, mantendo conteúdo montado e comandos temporários de resumo/recolhimento. Acompanhamento do consumo pode revelar o histórico sem regravar preferências.
- Testes de formato/migração/isolamento, conferência dos módulos no navegador, teclado, recuperação de relatórios ocultos, rascunhos, armazenamento e responsividade nos dois temas. Documentação de uso e manutenção atualizada.

## 0.21.3 — 16/10/2026

- Menu lateral mais compacto, com ícones finos de 16 px, texto neutro e seleção por fundo suave, sem faixa lateral. Cores da Addlog mantidas nos dois temas.
- Submenus e ferramentas com espaçamento menor e hierarquia discreta. Rodapé do tema separado por linha leve; celular conserva áreas de toque maiores. Funções, nomes, permissões e ação da logo preservados.

## 0.21.2 — 16/10/2026

- Logo Addlog passa a recolher/expandir o menu, substituindo o botão com seta. Mantém símbolo no modo recolhido, preferência salva, sincronização entre páginas e navegação por teclado com foco visível.
- Remove estilos do controle anterior e mantém a área da logo clicável nos dois temas e em telas menores. Documentação de apresentação atualizada.

## 0.21.1 — 15/10/2026

- Filtro Responsabilidade da Equipe de suporte com opção Ambos, exibindo duas barras por pessoa e duas séries na evolução. Execução/Agendamento conservam suas datas, filtros e contagens próprias.
- Cards, ranking, participações, comparação anterior, improdutivas e linhas de origem separados por papel. Limite do gráfico considera pessoas, mantendo as duas barras; não soma os papéis como atendimentos únicos.
- CSV/XLSX com identificação de responsabilidade e originais sem duplicação física, SVG dos dois gráficos e impressão. Falta de coluna impede a comparação com aviso e conserva seleção dos papéis disponíveis.
- Testes de dupla atribuição, períodos diferentes, filtros de responsável, improdutivas, lacunas temporais e percentuais/linhas exportados. Sem alteração das regras dos modos individuais.

## 0.21.0 — 15/10/2026

- Nova categoria Equipe de suporte nas OS: execução/agendamento separados, últimos sete dias, semana anterior, mês, ano, histórico completo e período personalizado pelos filtros compartilhados.
- Cards, ranking, comparação com intervalo anterior equivalente, perfil/evolução, linhas de origem, CSV/XLSX e impressão. Efetivos e visitas improdutivas separados; sem responsável/data explícitos. Volume não representa qualidade ou produtividade por hora.
- Monitoramento abre em Acompanhamento, com grade separada da Visão analítica e dos Relatórios. Busca, situação, status administrativo e recortes afetam toda a fila antes da paginação e a exportação.
- Doze cards analíticos clicáveis, cobertura de tratamento, distribuição dos status e detalhamento por base. Encerramento administrativo não representa recuperação da comunicação.
- Contrato v1, cliente da própria origem e porta autenticada para futuro coletor privado, com permissão de monitoramento no servidor, leitura limitada, validação e sanitização. Sem binding configurado retorna indisponibilidade; nenhuma API externa, token ou coleta automática foi ativado.
- Consulta real manual preparada; falhas/parcialidade mantêm a frota anterior com coletas indisponíveis, sem fallback fictício. Demonstração permanece explícita e anotações seguem apenas na sessão. Documentação técnica/instrucional atualizada.

## 0.20.8 — 15/10/2026

- Etapa R05: módulos carregados na primeira visita autorizada. Depois, permanecem montados e ocultos durante a navegação, conservando bases, filtros, ordenação, seleção e rascunhos. Operacional e Parque continuam compartilhando a mesma instância; administração conserva seu reinício ao sair.
- Relatórios de OS e gráficos carregados após haver base importada. React, gráficos e planilhas separados em arquivos de produção; dependências de gravação do lote são carregadas somente quando necessárias. CSS conserva o mesmo conteúdo e ordem.
- Carregamento e falha isolados por página, com navegação disponível e recarga explícita. Nenhuma recarga automática que descarte planilhas da sessão.
- Cinco medições controladas antes/depois: JavaScript até a primeira tela de OS reduzido em cerca de 48%; mediana de abertura de 1,81 s para 1,31 s. Primeira visita a outro módulo pode exigir pequeno carregamento. Resultados locais com bases vazias e API de permissões simulada; não são promessa de tempo em produção.
- Manifesto e relatório de tamanho na compilação para acompanhar dependências estáticas e tardias. Documentação registra metodologia, limites e verificações de estado, importação conjunta, armazenamento local, permissões e falha de módulo.

## 0.20.7 — 14/10/2026

- Importador de Ordens de Serviço aceita a aba atual **OS 2025_26**, mantendo **OS 2025** para arquivos anteriores.
- Importação individual e conjunta compartilham o reconhecimento dos nomes; abas de clientes/técnicos continuam fora da leitura das OS. Colunas, linhas, identificadores e cálculos preservados.
- O resultado informa `sheetName` e a tela exibe a aba realmente importada. Orientações e erros de leitura usam os nomes aceitos.
- Arquivo com as duas abas reconhecidas exige definir uma única base antes da importação; não escolhe nem soma automaticamente. Falha mantém a base anterior.
- Testes de compatibilidade entre nomes, valores/ordem, aba vazia, ambiguidade e lote com operacional. Documentação atualizada.

## 0.20.6 — 14/10/2026

- Ordenação do operacional aplicada ao recorte completo antes da paginação, com ausências ao final, precisão textual dos seriais e retorno à primeira página ao ordenar.
- Comparação de tempo até retirada mantém o seletor disponível e desabilita colunas ausentes, sem interromper as demais análises.
- CSVs financeiros das análises estratégicas exportam números em reais e percentuais em pontos percentuais, com unidades explícitas, zero/negativos válidos e ausências vazias. XLSX descritivo distingue bases de contagem e monetárias.
- Parser compartilhado dos extratos reconhece delimitadores fora das aspas do cabeçalho, incluindo aspas escapadas e cabeçalhos multilinha, preservando a linha física de origem.
- Revisão de variantes de status, Pago/Pago em e cabeçalhos repetidos, sem alterar originais, contagens ou elegibilidade financeira. Pagamento continua referente ao técnico.
- Identificadores locais com alternativa a randomUUID, mantendo anotações/configurações existentes. SHA-256 do consumo preservado, com mensagem clara quando o endereço não oferece suporte.
- Evita varreduras repetidas em legendas e bases do descritivo; mensagens de divergência em pt-BR. Documentação atual separada das regras históricas.

## 0.20.5 — 14/10/2026

- Vida em campo: cards de implementações/instalações identificadas, primeiras trocas e sua participação, sem troca registrada, cancelamentos e tempo médio acompanhado. Nomes acompanham categoria e modo de início/seleção.
- Tempo médio acompanhado soma os dias válidos até troca, cancelamento ou limite do histórico e divide pelos ciclos com duração válida. Revisão/ausências ficam fora, sem virar zero. Média até primeira troca, mínimo e máximo mantêm sua amostra de trocas confirmadas.
- Percentuais descritivos usam todos os ciclos identificados no recorte, incluindo revisão no denominador; não representam taxa de falha ou previsão de vida útil. Bases e limites explicados em balões no título de cada card.
- Comparação por modelo/cliente e acompanhamento mensal incluem cobertura e tempo acompanhado. CSV dos ciclos inclui resumo numérico com unidades/bases/critérios e resumo por grupo; impressão conserva os novos dados mesmo com seção recolhida.
- Testes de durações válidas/zero, revisão, cancelamento, referência, filtros e exportação. Conferência no navegador de categorias, modos, ordenação, seleção vazia e responsividade em claro/escuro.

## 0.20.4 — 14/10/2026

- Controle de Consumo: renomeia a categoria Investigação para **Acompanhamento**, preservando sua chave interna, os relatórios, histórico e preferências existentes.
- Quarta etapa de refatoração: `OrdersPage.jsx` passa de 1.015 para 209 linhas. Importação, filtros, menu de relatórios, ciclos, trocas, totais, chamados e conferência das células têm painéis próprios; `useOrdersSession.js` reúne o estado da base e as ações da sessão.
- Busca textual e ordenação da tabela original extraídas em funções de domínio com regressões próprias. Busca afeta somente a tabela; ordenação usa o recorte completo antes das páginas de 50 linhas, mantém ausências/erros no fim e empates por linha de origem.
- Conserva autorização de importação/exportação, reset por nova base, referência dos ciclos, preferências, filtros salvos, contextos de impressão e montagem durante a navegação.
- Comparação de conteúdo e dimensões em 32 estados das oito categorias de OS, em dois temas e desktop/celular. Conferência de filtros, busca, ordenação, paginação, detalhamento mensal, configurações, ciclos, falha/nova importação, impressão e exportação com dados fictícios.

## 0.20.3 — 14/10/2026

- Terceira etapa de refatoração: consolida cabeçalhos de relatórios, ações, tabelas, ordenação, foco de teclado e estados desabilitados em `src/styles/controls.css`.
- Reúne 36 seletores compartilhados antes distribuídos entre seis arquivos e remove 31 declarações redundantes. Conserva a precedência das regras responsivas, cores de tema, ícones de ajuda e ajustes próprios dos módulos.
- Comparação antes/depois em 240 estados de tela: 15 combinações de página/categoria, oito larguras e dois temas, sem diferenças nos estilos e dimensões dos controles comparados. Conferência de ajuda, teclado, ordenação e impressão com dados fictícios.
- Título da aba atualizado para **Addlog | Suporte Controller**, mantendo o favicon da marca.
- Documenta responsabilidades do CSS e cuidados para futuras alterações. Cálculos, filtros, permissões e armazenamento preservados.

## 0.20.2 — 14/10/2026

- Segunda etapa de refatoração do consumo: extrai o controlador de importações/versões/backups, cabeçalho, prévia e painel de filtros.
- Relatórios separados em visão geral, investigação, equipamentos, mensalidades e células de origem. Categorias/títulos em configuração própria; preserva layout, estado, contexto de impressão e cálculos.
- Seleção por período/categorias/busca/limite e CSV filtrado/selecionado extraídos em funções de domínio com testes próprios. Preserva ordenação original da base, identificadores, unidades, ausências, valores financeiros e proteção contra fórmulas.
- Conferência de Arqia/Kore, importação idêntica, cancelamento, correção de versão, arquivos originais, mensalidades por serviço, histórico, busca, exportação, backups e navegação.

## 0.20.1 — 14/10/2026

- Primeira etapa da refatoração do Controle de Consumo: separa estado de persistência, acompanhamento individual, painel do histórico e painel de arquivos/backups da página coordenadora.
- Formatos locais compartilhados pela grade e pelo histórico; busca e opções do chip usam a mesma seleção. Preserva regras, layout, autorizações, formato do IndexedDB/backup e dados existentes.
- Identificação acessível explícita do formulário de acompanhamento, inclusive ao exibir erro de gravação. Conferência com falha simulada preserva histórico e rascunho.
- Documenta revisão inicial, responsabilidades, critérios preservados e próximas etapas em `REVISAO-E-REFATORACAO.md`.

## 0.20.0 — 14/10/2026

- Grade de acompanhamento em Consumo → Investigação, começando pelos maiores consumos totais do período filtrado, com cliente/placa, apuração, MB/dia, última marcação e data da ação.
- Clicar no status abre a linha do tempo logo abaixo e permite salvar uma nova anotação no histórico local existente. Seleção/exportação, ordenação do recorte completo e paginação com Último mantidas; histórico permanece após recarga no mesmo navegador.
- Novas anotações preservam também a placa exibida na ação; backup e relatório individual incluem esse campo opcional, mantendo compatibilidade com registros anteriores.
- Logo padrão com símbolo em gradiente laranja e texto adaptado ao claro/escuro. Menu recolhido e favicon usam apenas o símbolo. Paleta de destaques/gráficos acompanha as cores da marca, preservando distinção de alertas.

## 0.19.1 — 14/10/2026

- Botão Último na Fila de acompanhamento do Monitoramento Ativo: acessa a última página do recorte filtrado, fecha os detalhes selecionados e fica desabilitado quando já está no fim ou não há páginas adicionais.
- Ordenação pelas nove colunas da fila, aplicada ao recorte completo antes da paginação. Cliques alternam crescente, decrescente e ordem inicial; ausências ficam ao final e identificadores mantêm precisão textual.

## 0.19.0 — 14/10/2026

- Nome visível Monitoramento Ativo no menu, página e permissões; mantém o identificador `monitoring` e os acessos já cadastrados.
- Filtros no topo e fila como primeira ferramenta, antes dos cards/gráficos; tabela inclui placa, ID rastreador, cliente/base, última atualização, alimentação em volts e perfil de configuração.
- Fontes, botões, espaçamentos e tabela mais compactos apenas nesta página; controles de toque mantidos no celular.
- Sinal de duração com legenda e texto para faixas de 2/3/4 dias; coleta antiga ou informação indeterminada permanece neutra, sem inferir falha.
- Status administrativo clicável abre painel compacto de tratamento/histórico. Salvar atualização acrescenta data/hora, status, responsável e observação; rascunhos não mudam a tabela e encerrar acompanhamento não confirma recuperação.
- CSV/XLSX incluem alimentação, perfil e histórico registrado do recorte; demonstração continua fictícia e sem API, servidor ou persistência do acompanhamento.

## 0.18.2 — 12/10/2026

- Clareia discretamente os laranjas de destaque, estados selecionados e hover nos temas claro/escuro, preservando contraste de texto.
- Ajuste exclusivamente da paleta; fundos neutros, navegação e regras de cálculo permanecem como na versão anterior.

## 0.18.1 — 12/10/2026

- Menu lateral aberto reduzido de 270 para 230 px; 210 px em telas intermediárias e faixa recolhida de 76 px.
- Menor espaço lateral e recuo dos submenus, preservando logo, nomes completos, expansão e seletor de tema.
- Layout móvel continua ocupando a largura da tela; ajuste exclusivamente visual, sem alterações de dados ou regras.

## 0.18.0 — 12/10/2026

- Categoria Logística em Parque e Manutenção, independente da importação de OS/Operacional, com leitura manual das abas Envios e Devoluções.
- Cards de movimentações e recebimentos datados, filtros de tipo/recebimento/período/busca, tabelas ordenáveis e conferência de todas as células de origem.
- Revisão de ausências, datas incompatíveis/invertidas, formatação de IDs e possíveis repetições de mesma aba + ID + data, mantendo as linhas para revisão.
- Situação preservada sem interpretação; Consertos fica fora. Contagens representam movimentações, sem expandir kits ou inferir estoque, defeitos, instalação ou cancelamento financeiro.
- Integração à importação conjunta, limitada a uma referência logística por lote. Dados somente na sessão; acesso exige Parque e Manutenção e ações de importação/exportação separadas.
- CSV e impressão/PDF seguem o recorte. Documentação e testes de datas, origem, critérios de revisão, lote e permissões atualizados.

## 0.17.9 — 12/10/2026

- Tema claro em cinzas neutros, branco e laranja; tema escuro em grafite, com superfícies cinza e laranja mais destacado.
- Cards e painéis planos, com hierarquia por bordas/espaçamento; botões secundários escuros em cinza, mantendo texto contrastante e destaque laranja nas ações principais.
- Alinha larguras de Agrupar por, Comparar por e Participantes no gráfico, com empilhamento no celular; seletores especiais de relatório/histórico preservam seus layouts próprios.
- Corrige espaçamento interno do bloco de preparação do monitoramento e mantém a navegação da demonstração legível nos dois temas.
- Documenta propostas de aprofundamento do Parque e Manutenção e de uma futura base de envios/recebimentos. Nenhuma nova regra de cálculo ou integração foi ativada.

## 0.17.8 — 12/10/2026

- Filtros principais separados de responsável do suporte pela execução e pelo agendamento, com seleção múltipla e combinação com todo o recorte das OS.
- Tempo observado em campo permite exibir Todos, Encerrados ou Sem retirada registrada; a impressão segue esse recorte local e informa situação/contagem, sem alterar vínculos e outros indicadores.
- Rótulos claros na tela, mantendo os cabeçalhos originais `Resp. Execução` e `Resp. Agendamento` na leitura; papéis não são unidos automaticamente.
- Diagramas SVG/PNG da arquitetura e da importação, com guia dos campos, regras, armazenamento e limitações.
- Testes da combinação dos responsáveis, preservação da origem, limpeza de filtros e aplicação aos indicadores da visão geral.

## 0.17.7 — 12/10/2026

- Completa os ícones de ajuda dos cabeçalhos de relatório em OS, Operacional, Consumo e Parque e Manutenção, com explicações de fonte, cálculo, exclusões e finalidade.
- Catálogo de textos de apresentação integrado ao Section; ajuda disponível em resumo/completo/recolhido e preservada na impressão.
- Ajuda nos gráficos da visão geral, resumo operacional e distribuição de duração dos ciclos completos, alinhada à direita dos títulos.
- Corrige a comparação geográfica para excluir visitas improdutivas do subconjunto de manutenção efetiva, conforme regra já aprovada, preservando totais e custos de todas as visitas.
- Conferência de 47 cabeçalhos de relatório, balões no computador/celular e teste da base financeira da manutenção.
- Item de revisão dos ícones concluído na fila; demais prioridades preservadas.

## 0.17.6 — 12/10/2026

- Motivo Visita Improdutiva separado das manutenções efetivas, preservando todos os custos financeiros válidos.
- Atendimentos por veículo com três modos e critério explícito na exportação; ranking de técnicos com contagens separadas e seleção do volume no gráfico.
- Perfis e evolução distinguem improdutivas; manutenção por cliente, execução e assistência no parque não contam essas visitas como intervenção.
- Visão resumida em oito relatórios de OS/técnicos, com indicadores, bases e retorno ao completo sem reiniciar controles.
- Fila consolidada para priorização, incluindo revisão dos ícones de explicação ainda ausentes.
- Teste de improdutividade, intervalos por modo, manutenção efetiva e preservação dos custos.

## 0.17.5 — 12/10/2026

- Corrige corte dos filtros de seleção múltipla pelas bordas dos painéis em todas as páginas: menus independentes, busca acessível e altura limitada pela janela.
- Busca de linhas no histórico agora mostra quantidade de correspondências e resultados clicáveis, com orientação quando não encontra vínculo.
- Recupera abrir/recolher relatórios individualmente e comandos de abrir/recolher todos, preservando conteúdo montado.
- Mantém critérios dos indicadores, filtros e histórico sem alteração.

## 0.17.4 — 11/10/2026

- Filtro absoluto de consumo acima de um valor em MB, combinado aos demais filtros e aplicado ao recorte completo.
- Seleção individual ou de todas as linhas filtradas, incluindo várias páginas, com exportação CSV da seleção.
- Busca por cliente, placa, número, ICCID e operadora no seletor do histórico, preservando o chip selecionado e suas apurações.
- Exportação informa quantidade, escopo e limite; seleção manual não altera observações salvas.

## 0.17.3 — 11/10/2026

- Cliente e placa da referência operacional atual no seletor e cabeçalho do histórico da linha.
- Sem vínculo confirmado, exibe Linha não identificada; vínculo parcial mantém os campos conhecidos e sinaliza ausências.
- Placa incluída no contexto dos relatórios XLSX e CSV, sem inferir vínculos históricos.

## 0.17.2 — 11/10/2026

- Histórico individual de consumo exportável em XLSX e CSV, com contexto, apurações e observações/marcações salvas.
- Impressão da linha do tempo exclui formulário e rascunhos; exibe identificação e resumo do acompanhamento.
- Contrato de armazenamento separado da página, utilizando exclusivamente o IndexedDB existente e preservando dados e backups.
- Integração futura com armazenamento compartilhado documentada, sem sincronização ou envio de dados nesta etapa.
- Testes de identidade, períodos sobrepostos, anotações do chip, proteção de fórmulas e contrato de armazenamento.

## 0.17.1 — 11/10/2026

- Filtros compartilhados compactos, com seleção múltipla em listas flutuantes e fechamento por clique externo ou Escape.
- Período das OS sempre acessível acima dos relatórios, utilizando os mesmos filtros dos cards, gráficos e tabelas.
- Filtros adicionais das OS recolhíveis e explicações de blocos internos alinhadas à direita do título.
- Explicações financeiras ampliadas: origem, status, denominadores, exclusões e finalidade dos principais indicadores.
- Nenhuma alteração nas regras de cálculo, importação ou permissões.

## 0.17.0 — 11/10/2026

- Página Monitoramento de Frota em preparação, iniciando sem dados e com demonstração opt-in claramente identificada.
- Visão analítica, seleção de múltiplas bases, limites provisórios, situação técnica, cards, gráficos e fila de acompanhamento paginada.
- Qualidade da coleta, ausência de posição, datas incompatíveis e identidade duplicada tratadas separadamente de alertas.
- Rascunhos de acompanhamento apenas na sessão, sem alterar situação técnica; relatórios CSV/XLSX com referência, filtros e identificação DEMO.
- Nova permissão de página, sem liberação automática para usuários comuns e sem mudança no esquema D1.
- Integração, coleta agendada, dados de consumo, histórico real e notificações permanecem pendentes das definições da API.
- Guia do módulo e testes de limites, coleta, datas, duplicidade e exportação.

## 0.16.1 — 11/10/2026

- Código organizado em aplicação, componentes compartilhados, módulos, utilitários e estilos; testes mantidos junto das regras.
- Página de OS extraída de main.jsx; Workspace separado para coordenar navegação e bases da sessão.
- Caminhos de importação do navegador, Worker e documentação atualizados.
- Comentários em português nas responsabilidades dos arquivos, funções públicas e decisões sensíveis de cálculo e segurança.
- Prettier e EditorConfig para indentação e formatação consistentes, com comandos de manutenção e verificação de caminhos.
- Novo guia de arquitetura, mapa das funcionalidades e roteiro de estudo e atualização.
- Regras de negócio, identificadores de páginas, armazenamento local e estrutura D1 preservados.
- Validação: 281 caminhos locais, 123 testes aprovados e um opcional ignorado, compilação, renderização inicial das páginas e empacotamento Wrangler sem publicação. Comparação estrutural de 60 arquivos JavaScript confirmou equivalência lógica após a reorganização.

## 0.16.0 — 11/10/2026

- Cadastro administrativo de usuários com páginas, importação, exportação e suspensão de acessos.
- Worker com validação do JWT Access e banco D1 somente para usuários/permissões.
- Produção consulta permissões no servidor; menus e comandos adaptados e ações revalidadas.
- Proteção do administrador inicial, versão concorrente, origem e validação do cadastro.
- 123 testes aprovados, um ignorado; build e empacotamento Wrangler validados. Login remoto da nova versão ainda precisa ser confirmado.

## 0.15.7 — 11/10/2026

- Preparação para Cloudflare Pages: Node 22, cabeçalhos básicos, HTML sem cache persistente e solicitação de não indexação.
- Plano documentado de Cloudflare Access por e-mails autorizados, com proteção de produção e prévias.
- Deploy e autenticação dependem da criação/conexão da conta; ainda não publicados ou validados.

## 0.15.6 — 11/10/2026

- Padronização compartilhada dos controles de gráficos, com tamanho, altura e alinhamento consistentes para agrupamento e participantes.
- Ajustes no ritmo de títulos, ajuda, exportação, ações e cards numéricos.
- Controles empilhados em telas estreitas e dimensões mínimas para botões; sem alteração nos dados ou cálculos.
- Compilação validada; conferência visual interativa permanece pendente no navegador.

## 0.15.5 — 11/10/2026

- Vida em campo até primeira troca: comparação principal pela média, com cards de mínimo e máximo.
- Tabela visível por modelo/tipo ou cliente com média, extremos, amostra e acesso aos ciclos completos de origem.
- Mediana preservada como informação complementar na ajuda e tabela detalhada; sem mudança nos critérios de vínculo.
- Teste de médias e extremos por grupo, incluindo amostra unitária, observações excluídas e grupos sem troca.

## 0.15.4 — 11/10/2026

- Ajuda alinhada à direita dos títulos também nos blocos internos, incluindo Valores de contrato, widgets e comparação de duração.
- Cabeçalho compartilhado com espaço entre título e ícone, preservando explicações, valores e impressão.

## 0.15.3 — 11/10/2026

- Ajuda dos relatórios principais posicionada no canto superior direito do cabeçalho, com espaço reservado para não sobrepor título e impressão.
- Ícones vetoriais SVG próprios para informação, menu, recolhimento, expansão e fechamento; sem dependência de símbolos da fonte.
- Rótulos acessíveis, interação e textos impressos preservados.

## 0.15.2 — 11/10/2026

- Explicações fixas de cálculo e regras disponíveis em ícones de informação, nos títulos de relatórios e junto às ferramentas.
- Ajuda individual nos oito cards do resumo numérico, sem botões aninhados.
- Balões acionados por clique/teclado, fechamento por clique externo, Escape ou botão e adaptação à área disponível.
- Períodos, bases numéricas, exclusões e avisos dinâmicos mantidos visíveis. Textos de ajuda preservados na impressão/PDF.
- 115 testes aprovados, um ignorado, compilação e conferência da renderização dos componentes.

## 0.15.1 — 11/10/2026

- Logo completa no menu aberto e somente símbolo no menu compacto, sem legenda Suporte Controller.
- Botão de recolhimento ao lado da marca, navegação alinhada ao topo e Importação por último.
- Clique na página selecionada abre/fecha suas opções sem alterar filtros ou relatórios.
- Espaçamentos menores e indicadores discretos de abertura.

## 0.15.0 — 11/10/2026

- Importação conjunta de OS, operacional e CSVs de consumo, com prévia, seleção e validação do lote.
- Menu lateral recolhível; categorias e relatórios aninhados na página selecionada.
- Relatórios principais em blocos abertos e controle de visibilidade por checkboxes.
- Nome Parque e Manutenção, tema por ícone no rodapé e seleção sem sombra.
- Documentação em docs/IMPORTACAO.md e testes de importação em lote.

## 0.14.1 — 11/10/2026

- Menus por categoria no Operacional (Visão geral, Registros, Revisão) e OS x OP (Visão geral, Parque, Manutenção, Valores mensais, Vínculos, Relatórios).
- Categoria selecionada independente em cada página; filtros e escolhas de visibilidade preservados.
- Cards de cobertura na Visão geral, com relatórios exibidos somente na categoria correspondente.
- Relatórios com agrupamento acessível e atalho para ajustar período na categoria Manutenção.
- Formato recolhível preservado; substituição por blocos abertos e painel de checkboxes ainda em discussão.

## 0.14.0 — 11/10/2026

- Indicadores de assistência e intervenções por 100 registros vinculáveis, com cobertura e limitações históricas explícitas.
- Comparações por cliente/modelo/plano/situação, visitas repetidas e trocas, reaproveitando critérios atuais das OS.
- Filtros múltiplos operacionais e período independente das novas análises.
- Relatório XLSX/CSV com seleção das colunas do resumo, critérios e fontes opcionais; contrapartes de trocas rastreáveis.
- Novas seções integradas à personalização, abertura/recolhimento, tabelas ordenáveis e impressão/PDF.
- Documentação e testes de base, filtros, eventos, originais e formatos de exportação.

## Em desenvolvimento — aparência e temas

- Revisão geral de todas as páginas e categorias: regra compartilhada para ações de tabela, filtros, exportações e detalhes; inclui Consumo M2M, histórico, Operacional e equipamentos.
- Consumo com textos longos resumidos em duas linhas e conteúdo completo acessível; anotações com data, situação e texto separados.
- Cards financeiros ajustados ao celular e configurações salvas com ações que se reorganizam sem quebrar palavras.
- Correção das colunas de origem: botões de conferência em uma linha, linhas compactas e rolagem restrita às tabelas.
- Exportações e abertura da tabela de técnicos com espaçamento próprio; seleção de veículo organizada e linha do tempo com eventos neutros e datas em destaque.
- Logo oficial incorporada ao cabeçalho e navegação na ordem Ordens de Serviço, Operacional, Controle de Consumo M2M e OS x OP.
- Temas claro e escuro em todas as páginas, com chave acessível e preferência salva no navegador.
- Cores, tipografia, botões, espaçamentos e alinhamentos harmonizados; layouts conferidos de 320 a 1440 px com dados reais.
- Barras menores e rótulos discretos; consumo mostra operadora/número e cliente, mantendo ICCID completo nos detalhes e exportações.
- Limpar filtros e ícones de abrir/recolher relatórios na mesma faixa das OS.
- Cálculos preservados; conferência de navegação, persistência, registros de origem, SVG e impressão.

## Em desenvolvimento — histórico e investigação de consumo

- Consolidados Arqia/Kore reconhecidos pelos cabeçalhos; dados, SMS e frete separados, com conversão KB para MB e períodos inclusivos preservados.
- Categorias Visão geral, Investigação, Clientes e equipamentos e Histórico e arquivos; filtros no topo, cards, gráficos, tabela paginada e CSV completo.
- Referência ajustável de consumo acima da média da operadora/apuração, incluindo zeros e calculada antes dos filtros.
- Vínculos confirmados por ICCID e MSISDN únicos no mesmo registro operacional; ambiguidades/conflitos acessíveis para revisão.
- Histórico em IndexedDB, versões arquiváveis, reimportação idempotente, backup JSON validado e referência operacional guardada.
- Linha do tempo por chip com MB por dia e anotações; custos de dados/SMS separados de outras despesas. Contratos e saldo de franquia fora do escopo.
- Testes de domínio e conferência no navegador com os arquivos reais, recarga, backup/restauração, exportações e layout móvel.

## Em desenvolvimento — comparação geográfica

- Gráfico único por UF ou cidade, com total de atendimentos e manutenções na mesma escala, respeitando período e filtros.
- Quantidade total, manutenções e participação da manutenção no recorte; comparação também por custo total e despesa de deslocamento.
- Cada barra permite conferir suas linhas de origem. Ranking, tabela completa, CSV, SVG com as duas cores e impressão preservados.
- Manutenções (Assistência Técnica Concluída/Pago) estão incluídas no total; as séries não são somadas. Valores ausentes não viram zero.

## Em desenvolvimento — vida em campo até primeira troca

- Painel por rastreador, coletora/teclado/terminal e RFID com médias, medianas, amostras, distribuição, comparação e acompanhamento pelo mês de instalação.
- Pares de rastreador exigem mesmo chamado, cliente, placa e data, Assistência Técnica realizada e seriais diferentes; reinstalação com par entra como troca.
- Acessórios exigem troca/trocar explícito; instalação inicial precisa de evidência própria.
- Cancelamentos, observações sem troca, ciclos incertos e trocas sem início conhecido ficam separados das estatísticas.
- Seleção por instalação ou retirada/troca consulta o histórico completo; limite padrão na última data realizada do arquivo.
- Ciclos iniciados em uma troca anterior analisados separadamente. CSV, impressão e registros de origem com critérios e limite da análise.
- Datas impossíveis, inclusive serial Excel zero no calendário 1900, são excluídas dos vínculos temporais.

## Em desenvolvimento — organização do dashboard

- Cards de clientes e perfil ampliados: concentração dos cinco primeiros, custos/médias de manutenção, destaque e resumo selecionável por cliente.
- Perfil por tipo com quantidade, participação, custo/média e variação contra período anterior; tipos exclusivos do anterior aparecem com zero atual.
- Conferência das linhas por cliente/tipo; clientes não identificados, custos ausentes e bases das médias explicitados. Cancelamento realizado preservado.

- Composição dos custos ampliada com total/médias dos componentes e valores contratuais de Cliente/Addlog, separados pela coluna Cobrança.
- Contratos usam Valor a cobrar e Concluída/Pago; zeros válidos mantidos, ausências/classificações inválidas explicitadas, médias com bases próprias e conferência das linhas.

- Identidade de central de gestão: fundo #F5F4F1, cards claros, laranja em seleção e ações, azul/verde petróleo nos gráficos.
- Tipografia, alturas, espaçamentos e alinhamentos uniformizados em botões, filtros, tabelas e cards; versão móvel revisada.
- Controles de exportação recolhidos na visão geral; composição de custos adicionada com base de pares válidos explícita.

- Identidade visual aproximada do site Addlog: Inter local, laranja #F59136, coral #F16435, cinza #23303b e superfícies #F3F1ED.
- Navegação clara, marca em texto, gráficos com paleta consistente e cores secundárias para distinguir séries.

- Visão geral integrada: cards de gestão, agenda registrada, colunas empilhadas mensais, equipe em barras agrupadas, manutenção por cliente e rosca de tipos de serviço.
- Comparação de intervalos inclusivos de mesma duração, imediatamente consecutivos, preservando filtros de categoria; base anterior zero não gera percentual.
- Parque operacional integrado como fotografia integral da importação, explicitamente separado do período e dos filtros de OS.
- Sem metas, SLA ou inferência de parque ativo histórico.

- Personalização no topo de todas as categorias de OS e páginas de linhas/operacional, com os filtros de cada fonte reunidos.
- Controles de expandir/recolher com ícones, descrição ao passar o mouse e nomes acessíveis.

- Navegação superior e relatórios de OS separados por categoria; visão geral abre inicialmente.
- Execuções por Resp. Execução, contando linhas Concluída/Pago nos filtros de atendimento.
- Ranking de manutenção por cliente: Assistência Técnica realizada.
- Agendamentos por Resp. Agendamento: linhas Concluída/Pago com nome válido; período por Agendamento, separado da Data de atendimento das execuções.

## 0.13.0 — 04/10/2026

- Duas páginas: importação/revisão operacional e análises Operacional × OS, com dados em memória compartilhados.
- Leitura da aba Equipamentos limitada à tabela A:BY; originais e fórmulas inspecionáveis.
- Revisão de formatos, ausências, cancelamento sem data e repetições; exportação CSV e impressão por seção.
- Vínculo serial + placa com cobertura explícita e exportação; ausência na OS não constitui divergência por limitação histórica.
- Cards de cobertura, gráficos por cliente/modelo/plano/situação e somas de valores mensais lançados, sem cálculo de faturamento.
- Navegação acessível em telas estreitas, quatro testes de regras operacionais e documentação específica.

## 0.12.2 — 04/10/2026

- Botões no topo das OS para abrir ou recolher todas as seções principais de relatórios.
- Personalização de visibilidade, filtros e controles individuais preservados.

## 0.12.1 — 04/10/2026

- Modelos de rastreador classificados pelos sete prefixos de ID aprovados.
- Tempo observado compara por classificação como padrão, preservando comparação pelo Modelo original e cliente.
- Ciclos com prefixo não reconhecido em grupo separado e card, mantendo contagens e durações.
- Relatório descritivo XLSX/CSV atualizado para o mesmo agrupamento; ID e Modelo de origem preservados.

## 0.12.0 — 04/10/2026

- Relatório descritivo selecionável entre as sete análises de OS, seguindo os filtros.
- Uma linha por grupo/indicador, valores, unidades, bases, percentuais e descrição.
- XLSX com números e percentuais tipados: Relatório, Critérios e Atendimentos originais filtrados.
- CSVs separados do resumo e originais; contexto de arquivo/filtros/referência no resumo.
- Prévia de 200 linhas, exportações completas; regras de percentuais não aditivos e ausências explícitas.

## 0.11.0 — 04/10/2026

- Custo por cliente com cards, ranking, medidas contratuais e custo lançado em cobranças Addlog.
- Composição técnico/deslocamento em barras empilhadas por cliente, cidade ou código técnico.
- Visitas por cliente/placa, linha do tempo, mediana de intervalo e retornos cumulativos 30/60/90 dias.
- Chamados com vários realizados: cards, distribuição e custos acumulados.
- Matriz e gráfico de intervenções por cliente, com categorias sobrepostas explicitadas.
- Mediana e distribuição de ciclos encerrados por modelo/cliente; períodos sem retirada separados.
- Evolução mensal de volume, custo, média e participação do deslocamento com bases compatíveis.
- Tabelas com origem, ordenação, CSV e impressão/PDF; sete seções recolhidas e personalizáveis.
- Consumo e conciliação entre planilhas mantidos para fase futura.

## Preparação para GitHub — 04/10/2026

- Git local inicializado na branch main.
- Arquivos operacionais e credenciais excluídos pelo .gitignore.
- Teste da planilha original opcional quando o arquivo estiver ausente, mantendo os testes sintéticos.
- Guia de clone, execução local, commits e atualizações.

## 0.10.0 — 04/10/2026

- Página Linhas - Controle de Consumo no menu lateral, com importação CSV independente.
- Identificadores textuais, MB com precisão de até seis casas e períodos validados.
- Cards de linhas, total, média, maior consumo, zeros e exclusões.
- Filtros múltiplos, busca global, ranking por linha/plano/contrato/tecnologia/empresa, resumo ordenável e CSV.
- Conferência de registros originais e revisão; pares repetidos excluídos dos totais antes dos filtros.
- Tecnologia e contrato ausentes explicitados; nenhuma inferência a partir de IMSI ou plano.
- Dados e filtros das duas páginas mantidos ao alternar o menu, somente durante a sessão.

## 0.9.1 — 04/10/2026

- Período solicitado e datas efetivas da seleção no resumo dos cards, com contagem de datas ausentes/inválidas.
- Atalho Usar registro mais antigo no filtro inicial, baseado em toda a planilha importada.
- Indicação de seleção sem datas válidas e período invertido.

## 0.9.0 — 04/10/2026

- Oito cards com filtros globais, critérios de cálculo e acesso às linhas de origem.
- Barras com nomes completos, valores ao lado e altura por participante; rolagem para listas extensas.
- Rankings com 10 maiores, 20 maiores ou todos; totais e tabelas completos.
- Detalhes secundários e tabela de técnicos recolhidos inicialmente, na mesma tela personalizável.
- Cards preservados na impressão; barras exportadas com nomes em múltiplas linhas.

## 0.8.0 — 04/10/2026

- Conferir linhas abre tabela detalhada no gráfico mensal e nos grupos de relatório.
- Cabeçalhos ordenáveis nas tabelas; atendimentos ordenados antes da paginação. Terceiro clique restaura a ordem padrão.
- Imprimir / Salvar PDF por seção pelo diálogo do navegador, com arquivo, filtros e referência.
- Ranking por código de técnico, nomes, realizados, chamados, custos e médias com denominadores válidos.
- Médias de deslocamento com zeros e média quando cobrado separadas. Valores ausentes não viram zero.
- Manutenção sem troca continua pendente, sem classificação automática.

## 0.7.1 — 03/10/2026

- Cidade nos filtros principais, com seleção múltipla combinada com UF e demais campos.
- Botão Última na tabela de atendimentos, levando à última página dos resultados após filtros e busca.
- Botão desativado quando já estiver na última página ou não houver resultados.

## 0.7.0 — 03/10/2026

- Tela única organizada em seções recolhíveis, todas visíveis por padrão.
- Personalização das seções exibidas, salva neste navegador; resumo de filtros sempre acessível.
- Gráficos interativos com Recharts: barras, linhas, pizza e rosca; tabela mantida.
- Pizza/rosca bloqueadas para chamados distintos, valores negativos e total não positivo.
- Tipo de gráfico incluído nas configurações de relatório; configurações antigas usam barras.
- Exportação SVG do gráfico selecionado e exportação anterior explicitamente identificada como barras.

## 0.6.1 — 03/10/2026

- Início de medição restrito a instalação com Tipo de Serviço = Implementação.
- Períodos sem retirada calculados até referência escolhida; padrão data atual de São Paulo.
- Botão Usar data atual e indicação Sem retirada registrada, sem afirmar ausência de problemas.
- Ciclos encerrados mantêm data real de retirada. Datas anteriores ao início e ciclos ambíguos são excluídos e sinalizados.

## 0.6.0 — 03/10/2026

- Salvamento manual e recuperação de configurações no navegador, com verificação de estrutura de colunas.
- Períodos encerrados observados por serial/placa, com rastreabilidade e revisão de ambiguidades.
- Primeira instalação identificada pelo usuário como Implementação; uso temporal dessa condição ainda em definição.

- Exportação de relatório e histórico em CSV UTF-8 com separador ponto e vírgula, filtros e linhas de origem.
- Exportação do gráfico personalizado em SVG com fonte, elegíveis e exclusões.
- Campos textuais do CSV protegidos contra interpretação como fórmulas; números monetários exportados em reais.
- Tempo sem retirada registrada aguarda definição da data de referência.

## 0.5.1 — 03/10/2026

- Filtros adicionais escolhidos entre as demais colunas importadas.
- Múltiplos valores exibidos e opção Sem dados; nomes repetidos diferenciados pela letra.
- Remoção do filtro limpa sua condição; filtros afetam toda a análise.

## 0.5.0 — 03/10/2026

- Explorador de relatórios com agrupamento, medida e barras/tabela selecionáveis.
- Medidas de realizados, chamados distintos com realizados, custo, deslocamento e valores contratuais Cliente/Addlog.
- Exclusões e linhas de origem por grupo; chamados distintos não são aditivos entre grupos.
- Histórico por placa/serial exato, ordem cronológica e registros sem data ao final.
- Ambas as consultas seguem filtros globais. Tempo observado em campo permanece pendente.
- Documentação e testes atualizados.

## 0.4.0 — 03/10/2026

- Identificação de pares de troca de rastreador e tabela rastreável até as linhas originais.
- Revisão de pares ambíguos, seriais ausentes/iguais e reinstalações.
- Contagem de trocas de acessórios por palavras-chave e gráfico por categoria.
- Opção de teste para exigir palavra troca; padrão desativado.
- Gráfico mensal de trocas de rastreador pela data da instalação substituta.
- Tempo observado em campo permanece pendente das regras de histórico.

## Definições de equipamentos — 03/10/2026 (sem nova versão funcional)

- Documentadas as regras aprovadas para instalação/desinstalação de rastreadores e revisão de reinstalações.
- Documentada a equivalência Coletora/Teclado/Terminal de Jornada e classificação RFID.
- Uma troca de acessório por linha e nomenclatura tempo observado em campo.
- Regras de vínculo e ambiguidades ainda em revisão; nenhum indicador de equipamento foi implementado nesta atualização.

## 0.3.1 — 03/10/2026

- Seleção de vários itens nos filtros de categoria, com caixas de seleção, busca de opções e remoção individual.
- OU entre itens do mesmo campo e E entre campos; nenhuma seleção significa Todos.
- Limpeza individual e geral, sem necessidade de Ctrl para selecionar vários itens.
- Teste de combinação múltipla, ordem original e ausência de duplicação.

## 0.3.0 — 03/10/2026

- Filtros combinados por período de atendimento, status, razão social, técnico, tipo, motivo e UF.
- Indicadores, chamados, revisão e tabela acompanham a seleção; busca textual restrita à tabela.
- Gráfico mensal de realizados (Concluída/Pago), com exclusões por data informadas.
- Datas inicial/final inclusivas, suporte ao calendário Excel 1904 e aviso para período invertido.
- Registros sem data permanecem sem filtro de período; são excluídos quando ele está ativo.
- Testes dos filtros e gráficos e documentação atualizada.

## 0.2.0 — 03/10/2026

- Totais financeiros apenas para Concluída/Pago: custo total, técnico, deslocamento e valores contratuais separados por Cliente/Addlog.
- Conversão de moeda brasileira somente para análise, comparação em centavos e revisão de divergências mantendo o total lançado.
- Contagens de exclusões por medida e testes de cancelamento, agenda, valores ausentes e moeda textual.

- Indicadores de atendimentos realizados, cancelados, chamados com cancelamento e demais status.
- Detalhamento por chamado com contagens independentes e ordem de primeira ocorrência.
- Análise indisponível quando o cabeçalho Status não existe.
- Testes para chamados mistos, status não reconhecido e cabeçalho ausente.
- Documentação atualizada com as definições financeiras aprovadas.

As contagens usam toda a importação e não acompanham a busca textual da tabela.

## 0.1.0 — 03/10/2026

### Implementado

- React com importação manual da aba OS 2025.
- Ordem original, contagens de linhas e chamados distintos.
- Busca, paginação e revisão estrutural de células.
- Dados preservados e processados na memória do navegador.
- Testes de importação e geração da aplicação.

### Documentado

- Produto, conceitos, regras aprovadas e decisões pendentes.
- Custo Total como fonte oficial; divergências para revisão manual.
- Exclusão financeira de Cancelada e contagem por linha e chamado.
- Significados de cobrança, valores contratuais, custos, status e tipo Cancelamento.
- Guia de uso, arquitetura, verificações e manutenção.

Os KPIs, gráficos e relatórios personalizados ainda não foram implementados. Esta entrega de documentação não altera o comportamento do sistema.
