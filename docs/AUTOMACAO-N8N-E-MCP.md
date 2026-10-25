# Automação com n8n e proposta de MCP

Para definições comuns de medidas, entidades, granularidade, fontes e limites, consulte o [modelo semântico analítico](MODELO-SEMANTICO-ANALITICO.md). Para escolha de gráficos e acessibilidade, consulte o [padrão de visualização analítica](PADRAO-DE-VISUALIZACAO-ANALITICA.md). O agente deve usar esses contratos como referência, sem inferir medidas ou filtros que as ferramentas não forneçam.

## Situação atual — piloto local de MCP

O agente usa o perfil local definido em `import/assistant-source.json`: `{"profile":"demo"}` seleciona exclusivamente `DEMO-Ordens-de-Servico-1000.xlsx` e `DEMO-Operacional-1000.xlsx`. Cada arquivo tem 1.000 linhas de dados fictícios. O agente não disponibiliza as ferramentas ampliadas com perfil real, configuração ausente ou inválida. Não há descoberta automática de arquivos nem escolha de caminhos pelo modelo.

O fluxo `labAssistantAgent01` usa o nó MCP Client Tool e as três ferramentas do servidor local: `addlog_consultar_atendimentos`, `addlog_consultar_trocas` e `addlog_consultar_parque`. Cada chamada é encaminhada à sessão ativa da página, que recalcula o resultado usando o mesmo snapshot já capturado. As planilhas completas não são enviadas ao Gemini; o modelo recebe o catálogo sintético e os resultados solicitados, com até 20 detalhes ou grupos.

- **Atendimentos realizados:** totais, efetivos, improdutivos, chamados distintos, custos em reais, ranking e detalhes. Filtros por período, responsável de execução ou agendamento, cliente consolidado e placa. Ranking ordenável por visitas totais, efetivos, improdutivas ou custo, antes de aplicar o limite de exibição.
- **Trocas:** eventos de rastreador, RFID e coletora, ranking por placa/cliente/responsável e detalhes. Estatísticas desde implementação e desde a troca anterior, somente para ciclos encerrados e separadas por categoria.
- **Parque:** fotografia operacional, ativos/cancelados, modelos inferidos pelo serial e equipamentos sem OS efetiva vinculada na amostra. Filtro por cliente, placa e situação. Não aceita período de OS ou responsável. Ausência de histórico na amostra não comprova ausência de manutenção.

Os períodos disponíveis são último mês com realizados, semana atual, semana calendário anterior, últimos sete dias, intervalo personalizado e total. Todos os relativos usam a última data realizada do arquivo (19/10/2026 nestas amostras), informada como referência, para testes reproduzíveis. Semanas começam na segunda-feira. Datas inválidas, campos desconhecidos, responsáveis/clientes ambíguos e combinações incompatíveis são recusados. Totais consideram todo o recorte, mesmo quando detalhes ou ranking estão truncados.

Cada pergunta captura uma única leitura das duas bases. Até duas chamadas permitidas usam esse mesmo snapshot. A tela mostra cada consulta com seus filtros, cards, ranking, detalhes, fontes e limites. Erros de parâmetros não criam cards de sucesso. O contexto é descartado ao final. A autenticação e as restrições de loopback continuam iguais às descritas abaixo.

O backup do fluxo salvo deve ser criado antes de importar uma atualização com o mesmo ID. O CLI faz upsert desse conteúdo e mantém o fluxo inativo; confirme os nós MCP e as credenciais referenciadas antes do teste. Os arquivos de amostra, configurações locais e cópias do fluxo não entram no Git.

Consultas ainda limitadas: sem memória entre perguntas, sem livre execução de consultas/código, sem Zoho, M2M, logística ou monitoramento neste acervo. Agenda pendente ainda não está implementada. O modelo deve explicar essas limitações, não tratar outro recorte como equivalente.

### Histórico do piloto anterior — 0.33.x

**Correção em 19/10/2026 — 0.33.1:** uma consulta reproduziu timeout; o diagnóstico direto do modelo `gemini-flash-latest` retornou HTTP 503 `UNAVAILABLE`, informando alta demanda. A autenticação respondeu HTTP 200. O agente atual foi alterado para `models/gemini-3.5-flash-lite`, com a mesma credencial, e a consulta real foi validada novamente. Não houve ativação de cobrança. Referências: [indisponibilidade e retentativas do Gemini](https://ai.google.dev/gemini-api/docs/troubleshooting) e [modelo Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).

A página oferece “Abrir fluxo atual do agente no n8n”, apontando para `labAssistantAgent01`. Esse fluxo substitui o uso de `labAssistantLive01` pelo sistema; os fluxos antigos não foram sobrescritos e continuam disponíveis para consulta. A resposta da ponte agora identifica categorias de falha, sem enviar diagnósticos brutos ao navegador. O arquivo local `assistant-last-error.json` registra apenas horário e código. O leitor do stdout aceita mensagens posteriores ao JSON da execução, sem incluí-las na resposta do usuário. Timeouts continuam limitados a dois minutos; indisponibilidade do provedor não é garantia de recuperação automática.

**Histórico 0.33.0:** primeira versão do campo de perguntas ligado ao nó AI Agent com Gemini e ferramenta HTTP `consultar_atendimentos`. Essa arquitetura foi substituída pelo MCP local nesta etapa.

## Usar o Assistente no sistema — piloto MCP

1. Inicie o n8n local e, no computador com a pasta `import/`, execute `powershell -ExecutionPolicy Bypass -File .\scripts\start-assistant-lab.ps1`. O inicializador sobe o leitor (5680), a ponte (5681) e o MCP (5682), todos em `127.0.0.1`.
2. Entre no sistema publicado com o administrador principal e abra `#assistente-laboratorio`. A página de desenvolvimento em localhost não recebe uma sessão Cloudflare Access válida.
3. Digite uma pergunta ou escolha uma sugestão e clique em **Enviar pergunta**. O texto digitado é enviado ao Gemini: evite inserir dados sensíveis. Se o navegador solicitar acesso à rede local, a permissão é necessária para o site conversar com este computador. Outros computadores não usam o acervo desta máquina.
4. Aguarde até dois minutos. Confira a resposta e as ferramentas utilizadas. A página mostra cards estruturados, fonte e critérios quando a chamada MCP foi concluída. Cada pergunta é independente: repita o contexto necessário, pois não há memória de conversa.

### Caminho e limites do piloto

**Página autenticada → sessão do proprietário → ponte local → AI Agent no n8n + Gemini → MCP local → consulta determinística na mesma sessão → resposta na página.** Não há túnel ou endpoint público do n8n. A ponte executa o workflow fixo pelo CLI e mantém apenas uma pergunta ativa por vez. Este mecanismo é de laboratório, não infraestrutura multiusuário.

O Worker verifica sessão e cadastro ativo, exige proprietário + administrador + POST da mesma origem em `/api/assistant/local-session`. A asserção assinada do Cloudflare Access retorna somente a essa sessão e permanece na memória do navegador, sendo enviada exclusivamente para `http://127.0.0.1:5681`. A ponte valida assinatura RS256, emissor, audiência, expiração e e-mail fixo do administrador principal; não aceita um e-mail ou papel declarado pelo navegador. Não encaminha a asserção ao n8n, Gemini ou logs. O proprietário não pode ser suspenso/rebaixado no cadastro atual; para revogar este piloto, encerre a ponte e revogue a sessão Access. Não distribua essa integração como permissão geral para outros administradores.

A ponte confere origem/Host e aceita somente JSON com `question`, entre 3 e 1.000 caracteres, com corpo máximo de 8 KB. Rejeita campos adicionais e limita perguntas consecutivas a pelo menos 15 segundos. O texto é tratado como pergunta, nunca interpolado em comandos, URLs ou caminhos. As instruções fixas do agente ficam em `scripts/assistant-agent-workflow.mjs`, no campo System Message do nó AI Agent. Nenhuma edição desse campo é oferecida ao usuário da página.

Os endpoints internos `/v1/assistant/input` e `/v1/assistant/tool?consulta=atendimentos` exigem o token local do acervo, recusam Origin de navegador e só funcionam enquanto há uma pergunta em execução. O endpoint de ferramenta retorna o mesmo snapshot para a chamada MCP e a página. Não há entrada para caminhos ou código; schemas estritos limitam filtros, períodos, agrupamentos e detalhes. São permitidas no máximo duas chamadas por pergunta, e sessões MCP inativas expiram em cinco minutos. O contexto é descartado em sucesso ou erro. JWT Access e credenciais não entram no contexto ou no prompt. As planilhas não são alteradas.

O fluxo atual é `labAssistantAgent01`, gerado por `scripts/assistant-agent-workflow.mjs`. Conecta Gemini ao AI Agent 3.1 e ao MCP Client Tool, que descobre somente as três ferramentas fictícias. O agente consulta as ferramentas antes de afirmar números; respostas sem chamada ficam identificadas e não geram indicadores. Falhas do n8n/provedor não viram zeros ou respostas fictícias. Confira sempre fonte e totais. Custos e limites do Gemini se aplicam; cada pergunta pode originar até duas chamadas.

Os fluxos `labAssistantLive01` (consulta fixa anterior) e `labGeminiDemo01` (fictício) permanecem no n8n para histórico. Executar o agente manualmente sem uma pergunta ativa na ponte resulta em erro de contexto; para testar, use a página do sistema. A retenção local do n8n agora inclui também perguntas e respostas. MCP e armazenamento compartilhado não foram adicionados.

Para encerrar a ponte, confira PID/horário em `%LOCALAPPDATA%\Addlog\n8n-lab\assistant-process.json` e interrompa somente o processo registrado. Logs `assistant.log` e `assistant-error.log` não registram requisições nem respostas analíticas. Histórico de execução do n8n contém totais reais e segue a retenção local configurada. Inicialização automática no boot e serviço de produção não foram criados.

O proprietário solicitou incluir o n8n na fila junto às integrações. O escopo é planejar e homologar sua utilização como coordenador das coletas e automações. Em 18/10/2026 foi instalado um laboratório local via npm no Windows, descrito abaixo. O proprietário concluiu o cadastro da conta; um fluxo manual fictício foi importado e executado com sucesso. A credencial Gemini e as consultas reais locais foram adicionadas nas etapas seguintes. Integrações de fontes externas e MCP continuam pendentes.

## Laboratório Windows via npm — instalado em 18/10/2026

- **Versão:** n8n 2.43.7, fixa; Node.js 24.15.0. O requisito do pacote publicado é Node >=24, confirmado antes da instalação.
- **Instalação e dados:** `%LOCALAPPDATA%\Addlog\n8n-lab`, fora do OneDrive e das dependências do dashboard. A subpasta `data` contém os dados persistentes; banco e chave de criptografia devem ser preservados juntos em um futuro backup.
- **Acesso:** `http://localhost:5678`, publicado somente em `127.0.0.1`. Saúde, prontidão do banco e interface responderam HTTP 200; a tela `/setup` de criação da conta foi conferida sem preencher dados.
- **Execução:** processo local em segundo plano, sem serviço do Windows nem inicialização automática no boot. O arquivo `Iniciar-n8n.ps1` fica junto à instalação; verifica o processo registrado para evitar uma segunda inicialização do mesmo laboratório. Fuso de São Paulo, diagnóstico/telemetria desativado e limpeza das execuções após sete dias.
- **Conta e primeiro teste:** cadastro concluído pelo proprietário. O fluxo inativo `LAB · Primeiro teste de monitoramento (dados fictícios)` contém gatilho manual e cálculo JavaScript de três veículos de demonstração, com referência fixa de 18/10/2026. Foi executado com sucesso: os registros têm 0, 3 e 6 dias completos sem comunicação. Não acessa fontes externas nem dados reais. O modelo de IA e seu provedor ainda dependem de definição; senhas e chaves devem ser cadastradas diretamente no n8n, sem envio pelo chat.
- **Limites:** o n8n Assistant de criação de fluxos não está disponível pela instalação npm; isso é distinto do futuro agente de consultas do sistema. O executor Python não foi configurado. A documentação informa descontinuação da instalação npm a partir da versão 3; esta versão fixa 2.x é um laboratório, não uma decisão de infraestrutura de produção.

A alternativa npm foi adotada após impedimento do hipervisor no Docker/WSL. A investigação de firmware ficou separada; não houve atualização de BIOS, desativação de proteções ou exposição pública do laboratório. O módulo Assistente foi conectado ao piloto local na versão 0.32.0, conforme descrito acima.

Referência: [Instalar via npm](https://docs.n8n.io/deploy/host-n8n/install-options/install-with-npm).

## Acervo local — primeiro fluxo de consulta

### Gemini — conexão homologada com dados fictícios

Em 18/10/2026, a credencial `googlePalmApi` cadastrada pelo proprietário foi vinculada ao fluxo manual [LAB · Gemini · Consulta fictícia de atendimentos](http://localhost:5678/workflow/labGeminiDemo01). O fluxo foi importado e executado com sucesso. Usa Basic LLM Chain com Google Gemini Chat Model (`models/gemini-flash-latest`); o alias pode mudar de versão no provedor. O gerador sem credenciais está em `scripts/gemini-demo-workflow.mjs`; a referência à credencial é preenchida somente no laboratório local, sem exportar a chave.

O exemplo fixa 20 realizados, 18 efetivos, 2 improdutivos e 15 chamados distintos em maio/2026, com última data em 08/05. A resposta foi conferida: preservou os números, identificou demonstração, fonte, período, exclusão por data e mês incompleto. Isso homologa apenas essa conexão e esse exemplo; não é validação geral das respostas do modelo.

O fluxo não lê arquivos e não chama o serviço do acervo. A pergunta e os dados são fixos no nó “Explicar indicadores fictícios”, podendo ser conferidos antes de executar. Não há agendamento, ferramentas autônomas, chat ou conexão ao Assistente do dashboard. O próximo passo é preparar o recorte mínimo e definir quais dados reais poderão ser enviados ao Gemini, considerando as condições do projeto gratuito. As consultas reais locais permanecem no fluxo separado abaixo. Não exporte credenciais nem compartilhe capturas de seus campos preenchidos.

Referências: [Google Gemini Chat Model no n8n](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgooglegemini) e [modelos Gemini](https://ai.google.dev/gemini-api/docs/models).

O acervo inicial aprovado é a pasta **`import/`**, nome que já existe no projeto (referida na conversa como “imports”). A seleção é explícita: `Ordens de Serviços 2025_26.xlsx`, `Operacional 08-05-2026.xlsx` e `Envios_Recebimentos.xlsx`. A OS legada e outros anexos não entram automaticamente. Renomear ou substituir uma fonte por outro nome exige atualizar `sources` em `scripts/local-acervo.mjs`.

O serviço reaproveita os três leitores do dashboard. Lê novamente os arquivos a cada consulta, identifica alterações durante a leitura e retorna manifesto com nome, abas, atualização, SHA-256, registros e apontamentos. Não corrige nem salva planilhas. Apontamentos de revisão continuam visíveis; a base não é apresentada como saneada. A aba Consertos permanece fora da logística.

A primeira ferramenta calcula o último mês com **Concluída/Pago e Data de atendimento válida**, aplicando `applyFilters` e `periodMetrics`, os mesmos serviços do painel. Retorna realizados, efetivos, improdutivos, chamados distintos, linhas Excel e chamados que sustentam a contagem, além da quantidade de realizados sem data válida no acervo. O mês mais recente pode estar incompleto: não representa necessariamente um mês fechado. Agendamentos futuros não determinam esse recorte. As outras quatro perguntas do roteiro ainda não estão implementadas.

### Executar e conferir

1. Inicie o n8n pelo inicializador já instalado em `%LOCALAPPDATA%\Addlog\n8n-lab`.
2. Inicie o acervo com `powershell -ExecutionPolicy Bypass -File .\scripts\start-local-acervo.ps1` a partir da pasta do projeto. O serviço roda em segundo plano; não tem inicialização automática no Windows.
3. Abra [LAB · Acervo local · Volume de atendimentos](http://localhost:5678/workflow/labAcervoLocal01) e execute manualmente.
4. Confira a saída do segundo nó: `manifest` contém a origem e `attendance` contém período, indicadores, critérios e evidências. Para comparar no dashboard, importe a mesma OS e selecione exatamente o início/fim retornados, sem outros filtros.

O serviço escuta somente `127.0.0.1:5680`, aceita apenas `GET /v1/acervo/atendimentos`, exige token e rejeita chamadas com Origin de navegador. Não é uma API de produção nem uma autorização por usuário do dashboard. O token fica no runtime local `acervo-token.txt` e na credencial **LAB · Acervo local (somente leitura)** do n8n; não deve ser publicado ou compartilhado. O fluxo referencia a credencial, sem incluir o token nos parâmetros. Banco, token e logs devem ser protegidos pelo acesso à conta Windows. As execuções do n8n agora contêm resultados reais do acervo e seguem a retenção local de sete dias.

O script `node scripts/local-acervo.mjs` permite diagnosticar a leitura sem n8n, imprimindo o resultado no terminal; evite redirecioná-lo para arquivos versionados. Os logs do serviço e seu PID ficam no runtime local (`acervo.log`, `acervo-error.log`, `acervo-process.json`). Para encerrar, confira o PID e seu horário de início antes de interromper somente esse processo. Se a porta estiver ocupada ou uma fonte falhar, a consulta falha explicitamente, sem entregar um resultado vazio como sucesso.

Não há modelo de IA, MCP, automação agendada ou conexão com o Assistente do dashboard nesta etapa. O fluxo é um teste manual local de leitura real.

O proprietário aprovou desenvolver o assistente em um módulo separado, oculto enquanto amadurece. A estrutura inicial foi entregue em 0.31.0; a primeira consulta local com IA foi conectada em 0.32.0. MCP e ações de escrita continuam pendentes. Os exemplos abaixo são propostas de funcionalidades futuras, não autorização para executar ações sobre as fontes.

## Página experimental — 0.31.0

**Assistente de suporte** fica fora do menu, da busca de navegação e das permissões distribuíveis aos usuários comuns. Para conferir a prévia, entre como administrador ativo e abra o sistema com o fragmento `#assistente-laboratorio`: [abrir laboratório](https://dashboard-suporte-controller.jean-johann.workers.dev/#assistente-laboratorio).

A página possui sugestões por assunto, campo de pergunta e indicação de desenvolvimento. Clicar em uma sugestão preenche o rascunho; o botão de consulta permanece desabilitado. Não recebe planilhas, não acessa dados do navegador, não possui endpoints de consulta e não envia conteúdo a serviços externos. O texto permanece na memória ao navegar, sendo descartado ao recarregar/sair da sessão. O botão Voltar ao sistema remove o fragmento do endereço.

Desde 0.31.1, administradores também podem abrir a página pelo botão com ícone de laboratório ao lado do seletor de tema, no rodapé da barra lateral. O atalho continua disponível com o menu recolhido e não é exibido para usuários comuns. O módulo permanece fora da lista principal de páginas.

O módulo e seu CSS são carregados somente na primeira abertura autorizada. O acesso é conferido antes de montar a página e também no componente. O fragmento é apenas o endereço; não concede permissão. Usuários comuns permanecem nas páginas autorizadas, sem carregar o módulo experimental. A autenticação do sistema permanece obrigatória.

Arquivos em `src/modules/assistant/`; entrada explícita coordenada pelo Workspace. Para consultas reais, a autorização precisará existir também no serviço de servidor que vier a ser implementado. A barreira atual protege uma prévia visual, sem ferramentas ou acesso a dados.

## Automação das integrações — A18

Fluxo proposto: **fontes externas → n8n → entrada autenticada do sistema → armazenamento autorizado → painéis**.

- Monitoramento: consultas periódicas, paginação por base e encaminhamento das observações de comunicação.
- KORE/Saitro e Arqia: consultas de linhas/consumo, após confirmar a API correspondente às contas.
- Zoho Desk: comunicação e apontamentos conforme os recursos autorizados; presença depende de fonte de sessões validada.
- Google Sheets: leitura conectada, quando fizer sentido coordená-la no n8n. O piloto direto de OS já preparado continua válido; migração depende de benefício e paridade comprovados.
- Falhas e avisos: registrar cobertura e atualização, preservar a última base completa e, após definir canais/regras, encaminhar notificações sem repetir o mesmo episódio em toda coleta.

Proposta de piloto: uma base de Monitoramento, com comparação dos dados recebidos e do painel. Frequência depende dos limites da API; uma coleta pode envolver várias requisições. Homologar identificação, fuso, paginação, repetição, falhas parciais e recuperação antes de ampliar.

As regras de manutenção, custos, vida em campo e consumo continuam centralizadas no sistema. n8n deve consultar serviços analíticos ou encaminhar dados normalizados, evitando manter fórmulas diferentes dos painéis. O armazenamento operacional e seus históricos não devem depender apenas do histórico de execuções do n8n.

## MCP — A18-MCP, em avaliação

MCP permite que um cliente de IA descubra e chame ferramentas disponibilizadas por um servidor. O n8n oferece tanto acesso MCP à instância quanto o nó MCP Server Trigger para disponibilizar ferramentas de um fluxo específico; pode também consumir ferramentas externas com MCP Client Tool.

Para uma função voltada aos usuários do painel, propõe-se um conjunto restrito de ferramentas de consulta, em vez de acesso administrativo aos fluxos da instância.

| Pedido do usuário                                             | Ferramenta de consulta proposta                          | Base necessária                                          |
| ------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| Quais veículos desta base estão há mais de três dias offline? | Consultar fila por base, duração e acompanhamento        | Coleta real de rastreamento e última atualização válidas |
| Quais linhas ultrapassaram o limite de consumo no período?    | Consultar linhas e consumo normalizado                   | CSV/operadora, período, unidade e cobertura conhecidos   |
| Resuma os atendimentos de um responsável na semana passada    | Consultar indicadores do suporte e suas origens          | Base de OS; dados Zoho apenas quando integrados          |
| Mostre as trocas de uma placa ou cliente                      | Consultar eventos confirmados e critérios de agrupamento | Histórico de OS com identidades e eventos validados      |
| Monte uma relação para conferir esses casos                   | Preparar relatório dos registros retornados              | Exportação autorizada e contexto reproduzível            |

Possível experiência dentro do sistema: um pequeno assistente de consulta com resposta, dados estruturados e atalho para abrir a tabela filtrada ou o relatório correspondente. Isso exige interface, integração com um modelo de IA e um serviço que valide as chamadas; habilitar MCP no n8n não cria esse chat automaticamente. Provedor, custos e tratamento dos dados ainda serão definidos.

Fluxo proposto: **usuário autenticado → assistente no sistema → ferramentas autorizadas via MCP → serviços analíticos → resposta com origem e recorte**. A chamada deve transportar a identidade verificada pelo servidor; nomes de usuário/base escritos no pedido não concedem acesso.

## Dependências de dados e acesso

- As ferramentas devem respeitar os módulos, bases e ações concedidos ao usuário. A credencial técnica do n8n não substitui a autorização do sistema.
- Planilhas e anotações existentes somente na sessão do navegador ou no IndexedDB não ficam disponíveis a um servidor MCP automaticamente. Será necessário definir uma fonte acessível ao servidor ou um envio explícito e autorizado do recorte necessário.
- Toda resposta analítica deve indicar fonte, período, atualização, critérios e registros de origem; ausência, falha e coleta parcial não são zero. A IA deve usar resultados calculados pelos mesmos serviços do painel.
- A primeira etapa proposta é somente consulta. Registro de observações, alterações de acompanhamento, abertura de chamados ou envio de mensagens são uma etapa posterior, com permissões, confirmação da ação e auditoria a definir.
- Compatibilidade depende da versão/edição instalada e do cliente MCP escolhido. Recursos de administração dos fluxos devem permanecer separados das ferramentas oferecidas aos usuários do produto.

## Sequência sugerida

1. Definir infraestrutura e homologar a primeira integração de leitura no n8n.
2. Disponibilizar dados e consultas do sistema por serviços autenticados, com persistência e acesso definidos.
3. Validar uma ferramenta de consulta com entradas limitadas e resultados rastreáveis.
4. Avaliar cliente de IA e protótipo de assistente, inicialmente com dados fictícios e depois com recorte autorizado.
5. Decidir sobre expansão e ações de escrita separadamente.

## Documentação oficial consultada

- [Hospedar n8n](https://docs.n8n.io/deploy/host-n8n)
- [MCP da instância e diferenças em relação ao MCP Server Trigger](https://docs.n8n.io/connect/connect-to-n8n-mcp-server.md)
- [MCP Server Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger)
- [MCP Client Tool](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp)

Fila principal: [Implementação e ajustes](PROXIMOS-AJUSTES.md). Integrações: [Monitoramento](INTEGRACAO-MONITORAMENTO.md), [operadoras](INTEGRACAO-OPERADORAS.md), [Zoho](MAPA-DE-ATIVIDADES-DO-SUPORTE.md) e [Google Sheets](GOOGLE-SHEETS.md).
