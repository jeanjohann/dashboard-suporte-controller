# Modelo semântico analítico

Referência transversal para relatórios, comparações e o futuro MCP analítico. Revisado em 25/10/2026 com base nas regras do sistema e na matriz de revisão. Este documento organiza os conceitos; as regras detalhadas de cada módulo e o código correspondente continuam sendo a autoridade de implementação.

## Como usar este modelo

- Antes de criar uma métrica, confirmar sua entidade, granularidade, fonte, data de referência, fórmula e limites.
- O MCP deve consumir ferramentas de negócio com filtros e medidas permitidos. Não deve receber SQL livre nem decidir regras a partir do texto da pergunta.
- Uma explicação analítica deve distinguir dado observado, cálculo derivado e hipótese. Não atribuir causa ou qualidade sem evidência.
- Ausência, zero e consulta incompleta são estados distintos. Nunca completar lacunas com zero nem publicar totais parciais como completos.
- Uma contagem só pode ser somada entre grupos quando os grupos forem mutuamente exclusivos e usarem a mesma unidade.

## Entidades e granularidades

| Entidade                     | Uma linha/evento representa                       | Identificador/limite importante                                                                                                         |
| ---------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Linha de OS                  | Um serviço, execução ou agendamento               | Atendimentos do suporte contam linhas elegíveis; retirada e instalação de troca não se fundem para esse indicador.                      |
| Chamado de OS                | Um número de chamado distinto                     | Pode abranger várias linhas/veículos; distinto não significa número de serviços.                                                        |
| Veículo atendido             | Um veículo no contexto de uma filial              | Placa junto ao CNPJ completo da coluna C identifica o vínculo físico na OS.                                                             |
| Evento de troca              | Uma substituição confirmada de equipamento        | Troca de rastreador usa par de retirada/instalação da mesma placa e chamado, com IDs diferentes. Acessórios seguem regra por categoria. |
| Ticket Zoho                  | Um chamado do Desk                                | Status atual, eventos e apontamentos são conceitos separados; não inferir autoria pelo responsável atual.                               |
| Fechamento Zoho              | Último fechamento confirmado do ticket            | É o evento atribuído ao agente para a regra atual de fechados no período.                                                               |
| Apontamento Zoho             | Uma entrada de tempo executado                    | Soma por agente e data da entrada; não é tempo conectado nem jornada líquida.                                                           |
| Estado de pendência Zoho     | Um ticket atribuído na fotografia consultada      | Open e On Hold entram nos pendentes; On Hold pode ser separado. É estoque atual, não fluxo do período.                                  |
| Registro operacional/API     | A situação cadastrada ou observada do equipamento | API é fotografia de referência atual; vínculo exato e conflitos devem permanecer visíveis.                                              |
| Fotografia de monitoramento  | Estado observado na referência de coleta          | Não equivale a evento histórico contínuo; ausência em uma leitura não prova indisponibilidade histórica.                                |
| Lançamento manual de suporte | Um dia de trabalho por agente                     | Nulo não é zero; não somar manual e automático sem regra explícita.                                                                     |
| Consumo de operadora         | Consumo de uma linha dentro de um ciclo           | A franquia pode ser compartilhada; o período de acumulação precisa ser explícito por operadora.                                         |

## Métricas confirmadas

| Métrica                             | Regra resumida                                                                                                                                     | Fonte/data                                          | Limite de interpretação                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Visitas e atendimentos realizados   | Cada linha com status exato Concluída/Pago, incluindo improdutivas.                                                                                | OS; data de atendimento.                            | Não é chamado distinto, execução efetiva nem equipamento único.                                                       |
| Execuções efetivas                  | Linhas Concluída/Pago, exceto Motivo exatamente “Visita Improdutiva” (ignorando caixa e espaços externos).                                         | OS; data de atendimento e Resp. Execução.           | Em Indicadores Suporte, improdutiva não conta como execução.                                                          |
| Serviços na agenda                  | Linhas com data de agendamento válida, exceto Cancelado/Cancelada; inclui já executadas.                                                           | OS; Agendamento e Resp. Agendamento.                | Mede a data marcada, não quando o agente criou o agendamento.                                                         |
| Visitas improdutivas                | Linhas realizadas cujo Motivo é “Visita Improdutiva”.                                                                                              | OS; atendimento.                                    | Nos outros módulos permanece indicador separado; a regra especial de não execução aplica-se aos Indicadores Suporte.  |
| Chamados distintos                  | Quantidade de números de chamado distintos no recorte.                                                                                             | OS; chamado conforme filtro do módulo.              | Não somar subgrupos sobrepostos como se fossem partições.                                                             |
| Clientes identificados/consolidados | CNPJ completo da coluna C para filial; razão social idêntica/configuração explícita para consolidação de apresentação.                             | OS + Base clientes.                                 | Nomes apenas parecidos e raiz do CNPJ não identificam automaticamente a mesma unidade física.                         |
| Trocas de rastreador                | Par confirmado de retirada/instalação, mesma placa e chamado, IDs distintos.                                                                       | OS; data do atendimento.                            | Um evento para vida útil; duas linhas para volume de serviços. Duração exige identificar direção e ciclo.             |
| Trocas de acessório                 | Manutenção de acessório com palavra-chave afirmativa de troca; RFID e coletora mantêm ciclos independentes.                                        | OS; instruções, categoria, cliente e placa.         | A duração começa na implementação/troca anterior da mesma categoria; sem data de início válida, não calcular duração. |
| Modelo do rastreador                | Prefixo do serial: 144 MXT-130v2; 130/137 MXT-130v1; 162 MXT-162; 141/142/143/81–85 MXT-141.                                                       | Serial da OS/Operacional.                           | Prefixo desconhecido não recebe modelo aproximado.                                                                    |
| Chamados fechados por agente        | Ticket atualmente Closed cujo último fechamento confirmado ocorreu no período; autoria pelo agente do último evento de fechamento. Reabertos saem. | Zoho; evento de fechamento e status atual.          | Total de equipe deduplica por ticket; agente pode aparecer em mais de um fechamento distinto; categoria é a atual.    |
| Chamados criados pelo suporte       | Evento TicketCreated no período, actor Agent, ID explícito e source nulo, em consulta completa.                                                    | Zoho; evento de criação.                            | Se a evidência ou cobertura falhar, métrica automática indisponível; não usar atribuição atual como autoria.          |
| Pendentes por agente                | Tickets atualmente atribuídos ao agente em Open ou On Hold.                                                                                        | Zoho; fotografia na hora da consulta.               | Não usa período selecionado; On Hold está incluído e pode ser mostrado separado.                                      |
| Tempo apontado                      | Soma das entradas válidas `executedTime`, agrupadas por agente e data do apontamento. Média só inclui tickets com tempo.                           | Zoho Time Entries.                                  | Não representa permanência conectada, disponibilidade ou tempo de trabalho sem sobreposição.                          |
| Categorias dos fechados             | Categorias presentes nos tickets fechados conforme regra acima, com catálogo completo permitindo zeros.                                            | Zoho; categoria/subcategoria/classificação atuais.  | Não é necessariamente a categoria histórica do fechamento; não classificar pelo título.                               |
| Conferência API × Operacional       | API como referência atual; comparar base, placa, prefixo, ID de rastreador, modelo, ICCID e MSISDN em vínculo sustentado por identificadores.      | API + Operacional; datas das referências indicadas. | Divergência é candidato à revisão, não prova automática de erro; não sobrescrever a planilha.                         |
| Consumo KORE/Arqia                  | Comparar consumo por operadora e ciclo explícito; quota compartilhada precisa ser tratada no grupo correspondente.                                 | KORE API/CSV e Arqia manual.                        | Sem datas de início/fim confirmadas para o acumulado, não declarar consumo do ciclo nem excedente exato.              |

## Atribuição e identidade

- Agentes da OS usam somente os mapeamentos nominais explícitos mantidos no código. Jean/Jean Johann e Eduardo/Eduardo Oliveira são os vínculos confirmados; semelhança textual não cria um novo vínculo.
- A identidade de cliente/filial da OS usa CNPJ completo da coluna C. Consolidação para relatórios não altera a identidade usada em vínculos físicos, ciclos ou auditoria.
- Para cruzar monitoramento/API com Operacional, número de série exato é a âncora primária atualmente implementada. Serial duplicado ou ausente, ou conflito entre serial, placa e chip, exige revisão; não fazer pareamento silencioso por aproximação.

## Temporalidade, qualidade e resposta do MCP

Toda saída analítica deve carregar, quando disponível: período solicitado, data-fonte usada, data da consulta/coleta, filtros aplicados, cobertura (completa/parcial/indisponível), granularidade, unidade e critérios da métrica.

O MCP deve preferir uma resposta estruturada com `value`, `unit`, `period`, `asOf`, `source`, `filters`, `coverage`, `definition` e `limitations`. Se a ferramenta não oferecer a dimensão pedida — por exemplo, linhas individuais quando a consulta só retorna totais — deve explicar a limitação em vez de extrapolar.

## Itens sem contrato confirmado

- Permanência/conexão dos agentes Zoho: depende de relatório de sessão Agent Availability; apontamento de chamados não substitui esse dado.
- Início e fim do ciclo de consumo acumulado KORE: manter seleção/referência de ciclo explícita até confirmação da fonte.
- Categorias de chamados em histórico: fonte atual devolve a classificação corrente, não necessariamente a vigente ao fechar.
- Faturamento esperado, competência financeira, cancelamento e pró-rata: fora do escopo priorizado pelo proprietário.

## Referências internas

- [Matriz de regras e revisão](MATRIZ-DE-REGRAS-E-REVISAO.md)
- [Indicadores Suporte](INDICADORES-SUPORTE.md)
- [Integração Zoho Desk](INTEGRACAO-ZOHO-DESK.md)
- [Critérios de manutenção e identificação](CRITERIOS-DE-MANUTENCAO-E-IDENTIFICACAO.md)
- [Consumo de linhas](CONSUMO-DE-LINHAS.md)
- [Monitoramento e cadastros](MONITORAMENTO-TRABALHO-E-CADASTROS.md)
- [Automação n8n e MCP](AUTOMACAO-N8N-E-MCP.md)
