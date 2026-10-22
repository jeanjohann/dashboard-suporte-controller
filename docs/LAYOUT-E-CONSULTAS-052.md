# Layout e consultas — rodada 0.52.0

## Monitoramento: leitura e desempenho

As tabelas de bases, posições por base e inventário por modelo começam pela visão **Essencial**. **Completa** revela os sinais técnicos; **Escolher colunas** permite uma seleção intermediária. As escolhas são de apresentação, não modificam o recorte nem os totais exportados. Cabeçalhos numéricos acompanham o alinhamento dos valores; cobertura aparece em texto auxiliar, sem transformar ausência em zero. Cards usam espaçamento e hierarquia comuns nos três temas.

A ordenação usa o valor principal no conjunto inteiro, antes da paginação de 15 bases. Na fila de veículos permanece a paginação existente. A impressão de uma tabela paginada identifica as linhas visíveis; para obter todas as linhas use CSV/XLSX do módulo. A seleção de colunas permanece enquanto a análise estiver montada, sem gravação durável.

A fonte e os cálculos são reaproveitados entre renderizações. A contagem de espera entre consultas não refaz a classificação da frota; os gráficos analíticos são montados quando essa categoria é aberta. Relatórios são preparados na ação de exportação. A idade dos dados reais continua sendo atualizada localmente a cada minuto, sem consulta automática.

`npm run benchmark:monitoring` gera 1.800 veículos fictícios, 20 bases e seis modelos e mede classificação, telemetria, filtro, ordenação e relatório. Resultados locais ficam em `layout-review/round052-benchmark.json`; não representam tempo total de carregamento, rede, autenticação ou garantia em outros computadores. Referência desta máquina: classificação mediana de aproximadamente 8 ms. A conferência de interface utiliza a mesma amostra fictícia, sem chamar a API real.

## Meu Dashboard: duas consultas personalizadas

Em um bloco de análise personalizada, configure **Comparar duas séries**. As consultas precisam ter a mesma fonte (OS ou Operacional), agrupamento e medida, com um agrupamento que não seja “Sem agrupamento”. Período, cliente e escopo podem ser independentes. Quantidades, somas e médias não são intercambiáveis, mesmo quando compartilham uma unidade.

Categorias são combinadas pelo nome exato; uma categoria sem valor na outra consulta fica indisponível. As séries não são somadas e meses conservam a sequência cronológica. Alterar o agrupamento ou a medida principal para uma combinação incompatível remove a comparação; confira-a antes de aplicar. Salvamento e backup do painel preservam as duas consultas, sem incluir os dados das fontes.

## Zoho: permanência por sessões

Dentro da seção Zoho, **Permanência por sessões · importação local** aceita CSV Session de até 2 MB, 10 mil linhas e 100 colunas. A importação respeita a permissão de importar e não envia o arquivo a servidores ou à IA. Dados e conferência ficam em memória na sessão do usuário e sobrevivem ao recolhimento da seção; recarregar a aplicação os remove.

É obrigatório escolher colunas distintas de agente, entrada e saída e confirmar o fuso. Preferir ID estável do agente. Aceita datas civis `dd/mm/aaaa hh:mm[:ss]` ou ISO; ISO com fuso explícito mantém seu deslocamento. O período próprio recorta os intervalos nos limites dos dias do fuso escolhido. Não faz vínculo automático com os responsáveis das OS.

Por agente, intervalos sobrepostos contam apenas uma vez. Duplicatas exatas são excluídas e apontadas; saídas ausentes, datas inválidas e intervalos invertidos não geram duração presumida. A tela limita a apresentação a 50 agentes e 50 apontamentos; o CSV exporta a conferência completa. Ausência de duração válida aparece como indisponível, distinta de duração zero válida.

**Ainda depende do escritório:** receber o CSV Session real, conferir seus campos, fuso, status e comparar os totais com o Zoho. Permanência representa apenas os intervalos fornecidos; não equivale a tempo apontado em chamados, produtividade ou comprovação de jornada. Nenhum endpoint novo de sessões foi presumido ou ativado.

## Coleta, histórico e recuperação: preparação inativa

`server/monitoringCollection.js` não está conectado ao Worker, a rotas ou a um agendador. Exige um repositório durável com `claim`, `latest`, `commit` e `release`. O futuro adaptador deverá usar lease com expiração e gravar fotografia, eventos, revisão e conclusão da execução em uma transação. Conflito ou coleta parcial deve preservar a última versão publicada; repetição da execução concluída não duplica registros.

O domínio reconhece primeira observação de atraso, passagem observada para atraso e retorno observado da comunicação. Retorno exige coleta utilizável e avanço da última comunicação. Ausência, falha de coleta ou desaparecimento da linha não confirmam recuperação. Eventos registram quando o estado foi observado, sem inventar o início ou fim exato da indisponibilidade entre consultas. A identidade usa a base e o identificador do veículo, sem inferir continuidade entre trocas de identificador.

O cálculo de janela aceita de um a quatro horários UTC explícitos por dia, ainda não definidos. **Não houve criação de banco, cron, retenção, backup remoto ou migração de dados.** Depois da escolha entre D1 e servidor da empresa, implementar e testar o adaptador, isolamento de acesso, restauração, retenção e ativação controlada. A leitura atual continua manual.

## Validação local

Em 21/10/2026, `npm run check` aprovou importações, formatação, 394 testes e compilação; um teste previsto permanece ignorado. Na interface: três temas, tela de 390 px, paginação de 20 bases e última página dos 1.800 veículos, seleção de colunas, ordenação de zeros/ausências, acesso do modelo à fila e montagem sob demanda da análise. Comparação fictícia confirmou filtros distintos e categoria ausente; CSV fictício confirmou 4 horas acumuladas, sobreposição, sessão aberta, exportação e leitura preservada ao trocar de seção.

Esses ensaios não substituem homologação da frota real, do CSV Session real ou de um futuro banco/agendador.

## Encerramento da publicação — 22/10/2026

Código da entrega publicado na branch main do GitHub no commit `aafffa1`. Cloudflare confirmou a versão ativa `f8eda63b-3155-4d09-8371-9b8c2e29ee3b` com 100% do tráfego. A publicação preservou as variáveis remotas (`--keep-vars`). Conferência autenticada do Monitoramento no endereço de produção confirmou as novas visões Essencial/Completa e os estados zero/ausente com dados de demonstração, sem erros no console e sem consultar a API real.

A revisão inicial no navegador havia sido interrompida por limite de uso da ferramenta; foi concluída em 22/10. Nenhuma alteração adicional no aplicativo foi necessária. O mapa foi atualizado nos arquivos locais e no GitHub; seu Worker independente não foi republicado nesta rodada. Banco, agendamento e homologação do CSV Session real permanecem pendentes conforme os limites acima.
