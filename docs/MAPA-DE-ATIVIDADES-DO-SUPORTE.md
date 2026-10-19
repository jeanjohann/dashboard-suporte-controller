# Mapa de atividades da Equipe de suporte

**Escopo aprovado pelo proprietário em 17/10/2026.** A visão reúne atividades por agente, período e origem, permitindo consultar o trabalho registrado no sistema atual e no Zoho Desk. A aprovação define a direção do desenvolvimento; a integração Zoho ainda depende das fontes reais e de sua configuração.

## Informações do painel

| Bloco               | Indicadores                                                                           | Fonte e regra de tempo                                                                       | Situação                                |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| OS · execução       | Intervenções efetivas, visitas improdutivas, chamados, clientes e veículos            | Responsável de execução; Data de atendimento; critérios realizados existentes                | Disponível                              |
| OS · agendamento    | Atribuição dos serviços realizados, com os mesmos indicadores próprios do papel       | Responsável de agendamento; data Agendamento. Não representa quando o usuário criou a agenda | Disponível                              |
| Zoho · comunicação  | Chamados respondidos e respostas enviadas por agente                                  | Autor e data da resposta pública enviada; deduplicação por resposta e por ticket             | Integração pendente                     |
| Zoho · presença     | Tempo de permanência, quantidade de sessões e entradas/saídas para conferência        | Intervalos das sessões de Agent Availability; considerar fuso, recorte e timeout             | Primeira leitura depende do CSV Session |
| Zoho · atendimentos | Tempo apontado, chamados com apontamento e média de tempo por chamado com apontamento | Agente/data da atividade no Time Entry; somar durações válidas, incluindo não faturáveis     | Fonte real e configuração pendentes     |

Tempo de permanência, tempo apontado e quantidade de respostas são medidas distintas. O painel não os transforma em uma pontuação única. Horas no sistema não comprovam trabalho contínuo; horas apontadas não equivalem automaticamente a horas únicas de jornada, especialmente com timers simultâneos. Chamados do Zoho e números de OS não são unidos automaticamente.

## Organização da tela

**Seção real em 0.36.1:** o quadro fictício de 0.28.0 foi retirado dos relatórios da Equipe de suporte. O mapa atual fica em **OS → Zoho Desk**, com atividade real de Eduardo e Jean, tempos por chamado, métricas acumuladas e vínculo manual com responsáveis das OS. Consulta real da API concluída em 19/10/2026 após renovar a autorização de pesquisa. Respostas com critérios incompletos exigem conferência. Permanência por sessões, CSV Session, persistência e automação continuam pendentes; não são preenchidos com dados de demonstração. [Critérios e cobertura](INTEGRACAO-ZOHO-DESK.md).

1. **Contexto e filtros:** período, agente e alcance de cada fonte. Manter os atalhos de semana, mês e ano e a independência da categoria Equipe de suporte.
2. **Resumo da equipe:** blocos identificados de OS, comunicação Zoho e tempos, com última atualização/cobertura das fontes externas. Indisponibilidade aparece como pendência, não como zero.
3. **Cards por pessoa:** manter os números atuais das OS e acrescentar, após validar a integração, chamados respondidos, respostas, tempo no Zoho e tempo apontado. A média por chamado com apontamento pode ficar na faixa complementar ou no detalhe para preservar a leitura compacta.
4. **Detalhamento ao clicar no agente:** OS e originais existentes; tickets/respostas do Zoho; sessões de presença; apontamentos de tempo. Mostrar referências de origem e permitir exportação conforme a permissão existente.
5. **Comparação e evolução:** usar o mesmo intervalo selecionado, com unidades e fontes identificadas. Contagens e durações ficam em gráficos adequados; comparação anterior depende da cobertura efetiva de ambas as janelas.

Período e agente podem orientar a leitura conjunta após validar seus vínculos. Campos específicos das OS, como motivo, técnico, cidade e tipo de serviço, não passam a filtrar dados Zoho sem correspondência comprovada. O alcance deve permanecer visível: por exemplo, “OS · filtros da categoria” e “Zoho · período e agente”. Departamentos/canais do Zoho terão seu contexto próprio se incluídos no piloto.

## Identificação dos agentes

O cadastro do Zoho fornece o ID do agente e, quando permitido, seu e-mail/nome. O vínculo com os responsáveis escritos na planilha será explícito e conferido. Nomes semelhantes não bastam para unir pessoas; grafias/aliases só podem ser agrupadas por associação validada, preservando os originais. Agentes não vinculados permanecem disponíveis para revisão, sem atribuição automática ao responsável errado.

Se duas pessoas respondem ao mesmo ticket, cada uma pode ter um chamado respondido em seu card. O total da equipe deduplica o ticket. A autoria da resposta e do apontamento não deve ser substituída pelo responsável atual do chamado.

## Sequência de implementação

| Etapa | Entrega                                                             | Entrada necessária                                                                                      | Critério de conclusão                                                                                               |
| ----- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1     | Leitura e conferência da disponibilidade, inicialmente local        | CSV de Agent Availability, visão Session, com um período de exemplo; fuso e configuração de inatividade | Totais por pessoa conferidos com o Zoho; sessões abertas, inválidas, duplicadas e sobrepostas identificadas         |
| 2     | Vínculo dos agentes e primeiras visualizações de presença           | Estrutura real do CSV e correspondência validada com responsáveis das OS                                | Cards/detalhes têm identificação e alcance claros; filtros e permissões anteriores preservados                      |
| 3     | Chamados, respostas e Time Entries pela conexão autorizada          | Portal/plano, acesso administrativo, OAuth configurado no servidor e amostras dos canais usados         | Autoria, envio, durações e datas validados; sincronização incremental deduplicada e cobertura informada             |
| 4     | Painel conjunto, relatórios e atualização automática onde suportada | Fontes anteriores conciliadas; decisão de armazenamento/retenção e acesso                               | Comparações e exportações reproduzem as bases; falha/coleta parcial não substitui dados completos nem fabrica zeros |

Os detalhes de disponibilidade podem ser automatizados somente depois de confirmar uma fonte adequada na conta. Nenhum endpoint público desse histórico foi confirmado. n8n ou outra ferramenta de orquestração não substitui essa validação.

## O que falta agora

- CSV de exemplo: **Analytics → Reports → Static Reports → Agent Availability → Session → exportar CSV**, preferencialmente de uma semana.
- Endereço do portal e plano do Zoho Desk: em 17/10, o proprietário informou que poderá enviá-los na segunda-feira, **19/10/2026**. Nenhuma credencial foi solicitada no chat.
- Conferência de fuso, timeout de inatividade, uso manual/automático do Time Tracking e identificação dos agentes.

Configurar segredos somente no ambiente autorizado do servidor. A primeira leitura local não requer publicar o arquivo nem alterar o Zoho. A futura integração consultará os dados com autorização, seguindo as permissões do sistema. O banco atual de usuários/permissões mantém sua finalidade; a aprovação do painel não altera automaticamente seu conteúdo.

Regras detalhadas e referências oficiais: [Integração Zoho Desk](INTEGRACAO-ZOHO-DESK.md). Critérios atuais das OS: [Equipe de suporte](EQUIPE-DE-SUPORTE.md).
