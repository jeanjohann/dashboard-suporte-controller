# Persistência de consumo, painéis e consultas — 0.69.0

Preparada em 24/10/2026, após autorização para ampliar o banco. A publicação/ativação é uma etapa separada. Piloto exclusivo do administrador principal; nenhum dado real foi migrado automaticamente durante a preparação.

**Ativada em 24/10/2026 com autorização explícita:** código `bfe5b26` publicado no GitHub e no Cloudflare. Implantação ativa conferida com 100% do tráfego; as duas versões registradas na publicação têm o mesmo etag de Worker. Sessão autenticada confirmou `permitted: true`, leitura dos recursos no D1 e indicação **Banco do sistema** no Dashboard, sem erro. A migração real continua sendo uma ação do proprietário no navegador de origem. Validação final: 500 testes aprovados, nenhum com falha e um previamente ignorado; formatação, imports, build e preparação do Worker conferidos.

## O que vai para o D1

| Recurso            | Conteúdo e funcionamento                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consumo KORE/Arqia | Histórico de extratos já importados, versões ativas/inativas, notas, franquias compartilhadas e configurações do arquivo consolidado. As operadoras continuam separadas na interface; os mesmos critérios impedem somar versões equivalentes. |
| Meu Dashboard      | Painéis salvos, filtros e organização. Os dados dos gráficos continuam vindo dos módulos de origem; o documento de painel não copia planilhas para dentro dos cards.                                                                          |
| Zoho — suporte     | Última consulta salva na seção da equipe, com período, data de leitura, revisão de respostas e configuração das colunas/vínculos.                                                                                                             |
| Zoho — Indicadores | Última consulta salva nesta página, com a regra própria de fechados pelo status atual na data da consulta. Não é mesclada com a consulta histórica da seção de suporte.                                                                       |
| Zoho — pendências  | Última carteira completa salva, incluindo em espera. Conserva a data original: carregar do banco não equivale a consultar novamente o Zoho.                                                                                                   |
| Zoho — sessões     | Fonte CSV Session, mapeamento, fuso e recorte; relatório recalculado a partir das linhas ao validar. Não cria uma fonte automática de presença nem substitui apontamento por tempo conectado.                                                 |

Os lançamentos manuais de Indicadores Suporte, as planilhas centrais, lembretes e coletas do Monitoramento já estavam no banco e continuam usando seus contratos anteriores. Não houve alteração da agenda de coletas, das permissões de outros usuários ou das credenciais de integração.

## Primeiro uso do consumo e dos painéis

1. Abra a página no navegador que contém os dados locais reais.
2. Confira o indicador de armazenamento. No piloto autorizado, ele mostra **Banco do sistema**.
3. Se o banco estiver vazio e houver dados locais, a página mostra a cópia local e o botão **Migrar cópia local para o banco**. Alterações são bloqueadas até essa decisão explícita; a cópia não é apagada.
4. A migração usa o conteúdo salvo localmente, não um formulário ainda não salvo. No Dashboard, a confirmação já existente para descartar edição é respeitada antes da migração.
5. Após a confirmação, novos salvamentos usam a revisão do banco. Outro computador autorizado recupera os dados sem importar novamente os arquivos.

Quando o banco já tem conteúdo, ele é a fonte oficial. Não soma nem substitui automaticamente com a cópia de outro navegador. Para recuperar conteúdo diferente de um segundo computador, exporte seu backup local e confira a importação pela interface; não há mesclagem presumida entre históricos conflitantes. Uma migração repetida de conteúdo idêntico é reconhecida. O usuário pode conservar seus backups JSON e CSV normais, além do backup SQL.

Demais usuários e o modo local continuam com o armazenamento anterior; não recebem acesso ao acervo do proprietário. Uma falha de autenticação, leitura ou gravação do piloto não muda silenciosamente para IndexedDB.

## Uso do Zoho

- Faça a consulta normal e use **Salvar consulta no banco** na seção correspondente. O botão só fica disponível após conferir a revisão salva e quando não há coleta em andamento.
- Na abertura da seção, a última consulta salva é recuperada se ainda não houver uma consulta em tela. O carregamento inicial não substitui uma nova consulta ou edição em andamento.
- **Carregar consulta salva** é uma ação explícita para recuperar o conteúdo do banco. Há aviso quando a leitura/ajustes em tela ainda não foram salvos.
- Cada uma das quatro fontes tem seu próprio registro. Não são unidas semanas, meses ou carteiras de datas diferentes. O período precisa cobrir o filtro do indicador, como antes.
- Salvar/carregar não chama o fornecedor. Atualização automática e agendamento Zoho não fazem parte desta rodada.

## Integridade, concorrência e limites

O Worker autentica a sessão pelo fluxo existente e valida novamente administrador ativo e e-mail do proprietário. Escopo, recurso e chaves vêm de um catálogo fechado no servidor, sem coleções ou SQL livres. Gravações exigem a mesma origem; consumo/Zoho exigem permissão de importação e dashboards respeitam sua permissão própria. Respostas não usam cache.

Usa `business_documents`, já existente em `BUSINESS_DB`, com recursos separados da agenda e dos indicadores. Não é necessária migração SQL; não há mudança em `USERS_DB`. Partes imutáveis são reconhecidas por SHA-256 e compartilhadas quando iguais. Um ponteiro por recurso só muda após reconstrução completa, conferência de tamanho/hash, validação de domínio e comparação atômica da revisão. Não publica metade de um upload nem soma dados repetidos. Uma sessão antiga recebe conflito e conserva a edição anterior.

Limites técnicos do piloto: 16 MiB por documento consolidado, até 512 partes e 300 arquivos no histórico de consumo; continuam valendo os limites próprios de painéis e CSV Session. Partes têm no máximo 32 mil unidades UTF-16, sem quebrar pares de caracteres. Cota de 128 MiB para os payloads das partes/manifestos deste novo acervo por proprietário, contada atomicamente, inclusive uploads ainda incompletos. A cota não é reserva de capacidade: o banco também contém as outras fontes e segue os limites da conta Cloudflare.

Não há exclusão automática de versões/partes nesta entrega. Conteúdo anterior ou abandonado pode consumir espaço; ao atingir o limite, a gravação é recusada sem apagar o que já existe. Limpeza e interface de recuperação das versões imutáveis precisarão de política própria. A retenção de cinco versões das planilhas e trinta dias do Monitoramento permanece independente.

Os documentos contêm dados privados, não apenas hashes. A aplicação não copia tokens do Zoho/KORE para esses documentos. O GitHub recebe código e documentação; exportações SQL e a homologação SQLite ficam fora do Git.

## Validação e recuperação

Testes SQLite exercitam os mesmos contratos usados pelo D1: revisões concorrentes, partes ausentes/corrompidas, reenvio, deduplicação, cota transacional, origem, recursos, permissões, migração, identificadores com zeros e ausência de fallback após erro. Consultas Zoho preservam datas e sessões têm relatório recalculado.

Homologação no navegador, com dados fictícios e banco SQLite isolado: migração e recuperação de painel por outra aba; edição antiga bloqueada com rascunho preservado; migração de franquia; salvamento e recuperação da carteira Zoho com data. Não houve gravação fictícia no D1 real nem consulta extra ao fornecedor.

Backup privado do banco de negócio exportado em 24/10/2026 antes da ativação, com SHA-256 e restauração em SQLite em memória conferidos por `PRAGMA integrity_check`. O exportador inicial teve uma tentativa sem sucesso; a repetição foi concluída e validada. Nenhuma restauração ou limpeza foi executada em produção.

Após publicar, conferir a indicação de banco no administrador e migrar os dados reais de cada navegador de origem. A preparação local não comprova que esses dados já estejam migrados. Em caso de conflito, exportar a edição quando aplicável, recarregar a versão oficial e revisar antes de substituir.
