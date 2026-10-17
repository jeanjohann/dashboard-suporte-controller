# Zoho Desk na Equipe de suporte — proposta

Em 17/10/2026, o proprietário sugeriu acrescentar o número de chamados respondidos, confirmou que a empresa usa **Zoho Desk** e acrescentou o tempo gasto por agente. A integração é viável, mas **não foi implementada nem ativada**. Este documento registra a proposta; regras e configuração dependem de validação com a empresa.

## Indicadores sugeridos

| Indicador                       | Critério proposto                                                                                                                                                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chamados respondidos por pessoa | Tickets distintos com pelo menos uma resposta pública efetivamente enviada pela pessoa dentro do período. Cinco respostas no mesmo ticket contam um chamado. Atribuição pelo autor da resposta, não pelo responsável atual do ticket.                                                    |
| Respostas enviadas              | Interações públicas enviadas pela pessoa dentro do período, sem repetir o identificador da mesma resposta. Não contar rascunhos, falhas/pendências de envio, mensagens recebidas, encaminhamentos, notas internas ou automações; confirmar os sinais dessas situações em amostras reais. |
| Total da equipe                 | Tickets distintos entre todas as pessoas incluídas. Se duas pessoas responderam ao mesmo ticket, cada uma pode ter um chamado no seu card, mas o total da equipe conta um.                                                                                                               |

A data de referência seria a do envio da resposta, convertida para o calendário definido com a empresa. Os filtros atuais de semana, mês, ano e intervalo poderiam ser reutilizados. Tickets criados antes do período ainda devem entrar se tiveram resposta dentro dele.

Cards individuais poderiam mostrar as duas métricas e sua comparação anterior. Um gráfico apresentaria o volume por pessoa e uma tabela permitiria conferir ticket, agente, data, cliente e link do Zoho. Os indicadores do Zoho devem permanecer identificados como outra fonte: não somar tickets do Desk com chamados de OS nem vincular automaticamente seus números.

## Tempo gasto por agente

Utilizar os apontamentos **Time Entry** do Zoho, que podem vir de registro manual ou de rastreamento automático conforme a configuração de cada departamento. Não derivar tempo de trabalho da diferença entre abertura e fechamento do ticket, nem de tempo até primeira resposta ou presença do agente no sistema.

- **Tempo registrado:** soma das durações válidas dos apontamentos do agente no período, incluindo tempo não faturável. Exibir em horas/minutos, sem converter automaticamente em custo.
- **Chamados com tempo registrado:** tickets distintos com pelo menos um apontamento válido do agente no recorte.
- **Tempo médio por chamado com apontamento:** tempo registrado dividido pela quantidade desses tickets, não pela quantidade de chamados respondidos. Um ticket com atividade interna também pode ter tempo sem resposta pública.
- **Cobertura:** mostrar ausência/indisponibilidade de apontamentos e período efetivamente coletado. Sem registro não significa zero esforço.

Atribuir o tempo ao agente do apontamento, não automaticamente a quem criou o lançamento ou ao responsável atual do ticket. Confirmar os campos na conta real. Deduplicar pelo ID da entrada e substituir valores nas edições; considerar exclusões na reconciliação. O período deverá usar a data de execução/atividade acordada, não simplesmente a criação do lançamento. Normalizar horas, minutos e segundos e validar valores ausentes/incompatíveis, sem truncar durações maiores que 24 horas.

O Zoho permite timers simultâneos: somar apontamentos não equivale necessariamente a horas únicas de jornada. Não somar durações ao longo de métricas distintas ou usar esse número isoladamente como classificação de produtividade. A comparação por pessoa precisa da mesma configuração de rastreamento e de contexto de atendimento.

## Atualização sugerida

1. Conexão de leitura do Worker/servidor ao Zoho Desk com OAuth, mantendo segredos no servidor.
2. Coleta inicial para um período acordado e atualizações incrementais; intervalo inicial proposto de 15–30 minutos, condicionado ao volume, à edição e aos créditos disponíveis.
3. Deduplicação por organização + ticket + resposta e reconciliação após falhas. Retomar a última sincronização confirmada, com paginação completa e margem de sobreposição; não substituir uma base completa por coleta parcial nem apresentar ausência de dados como zero.
4. Consulta do dashboard sujeita às permissões existentes, com última atualização, período coberto e eventual estado de coleta incompleta. A primeira liberação pode ser restrita a administradores.

O cache/histórico da integração exige decisão própria de armazenamento e retenção; o D1 de usuários/permissões não deve passar a guardar conversas automaticamente. Para os indicadores, priorizar identificadores, autor, horário, canal, visibilidade e estado do envio, evitando copiar texto das mensagens e anexos sem necessidade definida.

Webhooks são uma alternativa posterior para receber novas respostas com menor atraso, se disponíveis no plano. Precisam de autenticação/verificação, deduplicação e reconciliação; não substituem a coleta de histórico. Não é necessário introduzir n8n para a integração direta, embora possa ser usado caso a empresa já o mantenha.

## Antes de implementar

- Confirmar edição/plano, créditos de API, região do portal e departamentos/canais incluídos.
- Obter autorização administrativa e configurar OAuth diretamente no servidor; nenhuma senha, chave ou token deve ser enviado no chat ou incluído no Git.
- Validar a identificação de autor, visibilidade, direção, envio concluído e automação em amostras dos canais usados. Não inferir autoria pelo agente atualmente designado.
- Mapear o ID do agente do Zoho ao responsável da planilha, com conferência por e-mail/cadastro explícito; grafias parecidas não bastam para unir pessoas.
- Definir período inicial, fuso, critérios finais dos indicadores, permissões e armazenamento. Até conhecer a cobertura, o histórico anterior não deve ser prometido como completo.
- Confirmar quais departamentos usam Time Tracking, quais ações são capturadas, se o modo é manual/automático e se existem timers simultâneos. Validar o agente e a data efetiva dos apontamentos.

## Referências verificadas

- [API oficial do Zoho Desk](https://desk.zoho.com/DeskAPIDocument?src=rest-api): autenticação OAuth e acesso aos recursos.
- [Documentação oficial de webhooks](https://desk.zoho.com/support/WebhookDocument.do): evento `Ticket_Thread_Add`; exemplo com identificador da interação, ticket, autor/responder, horário, direção, visibilidade, encaminhamento e estado. A amostra inclui estado pendente; receber o evento não comprova envio concluído.
- [Threads públicas e privadas](https://help.zoho.com/portal/en/kb/desk/ticket-management/ticket-replies/articles/public-and-private-threads-in-tickets): colaboração interna e encaminhamentos não devem ser confundidos com respostas ao cliente.
- [Créditos e concorrência da API](https://help.zoho.com/portal/en/kb/desk/developer-space/apidashboard/articles/working-with-api-credits): limites dependem da edição e são compartilhados pela organização.
- [Configuração oficial de Time Tracking](https://help.zoho.com/portal/en/kb/desk/ticket-management/time-tracking/articles/setting-up-time-tracking-and-billing-preferences-in-tickets): modos manual/automático, ações registradas e possibilidade de timers simultâneos. A documentação de webhooks também descreve inclusão, edição e exclusão de Time Entries.
