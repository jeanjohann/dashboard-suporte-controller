# Revisão e análises personalizadas — 0.48.0

Preparado em 21/10/2026. A publicação deve ser confirmada na entrega.

## Meu Dashboard

No catálogo, procure **Análise personalizada de OS** ou **Análise personalizada do Operacional**. Escolha agrupamento, medida, escopo e apresentação. Sem agrupamento, o resultado pode ser card ou tabela. Por mês, também pode ser linha; rosca fica limitada à contagem de registros, que forma uma partição.

OS permite cliente, responsáveis, tipo, motivo, status, placa, técnico, cidade, UF e mês. As medidas são registros, chamados/placas/seriais distintos e soma/média do custo total válido. Escolha todos os status, Concluída/Pago ou somente efetivos. Datas usam Data de atendimento. Nomes são os campos originais; esta análise não consolida clientes automaticamente.

Operacional permite cliente, modelo pelo serial, situação, plano e placa. Mede registros, placas/seriais distintos e soma/média da mensalidade válida. É uma fotografia cadastral, não série histórica ou faturamento previsto.

Valores ausentes não viram zero. A média divide a soma pelos valores válidos, incluindo zeros. Custos são por linha, não por chamado. Distintos de grupos diferentes podem se sobrepor. A soma das médias ou dos distintos entre grupos não é o total da base.

**Fonte e critérios → Conferir cálculo e linhas de origem** mostra grupos, valores, quantidades válidas/excluídas e linhas físicas. A configuração acompanha salvar, duplicar e backup. Permissões e carregamento da fonte continuam obrigatórios. Comparação sobreposta entre séries personalizadas fica para outra etapa; elas podem ser posicionadas lado a lado.

## Equipamentos

Em **Ciclos e trocas**, selecione **Modelo × motivo da manutenção**. Cada célula abre os registros originais que compõem os eventos. Filtros próprios de modelo/motivo refinam o recorte da categoria e a exportação CSV.

Somente assistências técnicas efetivas de rastreadores entram. A classificação usa o arquivo completo: uma linha elegível é manutenção sem troca; troca com direção confirmada conta uma vez no modelo do serial retirado, usando o motivo da retirada. Ambas as linhas devem permanecer selecionadas. Acessórios não entram. Trocas sem direção, seleções parciais e linhas com classificação ambígua aparecem em contagens separadas; modelos desconhecidos permanecem visíveis.

É volume observado, não taxa de falhas ou vida útil. Motivo de retirada não identifica necessariamente a causa técnica da troca.

## Revisão das duas fontes

OS → Dados e relatórios → Dados e revisão → Revisão, e Operacional → Revisão manual, usam o mesmo painel. Cards resumem apontamentos/linhas/formato/possíveis divergências. Busca, categoria e paginação ajudam a localizar o lançamento.

**Ver diagnóstico** abre origem, problema identificado, impacto e orientação de conferência antes da lista. O registro original completo pode ser expandido. A exportação CSV leva o diagnóstico filtrado com arquivo, aba, linha, célula e orientação.

São explicações dos apontamentos já detectados, não certificação integral da planilha. Os filtros da página delimitam os registros; a busca e categoria do diagnóstico refinam apenas a revisão. Cabeçalhos repetidos das OS são avisos estruturais. Linhas ignoradas na importação continuam informadas separadamente pelo importador. Não são criadas correções automáticas nem presumida duplicidade com base apenas em repetição.
