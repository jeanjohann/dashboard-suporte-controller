# Organização das análises — 0.27.0

A navegação foi organizada para seguir a leitura: **resumo → pontos de atenção → comparação → detalhe e origem**. Os relatórios relacionados ocupam um painel com um seletor **Visualização**. Trocar a visualização conserva o recorte da categoria e os controles de cada análise; não soma indicadores de bases diferentes.

## Onde encontrar cada informação

| Local                                         | Conteúdo e caminho                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS → Visão geral                              | Dez indicadores, agenda aberta com conferência junto aos cards e duas tendências compactas: movimento mensal e atuação do suporte. Atalhos levam às análises completas, com aviso de que cada destino tem filtros próprios.                                                             |
| OS → Operação                                 | **Atendimentos e intervenções:** indicadores por status, evolução mensal, motivos e perfil por cliente. **Chamados, visitas e retornos:** atendimentos por veículo, múltiplos serviços e conferência de chamados. A distribuição por UF/cidade, antes em Regiões, fica nesta categoria. |
| OS → Clientes e custos                        | Um painel com indicadores financeiros e valores contratuais, custo por cliente, composição, evolução e serviços absorvidos. O resumo contratual detalhado foi transferido da Visão geral para Indicadores financeiros.                                                                  |
| OS → Técnicos                                 | Ranking e contexto da rede de prestadores. Não se confunde com responsáveis internos do suporte.                                                                                                                                                                                        |
| OS → Equipe de suporte                        | Cards por responsável, comparação, detalhamento individual e conferência geral existentes.                                                                                                                                                                                              |
| OS → Equipamentos                             | **Ciclos e trocas:** primeira troca, tempo observado, tempo até retirada e trocas identificadas. Histórico por placa/serial continua abaixo. A conferência completa de vínculos fica em Parque e Manutenção → Vínculos.                                                                 |
| OS → Dados e relatórios                       | Registros e revisão, relatório personalizado, configurações salvas, descritivo e exportações. Reúne as antigas categorias Dados e revisão e Relatórios personalizados.                                                                                                                  |
| Parque e Manutenção → Visão geral             | Cobertura do histórico e composição da fotografia operacional por cliente, modelo, plano ou situação. Incorpora a antiga categoria Parque.                                                                                                                                              |
| Parque e Manutenção → Manutenção e relatórios | Indicadores e cobertura, comparação por cliente/modelo, perfil das intervenções e relatório/exportação do mesmo recorte. Reúne Manutenção e Relatórios.                                                                                                                                 |
| Parque e Manutenção → Vínculos                | Local principal da conferência de serial + placa, ambiguidades, linhas de origem e CSV. Valores mensais e Logística continuam em suas próprias categorias.                                                                                                                              |
| Operacional                                   | Conferência da fonte: resumo da importação, registros e revisão manual. As análises cruzadas continuam em Parque e Manutenção.                                                                                                                                                          |
| Consumo → Acompanhamento                      | **Grade e acompanhamento:** única tabela para selecionar, exportar, conferir a origem e abrir o histórico pelo status. **Ranking e prioridades:** gráfico e atalhos para priorizar, com exportação do recorte completo. Linha do tempo e notas ficam abaixo do painel.                  |

Em Operação, a visualização **Perfil das intervenções por cliente** também conserva, em blocos recolhíveis, concentração das manutenções por cliente e quantidade/custo/comparação por tipo de serviço, antes exibidos na Visão geral. Os detalhes continuam mostrando as linhas de origem.

A exportação CSV do histórico de equipamentos fica junto à consulta em **Equipamentos**, usando os filtros dessa categoria. Em Dados e relatórios, Exportações identifica a medida e o agrupamento escolhidos no Relatório personalizado; não reutiliza silenciosamente a consulta de equipamentos com outro recorte.

## Como usar os painéis agrupados

1. Escolha a categoria no menu e confira **Afeta: módulo → categoria** nos filtros.
2. No cabeçalho do painel, escolha **Visualização**. O nome original e o alcance aparecem logo abaixo.
3. Consulte o ícone de informação para a regra específica da visualização. Bases distintas continuam explícitas.
4. Use Resumo/Abrir/Recolher conforme a necessidade. Escolher outra visualização abre seu conteúdo; isso não regrava a apresentação inicial.
5. A impressão do painel inclui somente a visualização ativa, com seu título, contexto e regra. CSV/XLSX continuam usando as bases dos relatórios originais.

**Personalizar página** conserva as escolhas anteriores por relatório: visibilidade e apresentação inicial continuam individuais. Uma opção oculta sai do seletor; se todas forem ocultas, a engrenagem permite recuperá-las. Escolher uma visualização é temporário e não grava preferências automaticamente.

No Consumo, **Registros da grade** alterna entre consumo válido e **Fora dos totais**. A segunda opção mantém a conferência dos registros não elegíveis do recorte, incluindo duplicados e valores incompatíveis. Eles não entram nos totais nem no ranking. O valor inválido aparece como indisponível, e **Conferir origem** preserva o valor original. Os filtros do topo continuam valendo: um filtro que exige consumo válido também pode excluir registros da conferência. Seleções de exportação ficam restritas às linhas presentes na grade; ao trocar esse conjunto, seleções que saíram dele são removidas.

## Critérios preservados

- Visitas improdutivas continuam separadas de intervenções efetivas, com custos mantidos onde previstos.
- Custo Total lançado, Técnico + Km e Valor a cobrar continuam com bases próprias. Nenhum é apresentado como lucro ou recebimento comprovado.
- Vida até primeira troca, tempo até retirada e ciclos ainda abertos continuam cálculos diferentes. A nova apresentação não usa todas as implementações como se fossem trocas encerradas.
- Execução e agendamento mantêm responsáveis e datas próprios; não são somados para pontuar pessoas.
- A fotografia operacional não representa a frota ativa histórica. Ausência de histórico e vínculo ambíguo continuam separados.
- Páginas continuam sujeitas às permissões existentes. Atalhos para Parque e Manutenção só aparecem a quem tem acesso ao módulo. Exportar/imprimir exige a permissão separada, revalidada pela ação.

Os filtros continuam independentes por categoria. As visualizações do mesmo painel compartilham os filtros dessa categoria. As chaves históricas dos relatórios foram mantidas para conservar preferências e configurações salvas; não há migração ou gravação nova de planilhas, notas ou credenciais. Filtros são de sessão e não são transportados entre categorias silenciosamente. Categorias reunidas passam a compartilhar um único recorte claramente identificado.

## Manutenção técnica

`shared/layout/ReportStories.jsx` oferece destinos estáveis de apresentação e registra quais seções estão realmente disponíveis. `Section` conserva seus identificadores, ajuda, modo, impressão e conteúdo; os portais apenas posicionam essas seções no painel correspondente. Todos os grupos de OS permanecem montados, inclusive ao mudar de categoria, para conservar seus controles. Os catálogos `config/reportStories.js` de OS, Operacional e Consumo descrevem os grupos, sem regras de domínio.

Ao acrescentar uma visualização, use o título histórico da Section e mantenha a definição de preferência e categoria. Não coloque a mesma seção em dois grupos. Se uma análise não estiver disponível para a base, não ofereça uma opção vazia no seletor. A ocultação visual não é autorização: as verificações de acesso seguem no Workspace e nas ações.

Esta entrega não ativa a integração Google Sheets nem a API real de monitoramento. Essas etapas mantêm suas dependências anteriores.
