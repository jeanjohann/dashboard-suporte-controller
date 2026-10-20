# Meu Dashboard

Entregue em **0.44.0** e ampliado até **0.46.0, 20/10/2026**. Página própria no menu para montar painéis com indicadores dos módulos existentes. Começa em branco; o catálogo oferece 55 indicadores, conforme as permissões do usuário.

## Leitura e composição — 0.46.0

O gráfico acompanha a largura e a altura disponíveis no bloco. Valores e tabelas usam tamanhos proporcionais com limites de legibilidade. Em barras/colunas, o espaço determina quantas categorias cabem, com aviso explícito quando houver outras. A janela **Ampliar** (⛶) permite conferir o gráfico maior e a **Tabela completa**, paginada, sem alterar o recorte. Metadados extensos e cartões compostos podem ter rolagem em alturas pequenas; os valores não são reduzidos indefinidamente.

- **Barras horizontais:** rankings e nomes longos, com rótulo completo no detalhe e na tabela.
- **Colunas:** comparação de categorias, respeitando o espaço entre rótulos.
- **Linhas:** evolução mensal das OS; todos os meses retornados pelo cálculo são mantidos, espaçando os rótulos. Não cria meses, valores ou projeções ausentes.
- **Rosca:** apenas partições de um total: tipos de OS, modelos/clientes/situações da Operacional, consumo por operadora e atrasos por base. Mostra cinco categorias e reúne a cauda em “Outras categorias (agrupadas)”, preservando o total. Não aplica a agentes com chamados compartilhados. Valores indisponíveis/negativos remetem à tabela, sem completar com zero.

No editor de um **Cartão**, adicionar até três indicadores complementares, totalizando quatro. Cada um tem título, filtros, fonte, unidade, período e critérios próprios. Exemplo: OS produtivas, chamados fechados no Zoho e tempo apontado. Os valores são apresentados juntos, sem soma/fórmula nem equivalência automática entre atendimentos, chamados e horas. Uma fonte ausente não elimina os demais indicadores disponíveis; o estado fica explícito.

Em um gráfico ou tabela de série, **Comparar duas séries** permite escolher outra série da mesma unidade e agrupamento, inclusive repetir o indicador com outro recorte. Barras/colunas aparecem lado a lado; linhas são independentes. As categorias são associadas somente por nome exato: “Jean” e “Jean Johann” continuam distintos. Ausência permanece indisponível, enquanto zero informado continua zero. Períodos e critérios de ambas as fontes ficam expostos; não há soma, associação de pessoas por similaridade, fórmula de produtividade ou duplo eixo misturando unidades. A rosca não admite comparação.

## Organização, modelos e fontes — 0.46.0

**Usar modelo** oferece Gestão, Equipe de suporte, Parque/equipamentos e Consumo. Cria um novo rascunho com os indicadores permitidos, sem substituir painéis salvos; confirmar descarte se houver edição pendente. Salvar continua explícito. Fontes ausentes permanecem indicadas. O editor permite uma **Seção** opcional: blocos com o mesmo nome são agrupados, mantendo a ordem interna; ao mover um bloco para outra seção, ele adota a seção do destino. Desfazer recupera a configuração anterior.

**Fontes de dados** mostra o que está carregado nesta sessão, horários de carga, dependências e acesso ao módulo de origem. Não dispara atualização de API nem importa planilhas. O Parque exige Operacional e OS. Os estados não representam uma promessa de coleta completa; os critérios do indicador e a seção de origem continuam sendo a referência para cobertura/avisos da coleta.

**Recorte do painel** oferece período e cliente exato, salvo com a configuração. É optativo por indicador: marcar **Usar período/cliente do painel** no editor, inclusive para cada complementar ou comparação que deva acompanhar o recorte. Datas se aplicam a OS, eventos do Parque e Logística; cliente a OS, Operacional e Parque. Zoho, Consumo e Monitoramento mantêm seus recortes próprios. Campos herdados substituem os locais, inclusive ao limpar o recorte; ao desmarcar, os filtros locais anteriores retornam. Os demais campos continuam próprios. Não modifica filtros globais nem dos módulos.

Backups, duplicação, edição/desfazer e permissões incluem indicadores complementares, comparação, seção e recorte. A validação admite apenas composições limitadas, sem recursão nem dados de origem. Layouts da 0.45.0 permanecem válidos; configurações novas requerem a versão atual do sistema. Sem migração de dados, sincronização remota ou novas consultas externas.

## Como usar

1. Carregar ou atualizar as bases nos módulos de origem. A página não dispara consultas nem importa arquivos automaticamente.
2. Abrir **Meu Dashboard → Adicionar indicador**. Buscar uma informação ou filtrar o catálogo por módulo.
3. Escolher título, apresentação, tamanho e recorte do bloco. Os formatos disponíveis respeitam o tipo de indicador, conforme descrito acima.
4. Ativar **Organizar painel**. Arrastar pelo símbolo ⠿ ou usar as setas; puxar o canto ◢ para ajustar largura e altura. O editor também permite tamanho pequeno, médio ou largura total e altura automática ou entre 320 e 960 px. A grade se adapta à largura da tela.
5. Nomear e clicar em **Salvar painel**. Usar **Novo painel** para outra composição e **Abrir painel salvo** para alternar. Há até 12 painéis com 40 blocos cada.

O usuário pode editar ou remover blocos, renomear, descartar alterações e excluir um painel. A troca de painel com edição pendente pede descarte explícito. Remover um bloco só se torna definitivo ao salvar; excluir um painel exige confirmação na interface.

## Organização e apresentação — 0.45.0

Fora do modo Organizar, os controles de edição dos blocos ficam ocultos. O arraste encaixa a ordem na grade e o redimensionamento usa as três larguras; no celular, os blocos continuam em uma coluna. Um gesto altera o rascunho somente ao soltar; Escape cancela. O botão Desfazer reverte até 30 alterações desde a abertura ou último salvamento. Salvar, abrir outro painel, descartar ou criar uma cópia inicia uma nova sequência de edição.

Duplicar um bloco copia seus filtros, formato e tamanho com identidade independente. **Duplicar painel** cria uma cópia da edição atual, sem substituir o original; é necessário salvar o novo painel. Permanecem os limites de 12 painéis e 40 blocos por painel.

**Apresentar** oculta menu, configuração e ações de edição, preservando valores, filtros, fonte, horário e critérios de cada bloco. Mostra a edição atual e indica quando não está salva. **Tela cheia** é opcional, conforme suporte/permissão do navegador; a apresentação funciona na própria janela. Sair da apresentação retorna à edição sem modificar sua configuração. Escape também permite sair; o navegador pode consumir o primeiro Escape para abandonar a tela cheia.

**Imprimir / Salvar PDF** usa o diálogo do navegador, respeitando a permissão de exportação. Inclui título, horário de Brasília, condição de rascunho e critérios expandidos. Tabelas imprimem todas as linhas do resultado, mesmo quando paginadas na tela; gráficos seguem suas regras de categorias, com aviso quando limitado. A altura fixa e a rolagem não cortam as tabelas na impressão. Ajustar papel/orientação/escala no diálogo quando necessário. Não gera nem envia PDF automaticamente.

## Backup das configurações — 0.45.0

**Exportar painéis salvos** baixa JSON com títulos, ordem, dimensões, indicadores e filtros de todos os painéis salvos. Alterações não salvas ficam fora do arquivo. Não contém fontes, resultados, credenciais ou identidade; títulos e filtros podem conter nomes que o usuário configurou.

Para transportar a organização, importar o JSON no outro navegador/computador. A prévia informa os painéis antes de confirmar. A importação é aditiva: novos IDs, nomes repetidos diferenciados e nenhuma substituição dos painéis existentes. O lote inteiro deve caber no limite de 12; falhas de validação, permissão ou revisão não gravam uma parte do lote. Salvar ou descartar a edição atual antes de importar. Recarregar as bases nos módulos de origem para preencher os blocos.

Backup e impressão respeitam exportação; a importação exige a permissão correspondente e acesso a todos os módulos presentes no arquivo. O repositório continua local ao usuário/origem e protege gravações concorrentes. Não há sincronização automática entre computadores.

## Catálogo e critérios

| Fonte         | Informações e recortes                                                                                                                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS            | Visitas, intervenções, improdutivas, manutenções, implementações, chamados, clientes, veículos, custos e séries por mês/tipo/responsável. Reutiliza `dashboardData`/`supportPerformance`. Período e cliente exato por bloco. Execução usa data de atendimento; agendamento usa sua própria data.   |
| Zoho Desk     | Fechados pelo executor, responsável atual, maior tempo em fechados, respostas confirmadas/pendentes, apontamentos e médias; séries por agente. Eduardo/Jean ou agente individual. Usa a coleta concluída e seu período, não os filtros de OS. Para outro período, coletar novamente na seção Zoho. |
| Consumo M2M   | Linhas, amostras válidas/ativas/zeradas/excluídas, MB total/médio e série por operadora. Uma apuração por operadora, inicialmente a mais recente; permite fixar operadora e apuração. Apuração salva ausente fica indisponível, sem substituição silenciosa.                                       |
| Operacional   | Registros, pontos de revisão, modelos, clientes e situações. Cliente/modelo exatos. Modelo é derivado do serial pelas mesmas regras do módulo. Retrato da base atual, sem histórico inventado.                                                                                                     |
| Parque        | Equipamentos vinculáveis/com atendimento/com assistência, assistências, trocas e assistências por 100 registros. Cliente/modelo e período dos eventos das OS. Usa parque atual e vínculo conservador serial + placa. Exige ambas as bases.                                                         |
| Logística     | Envios/devoluções e recebimentos registrados. O período usa envio na saída e recebimento na devolução. Não infere ausência de entrega a partir de data ausente.                                                                                                                                    |
| Monitoramento | Frota, atrasos, críticos, comunicações ausentes, coleta indisponível, datas inválidas e série por base. Base e limite 48/72/96h. Demonstração tem identificação explícita; coleção antiga não gera atraso confirmado.                                                                              |

Cada bloco informa período e recorte; fonte, horário em Brasília e critérios ficam em **Fonte e critérios**. Carga local na sessão é identificada separadamente da leitura Google/Zoho; monitoramento apresenta os horários reais das coletas. Ausência não vira zero. Valores monetários mantêm centavos, consumo mantém unidades exatas e tempos mantêm segundos. Barras/colunas mostram as categorias que cabem, até 20 no painel e 40 na ampliação, com aviso; tabelas paginam todos os itens, dez por página. Linhas mantêm os meses retornados e roscas preservam o total com a cauda agrupada. Séries por agente podem se sobrepor: um chamado compartilhado pode aparecer para mais de uma pessoa; a contagem da equipe é deduplicada pelo módulo.

## Salvamento e acesso

- **Configurações locais por identidade**, neste navegador e origem do sistema: título, ordem, tamanho, indicador, formato e filtros. Não há sincronização entre dispositivos ou armazenamento compartilhado. No modo local sem autenticação, vale a identidade local do sistema.
- IndexedDB `addlog-my-dashboard-v1`, documento versionado por usuário. Gravação transacional com revisão impede sobrescrita concorrente entre abas. Em conflito, a edição permanece e o usuário pode recarregar os salvos antes de substituir a versão do painel. Falha de armazenamento não apaga a versão anterior nem a edição em memória.
- O documento aceita somente configuração validada, sem linhas de origem, credenciais ou valores calculados. As bases continuam na memória da sessão; ao recarregar, carregar novamente as fontes. O histórico de consumo já existente continua com sua própria persistência, acessível ao abrir Consumo.
- A página deriva acesso das permissões existentes; não cria nova permissão de dados. O catálogo e o avaliador verificam o módulo antes de acessar a fonte. O piloto Zoho continua limitado às regras atuais (interface de administrador e API do proprietário).
- Troca de identidade ou permissões remonta o espaço de trabalho e limpa fontes em memória. Um bloco salvo cujo módulo deixou de ser permitido mostra acesso indisponível. O isolamento local não substitui a autenticação e autorização das APIs.

## Evolução prevista

Sincronização e compartilhamento com o futuro banco, seleção livre de campos/medidas/agrupamentos, mais filtros e novos tipos de visualização permanecem na fila. Esta entrega compõe indicadores existentes sem somas, joins ou fórmulas arbitrárias entre módulos.

## Validação

Testes de paridade com os módulos, permissões antes da leitura, papéis do Zoho, períodos de consumo, unidades, ausência/zero, filtros, limites e integridade da configuração. Conferência no navegador com IndexedDB real: revisão concorrente, isolamento entre usuários, preservação após erro, reabertura, múltiplos painéis, filtros, gráfico/tabela, ordem, tamanho e tema escuro. O material de homologação usa dados fictícios e permanece fora do controle de versão.
