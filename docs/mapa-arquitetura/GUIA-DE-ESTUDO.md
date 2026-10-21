# Mapa do sistema — guia de estudo

**Addlog · Dashboard de Suporte | versão local 0.48.0 | referência de base: 9919caf + melhorias locais | levantamento: 21/10/2026**

Este mapa descreve o código do repositório nesse ponto de referência. Configurações privadas e o estado de serviços em execução não foram auditados: uma integração ter implementação não comprova que suas credenciais estejam válidas hoje. O [mapa interativo](index.html) contém o catálogo pesquisável; o [catálogo em Markdown](CATALOGO-DE-ARQUIVOS.md) permite consultar cada arquivo. Os diagramas têm versões SVG para apresentação e fontes Mermaid editáveis em [DIAGRAMAS.md](DIAGRAMAS.md).

Abra `index.html` com um duplo clique: o mapa funciona sem servidor e sem internet. Comece pelo Guia de estudo, passe aos Diagramas e use o Catálogo para investigar um arquivo específico. A aba Apresentar reúne as vistas com notas de fala e impressão. Os botões de abrir o código-fonte dependem de manter o mapa dentro da pasta do projeto; todo o conteúdo explicativo e a busca estão incorporados ao HTML. Para transportar os SVGs e fontes editáveis, conserve a pasta inteira.

## Atualização de 21/10/2026

A arquitetura geral permanece a mesma. O inventário foi regenerado a partir da cópia local: a referência de base é o último commit, acrescida das melhorias em homologação. Isso não comprova publicação no GitHub ou Cloudflare.

- **Meu Dashboard:** DashboardSources recebe fontes autorizadas da sessão; WidgetEditor grava escolhas aprovadas de agrupamento/medida em query; layout valida a configuração; evaluate chama customQuery e entrega resultados ao DashboardWidget. O repositório salva somente configuração, nunca cópias das linhas. Campos financeiros mantêm unidades e denominadores; médias e distintos não são somados entre grupos.
- **Equipamentos:** OrdersReports entrega arquivo original e seleção à MaintenanceMatrix; maintenanceMatrix reaproveita trackerReplacementPairs e trackerModel, preservando as regras existentes. RecordDetails mostra as linhas que sustentam cada célula.
- **Revisão:** OrdersRecordsPanel e OperationalPage usam ReviewPanel. reviewDiagnostics unifica categoria, origem, impacto e orientação, sem alterar a planilha nem os critérios dos cálculos. A exportação passa pelo controle de permissão existente.
- **Limites:** banco compartilhado e assistente n8n não foram alterados. Os diagramas representam fronteiras gerais; o catálogo mostra as dependências detalhadas dos novos arquivos.

## 1. Como explicar o sistema em 90 segundos

O sistema transforma bases de atendimento, equipamentos e consumo em análises com rastreabilidade até os registros de origem. A aplicação principal roda no navegador, em React. Ela lê planilhas, valida e normaliza campos, aplica filtros por categoria e calcula indicadores em funções de domínio. Os gráficos, cards e tabelas apresentam esses resultados sem alterar as planilhas originais.

O Cloudflare entrega a aplicação e hospeda uma API protegida. Essa API autentica o usuário, verifica suas permissões e faz as consultas privadas ao Google Sheets e ao Zoho Desk. O banco D1 em uso guarda o cadastro de usuários e suas permissões; ele não é um banco central de todas as planilhas e históricos de negócio.

Há também um laboratório separado, no computador local. Uma ponte autenticada conecta o sistema ao n8n e ao Gemini. O agente usa ferramentas restritas que calculam resultados sobre fontes autorizadas. Ele explica resultados; os cálculos continuam no sistema. Esse laboratório depende dos serviços locais e não é necessário para abrir os relatórios comuns.

## 2. As três partes da arquitetura

| Parte                     | Onde roda            | Responsabilidade                                                            | Arquivos de entrada                                                                               |
| ------------------------- | -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Aplicação                 | Navegador do usuário | Importação, filtros, análises, visualização, exportação e históricos locais | `index.html`, `src/main.jsx`, `src/app/Workspace.jsx`                                             |
| API protegida             | Cloudflare Worker    | Identidade, autorização, usuários e consultas privadas às integrações       | `server/worker.js`, `wrangler.jsonc`                                                              |
| Laboratório do assistente | Computador Windows   | Acervo autorizado, execução do agente n8n e ferramentas de consulta         | `scripts/local-assistant.mjs`, `scripts/local-acervo.mjs`, `scripts/assistant-agent-workflow.mjs` |

A comunicação entre arquivos de uma mesma aplicação normalmente acontece por importação de módulos e chamada de funções. Entre navegador, Worker, serviços locais e fornecedores, acontece por HTTP. Props e contextos React levam dados e ações entre os componentes. Repositórios isolam a leitura e escrita persistente.

Tecnicamente, é uma aplicação de página única (SPA), organizada por módulos, com uma API de apoio na borda e serviços locais de laboratório. Os módulos de interface integram a mesma aplicação React. O carregamento por partes, ou chunks, é uma estratégia de distribuição do código.

| Termo              | Significado neste projeto                                                          |
| ------------------ | ---------------------------------------------------------------------------------- |
| Domínio            | Funções que aplicam os critérios de cálculo e validação do negócio                 |
| Hook               | Função React que coordena estado, efeitos e ações de uma área                      |
| Props / contexto   | Formas de levar dados e ações entre componentes React                              |
| Adaptador          | Conversão entre uma fonte/tecnologia e o contrato interno do sistema               |
| Repositório        | Interface de leitura e escrita que isola o destino de armazenamento                |
| Snapshot / retrato | Conjunto de dados observado numa coleta, com sua referência e seus limites         |
| Binding            | Ligação configurada entre um Worker e um recurso, como D1 ou outro serviço privado |

## 3. Mapa das pastas

| Pasta ou entrada            | O que contém                                                          | Como participa                                                                              |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/main.jsx`              | Inicialização React e ordem de importação dos estilos                 | Monta tema, acesso e espaço de trabalho                                                     |
| `src/app/`                  | Workspace, navegação, tema, painel lateral e carregamento das páginas | Orquestra a aplicação e conserva as bases da sessão                                         |
| `src/components/`           | Componentes visuais reutilizáveis                                     | Recebem resultados e controles dos módulos; não são o lugar principal das regras de negócio |
| `src/modules/my-dashboard/` | Painéis pessoais, catálogo, análises personalizadas e apresentação    | Recebe fontes autorizadas da sessão; salva configurações por usuário no navegador           |
| `src/modules/orders/`       | Ordens de Serviço, suporte, custos, equipamentos e ciclos             | Principal módulo analítico sobre OS                                                         |
| `src/modules/operational/`  | Cadastro operacional e coordenador das páginas Operacional/Parque     | Importa a fotografia dos equipamentos e organiza os cruzamentos                             |
| `src/modules/park/`         | Análises e histórico do parque                                        | Cruza a fotografia operacional com o histórico de OS                                        |
| `src/modules/logistics/`    | Envios e Devoluções                                                   | Apresenta movimentações dentro de Parque e Manutenção                                       |
| `src/modules/consumption/`  | Consumo M2M, arquivos, apurações e acompanhamento                     | Analisa extratos e conserva histórico local                                                 |
| `src/modules/monitoring/`   | Fila, análises, tratamento e lembretes                                | Separa demonstração da futura telemetria real                                               |
| `src/modules/imports/`      | Importação conjunta                                                   | Reconhece bases, apresenta prévia e aplica somente o lote autorizado                        |
| `src/modules/users/`        | Administração de usuários                                             | Consulta e altera o cadastro por meio da API protegida                                      |
| `src/modules/assistant/`    | Página piloto e cliente da ponte local                                | Envia perguntas autorizadas e apresenta resposta junto aos resultados calculados            |
| `src/shared/data/`          | Filtros, datas, ordenação e contratos de fontes                       | Compartilha regras transversais sem duplicar importadores                                   |
| `src/shared/filters/`       | Seleções por categoria e visões salvas                                | Separa os recortes e persiste somente as configurações escolhidas                           |
| `src/shared/layout/`        | Preferências e agrupamento de relatórios                              | Organiza a apresentação sem criar outra base analítica                                      |
| `src/shared/security/`      | Sessão, cliente de API e regras de permissões                         | Apoia a interface; o servidor também autoriza as operações                                  |
| `src/shared/export/`        | CSV, SVG e contexto de impressão                                      | Mantém filtros, unidades, origem e proteção de textos exportados                            |
| `src/shared/charts/`        | Paletas e representações permitidas                                   | Padroniza gráficos sem alterar os números                                                   |
| `src/shared/persistence/`   | Contratos de documentos e adaptadores de referência                   | Preparação para futura persistência compartilhada; não é um banco central ativo             |
| `src/styles/`               | Estilos globais e ajustes por área                                    | A cascata segue a ordem explícita de `src/main.jsx`                                         |
| `server/`                   | Worker e adaptadores privados de integrações                          | Controla a fronteira entre o navegador e os serviços externos                               |
| `server/persistence/`       | Adaptador D1 de documentos e migração de negócio                      | Preparado, sem binding ou rotas de negócio ativados                                         |
| `migrations/`               | Esquema do cadastro de usuários                                       | Banco D1 atualmente ligado ao Worker                                                        |
| `scripts/`                  | Verificação, relatório de build e laboratório local                   | Ferramentas de desenvolvimento e serviços fora do navegador                                 |
| `public/`                   | Logos, fontes, cabeçalhos e robots                                    | Arquivos estáticos copiados para a distribuição                                             |
| `docs/`                     | Regras, integrações, operação e evolução                              | Documentação; parte dos textos registra etapas históricas                                   |
| Configurações da raiz       | Vite, Wrangler, dependências e padronização                           | Definem compilação, publicação e manutenção                                                 |

Dentro dos módulos, `components/` apresenta a interface; `domain/` calcula e valida regras; `data/` lê fontes ou implementa persistência/transporte; `hooks/` coordena estado e efeitos React; `config/` define categorias e catálogos; `utils/` formata valores. Nem todo módulo precisa de todas essas subpastas. Os testes ficam junto dos arquivos, com sufixo `.test.js` ou `.test.mjs`.

O catálogo lista os arquivos da base e os novos arquivos de aplicação desta rodada, lidos da cópia local. Pastas geradas e dados privados são explicados abaixo, sem enumerar milhares de dependências ou reproduzir o conteúdo das planilhas:

| Pasta local                        | Papel                                                        | Entra no código publicado?                          |
| ---------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `import/`                          | Planilhas e amostras locais; o nome real no disco é singular | Não; ignorada pelo Git                              |
| `node_modules/`                    | Dependências instaladas                                      | Não; o build inclui apenas o necessário             |
| `dist/`                            | Resultado gerado pelo Vite                                   | É a distribuição de arquivos estáticos, não a fonte |
| `.wrangler/`, `.worker-build/`     | Estado e artefatos locais das ferramentas Cloudflare         | Não são a fonte da aplicação                        |
| `layout-review/`, `outputs/`       | Evidências de revisão e artefatos locais de trabalho         | Não fazem parte da arquitetura de execução          |
| `.git/`                            | Histórico e metadados de versionamento                       | Não é servido ao usuário                            |
| Instalação n8n fora do repositório | Runtime, workflows e credenciais locais                      | Não vai dentro do bundle React                      |

## 4. Inicialização e navegação

1. O navegador abre `index.html`, que carrega `src/main.jsx`.
2. `ThemeProvider` aplica o tema. `AccessProvider` obtém a sessão e as permissões na API em ambiente gerenciado.
3. `Workspace` mantém as bases de OS, Operacional e Logística da sessão e recebe atualizações de importação.
4. `Navigation` apresenta os destinos autorizados. `DeferredPage` carrega o código da página na primeira visita e mantém sua instância enquanto autorizada, com exceções explícitas como Usuários.
5. Cada página conecta controles, hooks, regras de domínio e componentes. Alterações locais de filtros recalculam o recorte correspondente.

O menu não corresponde exatamente às pastas: Parque e Manutenção usa o coordenador `OperationalPage` com outra identificação de página; `park/` fornece os cálculos e painéis. Logística fica dentro desse contexto. A Equipe de suporte e seus dados Zoho ficam no módulo de OS, não em uma aplicação isolada.

## 5. Fluxo de uma planilha até o gráfico

**Arquivo → importador → base normalizada → seleção da categoria → domínio → componente → origem/exportação.**

O importador identifica a aba e os cabeçalhos, interpreta tipos e preserva células e números de linha. Ausência, ambiguidade e inconsistência viram informações de revisão; não devem ser corrigidas silenciosamente nem convertidas automaticamente em zero. Filtros escolhem registros e o domínio produz totais, grupos, séries e referências de origem. A apresentação permite conferir os registros que sustentam os valores.

No Google Sheets, a entrada muda: o Worker obtém um retrato da aba autorizada, o navegador valida o contrato e o adaptador reaproveita o mesmo importador da planilha. Assim não há duas fórmulas concorrentes para o mesmo indicador. Uma falha de atualização conserva a base anterior.

### Exemplo concreto: volume de atendimentos da OS

Leia nesta ordem: `orders/data/import.js` → `orders/hooks/useOrdersSession.js` → `shared/data/filters.js` → `orders/domain/dashboard.js` e `analysis.js` → `orders/components/OverviewKpis.jsx` → `RecordDetails.jsx`.

Uma linha representa um registro de atendimento/intervenção; um chamado pode ter várias linhas. Realizados usam Concluída/Pago. Efetivos excluem o motivo explícito Visita Improdutiva; os custos dessas visitas continuam na análise financeira aplicável. Isso explica por que contagem de linhas, chamados distintos e intervenções efetivas podem divergir.

## 6. Módulos e suas comunicações

### Meu Dashboard

DashboardSources compartilha fontes autorizadas da sessão. MyDashboardPage coordena edição, arraste, filtros, composição e apresentação; useDashboards e dashboardRepository guardam a configuração local com validação e revisão concorrente. evaluate reutiliza regras dos módulos. Para análises personalizadas, customQuery agrupa campos aprovados e apura medidas, denominadores e linhas de origem. Não executa fórmulas arbitrárias nem grava linhas das fontes no documento salvo.

### Ordens de Serviço

`OrdersPage` coordena a categoria, a apresentação e os provedores. `useOrdersSession` conecta a base recebida do Workspace aos filtros, referência temporal e análises. `OrdersReports` distribui relatórios; `DashboardOverview` reúne a síntese e pode incorporar análises das categorias na mesma tela. Os arquivos de `domain/` separam custos, contratos, suporte, trocas, vida observada, rankings e revisão.

A base de clientes identifica a filial pelo CNPJ completo da coluna C da OS. A consolidação analítica reúne razões sociais idênticas ou o agrupamento explícito do cadastro; não altera a identidade original usada nos vínculos. Trocas de rastreador são eventos, não a soma das duas linhas. Duração exige conseguir identificar a direção e a data. Acessórios usam troca explícita e a categoria correspondente; a troca anterior da mesma categoria inicia o ciclo seguinte.

### Operacional, Parque e Logística

`OperationalPage` recebe Operacional e OS do Workspace, oferece a fotografia cadastral e usa `parkAnalysis`/`parkHistory` para os cruzamentos. O modelo derivado pelo prefixo do serial é apresentado sem sobrescrever o valor original da planilha. A última intervenção considera serviço efetivo e uma referência ajustável, inicialmente ligada ao histórico disponível.

O parque mostra a cobertura que o arquivo e os vínculos permitem observar. Ele não reconstrói automaticamente o estoque histórico nem prova que um equipamento sem OS vinculada nunca recebeu manutenção. A Logística lê Envios/Devoluções e mantém cada linha como movimentação. Recebimento em Envios significa entrega ao destinatário. Consertos está fora dessa leitura; uma movimentação não equivale a uma unidade de estoque.

### Controle de Consumo M2M

`LinesPage` coordena importação, apurações, filtros e acompanhamento. `lineConsumption.js` normaliza volumes, períodos e identificadores, controla versões e vincula a referência operacional. `historyRepository` isola o IndexedDB. Os hooks só substituem o histórico apresentado após confirmação da gravação.

O acompanhamento usa operadora + ICCID. Anotações e arquivos permanecem no navegador, com backup explícito. Uma fotografia operacional atual não comprova a titularidade de uma linha em períodos passados. Os destaques de aumento comparam MB/dia do mesmo chip/operadora com uma apuração anterior elegível e não sobreposta; não somam períodos sobrepostos como se fossem um único intervalo.

### Monitoramento Ativo

`MonitoringPage` separa a fila da análise. `useMonitoringSource` distingue demonstração e leitura real. O cliente só consulta a API da própria origem. O contrato exige um retrato íntegro e datas com fuso; a classificação ocorre no domínio.

A rota real está preparada, mas o binding do coletor não está configurado no código de implantação. Sem ele, há indisponibilidade explícita, sem substituir a falha por dados fictícios. O estado de acompanhamento é administrativo: encerrar um tratamento não significa que o veículo voltou a comunicar. Os tratamentos ficam na sessão; os lembretes têm persistência local e revisões. A checagem de lembretes na página não é um serviço de notificações em segundo plano.

### Importação e Usuários

`bulkImport.js` identifica bases e monta a prévia. `ImportPage` permite escolher o lote. O Workspace revalida permissões e confirma a persistência do consumo antes de aplicar as demais bases da sessão. `UsersPage` administra usuários pela API; liberar alguém na política de login do Cloudflare continua sendo uma configuração distinta do cadastro interno.

### Assistente experimental

O navegador solicita uma autorização efêmera ao Worker e faz a chamada para a ponte fixa em `127.0.0.1:5681`. `local-assistant.mjs` valida origem, identidade e limites; lê o acervo autorizado pela função `readArchive` e executa o workflow `labAssistantAgent01` pelo CLI do n8n local.

O workflow associa AI Agent, modelo Gemini e ferramenta `consultar_acervo`. A ferramenta volta à ponte local para executar cálculos determinísticos. A pergunta e os resultados permitidos entram no contexto do modelo. Os números apresentados nos cards são os resultados do sistema; a resposta textual é uma interpretação a conferir. Cada pergunta é independente, sem memória de conversa.

O perfil fictício habilita consultas parametrizadas às amostras de OS e Operacional: atendimentos, custos, trocas e parque, com limites de detalhes. O perfil real mantém o recorte legado restrito. Consumo, Zoho, Logística e telemetria não se tornam consultáveis pelo agente só por existirem em outros módulos. O serviço opcional de acervo na porta 5680 atende fluxos anteriores; a ponte atual pode chamar a leitura diretamente. O editor n8n normalmente fica na porta 5678. Não há um servidor MCP genérico implementado nesta versão.

## 7. Onde os dados ficam

| Informação                                                          | Destino atual                          | Consequência prática                                                                 |
| ------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| OS, Operacional e Logística carregadas                              | Memória da sessão React                | Reabrir a aplicação exige recarregar a fonte; não viram automaticamente registros D1 |
| Retrato Google e coleta Zoho apresentados                           | Memória da sessão                      | Não há histórico central de todas as coletas                                         |
| Filtros por categoria                                               | Estado da sessão                       | Navegar conserva os recortes; outra categoria tem seu próprio estado                 |
| Visões salvas, tema e preferências visuais                          | localStorage                           | Locais ao navegador; favoritos guardam configurações, não cópias das planilhas       |
| Histórico de consumo, versões, notas e referência operacional salva | IndexedDB                              | Persistência local, com backup; não sincroniza entre computadores                    |
| Lembretes do Monitoramento                                          | IndexedDB                              | Locais, separados por usuário/modo; não são um agendador remoto                      |
| Tratamentos manuais do Monitoramento                                | Memória da sessão                      | Não equivalem ao histórico persistente dos lembretes                                 |
| Usuários, funções e permissões                                      | Cloudflare D1, binding `USERS_DB`      | Compartilhados e validados no servidor                                               |
| Credenciais de Google/Zoho                                          | Segredos/configuração do Worker        | Não entram nas planilhas nem no bundle React                                         |
| Credencial do modelo e workflows n8n                                | Instalação local do n8n                | Separados do repositório e do cadastro D1                                            |
| Planilhas do laboratório                                            | Pasta local `import/`, lista permitida | A pergunta não escolhe caminhos livres no computador                                 |
| Documentos de negócio compartilhados                                | Contrato e adaptador preparados        | Sem banco/binding/rotas ativos; não anunciar sincronização pronta                    |

## 8. API e segurança

O Worker verifica a assinatura, emissor, audiência e validade do JWT do Cloudflare Access, procura o usuário no D1 e verifica se está ativo. Um e-mail em cabeçalho isolado não basta. A interface oculta ações sem permissão, mas o servidor também verifica as operações recebidas. Escritas sensíveis validam origem, formato e revisão quando aplicável.

| Rota                                               | Uso                                | Autorização no desenho atual                                           |
| -------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `GET /api/me`                                      | Sessão e permissões                | Identidade válida e usuário aceito                                     |
| `GET/PUT /api/admin/users`                         | Cadastro de usuários               | Administrador; validações adicionais na escrita                        |
| `GET /api/orders/google/status` e `/snapshot`      | Conexão e leitura OS               | Administrador                                                          |
| `GET /api/operational/google/status` e `/snapshot` | Conexão e leitura Operacional      | Administrador                                                          |
| `GET /api/zoho/status`, `/snapshot`, `/activity`   | Piloto Zoho                        | Administrador proprietário                                             |
| `GET /api/monitoring/snapshot`                     | Retrato do coletor                 | Administrador ou permissão de Monitoramento; depende do binding futuro |
| `POST /api/assistant/local-session`                | Autorização efêmera do laboratório | Administrador proprietário e origem validada                           |

Google usa uma fonte fixa no servidor; o cliente não fornece uma URL arbitrária para consultar. Zoho mantém OAuth e tokens no Worker. A coleta de atividade só é entregue ao front após concluir suas páginas; falhas ou cancelamento não apresentam um lote truncado como completo. A ponte local do assistente valida novamente a autorização e não expõe execução livre de SQL, código, rede ou arquivos ao agente.

O código não substitui a configuração externa da política Access, dos segredos, do D1 e dos fornecedores. Não há chaves ou identificadores privados reproduzidos neste material.

## 9. Integrações: o que existe e o que está preparado

| Integração                           | Implementação no repositório                                   | Limite para a apresentação                                                                               |
| ------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Planilhas Excel/CSV                  | Importadores e análises em uso                                 | Validade depende dos campos e do histórico disponível                                                    |
| Google Sheets OS/Operacional         | Leitura privada, contratos e reaproveitamento dos importadores | Consulta autorizada da fonte configurada; sem histórico automático no D1                                 |
| Zoho Desk                            | Leitura privada de agentes/tickets e atividade por período     | Tickets respondidos confirmados, apontamentos e pendências de conferência têm bases próprias             |
| Permanência/presença de agentes Zoho | Documentação e preparação analítica                            | Arquivo/histórico de disponibilidade ainda depende de validação; não inferir jornada pelo tempo apontado |
| Monitoramento de veículos            | Contrato, rota e interface                                     | Coletor privado/binding ainda não ativado                                                                |
| KORE/ARQIA                           | Fila/documentação e preparação de coexistência de fontes       | Não há adaptadores de produção dessas operadoras no código atual                                         |
| n8n + Gemini                         | Laboratório local, AI Agent e ferramenta restrita              | Depende do computador e das credenciais; não é um backend central de IA hospedado                        |
| MCP                                  | Proposta documentada                                           | Não há endpoint MCP genérico entregue                                                                    |
| Banco central de negócio             | Contratos e adaptador D1 preparados                            | `USERS_DB` continua dedicado ao acesso; persistência de negócio ainda não ativada                        |

No Zoho, tempo apontado é duração registrada numa atividade, com autoria/data próprias. Primeira resposta e resolução descrevem o ciclo do ticket; nenhum desses números, sozinho, mede o tempo de permanência do agente. Confirmados e parcelas a conferir devem continuar identificados.

## 10. Bibliotecas, build e publicação

| Tecnologia                   | Função no sistema                                        |
| ---------------------------- | -------------------------------------------------------- |
| React 19                     | Componentes, estado, hooks e contextos                   |
| Recharts                     | Gráficos sobre séries já calculadas                      |
| SheetJS (`xlsx`)             | Leitura e escrita de planilhas                           |
| Vite 6                       | Desenvolvimento e compilação dos arquivos estáticos      |
| Cloudflare Worker / Wrangler | API na borda e implantação da aplicação                  |
| Cloudflare Access / `jose`   | Autenticação e validação criptográfica do JWT            |
| D1                           | Cadastro de acesso; adaptador de negócio futuro separado |
| Node.js e seu test runner    | Scripts, serviços locais e testes                        |
| Prettier                     | Padronização do código e documentação                    |

O fluxo de entrega é fonte → conferência de imports/formatação/testes → build Vite → relatório de tamanho → implantação com Wrangler. O Vite gera `dist/` e divide dependências e páginas para reduzir o carregamento inicial. O Worker serve os arquivos estáticos e intercepta `/api/*`. Um build ou um teste aprovado não comprova que as credenciais externas e todos os serviços locais estejam operacionais.

Os testes ficam junto dos módulos: cobrem regras de cálculo, normalização, permissões, persistência e contratos. O catálogo identifica os arquivos de teste da cópia local descrita no cabeçalho. O mapa de imports usa o parser de JavaScript/JSX do Rollup e considera caminhos literais estáticos e dinâmicos; não inclui referências por `url()` do CSS, atributos HTML ou caminhos construídos em execução. Também não é um grafo completo de chamadas de função, props, eventos e rotas HTTP. Esses fluxos são explicados pelos diagramas e por este guia.

## 11. Onde ler e onde alterar

| Se a dúvida ou mudança for…                 | Comece por…                                                                | Confira também…                                            |
| ------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Menu, troca de página ou base compartilhada | `src/app/Workspace.jsx`, `Navigation.jsx`                                  | Permissões e `DeferredPage`                                |
| Nome de aba/cabeçalho OS                    | `orders/data/import.js`                                                    | Testes e adaptador Google                                  |
| Cálculo de indicador                        | `domain/` do módulo                                                        | Origem, denominadores, exportação e teste correspondente   |
| Identidade/consolidação de clientes         | `customerRegistry.js`, `customerIdentity.js`                               | Vínculos de equipamentos devem preservar a filial original |
| Trocas e duração em campo                   | `trackerReplacements.js`, `equipment.js`, `fieldLife.js`, `lifecycle.js`   | Datas, direção do evento e ciclos abertos                  |
| Filtro independente ou favorito             | `shared/filters/`, hook da página                                          | Catálogo da categoria e compatibilidade da fonte           |
| Ordem/visibilidade de relatórios            | `shared/layout/` e `config/reportStories.js`                               | `Section`, preferências e impressão                        |
| Cor, densidade ou gráfico                   | `src/styles/`, `shared/charts/`, `components/Chart.jsx`                    | Ordem CSS e tema claro/escuro                              |
| Persistência do consumo                     | `historyRepository.js`, `consumptionHistory.js`                            | Hooks, backup e confirmação da transação                   |
| Zoho                                        | `server/zohoActivity.js`, `shared/data/zohoActivity.js`, `ZohoSession.jsx` | Autoria, período, paginação e parcelas a conferir          |
| Permissão ou integração privada             | `server/worker.js`, `shared/security/`                                     | Configuração externa Access e segredos                     |
| Pergunta/ferramenta do agente               | `scripts/assistant-agent-workflow.mjs`, `assistant-demo-queries.mjs`       | Ponte local, perfil do acervo e limites da interface       |

## 12. Roteiro de apresentação de 10 minutos

1. **1 minuto — problema e resultado.** Explique as fontes de dados e a rastreabilidade até a linha da planilha.
2. **2 minutos — arquitetura.** Mostre o diagrama geral: navegador, Worker e laboratório local. Distinga código, dados e integrações.
3. **2 minutos — caminho de uma informação.** Use o diagrama de leitura e o exemplo de atendimentos. Mostre um card e sua origem.
4. **2 minutos — módulos.** Explique os vínculos OS → Parque e Operacional → Consumo; apresente suporte/Zoho sem somar métricas incompatíveis.
5. **1 minuto — armazenamento e segurança.** Mostre a diferença entre sessão, armazenamento local e D1; explique que as credenciais ficam fora do navegador.
6. **1 minuto — assistente.** Mostre a ferramenta restrita, os cálculos locais e o perfil fictício; explique a dependência dos serviços locais.
7. **1 minuto — evolução.** Aponte coletor de Monitoramento, presença Zoho, operadoras e banco compartilhado como próximos passos com limites claros.

### Perguntas que podem aparecer

**“Todos usam a mesma base salva?”** Não automaticamente. O D1 compartilha o acesso; bases de sessão e históricos locais têm escopos diferentes. Google pode oferecer a mesma origem autorizada, mas isso não cria um histórico central de todas as operações.

**“A IA calcula os números?”** Os cálculos são feitos pelas funções do sistema e retornados pela ferramenta. O modelo interpreta o resultado e pode errar a explicação; os cards e referências ajudam a conferir.

**“A vida útil é definitiva?”** Não. O sistema mede ciclos e tempo observado conforme os eventos disponíveis. Ciclos abertos, trocas confirmadas e durações comprováveis precisam ser separados.

**“O Monitoramento já consulta a frota real?”** A interface e o contrato estão preparados; o binding do coletor não está ligado na configuração do repositório. A demonstração é identificada.

**“Um arquivo sem importadores está morto?”** Não é possível afirmar só por esse mapa. Pode ser um script invocado diretamente, uma entrada de configuração, teste, documentação ou referência histórica. O catálogo mostra a ausência de referência estática sem concluir que o arquivo pode ser removido.

## 13. Como manter este mapa

O catálogo e os diagramas desta entrega são gerados por `scripts/architecture/build-map.mjs`, com conteúdo visual em `scripts/architecture/diagrams.mjs` e o modelo de página em `scripts/architecture/map-template.html`. O levantamento lê a cópia local, com referência explícita ao commit de base e hashes dos arquivos; alterações ainda não publicadas estão incluídas. Atualizações futuras devem trocar a referência, revisar os estados das integrações e confirmar as descrições contra o código.

O comando `node scripts/architecture/build-map.mjs`, após instalar as dependências do projeto, gera inventário, catálogo, HTML, JSON canônico e SVGs. As fontes Mermaid e `DIAGRAMAS.md` são exportadas desse JSON pelo utilitário `mermaid_tool.py` da habilidade mermaid-diagrams. Sua validação é estática; os SVGs têm composição própria a partir dos mesmos nós e relações e foram conferidos visualmente. Não se trata de uma renderização nativa Mermaid. Ao mudar um diagrama, atualize ambas as representações e preserve os arquivos de evidência indicados no mapa.

O inventário registra caminhos, funções exportadas, imports locais, dependências externas e arquivos que importam cada módulo. Não inclui conteúdo de credenciais, planilhas privadas, bancos locais, `node_modules/`, resultados de build ou capturas de trabalho. Os arquivos criados para documentar o mapa ficam listados separadamente da base original, evitando contagem recursiva dos próprios artefatos.
