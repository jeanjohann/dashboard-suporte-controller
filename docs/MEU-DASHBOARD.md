# Meu Dashboard

Entregue em **0.44.0, 20/10/2026**. Página própria no menu para montar painéis com indicadores dos módulos existentes. Começa em branco; o catálogo oferece 55 indicadores, conforme as permissões do usuário.

## Como usar

1. Carregar ou atualizar as bases nos módulos de origem. A página não dispara consultas nem importa arquivos automaticamente.
2. Abrir **Meu Dashboard → Adicionar indicador**. Buscar uma informação ou filtrar o catálogo por módulo.
3. Escolher título, apresentação, tamanho e recorte do bloco. Indicadores individuais admitem cartão/tabela; séries admitem gráfico de barras/tabela.
4. Organizar pelas setas de cada bloco e escolher tamanho pequeno, médio ou largura total. A grade se adapta à largura da tela.
5. Nomear e clicar em **Salvar painel**. Usar **Novo painel** para outra composição e **Abrir painel salvo** para alternar. Há até 12 painéis com 40 blocos cada.

O usuário pode editar ou remover blocos, renomear, descartar alterações e excluir um painel. A troca de painel com edição pendente pede descarte explícito. Remover um bloco só se torna definitivo ao salvar; excluir um painel exige confirmação na interface.

## Catálogo e critérios

| Fonte         | Informações e recortes                                                                                                                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS            | Visitas, intervenções, improdutivas, manutenções, implementações, chamados, clientes, veículos, custos e séries por mês/tipo/responsável. Reutiliza `dashboardData`/`supportPerformance`. Período e cliente exato por bloco. Execução usa data de atendimento; agendamento usa sua própria data.   |
| Zoho Desk     | Fechados pelo executor, responsável atual, maior tempo em fechados, respostas confirmadas/pendentes, apontamentos e médias; séries por agente. Eduardo/Jean ou agente individual. Usa a coleta concluída e seu período, não os filtros de OS. Para outro período, coletar novamente na seção Zoho. |
| Consumo M2M   | Linhas, amostras válidas/ativas/zeradas/excluídas, MB total/médio e série por operadora. Uma apuração por operadora, inicialmente a mais recente; permite fixar operadora e apuração. Apuração salva ausente fica indisponível, sem substituição silenciosa.                                       |
| Operacional   | Registros, pontos de revisão, modelos, clientes e situações. Cliente/modelo exatos. Modelo é derivado do serial pelas mesmas regras do módulo. Retrato da base atual, sem histórico inventado.                                                                                                     |
| Parque        | Equipamentos vinculáveis/com atendimento/com assistência, assistências, trocas e assistências por 100 registros. Cliente/modelo e período dos eventos das OS. Usa parque atual e vínculo conservador serial + placa. Exige ambas as bases.                                                         |
| Logística     | Envios/devoluções e recebimentos registrados. O período usa envio na saída e recebimento na devolução. Não infere ausência de entrega a partir de data ausente.                                                                                                                                    |
| Monitoramento | Frota, atrasos, críticos, comunicações ausentes, coleta indisponível, datas inválidas e série por base. Base e limite 48/72/96h. Demonstração tem identificação explícita; coleção antiga não gera atraso confirmado.                                                                              |

Cada bloco informa fonte, período, recorte, horário em Brasília e critérios. Carga local na sessão é identificada separadamente da leitura Google/Zoho; monitoramento apresenta os horários reais das coletas. Ausência não vira zero. Valores monetários mantêm centavos, consumo mantém unidades inteiras exatas e tempos mantêm segundos. Gráficos mostram até 20 itens na ordem da série com aviso; tabelas paginam todos os itens, dez por página. Séries por agente podem se sobrepor: um chamado compartilhado pode aparecer para mais de uma pessoa; a contagem da equipe é deduplicada pelo módulo.

## Salvamento e acesso

- **Configurações locais por identidade**, neste navegador e origem do sistema: título, ordem, tamanho, indicador, formato e filtros. Não há sincronização entre dispositivos ou armazenamento compartilhado. No modo local sem autenticação, vale a identidade local do sistema.
- IndexedDB `addlog-my-dashboard-v1`, documento versionado por usuário. Gravação transacional com revisão impede sobrescrita concorrente entre abas. Em conflito, a edição permanece e o usuário pode recarregar os salvos antes de substituir a versão do painel. Falha de armazenamento não apaga a versão anterior nem a edição em memória.
- O documento aceita somente configuração validada, sem linhas de origem, credenciais ou valores calculados. As bases continuam na memória da sessão; ao recarregar, carregar novamente as fontes. O histórico de consumo já existente continua com sua própria persistência, acessível ao abrir Consumo.
- A página deriva acesso das permissões existentes; não cria nova permissão de dados. O catálogo e o avaliador verificam o módulo antes de acessar a fonte. O piloto Zoho continua limitado às regras atuais (interface de administrador e API do proprietário).
- Troca de identidade ou permissões remonta o espaço de trabalho e limpa fontes em memória. Um bloco salvo cujo módulo deixou de ser permitido mostra acesso indisponível. O isolamento local não substitui a autenticação e autorização das APIs.

## Evolução prevista

Sincronização e compartilhamento com o futuro banco, seleção livre de campos/medidas/agrupamentos, mais filtros e novos tipos de visualização permanecem na fila. Esta entrega compõe indicadores existentes sem somas, joins ou fórmulas arbitrárias entre módulos.

## Validação

Testes de paridade com os módulos, permissões antes da leitura, papéis do Zoho, períodos de consumo, unidades, ausência/zero, filtros, limites e integridade da configuração. Conferência no navegador com IndexedDB real: revisão concorrente, isolamento entre usuários, preservação após erro, reabertura, múltiplos painéis, filtros, gráfico/tabela, ordem, tamanho e tema escuro. O material de homologação usa dados fictícios e permanece fora do controle de versão.
