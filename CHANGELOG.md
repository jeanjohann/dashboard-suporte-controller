# Histórico de versões

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
