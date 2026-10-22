# Permanência no Zoho e refinamento — 0.60.0

## Fonte e limites

Em 22/10/2026, o proprietário confirmou que deseja medir o tempo conectado dos agentes e que ainda precisa exportar o CSV real. A fonte de referência é **Analytics → Reports → Static Reports → Agent Availability → Session → exportar CSV**. O relatório de sessões informa entradas e saídas, conforme a [documentação oficial do Zoho](https://help.zoho.com/portal/en/kb/desk/reports-and-dashboards/reports/articles/understanding-agent-availability-report).

O Zoho considera regras próprias de logout, incluindo fechamento de abas, desconexão e inatividade configurada. Por isso, o painel calcula permanência a partir das sessões fornecidas, sem tratar a diferença entre primeira entrada e última saída como tempo contínuo de trabalho. Tempo apontado em chamados permanece um indicador separado.

Ainda não há fonte automática de sessões homologada nesta conta. Esta entrega não adiciona endpoints presumidos, credenciais ou permissões OAuth. Importar o CSV não faz chamadas ao Zoho nem à IA. Não persiste presença no D1; o conteúdo fica na sessão do navegador, preservado ao recolher a seção e removido ao recarregar a aplicação.

## Uso

1. Na seção Zoho das OS, abra **Permanência no Zoho · sessões dos agentes**.
2. Importe o CSV Session, escolha três colunas distintas de agente/entrada/saída e confirme o fuso das datas sem indicação. Prefira ID estável do agente. Nomes não são vinculados automaticamente às OS.
3. Defina um período próprio, se necessário, e use **Conferir permanência**. Configuração fica recolhida após o cálculo para priorizar os resultados.
4. Consulte cards, comparação por agente, evolução diária e tabela. Escolher um agente ou clicar em sua barra restringe o recorte; **Todos os agentes** restaura a equipe.
5. Abra detalhes das sessões e apontamentos para conferir linhas de origem. **Exportar recorte CSV** inclui todos os agentes selecionados, dias calculados, sessões recortadas e apontamentos do recorte.

O botão **Baixar exemplo fictício** fornece um arquivo identificado para testar mapeamento e leitura enquanto o real não está disponível. A amostra contém sobreposição e sessão aberta; deve produzir quatro horas acumuladas entre dois agentes. Ela nunca é aplicada automaticamente à análise.

## Cálculo e cobertura

Mantém regras anteriores: sessões inválidas/abertas não recebem duração estimada; duplicatas exatas são apontadas sem somar; intervalos sobrepostos contam uma vez por agente. Uma sessão válida de duração zero é diferente de ausência de sessão válida. Corrige sua exclusão indevida quando exatamente no início do período.

A evolução diária une os intervalos de cada agente antes de separá-los pela meia-noite no fuso confirmado. A soma diária da equipe pode ultrapassar 24 horas. Dias sem registros não são preenchidos como permanência zero. O gráfico mostra os últimos 14 dias com sessão válida; o CSV conserva todos os dias calculados. Para evitar expansão excessiva de intervalos longos, a evolução pede recorte de até 366 dias; totais e sessões permanecem disponíveis.

Gráfico por agente exibe até dez pessoas; tabelas mostram até 50 agentes, sessões ou apontamentos por quadro. Exportação inclui o recorte completo. A apresentação usa números alinhados, cabeçalhos fixos dentro da tabela, rolagem própria e detalhes montados sob demanda.

## Refinamento visual

- Meu Dashboard: **Adicionar indicador** acompanha a altura e o espaçamento dos demais botões do cabeçalho. O ícone tem altura própria controlada para não ampliar o botão.
- **Adicionar indicador**, **Salvar painel** e outras ações principais do dashboard/diálogos usam o par de cores de botão/texto definido em cada paleta. Isso corrige o texto escuro sobre o verde escuro que vinha da mistura entre cor de texto de destaque e cor de fundo.
- Configurações do painel ficam mais compactas. Permanência tem quatro cards proporcionais, controles alinhados e gráficos que passam a uma coluna em telas menores.

## Validação e pendências

Testes de domínio cobrem união de intervalos, duplicatas, saídas ausentes, fuso, recorte, evolução diária, filtro por agente, duração zero, término à meia-noite e proteção para períodos extensos. Verificação local dos pares de cores dos botões cobriu os oito temas, todos acima de 4,5:1.

O controle do navegador está desativado nas configurações do Work nesta sessão. Compilação e verificações de código não substituem inspeção visual interativa. O CSV real, seu fuso e os totais no Zoho ainda precisam ser conferidos; não houve leitura real de presença ou automação de sessões.

Publicada em 22/10/2026: GitHub main `d1aeab2`, upload Cloudflare `cad94b04-d6c5-4559-a0a2-d4ad9cbebd62` e versão ativa `9eefde56-bf2f-4c7c-a515-fb8c21163ac9` com 100% do tráfego e mesmo etag do código. Conferidos os bindings de bancos separados, piloto owner, handlers fetch/scheduled e cron existente. A rota de fontes sem sessão continua redirecionando ao Access.

Importações, formatação, 438 testes e compilação aprovados; um teste previsto ignorado. A publicação não representa homologação do CSV real nem inspeção visual interativa, que permanecem pendentes conforme descrito acima. O mapa documental foi atualizado no repositório, sem publicar o site independente do mapa.
