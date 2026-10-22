/** Gera um mapa documental reproduzível; não modifica fontes, planilhas ou configurações de execução. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseAst } from 'rollup/parseAst';
import { diagrams, diagramColors } from './diagrams.mjs';
import {
  publicStudyGuide,
  privateStudyGuide,
  renderArchitectureMap,
} from './presentationPrivacy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'docs/mapa-arquitetura');
const git = (...args) =>
  execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, ...args], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 12e6,
  });
const commit = git('rev-parse', '--short', 'HEAD').trim();
const base = `${commit} · cópia da entrega`;
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const paths = [
  ...new Set(git('ls-files', '--cached', '--others', '--exclude-standard').trim().split('\n')),
]
  .filter(
    (p) =>
      p &&
      !p.startsWith('docs/mapa-arquitetura/') &&
      !p.startsWith('outputs/') &&
      fs.existsSync(path.join(root, p)),
  )
  .sort();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const esc = (v) =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const title = (v) => v.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('-', ' ');
const moduleNames = {
  'my-dashboard': 'Meu Dashboard',
  orders: 'Ordens de Serviço',
  operational: 'Operacional',
  park: 'Parque e Manutenção',
  logistics: 'Logística',
  consumption: 'Consumo M2M',
  monitoring: 'Monitoramento Ativo',
  imports: 'Importação',
  users: 'Usuários',
  assistant: 'Assistente',
};

// Os comentários específicos do código complementam as descrições editoriais abaixo.
const descriptions = {
  'docs/BASES-SALVAS-E-COLETA.md':
    'Bases completas no D1 do proprietário, versões ativas, retenção, coleta agendada, verificação e estado da publicação.',
  'server/businessSources.js':
    'Rotas autenticadas de envio em partes, catálogo, leitura e publicação transacional das bases OS, Operacional e Logística no piloto.',
  'server/monitoringStorage.js':
    'Coletor conectado ao D1 com lease, cron 9h/12h/15h/18h de São Paulo, fotografia válida, eventos, histórico paginado e retenção de 30 dias.',
  'server/persistence/snapshotStore.js':
    'Armazena partes imutáveis e verifica hashes; publica ponteiros e revisões em transação, preservando cinco versões das planilhas.',
  'server/persistence/snapshotTestDatabase.mjs':
    'Banco SQLite em memória que reproduz a interface D1 e lotes transacionais para testes sem rede ou dados de produção.',
  'server/persistence/migrations/0002_snapshots_and_collection.sql':
    'Estrutura de manifestos, partes, bases ativas, publicações, leases e histórico de coletas no banco de negócio separado.',
  'src/shared/persistence/snapshotPayload.js':
    'Valida JSON portátil das bases e fotografias, limites, divisão de partes e hashes de integridade sem alterar identificadores.',
  'src/shared/persistence/sourceSnapshotClient.js':
    'Carrega versões completas, confere integridade e só aplica uma importação depois da confirmação transacional do servidor.',
  'src/shared/persistence/useSavedSources.js':
    'Coordena restauração inicial e gravação central das três planilhas no piloto, sem fallback local em falhas.',
  'src/shared/persistence/SavedSourcesPanel.jsx':
    'Mostra versões ativas das bases e permite recarregá-las do banco, com indicação de salvamento e erros.',
  'src/modules/monitoring/data/savedMonitoringClient.js':
    'Distingue leitura da coleta salva e atualização pelo fornecedor, validando a fotografia antes de exibi-la.',
  'src/modules/monitoring/components/MonitoringCollectionHistory.jsx':
    'Consulta sob demanda o histórico paginado das execuções e suas contagens, sem chamar o fornecedor.',
  'docs/BANCO-CLOUDFLARE.md':
    'Ativação D1 de negócio, piloto do proprietário, migração dos lembretes, limites, backup/restauração e sequência das demais fontes.',
  'server/businessReminders.js':
    'API autenticada da agenda no banco de negócio: piloto do proprietário, revisão por veículo, histórico e migração local idempotente sem sobrescrita.',
  'src/modules/monitoring/data/remoteReminderRepository.js':
    'Seleciona a agenda remota conforme autorização, lê todas as páginas e migra a cópia local por escolha explícita, sem fallback em falhas.',
  'scripts/backup-business-db.ps1':
    'Exporta o banco de negócio em SQL para pasta ignorada pelo Git e gera hash SHA-256; não restaura nem altera produção.',
  'scripts/setup-kore.ps1':
    'Configura credenciais KORE como segredos do Worker por entrada oculta e stdin, sem gravar valores privados em arquivos.',
  'server/kore.js':
    'Consulta KORE em lotes de até oito páginas por token, com validação e encerramento somente do token utilizado.',
  'src/modules/consumption/components/KorePilotPanel.jsx':
    'Coleta KORE para administradores: lotes a cada dez minutos, cobertura, pausa e exportação em memória, isolada dos indicadores CSV.',
  'src/styles/theme-presets.css':
    'Cinco paletas adicionais para tela, com superfícies claras/escuras, tokens de leitura e gráficos; mantém cores próprias da impressão e rolagem no seletor de temas.',
  'src/modules/monitoring/components/MonitoringRegistry.jsx':
    'Conferência autorizada API × Operacional, com grupos, filtros, referências de origem e CSV; não modifica os cadastros.',
  'src/modules/monitoring/domain/monitoringRegistry.js':
    'Cruza seriais numéricos exatos e únicos, preserva duplicidades e imprecisão e compara placa, cliente/base e modelo sem inferir equivalências.',
  'src/modules/monitoring/domain/monitoringPeriods.js':
    'Define limites de 48/72/96 horas e 30/60/90 dias e as faixas exclusivas de duração usadas na análise.',
  'src/shared/data/clientDisplay.js':
    'Formata nomes de clientes em caixa alta somente na apresentação, sem alterar fonte, identidade ou agrupamento.',
  'src/modules/monitoring/components/MonitoringSummaryTable.jsx':
    'Tabela por base/modelo com colunas essenciais ou completas, seleção, ordenação semântica de todo o conjunto e paginação de 15 linhas.',
  'src/modules/monitoring/domain/monitoringHistory.js':
    'Compara fotografias reais para eventos observados de atraso e retorno da comunicação, sem presumir duração exata; calcula janelas UTC futuras de coleta.',
  'server/monitoringCollection.js':
    'Coordena coleta completa, lease e publicação atômica de fotografias/eventos; conectado ao repositório D1 por monitoringStorage.',
  'src/modules/orders/domain/zohoPresence.js':
    'Valida e recorta intervalos de sessões por agente, une sobreposições e aponta duplicatas, abertos e datas inválidas sem estimar duração.',
  'src/modules/orders/components/ZohoPresencePanel.jsx':
    'Piloto local de CSV Session: mapeamento explícito, fuso, período, cards, conferência e exportação; mantém dados somente na memória da sessão.',
  'scripts/benchmark-monitoring.mjs':
    'Mede classificação, telemetria, filtro, ordenação e relatório com 1.800 veículos fictícios, sem consultar a API real; gera resultados locais ignorados pelo Git.',
  'src/styles/monitoring-refinement.css':
    'Refina hierarquia e alinhamento das tabelas e cards do Monitoramento e formulário local de sessões, com responsividade e contexto de impressão.',
  'scripts/setup-monitoring.ps1':
    'Configura endereço e token do diagnóstico legado como segredos no Cloudflare por entrada local oculta, sem gravar credenciais em arquivo.',
  'scripts/architecture/diagrams.mjs':
    'Define os grafos editoriais dos diagramas e suas evidências no código.',
  'wrangler.architecture.jsonc':
    'Publica o mapa em Worker independente, com senha, limitação de tentativas e todos os arquivos protegidos.',
  'scripts/architecture/map-template.html':
    'Template autocontido do mapa interativo, com navegação, catálogo, diagramas e apresentação.',
  'src/modules/orders/components/ZohoColumnPicker.jsx':
    'Permite escolher e restaurar colunas visíveis das tabelas de atividade Zoho.',
  'src/modules/orders/components/ZohoClosures.jsx':
    'Tabela dos eventos de fechamento, executor histórico, responsável atual e contribuições de tempo por agente.',
  'src/modules/my-dashboard/components/DashboardCatalog.jsx':
    'Catálogo de indicadores permitidos e entradas de análises personalizadas; sinaliza fontes carregadas.',
  'src/modules/my-dashboard/components/DashboardDialog.jsx':
    'Janela acessível para catálogo, edição e ampliação de blocos.',
  'src/modules/my-dashboard/components/DashboardTools.jsx':
    'Modelos de painel, fontes da sessão, backup e recorte opcional do painel.',
  'src/modules/my-dashboard/components/DashboardWidget.jsx':
    'Avalia cada bloco e complementos, apresenta fonte/critério e controles de edição e ampliação.',
  'src/modules/my-dashboard/components/MyDashboardPage.jsx':
    'Coordena o espaço pessoal, catálogo, edição, organização e apresentação dos blocos.',
  'src/modules/my-dashboard/components/WidgetEditor.jsx':
    'Edita métrica, consulta aprovada, apresentação, composição e recorte; valida antes de aplicar.',
  'src/modules/my-dashboard/components/WidgetVisualization.jsx':
    'Renderiza cards, barras, colunas, linhas, rosca e tabelas conforme espaço e unidade.',
  'src/modules/my-dashboard/data/dashboardRepository.js':
    'Persiste configuração local por usuário com validação e proteção de revisão concorrente.',
  'src/modules/my-dashboard/domain/catalog.js':
    'Define indicadores disponíveis, módulos e permissões herdadas das páginas de origem.',
  'src/modules/my-dashboard/domain/layout.js':
    'Valida documentos e blocos, limites, filtros, consultas e compatibilidade das composições.',
  'src/modules/my-dashboard/domain/evaluate.js':
    'Adapta fontes autorizadas da sessão às regras dos módulos e às análises personalizadas.',
  'src/modules/my-dashboard/domain/customQuery.js':
    'Agrupa OS/Operacional e calcula medidas aprovadas com denominadores e linhas de origem.',
  'src/modules/my-dashboard/domain/boardActions.js':
    'Move, redimensiona, copia e transporta configurações em backup sem copiar dados das fontes.',
  'src/modules/my-dashboard/domain/presentation.js':
    'Define formatos compatíveis, comparação de eixos/unidades, herança de filtros e seções.',
  'src/modules/my-dashboard/domain/templates.js':
    'Fornece painéis iniciais permitidos para gestão, suporte, parque e consumo.',
  'src/modules/my-dashboard/hooks/DashboardSources.jsx':
    'Publica fontes autorizadas carregadas na sessão e as compartilha com Meu Dashboard.',
  'src/modules/my-dashboard/hooks/useDashboards.js':
    'Coordena edição, salvamento, descarte, histórico de desfazer e concorrência do repositório.',
  'src/modules/my-dashboard/hooks/useDashboardArrangement.js':
    'Controla gestos de arraste e redimensionamento com encaixe e alternativa por teclado.',
  'src/modules/my-dashboard/hooks/useDashboardPresentation.js':
    'Controla apresentação, tela cheia e impressão do painel.',
  'src/styles/my-dashboard.css':
    'Estilos responsivos dos painéis pessoais, editores, gráficos e apresentação.',
  'src/styles/review-diagnostics.css':
    'Apresentação comum dos diagnósticos detalhados de OS e Operacional.',
  'src/components/ReviewPanel.jsx':
    'Busca, paginação, exportação e detalhamento dos apontamentos de revisão, com origem preservada.',
  'src/modules/orders/components/MaintenanceMatrix.jsx':
    'Matriz de modelo por motivo com cobertura e acesso às linhas originais.',
  '.editorconfig': 'Padroniza indentação, codificação e finais de linha entre editores.',
  '.gitignore': 'Exclui dependências, planilhas privadas, segredos e artefatos do versionamento.',
  '.node-version': 'Declara a versão de Node usada pelo projeto.',
  '.prettierignore': 'Define exclusões da verificação automática de formatação.',
  '.prettierrc.json': 'Configura o padrão de formatação Prettier.',
  'README.md': 'Porta de entrada: uso, desenvolvimento, verificações e documentação do projeto.',
  'CHANGELOG.md':
    'Histórico de entregas por versão; não representa sozinho o estado de serviços externos.',
  'index.html': 'Documento inicial do navegador, metadados, favicon e ponto de montagem React.',
  'package.json':
    'Versão do produto, bibliotecas e comandos de desenvolvimento, verificação e build.',
  'package-lock.json': 'Fixa a árvore de dependências para instalações reproduzíveis.',
  'vite.config.js': 'Configura compilação, manifesto e divisão de bibliotecas em chunks.',
  'wrangler.jsonc':
    'Define Worker, distribuição estática, binding de usuários e nomes de configurações de integração.',
  'migrations/0001_users.sql':
    'Migração SQL do cadastro de usuários e suas permissões; corresponde ao D1 ativo de acesso.',
  'server/persistence/migrations/0001_business_documents.sql':
    'Esquema dos documentos de negócio usado pela agenda do piloto, separado do banco de usuários.',
  'public/_headers': 'Cabeçalhos HTTP dos arquivos estáticos, incluindo políticas de segurança.',
  'public/robots.txt': 'Instruções a mecanismos de busca para a aplicação.',
  'scripts/setup-zoho.ps1':
    'Assistente operacional local para configurar a integração Zoho; não é parte do bundle do navegador.',
  'scripts/start-assistant-lab.ps1':
    'Inicializa os serviços locais necessários ao laboratório do assistente.',
  'scripts/start-local-acervo.ps1': 'Inicializa a leitura HTTP local do acervo autorizado.',
  'src/main.jsx':
    'Entrada React: importa os estilos na ordem da cascata e monta tema, acesso e Workspace.',
  'src/styles/style.css':
    'Base visual geral: tipografia, superfícies, tabelas e estrutura compartilhada.',
  'src/styles/theme.css': 'Variáveis e refinamentos dos temas claro e escuro.',
  'src/styles/sidebar.css': 'Menu lateral, navegação, logo e estados de recolhimento.',
  'src/styles/identity.css': 'Identidade visual da marca, controles e componentes principais.',
  'src/styles/layout-polish.css': 'Ajustes de espaçamento, densidade e alinhamento da interface.',
  'src/styles/filters.css': 'Aparência dos seletores, campos e conjuntos de filtros.',
  'src/styles/filter-workspace.css':
    'Quadro unificado de filtros, chips de seleção e alcance por categoria.',
  'src/styles/controls.css': 'Densidade e acabamento de botões e controles compartilhados.',
  'src/styles/page-settings.css': 'Modal de configuração e opções de apresentação da página.',
  'src/styles/google-orders.css': 'Estado da fonte Google, ações e informações de conexão.',
  'src/styles/overview-kpis.css': 'Identidade, cores e grade dos indicadores da Visão geral.',
  'src/styles/overview-agenda.css': 'Agenda da Visão geral e detalhe compacto junto aos cards.',
  'src/styles/support.css': 'Estilos da área de suporte e seus relatórios.',
  'src/styles/support-people.css': 'Cards individuais, seleção de pessoa e detalhes do suporte.',
  'src/styles/support-workspace.css': 'Organização dos painéis de equipe e dados Zoho.',
  'src/styles/report-stories.css': 'Grupos de relatórios e controles de troca de visualização.',
  'src/styles/next-analysis.css': 'Refinamentos dos blocos analíticos e suas grades.',
  'src/styles/analysis-workspace.css': 'Alinhamento, alturas e rolagem das grades analíticas.',
  'src/styles/monitoring.css': 'Fila, indicadores, detalhes e estados visuais do Monitoramento.',
  'src/modules/assistant/components/assistant.css':
    'Apresentação da página piloto, perguntas e resultado do assistente.',
};
const byName = {
  'analysis.js':
    'Converte valores monetários válidos em centavos e totaliza realizados, componentes de custo e resumo, preservando ausências.',
  'attendanceKind.js':
    'Centraliza a classificação explícita de Visita Improdutiva pelo motivo registrado.',
  'cardInsights.js':
    'Calcula motivos de manutenção e composição dos perfis de serviço, com grupos e registros de origem.',
  'contracts.js':
    'Separa valores contratuais cobrados do cliente e absorvidos pela Addlog; não comprova recebimento financeiro.',
  'customerIdentity.js':
    'Normaliza CNPJ e distingue identidade original da filial de consolidação analítica por cadastro/nome exato.',
  'dashboard.js':
    'Calcula indicadores do recorte e comparação com um intervalo anterior de mesma duração inclusiva.',
  'descriptive.js':
    'Constrói relatório descritivo por grupo/indicador, com unidade, denominador, critérios e exportação CSV/Excel.',
  'equipment.js':
    'Classifica acessórios e trocas explícitas e reúne análises de equipamentos com referências às ocorrências.',
  'fieldLife.js':
    'Reconstrói ciclos observáveis de rastreadores/acessórios e calcula estatísticas separando encerrados, abertos e revisões.',
  'fieldLifeSummary.js':
    'Produz as linhas numéricas do resumo de ciclos, compartilhadas com a exportação.',
  'insightExport.js':
    'Adapta resultados estratégicos a valores numéricos exportáveis, preservando moeda, percentual e ausência.',
  'insights.js':
    'Calcula custos agrupados, chamados, retornos, perfis de intervenção, duração e evolução mensal com bases explícitas.',
  'lifecycle.js':
    'Vincula implementação e retirada por serial/placa e mede tempo observado, com referência para períodos sem retirada.',
  'management.js':
    'Reúne indicadores gerenciais de execução, clientes e agenda sem misturar previsto e realizado.',
  'orderRecords.js':
    'Busca e ordena a grade original de OS; esse recorte de conferência não altera os indicadores.',
  'orderReview.js':
    'Aponta inconsistências de cabeçalhos, status e valores para conferência, sem corrigir células automaticamente.',
  'replacementRankings.js':
    'Conta eventos de troca por par de rastreador ou linha explícita de acessório e produz rankings rastreáveis.',
  'reports.js':
    'Agrupa medidas analíticas e seleciona histórico por placa/serial, preservando unidades, critérios e origem.',
  'summary.js':
    'Reúne volume, chamados e finanças para os cards a partir das bases analíticas correspondentes.',
  'supportActivityPreview.js':
    'Modelo de prévia fictícia de atividade de suporte; não é um adaptador real da API Zoho.',
  'supportComparison.js':
    'Compara execução e agendamento mantendo períodos, autoria e denominadores próprios de cada papel.',
  'supportPerformance.js':
    'Calcula desempenho por responsável/papel, atalhos de calendário, comparações e exclusões por data.',
  'supportPerson.js':
    'Deriva o detalhamento individual sobre o resultado já filtrado da equipe, conservando seus denominadores.',
  'supportReport.js':
    'Gera relatórios CSV/Excel da equipe e de pessoas com bases separadas e união rastreável dos originais.',
  'technicians.js':
    'Agrupa técnicos pelo código e separa nome, serviço, deslocamento e custo total lançado.',
  'trackerModels.js':
    'Deriva o modelo pelos prefixos de serial aprovados, sem sobrescrever ID/modelo de origem.',
  'trackerReplacements.js':
    'Valida placa/serial e confirma pares de troca por chamado/veículo/data com IDs distintos e direção quando comprovável.',
  'operational.js':
    'Importa e normaliza a fotografia operacional; filtra, resume e cruza equipamentos com o histórico de OS.',
  'operationalRecords.js':
    'Busca, ordena e prepara a conferência dos registros operacionais antes da paginação.',
  'lineConsumption.js':
    'Normaliza extratos em unidades inteiras, preserva ICCID, gerencia versões/apurações e vincula referência e histórico por chip.',
  'consumption.js':
    'Utilitários de leitura CSV, datas e volumes e resumo de consumo; convive com o fluxo de extratos em lineConsumption.',
  'consumptionHistory.js':
    'Lê/grava o histórico consolidado no IndexedDB e valida backup e hashes de arquivos; confirmação só após a transação.',
  'historyRepository.js':
    'Contrato read/write do consumo; o adaptador atual persiste exclusivamente no navegador.',
  'monitoring.js':
    'Normaliza e classifica o retrato, tempos offline, tensão, ordenação e tratamento administrativo sem inferir recuperação.',
  'monitoringAnalytics.js':
    'Calcula indicadores do retrato atual e filtra a fila sem mudar o denominador analítico das bases escolhidas.',
  'monitoringReminders.js':
    'Valida lembretes, revisões, vencimentos e histórico por base/veículo no fuso de São Paulo.',
  'monitoringReport.js':
    'Monta CSV/Excel do retrato analisado com contexto e identificação explícita da demonstração.',
  'snapshotContract.js':
    'Valida o contrato v1 do retrato de Monitoramento e recusa respostas incompletas ou grandes demais.',
  'bulkImport.js':
    'Reconhece bases em arquivos, monta prévia/lote e mescla versões de consumo antes da aplicação autorizada.',
  'logistics.js':
    'Importa Envios e Devoluções, valida datas e seleciona movimentações; não calcula estoque nem lê Consertos.',
  'parkAnalysis.js':
    'Cruza a fotografia operacional com OS vinculáveis e gera métricas, tabelas e exportações com denominadores/exclusões.',
  'parkHistory.js':
    'Aprofunda o histórico vinculável e a última intervenção efetiva com referência ajustável e conferência por serial/placa.',
  'filters.js':
    'Centraliza leitura de campos, datas de atendimento, extensão temporal e filtros combinados sobre a OS.',
  'zohoActivity.js':
    'Valida autoria/datas/durações e resume apontamentos e respostas Zoho, separando confirmados e itens a conferir.',
  'AdvancedInsights.jsx':
    'Apresenta análises estratégicas de custos, retornos, perfis e evolução, com origem e exportação.',
  'CardInsights.jsx': 'Apresenta resumos de motivos de manutenção e composição dos serviços.',
  'ContractSummary.jsx':
    'Apresenta valores contratuais e a separação de cobrança ao cliente e absorção Addlog.',
  'CustomerIdentityNote.jsx':
    'Explica a identidade por CNPJ e o agrupamento analítico de clientes em uso.',
  'DashboardOverview.jsx':
    'Coordena síntese, agenda, destaques, atalhos de apresentação e gráficos incorporados da Visão geral.',
  'DescriptiveReport.jsx':
    'Interface do relatório descritivo com medidas, critérios, agrupamentos e exportação.',
  'Explorers.jsx':
    'Exploração de agrupamentos/medidas e histórico por identificador; salva configurações locais.',
  'ExtendedInsights.jsx':
    'Análises complementares por grupos de cliente, cobrança e geografia, com linhas de origem.',
  'FieldLifeCards.jsx': 'Cards dos ciclos e durações observadas, distinguindo bases e estados.',
  'FieldLifePanel.jsx':
    'Conferência e apresentação das durações/ciclos com referência temporal e exportação.',
  'GeographyComparison.jsx': 'Compara regiões no recorte e apresenta volume, valores e origem.',
  'ManagementOverview.jsx':
    'Resumo gerencial de execução, clientes e agenda sobre resultados de managementMetrics.',
  'OrdersFiltersPanel.jsx':
    'Quadro de filtros OS por categoria, período, seleções e ações dos relatórios.',
  'OrdersGooglePanel.jsx':
    'Interface da fonte Google: estado, atualização e troca da origem OS/Operacional.',
  'OrdersImportPanel.jsx':
    'Seleção do arquivo OS, feedback de leitura e informações da fonte atual.',
  'OrdersLifecyclePanel.jsx':
    'Tabela do tempo observado em campo, com data de referência e filtro de situação.',
  'OrdersPage.jsx':
    'Controlador OS: conecta sessão, categoria, apresentação, permissões, Zoho e relatórios.',
  'OrdersRecordsPanel.jsx':
    'Pesquisa, paginação e conferência das linhas originais da planilha OS.',
  'OrdersReportMenu.jsx': 'Apresenta a seleção das categorias de análise OS.',
  'OrdersReports.jsx':
    'Distribui relatórios e grupos conforme categoria, preferências e disponibilidade de dados.',
  'OrdersSwapsPanel.jsx':
    'Apresenta eventos de troca, equipamentos e linhas que confirmam os eventos.',
  'OrdersTotalsPanels.jsx': 'Painéis de volume mensal, finanças, operações e chamados distintos.',
  'OverviewInlinePanels.jsx':
    'Reutiliza análises de operação, custos, suporte, equipamentos e parque dentro da Visão geral.',
  'OverviewKpis.jsx': 'Apresenta os indicadores calculados e suas comparações na Visão geral.',
  'RecordDetails.jsx':
    'Conferência das linhas de origem e detalhamento mensal; sem alterar os registros.',
  'ReplacementRankings.jsx':
    'Rankings de eventos de troca por cliente/placa/categoria, com conferência.',
  'ServiceProfilesContext.jsx': 'Contexto visual dos perfis de serviço, volumes e custos.',
  'SummaryCards.jsx': 'Apresenta cards de síntese recebendo as métricas já calculadas.',
  'SupportZohoActivity.jsx':
    'Controles e detalhamento da atividade Zoho por período, agente, apontamentos e respostas.',
  'SupportZohoOverview.jsx':
    'Resumo Zoho compacto na Visão geral, reaproveitando a coleta da equipe.',
  'SupportZohoPanel.jsx':
    'Reúne atividade Zoho, vínculos e conferência da conexão na mesma seção de equipe.',
  'ConsumptionEquipmentPanels.jsx':
    'Relaciona o consumo à referência operacional e apresenta recortes por equipamento.',
  'ConsumptionInvestigationPanel.jsx':
    'Ranking e grade de linhas para acompanhamento, com recortes e exportação.',
  'ConsumptionInvoicesPanel.jsx':
    'Apresenta informações de faturas e valores dos extratos elegíveis.',
  'ConsumptionOverviewPanels.jsx':
    'Visão geral de volumes, distribuição e indicadores por operadora.',
  'ConsumptionSourcesPanel.jsx':
    'Apresenta a fonte atual e o laboratório de coexistência de fontes, sem misturar exemplos ao histórico.',
  'SavedViews.jsx':
    'Interface para criar, aplicar, renomear e excluir favoritos locais da categoria.',
  'SavedViewsContext.jsx':
    'Contexto React que disponibiliza a capacidade de salvar visões aos controles da página.',
  'googleOperational.js':
    'Valida o retrato Google da aba operacional e o adapta à mesma leitura usada no arquivo local.',
  'orderAttention.js':
    'Detecta concentração descritiva de trocas por cliente/placa e improdutivas por cliente, com critérios e origem.',
  'server/zohoActivity.js':
    'Coleta páginas de atividade Zoho com limites, normaliza apontamentos/respostas e preserva autoria e pendências.',
};

const folderRoles = {
  src: 'Aplicação executada no navegador.',
  'src/app': 'Shell, navegação, tema e bases compartilhadas da sessão.',
  'src/components': 'Interface reutilizável: filtros, gráficos, tabelas, ajuda e impressão.',
  'src/modules': 'Áreas funcionais; cada módulo concentra suas próprias regras e telas.',
  'src/shared': 'Contratos e infraestrutura compartilhados entre módulos.',
  'src/shared/data': 'Filtros, datas, ordenação e contratos normalizados.',
  'src/shared/charts': 'Regras de representação e paleta de gráficos.',
  'src/shared/export': 'Exportações e contexto de impressão.',
  'src/shared/filters': 'Seleção independente por categoria e visões salvas locais.',
  'src/shared/layout': 'Personalização de página e agrupamento dos relatórios.',
  'src/shared/security': 'Sessão, autorização e cliente da API protegida.',
  'src/shared/config': 'Endereços de serviços documentais sem credenciais.',
  'scripts/architecture': 'Geração do inventário, diagramas e empacotamento do mapa protegido.',
  'src/shared/persistence':
    'Contratos de documentos, integridade e clientes das bases completas no piloto D1.',
  'src/styles': 'CSS global e refinamentos; a ordem é definida em main.jsx.',
  server: 'API Cloudflare e adaptadores privados de integrações.',
  'server/persistence':
    'Adaptador D1 de negócio usado pela agenda remota, separado do banco de usuários, e testes de contrato.',
  'server/persistence/migrations':
    'Migrações exclusivas do banco de negócio, separadas das migrações de usuários.',
  migrations: 'Migrações do banco ativo de usuários.',
  scripts: 'Ferramentas de build/verificação e serviços do laboratório local.',
  docs: 'Guias, critérios e histórico das implementações.',
  'docs/diagrams': 'Diagramas anteriores do projeto, mantidos como documentação histórica.',
  public: 'Arquivos estáticos da distribuição.',
  'public/brand': 'Marca e símbolo usados pela interface.',
  'public/fonts': 'Arquivos de fonte Inter servidos localmente.',
};

function owner(p) {
  const key = p.match(/^src\/modules\/([^/]+)/)?.[1];
  if (key) return moduleNames[key] || key;
  if (p.startsWith('server/')) return 'API Cloudflare';
  if (p.startsWith('scripts/')) return 'Ferramentas e laboratório';
  if (p.startsWith('src/app/')) return 'Shell da aplicação';
  if (p.startsWith('src/')) return 'Compartilhado';
  if (p.startsWith('docs/')) return 'Documentação';
  if (p.startsWith('public/')) return 'Identidade e assets';
  return 'Configuração e entrega';
}
function layer(p) {
  if (/\.test\./.test(p)) return 'Teste';
  if (/\.(svg|png|woff2)$/.test(p)) return 'Asset';
  if (/\.md$/.test(p)) return 'Documentação';
  if (/\.css$/.test(p)) return 'Estilo';
  if (/\.sql$/.test(p)) return 'Esquema SQL';
  if (p.startsWith('server/')) return 'Backend';
  if (p.startsWith('scripts/')) return 'Script / serviço local';
  if (p.includes('/domain/')) return 'Domínio';
  if (p.includes('/hooks/')) return 'Estado / coordenação';
  if (p.includes('/data/')) return 'Dados / transporte';
  if (p.includes('/config/')) return 'Catálogo';
  if (p.endsWith('.jsx')) return 'Interface React';
  if (p.startsWith('src/shared/')) return 'Infraestrutura compartilhada';
  return 'Configuração';
}
function comments(text) {
  return [...text.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
    .map((m) =>
      m[1]
        .replace(/^\s*\* ?/gm, '')
        .trim()
        .replace(/\s+/g, ' '),
    )
    .filter(
      (s) =>
        s.length < 550 &&
        !/Consulte docs\/ARQUITETURA|Interface de Ordens|Regras de negócio|Domínio de|Utilitários compartilhados/.test(
          s,
        ),
    );
}
function description(p, text) {
  if (descriptions[p]) return descriptions[p];
  if (byName[p]) return byName[p];
  if (byName[path.posix.basename(p)]) return byName[path.posix.basename(p)];
  if (/\.test\./.test(p)) {
    const tests = [...text.matchAll(/\b(?:test|it)\(\s*(['"`])([^'"`\r\n]+)\1/g)]
      .slice(0, 3)
      .map((m) => m[2]);
    return `Verifica ${title(path.posix.basename(p).replace(/\.test\.(js|mjs)$/, ''))} no contexto de ${owner(p)}.${tests.length ? ` Exemplos: ${tests.join('; ')}.` : ' Inclui cenários e contratos do módulo.'}`;
  }
  if (p.endsWith('.md'))
    return `Documento: ${text.match(/^#\s+(.+)$/m)?.[1] || path.posix.basename(p)}. Consulte a data/versão de cada trecho; pode registrar etapas históricas.`;
  if (p.startsWith('public/brand/'))
    return p.endsWith('symbol.svg')
      ? 'Símbolo da Addlog sem texto, usado como favicon e marca compacta.'
      : `Vetor da marca Addlog${p.includes('dark') ? ' para o tema escuro' : ' para a identidade principal'}.`;
  if (p.endsWith('.woff2'))
    return `Fonte Inter ${p.includes('ext') ? 'com caracteres latinos estendidos' : 'com caracteres latinos'}, servida sem dependência de CDN.`;
  if (p.startsWith('docs/diagrams/'))
    return 'Imagem de documentação anterior: arquitetura técnica ou leitura instrucional. O novo mapa não substitui este arquivo histórico.';
  const specific = comments(text)[0];
  if (specific) return specific;
  throw new Error(`Descrição editorial ausente: ${p}`);
}

const known = new Set(paths);
function resolveImport(from, specifier) {
  if (!specifier.startsWith('.')) return null;
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
  return (
    [
      target,
      `${target}.js`,
      `${target}.jsx`,
      `${target}.mjs`,
      `${target}/index.js`,
      `${target}/index.jsx`,
    ].find((p) => known.has(p)) || null
  );
}
const binary = /\.(png|woff2)$/;
const entries = paths.map((p) => {
  // Fotografia da cópia local, com referência explícita à base de publicação.
  const bytes = fs.readFileSync(path.join(root, p));
  const text = binary.test(p) ? '' : bytes.toString('utf8');
  const code = /\.(jsx?|mjs)$/.test(p);
  const refs = [],
    exports = [];
  // O parser distingue imports reais de palavras como 'import' em textos/permissões.
  if (code) {
    const ast = parseAst(text, { jsx: true });
    const stack = [ast];
    const addExport = (name) => {
      if (name && !exports.includes(name)) exports.push(name);
    };
    while (stack.length) {
      const n = stack.pop();
      if (!n || typeof n !== 'object') continue;
      if (
        n.type === 'ImportDeclaration' ||
        n.type === 'ExportAllDeclaration' ||
        n.type === 'ExportNamedDeclaration'
      ) {
        if (typeof n.source?.value === 'string') refs.push(n.source.value);
      }
      if (n.type === 'ImportExpression' && typeof n.source?.value === 'string')
        refs.push(n.source.value);
      if (n.type === 'ExportNamedDeclaration') {
        if (n.declaration?.id) addExport(n.declaration.id.name);
        for (const d of n.declaration?.declarations || [])
          if (d.id?.type === 'Identifier') addExport(d.id.name);
        for (const s of n.specifiers || []) addExport(s.exported.name || s.exported.value);
      }
      if (n.type === 'ExportDefaultDeclaration') addExport('default');
      for (const value of Object.values(n)) {
        if (Array.isArray(value)) stack.push(...value.filter((c) => c && typeof c === 'object'));
        else if (value && typeof value === 'object' && value.type) stack.push(value);
      }
    }
    exports.sort();
  }
  const imports = [
    ...new Set(
      refs
        .filter((p) => p.startsWith('.'))
        .map((r) => resolveImport(p, r))
        .filter(Boolean),
    ),
  ].sort();
  const unresolved = refs.filter((r) => r.startsWith('.') && !resolveImport(p, r));
  if (unresolved.length) throw new Error(`Import não resolvido em ${p}: ${unresolved}`);
  const folder = path.posix.dirname(p) === '.' ? '(raiz)' : path.posix.dirname(p);
  return {
    path: p,
    folder,
    module: owner(p),
    layer: layer(p),
    description: description(p, text),
    exports,
    imports,
    external: [...new Set(refs.filter((r) => !r.startsWith('.')))].sort(),
    importedBy: [],
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    status:
      p.startsWith('server/persistence/') || p.startsWith('src/shared/persistence/')
        ? 'Preparação / contrato'
        : p.startsWith('src/modules/assistant/') ||
            /^scripts\/(?:assistant|local-|gemini|start-)/.test(p)
          ? 'Laboratório local'
          : /^(?:server\/(?:monitoring|addlogDiagnostic)|src\/modules\/monitoring)/.test(p)
            ? 'Diagnóstico legado / consulta manual'
            : 'Código ou documentação do ponto de referência',
  };
});
const index = new Map(entries.map((e) => [e.path, e]));
for (const e of entries)
  for (const dependency of e.imports) index.get(dependency).importedBy.push(e.path);
function folderDescription(p) {
  if (folderRoles[p]) return folderRoles[p];
  const parts = p.split('/');
  if (parts[0] === 'src' && parts[1] === 'modules') {
    const m = moduleNames[parts[2]];
    if (parts.length === 3) return `Módulo ${m}: interface, regras e integração de seus dados.`;
    const roles = {
      components: 'Página e painéis visuais',
      data: 'Leitura, contratos e transporte de dados',
      domain: 'Validação e cálculo das regras de negócio',
      hooks: 'Estado, efeitos e coordenação da sessão',
      config: 'Categorias e catálogos de apresentação',
      utils: 'Formatação e utilitários',
    };
    return `${roles[parts.at(-1)] || 'Arquivos de apoio'} de ${m}.`;
  }
  return 'Arquivos da configuração raiz.';
}
const allFolders = new Set(['(raiz)']);
for (const p of paths) {
  const parts = p.split('/').slice(0, -1);
  for (let i = 1; i <= parts.length; i++) allFolders.add(parts.slice(0, i).join('/'));
}
const folders = [...allFolders].sort().map((p) => ({
  path: p,
  description: folderDescription(p),
  count: entries.filter((e) => (p === '(raiz)' ? e.folder === p : e.path.startsWith(`${p}/`)))
    .length,
}));

function svg(d) {
  const positions = new Map(d.nodes.map((n) => [n.id, n]));
  const width = 280,
    height = 100;
  const edges = d.edges
    .map((e) => {
      const a = positions.get(e.from),
        b = positions.get(e.to);
      let pts = e.points;
      if (!pts) {
        if (a.y === b.y)
          pts =
            a.x < b.x
              ? [
                  [a.x + width, a.y + 50],
                  [b.x, b.y + 50],
                ]
              : [
                  [a.x, a.y + 50],
                  [b.x + width, b.y + 50],
                ];
        else if (a.x === b.x)
          pts =
            a.y < b.y
              ? [
                  [a.x + 140, a.y + height],
                  [b.x + 140, b.y],
                ]
              : [
                  [a.x + 140, a.y],
                  [b.x + 140, b.y + height],
                ];
        else throw new Error(`Rota visual exigida: ${d.id}/${e.from}/${e.to}`);
      }
      const k = Math.floor((pts.length - 1) / 2),
        u = pts[k],
        v = pts[k + 1];
      const lx = (u[0] + v[0]) / 2,
        ly = (u[1] + v[1]) / 2;
      const horizontal = u[1] === v[1];
      const label = e.label
        ? `<text x="${lx + (horizontal ? 0 : 12)}" y="${ly - (horizontal ? 10 : 0)}" text-anchor="${horizontal ? 'middle' : 'start'}" class="edge-label">${esc(e.label)}</text>`
        : '';
      const future = e.label.includes('preparada') || e.label === 'Futuro';
      return `<path d="M${pts.map((p) => p.join(',')).join(' L')}" fill="none" stroke="#64748b" stroke-width="1.8" ${future ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#${d.id}-arrow)"/>${label}`;
    })
    .join('');
  const nodes = d.nodes
    .map((n) => {
      const c = diagramColors[n.type],
        lines = n.label.split('\n');
      return `<g><rect x="${n.x}" y="${n.y}" width="${width}" height="${height}" rx="13" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.6" ${n.type === 'future' ? 'stroke-dasharray="6 4"' : ''}/><text x="${n.x + 18}" y="${n.y + 38}" class="node-title">${esc(lines[0])}</text><text x="${n.x + 18}" y="${n.y + 65}" class="node-sub">${esc(lines[1] || '')}</text></g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.width} ${d.height}" role="img" aria-labelledby="${d.id}-title ${d.id}-desc"><title id="${d.id}-title">${esc(d.title)}</title><desc id="${d.id}-desc">${esc(d.description)} ${esc(d.note)}</desc><defs><marker id="${d.id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#64748b"/></marker><style>text{font-family:Inter,Segoe UI,Arial,sans-serif;fill:#172334}.node-title{font-size:16px;font-weight:650}.node-sub{font-size:13px;fill:#46576a}.edge-label{font-size:12px;paint-order:stroke;stroke:white;stroke-width:6px;stroke-linejoin:round}</style></defs><rect width="100%" height="100%" fill="white"/><rect x="40" y="35" width="6" height="48" rx="3" fill="#ff941f"/><text x="62" y="55" font-size="24" font-weight="700">${esc(d.title)}</text><text x="62" y="82" font-size="14" fill="#526477">${esc(d.description)}</text>${edges}${nodes}<text x="40" y="${d.height - 25}" font-size="12" fill="#526477">${esc(d.note)}</text></svg>`;
}

fs.mkdirSync(path.join(out, 'diagramas'), { recursive: true });
const canonical = {
  version: 2,
  title: `Mapa técnico Addlog ${version}`,
  description:
    'Fluxos gerais preservados; inventário atualizado a partir da cópia local em homologação.',
  diagrams: diagrams.map((d) => ({
    id: `map_${d.id}`,
    title: d.title,
    kind: 'flowchart',
    description: d.description,
    accessibility: d.note,
    data: {
      direction: 'LR',
      nodes: d.nodes.map((n) => ({
        id: n.id,
        label: n.label.replaceAll('\n', ' · '),
        class: n.type,
      })),
      edges: d.edges.map((e) => ({
        from: e.from,
        to: e.to,
        label: e.label,
        arrow: e.label.includes('preparada') ? '-.->' : '-->',
      })),
    },
    styles: Object.entries(diagramColors).map(([name, c]) => ({
      name,
      definition: `fill:${c.fill},stroke:${c.stroke},color:#172334`,
    })),
  })),
};
fs.writeFileSync(
  path.join(out, 'diagramas/canonical.json'),
  JSON.stringify(canonical, null, 2) + '\n',
);
for (const d of diagrams) {
  fs.writeFileSync(path.join(out, `diagramas/${d.id}.svg`), svg(d));
  fs.writeFileSync(
    path.join(out, `diagramas/${d.id}.json`),
    JSON.stringify(
      { ...canonical, diagrams: canonical.diagrams.filter((c) => c.id === `map_${d.id}`) },
      null,
      2,
    ) + '\n',
  );
}
const additions = [
  'docs/mapa-arquitetura/GUIA-DE-ESTUDO.md',
  'docs/mapa-arquitetura/index.html',
  'docs/mapa-arquitetura/CATALOGO-DE-ARQUIVOS.md',
  'docs/mapa-arquitetura/inventario.json',
  'docs/mapa-arquitetura/DIAGRAMAS.md',
  'docs/mapa-arquitetura/diagramas/',
  'scripts/architecture/build-map.mjs',
  'scripts/architecture/diagrams.mjs',
  'scripts/architecture/map-template.html',
];
const data = {
  version,
  base,
  date,
  total: entries.length,
  tests: entries.filter((e) => e.layer === 'Teste').length,
  folders,
  files: entries,
  additions,
  scope:
    'Arquivos versionados e novos arquivos não ignorados, lidos da cópia da entrega. Os documentos gerados deste mapa ficam separados para evitar autorreferência. Dependências, planilhas privadas e artefatos locais não são enumerados. Imports são referências literais estáticas; ausência de importador não prova desuso.',
};
fs.writeFileSync(path.join(out, 'inventario.json'), JSON.stringify(data, null, 2) + '\n');
const catalog = [
  '# Catálogo completo de arquivos',
  '',
  `Addlog ${version} · referência ${base} · ${date} · **${data.total} arquivos / ${data.tests} arquivos de teste / ${folders.length - 1} pastas**.`,
  '',
  data.scope,
  '',
  'Os imports indicam relações de módulos, não todas as chamadas de funções. Scripts, entradas, assets e configurações podem não ter importador. As exportações listadas são símbolos explícitos identificados na fonte.',
  '',
  '[Mapa interativo](index.html) · [Guia de estudo](GUIA-DE-ESTUDO.md) · [Diagramas](DIAGRAMAS.md)',
  '',
  '## Pastas',
  '',
  ...folders.map(
    (f) =>
      `- **${f.path}** — ${f.description} (${f.count} arquivos${f.path === '(raiz)' ? ' diretos' : ', incluindo subpastas'}).`,
  ),
  '',
  '## Arquivos',
  '',
];
for (const e of entries) {
  catalog.push(
    `### ${e.path}`,
    '',
    `**${e.module} · ${e.layer}** — ${e.description}`,
    '',
    `[Abrir fonte](../../${e.path}) · ${e.status}`,
    '',
  );
  if (e.exports.length)
    catalog.push(`Exporta: ${e.exports.map((x) => `\`${x}\``).join(', ')}.`, '');
  catalog.push(
    `Importa arquivos locais: ${e.imports.length ? e.imports.map((p) => `[${p}](../../${p})`).join(', ') : 'nenhum identificado'}.`,
    '',
    `Importado por: ${e.importedBy.length ? e.importedBy.map((p) => `[${p}](../../${p})`).join(', ') : 'nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação'}.`,
    '',
  );
  if (e.external.length)
    catalog.push(`Dependências externas: ${e.external.map((p) => `\`${p}\``).join(', ')}.`, '');
}
catalog.push(
  '## Arquivos desta entrega',
  '',
  'Separados da base mapeada para não alterar recursivamente a contagem:',
  '',
  ...additions.map((p) => `- \`${p}\``),
  '',
);
fs.writeFileSync(path.join(out, 'CATALOGO-DE-ARQUIVOS.md'), catalog.join('\n'));
const guide = publicStudyGuide(read('docs/mapa-arquitetura/GUIA-DE-ESTUDO.md')).replace(
  /^\*\*Addlog[^\n]+/m,
  `**Addlog · Dashboard de Suporte | versão ${version} | referência: ${base} | levantamento: ${date}**`,
);
fs.writeFileSync(path.join(out, 'GUIA-DE-ESTUDO.md'), guide);
const diagramGuide = read('docs/mapa-arquitetura/DIAGRAMAS.md')
  .replace(/^# .+/, `# Mapa técnico Addlog ${version}`)
  .replace(
    /^Fluxos gerais preservados[^\n]+/m,
    `Fluxos gerais preservados da referência anterior. Guia e catálogo descrevem a versão ${version} (${base}, ${date}). Os detalhes recentes estão no guia e no catálogo; o acesso compartilhado é um site documental independente.`,
  );
fs.writeFileSync(path.join(out, 'DIAGRAMAS.md'), diagramGuide);
const mapData = {
  ...data,
  guide,
  diagrams: diagrams.map((d) => ({ ...d, svg: svg(d) })),
};
const template = read('scripts/architecture/map-template.html');
fs.writeFileSync(path.join(out, 'index.html'), renderArchitectureMap(template, mapData));
// Este diretório é ignorado pelo Git e nunca é copiado para o site compartilhado.
const privateOut = path.join(root, 'docs/mapa-arquitetura-local');
const privateSection = path.join(privateOut, 'roteiro-apresentacao.md');
if (fs.existsSync(privateSection)) {
  const localGuide = privateStudyGuide(guide, fs.readFileSync(privateSection, 'utf8'));
  const notesFile = path.join(privateOut, 'notas-apresentacao.json');
  const notes = fs.existsSync(notesFile) ? JSON.parse(fs.readFileSync(notesFile, 'utf8')) : [];
  if (!Array.isArray(notes) || notes.some((note) => typeof note !== 'string'))
    throw Error('Notas locais incompatíveis.');
  fs.writeFileSync(
    path.join(privateOut, 'index.html'),
    renderArchitectureMap(template, { ...mapData, guide: localGuide, presentationNotes: notes }),
  );
  fs.writeFileSync(path.join(privateOut, 'GUIA-DE-ESTUDO.md'), localGuide);
  for (const name of ['CATALOGO-DE-ARQUIVOS.md', 'DIAGRAMAS.md', 'inventario.json'])
    fs.copyFileSync(path.join(out, name), path.join(privateOut, name));
  fs.cpSync(path.join(out, 'diagramas'), path.join(privateOut, 'diagramas'), { recursive: true });
}
console.log(
  JSON.stringify(
    {
      files: entries.length,
      folders: folders.length - 1,
      tests: data.tests,
      localImportEdges: entries.reduce((sum, e) => sum + e.imports.length, 0),
      diagrams: diagrams.length,
      output: out,
    },
    null,
    2,
  ),
);
