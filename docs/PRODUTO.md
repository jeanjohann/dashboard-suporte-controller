# Suporte Controller — produto e regras de negócio

Atualizado em 17/10/2026. Versão atual: 0.26.0. Equipe de suporte com cards e investigação por pessoa; regras em [Equipe de suporte](EQUIPE-DE-SUPORTE.md). Visão geral de OS com dez cards e paleta por grupo; bases e limites em [Cards de OS](CARDS-DE-OS.md). Filtros independentes por categoria, conforme escolha do proprietário; detalhes e exceções em [Filtros por categoria](FILTROS-POR-CATEGORIA.md). As seções de versões anteriores registram a evolução histórica.

## Objetivo

Importar a planilha de ordens de serviço da Addlog para consulta, conferência e análises de gestão e apresentações. A planilha é utilizada pelo financeiro para controlar serviços cobrados de clientes, custos absorvidos pela Addlog e pagamentos de técnicos. Também registra eventos associados aos equipamentos.

## Regras atuais e referências

Equipe de suporte: Execução, Agendamento ou Ambos. Ambos compara os papéis sem somá-los, com datas, bases, detalhes e exportações próprios. Critérios em [Equipe de suporte](EQUIPE-DE-SUPORTE.md).

- Uma linha de OS é um atendimento; o número da OS identifica um chamado, que pode conter várias linhas. A ordem e os valores de origem são preservados.
- Indicadores de realizados exigem Status exatamente Concluída ou Pago. Pago significa pagamento ao técnico. Variações de escrita e incoerências com Pago em geram avisos de revisão, sem normalização automática nem mudança dos totais.
- Km é despesa de deslocamento em reais. Custo Total lançado permanece oficial, mesmo divergindo de Técnico + Km. Ausências não viram zero; médias usam valores válidos do próprio campo, incluindo zero. Valor a cobrar é contratual, separado por Cobrança Cliente/Addlog, sem comprovar receita ou lucro.
- Manutenção efetiva exclui Visita Improdutiva nos indicadores que assim especificam. Custos financeiros válidos das improdutivas são mantidos. Os modos do relatório por veículo têm populações explícitas.
- Troca de rastreador exige o par realizado de retirada/entrada no mesmo chamado, cliente, placa e data, com seriais diferentes. Reinstalação participa somente com par confirmado. Acessórios exigem troca/trocar explícito e categoria identificada; manutenção genérica não confirma substituição.
- Vida em campo até primeira troca e tempo até retirada são análises distintas. Média até troca usa apenas trocas confirmadas; tempo acompanhado inclui os encerramentos/limites válidos e tem base própria. Sem troca ou sem retirada não comprova atividade ou ausência de falha. Consulte [Vida em campo](VIDA-EM-CAMPO.md).
- Identificadores preservam zeros, acentos e hífens. Vínculos incertos não são corrigidos automaticamente. Cabeçalhos repetidos ficam acessíveis pela posição/letra e são sinalizados; consultas por nome continuam usando a primeira ocorrência.
- OS possui categorias de análise, filtros globais e busca restrita à tabela. OS e consumo mantêm filtros independentes. Ordenação das tabelas paginadas de OS, operacional e consumo considera o recorte completo antes da paginação.
- Consumo preserva períodos, precisão, referência por operadora/apuração e histórico local com backup. Franquia compartilhada não significa saldo global por operadora nem bloqueio por exceder 20 MB. Consulte [Consumo](CONSUMO-DE-LINHAS.md).
- Importação/exportação seguem as permissões atuais. Esta entrega não muda autenticação, banco, fontes, backups ou contratos. OS/operacional permanecem na sessão; acompanhamento de consumo continua neste navegador.

Os guias de cada módulo descrevem as regras atuais: [Análises de OS](ANALISES-DE-OS.md), [Operacional](OPERACIONAL.md), [Parque e Manutenção](PARQUE-E-MANUTENCAO.md), [Logística](LOGISTICA-DE-EQUIPAMENTOS.md), [Monitoramento](MONITORAMENTO-DE-FROTA.md) e [Permissões](USUARIOS-E-PERMISSOES.md). Correções da revisão crítica em [0.20.6](CORRECOES-DA-ANALISE-CRITICA.md). Pendências atuais em [Fila de ajustes](PROXIMOS-AJUSTES.md).

## Registro histórico das versões iniciais

As seções abaixo registram decisões e limitações da época de cada versão. Não são uma lista do que ainda falta implementar. Regras antigas sobre troca de acessórios, reinstalação, navegação e análises propostas foram substituídas pelas referências atuais acima; o histórico é mantido para rastreabilidade.

Versão 0.8.0: detalhes dos registros por mês/grupo, ordenação por cabeçalho, impressão/PDF por seção e ranking de técnicos. Ranking usa Cód. como chave e mostra os nomes associados. Somente Concluída/Pago; código inválido exclui a linha do ranking com contagem. Código zero é válido. Chamados são distintos dentro de cada técnico e não aditivos entre técnicos.

Médias de custo total, técnico e deslocamento dividem a soma pela quantidade de valores válidos do próprio campo, incluindo zeros; Custo Total lançado permanece oficial. Média de deslocamento quando cobrado considera apenas valores maiores que zero. Sem denominador, exibir indisponível, sem transformar em zero. Exclusões por campo ficam visíveis. O ranking mede volume/custos, não qualidade/produtividade. Manutenção sem troca fica para etapa futura.

Impressão usa diálogo do navegador com Salvar como PDF; não gera automaticamente um PDF no servidor. Detalhes de origem preservados. Ordenação é só visual, com valores interpretados e ausentes ao final; atendimentos são ordenados antes da paginação. Clique crescente, decrescente, depois ordem padrão.

Na versão 0.7.1, Cidade passa a integrar os filtros principais com seleção múltipla e combinação com UF. A tabela de atendimentos oferece navegação direta à última página da seleção/busca atual, sem alterar a ordem original.

Layout aprovado: tela única com seções bem definidas, todas visíveis por padrão, recolhíveis e opcionais. Preferência de visibilidade salva localmente; dados e regras de cálculo preservados. Quatro telas separadas não foram adotadas por preferência do usuário.

Tipos de gráfico: barras, linhas, pizza/rosca e tabela nos relatórios. Pizza/rosca exigem valores aditivos não negativos com total positivo; chamados distintos por grupos são bloqueados. Não agrupar automaticamente categorias em Outros. Exibir avisos e manter rastreabilidade e exclusões. Recharts fornece interação; exportação SVG disponível.

| Recurso                                                     | Situação                     |
| ----------------------------------------------------------- | ---------------------------- |
| React e importação manual de Excel                          | Implementado                 |
| Leitura de OS 2025_26 ou OS 2025, preservando a ordem       | Implementado                 |
| Contagem de linhas e chamados distintos                     | Implementado                 |
| Busca, paginação e revisão estrutural de células            | Implementado                 |
| Contagens por status e detalhamento por chamado             | Implementado na versão 0.2.0 |
| Custos e valores contratuais de serviços realizados         | Implementado na versão 0.2.0 |
| Filtros combinados e gráfico mensal de realizados           | Implementado na versão 0.3.0 |
| Relatórios personalizados e histórico por placa/serial      | Implementado na versão 0.5.0 |
| Exportação CSV e gráfico SVG                                | Implementado na versão 0.6.0 |
| Configurações salvas e ciclos encerrados de tempo observado | Implementado na versão 0.6.0 |
| Tempo sem retirada registrada com referência selecionável   | Implementado na versão 0.6.1 |

## Conceitos e contagens aprovadas

Na versão 0.5.1, filtros adicionais abrangem as demais colunas importadas, usando valores exibidos e identificação por índice/letra para cabeçalhos repetidos. Permitem seleção múltipla e ausência de dados. Não adicionam regras de conversão, agrupamento de clientes ou interpretação financeira.

Na versão 0.3.1, os campos de categoria permitem múltiplos itens. Itens do mesmo campo combinam-se por OU; campos distintos combinam-se por E. Seleção vazia significa Todos. Essa ampliação não muda regras financeiras, datas ou contagem de chamados e não duplica registros.

Na versão 0.3.0, os indicadores e detalhamento seguem os filtros combinados. Cliente é selecionado por razão social, sem decisão definitiva sobre CNPJ. O gráfico mensal usa somente realizados. Registros sem data são excluídos do período apenas quando ele está ativo, com quantidade informada. A busca textual afeta somente a tabela. Estas regras substituem o comportamento de seleção da versão 0.2.0 descrito abaixo.

Na versão 0.2.0, contagens e detalhamento usam toda a importação e não são alterados pela busca da tabela. Classificação exige os valores exatos Concluída, Pago e Cancelada; demais valores aparecem em Demais status. Cabeçalho Status ausente torna a análise indisponível. Nenhuma normalização automática é aplicada.

**Chamado:** identificado pelo número da OS na coluna A. Pode conter várias linhas. Números repetidos não devem ser removidos como duplicatas.

**Atendimento:** cada linha individual vinculada a um chamado. Importação não significa execução: a linha pode estar realizada, pendente ou cancelada.

| Indicador                 | Regra                                                 |
| ------------------------- | ----------------------------------------------------- |
| Linhas importadas         | Cada linha com número de OS conta uma vez             |
| Chamados distintos        | Cada número de OS conta uma vez no conjunto analisado |
| Atendimentos realizados   | Linhas com status Concluída ou Pago                   |
| Atendimentos cancelados   | Linhas com status Cancelada                           |
| Chamados com cancelamento | Chamados distintos com pelo menos uma linha Cancelada |

O detalhamento por chamado deve mostrar as quantidades realizadas, canceladas e pendentes. Um chamado com situações diferentes não é automaticamente cancelado por inteiro. A regra para declarar um chamado totalmente concluído ainda precisa ser definida.

## Status e tipos de serviço

| Campo e valor                  | Significado aprovado                                                     |
| ------------------------------ | ------------------------------------------------------------------------ |
| Status = Concluída             | Serviço executado e finalizado                                           |
| Status = Pago                  | Serviço executado e finalizado; técnico já pago                          |
| Status = Cancelada             | Cliente cancelou o serviço; não houve atendimento                        |
| Tipo de Serviço = Cancelamento | Retirada do equipamento motivada por cancelamento, associada à devolução |

O tipo Cancelamento distingue essa retirada de uma retirada para reinstalação. Não significa cancelamento do atendimento e, sozinho, não comprova devolução efetiva do equipamento. Agendar e Agendado existem na base; suas regras para previsões financeiras ainda precisam de aprovação.

## Regras financeiras aprovadas

| Campo              | Definição                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Cobrança = Cliente | Serviço cobrado do cliente                                                                                              |
| Cobrança = Addlog  | A Addlog absorve o custo do serviço                                                                                     |
| Valor a cobrar     | Valor contratual individual de cada linha, cobrado do cliente ou absorvido pela Addlog; não é total de chamado repetido |
| Técnico            | Valor em reais do serviço técnico, separado do deslocamento                                                             |
| Km                 | Valor em reais do deslocamento de ida e volta informado pelo técnico; não é distância                                   |
| Custo Total        | Total lançado para serviço técnico e deslocamento; fonte oficial para cálculo de custos                                 |
| Pago em            | Data registrada de pagamento ao técnico; não representa recebimento do cliente                                          |

**Divergência:** a relação esperada é `Custo Total = Técnico + Km`. Quando divergir, sinalizar para conferência manual e continuar usando Custo Total. Não substituir nem recalcular o total lançado. A tolerância monetária da comparação está pendente.

**Cancelada:** ignorar todos os valores financeiros da linha, inclusive cobrança, técnico, deslocamento e custo total, mesmo quando preenchidos. Preservar o registro e o conteúdo original. Sua participação é apenas nas contagens de cancelamento e na consulta.

**Separação:** valores contratuais cobrados dos clientes, valores contratuais associados a serviços absorvidos pela Addlog e custos técnicos/deslocamento são medidas distintas. Não somar valor contratual absorvido e custo técnico como componentes de um mesmo custo. Valor a cobrar não comprova faturamento ou recebimento; diferença entre valor contratual e custo não representa lucro líquido.

## Datas e qualidade

- Gráficos mensais de atendimentos usarão Data de atendimento. Registros sem data ficam fora desses gráficos, com quantidade excluída informada.
- Nenhuma correção ou preenchimento automático está autorizado.
- Valores vazios ou incompatíveis podem ser ignorados apenas nas medidas que dependem deles; não excluir automaticamente a linha inteira.
- Zero é diferente de dado ausente.
- Corrigir na planilha original e importar novamente.
- Conversão de moeda em texto, padronização de categorias e tratamento de identificadores exigem revisão antes da implementação.

## Análises propostas

### Regra temporal 0.6.1

Início somente em instalação realizada cujo Tipo de Serviço seja Implementação. Instalações fora dessa condição são sinalizadas e não iniciam medição. Elas continuam sendo consideradas para detectar ambiguidades do histórico; não são descartadas silenciosamente. Vínculo por serial e placa; várias instalações sem retirada intermediária exigem revisão.

Períodos encerrados usam a data real de retirada. Sem retirada registrada, usar a referência escolhida, inicialmente data atual em America/Sao_Paulo. A referência afeta apenas períodos sem retirada e não reconstrói a situação passada de todo o arquivo. Dias corridos entre início e fim, permitindo zero dias em período aberto na mesma data. Referência anterior ao início impede cálculo e gera revisão. Eventos encerrados na mesma data seguem para revisão por falta de sequência horária.

Mostrar Sem retirada registrada, sem comprovar atividade, ausência de falhas ou vida útil completa. Casos de instalação anterior ao início da planilha permanecem limitados ao histórico disponível. Esta regra substitui as pendências temporais descritas nas versões anteriores. A referência permanece na sessão e não integra as configurações do explorador de relatórios.

### Evolução 0.6.0 — histórico e configurações

Períodos encerrados vinculam instalação anterior à retirada pelo mesmo serial e placa. Uma instalação inequívoca entre retiradas permite calcular dias corridos. Várias instalações, início ausente ou eventos na mesma data exigem revisão, sem duração automática. Os vínculos são resolvidos na importação completa; ambos os eventos devem estar na seleção. Tempo sem retirada aguarda definição da data de referência.

O usuário informa que Tipo de Serviço = Implementação identifica a primeira instalação. Esse campo ainda não altera a vinculação dos ciclos; seu uso como início obrigatório ou critério de histórico completo precisa de definição.

Configurações são salvas manualmente neste navegador, sem planilha ou registros. Incluem nome, agrupamento, medida, visualização, filtros e estrutura das colunas para verificar compatibilidade. Os filtros podem conter nomes/identificadores. Aplicar configuração recalcula a análise do arquivo atual e limpa a busca textual. Colunas incompatíveis impedem aplicação. Excluir remove somente a configuração local.

### Consultas da versão 0.5.0

O explorador agrupa por mês, razão social, nome do técnico, UF, tipo, motivo ou status. Medidas disponíveis: atendimentos realizados, chamados distintos com realizados, custo total, deslocamento e valores contratuais Cliente/Addlog. Todas usam somente Concluída/Pago e os filtros globais. Valores financeiros usam as regras aprovadas; agrupamento ausente/incompatível ou moeda inválida excluem a linha da medida com contagem informada. Chamados podem aparecer em vários grupos; não somar suas contagens como total distinto.

Visualizações: barras, tabela ou ambas. Meses são cronológicos e demais grupos ordenados por valor decrescente. A tabela permite consultar as linhas Excel que formam o grupo. Seleções não são persistidas e exportação ainda não existe.

Histórico consulta placa ou serial por correspondência exata dentro dos filtros globais. Mostra datas, chamado, status, placa, serial, motivo, instruções e linha Excel. Inclui todos os status selecionados, separando visualmente seu significado pela coluna Status. Datas ausentes ficam ao final; empates preservam ordem da origem. Não estima vida útil nem une ciclos automaticamente.

### Equipamentos — definições confirmadas em 03/10/2026

Na versão 0.4.0, identificação de trocas, contagens e gráficos foram implementados. A medida de tempo observado em campo continua pendente.

- Para rastreadores, a operação atual registra retirada e substituição como dois serviços: desinstalação e instalação. O usuário informa que a substituição na mesma placa indica problema no equipamento. A identificação automática do par ainda depende de regras de vínculo e ambiguidade.
- Registros marcados como reinstalação de rastreador devem ser apontados para revisão, sem interpretação automática como troca nesta etapa.
- Para acessórios, considerar serviços realizados de Assistência Técnica, com motivo Manutenção de Acessório, e classificação explícita pelas palavras em Instruções.
- Coletora, Teclado e Terminal de Jornada são nomes do mesmo tipo de acessório, associado ao Plano Business 2.1. A equivalência é autorizada apenas para esta classificação analítica; o conteúdo original permanece preservado.
- RFID identifica leitor RFID, associado ao Plano Business 2.0.
- Cada linha elegível de troca de acessório representa um item. Coletora e RFID não são instalados em conjunto nessa operação.
- A primeira medida temporal será denominada tempo observado em campo. Instalação ou retirada ausente exige indicação de histórico incompleto; não apresentar automaticamente como vida útil completa.
- Sem serial de acessório, contar eventos e intervalos registrados por contexto de placa/rastreador; não atribuir vida útil a uma unidade física individual.

Regras confirmadas: mesmo chamado e placa, ambos realizados, seriais distintos. Apenas um serviço de instalação e um de desinstalação no grupo; vários candidatos ou serial incompatível vão para revisão. Seriais iguais não confirmam troca e são sinalizados. Motivos reconhecidos explicitamente: Instalação e Desinstalação Business 2.0, Business 2.1, Start 1.0 e Turbo, conforme a base inicial. Instalação de Acessório não é instalação de rastreador. Novos motivos exigem ampliação revisada do mapeamento.

O vínculo é resolvido na importação completa para que filtros não escondam ambiguidades. Uma troca entra na seleção apenas quando ambas as linhas atendem aos filtros. A data do gráfico é a instalação substituta; eventos sem essa data não entram no gráfico e são contabilizados separadamente.

Regra histórica da versão 0.4.0, substituída: nessa etapa bastava a palavra-chave do acessório e existia uma opção para exigir troca. Na regra atual, troca/trocar explícito é obrigatório; verificação, RFID solto ou teclado travado não confirmam substituição. Consulte [Vida em campo](VIDA-EM-CAMPO.md).

Pendências: vínculo da instalação anterior ao serial retirado, múltiplos ciclos, data de referência dos ativos e validação de sequência temporal. Nenhuma vida útil ou causa de falha é inferida automaticamente.

| Área         | Cruzamentos                                                     |
| ------------ | --------------------------------------------------------------- |
| Operação     | Data × cliente × tipo × motivo × status                         |
| Técnicos     | Técnico × período × serviço × região × custos                   |
| Financeiro   | Cobrança × cliente × valor contratual × custo total × pagamento |
| Deslocamento | Técnico × localidade × cliente × valor de Km                    |
| Equipamentos | ID rastreador × datas × motivos × custos × chamados             |
| Chamados     | Número da OS × quantidade de linhas × situações                 |

O gerador de relatórios proposto permitirá escolher unidade de análise, filtros, agrupamentos, medidas e visualização. Fórmulas, denominadores e exclusões deverão ser aprovados. Resultados devem informar registros considerados/excluídos e permitir rastreabilidade até a linha do Excel. Ainda não implementado.

## Limitações e decisões pendentes

A base inicial tem lacunas de faturamento, recebimento, modelo e acessórios. Há divergências de custo, conflitos entre status e datas de pagamento, moedas como texto e categorias com variação de escrita. O nome OS 2025 não garante registros apenas de 2025.

Não há dados suficientes para afirmar receita recebida, inadimplência, lucro líquido, produtividade por hora, SLA de resolução ou vida útil completa. Repetição de intervenções não comprova falha ou retrabalho.

Decisões a revisar com o usuário:

1. Diferença entre CNPJs das colunas C e AK e identificador usado para clientes/filiais.
2. Participação de Agendar e Agendado nos valores previstos.
3. Regra de conclusão integral de um chamado e situações mistas.
4. Uso de status Pago versus data Pago em em cada indicador.
5. Tolerância monetária e conversão de valores armazenados como texto.
6. Categorias inconsistentes, agrupamento de técnicos e clientes.
7. Fórmulas, denominadores e filtros de cada KPI.
8. Escopo de gráficos, exportação e persistência dos relatórios.

### Atualização financeira da versão 0.2.0

O usuário aprovou comparação monetária em centavos, conversão de textos no formato brasileiro apenas para análise e inclusão financeira somente de Concluída/Pago. Essas regras estão implementadas. Comparar cada valor arredondado para centavos; qualquer diferença de um centavo ou mais gera revisão. Custo Total permanece oficial.

Textos aceitos incluem R$ 666,67 e R$ 1.198,00; formatos ambíguos são excluídos. Totais de custo, técnico e deslocamento possuem exclusões independentes. Valores contratuais exigem moeda válida e Cobrança igual a Cliente ou Addlog. Contagens de exclusão são exibidas. Divergências de custo são verificadas apenas nos serviços realizados com três componentes válidos. Não há cálculo de recebimentos ou lucro.

As decisões pendentes 2 e 5 foram resolvidas para esta etapa: agenda fica fora dos totais e comparação ocorre em centavos. Previsões de agenda continuam futuras.

As regras aprovadas foram confirmadas pelo usuário na conversa do projeto. Mudanças de significado devem ser revisadas antes da implementação.

## Apresentação dos indicadores — 0.9.0

Resumo com oito cards: realizados, chamados com realizados, custo total lançado, custo médio por valor válido, deslocamento em reais, eventos de troca de rastreador, coletoras e RFID. Todos seguem os filtros atuais e permitem conferir linhas de origem. Ausências não viram zero. Troca de rastreador conta um evento e referencia suas duas linhas.

Rankings de barras oferecem 10 maiores, 20 maiores ou todos, em ordem decrescente; tabelas e totais mantêm todos os participantes. Gráficos mensais preservam a ordem temporal. Nomes completos quebram linha; listas extensas têm rolagem. Não há agrupamento automático em Outros.

Tela única e seleção de seções mantidas. Histórico, revisão, configurações, exportações, filtros adicionais, chamados, tempo observado e indicadores financeiros/operacionais detalhados começam recolhidos. Tabela completa do ranking também começa recolhida.

## Período do resumo e início mais antigo — 0.9.1

O resumo mostra o intervalo solicitado quando há filtro temporal, além das datas efetivamente presentes na seleção. Sem filtro temporal, mostra a menor e a maior Data de atendimento válida dos registros selecionados e quantifica registros sem data mantidos. Datas do resumo abrangem todos os status selecionados; cada card mantém sua regra de elegibilidade. Seleção vazia e período invertido são explicitados.

Usar registro mais antigo preenche a data inicial com a menor data válida de toda a planilha importada, independentemente dos demais filtros. Não altera a data final nem corrige células. Com período ativo, registros sem data válida são excluídos conforme a regra existente. Botão desativado se não houver data válida. Limpar filtros remove a data preenchida pelo atalho.

## Módulo de consumo — 0.10.0

Nova página Linhas - Controle de Consumo, independente das ordens de serviço. Regras, importação e indicadores descritos em [CONSUMO-DE-LINHAS.md](CONSUMO-DE-LINHAS.md). Planilha de OS, filtros, ciclos, financeiro e interpretações aprovadas mantidos. As OS permanecem na sessão. Na evolução atual, consumo Arqia/Kore, referência operacional guardada e anotações têm histórico local com backup JSON. Consulte o guia do módulo para os critérios de vínculos e comparação.

## Análises de OS — 0.11.0

Implementadas sete análises descritas em [ANALISES-DE-OS.md](ANALISES-DE-OS.md). Abrem pelos títulos das novas seções e podem ser ocultadas em Personalizar. Reincidência confirmada por cliente + placa, serviços do mesmo dia agrupados como visita, retornos cumulativos em 30/60/90 dias. Custos seguem total lançado e realizados; ciclos abertos ficam fora da mediana de retiradas. Consumo possui módulo próprio; a comparação com contratos permanece fora desta etapa.

## Relatório descritivo — 0.12.0

Resumo em uma linha por grupo/indicador com quantitativos, percentuais, bases e descrição, mais atendimentos originais filtrados. Usuário confirmou exportar ambos. XLSX com três abas e CSVs separados. Critérios, precisão e populações em [RELATORIO-DESCRITIVO.md](RELATORIO-DESCRITIVO.md).

## Modelos pelo ID — 0.12.1

Mapa aprovado: 162 → MXT-162; 144 → MXT-130v2; 130 ou 137 → MXT-130v1; 141, 142 ou 143 → MXT-141. A classificação usa o prefixo do ID Rastreador da Implementação e não altera ID ou Modelo originais. IDs desconhecidos, ausentes ou incompatíveis ficam no grupo Modelo não identificado pelo ID; os ciclos continuam contados e elegíveis para as mesmas medidas de duração. Um card quantifica esses ciclos.

Tempo observado dos rastreadores passa a comparar por Modelo pelo prefixo do ID como padrão. Também permite Modelo original da planilha e Razão Social. O relatório descritivo XLSX/CSV usa a mesma classificação por prefixo. Filtros da coluna Modelo continuam referindo-se ao conteúdo original. Mediana permanece restrita a encerrados; vínculo de ciclos não mudou. Regras centralizadas em src/modules/orders/domain/trackerModels.js para extensão futura.

## Abrir e recolher relatórios — 0.12.2

No topo da página de OS, após a importação, Abrir todos os relatórios e Recolher todos os relatórios controlam todas as seções principais. Não mudam filtros, cálculos ou quais seções foram escolhidas em Personalizar. A abertura continua podendo ser alterada individualmente pelo título. Painéis internos (filtros, detalhes e tabelas) conservam seu estado. O comando não é persistido entre sessões.

## Operacional — 0.13.0

Duas páginas independentes para revisão e análises, com vínculo serial + placa. Equipamentos sem OS não são divergências: a operacional é mais antiga que o histórico de atendimentos. Regras, limites e pendências em [Operacional](OPERACIONAL.md). Cancelado exige data válida para confirmar interrupção da mensalidade; faturamento e pró-rata ainda não calculados.

## Manutenção do parque — 0.14.0

Indicadores exploratórios sobre a base operacional vinculável, filtros múltiplos e relatório XLSX/CSV com seleção de colunas implementados. Regras financeiras e de titularidade histórica continuam pendentes. Consulte [Manutenção do parque e relatórios](PARQUE-E-MANUTENCAO.md).

## Visita improdutiva — decisão de 12/10/2026

Identificar pelo Motivo Visita Improdutiva e separar de intervenção executada. Excluir de manutenção efetiva; manter valores financeiros válidos lançados. Atendimentos por veículo permite escolher o modo e ranking de técnicos mostra quantitativos separados. Não classificar improdutividade por instrução livre. Consulte ANALISES-DE-OS.md e PROXIMOS-AJUSTES.md.
