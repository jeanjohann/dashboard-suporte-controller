# Monitoramento de Frota — primeira etapa

## O que está disponível

A página prepara o módulo de acompanhamento preventivo com a organização **Visão analítica** escolhida pelo usuário. Ela inicia sem dados e permite ativar uma demonstração explícita, inteiramente fictícia, com referência congelada em 11/10/2026 às 10:00 no fuso de São Paulo. Nenhuma consulta à API, token, agendamento, notificação ou gravação de monitoramento no servidor foi implementada nesta etapa.

Há filtros por múltiplas bases, limite de atenção e situação técnica; cards, distribuição temporal, comparação por base, fila paginada, detalhes e rascunhos de acompanhamento. A série de coletas é ilustrativa, limitada à demonstração, usa todas as bases e o limite fixo de 48 horas. Ela não afirma horários reais de falhas ou recuperação.

## Critérios provisórios para avaliação

- Identificação: base + ID do veículo; placa não é chave única. ID do rastreador é mantido em campo próprio.
- Tempo: diferença entre o último registro e a referência, sem arredondamento antes da classificação.
- Limites inclusivos de atenção: 48, 72 ou 96 horas. Faixas exclusivas: 48 a menos de 72, 72 a menos de 96, 96 ou mais. Abaixo de 48 horas fica fora das barras, mas participa da frota.
- “Abaixo do limite” não significa online neste instante. Ainda falta confirmar se a API expõe instante de geração ou recebimento do último registro.
- Datas internas exigem ISO com fuso. Datas inválidas ou futuras são revisão, não duração zero.
- Ausência de registro é “Sem posição registrada”, sem duração inventada.
- Coleta precisa ser bem-sucedida, com instante válido e idade inferior a 2 horas; esse prazo é provisório. Se a coleta falhar ou estiver desatualizada, a duração conhecida pode aparecer, mas o veículo não entra em novos alertas confirmados nem nas barras.
- Identificação ausente ou duplicada exclui o grupo antes dos filtros, contabilizando os registros para revisão.
- Percentuais usam todos os veículos identificados das bases selecionadas, inclusive sem posição e coleta desatualizada. Cards e gráficos abrangem todas as situações; o filtro de situação recorta a tabela e a exportação de veículos.

Esses critérios são uma proposta para validação, não uma política operacional definitiva. Não existe adaptador para as datas brasileiras da API ainda: fuso e significado precisam ser confirmados primeiro.

## Acompanhamento e relatórios

Responsável, observação e situação administrativa podem ser preenchidos nos detalhes. São rascunhos somente em memória: desaparecem ao recarregar, sair da demonstração ou perder a sessão. Encerrar acompanhamento não altera a comunicação técnica. Os rascunhos entram no relatório exportado, sem modificar os exemplos nem as planilhas existentes.

CSV e XLSX exportam todos os veículos do recorte, independentemente da página exibida. Incluem modo de demonstração, referência, filtros, critérios e notas. XLSX também oferece resumo por base, com percentuais numéricos. Nomes dos arquivos e conteúdo identificam **DEMO / DADOS FICTÍCIOS**. Impressão das seções segue a permissão de exportação; a fila imprime a página apresentada.

Histórico individual de ocorrências, recuperações, consumo por equipamento, persistência compartilhada e notificações ficam para as próximas etapas. O consumo depende da confirmação dos campos, unidade e período da informação retornada pelo equipamento.

## Permissões

`monitoring` é uma página independente em Usuários e permissões. Administradores podem acessá-la; usuários comuns precisam da concessão explícita, sem liberação automática. Exportação segue a permissão separada já existente. Monitoramento não concede importação de OS, operacional ou consumo. A estrutura do banco D1 não mudou.

## Código e manutenção

- `src/modules/monitoring/components/MonitoringPage.jsx`: página, filtros, rascunhos e ações.
- `src/modules/monitoring/domain/monitoring.js`: contrato normalizado, qualidade das coletas, classificação e indicadores.
- `src/modules/monitoring/domain/monitoringReport.js`: tabelas de relatório, CSV e XLSX.
- `src/modules/monitoring/domain/monitoring.test.js`: limites, duplicidade, coleta, datas e exportação.
- `src/modules/monitoring/data/demo.js`: fonte fictícia isolada; não reutilizar como fallback de uma API com erro.
- `src/styles/monitoring.css`: organização da página com o tema compartilhado.

## Pendências antes de ativar dados reais

Confirmar campo e significado da última comunicação, fuso, ID de rastreador, escopo e descoberta das bases, validade dos tokens, paginação, limites e dados de consumo. Definir infraestrutura, retenção do histórico e permissões por base. O serviço de coleta deverá rodar no servidor mesmo com a página fechada, com credenciais protegidas e registro de falhas da integração. Um retorno parcial não deve ser tratado como desaparecimento de veículos.

Não foram adicionados dados reais ao servidor. O futuro armazenamento de monitoramento será uma alteração explícita de arquitetura; as planilhas dos módulos existentes continuam locais.
