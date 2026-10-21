# Catálogo completo de arquivos

Addlog 0.49.1 · referência 7861112 · cópia da entrega · 2026-10-21 · **418 arquivos / 83 arquivos de teste / 67 pastas**.

Arquivos versionados e novos arquivos não ignorados, lidos da cópia da entrega. Os documentos gerados deste mapa ficam separados para evitar autorreferência. Dependências, planilhas privadas e artefatos locais não são enumerados. Imports são referências literais estáticas; ausência de importador não prova desuso.

Os imports indicam relações de módulos, não todas as chamadas de funções. Scripts, entradas, assets e configurações podem não ter importador. As exportações listadas são símbolos explícitos identificados na fonte.

[Mapa interativo](index.html) · [Guia de estudo](GUIA-DE-ESTUDO.md) · [Diagramas](DIAGRAMAS.md)

## Pastas

- **(raiz)** — Arquivos da configuração raiz. (13 arquivos diretos).
- **docs** — Guias, critérios e histórico das implementações. (46 arquivos, incluindo subpastas).
- **docs/diagrams** — Diagramas anteriores do projeto, mantidos como documentação histórica. (4 arquivos, incluindo subpastas).
- **migrations** — Migrações do banco ativo de usuários. (1 arquivos, incluindo subpastas).
- **public** — Arquivos estáticos da distribuição. (10 arquivos, incluindo subpastas).
- **public/brand** — Marca e símbolo usados pela interface. (6 arquivos, incluindo subpastas).
- **public/fonts** — Arquivos de fonte Inter servidos localmente. (2 arquivos, incluindo subpastas).
- **scripts** — Ferramentas de build/verificação e serviços do laboratório local. (20 arquivos, incluindo subpastas).
- **scripts/architecture** — Geração do inventário, diagramas e empacotamento do mapa protegido. (6 arquivos, incluindo subpastas).
- **server** — API Cloudflare e adaptadores privados de integrações. (17 arquivos, incluindo subpastas).
- **server/persistence** — Adaptador D1 de negócio preparado e testes; não ligado ao Worker. (3 arquivos, incluindo subpastas).
- **server/persistence/migrations** — Esquema SQL futuro de documentos de negócio. (1 arquivos, incluindo subpastas).
- **src** — Aplicação executada no navegador. (311 arquivos, incluindo subpastas).
- **src/app** — Shell, navegação, tema e bases compartilhadas da sessão. (5 arquivos, incluindo subpastas).
- **src/components** — Interface reutilizável: filtros, gráficos, tabelas, ajuda e impressão. (19 arquivos, incluindo subpastas).
- **src/modules** — Áreas funcionais; cada módulo concentra suas próprias regras e telas. (224 arquivos, incluindo subpastas).
- **src/modules/assistant** — Módulo Assistente: interface, regras e integração de seus dados. (6 arquivos, incluindo subpastas).
- **src/modules/assistant/components** — Página e painéis visuais de Assistente. (2 arquivos, incluindo subpastas).
- **src/modules/assistant/data** — Leitura, contratos e transporte de dados de Assistente. (2 arquivos, incluindo subpastas).
- **src/modules/assistant/domain** — Validação e cálculo das regras de negócio de Assistente. (2 arquivos, incluindo subpastas).
- **src/modules/consumption** — Módulo Consumo M2M: interface, regras e integração de seus dados. (42 arquivos, incluindo subpastas).
- **src/modules/consumption/components** — Página e painéis visuais de Consumo M2M. (13 arquivos, incluindo subpastas).
- **src/modules/consumption/config** — Categorias e catálogos de apresentação de Consumo M2M. (2 arquivos, incluindo subpastas).
- **src/modules/consumption/data** — Leitura, contratos e transporte de dados de Consumo M2M. (4 arquivos, incluindo subpastas).
- **src/modules/consumption/domain** — Validação e cálculo das regras de negócio de Consumo M2M. (19 arquivos, incluindo subpastas).
- **src/modules/consumption/hooks** — Estado, efeitos e coordenação da sessão de Consumo M2M. (3 arquivos, incluindo subpastas).
- **src/modules/consumption/utils** — Formatação e utilitários de Consumo M2M. (1 arquivos, incluindo subpastas).
- **src/modules/imports** — Módulo Importação: interface, regras e integração de seus dados. (3 arquivos, incluindo subpastas).
- **src/modules/imports/components** — Página e painéis visuais de Importação. (1 arquivos, incluindo subpastas).
- **src/modules/imports/domain** — Validação e cálculo das regras de negócio de Importação. (2 arquivos, incluindo subpastas).
- **src/modules/logistics** — Módulo Logística: interface, regras e integração de seus dados. (3 arquivos, incluindo subpastas).
- **src/modules/logistics/components** — Página e painéis visuais de Logística. (1 arquivos, incluindo subpastas).
- **src/modules/logistics/domain** — Validação e cálculo das regras de negócio de Logística. (2 arquivos, incluindo subpastas).
- **src/modules/monitoring** — Módulo Monitoramento Ativo: interface, regras e integração de seus dados. (19 arquivos, incluindo subpastas).
- **src/modules/monitoring/components** — Página e painéis visuais de Monitoramento Ativo. (5 arquivos, incluindo subpastas).
- **src/modules/monitoring/data** — Leitura, contratos e transporte de dados de Monitoramento Ativo. (5 arquivos, incluindo subpastas).
- **src/modules/monitoring/domain** — Validação e cálculo das regras de negócio de Monitoramento Ativo. (7 arquivos, incluindo subpastas).
- **src/modules/monitoring/hooks** — Estado, efeitos e coordenação da sessão de Monitoramento Ativo. (2 arquivos, incluindo subpastas).
- **src/modules/my-dashboard** — Módulo Meu Dashboard: interface, regras e integração de seus dados. (24 arquivos, incluindo subpastas).
- **src/modules/my-dashboard/components** — Página e painéis visuais de Meu Dashboard. (7 arquivos, incluindo subpastas).
- **src/modules/my-dashboard/data** — Leitura, contratos e transporte de dados de Meu Dashboard. (1 arquivos, incluindo subpastas).
- **src/modules/my-dashboard/domain** — Validação e cálculo das regras de negócio de Meu Dashboard. (12 arquivos, incluindo subpastas).
- **src/modules/my-dashboard/hooks** — Estado, efeitos e coordenação da sessão de Meu Dashboard. (4 arquivos, incluindo subpastas).
- **src/modules/operational** — Módulo Operacional: interface, regras e integração de seus dados. (8 arquivos, incluindo subpastas).
- **src/modules/operational/components** — Página e painéis visuais de Operacional. (1 arquivos, incluindo subpastas).
- **src/modules/operational/config** — Categorias e catálogos de apresentação de Operacional. (2 arquivos, incluindo subpastas).
- **src/modules/operational/domain** — Validação e cálculo das regras de negócio de Operacional. (5 arquivos, incluindo subpastas).
- **src/modules/orders** — Módulo Ordens de Serviço: interface, regras e integração de seus dados. (112 arquivos, incluindo subpastas).
- **src/modules/orders/components** — Página e painéis visuais de Ordens de Serviço. (43 arquivos, incluindo subpastas).
- **src/modules/orders/config** — Categorias e catálogos de apresentação de Ordens de Serviço. (4 arquivos, incluindo subpastas).
- **src/modules/orders/data** — Leitura, contratos e transporte de dados de Ordens de Serviço. (6 arquivos, incluindo subpastas).
- **src/modules/orders/domain** — Validação e cálculo das regras de negócio de Ordens de Serviço. (56 arquivos, incluindo subpastas).
- **src/modules/orders/hooks** — Estado, efeitos e coordenação da sessão de Ordens de Serviço. (3 arquivos, incluindo subpastas).
- **src/modules/park** — Módulo Parque e Manutenção: interface, regras e integração de seus dados. (6 arquivos, incluindo subpastas).
- **src/modules/park/components** — Página e painéis visuais de Parque e Manutenção. (2 arquivos, incluindo subpastas).
- **src/modules/park/domain** — Validação e cálculo das regras de negócio de Parque e Manutenção. (4 arquivos, incluindo subpastas).
- **src/modules/users** — Módulo Usuários: interface, regras e integração de seus dados. (1 arquivos, incluindo subpastas).
- **src/modules/users/components** — Página e painéis visuais de Usuários. (1 arquivos, incluindo subpastas).
- **src/shared** — Contratos e infraestrutura compartilhados entre módulos. (41 arquivos, incluindo subpastas).
- **src/shared/charts** — Regras de representação e paleta de gráficos. (3 arquivos, incluindo subpastas).
- **src/shared/config** — Endereços de serviços documentais sem credenciais. (1 arquivos, incluindo subpastas).
- **src/shared/data** — Filtros, datas, ordenação e contratos normalizados. (13 arquivos, incluindo subpastas).
- **src/shared/export** — Exportações e contexto de impressão. (5 arquivos, incluindo subpastas).
- **src/shared/filters** — Seleção independente por categoria e visões salvas locais. (7 arquivos, incluindo subpastas).
- **src/shared/layout** — Personalização de página e agrupamento dos relatórios. (5 arquivos, incluindo subpastas).
- **src/shared/persistence** — Contratos de documentos versionados e adaptadores de referência; preparação de evolução. (3 arquivos, incluindo subpastas).
- **src/shared/security** — Sessão, autorização e cliente da API protegida. (4 arquivos, incluindo subpastas).
- **src/styles** — CSS global e refinamentos; a ordem é definida em main.jsx. (21 arquivos, incluindo subpastas).

## Arquivos

### .editorconfig

**Configuração e entrega · Configuração** — Padroniza indentação, codificação e finais de linha entre editores.

[Abrir fonte](../../.editorconfig) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### .gitignore

**Configuração e entrega · Configuração** — Exclui dependências, planilhas privadas, segredos e artefatos do versionamento.

[Abrir fonte](../../.gitignore) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### .node-version

**Configuração e entrega · Configuração** — Declara a versão de Node usada pelo projeto.

[Abrir fonte](../../.node-version) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### .prettierignore

**Configuração e entrega · Configuração** — Define exclusões da verificação automática de formatação.

[Abrir fonte](../../.prettierignore) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### .prettierrc.json

**Configuração e entrega · Configuração** — Configura o padrão de formatação Prettier.

[Abrir fonte](../../.prettierrc.json) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### CHANGELOG.md

**Configuração e entrega · Documentação** — Histórico de entregas por versão; não representa sozinho o estado de serviços externos.

[Abrir fonte](../../CHANGELOG.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### README.md

**Configuração e entrega · Documentação** — Porta de entrada: uso, desenvolvimento, verificações e documentação do projeto.

[Abrir fonte](../../README.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/AGRUPAMENTO-DE-CLIENTES.md

**Documentação · Documentação** — Documento: Clientes consolidados e filiais. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/AGRUPAMENTO-DE-CLIENTES.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/ANALISES-DE-OS.md

**Documentação · Documentação** — Documento: Análises de ordens de serviço — 0.11.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/ANALISES-DE-OS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/APROFUNDAMENTO-DO-PARQUE.md

**Documentação · Documentação** — Documento: Histórico individual e concentração do parque — 0.28.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/APROFUNDAMENTO-DO-PARQUE.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/ARQUITETURA.md

**Documentação · Documentação** — Documento: Arquitetura e organização do código. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/ARQUITETURA.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/AUTOMACAO-N8N-E-MCP.md

**Documentação · Documentação** — Documento: Automação com n8n e proposta de MCP. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/AUTOMACAO-N8N-E-MCP.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/CARDS-DE-OS.md

**Documentação · Documentação** — Documento: Cards da visão geral de OS. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/CARDS-DE-OS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/CONSUMO-DE-LINHAS.md

**Documentação · Documentação** — Documento: Linhas — Controle de Consumo. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/CONSUMO-DE-LINHAS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/CORRECOES-DA-ANALISE-CRITICA.md

**Documentação · Documentação** — Documento: Correções da análise crítica — 0.20.6. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/CORRECOES-DA-ANALISE-CRITICA.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/CRITERIOS-DE-MANUTENCAO-E-IDENTIFICACAO.md

**Documentação · Documentação** — Documento: Manutenção, clientes e modelos — 0.29.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/CRITERIOS-DE-MANUTENCAO-E-IDENTIFICACAO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/DESEMPENHO-E-CARREGAMENTO.md

**Documentação · Documentação** — Documento: Desempenho e carregamento — 0.20.8. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/DESEMPENHO-E-CARREGAMENTO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/DIAGRAMAS-DO-SISTEMA.md

**Documentação · Documentação** — Documento: Diagramas do sistema e guia de leitura. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/DIAGRAMAS-DO-SISTEMA.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/EQUIPE-DE-SUPORTE.md

**Documentação · Documentação** — Documento: Equipe de suporte. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/EQUIPE-DE-SUPORTE.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/FILTROS-E-APRESENTACAO.md

**Documentação · Documentação** — Documento: Filtros e apresentação. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/FILTROS-E-APRESENTACAO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/FILTROS-POR-CATEGORIA.md

**Documentação · Documentação** — Documento: Filtros independentes por categoria. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/FILTROS-POR-CATEGORIA.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/GOOGLE-SHEETS.md

**Documentação · Documentação** — Documento: Google Sheets — piloto de ordens de serviço. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/GOOGLE-SHEETS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/GUIA-E-MANUTENCAO.md

**Documentação · Documentação** — Documento: Guia de uso e manutenção. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/GUIA-E-MANUTENCAO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/HOSPEDAGEM.md

**Documentação · Documentação** — Documento: Publicação no Cloudflare e controle de acesso. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/HOSPEDAGEM.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/IMPORTACAO.md

**Documentação · Documentação** — Documento: Importação e navegação. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/IMPORTACAO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/INTEGRACAO-MONITORAMENTO.md

**Documentação · Documentação** — Documento: Preparação da integração do Monitoramento Ativo. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/INTEGRACAO-MONITORAMENTO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/INTEGRACAO-OPERADORAS.md

**Documentação · Documentação** — Documento: Integrações de consumo — KORE e Arqia. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/INTEGRACAO-OPERADORAS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/INTEGRACAO-ZOHO-DESK.md

**Documentação · Documentação** — Documento: Zoho Desk na Equipe de suporte — escopo aprovado. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/INTEGRACAO-ZOHO-DESK.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/LOGISTICA-DE-EQUIPAMENTOS.md

**Documentação · Documentação** — Documento: Logística de equipamentos — 0.18.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/LOGISTICA-DE-EQUIPAMENTOS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/MAPA-COMPARTILHADO.md

**Documentação · Documentação** — Documento: Compartilhamento do mapa de arquitetura. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/MAPA-COMPARTILHADO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/MAPA-DE-ATIVIDADES-DO-SUPORTE.md

**Documentação · Documentação** — Documento: Mapa de atividades da Equipe de suporte. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/MAPA-DE-ATIVIDADES-DO-SUPORTE.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/MEU-DASHBOARD.md

**Documentação · Documentação** — Documento: Meu Dashboard. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/MEU-DASHBOARD.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/MONITORAMENTO-DE-FROTA.md

**Documentação · Documentação** — Documento: Monitoramento Ativo — em preparação. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/MONITORAMENTO-DE-FROTA.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/OPERACIONAL.md

**Documentação · Documentação** — Documento: Operacional — importação, revisão e cobertura histórica. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/OPERACIONAL.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/ORGANIZACAO-DAS-ANALISES.md

**Documentação · Documentação** — Documento: Organização das análises — 0.27.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/ORGANIZACAO-DAS-ANALISES.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/PARQUE-E-MANUTENCAO.md

**Documentação · Documentação** — Documento: Manutenção do parque e relatórios — 0.14.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/PARQUE-E-MANUTENCAO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/PERSONALIZACAO-DE-PAGINAS.md

**Documentação · Documentação** — Documento: Personalização das páginas. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/PERSONALIZACAO-DE-PAGINAS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/PREPARACAO-BANCO-DE-DADOS.md

**Documentação · Documentação** — Documento: Preparação para banco de dados — 0.39.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/PREPARACAO-BANCO-DE-DADOS.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/PREPARACAO-FONTES-DE-CONSUMO.md

**Documentação · Documentação** — Documento: Preparação para CSV e APIs de consumo — 0.28.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/PREPARACAO-FONTES-DE-CONSUMO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/PRODUTO.md

**Documentação · Documentação** — Documento: Suporte Controller — produto e regras de negócio. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/PRODUTO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/PROXIMOS-AJUSTES.md

**Documentação · Documentação** — Documento: Fila de implementação e ajustes. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/PROXIMOS-AJUSTES.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/REFINAMENTO-VISUAL.md

**Documentação · Documentação** — Documento: Refinamento visual. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/REFINAMENTO-VISUAL.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/RELATORIO-DESCRITIVO.md

**Documentação · Documentação** — Documento: Relatório descritivo — 0.12.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/RELATORIO-DESCRITIVO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/REVISAO-E-ANALISES-LIVRES.md

**Documentação · Documentação** — Documento: Revisão e análises personalizadas — 0.48.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/REVISAO-E-ANALISES-LIVRES.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/REVISAO-E-REFATORACAO.md

**Documentação · Documentação** — Documento: Revisão técnica e refatoração gradual. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/REVISAO-E-REFATORACAO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/USUARIOS-E-PERMISSOES.md

**Documentação · Documentação** — Documento: Usuários e permissões. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/USUARIOS-E-PERMISSOES.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/VERSIONAMENTO.md

**Documentação · Documentação** — Documento: Versionamento e uso em outros computadores. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/VERSIONAMENTO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/VIDA-EM-CAMPO.md

**Documentação · Documentação** — Documento: Vida em campo até primeira troca. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/VIDA-EM-CAMPO.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/VISOES-E-DESTAQUES.md

**Documentação · Documentação** — Documento: Visões favoritas e destaques — 0.42.0. Consulte a data/versão de cada trecho; pode registrar etapas históricas.

[Abrir fonte](../../docs/VISOES-E-DESTAQUES.md) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/diagrams/addlog-arquitetura-tecnica-swimlane.png

**Documentação · Asset** — Imagem de documentação anterior: arquitetura técnica ou leitura instrucional. O novo mapa não substitui este arquivo histórico.

[Abrir fonte](../../docs/diagrams/addlog-arquitetura-tecnica-swimlane.png) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/diagrams/addlog-arquitetura-tecnica-swimlane.svg

**Documentação · Asset** — Imagem de documentação anterior: arquitetura técnica ou leitura instrucional. O novo mapa não substitui este arquivo histórico.

[Abrir fonte](../../docs/diagrams/addlog-arquitetura-tecnica-swimlane.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/diagrams/addlog-leitura-instrucional-flowchart.png

**Documentação · Asset** — Imagem de documentação anterior: arquitetura técnica ou leitura instrucional. O novo mapa não substitui este arquivo histórico.

[Abrir fonte](../../docs/diagrams/addlog-leitura-instrucional-flowchart.png) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### docs/diagrams/addlog-leitura-instrucional-flowchart.svg

**Documentação · Asset** — Imagem de documentação anterior: arquitetura técnica ou leitura instrucional. O novo mapa não substitui este arquivo histórico.

[Abrir fonte](../../docs/diagrams/addlog-leitura-instrucional-flowchart.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### index.html

**Configuração e entrega · Configuração** — Documento inicial do navegador, metadados, favicon e ponto de montagem React.

[Abrir fonte](../../index.html) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### migrations/0001_users.sql

**Configuração e entrega · Esquema SQL** — Migração SQL do cadastro de usuários e suas permissões; corresponde ao D1 ativo de acesso.

[Abrir fonte](../../migrations/0001_users.sql) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### package-lock.json

**Configuração e entrega · Configuração** — Fixa a árvore de dependências para instalações reproduzíveis.

[Abrir fonte](../../package-lock.json) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### package.json

**Configuração e entrega · Configuração** — Versão do produto, bibliotecas e comandos de desenvolvimento, verificação e build.

[Abrir fonte](../../package.json) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/_headers

**Identidade e assets · Configuração** — Cabeçalhos HTTP dos arquivos estáticos, incluindo políticas de segurança.

[Abrir fonte](../../public/_headers) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/brand/addlog-dark.svg

**Identidade e assets · Asset** — Vetor da marca Addlog para o tema escuro.

[Abrir fonte](../../public/brand/addlog-dark.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/brand/addlog-symbol-white.svg

**Identidade e assets · Asset** — Vetor da marca Addlog para a identidade principal.

[Abrir fonte](../../public/brand/addlog-symbol-white.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/brand/addlog-symbol.svg

**Identidade e assets · Asset** — Símbolo da Addlog sem texto, usado como favicon e marca compacta.

[Abrir fonte](../../public/brand/addlog-symbol.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/brand/addlog-white.svg

**Identidade e assets · Asset** — Vetor da marca Addlog para a identidade principal.

[Abrir fonte](../../public/brand/addlog-white.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/brand/addlog.svg

**Identidade e assets · Asset** — Vetor da marca Addlog para a identidade principal.

[Abrir fonte](../../public/brand/addlog.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/brand/favicon.svg

**Identidade e assets · Asset** — Vetor da marca Addlog para a identidade principal.

[Abrir fonte](../../public/brand/favicon.svg) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/fonts/inter-latin-ext.woff2

**Identidade e assets · Asset** — Fonte Inter com caracteres latinos estendidos, servida sem dependência de CDN.

[Abrir fonte](../../public/fonts/inter-latin-ext.woff2) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/fonts/inter-latin.woff2

**Identidade e assets · Asset** — Fonte Inter com caracteres latinos, servida sem dependência de CDN.

[Abrir fonte](../../public/fonts/inter-latin.woff2) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### public/robots.txt

**Identidade e assets · Configuração** — Instruções a mecanismos de busca para a aplicação.

[Abrir fonte](../../public/robots.txt) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### scripts/architecture/build-map.mjs

**Ferramentas e laboratório · Script / serviço local** — Gera um mapa documental reproduzível; não modifica fontes, planilhas ou configurações de execução.

[Abrir fonte](../../scripts/architecture/build-map.mjs) · Código ou documentação do ponto de referência

Importa arquivos locais: [scripts/architecture/diagrams.mjs](../../scripts/architecture/diagrams.mjs), [scripts/architecture/presentationPrivacy.mjs](../../scripts/architecture/presentationPrivacy.mjs).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:child_process`, `node:crypto`, `node:fs`, `node:path`, `node:url`, `rollup/parseAst`.

### scripts/architecture/diagrams.mjs

**Ferramentas e laboratório · Script / serviço local** — Define os grafos editoriais dos diagramas e suas evidências no código.

[Abrir fonte](../../scripts/architecture/diagrams.mjs) · Código ou documentação do ponto de referência

Exporta: `diagramColors`, `diagrams`.

Importa arquivos locais: nenhum identificado.

Importado por: [scripts/architecture/build-map.mjs](../../scripts/architecture/build-map.mjs).

### scripts/architecture/map-template.html

**Ferramentas e laboratório · Script / serviço local** — Template autocontido do mapa interativo, com navegação, catálogo, diagramas e apresentação.

[Abrir fonte](../../scripts/architecture/map-template.html) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### scripts/architecture/package-site.mjs

**Ferramentas e laboratório · Script / serviço local** — Empacota somente os documentos do mapa, separados do aplicativo e de suas credenciais.

[Abrir fonte](../../scripts/architecture/package-site.mjs) · Código ou documentação do ponto de referência

Importa arquivos locais: [scripts/architecture/presentationPrivacy.mjs](../../scripts/architecture/presentationPrivacy.mjs).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:fs`, `node:path`, `node:url`.

### scripts/architecture/presentationPrivacy.mjs

**Ferramentas e laboratório · Script / serviço local** — Mantém o roteiro do proprietário fora dos documentos compartilháveis e dos downloads.

[Abrir fonte](../../scripts/architecture/presentationPrivacy.mjs) · Código ou documentação do ponto de referência

Exporta: `assertPublicArchitectureMap`, `privateStudyGuide`, `publicStudyGuide`, `renderArchitectureMap`.

Importa arquivos locais: nenhum identificado.

Importado por: [scripts/architecture/build-map.mjs](../../scripts/architecture/build-map.mjs), [scripts/architecture/package-site.mjs](../../scripts/architecture/package-site.mjs), [scripts/architecture/presentationPrivacy.test.mjs](../../scripts/architecture/presentationPrivacy.test.mjs).

### scripts/architecture/presentationPrivacy.test.mjs

**Ferramentas e laboratório · Teste** — Verifica presentation Privacy no contexto de Ferramentas e laboratório. Exemplos: remove integralmente roteiro e subseções, preservando o restante do guia; reconstrói roteiro somente na cópia local, sem duplicar ou alterar a versão pública; HTML compartilhável e inventário não carregam notas privadas; cópia local recebe conteúdo separado.

[Abrir fonte](../../scripts/architecture/presentationPrivacy.test.mjs) · Código ou documentação do ponto de referência

Importa arquivos locais: [scripts/architecture/presentationPrivacy.mjs](../../scripts/architecture/presentationPrivacy.mjs).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### scripts/assistant-agent-workflow.mjs

**Ferramentas e laboratório · Script / serviço local** — Agente com ferramentas restritas. Pergunta chega por contexto efêmero autenticado no loopback.

[Abrir fonte](../../scripts/assistant-agent-workflow.mjs) · Laboratório local

Exporta: `assistantAgentWorkflow`, `assistantSystemPrompt`, `demoQueryDescription`.

Importa arquivos locais: [scripts/gemini-demo-workflow.mjs](../../scripts/gemini-demo-workflow.mjs).

Importado por: [scripts/local-assistant.test.mjs](../../scripts/local-assistant.test.mjs).

### scripts/assistant-demo-queries.mjs

**Ferramentas e laboratório · Script / serviço local** — Consultas determinísticas somente às amostras aprovadas. O modelo não executa código nem SQL.

[Abrir fonte](../../scripts/assistant-demo-queries.mjs) · Laboratório local

Exporta: `createDemoQueries`, `validateDemoQuery`.

Importa arquivos locais: [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [scripts/assistant-demo-queries.test.mjs](../../scripts/assistant-demo-queries.test.mjs), [scripts/local-assistant.mjs](../../scripts/local-assistant.mjs).

### scripts/assistant-demo-queries.test.mjs

**Ferramentas e laboratório · Teste** — Verifica assistant demo queries no contexto de Ferramentas e laboratório. Exemplos: consultas ampliadas recusam perfil real, fontes misturadas e parâmetros fora do contrato; semana anterior filtra data e responsável, mantém custo improdutivo e deduplica chamados; consolidação reúne filiais, datas ausentes só entram no total e filtro desconhecido não é ignorado.

[Abrir fonte](../../scripts/assistant-demo-queries.test.mjs) · Laboratório local

Importa arquivos locais: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### scripts/assistant-live-workflow.mjs

**Ferramentas e laboratório · Script / serviço local** — Fluxo fixo de leitura. Perguntas e caminhos do navegador nunca viram comandos ou prompts livres.

[Abrir fonte](../../scripts/assistant-live-workflow.mjs) · Laboratório local

Exporta: `assistantLiveWorkflow`.

Importa arquivos locais: [scripts/gemini-demo-workflow.mjs](../../scripts/gemini-demo-workflow.mjs).

Importado por: [scripts/local-assistant.test.mjs](../../scripts/local-assistant.test.mjs).

### scripts/bundle-report.mjs

**Ferramentas e laboratório · Script / serviço local** — Mede o código de entrada e das OS pelo manifesto, sem contar importações tardias como download inicial.

[Abrir fonte](../../scripts/bundle-report.mjs) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:fs`, `node:path`, `node:zlib`.

### scripts/check-imports.mjs

**Ferramentas e laboratório · Script / serviço local** — Confere os caminhos locais após mudanças de estrutura. Não executa o aplicativo nem acessa arquivos das planilhas. O build continua sendo necessário para validar exports, JSX e dependências externas.

[Abrir fonte](../../scripts/check-imports.mjs) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:fs`, `node:path`.

### scripts/gemini-demo-workflow.mjs

**Ferramentas e laboratório · Script / serviço local** — Fluxo manual de homologação: somente números fictícios, sem acesso a arquivos ou ferramentas.

[Abrir fonte](../../scripts/gemini-demo-workflow.mjs) · Laboratório local

Exporta: `geminiDemoWorkflow`.

Importa arquivos locais: nenhum identificado.

Importado por: [scripts/assistant-agent-workflow.mjs](../../scripts/assistant-agent-workflow.mjs), [scripts/assistant-live-workflow.mjs](../../scripts/assistant-live-workflow.mjs).

### scripts/local-acervo.mjs

**Ferramentas e laboratório · Script / serviço local** — Laboratório local de leitura: fontes explícitas, sem escrita e mesmas regras do painel.

[Abrir fonte](../../scripts/local-acervo.mjs) · Laboratório local

Exporta: `archiveProfile`, `archiveRoot`, `archiveServer`, `assistantPayload`, `attendanceQuery`, `readArchive`.

Importa arquivos locais: [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [scripts/assistant-demo-queries.test.mjs](../../scripts/assistant-demo-queries.test.mjs), [scripts/local-acervo.test.mjs](../../scripts/local-acervo.test.mjs), [scripts/local-assistant.mjs](../../scripts/local-assistant.mjs), [scripts/local-assistant.test.mjs](../../scripts/local-assistant.test.mjs).

Dependências externas: `node:crypto`, `node:fs/promises`, `node:http`, `node:path`, `node:url`.

### scripts/local-acervo.test.mjs

**Ferramentas e laboratório · Teste** — Verifica local acervo no contexto de Ferramentas e laboratório. Exemplos: consulta preserva chamados distintos, improdutivas e datas ausentes; ignora agendamentos futuros; serviço bloqueia chamadas sem token e rotas não autorizadas.

[Abrir fonte](../../scripts/local-acervo.test.mjs) · Laboratório local

Importa arquivos locais: [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### scripts/local-assistant.mjs

**Ferramentas e laboratório · Script / serviço local** — Ponte do piloto: loopback, origem fixa, JWT Access verificado e proprietário fixo. Sem tokens em logs.

[Abrir fonte](../../scripts/local-assistant.mjs) · Laboratório local

Exporta: `assistantFailure`, `assistantOrigin`, `createAssistantSession`, `extractExecution`, `localAssistantServer`, `parseAssistantExecution`, `readAssistantSnapshot`, `runLocalAssistant`, `validateQuestion`, `verifyLocalSession`.

Importa arquivos locais: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs).

Importado por: [scripts/local-assistant.test.mjs](../../scripts/local-assistant.test.mjs).

Dependências externas: `jose`, `node:child_process`, `node:crypto`, `node:fs/promises`, `node:http`, `node:path`, `node:url`, `node:util`.

### scripts/local-assistant.test.mjs

**Ferramentas e laboratório · Teste** — Verifica local assistant no contexto de Ferramentas e laboratório. Exemplos: ponte verifica assinatura, audiência, expiração e proprietário; ponte bloqueia origem externa, ausência de sessão e parâmetros; não chama IA nessas falhas; erro descarta contexto e duas perguntas simultâneas não compartilham sessão.

[Abrir fonte](../../scripts/local-assistant.test.mjs) · Laboratório local

Importa arquivos locais: [scripts/assistant-agent-workflow.mjs](../../scripts/assistant-agent-workflow.mjs), [scripts/assistant-live-workflow.mjs](../../scripts/assistant-live-workflow.mjs), [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs), [scripts/local-assistant.mjs](../../scripts/local-assistant.mjs).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `jose`, `node:assert/strict`, `node:test`.

### scripts/setup-zoho.ps1

**Ferramentas e laboratório · Script / serviço local** — Assistente operacional local para configurar a integração Zoho; não é parte do bundle do navegador.

[Abrir fonte](../../scripts/setup-zoho.ps1) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### scripts/start-assistant-lab.ps1

**Ferramentas e laboratório · Script / serviço local** — Inicializa os serviços locais necessários ao laboratório do assistente.

[Abrir fonte](../../scripts/start-assistant-lab.ps1) · Laboratório local

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### scripts/start-local-acervo.ps1

**Ferramentas e laboratório · Script / serviço local** — Inicializa a leitura HTTP local do acervo autorizado.

[Abrir fonte](../../scripts/start-local-acervo.ps1) · Laboratório local

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### server/architectureMap.js

**API Cloudflare · Backend** — Site documental independente: senha compartilhada, sessão curta e nenhum binding de dados do sistema.

[Abrir fonte](../../server/architectureMap.js) · Código ou documentação do ponto de referência

Exporta: `createArchitectureHandler`, `default`.

Importa arquivos locais: nenhum identificado.

Importado por: [server/architectureMap.test.js](../../server/architectureMap.test.js).

Dependências externas: `jose`.

### server/architectureMap.test.js

**API Cloudflare · Teste** — Verifica architecture Map no contexto de API Cloudflare. Exemplos: nenhum documento ou diagrama é servido antes da senha, inclusive acesso direto; senha correta cria cookie curto, seguro e limitado a este site; armazenamento não recebe credenciais; assinatura, audiência, cookies duplicados e rotação da senha invalidam a sessão.

[Abrir fonte](../../server/architectureMap.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [server/architectureMap.js](../../server/architectureMap.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:fs`, `node:test`.

### server/googleOrders.js

**API Cloudflare · Backend** — Leitura privada do Google Sheets. As credenciais ficam no Worker; nenhum conteúdo é gravado no D1.

[Abrir fonte](../../server/googleOrders.js) · Código ou documentação do ponto de referência

Exporta: `googleOrdersConfig`, `googleOrdersResponse`, `readGoogleOrders`.

Importa arquivos locais: [src/shared/data/googleOrdersSnapshot.js](../../src/shared/data/googleOrdersSnapshot.js).

Importado por: [server/googleOrders.test.js](../../server/googleOrders.test.js), [server/worker.js](../../server/worker.js).

Dependências externas: `jose`.

### server/googleOrders.test.js

**API Cloudflare · Teste** — Verifica google Orders no contexto de API Cloudflare. Exemplos: diagnóstico distingue chave, autenticação, acesso e formato sem expor respostas privadas; assina JWT somente leitura e consulta apenas aba fixa; não devolve token/chave/comentários; falha, aba incorreta e limite de corpo impedem substituição parcial e vazamento de erro.

[Abrir fonte](../../server/googleOrders.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [server/googleOrders.js](../../server/googleOrders.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `jose`, `node:assert/strict`, `node:test`.

### server/monitoring.js

**API Cloudflare · Backend** — Normaliza e classifica o retrato, tempos offline, tensão, ordenação e tratamento administrativo sem inferir recuperação.

[Abrir fonte](../../server/monitoring.js) · Interface pronta / coletor pendente

Exporta: `monitoringResponse`.

Importa arquivos locais: [src/modules/monitoring/data/snapshotContract.js](../../src/modules/monitoring/data/snapshotContract.js).

Importado por: [server/worker.js](../../server/worker.js).

### server/persistence/d1DocumentAdapter.js

**API Cloudflare · Backend** — Adaptador SQL preparado, sem binding, rota ou inicialização automática no Worker.

[Abrir fonte](../../server/persistence/d1DocumentAdapter.js) · Preparação / contrato

Exporta: `createD1DocumentAdapter`.

Importa arquivos locais: nenhum identificado.

Importado por: [server/persistence/documentRepository.test.js](../../server/persistence/documentRepository.test.js).

### server/persistence/documentRepository.test.js

**API Cloudflare · Teste** — Verifica document Repository no contexto de API Cloudflare. Exemplos: ${name}: mantém originais, IDs textuais, ordem e cópias independentes; ${name}: exige revisão e impede perda de dados em gravações concorrentes; ${name}: isola espaços e módulos, sem interpretar nomes como chaves.

[Abrir fonte](../../server/persistence/documentRepository.test.js) · Preparação / contrato

Importa arquivos locais: [server/persistence/d1DocumentAdapter.js](../../server/persistence/d1DocumentAdapter.js), [src/shared/persistence/documentRepository.js](../../src/shared/persistence/documentRepository.js), [src/shared/persistence/documentValueAdapter.js](../../src/shared/persistence/documentValueAdapter.js), [src/shared/persistence/memoryDocumentAdapter.js](../../src/shared/persistence/memoryDocumentAdapter.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:fs`, `node:sqlite`, `node:test`.

### server/persistence/migrations/0001_business_documents.sql

**API Cloudflare · Esquema SQL** — Esquema futuro de documentos de negócio, separado do banco de usuários; não ativado automaticamente.

[Abrir fonte](../../server/persistence/migrations/0001_business_documents.sql) · Preparação / contrato

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### server/schema.js

**API Cloudflare · Backend** — Esquema inicial espelhado de migrations/0001_users.sql; manter ambos em sincronia.

[Abrir fonte](../../server/schema.js) · Código ou documentação do ponto de referência

Exporta: `usersSchema`.

Importa arquivos locais: nenhum identificado.

Importado por: [server/worker.js](../../server/worker.js).

### server/worker.js

**API Cloudflare · Backend** — API de usuários do Worker. Autentica a identidade e autoriza cada operação no servidor. Arquivos manuais continuam locais; o piloto Google consulta uma aba privada somente para administradores. A porta de telemetria usa serviço privado, sem coletor configurado nem armazenamento de frota nesta entrega.

[Abrir fonte](../../server/worker.js) · Código ou documentação do ponto de referência

Exporta: `authenticatedEmail`, `createHandler`, `default`, `recordUser`.

Importa arquivos locais: [server/googleOrders.js](../../server/googleOrders.js), [server/monitoring.js](../../server/monitoring.js), [server/schema.js](../../server/schema.js), [server/zoho.js](../../server/zoho.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [server/worker.test.js](../../server/worker.test.js).

Dependências externas: `jose`.

### server/worker.test.js

**API Cloudflare · Teste** — Verifica worker no contexto de API Cloudflare. Exemplos: sessão do Assistente local exige proprietário ativo, POST e mesma origem; Google Sheets exige sessão ativa e administrador mesmo para consultar configuração; piloto Zoho exige proprietário ativo autenticado; nem outros administradores recebem dados.

[Abrir fonte](../../server/worker.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [server/worker.js](../../server/worker.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `jose`, `node:assert/strict`, `node:sqlite`, `node:test`.

### server/zoho.js

**API Cloudflare · Backend** — Piloto Zoho somente leitura. Segredos e tokens permanecem no Worker.

[Abrir fonte](../../server/zoho.js) · Código ou documentação do ponto de referência

Exporta: `createZohoReader`, `zohoConfigured`, `zohoResponse`.

Importa arquivos locais: [server/zohoActivity.js](../../server/zohoActivity.js).

Importado por: [server/worker.js](../../server/worker.js), [server/zoho.test.js](../../server/zoho.test.js).

### server/zoho.test.js

**API Cloudflare · Teste** — Verifica zoho no contexto de API Cloudflare. Exemplos: consulta destinos fixos, devolve apenas campos necessários e reutiliza o token até expirar; agentes são paginados e cobertura é parcial ao atingir o limite; chamados nunca viram totais históricos; IDs numéricos seguros e textuais preservam identidade; números imprecisos e organizações diferentes são recusados.

[Abrir fonte](../../server/zoho.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [server/zoho.js](../../server/zoho.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### server/zohoActivity.js

**API Cloudflare · Backend** — Coleta páginas de atividade Zoho com limites, normaliza apontamentos/respostas e preserva autoria e pendências.

[Abrir fonte](../../server/zohoActivity.js) · Código ou documentação do ponto de referência

Exporta: `ZohoActivityError`, `activityParameters`, `collectZohoActivityBatch`.

Importa arquivos locais: [server/zohoClosures.js](../../server/zohoClosures.js), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: [server/zoho.js](../../server/zoho.js), [server/zohoActivity.test.js](../../server/zohoActivity.test.js), [server/zohoClosures.test.js](../../server/zohoClosures.test.js).

### server/zohoActivity.test.js

**API Cloudflare · Teste** — Verifica zoho Activity no contexto de API Cloudflare. Exemplos: datas em Brasília e duração usam execução, proprietário e segundos explícitos, sem inferir pelo criador; respostas exigem autoria, envio público e revisão explícita para automação/data ausentes; equipe contém somente Eduardo/Jean; deduplica respostas e chamados compartilhados e calcula média pelo denominador correto.

[Abrir fonte](../../server/zohoActivity.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [server/zohoActivity.js](../../server/zohoActivity.js), [src/modules/orders/data/zohoActivityClient.js](../../src/modules/orders/data/zohoActivityClient.js), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### server/zohoClosures.js

**API Cloudflare · Backend** — Só transições para a categoria Closed configurada no departamento; nunca infere pelo rótulo.

[Abrir fonte](../../server/zohoClosures.js) · Código ou documentação do ponto de referência

Exporta: `closureFromHistory`, `closureReader`.

Importa arquivos locais: [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: [server/zohoActivity.js](../../server/zohoActivity.js), [server/zohoClosures.test.js](../../server/zohoClosures.test.js).

### server/zohoClosures.test.js

**API Cloudflare · Teste** — Verifica zoho Closures no contexto de API Cloudflare. Exemplos: fechamento usa executor, categoria configurada e data de Brasília, incluindo reabertura posterior; paginação, status ambíguos, histórico incompleto e duplicado não viram contagens de zero; maior participação inclui outros agentes, tempo anterior ao período e empates; datas futuras não entram.

[Abrir fonte](../../server/zohoClosures.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [server/zohoActivity.js](../../server/zohoActivity.js), [server/zohoClosures.js](../../server/zohoClosures.js), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/app/DeferredPage.jsx

**Shell da aplicação · Interface React** — Carrega uma página na primeira visita e mantém sua instância durante a navegação autorizada.

[Abrir fonte](../../src/app/DeferredPage.jsx) · Código ou documentação do ponto de referência

Exporta: `DeferredPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/app/Navigation.jsx

**Shell da aplicação · Interface React** — Exibe somente as páginas autorizadas e mantém expansão, recolhimento e ferramentas da página ativa.

[Abrir fonte](../../src/app/Navigation.jsx) · Código ou documentação do ponto de referência

Exporta: `Navigation`.

Importa arquivos locais: [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/app/Theme.jsx](../../src/app/Theme.jsx), [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/modules/assistant/domain/previewAccess.js](../../src/modules/assistant/domain/previewAccess.js), [src/shared/config/architectureMap.js](../../src/shared/config/architectureMap.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/DeferredPage.jsx](../../src/app/DeferredPage.jsx), [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/users/components/UsersPage.jsx](../../src/modules/users/components/UsersPage.jsx).

Dependências externas: `react`.

### src/app/SidePanel.jsx

**Shell da aplicação · Interface React** — Compartilha o destino dos controles específicos de cada página na barra lateral.

[Abrir fonte](../../src/app/SidePanel.jsx) · Código ou documentação do ponto de referência

Exporta: `SidePanelProvider`, `SidePanelTarget`, `SidebarContent`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/app/DeferredPage.jsx](../../src/app/DeferredPage.jsx), [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/components/OrdersReportMenu.jsx](../../src/modules/orders/components/OrdersReportMenu.jsx), [src/modules/users/components/UsersPage.jsx](../../src/modules/users/components/UsersPage.jsx).

Dependências externas: `react`, `react-dom`.

### src/app/Theme.jsx

**Shell da aplicação · Interface React** — Aplica o tema salvo neste navegador e fornece a alternância para todo o aplicativo.

[Abrir fonte](../../src/app/Theme.jsx) · Código ou documentação do ponto de referência

Exporta: `ThemeProvider`, `ThemeToggle`, `useTheme`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/main.jsx](../../src/main.jsx).

Dependências externas: `react`.

### src/app/Workspace.jsx

**Shell da aplicação · Interface React** — Mantém as bases da sessão e coordena páginas autorizadas e importações conjuntas.

[Abrir fonte](../../src/app/Workspace.jsx) · Código ou documentação do ponto de referência

Exporta: `Workspace`.

Importa arquivos locais: [src/app/DeferredPage.jsx](../../src/app/DeferredPage.jsx), [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx), [src/modules/assistant/domain/previewAccess.js](../../src/modules/assistant/domain/previewAccess.js), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/consumption/data/historyRepository.js](../../src/modules/consumption/data/historyRepository.js), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/hooks/DashboardSources.jsx](../../src/modules/my-dashboard/hooks/DashboardSources.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/users/components/UsersPage.jsx](../../src/modules/users/components/UsersPage.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/main.jsx](../../src/main.jsx).

Dependências externas: `react`.

### src/components/AnalysisMetrics.jsx

**Compartilhado · Interface React** — Apresentação de valores já calculados pelo módulo, sem mudar bases ou unidades.

[Abrir fonte](../../src/components/AnalysisMetrics.jsx) · Código ou documentação do ponto de referência

Exporta: `AnalysisMetrics`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/components/AttentionPanel.jsx

**Compartilhado · Interface React** — Destaques descritivos: o usuário escolhe os critérios e confere as mesmas linhas de origem.

[Abrir fonte](../../src/components/AttentionPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `AttentionPanel`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx).

Dependências externas: `react`.

### src/components/BarChart.jsx

**Compartilhado · Interface React** — Adapta dados de contagem ao componente compartilhado de gráficos.

[Abrir fonte](../../src/components/BarChart.jsx) · Código ou documentação do ponto de referência

Exporta: `BarChart`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx).

Importado por: [src/modules/orders/components/ManagementOverview.jsx](../../src/modules/orders/components/ManagementOverview.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx).

Dependências externas: `react`.

### src/components/Chart.jsx

**Compartilhado · Interface React** — Apresenta a série calculada, controla o formato compatível e exporta o gráfico com seu contexto.

[Abrir fonte](../../src/components/Chart.jsx) · Código ou documentação do ponto de referência

Exporta: `Chart`.

Importa arquivos locais: [src/components/ViewState.jsx](../../src/components/ViewState.jsx), [src/shared/charts/chartRules.js](../../src/shared/charts/chartRules.js), [src/shared/charts/palette.js](../../src/shared/charts/palette.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/components/BarChart.jsx](../../src/components/BarChart.jsx), [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`, `recharts`.

### src/components/FilterPanel.jsx

**Compartilhado · Interface React** — Um único quadro reúne alcance, período, filtros recolhíveis, seleções ativas e ações dos relatórios.

[Abrir fonte](../../src/components/FilterPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `FilterCount`, `FilterPanel`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/shared/filters/SavedViews.jsx](../../src/shared/filters/SavedViews.jsx).

Importado por: [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/OrdersReportMenu.jsx](../../src/modules/orders/components/OrdersReportMenu.jsx).

Dependências externas: `react`.

### src/components/HelpLayout.jsx

**Compartilhado · Interface React** — Organiza explicações de blocos HTML sem alterar seus controles ou regras de cálculo.

[Abrir fonte](../../src/components/HelpLayout.jsx) · Código ou documentação do ponto de referência

Exporta: `alignHelp`, `helpChildren`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx).

Importado por: [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/components/Section.jsx](../../src/components/Section.jsx).

Dependências externas: `react`.

### src/components/Icon.jsx

**Compartilhado · Interface React** — Renderiza ícones vetoriais decorativos; o controle que os utiliza deve fornecer seu próprio rótulo acessível.

[Abrir fonte](../../src/components/Icon.jsx) · Código ou documentação do ponto de referência

Exporta: `Icon`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/PageSettings.jsx](../../src/components/PageSettings.jsx), [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/components/ViewState.jsx](../../src/components/ViewState.jsx), [src/modules/monitoring/components/MonitoringQueue.jsx](../../src/modules/monitoring/components/MonitoringQueue.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/orders/components/OrdersGooglePanel.jsx](../../src/modules/orders/components/OrdersGooglePanel.jsx), [src/modules/orders/components/OverviewKpis.jsx](../../src/modules/orders/components/OverviewKpis.jsx), [src/modules/orders/components/SupportMetricCards.jsx](../../src/modules/orders/components/SupportMetricCards.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx).

Dependências externas: `react`.

### src/components/InfoNote.jsx

**Compartilhado · Interface React** — Explicação sob demanda; o texto também permanece disponível na impressão.

[Abrir fonte](../../src/components/InfoNote.jsx) · Código ou documentação do ponto de referência

Exporta: `InfoNote`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx).

Importado por: [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/components/HelpLayout.jsx](../../src/components/HelpLayout.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/CardInsights.jsx](../../src/modules/orders/components/CardInsights.jsx), [src/modules/orders/components/ContractSummary.jsx](../../src/modules/orders/components/ContractSummary.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/FieldLifeCards.jsx](../../src/modules/orders/components/FieldLifeCards.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/ManagementOverview.jsx](../../src/modules/orders/components/ManagementOverview.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/OrdersRecordsPanel.jsx](../../src/modules/orders/components/OrdersRecordsPanel.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OverviewKpis.jsx](../../src/modules/orders/components/OverviewKpis.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx), [src/modules/orders/components/SupportMetricCards.jsx](../../src/modules/orders/components/SupportMetricCards.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`, `react-dom`.

### src/components/MultiFilter.jsx

**Compartilhado · Interface React** — Permite selecionar mais de um valor no mesmo campo; a combinação entre campos é feita pelo filtro de dados.

[Abrir fonte](../../src/components/MultiFilter.jsx) · Código ou documentação do ponto de referência

Exporta: `MultiFilter`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/ConsumptionFiltersPanel.jsx](../../src/modules/consumption/components/ConsumptionFiltersPanel.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx).

Dependências externas: `react`, `react-dom`.

### src/components/PageSettings.jsx

**Compartilhado · Interface React** — Modal de apresentação: alterações são rascunhos até Salvar; dialog nativo oferece foco modal e Escape.

[Abrir fonte](../../src/components/PageSettings.jsx) · Código ou documentação do ponto de referência

Exporta: `PageSettingsButton`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx), [src/shared/layout/pageLayout.js](../../src/shared/layout/pageLayout.js).

Importado por: [src/modules/consumption/components/ConsumptionImportHeader.jsx](../../src/modules/consumption/components/ConsumptionImportHeader.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersImportPanel.jsx](../../src/modules/orders/components/OrdersImportPanel.jsx).

Dependências externas: `react`, `react-dom`.

### src/components/PeriodFilter.jsx

**Compartilhado · Interface React** — Atalho de período que edita os mesmos filtros da página, sem criar uma segunda base de cálculo.

[Abrir fonte](../../src/components/PeriodFilter.jsx) · Código ou documentação do ponto de referência

Exporta: `PeriodFilter`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx).

Dependências externas: `react`.

### src/components/ReportControls.jsx

**Compartilhado · Interface React** — Apresenta as ações compartilhadas para abrir ou recolher os relatórios.

[Abrir fonte](../../src/components/ReportControls.jsx) · Código ou documentação do ponto de referência

Exporta: `PagePersonalization`, `ReportControls`.

Importa arquivos locais: [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/components/HelpLayout.jsx](../../src/components/HelpLayout.jsx), [src/components/Icon.jsx](../../src/components/Icon.jsx).

Importado por: [src/modules/consumption/components/ConsumptionFiltersPanel.jsx](../../src/modules/consumption/components/ConsumptionFiltersPanel.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx).

Dependências externas: `react`.

### src/components/ReportSummary.jsx

**Compartilhado · Interface React** — Síntese explícita do relatório: valores vêm do mesmo resultado usado no conteúdo completo.

[Abrir fonte](../../src/components/ReportSummary.jsx) · Código ou documentação do ponto de referência

Exporta: `ReportSummary`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcesPanel.jsx](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/components/ReviewPanel.jsx

**Compartilhado · Interface React** — Busca, paginação, exportação e detalhamento dos apontamentos de revisão, com origem preservada.

[Abrir fonte](../../src/components/ReviewPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ReviewPanel`.

Importa arquivos locais: [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/shared/data/reviewDiagnostics.js](../../src/shared/data/reviewDiagnostics.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersRecordsPanel.jsx](../../src/modules/orders/components/OrdersRecordsPanel.jsx).

Dependências externas: `react`.

### src/components/Section.jsx

**Compartilhado · Interface React** — Agrupa relatório, ajuda e impressão isolada com contexto de arquivo, filtros e referência temporal.

[Abrir fonte](../../src/components/Section.jsx) · Código ou documentação do ponto de referência

Exporta: `ExpansionContext`, `HiddenSectionsContext`, `PrintContext`, `Section`.

Importa arquivos locais: [src/components/HelpLayout.jsx](../../src/components/HelpLayout.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/reportHelp.js](../../src/components/reportHelp.js), [src/shared/export/printContext.js](../../src/shared/export/printContext.js), [src/shared/export/reportPrintStyles.js](../../src/shared/export/reportPrintStyles.js), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx), [src/shared/layout/ReportStories.jsx](../../src/shared/layout/ReportStories.jsx), [src/shared/layout/pageLayout.js](../../src/shared/layout/pageLayout.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcesPanel.jsx](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/monitoring/components/MonitoringQueue.jsx](../../src/modules/monitoring/components/MonitoringQueue.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/components/OrdersRecordsPanel.jsx](../../src/modules/orders/components/OrdersRecordsPanel.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/components/SortableTable.jsx

**Compartilhado · Interface React** — Extrai texto das células React para a comparação usada na ordenação da tabela.

[Abrir fonte](../../src/components/SortableTable.jsx) · Código ou documentação do ponto de referência

Exporta: `SortableTable`, `compareValues`, `plainText`.

Importa arquivos locais: [src/shared/data/sorting.js](../../src/shared/data/sorting.js).

Importado por: [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcePanel.jsx](../../src/modules/consumption/components/ConsumptionSourcePanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/CustomerIdentityNote.jsx](../../src/modules/orders/components/CustomerIdentityNote.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/modules/orders/components/SupportZohoPanel.jsx](../../src/modules/orders/components/SupportZohoPanel.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/modules/orders/components/ZohoClosures.jsx](../../src/modules/orders/components/ZohoClosures.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/components/TableScroll.jsx

**Compartilhado · Interface React** — Rolagem de tabelas com indicação real de conteúdo lateral e acesso por teclado.

[Abrir fonte](../../src/components/TableScroll.jsx) · Código ou documentação do ponto de referência

Exporta: `TableScroll`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/ReviewPanel.jsx](../../src/components/ReviewPanel.jsx), [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcePanel.jsx](../../src/modules/consumption/components/ConsumptionSourcePanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/components/OrdersRecordsPanel.jsx](../../src/modules/orders/components/OrdersRecordsPanel.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/components/ViewState.jsx

**Compartilhado · Interface React** — Mensagens de apresentação distinguem fonte ausente, recorte vazio e carregamento.

[Abrir fonte](../../src/components/ViewState.jsx) · Código ou documentação do ponto de referência

Exporta: `ViewState`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx).

Importado por: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/components/reportHelp.js

**Compartilhado · Configuração** — Explicações de apresentação. Os cálculos continuam nos módulos de domínio.

[Abrir fonte](../../src/components/reportHelp.js) · Código ou documentação do ponto de referência

Exporta: `reportHelp`, `reportHelpFor`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/Section.jsx](../../src/components/Section.jsx).

### src/main.jsx

**Compartilhado · Interface React** — Entrada React: importa os estilos na ordem da cascata e monta tema, acesso e Workspace.

[Abrir fonte](../../src/main.jsx) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/app/Theme.jsx](../../src/app/Theme.jsx), [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/styles/analysis-workspace.css](../../src/styles/analysis-workspace.css), [src/styles/controls.css](../../src/styles/controls.css), [src/styles/filter-workspace.css](../../src/styles/filter-workspace.css), [src/styles/filters.css](../../src/styles/filters.css), [src/styles/google-orders.css](../../src/styles/google-orders.css), [src/styles/identity.css](../../src/styles/identity.css), [src/styles/layout-polish.css](../../src/styles/layout-polish.css), [src/styles/monitoring.css](../../src/styles/monitoring.css), [src/styles/my-dashboard.css](../../src/styles/my-dashboard.css), [src/styles/next-analysis.css](../../src/styles/next-analysis.css), [src/styles/overview-agenda.css](../../src/styles/overview-agenda.css), [src/styles/overview-kpis.css](../../src/styles/overview-kpis.css), [src/styles/page-settings.css](../../src/styles/page-settings.css), [src/styles/report-stories.css](../../src/styles/report-stories.css), [src/styles/review-diagnostics.css](../../src/styles/review-diagnostics.css), [src/styles/sidebar.css](../../src/styles/sidebar.css), [src/styles/style.css](../../src/styles/style.css), [src/styles/support-people.css](../../src/styles/support-people.css), [src/styles/support-workspace.css](../../src/styles/support-workspace.css), [src/styles/support.css](../../src/styles/support.css), [src/styles/theme.css](../../src/styles/theme.css).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `react`, `react-dom/client`.

### src/modules/assistant/components/AssistantPage.jsx

**Assistente · Interface React** — Perguntas ao agente local: instruções no n8n e ferramenta de leitura com escopo explícito.

[Abrir fonte](../../src/modules/assistant/components/AssistantPage.jsx) · Laboratório local

Exporta: `AssistantPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/modules/assistant/components/assistant.css](../../src/modules/assistant/components/assistant.css), [src/modules/assistant/data/assistantClient.js](../../src/modules/assistant/data/assistantClient.js), [src/modules/assistant/domain/previewAccess.js](../../src/modules/assistant/domain/previewAccess.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/assistant/components/assistant.css

**Assistente · Estilo** — Apresentação da página piloto, perguntas e resultado do assistente.

[Abrir fonte](../../src/modules/assistant/components/assistant.css) · Laboratório local

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx).

### src/modules/assistant/data/assistantClient.js

**Assistente · Dados / transporte** — A asserção Access permanece na memória e só segue para o serviço loopback fixo.

[Abrir fonte](../../src/modules/assistant/data/assistantClient.js) · Laboratório local

Exporta: `queryLocalAssistant`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx), [src/modules/assistant/data/assistantClient.test.js](../../src/modules/assistant/data/assistantClient.test.js).

### src/modules/assistant/data/assistantClient.test.js

**Assistente · Teste** — Verifica assistant Client no contexto de Assistente. Exemplos: cliente mantém sessão em memória e envia asserção somente ao loopback fixo, sem dados livres.

[Abrir fonte](../../src/modules/assistant/data/assistantClient.test.js) · Laboratório local

Importa arquivos locais: [src/modules/assistant/data/assistantClient.js](../../src/modules/assistant/data/assistantClient.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/assistant/domain/previewAccess.js

**Assistente · Domínio** — A página experimental não é uma permissão distribuível no cadastro de usuários.

[Abrir fonte](../../src/modules/assistant/domain/previewAccess.js) · Laboratório local

Exporta: `assistantPreviewHash`, `canOpenAssistantPreview`, `requestsAssistantPreview`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx), [src/modules/assistant/domain/previewAccess.test.js](../../src/modules/assistant/domain/previewAccess.test.js).

### src/modules/assistant/domain/previewAccess.test.js

**Assistente · Teste** — Verifica preview Access no contexto de Assistente. Exemplos: laboratório exige administrador ativo e endereço explícito; permissão forjada de página não libera.

[Abrir fonte](../../src/modules/assistant/domain/previewAccess.test.js) · Laboratório local

Importa arquivos locais: [src/modules/assistant/domain/previewAccess.js](../../src/modules/assistant/domain/previewAccess.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/components/ConsumptionArchivePanel.jsx

**Consumo M2M · Interface React** — Gestão visual de arquivos e backups. As ações são autorizadas e persistidas pelo coordenador da página.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionArchivePanel`.

Importa arquivos locais: [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionEquipmentPanels.jsx

**Consumo M2M · Interface React** — Relaciona o consumo à referência operacional e apresenta recortes por equipamento.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionEquipmentPanels`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionFiltersPanel.jsx

**Consumo M2M · Interface React** — Controles de período, categorias, busca e visibilidade. Seleção analítica permanece nas funções de domínio.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionFiltersPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionFiltersPanel`.

Importa arquivos locais: [src/components/MultiFilter.jsx](../../src/components/MultiFilter.jsx), [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionImportHeader.jsx

**Consumo M2M · Interface React** — Cabeçalho e seletores de arquivo do consumo; ações e referências são fornecidas pelo controlador.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionImportHeader.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionImportHeader`.

Importa arquivos locais: [src/components/PageSettings.jsx](../../src/components/PageSettings.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionImportPreview.jsx

**Consumo M2M · Interface React** — Prévia revisável dos extratos; gravação e cancelamento permanecem explícitos.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionImportPreview.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionImportPreview`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionInvestigationPanel.jsx

**Consumo M2M · Interface React** — Ranking e grade de linhas para acompanhamento, com recortes e exportação.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionInvestigationPanel`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/domain/consumptionSelection.js](../../src/modules/consumption/domain/consumptionSelection.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionInvoicesPanel.jsx

**Consumo M2M · Interface React** — Apresenta informações de faturas e valores dos extratos elegíveis.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionInvoicesPanel`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionOverviewPanels.jsx

**Consumo M2M · Interface React** — Visão geral de volumes, distribuição e indicadores por operadora.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionOverviewPanels`.

Importa arquivos locais: [src/components/AnalysisMetrics.jsx](../../src/components/AnalysisMetrics.jsx), [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionSourcePanel.jsx

**Consumo M2M · Interface React** — Conferência das células originais e dos candidatos operacionais, sem corrigir ou atribuir vínculos.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionSourcePanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionSourcePanel`.

Importa arquivos locais: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/ConsumptionSourcesPanel.jsx

**Consumo M2M · Interface React** — Apresenta a fonte atual e o laboratório de coexistência de fontes, sem misturar exemplos ao histórico.

[Abrir fonte](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ConsumptionSourcesPanel`.

Importa arquivos locais: [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/domain/consumptionSources.js](../../src/modules/consumption/domain/consumptionSources.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/LineHistoryPanel.jsx

**Consumo M2M · Interface React** — Histórico individual: apresenta busca, formulário, apurações e exportação sem controlar a persistência.

[Abrir fonte](../../src/modules/consumption/components/LineHistoryPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `LineHistoryPanel`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/LineRecordsTable.jsx

**Consumo M2M · Interface React** — Ordena e pagina os registros de consumo antes de apresentar a conferência de cada linha.

[Abrir fonte](../../src/modules/consumption/components/LineRecordsTable.jsx) · Código ou documentação do ponto de referência

Exporta: `LineRecordsTable`.

Importa arquivos locais: [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/consumption/domain/consumptionFollowup.js](../../src/modules/consumption/domain/consumptionFollowup.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js), [src/shared/data/sorting.js](../../src/shared/data/sorting.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/components/LinesPage.jsx

**Consumo M2M · Interface React** — Coordena extratos, versões, notas e referência operacional no histórico local do navegador.

[Abrir fonte](../../src/modules/consumption/components/LinesPage.jsx) · Código ou documentação do ponto de referência

Exporta: `LinesPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/components/AttentionPanel.jsx](../../src/components/AttentionPanel.jsx), [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/ViewState.jsx](../../src/components/ViewState.jsx), [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionFiltersPanel.jsx](../../src/modules/consumption/components/ConsumptionFiltersPanel.jsx), [src/modules/consumption/components/ConsumptionImportHeader.jsx](../../src/modules/consumption/components/ConsumptionImportHeader.jsx), [src/modules/consumption/components/ConsumptionImportPreview.jsx](../../src/modules/consumption/components/ConsumptionImportPreview.jsx), [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcePanel.jsx](../../src/modules/consumption/components/ConsumptionSourcePanel.jsx), [src/modules/consumption/components/ConsumptionSourcesPanel.jsx](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/consumption/config/consumptionMenus.js](../../src/modules/consumption/config/consumptionMenus.js), [src/modules/consumption/config/reportStories.js](../../src/modules/consumption/config/reportStories.js), [src/modules/consumption/domain/consumptionAttention.js](../../src/modules/consumption/domain/consumptionAttention.js), [src/modules/consumption/domain/consumptionFilters.js](../../src/modules/consumption/domain/consumptionFilters.js), [src/modules/consumption/domain/consumptionRecordsReport.js](../../src/modules/consumption/domain/consumptionRecordsReport.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/hooks/useConsumptionArchive.js](../../src/modules/consumption/hooks/useConsumptionArchive.js), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js), [src/modules/my-dashboard/hooks/DashboardSources.jsx](../../src/modules/my-dashboard/hooks/DashboardSources.jsx), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/filters/useScopedSelection.js](../../src/shared/filters/useScopedSelection.js), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx), [src/shared/layout/ReportStories.jsx](../../src/shared/layout/ReportStories.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/consumption/config/consumptionMenus.js

**Consumo M2M · Catálogo** — Categorias do consumo. Rótulos podem mudar; chaves e títulos dos relatórios preservam preferências e impressão.

[Abrir fonte](../../src/modules/consumption/config/consumptionMenus.js) · Código ou documentação do ponto de referência

Exporta: `consumptionCategories`, `consumptionLayoutDefinitions`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/consumption/config/reportStories.js

**Consumo M2M · Catálogo** — Uma grade operacional; o ranking é outra visualização da prioridade, sem repetir a tabela.

[Abrir fonte](../../src/modules/consumption/config/reportStories.js) · Código ou documentação do ponto de referência

Exporta: `consumptionStories`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/consumption/data/consumptionHistory.js

**Consumo M2M · Dados / transporte** — Lê/grava o histórico consolidado no IndexedDB e valida backup e hashes de arquivos; confirmação só após a transação.

[Abrir fonte](../../src/modules/consumption/data/consumptionHistory.js) · Código ou documentação do ponto de referência

Exporta: `emptyHistory`, `fileDigest`, `readConsumptionHistory`, `validateBackup`, `writeConsumptionHistory`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js).

Importado por: [src/modules/consumption/data/consumptionHistory.test.js](../../src/modules/consumption/data/consumptionHistory.test.js), [src/modules/consumption/data/historyRepository.js](../../src/modules/consumption/data/historyRepository.js), [src/modules/consumption/data/historyRepository.test.js](../../src/modules/consumption/data/historyRepository.test.js), [src/modules/consumption/hooks/useConsumptionArchive.js](../../src/modules/consumption/hooks/useConsumptionArchive.js), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/modules/imports/domain/bulkImport.test.js](../../src/modules/imports/domain/bulkImport.test.js), [src/modules/operational/domain/operational.test.js](../../src/modules/operational/domain/operational.test.js).

### src/modules/consumption/data/consumptionHistory.test.js

**Consumo M2M · Teste** — Verifica consumption History no contexto de Consumo M2M. Exemplos: backup confere CSV/hash e preserva versões arquivadas, notas, zeros iniciais e referência; restauração rejeita arquivos repetidos, duas versões ativas, notas com datas impossíveis e CSV incompatível; backup guarda referência operacional real e rejeita identificadores alterados fora dos originais.

[Abrir fonte](../../src/modules/consumption/data/consumptionHistory.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/consumption/data/historyRepository.js

**Consumo M2M · Dados / transporte** — Contrato read/write do consumo; o adaptador atual persiste exclusivamente no navegador.

[Abrir fonte](../../src/modules/consumption/data/historyRepository.js) · Código ou documentação do ponto de referência

Exporta: `consumptionHistoryRepository`, `createHistoryRepository`.

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/modules/consumption/data/historyRepository.test.js](../../src/modules/consumption/data/historyRepository.test.js), [src/modules/consumption/domain/lineHistoryReport.test.js](../../src/modules/consumption/domain/lineHistoryReport.test.js), [src/modules/consumption/hooks/useConsumptionArchive.js](../../src/modules/consumption/hooks/useConsumptionArchive.js).

### src/modules/consumption/data/historyRepository.test.js

**Consumo M2M · Teste** — Verifica history Repository no contexto de Consumo M2M. Exemplos: histórico usa o adaptador versionado sem mudar CSV, backup v1 ou identificadores; a fachada encaminha opções ao adaptador, sem introduzir rede ou depender do formato do armazenamento.

[Abrir fonte](../../src/modules/consumption/data/historyRepository.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/data/historyRepository.js](../../src/modules/consumption/data/historyRepository.js), [src/shared/persistence/documentRepository.js](../../src/shared/persistence/documentRepository.js), [src/shared/persistence/documentValueAdapter.js](../../src/shared/persistence/documentValueAdapter.js), [src/shared/persistence/memoryDocumentAdapter.js](../../src/shared/persistence/memoryDocumentAdapter.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumption.js

**Consumo M2M · Domínio** — Utilitários de leitura CSV, datas e volumes e resumo de consumo; convive com o fluxo de extratos em lineConsumption.

[Abrir fonte](../../src/modules/consumption/domain/consumption.js) · Código ou documentação do ponto de referência

Exporta: `MB_SCALE`, `consumptionDate`, `consumptionGroups`, `displayDate`, `importConsumption`, `parseCsv`, `parseMB`, `summarizeConsumption`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/domain/consumption.test.js](../../src/modules/consumption/domain/consumption.test.js), [src/modules/consumption/domain/consumptionRecordsReport.test.js](../../src/modules/consumption/domain/consumptionRecordsReport.test.js), [src/modules/consumption/domain/csvParsing.test.js](../../src/modules/consumption/domain/csvParsing.test.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

### src/modules/consumption/domain/consumption.test.js

**Consumo M2M · Teste** — Verifica consumption no contexto de Consumo M2M. Exemplos: CSV preserva BOM, aspas escapadas, delimitador em texto e linha física; MB usa precisão de seis casas, zero válido e rejeita ausência ou valor negativo; importação preserva identificadores longos e zeros iniciais e não infere tecnologia.

[Abrir fonte](../../src/modules/consumption/domain/consumption.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumption.js](../../src/modules/consumption/domain/consumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumptionAttention.js

**Consumo M2M · Domínio** — Compara o mesmo chip/operadora a uma apuração anterior não sobreposta, sem usar referência de outros chips.

[Abrir fonte](../../src/modules/consumption/domain/consumptionAttention.js) · Código ou documentação do ponto de referência

Exporta: `consumptionAttention`, `defaultConsumptionAttention`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/consumption/domain/consumptionAttention.test.js](../../src/modules/consumption/domain/consumptionAttention.test.js).

### src/modules/consumption/domain/consumptionAttention.test.js

**Consumo M2M · Teste** — Verifica consumption Attention no contexto de Consumo M2M. Exemplos: compara MB por dia do mesmo chip/operadora e mantém ambas as origens; períodos de tamanhos distintos não inflam o resultado; não compara operadoras/chips distintos, períodos sobrepostos, referência zero ou apuração ambígua.

[Abrir fonte](../../src/modules/consumption/domain/consumptionAttention.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumptionAttention.js](../../src/modules/consumption/domain/consumptionAttention.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumptionFilters.js

**Consumo M2M · Domínio** — Seleção do consumo: uma apuração por operadora e filtros combinados sobre a base já analisada.

[Abrir fonte](../../src/modules/consumption/domain/consumptionFilters.js) · Código ou documentação do ponto de referência

Exporta: `consumptionFilterFields`, `consumptionPeriods`, `selectConsumptionRows`.

Importa arquivos locais: [src/modules/consumption/domain/consumptionSelection.js](../../src/modules/consumption/domain/consumptionSelection.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/consumption/domain/consumptionFilters.test.js](../../src/modules/consumption/domain/consumptionFilters.test.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js).

### src/modules/consumption/domain/consumptionFilters.test.js

**Consumo M2M · Teste** — Verifica consumption Filters no contexto de Consumo M2M. Exemplos: período mantém escolha existente por operadora e usa o mais recente quando ela deixa de existir; seleção combina múltiplos valores, busca/limite estrito e mantém a base de referência intacta.

[Abrir fonte](../../src/modules/consumption/domain/consumptionFilters.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumptionFilters.js](../../src/modules/consumption/domain/consumptionFilters.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumptionFollowup.js

**Consumo M2M · Domínio** — Índice da última ação por operadora + ICCID. Empates de data usam a última entrada registrada.

[Abrir fonte](../../src/modules/consumption/domain/consumptionFollowup.js) · Código ou documentação do ponto de referência

Exporta: `latestConsumptionNotes`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/consumption/domain/consumptionFollowup.test.js](../../src/modules/consumption/domain/consumptionFollowup.test.js).

### src/modules/consumption/domain/consumptionFollowup.test.js

**Consumo M2M · Teste** — Verifica consumption Followup no contexto de Consumo M2M. Exemplos: última ação usa data, desempate por registro e separa operadora e ICCID.

[Abrir fonte](../../src/modules/consumption/domain/consumptionFollowup.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumptionFollowup.js](../../src/modules/consumption/domain/consumptionFollowup.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumptionRecordsReport.js

**Consumo M2M · Domínio** — CSV do recorte ou seleção explícita. Preserva unidades, identificadores, regras e proteção contra fórmulas.

[Abrir fonte](../../src/modules/consumption/domain/consumptionRecordsReport.js) · Código ou documentação do ponto de referência

Exporta: `consumptionRecordsCsv`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/consumption/domain/consumptionRecordsReport.test.js](../../src/modules/consumption/domain/consumptionRecordsReport.test.js).

### src/modules/consumption/domain/consumptionRecordsReport.test.js

**Consumo M2M · Teste** — Verifica consumption Records Report no contexto de Consumo M2M. Exemplos: relatório de seleção preserva unidade, zero financeiro, ausências e proteção contra fórmulas.

[Abrir fonte](../../src/modules/consumption/domain/consumptionRecordsReport.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumption.js](../../src/modules/consumption/domain/consumption.js), [src/modules/consumption/domain/consumptionRecordsReport.js](../../src/modules/consumption/domain/consumptionRecordsReport.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumptionSelection.js

**Consumo M2M · Domínio** — Limite absoluto em MB, na precisão de seis casas dos extratos.

[Abrir fonte](../../src/modules/consumption/domain/consumptionSelection.js) · Código ou documentação do ponto de referência

Exporta: `aboveConsumptionLimit`, `consumptionLimit`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/domain/consumptionFilters.js](../../src/modules/consumption/domain/consumptionFilters.js), [src/modules/consumption/domain/consumptionSelection.test.js](../../src/modules/consumption/domain/consumptionSelection.test.js).

### src/modules/consumption/domain/consumptionSelection.test.js

**Consumo M2M · Teste** — Verifica consumption Selection no contexto de Consumo M2M. Exemplos: limite em MB mantém precisão e exige consumo estritamente acima em linha elegível.

[Abrir fonte](../../src/modules/consumption/domain/consumptionSelection.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumptionSelection.js](../../src/modules/consumption/domain/consumptionSelection.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/consumptionSources.js

**Consumo M2M · Domínio** — Arbitragem de observações normalizadas. Preparação interna: não consulta APIs nem grava o histórico.

[Abrir fonte](../../src/modules/consumption/domain/consumptionSources.js) · Código ou documentação do ponto de referência

Exporta: `planConsumptionSources`, `sourcePlanTotal`.

Importa arquivos locais: [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [src/modules/consumption/components/ConsumptionSourcesPanel.jsx](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx), [src/modules/consumption/domain/consumptionSources.test.js](../../src/modules/consumption/domain/consumptionSources.test.js).

### src/modules/consumption/domain/consumptionSources.test.js

**Consumo M2M · Teste** — Verifica consumption Sources no contexto de Consumo M2M. Exemplos: resposta repetida e acumulado revisado não duplicam consumo nem modificam as entradas; CSV/API exigem escolha explícita; contas e períodos sobrepostos não são mesclados silenciosamente; parcial ou inválido conserva a última completa; erro sem base anterior não é zero.

[Abrir fonte](../../src/modules/consumption/domain/consumptionSources.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumptionSources.js](../../src/modules/consumption/domain/consumptionSources.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/csvParsing.test.js

**Consumo M2M · Teste** — Verifica csv Parsing no contexto de Consumo M2M. Exemplos: reconhecimento ignora separadores e aspas escapadas dentro dos cabeçalhos nos três formatos; cabeçalho multilinha preserva o número físico de origem e arquivos inválidos continuam recusados; Arqia com coluna adicional contendo ponto e vírgula no cabeçalho importa identificadores e consumo corretamente.

[Abrir fonte](../../src/modules/consumption/domain/csvParsing.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/consumption.js](../../src/modules/consumption/domain/consumption.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/lineConsumption.js

**Consumo M2M · Domínio** — Normaliza extratos em unidades inteiras, preserva ICCID, gerencia versões/apurações e vincula referência e histórico por chip.

[Abrir fonte](../../src/modules/consumption/domain/lineConsumption.js) · Código ou documentação do ponto de referência

Exporta: `VOLUME_SCALE`, `attachBaselines`, `baselineByPeriod`, `chipKey`, `consumptionEligible`, `consumptionSummary`, `dataVolume`, `exactSum`, `historyStatements`, `importLineStatement`, `lineMoney`, `lineTimeline`, `linkConsumption`, `mergeHistoryFiles`, `periodKey`, `periodLabel`, `periodOptions`, `statementSignature`, `toggleHistoryFile`.

Importa arquivos locais: [src/modules/consumption/domain/consumption.js](../../src/modules/consumption/domain/consumption.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js).

Importado por: [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionFiltersPanel.jsx](../../src/modules/consumption/components/ConsumptionFiltersPanel.jsx), [src/modules/consumption/components/ConsumptionImportPreview.jsx](../../src/modules/consumption/components/ConsumptionImportPreview.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcesPanel.jsx](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/domain/consumptionAttention.js](../../src/modules/consumption/domain/consumptionAttention.js), [src/modules/consumption/domain/consumptionAttention.test.js](../../src/modules/consumption/domain/consumptionAttention.test.js), [src/modules/consumption/domain/consumptionFilters.js](../../src/modules/consumption/domain/consumptionFilters.js), [src/modules/consumption/domain/consumptionFilters.test.js](../../src/modules/consumption/domain/consumptionFilters.test.js), [src/modules/consumption/domain/consumptionFollowup.js](../../src/modules/consumption/domain/consumptionFollowup.js), [src/modules/consumption/domain/consumptionFollowup.test.js](../../src/modules/consumption/domain/consumptionFollowup.test.js), [src/modules/consumption/domain/consumptionRecordsReport.js](../../src/modules/consumption/domain/consumptionRecordsReport.js), [src/modules/consumption/domain/consumptionRecordsReport.test.js](../../src/modules/consumption/domain/consumptionRecordsReport.test.js), [src/modules/consumption/domain/consumptionSelection.js](../../src/modules/consumption/domain/consumptionSelection.js), [src/modules/consumption/domain/consumptionSelection.test.js](../../src/modules/consumption/domain/consumptionSelection.test.js), [src/modules/consumption/domain/csvParsing.test.js](../../src/modules/consumption/domain/csvParsing.test.js), [src/modules/consumption/domain/lineConsumption.test.js](../../src/modules/consumption/domain/lineConsumption.test.js), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/modules/my-dashboard/components/WidgetVisualization.jsx](../../src/modules/my-dashboard/components/WidgetVisualization.jsx), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/operational/domain/operational.test.js](../../src/modules/operational/domain/operational.test.js).

### src/modules/consumption/domain/lineConsumption.test.js

**Consumo M2M · Teste** — Verifica line Consumption no contexto de Consumo M2M. Exemplos: conversão KB, MB e GB soma sem arredondamento por linha; dinheiro inclui desconto negativo; Kore contabiliza dados, mantém SMS/frete separados e preserva IDs longos e cancelamentos; zero participa da média e mediana; ausências e IDs inválidos não viram zero ou chip.

[Abrir fonte](../../src/modules/consumption/domain/lineConsumption.test.js) · Código ou documentação do ponto de referência

Exporta: `arqia`, `kore`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/consumption/domain/lineHistoryReport.js

**Consumo M2M · Domínio** — Relatório de um chip: preserva apurações separadas e observações, sem somar períodos sobrepostos.

[Abrir fonte](../../src/modules/consumption/domain/lineHistoryReport.js) · Código ou documentação do ponto de referência

Exporta: `lineHistoryCsv`, `lineHistoryReport`, `lineHistoryWorkbook`.

Importa arquivos locais: [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: [src/modules/consumption/domain/lineHistoryReport.test.js](../../src/modules/consumption/domain/lineHistoryReport.test.js), [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js).

Dependências externas: `xlsx`.

### src/modules/consumption/domain/lineHistoryReport.test.js

**Consumo M2M · Teste** — Verifica line History Report no contexto de Consumo M2M. Exemplos: relatório preserva períodos sobrepostos, identidade textual e somente anotações do chip; contrato de armazenamento propaga falha e aguarda confirmação do adaptador.

[Abrir fonte](../../src/modules/consumption/domain/lineHistoryReport.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/data/historyRepository.js](../../src/modules/consumption/data/historyRepository.js), [src/modules/consumption/domain/lineHistoryReport.js](../../src/modules/consumption/domain/lineHistoryReport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/consumption/hooks/useConsumptionArchive.js

**Consumo M2M · Estado / coordenação** — Estado da persistência local: confirma gravações antes de substituir o histórico apresentado.

[Abrir fonte](../../src/modules/consumption/hooks/useConsumptionArchive.js) · Código ou documentação do ponto de referência

Exporta: `useConsumptionArchive`.

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/data/historyRepository.js](../../src/modules/consumption/data/historyRepository.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/hooks/useConsumptionImports.js

**Consumo M2M · Estado / coordenação** — Fluxos de importação, versões e backups. Valida e autoriza antes de gravar pelo repositório existente.

[Abrir fonte](../../src/modules/consumption/hooks/useConsumptionImports.js) · Código ou documentação do ponto de referência

Exporta: `useConsumptionImports`.

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/hooks/useLineFollowup.js

**Consumo M2M · Estado / coordenação** — Acompanhamento por operadora + ICCID, independente dos filtros da grade e com rascunho separado do salvo.

[Abrir fonte](../../src/modules/consumption/hooks/useLineFollowup.js) · Código ou documentação do ponto de referência

Exporta: `useLineFollowup`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/domain/lineHistoryReport.js](../../src/modules/consumption/domain/lineHistoryReport.js), [src/modules/consumption/utils/consumptionFormatting.js](../../src/modules/consumption/utils/consumptionFormatting.js), [src/shared/data/localId.js](../../src/shared/data/localId.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx).

Dependências externas: `react`.

### src/modules/consumption/utils/consumptionFormatting.js

**Consumo M2M · Configuração** — Apresentação local do consumo, independente de React e do armazenamento. Não arredonda os dados de origem.

[Abrir fonte](../../src/modules/consumption/utils/consumptionFormatting.js) · Código ou documentação do ponto de referência

Exporta: `currentDate`, `formatCurrency`, `formatMB`, `formatNumber`, `formatVolume`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js).

Importado por: [src/modules/consumption/components/ConsumptionEquipmentPanels.jsx](../../src/modules/consumption/components/ConsumptionEquipmentPanels.jsx), [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/components/ConsumptionInvoicesPanel.jsx](../../src/modules/consumption/components/ConsumptionInvoicesPanel.jsx), [src/modules/consumption/components/ConsumptionOverviewPanels.jsx](../../src/modules/consumption/components/ConsumptionOverviewPanels.jsx), [src/modules/consumption/components/ConsumptionSourcesPanel.jsx](../../src/modules/consumption/components/ConsumptionSourcesPanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js).

### src/modules/imports/components/ImportPage.jsx

**Importação · Interface React** — Apresenta a prévia dos arquivos reconhecidos e aplica somente o lote selecionado e autorizado.

[Abrir fonte](../../src/modules/imports/components/ImportPage.jsx) · Código ou documentação do ponto de referência

Exporta: `ImportPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/imports/domain/bulkImport.js

**Importação · Domínio** — Reconhece bases em arquivos, monta prévia/lote e mescla versões de consumo antes da aplicação autorizada.

[Abrir fonte](../../src/modules/imports/domain/bulkImport.js) · Código ou documentação do ponto de referência

Exporta: `assembleImportBatch`, `importTypeLabels`, `inspectImportFile`, `mergeBulkHistory`.

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/imports/domain/bulkImport.test.js](../../src/modules/imports/domain/bulkImport.test.js).

Dependências externas: `xlsx`.

### src/modules/imports/domain/bulkImport.test.js

**Importação · Teste** — Verifica bulk Import no contexto de Importação. Exemplos: lote reconhece logística isolada e recusa duas referências sem depender do nome do arquivo; lote reconhece duas abas no mesmo Excel e preserva linhas de origem; lote reconhece OS 2025_26 com operacional e rejeita duas bases de OS no mesmo arquivo.

[Abrir fonte](../../src/modules/imports/domain/bulkImport.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/logistics/components/LogisticsPanel.jsx

**Logística · Interface React** — Conferência logística: dados locais, recebimentos datados e origem preservada para revisão.

[Abrir fonte](../../src/modules/logistics/components/LogisticsPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `LogisticsPanel`.

Importa arquivos locais: [src/components/PeriodFilter.jsx](../../src/components/PeriodFilter.jsx), [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx).

Dependências externas: `react`.

### src/modules/logistics/domain/logistics.js

**Logística · Domínio** — Importa Envios e Devoluções, valida datas e seleciona movimentações; não calcula estoque nem lê Consertos.

[Abrir fonte](../../src/modules/logistics/domain/logistics.js) · Código ou documentação do ponto de referência

Exporta: `importLogistics`, `logisticsDate`, `logisticsSections`, `selectLogistics`.

Importa arquivos locais: nenhum identificado.

Importado por: [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/logistics/domain/logistics.test.js](../../src/modules/logistics/domain/logistics.test.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/operational/config/operationalMenus.js](../../src/modules/operational/config/operationalMenus.js).

Dependências externas: `xlsx`.

### src/modules/logistics/domain/logistics.test.js

**Logística · Teste** — Verifica logistics no contexto de Logística. Exemplos: importa apenas envios/devoluções, preserva IDs textuais, fórmulas e todas as movimentações; mesmo ID pode repetir em outra data; possível duplicidade não some ao filtrar e não exclui linhas; datas invertidas e sem data não confirmam recebimento e não dependem da situação.

[Abrir fonte](../../src/modules/logistics/domain/logistics.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/monitoring/components/MonitoringAnalytics.jsx

**Monitoramento Ativo · Interface React** — Visão analítica separada da fila; cada card abre seu recorte sem alterar as bases selecionadas.

[Abrir fonte](../../src/modules/monitoring/components/MonitoringAnalytics.jsx) · Interface pronta / coletor pendente

Exporta: `MonitoringAnalytics`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringAnalytics.js](../../src/modules/monitoring/domain/monitoringAnalytics.js).

Importado por: [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx).

Dependências externas: `react`.

### src/modules/monitoring/components/MonitoringPage.jsx

**Monitoramento Ativo · Interface React** — Coordena acompanhamento e análise sem misturar demonstração e integração real.

[Abrir fonte](../../src/modules/monitoring/components/MonitoringPage.jsx) · Interface pronta / coletor pendente

Exporta: `MonitoringPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/components/MultiFilter.jsx](../../src/components/MultiFilter.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/monitoring/components/MonitoringQueue.jsx](../../src/modules/monitoring/components/MonitoringQueue.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringAnalytics.js](../../src/modules/monitoring/domain/monitoringAnalytics.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js), [src/modules/monitoring/hooks/useMonitoringReminders.js](../../src/modules/monitoring/hooks/useMonitoringReminders.js), [src/modules/monitoring/hooks/useMonitoringSource.js](../../src/modules/monitoring/hooks/useMonitoringSource.js), [src/modules/my-dashboard/hooks/DashboardSources.jsx](../../src/modules/my-dashboard/hooks/DashboardSources.jsx), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js), [src/shared/filters/useScopedSelection.js](../../src/shared/filters/useScopedSelection.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/monitoring/components/MonitoringQueue.jsx

**Monitoramento Ativo · Interface React** — Tabela prioritária e histórico manual de tratamento, sem confundir situação administrativa com comunicação.

[Abrir fonte](../../src/modules/monitoring/components/MonitoringQueue.jsx) · Interface pronta / coletor pendente

Exporta: `MonitoringQueue`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/monitoring/components/MonitoringReminderEditor.jsx](../../src/modules/monitoring/components/MonitoringReminderEditor.jsx), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js).

Importado por: [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx).

Dependências externas: `react`.

### src/modules/monitoring/components/MonitoringReminderEditor.jsx

**Monitoramento Ativo · Interface React** — Agendamento manual, separado do formulário de tratamento e dos sinais de comunicação.

[Abrir fonte](../../src/modules/monitoring/components/MonitoringReminderEditor.jsx) · Interface pronta / coletor pendente

Exporta: `MonitoringReminderEditor`.

Importa arquivos locais: [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js).

Importado por: [src/modules/monitoring/components/MonitoringQueue.jsx](../../src/modules/monitoring/components/MonitoringQueue.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx).

Dependências externas: `react`.

### src/modules/monitoring/components/MonitoringReminders.jsx

**Monitoramento Ativo · Interface React** — Resumo global do modo atual: filtros da fila não escondem lembretes vencidos.

[Abrir fonte](../../src/modules/monitoring/components/MonitoringReminders.jsx) · Interface pronta / coletor pendente

Exporta: `MonitoringReminders`.

Importa arquivos locais: [src/modules/monitoring/components/MonitoringReminderEditor.jsx](../../src/modules/monitoring/components/MonitoringReminderEditor.jsx), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx).

Dependências externas: `react`.

### src/modules/monitoring/data/demo.js

**Monitoramento Ativo · Dados / transporte** — Dados fictícios e referência congelada para avaliar a interface, sem conexão com a API.

[Abrir fonte](../../src/modules/monitoring/data/demo.js) · Interface pronta / coletor pendente

Exporta: `monitoringDemo`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/monitoring/domain/monitoring.test.js](../../src/modules/monitoring/domain/monitoring.test.js), [src/modules/monitoring/domain/monitoringAnalytics.test.js](../../src/modules/monitoring/domain/monitoringAnalytics.test.js), [src/modules/monitoring/domain/monitoringReminders.test.js](../../src/modules/monitoring/domain/monitoringReminders.test.js), [src/modules/monitoring/hooks/useMonitoringSource.js](../../src/modules/monitoring/hooks/useMonitoringSource.js).

### src/modules/monitoring/data/monitoringClient.js

**Monitoramento Ativo · Dados / transporte** — O navegador consulta somente a própria origem; credenciais do fornecedor não entram neste contrato.

[Abrir fonte](../../src/modules/monitoring/data/monitoringClient.js) · Interface pronta / coletor pendente

Exporta: `fetchMonitoringSnapshot`.

Importa arquivos locais: [src/modules/monitoring/data/snapshotContract.js](../../src/modules/monitoring/data/snapshotContract.js).

Importado por: [src/modules/monitoring/data/snapshotContract.test.js](../../src/modules/monitoring/data/snapshotContract.test.js), [src/modules/monitoring/hooks/useMonitoringSource.js](../../src/modules/monitoring/hooks/useMonitoringSource.js).

### src/modules/monitoring/data/reminderRepository.js

**Monitoramento Ativo · Dados / transporte** — Persistência exclusivamente local. Transação serializa abas; revisão impede edição sobre dados antigos.

[Abrir fonte](../../src/modules/monitoring/data/reminderRepository.js) · Interface pronta / coletor pendente

Exporta: `createReminderRepository`, `reminderScope`.

Importa arquivos locais: [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js).

Importado por: [src/modules/monitoring/domain/monitoringReminders.test.js](../../src/modules/monitoring/domain/monitoringReminders.test.js), [src/modules/monitoring/hooks/useMonitoringReminders.js](../../src/modules/monitoring/hooks/useMonitoringReminders.js).

### src/modules/monitoring/data/snapshotContract.js

**Monitoramento Ativo · Dados / transporte** — Valida o contrato v1 do retrato de Monitoramento e recusa respostas incompletas ou grandes demais.

[Abrir fonte](../../src/modules/monitoring/data/snapshotContract.js) · Interface pronta / coletor pendente

Exporta: `normalizeMonitoringSnapshot`, `readSnapshotJson`, `snapshotLimitBytes`.

Importa arquivos locais: [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js).

Importado por: [server/monitoring.js](../../server/monitoring.js), [src/modules/monitoring/data/monitoringClient.js](../../src/modules/monitoring/data/monitoringClient.js), [src/modules/monitoring/data/snapshotContract.test.js](../../src/modules/monitoring/data/snapshotContract.test.js).

### src/modules/monitoring/data/snapshotContract.test.js

**Monitoramento Ativo · Teste** — Verifica snapshot Contract no contexto de Monitoramento Ativo. Exemplos: contrato v1 preserva identificadores/zero e remove campos extras de todas as camadas; parcialidade, versão, demonstração e metadados ambíguos são recusados; datas problemáticas de telemetria e duplicidades de veículo chegam à revisão, sem alertas artificiais.

[Abrir fonte](../../src/modules/monitoring/data/snapshotContract.test.js) · Interface pronta / coletor pendente

Exporta: `sample`.

Importa arquivos locais: [src/modules/monitoring/data/monitoringClient.js](../../src/modules/monitoring/data/monitoringClient.js), [src/modules/monitoring/data/snapshotContract.js](../../src/modules/monitoring/data/snapshotContract.js), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/monitoring/domain/monitoring.js

**Monitoramento Ativo · Domínio** — Normaliza e classifica o retrato, tempos offline, tensão, ordenação e tratamento administrativo sem inferir recuperação.

[Abrir fonte](../../src/modules/monitoring/domain/monitoring.js) · Interface pronta / coletor pendente

Exporta: `monitorSnapshot`, `monitoringBucket`, `monitoringDate`, `monitoringDuration`, `monitoringIndicator`, `monitoringInstant`, `monitoringStages`, `monitoringStates`, `monitoringVoltage`, `recordMonitoringUpdate`, `sortMonitoringRows`, `vehicleKey`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/monitoring/components/MonitoringQueue.jsx](../../src/modules/monitoring/components/MonitoringQueue.jsx), [src/modules/monitoring/components/MonitoringReminderEditor.jsx](../../src/modules/monitoring/components/MonitoringReminderEditor.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx), [src/modules/monitoring/data/reminderRepository.js](../../src/modules/monitoring/data/reminderRepository.js), [src/modules/monitoring/data/snapshotContract.js](../../src/modules/monitoring/data/snapshotContract.js), [src/modules/monitoring/data/snapshotContract.test.js](../../src/modules/monitoring/data/snapshotContract.test.js), [src/modules/monitoring/domain/monitoring.test.js](../../src/modules/monitoring/domain/monitoring.test.js), [src/modules/monitoring/domain/monitoringAnalytics.js](../../src/modules/monitoring/domain/monitoringAnalytics.js), [src/modules/monitoring/domain/monitoringAnalytics.test.js](../../src/modules/monitoring/domain/monitoringAnalytics.test.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js), [src/modules/monitoring/domain/monitoringReminders.test.js](../../src/modules/monitoring/domain/monitoringReminders.test.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js).

### src/modules/monitoring/domain/monitoring.test.js

**Monitoramento Ativo · Teste** — Verifica monitoring no contexto de Monitoramento Ativo. Exemplos: fila ordena todo o recorte antes de paginar, mantém ausências no fim e IDs longos como texto; limites em horas são inclusivos e faixas exclusivas; ausência não vira zero; mesma placa em bases diferentes não colide; duplicidade exclui todo grupo antes do filtro.

[Abrir fonte](../../src/modules/monitoring/domain/monitoring.test.js) · Interface pronta / coletor pendente

Importa arquivos locais: [src/modules/monitoring/data/demo.js](../../src/modules/monitoring/data/demo.js), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/monitoring/domain/monitoringAnalytics.js

**Monitoramento Ativo · Domínio** — Calcula indicadores do retrato atual e filtra a fila sem mudar o denominador analítico das bases escolhidas.

[Abrir fonte](../../src/modules/monitoring/domain/monitoringAnalytics.js) · Interface pronta / coletor pendente

Exporta: `filterMonitoringQueue`, `monitoringAnalytics`, `monitoringFocusLabels`.

Importa arquivos locais: [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js).

Importado por: [src/modules/monitoring/components/MonitoringAnalytics.jsx](../../src/modules/monitoring/components/MonitoringAnalytics.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/monitoring/domain/monitoringAnalytics.test.js](../../src/modules/monitoring/domain/monitoringAnalytics.test.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js).

### src/modules/monitoring/domain/monitoringAnalytics.test.js

**Monitoramento Ativo · Teste** — Verifica monitoring Analytics no contexto de Monitoramento Ativo. Exemplos: tratamento usa só alertas utilizáveis e encerrado não representa recuperação; cards e denominadores não mudam com busca/status; tokens da busca cruzam campos e ignoram acento; coleta ruim não gera prioridades; base vazia não produz percentual ou duração zero.

[Abrir fonte](../../src/modules/monitoring/domain/monitoringAnalytics.test.js) · Interface pronta / coletor pendente

Importa arquivos locais: [src/modules/monitoring/data/demo.js](../../src/modules/monitoring/data/demo.js), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringAnalytics.js](../../src/modules/monitoring/domain/monitoringAnalytics.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/monitoring/domain/monitoringReminders.js

**Monitoramento Ativo · Domínio** — Valida lembretes, revisões, vencimentos e histórico por base/veículo no fuso de São Paulo.

[Abrir fonte](../../src/modules/monitoring/domain/monitoringReminders.js) · Interface pronta / coletor pendente

Exporta: `changeReminder`, `reminderActions`, `reminderDueAt`, `reminderExportRows`, `reminderLabels`, `reminderLocalDate`, `reminderOverdue`, `validateReminderDocument`.

Importa arquivos locais: [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js).

Importado por: [src/modules/monitoring/components/MonitoringQueue.jsx](../../src/modules/monitoring/components/MonitoringQueue.jsx), [src/modules/monitoring/components/MonitoringReminderEditor.jsx](../../src/modules/monitoring/components/MonitoringReminderEditor.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx), [src/modules/monitoring/data/reminderRepository.js](../../src/modules/monitoring/data/reminderRepository.js), [src/modules/monitoring/domain/monitoringReminders.test.js](../../src/modules/monitoring/domain/monitoringReminders.test.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js).

### src/modules/monitoring/domain/monitoringReminders.test.js

**Monitoramento Ativo · Teste** — Verifica monitoring Reminders no contexto de Monitoramento Ativo. Exemplos: agenda usa São Paulo explicitamente e rejeita datas normalizadas, ausentes e horários inválidos; só aceita agenda futura; vencimento é inclusivo e independe da telemetria; um ativo por veículo: reagendamento, conferência, cancelamento e novo ciclo conservam o histórico.

[Abrir fonte](../../src/modules/monitoring/domain/monitoringReminders.test.js) · Interface pronta / coletor pendente

Importa arquivos locais: [src/modules/monitoring/data/demo.js](../../src/modules/monitoring/data/demo.js), [src/modules/monitoring/data/reminderRepository.js](../../src/modules/monitoring/data/reminderRepository.js), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/monitoring/domain/monitoringReport.js

**Monitoramento Ativo · Domínio** — Monta CSV/Excel do retrato analisado com contexto e identificação explícita da demonstração.

[Abrir fonte](../../src/modules/monitoring/domain/monitoringReport.js) · Interface pronta / coletor pendente

Exporta: `monitoringCsv`, `monitoringReport`, `monitoringWorkbook`.

Importa arquivos locais: [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/monitoring/domain/monitoringAnalytics.js](../../src/modules/monitoring/domain/monitoringAnalytics.js), [src/modules/monitoring/domain/monitoringReminders.js](../../src/modules/monitoring/domain/monitoringReminders.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/monitoring/domain/monitoring.test.js](../../src/modules/monitoring/domain/monitoring.test.js), [src/modules/monitoring/domain/monitoringAnalytics.test.js](../../src/modules/monitoring/domain/monitoringAnalytics.test.js), [src/modules/monitoring/domain/monitoringReminders.test.js](../../src/modules/monitoring/domain/monitoringReminders.test.js).

Dependências externas: `xlsx`.

### src/modules/monitoring/hooks/useMonitoringReminders.js

**Monitoramento Ativo · Estado / coordenação** — Lê ao abrir/retornar à página. O relógio dos lembretes não usa a referência congelada da demonstração.

[Abrir fonte](../../src/modules/monitoring/hooks/useMonitoringReminders.js) · Interface pronta / coletor pendente

Exporta: `useMonitoringReminders`.

Importa arquivos locais: [src/modules/monitoring/data/reminderRepository.js](../../src/modules/monitoring/data/reminderRepository.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx).

Dependências externas: `react`.

### src/modules/monitoring/hooks/useMonitoringSource.js

**Monitoramento Ativo · Estado / coordenação** — Separa fonte e tela. Demonstração nunca é fallback de erro; atualização real é explícita nesta etapa.

[Abrir fonte](../../src/modules/monitoring/hooks/useMonitoringSource.js) · Interface pronta / coletor pendente

Exporta: `useMonitoringSource`.

Importa arquivos locais: [src/modules/monitoring/data/demo.js](../../src/modules/monitoring/data/demo.js), [src/modules/monitoring/data/monitoringClient.js](../../src/modules/monitoring/data/monitoringClient.js).

Importado por: [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/DashboardCatalog.jsx

**Meu Dashboard · Interface React** — Catálogo de indicadores permitidos e entradas de análises personalizadas; sinaliza fontes carregadas.

[Abrir fonte](../../src/modules/my-dashboard/components/DashboardCatalog.jsx) · Código ou documentação do ponto de referência

Exporta: `DashboardCatalog`.

Importa arquivos locais: [src/modules/my-dashboard/components/DashboardDialog.jsx](../../src/modules/my-dashboard/components/DashboardDialog.jsx), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/DashboardDialog.jsx

**Meu Dashboard · Interface React** — Janela acessível para catálogo, edição e ampliação de blocos.

[Abrir fonte](../../src/modules/my-dashboard/components/DashboardDialog.jsx) · Código ou documentação do ponto de referência

Exporta: `DashboardDialog`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/my-dashboard/components/DashboardCatalog.jsx](../../src/modules/my-dashboard/components/DashboardCatalog.jsx), [src/modules/my-dashboard/components/DashboardTools.jsx](../../src/modules/my-dashboard/components/DashboardTools.jsx), [src/modules/my-dashboard/components/DashboardWidget.jsx](../../src/modules/my-dashboard/components/DashboardWidget.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/DashboardTools.jsx

**Meu Dashboard · Interface React** — Modelos de painel, fontes da sessão, backup e recorte opcional do painel.

[Abrir fonte](../../src/modules/my-dashboard/components/DashboardTools.jsx) · Código ou documentação do ponto de referência

Exporta: `DashboardFilters`, `DashboardSources`, `DashboardTemplates`.

Importa arquivos locais: [src/modules/my-dashboard/components/DashboardDialog.jsx](../../src/modules/my-dashboard/components/DashboardDialog.jsx), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/templates.js](../../src/modules/my-dashboard/domain/templates.js), [src/shared/data/localId.js](../../src/shared/data/localId.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/DashboardWidget.jsx

**Meu Dashboard · Interface React** — Avalia cada bloco e complementos, apresenta fonte/critério e controles de edição e ampliação.

[Abrir fonte](../../src/modules/my-dashboard/components/DashboardWidget.jsx) · Código ou documentação do ponto de referência

Exporta: `DashboardWidget`, `WidgetContext`.

Importa arquivos locais: [src/modules/my-dashboard/components/DashboardDialog.jsx](../../src/modules/my-dashboard/components/DashboardDialog.jsx), [src/modules/my-dashboard/components/WidgetVisualization.jsx](../../src/modules/my-dashboard/components/WidgetVisualization.jsx), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/MyDashboardPage.jsx

**Meu Dashboard · Interface React** — Coordena o espaço pessoal, catálogo, edição, organização e apresentação dos blocos.

[Abrir fonte](../../src/modules/my-dashboard/components/MyDashboardPage.jsx) · Código ou documentação do ponto de referência

Exporta: `MyDashboardPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/modules/my-dashboard/components/DashboardCatalog.jsx](../../src/modules/my-dashboard/components/DashboardCatalog.jsx), [src/modules/my-dashboard/components/DashboardDialog.jsx](../../src/modules/my-dashboard/components/DashboardDialog.jsx), [src/modules/my-dashboard/components/DashboardTools.jsx](../../src/modules/my-dashboard/components/DashboardTools.jsx), [src/modules/my-dashboard/components/DashboardWidget.jsx](../../src/modules/my-dashboard/components/DashboardWidget.jsx), [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/modules/my-dashboard/hooks/DashboardSources.jsx](../../src/modules/my-dashboard/hooks/DashboardSources.jsx), [src/modules/my-dashboard/hooks/useDashboardArrangement.js](../../src/modules/my-dashboard/hooks/useDashboardArrangement.js), [src/modules/my-dashboard/hooks/useDashboardPresentation.js](../../src/modules/my-dashboard/hooks/useDashboardPresentation.js), [src/modules/my-dashboard/hooks/useDashboards.js](../../src/modules/my-dashboard/hooks/useDashboards.js), [src/shared/data/localId.js](../../src/shared/data/localId.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/WidgetEditor.jsx

**Meu Dashboard · Interface React** — Edita métrica, consulta aprovada, apresentação, composição e recorte; valida antes de aplicar.

[Abrir fonte](../../src/modules/my-dashboard/components/WidgetEditor.jsx) · Código ou documentação do ponto de referência

Exporta: `WidgetEditor`.

Importa arquivos locais: [src/modules/my-dashboard/components/DashboardDialog.jsx](../../src/modules/my-dashboard/components/DashboardDialog.jsx), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/shared/data/localId.js](../../src/shared/data/localId.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/components/WidgetVisualization.jsx

**Meu Dashboard · Interface React** — Renderiza cards, barras, colunas, linhas, rosca e tabelas conforme espaço e unidade.

[Abrir fonte](../../src/modules/my-dashboard/components/WidgetVisualization.jsx) · Código ou documentação do ponto de referência

Exporta: `ValuesTable`, `WidgetVisualization`.

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/shared/charts/palette.js](../../src/shared/charts/palette.js).

Importado por: [src/modules/my-dashboard/components/DashboardWidget.jsx](../../src/modules/my-dashboard/components/DashboardWidget.jsx).

Dependências externas: `react`, `recharts`.

### src/modules/my-dashboard/data/dashboardRepository.js

**Meu Dashboard · Dados / transporte** — Persiste configuração local por usuário com validação e proteção de revisão concorrente.

[Abrir fonte](../../src/modules/my-dashboard/data/dashboardRepository.js) · Código ou documentação do ponto de referência

Exporta: `createDashboardRepository`, `dashboardRepository`.

Importa arquivos locais: [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js).

Importado por: [src/modules/my-dashboard/domain/layout.test.js](../../src/modules/my-dashboard/domain/layout.test.js), [src/modules/my-dashboard/hooks/useDashboards.js](../../src/modules/my-dashboard/hooks/useDashboards.js).

### src/modules/my-dashboard/domain/boardActions.js

**Meu Dashboard · Domínio** — Move, redimensiona, copia e transporta configurações em backup sem copiar dados das fontes.

[Abrir fonte](../../src/modules/my-dashboard/domain/boardActions.js) · Código ou documentação do ponto de referência

Exporta: `appendDashboards`, `copyDashboard`, `copyWidget`, `dashboardBackup`, `placeWidget`, `readDashboardBackup`, `widgetDimensions`.

Importa arquivos locais: [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/domain/boardActions.test.js](../../src/modules/my-dashboard/domain/boardActions.test.js), [src/modules/my-dashboard/domain/presentation.test.js](../../src/modules/my-dashboard/domain/presentation.test.js), [src/modules/my-dashboard/hooks/useDashboardArrangement.js](../../src/modules/my-dashboard/hooks/useDashboardArrangement.js), [src/modules/my-dashboard/hooks/useDashboards.js](../../src/modules/my-dashboard/hooks/useDashboards.js).

### src/modules/my-dashboard/domain/boardActions.test.js

**Meu Dashboard · Teste** — Verifica board Actions no contexto de Meu Dashboard. Exemplos: arraste move antes/depois em ambas as direções e não modifica blocos/filtros; dimensões têm encaixe e limites; layouts antigos continuam válidos; cópias recriam IDs e nomes sem compartilhar os filtros nem ultrapassar limites de texto.

[Abrir fonte](../../src/modules/my-dashboard/domain/boardActions.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/my-dashboard/domain/catalog.js

**Meu Dashboard · Domínio** — Define indicadores disponíveis, módulos e permissões herdadas das páginas de origem.

[Abrir fonte](../../src/modules/my-dashboard/domain/catalog.js) · Código ou documentação do ponto de referência

Exporta: `canUseDashboardModule`, `dashboardCatalog`, `dashboardMetric`, `dashboardModules`, `permittedCatalog`.

Importa arquivos locais: [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/modules/my-dashboard/components/DashboardCatalog.jsx](../../src/modules/my-dashboard/components/DashboardCatalog.jsx), [src/modules/my-dashboard/components/DashboardTools.jsx](../../src/modules/my-dashboard/components/DashboardTools.jsx), [src/modules/my-dashboard/components/DashboardWidget.jsx](../../src/modules/my-dashboard/components/DashboardWidget.jsx), [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/customQuery.test.js](../../src/modules/my-dashboard/domain/customQuery.test.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/modules/my-dashboard/domain/presentation.test.js](../../src/modules/my-dashboard/domain/presentation.test.js), [src/modules/my-dashboard/domain/templates.js](../../src/modules/my-dashboard/domain/templates.js).

### src/modules/my-dashboard/domain/customQuery.js

**Meu Dashboard · Domínio** — Agrupa OS/Operacional e calcula medidas aprovadas com denominadores e linhas de origem.

[Abrir fonte](../../src/modules/my-dashboard/domain/customQuery.js) · Código ou documentação do ponto de referência

Exporta: `defaultQuery`, `evaluateCustomQuery`, `queryGroups`, `queryLabels`, `queryMeasures`, `queryUnit`, `validQuery`.

Importa arquivos locais: [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/domain/customQuery.test.js](../../src/modules/my-dashboard/domain/customQuery.test.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js).

### src/modules/my-dashboard/domain/customQuery.test.js

**Meu Dashboard · Teste** — Verifica custom Query no contexto de Meu Dashboard. Exemplos: análise livre mantém granularidade, distintos, zeros, ausências e denominadores; agrupamento temporal exclui datas ausentes, ordena meses e exige cabeçalhos; configuração personalizada é transportável e não admite fórmulas, eixos ou unidades arbitrários.

[Abrir fonte](../../src/modules/my-dashboard/domain/customQuery.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/my-dashboard/domain/evaluate.js

**Meu Dashboard · Domínio** — Adapta fontes autorizadas da sessão às regras dos módulos e às análises personalizadas.

[Abrir fonte](../../src/modules/my-dashboard/domain/evaluate.js) · Código ou documentação do ponto de referência

Exporta: `dashboardFilterOptions`, `dashboardPeriods`, `dateRange`, `evaluateDashboardWidget`, `formatMetric`, `shortDate`, `timestampLabel`.

Importa arquivos locais: [src/modules/consumption/domain/consumptionFilters.js](../../src/modules/consumption/domain/consumptionFilters.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js), [src/modules/monitoring/domain/monitoring.js](../../src/modules/monitoring/domain/monitoring.js), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: [src/modules/my-dashboard/components/DashboardTools.jsx](../../src/modules/my-dashboard/components/DashboardTools.jsx), [src/modules/my-dashboard/components/DashboardWidget.jsx](../../src/modules/my-dashboard/components/DashboardWidget.jsx), [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/components/WidgetVisualization.jsx](../../src/modules/my-dashboard/components/WidgetVisualization.jsx), [src/modules/my-dashboard/domain/customQuery.test.js](../../src/modules/my-dashboard/domain/customQuery.test.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/my-dashboard/domain/presentation.test.js](../../src/modules/my-dashboard/domain/presentation.test.js).

### src/modules/my-dashboard/domain/evaluate.test.js

**Meu Dashboard · Teste** — Verifica evaluate no contexto de Meu Dashboard. Exemplos: o catálogo e o avaliador verificam as permissões antes de ler fontes; fonte não carregada não produz zero e aponta o módulo necessário; OS usa o mesmo período e filtro de cliente do relatório, sem somar bases.

[Abrir fonte](../../src/modules/my-dashboard/domain/evaluate.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/my-dashboard/domain/layout.js

**Meu Dashboard · Domínio** — Valida documentos e blocos, limites, filtros, consultas e compatibilidade das composições.

[Abrir fonte](../../src/modules/my-dashboard/domain/layout.js) · Código ou documentação do ponto de referência

Exporta: `emptyDashboardDocument`, `moveWidget`, `validateDashboardDocument`.

Importa arquivos locais: [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/data/dashboardRepository.js](../../src/modules/my-dashboard/data/dashboardRepository.js), [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/boardActions.test.js](../../src/modules/my-dashboard/domain/boardActions.test.js), [src/modules/my-dashboard/domain/customQuery.test.js](../../src/modules/my-dashboard/domain/customQuery.test.js), [src/modules/my-dashboard/domain/layout.test.js](../../src/modules/my-dashboard/domain/layout.test.js), [src/modules/my-dashboard/domain/presentation.test.js](../../src/modules/my-dashboard/domain/presentation.test.js), [src/modules/my-dashboard/hooks/useDashboards.js](../../src/modules/my-dashboard/hooks/useDashboards.js).

### src/modules/my-dashboard/domain/layout.test.js

**Meu Dashboard · Teste** — Verifica layout no contexto de Meu Dashboard. Exemplos: configurações aceitam apenas escolhas de apresentação e recusam dados, métricas e períodos inválidos; limites do layout são verificados antes de gravar e reordenação conserva configurações; Meu Dashboard deriva das páginas existentes e não cria uma permissão de dados.

[Abrir fonte](../../src/modules/my-dashboard/domain/layout.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/my-dashboard/data/dashboardRepository.js](../../src/modules/my-dashboard/data/dashboardRepository.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/my-dashboard/domain/presentation.js

**Meu Dashboard · Domínio** — Define formatos compatíveis, comparação de eixos/unidades, herança de filtros e seções.

[Abrir fonte](../../src/modules/my-dashboard/domain/presentation.js) · Código ou documentação do ponto de referência

Exporta: `canCompare`, `compareSeries`, `donutSeries`, `effectiveWidget`, `kindLabels`, `metricKinds`, `organizeSections`, `sizeLabels`, `widgetParts`.

Importa arquivos locais: [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js).

Importado por: [src/modules/my-dashboard/components/DashboardWidget.jsx](../../src/modules/my-dashboard/components/DashboardWidget.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/components/WidgetVisualization.jsx](../../src/modules/my-dashboard/components/WidgetVisualization.jsx), [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/customQuery.test.js](../../src/modules/my-dashboard/domain/customQuery.test.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.test.js](../../src/modules/my-dashboard/domain/presentation.test.js).

### src/modules/my-dashboard/domain/presentation.test.js

**Meu Dashboard · Teste** — Verifica presentation no contexto de Meu Dashboard. Exemplos: formatos respeitam a natureza do indicador; roscas não somam agentes sobrepostos; rosca agrega a cauda mantendo o total e recusa ausências/negativos; comparações requerem eixo/unidade compatíveis e preservam ausência versus zero.

[Abrir fonte](../../src/modules/my-dashboard/domain/presentation.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/my-dashboard/domain/presentation.js](../../src/modules/my-dashboard/domain/presentation.js), [src/modules/my-dashboard/domain/templates.js](../../src/modules/my-dashboard/domain/templates.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/my-dashboard/domain/templates.js

**Meu Dashboard · Domínio** — Fornece painéis iniciais permitidos para gestão, suporte, parque e consumo.

[Abrir fonte](../../src/modules/my-dashboard/domain/templates.js) · Código ou documentação do ponto de referência

Exporta: `createTemplate`, `dashboardTemplates`, `templateMetrics`.

Importa arquivos locais: [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js).

Importado por: [src/modules/my-dashboard/components/DashboardTools.jsx](../../src/modules/my-dashboard/components/DashboardTools.jsx), [src/modules/my-dashboard/domain/presentation.test.js](../../src/modules/my-dashboard/domain/presentation.test.js).

### src/modules/my-dashboard/hooks/DashboardSources.jsx

**Meu Dashboard · Estado / coordenação** — Publica fontes autorizadas carregadas na sessão e as compartilha com Meu Dashboard.

[Abrir fonte](../../src/modules/my-dashboard/hooks/DashboardSources.jsx) · Código ou documentação do ponto de referência

Exporta: `DashboardSourcesProvider`, `useDashboardSources`, `usePublishDashboardSource`.

Importa arquivos locais: [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/orders/hooks/ZohoSession.jsx](../../src/modules/orders/hooks/ZohoSession.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/hooks/useDashboardArrangement.js

**Meu Dashboard · Estado / coordenação** — Controla gestos de arraste e redimensionamento com encaixe e alternativa por teclado.

[Abrir fonte](../../src/modules/my-dashboard/hooks/useDashboardArrangement.js) · Código ou documentação do ponto de referência

Exporta: `useDashboardArrangement`.

Importa arquivos locais: [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/hooks/useDashboardPresentation.js

**Meu Dashboard · Estado / coordenação** — Controla apresentação, tela cheia e impressão do painel.

[Abrir fonte](../../src/modules/my-dashboard/hooks/useDashboardPresentation.js) · Código ou documentação do ponto de referência

Exporta: `useDashboardPresentation`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/my-dashboard/hooks/useDashboards.js

**Meu Dashboard · Estado / coordenação** — Coordena edição, salvamento, descarte, histórico de desfazer e concorrência do repositório.

[Abrir fonte](../../src/modules/my-dashboard/hooks/useDashboards.js) · Código ou documentação do ponto de referência

Exporta: `useDashboards`.

Importa arquivos locais: [src/modules/my-dashboard/data/dashboardRepository.js](../../src/modules/my-dashboard/data/dashboardRepository.js), [src/modules/my-dashboard/domain/boardActions.js](../../src/modules/my-dashboard/domain/boardActions.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/shared/data/localId.js](../../src/shared/data/localId.js).

Importado por: [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx).

Dependências externas: `react`.

### src/modules/operational/components/OperationalPage.jsx

**Operacional · Interface React** — Compartilha a base operacional entre revisão e Parque e Manutenção, mantendo filtros e categorias da página.

[Abrir fonte](../../src/modules/operational/components/OperationalPage.jsx) · Código ou documentação do ponto de referência

Exporta: `OperationalPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/components/AnalysisMetrics.jsx](../../src/components/AnalysisMetrics.jsx), [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/MultiFilter.jsx](../../src/components/MultiFilter.jsx), [src/components/PageSettings.jsx](../../src/components/PageSettings.jsx), [src/components/PeriodFilter.jsx](../../src/components/PeriodFilter.jsx), [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/components/ReviewPanel.jsx](../../src/components/ReviewPanel.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/components/ViewState.jsx](../../src/components/ViewState.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/operational/config/operationalMenus.js](../../src/modules/operational/config/operationalMenus.js), [src/modules/operational/config/reportStories.js](../../src/modules/operational/config/reportStories.js), [src/modules/operational/domain/googleOperational.js](../../src/modules/operational/domain/googleOperational.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/operational/domain/operationalRecords.js](../../src/modules/operational/domain/operationalRecords.js), [src/modules/orders/components/OrdersGooglePanel.jsx](../../src/modules/orders/components/OrdersGooglePanel.jsx), [src/modules/orders/hooks/useGoogleOrders.js](../../src/modules/orders/hooks/useGoogleOrders.js), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js), [src/shared/filters/useScopedSelection.js](../../src/shared/filters/useScopedSelection.js), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx), [src/shared/layout/ReportStories.jsx](../../src/shared/layout/ReportStories.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/operational/config/operationalMenus.js

**Operacional · Catálogo** — Define as seções visíveis conforme a categoria escolhida no operacional ou em Parque e Manutenção.

[Abrir fonte](../../src/modules/operational/config/operationalMenus.js) · Código ou documentação do ponto de referência

Exporta: `crossAnalysisMenus`, `hiddenByOperationalMenu`, `operationalMenus`.

Importa arquivos locais: [src/modules/logistics/domain/logistics.js](../../src/modules/logistics/domain/logistics.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/operational/config/reportStories.js

**Operacional · Catálogo** — Parque: fotografia, manutenção vinculada e origem permanecem conceitos separados.

[Abrir fonte](../../src/modules/operational/config/reportStories.js) · Código ou documentação do ponto de referência

Exporta: `parkStories`.

Importa arquivos locais: [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/operational/domain/googleOperational.js

**Operacional · Domínio** — Valida o retrato Google da aba operacional e o adapta à mesma leitura usada no arquivo local.

[Abrir fonte](../../src/modules/operational/domain/googleOperational.js) · Código ou documentação do ponto de referência

Exporta: `importGoogleOperational`.

Importa arquivos locais: [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/data/googleOrders.js](../../src/modules/orders/data/googleOrders.js), [src/shared/data/googleOrdersSnapshot.js](../../src/shared/data/googleOrdersSnapshot.js).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/operational/domain/operational.test.js](../../src/modules/operational/domain/operational.test.js).

### src/modules/operational/domain/operational.js

**Operacional · Domínio** — Importa e normaliza a fotografia operacional; filtra, resume e cruza equipamentos com o histórico de OS.

[Abrir fonte](../../src/modules/operational/domain/operational.js) · Código ou documentação do ponto de referência

Exporta: `importOperational`, `importOperationalSheet`, `linkOperational`, `operationalCell`, `operationalDate`, `operationalFields`, `operationalLayout`.

Importa arquivos locais: [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs), [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/data/consumptionHistory.test.js](../../src/modules/consumption/data/consumptionHistory.test.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/my-dashboard/domain/customQuery.test.js](../../src/modules/my-dashboard/domain/customQuery.test.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/operational/domain/googleOperational.js](../../src/modules/operational/domain/googleOperational.js), [src/modules/operational/domain/operational.test.js](../../src/modules/operational/domain/operational.test.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/modules/park/domain/parkAnalysis.test.js](../../src/modules/park/domain/parkAnalysis.test.js).

Dependências externas: `xlsx`.

### src/modules/operational/domain/operational.test.js

**Operacional · Teste** — Verifica operational no contexto de Operacional. Exemplos: Google Operacional conserva dados, zeros, datas, custos e revisão do mesmo arquivo Excel; layout compacto preserva campos, endereços e vínculos sem importar resumos auxiliares; layout compacto bloqueia cabeçalhos ausentes, erros no serial e vínculos duplicados.

[Abrir fonte](../../src/modules/operational/domain/operational.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/data/consumptionHistory.js](../../src/modules/consumption/data/consumptionHistory.js), [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/operational/domain/googleOperational.js](../../src/modules/operational/domain/googleOperational.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/operational/domain/operationalRecords.js

**Operacional · Domínio** — Busca, ordena e prepara a conferência dos registros operacionais antes da paginação.

[Abrir fonte](../../src/modules/operational/domain/operationalRecords.js) · Código ou documentação do ponto de referência

Exporta: `sortOperationalRecords`.

Importa arquivos locais: [src/shared/data/sorting.js](../../src/shared/data/sorting.js).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/operational/domain/operationalRecords.test.js](../../src/modules/operational/domain/operationalRecords.test.js).

### src/modules/operational/domain/operationalRecords.test.js

**Operacional · Teste** — Verifica operational Records no contexto de Operacional. Exemplos: operacional ordena o recorte completo antes das páginas, mantém origem e retorna à ordem original; seriais longos mantêm precisão textual; empates preservam linha e ausências ficam no fim em ambas as direções.

[Abrir fonte](../../src/modules/operational/domain/operationalRecords.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/operational/domain/operationalRecords.js](../../src/modules/operational/domain/operationalRecords.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/components/AdvancedInsights.jsx

**Ordens de Serviço · Interface React** — Apresenta análises estratégicas de custos, retornos, perfis e evolução, com origem e exportação.

[Abrir fonte](../../src/modules/orders/components/AdvancedInsights.jsx) · Código ou documentação do ponto de referência

Exporta: `AdvancedInsights`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/CustomerIdentityNote.jsx](../../src/modules/orders/components/CustomerIdentityNote.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/ServiceProfilesContext.jsx](../../src/modules/orders/components/ServiceProfilesContext.jsx), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/insightExport.js](../../src/modules/orders/domain/insightExport.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/shared/charts/palette.js](../../src/shared/charts/palette.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/CardInsights.jsx

**Ordens de Serviço · Interface React** — Apresenta resumos de motivos de manutenção e composição dos serviços.

[Abrir fonte](../../src/modules/orders/components/CardInsights.jsx) · Código ou documentação do ponto de referência

Exporta: `MaintenanceSummary`, `ServiceProfileSummary`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/modules/orders/domain/cardInsights.js](../../src/modules/orders/domain/cardInsights.js).

Importado por: [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/ServiceProfilesContext.jsx](../../src/modules/orders/components/ServiceProfilesContext.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ContractSummary.jsx

**Ordens de Serviço · Interface React** — Apresenta valores contratuais e a separação de cobrança ao cliente e absorção Addlog.

[Abrir fonte](../../src/modules/orders/components/ContractSummary.jsx) · Código ou documentação do ponto de referência

Exporta: `ContractSummary`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/modules/orders/domain/contracts.js](../../src/modules/orders/domain/contracts.js).

Importado por: [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx).

Dependências externas: `react`.

### src/modules/orders/components/CustomerIdentityNote.jsx

**Ordens de Serviço · Interface React** — Explica a identidade por CNPJ e o agrupamento analítico de clientes em uso.

[Abrir fonte](../../src/modules/orders/components/CustomerIdentityNote.jsx) · Código ou documentação do ponto de referência

Exporta: `CustomerIdentityNote`.

Importa arquivos locais: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js).

Importado por: [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx).

Dependências externas: `react`.

### src/modules/orders/components/DashboardOverview.jsx

**Ordens de Serviço · Interface React** — Coordena síntese, agenda, destaques, atalhos de apresentação e gráficos incorporados da Visão geral.

[Abrir fonte](../../src/modules/orders/components/DashboardOverview.jsx) · Código ou documentação do ponto de referência

Exporta: `DashboardOverview`.

Importa arquivos locais: [src/components/AttentionPanel.jsx](../../src/components/AttentionPanel.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/OverviewKpis.jsx](../../src/modules/orders/components/OverviewKpis.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/SupportZohoOverview.jsx](../../src/modules/orders/components/SupportZohoOverview.jsx), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/management.js](../../src/modules/orders/domain/management.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/shared/charts/palette.js](../../src/shared/charts/palette.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`, `recharts`.

### src/modules/orders/components/DescriptiveReport.jsx

**Ordens de Serviço · Interface React** — Interface do relatório descritivo com medidas, critérios, agrupamentos e exportação.

[Abrir fonte](../../src/modules/orders/components/DescriptiveReport.jsx) · Código ou documentação do ponto de referência

Exporta: `DescriptiveReport`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/descriptive.js](../../src/modules/orders/domain/descriptive.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/Explorers.jsx

**Ordens de Serviço · Interface React** — Exploração de agrupamentos/medidas e histórico por identificador; salva configurações locais.

[Abrir fonte](../../src/modules/orders/components/Explorers.jsx) · Código ou documentação do ponto de referência

Exporta: `Explorers`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/reports.js](../../src/modules/orders/domain/reports.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/data/localId.js](../../src/shared/data/localId.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ExtendedInsights.jsx

**Ordens de Serviço · Interface React** — Análises complementares por grupos de cliente, cobrança e geografia, com linhas de origem.

[Abrir fonte](../../src/modules/orders/components/ExtendedInsights.jsx) · Código ou documentação do ponto de referência

Exporta: `ExtendedInsights`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/FieldLifeCards.jsx

**Ordens de Serviço · Interface React** — Cards dos ciclos e durações observadas, distinguindo bases e estados.

[Abrir fonte](../../src/modules/orders/components/FieldLifeCards.jsx) · Código ou documentação do ponto de referência

Exporta: `FieldLifeCards`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx).

Importado por: [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx).

Dependências externas: `react`.

### src/modules/orders/components/FieldLifePanel.jsx

**Ordens de Serviço · Interface React** — Conferência e apresentação das durações/ciclos com referência temporal e exportação.

[Abrir fonte](../../src/modules/orders/components/FieldLifePanel.jsx) · Código ou documentação do ponto de referência

Exporta: `FieldLifePanel`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/FieldLifeCards.jsx](../../src/modules/orders/components/FieldLifeCards.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/fieldLifeSummary.js](../../src/modules/orders/domain/fieldLifeSummary.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/GeographyComparison.jsx

**Ordens de Serviço · Interface React** — Compara regiões no recorte e apresenta volume, valores e origem.

[Abrir fonte](../../src/modules/orders/components/GeographyComparison.jsx) · Código ou documentação do ponto de referência

Exporta: `GeographyComparison`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/shared/charts/chartRules.js](../../src/shared/charts/chartRules.js), [src/shared/charts/palette.js](../../src/shared/charts/palette.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx).

Dependências externas: `react`.

### src/modules/orders/components/MaintenanceMatrix.jsx

**Ordens de Serviço · Interface React** — Matriz de modelo por motivo com cobertura e acesso às linhas originais.

[Abrir fonte](../../src/modules/orders/components/MaintenanceMatrix.jsx) · Código ou documentação do ponto de referência

Exporta: `MaintenanceMatrix`.

Importa arquivos locais: [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/maintenanceMatrix.js](../../src/modules/orders/domain/maintenanceMatrix.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ManagementOverview.jsx

**Ordens de Serviço · Interface React** — Resumo gerencial de execução, clientes e agenda sobre resultados de managementMetrics.

[Abrir fonte](../../src/modules/orders/components/ManagementOverview.jsx) · Código ou documentação do ponto de referência

Exporta: `ManagementOverview`.

Importa arquivos locais: [src/components/BarChart.jsx](../../src/components/BarChart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/management.js](../../src/modules/orders/domain/management.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `react`.

### src/modules/orders/components/OrdersFiltersPanel.jsx

**Ordens de Serviço · Interface React** — Quadro de filtros OS por categoria, período, seleções e ações dos relatórios.

[Abrir fonte](../../src/modules/orders/components/OrdersFiltersPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersFiltersPanel`.

Importa arquivos locais: [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/MultiFilter.jsx](../../src/components/MultiFilter.jsx), [src/components/PeriodFilter.jsx](../../src/components/PeriodFilter.jsx), [src/components/ReportControls.jsx](../../src/components/ReportControls.jsx), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersGooglePanel.jsx

**Ordens de Serviço · Interface React** — Interface da fonte Google: estado, atualização e troca da origem OS/Operacional.

[Abrir fonte](../../src/modules/orders/components/OrdersGooglePanel.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersGooglePanel`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersImportPanel.jsx

**Ordens de Serviço · Interface React** — Seleção do arquivo OS, feedback de leitura e informações da fonte atual.

[Abrir fonte](../../src/modules/orders/components/OrdersImportPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersImportPanel`.

Importa arquivos locais: [src/components/PageSettings.jsx](../../src/components/PageSettings.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersLifecyclePanel.jsx

**Ordens de Serviço · Interface React** — Tabela do tempo observado em campo, com data de referência e filtro de situação.

[Abrir fonte](../../src/modules/orders/components/OrdersLifecyclePanel.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersLifecyclePanel`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersPage.jsx

**Ordens de Serviço · Interface React** — Controlador OS: conecta sessão, categoria, apresentação, permissões, Zoho e relatórios.

[Abrir fonte](../../src/modules/orders/components/OrdersPage.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/OrdersGooglePanel.jsx](../../src/modules/orders/components/OrdersGooglePanel.jsx), [src/modules/orders/components/OrdersImportPanel.jsx](../../src/modules/orders/components/OrdersImportPanel.jsx), [src/modules/orders/components/OrdersReportMenu.jsx](../../src/modules/orders/components/OrdersReportMenu.jsx), [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx), [src/modules/orders/components/SupportZohoPanel.jsx](../../src/modules/orders/components/SupportZohoPanel.jsx), [src/modules/orders/config/dashboardCategories.js](../../src/modules/orders/config/dashboardCategories.js), [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/modules/orders/hooks/ZohoSession.jsx](../../src/modules/orders/hooks/ZohoSession.jsx), [src/modules/orders/hooks/useGoogleOrders.js](../../src/modules/orders/hooks/useGoogleOrders.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersRecordsPanel.jsx

**Ordens de Serviço · Interface React** — Pesquisa, paginação e conferência das linhas originais da planilha OS.

[Abrir fonte](../../src/modules/orders/components/OrdersRecordsPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersRecordsPanel`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReviewPanel.jsx](../../src/components/ReviewPanel.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersReportMenu.jsx

**Ordens de Serviço · Interface React** — Apresenta a seleção das categorias de análise OS.

[Abrir fonte](../../src/modules/orders/components/OrdersReportMenu.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersCategories`.

Importa arquivos locais: [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx), [src/modules/orders/config/dashboardCategories.js](../../src/modules/orders/config/dashboardCategories.js).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersReports.jsx

**Ordens de Serviço · Interface React** — Distribui relatórios e grupos conforme categoria, preferências e disponibilidade de dados.

[Abrir fonte](../../src/modules/orders/components/OrdersReports.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersReports`.

Importa arquivos locais: [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/OrdersRecordsPanel.jsx](../../src/modules/orders/components/OrdersRecordsPanel.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/orders/config/reportStories.js](../../src/modules/orders/config/reportStories.js), [src/shared/layout/ReportStories.jsx](../../src/shared/layout/ReportStories.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersSwapsPanel.jsx

**Ordens de Serviço · Interface React** — Apresenta eventos de troca, equipamentos e linhas que confirmam os eventos.

[Abrir fonte](../../src/modules/orders/components/OrdersSwapsPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersSwapsPanel`.

Importa arquivos locais: [src/components/BarChart.jsx](../../src/components/BarChart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OrdersTotalsPanels.jsx

**Ordens de Serviço · Interface React** — Painéis de volume mensal, finanças, operações e chamados distintos.

[Abrir fonte](../../src/modules/orders/components/OrdersTotalsPanels.jsx) · Código ou documentação do ponto de referência

Exporta: `OrdersCallsPanel`, `OrdersFinancePanel`, `OrdersMonthlyPanel`, `OrdersOperationsPanel`.

Importa arquivos locais: [src/components/BarChart.jsx](../../src/components/BarChart.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/ContractSummary.jsx](../../src/modules/orders/components/ContractSummary.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OverviewInlinePanels.jsx

**Ordens de Serviço · Interface React** — Reutiliza análises de operação, custos, suporte, equipamentos e parque dentro da Visão geral.

[Abrir fonte](../../src/modules/orders/components/OverviewInlinePanels.jsx) · Código ou documentação do ponto de referência

Exporta: `OverviewInlinePanel`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/orders/components/CardInsights.jsx](../../src/modules/orders/components/CardInsights.jsx), [src/modules/orders/components/ContractSummary.jsx](../../src/modules/orders/components/ContractSummary.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/SupportMetricCards.jsx](../../src/modules/orders/components/SupportMetricCards.jsx), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js).

Importado por: [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx).

Dependências externas: `react`.

### src/modules/orders/components/OverviewKpis.jsx

**Ordens de Serviço · Interface React** — Apresenta os indicadores calculados e suas comparações na Visão geral.

[Abrir fonte](../../src/modules/orders/components/OverviewKpis.jsx) · Código ou documentação do ponto de referência

Exporta: `OverviewKpis`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/modules/orders/config/metricHelp.js](../../src/modules/orders/config/metricHelp.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js).

Importado por: [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx).

Dependências externas: `react`.

### src/modules/orders/components/RecordDetails.jsx

**Ordens de Serviço · Interface React** — Conferência das linhas de origem e detalhamento mensal; sem alterar os registros.

[Abrir fonte](../../src/modules/orders/components/RecordDetails.jsx) · Código ou documentação do ponto de referência

Exporta: `MonthlyBreakdown`, `RecordDetails`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/orders/domain/reports.js](../../src/modules/orders/domain/reports.js).

Importado por: [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/components/ManagementOverview.jsx](../../src/modules/orders/components/ManagementOverview.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/components/ServiceProfilesContext.jsx](../../src/modules/orders/components/ServiceProfilesContext.jsx), [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx), [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ReplacementRankings.jsx

**Ordens de Serviço · Interface React** — Rankings de eventos de troca por cliente/placa/categoria, com conferência.

[Abrir fonte](../../src/modules/orders/components/ReplacementRankings.jsx) · Código ou documentação do ponto de referência

Exporta: `ReplacementRankings`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/replacementRankings.js](../../src/modules/orders/domain/replacementRankings.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ServiceProfilesContext.jsx

**Ordens de Serviço · Interface React** — Contexto visual dos perfis de serviço, volumes e custos.

[Abrir fonte](../../src/modules/orders/components/ServiceProfilesContext.jsx) · Código ou documentação do ponto de referência

Exporta: `ServiceProfilesContext`.

Importa arquivos locais: [src/modules/orders/components/CardInsights.jsx](../../src/modules/orders/components/CardInsights.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SummaryCards.jsx

**Ordens de Serviço · Interface React** — Apresenta cards de síntese recebendo as métricas já calculadas.

[Abrir fonte](../../src/modules/orders/components/SummaryCards.jsx) · Código ou documentação do ponto de referência

Exporta: `SummaryCards`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/config/metricHelp.js](../../src/modules/orders/config/metricHelp.js), [src/modules/orders/domain/summary.js](../../src/modules/orders/domain/summary.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportComparison.jsx

**Ordens de Serviço · Interface React** — Apresentação conjunta do suporte; cada papel conserva métricas, comparação e origem independentes.

[Abrir fonte](../../src/modules/orders/components/SupportComparison.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportComparison`.

Importa arquivos locais: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/SupportComparisonCharts.jsx](../../src/modules/orders/components/SupportComparisonCharts.jsx), [src/modules/orders/components/SupportContext.jsx](../../src/modules/orders/components/SupportContext.jsx), [src/modules/orders/components/SupportMetricCards.jsx](../../src/modules/orders/components/SupportMetricCards.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/domain/supportComparison.js](../../src/modules/orders/domain/supportComparison.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportComparisonCharts.jsx

**Ordens de Serviço · Interface React** — Gráficos dos dois papéis: barras por pessoa e evolução com datas independentes.

[Abrir fonte](../../src/modules/orders/components/SupportComparisonCharts.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportComparisonBars`, `SupportComparisonEvolution`.

Importa arquivos locais: [src/modules/orders/domain/supportComparison.js](../../src/modules/orders/domain/supportComparison.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx).

Dependências externas: `react`, `recharts`.

### src/modules/orders/components/SupportContext.jsx

**Ordens de Serviço · Interface React** — Critérios e exclusões acessíveis sem competir com a leitura dos indicadores.

[Abrir fonte](../../src/modules/orders/components/SupportContext.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportContext`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportControls.jsx

**Ordens de Serviço · Interface React** — Um único recorte: os controles escrevem nos mesmos filtros da categoria.

[Abrir fonte](../../src/modules/orders/components/SupportControls.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportControls`.

Importa arquivos locais: [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js).

Importado por: [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportMetricCards.jsx

**Ordens de Serviço · Interface React** — Identidade dos indicadores do suporte; a interface recebe valores prontos do domínio.

[Abrir fonte](../../src/modules/orders/components/SupportMetricCards.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportDelta`, `SupportMetricCards`, `supportNumber`, `supportPercent`.

Importa arquivos locais: [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx).

Importado por: [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportPeople.jsx

**Ordens de Serviço · Interface React** — Cards de pessoas e investigação local, sem transformar a busca visual em filtro dos relatórios.

[Abrir fonte](../../src/modules/orders/components/SupportPeople.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportPeople`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/Icon.jsx](../../src/components/Icon.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/SupportMetricCards.jsx](../../src/modules/orders/components/SupportMetricCards.jsx), [src/modules/orders/domain/supportPerson.js](../../src/modules/orders/domain/supportPerson.js), [src/modules/orders/domain/supportReport.js](../../src/modules/orders/domain/supportReport.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportPerformance.jsx

**Ordens de Serviço · Interface React** — Visão da equipe: usa o mesmo arquivo/filtros de OS, com execução e agendamento independentes.

[Abrir fonte](../../src/modules/orders/components/SupportPerformance.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportPerformance`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportContext.jsx](../../src/modules/orders/components/SupportContext.jsx), [src/modules/orders/components/SupportControls.jsx](../../src/modules/orders/components/SupportControls.jsx), [src/modules/orders/components/SupportMetricCards.jsx](../../src/modules/orders/components/SupportMetricCards.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/domain/supportReport.js](../../src/modules/orders/domain/supportReport.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportZohoActivity.jsx

**Ordens de Serviço · Interface React** — Controles e detalhamento da atividade Zoho por período, agente, apontamentos e respostas.

[Abrir fonte](../../src/modules/orders/components/SupportZohoActivity.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportZohoActivity`.

Importa arquivos locais: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/modules/orders/components/ZohoClosures.jsx](../../src/modules/orders/components/ZohoClosures.jsx), [src/modules/orders/data/zohoActivityClient.js](../../src/modules/orders/data/zohoActivityClient.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/hooks/ZohoSession.jsx](../../src/modules/orders/hooks/ZohoSession.jsx), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: [src/modules/orders/components/SupportZohoPanel.jsx](../../src/modules/orders/components/SupportZohoPanel.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportZohoOverview.jsx

**Ordens de Serviço · Interface React** — Resumo Zoho compacto na Visão geral, reaproveitando a coleta da equipe.

[Abrir fonte](../../src/modules/orders/components/SupportZohoOverview.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportZohoOverview`.

Importa arquivos locais: [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/modules/orders/hooks/ZohoSession.jsx](../../src/modules/orders/hooks/ZohoSession.jsx), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx).

Dependências externas: `react`.

### src/modules/orders/components/SupportZohoPanel.jsx

**Ordens de Serviço · Interface React** — Reúne atividade Zoho, vínculos e conferência da conexão na mesma seção de equipe.

[Abrir fonte](../../src/modules/orders/components/SupportZohoPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `SupportZohoPanel`.

Importa arquivos locais: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/components/Technicians.jsx

**Ordens de Serviço · Interface React** — Apresenta o ranking por código do técnico, nome e componentes de custo, com detalhamento de origem.

[Abrir fonte](../../src/modules/orders/components/Technicians.jsx) · Código ou documentação do ponto de referência

Exporta: `Technicians`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/domain/technicians.js](../../src/modules/orders/domain/technicians.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ZohoActivitySummary.jsx

**Ordens de Serviço · Interface React** — Mesma coleta nas duas telas; a Visão geral usa a apresentação compacta.

[Abrir fonte](../../src/modules/orders/components/ZohoActivitySummary.jsx) · Código ou documentação do ponto de referência

Exporta: `ZohoActivitySummary`, `zohoDuration`.

Importa arquivos locais: [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/ZohoColumnPicker.jsx](../../src/modules/orders/components/ZohoColumnPicker.jsx), [src/modules/orders/hooks/ZohoSession.jsx](../../src/modules/orders/hooks/ZohoSession.jsx), [src/shared/charts/palette.js](../../src/shared/charts/palette.js).

Importado por: [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/modules/orders/components/SupportZohoOverview.jsx](../../src/modules/orders/components/SupportZohoOverview.jsx), [src/modules/orders/components/ZohoClosures.jsx](../../src/modules/orders/components/ZohoClosures.jsx).

Dependências externas: `react`, `recharts`.

### src/modules/orders/components/ZohoClosures.jsx

**Ordens de Serviço · Interface React** — Tabela dos eventos de fechamento, executor histórico, responsável atual e contribuições de tempo por agente.

[Abrir fonte](../../src/modules/orders/components/ZohoClosures.jsx) · Código ou documentação do ponto de referência

Exporta: `ZohoClosures`.

Importa arquivos locais: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/modules/orders/components/ZohoColumnPicker.jsx](../../src/modules/orders/components/ZohoColumnPicker.jsx), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js).

Importado por: [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx).

Dependências externas: `react`.

### src/modules/orders/components/ZohoColumnPicker.jsx

**Ordens de Serviço · Interface React** — Permite escolher e restaurar colunas visíveis das tabelas de atividade Zoho.

[Abrir fonte](../../src/modules/orders/components/ZohoColumnPicker.jsx) · Código ou documentação do ponto de referência

Exporta: `ZohoColumnPicker`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/modules/orders/components/ZohoClosures.jsx](../../src/modules/orders/components/ZohoClosures.jsx).

Dependências externas: `react`.

### src/modules/orders/config/dashboardCategories.js

**Ordens de Serviço · Catálogo** — Combina a categoria ativa com as preferências de exibição, sem eliminar dados da sessão.

[Abrir fonte](../../src/modules/orders/config/dashboardCategories.js) · Código ou documentação do ponto de referência

Exporta: `categoryVisibility`, `dashboardCategories`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/components/OrdersReportMenu.jsx](../../src/modules/orders/components/OrdersReportMenu.jsx), [src/modules/orders/domain/management.test.js](../../src/modules/orders/domain/management.test.js), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/orders/config/metricHelp.js

**Ordens de Serviço · Catálogo** — Textos de apoio para leitura financeira e operacional; não executam nem alteram cálculos.

[Abrir fonte](../../src/modules/orders/config/metricHelp.js) · Código ou documentação do ponto de referência

Exporta: `metricHelp`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/OverviewKpis.jsx](../../src/modules/orders/components/OverviewKpis.jsx), [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx).

### src/modules/orders/config/preferences.js

**Ordens de Serviço · Catálogo** — Aceita apenas as seções conhecidas e mantém seções novas visíveis por padrão.

[Abrir fonte](../../src/modules/orders/config/preferences.js) · Código ou documentação do ponto de referência

Exporta: `cleanPreferences`, `legacyOrderLayout`, `orderLayoutDefinitions`, `sectionLabels`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/components/OrdersRecordsPanel.jsx](../../src/modules/orders/components/OrdersRecordsPanel.jsx), [src/modules/orders/components/OrdersSwapsPanel.jsx](../../src/modules/orders/components/OrdersSwapsPanel.jsx), [src/modules/orders/components/OrdersTotalsPanels.jsx](../../src/modules/orders/components/OrdersTotalsPanels.jsx), [src/shared/charts/chartRules.test.js](../../src/shared/charts/chartRules.test.js), [src/shared/layout/pageLayout.test.js](../../src/shared/layout/pageLayout.test.js), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/orders/config/reportStories.js

**Ordens de Serviço · Catálogo** — Navegação analítica: nomes históricos identificam as análises; o grupo só organiza a leitura.

[Abrir fonte](../../src/modules/orders/config/reportStories.js) · Código ou documentação do ponto de referência

Exporta: `allOrderStories`, `orderStories`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx), [src/shared/layout/reportCatalogs.test.js](../../src/shared/layout/reportCatalogs.test.js).

### src/modules/orders/data/customerRegistry.js

**Ordens de Serviço · Dados / transporte** — Lê identidade e agrupamento opcional; preços e demais campos do cadastro não são importados.

[Abrir fonte](../../src/modules/orders/data/customerRegistry.js) · Código ou documentação do ponto de referência

Exporta: `importCustomerRegistry`.

Importa arquivos locais: [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js).

Importado por: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js).

Dependências externas: `xlsx`.

### src/modules/orders/data/googleOrders.js

**Ordens de Serviço · Dados / transporte** — Adapta os valores do Google para a mesma leitura de OS usada no Excel.

[Abrir fonte](../../src/modules/orders/data/googleOrders.js) · Código ou documentação do ponto de referência

Exporta: `googleSnapshotToSheet`, `importGoogleOrders`.

Importa arquivos locais: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/shared/data/googleOrdersSnapshot.js](../../src/shared/data/googleOrdersSnapshot.js).

Importado por: [src/modules/operational/domain/googleOperational.js](../../src/modules/operational/domain/googleOperational.js), [src/modules/orders/data/googleOrders.test.js](../../src/modules/orders/data/googleOrders.test.js), [src/modules/orders/hooks/useGoogleOrders.js](../../src/modules/orders/hooks/useGoogleOrders.js).

Dependências externas: `xlsx`.

### src/modules/orders/data/googleOrders.test.js

**Ordens de Serviço · Teste** — Verifica google Orders no contexto de Ordens de Serviço. Exemplos: Google preserva mesmas colunas, ordens, valores, erros, zeros de ID e financeiros do leitor Excel; Google recusa aba, cabeçalho, célula, limite e base vazia inesperados sem truncar dados.

[Abrir fonte](../../src/modules/orders/data/googleOrders.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/data/googleOrders.js](../../src/modules/orders/data/googleOrders.js), [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/orders/data/import.js

**Ordens de Serviço · Dados / transporte** — Reconhece o nome atual ou legado sem escolher silenciosamente entre duas bases de OS.

[Abrir fonte](../../src/modules/orders/data/import.js) · Código ou documentação do ponto de referência

Exporta: `findOrdersSheetName`, `importOrdersSheet`, `importWorkbook`, `ordersSheetNames`.

Importa arquivos locais: [src/modules/orders/data/customerRegistry.js](../../src/modules/orders/data/customerRegistry.js).

Importado por: [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs), [src/modules/imports/domain/bulkImport.js](../../src/modules/imports/domain/bulkImport.js), [src/modules/orders/data/googleOrders.js](../../src/modules/orders/data/googleOrders.js), [src/modules/orders/data/googleOrders.test.js](../../src/modules/orders/data/googleOrders.test.js), [src/modules/orders/data/import.test.js](../../src/modules/orders/data/import.test.js), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/customerIdentity.test.js](../../src/modules/orders/domain/customerIdentity.test.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js), [src/shared/data/filters.test.js](../../src/shared/data/filters.test.js).

Dependências externas: `xlsx`.

### src/modules/orders/data/import.test.js

**Ordens de Serviço · Teste** — Verifica import no contexto de Ordens de Serviço. Exemplos: aba atual e legada preservam os mesmos valores, cabeçalhos, chamadas e linhas de origem; não escolhe outra aba ou mistura duas bases reconhecidas; aba atual vazia informa o nome correto; preserva linhas repetidas, cabeçalhos repetidos, vazios e erros.

[Abrir fonte](../../src/modules/orders/data/import.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:fs`, `node:test`, `xlsx`.

### src/modules/orders/data/zohoActivityClient.js

**Ordens de Serviço · Dados / transporte** — Só entrega uma coleta quando todas as páginas terminam. Falhas/cancelamento descartam o lote.

[Abrir fonte](../../src/modules/orders/data/zohoActivityClient.js) · Código ou documentação do ponto de referência

Exporta: `loadZohoActivity`.

Importa arquivos locais: [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [server/zohoActivity.test.js](../../server/zohoActivity.test.js), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx).

### src/modules/orders/domain/analysis.js

**Ordens de Serviço · Domínio** — Converte valores monetários válidos em centavos e totaliza realizados, componentes de custo e resumo, preservando ausências.

[Abrir fonte](../../src/modules/orders/domain/analysis.js) · Código ou documentação do ponto de referência

Exporta: `finance`, `money`, `summarize`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/orders/data/googleOrders.test.js](../../src/modules/orders/data/googleOrders.test.js), [src/modules/orders/domain/analysis.test.js](../../src/modules/orders/domain/analysis.test.js), [src/modules/orders/domain/cardInsights.js](../../src/modules/orders/domain/cardInsights.js), [src/modules/orders/domain/contracts.js](../../src/modules/orders/domain/contracts.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/maintenanceClassification.test.js](../../src/modules/orders/domain/maintenanceClassification.test.js), [src/modules/orders/domain/orderReview.test.js](../../src/modules/orders/domain/orderReview.test.js), [src/modules/orders/domain/reports.js](../../src/modules/orders/domain/reports.js), [src/modules/orders/domain/summary.js](../../src/modules/orders/domain/summary.js), [src/modules/orders/domain/summary.test.js](../../src/modules/orders/domain/summary.test.js), [src/modules/orders/domain/technicians.js](../../src/modules/orders/domain/technicians.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js).

### src/modules/orders/domain/analysis.test.js

**Ordens de Serviço · Teste** — Verifica analysis no contexto de Ordens de Serviço. Exemplos: chamados mistos preservam contagens por linha e por chamado; sem Status a análise fica indisponível; moeda brasileira preserva zero e rejeita ausências e formatos ambíguos.

[Abrir fonte](../../src/modules/orders/domain/analysis.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/attendanceKind.js

**Ordens de Serviço · Domínio** — Centraliza a classificação explícita de Visita Improdutiva pelo motivo registrado.

[Abrir fonte](../../src/modules/orders/domain/attendanceKind.js) · Código ou documentação do ponto de referência

Exporta: `isUnproductive`, `matchesAttendanceKind`.

Importa arquivos locais: [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/domain/cardInsights.js](../../src/modules/orders/domain/cardInsights.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/insights.test.js](../../src/modules/orders/domain/insights.test.js), [src/modules/orders/domain/management.js](../../src/modules/orders/domain/management.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/modules/orders/domain/summary.js](../../src/modules/orders/domain/summary.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/domain/supportPerson.js](../../src/modules/orders/domain/supportPerson.js), [src/modules/orders/domain/technicians.js](../../src/modules/orders/domain/technicians.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/modules/park/domain/parkHistory.js](../../src/modules/park/domain/parkHistory.js).

### src/modules/orders/domain/cardInsights.js

**Ordens de Serviço · Domínio** — Calcula motivos de manutenção e composição dos perfis de serviço, com grupos e registros de origem.

[Abrir fonte](../../src/modules/orders/domain/cardInsights.js) · Código ou documentação do ponto de referência

Exporta: `maintenanceInsights`, `serviceProfile`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/CardInsights.jsx](../../src/modules/orders/components/CardInsights.jsx), [src/modules/orders/domain/cardInsights.test.js](../../src/modules/orders/domain/cardInsights.test.js).

### src/modules/orders/domain/cardInsights.test.js

**Ordens de Serviço · Teste** — Verifica card Insights no contexto de Ordens de Serviço. Exemplos: manutenção mantém base completa, ausência de cliente, custo zero e exclui não realizados; perfil mantém Cancelamento realizado e tipos exclusivos do período anterior; seleção vazia e colunas ausentes não fabricam custo ou participação.

[Abrir fonte](../../src/modules/orders/domain/cardInsights.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/cardInsights.js](../../src/modules/orders/domain/cardInsights.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/contracts.js

**Ordens de Serviço · Domínio** — Separa valores contratuais cobrados do cliente e absorvidos pela Addlog; não comprova recebimento financeiro.

[Abrir fonte](../../src/modules/orders/domain/contracts.js) · Código ou documentação do ponto de referência

Exporta: `contractualSummary`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/ContractSummary.jsx](../../src/modules/orders/components/ContractSummary.jsx), [src/modules/orders/domain/contracts.test.js](../../src/modules/orders/domain/contracts.test.js).

### src/modules/orders/domain/contracts.test.js

**Ordens de Serviço · Teste** — Verifica contracts no contexto de Ordens de Serviço. Exemplos: contrato separa cobrança, preserva zero e exclui ausências, erros e canceladas; ausência de base não fabrica totais e cabeçalhos ausentes são explícitos.

[Abrir fonte](../../src/modules/orders/domain/contracts.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/contracts.js](../../src/modules/orders/domain/contracts.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/customerConsolidation.test.js

**Ordens de Serviço · Teste** — Verifica customer Consolidation no contexto de Ordens de Serviço. Exemplos: consolidação soma serviços/custos e recalcula chamados únicos sem alterar CNPJ ou veículos da origem; razões sociais exatamente iguais consolidam com autorização; nomes parecidos, raiz ou ausência de cadastro não bastam; cadastro divergente, mapeamento parcial e colunas duplicadas mantêm o CNPJ separado para revisão.

[Abrir fonte](../../src/modules/orders/domain/customerConsolidation.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/descriptive.js](../../src/modules/orders/domain/descriptive.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/replacementRankings.js](../../src/modules/orders/domain/replacementRankings.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/orders/domain/customerIdentity.js

**Ordens de Serviço · Domínio** — Normaliza CNPJ e distingue identidade original da filial de consolidação analítica por cadastro/nome exato.

[Abrir fonte](../../src/modules/orders/domain/customerIdentity.js) · Código ou documentação do ponto de referência

Exporta: `customerAnalysisIdentity`, `customerGroupingLabel`, `customerGroupingRule`, `customerIdentity`, `formatCnpj`, `normalizeCnpj`.

Importa arquivos locais: nenhum identificado.

Importado por: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/CustomerIdentityNote.jsx](../../src/modules/orders/components/CustomerIdentityNote.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/data/customerRegistry.js](../../src/modules/orders/data/customerRegistry.js), [src/modules/orders/domain/cardInsights.js](../../src/modules/orders/domain/cardInsights.js), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/customerIdentity.test.js](../../src/modules/orders/domain/customerIdentity.test.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/descriptive.js](../../src/modules/orders/domain/descriptive.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/management.js](../../src/modules/orders/domain/management.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/modules/orders/domain/replacementRankings.js](../../src/modules/orders/domain/replacementRankings.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/domain/supportReport.js](../../src/modules/orders/domain/supportReport.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js).

### src/modules/orders/domain/customerIdentity.test.js

**Ordens de Serviço · Teste** — Verifica customer Identity no contexto de Ordens de Serviço. Exemplos: coluna C e cadastro identificam matriz/filial; AK não muda identidade nem une raiz igual; sem cadastro, CNPJ completo ainda separa filiais e agrupa variações do nome; conflito não escolhe nome; documentos com zeros iniciais são texto preservado; ausências, erros e precisão perdida não viram CNPJ.

[Abrir fonte](../../src/modules/orders/domain/customerIdentity.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/orders/domain/dashboard.js

**Ordens de Serviço · Domínio** — Calcula indicadores do recorte e comparação com um intervalo anterior de mesma duração inclusiva.

[Abrir fonte](../../src/modules/orders/domain/dashboard.js) · Código ou documentação do ponto de referência

Exporta: `change`, `dashboardData`, `periodMetrics`, `previousPeriod`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/OverviewKpis.jsx](../../src/modules/orders/components/OverviewKpis.jsx), [src/modules/orders/components/ServiceProfilesContext.jsx](../../src/modules/orders/components/ServiceProfilesContext.jsx), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/dashboard.test.js](../../src/modules/orders/domain/dashboard.test.js), [src/modules/orders/domain/insights.test.js](../../src/modules/orders/domain/insights.test.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/shared/data/supportFilters.test.js](../../src/shared/data/supportFilters.test.js).

### src/modules/orders/domain/dashboard.test.js

**Ordens de Serviço · Teste** — Verifica dashboard no contexto de Ordens de Serviço. Exemplos: agenda mantém pendências sem recorte temporal, mas segue os campos da categoria; período anterior tem mesma duração inclusive e atravessa ano e fevereiro; variações preservam ausência e base zero sem fabricar percentual.

[Abrir fonte](../../src/modules/orders/domain/dashboard.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/descriptive.js

**Ordens de Serviço · Domínio** — Constrói relatório descritivo por grupo/indicador, com unidade, denominador, critérios e exportação CSV/Excel.

[Abrir fonte](../../src/modules/orders/domain/descriptive.js) · Código ou documentação do ponto de referência

Exporta: `descriptiveAnalyses`, `descriptiveCsv`, `descriptiveHeaders`, `descriptiveReport`, `descriptiveValues`, `descriptiveWorkbook`, `originalRows`.

Importa arquivos locais: [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/descriptive.test.js](../../src/modules/orders/domain/descriptive.test.js).

Dependências externas: `xlsx`.

### src/modules/orders/domain/descriptive.test.js

**Ordens de Serviço · Teste** — Verifica descriptive no contexto de Ordens de Serviço. Exemplos: resumo quantitativo exporta participação com base explícita e exclui canceladas; XLSX usa números e percentual fracionário, mantém originais e textos sem fórmulas; base zero não fabrica percentual e ausência não vira valor zero.

[Abrir fonte](../../src/modules/orders/domain/descriptive.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/descriptive.js](../../src/modules/orders/domain/descriptive.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/orders/domain/equipment.js

**Ordens de Serviço · Domínio** — Classifica acessórios e trocas explícitas e reúne análises de equipamentos com referências às ocorrências.

[Abrir fonte](../../src/modules/orders/domain/equipment.js) · Código ou documentação do ponto de referência

Exporta: `accessoryCategory`, `equipment`, `explicitAccessoryReplacement`, `trackerMotives`.

Importa arquivos locais: [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [src/modules/orders/domain/equipment.test.js](../../src/modules/orders/domain/equipment.test.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/maintenanceClassification.test.js](../../src/modules/orders/domain/maintenanceClassification.test.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js).

### src/modules/orders/domain/equipment.test.js

**Ordens de Serviço · Teste** — Verifica equipment no contexto de Ordens de Serviço. Exemplos: troca vincula chamado e placa, exige realizados e seriais distintos; ambiguidade original não desaparece ao filtrar e par parcial não entra; seriais iguais e ausentes exigem revisão; uma reinstalação com um ID é sem troca.

[Abrir fonte](../../src/modules/orders/domain/equipment.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/fieldLife.js

**Ordens de Serviço · Domínio** — Reconstrói ciclos observáveis de rastreadores/acessórios e calcula estatísticas separando encerrados, abertos e revisões.

[Abrir fonte](../../src/modules/orders/domain/fieldLife.js) · Código ou documentação do ponto de referência

Exporta: `fieldLife`, `lifeGroups`, `lifeStates`, `lifeStats`, `validLifeDate`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/fieldLife.test.js](../../src/modules/orders/domain/fieldLife.test.js), [src/modules/orders/domain/fieldLifeSummary.test.js](../../src/modules/orders/domain/fieldLifeSummary.test.js), [src/modules/orders/domain/maintenanceClassification.test.js](../../src/modules/orders/domain/maintenanceClassification.test.js).

### src/modules/orders/domain/fieldLife.test.js

**Ordens de Serviço · Teste** — Verifica field Life no contexto de Ordens de Serviço. Exemplos: primeira troca exige par e serial antigo e mede a instalação original, incluindo reinstalação; cancelamento e retirada sem par não entram na média e não são saltados até uma troca posterior; mesmo serial, data ou cliente diferente não comprovam troca.

[Abrir fonte](../../src/modules/orders/domain/fieldLife.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/fieldLifeSummary.js

**Ordens de Serviço · Domínio** — Produz as linhas numéricas do resumo de ciclos, compartilhadas com a exportação.

[Abrir fonte](../../src/modules/orders/domain/fieldLifeSummary.js) · Código ou documentação do ponto de referência

Exporta: `fieldLifeSummaryRows`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/domain/fieldLifeSummary.test.js](../../src/modules/orders/domain/fieldLifeSummary.test.js).

### src/modules/orders/domain/fieldLifeSummary.test.js

**Ordens de Serviço · Teste** — Verifica field Life Summary no contexto de Ordens de Serviço. Exemplos: resumo exporta médias com bases diferentes e participação em fração, preservando precisão.

[Abrir fonte](../../src/modules/orders/domain/fieldLifeSummary.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/fieldLifeSummary.js](../../src/modules/orders/domain/fieldLifeSummary.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/insightExport.js

**Ordens de Serviço · Domínio** — Adapta resultados estratégicos a valores numéricos exportáveis, preservando moeda, percentual e ausência.

[Abrir fonte](../../src/modules/orders/domain/insightExport.js) · Código ou documentação do ponto de referência

Exporta: `financialFields`, `insightExportValues`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/domain/insightExport.test.js](../../src/modules/orders/domain/insightExport.test.js).

### src/modules/orders/domain/insightExport.test.js

**Ordens de Serviço · Teste** — Verifica insight Export no contexto de Ordens de Serviço. Exemplos: exportações financeiras contêm números em reais, incluindo zero e negativos, e não convertem ausências em zero; composição, médias e percentuais são exportados sem arredondar os valores do domínio.

[Abrir fonte](../../src/modules/orders/domain/insightExport.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/insightExport.js](../../src/modules/orders/domain/insightExport.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/insights.js

**Ordens de Serviço · Domínio** — Calcula custos agrupados, chamados, retornos, perfis de intervenção, duração e evolução mensal com bases explícitas.

[Abrir fonte](../../src/modules/orders/domain/insights.js) · Código ou documentação do ponto de referência

Exporta: `callInsights`, `done`, `durationInsights`, `effectiveMaintenanceRows`, `groupedCosts`, `interventionProfiles`, `median`, `monthlyCosts`, `recurringVisits`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/customerIdentity.test.js](../../src/modules/orders/domain/customerIdentity.test.js), [src/modules/orders/domain/descriptive.js](../../src/modules/orders/domain/descriptive.js), [src/modules/orders/domain/insights.test.js](../../src/modules/orders/domain/insights.test.js), [src/modules/orders/domain/maintenanceClassification.test.js](../../src/modules/orders/domain/maintenanceClassification.test.js), [src/modules/orders/domain/trackerModels.test.js](../../src/modules/orders/domain/trackerModels.test.js).

### src/modules/orders/domain/insights.test.js

**Ordens de Serviço · Teste** — Verifica insights no contexto de Ordens de Serviço. Exemplos: improdutivas não são manutenção, modos de visita preservam intervalos e todos os custos; custos por cliente mantêm total divergente, exclusões e cobrança Addlog separada; composição por técnico agrupa pelo código mesmo com nomes divergentes.

[Abrir fonte](../../src/modules/orders/domain/insights.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/technicians.js](../../src/modules/orders/domain/technicians.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/lifecycle.js

**Ordens de Serviço · Domínio** — Vincula implementação e retirada por serial/placa e mede tempo observado, com referência para períodos sem retirada.

[Abrir fonte](../../src/modules/orders/domain/lifecycle.js) · Código ou documentação do ponto de referência

Exporta: `observedPeriods`, `todaySaoPaulo`.

Importa arquivos locais: [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/OrdersLifecyclePanel.jsx](../../src/modules/orders/components/OrdersLifecyclePanel.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/modules/orders/domain/lifecycle.test.js](../../src/modules/orders/domain/lifecycle.test.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js).

### src/modules/orders/domain/lifecycle.test.js

**Ordens de Serviço · Teste** — Verifica lifecycle no contexto de Ordens de Serviço. Exemplos: ciclo encerrado mede diferença entre datas e não depende do filtro para resolver vínculo; instalações repetidas, retirada sem início e eventos no mesmo dia exigem revisão; sem retirada usa referência e exige Implementação.

[Abrir fonte](../../src/modules/orders/domain/lifecycle.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/maintenanceClassification.test.js

**Ordens de Serviço · Teste** — Verifica maintenance Classification no contexto de Ordens de Serviço. Exemplos: motivos de revisão e falha são sem troca somente quando o arquivo completo tem uma linha/ID no chamado e veículo; dois IDs diferentes confirmam evento mesmo com motivos genéricos; ordem da planilha não inventa direção; outras placas/chamados não formam par; mais de duas linhas ou identificador inválido não confirmam sem troca.

[Abrir fonte](../../src/modules/orders/domain/maintenanceClassification.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/maintenanceMatrix.js

**Ordens de Serviço · Domínio** — Eventos completos no recorte. A entrada de uma troca não recebe atribuição de manutenção.

[Abrir fonte](../../src/modules/orders/domain/maintenanceMatrix.js) · Código ou documentação do ponto de referência

Exporta: `maintenanceMatrix`.

Importa arquivos locais: [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/domain/maintenanceMatrix.test.js](../../src/modules/orders/domain/maintenanceMatrix.test.js).

### src/modules/orders/domain/maintenanceMatrix.test.js

**Ordens de Serviço · Teste** — Verifica maintenance Matrix no contexto de Ordens de Serviço. Exemplos: matriz conta a troca uma vez e atribui modelo e motivo ao retirado; trocas sem direção, grupos ambíguos e modelos desconhecidos permanecem explícitos.

[Abrir fonte](../../src/modules/orders/domain/maintenanceMatrix.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/maintenanceMatrix.js](../../src/modules/orders/domain/maintenanceMatrix.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/management.js

**Ordens de Serviço · Domínio** — Reúne indicadores gerenciais de execução, clientes e agenda sem misturar previsto e realizado.

[Abrir fonte](../../src/modules/orders/domain/management.js) · Código ou documentação do ponto de referência

Exporta: `managementMetrics`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/ManagementOverview.jsx](../../src/modules/orders/components/ManagementOverview.jsx), [src/modules/orders/domain/management.test.js](../../src/modules/orders/domain/management.test.js).

### src/modules/orders/domain/management.test.js

**Ordens de Serviço · Teste** — Verifica management no contexto de Ordens de Serviço. Exemplos: execuções contam linhas realizadas e manutenção usa Assistência Técnica; categorias isolam relatórios e preservam preferências; agendamentos e execuções respeitam suas próprias datas.

[Abrir fonte](../../src/modules/orders/domain/management.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/config/dashboardCategories.js](../../src/modules/orders/config/dashboardCategories.js), [src/modules/orders/domain/management.js](../../src/modules/orders/domain/management.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/orderAttention.js

**Ordens de Serviço · Domínio** — Detecta concentração descritiva de trocas por cliente/placa e improdutivas por cliente, com critérios e origem.

[Abrir fonte](../../src/modules/orders/domain/orderAttention.js) · Código ou documentação do ponto de referência

Exporta: `defaultOrderAttention`, `orderAttention`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/domain/orderAttention.test.js](../../src/modules/orders/domain/orderAttention.test.js).

### src/modules/orders/domain/orderAttention.test.js

**Ordens de Serviço · Teste** — Verifica order Attention no contexto de Ordens de Serviço. Exemplos: trocas usam eventos e não linhas, deduplicam categoria/chamado e não juntam filiais, placas ou datas ausentes; concentração usa realizados do cliente como denominador, exclui canceladas e obedece quantidade e participação.

[Abrir fonte](../../src/modules/orders/domain/orderAttention.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/orderRecords.js

**Ordens de Serviço · Domínio** — Busca e ordena a grade original de OS; esse recorte de conferência não altera os indicadores.

[Abrir fonte](../../src/modules/orders/domain/orderRecords.js) · Código ou documentação do ponto de referência

Exporta: `searchOrderRecords`, `sortOrderRecords`.

Importa arquivos locais: [src/shared/data/sorting.js](../../src/shared/data/sorting.js).

Importado por: [src/modules/orders/domain/orderRecords.test.js](../../src/modules/orders/domain/orderRecords.test.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js).

### src/modules/orders/domain/orderRecords.test.js

**Ordens de Serviço · Teste** — Verifica order Records no contexto de Ordens de Serviço. Exemplos: busca usa conteúdo exibido sem alterar linhas, células ou ordem da base dos indicadores; ordena todo o recorte antes da paginação, mantém erros/ausências no fim e restaura a ordem original.

[Abrir fonte](../../src/modules/orders/domain/orderRecords.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/orderRecords.js](../../src/modules/orders/domain/orderRecords.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/orderReview.js

**Ordens de Serviço · Domínio** — Aponta inconsistências de cabeçalhos, status e valores para conferência, sem corrigir células automaticamente.

[Abrir fonte](../../src/modules/orders/domain/orderReview.js) · Código ou documentação do ponto de referência

Exporta: `reviewOrderConsistency`.

Importa arquivos locais: [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/domain/orderReview.test.js](../../src/modules/orders/domain/orderReview.test.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js).

### src/modules/orders/domain/orderReview.test.js

**Ordens de Serviço · Teste** — Verifica order Review no contexto de Ordens de Serviço. Exemplos: avisos de escrita e pagamento ao técnico não corrigem células nem mudam os realizados; ausência de Pago em não fabrica conciliação e cabeçalhos repetidos permanecem disponíveis.

[Abrir fonte](../../src/modules/orders/domain/orderReview.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/orderReview.js](../../src/modules/orders/domain/orderReview.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/replacementRankings.js

**Ordens de Serviço · Domínio** — Conta eventos de troca por par de rastreador ou linha explícita de acessório e produz rankings rastreáveis.

[Abrir fonte](../../src/modules/orders/domain/replacementRankings.js) · Código ou documentação do ponto de referência

Exporta: `replacementRankings`.

Importa arquivos locais: [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js).

Importado por: [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/replacementRankings.test.js](../../src/modules/orders/domain/replacementRankings.test.js).

### src/modules/orders/domain/replacementRankings.test.js

**Ordens de Serviço · Teste** — Verifica replacement Rankings no contexto de Ordens de Serviço. Exemplos: ranking conta um par como evento, separa categorias, clientes e origens sem duplicar por número de linhas; placa ausente não vira veículo fictício; cliente ainda pode entrar em seu próprio ranking.

[Abrir fonte](../../src/modules/orders/domain/replacementRankings.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/replacementRankings.js](../../src/modules/orders/domain/replacementRankings.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/reports.js

**Ordens de Serviço · Domínio** — Agrupa medidas analíticas e seleciona histórico por placa/serial, preservando unidades, critérios e origem.

[Abrir fonte](../../src/modules/orders/domain/reports.js) · Código ou documentação do ponto de referência

Exporta: `groupings`, `history`, `measures`, `report`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/orders/domain/reports.test.js](../../src/modules/orders/domain/reports.test.js).

### src/modules/orders/domain/reports.test.js

**Ordens de Serviço · Teste** — Verifica reports no contexto de Ordens de Serviço. Exemplos: relatórios preservam total lançado, excluem cancelamento e valores ausentes; chamado pode participar de grupos diferentes sem duplicar dentro do grupo; relatório contratual separa destinatários e sinaliza ausência de colunas.

[Abrir fonte](../../src/modules/orders/domain/reports.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/reports.js](../../src/modules/orders/domain/reports.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/summary.js

**Ordens de Serviço · Domínio** — Reúne volume, chamados e finanças para os cards a partir das bases analíticas correspondentes.

[Abrir fonte](../../src/modules/orders/domain/summary.js) · Código ou documentação do ponto de referência

Exporta: `summaryMetrics`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx), [src/modules/orders/domain/summary.test.js](../../src/modules/orders/domain/summary.test.js).

### src/modules/orders/domain/summary.test.js

**Ordens de Serviço · Teste** — Verifica summary no contexto de Ordens de Serviço. Exemplos: cards excluem canceladas, preservam zero e usam denominador válido; cards de troca contam evento e referenciam as linhas do par e acessório; limite de ranking mantém dados originais e empates em ordem estável.

[Abrir fonte](../../src/modules/orders/domain/summary.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/summary.js](../../src/modules/orders/domain/summary.js), [src/shared/charts/chartRules.js](../../src/shared/charts/chartRules.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/supportActivityPreview.js

**Ordens de Serviço · Domínio** — Modelo de prévia fictícia de atividade de suporte; não é um adaptador real da API Zoho.

[Abrir fonte](../../src/modules/orders/domain/supportActivityPreview.js) · Código ou documentação do ponto de referência

Exporta: `supportActivityExample`, `supportActivityPreview`.

Importa arquivos locais: [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [src/modules/orders/domain/supportActivityPreview.test.js](../../src/modules/orders/domain/supportActivityPreview.test.js).

### src/modules/orders/domain/supportActivityPreview.test.js

**Ordens de Serviço · Teste** — Verifica support Activity Preview no contexto de Ordens de Serviço. Exemplos: prévia mantém autor, deduplica tickets da equipe e separa permanência e tempo apontado; comentários privados, pendentes, entrada e automação não contam como respostas enviadas; sessões sobrepostas não duplicam permanência e são recortadas; apontamentos não equivalem a jornada.

[Abrir fonte](../../src/modules/orders/domain/supportActivityPreview.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/supportActivityPreview.js](../../src/modules/orders/domain/supportActivityPreview.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/supportComparison.js

**Ordens de Serviço · Domínio** — Compara execução e agendamento mantendo períodos, autoria e denominadores próprios de cada papel.

[Abrir fonte](../../src/modules/orders/domain/supportComparison.js) · Código ou documentação do ponto de referência

Exporta: `supportComparison`, `supportSeries`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportComparisonCharts.jsx](../../src/modules/orders/components/SupportComparisonCharts.jsx), [src/modules/orders/domain/supportPerformance.test.js](../../src/modules/orders/domain/supportPerformance.test.js).

### src/modules/orders/domain/supportPerformance.js

**Ordens de Serviço · Domínio** — Calcula desempenho por responsável/papel, atalhos de calendário, comparações e exclusões por data.

[Abrir fonte](../../src/modules/orders/domain/supportPerformance.js) · Código ou documentação do ponto de referência

Exporta: `supportPerformance`, `supportPeriod`, `supportRoles`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/OverviewInlinePanels.jsx](../../src/modules/orders/components/OverviewInlinePanels.jsx), [src/modules/orders/components/SupportControls.jsx](../../src/modules/orders/components/SupportControls.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/modules/orders/domain/customerConsolidation.test.js](../../src/modules/orders/domain/customerConsolidation.test.js), [src/modules/orders/domain/supportPerformance.test.js](../../src/modules/orders/domain/supportPerformance.test.js), [src/modules/orders/domain/supportPerson.test.js](../../src/modules/orders/domain/supportPerson.test.js).

### src/modules/orders/domain/supportPerformance.test.js

**Ordens de Serviço · Teste** — Verifica support Performance no contexto de Ordens de Serviço. Exemplos: semana atual vai de segunda a domingo, incluindo domingo e virada do ano; períodos civis respeitam segunda/domingo, virada de ano e fevereiro bissexto; efetivos e improdutivas separados; chamados compartilhados não são somados.

[Abrir fonte](../../src/modules/orders/domain/supportPerformance.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/supportComparison.js](../../src/modules/orders/domain/supportComparison.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/domain/supportReport.js](../../src/modules/orders/domain/supportReport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/orders/domain/supportPerson.js

**Ordens de Serviço · Domínio** — Deriva o detalhamento individual sobre o resultado já filtrado da equipe, conservando seus denominadores.

[Abrir fonte](../../src/modules/orders/domain/supportPerson.js) · Código ou documentação do ponto de referência

Exporta: `supportPerson`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/domain/supportPerson.test.js](../../src/modules/orders/domain/supportPerson.test.js).

### src/modules/orders/domain/supportPerson.test.js

**Ordens de Serviço · Teste** — Verifica support Person no contexto de Ordens de Serviço. Exemplos: novos indicadores usam identificações distintas e bases realizadas, incluindo improdutivas; cliente/placa com erro ou marcador ficam fora; ausência de coluna difere de zero elegível; pessoa conserva nomes com espaços, linhas, clientes, evolução e comparação sem alterar origem.

[Abrir fonte](../../src/modules/orders/domain/supportPerson.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/domain/supportPerson.js](../../src/modules/orders/domain/supportPerson.js), [src/modules/orders/domain/supportReport.js](../../src/modules/orders/domain/supportReport.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/orders/domain/supportReport.js

**Ordens de Serviço · Domínio** — Gera relatórios CSV/Excel da equipe e de pessoas com bases separadas e união rastreável dos originais.

[Abrir fonte](../../src/modules/orders/domain/supportReport.js) · Código ou documentação do ponto de referência

Exporta: `supportComparisonReport`, `supportCsv`, `supportReport`, `supportWorkbook`.

Importa arquivos locais: [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/domain/supportPerformance.test.js](../../src/modules/orders/domain/supportPerformance.test.js), [src/modules/orders/domain/supportPerson.test.js](../../src/modules/orders/domain/supportPerson.test.js).

Dependências externas: `xlsx`.

### src/modules/orders/domain/technicians.js

**Ordens de Serviço · Domínio** — Agrupa técnicos pelo código e separa nome, serviço, deslocamento e custo total lançado.

[Abrir fonte](../../src/modules/orders/domain/technicians.js) · Código ou documentação do ponto de referência

Exporta: `technicianRanking`.

Importa arquivos locais: [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/orders/domain/insights.test.js](../../src/modules/orders/domain/insights.test.js), [src/modules/orders/domain/technicians.test.js](../../src/modules/orders/domain/technicians.test.js).

### src/modules/orders/domain/technicians.test.js

**Ordens de Serviço · Teste** — Verifica technicians no contexto de Ordens de Serviço. Exemplos: ranking identifica por código, inclui zeros válidos e usa total lançado; sem cabeçalho necessário ranking é indisponível.

[Abrir fonte](../../src/modules/orders/domain/technicians.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/technicians.js](../../src/modules/orders/domain/technicians.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/trackerModels.js

**Ordens de Serviço · Domínio** — Deriva o modelo pelos prefixos de serial aprovados, sem sobrescrever ID/modelo de origem.

[Abrir fonte](../../src/modules/orders/domain/trackerModels.js) · Código ou documentação do ponto de referência

Exporta: `trackerModel`, `trackerModelPrefixes`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/domain/lineConsumption.js](../../src/modules/consumption/domain/lineConsumption.js), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/maintenanceMatrix.js](../../src/modules/orders/domain/maintenanceMatrix.js), [src/modules/orders/domain/trackerModels.test.js](../../src/modules/orders/domain/trackerModels.test.js).

### src/modules/orders/domain/trackerModels.test.js

**Ordens de Serviço · Teste** — Verifica tracker Models no contexto de Ordens de Serviço. Exemplos: todos os prefixos aprovados classificam IDs textuais e numéricos sem alterar a origem; duração usa modelo por prefixo e mantém desconhecidos, originais e ciclos abertos; prefixos 81 a 85 identificam MXT-141 por dois dígitos, sem retirar zeros iniciais ou confiar no modelo lançado.

[Abrir fonte](../../src/modules/orders/domain/trackerModels.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/trackerModels.js](../../src/modules/orders/domain/trackerModels.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/orders/domain/trackerReplacements.js

**Ordens de Serviço · Domínio** — Valida placa/serial e confirma pares de troca por chamado/veículo/data com IDs distintos e direção quando comprovável.

[Abrir fonte](../../src/modules/orders/domain/trackerReplacements.js) · Código ou documentação do ponto de referência

Exporta: `completed`, `sourceText`, `trackerKind`, `trackerMotives`, `trackerReplacementPairs`, `validPlate`, `validSerial`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/customerIdentity.js](../../src/modules/orders/domain/customerIdentity.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/maintenanceMatrix.js](../../src/modules/orders/domain/maintenanceMatrix.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/modules/orders/domain/replacementRankings.js](../../src/modules/orders/domain/replacementRankings.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js).

### src/modules/orders/hooks/ZohoSession.jsx

**Ordens de Serviço · Estado / coordenação** — Leitura Zoho somente em memória, compartilhada entre a seção e a Visão geral.

[Abrir fonte](../../src/modules/orders/hooks/ZohoSession.jsx) · Código ou documentação do ponto de referência

Exporta: `ZohoSessionProvider`, `defaultZohoColumns`, `useZohoSession`.

Importa arquivos locais: [src/modules/my-dashboard/hooks/DashboardSources.jsx](../../src/modules/my-dashboard/hooks/DashboardSources.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/modules/orders/components/SupportZohoOverview.jsx](../../src/modules/orders/components/SupportZohoOverview.jsx), [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx).

Dependências externas: `react`.

### src/modules/orders/hooks/useGoogleOrders.js

**Ordens de Serviço · Estado / coordenação** — Piloto opt-in: a base Google fica na sessão e só é atualizada na página de OS visível.

[Abrir fonte](../../src/modules/orders/hooks/useGoogleOrders.js) · Código ou documentação do ponto de referência

Exporta: `googleRefreshInterval`, `useGoogleOrders`.

Importa arquivos locais: [src/modules/orders/data/googleOrders.js](../../src/modules/orders/data/googleOrders.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/orders/hooks/useOrdersSession.js

**Ordens de Serviço · Estado / coordenação** — Estado da base de OS: importação autorizada, filtros, busca/paginação, referência e resultados.

[Abrir fonte](../../src/modules/orders/hooks/useOrdersSession.js) · Código ou documentação do ponto de referência

Exporta: `useOrdersSession`.

Importa arquivos locais: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/modules/orders/domain/analysis.js](../../src/modules/orders/domain/analysis.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/orderRecords.js](../../src/modules/orders/domain/orderRecords.js), [src/modules/orders/domain/orderReview.js](../../src/modules/orders/domain/orderReview.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/filters/useScopedSelection.js](../../src/shared/filters/useScopedSelection.js), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/modules/park/components/ParkHistoryPanel.jsx

**Parque e Manutenção · Interface React** — Histórico por par serial + placa já validado, junto à origem; busca e paginação afetam só a grade.

[Abrir fonte](../../src/modules/park/components/ParkHistoryPanel.jsx) · Código ou documentação do ponto de referência

Exporta: `ParkHistoryPanel`, `parkHistoryTitle`.

Importa arquivos locais: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/modules/orders/components/RecordDetails.jsx](../../src/modules/orders/components/RecordDetails.jsx), [src/modules/park/domain/parkHistory.js](../../src/modules/park/domain/parkHistory.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx).

Dependências externas: `react`.

### src/modules/park/components/ParkInsights.jsx

**Parque e Manutenção · Interface React** — Apresenta indicadores e relatórios do parque vinculado ao histórico, com bases percentuais explícitas.

[Abrir fonte](../../src/modules/park/components/ParkInsights.jsx) · Código ou documentação do ponto de referência

Exporta: `ParkInsights`.

Importa arquivos locais: [src/components/AnalysisMetrics.jsx](../../src/components/AnalysisMetrics.jsx), [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/InfoNote.jsx](../../src/components/InfoNote.jsx), [src/components/ReportSummary.jsx](../../src/components/ReportSummary.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/components/TableScroll.jsx](../../src/components/TableScroll.jsx), [src/components/ViewState.jsx](../../src/components/ViewState.jsx), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx).

Dependências externas: `react`.

### src/modules/park/domain/parkAnalysis.js

**Parque e Manutenção · Domínio** — Cruza a fotografia operacional com OS vinculáveis e gera métricas, tabelas e exportações com denominadores/exclusões.

[Abrir fonte](../../src/modules/park/domain/parkAnalysis.js) · Código ou documentação do ponto de referência

Exporta: `parkAnalysis`, `parkColumns`, `parkReportCsv`, `parkReportTables`, `parkReportWorkbook`, `parkSections`.

Importa arquivos locais: [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/export/exports.js](../../src/shared/export/exports.js).

Importado por: [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/operational/config/operationalMenus.js](../../src/modules/operational/config/operationalMenus.js), [src/modules/operational/config/reportStories.js](../../src/modules/operational/config/reportStories.js), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx), [src/modules/park/domain/parkAnalysis.test.js](../../src/modules/park/domain/parkAnalysis.test.js).

Dependências externas: `xlsx`.

### src/modules/park/domain/parkAnalysis.test.js

**Parque e Manutenção · Teste** — Verifica park Analysis no contexto de Parque e Manutenção. Exemplos: taxa usa toda base vinculável, mantém ausência histórica, exclui cancelada e agrupa visitas; período exclui ausentes, preserva denominador e não salta visita intermediária da seleção; duplicidade global não desaparece ao filtrar operacional e base zero não fabrica taxa.

[Abrir fonte](../../src/modules/park/domain/parkAnalysis.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/modules/park/domain/parkHistory.js

**Parque e Manutenção · Domínio** — Aprofunda o histórico vinculável e a última intervenção efetiva com referência ajustável e conferência por serial/placa.

[Abrir fonte](../../src/modules/park/domain/parkHistory.js) · Código ou documentação do ponto de referência

Exporta: `parkHistory`, `parkHistoryReference`, `sortParkHistoryRows`, `validParkDate`.

Importa arquivos locais: [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/shared/data/filters.js](../../src/shared/data/filters.js), [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js), [src/shared/data/sorting.js](../../src/shared/data/sorting.js).

Importado por: [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/domain/parkHistory.test.js](../../src/modules/park/domain/parkHistory.test.js).

### src/modules/park/domain/parkHistory.test.js

**Parque e Manutenção · Teste** — Verifica park History no contexto de Parque e Manutenção. Exemplos: última intervenção usa efetivos de todos os tipos, mantém improdutivas e ausência distintas; referência vazia ou anterior não fabrica duração zero nem negativa; base sem assistência fica sem percentual; ordenação por dias considera todo o conjunto antes da página e mantém ausentes ao final.

[Abrir fonte](../../src/modules/park/domain/parkHistory.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/park/domain/parkHistory.js](../../src/modules/park/domain/parkHistory.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/modules/users/components/UsersPage.jsx

**Usuários · Interface React** — Lista e edita usuários por meio da API protegida. A liberação de login no Cloudflare permanece uma etapa separada.

[Abrir fonte](../../src/modules/users/components/UsersPage.jsx) · Código ou documentação do ponto de referência

Exporta: `UsersPage`.

Importa arquivos locais: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/SidePanel.jsx](../../src/app/SidePanel.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx).

Dependências externas: `react`.

### src/shared/charts/chartRules.js

**Compartilhado · Infraestrutura compartilhada** — Determina quais representações são compatíveis com os valores, incluindo as restrições do gráfico de pizza.

[Abrir fonte](../../src/shared/charts/chartRules.js) · Código ou documentação do ponto de referência

Exporta: `chartAvailability`, `rankingItems`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/domain/summary.test.js](../../src/modules/orders/domain/summary.test.js), [src/shared/charts/chartRules.test.js](../../src/shared/charts/chartRules.test.js).

### src/shared/charts/chartRules.test.js

**Compartilhado · Teste** — Verifica chart Rules no contexto de Compartilhado. Exemplos: pizza exige composição aditiva, não negativa e com total positivo; seções começam visíveis e preferências desconhecidas não afetam o layout.

[Abrir fonte](../../src/shared/charts/chartRules.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js), [src/shared/charts/chartRules.js](../../src/shared/charts/chartRules.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/charts/palette.js

**Compartilhado · Infraestrutura compartilhada** — Tokens acompanham o tema; exportações em fundo branco usam cores concretas portáteis.

[Abrir fonte](../../src/shared/charts/palette.js) · Código ou documentação do ponto de referência

Exporta: `categoricalColors`, `chartColors`, `chartExportColor`, `chartPrintVariables`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/modules/my-dashboard/components/WidgetVisualization.jsx](../../src/modules/my-dashboard/components/WidgetVisualization.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/ZohoActivitySummary.jsx](../../src/modules/orders/components/ZohoActivitySummary.jsx), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/export/exports.test.js](../../src/shared/export/exports.test.js), [src/shared/export/reportPrintStyles.js](../../src/shared/export/reportPrintStyles.js).

### src/shared/config/architectureMap.js

**Compartilhado · Catálogo** — Endereço documental independente; o visitante informa a senha compartilhada, sem conta no sistema.

[Abrir fonte](../../src/shared/config/architectureMap.js) · Código ou documentação do ponto de referência

Exporta: `architectureMapUrl`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/app/Navigation.jsx](../../src/app/Navigation.jsx).

### src/shared/data/filters.js

**Compartilhado · Dados / transporte** — Centraliza leitura de campos, datas de atendimento, extensão temporal e filtros combinados sobre a OS.

[Abrir fonte](../../src/shared/data/filters.js) · Código ou documentação do ponto de referência

Exporta: `applyFilters`, `attendanceDate`, `attendanceExtent`, `field`, `filterFields`, `filterLabels`, `monthlyCompleted`.

Importa arquivos locais: nenhum identificado.

Importado por: [scripts/assistant-demo-queries.mjs](../../scripts/assistant-demo-queries.mjs), [scripts/local-acervo.mjs](../../scripts/local-acervo.mjs), [src/modules/my-dashboard/domain/customQuery.js](../../src/modules/my-dashboard/domain/customQuery.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/operational/domain/operational.js](../../src/modules/operational/domain/operational.js), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/ExtendedInsights.jsx](../../src/modules/orders/components/ExtendedInsights.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/modules/orders/components/ServiceProfilesContext.jsx](../../src/modules/orders/components/ServiceProfilesContext.jsx), [src/modules/orders/components/SummaryCards.jsx](../../src/modules/orders/components/SummaryCards.jsx), [src/modules/orders/domain/attendanceKind.js](../../src/modules/orders/domain/attendanceKind.js), [src/modules/orders/domain/cardInsights.js](../../src/modules/orders/domain/cardInsights.js), [src/modules/orders/domain/contracts.js](../../src/modules/orders/domain/contracts.js), [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/modules/orders/domain/equipment.js](../../src/modules/orders/domain/equipment.js), [src/modules/orders/domain/fieldLife.js](../../src/modules/orders/domain/fieldLife.js), [src/modules/orders/domain/insights.js](../../src/modules/orders/domain/insights.js), [src/modules/orders/domain/lifecycle.js](../../src/modules/orders/domain/lifecycle.js), [src/modules/orders/domain/maintenanceMatrix.js](../../src/modules/orders/domain/maintenanceMatrix.js), [src/modules/orders/domain/management.js](../../src/modules/orders/domain/management.js), [src/modules/orders/domain/management.test.js](../../src/modules/orders/domain/management.test.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/modules/orders/domain/orderReview.js](../../src/modules/orders/domain/orderReview.js), [src/modules/orders/domain/reports.js](../../src/modules/orders/domain/reports.js), [src/modules/orders/domain/summary.js](../../src/modules/orders/domain/summary.js), [src/modules/orders/domain/supportPerformance.js](../../src/modules/orders/domain/supportPerformance.js), [src/modules/orders/domain/supportPerson.js](../../src/modules/orders/domain/supportPerson.js), [src/modules/orders/domain/technicians.js](../../src/modules/orders/domain/technicians.js), [src/modules/orders/domain/trackerReplacements.js](../../src/modules/orders/domain/trackerReplacements.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/modules/park/domain/parkAnalysis.test.js](../../src/modules/park/domain/parkAnalysis.test.js), [src/modules/park/domain/parkHistory.js](../../src/modules/park/domain/parkHistory.js), [src/shared/data/filters.test.js](../../src/shared/data/filters.test.js), [src/shared/data/period.test.js](../../src/shared/data/period.test.js), [src/shared/data/supportFilters.test.js](../../src/shared/data/supportFilters.test.js).

Dependências externas: `xlsx`.

### src/shared/data/filters.test.js

**Compartilhado · Teste** — Verifica filters no contexto de Compartilhado. Exemplos: filtros preservam ordem e incluem limites de datas; gráfico exclui canceladas e realizados sem data; período invertido e filtro sem correspondência ficam vazios.

[Abrir fonte](../../src/shared/data/filters.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/data/import.js](../../src/modules/orders/data/import.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`, `xlsx`.

### src/shared/data/googleOrdersSnapshot.js

**Compartilhado · Dados / transporte** — Contrato restrito do piloto: uma aba completa, apenas valores/formatação, sem credenciais ou metadados do Drive.

[Abrir fonte](../../src/shared/data/googleOrdersSnapshot.js) · Código ou documentação do ponto de referência

Exporta: `googleOrdersLimits`, `validateGoogleOrdersSnapshot`.

Importa arquivos locais: nenhum identificado.

Importado por: [server/googleOrders.js](../../server/googleOrders.js), [src/modules/operational/domain/googleOperational.js](../../src/modules/operational/domain/googleOperational.js), [src/modules/orders/data/googleOrders.js](../../src/modules/orders/data/googleOrders.js).

### src/shared/data/isoDate.js

**Compartilhado · Dados / transporte** — Validação de dia civil ISO, sem normalizar silenciosamente datas impossíveis.

[Abrir fonte](../../src/shared/data/isoDate.js) · Código ou documentação do ponto de referência

Exporta: `validISODate`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/domain/consumptionAttention.js](../../src/modules/consumption/domain/consumptionAttention.js), [src/modules/consumption/domain/consumptionSources.js](../../src/modules/consumption/domain/consumptionSources.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/layout.js](../../src/modules/my-dashboard/domain/layout.js), [src/modules/orders/domain/orderAttention.js](../../src/modules/orders/domain/orderAttention.js), [src/modules/orders/domain/supportActivityPreview.js](../../src/modules/orders/domain/supportActivityPreview.js), [src/modules/park/domain/parkHistory.js](../../src/modules/park/domain/parkHistory.js), [src/shared/data/zohoActivity.js](../../src/shared/data/zohoActivity.js), [src/shared/filters/savedViews.js](../../src/shared/filters/savedViews.js).

### src/shared/data/localId.js

**Compartilhado · Dados / transporte** — Identificadores de configurações/anotações locais. Não são tokens de autenticação nem substituem hashes de arquivos.

[Abrir fonte](../../src/shared/data/localId.js) · Código ou documentação do ponto de referência

Exporta: `localId`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js), [src/modules/my-dashboard/components/DashboardTools.jsx](../../src/modules/my-dashboard/components/DashboardTools.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/components/WidgetEditor.jsx](../../src/modules/my-dashboard/components/WidgetEditor.jsx), [src/modules/my-dashboard/hooks/useDashboards.js](../../src/modules/my-dashboard/hooks/useDashboards.js), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/shared/data/localId.test.js](../../src/shared/data/localId.test.js).

### src/shared/data/localId.test.js

**Compartilhado · Teste** — Verifica local Id no contexto de Compartilhado. Exemplos: configurações e anotações podem gerar identificadores únicos sem randomUUID.

[Abrir fonte](../../src/shared/data/localId.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/data/localId.js](../../src/shared/data/localId.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/data/period.test.js

**Compartilhado · Teste** — Verifica period no contexto de Compartilhado. Exemplos: período ignora datas inválidas e não depende da ordem das linhas; período sem datas e seleção vazia não inventam limites.

[Abrir fonte](../../src/shared/data/period.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/data/reviewDiagnostics.js

**Compartilhado · Dados / transporte** — Diagnósticos comuns às fontes; não modifica valores nem decide correções.

[Abrir fonte](../../src/shared/data/reviewDiagnostics.js) · Código ou documentação do ponto de referência

Exporta: `reviewDiagnostics`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/ReviewPanel.jsx](../../src/components/ReviewPanel.jsx), [src/shared/data/reviewDiagnostics.test.js](../../src/shared/data/reviewDiagnostics.test.js).

### src/shared/data/reviewDiagnostics.test.js

**Compartilhado · Teste** — Verifica review Diagnostics no contexto de Compartilhado. Exemplos: diagnóstico conserva origem, valores e incerteza; reúne somente apontamentos idênticos.

[Abrir fonte](../../src/shared/data/reviewDiagnostics.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/data/reviewDiagnostics.js](../../src/shared/data/reviewDiagnostics.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/data/sorting.js

**Compartilhado · Dados / transporte** — Obtém valor comparável para texto, número, moeda ou data, mantendo ausências identificáveis.

[Abrir fonte](../../src/shared/data/sorting.js) · Código ou documentação do ponto de referência

Exporta: `compareValues`, `sortValue`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/SortableTable.jsx](../../src/components/SortableTable.jsx), [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/operational/domain/operationalRecords.js](../../src/modules/operational/domain/operationalRecords.js), [src/modules/orders/domain/orderRecords.js](../../src/modules/orders/domain/orderRecords.js), [src/modules/park/domain/parkHistory.js](../../src/modules/park/domain/parkHistory.js), [src/shared/data/sorting.test.js](../../src/shared/data/sorting.test.js).

### src/shared/data/sorting.test.js

**Compartilhado · Teste** — Verifica sorting no contexto de Compartilhado. Exemplos: ordena moeda, números, datas e mantém ausências ao final; ordenar antes de paginar mantém menores e maiores no conjunto inteiro.

[Abrir fonte](../../src/shared/data/sorting.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/data/sorting.js](../../src/shared/data/sorting.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/data/supportFilters.test.js

**Compartilhado · Teste** — Verifica support Filters no contexto de Compartilhado. Exemplos: responsáveis aceitam vários nomes por papel e exigem ambos quando combinados; visão geral e custos usam o mesmo recorte de responsáveis; limpar seleções restaura linhas sem responsável e bases sem essas colunas.

[Abrir fonte](../../src/shared/data/supportFilters.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/domain/dashboard.js](../../src/modules/orders/domain/dashboard.js), [src/shared/data/filters.js](../../src/shared/data/filters.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/data/zohoActivity.js

**Compartilhado · Dados / transporte** — Valida autoria/datas/durações e resume apontamentos e respostas Zoho, separando confirmados e itens a conferir.

[Abrir fonte](../../src/shared/data/zohoActivity.js) · Código ou documentação do ponto de referência

Exporta: `normalizeZohoEntry`, `normalizeZohoReply`, `summarizeZohoActivity`, `zohoDay`, `zohoId`, `zohoPeriod`, `zohoSeconds`, `zohoTeam`.

Importa arquivos locais: [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [server/zohoActivity.js](../../server/zohoActivity.js), [server/zohoActivity.test.js](../../server/zohoActivity.test.js), [server/zohoClosures.js](../../server/zohoClosures.js), [server/zohoClosures.test.js](../../server/zohoClosures.test.js), [src/modules/my-dashboard/domain/evaluate.js](../../src/modules/my-dashboard/domain/evaluate.js), [src/modules/my-dashboard/domain/evaluate.test.js](../../src/modules/my-dashboard/domain/evaluate.test.js), [src/modules/orders/components/SupportZohoActivity.jsx](../../src/modules/orders/components/SupportZohoActivity.jsx), [src/modules/orders/components/SupportZohoOverview.jsx](../../src/modules/orders/components/SupportZohoOverview.jsx), [src/modules/orders/components/ZohoClosures.jsx](../../src/modules/orders/components/ZohoClosures.jsx), [src/modules/orders/data/zohoActivityClient.js](../../src/modules/orders/data/zohoActivityClient.js).

### src/shared/export/exports.js

**Compartilhado · Infraestrutura compartilhada** — Gera CSV com separador brasileiro, BOM e proteção contra fórmulas provenientes de texto.

[Abrir fonte](../../src/shared/export/exports.js) · Código ou documentação do ponto de referência

Exporta: `chartSvg`, `csv`, `download`, `reportCsv`.

Importa arquivos locais: [src/shared/charts/palette.js](../../src/shared/charts/palette.js), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js).

Importado por: [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/ReviewPanel.jsx](../../src/components/ReviewPanel.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/consumption/domain/consumptionRecordsReport.js](../../src/modules/consumption/domain/consumptionRecordsReport.js), [src/modules/consumption/domain/lineHistoryReport.js](../../src/modules/consumption/domain/lineHistoryReport.js), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx), [src/modules/monitoring/domain/monitoringReport.js](../../src/modules/monitoring/domain/monitoringReport.js), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/components/SupportComparisonCharts.jsx](../../src/modules/orders/components/SupportComparisonCharts.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/orders/domain/descriptive.js](../../src/modules/orders/domain/descriptive.js), [src/modules/orders/domain/fieldLifeSummary.test.js](../../src/modules/orders/domain/fieldLifeSummary.test.js), [src/modules/orders/domain/insightExport.test.js](../../src/modules/orders/domain/insightExport.test.js), [src/modules/orders/domain/supportReport.js](../../src/modules/orders/domain/supportReport.js), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx), [src/modules/park/domain/parkAnalysis.js](../../src/modules/park/domain/parkAnalysis.js), [src/shared/export/exports.test.js](../../src/shared/export/exports.test.js).

### src/shared/export/exports.test.js

**Compartilhado · Teste** — Verifica exports no contexto de Compartilhado. Exemplos: CSV preserva aspas e impede interpretação de fórmulas de texto; relatório exporta moeda em reais, filtros e origem; SVG escapa texto e mantém valores visíveis sem scripts.

[Abrir fonte](../../src/shared/export/exports.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/charts/palette.js](../../src/shared/charts/palette.js), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/export/reportPrintStyles.js](../../src/shared/export/reportPrintStyles.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/export/printContext.js

**Compartilhado · Infraestrutura compartilhada** — Contexto legível de impressão; preserva identificadores e filtros desconhecidos.

[Abrir fonte](../../src/shared/export/printContext.js) · Código ou documentação do ponto de referência

Exporta: `printContextEntries`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/Section.jsx](../../src/components/Section.jsx), [src/shared/export/printContext.test.js](../../src/shared/export/printContext.test.js).

### src/shared/export/printContext.test.js

**Compartilhado · Teste** — Verifica print Context no contexto de Compartilhado. Exemplos: impressão identifica apurações sem expor sua serialização e preserva identificadores; impressão mantém zero, falso, categorias e campos adicionais sem criar conversões financeiras; chaves de período desconhecidas e textos especiais continuam texto; ausência é explícita.

[Abrir fonte](../../src/shared/export/printContext.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/export/printContext.js](../../src/shared/export/printContext.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/export/reportPrintStyles.js

**Compartilhado · Infraestrutura compartilhada** — Complemento da cópia isolada de impressão: texto integral, tabelas e tema claro.

[Abrir fonte](../../src/shared/export/reportPrintStyles.js) · Código ou documentação do ponto de referência

Exporta: `reportPrintStyles`.

Importa arquivos locais: [src/shared/charts/palette.js](../../src/shared/charts/palette.js).

Importado por: [src/components/Section.jsx](../../src/components/Section.jsx), [src/shared/export/exports.test.js](../../src/shared/export/exports.test.js).

### src/shared/filters/SavedViews.jsx

**Compartilhado · Interface React** — Interface para criar, aplicar, renomear e excluir favoritos locais da categoria.

[Abrir fonte](../../src/shared/filters/SavedViews.jsx) · Código ou documentação do ponto de referência

Exporta: `SavedViews`.

Importa arquivos locais: [src/shared/filters/SavedViewsContext.jsx](../../src/shared/filters/SavedViewsContext.jsx), [src/shared/filters/savedViews.js](../../src/shared/filters/savedViews.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

Importado por: [src/components/FilterPanel.jsx](../../src/components/FilterPanel.jsx).

Dependências externas: `react`.

### src/shared/filters/SavedViewsContext.jsx

**Compartilhado · Interface React** — Contexto React que disponibiliza a capacidade de salvar visões aos controles da página.

[Abrir fonte](../../src/shared/filters/SavedViewsContext.jsx) · Código ou documentação do ponto de referência

Exporta: `SavedViewsContext`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/shared/filters/SavedViews.jsx](../../src/shared/filters/SavedViews.jsx), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx).

Dependências externas: `react`.

### src/shared/filters/savedViews.js

**Compartilhado · Infraestrutura compartilhada** — Favoritos locais explícitos, sem registros importados nem aplicação automática.

[Abrir fonte](../../src/shared/filters/savedViews.js) · Código ou documentação do ponto de referência

Exporta: `applySavedView`, `changeSavedView`, `readSavedViews`, `savedViewsKey`, `viewSnapshot`.

Importa arquivos locais: [src/shared/data/isoDate.js](../../src/shared/data/isoDate.js).

Importado por: [src/shared/filters/SavedViews.jsx](../../src/shared/filters/SavedViews.jsx), [src/shared/filters/savedViews.test.js](../../src/shared/filters/savedViews.test.js).

### src/shared/filters/savedViews.test.js

**Compartilhado · Teste** — Verifica saved Views no contexto de Compartilhado. Exemplos: favoritos isolam usuário/categoria, restauram cópia e preservam outros favoritos ao alterar; semanas relativas recalculam ao aplicar, datas fixas não mudam e fonte incompatível não aplica; duplicidade de nome/ID, formato inválido e falha de armazenamento não substituem favoritos.

[Abrir fonte](../../src/shared/filters/savedViews.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/filters/savedViews.js](../../src/shared/filters/savedViews.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/filters/scopedSelection.js

**Compartilhado · Infraestrutura compartilhada** — Seleções são independentes por categoria; esta camada não conhece registros nem regras de cálculo.

[Abrir fonte](../../src/shared/filters/scopedSelection.js) · Código ou documentação do ponto de referência

Exporta: `activeFilterEntries`, `emptySelection`, `filterChips`, `filterDisplay`, `selectionCount`, `updateScopedField`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/modules/consumption/components/ConsumptionFiltersPanel.jsx](../../src/modules/consumption/components/ConsumptionFiltersPanel.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersFiltersPanel.jsx](../../src/modules/orders/components/OrdersFiltersPanel.jsx), [src/shared/filters/scopedSelection.test.js](../../src/shared/filters/scopedSelection.test.js), [src/shared/filters/useScopedSelection.js](../../src/shared/filters/useScopedSelection.js).

### src/shared/filters/scopedSelection.test.js

**Compartilhado · Teste** — Verifica scoped Selection no contexto de Compartilhado. Exemplos: categorias conservam período, busca e colunas próprias; limpar uma não altera as demais; Operacional e Parque não compartilham seleção; navegação analítica pode endereçar explicitamente a fila; indicadores e chips ignoram padrões neutros, mostram zero útil e preservam datas civis.

[Abrir fonte](../../src/shared/filters/scopedSelection.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/filters/useScopedSelection.js

**Compartilhado · Infraestrutura compartilhada** — Estado somente da sessão: navegar conserva cada seleção; outra categoria nunca herda filtros silenciosamente.

[Abrir fonte](../../src/shared/filters/useScopedSelection.js) · Código ou documentação do ponto de referência

Exporta: `useScopedSelection`.

Importa arquivos locais: [src/shared/filters/scopedSelection.js](../../src/shared/filters/scopedSelection.js).

Importado por: [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js).

Dependências externas: `react`.

### src/shared/layout/PageLayout.jsx

**Compartilhado · Interface React** — Estado visual compartilhado: gravação explícita, registro de capacidades e revelação temporária de relatórios.

[Abrir fonte](../../src/shared/layout/PageLayout.jsx) · Código ou documentação do ponto de referência

Exporta: `PageLayoutContext`, `PageLayoutProvider`, `useLayoutContext`, `usePageLayout`.

Importa arquivos locais: [src/shared/filters/SavedViewsContext.jsx](../../src/shared/filters/SavedViewsContext.jsx), [src/shared/layout/pageLayout.js](../../src/shared/layout/pageLayout.js).

Importado por: [src/components/PageSettings.jsx](../../src/components/PageSettings.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersPage.jsx](../../src/modules/orders/components/OrdersPage.jsx).

Dependências externas: `react`.

### src/shared/layout/ReportStories.jsx

**Compartilhado · Interface React** — Reúne relatórios existentes em uma única área de leitura, com uma visualização por vez. Os portais mantêm o painel no mesmo lugar e conservam o estado dos relatórios montados. Cada visualização conserva título, ajuda, preferência, impressão e cálculo de origem.

[Abrir fonte](../../src/shared/layout/ReportStories.jsx) · Código ou documentação do ponto de referência

Exporta: `ReportStories`, `StoryPortal`, `StoryViewControl`, `useReportStory`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx).

Dependências externas: `react`, `react-dom`.

### src/shared/layout/pageLayout.js

**Compartilhado · Infraestrutura compartilhada** — Preferências visuais locais. Este contrato não contém filtros, registros ou dados importados.

[Abrir fonte](../../src/shared/layout/pageLayout.js) · Código ou documentação do ponto de referência

Exporta: `availableLayoutMode`, `cleanLayout`, `layoutModes`, `mergeLayout`, `readLayout`.

Importa arquivos locais: nenhum identificado.

Importado por: [src/components/PageSettings.jsx](../../src/components/PageSettings.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/shared/layout/PageLayout.jsx](../../src/shared/layout/PageLayout.jsx), [src/shared/layout/pageLayout.test.js](../../src/shared/layout/pageLayout.test.js).

### src/shared/layout/pageLayout.test.js

**Compartilhado · Teste** — Verifica page Layout no contexto de Compartilhado. Exemplos: aceita somente visibilidade e modos conhecidos, sem transportar outros campos; leitura preserva o formato novo e só usa legado se necessário; nunca grava automaticamente; salvar categoria preserva as demais e não altera objetos recebidos.

[Abrir fonte](../../src/shared/layout/pageLayout.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js), [src/shared/layout/pageLayout.js](../../src/shared/layout/pageLayout.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/layout/reportCatalogs.test.js

**Compartilhado · Teste** — Verifica report Catalogs no contexto de Compartilhado. Exemplos: OS consolida sete categorias sem perder as definições individuais dos relatórios agrupados; Parque reúne manutenção e exportação no mesmo recorte e mantém vínculos em categoria própria; Consumo conserva os identificadores de fila/ranking e o histórico fora do seletor.

[Abrir fonte](../../src/shared/layout/reportCatalogs.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/modules/consumption/config/consumptionMenus.js](../../src/modules/consumption/config/consumptionMenus.js), [src/modules/consumption/config/reportStories.js](../../src/modules/consumption/config/reportStories.js), [src/modules/operational/config/operationalMenus.js](../../src/modules/operational/config/operationalMenus.js), [src/modules/operational/config/reportStories.js](../../src/modules/operational/config/reportStories.js), [src/modules/orders/config/dashboardCategories.js](../../src/modules/orders/config/dashboardCategories.js), [src/modules/orders/config/preferences.js](../../src/modules/orders/config/preferences.js), [src/modules/orders/config/reportStories.js](../../src/modules/orders/config/reportStories.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/shared/persistence/documentRepository.js

**Compartilhado · Infraestrutura compartilhada** — Contrato de documentos versionados, independente de React, rede e banco de dados.

[Abrir fonte](../../src/shared/persistence/documentRepository.js) · Preparação / contrato

Exporta: `PersistenceError`, `cloneDocument`, `createDocumentRepository`, `documentKey`.

Importa arquivos locais: nenhum identificado.

Importado por: [server/persistence/documentRepository.test.js](../../server/persistence/documentRepository.test.js), [src/modules/consumption/data/historyRepository.test.js](../../src/modules/consumption/data/historyRepository.test.js), [src/shared/persistence/documentValueAdapter.js](../../src/shared/persistence/documentValueAdapter.js), [src/shared/persistence/memoryDocumentAdapter.js](../../src/shared/persistence/memoryDocumentAdapter.js).

### src/shared/persistence/documentValueAdapter.js

**Compartilhado · Infraestrutura compartilhada** — Ponte para módulos que usam read()/write(value), como o histórico de consumo.

[Abrir fonte](../../src/shared/persistence/documentValueAdapter.js) · Preparação / contrato

Exporta: `createDocumentValueAdapter`.

Importa arquivos locais: [src/shared/persistence/documentRepository.js](../../src/shared/persistence/documentRepository.js).

Importado por: [server/persistence/documentRepository.test.js](../../server/persistence/documentRepository.test.js), [src/modules/consumption/data/historyRepository.test.js](../../src/modules/consumption/data/historyRepository.test.js).

### src/shared/persistence/memoryDocumentAdapter.js

**Compartilhado · Infraestrutura compartilhada** — Adaptador de referência para testes e sessões; não persiste nem sincroniza dados.

[Abrir fonte](../../src/shared/persistence/memoryDocumentAdapter.js) · Preparação / contrato

Exporta: `createMemoryDocumentAdapter`.

Importa arquivos locais: [src/shared/persistence/documentRepository.js](../../src/shared/persistence/documentRepository.js).

Importado por: [server/persistence/documentRepository.test.js](../../server/persistence/documentRepository.test.js), [src/modules/consumption/data/historyRepository.test.js](../../src/modules/consumption/data/historyRepository.test.js).

### src/shared/security/Access.jsx

**Compartilhado · Interface React** — Oculta ações não concedidas. A ação executada também deve revalidar a permissão, além deste controle visual.

[Abrir fonte](../../src/shared/security/Access.jsx) · Código ou documentação do ponto de referência

Exporta: `AccessContext`, `AccessProvider`, `PermissionButton`, `useAccess`.

Importa arquivos locais: [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/components/Chart.jsx](../../src/components/Chart.jsx), [src/components/ReviewPanel.jsx](../../src/components/ReviewPanel.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/main.jsx](../../src/main.jsx), [src/modules/assistant/components/AssistantPage.jsx](../../src/modules/assistant/components/AssistantPage.jsx), [src/modules/consumption/components/ConsumptionArchivePanel.jsx](../../src/modules/consumption/components/ConsumptionArchivePanel.jsx), [src/modules/consumption/components/ConsumptionImportHeader.jsx](../../src/modules/consumption/components/ConsumptionImportHeader.jsx), [src/modules/consumption/components/ConsumptionImportPreview.jsx](../../src/modules/consumption/components/ConsumptionImportPreview.jsx), [src/modules/consumption/components/ConsumptionInvestigationPanel.jsx](../../src/modules/consumption/components/ConsumptionInvestigationPanel.jsx), [src/modules/consumption/components/LineHistoryPanel.jsx](../../src/modules/consumption/components/LineHistoryPanel.jsx), [src/modules/consumption/components/LineRecordsTable.jsx](../../src/modules/consumption/components/LineRecordsTable.jsx), [src/modules/consumption/components/LinesPage.jsx](../../src/modules/consumption/components/LinesPage.jsx), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringPage.jsx](../../src/modules/monitoring/components/MonitoringPage.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx), [src/modules/monitoring/hooks/useMonitoringReminders.js](../../src/modules/monitoring/hooks/useMonitoringReminders.js), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/hooks/DashboardSources.jsx](../../src/modules/my-dashboard/hooks/DashboardSources.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/AdvancedInsights.jsx](../../src/modules/orders/components/AdvancedInsights.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/DescriptiveReport.jsx](../../src/modules/orders/components/DescriptiveReport.jsx), [src/modules/orders/components/Explorers.jsx](../../src/modules/orders/components/Explorers.jsx), [src/modules/orders/components/FieldLifePanel.jsx](../../src/modules/orders/components/FieldLifePanel.jsx), [src/modules/orders/components/GeographyComparison.jsx](../../src/modules/orders/components/GeographyComparison.jsx), [src/modules/orders/components/MaintenanceMatrix.jsx](../../src/modules/orders/components/MaintenanceMatrix.jsx), [src/modules/orders/components/OrdersImportPanel.jsx](../../src/modules/orders/components/OrdersImportPanel.jsx), [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx), [src/modules/orders/components/ReplacementRankings.jsx](../../src/modules/orders/components/ReplacementRankings.jsx), [src/modules/orders/components/SupportComparison.jsx](../../src/modules/orders/components/SupportComparison.jsx), [src/modules/orders/components/SupportComparisonCharts.jsx](../../src/modules/orders/components/SupportComparisonCharts.jsx), [src/modules/orders/components/SupportPeople.jsx](../../src/modules/orders/components/SupportPeople.jsx), [src/modules/orders/components/SupportPerformance.jsx](../../src/modules/orders/components/SupportPerformance.jsx), [src/modules/orders/components/SupportZohoOverview.jsx](../../src/modules/orders/components/SupportZohoOverview.jsx), [src/modules/orders/components/SupportZohoPanel.jsx](../../src/modules/orders/components/SupportZohoPanel.jsx), [src/modules/orders/components/Technicians.jsx](../../src/modules/orders/components/Technicians.jsx), [src/modules/orders/hooks/ZohoSession.jsx](../../src/modules/orders/hooks/ZohoSession.jsx), [src/modules/orders/hooks/useGoogleOrders.js](../../src/modules/orders/hooks/useGoogleOrders.js), [src/modules/park/components/ParkHistoryPanel.jsx](../../src/modules/park/components/ParkHistoryPanel.jsx), [src/modules/park/components/ParkInsights.jsx](../../src/modules/park/components/ParkInsights.jsx), [src/modules/users/components/UsersPage.jsx](../../src/modules/users/components/UsersPage.jsx), [src/shared/filters/SavedViews.jsx](../../src/shared/filters/SavedViews.jsx).

Dependências externas: `react`.

### src/shared/security/accessClient.js

**Compartilhado · Infraestrutura compartilhada** — Mantém a identidade e a função de atualização usadas pelas ações locais do aplicativo.

[Abrir fonte](../../src/shared/security/accessClient.js) · Código ou documentação do ponto de referência

Exporta: `accessManaged`, `accessUser`, `api`, `authorizeAction`, `setAccessSession`.

Importa arquivos locais: [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/components/Section.jsx](../../src/components/Section.jsx), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/consumption/hooks/useLineFollowup.js](../../src/modules/consumption/hooks/useLineFollowup.js), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/SupportZohoPanel.jsx](../../src/modules/orders/components/SupportZohoPanel.jsx), [src/modules/orders/data/zohoActivityClient.js](../../src/modules/orders/data/zohoActivityClient.js), [src/modules/orders/hooks/useGoogleOrders.js](../../src/modules/orders/hooks/useGoogleOrders.js), [src/modules/orders/hooks/useOrdersSession.js](../../src/modules/orders/hooks/useOrdersSession.js), [src/modules/users/components/UsersPage.jsx](../../src/modules/users/components/UsersPage.jsx), [src/shared/export/exports.js](../../src/shared/export/exports.js), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx).

### src/shared/security/permissions.js

**Compartilhado · Infraestrutura compartilhada** — Padroniza o endereço para comparação; não cria nem autentica uma identidade.

[Abrir fonte](../../src/shared/security/permissions.js) · Código ou documentação do ponto de referência

Exporta: `allowsAction`, `allowsPage`, `allowsSource`, `moduleKeys`, `moduleLabels`, `normalizeEmail`, `validEmail`, `validateUser`.

Importa arquivos locais: nenhum identificado.

Importado por: [server/worker.js](../../server/worker.js), [src/app/Navigation.jsx](../../src/app/Navigation.jsx), [src/app/Workspace.jsx](../../src/app/Workspace.jsx), [src/modules/consumption/hooks/useConsumptionImports.js](../../src/modules/consumption/hooks/useConsumptionImports.js), [src/modules/imports/components/ImportPage.jsx](../../src/modules/imports/components/ImportPage.jsx), [src/modules/logistics/components/LogisticsPanel.jsx](../../src/modules/logistics/components/LogisticsPanel.jsx), [src/modules/monitoring/components/MonitoringReminders.jsx](../../src/modules/monitoring/components/MonitoringReminders.jsx), [src/modules/my-dashboard/components/MyDashboardPage.jsx](../../src/modules/my-dashboard/components/MyDashboardPage.jsx), [src/modules/my-dashboard/domain/catalog.js](../../src/modules/my-dashboard/domain/catalog.js), [src/modules/my-dashboard/domain/layout.test.js](../../src/modules/my-dashboard/domain/layout.test.js), [src/modules/operational/components/OperationalPage.jsx](../../src/modules/operational/components/OperationalPage.jsx), [src/modules/orders/components/DashboardOverview.jsx](../../src/modules/orders/components/DashboardOverview.jsx), [src/modules/orders/components/OrdersReports.jsx](../../src/modules/orders/components/OrdersReports.jsx), [src/modules/users/components/UsersPage.jsx](../../src/modules/users/components/UsersPage.jsx), [src/shared/security/Access.jsx](../../src/shared/security/Access.jsx), [src/shared/security/accessClient.js](../../src/shared/security/accessClient.js), [src/shared/security/permissions.test.js](../../src/shared/security/permissions.test.js).

### src/shared/security/permissions.test.js

**Compartilhado · Teste** — Verifica permissions no contexto de Compartilhado. Exemplos: permissões recusam páginas, ações e bases não concedidas; cadastro normaliza endereço, rejeita páginas desconhecidas e não aceita dados de planilhas.

[Abrir fonte](../../src/shared/security/permissions.test.js) · Código ou documentação do ponto de referência

Importa arquivos locais: [src/shared/security/permissions.js](../../src/shared/security/permissions.js).

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `node:assert/strict`, `node:test`.

### src/styles/analysis-workspace.css

**Compartilhado · Estilo** — Alinhamento, alturas e rolagem das grades analíticas.

[Abrir fonte](../../src/styles/analysis-workspace.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/controls.css

**Compartilhado · Estilo** — Densidade e acabamento de botões e controles compartilhados.

[Abrir fonte](../../src/styles/controls.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/filter-workspace.css

**Compartilhado · Estilo** — Quadro unificado de filtros, chips de seleção e alcance por categoria.

[Abrir fonte](../../src/styles/filter-workspace.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/filters.css

**Compartilhado · Estilo** — Aparência dos seletores, campos e conjuntos de filtros.

[Abrir fonte](../../src/styles/filters.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/google-orders.css

**Compartilhado · Estilo** — Estado da fonte Google, ações e informações de conexão.

[Abrir fonte](../../src/styles/google-orders.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/identity.css

**Compartilhado · Estilo** — Identidade visual da marca, controles e componentes principais.

[Abrir fonte](../../src/styles/identity.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/layout-polish.css

**Compartilhado · Estilo** — Ajustes de espaçamento, densidade e alinhamento da interface.

[Abrir fonte](../../src/styles/layout-polish.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/monitoring.css

**Compartilhado · Estilo** — Fila, indicadores, detalhes e estados visuais do Monitoramento.

[Abrir fonte](../../src/styles/monitoring.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/my-dashboard.css

**Compartilhado · Estilo** — Estilos responsivos dos painéis pessoais, editores, gráficos e apresentação.

[Abrir fonte](../../src/styles/my-dashboard.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/next-analysis.css

**Compartilhado · Estilo** — Refinamentos dos blocos analíticos e suas grades.

[Abrir fonte](../../src/styles/next-analysis.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/overview-agenda.css

**Compartilhado · Estilo** — Agenda da Visão geral e detalhe compacto junto aos cards.

[Abrir fonte](../../src/styles/overview-agenda.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/overview-kpis.css

**Compartilhado · Estilo** — Identidade, cores e grade dos indicadores da Visão geral.

[Abrir fonte](../../src/styles/overview-kpis.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/page-settings.css

**Compartilhado · Estilo** — Modal de configuração e opções de apresentação da página.

[Abrir fonte](../../src/styles/page-settings.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/report-stories.css

**Compartilhado · Estilo** — Grupos de relatórios e controles de troca de visualização.

[Abrir fonte](../../src/styles/report-stories.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/review-diagnostics.css

**Compartilhado · Estilo** — Apresentação comum dos diagnósticos detalhados de OS e Operacional.

[Abrir fonte](../../src/styles/review-diagnostics.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/sidebar.css

**Compartilhado · Estilo** — Menu lateral, navegação, logo e estados de recolhimento.

[Abrir fonte](../../src/styles/sidebar.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/style.css

**Compartilhado · Estilo** — Base visual geral: tipografia, superfícies, tabelas e estrutura compartilhada.

[Abrir fonte](../../src/styles/style.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/support-people.css

**Compartilhado · Estilo** — Cards individuais, seleção de pessoa e detalhes do suporte.

[Abrir fonte](../../src/styles/support-people.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/support-workspace.css

**Compartilhado · Estilo** — Organização dos painéis de equipe e dados Zoho.

[Abrir fonte](../../src/styles/support-workspace.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/support.css

**Compartilhado · Estilo** — Estilos da área de suporte e seus relatórios.

[Abrir fonte](../../src/styles/support.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### src/styles/theme.css

**Compartilhado · Estilo** — Variáveis e refinamentos dos temas claro e escuro.

[Abrir fonte](../../src/styles/theme.css) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: [src/main.jsx](../../src/main.jsx).

### vite.config.js

**Configuração e entrega · Configuração** — Configura compilação, manifesto e divisão de bibliotecas em chunks.

[Abrir fonte](../../vite.config.js) · Código ou documentação do ponto de referência

Exporta: `default`.

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

Dependências externas: `vite`.

### wrangler.architecture.jsonc

**Configuração e entrega · Configuração** — Publica o mapa em Worker independente, com senha, limitação de tentativas e todos os arquivos protegidos.

[Abrir fonte](../../wrangler.architecture.jsonc) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

### wrangler.jsonc

**Configuração e entrega · Configuração** — Define Worker, distribuição estática, binding de usuários e nomes de configurações de integração.

[Abrir fonte](../../wrangler.jsonc) · Código ou documentação do ponto de referência

Importa arquivos locais: nenhum identificado.

Importado por: nenhuma referência estática identificada; pode ser entrada, script, asset ou documentação.

## Arquivos desta entrega

Separados da base mapeada para não alterar recursivamente a contagem:

- `docs/mapa-arquitetura/GUIA-DE-ESTUDO.md`
- `docs/mapa-arquitetura/index.html`
- `docs/mapa-arquitetura/CATALOGO-DE-ARQUIVOS.md`
- `docs/mapa-arquitetura/inventario.json`
- `docs/mapa-arquitetura/DIAGRAMAS.md`
- `docs/mapa-arquitetura/diagramas/`
- `scripts/architecture/build-map.mjs`
- `scripts/architecture/diagrams.mjs`
- `scripts/architecture/map-template.html`
