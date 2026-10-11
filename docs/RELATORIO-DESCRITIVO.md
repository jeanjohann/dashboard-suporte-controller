# Relatório descritivo — 0.12.0

Na página de ordens de serviço, abra a seção Relatório descritivo. A seção começa recolhida e pode ser exibida/ocultada em Personalizar. Selecione as análises desejadas. A exportação usa os filtros principais e adicionais atuais, não a busca da tabela de atendimentos. Consumo não participa.

## Estrutura

Uma linha por análise, grupo e indicador: análise, agrupamento, grupo, indicador, valor numérico, unidade, base do percentual, percentual fracionário, descrição legível com critérios e linhas Excel de contexto. Descrições identificam o grupo, resultado e participação. Valores BRL são exportados em reais, não centavos. Ausência é campo vazio; zero válido permanece número zero.

O percentual é Valor/Base, armazenado como fração: 0,1 = 10%. No XLSX a célula tem formato percentual. No CSV o valor continua fracionário para manipulação externa. Base zero/ausente e medidas sem participação deixam percentual vazio. Médias e medianas nunca recebem percentual artificial. A descrição arredonda somente para leitura; colunas numéricas preservam a precisão calculada.

## Populações dos percentuais

- Serviços por cliente, chamado ou mês: participação nos serviços realizados elegíveis daquela análise.
- Chamados por cliente: participação no conjunto distinto de chamados da seleção. Chamados podem ocorrer em mais de um cliente; esses percentuais não são aditivos.
- Valores monetários por cliente/chamado/mês: participação no total válido da mesma medida. Grupos negativos tornam essa participação indisponível para evitar interpretação como distribuição simples.
- Composição por cliente: cada componente sobre Técnico + Km do mesmo grupo, somente nas linhas com ambos válidos. Não substitui Custo Total.
- Visitas por cliente + placa: participação nas visitas datadas. Retornos 30/60/90: proporção dos intervalos elegíveis do próprio grupo, cumulativos; histórico completo define consecutividade antes dos filtros.
- Intervenções: participação entre clientes, dentro de cada categoria. Categorias se sobrepõem e não são somadas como serviços; rastreadores contam eventos de troca.
- Ciclos por modelo: encerrados sobre total encerrado, sem retirada sobre total sem retirada. Duração somente de encerrados, sem previsão de vida útil.
- Participação mensal do deslocamento: Km/Custo Total no mesmo conjunto de linhas com ambos válidos. Pode exceder 100% quando houver divergência no total lançado.

## Arquivos

**XLSX:** Relatório, Critérios e Atendimentos. Valores, bases e percentuais são números. Critérios incluem arquivo de origem, filtros, referência temporal, regras e observações de indisponibilidade/exclusão. Atendimentos contém todas as linhas originais selecionadas, incluindo status não realizados, na ordem da planilha e com número de linha Excel. Identificadores textuais e zeros iniciais são preservados; datas numéricas com apresentação de data recebem formato de data e mantêm o calendário do arquivo original.

**CSV:** resumo e atendimentos em downloads separados, UTF-8 com BOM, ponto e vírgula, decimais com vírgula. Resumo inclui arquivo, filtros e referência em colunas, sem introduzir preâmbulos que dificultem leitura tabular. Textos potencialmente interpretados como fórmulas recebem proteção de exportação, conforme as demais exportações do sistema.

A prévia exibe apenas as primeiras 200 linhas; exportações incluem todo o resumo. A ordem de exportação é a ordem das análises selecionadas e seus grupos, sem o limite de rankings dos gráficos. Ordenar a prévia afeta somente sua exibição. Linhas Excel indicam o contexto do grupo; a descrição informa quando um indicador usa um subconjunto válido. Não representar a quantidade de linhas de contexto como denominador de todo percentual.

Composição usa cliente e duração usa modelo pelo prefixo do ID nesta versão; não depende dos seletores temporários das outras seções. O relatório descreve os registros importados e não altera a planilha. Regras financeiras, cancelamentos, trocas e ciclos permanecem as aprovadas. CSV não tem abas.

## Manutenção e verificação

`src/modules/orders/domain/descriptive.js`: relatório, formato tabular e geração de XLSX com SheetJS já usada pelo importador. `src/modules/orders/components/DescriptiveReport.jsx`: seleção, prévia e downloads. Testes validam denominadores, canceladas, ausência/zero, números/percentuais no XLSX, preservação de identificadores e textos, cabeçalhos CSV e análises indisponíveis.

## Modelos pelo ID — 0.12.1

Mapa aprovado: 162 → MXT-162; 144 → MXT-130v2; 130 ou 137 → MXT-130v1; 141, 142 ou 143 → MXT-141. A classificação usa o prefixo do ID Rastreador da Implementação e não altera ID ou Modelo originais. IDs desconhecidos, ausentes ou incompatíveis ficam no grupo Modelo não identificado pelo ID; os ciclos continuam contados e elegíveis para as mesmas medidas de duração. Um card quantifica esses ciclos.

Tempo observado dos rastreadores passa a comparar por Modelo pelo prefixo do ID como padrão. Também permite Modelo original da planilha e Razão Social. O relatório descritivo XLSX/CSV usa a mesma classificação por prefixo. Filtros da coluna Modelo continuam referindo-se ao conteúdo original. Mediana permanece restrita a encerrados; vínculo de ciclos não mudou. Regras centralizadas em src/modules/orders/domain/trackerModels.js para extensão futura.
