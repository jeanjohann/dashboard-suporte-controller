# Integrações de consumo — KORE e Arqia

**Incluídas na fila de implementação pelo proprietário em 17/10/2026.** Objetivo: alimentar o Controle de Consumo por consultas às operadoras e reduzir a importação manual, preservando identificação das linhas, acompanhamento e conferência da origem. Atualização 0.55.0: piloto KORE/Saitro implementado e credenciais configuradas; leitura no servidor ainda em homologação. Arqia aguarda documentação e acesso.

Em 22/10/2026 foram recebidos documentação privada e acesso KORE/Saitro. Bytes, BRT e atraso de sessões abertas entre 5 minutos e 1 hora estão confirmados. O período do acumulado permanece pendente. [Escopo do piloto KORE](INTEGRACAO-KORE-SAITRO.md).

**Preparação entregue em 0.28.0:** o [laboratório CSV/API](PREPARACAO-FONTES-DE-CONSUMO.md) demonstra revisões, repetição, escolha de fonte e falha parcial com dados fictícios. A política interna testada não foi aplicada ao histórico real nem implementa endpoints, adaptadores das operadoras ou coleta. Os próximos passos abaixo continuam necessários para ativação.

## Operadoras e situação confirmada

| Fila  | Operadora / portal informado                                    | Evidência e pendência                                                                                                                                                                                                                                                                                        |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A15-K | KORE Brasil / Saitro — `https://kore.saitro.com/sistema/login/` | A página oficial da KORE identifica esse endereço como portal brasileiro, separado dos portais Super SIM e ConnectivityPro. A documentação pública de API Clients administra aplicações/credenciais. API Saitro confirmada e piloto manual implementado; validar conexão no servidor e período do acumulado. |
| A15-A | Arqia — `https://plataformadegestao.arqia.com.br/login.faces`   | A página oficial da Plataforma de Gestão aponta para o mesmo portal e anuncia integração por API. Não foram confirmados endpoints, autenticação, campos retornados, limites, custos ou habilitação para a conta da Addlog.                                                                                   |

O endereço efetivo do portal KORE prevalece sobre a seleção inicial “Super SIM / KORE Console” feita durante a investigação. A API Super SIM possui recursos de consumo, mas esta conta utiliza a API própria Saitro. Não reutilizar sua autenticação, unidades, retenção ou limites por suposição.

## Dados desejados no piloto

- Identificação do chip: ICCID e MSISDN, conservados como texto, inclusive zeros iniciais; identificador interno da operadora quando houver.
- Consumo por linha e período, com início/fim, unidade, fuso e instante de apuração conhecidos.
- Situação da linha e identificação do plano, quando fornecidas.
- Histórico diário ou por sessão, quando disponível e validado na documentação.
- Contexto de conta e última consulta bem-sucedida, distinguindo atualização da fonte e horário de consulta.

Esses campos são requisitos desejados, não uma confirmação de que ambas as APIs os retornam. Cliente, placa e rastreador continuam sujeitos aos vínculos validados com a base operacional; o cadastro atual não comprova titularidade histórica.

## Solicitação às operadoras

1. Documentação técnica da API correspondente ao portal e aos contratos da Addlog, com versão, exemplos e ambiente de teste, se disponível.
2. Liberação de acesso somente para leitura de linhas e consumo, com escopo de contas/contratos identificado.
3. Forma de autenticação, renovação e permissões; confirmar eventual restrição de IP ou requisito de rede.
4. Limites de chamadas e paginação, consultas em lote, período máximo por consulta e retenção do histórico.
5. Unidades, fuso, limites inclusivos/exclusivos do período, definição dos acumulados e possibilidade de revisão dos valores já publicados.
6. Frequência real de atualização, atraso de apuração e disponibilidade de dados sobre sessões ainda abertas.
7. Custos, condições contratuais e identificação do suporte responsável pela integração.

Credenciais serão configuradas diretamente como segredos do ambiente autorizado. Não devem ser enviadas no chat, incluídas no Git, em arquivos de exemplo ou no navegador do usuário.

## Sequência até produção

1. **Confirmar a documentação e o acesso:** identificar a API correta de cada operadora e testar uma consulta de leitura no servidor.
2. **Homologar uma amostra:** consultar algumas linhas conhecidas e comparar com o portal e o CSV no mesmo período, distinguindo diferenças de unidade, fuso, atualização e fechamento da apuração.
3. **Adaptar ao módulo existente:** preservar a origem da API, conta, identificadores e períodos. Definir como consultas revisadas e importações CSV coexistem antes de gravar dados; não duplicar o consumo nem sobrescrever anotações.
4. **Validar a coleta completa:** conferir paginação, falhas, repetição de respostas, permissões e preservação da última base válida. Resposta parcial ou indisponível não deve ser apresentada como consumo zero.
5. **Definir a atualização e liberar:** frequência conforme limites e atraso de cada operadora; indicar última atualização e cobertura na tela. Confirmar destino, retenção e autorização do armazenamento/cache antes de ativar coleta periódica ou compartilhada.

A conexão proposta será feita pelo servidor/Cloudflare, com validação do acesso ao dashboard e credenciais da operadora mantidas no servidor. Esta aprovação não altera o D1 atual de usuários/permissões nem ativa armazenamento compartilhado das anotações, que permanece no item A10.

## Critérios preservados

- Zero, ausência e erro são estados distintos. Não converter automaticamente ausência de linha na resposta em consumo zero.
- Não aplicar às APIs a conversão usada nos CSVs sem conferir se a operadora informa bytes, KB/MB decimais ou unidades binárias.
- Consumo acumulado consultado repetidamente substitui a observação correspondente conforme regra validada; não representa volumes adicionais a somar. Apurações sobrepostas continuam identificadas separadamente.
- Dados, SMS, mensalidades e outros serviços têm bases próprias. A consulta de tráfego não substitui o extrato financeiro completo nem comprova pagamento ou excedente.
- Plano não define sozinho o contrato ou a franquia compartilhada. Consumo por contrato/franquia continua dependendo do item A11.
- Consumo de rede complementa o monitoramento; não comprova que o rastreador enviou posição ao sistema. Última comunicação do veículo continua dependendo da API de rastreamento dos itens A12–A14.
- Frequência de atualização e acesso ao histórico serão informados após homologação; não há promessa de tempo real nem de recuperação integral de dados antigos.

## Referências consultadas em 17/10/2026

- [Portais oficiais da KORE](https://www.korewireless.com/pt-br/customer-login/): identifica o portal KORE Brasil em `kore.saitro.com` e os portais de outros produtos.
- [KORE — API Clients](https://docs.korewireless.com/api/global-resources/api-clients/clients): recurso de aplicações/credenciais, não consulta de consumo das linhas.
- [KORE Super SIM — Usage Records](https://docs.korewireless.com/kore/api/products/supersim/usage-record-resource): recursos de consumo específicos do produto; não confirma compatibilidade com a conta brasileira informada.
- [Saitro — plataforma e integrações](https://saitro.com/index.html): anuncia APIs, sem confirmar a liberação ou os endpoints da conta KORE.
- [Arqia — Plataforma de Gestão](https://arqia.com.br/pt/servico/plataforma-de-gestao/): anuncia integração por API e aponta para o portal informado pelo proprietário.

Regras atuais de CSV, acompanhamento e armazenamento: [Controle de Consumo](CONSUMO-DE-LINHAS.md). Situação consolidada: [Fila de implementação](PROXIMOS-AJUSTES.md).
