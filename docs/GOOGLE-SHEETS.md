# Google Sheets — piloto de ordens de serviço

## Piloto do Operacional

O Operacional também oferece Google Sheets, restrito a administradores ativos. Usa a mesma credencial `GOOGLE_SHEETS_CREDENTIALS`, porém exige uma origem independente em `GOOGLE_OPERATIONAL_SPREADSHEET_ID`, com aba fixa `Equipamentos`. Compartilhe somente a planilha escolhida como Leitor com a conta de serviço. A origem do Operacional não reutiliza automaticamente a planilha de OS.

Na página Operacional, abrir **Google Sheets** confere a configuração. O botão **Carregar Operacional do Google** lê a base com o mesmo importador e validação de cabeçalhos do Excel (layouts compacto e legado). Resultados, valores, datas, zeros e revisão preservam o contrato existente. A base alimenta os cruzamentos já existentes com Parque e Consumo.

A atualização opcional ocorre a cada 15 minutos somente com a página Operacional ativa e visível. Atualizações Google → Google preservam filtros, busca e ordenação; reiniciam paginação e detalhe aberto. Trocar por arquivo local desliga a conexão automática. Falhas mantêm a base anterior. Sem armazenamento compartilhado, escrita na planilha ou restauração automática ao recarregar o navegador. A ativação real depende do link escolhido, compartilhamento e comparação com o Excel da mesma origem.

## Situação e privacidade

Versão 0.23.0: leitura privada preparada; **ativação e comparação com a planilha real pendentes**. O proprietário forneceu o link, confirmou a aba `OS 2025_26` e autorizou somente administradores ativos em 16/10/2026. Informou que já possui a estrutura no Google Cloud, mas só terá acesso no escritório na semana seguinte. Até essa configuração, a integração permanece inativa e a importação manual continua funcionando.

Os arquivos importados manualmente continuam locais. **Na fonte Google, os valores passam pelo Worker e chegam ao navegador autorizado.** Não são gravados no D1, no log de conteúdo ou em cache persistente do servidor. Credenciais e tokens ficam somente no servidor. Usuários comuns não podem consultar nem a configuração nem os dados, mesmo com acesso às OS. Manter a planilha privada, sem Publicar na Web ou Qualquer pessoa com o link.

## Configuração da infraestrutura

1. No projeto Google Cloud da empresa, conferir a conta de serviço existente e se a Google Sheets API está habilitada. Se necessário, criar uma conta dedicada à leitura. Não configurar delegação de domínio nem conceder papéis amplos no projeto para ler uma planilha compartilhada.
2. Compartilhar somente a planilha do piloto, como **Leitor**, com o e-mail dessa conta (`...iam.gserviceaccount.com`). Se o Workspace impedir esse compartilhamento, consultar a administração, sem publicar a planilha como alternativa.
3. Gerar a chave JSON da conta, quando permitido pela política da empresa. Guardar em local seguro: **não colocar no projeto, no chat, nos imports, em variáveis VITE ou no GitHub**.
4. No Worker Cloudflare, em Settings → Variables and Secrets, criar um **Secret** `GOOGLE_SHEETS_CREDENTIALS` com o JSON completo da chave. O código utiliza somente `client_email` e `private_key`.
5. Conferir as variáveis não secretas `GOOGLE_ORDERS_SPREADSHEET_ID` e `GOOGLE_ORDERS_SHEET`. O identificador fornecido pelo proprietário já está configurado; a aba é `OS 2025_26`. O nome legado `OS 2025` também é aceito. O navegador não pode indicar outra planilha ou URL.
6. Publicar a configuração. Entrar como administrador, abrir Google Sheets, conferir configuração e carregar as OS.
7. Comparar com uma exportação Excel da mesma aba e momento: linhas, chamados, revisões, período, realizados, cancelados e totais financeiros. Considerar ativada somente após essa conferência.

O escopo é `spreadsheets.readonly`, sem escrita. Ele não se restringe a uma aba: o compartilhamento limita os arquivos acessíveis e o código fixa a aba solicitada. Remover outros compartilhamentos desnecessários da conta. Para rotacionar a chave, atualizar o Secret e revogar a anterior.

## Funcionamento

- Abrir o quadro consulta apenas a disponibilidade da configuração, sem ler células. O carregamento inicial exige **Carregar OS do Google**, que substitui a base da sessão após validação e reinicia filtros como uma nova importação.
- **Atualizar OS agora** relê a aba inteira, refletindo correções e exclusões. Atualizações Google → Google preservam filtros principais/adicionais, busca, ordenação, referência e situação dos ciclos; a tabela volta à primeira página.
- A atualização automática é opcional, inicialmente marcada: intervalo de 15 minutos, com fonte Google carregada, página OS selecionada, aba do navegador visível e administrador autorizado. Ao retornar, consulta se a última leitura está vencida. Não é atualização instantânea nem coleta com o sistema fechado.
- Fechar o quadro apenas recolhe os controles. Desmarcar a opção pausa a atualização; importar Excel, inclusive por lote, desliga a fonte automática.
- Recarregar o navegador não restaura registros nem reconecta: carregar novamente pelo botão. Cada navegador consulta independentemente, sem base compartilhada de resultados ou histórico de versões.

## Leitura, limites e falhas

A leitura primeiro identifica a área preenchida por `values.get` e depois solicita valores e formatos dessa área por `spreadsheets.get`, com JSON compacto. Assim, formatação em linhas/colunas vazias no final não infla a resposta. Linhas vazias internas e posições das células são preservadas. As duas consultas não constituem uma transação: evite editar a fonte durante a comparação com o Excel. Os limites de dados continuam sendo verificados, sem truncar a área preenchida.

A resposta traz apenas valores brutos, textos exibidos, formatos numéricos e erros; sem comentários, outras abas ou credenciais. O adaptador reaproveita o leitor comum do Excel: mesmas posições, vazios, cabeçalhos repetidos e linhas de origem. Fórmulas não são executadas no navegador; seus resultados e erros são preservados. Identificadores textuais mantêm zeros, mas dados que já perderam precisão na planilha não são recuperáveis. Datas em texto incompatível continuam para revisão, sem correção automática.

O contrato exige cabeçalho na primeira linha, primeira coluna preenchida, Status e Data de atendimento, além de registros com número de OS. Usa datas numéricas do Google, calendário padrão sem `date1904`; nenhuma conversão de fuso é aplicada às datas de atendimento. O horário de leitura é mostrado em Brasília. A base alimenta também os cruzamentos existentes com a Operacional.

Limites: 50.000 linhas físicas, 200 colunas e 10 MiB de resposta. Exceder recusa a atualização inteira, sem truncar. Prazo de consulta: 25 s após assinatura; navegador cancela após 35 s. Sem novas tentativas em sequência: o próximo intervalo ou o botão permite tentar de novo.

Falha de configuração, Google, formato ou timeout conserva a base anterior. Uma importação mais recente, mudança de página, revogação de acesso ou cancelamento impede aplicar uma resposta antiga. Erros internos não expõem credenciais. Última leitura bem-sucedida não significa que a planilha permaneceu inalterada depois dela.

## Manutenção

`server/googleOrders.js` autentica e consulta; `shared/data/googleOrdersSnapshot.js` valida contrato e limites; `modules/orders/data/googleOrders.js` adapta para `importOrdersSheet`; `useGoogleOrders.js` controla concorrência e atualização; `OrdersGooglePanel.jsx` apresenta o estado. O Worker exige sessão Access e administrador antes de chamar o serviço. As respostas usam `Cache-Control: no-store`.

Testes usam dados e chaves fictícios, sem consultar a planilha real. Cobrem permissão, escopo somente leitura, destino fixo, erros sem segredos, limites e paridade com o leitor Excel. Não foram alteradas regras financeiras, de ciclos ou do Monitoramento Ativo.

Conferência local em 16/10/2026: 200 testes aprovados e um opcional sem arquivo real ignorado; compilação concluída. No navegador, verificados carregamento explícito, atualização de 15 minutos/pausa, filtros preservados, falhas sem perda da base, descarte ao sair, importação manual e acesso comum oculto. Os dois temas foram conferidos em 1440/390 px; a personalização dos quatro módulos, rascunhos e falha de armazenamento também passou na regressão. Isso não substitui a validação da planilha real após configurar a credencial.

## Referências oficiais

- [Consulta e seleção de campos](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get)
- [Valores e formatos das células](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells)
- [Autenticação de conta de serviço](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Escopos da API](https://developers.google.com/workspace/sheets/api/scopes)
- [Segredos do Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/)
