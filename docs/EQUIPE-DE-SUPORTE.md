# Equipe de suporte

Disponível em **Ordens de Serviço → Equipe de suporte**, a partir de 0.21.0; cards e detalhamento individual atualizados na 0.26.0. Acesso segue a permissão de OS; exportação e impressão seguem a permissão separada existente. A planilha continua local.

## O que o relatório mede

Volume atribuído ao responsável registrado na OS. Não identifica o técnico prestador nem mede qualidade, SLA, tempo trabalhado ou produtividade por hora. O papel é selecionado no próprio relatório:

| Papel       | Responsável         | Data do recorte e da evolução |
| ----------- | ------------------- | ----------------------------- |
| Execução    | `Resp. Execução`    | `Data de atendimento`         |
| Agendamento | `Resp. Agendamento` | `Agendamento`                 |

A partir de 0.21.1, **Responsabilidade → Ambos** compara os dois papéis: duas barras por pessoa e duas séries na evolução. Agendamento continua usando Agendamento; Execução continua usando Data de atendimento. A mesma pessoa pode aparecer nos dois papéis, inclusive na mesma linha de OS. Os volumes não são somados como atendimentos únicos.

Os cards, participações, comparações anteriores, exclusões e detalhes permanecem separados por responsabilidade. O ranking considera a união dos nomes válidos; pessoa sem registros num dos papéis tem zero nesse papel. O limite de 10/20/todos se refere a pessoas e preserva as duas barras de cada uma. Ordenação pelo maior dos dois volumes individuais, sem criar pontuação somada. As tabelas e exportações mantêm todos os nomes, independentemente do limite do gráfico.

Nos dois papéis entram somente serviços **Concluída/Pago**. Portanto, o volume de agendamento representa a atribuição dos serviços já realizados pela data de agendamento; não conta toda a agenda futura nem mede quantos agendamentos foram feitos naquele dia. A planilha informa a data agendada, não necessariamente o instante em que o responsável efetuou o agendamento.

Cada linha é uma visita/atendimento. **Atendimentos efetivos** excluem Motivo = Visita Improdutiva, conforme o reconhecedor já usado nas OS. Visitas improdutivas aparecem em coluna e card próprios. Agendar, Agendado e Cancelada ficam fora destes indicadores. Nenhuma regra financeira foi alterada: improdutivas continuam com seus custos válidos nos relatórios financeiros, e canceladas continuam excluídas.

## Períodos e filtros

- Últimos 7 dias: hoje e os seis dias anteriores, no calendário de São Paulo.
- Semana anterior: segunda a domingo da semana anterior à atual.
- Mês: mês civil selecionado, do primeiro ao último dia.
- Ano: ano civil selecionado, de janeiro a dezembro.
- Todo o histórico: remove somente início/fim; mantém filtros de cliente, responsáveis, tipo, motivo, cidade, UF e colunas adicionais.
- Personalizado: preencher De/Até nos filtros da página.

Os atalhos alteram **somente o período da categoria Equipe de suporte**, sem alterar Visão geral, Equipamentos ou outras categorias. Usam os mesmos campos De/Até desse espaço, sem criar uma segunda seleção invisível. Na área de suporte, agendamento usa sua própria data, enquanto o resumo geral de registros no topo da página continua baseado em Data de atendimento. A seção informa sua própria base e quantidade elegível. Os dois filtros de responsáveis continuam separados e podem ser combinados; selecionar os dois exige que a linha atenda a ambos.

Com período ativo, realizados sem data válida são excluídos e quantificados. Sem período, continuam nos totais, mas ficam fora do gráfico temporal. Coluna obrigatória ausente torna apenas esta análise indisponível, com o nome da coluna. A linha original não é corrigida.

## Indicadores e comparação

Cards: atendimentos efetivos, visitas improdutivas, chamados distintos e clientes identificados. Chamados usam número da OS; clientes usam a razão social válida. Chamados/clientes distintos são contados no conjunto, não somados entre pessoas, pois podem aparecer em mais de um grupo.

Ranking: nomes registrados, efetivos, improdutivas, total realizado, chamados, clientes, participação, efetivos anteriores e variação. A participação divide os efetivos da pessoa por **todos os efetivos do recorte**, inclusive os sem responsável. Nomes vazios ou com erro ficam fora do ranking e podem ser conferidos em botão específico. Somente espaços externos são desconsiderados; nomes parecidos não são unidos automaticamente.

Comparação: com início e fim válidos, usa imediatamente o intervalo anterior de igual duração inclusiva, preservando os demais filtros e o papel. Não promete comparar meses civis de duração diferente. Se o anterior for zero, mostra “Sem base anterior” em vez de crescimento percentual artificial. O ranking apresenta as pessoas do período atual; o resumo anterior considera todo o recorte anterior.

Evolução: diária até 62 dias de intervalo completo; mensal nos demais casos. Não preenche artificialmente dias sem registros. Perfil detalha tipos de serviço por responsável, mantendo Visita improdutiva como categoria separada. Os botões Conferir mostram as linhas originais correspondentes; tabelas permitem ordenar.

Em Ambos, os eixos da evolução reúnem os períodos observados nos dois papéis; período sem registro em um papel fica sem ponto naquela série, em vez de receber um zero artificial. Faltar uma coluna obrigatória impede a comparação, com aviso, e permite selecionar o papel disponível separadamente.

## Relatórios e manutenção

CSV e XLSX incluem contexto, resumo, responsáveis, evolução, perfil e atendimentos originais elegíveis. Percentuais são frações numéricas (0,25 = 25%), formatados no XLSX. CSV protege textos contra interpretação como fórmulas; identificadores e células originais são preservados na aba de origem. O botão Imprimir / Salvar PDF usa a seção completa, e os comandos de resumo/recolhimento seguem o padrão do sistema.

Em Ambos, CSV/XLSX identificam Responsabilidade em cada indicador e grupo. A aba Atendimentos mantém uma única ocorrência de cada linha original, com coluna adicional ao final informando os papéis em cujos recortes ela entrou. Datas originais não são convertidas nem unificadas. Barras/evolução também oferecem SVG; impressão conserva os dois papéis.

- `src/modules/orders/domain/supportPerformance.js`: calendário, atribuição e comparação.
- `src/modules/orders/domain/supportComparison.js`: junção dos eixos e nomes, sem somar as populações.
- `src/modules/orders/domain/supportReport.js`: tabelas CSV/XLSX, usando os resultados do domínio.
- `src/modules/orders/components/SupportPerformance.jsx`: controles, cards, ranking e detalhes.
- `src/modules/orders/components/SupportComparison.jsx` e `SupportComparisonCharts.jsx`: apresentação dos dois papéis, barras e evolução.
- `src/modules/orders/domain/supportPerformance.test.js`: casos sintéticos, datas, improdutivas e exportação.

Se for criada identificação por código para os responsáveis, validar a chave antes de substituir o agrupamento atual por nome. Datas de criação, conclusão, SLA ou horas trabalhadas exigem novas fontes e critérios.

## Cards e detalhamento por pessoa — 0.26.0

O resumo principal mantém efetivos, improdutivas, chamados e clientes, com cores por indicador, ícones, ajuda e comparação anterior. A faixa complementar acrescenta:

| Indicador                    | Base e limites                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Veículos identificados       | Pares distintos de razão social + placa utilizáveis nas linhas Concluída/Pago, incluindo improdutivas. Ignora espaços externos, células vazias/com erro e marcadores de placa `0`, `-`, `?`, `s/placa`, `sem placa`, `sem dados`. Não corrige grafia nem representa frota ativa. Colunas ausentes exibem indisponível; sem linhas elegíveis, zero. A legenda do detalhe informa linhas sem par utilizável. |
| Visitas improdutivas / total | Improdutivas divididas por todas as linhas realizadas do mesmo papel e recorte. Sem visitas, percentual indisponível. A comparação usa pontos percentuais; não atribui a causa da visita ao suporte.                                                                                                                                                                                                       |
| Registros por chamado        | Todas as linhas realizadas divididas pelos números de chamado distintos, no mesmo papel e recorte. Inclui improdutivas. Sem chamados identificados, indisponível. Não é medida de esforço ou tempo trabalhado.                                                                                                                                                                                             |

Os totais distintos de clientes, veículos e chamados são calculados no conjunto, nunca somados entre pessoas. Em Ambos, cada card mostra Agendamento e Execução separadamente, com suas datas e bases. Variações não são classificadas automaticamente como boas ou ruins; base anterior zero não gera crescimento percentual e dados ausentes não viram zero.

**Cards de pessoas:** um por nome utilizável do recorte atual, com efetivos, improdutivas, chamados, clientes, participação e comparação dos efetivos. A participação continua usando todos os efetivos da equipe daquele papel, inclusive sem responsável. Em Ambos, a ordem usa o maior volume individual de efetivos entre os papéis, sem soma ou pontuação de produtividade. Pessoas somente no período anterior não são adicionadas à lista atual; a comparação geral continua considerando toda a base anterior.

A busca considera todos os nomes da seleção e afeta somente a apresentação dos cards; não filtra os totais, a tabela ou a exportação geral. Começa com até seis pessoas, com opção de mostrar todas. Busca sem resultado não significa que a equipe tenha zero atendimentos. Nomes com grafia diferente permanecem separados; desconsiderar acentos na busca não une seus registros.

**Clicar no nome** abre o painel logo abaixo dos cards. O mesmo nome recolhe; Fechar detalhes devolve foco ao acionador. O painel mantém o período da categoria, mostra cada responsabilidade e sua data e inclui os três indicadores complementares, clientes por volume e perfil dos serviços. Perfil e clientes incluem improdutivas; participação do perfil = registros daquele tipo / total realizado da pessoa no papel. Cliente ausente aparece em grupo explícito para conferência, sem entrar na contagem de clientes identificados.

Evolução e linhas originais abrem sob demanda. O gráfico usa a mesma granularidade da equipe (diária até 62 dias de intervalo completo; mensal nos demais), com a própria data do papel e sem preencher artificialmente períodos sem registros. A tabela de origem conserva colunas, valores e linhas Excel. Sem registros num papel, os valores quantitativos são zero e as razões sem denominador ficam indisponíveis. Alterar filtros, papel ou fonte encerra a investigação anterior. O ranking, suas linhas de conferência e a evolução geral continuam disponíveis em **Ranking, evolução e conferência da equipe**.

**Exportação da pessoa:** Exportar responsável XLSX/CSV inclui somente o nome e os filtros escolhidos, com identificação do papel, período, base da participação, resumo, responsáveis, evolução, perfil, clientes e originais. A participação não vira 100% artificialmente ao abrir a pessoa: mantém o denominador da equipe, informado no contexto. Em Ambos, originais presentes nos dois papéis são gravados uma vez, com a coluna de responsabilidades. Os clientes permanecem separados por papel.

**Exportação geral:** Exportar equipe continua abrangendo todos os responsáveis e registros elegíveis da categoria, inclusive sem responsável; abrir uma pessoa ou buscar nos cards não restringe esse arquivo. Novos campos são acrescentados à tabela Responsáveis, mantendo a posição dos campos anteriores. Resumo identifica Valor e Unidade; percentuais são frações numéricas com formato `0.0%` no XLSX, e registros/chamado usa duas casas. Indisponibilidade permanece em branco, sem fabricação de valores.

Imprimir / Salvar PDF continua abrangendo a seção da equipe, incluindo o painel individual aberto com seu título, e abre os blocos de conferência na cópia. Nomes dos cards permanecem no documento; busca/limite afetam apenas quais cards estão desenhados, enquanto a tabela geral completa permanece para conferência. Para um arquivo restrito à pessoa, use os botões Exportar responsável. Permissões de exportação, fontes, regras financeiras e armazenamento não mudaram.

Manutenção: `supportPerson.js` deriva o recorte individual sobre os resultados já filtrados; `SupportMetricCards.jsx` apresenta métricas e comparações; `SupportPeople.jsx` gerencia busca, seleção e painel; `support-people.css` limita o visual a essa seção. Não há identificação nova por código nem união automática de pessoas.

Testes sintéticos e conferência no navegador cobrem identificações repetidas/com erro, improdutivas e denominadores, datas e base anterior, ausência de coluna versus zero elegível, filtros e nomes com espaços, exportação individual/geral e Ambos sem duplicar originais, unidades/percentuais no XLSX, impressão, teclado e apresentações clara/escura em desktop/celular. Os arquivos dos clientes não são modificados.

## Conferência das entregas anteriores

Testes sintéticos cobrem viradas de semana/ano, fevereiro bissexto, datas dos dois papéis, improdutivas, responsável/data ausentes, chamados compartilhados, filtro de cliente e percentuais exportados. No build de produção, a conferência local no Edge verificou atalhos, escolha de mês/ano, conferência de origem, XLSX, modo resumido e impressão, além de desktop/celular nos dois temas. Não foram usados dados reais nos testes de navegador.

Na 0.21.1, a suíte completa passou com 190 testes aprovados e um teste opcional ignorado; caminhos, formatação e build também passaram. Conferência do modo Ambos no Edge local: barras e métricas, datas próprias, origens por papel, CSV/XLSX/SVG, retorno entre páginas, resumo/impressão, coluna ausente e limite de participantes. Oito estados em 1440/768/390/320 px e claro/escuro, sem erro de execução nem rolagem horizontal da página. Dados fictícios; os arquivos importados dos clientes não foram modificados.
