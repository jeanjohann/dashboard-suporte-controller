# Revisão técnica e refatoração gradual

Revisão iniciada em 14/10/2026, sobre a versão 0.20.0. Entregas: 0.20.1, 0.20.2, 0.20.3, 0.20.4 e 0.20.8 (15/10/2026). Este documento registra o que foi inspecionado, as alterações realizadas e a sequência proposta. O diagnóstico inicial abaixo descreve a base anterior às entregas.

## Diagnóstico inicial

A estrutura por módulos já separa regras de análise, importadores, componentes e permissões. Os testes existentes cobrem regras financeiras, identificadores, vínculos, períodos, backups e autenticação do Worker. Essa organização permite extrair componentes mantendo os cálculos em suas funções de domínio.

| Observação verificada                                                                                                      | Implicação para manutenção                                                                  | Próxima ação                                                                           |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `LinesPage.jsx` reunia apresentação, leitura/gravação, acompanhamento e ações de importação/exportação                     | Uma alteração no formulário exigia navegar por uma página com 1.618 linhas                  | Separação iniciada nesta entrega; continuar com importação/filtros e relatórios        |
| `OrdersPage.jsx` possui cerca de mil linhas; alguns relatórios também são extensos                                         | A coordenação da tela pode ser dividida por responsabilidade                                | Extrair controles e relatórios após estabilizar a etapa de consumo                     |
| Há estilos compartilhados distribuídos entre `style.css`, `identity.css`, `theme.css`, `sidebar.css` e ajustes posteriores | A ordem de carregamento e a especificidade precisam ser consideradas em cada ajuste         | Mapear os componentes antes de consolidar CSS; validar ambos os temas e impressão      |
| Paginação e ordenação aparecem em mais de um componente, com tamanhos de página e critérios próprios                       | Unificação sem contexto pode alterar o recorte ou a ordem apresentada                       | Identificar a parte comum, preservando ordenação antes da paginação e ausências no fim |
| `Workspace` mantém páginas permitidas montadas durante a navegação                                                         | Filtros, bases em memória e rascunhos dependem desse ciclo de vida                          | Avaliar carregamento sob demanda mantendo o estado após a primeira visita              |
| O build gera um arquivo JavaScript de aproximadamente 1,52 MB, cerca de 463 KB comprimido                                  | Há oportunidade de estudar divisão por módulos; tamanho sozinho não mede lentidão percebida | Medir abertura inicial e navegação antes de mudar o carregamento                       |
| Regras de permissão são compartilhadas pelo navegador e Worker                                                             | Mudanças nessa camada exigem validação dos fluxos autorizados e recusados                   | Manter a camada independente de React e armazenamento do navegador                     |

São observações de organização e verificações dos fluxos afetados. A revisão de desempenho requer medições próprias; este documento não certifica uma auditoria completa de segurança ou todos os cenários do sistema.

## Primeira etapa entregue — consumo

| Arquivo                                  | Responsabilidade                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `components/LinesPage.jsx`               | Coordena a página, filtros, importações e apresentação dos relatórios                                                |
| `hooks/useConsumptionArchive.js`         | Lê o repositório local, controla disponibilidade/erros e confirma a gravação antes de substituir o histórico exibido |
| `hooks/useLineFollowup.js`               | Controla chip selecionado, busca, histórico, rascunho, gravação da ação e exportação individual                      |
| `components/LineHistoryPanel.jsx`        | Apresenta busca, formulário, anotações, gráfico e apurações; recebe estado e ações do acompanhamento                 |
| `components/ConsumptionArchivePanel.jsx` | Apresenta versões e revisão/restauração de backups; recebe as ações da página                                        |
| `utils/consumptionFormatting.js`         | Formatação de MB, ticks, centavos e data da ação em São Paulo, sem dependência de React                              |

Os caminhos da tabela são relativos a `src/modules/consumption/`. Busca do histórico e opções do seletor usam uma única seleção, preservando a opção atualmente escolhida mesmo quando ela não corresponde à busca. A tabela de registros e o histórico compartilham os formatos de apresentação do módulo.

A página coordenadora passou de 1.618 para 1.180 linhas. Essa métrica descreve a distribuição das responsabilidades; o código extraído continua fazendo parte do aplicativo. Os campos do formulário receberam identificação acessível explícita, inclusive durante mensagens de falha.

## Segunda etapa entregue — importação, filtros e relatórios

A versão 0.20.2 separa a prévia, os seletores de arquivo, os filtros e os relatórios por assunto. A página principal passa de 1.180 para 433 linhas, mantendo a coordenação de estado, vínculos, indicadores, navegação e contexto da impressão. A estrutura total conserva as funções existentes; essa distribuição facilita localizar e revisar alterações.

| Local no módulo de consumo                                                | Responsabilidade                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/useConsumptionImports.js`                                          | Leitura dos arquivos, revisão e confirmação de importação, cancelamento, versões, referência operacional e backups. Mantém autorização antes de cada fluxo e confirmação de escrita pelo repositório |
| `components/ConsumptionImportHeader.jsx` e `ConsumptionImportPreview.jsx` | Seletores de arquivo e prévia antes da gravação                                                                                                                                                      |
| `components/ConsumptionFiltersPanel.jsx`                                  | Controles de apuração, seleção múltipla, limite em MB, busca, fator de investigação e visibilidade                                                                                                   |
| `domain/consumptionFilters.js`                                            | Uma apuração por operadora e seleção por categorias, busca e limite absoluto. Preserva ordem e referências da base                                                                                   |
| `domain/consumptionRecordsReport.js`                                      | Montagem do CSV filtrado ou selecionado, com origem, contexto, unidades e proteção de textos contra fórmulas                                                                                         |
| `components/ConsumptionOverviewPanels.jsx`                                | Cards, faixas, consumo por plano e comparativos de operadoras                                                                                                                                        |
| `components/ConsumptionInvestigationPanel.jsx`                            | Ranking e tabela de investigação                                                                                                                                                                     |
| `components/ConsumptionEquipmentPanels.jsx`                               | Consumo por cliente/equipamento e revisão de vínculos                                                                                                                                                |
| `components/ConsumptionInvoicesPanel.jsx`                                 | Valores de dados, SMS e outros serviços, mantendo frete sem rateio                                                                                                                                   |
| `components/ConsumptionSourcePanel.jsx`                                   | Células originais e candidatos de vínculo operacional                                                                                                                                                |
| `config/consumptionMenus.js`                                              | Categorias e títulos estáveis dos relatórios                                                                                                                                                         |

Critérios de seleção e montagem do CSV agora têm testes próprios de regressão. A conferência no navegador cobre prévia sem gravação automática, importação Arqia/Kore, arquivo idêntico, cancelamento e correção com arquivamento da versão anterior, origem das células, valores separados por serviço, exportação, backups e preservação ao navegar. Os fluxos de histórico, rascunho, gravação, busca e telas menores da etapa anterior também foram conferidos.

## Terceira etapa entregue — controles e estilos compartilhados

A versão 0.20.3 reúne em `src/styles/controls.css` os estilos comuns de cabeçalhos, títulos, ações de relatório, exportação, comandos de abrir/recolher, tabelas com rolagem, botões de ordenação, foco de teclado e estados desabilitados. Foram mapeadas 77 ocorrências de 36 seletores entre `style.css`, `identity.css`, `theme.css`, `sidebar.css`, `layout-polish.css` e `filters.css`; 31 declarações sobrescritas e redundantes foram removidas.

O novo arquivo é carregado depois de `filters.css`, na ordem declarada em `src/main.jsx`. Suas regras continuam usando as variáveis de `theme.css`. Navegação e balões permanecem em `sidebar.css`; filtros e alinhamentos específicos mantêm seus arquivos. Os controles compactos do Monitoramento continuam no CSS do módulo. A tipografia e o tamanho dos ícones de explicação têm regra própria: não devem herdar o tamanho dos botões de ação.

A sequência entre regras gerais e regras responsivas foi preservada. Alguns seletores têm blocos complementares em posições distintas: agrupar todos os breakpoints no final ou aplicar uma altura comum a qualquer botão pode alterar a aparência existente. Antes de reorganizar novamente, comparar estilos efetivos e dimensões, incluindo seletores mais específicos dos módulos.

A conferência antes/depois utilizou dados fictícios em um navegador separado: 15 combinações de página/categoria de OS, Operacional, Parque e Manutenção, Consumo, Monitoramento e Importação, em oito larguras (1440, 1024, 760, 700, 650, 600, 520 e 390 px) e dois temas. Nos 240 estados comparados, os controles conservaram estilos e dimensões, sem rolagem horizontal da página nem erros de execução. Tabelas mantêm sua rolagem interna. Ajuda por clique/Escape, foco pelo teclado, ordenação, estados desabilitados e impressão de registros salvos também foram conferidos.

Esta entrega organiza a apresentação existente. Não cria novos cálculos nem modifica persistência ou autorização. O título da aba passa a **Addlog | Suporte Controller** para representar o conjunto dos módulos; o favicon permanece.

## Quarta etapa entregue — coordenação das OS

Na versão 0.20.4, `OrdersPage.jsx` passa de 1.015 para 209 linhas, contando as linhas físicas do arquivo. A página continua coordenando categoria, preferência de relatórios e contextos de expansão/impressão. A extração conserva a estrutura do conteúdo, a ordem dos relatórios e os estados que dependem da página permanecer montada. Nenhum CSS foi alterado nesta etapa.

| Local no módulo `src/modules/orders/` | Responsabilidade                                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/useOrdersSession.js`           | Base recebida do Workspace, importação autorizada, filtros, busca, ordenação/paginação, referência dos ciclos, resultados do domínio, revisão e restauração de filtros salvos |
| `components/OrdersImportPanel.jsx`    | Cabeçalho, seletor de arquivo, leitura/erro e apresentação inicial                                                                                                            |
| `components/OrdersFiltersPanel.jsx`   | Período, filtros principais/adicionais, resumo ativo e comandos globais de relatório                                                                                          |
| `components/OrdersReportMenu.jsx`     | Categorias e seleção de relatórios; preferências continuam na chave local existente                                                                                           |
| `components/OrdersLifecyclePanel.jsx` | Situação e referência dos ciclos; tabela recebe períodos já vinculados                                                                                                        |
| `components/OrdersSwapsPanel.jsx`     | Trocas de acessórios/rastreadores e detalhamento dos pares                                                                                                                    |
| `components/OrdersTotalsPanels.jsx`   | Evolução mensal, indicadores financeiros/operacionais e linhas por chamado                                                                                                    |
| `components/OrdersRecordsPanel.jsx`   | Células originais, busca, tabela ordenada/paginada e revisão                                                                                                                  |
| `domain/orderRecords.js`              | Busca pelo conteúdo exibido e ordenação imutável do recorte completo; sem dependência de React                                                                                |

Funções de cálculo, importador e relatórios que já tinham arquivos próprios permanecem nesses locais. O controlador chama os mesmos cálculos existentes. Trocas e ciclos consultam a base completa antes de considerar o recorte. A escolha de situação dos ciclos atua somente na tabela/impressão da seção. Busca textual não altera indicadores, revisões ou relatórios descritivos. A ordenação mantém páginas de 50 registros, ausência/erro ao final e desempate por linha de origem.

Importação inválida conserva a base anterior; importação bem-sucedida continua reiniciando filtros, busca, paginação, ordenação e situação dos ciclos. Preferência de exibição, data de referência e categoria conservam os critérios anteriores. A aplicação de uma configuração salva restaura também as colunas adicionais, limpa a busca e volta à primeira página.

A comparação antes/depois verificou conteúdo, controles e dimensões das oito categorias, em 1440/390 px e claro/escuro: 32 estados iguais, sem transbordamento horizontal da página. Com dados fictícios, foram conferidos Última, ordenação antes da paginação, busca sem efeito nos totais, navegação entre módulos, seleção múltipla, remoção/restauração de filtro adicional, preferências, consulta mensal, ciclos, impressão e exportação. Testes de domínio cobrem imutabilidade, conteúdo exibido, ausências/erros, empates e restauração da ordem original.

No consumo, apenas o rótulo da categoria **Investigação** passa a **Acompanhamento**. A chave `investigation` e os títulos dos relatórios permanecem para conservar configurações e comportamento.

## Quinta etapa entregue — medição e carregamento

A versão 0.20.8 conclui R05 com comparação da compilação de produção antes/depois. A primeira tentativa de separar somente páginas reduziu pouco o JavaScript até as OS e deixou o tempo de abertura praticamente igual. A entrega também adia os relatórios de OS até existir base e separa as bibliotecas de gráficos e planilhas. Cinco execuções controladas por versão mediram cerca de 48% menos JavaScript até a primeira tela de OS e mediana de 1,81 s para 1,31 s, com bases vazias e permissões fictícias.

Páginas são carregadas na primeira visita autorizada e continuam montadas depois. Filtros, bases, seleção, rascunhos e histórico da sessão são conservados na navegação. Operacional/Parque compartilham a instância existente. Administração conserva seu comportamento de desmontar ao sair. Negar/revogar acesso impede a montagem; uma falha isolada não força a recarga do sistema nem das outras páginas. O lote continua podendo alimentar páginas antes da primeira visita.

Metodologia, tamanhos, custo da primeira visita, limites dos resultados, responsabilidades e conferência estão em [Desempenho e carregamento](DESEMPENHO-E-CARREGAMENTO.md). Não se trata de medição completa de cálculos com grandes planilhas ou do ambiente Cloudflare real. Os demais itens da fila não foram iniciados nesta entrega.

## Critérios preservados nas etapas

- Mesmas chaves do IndexedDB, formato do histórico e backup. Nenhuma migração, limpeza ou transferência de dados.
- Gravação confirmada pelo repositório antes da atualização do histórico visível. Falha conserva o histórico anterior e o rascunho.
- Acompanhamento por operadora + ICCID. Cliente, equipamento e placa são a referência registrada na ação.
- Histórico individual usa as apurações em uso do chip, independentemente do recorte da grade. Períodos sobrepostos permanecem separados.
- Critérios de elegibilidade, duplicidades, vínculos, conversão de unidades, referências de investigação e totais financeiros permanecem no domínio existente.
- Ordenação, seleção, paginação, escolha de seções, impressão e exportação continuam com seus critérios atuais.
- Ações de importação/exportação conservam suas verificações de autorização. O acompanhamento permanece local neste navegador.
- Após a primeira visita, páginas autorizadas continuam montadas durante a navegação; os filtros e bases da sessão são preservados. Páginas ainda não visitadas não são montadas antecipadamente (0.20.8).

## Validação da etapa

Conferência do fluxo existente antes e depois da extração, com dados fictícios em um navegador separado. Verificações cobrem maiores consumos, troca de chip, rascunhos, anotações após recarga, busca, seleção/exportação, vínculo e placa, arquivamento/reativação, revisão e restauração explícita do backup, impressão e telas menores nos dois temas.

Foi simulada uma falha de escrita do IndexedDB: a mensagem de erro aparece, o histórico anterior permanece disponível e o rascunho pode ser retomado. Recarregar mantém somente as ações que tiveram gravação confirmada. A impressão conserva registros salvos e exclui o formulário/rascunho.

Executar também `npm run check`: caminhos locais, formatação, testes e build. Cada etapa posterior deve repetir as verificações afetadas e atualizar este documento.

## Sequência proposta

| Etapa | Escopo                                                                               | Situação                                                                |
| ----- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| R01   | Separar acompanhamento, persistência local, painel de arquivos e formatos do consumo | Entregue em 0.20.1                                                      |
| R02   | Separar prévia/importação, filtros e demais relatórios do consumo                    | Entregue em 0.20.2                                                      |
| R03   | Mapear CSS e consolidar apresentação dos controles compartilhados                    | Entregue em 0.20.3                                                      |
| R04   | Dividir a coordenação e os grandes relatórios de OS                                  | Entregue em 0.20.4: controlador e painéis antes reunidos na página      |
| R05   | Medir e avaliar carregamento por módulo, mantendo bases e estado de navegação        | Entregue em 0.20.8, com medições e conferência de preservação de estado |

Cada entrega deve ter um escopo limitado, revisão das mudanças e documentação. Alterações de regra de negócio ou formato de armazenamento precisam ser tratadas como mudanças próprias, com compatibilidade definida antes de implementação.
