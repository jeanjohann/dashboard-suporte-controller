# Zoho Desk na Equipe de suporte — escopo aprovado

Em 17/10/2026, o proprietário confirmou **Zoho Desk** e aprovou o acompanhamento conjunto de OS, chamados/respostas do Zoho, tempo de permanência no sistema e tempo apontado nos atendimentos. O objetivo é apresentar o mapa de atividades de cada agente. A integração **não está implementada nem ativada**: a primeira leitura depende de um arquivo real de disponibilidade; a automação também depende da configuração da conta. O [mapa funcional e a sequência de entrega](MAPA-DE-ATIVIDADES-DO-SUPORTE.md) consolidam o que foi aprovado. Os campos e a cobertura precisam ser validados com a fonte.

## Chamados e respostas

| Indicador                       | Critério proposto                                                                                                                                                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chamados respondidos por pessoa | Tickets distintos com pelo menos uma resposta pública efetivamente enviada pela pessoa dentro do período. Cinco respostas no mesmo ticket contam um chamado. Atribuição pelo autor da resposta, não pelo responsável atual do ticket.                                                    |
| Respostas enviadas              | Interações públicas enviadas pela pessoa dentro do período, sem repetir o identificador da mesma resposta. Não contar rascunhos, falhas/pendências de envio, mensagens recebidas, encaminhamentos, notas internas ou automações; confirmar os sinais dessas situações em amostras reais. |
| Total da equipe                 | Tickets distintos entre todas as pessoas incluídas. Se duas pessoas responderam ao mesmo ticket, cada uma pode ter um chamado no seu card, mas o total da equipe conta um.                                                                                                               |

A data de referência seria a do envio da resposta, convertida para o calendário definido com a empresa. Os filtros atuais de semana, mês, ano e intervalo poderiam ser reutilizados. Tickets criados antes do período ainda devem entrar se tiveram resposta dentro dele.

Cards individuais poderiam mostrar as duas métricas e sua comparação anterior. Um gráfico apresentaria o volume por pessoa e uma tabela permitiria conferir ticket, agente, data, cliente e link do Zoho. Os indicadores do Zoho devem permanecer identificados como outra fonte: não somar tickets do Desk com chamados de OS nem vincular automaticamente seus números.

## Tempo de permanência no Zoho

É uma medida adicional ao Time Entry. A fonte inicial será **Agent Availability → Session**, com as entradas e saídas de cada sessão. A visão Summary informa totais diários, mas não permite reconstruir os intervalos com o mesmo detalhe.

**Cálculo de base:** soma da duração das sessões válidas de cada agente dentro do período. Exemplo: 08h–12h e 13h–17h correspondem a 8 horas, preservando o intervalo entre sessões. Não calcular pela diferença entre primeira entrada e última saída do dia.

O relatório segue as regras do Zoho para entrada/saída, fechamento das abas, conexão/suspensão e timeout de inatividade. Ele registra sessões com duração mínima conforme o produto; não representa uma medição independente de todo o trabalho da pessoa. Conferir o timeout da organização antes de interpretar os números.

Na leitura, preservar ID/nome do agente, início/fim, fuso, arquivo e linha de origem; usar o identificador da sessão quando disponível. Datas ambíguas ou duração incompatível exigem revisão. Sessões sem saída ficam identificadas como abertas/incompletas, com exclusão explícita do total de sessões encerradas. Sessões fora do recorte não entram; sessões que atravessam seu limite devem ser recortadas. Não somar arquivos repetidos ou intervalos sobrepostos como horas adicionais: preservar origens e tratar duplicidades/sobreposições de modo auditável.

O Zoho permite exportar esse relatório em CSV/Excel. O primeiro passo será validar um CSV na visão Session e comparar o total por agente com o próprio Zoho, usando o mesmo período/fuso. **Ainda não foi confirmado um endpoint público para o histórico deste relatório**. A API de tickets/Time Entries não garante o acesso às sessões. A automação de disponibilidade será validada separadamente conforme os recursos da conta, sem prometer captura de tempo de presença pela coleta de mensagens.

## Tempo apontado nos atendimentos

Utilizar os apontamentos **Time Entry** do Zoho, que podem vir de registro manual ou de rastreamento automático conforme a configuração de cada departamento. Não derivar tempo de trabalho da diferença entre abertura e fechamento do ticket, nem de tempo até primeira resposta ou presença do agente no sistema.

- **Tempo registrado:** soma das durações válidas dos apontamentos do agente no período, incluindo tempo não faturável. Exibir em horas/minutos, sem converter automaticamente em custo.
- **Chamados com tempo registrado:** tickets distintos com pelo menos um apontamento válido do agente no recorte.
- **Tempo médio por chamado com apontamento:** tempo registrado dividido pela quantidade desses tickets, não pela quantidade de chamados respondidos. Um ticket com atividade interna também pode ter tempo sem resposta pública.
- **Cobertura:** mostrar ausência/indisponibilidade de apontamentos e período efetivamente coletado. Sem registro não significa zero esforço.

Atribuir o tempo ao agente do apontamento, não automaticamente a quem criou o lançamento ou ao responsável atual do ticket. Confirmar os campos na conta real. Deduplicar pelo ID da entrada e substituir valores nas edições; considerar exclusões na reconciliação. O período deverá usar a data de execução/atividade acordada, não simplesmente a criação do lançamento. Normalizar horas, minutos e segundos e validar valores ausentes/incompatíveis, sem truncar durações maiores que 24 horas.

O Zoho permite timers simultâneos: somar apontamentos não equivale necessariamente a horas únicas de jornada. Não somar durações ao longo de métricas distintas ou usar esse número isoladamente como classificação de produtividade. A comparação por pessoa precisa da mesma configuração de rastreamento e de contexto de atendimento.

## Atualização e fontes

1. Conexão de leitura do Worker/servidor ao Zoho Desk com OAuth, mantendo segredos no servidor.
2. Coleta inicial para um período acordado e atualizações incrementais; intervalo inicial proposto de 15–30 minutos, condicionado ao volume, à edição e aos créditos disponíveis.
3. Deduplicação por organização + ticket + resposta e reconciliação após falhas. Retomar a última sincronização confirmada, com paginação completa e margem de sobreposição; não substituir uma base completa por coleta parcial nem apresentar ausência de dados como zero.
4. Consulta do dashboard sujeita às permissões existentes, com última atualização, período coberto e eventual estado de coleta incompleta. A primeira liberação pode ser restrita a administradores.

Essas etapas de API atendem chamados/respostas/apontamentos conforme os recursos confirmados. A disponibilidade começa pela importação do CSV; só passa a automática após validar sua fonte própria. A coleta deve ser somente de leitura e preservar os dados originais do Zoho.

O cache/histórico da integração exige decisão própria de armazenamento e retenção; o D1 de usuários/permissões não deve passar a guardar conversas automaticamente. Para os indicadores, priorizar identificadores, autor, horário, canal, visibilidade e estado do envio, evitando copiar texto das mensagens e anexos sem necessidade definida.

Webhooks são uma alternativa posterior para receber novas respostas com menor atraso, se disponíveis no plano. Precisam de autenticação/verificação, deduplicação e reconciliação; não substituem a coleta de histórico. Não é necessário introduzir n8n para a integração direta, embora possa ser usado caso a empresa já o mantenha.

## Antes de implementar

- Confirmar edição/plano, créditos de API, região do portal e departamentos/canais incluídos.
- Obter autorização administrativa e configurar OAuth diretamente no servidor; nenhuma senha, chave ou token deve ser enviado no chat ou incluído no Git.
- Validar a identificação de autor, visibilidade, direção, envio concluído e automação em amostras dos canais usados. Não inferir autoria pelo agente atualmente designado.
- Mapear o ID do agente do Zoho ao responsável da planilha, com conferência por e-mail/cadastro explícito; grafias parecidas não bastam para unir pessoas.
- Definir período inicial, fuso, critérios finais dos indicadores, permissões e armazenamento. Até conhecer a cobertura, o histórico anterior não deve ser prometido como completo.
- Confirmar quais departamentos usam Time Tracking, quais ações são capturadas, se o modo é manual/automático e se existem timers simultâneos. Validar o agente e a data efetiva dos apontamentos.
- Obter um CSV de Agent Availability na visão Session, conferir fuso/formato de data e timeout de inatividade; validar totais e duplicidades antes de construir o importador definitivo.

## Referências verificadas

- [API oficial do Zoho Desk](https://desk.zoho.com/DeskAPIDocument?src=rest-api): autenticação OAuth e acesso aos recursos.
- [Documentação oficial de webhooks](https://desk.zoho.com/support/WebhookDocument.do): evento `Ticket_Thread_Add`; exemplo com identificador da interação, ticket, autor/responder, horário, direção, visibilidade, encaminhamento e estado. A amostra inclui estado pendente; receber o evento não comprova envio concluído.
- [Threads públicas e privadas](https://help.zoho.com/portal/en/kb/desk/ticket-management/ticket-replies/articles/public-and-private-threads-in-tickets): colaboração interna e encaminhamentos não devem ser confundidos com respostas ao cliente.
- [Créditos e concorrência da API](https://help.zoho.com/portal/en/kb/desk/developer-space/apidashboard/articles/working-with-api-credits): limites dependem da edição e são compartilhados pela organização.
- [Configuração oficial de Time Tracking](https://help.zoho.com/portal/en/kb/desk/ticket-management/time-tracking/articles/setting-up-time-tracking-and-billing-preferences-in-tickets): modos manual/automático, ações registradas e possibilidade de timers simultâneos. A documentação de webhooks também descreve inclusão, edição e exclusão de Time Entries.
- [Relatório oficial de disponibilidade](https://help.zoho.com/portal/en/kb/desk/reports-and-dashboards/reports/articles/understanding-agent-availability-report): sessões, horas, critérios de entrada/saída, visões e exportação.
- [Timeout de inatividade](https://help.zoho.com/portal/en/kb/desk/customization/general-settings/articles/configuring-idle-timeout-for-agents): configuração que afeta a disponibilidade registrada.
