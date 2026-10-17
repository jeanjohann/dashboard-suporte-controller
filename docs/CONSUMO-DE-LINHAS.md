# Linhas — Controle de Consumo

Módulo de acompanhamento da Arqia e da Kore, integrado à identidade Addlog. O foco é encontrar consumo acima da referência, revisar vínculos com o operacional e acompanhar ações em novos períodos. Contratos, estoque e saldo de franquia ficam fora desta etapa.

As integrações por API de **KORE Brasil / Saitro** e **Arqia** entraram na fila em 17/10/2026, com aprovação do proprietário. A consulta automática ainda não está implementada nem ativada; depende da documentação, liberação das contas e validação com os CSVs atuais. O [escopo das integrações](INTEGRACAO-OPERADORAS.md) registra os campos desejados, as pendências e os critérios de homologação. Importação, histórico e anotações locais continuam com as regras deste guia.

## Uso

Desde **0.28.0**, Visão geral, Comparativos, Clientes/equipamentos, Revisão dos vínculos, Mensalidades e Arquivos/histórico oferecem **Resumo**, com as mesmas bases e filtros da visão completa. Em Histórico e arquivos, [Fontes de consumo e preparação das APIs](PREPARACAO-FONTES-DE-CONSUMO.md) identifica as conexões ainda pendentes e permite testar, com dados fictícios isolados, revisões de acumulados, repetição, CSV/API e falha parcial. O histórico real e seu formato de backup não foram alterados.

Desde **0.27.0**, o painel **Acompanhamento do consumo** alterna entre **Grade e acompanhamento** e **Ranking e prioridades**, sem repetir a tabela. Na grade, **Fora dos totais** permite conferir registros não elegíveis do recorte; eles não entram nas somas/ranking. O status abre a linha do tempo abaixo, e **Conferir origem** mostra o CSV original. [Mapa, seleção e exportação](ORGANIZACAO-DAS-ANALISES.md).

A categoria **Acompanhamento** substitui o nome Investigação desde a versão 0.20.4. Seus relatórios, histórico e preferências mantêm os mesmos critérios; a chave interna `investigation` permanece.

1. Abra **Linhas - Controle de Consumo** e clique em **Importar extratos**. Pode selecionar os dois arquivos CSV juntos.
2. Confira a operadora, as datas e a separação entre dados, SMS e outros serviços. Clique em **Salvar no histórico**. Uma importação inválida preserva os dados guardados.
3. Importe o operacional XLSX para conferir ICCID + MSISDN e mostrar cliente, ID do equipamento, modelo e placa. A importação pela página de linhas guarda essa referência. Se importar pela página Operacional, use **Guardar operacional atual no histórico** para incluí-la no backup.
4. O quadro **Filtros**, no topo, indica a categoria afetada e reúne apurações, critérios e busca; cada categoria mantém sua seleção. Selecione uma apuração por operadora; a mais recente vem selecionada inicialmente. Filtros múltiplos usam OU dentro do campo e E entre os campos.
5. Em **Acompanhamento**, consulte o ranking para priorizar e a grade para selecionar/exportar linhas. Clique no status de acompanhamento para abrir o histórico abaixo. Registre data, situação e anotação, confirmando em **Salvar acompanhamento**. **Conferir origem** mostra os registros originais.
6. Em **Histórico e arquivos**, baixe o backup JSON. No outro navegador/computador, importe e confira esse backup antes de restaurar. A restauração substitui o histórico local; o cancelamento e arquivos incompatíveis preservam o histórico anterior.

A OS continua carregada apenas na sessão e seus filtros são independentes. O consumo é salvo em IndexedDB, local ao navegador e ao endereço do dashboard, inclusive à porta utilizada. O backup leva os CSVs originais, suas versões, a referência operacional importada, anotações e o limite de investigação. Não há sincronização entre computadores. Trocar o endereço/navegador ou limpar seus dados exige restaurar o backup. A leitura ou gravação que falha é informada.

## Formatos e precisão

- Arqia: ICCID, MSISDN/MSISN, Período Início, Período Término, Consumo (MB), Plano; os demais campos são preservados.
- Kore: ICCID, MSISDN/MSISN, Data Início, Data Fim, Serviço, Consumo Total, Produto e campos financeiros. A operadora é reconhecida pelos cabeçalhos, não pelo nome do arquivo.
- Dados móveis, SMS e frete são registros diferentes. Apenas Serviço = dados entra no volume e nas contagens de tráfego. SMS não duplica o chip; frete não recebe rateio por linha.
- KB / 1024 = MB; GB × 1024 = MB. O arquivo deve usar formato brasileiro até seis casas decimais. A soma usa inteiros em unidades de 1/1.024.000.000 MB para preservar a conversão de KB sem arredondar cada linha. A exibição usa até seis casas decimais.
- Zero é válido. Ausências, valores negativos/incompatíveis, datas impossíveis/invertidas e identificadores ausentes, não numéricos ou apenas zeros ficam sinalizados. Não são substituídos por zero.
- Datas DD/MM/AAAA, com dias inclusivos. MB por dia = volume do período / quantidade de dias; não representa medição de cada dia nem uma projeção de mês fechado.
- Identificadores continuam textos, com zeros iniciais. Originais e número de linha física do CSV ficam disponíveis para conferência.
- Cabeçalhos repetidos, campos em quantidade incompatível e aspas inválidas impedem a importação. UTF-8 é usado primeiro, com alternativa Windows-1252 para erro de decodificação.

## Indicadores e investigação

Chips no recorte conta identificadores ICCID válidos distintos por operadora, inclusive os que exigem revisão de consumo. Linhas com tráfego e consumo zero usam apenas registros de dados elegíveis. Consumo total, médias, mediana, maior consumo e faixas usam a mesma base elegível; o número de registros excluídos é informado. A média geral inclui zeros; a média com tráfego usa apenas positivos. Os cards reunidos somam as apurações selecionadas, que podem ter durações diferentes; o comparativo por operadora mostra as datas e MB por dia.

O destaque inicial é consumo **acima de 2× a média de sua operadora na apuração**, incluindo zeros. O fator é ajustável de 1 a 100 e salvo no histórico. A referência é calculada no extrato completo antes dos filtros de cliente, modelo, busca e consumo. O destaque indica necessidade de investigação, sem concluir falha, bloqueio, excedente faturado ou equipamento parado.

A franquia é compartilhada dentro dos contratos, inclusive o plano descrito como 1GB Individual. Como há vários contratos por fornecedor e sua vinculação ficou fora do escopo, não calculamos saldo global por operadora, linhas bloqueadas ou cobrança extra com base no consumo.

A tabela mostra 100 registros por página; a ordenação considera o recorte inteiro. O CSV exporta todas as linhas filtradas, critérios, datas, unidade, referência e origem. Impressão/PDF mostra a página da tabela e os gráficos exibidos; o CSV contém o conjunto completo. Gráficos de ranking permitem 10, 20 ou todos e exportação SVG.

## Duplicidades e versões

Repetições de ICCID + serviço + período dentro do mesmo extrato deixam todas as ocorrências fora da soma. Filtrar uma das ocorrências não resolve a duplicidade. O mesmo chip em dados e SMS, ou em meses diferentes, é legítimo.

Reimportar conteúdo idêntico não duplica arquivos. Uma versão diferente da mesma operadora e conjunto de períodos arquiva a versão anterior, mantendo o original no backup. É possível arquivar e reativar versões; só uma versão da apuração fica em uso. Arquivos com conjuntos de períodos parcialmente coincidentes exigem revisão/arquivamento antes da importação ou reativação. Backups com apurações ativas repetidas são rejeitados.

## Vínculos e linha do tempo

Vínculo confirmado exige ICCID e MSISDN exatos, únicos, no mesmo registro do operacional. Correspondência por apenas um campo, registros repetidos, conflito entre os campos e ausência ficam separados para revisão. Células com erro ou identificadores numéricos de precisão insegura não confirmam vínculos. ID de equipamento ausente/incompatível continua não informado.

Cliente/equipamento refletem a fotografia operacional importada. Não comprovam onde o chip estava em meses anteriores. A linha do tempo acompanha **operadora + ICCID**, usa todas as apurações em uso daquele chip e mostra volume, dias, MB por dia, arquivo e linha. Períodos semanais e mensais sobrepostos são observações separadas e não são somados. Anotações guardam a referência de cliente/ID exibida quando a ação foi registrada. Consumo sozinho não comprova que uma intervenção resolveu um defeito.

## Mensalidades

Valor Faturado, Valor Multa e Valor Total da Kore aparecem separados por dados, SMS e outros serviços, com quantidade de valores totais válidos. Não confirmam pagamento. Os registros de dados e SMS acompanham os chips filtrados; frete/outros serviços mostram o extrato completo da operadora selecionada, sem rateio. Arqia não informa preços nesse formato e exibe não informado, não zero.

## Manutenção e validação

Na versão 0.20.1, acompanhamento e persistência foram extraídos da página principal: `hooks/useLineFollowup.js` coordena busca/rascunho/histórico/exportação; `hooks/useConsumptionArchive.js` confirma gravações; `components/LineHistoryPanel.jsx` e `ConsumptionArchivePanel.jsx` apresentam histórico e arquivos; `utils/consumptionFormatting.js` reúne os formatos do módulo. Regras e formato do histórico/backup permanecem os mesmos. Veja [o registro de revisão e refatoração](REVISAO-E-REFATORACAO.md).

`src/modules/consumption/domain/consumption.js`: parser CSV e funções básicas; `src/modules/consumption/domain/lineConsumption.js`: formatos, unidades, elegibilidade, vínculos, referência, versões e linha do tempo; `src/modules/consumption/data/consumptionHistory.js`: IndexedDB e validação do backup; `src/modules/consumption/components/LinesPage.jsx`: tela; `src/modules/consumption/components/LineRecordsTable.jsx`: ordenação e paginação.

Testes cobrem conversão exata, zero/ausência, identificadores, serviços separados, duplicidades antes dos filtros, vínculos ambíguos, média de referência, versões, períodos e backups incompatíveis. Conferência no navegador com os arquivos reais cobre importação, totais por soma inteira independente, vínculo operacional, recarga, CSV completo, anotações, reimportação idêntica, backup/restauração, novos períodos e telas desktop/móvel. Os arquivos de origem não são modificados.

## Organização dos fluxos — 0.20.2

Importação e revisão de arquivos ficam em `useConsumptionImports.js`; prévia e seletores têm componentes próprios. Filtros visuais ficam em `ConsumptionFiltersPanel.jsx`, e o recorte é calculado por `consumptionFilters.js`. CSV filtrado/selecionado é montado por `consumptionRecordsReport.js`. Cards, investigação, equipamentos, valores dos extratos e origem foram extraídos em painéis por assunto. Esses componentes recebem os mesmos dados e preservam critérios, títulos, impressão, permissões e formato de armazenamento. Confira o mapa de responsabilidades em [Revisão e refatoração](REVISAO-E-REFATORACAO.md).

## Fila de acompanhamento — 0.20.0

Em **Acompanhamento**, a grade vem antes do histórico e do gráfico. Exibe apenas apurações elegíveis do recorte, começando pelo maior consumo total em MB. Cliente/placa vêm do vínculo operacional atual; sem vínculo confirmado, aparece Linha não identificada. Campos incluem operadora, número, ICCID, apuração, MB por dia, última marcação e data da ação. Como cada operadora pode ter períodos diferentes, use MB por dia para comparar durações. Não há soma de períodos sobrepostos nem exclusão automática por consumo alto.

Clique no status para abrir e exibir a linha do tempo abaixo, inclusive se ela estava oculta/recolhida. Registre data, marcação e observação e use **Salvar acompanhamento**. A grade é atualizada somente após a gravação no IndexedDB. A última marcação é escolhida pela maior data da ação; em empate, pela última anotação registrada. Identificação do histórico permanece operadora + ICCID, independente de número/cliente atual. Trocar de chip limpa o rascunho para evitar vincular uma anotação ao chip errado.

A grade possui dez registros por página, Anterior/Próxima/Último, ordenação sobre todo o recorte e seleção para CSV. Valores inválidos/duplicados continuam disponíveis em Linhas para investigar e na revisão. O histórico usa todas as apurações em uso do chip, independentemente dos filtros da grade. Novas ações guardam também a placa exibida, incluída no backup e relatório individual; ações anteriores sem placa são preservadas. Não há sincronização entre usuários ou envio dos dados ao servidor.

## Relatório individual e armazenamento futuro

Em Acompanhamento, selecione o chip em Linha do tempo de consumo. Registre a data, a marcação e a observação e clique em Salvar acompanhamento. As informações são confirmadas somente depois de gravadas no navegador e permanecem após recarregar a página.

Use Exportar histórico XLSX para obter abas Contexto, Apurações e Acompanhamento. Exportar histórico CSV entrega o mesmo conteúdo em blocos. Identificadores permanecem textuais, incluindo zeros iniciais. Os relatórios incluem todas as apurações em uso elegíveis da operadora + ICCID selecionados, sem limitar ao filtro de apuração do topo. Versões arquivadas não entram. Períodos sobrepostos permanecem separados e não geram um total acumulado artificial. A última marcação é determinada pela data da ação; empates mantêm a ordem de registro disponível.

Imprimir / Salvar PDF no cabeçalho da seção inclui tabela, gráfico e observações salvas. Não inclui formulário nem rascunhos. Exportação e impressão respeitam a permissão de exportar do usuário. O relatório não substitui o backup JSON: use Histórico e arquivos para salvar uma cópia restaurável dos arquivos e anotações.

A página acessa a persistência por historyRepository.js, com contrato assíncrono read/write. Hoje o único adaptador utiliza o IndexedDB existente, sem mudança no formato ou migração dos dados. A camada facilita a substituição futura por armazenamento autorizado, mas não habilita sincronização. Um serviço compartilhado exigirá autenticação, autorização por base, controle de concorrência, migração e política de retenção antes de ser ativado. A persistência de planilhas dos outros módulos permanece independente.

O seletor e o cabeçalho do histórico exibem cliente e placa da referência operacional atual. Sem vínculo confirmado, mostram Linha não identificada. Vínculos parciais preservam as informações conhecidas e indicam cliente/placa ausentes. O contexto exportado também inclui a placa; esse vínculo não é atribuído retroativamente às apurações antigas.

## Relação de linhas por consumo e seleção

Em Filtros da página, use Consumo acima de (MB) para escolher um limite absoluto sobre o total da apuração de cada linha. A comparação é estritamente maior, com até seis casas decimais, combinada aos outros filtros da página. Valores incompatíveis ficam fora; zero é um limite válido. Limpar o campo desativa o limite. A média de investigação continua calculada no extrato completo da operadora e período.

Nas tabelas de consumo, marque linhas individualmente ou clique em Selecionar todas as linhas filtradas. Esse botão seleciona o recorte inteiro, incluindo páginas ainda não exibidas. Exportar seleção CSV inclui somente registros marcados ainda presentes no recorte, com cliente, placa, identificadores, apuração, consumo, origem e critérios da exportação. A seleção permanece entre páginas; linhas removidas por filtros saem da seleção. Marcações de seleção não são observações salvas e não permanecem após recarregar.

Na linha do tempo, Buscar linha no histórico pesquisa cliente e placa da referência operacional atual, número, ICCID ou operadora. A linha já selecionada permanece disponível, mesmo se não corresponder à busca; o histórico selecionado não é filtrado nem reduzido pela busca. Sem busca, todas as opções aparecem.

A busca da linha do tempo também apresenta a quantidade de correspondências e uma lista de resultados clicáveis. Selecionar um resultado abre o histórico e limpa a busca. Quando não há correspondência, mostra orientação sobre o vínculo operacional necessário para pesquisar cliente e placa.
