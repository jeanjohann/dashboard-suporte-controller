# Integração do Monitoramento Ativo — diagnóstico legado Addlog

Em **0.50.0**, a consulta manual do Monitoramento Ativo passa a aceitar o diagnóstico interno do sistema legado Addlog. A ativação exige endereço e token configurados como segredos no Cloudflare. A documentação interna fornecida pelo proprietário e respostas reais da frota não são copiadas para o repositório.

## Fluxo e autorização

1. A tela consulta `GET /api/monitoring/snapshot`, na mesma origem, por ação explícita.
2. O Worker valida Cloudflare Access e usuário ativo no D1. A rota exige administrador ou permissão `monitoring`; exportação tem permissão própria.
3. O servidor consulta o endereço HTTPS configurado no segredo `MONITORING_DIAGNOSTIC_URL`, com o segredo `MONITORING_DIAGNOSTIC_TOKEN` no header `Token`. Só aceita o domínio `sistema.addlog.com.br` e o caminho de diagnóstico; bloqueia query, fragmento, credenciais em URL e redirecionamentos. Cookies, JWT e parâmetros do navegador não seguem ao fornecedor.
4. O diagnóstico retorna todos os veículos de todas as bases do legado em uma chamada, sem paginação documentada. O acesso à página dá acesso a todas essas bases; não há autorização individual por base. A integração não inclui os demais sistemas de rastreamento.
5. O adaptador valida a resposta completa, converte os campos documentados e remove campos extras. A tela valida novamente o contrato v1. Respostas usam `Cache-Control: no-store`.

O antigo `MONITORING_SERVICE` continua compatível e tem precedência quando configurado: fornece diretamente o contrato interno em `/snapshot`. Não configure simultaneamente um binding antigo e o diagnóstico esperando que ambos sejam consultados.

## Mapeamento e tempo

- `base` é a identidade da base, sem inventar uma razão social. A chave estável do acompanhamento é base + `vehicleId`, independente de placa ou troca de rastreador.
- IDs continuam como texto. Números só são convertidos quando inteiros seguros; um identificador já impreciso recusa o retrato.
- `lastUpdate` representa o último ponto recebido, em `DD-MM-YYYY HH:MM:SS` UTC. É convertido para ISO UTC com validação de calendário/hora. Data inválida ou futura recebe classificação neutra; `null` significa sem posição registrada.
- O fuso de `generatedAt` não foi especificado separadamente na documentação recebida. Seu texto é mostrado como informado, sem conversão. `referenceAt` e horário de coleta registram o recebimento completo pelo servidor, não o horário de atualização de cada veículo. Falta confirmar o fuso de geração para usá-lo como relógio da fonte.
- `positions24h` é número de posições nas últimas 24 horas. Zero válido é preservado. Não representa MB, consumo financeiro ou histórico de períodos anteriores. A janela deve ser 24 horas.
- `power.supply` é tensão em volts, preservando zero e ausência. Nos MXT-130/160 em falha externa, pode representar a bateria interna. O painel apresenta a falha externa e o estado/carga da bateria sem criar limites elétricos próprios.
- Perfis são nomes das configurações aplicadas. Lista vazia significa sem perfil informado, sem inferir defeito. A resposta real inclui perfis aplicados sem nome: eles permanecem explícitos como “Perfil sem nome”. Campos ausentes de alimentação/bateria permanecem `null`, sem criar zeros.
- Modelo, identificador legado, posições e bateria aparecem no detalhe do veículo e na exportação. Posições também possuem coluna ordenável na fila.

## Consulta, falhas e persistência

A consulta é manual, com intervalo de pelo menos 60 segundos na tela. O binding `MONITORING_DIAGNOSTIC_LIMITER` limita consultas agregadas a uma por minuto por localização Cloudflare, em regime aproximado. Não é um bloqueio global distribuído entre regiões. Não há polling, tarefa com a tela fechada, cache compartilhado ou coleta agendada.

Timeout de 15 s no servidor e 20 s no navegador; leitura limitada a 5 MiB e 50 mil veículos, sem truncamento. Falhas HTTP, HTML de login, schema incompatível, identificadores duplicados e qualquer entrada em `errors` recusam o retrato inteiro. Uma resposta parcial nunca remove silenciosamente as bases que falharam. A última frota real da sessão é mantida com coleta indisponível e sinais neutros; uma primeira falha não inventa veículos. Mensagens internas e credenciais do fornecedor não são devolvidas.

Datas de coleta válidas, não futuras e com menos de duas horas continuam sendo o critério provisório de classificação utilizável. Recalcular a idade localmente não executa outra consulta. Desde 0.53.0, a demonstração fica restrita aos testes de desenvolvimento, sem opção na interface. Limites de 30/60/90 dias e a conferência com o Operacional estão descritos em [Monitoramento: acompanhamento e cadastros](MONITORAMENTO-TRABALHO-E-CADASTROS.md).

Tratamentos permanecem na memória da sessão. Lembretes e seu histórico são locais por usuário/navegador. Histórico de episódios/recuperações, permissões por base, armazenamento compartilhado, notificações e retenção continuam pendentes. O D1 guarda apenas usuários e permissões.

## Configuração e homologação

Execute `scripts/setup-monitoring.ps1` no computador autorizado. Informe o endereço HTTPS completo e o token em entrada oculta. O script cadastra os dois segredos no Cloudflare sem gravar o token em arquivo/argumentos ou mostrá-lo. O arquivo local ignorado de conclusão contém somente data e indicador de sucesso. Publique com `--keep-vars` para preservar as configurações remotas.

Conferir na primeira leitura: autorização, bases/quantidade esperadas, algumas placas conhecidas, última comunicação UTC versus portal, registros nulos/zero, posições em 24 horas e detalhes de alimentação/perfil. Uma leitura bem-sucedida não comprova completude das bases além do que a API declara; validar a cobertura com o responsável pelo legado.

## Código e testes

- `server/addlogDiagnostic.js`: adaptador do contrato legado, IDs, UTC e recusa de parcialidade.
- `server/monitoring.js`: transporte privado, segredos, limitação e sanitização.
- `src/modules/monitoring/data/snapshotContract.js`: contrato v1, lista permitida e leitura limitada.
- `src/modules/monitoring/hooks/useMonitoringSource.js`: atualização manual, intervalo, cancelamento e retenção da frota em falha.
- Testes artificiais verificam datas impossíveis/futuras, zeros, ausência, duplicidade, falhas por base, destino restrito, remoção de campos privados, transporte sem identidade do usuário, limitação e exportação. Testes da rota mantêm a cobertura de autorização e suspensão.
