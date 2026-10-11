# Manutenção do parque e relatórios — 0.14.0

Esta entrega aprofunda os indicadores e as exportações da página **Operacional × OS — Análises**. Importação, revisão, regras financeiras e critérios de cobrança permanecem nas regras existentes. Não calcula faturamento, pró-rata, custo por contrato nem titularidade histórica.

## Como usar

1. Carregue o operacional e a OS nas respectivas páginas.
2. Na personalização da página de análises, combine cliente, modelo, plano e situação operacional. Vários itens no mesmo campo usam OU; campos diferentes usam E. A busca textual combina com essas seleções.
3. Em **Indicadores de manutenção do parque**, escolha o período dos atendimentos. Sem limite, utiliza todo o histórico disponível. O período afeta somente as novas análises; as seções anteriores de parque, valores lançados e cobertura continuam representando a seleção operacional.
4. Compare as contagens, taxas e percentuais por cliente, modelo, plano ou situação em **Manutenção por cliente e modelo**. Estes campos vêm da fotografia operacional.
5. Consulte o perfil de intervenções, as trocas identificadas e as linhas de origem nas tabelas ordenáveis.
6. Em **Relatório do parque e atendimentos**, escolha as colunas do resumo e se quer os originais no XLSX. Grupo e denominador sempre permanecem. XLSX inclui Resumo, Indicadores e Critérios; originais são opcionais. CSVs separados permitem manipular resumo, operacional e OS/contexto de trocas.

As quatro seções novas participam da personalização e dos controles de abrir/recolher. Perfil e exportação começam recolhidos. Cada seção mantém impressão/PDF. Ocultar não altera cálculos ou filtros. Os novos controles não salvam planilhas ou dados no navegador.

## População e limites

- Uma linha operacional é um registro de equipamento contratado. A base vinculável inclui pares serial + placa sem ambiguidade, inclusive os que não têm OS correspondente no histórico disponível. Não há deduplicação silenciosa.
- Seriais precisam ser dígitos e positivos; números inseguros e placas provisórias conhecidas não entram na base. A ambiguidade é avaliada no operacional completo antes de qualquer filtro: selecionar só uma linha repetida não resolve o vínculo.
- A ausência nas OS não é divergência: o operacional é mais antigo. Não conclui ausência de manutenção, instalação, falha ou atividade.
- Inclui todas as situações operacionais selecionadas, inclusive cancelados. Não é base ativa calculada nem parque médio do período. O denominador não muda automaticamente conforme a data do atendimento.
- Serviços elegíveis são somente Concluída/Pago vinculados pelo mesmo serial e placa. Cancelada e demais status não entram. Serviços são contados por linha; equipamentos com atendimento são contados uma vez.
- Assistência significa tipo de serviço **Assistência Técnica**, sem supor que houve troca ou falha.
- Cliente, modelo e plano dos rankings são os lançados no operacional atual. O vínculo não confirma o contrato ou cliente à época do atendimento. A comparação é exploratória entre o histórico disponível e a fotografia importada, não uma taxa histórica de confiabilidade.

## Indicadores

| Indicador                      | Cálculo                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Com atendimento realizado      | Registros vinculáveis com ao menos uma linha Concluída/Pago na seleção           |
| Com assistência                | Registros vinculáveis com ao menos uma Assistência Técnica realizada             |
| Percentual com assistência     | Registros com assistência / base vinculável                                      |
| Assistências por 100 registros | Linhas de assistência / base vinculável × 100                                    |
| Trocas de rastreador           | Eventos confirmados pelo mecanismo atual de OS; um par conta uma vez             |
| Coletora / RFID                | Linhas classificadas pelo mecanismo atual de acessórios, sem ampliar suas regras |
| Veículos com várias visitas    | Grupos cliente + placa da OS com duas ou mais datas distintas                    |
| Retornos em 30/60/90 dias      | Intervalos entre visitas consecutivas na seleção, cumulativos                    |

Taxa por 100 pode ultrapassar 100 quando há várias assistências por equipamento; não é percentual de falha. Base vazia deixa taxa e percentual indisponíveis. Pizza/rosca representam apenas contagens aditivas. Taxas e percentuais de bases diferentes precisam de barras.

## Datas e trocas

Período inclusivo usa Data de atendimento. Sem filtro, realizados sem data entram nas contagens e sua quantidade é informada; não participam das visitas por data. Com qualquer limite, são excluídos e contabilizados. Período invertido bloqueia os relatórios da nova análise.

Reincidência segue cliente + placa da OS, com os serviços do mesmo dia em uma visita. Compara datas consecutivas dentro da seleção; não utiliza uma visita anterior ao limite inicial. Os retornos são intervenções observadas, sem afirmar falha. Não soma retornos 30/60/90, pois são cumulativos.

Pares de troca de rastreador são identificados no arquivo OS completo com os critérios atuais, antes da seleção operacional. Ambas as linhas precisam estar no período; pelo menos uma precisa estar vinculada ao parque selecionado. Isso permite observar a retirada de um serial antigo ausente da fotografia quando o serial instalado está nela. Não duplica o evento quando ambos estão no parque. A contraparte é incluída nos originais exportados para conferência, sem aumentar contagens de atendimentos, assistências ou taxas.

Trocas de rastreador e acessórios são subconjuntos dos tipos de serviço; não são categorias extras a somar no perfil.

## Relatórios

XLSX mantém números como números e participação como fração: 0,1 = 10%. Colunas selecionadas conservam seus formatos mesmo quando mudam de posição. Os identificadores textuais e a ordem original das colunas das fontes são preservados. Datas originalmente formatadas como dd/mm/aaaa nas fontes são exportadas como texto exibido, para não misturar calendários 1900/1904. Não recalcula fórmulas das fontes.

Critérios registram arquivos, seleções operacionais, período, agrupamento, colunas e regras dos indicadores. Resumo por grupo e indicadores gerais são separados. Originais abrangem os registros operacionais selecionados e os realizados vinculados, acrescidos das contrapartes das trocas. São contextos diferentes, não denominadores intercambiáveis. Os CSVs das fontes contêm os valores originais; o CSV do resumo inclui contexto e regras. Texto com prefixo de fórmula é protegido no CSV.

## Código e validação

- `src/modules/park/domain/parkAnalysis.js`: base, seleção temporal, contagens, taxas, visitas, categorias, pares e tabelas de exportação.
- `src/modules/park/components/ParkInsights.jsx`: controles de análise, cards, gráficos, tabelas e exportações.
- `src/modules/operational/components/OperationalPage.jsx`: filtros múltiplos operacionais e integração com a personalização existente.
- `src/modules/park/domain/parkAnalysis.test.js`: denominadores, canceladas, datas ausentes, limites, ambiguidade global, taxa acima de 100, evento único, contraparte, formato XLSX e seleção de colunas.

Validação inclui testes automatizados, compilação, leitura de XLSX gerado em memória, cálculos com arquivos locais e renderização React no servidor. Isso não equivale à validação visual interativa ou à abertura manual no Excel.

## Pendências preservadas

Revisão das situações legítimas, significado de Contrato/ciclo, cancelamento financeiro, titularidade histórica e atribuição de custos serão definidos posteriormente com o usuário. Não inferir essas regras a partir dos novos indicadores.

## Menus por categoria — 0.14.1

Operacional: Visão geral, Registros e Revisão. OS x OP: Visão geral, Parque, Manutenção, Valores mensais, Vínculos e Relatórios. A seleção é independente por página e não limpa filtros ou dados. Visão geral concentra os cards de cobertura; cada categoria mostra seus relatórios, respeitando as escolhas de visibilidade. Agrupamento do relatório fica na categoria Relatórios, com período informado e atalho para Manutenção. Seções recolhíveis continuam disponíveis. O painel de checkboxes integrado ao menu e os blocos abertos são propostas para revisão futura, ainda não implementadas.
