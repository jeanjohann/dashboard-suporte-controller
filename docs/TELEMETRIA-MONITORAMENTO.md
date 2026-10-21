# Alimentação, posições e equipamentos — Monitoramento Ativo

Disponíveis em **0.51.0**, na **Visão analítica**, usando o mesmo diagnóstico legado e as mesmas permissões. Nenhuma consulta externa adicional, coleta automática ou persistência de telemetria foi ativada.

## Alcance e conferência

Bases e modelos são filtros analíticos independentes em cada categoria. Busca, situação técnica, status e recorte limitam a fila e sua exportação detalhada; não mudam os denominadores dos gráficos e resumos analíticos. O contexto registra esse alcance. Clique nos indicadores de alimentação/bateria/posições ou em Conferir base / Conferir modelo para abrir seus veículos. O modelo também aparece abaixo do ID do rastreador e participa da busca, junto ao identificador legado.

## Alimentação e bateria

Contagens usam sinal booleano de falha externa e códigos de bateria conhecidos, em coletas utilizáveis. Código 6 = baixa, 2 = falha, 3 = descarregando. Não há limiares inventados de tensão ou porcentagem. Estado ausente, código desconhecido e coleta indisponível permanecem separados de condição normal.

Estes sinais pertencem ao **último registro recebido**, que pode ser antigo mesmo com coleta recente. Verifique sua data antes de agir. Nos MXT-130/160 em falha externa, a tensão pode representar a bateria interna. O painel não declara causa de defeito.

## Posições por base

Janela móvel de 24 horas calculada pela API na última consulta, não um dia civil ou histórico. Recalcular o relógio da tela não atualiza as contagens. Soma e média usam somente veículos com contagem inteira válida e coleta utilizável. Zero explícito entra na média; ausência e coleta indisponível não entram. Sem leitura, total/média aparecem ausentes. As tabelas mostram a cobertura por base, e um subtotal parcial não representa a frota inteira. Uma soma acima da precisão inteira segura fica indisponível, sem arredondamento silencioso.

Posições são registros de comunicação, não MB, custo de conectividade ou prova de qualidade/continuidade do serviço.

## Equipamentos

Inventário por modelo considera os veículos identificados das bases/modelos selecionados, preservando veículos com coleta indisponível. Modelo ausente forma grupo próprio. Alertas de comunicação, sinais elétricos e posições continuam sujeitos à qualidade da coleta. Percentual acima do limite usa a frota identificada daquele modelo. Distribuições não comprovam defeito ou superioridade de um equipamento; frota, instalação e operação também influenciam os números.

## Exportações e testes

CSV e XLSX incluem os novos indicadores e resumos de alimentação por base, posições por base e modelos, além dos veículos da fila. A cobertura acompanha os valores. Demonstração permanece marcada e separada da frota real.

Testes fictícios cobrem ausência versus zero, denominadores, códigos da bateria, coleta antiga, grupos sem modelo, filtros/detalhamento, precisão e exportação XLSX. A demonstração inclui os novos campos para conferência visual sem consultar o fornecedor.
