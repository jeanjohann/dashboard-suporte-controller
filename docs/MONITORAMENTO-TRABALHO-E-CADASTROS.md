# Monitoramento: acompanhamento e cadastros — 0.53.0

## Área de trabalho

Filtros e lembretes aparecem antes da fila, com apresentação compacta. Quando fechados, filtros e visões favoritas compartilham uma linha; abrir os filtros mantém cada título acima de seu campo. O resumo dos recortes continua visível. Lembretes pendentes são destacados no resumo, mesmo com a lista recolhida; falha de leitura tem aviso explícito e opção de tentar novamente ao abrir. Não há mudança na persistência local dos lembretes ou das anotações.

A grade começa pelos campos de identificação, comunicação, situação e acompanhamento. A opção **Exibir alimentação, perfil e posições na grade** revela os campos técnicos. A coluna Acompanhamento permanece acessível na rolagem horizontal. CSV e XLSX incluem os campos completos independentemente dessa escolha visual. Os indicadores de duração ficaram maiores e mais vivos, com legendas textuais e estado neutro para coleta/data sem classificação utilizável.

A demonstração foi retirada da interface e do carregamento de fontes. O conjunto fictício e as funções de domínio continuam disponíveis exclusivamente para testes de desenvolvimento; o contrato da API continua recusando demonstrações como leitura real.

## Períodos

Limites de atenção disponíveis: 48, 72 e 96 horas; 30, 60 e 90 dias (720, 1.440 e 2.160 horas corridas). O limite é inclusivo. Os recortes “30/60/90 dias ou mais” são cumulativos, respeitando coleta utilizável e datas válidas. Também estão disponíveis no Meu Dashboard, inclusive para configurações salvas.

O gráfico usa faixas **exclusivas**: 48–72 h, 72–96 h, 96 h–30 dias, 30–60 dias, 60–90 dias e 90 dias ou mais; o limite superior de cada faixa é excluído. Não representam histórico de episódios. O indicador 96 h ou mais permanece cumulativo; não some esses cards para obter a frota. Ausência de posição ou coleta antiga não recebe cor de interrupção confirmada.

Os gráficos foram separados dos controles de tabela com espaçamento explícito; tabelas mantêm ordenação do conjunto, paginação e cobertura dos sinais. Nomes de clientes/bases têm apresentação em caixa alta na fila, conferências, filtros, barras e tabelas compartilhadas com colunas de cliente. A formatação não altera IDs, fontes, vínculos ou agrupamentos; o dado original continua preservado.

## Conferência de cadastros

Abra **Monitoramento Ativo → Conferência de cadastros**, após carregar a planilha ou a leitura conectada do Operacional e consultar o Monitoramento. Exige permissão para Operacional ou Parque e Manutenção, além do próprio Monitoramento. A conferência usa as fontes completas autorizadas da sessão; não herda os filtros das outras categorias nem executa consultas adicionais.

O vínculo usa o **serial numérico exato**, sem remover zeros iniciais. Não usa placa para forçar correspondência. Seriais ausentes, inválidos, células com erro e números longos sem precisão confirmada ficam separados para revisão. Mais de uma ocorrência em qualquer fonte gera grupo ambíguo, conservando todas as linhas.

Para vínculos únicos, compara placa (ignorando apenas caixa, espaços e hífen), cliente/base (caixa e espaçamento) e modelo (caixa, espaços e hífen). Nome da base no legado pode ser diferente da razão social no Operacional; uma diferença **não prova erro** e não cria equivalência automática. Variantes de modelo também exigem conferência. Usa o modelo explicitamente cadastrado na planilha para mostrar o que precisa ser revisado.

Os grupos são: compatível nos campos comparados, campos para conferir, vínculo ambíguo, somente API, somente Operacional e identificação para revisão. “Somente” significa ausência nessa fonte carregada, sem concluir que um cadastro está errado. Todas as situações operacionais são incluídas, inclusive canceladas. A tela mostra origem, linha da planilha, situação, valores lado a lado e motivo de revisão. Pesquisa, recorte, paginação e CSV completo do recorte ficam na própria seção; impressão inclui a página visível.

A data da coleta mais antiga e a referência da conferência são explícitas. Coleta antiga/indisponível gera aviso; a comparação não comprova atualização do cadastro. Nenhum registro é corrigido automaticamente. CSV destina-se à revisão manual, não à reimportação automática.

## Exportações

Na própria fila, **Exportar XLSX** e **CSV da grade** usam todos os veículos do recorte atual, não apenas a página exibida. Incluem filtro, limite, referência e ID da base, além dos campos técnicos e do tratamento salvo. Rascunhos não são exportados.

**CSV da grade** é uma tabela retangular, com cabeçalho na primeira linha, BOM, separador brasileiro e proteção de textos contra fórmulas. **XLSX** mantém nove abas (contexto, veículos, bases, indicadores, alimentação, posições, modelos, histórico e lembretes), identificadores como texto, zeros/ausências distintos, filtros de cabeçalho e percentuais formatados. Em Relatórios há também **CSV completo por seções**, preservando o formato anterior com contexto e históricos.

Relatórios mantém seu recorte próprio, conforme os filtros independentes por categoria. O texto junto aos botões informa esse alcance; exportar diretamente na fila evita confundir o recorte de trabalho com o da categoria Relatórios. Erros de geração passam a ser informados na tela.

## Dados da linha e consumo

A documentação e o adaptador do diagnóstico integrado (`addlogDiagnostic.js`, contrato interno v1) fornecem identificação do veículo/rastreador, base, modelo, perfil, última comunicação, posições em 24 horas, alimentação e bateria. **Não há campos documentados e mapeados de telefone, ICCID, operadora ou consumo em bytes/MB nesse contrato.** Não foi presumido que campos extras ou um endpoint diferente tenham esse significado.

Portanto, esses dados não foram adicionados como se estivessem disponíveis. Posições continuam sendo registros de comunicação, sem conversão para MB. Para ampliá-los, obter o contrato/endpoint autorizado do responsável pelo legado ou usar as integrações KORE/Arqia quando liberadas, identificando SIM, unidade, janela e cobertura. O Operacional já possui telefone/ICCID; a conferência atual não os compara contra a API sem uma fonte equivalente.

## Homologação

Amostra exclusivamente fictícia de 1.800 veículos com diferentes durações, nulos e zeros, sem chamada à API real. Testes cobrem limites exatos de 30/60/90 dias e coleta indisponível; conferência cobre correspondência, divergência, duplicidades, ausências, erros e precisão de serial. Exportações de 1.800 linhas verificam o conjunto completo e tipos; downloads pela interface confirmam 250 veículos no recorte de 90 dias, com 25 colunas e filtros correspondentes em CSV/XLSX. A validação real do cadastro permanece uma atividade de revisão do usuário sobre as fontes carregadas.

Banco, coleta agendada, histórico remoto e sessões reais do Zoho permanecem fora desta rodada.

Verificação final local em 22/10/2026: `npm run check` aprovado (importações, formatação, 398 testes e compilação; um teste previsto ignorado). Interface conferida em Claro, Escuro e Grafite e Lima, incluindo filtros abertos, grade com/sem telemetria, ausência de demonstração, faixas de duração, revisão/paginação e downloads. Em 390 px, os campos se reorganizam em uma coluna e a rolagem das grades permanece dentro da seção. Sem erros no console. Mapa local e documentação atualizados; 0.53.0 publicada em 22/10/2026, no commit `8e3542b` e versão Cloudflare `c70c6992-778c-459b-b475-f331f563af41`.

Conferência da publicação em 22/10/2026: GitHub na entrega `8e3542b`; assets de produção correspondem ao arquivo `index-CB2n2-jP.js` da compilação 0.53.0. Cloudflare informou a revisão ativa `90be2007-128d-419e-808d-2f9de5316f62` após a publicação inicial `c70c6992-778c-459b-b475-f331f563af41`. Interface autenticada confirmou o acesso à Conferência de cadastros e a retirada da demonstração, sem erros no console ou chamada ao diagnóstico real.
