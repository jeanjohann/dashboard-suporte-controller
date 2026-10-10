# Vida em campo até primeira troca

Na categoria Equipamentos, o painel apresenta rastreadores, coletora/teclado/terminal e RFID separadamente. Mantém a planilha em leitura, com gráficos, tabelas ordenáveis, registros de origem, exportação CSV e impressão por seção.

## Critérios desta etapa

Rastreadores iniciais: Tipo de Serviço = Implementação, motivo de instalação Business 2.0/2.1, Start 1.0 ou Turbo, identificação válida por cliente + placa + serial e Data de atendimento válida. A primeira troca requer duas linhas Concluída/Pago de Assistência Técnica, no mesmo chamado, cliente, placa e data: desinstalação do serial antigo e instalação/reinstalação de serial diferente. Nomes de motivos são mapeados explicitamente. Pares com múltiplas entradas/saídas, serial não numérico, serial repetido, cliente/placa/data incompatível ou falta de uma ponta não são atribuídos automaticamente.

Acessórios iniciais: motivo Instalação de Acessório, texto com instalação/instalar e uma categoria explícita. Implementação do rastreador não presume acessórios pelo plano. Troca: Assistência Técnica / Manutenção de Acessório Concluída/Pago e instruções com troca/trocar explícito. Coletora, teclado e terminal pertencem à mesma categoria; RFID é outra. Uma linha representa um acessório; duas categorias no mesmo texto ou categoria ausente exigem revisão. Não usa serial do acessório. Verificação e manutenção sem troca explícita não encerram o ciclo.

A identificação preserva letras, acentos, hífens e zeros do conteúdo original. Apenas espaços nas extremidades dos identificadores são ignorados para comparar. Não transforma SFG8H05 em SFG-8H05 nem corrige clientes. Placas sem identificação, erros do Excel e datas impossíveis não geram duração válida. Datas respeitam o calendário 1900/1904 da importação.

## Encerramento e continuidade

Os eventos são resolvidos no arquivo completo antes dos filtros. Somente a primeira saída/ocorrência inequívoca encerra o ciclo. Uma retirada sem par não é ignorada para buscar uma troca posterior. Instalações duplicadas, reinstalações intermediárias, outros seriais instalados sem retirada e aparições do mesmo serial em outra placa/cliente antes da saída interrompem a atribuição automática. Um evento relevante sem data torna a sequência incerta. Eventos no mesmo dia da instalação não permitem estabelecer ordem sem horários e ficam na revisão.

Cancelamento do rastreador e cancelamento registrado no veículo para observação dos acessórios são apresentados separados, sem entrar no tempo até troca. Não comprovam falha. Ausência de troca gera tempo observado até o limite consultado, sem confirmar atividade atual.

A segunda opção de início é a entrada em uma troca anterior. Para rastreador, usa o serial instalado no par confirmado. Para acessório, usa a troca explícita da categoria como começo do ciclo seguinte. Esses intervalos permanecem separados da instalação inicial e não presumem equipamento novo de fábrica.

## Período e filtros

Modo padrão: o período e os filtros do topo selecionam a instalação que inicia o ciclo. A troca é procurada em todo o histórico até o limite, inclusive fora desse período. Modo por evento: os filtros selecionam a retirada do rastreador ou troca do acessório; o começo é procurado no arquivo completo. Filtros adicionais seguem o mesmo ponto de seleção. Os registros exibidos na conferência podem, portanto, estar fora dos filtros da tabela geral.

A lista de trocas com duração não resolvida sempre seleciona a retirada/troca pelos filtros do topo, independentemente do modo dos ciclos. Essa base própria aparece junto da lista e no card. Troca sem instalação conhecida não vira duração zero. Vínculo incerto e categoria não identificada permanecem disponíveis na revisão.

O limite padrão é a última Data de atendimento válida entre Concluída/Pago do arquivo. O usuário pode escolher um limite anterior. Uma data posterior à última evidência do arquivo é limitada a ela. Instalações após o limite não são observadas. O limite é uma referência do histórico disponível, não comprovação de presença diária do equipamento no parque.

## Indicadores

Média, mediana, mínimo, máximo e faixas de duração usam somente ciclos completos com troca confirmada. Dias corridos = data de troca menos data da instalação. Observações sem troca, cancelamentos e ciclos incertos ficam em contagens separadas. Grupos sem ciclo completo têm média/mediana indisponível, nunca zero.

Comparações por modelo do rastreador (prefixos aprovados do ID) ou cliente incluem tamanho da amostra. O acompanhamento pelo mês da instalação apresenta completos, sem troca, cancelamentos e revisão sem calcular taxa de falha para coortes com diferentes tempos de acompanhamento. A estatística dos ciclos completos descreve a amostra; não estima a vida útil de todo o parque nem idade desde fabricação.

## Conferência do arquivo local em 10/10/2026

Limite: 08/05/2026. Pares confirmados pelo critério desta etapa: 79 rastreadores. Na instalação inicial, 370 ciclos de rastreador: 3 completos (143, 3 e 16 dias), 326 sem troca, 7 cancelamentos e 34 para revisão. Média dos três completos: 54 dias; mediana: 16 dias. 76 pares não possuem duração inicial resolvida.

Coletora: 6 instalações explícitas, 5 ciclos completos de 92 dias e 1 sem troca. Os cinco completos provêm da mesma intervenção inicial de um cliente. RFID: 17 instalações explícitas sem primeira troca vinculada. Trocas de acessórios contadas: 89 coletoras e 8 RFID.

Nos ciclos iniciados por uma troca anterior: 3 rastreadores completos de 314, 29 e 107 dias, e 9 intervalos de coletora completos. Esses números são uma fotografia dessa versão da planilha, não expectativas fixas para novas importações.

## Implementação e validação

trackerReplacements.js centraliza os pares usados tanto na contagem geral quanto na vida em campo. fieldLife.js resolve ciclos, limite, seleção e agregações. FieldLifePanel.jsx apresenta as análises. Os relatórios históricos de tempo até retirada permanecem explicitamente separados e podem incluir cancelamentos.

Testes cobrem primeira troca, reinstalação com par, status não realizados, cancelamentos, retiradas incompletas, ambiguidades, instalações duplicadas antes dos filtros, mesmo dia, ausência de instalação, seleção por instalação/evento, referência, calendário 1904, datas inválidas, categorias de acessórios, transferência de serial e ciclos entre trocas. Conferência no navegador verifica a planilha real, registros externos ao período selecionado, exportação, ausência de erros e layout em tela ampla/celular.
