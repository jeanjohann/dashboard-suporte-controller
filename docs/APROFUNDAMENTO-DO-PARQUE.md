# Histórico individual e concentração do parque — 0.28.0

## Onde consultar

Abra **Parque e Manutenção → Manutenção e relatórios → Visualização → Histórico individual e concentração**. O novo conteúdo participa do mesmo painel das análises existentes, sem acrescentar categoria ao menu. A personalização da página oferece seu resumo, conteúdo completo e recolhimento.

## Base e datas

A análise recebe os mesmos pares serial + placa vinculáveis das análises de manutenção do parque. Registros ambíguos ou incompatíveis continuam fora da atribuição automática. Cliente vem da fotografia operacional atual; desde 0.29.0, modelo é identificado pelo prefixo do serial, preservando a coluna original. Não comprova titularidade na época do serviço.

Definições confirmadas pelo proprietário em 17/10/2026:

- **Intervenção efetiva:** qualquer linha Concluída/Pago, excluindo Visita Improdutiva, independentemente do tipo de serviço. Uma linha é serviço, não uma visita física única.
- **Última intervenção:** maior Data de atendimento válida dos efetivos no período selecionado desta categoria. Não é necessariamente a última em todo o arquivo.
- **Referência inicial:** maior data válida de todos os atendimentos realizados no arquivo OS completo, incluindo improdutivas na escolha do limite do arquivo. Canceladas não definem esse limite. A referência pode ser ajustada ou recuperada pelo botão **Usar limite do arquivo**.
- **Dias observados:** referência menos última data válida. Referência vazia/inválida ou anterior à última intervenção deixa a duração indisponível; não gera zero ou número negativo.

Equipamentos sem efetivos no recorte e com efetivos sem nenhuma data válida ficam separados. Efetivos sem data também são contados quando há outros serviços datados. Esses casos não comprovam ausência de manutenção, defeito, atividade ou necessidade de atendimento. Uma referência antiga não reconstrói a frota histórica.

## Concentração e histórico

A concentração usa assistências técnicas efetivas vinculadas, mantendo grupos sem identificação no denominador. Mostra a participação dos cinco maiores clientes/modelos, ranking e tamanho da base por grupo. Concentração não é taxa de falha.

O gráfico mostra grupos com assistências; a tabela recolhível **Conferir grupos e tamanho da base** preserva também os grupos sem assistência e todos os denominadores. Essa escolha visual não remove registros da base nem altera o percentual.

As faixas de tempo são exclusivas: até 30, 31–90, 91–180 e mais de 180 dias. Apenas durações utilizáveis entram; os demais registros permanecem identificados na grade. Não são faixas de manutenção vencida.

A busca da grade considera cliente, modelo, serial, placa e situação da data. Não altera os indicadores e gráficos acima. A ordenação é aplicada ao conjunto filtrado antes de paginar dez linhas; **Último** chega ao fim do conjunto. **Conferir linha** abre abaixo os atendimentos realizados vinculados, inclusive improdutivos, com todas as colunas e linhas originais de OS.

## Exportação e impressão

O CSV do histórico contém toda a grade filtrada, referências de origem, filtros, busca e data de referência. Não se limita à página exibida. Impressão/PDF mantém os gráficos, a página exibida e o detalhe aberto, com a referência temporal correta. Ambas as ações respeitam a permissão de exportação.

Manutenção sem troca foi classificada em 0.29.0 conforme [regras confirmadas](CRITERIOS-DE-MANUTENCAO-E-IDENTIFICACAO.md). Custos por equipamento, matriz modelo × motivo e titularidade histórica continuam pendentes. A entrega não atribui custos do mesmo atendimento a vários equipamentos.

Arquivos: `modules/park/domain/parkHistory.js` calcula os indicadores; `components/ParkHistoryPanel.jsx` apresenta busca, paginação, origem e CSV. A análise recebe o resultado existente de `parkAnalysis`, sem criar outro mecanismo de vínculo.
