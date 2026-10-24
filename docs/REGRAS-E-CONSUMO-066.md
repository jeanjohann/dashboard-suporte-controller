# Regras e apresentação — 0.66.0

Entrega de 24/10/2026, após as definições do proprietário. A [matriz de regras](MATRIZ-DE-REGRAS-E-REVISAO.md) continua sendo o inventário por indicador; este documento registra as alterações implementadas.

## Indicadores Suporte

- Uma linha elegível continua sendo uma execução ou um agendamento do suporte. Um par de retirada/instalação continua independente como evento de troca para equipamentos. Não houve consolidação dos atendimentos nem mudança nos demais módulos de improdutivas.
- Fechados automáticos exigem status atual Closed e último fechamento confirmado dentro do período. Reabertos ficam fora. Se houve refechamento, somente o último agente confirmado recebe a contagem. O responsável atual não substitui esse autor. Autoria/data ambígua mantém o resultado em conferência.
- Consultas antigas podem continuar fornecendo tempo apontado, mas exigem nova consulta nesta página para aplicar a regra de fechados. A pesquisa cobre chamados acessíveis modificados desde o início do período até a referência da coleta; limites de acesso, paginação e indexação continuam relevantes. Não é uma leitura transacional de toda a organização.
- A consulta completa tenta ler o catálogo nativo de categorias em organizationFields. Catálogo confirmado inclui categorias zeradas para a equipe e cada agente. Falha nesse catálogo preserva as métricas e mostra apenas categorias encontradas, sem inventar uma lista completa.
- Pendências e On Hold aparecem por agente; On Hold já está incluído nas pendências. Os nomes dos status em espera ficam na ajuda da seção para conferir o significado de aguardar retorno do cliente. Não se atribui esse motivo automaticamente a qualquer status On Hold.
- Cards em quatro colunas em telas amplas, duas em telas menores; origem e números continuam visíveis. Regras nos ícones de ajuda, fontes e tabelas extensas em detalhes expansíveis. Alertas materiais têm resumo visível. Filtros, lançamentos, exportação e impressão permanecem disponíveis.

## Cadastros e revisão

API é referência do cadastro atual. O vínculo principal da conferência continua por serial exato, com estados separados para ambiguidades e registros presentes em uma única fonte. São comparados placa, prefixo, rastreador, modelo, ICCID, MSISDN e cliente/base. A tela mostra os valores originais de cada fonte e a ação por campo.

Equivalências entre código/nome da base API e cliente do Operacional são explícitas e salvas neste navegador por usuário; não corrigem planilhas nem são compartilhadas pelo D1. Nomes parecidos não são unidos automaticamente.

O adaptador conserva prefix, iccid e msisdn quando vierem explicitamente no diagnóstico; números de chip devem ser strings de dígitos para preservar precisão e zeros. A coluna Prefixo do Operacional é usada somente quando seu cabeçalho explícito é encontrado. Identifier e Nº não são presumidos como prefixo. Os campos novos foram testados com payloads fictícios; a existência deles no endpoint real ainda precisa ser confirmada. Ausência na API aparece como ausência de evidência, sem produzir falsa divergência desses campos opcionais.

Revisão de OS e Operacional compartilha código de regra RV01–RV15, severidade, indicadores afetados, aplicabilidade e orientação de resolução, além de linha/célula e valor original. Ausência em situação de estoque/retirada pode ser legítima. A classificação contextual não equivale a validar automaticamente o registro. Nenhuma correção ou exclusão de planilha é feita pelo diagnóstico.

## Consumo

Menu Consumo reúne Relatórios, Acompanhamento, KORE e Arqia. As quatro entradas herdam a permissão existente de Consumo M2M. Relatórios e Acompanhamento consolidam ambas as operadoras. CSVs e backups ficam nas páginas respectivas; a importação central de OS/Operacional/Logística passa a orientar esse destino.

KORE mantém sua coleta API administrativa. Uma coleta completa pode gerar uma prévia de apuração depois de informar e confirmar início e fim reais do acumulado. O endpoint atual não confirma esse ciclo; o sistema não presume o mês. Conversão usa MB decimal. Salvar passa pela mesma revisão/versionamento dos CSVs: mesmo período é uma versão alternativa, não soma adicional. A coleta parcial não pode gerar apuração.

Arqia permanece manual, sem depender da API paga. Backups/restaurações por operadora preservam arquivos e acompanhamentos da outra, configurações e a referência operacional atual. Este histórico de consumo continua local ao navegador, com backup exportável; não foi migrado para o D1 nesta entrega.

O vínculo principal de chip usa ICCID e MSISDN do Operacional. Uma fotografia real e recente de monitoramento, já disponível na sessão, pode confirmar ambos conjuntamente em um único veículo. Serial conflitante gera revisão, em vez de escolher uma fonte silenciosamente. Fotografia antiga, parcial, ambígua ou sem chip suficiente não confirma o vínculo pela API. A conferência é do cadastro atual, não prova de titularidade durante todo o período do consumo.

## Validação e pendências preservadas

Testes automatizados usam dados fictícios, incluindo reabertura/refechamento, categorias sem eventos, espera por agente, campos opcionais, backups isolados e conflitos de chip. Imports e compilação conferidos. A automação de navegador está desabilitada neste ambiente: não houve homologação visual interativa nem conferência autenticada dos resultados reais nesta rodada.

Permanecem fora desta entrega: refazer as quatro paletas solicitadas na fila, faturamento esperado/pró-rata, tempo conectado Zoho aguardando CSV Session, e consumo de linha não fornecido pelo diagnóstico de monitoramento. Nenhuma migração ou limpeza do D1 foi necessária.
