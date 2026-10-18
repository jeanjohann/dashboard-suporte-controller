# Manutenção, clientes e modelos — 0.29.0

Critérios confirmados pelo proprietário em 18/10/2026. As análises preservam as células e linhas originais. A classificação usa o arquivo completo antes dos filtros; custos lançados continuam com suas bases anteriores.

## Manutenção sem troca e substituição

Somente Assistência Técnica Concluída/Pago, excluindo Visita Improdutiva. Implementações, cancelamentos e agenda têm seus papéis próprios.

| Registro no mesmo chamado e placa                                         | Classificação                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------ |
| Uma linha com um ID de rastreador válido                                  | Manutenção sem troca de rastreador/kit           |
| Duas linhas, IDs válidos diferentes e mesma data válida                   | Um evento de troca                               |
| Duas linhas com mesmo ID, mais de duas linhas ou identificação incompleta | Revisão, sem presumir troca ou ausência de troca |
| Duas linhas com datas diferentes ou sem data utilizável                   | Revisão do par                                   |

Revisão da Instalação, Falha Alimentação e falhas em geral podem ser manutenções sem troca. O motivo isolado não substitui a contagem de linhas/IDs. Uma troca não são dois eventos. Selecionar só uma ponta de um par não a transforma em manutenção sem troca.

A direção retirada/instalação vem dos motivos reconhecidos. Não é inferida pela ordem das linhas. Para duração de rastreador, exige também cliente comum e data: busca a implementação ou a entrada pela troca anterior do mesmo serial, cliente e placa, respeitando a sequência. Uma troca com direção ou cliente incerto pode ser contada como evento, mas não recebe duração automática. Eventos conflitantes não são ignorados para escolher uma troca posterior conveniente.

RFID e coletora/teclado/terminal usam **Manutenção de Acessório** e as instruções. Troca/trocar explícito confirma substituição da categoria identificada. Manutenção sem troca explícita fica separada; categoria ausente/ambígua fica para revisão. Expressões explícitas como “sem troca” não confirmam substituição.

As contagens aparecem em **OS → Equipamentos → Ciclos e trocas → Trocas de equipamentos**, no perfil por cliente e nas análises vinculadas do Parque. Os relatórios conservam as linhas de origem. Categorias e unidades se sobrepõem: não somar serviços, eventos de rastreador e acessórios como um único total.

No mesmo painel, **Veículos e clientes com mais trocas** oferece ranking por cliente/placa ou cliente/filial. Conta ocorrências de substituição e separa rastreador/kit, coletora e RFID. O detalhe mostra datas, chamado, IDs/modelos quando utilizáveis, instruções e linhas Excel, com CSV do grupo ou da seleção completa. Casos sem identificação suficiente permanecem no detalhe, fora do ranking identificado. Volume de trocas não é taxa de falha nem quantidade física de equipamentos do kit.

## Tempo acompanhado dos acessórios

RFID e coletora são acompanhados separadamente no mesmo cliente e placa. O motivo é Manutenção de Acessório, com a categoria identificada nas instruções.

- Primeira troca: usa a implementação do veículo como referência inicial quando há histórico identificado da categoria. Se existe instalação explícita daquela categoria entre a implementação e seu primeiro atendimento, essa data mais precisa tem prioridade.
- Trocas seguintes: cada ciclo começa na **troca anterior da mesma categoria**, conforme confirmação do proprietário. Manutenção sem troca não reinicia a duração.
- Exemplo: implementação em 01/01, revisão em 10/01, troca de coletora em 01/02, revisão em 10/02 e troca em 01/03. Primeiro intervalo: 31 dias; seguinte: 28 dias. Uma troca de RFID nesse intervalo não reinicia a coletora.

O painel Vida em campo oferece os modos de início **Implementação / instalação até primeira troca** e **Entrada em uma troca até próxima troca**. Tabela e CSV mostram o início utilizado e as linhas que sustentam o intervalo. Filtros podem selecionar o início ou o encerramento; a busca do vínculo utiliza o histórico completo até o limite escolhido.

Referência pela implementação mede tempo acompanhado desde aquela referência, não idade de fabricação nem prova de que o acessório permaneceu instalado todos os dias. Sem implementação/instalação/troca anterior utilizável, a duração fica indisponível. Ambiguidade, cancelamento e observações sem troca permanecem separados.

## Clientes e filiais por CNPJ

A coluna **C · CNPJ para Cobrança** identifica o cliente/filial atendido. **AK não participa dessa identidade**. O CNPJ completo diferencia filiais, inclusive quando têm a mesma razão social ou raiz. Variações do nome com o mesmo CNPJ pertencem à mesma identidade.

Na importação manual de OS, a aba **Base clientes** é reconhecida sem distinguir maiúsculas e minúsculas. São lidas apenas as colunas **CNPJ**, **Razão Social** e a opcional **Cliente consolidado**, com a linha de origem. Preços, contatos e demais campos não entram nesse cadastro de identidade. Sem cabeçalhos únicos ou com documentos/nomes inválidos, o problema fica disponível para conferência.

Pontuação do CNPJ é removida somente na chave analítica. Não se completam zeros ausentes em documentos numéricos nem se usa CPF como CNPJ. Nomes conflitantes para o mesmo documento são sinalizados; não se escolhe arbitrariamente um nome do cadastro. A leitura não constitui validação fiscal.

Desde a 0.30.0, custos, contagens de clientes, perfil das intervenções e ranking de trocas por cliente oferecem uma camada de **Cliente consolidado**, usando o cadastro explícito ou razões sociais exatamente iguais na Base clientes. O proprietário autorizou esse padrão em 18/10/2026. É possível escolher CNPJ / filial por categoria; veículos, vínculos, reincidência e ciclos continuam com a identidade original. **Clientes e custos → Custo por cliente → Conferir clientes e filiais por CNPJ** mostra documento, identificação, grupo analítico, nome original, critério, situação cadastral e linhas de origem. Os filtros de razão social continuam com os nomes originais; a coluna C pode ser filtrada pelos filtros adicionais. [Regras e exemplos](AGRUPAMENTO-DE-CLIENTES.md).

Sem CNPJ utilizável, permanece o agrupamento pelo nome original, com essa limitação. Sem Base clientes, os CNPJs completos ainda separam as filiais; não há enriquecimento cadastral. O piloto Google continua lendo somente a aba OS e informa a ausência do cadastro; ampliar sua consulta não foi ativado. O agrupamento operacional do Parque ainda descreve a fotografia operacional, não a titularidade histórica.

## Modelo pelo serial

| Prefixo do rastreador             | Modelo    |
| --------------------------------- | --------- |
| 144                               | MXT-130v2 |
| 130, 137                          | MXT-130v1 |
| 162                               | MXT-162   |
| 141, 142, 143, 81, 82, 83, 84, 85 | MXT-141   |

Prefixos de três dígitos têm precedência sobre os de dois dígitos. Identificadores textuais mantêm seus zeros; números sem precisão segura e prefixos desconhecidos não recebem modelo por aproximação.

Operacional, Parque e referências do Consumo usam o modelo identificado pelo serial. A coluna Modelo importada permanece intacta e disponível na conferência original. Não substitui um prefixo desconhecido nem corrige o serial. OS mantém também as comparações explicitamente rotuladas como modelo original da planilha.
