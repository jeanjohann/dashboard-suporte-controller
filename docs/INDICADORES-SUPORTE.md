# Indicadores Suporte

Página independente no menu principal, com filtros próprios por data e agente. As referências iniciais são as três abas do modelo semanal fornecido em 23/10/2026. O arquivo original não foi alterado nem importado como resultado realizado: seus campos estão predominantemente vazios e datas diárias se repetem entre semanas.

## Uso

1. Abra **Indicadores Suporte**. A base de OS usa a versão da sessão, carregada do banco ou importada no sistema.
2. Escolha semana atual, semana anterior, mês atual ou um intervalo personalizado de até 366 dias. Semanas vão de segunda a domingo, pelo calendário de São Paulo. O filtro não altera OS, Meu Dashboard ou Monitoramento.
3. Use **Consultar Zoho neste período** para carregar uma consulta completa de até 31 dias. Falha ou cancelamento preserva a consulta anterior, mas ela só é apresentada se cobrir integralmente o novo período. Uma consulta da sessão em OS também pode ser aproveitada, sem nova chamada automática ao fornecedor.
4. Em **Atividades e lançamentos**, abra **Adicionar ou editar lançamento manual**, selecione data e agente, preencha e salve. Cada registro corresponde a um dia e um agente. Para lançar totais históricos semanais, distribua pelos dias de ocorrência; não registre o mesmo total em todos os dias.
5. Em **Configurar indicadores e seções**, escolha cards, visibilidade e ordem das seções e metas semanais opcionais da equipe. Metas de tempo são informadas em minutos. A referência aparece apenas em semana completa de segunda a domingo e sem filtro individual. Não há proporcionalização ou histórico das metas: alterações valem para todas as semanas consultadas.
6. Exporte CSV ou imprima/salve PDF. O CSV contém contexto, resumo, tabela dos agentes e lançamentos manuais com revisão, data e autoria da gravação. A conferência das linhas de OS fica na própria página.

## Definições e fontes

Diagnóstico adicional: em Fontes e atualização, **Validar autoria de abertura e assuntos no Zoho** lê dois chamados recentes e até 200 eventos de cada histórico. Confirma abertura pelo suporte somente quando há um único evento TicketCreated em histórico completo, actor Agent com ID válido e source nulo. Importações, clientes, histórico ausente/truncado e automações não confirmam abertura. Mostra categoria, subcategoria e classificação atuais, sem título, descrição ou contato. A amostra não substitui totais do período e não altera os valores manuais. Usa os segredos existentes e o mesmo acesso restrito ao proprietário.

| Indicador                     | Regra                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Serviços efetivos executados  | Linhas Concluída/Pago, sem Motivo Visita Improdutiva, pela Data de atendimento e Resp. Execução.                                                                                                                                                                                                       |
| Serviços na agenda            | Linhas com data Agendamento no período, exceto status Cancelado/Cancelada, pelo Resp. Agendamento. Inclui as já executadas. Mede a data marcada, não quando o agente realizou a ação de agendar.                                                                                                       |
| Visitas improdutivas          | Linhas realizadas com Motivo Visita Improdutiva, separadas da execução efetiva.                                                                                                                                                                                                                        |
| Chamados fechados             | Chamados distintos com evento de fechamento atribuído ao agente, conforme a coleta existente do Zoho. O responsável atual não substitui a autoria do fechamento.                                                                                                                                       |
| Tempo apontado                | Soma das entradas de tempo válidas por agente e data de execução. Média usa apenas chamados com apontamento. Não é permanência conectada nem jornada sem sobreposições.                                                                                                                                |
| Chamados abertos pelo suporte | Consulta completa do Zoho confere TicketCreated no período, actor Agent, ID explícito e source nulo. Exclui clientes e importações. Criação não identificada deixa total automático indisponível. Sem total automático, apresenta somente o lançamento manual identificado. Nunca soma as duas fontes. |
| Assuntos dos chamados         | Categoria atual dos chamados fechados pelo agente no período, uma vez por chamado e agente. Total da equipe deduplica chamados compartilhados. Não infere categoria pelo título. Sem consulta compatível, mostra os assuntos manuais identificados.                                                    |
| Equipamentos solicitados      | Quantidades manuais de rastreadores, coletoras, identificadores e bloqueadores. Não inferidas de envios logísticos.                                                                                                                                                                                    |
| Atividades complementares     | Quantidades manuais de vídeos, cadastros de técnicos e POPs, com observações e campo Algo novo?.                                                                                                                                                                                                       |

Vínculos explícitos de OS: Jean/Jean Johann e Eduardo/Eduardo Oliveira para os dois IDs conhecidos da equipe no Zoho. Nomes apenas semelhantes não são vinculados. Linhas sem vínculo são sinalizadas e ficam fora dos totais da equipe. Clientes usam consolidação por nomes idênticos autorizada e exceções da Base clientes, preservando os CNPJs das linhas.

Agenda e execução podem contar o mesmo serviço em etapas diferentes. Os volumes de OS são linhas, inclusive as linhas de uma troca; não são somados aos chamados Zoho. Chamados distintos por agente também não são necessariamente aditivos se houver mais de um fechamento no mesmo período.

## Ausência, comparação e cobertura

Campo manual vazio é `null`, diferente de zero confirmado. Totais manuais somam somente os campos informados e mostram quantidade de registros/campos preenchidos. Não comprovam cobertura de todos os dias nem conclusão do preenchimento semanal. Ausência de OS na base também não comprova ausência de trabalho. Datas inválidas e responsáveis não vinculados são sinalizados.

A comparação usa o intervalo imediatamente anterior de mesma duração, calculado com a mesma base atual de OS e os lançamentos salvos. Não representa uma fotografia histórica imutável. Zoho só compara quando a consulta disponível cobre os dois períodos. As limitações da coleta existente continuam: chamados acessíveis modificados desde o início do período até a referência da leitura, limite de 500 chamados, indexação e permissões do fornecedor. A página mantém a cobertura explícita e não dispara uma segunda consulta silenciosa para o período anterior.

## Banco e segurança

- Piloto restrito ao administrador principal autenticado, conferido pelo Worker em cada requisição. Usuários comuns não recebem esta página como nova permissão; não foi ampliado o acesso às bases.
- Usa `BUSINESS_DB`, separado de `USERS_DB`, e o adaptador documental existente. Não exige migração SQL nova nem altera bases, lembretes ou suas retenções.
- Coleções fixas `support-indicator-entries` e `support-indicator-settings`, escopo `addlog`. Não há API de coleção arbitrária.
- Chave do lançamento: `AAAA-MM-DD.ID_DO_AGENTE`. Salvar novamente atualiza o mesmo registro, com comparação atômica da revisão conhecida. Um conflito mantém o formulário para conferência, em vez de sobrescrever outra sessão.
- A revisão, a data e o autor da última gravação ficam no envelope do documento. Não é um histórico de todas as versões do lançamento. As proteções e backups existentes do banco continuam aplicáveis.
- Validação no servidor de datas, agentes, campos, inteiros, limites e origem da requisição. Tamanho máximo de corpo 24 KB. Consulta paginada e limitada ao período, sem varrer todo o histórico.
- Configurações guardam cards, ordem das seções e metas. Filtros e consultas Zoho continuam na sessão; não há coleta periódica nem persistência nova de dados brutos do Zoho.
- Edição manual protege mudança de data/agente, mudança de período e fechamento da aba. Para descartar uma edição em conflito, use Descartar edição e recarregue os lançamentos. O modo local de desenvolvimento não simula sucesso do banco.

## Validação e próximos passos

Testes com dados fictícios cobrem datas, papéis distintos de execução/agendamento, improdutivas, zero/vazio, autoria exata, deduplicação de eventos Zoho, cobertura completa de período, SQL real em memória, isolamento, paginação, origem e revisões concorrentes. Build e revisão do pacote verificam JSX e carregamento tardio.

Verificação automatizada da versão 0.63.0: 460 testes aprovados, nenhuma falha e um teste previamente ignorado. Compilação do aplicativo e simulação do Worker concluídas. Revisão visual no navegador local conferiu o menu, o layout, os atalhos de semana atual/anterior e a abertura do formulário. O modo local manteve a gravação desabilitada, sem simular confirmação do D1.

Publicada no GitHub (`2a1d303`) e no Cloudflare. Versão ativa `d951cf4e-0300-48b1-934e-dbdae96e094e`, com o mesmo código da versão enviada `05aea0b2-98fc-4b54-b038-8edf1eba657a`, 100% do tráfego, bancos/segredos preservados e cron existente. A sessão autenticada confirmou a abertura do módulo, a fonte OS salva, a leitura vazia dos lançamentos e o formulário habilitado para gravação. Nenhum lançamento fictício foi gravado em produção.

Pendente de conferência pelo usuário: comparar totais reais de uma semana com a fonte e realizar o primeiro preenchimento manual. O diagnóstico autenticado posterior consultou dois chamados reais e confirmou um autor Contact via Email e um autor Agent com source nulo. Categorias atuais retornadas: Outras Informações e Cancelamentos/Desinstalação. Essa amostra não representa totais semanais.

Na versão 0.63.0, a consulta ampliada de Indicadores Suporte confere o histórico de criação no período e as categorias dos fechados por agente, conforme confirmação do proprietário. As outras consultas mantêm o comportamento anterior. Totais exigem todas as páginas e evidências por chamado. O diagnóstico real validou o contrato; a conferência dos totais com o relatório do usuário continua necessária. A documentação oficial de histórico distingue ações de agentes, clientes e automação: [eventos do histórico](https://help.zoho.com/portal/en/kb/desk/developer-space/rest-apis/articles/events-supported-in-get-ticket-history-api). Esta entrega não acrescenta escopos OAuth. A categoria atual pode diferir da categoria histórica na data do fechamento.

### Conferência dos fechamentos na conta real

A consulta semanal de 19 a 25/10/2026 encontrou divergência entre closedTime e os eventos de fechamento, inclusive ao consultar o histórico sem filtro de campo. Na consulta ampliada, os chamados pendentes aparecem por referência; todo o total automático de fechamentos e a distribuição por categoria ficam indisponíveis. Não são exibidos os fechamentos parcialmente conferidos como total. Aberturas e tempo têm evidências independentes e podem ser exibidos. As consultas antigas permanecem estritas. Essa pendência exige comparar o chamado indicado com o histórico/relatório do Zoho, sem substituir a autoria pelo responsável atual.
