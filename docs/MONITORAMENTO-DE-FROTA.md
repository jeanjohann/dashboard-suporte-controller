# Monitoramento Ativo — em preparação

## Tabela prioritária e tratamento — 0.19.0

O nome visível é **Monitoramento Ativo**; a permissão permanece `monitoring`, sem alterar os acessos cadastrados. Na demonstração, a ordem da visão analítica é filtros, aviso de demonstração, fila, cards e gráficos. Fontes/controles mais compactos são específicos da página; o celular mantém área de toque adequada e rolagem própria da tabela.

A fila expõe Placa, ID rastreador, Cliente/Base, Última atualização, Alimentação em **volts** e Perfil como nome/código de configuração. O contrato interno usa `plate`, `trackerId`, `clientName`/`clientId`, `lastRecordAt`, `supplyVoltageV` e `profile`; o adaptador do JSON real ainda será definido. Zero de alimentação é preservado, ausência é Não informado. A tela pode arredondar a três casas, mas exporta o valor numérico original. Perfil é apresentado como recebido. Não há limites ou alertas de tensão/perfil nesta etapa.

Sinais exclusivos: verde para menos de 48 h, atenção para 48 a menos de 72 h, laranja para 72 a menos de 96 h, crítico para 96 h ou mais. Legenda e texto acompanham as cores. Essas faixas fixas independem do limite escolhido. Coleta desatualizada, data inválida/futura e ausência de registro ficam neutras, mesmo havendo duração histórica conhecida. Abaixo de 2 dias não significa online neste instante.

Clicar no status de Acompanhamento abre um painel compacto abaixo da fila, com formulário e histórico. **Salvar atualização** acrescenta data/hora da ação, status, responsável e observação. Digitação é apenas rascunho e não muda a tabela nem entra no relatório. Pode salvar observação mantendo status, ou alteração de status/responsável sem observação. Sem alteração ou texto, o registro é recusado. Eventos antigos não são editados/excluídos nesta etapa.

As datas do tratamento são da ação do usuário, diferentes da referência congelada da telemetria fictícia. O histórico usa base + veículo do contrato interno, não placa isolada. A API precisará oferecer ou permitir confirmar uma chave estável de veículo; não criar identidade por placa ou nome parecido automaticamente.

CSV/XLSX incluem tratamento registrado dos veículos do recorte, independentemente da página da fila. O XLSX inclui aba Histórico; impressão da fila inclui a página apresentada e o histórico selecionado, excluindo formulário de rascunho. Tudo fica **somente na sessão de demonstração**, desaparecendo ao recarregar ou sair dela. Não há gravação do monitoramento no navegador, D1 ou servidor, nem API real ativada.

## O que está disponível

A fila exibe dez veículos por página, com Anterior, Próxima e Último. O botão Último (0.19.1) leva ao fim do resultado filtrado e fecha os detalhes abertos. Fica desabilitado na última página, inclusive em resultados vazios ou com até dez veículos. Alterar filtros retorna à primeira página; a exportação continua abrangendo todo o recorte.

As nove colunas permitem ordenar pelo título: primeiro clique crescente, segundo decrescente e terceiro restaura a ordem inicial de maior duração conhecida. A ordenação usa todo o recorte antes da paginação e retorna à primeira página, fechando os detalhes. Datas usam o instante completo, duração e tensão numérica usam os valores originais; identificadores permanecem texto e valores ausentes ficam ao final nas duas direções. O status de acompanhamento usa somente atualizações salvas. Ordenar a tabela não altera filtros, indicadores ou dados de origem; CSV/XLSX mantêm a ordem original do recorte exportado.

A página inicia sem dados e permite ativar uma demonstração explícita, inteiramente fictícia, com referência congelada em 11/10/2026 às 10:00 no fuso de São Paulo. Nenhuma consulta à API, token, agendamento, notificação ou gravação de monitoramento no servidor foi implementada nesta etapa.

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
- `src/modules/monitoring/data/demo.js`: fonte fictícia isolada; não reutilizar como fallback de uma API com erro.
- `src/styles/monitoring.css`: organização da página com o tema compartilhado.

## Pendências antes de ativar dados reais

Confirmar campo/significado da última comunicação, fuso, chave estável do veículo, ID do rastreador, nomes do JSON para alimentação/perfil, escopo e descoberta das bases, validade dos tokens, paginação, limites e dados de consumo. Unidade de alimentação (volts) e significado geral de Perfil (configuração) foram confirmados pelo usuário. Definir infraestrutura, retenção do histórico e permissões por base. O serviço de coleta deverá rodar no servidor mesmo com a página fechada, com credenciais protegidas e registro de falhas da integração. Um retorno parcial não deve ser tratado como desaparecimento de veículos.

Não foram adicionados dados reais ao servidor. O futuro armazenamento de monitoramento será uma alteração explícita de arquitetura; as planilhas dos módulos existentes continuam locais.
