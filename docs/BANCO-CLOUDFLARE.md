# Banco de negócio no Cloudflare — piloto 0.58.0 e evolução 0.59.0

**Ampliação preparada em 0.69.0:** consumo/franquias, painéis e últimas consultas Zoho passam a ter adaptadores remotos no mesmo esquema de documentos, sem migração SQL. A ativação e transferência dos dados locais são explícitas; [contratos, uso e limites](PERSISTENCIA-DO-ACERVO-069.md). O texto abaixo preserva o histórico das primeiras etapas.

**Evolução 0.61.0:** [leitura das bases com menos requisições](BASES-SALVAS-E-COLETA.md) e [exclusão manual de lembretes](EXCLUSAO-DE-LEMBRETES.md), preservando histórico interno e permissões do piloto. Não há migração SQL nem limpeza automática da agenda.

Em 22/10/2026, o proprietário escolheu D1 e autorizou renovar o acesso técnico. O piloto é restrito ao administrador principal. Este documento registra a primeira conexão da agenda; não significa que todas as fontes foram migradas.

## Banco e acesso

- Banco: `dashboard-suporte-negocio`, binding `BUSINESS_DB`, separado de `USERS_DB`.
- Migrações: `server/persistence/migrations`, sem aplicar esses arquivos ao banco de usuários.
- `BUSINESS_REMINDERS_ACCESS=owner`: somente administrador ativo cujo e-mail corresponde ao proprietário configurado. Os demais usuários mantêm explicitamente sua agenda local nesta fase.
- Worker valida o JWT Access e consulta a permissão vigente antes das rotas. Navegador não recebe credenciais de banco. Origem é conferida nas gravações, consultas não usam cache e não há endpoint genérico por coleção/escopo.
- Uma agenda do piloto no espaço `addlog`, coleção `monitoring-reminders`; chave SHA-256 da identidade base/veículo. O hash organiza a chave e não anonimiza o conteúdo.

## Primeira fonte: lembretes do Monitoramento

A agenda usa documentos separados por veículo, com revisão atômica, estado e histórico de criação, reagendamento, cancelamento e conferência. Uma sessão antiga não substitui uma alteração mais recente. O servidor gera o horário da nova ação e registra o último responsável pela gravação no envelope. O histórico local conserva seus horários originais; o responsável pela migração não é apresentado como autor dos eventos antigos.

O banco é a fonte oficial para o administrador do piloto. Falhas de leitura/gravação aparecem como erro e preservam o resultado anterior; não há troca silenciosa para IndexedDB. Falta de binding também é erro para o piloto. Ler a agenda em outro computador autorizado independe da planilha e da API de telemetria estarem carregadas.

Há paginação de 25 documentos e validação completa antes de substituir a agenda visível. Até 5.000 veículos com lembretes por leitura; cada documento tem limite de 128 KiB e a requisição de 256 KiB. Exceder um limite recusa a operação sem cortar histórico. Históricos maiores exigirão uma evolução explícita do modelo para eventos separados. A leitura paginada não é uma fotografia transacional; revisões por veículo protegem as gravações.

## Migração dos navegadores de origem

1. Abrir Monitoramento no navegador/conta que contém a agenda real e expandir Lembretes.
2. Conferir quantidade, veículos, situações e eventos apresentados na lista local.
3. Acionar **Migrar lembretes para o banco**. É uma importação autenticada e explícita, sem dados de demonstração.
4. Registros iguais já existentes são reconhecidos. Mesma identidade com histórico diferente é conflito: nada é substituído e a edição fica bloqueada até revisão. Não há mesclagem automática.
5. Conferir agenda e exportação, recarregar e abrir em outro computador do piloto. A cópia IndexedDB não é apagada. A conclusão fica marcada neste navegador; os próximos salvamentos usam o banco.

A migração é confirmada por registro, não por uma transação única de todos os navegadores. Uma falha pode deixar uma parte já importada; repetir reconhece os registros iguais, sem duplicá-los. A cópia local continua preservada. Lembretes em outro navegador só podem ser migrados ao abrir aquele navegador. Registros anteriormente apagados não são recuperados por esta integração.

## Backup e migração futura

`powershell -File scripts/backup-business-db.ps1` exporta SQL remoto para `.backups/business/`, fora do Git, e gera SHA-256. Arquivo parcial não é anunciado como backup concluído. O script não exporta usuários, não restaura dados e não cria agendamento. Depois de iniciar uso real, executar exportação diária e antes de migrações; manter uma cópia em local de acesso controlado.

Antes de uma restauração real: suspender gravações de forma controlada, exportar o estado atual, restaurar primeiro em um banco de homologação, conferir contagens, revisões, históricos e acesso, e só depois aprovar o destino de produção. Não usar o banco de usuários como destino de teste. O comando de restauração não é executado automaticamente.

O D1 tem [Time Travel automático](https://developers.cloudflare.com/d1/reference/time-travel/), com janela conforme o plano: 7 dias no Free e 30 no Paid, segundo os [limites consultados em 22/10/2026](https://developers.cloudflare.com/d1/platform/limits/). Isso complementa a exportação; ainda não há cópia externa agendada. Não há exclusão automática de lembretes ou histórico neste piloto.

O SQL e os documentos JSON podem ser exportados. Migrar para outro servidor requer adaptar o acesso SQL, autenticação e operações atômicas ao novo motor; não basta mudar uma URL. O domínio e os contratos de repositório permanecem separados da implementação D1.

## Próximas fontes

A versão 0.59.0 conecta OS, Operacional, Logística e fotografias do Monitoramento ao banco. Mantém cinco versões por planilha, coletas às 9h/12h/15h/18h de São Paulo e fotografias por 30 dias, conservando a última válida. Zoho/KORE, consumo e Meu Dashboard continuam nos armazenamentos anteriores. [Funcionamento e estado de ativação](BASES-SALVAS-E-COLETA.md). A migração SQL isolada não ativa cron nem notificações.

## Estado de ativação

O proprietário confirmou persistência após recarga e acesso pelo Edge em 22/10/2026. A migração `0002_snapshots_and_collection.sql` foi aplicada após backup e restauração local conferidos, preservando o único documento de lembrete existente. Uma segunda exportação/restauração confirmou a integridade do esquema ampliado. A versão 0.59.0 foi publicada no GitHub e no Cloudflare com cron ativo; primeiro uso autenticado das novas fontes ainda precisa ser conferido. [Registro da publicação](BASES-SALVAS-E-COLETA.md).

Banco criado em 22/10/2026, região ENAM, identificador `b3609719-196a-40a7-95b9-5e3a769c9610`. Migração `0001_business_documents.sql` aplicada no serviço remoto. Primeira exportação SQL conferida por SHA-256 e restaurada em SQLite local: integridade OK, índice de listagem presente e zero documentos. Esse ensaio valida a estrutura inicial; não substitui a conferência dos dados reais após a migração de cada navegador.

0.58.0 publicada em 22/10/2026 com autorização específica: GitHub main, commit `9034a2a`; upload Cloudflare `2337b93c-16d7-4df4-bc55-aca25104e0e3`. A versão ativa subsequente `3d115df3-31d4-40ba-8d11-a089bc9d8813` foi conferida com 100% do tráfego e o mesmo etag do código Worker. Bindings BUSINESS_DB/USERS_DB separados e BUSINESS_REMINDERS_ACCESS=owner confirmados na versão ativa. A rota /api/business/status sem sessão redireciona ao Cloudflare Access; leitura SQL após publicação confirmou zero documentos. Controle do navegador desativado no Work durante a preparação; homologação visual e recarga em outro navegador ainda exigem conferência do proprietário. Importações, formatação, 421 testes e compilação foram aprovados; um teste previsto permanece ignorado. A alteração final de acesso ao armazenamento local também passou nos quatro testes do adaptador. Nenhum lembrete real foi transferido automaticamente.
