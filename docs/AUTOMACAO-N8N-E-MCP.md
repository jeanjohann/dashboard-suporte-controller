# Automação com n8n e proposta de MCP

## Situação em 18/10/2026

O proprietário solicitou incluir o n8n na fila junto às integrações. O escopo é planejar e homologar sua utilização como coordenador das coletas e automações. Em 18/10/2026 foi instalado um laboratório local via npm no Windows, descrito abaixo. A criação da conta aguarda o proprietário; não foram configuradas credenciais de fontes, IA, MCP ou coleta real.

## Laboratório Windows via npm — instalado em 18/10/2026

- **Versão:** n8n 2.43.7, fixa; Node.js 24.15.0. O requisito do pacote publicado é Node >=24, confirmado antes da instalação.
- **Instalação e dados:** `%LOCALAPPDATA%\Addlog\n8n-lab`, fora do OneDrive e das dependências do dashboard. A subpasta `data` contém os dados persistentes; banco e chave de criptografia devem ser preservados juntos em um futuro backup.
- **Acesso:** `http://localhost:5678`, publicado somente em `127.0.0.1`. Saúde, prontidão do banco e interface responderam HTTP 200; a tela `/setup` de criação da conta foi conferida sem preencher dados.
- **Execução:** processo local em segundo plano, sem serviço do Windows nem inicialização automática no boot. O arquivo `Iniciar-n8n.ps1` fica junto à instalação; verifica o processo registrado para evitar uma segunda inicialização do mesmo laboratório. Fuso de São Paulo, diagnóstico/telemetria desativado e limpeza das execuções após sete dias.
- **Estado inicial:** nenhum fluxo ou fonte real conectado. O proprietário deve criar sua conta diretamente na página local; senhas e chaves não devem ser enviadas pelo chat.
- **Limites:** o n8n Assistant de criação de fluxos não está disponível pela instalação npm; isso é distinto do futuro agente de consultas do sistema. O executor Python não foi configurado. A documentação informa descontinuação da instalação npm a partir da versão 3; esta versão fixa 2.x é um laboratório, não uma decisão de infraestrutura de produção.

A alternativa npm foi adotada após impedimento do hipervisor no Docker/WSL. A investigação de firmware ficou separada; não houve atualização de BIOS, desativação de proteções ou exposição pública do laboratório. O módulo Assistente do dashboard permanece uma prévia sem conexão com este serviço.

Referência: [Instalar via npm](https://docs.n8n.io/deploy/host-n8n/install-options/install-with-npm).

O proprietário aprovou desenvolver o assistente em um módulo separado, oculto enquanto amadurece. A estrutura inicial foi entregue em 0.31.0; MCP, IA, consultas reais e ações continuam pendentes. Os exemplos abaixo são propostas de funcionalidades futuras, não autorização para executar ações sobre as fontes.

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
