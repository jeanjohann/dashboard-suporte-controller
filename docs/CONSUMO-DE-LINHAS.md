# Linhas — Controle de Consumo

Implementado na versão 0.10.0. O módulo não usa status, valores financeiros ou regras de equipamentos das ordens de serviço.

## Uso

1. Abra Linhas - Controle de Consumo pelo menu lateral.
2. Importe um CSV consolidado. Uma importação bem-sucedida substitui apenas os dados de consumo. Falhas preservam a importação anterior.
3. Selecione períodos completos, planos, contratos, tecnologias ou empresas. Seleções usam OU dentro de um campo e E entre campos. A busca por MSISDN, ICCID, plano, contrato ou empresa também afeta toda a análise de consumo.
4. Consulte cards, ranking de 10/20/todos e resumo. Clique nos cabeçalhos para ordenar e em Conferir para ver os campos originais e números de linha física do CSV.
5. Exporte o resumo CSV, o gráfico SVG ou use Imprimir / Salvar PDF por seção.

Ao voltar a Ordens de serviço, a planilha e filtros anteriores continuam disponíveis. Recarregar ou fechar a página encerra os dados das duas importações; nenhuma delas é salva no navegador.

## Colunas e representação

Obrigatórias: ICCID, MSISDN (também aceita MSISN), Período Início, Período Término, Consumo (MB). O cabeçalho fica na primeira linha. Delimitadores: ponto e vírgula, vírgula ou tabulação; campos entre aspas podem conter delimitadores, aspas escapadas e novas linhas. Cabeçalhos repetidos, aspas inválidas e linhas com quantidade incorreta de campos impedem a importação.

Identificadores são textos, sem conversão numérica ou perda de zeros iniciais. MB aceita formato brasileiro, até seis casas decimais, inclusive zero. Ausências, negativos, datas impossíveis, períodos invertidos e identificadores ausentes/não numéricos são sinalizados e excluídos dos totais. Datas seguem DD/MM/AAAA. UTF-8 é usado primeiro; texto com erro de decodificação é relido em Windows-1252.

Plano, Nome Fantasia e CPF/CNPJ são preservados. Tecnologia e Contrato são campos separados opcionais. São aceitos cabeçalhos Tecnologia / Tecnologia (2G/4G) e Contrato / Número do contrato / Contrato vinculado. Sem esses campos, exibe Não informado. Não infere 2G/4G por IMSI, ICCID ou descrições do plano, nem trata Plano como Contrato. O arquivo de exemplo não informa tecnologia ou contrato.

## Indicadores e repetições

- Chave da linha: par ICCID + MSISDN. Linhas na seleção conta pares distintos, incluindo grupos em revisão.
- O arquivo é consolidado e não deve repetir pares. Todas as ocorrências de um par repetido são excluídas dos totais e sinalizadas. A validação acontece no arquivo completo; filtrar uma ocorrência não resolve a duplicidade.
- Consumo total: soma dos MB válidos e elegíveis. Usa inteiros em milionésimos de MB para evitar arredondamento por registro. Totais que excedam a precisão inteira suportada são rejeitados.
- Média por linha: total dividido pelos pares com consumo válido; inclui zero e exclui ausências/grupos repetidos.
- Maior consumo: maior total válido por par. O card indica número e quantidade de empates; o ranking completo apresenta todos os participantes.
- Linhas com zero: somente grupos com valor válido igual a zero. Não indica inatividade do equipamento.
- Exclusões: quantidade de registros da seleção fora dos totais; os valores originais continuam disponíveis.
- Período: abrangência das datas válidas selecionadas e quantidade de períodos distintos. Não presume continuidade, não faz rateio diário ou projeção mensal.

Filtros são independentes das OS. O ranking e o CSV derivam da mesma seleção e elegibilidade dos cards. Comparações entre períodos com durações diferentes refletem consumo absoluto. O relatório preserva a unidade MB da plataforma, sem inferir conversão em GB ou franquia, preços e excedentes.

## Manutenção

`src/consumption.js` contém parser, validações e agregações; `src/LinesPage.jsx` contém a página; `src/Navigation.jsx` contém o menu comum. Componentes visuais existentes são reutilizados, sem misturar os dados dos módulos. Configurações do layout de OS continuam pertencendo somente às OS. CSV exportado inclui arquivo, filtros, unidade, exclusões e linhas de origem; textos potencialmente interpretados como fórmulas recebem proteção na exportação.

Testar identificadores longos, casas decimais, zero/ausência, aspas e linhas físicas, duplicidade antes dos filtros, datas, colunas opcionais e reconciliação dos cards com o resumo. Definição de contrato e origem de tecnologia ainda dependem da disponibilidade de campos na exportação.

## Validação da primeira entrega

Arquivo de exemplo: 905 registros e pares distintos; apuração de 01/09/2026 a 28/09/2026. Total de 15.991,9154 MB, média de 17,670625 MB exibida, maior consumo de 78,4043 MB, 194 linhas com zero, nenhuma exclusão. Total reconciliado por soma decimal independente. Navegação conferida com as duas importações carregadas: OS e busca de consumo permaneceram ao alternar páginas. Testes automatizados incluem também as regras existentes de OS.
