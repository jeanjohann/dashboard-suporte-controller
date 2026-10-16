# Arquitetura e organização do código

## Personalização de apresentação — 0.22.0

Preferências visuais usam `shared/layout/` e o modal `components/PageSettings.jsx`. Cada módulo fornece catálogo e categoria; `Section` registra a capacidade real de resumo e aplica visibilidade/apresentação. Preferências são locais e não integram arquivos importados nem o banco de usuários. Compatibilidade com OS e extensão em [Personalização das páginas](PERSONALIZACAO-DE-PAGINAS.md).

## Entrega 0.21.0 — suporte e monitoramento

A categoria Equipe de suporte reutiliza a base/filtros de OS; calendário e atribuição ficam em `supportPerformance.js`, exportação em `supportReport.js` e apresentação em `SupportPerformance.jsx`. Datas de execução/agendamento permanecem distintas, com critérios no [guia da equipe](EQUIPE-DE-SUPORTE.md).

Monitoramento separa fonte (`useMonitoringSource.js`), contrato/transporte (`snapshotContract.js`/`monitoringClient.js`), regras (`monitoring.js`/`monitoringAnalytics.js`) e apresentação (`MonitoringPage`, `MonitoringQueue`, `MonitoringAnalytics`). O Worker possui uma rota autenticada para futuro Service Binding privado, sem serviço configurado nesta entrega. D1 e dados locais dos demais módulos permanecem com a mesma finalidade. [Contrato e limites da integração](INTEGRACAO-MONITORAMENTO.md).

Este guia é o ponto de partida para estudar o sistema e localizar o código antes de fazer alterações. A versão 0.16.1 organiza arquivos por responsabilidade; os critérios de cálculo, nomes dos campos e formatos das bases permanecem os mesmos.

## Estrutura do projeto

```text
src/
  main.jsx                 Entrada do navegador e ordem dos estilos
  app/                     Workspace, navegação, tema e painel lateral
  components/              Gráficos, tabelas, filtros, ajuda e impressão compartilhados
  modules/
    orders/                Ordens de Serviço
      components/          Página, cards e relatórios
      hooks/               Estado da base, importação e controles da sessão
      domain/              Cálculos, equipamentos, histórico e testes
      data/                Importador Excel e testes
      config/              Categorias e preferências de exibição
    operational/           Cadastro operacional, revisão e vínculos
      components/          Página operacional e acesso aos cruzamentos
      domain/              Leitura, revisão, vínculos e testes
      config/              Categorias do menu
    consumption/           Consumo M2M
      components/          Tela e tabela de registros
      hooks/               Estado de persistência local e acompanhamento individual
      utils/               Formatos de apresentação, sem React
      config/              Categorias e títulos dos relatórios
      domain/              Parsers, cálculos, vínculos e testes
      data/                Histórico IndexedDB, backups e testes
    park/                  Parque e Manutenção
      components/          Relatórios dos cruzamentos
      domain/              Indicadores, exportações e testes
    logistics/             Envios e devoluções, sem leitura de Consertos
      components/          Cards, filtros, revisão e origem
      domain/              Importador, seleção e testes
    users/components/      Administração de usuários
    monitoring/            Monitoramento em preparação, demonstração, domínio e relatórios
    imports/               Importação conjunta
      components/          Seleção e conferência do lote
      domain/              Reconhecimento, montagem e testes
  shared/
    data/                  Filtros, datas e ordenação
    charts/                Regras de disponibilidade e ranking
    export/                CSV, SVG e download local
    security/              Sessão, API e regras compartilhadas de permissões
  styles/                  CSS carregado pela entrada do aplicativo
server/                    Worker, validação de identidade e API de permissões
migrations/                Estrutura SQL do banco de usuários
scripts/                   Verificações de manutenção
docs/                      Guias de uso, critérios e manutenção
public/                    Recursos estáticos, como imagens de identidade
import/                    Planilhas e CSVs locais; fora do Git
```

As pastas `node_modules`, `dist`, `.wrangler` e `.worker-build` são geradas por ferramentas. Não editar arquivos nelas para mudar o comportamento do sistema. `layout-review/` contém imagens locais de revisões anteriores; `layout-review.mjs` é um roteiro histórico dependente de arquivos e ferramentas locais, não faz parte da execução ou dos testes oficiais.

## Organização dos estilos — 0.20.3

`src/main.jsx` carrega os estilos globais nesta ordem: `style.css`, `identity.css`, `theme.css`, `sidebar.css`, `layout-polish.css`, `filters.css` e `controls.css`. Essa sequência participa da precedência do CSS; mudar a ordem exige conferir as telas afetadas.

| Arquivo em `src/styles/` | Responsabilidade                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `style.css`              | Estruturas históricas de páginas, cards, gráficos e relatórios específicos                                                |
| `identity.css`           | Tipografia, identidade visual e apresentação base dos campos                                                              |
| `theme.css`              | Variáveis de cores claro/escuro e aplicação da paleta                                                                     |
| `sidebar.css`            | Navegação, identidade do menu e camadas de ajuda                                                                          |
| `layout-polish.css`      | Alinhamento de seletores, gráficos e ajustes específicos de apresentação                                                  |
| `filters.css`            | Painéis de filtros, seleção múltipla e ajustes próprios das grades                                                        |
| `controls.css`           | Cabeçalhos e ações de relatórios, abrir/recolher, exportação, rolagem de tabelas, ordenação, foco e estados desabilitados |

Os arquivos antigos ainda contêm ajustes de componentes específicos; esta etapa não reescreve todo o CSS. Ao ajustar um controle comum, procurar primeiro sua regra em `controls.css`. Cores devem usar variáveis de tema. Densidade exclusiva de um módulo, como o Monitoramento, permanece no CSS desse módulo. Não aplicar regras de botão de ação aos ícones de ajuda.

As regras gerais e responsivas do arquivo compartilhado preservam a sequência da cascata existente. Blocos complementares de um seletor não são necessariamente duplicações: podem conservar a precedência entre breakpoints. Não mover todos os `@media` ao final sem comparar os estilos calculados, as dimensões dos controles e os dois temas. Impressão também deve ser conferida quando o ajuste afeta cabeçalhos ou conteúdo recolhido.

O nome da aba do navegador é definido por `<title>` em `index.html`: **Addlog | Suporte Controller**. O favicon usa `public/brand/addlog-symbol.svg`.

## Fluxo dos dados

Os [diagramas do sistema e da leitura dos arquivos](DIAGRAMAS-DO-SISTEMA.md) apresentam a separação entre pessoa, navegador e Cloudflare, os campos interpretados e os caminhos de revisão. Os SVGs podem ser ampliados para estudo e apresentação.

Monitoramento Ativo possui um guia próprio em [MONITORAMENTO-DE-FROTA.md](MONITORAMENTO-DE-FROTA.md). Nesta etapa seus dados fictícios ficam isolados, sem API, agendamento ou armazenamento no servidor. `MonitoringPage.jsx` coordena filtros e relatórios; `MonitoringQueue.jsx` reúne a tabela prioritária e o formulário de tratamento. O domínio acrescenta uma entrada ao histórico somente após Salvar atualização; os registros ficam na memória da sessão e acompanham a exportação do recorte.

1. `src/main.jsx` aplica o tema e a verificação de acesso antes de montar `app/Workspace.jsx`.
2. O Workspace mantém OS e operacional na memória da sessão e coordena as páginas autorizadas. Desde 0.20.8, cada página é carregada na primeira visita; depois permanece montada, mas oculta durante a navegação, preservando filtros e rascunhos. Uma página sem permissão não é montada. Administração mantém seu reinício ao sair.
3. Os importadores transformam Excel/CSV em estruturas analisáveis, preservando células e referências da origem. Os problemas são apontados para revisão; a planilha não é corrigida.
4. As funções em `domain/` calculam os indicadores. Quando um vínculo exige contexto completo, como uma troca de equipamento, usam a base original antes de aplicar o recorte.
5. Os componentes apresentam o resultado, as exclusões e as linhas de origem. Exportação e impressão usam os fluxos locais com verificação de permissão.
6. O histórico de consumo fica no IndexedDB do navegador. O servidor recebe somente consultas de sessão e cadastros de usuários; não recebe planilhas nem relatórios.

A logística (0.18.0) utiliza uma referência própria na memória do Workspace, acessível em Parque e Manutenção e na Importação conjunta. Não depende das bases OS/Operacional para a primeira conferência. `modules/logistics/domain/logistics.js` preserva abas/linhas/células e calcula apenas movimentações e recebimentos datados; vínculos e diagnóstico logístico permanecem fora dessa etapa. Permissão de fonte logística acompanha Parque e Manutenção, além da ação de importação.

## Onde alterar cada assunto

O acompanhamento individual do consumo está em `hooks/useLineFollowup.js` e `components/LineHistoryPanel.jsx`; leitura/confirmação de gravação em `hooks/useConsumptionArchive.js`; versões e backups em `components/ConsumptionArchivePanel.jsx`. A primeira etapa de extração e a sequência de manutenção estão em [Revisão técnica e refatoração](REVISAO-E-REFATORACAO.md).

Na versão 0.20.2, `hooks/useConsumptionImports.js` controla importações, versões e backups; `ConsumptionImportHeader.jsx` e `ConsumptionImportPreview.jsx` apresentam os arquivos e a prévia; `ConsumptionFiltersPanel.jsx` apresenta os controles. Seleção e CSV estão em `domain/consumptionFilters.js` e `consumptionRecordsReport.js`. Relatórios são separados em painéis de visão geral, investigação, equipamentos, mensalidades e origem, recebendo o mesmo recorte e contexto da página. Categorias ficam em `config/consumptionMenus.js`.

| Assunto                                       | Arquivo principal                                                      | Guia de regras             |
| --------------------------------------------- | ---------------------------------------------------------------------- | -------------------------- |
| Entrada e ordem do CSS                        | `src/main.jsx`                                                         | Este guia                  |
| Navegação entre páginas e bases da sessão     | `src/app/Workspace.jsx`                                                | `IMPORTACAO.md`            |
| Menu, tema e painel lateral                   | `src/app/Navigation.jsx`, `Theme.jsx`, `SidePanel.jsx`                 | `GUIA-E-MANUTENCAO.md`     |
| Leitura da aba OS                             | `src/modules/orders/data/import.js`                                    | `PRODUTO.md`               |
| Financeiro e contagem de chamados             | `src/modules/orders/domain/analysis.js`                                | `PRODUTO.md`               |
| Filtros, período e seleção múltipla           | `src/shared/data/filters.js`                                           | `GUIA-E-MANUTENCAO.md`     |
| Custos, reincidência e perfil de intervenções | `src/modules/orders/domain/insights.js`                                | `ANALISES-DE-OS.md`        |
| Trocas e modelos de rastreador                | `src/modules/orders/domain/trackerReplacements.js`, `trackerModels.js` | `VIDA-EM-CAMPO.md`         |
| Média, mínimo e máximo até primeira troca     | `src/modules/orders/domain/fieldLife.js`                               | `VIDA-EM-CAMPO.md`         |
| Relatório descritivo XLSX/CSV                 | `src/modules/orders/domain/descriptive.js`                             | `RELATORIO-DESCRITIVO.md`  |
| Leitura operacional e vínculos com OS         | `src/modules/operational/domain/operational.js`                        | `OPERACIONAL.md`           |
| Indicadores de Parque e Manutenção            | `src/modules/park/domain/parkAnalysis.js`                              | `PARQUE-E-MANUTENCAO.md`   |
| CSV, unidades, períodos e vínculos de consumo | `src/modules/consumption/domain/lineConsumption.js`                    | `CONSUMO-DE-LINHAS.md`     |
| Histórico de consumo e backup local           | `src/modules/consumption/data/consumptionHistory.js`                   | `CONSUMO-DE-LINHAS.md`     |
| Importação de várias bases                    | `src/modules/imports/domain/bulkImport.js`                             | `IMPORTACAO.md`            |
| Ajuda e impressão de seção                    | `src/components/InfoNote.jsx`, `Section.jsx`                           | `GUIA-E-MANUTENCAO.md`     |
| Páginas e ações autorizadas                   | `src/shared/security/permissions.js`                                   | `USUARIOS-E-PERMISSOES.md` |
| Identidade e gravação de usuários             | `server/worker.js`                                                     | `USUARIOS-E-PERMISSOES.md` |

Quando uma tabela indicar vários nomes na mesma célula, eles pertencem à mesma pasta do primeiro caminho.

## Coordenação das OS — 0.20.4

`OrdersPage.jsx` mantém categorias, preferências de exibição e contextos dos relatórios. `hooks/useOrdersSession.js` concentra importação autorizada, filtros, busca/ordenação/paginação, referência e situação dos ciclos e chamadas às funções de análise. A base continua pertencendo ao Workspace; o controlador não grava a planilha nem substitui dados após uma falha de leitura.

Os componentes `OrdersImportPanel`, `OrdersFiltersPanel`, `OrdersReportMenu`, `OrdersLifecyclePanel`, `OrdersSwapsPanel`, `OrdersTotalsPanels` e `OrdersRecordsPanel` apresentam responsabilidades separadas. Os relatórios recebem dados e ações; não mantêm outra cópia da base. Contextos de impressão e expansão continuam envolvendo todos os painéis. A montagem durante navegação e as chaves das preferências permanecem.

`domain/orderRecords.js` contém busca pelo texto exibido e ordenação do recorte completo, antes da paginação. Essas funções não substituem `applyFilters`: a busca é restrita à tabela, enquanto os indicadores continuam usando a seleção principal. Testes próprios verificam imutabilidade e ausências/erros ao final. Relatórios já separados, como `AdvancedInsights`, `Explorers` e `FieldLifePanel`, continuam em seus arquivos; a extração não reescreve suas regras.

## Indicadores de acompanhamento em campo — 0.20.5

`orders/domain/fieldLife.js` mantém as regras de vínculo e acrescenta em `lifeStats` a participação com/sem troca e o resumo `followup` (quantidade, soma de dias, média e exclusões). `lifeGroups` aplica essas bases a cada modelo, cliente ou mês. A média até troca continua em `mean`; o tempo acompanhado fica separado em `followup.mean`.

`orders/components/FieldLifeCards.jsx` apresenta os cards e seus balões. `FieldLifePanel.jsx` coordena categoria, início, filtros, limite, tabelas e impressão. `orders/domain/fieldLifeSummary.js` monta as linhas numéricas do resumo CSV com unidades e denominadores. Os caminhos são relativos a `src/modules/`. Consulte [Vida em campo](VIDA-EM-CAMPO.md) antes de interpretar as duas médias ou alterar suas populações.

## Carregamento por módulo — 0.20.8

`app/DeferredPage.jsx` combina primeira visita, preservação da instância, carregamento e falha isolada. As declarações `lazy` ficam fora de `Workspace` e `OrdersPage`, mantendo identidades estáveis. Operacional e Parque continuam com uma única instância; o controlador das OS e as bases permanecem em seus níveis anteriores.

`orders/components/OrdersReports.jsx` recebe a sessão e é carregado quando há dados. Aguardar esse módulo não elimina nem corrige a base importada. `vite.config.js` separa React, gráficos e planilhas; a ordem do CSS continua explícita em `main.jsx`. A compilação gera manifesto e `scripts/bundle-report.mjs` informa o peso da entrada e das dependências estáticas até a tela inicial de OS.

Medições, limites e roteiro de conferência estão em [Desempenho e carregamento](DESEMPENHO-E-CARREGAMENTO.md). Primeira visita pode carregar código adicional; retornos preservam o estado enquanto a página continuar autorizada. Não transformar a preservação em montagem antecipada de todas as páginas, nem desmontar páginas visitadas a cada troca de menu.

## Dependências e limites

- `components/` contém elementos reaproveitados; o cálculo específico deve ficar no domínio correspondente. Existem dependências históricas de componentes para contexto de aplicação e configurações de OS; esta organização não tenta eliminar todas elas de uma vez.
- Funções de domínio recebem dados e devolvem resultados. Os domínios de análise não dependem de componentes React. Funções de exportação podem compor as tabelas/XLSX usando os utilitários compartilhados.
- Cruzamentos entre módulos são explícitos: operacional usa regras de OS para vínculos; consumo consulta campos operacionais; parque combina as duas bases; importação conjunta conhece os importadores das três bases.
- `shared/security/permissions.js` é utilizado tanto no navegador quanto no Worker. Ele não pode depender de React, DOM, localStorage ou IndexedDB.
- `server/schema.js` espelha a migração SQL inicial. Mudanças de esquema devem manter os dois arquivos consistentes e planejar a migração do banco existente.
- Caminhos de arquivos podem mudar; chaves de localStorage/IndexedDB, IDs de páginas e nomes de campos não devem mudar sem um plano de compatibilidade.
- Restrições de importação/exportação controlam os fluxos do aplicativo. Elas não impedem cópia de dados que a pessoa já possui ou visualiza. Consulte o guia de permissões antes de alterar esse limite.

## Padrão para novos arquivos

Use a pasta do módulo responsável e mantenha testes `*.test.js` junto da regra que verificam. Uma função realmente reutilizada por vários módulos pode ir para `shared/`; uma interface reaproveitável, para `components/`. Evite mover regras específicas para uma pasta genérica apenas para encurtar um import.

Cada arquivo de código possui uma descrição de sua responsabilidade. As funções públicas principais têm comentários em português que explicam propósito e critérios. Em trechos delicados, o comentário deve explicar o motivo da decisão: por exemplo, por que usar o total lançado ou por que exigir o par completo de uma troca. Não repetir em comentário aquilo que uma atribuição simples já mostra.

Use nomes claros, indentação de dois espaços e a formatação automática configurada em `.prettierrc.json`. `.editorconfig` orienta editores compatíveis. Não modificar uma regra de negócio apenas para facilitar a formatação ou a mudança de pasta.

## Verificação antes de publicar

```sh
npm ci
npm run format
npm run check
npx wrangler deploy --dry-run --outdir .worker-build
```

- `format` aplica o padrão em código, configurações e documentação.
- `format:check` confere o padrão sem alterar arquivos.
- `check:imports` confere se os caminhos locais existem, inclusive entre navegador e servidor.
- `test` executa os testes de regressão das regras e da API, sem precisar das planilhas reais para a suíte principal.
- `build` verifica a compilação de produção e as dependências dos componentes.
- `check` reúne caminhos, formatação, testes e compilação; interrompe ao encontrar uma falha.
- O dry-run do Wrangler verifica o empacotamento do Worker e seus bindings sem publicar.

Há um teste opcional com um arquivo Excel real, ignorado quando o arquivo esperado não está disponível. A suíte não deve exigir dados de clientes no repositório. Desde 0.20.8 o carregamento é dividido por módulo e relatórios de OS. Um eventual aviso de tamanho deve levar à análise das dependências e medições; não aumentar o limite apenas para esconder o aviso. O relatório de tamanho da compilação não substitui medições de rede/renderização.

Depois das verificações automáticas, confira no navegador os fluxos afetados: navegação, importação, filtros, relatórios e, quando aplicável, login e permissões. Uma compilação bem-sucedida não substitui essa conferência visual.

## Atualização da documentação

Registre a alteração no `CHANGELOG.md`, atualize o guia do módulo e mantenha esta tabela coerente quando mover arquivos. O `README.md` é a entrada do projeto; documentos de produto explicam as regras, e este guia explica onde implementá-las. Algumas seções dos guias registram etapas históricas: para saber o comportamento atual, confira a seção mais recente e os testes correspondentes.

## Apresentação de filtros e ajuda

`components/PeriodFilter.jsx` controla o período compartilhado da página de OS. `components/MultiFilter.jsx` mantém a seleção múltipla com busca e fechamento por clique externo ou Escape. `styles/filters.css` concentra os ajustes de densidade e responsividade.

`components/HelpLayout.jsx` organiza explicações em blocos HTML e fragmentos dos relatórios; não inspeciona componentes de domínio e não altera cálculos. `Section` e `PagePersonalization` aplicam essa organização. As regras de texto dos principais cards das OS ficam em `modules/orders/config/metricHelp.js`. Consulte [Filtros e apresentação](FILTROS-E-APRESENTACAO.md) para o significado dos valores financeiros.

O consumo utiliza `modules/consumption/data/historyRepository.js` como contrato de leitura/gravação, mantendo o IndexedDB existente como único adaptador. `domain/lineHistoryReport.js` gera o relatório individual sem combinar apurações sobrepostas. A integração compartilhada futura não está ativada; exige autorização e tratamento de conflitos no servidor.

O catálogo de explicações `components/reportHelp.js` contém somente textos de apresentação. `Section` combina a descrição por título (ou pela propriedade `help`) com as notas locais e mantém a versão textual na impressão. Mudanças de título exigem revisar a cobertura da ajuda. A classificação de manutenção efetiva usada na comparação geográfica fica em `orders/domain/insights.js`, função `effectiveMaintenanceRows`, e não no catálogo.
