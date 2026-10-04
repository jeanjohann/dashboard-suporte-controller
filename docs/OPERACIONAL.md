# Operacional — importação, revisão e cobertura histórica

Entrega inicial 0.13.0. Duas páginas compartilham a importação em memória: **Operacional — Importação e Revisão** e **Operacional × OS — Análises**. A OS é importada em sua própria página. Reimportar uma fonte atualiza os vínculos sem aplicar os filtros da página de OS. Consumo permanece independente.

## Importação e rastreabilidade

Arquivo Excel, aba `Equipamentos`, cabeçalhos na linha 1. Tabela limitada a A:BY (77 colunas); resumos auxiliares à direita não viram equipamentos. O layout de A/Nº, BH/Equipamentos, BF/Placa instalada e AU/Situação é validado antes de aceitar o arquivo. Linhas sem Nº não são importadas e são contabilizadas se houver conteúdo em A:BY. Nº pode repetir, portanto a linha Excel identifica o registro.

Originais, cabeçalhos e fórmulas são preservados para inspeção das 77 colunas. Cabeçalhos repetidos são distinguidos pela letra. Não há edição nem correção automática. Fórmulas usam valores armazenados no arquivo: não há recálculo ou garantia de atualização. Arquivos e dados não são persistidos no navegador, enviados ao GitHub ou alterados. Importação que falha mantém a anterior.

Mapa principal: C cliente; S/T ciclo lançado; AK plano; AS mensalidade; AT cobrança monetária; AU situação; AV cancelamento; BC implementação; BF placa; BH serial; BJ modelo original; BM telefone da linha; BN ICCID. O significado de BB/Contrato e do ciclo permanece pendente; não usar como identificador único ou vigência contratual.

## Revisão

- Formato: erros Excel, fórmulas sem resultado, identificadores não numéricos ou números longos sujeitos à perda de precisão, datas incompatíveis e valores monetários não numéricos.
- Conferência: cliente/serial/placa/ICCID ausentes, ciclo com fim anterior ao início, Cancelado sem data válida ou data de cancelamento com outra situação.
- Possível divergência: Nº, serial, placa ou ICCID repetidos. Mostra todas as linhas envolvidas, sem concluir que há erro ou excluir os registros.

Datas numéricas seguem o calendário 1900/1904 da pasta, rejeitando o dia fictício 29/02/1900. Texto de data não é convertido automaticamente. Moeda usa números Excel em centavos apenas na análise; zero válido é mantido. Valores ausentes não se tornam zero: são excluídos do indicador e quantificados.

Busca por cliente, serial, placa, ICCID, situação, plano e modelo limita revisão e análises. Cards da importação representam o arquivo completo. CSV de revisão respeita busca/categoria e informa célula, original, motivo e arquivo. Seções oferecem impressão/PDF pelo navegador. Tabela de registros tem 50 linhas por página, com ordenação da página atual explicitada; revisão e vínculos ordenam seu conjunto completo.

## Operacional × OS

Correspondência pelo par serial + placa, removendo apenas espaços nas extremidades para comparação. Não normaliza placas ou corrige IDs. Seriais não numéricos ou células com erro não participam do vínculo. Vários registros com o mesmo par no operacional ficam ambíguos, sem atribuição automática dos serviços. Vários serviços na OS são esperados e mantidos.

Estados: OS não importada; OS sem colunas para vínculo; identificação incompleta ou incompatível; vínculo operacional ambíguo; com histórico disponível; sem atendimento no histórico disponível. CSV informa linhas de origem e quantidade de Concluída/Pago nos pares atribuídos; tabela mostra todas as linhas correspondentes, inclusive outros status. Correspondência não confirma a situação atual nem que todos esses atendimentos ocorreram durante a vigência deste registro operacional.

**A operacional é mais antiga que o histórico de OS. Equipamento sem correspondência nas OS não constitui divergência.** Pode ter sido instalado ou atendido antes do período disponível. Continua nos quantitativos operacionais. Ausências não comprovam falta de manutenção ou de instalação. Histórico não deve ser usado para certificar integridade ou atividade atual.

Cards de cobertura e gráficos por cliente/modelo original/plano/situação contam registros operacionais, incluindo todas as situações na seleção. Barras, pizza e rosca disponíveis. Valores de AS e AT são somados como lançados, incluindo cancelados: não representam faturamento calculado, receita recebida ou mensalidade ativa. Nunca confundir AT monetário com a coluna Cobrança das OS que distingue Cliente/Addlog.

## Regras aprovadas e evolução

Uma linha corresponde a um equipamento contratado vinculado a um veículo, faturado mensalmente. Aguardando Reinstalação, Devolução para Cancelamento e Backup no Cliente continuam gerando mensalidade. Interrupção somente quando situação Cancelado e data de cancelamento válida estiverem presentes. Cancelado sem data exige conferência; não inventar data ou interrupção. O efeito do cancelamento sobre um mês e pró-rata precisa de confirmação antes de calcular faturamento.

Próximas análises: manutenção por cliente/contrato, custos por equipamento e reincidência relativa ao parque, com critérios temporais e de cliente definidos antes de atribuir custos. A entrega atual prepara o vínculo e mostra cobertura, sem atribuir todo o histórico de um serial a um contrato atual. Integração com consumo e inferência de modelo por nova coluna continuam fora desta entrega.

## Validação

Testes sintéticos verificam limite A:BY, preservação de identificadores, zero monetário, cancelamento sem data, repetição, calendário Excel, cabeçalhos, ausência histórica e bloqueio de vínculo ambíguo/errado. Arquivo de exemplo: 1.744 registros, 77 colunas e 163 pontos; com OS local: 624 correspondências, 1.096 sem atendimento no histórico disponível e 24 identificações incompletas/incompatíveis. São resultados desses arquivos, não critérios fixos nem erros confirmados.
