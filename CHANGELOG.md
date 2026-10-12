## Análises complementares do suporte

- Motivos de manutenção, serviços absorvidos pela Addlog e distribuição por UF/cidade.
- Visitas repetidas por cliente/placa, contexto financeiro da rede de técnicos e cobertura dos vínculos com o parque.
- Comparação por volume, custo e deslocamento com acesso às linhas de origem.
- Estoque e novas análises de contratos fora do escopo; indicadores por equipamento aguardam validação dos vínculos.

# Histórico de versões

## 0.17.6 — 12/10/2026

- Motivo Visita Improdutiva separado das manutenções efetivas, preservando todos os custos financeiros válidos.
- Atendimentos por veículo com três modos e critério explícito na exportação; ranking de técnicos com contagens separadas e seleção do volume no gráfico.
- Perfis e evolução distinguem improdutivas; manutenção por cliente, execução e assistência no parque não contam essas visitas como intervenção.
- Visão resumida em oito relatórios de OS/técnicos, com indicadores, bases e retorno ao completo sem reiniciar controles.
- Fila consolidada para priorização, incluindo revisão dos ícones de explicação ainda ausentes.
- Teste de improdutividade, intervalos por modo, manutenção efetiva e preservação dos custos.

## 0.17.5 — 12/10/2026

- Corrige corte dos filtros de seleção múltipla pelas bordas dos painéis em todas as páginas: menus independentes, busca acessível e altura limitada pela janela.
- Busca de linhas no histórico agora mostra quantidade de correspondências e resultados clicáveis, com orientação quando não encontra vínculo.
- Recupera abrir/recolher relatórios individualmente e comandos de abrir/recolher todos, preservando conteúdo montado.
- Mantém critérios dos indicadores, filtros e histórico sem alteração.

## 0.17.4 — 11/10/2026

- Filtro absoluto de consumo acima de um valor em MB, combinado aos demais filtros e aplicado ao recorte completo.
- Seleção individual ou de todas as linhas filtradas, incluindo várias páginas, com exportação CSV da seleção.
- Busca por cliente, placa, número, ICCID e operadora no seletor do histórico, preservando o chip selecionado e suas apurações.
- Exportação informa quantidade, escopo e limite; seleção manual não altera observações salvas.

## 0.17.3 — 11/10/2026

- Cliente e placa da referência operacional atual no seletor e cabeçalho do histórico da linha.
- Sem vínculo confirmado, exibe Linha não identificada; vínculo parcial mantém os campos conhecidos e sinaliza ausências.
- Placa incluída no contexto dos relatórios XLSX e CSV, sem inferir vínculos históricos.

## 0.17.2 — 11/10/2026

- Histórico individual de consumo exportável em XLSX e CSV, com contexto, apurações e observações/marcações salvas.
- Impressão da linha do tempo exclui formulário e rascunhos; exibe identificação e resumo do acompanhamento.
- Contrato de armazenamento separado da página, utilizando exclusivamente o IndexedDB existente e preservando dados e backups.
- Integração futura com armazenamento compartilhado documentada, sem sincronização ou envio de dados nesta etapa.
- Testes de identidade, períodos sobrepostos, anotações do chip, proteção de fórmulas e contrato de armazenamento.

## 0.17.1 — 11/10/2026

- Filtros compartilhados compactos, com seleção múltipla em listas flutuantes e fechamento por clique externo ou Escape.
- Período das OS sempre acessível acima dos relatórios, utilizando os mesmos filtros dos cards, gráficos e tabelas.
- Filtros adicionais das OS recolhíveis e explicações de blocos internos alinhadas à direita do título.
- Explicações financeiras ampliadas: origem, status, denominadores, exclusões e finalidade dos principais indicadores.
- Nenhuma alteração nas regras de cálculo, importação ou permissões.

## 0.17.0 — 11/10/2026

- Página Monitoramento de Frota em preparação, iniciando sem dados e com demonstração opt-in claramente identificada.
- Visão analítica, seleção de múltiplas bases, limites provisórios, situação técnica, cards, gráficos e fila de acompanhamento paginada.
- Qualidade da coleta, ausência de posição, datas incompatíveis e identidade duplicada tratadas separadamente de alertas.
- Rascunhos de acompanhamento apenas na sessão, sem alterar situação técnica; relatórios CSV/XLSX com referência, filtros e identificação DEMO.
- Nova permissão de página, sem liberação automática para usuários comuns e sem mudança no esquema D1.
- Integração, coleta agendada, dados de consumo, histórico real e notificações permanecem pendentes das definições da API.
- Guia do módulo e testes de limites, coleta, datas, duplicidade e exportação.

## 0.16.1 — 11/10/2026

- Código organizado em aplicação, componentes compartilhados, módulos, utilitários e estilos; testes mantidos junto das regras.
- Página de OS extraída de main.jsx; Workspace separado para coordenar navegação e bases da sessão.
- Caminhos de importação do navegador, Worker e documentação atualizados.
- Comentários em português nas responsabilidades dos arquivos, funções públicas e decisões sensíveis de cálculo e segurança.
- Prettier e EditorConfig para indentação e formatação consistentes, com comandos de manutenção e verificação de caminhos.
- Novo guia de arquitetura, mapa das funcionalidades e roteiro de estudo e atualização.
- Regras de negócio, identificadores de páginas, armazenamento local e estrutura D1 preservados.
- Validação: 281 caminhos locais, 123 testes aprovados e um opcional ignorado, compilação, renderização inicial das páginas e empacotamento Wrangler sem publicação. Comparação estrutural de 60 arquivos JavaScript confirmou equivalência lógica após a reorganização.

## 0.16.0 — 11/10/2026

- Cadastro administrativo de usuários com páginas, importação, exportação e suspensão de acessos.
- Worker com validação do JWT Access e banco D1 somente para usuários/permissões.
- Produção consulta permissões no servidor; menus e comandos adaptados e ações revalidadas.
- Proteção do administrador inicial, versão concorrente, origem e validação do cadastro.
- 123 testes aprovados, um ignorado; build e empacotamento Wrangler validados. Login remoto da nova versão ainda precisa ser confirmado.

## 0.15.7 — 11/10/2026

- Preparação para Cloudflare Pages: Node 22, cabeçalhos básicos, HTML sem cache persistente e solicitação de não indexação.
- Plano documentado de Cloudflare Access por e-mails autorizados, com proteção de produção e prévias.
- Deploy e autenticação dependem da criação/conexão da conta; ainda não publicados ou validados.

## 0.15.6 — 11/10/2026

- Padronização compartilhada dos controles de gráficos, com tamanho, altura e alinhamento consistentes para agrupamento e participantes.
- Ajustes no ritmo de títulos, ajuda, exportação, ações e cards numéricos.
- Controles empilhados em telas estreitas e dimensões mínimas para botões; sem alteração nos dados ou cálculos.
- Compilação validada; conferência visual interativa permanece pendente no navegador.

## 0.15.5 — 11/10/2026

- Vida em campo até primeira troca: comparação principal pela média, com cards de mínimo e máximo.
- Tabela visível por modelo/tipo ou cliente com média, extremos, amostra e acesso aos ciclos completos de origem.
- Mediana preservada como informação complementar na ajuda e tabela detalhada; sem mudança nos critérios de vínculo.
- Teste de médias e extremos por grupo, incluindo amostra unitária, observações excluídas e grupos sem troca.

## 0.15.4 — 11/10/2026

- Ajuda alinhada à direita dos títulos também nos blocos internos, incluindo Valores de contrato, widgets e comparação de duração.
- Cabeçalho compartilhado com espaço entre título e ícone, preservando explicações, valores e impressão.

## 0.15.3 — 11/10/2026

- Ajuda dos relatórios principais posicionada no canto superior direito do cabeçalho, com espaço reservado para não sobrepor título e impressão.
- Ícones vetoriais SVG próprios para informação, menu, recolhimento, expansão e fechamento; sem dependência de símbolos da fonte.
- Rótulos acessíveis, interação e textos impressos preservados.

## 0.15.2 — 11/10/2026

- Explicações fixas de cálculo e regras disponíveis em ícones de informação, nos títulos de relatórios e junto às ferramentas.
- Ajuda individual nos oito cards do resumo numérico, sem botões aninhados.
- Balões acionados por clique/teclado, fechamento por clique externo, Escape ou botão e adaptação à área disponível.
- Períodos, bases numéricas, exclusões e avisos dinâmicos mantidos visíveis. Textos de ajuda preservados na impressão/PDF.
- 115 testes aprovados, um ignorado, compilação e conferência da renderização dos componentes.

## 0.15.1 — 11/10/2026

- Logo completa no menu aberto e somente símbolo no menu compacto, sem legenda Suporte Controller.
- Botão de recolhimento ao lado da marca, navegação alinhada ao topo e Importação por último.
- Clique na página selecionada abre/fecha suas opções sem alterar filtros ou relatórios.
- Espaçamentos menores e indicadores discretos de abertura.

## 0.15.0 — 11/10/2026

- Importação conjunta de OS, operacional e CSVs de consumo, com prévia, seleção e validação do lote.
- Menu lateral recolhível; categorias e relatórios aninhados na página selecionada.
- Relatórios principais em blocos abertos e controle de visibilidade por checkboxes.
- Nome Parque e Manutenção, tema por ícone no rodapé e seleção sem sombra.
- Documentação em docs/IMPORTACAO.md e testes de importação em lote.

## 0.14.1 — 11/10/2026

- Menus por categoria no Operacional (Visão geral, Registros, Revisão) e OS x OP (Visão geral, Parque, Manutenção, Valores mensais, Vínculos, Relatórios).
- Categoria selecionada independente em cada página; filtros e escolhas de visibilidade preservados.
- Cards de cobertura na Visão geral, com relatórios exibidos somente na categoria correspondente.
- Relatórios com agrupamento acessível e atalho para ajustar período na categoria Manutenção.
- Formato recolhível preservado; substituição por blocos abertos e painel de checkboxes ainda em discussão.

## 0.14.0 — 11/10/2026

- Indicadores de assistência e intervenções por 100 registros vinculáveis, com cobertura e limitações históricas explícitas.
- Comparações por cliente/modelo/plano/situação, visitas repetidas e trocas, reaproveitando critérios atuais das OS.
- Filtros múltiplos operacionais e período independente das novas análises.
- Relatório XLSX/CSV com seleção das colunas do resumo, critérios e fontes opcionais; contrapartes de trocas rastreáveis.
- Novas seções integradas à personalização, abertura/recolhimento, tabelas ordenáveis e impressão/PDF.
- Documentação e testes de base, filtros, eventos, originais e formatos de exportação.

## Em desenvolvimento — aparência e temas

- Revisão geral de todas as páginas e categorias: regra compartilhada para ações de tabela, filtros, exportações e detalhes; inclui Consumo M2M, histórico, Operacional e equipamentos.
- Consumo com textos longos resumidos em duas linhas e conteúdo completo acessível; anotações com data, situação e texto separados.
- Cards financeiros ajustados ao celular e configurações salvas com ações que se reorganizam sem quebrar palavras.
- Correção das colunas de origem: botões de conferência em uma linha, linhas compactas e rolagem restrita às tabelas.
- Exportações e abertura da tabela de técnicos com espaçamento próprio; seleção de veículo organizada e linha do tempo com eventos neutros e datas em destaque.
- Logo oficial incorporada ao cabeçalho e navegação na ordem Ordens de Serviço, Operacional, Controle de Consumo M2M e OS x OP.
- Temas claro e escuro em todas as páginas, com chave acessível e preferência salva no navegador.
- Cores, tipografia, botões, espaçamentos e alinhamentos harmonizados; layouts conferidos de 320 a 1440 px com dados reais.
- Barras menores e rótulos discretos; consumo mostra operadora/número e cliente, mantendo ICCID completo nos detalhes e exportações.
- Limpar filtros e ícones de abrir/recolher relatórios na mesma faixa das OS.
- Cálculos preservados; conferência de navegação, persistência, registros de origem, SVG e impressão.

## Em desenvolvimento — histórico e investigação de consumo

- Consolidados Arqia/Kore reconhecidos pelos cabeçalhos; dados, SMS e frete separados, com conversão KB para MB e períodos inclusivos preservados.
- Categorias Visão geral, Investigação, Clientes e equipamentos e Histórico e arquivos; filtros no topo, cards, gráficos, tabela paginada e CSV completo.
- Referência ajustável de consumo acima da média da operadora/apuração, incluindo zeros e calculada antes dos filtros.
- Vínculos confirmados por ICCID e MSISDN únicos no mesmo registro operacional; ambiguidades/conflitos acessíveis para revisão.
- Histórico em IndexedDB, versões arquiváveis, reimportação idempotente, backup JSON validado e referência operacional guardada.
- Linha do tempo por chip com MB por dia e anotações; custos de dados/SMS separados de outras despesas. Contratos e saldo de franquia fora do escopo.
- Testes de domínio e conferência no navegador com os arquivos reais, recarga, backup/restauração, exportações e layout móvel.

## Em desenvolvimento — comparação geográfica

- Gráfico único por UF ou cidade, com total de atendimentos e manutenções na mesma escala, respeitando período e filtros.
- Quantidade total, manutenções e participação da manutenção no recorte; comparação também por custo total e despesa de deslocamento.
- Cada barra permite conferir suas linhas de origem. Ranking, tabela completa, CSV, SVG com as duas cores e impressão preservados.
- Manutenções (Assistência Técnica Concluída/Pago) estão incluídas no total; as séries não são somadas. Valores ausentes não viram zero.

## Em desenvolvimento — vida em campo até primeira troca

- Painel por rastreador, coletora/teclado/terminal e RFID com médias, medianas, amostras, distribuição, comparação e acompanhamento pelo mês de instalação.
- Pares de rastreador exigem mesmo chamado, cliente, placa e data, Assistência Técnica realizada e seriais diferentes; reinstalação com par entra como troca.
- Acessórios exigem troca/trocar explícito; instalação inicial precisa de evidência própria.
- Cancelamentos, observações sem troca, ciclos incertos e trocas sem início conhecido ficam separados das estatísticas.
- Seleção por instalação ou retirada/troca consulta o histórico completo; limite padrão na última data realizada do arquivo.
- Ciclos iniciados em uma troca anterior analisados separadamente. CSV, impressão e registros de origem com critérios e limite da análise.
- Datas impossíveis, inclusive serial Excel zero no calendário 1900, são excluídas dos vínculos temporais.

## Em desenvolvimento — organização do dashboard

- Cards de clientes e perfil ampliados: concentração dos cinco primeiros, custos/médias de manutenção, destaque e resumo selecionável por cliente.
- Perfil por tipo com quantidade, participação, custo/média e variação contra período anterior; tipos exclusivos do anterior aparecem com zero atual.
- Conferência das linhas por cliente/tipo; clientes não identificados, custos ausentes e bases das médias explicitados. Cancelamento realizado preservado.

- Composição dos custos ampliada com total/médias dos componentes e valores contratuais de Cliente/Addlog, separados pela coluna Cobrança.
- Contratos usam Valor a cobrar e Concluída/Pago; zeros válidos mantidos, ausências/classificações inválidas explicitadas, médias com bases próprias e conferência das linhas.

- Identidade de central de gestão: fundo #F5F4F1, cards claros, laranja em seleção e ações, azul/verde petróleo nos gráficos.
- Tipografia, alturas, espaçamentos e alinhamentos uniformizados em botões, filtros, tabelas e cards; versão móvel revisada.
- Controles de exportação recolhidos na visão geral; composição de custos adicionada com base de pares válidos explícita.

- Identidade visual aproximada do site Addlog: Inter local, laranja #F59136, coral #F16435, cinza #23303b e superfícies #F3F1ED.
- Navegação clara, marca em texto, gráficos com paleta consistente e cores secundárias para distinguir séries.

- Visão geral integrada: cards de gestão, agenda registrada, colunas empilhadas mensais, equipe em barras agrupadas, manutenção por cliente e rosca de tipos de serviço.
- Comparação de intervalos inclusivos de mesma duração, imediatamente consecutivos, preservando filtros de categoria; base anterior zero não gera percentual.
- Parque operacional integrado como fotografia integral da importação, explicitamente separado do período e dos filtros de OS.
- Sem metas, SLA ou inferência de parque ativo histórico.

- Personalização no topo de todas as categorias de OS e páginas de linhas/operacional, com os filtros de cada fonte reunidos.
- Controles de expandir/recolher com ícones, descrição ao passar o mouse e nomes acessíveis.

- Navegação superior e relatórios de OS separados por categoria; visão geral abre inicialmente.
- Execuções por Resp. Execução, contando linhas Concluída/Pago nos filtros de atendimento.
- Ranking de manutenção por cliente: Assistência Técnica realizada.
- Agendamentos por Resp. Agendamento: linhas Concluída/Pago com nome válido; período por Agendamento, separado da Data de atendimento das execuções.

## 0.13.0 — 04/10/2026

- Duas páginas: importação/revisão operacional e análises Operacional × OS, com dados em memória compartilhados.
- Leitura da aba Equipamentos limitada à tabela A:BY; originais e fórmulas inspecionáveis.
- Revisão de formatos, ausências, cancelamento sem data e repetições; exportação CSV e impressão por seção.
- Vínculo serial + placa com cobertura explícita e exportação; ausência na OS não constitui divergência por limitação histórica.
- Cards de cobertura, gráficos por cliente/modelo/plano/situação e somas de valores mensais lançados, sem cálculo de faturamento.
- Navegação acessível em telas estreitas, quatro testes de regras operacionais e documentação específica.

## 0.12.2 — 04/10/2026

- Botões no topo das OS para abrir ou recolher todas as seções principais de relatórios.
- Personalização de visibilidade, filtros e controles individuais preservados.

## 0.12.1 — 04/10/2026

- Modelos de rastreador classificados pelos sete prefixos de ID aprovados.
- Tempo observado compara por classificação como padrão, preservando comparação pelo Modelo original e cliente.
- Ciclos com prefixo não reconhecido em grupo separado e card, mantendo contagens e durações.
- Relatório descritivo XLSX/CSV atualizado para o mesmo agrupamento; ID e Modelo de origem preservados.

## 0.12.0 — 04/10/2026

- Relatório descritivo selecionável entre as sete análises de OS, seguindo os filtros.
- Uma linha por grupo/indicador, valores, unidades, bases, percentuais e descrição.
- XLSX com números e percentuais tipados: Relatório, Critérios e Atendimentos originais filtrados.
- CSVs separados do resumo e originais; contexto de arquivo/filtros/referência no resumo.
- Prévia de 200 linhas, exportações completas; regras de percentuais não aditivos e ausências explícitas.

## 0.11.0 — 04/10/2026

- Custo por cliente com cards, ranking, medidas contratuais e custo lançado em cobranças Addlog.
- Composição técnico/deslocamento em barras empilhadas por cliente, cidade ou código técnico.
- Visitas por cliente/placa, linha do tempo, mediana de intervalo e retornos cumulativos 30/60/90 dias.
- Chamados com vários realizados: cards, distribuição e custos acumulados.
- Matriz e gráfico de intervenções por cliente, com categorias sobrepostas explicitadas.
- Mediana e distribuição de ciclos encerrados por modelo/cliente; períodos sem retirada separados.
- Evolução mensal de volume, custo, média e participação do deslocamento com bases compatíveis.
- Tabelas com origem, ordenação, CSV e impressão/PDF; sete seções recolhidas e personalizáveis.
- Consumo e conciliação entre planilhas mantidos para fase futura.

## Preparação para GitHub — 04/10/2026

- Git local inicializado na branch main.
- Arquivos operacionais e credenciais excluídos pelo .gitignore.
- Teste da planilha original opcional quando o arquivo estiver ausente, mantendo os testes sintéticos.
- Guia de clone, execução local, commits e atualizações.

## 0.10.0 — 04/10/2026

- Página Linhas - Controle de Consumo no menu lateral, com importação CSV independente.
- Identificadores textuais, MB com precisão de até seis casas e períodos validados.
- Cards de linhas, total, média, maior consumo, zeros e exclusões.
- Filtros múltiplos, busca global, ranking por linha/plano/contrato/tecnologia/empresa, resumo ordenável e CSV.
- Conferência de registros originais e revisão; pares repetidos excluídos dos totais antes dos filtros.
- Tecnologia e contrato ausentes explicitados; nenhuma inferência a partir de IMSI ou plano.
- Dados e filtros das duas páginas mantidos ao alternar o menu, somente durante a sessão.

## 0.9.1 — 04/10/2026

- Período solicitado e datas efetivas da seleção no resumo dos cards, com contagem de datas ausentes/inválidas.
- Atalho Usar registro mais antigo no filtro inicial, baseado em toda a planilha importada.
- Indicação de seleção sem datas válidas e período invertido.

## 0.9.0 — 04/10/2026

- Oito cards com filtros globais, critérios de cálculo e acesso às linhas de origem.
- Barras com nomes completos, valores ao lado e altura por participante; rolagem para listas extensas.
- Rankings com 10 maiores, 20 maiores ou todos; totais e tabelas completos.
- Detalhes secundários e tabela de técnicos recolhidos inicialmente, na mesma tela personalizável.
- Cards preservados na impressão; barras exportadas com nomes em múltiplas linhas.

## 0.8.0 — 04/10/2026

- Conferir linhas abre tabela detalhada no gráfico mensal e nos grupos de relatório.
- Cabeçalhos ordenáveis nas tabelas; atendimentos ordenados antes da paginação. Terceiro clique restaura a ordem padrão.
- Imprimir / Salvar PDF por seção pelo diálogo do navegador, com arquivo, filtros e referência.
- Ranking por código de técnico, nomes, realizados, chamados, custos e médias com denominadores válidos.
- Médias de deslocamento com zeros e média quando cobrado separadas. Valores ausentes não viram zero.
- Manutenção sem troca continua pendente, sem classificação automática.

## 0.7.1 — 03/10/2026

- Cidade nos filtros principais, com seleção múltipla combinada com UF e demais campos.
- Botão Última na tabela de atendimentos, levando à última página dos resultados após filtros e busca.
- Botão desativado quando já estiver na última página ou não houver resultados.

## 0.7.0 — 03/10/2026

- Tela única organizada em seções recolhíveis, todas visíveis por padrão.
- Personalização das seções exibidas, salva neste navegador; resumo de filtros sempre acessível.
- Gráficos interativos com Recharts: barras, linhas, pizza e rosca; tabela mantida.
- Pizza/rosca bloqueadas para chamados distintos, valores negativos e total não positivo.
- Tipo de gráfico incluído nas configurações de relatório; configurações antigas usam barras.
- Exportação SVG do gráfico selecionado e exportação anterior explicitamente identificada como barras.

## 0.6.1 — 03/10/2026

- Início de medição restrito a instalação com Tipo de Serviço = Implementação.
- Períodos sem retirada calculados até referência escolhida; padrão data atual de São Paulo.
- Botão Usar data atual e indicação Sem retirada registrada, sem afirmar ausência de problemas.
- Ciclos encerrados mantêm data real de retirada. Datas anteriores ao início e ciclos ambíguos são excluídos e sinalizados.

## 0.6.0 — 03/10/2026

- Salvamento manual e recuperação de configurações no navegador, com verificação de estrutura de colunas.
- Períodos encerrados observados por serial/placa, com rastreabilidade e revisão de ambiguidades.
- Primeira instalação identificada pelo usuário como Implementação; uso temporal dessa condição ainda em definição.

- Exportação de relatório e histórico em CSV UTF-8 com separador ponto e vírgula, filtros e linhas de origem.
- Exportação do gráfico personalizado em SVG com fonte, elegíveis e exclusões.
- Campos textuais do CSV protegidos contra interpretação como fórmulas; números monetários exportados em reais.
- Tempo sem retirada registrada aguarda definição da data de referência.

## 0.5.1 — 03/10/2026

- Filtros adicionais escolhidos entre as demais colunas importadas.
- Múltiplos valores exibidos e opção Sem dados; nomes repetidos diferenciados pela letra.
- Remoção do filtro limpa sua condição; filtros afetam toda a análise.

## 0.5.0 — 03/10/2026

- Explorador de relatórios com agrupamento, medida e barras/tabela selecionáveis.
- Medidas de realizados, chamados distintos com realizados, custo, deslocamento e valores contratuais Cliente/Addlog.
- Exclusões e linhas de origem por grupo; chamados distintos não são aditivos entre grupos.
- Histórico por placa/serial exato, ordem cronológica e registros sem data ao final.
- Ambas as consultas seguem filtros globais. Tempo observado em campo permanece pendente.
- Documentação e testes atualizados.

## 0.4.0 — 03/10/2026

- Identificação de pares de troca de rastreador e tabela rastreável até as linhas originais.
- Revisão de pares ambíguos, seriais ausentes/iguais e reinstalações.
- Contagem de trocas de acessórios por palavras-chave e gráfico por categoria.
- Opção de teste para exigir palavra troca; padrão desativado.
- Gráfico mensal de trocas de rastreador pela data da instalação substituta.
- Tempo observado em campo permanece pendente das regras de histórico.

## Definições de equipamentos — 03/10/2026 (sem nova versão funcional)

- Documentadas as regras aprovadas para instalação/desinstalação de rastreadores e revisão de reinstalações.
- Documentada a equivalência Coletora/Teclado/Terminal de Jornada e classificação RFID.
- Uma troca de acessório por linha e nomenclatura tempo observado em campo.
- Regras de vínculo e ambiguidades ainda em revisão; nenhum indicador de equipamento foi implementado nesta atualização.

## 0.3.1 — 03/10/2026

- Seleção de vários itens nos filtros de categoria, com caixas de seleção, busca de opções e remoção individual.
- OU entre itens do mesmo campo e E entre campos; nenhuma seleção significa Todos.
- Limpeza individual e geral, sem necessidade de Ctrl para selecionar vários itens.
- Teste de combinação múltipla, ordem original e ausência de duplicação.

## 0.3.0 — 03/10/2026

- Filtros combinados por período de atendimento, status, razão social, técnico, tipo, motivo e UF.
- Indicadores, chamados, revisão e tabela acompanham a seleção; busca textual restrita à tabela.
- Gráfico mensal de realizados (Concluída/Pago), com exclusões por data informadas.
- Datas inicial/final inclusivas, suporte ao calendário Excel 1904 e aviso para período invertido.
- Registros sem data permanecem sem filtro de período; são excluídos quando ele está ativo.
- Testes dos filtros e gráficos e documentação atualizada.

## 0.2.0 — 03/10/2026

- Totais financeiros apenas para Concluída/Pago: custo total, técnico, deslocamento e valores contratuais separados por Cliente/Addlog.
- Conversão de moeda brasileira somente para análise, comparação em centavos e revisão de divergências mantendo o total lançado.
- Contagens de exclusões por medida e testes de cancelamento, agenda, valores ausentes e moeda textual.

- Indicadores de atendimentos realizados, cancelados, chamados com cancelamento e demais status.
- Detalhamento por chamado com contagens independentes e ordem de primeira ocorrência.
- Análise indisponível quando o cabeçalho Status não existe.
- Testes para chamados mistos, status não reconhecido e cabeçalho ausente.
- Documentação atualizada com as definições financeiras aprovadas.

As contagens usam toda a importação e não acompanham a busca textual da tabela.

## 0.1.0 — 03/10/2026

### Implementado

- React com importação manual da aba OS 2025.
- Ordem original, contagens de linhas e chamados distintos.
- Busca, paginação e revisão estrutural de células.
- Dados preservados e processados na memória do navegador.
- Testes de importação e geração da aplicação.

### Documentado

- Produto, conceitos, regras aprovadas e decisões pendentes.
- Custo Total como fonte oficial; divergências para revisão manual.
- Exclusão financeira de Cancelada e contagem por linha e chamado.
- Significados de cobrança, valores contratuais, custos, status e tipo Cancelamento.
- Guia de uso, arquitetura, verificações e manutenção.

Os KPIs, gráficos e relatórios personalizados ainda não foram implementados. Esta entrega de documentação não altera o comportamento do sistema.
