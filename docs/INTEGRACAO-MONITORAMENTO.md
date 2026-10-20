# Preparação da integração do Monitoramento Ativo

Contrato interno e caminho de consulta implementados em 0.21.0. **O fornecedor ainda não está conectado.** Não há credenciais, chamadas externas, agendamento de coleta ou armazenamento de telemetria ativados por esta entrega. A consulta retorna 503 enquanto o serviço privado não estiver configurado.

## Fluxo preparado

1. A tela consulta `GET /api/monitoring/snapshot` na própria origem, somente por ação explícita.
2. O Worker valida o JWT do Cloudflare Access e consulta o usuário ativo no D1.
3. Somente administrador ou usuário com a página `monitoring` pode obter o retrato. Exportar continua sendo permissão separada. Não existe autorização por base nesta versão; confirmar essa necessidade antes de conectar uma frota real compartilhada.
4. O Worker consulta o futuro Service Binding privado `MONITORING_SERVICE`, na rota interna `/snapshot`. O endereço lógico `https://monitoring.internal/snapshot` pertence a esse contrato de binding; não é o endereço da API do fornecedor e não provoca uma consulta pública de DNS.
5. O coletor/adaptador deverá buscar todas as páginas/bases necessárias com credenciais do servidor e devolver o contrato abaixo. As credenciais, cookies e JWT do usuário não são encaminhados pelo Worker.
6. O Worker valida estrutura, remove campos extras e devolve somente os campos permitidos, com `Cache-Control: no-store`. A tela valida novamente e calcula os indicadores.

O Service Binding não foi adicionado ao `wrangler.jsonc`, pois ainda faltam o serviço e o formato real da API. Isso evita configurar um serviço inexistente e afetar o deploy atual. A integração poderá usar um coletor em outro servidor, mas o transporte servidor → coletor precisará de adaptação e autenticação próprias; não colocar URL externa ou token no frontend.

## Contrato v1 — exemplo inteiramente fictício

```json
{
  "schemaVersion": 1,
  "complete": true,
  "referenceAt": "2026-10-15T12:00:00Z",
  "collections": [{ "clientId": "base-teste", "at": "2026-10-15T12:00:00Z", "ok": true }],
  "vehicles": [
    {
      "clientId": "base-teste",
      "clientName": "Base de exemplo",
      "vehicleId": "veiculo-teste",
      "plate": "TEST-001",
      "trackerId": "001620000000000001",
      "lastRecordAt": "2026-10-12T11:30:00Z",
      "supplyVoltageV": 12.6,
      "profile": "Perfil exemplo"
    }
  ]
}
```

- Datas: ISO com fuso explícito, incluindo segundos. Confirmar com o desenvolvimento se a comunicação significa geração ou recebimento do registro; não converter datas sem conhecer o fuso.
- `referenceAt`: instante do retrato produzido pelo coletor. Na tela real, a referência da classificação é atualizada localmente a cada minuto, e o instante original recebido continua visível.
- `clientId`, `vehicleId` e `trackerId`: strings. Não converter números longos no navegador nem usar placa como chave estável. Confirmar chave do veículo; a tabela usa base + veículo, mantendo rastreador separado.
- `collections`: uma entrada por base, sem duplicidades. `at` é a última coleta daquela base, não a última comunicação do veículo. Uma base com falha deve ter `ok: false`, preservando a frota anterior no coletor quando houver, sem inventar data de sucesso.
- `complete: true`: o coletor garante que paginou integralmente o retrato esperado e contabilizou as bases. Resposta parcial/incompleta não substitui silenciosamente o retrato anterior. Não marcar true apenas porque uma requisição HTTP teve sucesso.
- Alimentação: volts, zero válido, ausente = null. Preferir número; texto recebido é preservado para conferência, sem conversão/limites elétricos automáticos. Perfil é texto de configuração, sem inferir defeito.
- Data da telemetria inválida/ausente/futura vai para revisão/classificação neutra. Chaves de veículo vazias/duplicadas são excluídas como grupo e quantificadas. Erro estrutural, base desconhecida ou metadados de coleta duplicados recusam o retrato inteiro.
- Limites de defesa do contrato: 5 MiB efetivamente lidos e 50 mil veículos por retrato. Rever explicitamente se a frota exigir mais; não truncar silenciosamente.

## Falhas, atualização e armazenamento

Consulta manual: timeout de 20 s no navegador e 15 s na porta do coletor. Sem polling automático e sem coletor executando com a tela fechada. Recalcular idade a cada minuto não é uma nova requisição. A frequência de coleta (proposta de quatro por hora), limites, paginação e infraestrutura ainda precisam ser confirmados.

Erro HTTP, HTML de login, timeout, schema incompatível ou retorno parcial não acionam demonstração automática. A última frota real carregada é mantida, com coletas indisponíveis e sinais neutros, até uma consulta válida. Uma falha inicial mostra erro sem inventar veículos. A demonstração só é ativada por botão e nunca compartilha anotações com veículos reais.

Coleta utilizável: sucesso, data válida não futura e idade inferior a duas horas; esse limite segue provisório. O timestamp original de coleta é mantido: atualizar a referência da tela não “renova” uma coleta antiga.

Tratamento manual continua **somente em memória da sessão**. O botão Salvar atualiza o histórico local da sessão e as exportações. Não há sincronização entre usuários, gravação D1/IndexedDB ou garantia de sobrevivência a recarga. Exporte antes de sair. Não ativar escrita compartilhada sem definir autorização, concorrência, auditoria, retenção e backups. O D1 existente continua guardando apenas usuários e permissões.

## Arquivos e próximo passo com o desenvolvimento

- `server/monitoring.js`: consulta privada e sanitização das respostas; `server/worker.js`: autenticação/autorização.
- `src/modules/monitoring/data/snapshotContract.js`: schema, lista permitida e leitura limitada.
- `src/modules/monitoring/data/monitoringClient.js`: consulta à própria origem, sem token do fornecedor.
- `src/modules/monitoring/hooks/useMonitoringSource.js`: fonte, cancelamento de solicitações, falhas e referência local.
- `src/modules/monitoring/domain/monitoringAnalytics.js`: cards de tratamento e recortes da fila.

Para conectar: obter resposta real de teste e documentação atualizada; confirmar autenticação e escopo por base, campos/chave, fuso, significado temporal, paginação, limites e falhas parciais; implementar o adaptador/collector no servidor; testar sem publicar tokens ou amostras reais no Git; configurar o binding; conferir permissões e bases autorizadas; só depois ativar a consulta real. Episódios, recuperações, consumo, notificações externas e histórico compartilhado continuam dependentes da próxima etapa. Lembretes manuais e seu histórico possuem persistência exclusivamente local desde 0.41.0, conforme [guia de monitoramento](MONITORAMENTO-DE-FROTA.md), sem depender desta integração.

## Conferência da entrega

Testes automatizados usam respostas artificiais: versão/completude, datas, preservação de IDs/zero, remoção de campos extras, limite real de leitura, falha HTTP/HTML, permissões, usuário suspenso, ausência de binding e erros do serviço. No navegador, uma resposta artificial com 31 veículos validou consulta, paginação/Último, busca, anotações, atualização, retenção da frota com falha parcial e envelhecimento da coleta sem polling. Foram conferidos os doze cards, seus recortes, exportações, impressão dos números e os temas em desktop/celular. O empacotamento do Worker foi conferido com dry-run, sem publicar dados nem configurar o coletor. Esses testes não substituem a homologação com a API real.
