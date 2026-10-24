# Fila de implementação e ajustes

## Refatoração de apresentação e Dashboard 0.68.0 — 24/10/2026

Rodada autorizada após levantamento: vínculos paginados, impressão/auditoria sob demanda, pausa de atualizações em páginas/seções inativas, atividade explícita do Monitoramento, assinaturas por fonte, cache limitado de consultas e cruzamentos do Dashboard e gestos agrupados por quadro. Estados, regras e fontes preservados; sem exclusões ou migrações. [Entrega, medições e limites](REFATORACAO-068.md).

Próximas frentes: revisão e limpeza com comprovação de desuso; persistência adicional no D1; homologação dos indicadores com semana real; CSV Session Zoho; confirmação do ciclo KORE; endpoint de chip/consumo do Monitoramento. Refatoração adicional de memória/importação/virtualização depende de novas medições, não de uma troca geral de bibliotecas.

## Avisos, consumo e refatoração inicial 0.67.0 — 24/10/2026

Implementados avisos internos dos atrasos/retornos já salvos, histórico paginado, vistos locais e acesso ao veículo. Cobertura de prefixo/ICCID/MSISDN visível na fotografia recebida. KORE com comparação API × CSV por ciclo explícito; confirmação do período pela operadora ainda pendente. Franquia compartilhada cadastrável por operadora, grupo, ciclo e ICCIDs, com cobertura, excesso observado e backup isolado. Arqia permanece manual. Histórico local protegido contra abas antigas e gravações concorrentes.

Primeira rodada de refatoração autorizada: cálculos de OS e cruzamentos do Operacional reaproveitados; busca OS com cache por base. Comparação local em navegador e benchmark sintético executados, com limites explícitos. [Uso, regras, medições e dependências](AVISOS-FRANQUIAS-E-REVISAO.md).

Próximas frentes restantes: validar ciclo KORE com extrato real; obter endpoint de consumo do monitoramento, se disponível; tempo conectado Zoho aguardando CSV Session; ampliar persistência no D1 para consumo/Zoho/painéis; continuar revisão de páginas inativas, grades e Dashboard; auditar candidatos antes de qualquer exclusão. Nenhum arquivo do usuário foi apagado e nenhum canal externo foi ativado.

## Claro e Escuro 0.66.2 — 24/10/2026

Correção da interpretação: Claro e Escuro permanecem como opções próprias, além de Grafite e Lima, Azul e Âmbar, Noite e Bruma Azul. Claro usa off-white neutro, texto grafite e botões cinza-escuro; Escuro usa cinza profundo com destaques menta, azul e violeta. Preferência atual preservada; IDs light/dark novamente válidos, sem migração para outras paletas. Contraste dos tokens conferidos: Claro com mínimo de 4,88:1 no texto e 3,56:1 nos gráficos; Escuro com 6,34:1 e 6,42:1. Mesma limitação de revisão visual interativa do ambiente.

## Temas 0.66.1 — 24/10/2026

Rodada autorizada e implementada: somente Grafite e Lima, Azul e Âmbar, Noite e Bruma Azul. Bruma Azul e Azul e Âmbar usam off-white; Grafite e Lima e Noite usam cinza escuro com destaques luminosos moderados. Seletor compacto e migração de preferências antigas. [Paletas, migração e limites de validação](TEMAS-0661.md). Sem alterações de dados ou permissões.

## Regras, consumo e layout 0.66.0 — 24/10/2026

Implementados os ajustes aprovados: fechados pelo status atual e último autor, catálogo de categorias zeradas, espera por agente, conferência de cadastro em sete campos, equivalências explícitas, diagnósticos contextualizados e consumo organizado por operadora. Indicadores Suporte compacto, com regras na ajuda e detalhes recolhidos. Contagem por linha e improdutivas separadas preservadas. [Entrega, uso e limitações](REGRAS-E-CONSUMO-066.md); [inventário por indicador](MATRIZ-DE-REGRAS-E-REVISAO.md).

479 testes aprovados, um previamente ignorado, imports e build conferidos. Homologação visual interativa e comparação autenticada com relatórios reais ainda pendentes: navegador automatizado desabilitado neste ambiente. Prefixo/ICCID/MSISDN dependem de campos explícitos no payload real. Tempo conectado Zoho segue aguardando CSV Session. Faturamento esperado/pró-rata fora da fila ativa. Temas permanecem na próxima rodada, conforme pedido acima.

## Indicadores Suporte 0.65.0 — 24/10/2026

Regra de improdutivas alinhada entre totais e linhas de conferência. Acrescenta carteira atual de pendências atribuídas por agente, independente do período, e categorias por agente com detalhe paginado dos chamados fechados. CSV mantém todos os detalhes. Sem mudança de permissões, credenciais ou gravações no D1. A conferência de fechamentos continua exigindo histórico válido do Zoho; não substitui autoria por responsável atual. [Uso, limites e critérios](INDICADORES-SUPORTE.md).

Imports, formatação, 469 testes e compilação aprovados após incorporar as correções remotas de histórico Zoho e alinhamento das tabelas, com um teste previamente ignorado. Carteira, paginação, limites, cancelamento, autoria e categorias conferidos com dados fictícios. Não houve consulta autenticada à carteira real nesta rodada; homologação com os relatórios do proprietário permanece pendente. Mapa de arquitetura regenerado com os novos arquivos.

## Progresso central 0.64.2 — 23/10/2026

Aviso das bases movido para modal compacto central, com progresso, fechamento sem cancelar a transferência e nova tentativa após erro. Publicação autorizada pelo proprietário, que também autorizou publicar futuros ajustes de pequeno impacto após validação, sem pedir confirmação a cada ajuste.

## Temas 0.64.1 — 23/10/2026

Bruma Azul e Jardim adicionados ao seletor, com fundos neutros, gráficos em tons derivados e contraste conferido nos principais pares de texto/fundo. Verificação de imports, formatação, testes e build aprovados. Publicação autorizada pelo proprietário. O levantamento de refatoração abaixo permanece como planejamento, sem mudanças funcionais de desempenho ou exclusões nesta rodada.

## Levantamento futuro de refatoração — 23/10/2026

Solicitado levantamento, sem iniciar refatoração ou exclusões. [Diagnóstico inicial, prioridades e protocolo de medição](PLANO-DE-REFATORACAO-E-DESEMPENHO.md). Ordem sugerida: medir travamentos no navegador; reduzir recálculos de OS/Operacional; controlar páginas e gráficos inativos; limitar grades extensas; isolar atualizações do Meu Dashboard; avaliar processamento fora da interface; dividir componentes e estilos; auditar arquivos e documentação antes de remover. Benchmark sintético de 1.800 veículos executado, com limites registrados no diagnóstico. Ainda não há causa dos travamentos comprovada nem lista de arquivos descartáveis validada.

## Menu e permissões 0.64.0 — 23/10/2026

Publicada no GitHub (`1ea3091`) e Cloudflare, com 462 testes aprovados e revisão autenticada da tela. Remove expansões das páginas sem submenu e torna o Meu Dashboard uma permissão independente das bases. A tela administrativa lista também ferramentas novas e as regras de acesso das integrações em piloto. Cadastros anteriores preservam acesso até edição explícita. Migração `0002_dashboard_access.sql` aplicada após backup privado, com preservação dos cadastros e permissões conferida; nenhuma concessão real foi alterada na validação.

## Zoho nos indicadores 0.63.0 — 23/10/2026

Publicada no GitHub (`96a3210`) e Cloudflare, versão ativa `6bb3c56e-5ab0-46a0-a19a-124b08d9eb36` com 100% do tráfego. 460 testes aprovados. Diagnóstico real confirmou abertura por Contact/Email e por Agent/source nulo, além de categorias compatíveis com a planilha. O proprietário definiu os assuntos pelos chamados fechados por agente. Consulta ampliada agrega aberturas confirmadas e categoria atual dos fechados; manuais preservados e não somados. A consulta real identificou divergência entre data de fechamento e histórico; a página mantém fechamentos e assuntos indisponíveis nesse caso, sem impedir as métricas com evidências independentes. Conferir chamados indicados com relatório do proprietário. Tempo conectado continua aguardando CSV Session.

## Indicadores Suporte 0.62.0 — 23/10/2026

Publicada no GitHub (`2a1d303`) e Cloudflare, com 454 testes aprovados. Página própria no menu, com filtros independentes, fontes OS/Zoho e lançamentos manuais diários por agente no D1 do piloto. Cards, evolução diária, assuntos, tipos, clientes, metas opcionais, configuração de seções e exportação. Acesso autenticado confirmou o módulo, a OS salva, a leitura do banco e o formulário habilitado. [Critérios, uso e validação](INDICADORES-SUPORTE.md).

Próxima conferência: comparar uma semana real com as fontes e validar o preenchimento manual. Chamados criados pelo próprio suporte e assuntos ficam manuais até conferir a autoria e correspondência das categorias da API. Tempo nesta página significa apontamento nos chamados; a pendência de sessões para tempo conectado continua separada.

## Correção de abertura 0.61.0 — 22/10/2026

Incluída também a exclusão de lembretes/agendamentos solicitada durante a rodada: confirmação, ocultação da agenda, auditoria interna e revisão crescente entre ciclos. [Critérios e uso](EXCLUSAO-DE-LEMBRETES.md).
Relato de um minuto de espera levou à revisão da leitura. Bases agora são transferidas em paralelo, por uma resposta contínua para cada fonte, com progresso e integridade. Redução de 81 para quatro requisições no cenário remoto verificado. Publicada no GitHub (`2a13b29`) e Cloudflare, com 445 testes aprovados. Arquivos reais preservados no ensaio local. Tempo autenticado após publicação ainda requer conferência. [Diagnóstico e limites](BASES-SALVAS-E-COLETA.md).

## Permanência e refinamento 0.60.0 — 22/10/2026

O proprietário confirmou tempo conectado dos agentes como prioridade; CSV Session real ainda precisa ser exportado. Versão publicada no GitHub (`d1aeab2`) e no Cloudflare, com 438 testes aprovados. Leitura local ampliada com filtro/ranking por agente, evolução diária, sessões e revisão exportáveis. Botão Adicionar indicador redimensionado e contraste corrigido também no Salvar painel. [Entrega e validação pendente](PERMANENCIA-ZOHO-E-REFINAMENTO.md). Não houve criação de fonte automática de sessões nem persistência da presença no banco.

## Evolução 0.59.0 — 22/10/2026

Bases completas de OS/Operacional/Logística e coleta do Monitoramento publicadas no banco do piloto. Cinco versões por planilha; fotografias de 30 dias; cron 9h, 12h, 15h e 18h de São Paulo. Backup e migração SQL conferidos, com lembrete real preservado. GitHub main `0072c8c`, Worker ativo `91c2c185-6d5f-47d7-b67c-3d341a3c52a7`, 434 testes aprovados e compilação concluída. Primeiro uso autenticado das bases e primeira execução real ainda precisam ser conferidos. O proprietário já validou a agenda 0.58.0 entre navegadores. [Escopo, testes e limitações](BASES-SALVAS-E-COLETA.md).

Próximas etapas: homologar primeiro envio e coleta reais, acompanhar espaço e limites do Worker, definir acesso de outros usuários e depois avaliar persistência de consumo/Zoho/KORE e painéis. Histórico de comunicação não equivale a consumo da linha; sessões Zoho continuam aguardando fonte validada. Não há notificação automática nesta entrega.

## Fila atual — 22/10/2026, após a versão 0.58.0

**Rodada 0.58.0 publicada em 22/10/2026:** proprietário escolheu D1 e autorizou piloto exclusivo do administrador principal. Banco `dashboard-suporte-negocio` criado, separado dos acessos, e primeira migração aplicada. Agenda remota ativada no piloto do proprietário, com migração local explícita e backup manual. Código `9034a2a`, bindings separados e acesso owner confirmados. Homologação da interface e migração dos dados reais pelo proprietário ainda pendentes. [Estado, acesso e limites](BANCO-CLOUDFLARE.md). A escolha de hospedagem foi resolvida; adaptação das demais fontes e coleta agendada continuam como próximas entregas.

**Revisão visual 0.54.1 publicada em 22/10/2026:** cards neutros na conferência API × Operacional, busca mais ampla, controles responsivos, tabela com colunas proporcionais e cabeçalhos compartilhados alinhados. Seletor de temas reduzido aos nomes em 12 px. Conferidos os temas Sálvia e Areia/Noite Azul, seleção dos cards, busca e layout em 390 px com 1.800 veículos fictícios. Importações, formatação, 398 testes e compilação aprovados; um teste previsto ignorado. Publicada com autorização específica no GitHub (main, código `50fde55`) e no Cloudflare (versão `d883a578-c522-4777-8841-1aed3b7ff209`). Seletor compacto e arquivo `/assets/index-BUeTyRHt.js` conferidos na produção, preservando a preferência Escuro. A conferência com dados foi validada na amostra local; nenhuma coleta real foi disparada na verificação de publicação.

**Rodada 0.54.0 publicada em 22/10/2026:** cinco novas paletas solicitadas durante a publicação: Sálvia e Areia, Lagoa, Azul e Âmbar, Noite Azul e Lima Elétrica. Mantém os temas anteriores e os critérios dos indicadores. Publicação autorizada e concluída no GitHub (main, código `32ba6a8`) e no Cloudflare (versão `ba31a774-75e3-4b3c-9d81-82f6544cd1a5`). As oito opções do seletor foram conferidas no sistema publicado; a preferência Escuro permaneceu selecionada.

**Rodada 0.53.0 publicada em 22/10/2026:** fila do Monitoramento priorizada, filtros e lembretes compactos, alinhamento, indicadores e períodos de 30/60/90 dias, exportação junto da grade e conferência API × Operacional. [Critérios e limites](MONITORAMENTO-TRABALHO-E-CADASTROS.md). Consumo/linha não estão documentados no contrato integrado; posições não foram convertidas para MB. Código `8e3542b` no GitHub; Cloudflare confirmou a publicação.

Este bloco é a referência atual de prioridades. As seções seguintes preservam registros históricos e podem citar pendências já concluídas. A inclusão de sugestões não representa implementação ou publicação.

**Rodada 0.52.0 publicada em 21/10/2026:** A21–A24 nas tabelas por base/modelo do Monitoramento, A26 com amostra fictícia de 1.800 veículos, comparação de séries personalizadas compatíveis e piloto local de CSV Session do Zoho. Coletor e eventos de atraso/retorno têm contrato e testes, mas permanecem desconectados da execução. [Entrega, critérios e dependências](LAYOUT-E-CONSULTAS-052.md). Publicação no GitHub e Cloudflare conferida em 22/10/2026; não foi ativado armazenamento ou agendamento. A25 e auditoria visual adicional nas demais páginas permanecem evoluções futuras.

**Já disponíveis:** API manual do diagnóstico legado Addlog no Monitoramento (funcionamento informado pelo proprietário), telemetria de alimentação/bateria, posições por base, inventário e filtro de modelos, temas e mapa compartilhado; análises personalizadas de OS/Operacional e revisão comum da 0.48.0. Demais sistemas de rastreamento não estão abrangidos automaticamente.

### Próxima rodada visual proposta

| Código | Ajuste                                                                 | Resultado esperado                                                                                                                                                                                                                                                     | Ordem sugerida          |
| ------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| A21    | Alinhamento das grades do Monitoramento e auditoria nas demais páginas | Cabeçalhos e valores no mesmo eixo; nomes à esquerda, números/percentuais à direita, ações alinhadas; células com valor e texto auxiliar seguem o mesmo padrão; ordenação usa o valor principal, sem confundir ausência com zero                                       | 1                       |
| A22    | Dimensionamento e hierarquia das seções                                | Cards com alturas e espaçamentos coerentes; seções compactas sem altura mínima excessiva; tabelas com espaço definido pelo conteúdo, gráficos com altura suficiente; conferências próximas ao bloco de origem e responsividade nos temas existentes                    | 2                       |
| A23    | Colunas essenciais e detalhes técnicos                                 | Proposta: seletor de colunas por tabela; identificação, volume e percentual prioritários; alimentação/bateria/posições acessíveis na visão completa ou detalhe; cabeçalhos fixos em tabelas longas e primeira coluna fixa quando útil e sem colisões em telas pequenas | 3                       |
| A24    | Clareza de cobertura, estados e seleção                                | Diferenciar valor principal de cobertura; comunicar “sem leitura”, zero e informação antiga; suavizar seleção/hover e manter foco de teclado visível; usar estados já calculados, sem inferir novos defeitos                                                           | 4                       |
| A25    | Leitura comparativa por modelo/base                                    | Priorizar quantidade e percentual com denominador visível; proposta de alternância entre tabela e gráfico de percentual onde houver ganho; preservar cobertura e evitar apresentar volume bruto como qualidade do equipamento                                          | Depois da rodada básica |
| A26    | Desempenho visual com frota real                                       | Medir renderização e interação com até 1.800 veículos; aproveitar paginação existente e avaliar renderização sob demanda dos blocos pesados; manter ordenação do conjunto, navegação por teclado e exportação completa                                                 | Medir antes de ampliar  |

Evidência inicial do print e do código: SortableTable identifica automaticamente células numéricas simples ou com data-sort numérico; as células de falha externa, bateria baixa e posições da tabela por modelo combinam valor e texto auxiliar sem a mesma marcação. Os cabeçalhos também precisam acompanhar o alinhamento semântico dos valores. O tratamento compacto do botão de ordenação está hoje restrito à fila de acompanhamento. A21 deve conferir as tabelas por modelo e base antes de aplicar ajustes compartilhados.

Critério de conclusão da rodada: conferir tabelas por base/modelo, abertura dos detalhes, estados vazio/zero/ausente, ordenação, impressão, larguras de tela e temas Claro/Escuro/Grafite e Lima. A proposta visual não muda totais, cobertura, regras, integrações ou dados.

### Demais demandas abertas

| Tema                                   | Próximo passo / situação                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Meu Dashboard                          | Comparações personalizadas compatíveis preparadas em 0.52.0; salvamento compartilhado depende do banco. Análises personalizadas simples, composição de indicadores, arraste e apresentação já existem                                                                                                                                                        |
| Banco e hospedagem (A10/A13/A14)       | **D1 escolhido e banco de negócio criado em 22/10/2026**, separado dos acessos. Migração SQL e backup/restauração inicial conferidos. Agenda do proprietário publicada na 0.58.0 após autorização específica. Conferência na interface e migração real ainda pendentes. Demais fontes, migração real, retenção de coletas e agendamento continuam pendentes. |
| Monitoramento (A12–A14)                | Leitura real manual disponível para o legado integrado. Confirmar cobertura e fuso de geração; coleta periódica, histórico de comunicação, recuperação, notificações e permissões por base permanecem separados da leitura manual                                                                                                                            |
| Zoho                                   | Piloto local de CSV Session preparado em 0.52.0; receber e validar arquivo real, fuso e totais no escritório. API automática de sessões ainda sem fonte homologada. Fechamentos e tempo apontado já existem e não equivalem a jornada                                                                                                                        |
| KORE / Arqia (A15)                     | KORE: piloto manual 0.55.0, bytes/BRT confirmados; validar servidor e período acumulado. Arqia aguarda documentação e acesso                                                                                                                                                                                                                                 |
| n8n / assistente (A18)                 | Aprofundamento e avaliação das consultas adiados pelo proprietário para quando puder estudar o n8n. Laboratório AI Agent/Gemini e consultas fictícias já existem; MCP genérico e automação de produção não estão concluídos                                                                                                                                  |
| Regras e cruzamentos (A08/A09/A11/A16) | Definir competência/pró-rata, chamados mistos, franquias e titularidade histórica; integração da logística com OS/parque depende dos vínculos e regras. Consertos permanece fora do escopo                                                                                                                                                                   |
| Limpeza geral do repositório           | **Adiada pelo proprietário.** Não excluir arquivos com base apenas na ausência de importador; retomar inventário e análise de uso em rodada própria                                                                                                                                                                                                          |

## Histórico de entregas e registros anteriores

## Rodada 0.48.0 — preparada em 21/10/2026

Análises personalizadas de OS/Operacional no Meu Dashboard, matriz modelo × motivo e revisões com diagnóstico comum. [Critérios e limites](REVISAO-E-ANALISES-LIVRES.md). Comparações de séries personalizadas, persistência compartilhada no banco e aprofundamento do agente n8n continuam para etapas posteriores. A configuração do banco não substitui políticas de backup e migração dos históricos locais.

Primeira rodada de evolução do **Meu Dashboard entregue em 0.45.0**: arraste/redimensionamento, modo Organizar com desfazer, duplicação, backup de configurações e apresentação/tela cheia/impressão. Segunda rodada preparada em **0.46.0**: conteúdo adaptável, colunas/linhas/rosca conforme o indicador, ampliação e tabela completa, composição de até quatro indicadores no mesmo card, comparação de duas séries compatíveis, seções/modelos, central de fontes e recorte opcional do painel. Publicação/homologação descritas na entrega. [Uso e limites](MEU-DASHBOARD.md).

## A20 — Identidade e temas: implementado em 0.47.0

Solicitado e autorizado pelo proprietário em **20/10/2026**. [Rodada visual e validação](REFINAMENTO-VISUAL.md):

- Restaurar a logo branca antiga preservada em `import/Logo branca horizontal.svg`, conferindo contraste nos dois temas e estados do menu.
- Renovar a escala do tema claro para uma aparência mais agradável e moderna, com liberdade para sair da paleta original Addlog.
- Dar mais destaque às cores no tema escuro, mantendo legibilidade de textos, gráficos, botões e estados.
- Menu, cards, tabelas, gráficos, foco/seleção e cores de impressão conferidos nos dois temas; sem alteração dos cálculos e critérios dos módulos.

## A19 — Meu Dashboard: primeira entrega concluída

Incluído pelo proprietário em **20/10/2026**, com importância estratégica. **Entregue em 0.44.0**: página própria, catálogo com 55 indicadores dos sete grupos de fontes, cartões/gráficos/tabelas, filtros por bloco, tamanhos e reordenação. Até 12 painéis por usuário, salvos neste navegador com proteção de revisão concorrente. [Funcionamento e limites](MEU-DASHBOARD.md).

O escopo solicitado e sua evolução permanecem registrados abaixo. Sincronização/compartilhamento com o futuro banco e gráficos livres por campos/medidas/agrupamentos são as próximas etapas deste recurso.

- Selecionar indicadores e exibi-los como cards, gráficos ou tabelas; reorganizar os blocos e ajustar seus tamanhos.
- Configurar títulos, filtros e períodos, preservando fonte, cobertura e última atualização de cada bloco.
- Salvar diferentes dashboards por usuário, como Gestão, Suporte e Consumo. Primeira versão com armazenamento local por usuário neste navegador; sincronização/compartilhamento e integração com o futuro banco ficam para evolução posterior.
- Respeitar permissões e disponibilidade das fontes. Períodos, unidades e contagens de módulos diferentes permanecem explícitos, sem soma ou cruzamento automático.
- Começar reutilizando os indicadores e regras de cálculo existentes. A criação livre de gráficos por campos, medidas e agrupamentos escolhidos é uma evolução posterior, com critérios próprios.
- Este recurso compõe uma página com dados de vários módulos; amplia o objetivo das visões favoritas atuais, que restauram filtros/apresentação de uma categoria.

## Estado atual das entregas

Entregue em 0.44.0: primeira versão do **Meu Dashboard**, com as configurações locais por usuário e dados das fontes carregadas na sessão. A19 segue apenas com as evoluções indicadas acima.

Entregue em 0.43.0: fechamentos pelo executor do histórico como indicador principal, responsável atual e maior tempo por chamado compartilhado; seleção de colunas nas tabelas do Zoho. Consulta real do histórico, da configuração de status e dos apontamentos concluída em 20/10/2026. Sem fórmula de pontuação ponderada. Categorias reais de status, reaberturas, empates e limites têm validação própria. [Critérios](INTEGRACAO-ZOHO-DESK.md).

**Atualização em 20/10/2026 — 0.42.0:** entregues os três itens priorizados: conferência parcial transparente do Zoho, visões favoritas locais por usuário/categoria e destaques auditáveis em OS/Consumo. [Funcionamento e limites](VISOES-E-DESTAQUES.md). Matriz modelo × motivo, backup/restauração de lembretes e ampliação da avaliação do assistente ficam para depois, conforme o proprietário. Sessões do Zoho aguardam CSV Session do escritório; nenhuma nova integração ou infraestrutura foi ativada nesta rodada.

As notas históricas abaixo mantêm o contexto original. Para o estado das entregas mais recentes, consultar o histórico de versões; a integração de tickets/tempos Zoho e Google Sheets já possui leitura real, sem equivaler a sessões ou armazenamento compartilhado.

Rodada **A17 entregue em 0.40.0**: Consumo e Parque com indicadores principais/complementares, tabelas com rolagem identificada e teclado, números/identificadores alinhados, ações compactas dos relatórios, mensagens de estado e impressão com contexto legível. Responsividade e temas conferidos; dados, cálculos e configurações externas preservados. [Mudanças e limites da rodada](REFINAMENTO-VISUAL.md).

Preparação entregue em **0.39.0**: contrato de persistência versionado, concorrência, paginação, exclusão lógica, ponte read/write e adaptador SQL para futuro banco de negócio separado. Importação conjunta usa o mesmo repositório do consumo. **Não conclui A10/A13**: nenhum dado foi migrado e armazenamento remoto/compartilhado, rotas, retenção e automação continuam pendentes. [Limites e roteiro de ativação](PREPARACAO-BANCO-DE-DADOS.md).

Entregue em 0.37.0: indicadores do Zoho também no gráfico do suporte da Visão geral, reaproveitando a última coleta completa de Eduardo e Jean. Seletor de quantidades/tempos, período próprio explícito e tabela com valores; leitura preservada ao fechar a seção, sem consultas automáticas.

Entregue em 0.36.1: seção única **OS → Zoho Desk**, com atividade e tempos de **Eduardo e Jean**, apontamentos por chamado, médias, métricas acumuladas de primeira resposta/resolução, respostas com critérios auditáveis e vínculo manual com OS. Leitura real por período concluída após renovar a autorização; comparação independente e revisão das respostas ainda necessárias. Prévia fictícia retirada da Equipe de suporte. Sessões, persistência e automação continuam pendentes. [Escopo e limites](INTEGRACAO-ZOHO-DESK.md).

Confirmado pelo proprietário em 0.34.0: leitura Google Sheets do Operacional, com aba fixa `Equipamentos`, mesma credencial técnica e origem independente. Somente administradores; não ativa armazenamento compartilhado. [Configuração](GOOGLE-SHEETS.md).

Entregue em 0.33.0: campo de perguntas do [Assistente de suporte experimental](AUTOMACAO-N8N-E-MCP.md), conectado ao AI Agent do n8n com Gemini e ferramenta de totais de atendimentos. Piloto restrito ao administrador principal neste computador, sem memória de conversa. Novas ferramentas, filtros por período/cliente/responsável e MCP permanecem pendentes.

Entregue em 0.30.0: [clientes consolidados e filiais](AGRUPAMENTO-DE-CLIENTES.md), com razões sociais idênticas agrupadas por padrão, coluna explícita opcional e visão por CNPJ. Preserva vínculos e ciclos originais.

Entregue em 0.29.0: manutenção sem troca, origem e próximos ciclos dos acessórios, rankings de trocas, identificação por CNPJ completo e modelos pelo serial. [Regras confirmadas e utilização](CRITERIOS-DE-MANUTENCAO-E-IDENTIFICACAO.md).

Entregue em 0.28.0: [histórico individual e concentração do parque](APROFUNDAMENTO-DO-PARQUE.md), com última intervenção efetiva e referência ajustável conforme definição do proprietário; resumos ampliados em OS, Parque, Consumo, Logística e Monitoramento; correção do cabeçalho/ícone e separação entre cards e gráficos na Visão geral. [Preparação CSV/APIs](PREPARACAO-FONTES-DE-CONSUMO.md) e prévia OS + Zoho disponíveis apenas como laboratório fictício, sem conexão, gravação ou alteração dos dados reais. Operadoras, Zoho, coleta e armazenamento compartilhado continuam pendentes de suas fontes e configurações.

Incluídas na fila em 17/10/2026: integrações de consumo **KORE Brasil / Saitro** e **Arqia**, aprovadas pelo proprietário para desenvolvimento após obter a documentação e o acesso das operadoras. O proprietário buscará essas informações na segunda-feira, **19/10/2026**. São duas entregas do item A15, com validação independente; o início da coleta real aguarda configuração e homologação. [Escopo e próximos passos](INTEGRACAO-OPERADORAS.md).

Escopo aprovado em 17/10/2026: integrar **Zoho Desk** à Equipe de suporte para chamados respondidos, respostas enviadas, tempo de permanência por sessão e tempo apontado nos atendimentos. O [mapa de atividades](MAPA-DE-ATIVIDADES-DO-SUPORTE.md) define as etapas funcionais. Em 19/10, portal/plano Enterprise e organização foram informados, os segredos OAuth foram cadastrados e a primeira conexão manual de agentes/chamados foi preparada em 0.35.0. Leitura real ainda aguarda validação; CSV Session, vínculos de agentes, autoria de respostas, Time Entries, fonte automática de sessões e armazenamento continuam pendentes.

Entregue em 0.27.0: consolidação dos menus e relatórios aprovada pelo proprietário, Visão geral mais direta, vínculos centralizados em Parque e grade única de Consumo com ranking complementar. [Mapa e critérios](ORGANIZACAO-DAS-ANALISES.md). A reorganização não conclui cruzamentos novos, integrações ou armazenamento compartilhado da fila.

Entregue em 0.24.0: filtros independentes por categoria, quadro compacto único e indicação de campos ativos no menu. [Critérios e limites](FILTROS-POR-CATEGORIA.md). Integração Google e demais dependências abaixo permanecem com seus estados próprios.

Piloto Google Sheets de OS preparado em 0.23.0, com fonte fixa e acesso exclusivo de administradores. Aba `OS 2025_26` confirmada em 16/10/2026. A configuração real será retomada quando o proprietário tiver acesso ao Google Cloud no escritório. Pendente: conferir a conta de serviço/API, credencial no Cloudflare, compartilhamento como leitor e comparação real com Excel. Ampliação a outros usuários/módulos e armazenamento compartilhado não foram ativados. [Configuração e limites](GOOGLE-SHEETS.md).

Atualizada em 18/10/2026. Esta é a fila consolidada atual; observações de versões antigas em outros documentos podem descrever itens já entregues. Prioridades serão definidas pelo usuário. Uma ideia na fila não autoriza automaticamente ativar integrações ou enviar dados ao servidor.

Incluído pelo proprietário em 18/10/2026: **n8n como candidato à coordenação das integrações**, junto ao Monitoramento, KORE/Arqia, Zoho e Google Sheets. Hospedagem, coleta, autenticação com o sistema e armazenamento dependem de projeto e homologação. O uso de **MCP para um assistente de consultas** tem sua estrutura visual oculta aprovada e entregue em 0.31.0; integração e ativação real continuam pendentes. [Escopo e proposta](AUTOMACAO-N8N-E-MCP.md).

| Código | Item                                                                                                                 | Situação / dependência                                                                                                                                                       | Prioridade     |
| ------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| A01    | Separar visitas improdutivas dos indicadores de manutenção, com modos no relatório por veículo e ranking de técnicos | Entregue em 0.17.6; manter custos válidos de ambas as categorias                                                                                                             | Concluído      |
| A02    | Visão resumida com indicadores principais e base de cálculo                                                          | Entregue em 0.17.6 em oito análises de OS/técnicos                                                                                                                           | Concluído      |
| A03    | Revisar seções sem ícone de explicação                                                                               | Entregue em 0.17.7: cobertura de cabeçalhos, descrições e padronização à direita; conferência em 47 relatórios                                                               | Concluído      |
| A04    | Ampliar resumos aos demais relatórios e módulos                                                                      | Ampliação entregue em 0.28.0 nos painéis analíticos de OS, Parque, Consumo, Logística e Monitoramento; futuras seções seguem revisão                                         | Entregue       |
| A05    | Classificar manutenção sem troca                                                                                     | Entregue em 0.29.0; regras e ciclos confirmados em 18/10/2026, com rankings por cliente/placa                                                                                | Concluído      |
| A06    | Identificação de clientes/filiais                                                                                    | Entregue nas análises de OS em 0.29.0: CNPJ completo da coluna C e Base clientes na importação manual; consulta cadastral Google não ativada                                 | Entregue       |
| A07    | Modelo do equipamento                                                                                                | Entregue em 0.29.0: serial é a fonte principal; coluna Modelo preservada. Inclui prefixos 81–85 como MXT-141                                                                 | Concluído      |
| A08    | Regras financeiras da Operacional                                                                                    | Confirmar início/fim de contrato, competência mensal, cancelamento e pró-rata antes de calcular faturamento esperado                                                         | A definir      |
| A09    | Conclusão integral de chamados e previsões                                                                           | Definir status mistos e previsão de Agendar/Agendado; não alterar atuais totais realizados                                                                                   | A definir      |
| A10    | Armazenamento compartilhado do acompanhamento de consumo                                                             | Adiado; contrato local read/write preparado. Exige servidor, autorização, concorrência, retenção, migração e backups                                                         | A definir      |
| A11    | Consumo por contrato e franquia                                                                                      | Definir fonte dos vínculos e regras de franquia compartilhada/excedentes; não inferir pelo nome do plano                                                                     | A definir      |
| A12    | API real do monitoramento                                                                                            | 0.50.0: adaptador do diagnóstico legado Addlog e consulta manual com token no servidor; homologar cobertura real e confirmar fuso de generatedAt. Demais sistemas pendentes. | Em homologação |
| A13    | Infraestrutura e coleta periódica                                                                                    | Definir servidor, credenciais, frequência por base, falhas/parcialidade e permissões por base                                                                                | A definir      |
| A14    | Histórico de comunicação e alertas                                                                                   | Depois da coleta: episódios, recuperação, acompanhamento persistente, responsáveis, regras/canais de aviso e retenção                                                        | A definir      |
| A15    | Consumo via API — KORE e Arqia                                                                                       | KORE: piloto manual 0.55.0 separado dos CSVs; conexão e período em homologação. Arqia aguarda acesso                                                                         | A definir      |
| A15-K  | KORE Brasil / Saitro — linhas e consumo                                                                              | API Saitro documentada e piloto paginado implementado; validar conexão no servidor e período do acumulado                                                                    | A definir      |
| A15-A  | Arqia — linhas e consumo                                                                                             | API anunciada para a Plataforma de Gestão; aguarda documentação técnica, liberação da conta, limites e condições de uso                                                      | A definir      |
| A16    | Ampliar conciliação entre operacional, OS e consumo                                                                  | Vínculos básicos já existem. Cruzamento histórico consumo × manutenção depende de titularidade no tempo e critérios de divergência                                           | A definir      |
| A17    | Revisão contínua de layout e documentação                                                                            | Rodada 0.40.0 entregue: Consumo/Parque, tabelas, filtros/ações, impressão e responsividade; revisão continua para futuras telas                                              | Contínuo       |
| A19    | Meu Dashboard — primeira versão entregue em 0.44.0; evolução de campos livres e sincronização                        | Catálogo de 55 indicadores, cartões/gráficos/tabelas, filtros, organização e painéis locais por usuário concluídos. Campos livres e banco compartilhado ficam na fila        | **Alta**       |

## Automação e assistente — pendências

Pendências adicionais de automação:

| Código  | Item                              | Situação / dependência                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Prioridade   |
| ------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| A18     | n8n — coordenação das integrações | Incluído na fila em 18/10/2026. Definir hospedagem, conexões autenticadas, armazenamento, frequência, tratamento de falhas e piloto com uma base do Monitoramento. Relacionado a A12–A15, Zoho e Google. Laboratório Windows via npm instalado em 18/10/2026, com acesso local; conta criada, fluxo fictício e primeira consulta manual às três planilhas locais testados. Acervo em import/, com leitura real e mesmos cálculos do painel; IA, MCP e integrações externas pendentes. | A definir    |
| A18-MCP | Assistente de consultas por MCP   | Prévia oculta entregue em 0.31.0. Definir ferramentas de consulta, cliente/IA, acesso aos dados no servidor e permissões por usuário/base. Um chat dentro do sistema exige interface e integração próprias. Não habilitar administração geral do n8n para usuários do painel.                                                                                                                                                                                                         | Em avaliação |

## Já entregues — não recolocar na fila

Equipe de suporte e organização do Monitoramento (0.21.0): períodos, execução/agendamento, ranking e relatórios; acompanhamento separado da análise, cards e filtros da fila. Contrato e consulta autenticada para futuro coletor preparados. Isso não conclui A12–A14: API do fornecedor, coleta automática, histórico persistido, alertas e permissões por base ainda dependem das definições documentadas em [Integração do monitoramento](INTEGRACAO-MONITORAMENTO.md).

Correções da análise crítica (0.20.6): ordenação completa do operacional, seletor de comparação com coluna ausente, CSVs financeiros numéricos, formato das bases XLSX, reconhecimento de delimitadores entre aspas e avisos de status/pagamento/cabeçalhos sem mudança dos totais. Compatibilidade e limites em [Correções da análise crítica](CORRECOES-DA-ANALISE-CRITICA.md). Novos cruzamentos e alterações de regra continuam nas dependências da fila.

Vida em campo (0.20.5): total identificado, participação das primeiras trocas e tempo médio acompanhado, com revisão/cancelamentos e bases explícitas. Tabelas, CSV e impressão acompanham os indicadores. Uma estimativa de sobrevivência permanece uma proposta futura que exige validar cobertura do histórico e encerramento da observação; não foi ativada nesta etapa. Critérios em [Vida em campo](VIDA-EM-CAMPO.md).

Refatoração gradual R01–R05 concluída: acompanhamento/persistência em 0.20.1; importação, filtros e relatórios do consumo em 0.20.2; controles compartilhados de CSS em 0.20.3; coordenação das OS em 0.20.4; medição e carregamento por módulo/relatórios de OS em 0.20.8. Filtros, bases e rascunhos foram conferidos durante a navegação. Resultados e limites em [Desempenho e carregamento](DESEMPENHO-E-CARREGAMENTO.md) e sequência em [Revisão técnica e refatoração](REVISAO-E-REFATORACAO.md). Os demais itens aguardam prioridade do usuário.

Monitoramento Ativo (0.19.0): tabela prioritária com os seis campos informados para a API, sinais de duração, interface compacta e histórico manual por veículo com botão Salvar atualização. Funciona somente na demonstração e na sessão atual; integração real, coleta e armazenamento permanente continuam nos itens A12–A14.

Logística (0.18.0): leitura e conferência de Envios e Devoluções, com recebimentos datados. Consertos excluído por solicitação do usuário. Integração logística com OS/parque, titularidade histórica e interpretação de Situação continuam pendentes; a leitura inicial não ativa esses cruzamentos.

Das propostas de aprofundamento registradas em 12/10/2026, concentração das assistências, histórico individual e última intervenção foram entregues em 0.28.0. Composição financeira por equipamento, matriz modelo × motivo e cruzamentos logísticos com OS/Operacional continuam pendentes de critérios e validação. [Parque e Manutenção](PARQUE-E-MANUTENCAO.md) e [histórico individual](APROFUNDAMENTO-DO-PARQUE.md) descrevem as entregas e seus limites.

Importação manual, múltiplos filtros, personalização de seções, controles de abrir/recolher, relatórios descritivos, análises por cliente/veículo/técnico, vida observada, cruzamentos básicos com a Operacional, consumo com histórico e anotações locais, backup/restauração, exportação/impressão por linha, seleção de linhas para CSV e limite absoluto de consumo. O monitoramento ainda utiliza somente demonstração; seus controles não equivalem a integração real.

## Limites

Lucro, recebimento comprovado, inadimplência, SLA e produtividade por hora não são funcionalidades aprovadas para desenvolvimento neste momento: faltam dados e/ou regras. Não devem ser apresentados como indicadores disponíveis nem como compromissos da fila.
