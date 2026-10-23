# Exclusão de lembretes e agendamentos — 0.61.0

No Monitoramento, abra **Lembretes de conferência → Ver lembrete → Excluir lembrete**. A confirmação identifica o veículo e explica que o item sairá das listas. **Manter lembrete** fecha a confirmação sem gravar nada.

A ação funciona em lembretes agendados, conferidos ou cancelados. Não altera telemetria, situação técnica, fotografias do Monitoramento ou planilhas. No piloto remoto, a exclusão fica no banco e vale para os navegadores autorizados após a próxima leitura da agenda. O modo local mantém seu isolamento por usuário e navegador.

É uma exclusão da agenda, com ação/data preservadas no histórico interno. O registro não aparece entre agendados nem encerrados e não gera pendência. **Não é eliminação física de dados pessoais ou do histórico**: essa seria outra operação. A exclusão não tem desfazer nesta versão; um novo agendamento pelo veículo cria um novo ciclo, preservando o histórico anterior.

A revisão continua crescente após excluir e agendar novamente. Isso impede que uma tela antiga altere ou exclua o novo ciclo do mesmo veículo. Gravações usam a transação e o controle de concorrência existentes; a tela só retira o item após confirmação do repositório. Falha no banco não aciona gravação local como substituição.

O servidor omite exclusões da listagem normal. A paginação atravessa páginas compostas somente por registros excluídos sem perder lembretes das páginas seguintes. Nenhum registro real foi excluído durante o desenvolvimento ou a validação; testes usam SQLite e dados fictícios.

Não há alteração de esquema SQL nem migração de dados. Clientes locais antigos que não reconheçam a nova ação devem atualizar a aplicação antes de ler uma agenda local que contenha exclusões. O CSV normal usa a agenda visível; o histórico interno de uma exclusão permanece no armazenamento.

Depois do primeiro uso, uma reversão de versão deve manter suporte ao estado/evento `deleted`/`delete`. Código anterior sem esse suporte recusa a agenda por incompatibilidade; não apagar registros para viabilizar downgrade.

Validação cobre exclusão de registros ativos/encerrados, auditoria, nova agenda após exclusão, recusa de revisões antigas e paginação com exclusões. A inspeção visual interativa está pendente porque o controle de navegador está desativado nesta sessão.

Publicada em 22/10/2026: GitHub main `2a13b29`; upload Cloudflare `ac63fb37-8cf8-4f0b-a7e2-fc1ed9bbd845`; versão ativa `a5687c4c-fb63-4690-a4dc-93252137191c` com 100% do tráfego e mesmo etag do código. Bancos separados, piloto owner, login e cron existente conferidos. Verificações completas: importações, formatação, 445 testes aprovados, um ignorado previsto e compilação concluída. Nenhum lembrete real foi excluído durante a entrega.
