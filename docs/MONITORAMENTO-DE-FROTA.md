# Monitoramento Ativo

## Conexão real — 0.50.0

O botão **Consultar integração** carrega o diagnóstico do sistema legado Addlog pelo servidor, com credenciais em segredos do Cloudflare. A primeira leitura real foi conferida em 21/10/2026, incluindo fila ordenável, detalhes do equipamento e indicadores analíticos. O escopo são todas as bases retornadas pelo legado; os demais sistemas de rastreamento não foram conectados.

O painel converte a última comunicação UTC e apresenta posições nas últimas 24 horas, alimentação e perfis. Dados ausentes continuam ausentes; perfis aplicados sem nome ficam identificados dessa forma. Posições não representam consumo de dados M2M. A coleta marca o recebimento no servidor, mantendo a geração da API como texto enquanto seu fuso não for confirmado.

Atualização manual com intervalo mínimo de um minuto, sem coleta agendada. Falhas por base ou resposta incompatível mantêm a frota anterior com coleta indisponível. Tratamentos continuam na sessão e lembretes no navegador. [Configuração, mapeamento e limites](INTEGRACAO-MONITORAMENTO.md). As seções abaixo registram as entregas anteriores; menções históricas a API ainda não conectada foram superadas por esta versão.

## Lembretes de conferência — 0.41.0

No histórico de cada veículo, **Agendar lembrete** recebe data/hora e observação opcional. Há um lembrete ativo por **base + ID do veículo**; placa e rastreador são identificação visual, sem unir placas iguais de bases diferentes. Reagendar, cancelar ou marcar como conferido preserva data da ação, previsão e observação em histórico próprio. Conferir permite registrar resultado opcional e não confirma que a comunicação voltou, não encerra o tratamento e não muda os indicadores técnicos. Um novo ciclo conserva o histórico anterior.

O painel **Lembretes de conferência**, no topo de todas as categorias do Monitoramento Ativo, mostra vencidos e próximos, sem sofrer filtros da fila. Ao abrir a página, lê os registros locais **mesmo sem consultar a API ou carregar a frota**; veículos ausentes do retrato atual mantêm o lembrete acessível no painel para gestão manual. Vencidos ficam destacados e a lista abre automaticamente quando há pendências; os próximos e os encerrados podem ser consultados em blocos expansíveis. A fila indica lembretes ativos junto do acompanhamento.

Datas são explicitamente de **São Paulo** no formulário e na apresentação, mesmo com o computador em outro fuso; internamente são ISO em UTC. O agendamento/reagendamento exige data futura. Vencimento é inclusivo, comparado ao relógio real do computador ao abrir, retomar a página e a cada 30 segundos, inclusive na demonstração com telemetria congelada. O sistema não pede permissão de notificação, não emite avisos com a página fechada e não depende de um coletor para vencer os lembretes.

Somente **lembretes e seu histórico** ficam no IndexedDB `addlog-monitoring-reminders`, versão 1. A chave separa a identidade do usuário autenticado (ou o modo local sem gestão) e demonstração/dados reais. Não há sincronização entre usuários, navegadores ou computadores; limpar os dados deste site remove os lembretes. O isolamento local organiza os registros, não substitui autorização do servidor nem oferece criptografia. A permissão de acesso à página permanece a existente. Transações e revisão por veículo recusam edição sobre uma revisão antiga; abas são atualizadas via BroadcastChannel quando disponível e ao retornar o foco. Erros de leitura/formato não viram lista vazia nem autorizam sobrescrita; salvamento só é confirmado ao concluir a transação.

**Exportar histórico CSV** no painel inclui todos os eventos locais do modo atual, inclusive conferidos/cancelados e veículos fora da fila/frota atual. CSV/XLSX do relatório incluem somente lembretes dos veículos do recorte; o XLSX tem aba **Lembretes**, com IDs textuais e datas ISO. Exportação respeita a permissão existente. O CSV permite consulta externa, mas não é backup restaurável: não há importação de lembretes nesta etapa.

Notas de **tratamento** continuam somente na sessão. A persistência de lembretes não ativa API de fornecedor, coleta automática, banco remoto ou armazenamento de telemetria. As seções de versões anteriores abaixo são históricas; referências a ausência de gravação/agendamento não incluem os lembretes locais adicionados nesta versão.

**Destino aprovado dos lembretes:** a futura integração com o banco deverá salvar nele a agenda e todo o histórico, tornando-os disponíveis em outros computadores autorizados. A entrega inclui adaptar o repositório/API e migrar os registros reais dos navegadores de origem, preservando datas, observações, resultados e eventos; criar o banco sozinho não ativa essa troca. Dados de demonstração não serão migrados para a agenda real. Compartilhamento e permissões serão definidos antes da ativação. Critérios completos em [Preparação para banco de dados](PREPARACAO-BANCO-DE-DADOS.md#requisito-aprovado-lembretes-do-monitoramento-no-banco).

## Organização atual — 0.21.0

A página inicia em **Acompanhamento**: filtros no topo, busca por placa/rastreador/cliente/perfil/responsável, seleção de situação técnica, status administrativo e recorte, seguidos da fila e do histórico selecionado. **Visão analítica** contém somente indicadores e gráficos; **Relatórios** contém as exportações. As descrições de fila junto da análise em versões abaixo são históricas e foram substituídas por esta organização.

Doze cards: frota, acima do limite, 96 h ou mais, sem posição, alertas não iniciados/em análise/aguardando contato/com manutenção agendada, bases afetadas, maior tempo acima do limite, sem classificação utilizável e encerrados ainda acima do limite. Todos permitem abrir a fila correspondente, mantendo bases/limite e limpando busca/situação/status/recorte anteriores. Conferir uma base na tabela restringe também a base selecionada.

Cards e gráficos usam todas as situações das bases selecionadas. Busca, situação, status e recorte pertencem somente à fila e à exportação de veículos. Em acompanhamento = Em análise + Aguardando contato + Manutenção agendada **entre os veículos acima do limite**. Cobertura divide essa quantidade pelo total acima do limite; sem alertas, percentual ausente. Encerrados ainda acima do limite ficam explícitos e não são recuperações. Coletas sem qualidade não participam de alertas ou maior duração.

CSV/XLSX incluem indicadores e resumo por base, além de veículos e histórico. As duas primeiras bases não são recortadas pela busca da fila e isso é informado no contexto. Não há mais série temporal fictícia na análise: evolução real dependerá do armazenamento das coletas.

A consulta autenticada manual e o contrato interno estão preparados, mas não há fornecedor conectado. O botão Consultar integração retorna indisponibilidade até configurar o coletor privado. Nenhum token é solicitado na interface. Consulte [Integração do monitoramento](INTEGRACAO-MONITORAMENTO.md) para schema, autorização, tratamento de falhas e pendências de ativação. Notas permanecem somente na sessão, inclusive no caminho de dados reais preparado. A referência real é atualizada localmente a cada minuto sem renovar o instante da coleta; demonstração conserva referência congelada.

## Tabela prioritária e tratamento — 0.19.0

O nome visível é **Monitoramento Ativo**; a permissão permanece `monitoring`, sem alterar os acessos cadastrados. Na demonstração, a ordem da visão analítica é filtros, aviso de demonstração, fila, cards e gráficos. Fontes/controles mais compactos são específicos da página; o celular mantém área de toque adequada e rolagem própria da tabela.

A fila expõe Placa, ID rastreador, Cliente/Base, Última atualização, Alimentação em **volts** e Perfil como nome/código de configuração. O contrato interno usa `plate`, `trackerId`, `clientName`/`clientId`, `lastRecordAt`, `supplyVoltageV` e `profile`; o adaptador do JSON real ainda será definido. Zero de alimentação é preservado, ausência é Não informado. A tela pode arredondar a três casas, mas exporta o valor numérico original. Perfil é apresentado como recebido. Não há limites ou alertas de tensão/perfil nesta etapa.

Sinais exclusivos: verde para menos de 48 h, atenção para 48 a menos de 72 h, laranja para 72 a menos de 96 h, crítico para 96 h ou mais. Legenda e texto acompanham as cores. Essas faixas fixas independem do limite escolhido. Coleta desatualizada, data inválida/futura e ausência de registro ficam neutras, mesmo havendo duração histórica conhecida. Abaixo de 2 dias não significa online neste instante.

Clicar no status de Acompanhamento abre um painel compacto abaixo da fila, com formulário e histórico. **Salvar atualização** acrescenta data/hora da ação, status, responsável e observação. Digitação é apenas rascunho e não muda a tabela nem entra no relatório. Pode salvar observação mantendo status, ou alteração de status/responsável sem observação. Sem alteração ou texto, o registro é recusado. Eventos antigos não são editados/excluídos nesta etapa.

As datas do tratamento são da ação do usuário, diferentes da referência congelada da telemetria fictícia. O histórico usa base + veículo do contrato interno, não placa isolada. A API precisará oferecer ou permitir confirmar uma chave estável de veículo; não criar identidade por placa ou nome parecido automaticamente.

CSV/XLSX incluem tratamento registrado dos veículos do recorte, independentemente da página da fila. O XLSX inclui aba Histórico; impressão da fila inclui a página apresentada e o histórico selecionado, excluindo formulário de rascunho. O tratamento fica **somente na sessão**, desaparecendo ao recarregar ou sair dela. Lembretes possuem armazenamento local próprio desde 0.41.0; não há D1 de negócio ou API real ativada.

## O que está disponível

A fila exibe dez veículos por página, com Anterior, Próxima e Último. O botão Último (0.19.1) leva ao fim do resultado filtrado e fecha os detalhes abertos. Fica desabilitado na última página, inclusive em resultados vazios ou com até dez veículos. Alterar filtros retorna à primeira página; a exportação continua abrangendo todo o recorte.

As nove colunas permitem ordenar pelo título: primeiro clique crescente, segundo decrescente e terceiro restaura a ordem inicial de maior duração conhecida. A ordenação usa todo o recorte antes da paginação e retorna à primeira página, fechando os detalhes. Datas usam o instante completo, duração e tensão numérica usam os valores originais; identificadores permanecem texto e valores ausentes ficam ao final nas duas direções. O status de acompanhamento usa somente atualizações salvas. Ordenar a tabela não altera filtros, indicadores ou dados de origem; CSV/XLSX mantêm a ordem original do recorte exportado.

A página inicia sem dados e permite ativar uma demonstração explícita, inteiramente fictícia, com referência congelada em 11/10/2026 às 10:00 no fuso de São Paulo. A consulta manual preparada depende de configurar o coletor. Não há notificação externa ou gravação de monitoramento no servidor; o agendamento manual de lembretes locais está disponível desde 0.41.0.

Há filtros por múltiplas bases, limite de atenção e situação técnica; cards, distribuição temporal, comparação por base, fila paginada, detalhes e rascunhos de acompanhamento. A série de coletas é ilustrativa, limitada à demonstração, usa todas as bases e o limite fixo de 48 horas. Ela não afirma horários reais de falhas ou recuperação.

## Critérios provisórios para avaliação

- Identificação: base + ID do veículo; placa não é chave única. ID do rastreador é mantido em campo próprio.
- Tempo: diferença entre o último registro e a referência, sem arredondamento antes da classificação.
- Limites inclusivos de atenção: 48, 72 ou 96 horas. Faixas exclusivas: 48 a menos de 72, 72 a menos de 96, 96 ou mais. Abaixo de 48 horas fica fora das barras, mas participa da frota.
- “Abaixo do limite” não significa online neste instante. Ainda falta confirmar se a API expõe instante de geração ou recebimento do último registro.
- Datas internas exigem ISO com fuso. Datas inválidas ou futuras são revisão, não duração zero.
- Ausência de registro é “Sem posição registrada”, sem duração inventada.
- Coleta precisa ser bem-sucedida, com instante válido e idade inferior a 2 horas; esse prazo é provisório. Se a coleta falhar ou estiver desatualizada, a duração conhecida pode aparecer, mas o veículo não entra em novos alertas confirmados nem nas barras.
- Identificação ausente ou duplicada exclui o grupo antes dos filtros, contabilizando os registros para revisão.
- Percentuais usam todos os veículos identificados das bases selecionadas, inclusive sem posição e coleta desatualizada. Cards e gráficos abrangem todas as situações; o filtro de situação recorta a tabela e a exportação de veículos.

Esses critérios são uma proposta para validação, não uma política operacional definitiva. Não existe adaptador para as datas brasileiras da API ainda: fuso e significado precisam ser confirmados primeiro.

## Acompanhamento e relatórios

Responsável, observação e situação administrativa podem ser preenchidos nos detalhes. São rascunhos até clicar em Salvar atualização; somente registros confirmados entram no histórico e nos relatórios. Tudo permanece em memória: desaparece ao recarregar, sair da demonstração ou perder a sessão. Encerrar acompanhamento não altera a comunicação técnica nem modifica os exemplos ou planilhas existentes.

CSV e XLSX exportam todos os veículos do recorte, independentemente da página exibida. Incluem modo de demonstração, referência, filtros, critérios, alimentação/perfil e tratamento registrado. XLSX oferece resumo por base, com percentuais numéricos, e aba Histórico. Nomes dos arquivos e conteúdo identificam **DEMO / DADOS FICTÍCIOS**. Impressão das seções segue a permissão de exportação; a fila imprime a página apresentada.

Histórico individual de ocorrências, recuperações, consumo por equipamento, persistência compartilhada e notificações ficam para as próximas etapas. O consumo depende da confirmação dos campos, unidade e período da informação retornada pelo equipamento.

## Permissões

`monitoring` é uma página independente em Usuários e permissões. Administradores podem acessá-la; usuários comuns precisam da concessão explícita, sem liberação automática. Exportação segue a permissão separada já existente. Monitoramento não concede importação de OS, operacional ou consumo. A estrutura do banco D1 não mudou.

## Código e manutenção

- `src/modules/monitoring/components/MonitoringPage.jsx`: página, filtros, rascunhos e ações.
- `src/modules/monitoring/components/MonitoringQueue.jsx`: fila, sinais, formulário e histórico de tratamento.
- `src/modules/monitoring/domain/monitoring.js`: contrato normalizado, qualidade das coletas, classificação e indicadores.
- `src/modules/monitoring/domain/monitoringReport.js`: tabelas de relatório, CSV e XLSX.
- `src/modules/monitoring/domain/monitoring.test.js`: limites, duplicidade, coleta, datas e exportação.
- `src/modules/monitoring/domain/monitoringReminders.js`: agenda, transições, validação e histórico exportável de lembretes.
- `src/modules/monitoring/data/reminderRepository.js`: transações locais, escopo e revisão por veículo.
- `src/modules/monitoring/hooks/useMonitoringReminders.js`: leitura, relógio real, foco e atualização entre abas.
- `src/modules/monitoring/components/MonitoringReminders.jsx` e `MonitoringReminderEditor.jsx`: resumo global e formulário de lembretes.
- `src/modules/monitoring/data/demo.js`: fonte fictícia isolada; não reutilizar como fallback de uma API com erro.
- `src/styles/monitoring.css`: organização da página com o tema compartilhado.

## Pendências antes de ativar dados reais

Confirmar campo/significado da última comunicação, fuso, chave estável do veículo, ID do rastreador, nomes do JSON para alimentação/perfil, escopo e descoberta das bases, validade dos tokens, paginação, limites e dados de consumo. Unidade de alimentação (volts) e significado geral de Perfil (configuração) foram confirmados pelo usuário. Definir infraestrutura, retenção do histórico e permissões por base. O serviço de coleta deverá rodar no servidor mesmo com a página fechada, com credenciais protegidas e registro de falhas da integração. Um retorno parcial não deve ser tratado como desaparecimento de veículos.

Não foram adicionados dados reais ao servidor. O futuro armazenamento de monitoramento será uma alteração explícita de arquitetura; as planilhas dos módulos existentes continuam locais.
