# Análises de ordens de serviço — 0.11.0

Sete seções novas, disponíveis em Personalizar. Começam recolhidas para preservar a leitura da tela única. Seguem os filtros principais e adicionais; a busca da tabela de atendimentos permanece restrita àquela tabela. Todas usam serviços realizados (Concluída/Pago). Cancelada não gera custo ou atendimento realizado. Consumo e conciliação entre planilhas ficam para etapa futura.

## Custo por cliente

Agrupamento pela Razão Social, preservando a definição atual de cliente. Cards e ranking de custo total lançado; tabela com realizados, chamados distintos e valores válidos de Custo Total, Técnico, Km e Valor a cobrar por Cobrança. Contratual Cliente e Contratual Addlog mantêm as definições anteriores. Custo total em cobranças Addlog soma Custo Total dessas linhas: é uma medida distinta do valor contratual absorvido. Não calcula receita recebida nem lucro. Valores ausentes não viram zero, e os cards expõem seus denominadores.

## Composição do custo

Cliente, cidade ou código do técnico. Código identifica o técnico; diferentes nomes são apresentados juntos no mesmo código. Barras empilhadas somam Técnico + Km apenas nas linhas com ambos válidos. Participação de deslocamento nos componentes = Km / (Técnico + Km), no mesmo conjunto de linhas. Soma zero não gera percentual. Total lançado aparece separadamente e mantém sua autoridade; divergências existentes continuam na revisão. Grupos com componentes agregados negativos ficam na tabela, fora das barras empilhadas. Tabela informa quantidade de pares válidos.

## Reincidência por veículo

Critério confirmado: identificação exata por cliente + placa; todas as linhas realizadas do mesmo dia formam uma visita. Cliente/placa ausentes impedem agrupamento; datas ausentes impedem intervalos, mantendo contagem das linhas com identificação. Não normaliza ou corrige identificadores.

O histórico completo identifica visitas consecutivas antes dos filtros. Um intervalo entra apenas quando ambas as visitas possuem pelo menos um serviço selecionado. Filtrar uma visita intermediária não cria uma ligação artificial entre visitas distantes. Linha do tempo apresenta visitas selecionadas e números de linha de origem.

Retornos até 30, 60 e 90 dias são cumulativos: um intervalo de 20 dias entra nas três medidas. Contam intervalos observados, não veículos distintos, e incluem exatamente os limites. Mediana usa somente esses intervalos elegíveis. Mesma data não cria retorno de zero dias. Nova intervenção não comprova defeito, retrabalho ou responsabilidade do técnico.

## Chamados com vários serviços

OS é o chamado. Soma de linhas realizadas por chamado, custo total lançado válido e média por custo válido. Cards de chamados com realizados, chamados com mais de um realizado e média de linhas por chamado. Distribuição conta cada chamado uma vez, por número de realizados. Linhas no mesmo dia continuam serviços individuais. Canceladas e agenda ficam fora.

## Perfil das intervenções por cliente

Matriz e gráfico selecionável de Implementações e Assistências Técnicas (Tipo de Serviço), retiradas de rastreador (motivos explícitos de desinstalação já aprovados), eventos de troca de rastreador, trocas de coletora e RFID (regras existentes). Categorias sobrepostas: uma assistência pode conter troca; evento de troca de rastreador corresponde a duas linhas. Não somar colunas como total de atendimentos. Retiradas não abrangem motivos desconhecidos automaticamente. Trocas de rastreador são atribuídas ao cliente da instalação; pares entre clientes distintos precisam de conferência. Não classifica manutenção sem troca.

## Tempo observado dos rastreadores

Reutiliza os ciclos existentes por serial + placa, iniciados por Implementação. Agrupamento por modelo identificado pelo prefixo do ID, Modelo original ou Razão Social da instalação. Mediana de dias até retirada somente para ciclos encerrados. Períodos sem retirada aparecem separados e não entram nessa mediana ou distribuição. Amostra por grupo e tipos de serviço da retirada são exibidos para distinguir contextos como cancelamento. Grupos sem ciclo encerrado não recebem mediana zero.

Distribuição: até 30, 31–90, 91–180, 181–365 e mais de 365 dias. Não representa previsão de vida útil ou taxa de falha; uma retirada pode ser motivada por cancelamento. A referência temporal escolhida continua afetando apenas períodos sem retirada. Filtros de serviço podem excluir uma das pontas e tornar um ciclo inelegível conforme a regra existente.

## Evolução dos custos

Mês derivado de Data de atendimento válida, em ordem temporal. Selector de gráfico de linhas: realizados, custo total lançado, custo médio válido e participação Km/Custo Total. Tabela apresenta todas as medidas juntas. Ausências de data contabilizadas, sem preencher meses ou custos automaticamente.

Média = soma dos custos totais válidos / quantidade de custos totais válidos, inclusive zeros. Participação Km/Custo Total usa somente linhas com ambos válidos; denominador zero gera indisponível. Um total divergente pode gerar participação acima de 100%; não limita ou corrige o resultado. Não confundir esse percentual com participação nos componentes da seção Composição.

## Conferência, exportação e implementação

Tabelas ordenáveis, acesso às linhas originais, CSV com arquivo/filtros/origem e impressão/PDF por seção. Rankings podem mostrar 10, 20 ou todos; tabela e totais completos. Referência temporal do ciclo consta na impressão pelo contexto existente. Gráfico de composição é impresso junto da seção; números dos componentes estão na tabela.

`src/modules/orders/domain/insights.js` mantém as agregações; `src/modules/orders/components/AdvancedInsights.jsx` apresenta as análises. Nenhuma regra de importação, financeiro, trocas ou vínculo de ciclos foi substituída. Cobertura de testes: exclusões e total divergente, agrupamento de técnicos, chamados, visitas do mesmo dia, intervalos cumulativos e filtros sem atalhos, sobreposição de categorias, mediana sem ciclos abertos, bases compatíveis nos percentuais mensais.

Conferência com o arquivo original desta entrega: 59 grupos de cliente; custo agregado de R$ 154.723,41, igual ao financeiro existente; 490 chamados com realizados, dos quais 252 com vários serviços; 89 eventos de troca de rastreador; 28 ciclos encerrados e 337 sem retirada registrada na referência 04/10/2026. Mediana global dos encerrados: 136,5 dias. Esses valores são uma conferência dessa versão do arquivo, não expectativas fixas para novas importações.

## Modelos pelo ID — 0.12.1

Mapa aprovado: 162 → MXT-162; 144 → MXT-130v2; 130 ou 137 → MXT-130v1; 141, 142 ou 143 → MXT-141. A classificação usa o prefixo do ID Rastreador da Implementação e não altera ID ou Modelo originais. IDs desconhecidos, ausentes ou incompatíveis ficam no grupo Modelo não identificado pelo ID; os ciclos continuam contados e elegíveis para as mesmas medidas de duração. Um card quantifica esses ciclos.

Tempo observado dos rastreadores passa a comparar por Modelo pelo prefixo do ID como padrão. Também permite Modelo original da planilha e Razão Social. O relatório descritivo XLSX/CSV usa a mesma classificação por prefixo. Filtros da coluna Modelo continuam referindo-se ao conteúdo original. Mediana permanece restrita a encerrados; vínculo de ciclos não mudou. Regras centralizadas em src/modules/orders/domain/trackerModels.js para extensão futura.

## Revisão de vida útil — 10/10/2026

Objetivo solicitado: tempo entre instalação no cliente e primeira troca, separando contagem de substituições, ciclos completos e períodos sem troca registrada. Retirada por cancelamento não comprova falha nem deve entrar na média até troca. Os relatórios existentes de tempo até retirada ainda têm essa definição histórica, não devem ser interpretados como vida até primeira troca.

Regra confirmada nesta revisão: acessórios precisam de Assistência Técnica / Manutenção de Acessório Concluída ou Pago e instruções com troca/trocar explícito. Coletora, teclado e terminal formam uma categoria; RFID é outra. Categoria ausente ou múltipla segue para revisão. Verificações e problemas sem troca explícita ficam fora das substituições. A opção de teste que permitia incluir essas manutenções foi removida.

Auditoria preliminar do arquivo local: 28 períodos encerrados pela regra antiga, sendo 7 retiradas por Cancelamento; 97 trocas explícitas de acessórios identificados (89 coletora e 8 RFID). Candidatos de pares de rastreador no mesmo chamado, cliente, placa e data: 79, dos quais apenas 3 possuem uma Implementação anterior correspondente na mesma identificação. Essa contagem de candidatos não é uma validação final dos ciclos. Cinco coletoras têm instalação explícita e primeira troca 92 dias depois, todas na mesma intervenção inicial de um cliente; não representam o parque inteiro.

Após autorização de execução, adotado nesta etapa o critério conservador de instalação explícita dos acessórios e pares de rastreador no mesmo chamado, cliente, placa e data. Esses critérios ficam visíveis no painel e podem ser ampliados após validação. A implementação está descrita em [Vida em campo](VIDA-EM-CAMPO.md). Instalação ausente não vira zero. Implementação, instalação após troca e intervalo entre trocas devem permanecer medidas distintas. Qualquer análise precisa mostrar amostras, cobertura e linhas de origem. Diferenças de escrita das placas precisam de validação, preservando os valores da planilha.
