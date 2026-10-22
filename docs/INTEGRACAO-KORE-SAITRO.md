# KORE/Saitro — piloto de consulta manual

Entrega 0.55.0, em 22/10/2026. Acesso em **Consumo → KORE**. Consulta uma página por vez e exporta somente a página exibida. O total informado pela operadora não significa que todas as linhas foram coletadas. A amostra de conexão retornou 20 linhas e total de 1.083; esses números podem variar.

As páginas KORE e Arqia herdam a permissão de Consumo M2M. A consulta KORE permanece restrita a administradores ativos. Arqia exibe a pendência de documentação e acesso, com atalho para o controle de CSVs, sem métricas fictícias.

## Definições confirmadas pela operadora

- Consumo em **bytes**, preservado como inteiro, e horários em **BRT (UTC-03:00)**.
- A consulta lê o banco atual da KORE. Sessões abertas dependem de Interim das operadoras, com atualização entre **5 minutos e 1 hora**.
- Uso da API sem custo informado pelo atendimento. Isso não define valores dos serviços de telecomunicação.
- Esta conta está sem restrição de IP; a KORE permite configurar essa restrição.
- Histórico de sessões com a mesma disponibilidade da plataforma, sem janela numérica de retenção confirmada.

**Pendente:** início/fim do período representado pelo consumo acumulado de cada linha. Não assumir mês civil, ciclo de franquia ou consumo desde a ativação. Até homologar essa definição, os valores ficam separados dos indicadores e históricos CSV.

Na retomada do teste, a geração do token retornou HTTP 403, código 2001: a conta já possuía token registrado. Após confirmação do proprietário de uso exclusivo, foi feita limpeza operacional única. A leitura avançou, mas o encerramento do token não foi reconhecido pelo contrato documentado. A tentativa seguinte retornou código 2000, exigindo aguardar 10 minutos para novo token. O painel explica esses estados. A homologação final da leitura e do encerramento permanece pendente; não há limpeza global automática.

## Fluxo implementado

O navegador consulta somente `GET /api/consumption/kore/status` e `GET /api/consumption/kore/page?pagina=N`. O Worker verifica a identidade e o perfil administrador antes de consultar a operadora.

1. `GET /api/token/`: credenciais em segredos do servidor, parâmetros conforme exigência da API.
2. `GET /api/simcards/?pagina=N`: autenticação pelo header retornado na concessão do token.
3. `GET /api/token/disable/{token}/`: encerramento somente do token utilizado, inclusive após falha de leitura. Não há limpeza global de tokens.

Destino fixo `https://kore.saitro.com`. Sem redirecionamentos automáticos ou URLs fornecidas pelo navegador. Respostas têm tamanho limitado e contrato validado; credenciais, cookies e JWT do dashboard não entram na resposta. Erros e diagnóstico usam códigos fixos, sem URLs privadas ou corpos do fornecedor.

O painel preserva a última página válida em caso de erro. Ausência de bytes não vira zero. Identificadores são texto; subtotal abrange somente a página atual. Nenhuma coleta automática, gravação no D1, substituição de CSV, alteração de SIM ou envio de SMS é ativada.

## Limites e próximos passos

Desde 0.55.1, a interface exige intervalo de 10 minutos entre leituras, conforme recusa real de novo token. O limitador adicional do Worker permanece de uma requisição por minuto por localização da Cloudflare. Isso não é uma trava global distribuída para o token: evitar consultas simultâneas por outros consumidores da mesma conta. O fornecedor documenta um token ativo por usuário e apresenta referências divergentes a 10 requisições/token e 200 requisições/10 minutos. Confirmar a regra efetiva antes de ampliar a coleta. O tamanho da página vem da resposta, sem assumir o tamanho citado na introdução da documentação.

Há documentação de produtos e histórico diário de sessões em `/api/simcards/consumo/dados/YYYY-MM-DD/` e por linha. Esses recursos ainda não são coletados pelo piloto. Depois de confirmar período, limites e concorrência, homologar linhas conhecidas no portal/CSV, paginação completa e retenção antes de agregar indicadores.

Segredos `KORE_API_USERNAME` e `KORE_API_PASSWORD`, configuráveis por `scripts/setup-kore.ps1` com entrada oculta e transmissão por stdin. Nenhum valor privado pertence ao Git ou a este documento.

Referência: [documentação privada KORE/Saitro](https://kore.saitro.com/api/docs/), consultada com acesso autorizado, e esclarecimentos do atendimento encaminhados pelo proprietário em 22/10/2026.

Desde 0.55.1, uma leitura validada permanece disponível mesmo quando falha o encerramento posterior do token. O campo cleanupConfirmed informa essa confirmação e a interface mostra a pendência separadamente.

Teste real de 22/10/2026 confirmou HTTP 200 no encerramento, com status booleano true (diferente do OK documentado). A versão 0.55.1 reconhece ambos os formatos explícitos; falso, ausência e erro continuam sem confirmação.
