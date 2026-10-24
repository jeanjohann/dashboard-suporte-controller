# Avisos, franquias compartilhadas e revisão — 0.67.0

Correção 0.67.1: painel de avisos integrado também ao estado com fotografia carregada. Página completa com fonte fictícia, expansão dos avisos e abertura do histórico do veículo conferidas no navegador. Checagem final com 487 testes aprovados e um previamente ignorado.

Rodada autorizada em 24/10/2026. O proprietário definiu avisos dentro do sistema, franquias compartilhadas e preparação da conferência KORE enquanto o ciclo do acumulado não é confirmado pela operadora. Refatoração e revisão foram autorizadas na sequência.

## Monitoramento

**Avisos das coletas**, no Acompanhamento e em Relatórios, consulta os eventos já gravados no D1. Não dispara nova leitura do fornecedor. Separa primeira observação em atraso, entrada em atraso e retorno de comunicação; filtra atrasos/retornos, pagina de 30 em 30 e permite abrir o veículo na grade atual. O CSV exporta somente os avisos carregados, com esse alcance explícito.

Os eventos usam o limite de 48 horas do coletor, independente dos filtros da grade. Primeira observação em atraso não prova início de uma falha; retorno observado não reconstrói o instante exato da recuperação. Eventos históricos não são tratados como situação atual. Quando a identificação histórica não estiver disponível, a tela identifica o uso da fotografia atual para o rótulo. Novos eventos passam a conservar placa, base e rastreador da própria coleta.

O indicador de não vistos considera os avisos carregados. A marcação de leitura é local por usuário/navegador; não apaga eventos nem altera o tratamento do veículo. A leitura permanece restrita ao proprietário no piloto, como o histórico salvo existente. Nenhum canal externo, permissão de notificação ou envio de mensagem foi ativado.

**Campos disponíveis da API**, em Relatórios e Conferência de cadastros, conta prefixo, ICCID e MSISDN efetivamente recebidos na fotografia. Receber o campo não confirma a exatidão do cadastro. Consumo de linha não existe no contrato integrado atual: a inclusão ainda depende de endpoint com identificadores, volume/unidade, período e instante de apuração. Posições de rastreamento não são MB.

## KORE: conferência do ciclo

Na página KORE, após uma coleta completa, abra **Preparar coleta API para acompanhamento e relatórios** e informe as datas. **Conferir API com extrato CSV do mesmo ciclo** permite escolher um CSV guardado, inclusive versão arquivada, comparando ICCID, MSISDN e volume. Apurações geradas internamente pela API não servem como referência independente.

Datas precisam corresponder exatamente às do CSV. Distingue ausência em cada fonte, identificadores divergentes, duplicidades, valores inválidos, volumes iguais e diferentes. Totais de comparação incluem somente pares utilizáveis; não somam API e CSV. A exportação inclui todas as linhas da conferência, embora a tabela mostre 30 por página.

Sem confirmação do ciclo, o resultado é **prévia**, mesmo com volumes iguais. Confirmar as datas é uma declaração explícita do usuário, não uma homologação automática da operadora. Salvar apuração API continua exigindo essa confirmação e segue o versionamento já existente. Coleta em lotes e atraso da apuração podem explicar diferenças. A confirmação real do ciclo continua pendente; não foi presumida nesta entrega. Arqia continua manual.

## Franquia compartilhada

Cadastro e edição nas páginas KORE/Arqia: nome do contrato/grupo, início/fim do ciclo, franquia total em MB e lista completa de ICCIDs participantes. Relatórios e Acompanhamento apresentam os grupos de ambas as operadoras. Não usa os filtros da grade para reduzir o conjunto de participantes nem infere contrato pelo plano ou cliente.

O cálculo aceita uma única apuração de dados válida por ICCID, operadora e ciclo exato. Zero é válido; ausência, duplicidade, identificação inválida e período diferente não viram zero. Mostra observado, percentual, cobertura, situação, saldo e excesso observado. Sem cobertura completa, não informa saldo livre nem garante ausência de excedente. O excesso observado é um limite inferior se ainda faltam linhas. Saldo observado não é projeção ou fechamento de cobrança.

O mesmo ICCID não pode pertencer a grupos da mesma operadora em ciclos sobrepostos. A franquia é informada para o grupo inteiro; não calcula franquia por linha, rateio, cobrança ou pró-rata. Limites: 200 grupos por histórico e 20.000 participantes por grupo. Tabela de grupos mostra 10 por página e detalhes mostram 50 participantes por página; o CSV contém o conjunto completo dos grupos apresentados.

Grupos e ciclos ficam neste navegador, junto ao histórico de consumo. Backup/restauração da operadora inclui suas franquias e preserva as da outra operadora. Isso não constitui migração do consumo para o D1. Backups anteriores continuam legíveis, sem grupos inventados.

## Proteção do histórico local

IndexedDB atualizado para versão 2 sem apagar/recriar o object store existente. Uma aba antiga que abre versão 1 precisa atualizar antes de gravar, evitando perder os campos novos. Gravações atuais usam revisão crescente e comparação dentro da mesma transação; uma aba com revisão atrasada recebe erro e deve recarregar. A revisão é interna ao navegador e não é imposta pelo arquivo de backup.

Validação no IndexedDB real do navegador, com dados fictícios: gravação confirmada, tentativa atrasada recusada, grupo preservado e cliente versão 1 recusado com VersionError. Nenhum dado de produção foi criado ou alterado nesse ensaio.

## Primeira rodada de refatoração

OS reaproveita recorte, totais, financeiro, equipamento, ciclos e revisão pelas dependências corretas. Busca, paginação e mudanças de apresentação não repetem esses cálculos. A busca normaliza a expressão uma vez e mantém cache local do conteúdo exibido por células imutáveis; nova base reinicia o cache. Não combina textos entre células nem muda a semântica da busca. Operacional reutiliza o cruzamento com OS enquanto as duas bases permanecem iguais.

Ensaio no navegador em desenvolvimento com 1.000 OS fictícias: numa paginação observada, 17,4 ms antes e 0,4 ms depois; numa busca repetida, 136,5 ms e 1,6 ms. Primeira busca observada: 165,5 ms e 59,5 ms. São medições pontuais do componente, não latência total, nem garantia de ganho em toda página/máquina.

Benchmark reproduzível `npm run benchmark:orders`: 1.000 linhas sintéticas × 70 células, vinte amostras. Medianas da busca isolada em Node: 4,23 ms antes e 1,51 ms com cache preparado; p95 5,14 ms e 1,97 ms. A preparação fria do cache levou 192,80 ms nesse ensaio: o ganho repetido não elimina o custo da primeira preparação. Arquivo local de resultados em layout-review; o benchmark não mede React, DOM, rede ou D1.

Revisão inicial identificou CarrierPage.jsx e ConsumptionSourcesPanel.jsx sem referências de importação no código ativo e seletores theme-track sem elemento correspondente no seletor atual. Permanecem candidatos, não exclusões aprovadas nem prova de que todo material relacionado pode ser removido. Nenhum arquivo do usuário foi excluído. Páginas/gráficos inativos, demais grades extensas, isolamento do Meu Dashboard e divisão de componentes continuam na próxima rodada de desempenho.

## Validação e limites

Testes de paginação/autorização dos avisos, revisão local, franquias incompletas/sobrepostas, backup entre operadoras, comparação KORE e cache de busca com preservação das regras. Amostra local conferida em Claro e Escuro, com edição de grupo, acesso ao veículo e marcação de vistos. A documentação e o mapa de arquitetura acompanham os novos arquivos.

Sem novas credenciais, migração D1, alteração de cron ou mensagens externas. Permanecem dependentes de fonte externa: ciclo real KORE, endpoint de consumo do monitoramento e CSV Session do Zoho. A conferência numérica com extratos reais do mesmo ciclo não foi substituída por testes fictícios.
