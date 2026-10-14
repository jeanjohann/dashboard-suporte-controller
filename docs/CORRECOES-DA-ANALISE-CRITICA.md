# Correções da análise crítica — 0.20.6

Revisão implementada em 14/10/2026 sobre a base 0.20.5. A avaliação original foi feita sobre 0.13.0; mudanças posteriores de arquitetura, permissões, filtros e módulos foram preservadas. O documento recebido em import é material de referência local, não uma definição automática de novas regras.

## Entregue

- Operacional: ordenação de todo o recorte antes das páginas de 50 linhas, reinício na primeira página ao ordenar e restauração da ordem original no terceiro clique. Seriais longos permanecem textos, ausências ficam ao final e detalhes conservam a linha de origem.
- Tempo até retirada: Comparar por permanece disponível mesmo quando o relatório está indisponível. Colunas ausentes ficam desabilitadas e identificadas no seletor. Ausência de Modelo não interfere na análise padrão pelo prefixo do ID nem na vida em campo até primeira troca.
- CSVs das análises Custo por cliente, Composição do custo, Serviços por chamado e Evolução dos custos: valores financeiros em reais numéricos, sem R$; percentuais em pontos percentuais (14,2 = 14,2%). Unidades constam no preâmbulo. Ausências ficam vazias, zero e negativos válidos são mantidos e médias conservam a precisão. Colunas de texto, bases compostas, filtros e linhas de origem permanecem. A apresentação na tela não muda. O relatório descritivo continua usando percentuais fracionários (0,142 = 14,2%), conforme seu próprio contrato documentado.
- XLSX descritivo: a base das contagens tem formato inteiro; a base monetária mantém duas casas. Valores e percentuais continuam numéricos. Chamados compartilhados entre clientes permanecem não aditivos.
- CSV importado: separador reconhecido fora das aspas do primeiro registro lógico, inclusive cabeçalhos multilinha e aspas escapadas. Aspas inválidas continuam recusadas; identificadores e linhas físicas são preservados. O parser é compartilhado pelos extratos Arqia/Kore.
- Revisão das OS: avisos de cabeçalhos repetidos, variantes dos status conhecidos e inconsistências entre Status/Pago em. Nenhuma célula é renomeada/corrigida; nenhum aviso transforma um atendimento em realizado ou altera custo. Pago em é referente ao técnico. Cabeçalhos repetidos exigem conferência da primeira ocorrência usada pelos cálculos por nome.
- Configurações de relatório e anotações do consumo: geração de identificadores locais compatível com ausência de randomUUID. IDs já guardados e formato do backup continuam válidos. Não são credenciais de acesso.
- Hash dos arquivos de consumo: mantém SHA-256 e apresenta orientação de acesso por HTTPS/endereço local se a função não estiver disponível. O fallback de IDs não substitui a verificação de conteúdo dos CSVs/backups.
- Mensagens de divergência monetária em pt-BR. Legenda circular e bases financeiras do descritivo evitam somas/varreduras repetidas, mantendo as populações e resultados.
- Produto: resumo das regras atuais separado do registro histórico; regra antiga de acessórios explicitamente marcada como substituída.

O mapeamento operacional por layout já estava centralizado antes desta entrega. Filtros flutuantes com clique externo/Escape e navegação por categorias também já estavam implementados. Não foram recriados.

## Compatibilidade e limites

Os CSVs financeiros listados passam a ter números em vez de moeda/percentual formatados como texto. Quem tratar esses arquivos externamente deve usar as unidades indicadas. Tela, gráficos e planilhas originais preservam os valores. Contagens de Revisão podem aumentar pelos novos avisos; isso não aumenta nem reduz os atendimentos ou os totais financeiros.

Não foram ativados novos relatórios de margem, qualidade do técnico, situação histórica do chip ou prevenção por idade. Remoção de zeros, reconhecimento genérico de motivos, deduplicação de valores contratuais e interpretação automática de status continuam fora desta correção. Essas mudanças exigem critérios próprios e validação de vínculos. Colunas fixas, novos cruzamentos e medição ampla de desempenho permanecem evoluções independentes.

## Verificação

Regressões específicas para ordenação global, precisão de seriais, CSV entre aspas/multilinha, exportação financeira com zero/ausência/negativos/percentuais, formatos XLSX e avisos sem alteração das contagens. A conferência completa passou: caminhos locais, formatação, 168 testes aprovados (um teste opcional ignorado) e build. O aviso já existente de tamanho do pacote permanece; essa correção não divide o carregamento do aplicativo.

No navegador: reimportação com/sem Modelo e recuperação do seletor, quatro CSVs financeiros, avisos de revisão, configurações com randomUUID indisponível, ordenação entre três páginas e detalhe original. Doze estados das telas afetadas em 1440/390 px e claro/escuro, sem erro de execução ou rolagem horizontal da página. Arquivos de origem reais não foram usados nem modificados nos testes de interface.

Consumo: importação de CSV com separador dentro de cabeçalho entre aspas, gravação de anotação sem randomUUID e recuperação após recarga. Persistência continua no IndexedDB e o SHA-256 dos arquivos foi mantido.
