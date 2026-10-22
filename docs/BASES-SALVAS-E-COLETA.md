# Bases salvas e coleta do Monitoramento — 0.59.0

## Funcionamento no piloto

Somente o administrador principal ativo acessa as novas bases compartilhadas. O Worker confirma identidade e autorização em cada requisição; o navegador não recebe credenciais do banco. `BUSINESS_DB` permanece separado de `USERS_DB`.

OS, Operacional e Logística são carregadas do banco ao abrir o sistema. Importar um arquivo completo ou consultar a integração Google existente salva uma versão e troca a base ativa após confirmação. Relatórios usam uma versão de cada fonte; versões antigas não são somadas. Isso não remove linhas repetidas dentro da planilha, que continuam disponíveis para revisão. Uma carga apenas com linhas novas substituiria a base: não há importação incremental nesta etapa.

Mantemos a versão ativa e as quatro outras versões publicadas mais recentes de cada fonte. São armazenados os dados processados dos importadores, com células, valores originais, textos exibidos, apontamentos, origem e referências de linhas. Fórmulas não são recalculadas. O arquivo XLSX original continua necessário como documento de origem e para edição.

## Confirmação e falhas

O cliente envia partes imutáveis e um manifesto. O servidor confere tamanho, sequência, SHA-256 e estrutura antes de concluir a versão. A publicação troca os ponteiros ativos em uma transação. Lotes de OS/Operacional/Logística são publicados juntos ou recusados juntos. Revisões impedem sobrescrita silenciosa entre computadores. Falha no envio não publica uma carga parcial; conflito exige recarregar antes de tentar novamente.

Limite do piloto: 16 MiB de JSON por base, 512 partes, 50 mil linhas e 200 colunas por linha. O limite considera dados processados, não o XLSX comprimido. Cada parte fica abaixo do limite de linha do D1. Consultas são autenticadas e sem cache público.

Extratos de consumo, suas notas e backups continuam no armazenamento anterior. No piloto, importar extratos e bases centrais exige lotes separados para não anunciar confirmação parcial entre D1 e IndexedDB. Restaurar backup de consumo não substitui a base Operacional central. Zoho, coletas KORE, configurações do Meu Dashboard e anotações de tratamento do Monitoramento não foram migrados. Lembretes e seus históricos já usam o banco conforme o piloto 0.58.0.

Google Sheets conserva a atualização existente, manual ou automática com página aberta e opção habilitada. O agendador desta versão consulta apenas o Monitoramento; não agenda Google, Zoho ou operadoras.

## Monitoramento salvo

- Ao abrir, lê a última fotografia válida do D1, sem chamar o fornecedor. Enquanto a página estiver visível, confere o banco a cada cinco minutos e ao recuperar foco.
- **Atualizar dados** consulta o fornecedor e só publica uma coleta completa. **Carregar base salva** apenas relê o banco.
- Coletas às **09h, 12h, 15h e 18h de São Paulo**, inclusive com navegador fechado. Cron UTC: `0 12,15,18,21 * * *`.
- Identidade da execução, lease de dois minutos e transação protegem fotografia e eventos contra concorrência e reenvios.
- Fotografias e eventos são retidos por **30 dias**; a última válida permanece mesmo se mais antiga. Limpeza ocorre ao final das tentativas e exige banco disponível. Falha de limpeza é registrada e pode deixar retenção temporariamente maior.
- O relatório tem histórico paginado das execuções. A exportação usa a fotografia atual, sem concatenar as antigas. Atrasos e retornos são observados entre coletas: não representam o instante exato da falha nem duração contínua.
- A regra conservadora de coleta desatualizada após duas horas permanece. Com intervalos de três horas ou durante a noite, os dados podem aparecer desatualizados até a próxima coleta; o sistema não simula leitura recente para gerar alertas.
- A primeira fotografia exige atualização manual pelo proprietário ou execução programada após publicação. Falha mantém a última válida e aparece no histórico.

Cron usa UTC e alterações podem levar até 15 minutos para propagar, conforme a [documentação Cloudflare](https://developers.cloudflare.com/workers/configuration/cron-triggers/). São Paulo usa UTC−03 na configuração aprovada. D1 Free limita o banco a 500 MB e cada execução a 50 consultas; acompanhar uso no piloto. [Limites consultados em 22/10/2026](https://developers.cloudflare.com/d1/platform/limits/).

## Verificação e ativação

Migração `0002_snapshots_and_collection.sql` aplicada ao banco de negócio em 22/10/2026. Backup SQL antes/depois, SHA-256 e restauração em SQLite conferidos; um documento de lembrete foi preservado e novas tabelas estavam vazias. Não houve importação automática de arquivos privados para produção.

Teste local com os três arquivos reais: OS 1.406 linhas / 3.454.097 bytes; Operacional 1.744 / 11.558.640; Logística 1.685 / 2.743.614. Gravação e recuperação preservaram integralmente as estruturas. Esse ensaio usa SQLite e não comprova sozinho limites de CPU/memória do Worker remoto. O primeiro envio completo no piloto deve confirmar esses limites com o volume real; falha não autoriza aumentar plano nem apagar a base anterior.

Testes cobrem integridade, partes ausentes, conflito entre sessões, publicação conjunta, reimportação sem soma, retenção, acesso, coleta parcial, lease vencido, repetição de cron, 1.800 veículos e paginação do histórico. Controle de navegador indisponível nesta sessão: validação visual e primeiro uso autenticado permanecem para conferência após publicação.

**Publicação confirmada em 22/10/2026:** GitHub main `0072c8c`; upload Cloudflare `ff608f28-fc88-4b88-aa11-98d3817e6ff3`; versão ativa `91c2c185-6d5f-47d7-b67c-3d341a3c52a7` com 100% do tráfego e mesmo etag do código. Handlers `fetch` e `scheduled`, bancos separados e piloto owner confirmados. Cron `0 12,15,18,21 * * *` publicado. As três rotas de bases salvas/histórico verificadas sem sessão redirecionam ao Access.

Verificação completa: importações, formatação, 434 testes aprovados, um ignorado previsto e compilação concluída. O primeiro carregamento autenticado das bases reais e a primeira coleta salva ainda exigem conferência pelo proprietário; publicação do cron não comprova execução bem-sucedida do fornecedor. Importar as bases completas uma vez na versão nova e usar **Atualizar dados** no Monitoramento inicia o uso, ou aguardar a primeira coleta programada. Não houve transferência automática das planilhas privadas durante a publicação.
