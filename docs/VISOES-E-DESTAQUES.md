# Visões favoritas e destaques — 0.42.0

Entrega priorizada pelo proprietário em 20/10/2026. Usa fontes e critérios existentes, sem novas APIs, banco de negócio ou transmissão de planilhas.

## Zoho: confirmados e pendentes

O card “Chamados respondidos”, o gráfico e a tabela mostram os chamados com respostas validadas. Quando há pendências, o resultado é identificado como parcial. O quadro adjacente mostra quantas interações precisam de conferência, quantos chamados afetam e quais motivos impediram a confirmação. Um mesmo chamado pode ter respostas confirmadas e pendentes: as duas contagens não são aditivas. Uma interação também pode ter vários motivos.

Mantém o contrato de totais finais indefinidos até resolver as incertezas, sem transformar ausência de confirmação em zero. A conferência manual das candidatas tem o mesmo alcance anterior; datas não identificadas continuam pendentes. Não altera apontamentos de tempo ou autenticação. O período/horário exibido pertence à coleta, não aos filtros das OS.

## Visões favoritas

No quadro de filtros, abrir **Visões favoritas**. Informar um nome e usar **Salvar nova visão**. Selecionar uma visão e clicar **Aplicar visão** para restaurar a categoria atual. Também permite atualizar com a seleção atual, renomear ou remover, sem alterar outras visões.

- Até 20 favoritos por categoria, nomes de até 60 caracteres, isolados por usuário no navegador atual. Monitoramento separa demonstração e fonte real.
- Salva filtros e busca, modos/visibilidade dos relatórios registrados da categoria e opções de apresentação disponibilizadas pelo módulo. Em OS → Visão geral, salva os grupos selecionados em “Apresentação e atalhos”; estados internos de cada subgráfico não são um catálogo completo de preferências.
- OS inclui agrupamento de clientes, referência/ciclos e critérios dos destaques. Consumo inclui apurações efetivas, medida de ranking, recorte da grade e critérios dos destaques.
- Em OS, permite guardar datas fixas, semana atual, semana anterior ou últimos sete dias. Períodos relativos são recalculados ao aplicar, usando o calendário de São Paulo. Não inicia atualização da fonte.
- Não salva planilhas, seleção de linhas, anotações, credenciais ou leitura/período do Zoho. Não aplica automaticamente após recarregar e não sincroniza entre computadores.
- A estrutura das colunas de OS precisa corresponder à visão salva. No Consumo e Monitoramento, apuração/base inexistente impede a aplicação, em vez de substituir silenciosamente pela disponível.
- A aplicação mantém as escolhas das demais categorias. A apresentação restaurada vale na sessão; salvar preferências padrão de página continua na configuração existente.
- Gravações releem o documento e usam revisão por favorito. Mudança em outra aba limpa a seleção do editor; falha de leitura/gravação não apaga os dados anteriores. Limpar os dados do navegador remove os favoritos.

## O que merece atenção

Bloco recolhível nas Visões gerais de OS e Consumo. Começa mostrando a quantidade de destaques; ao abrir, apresenta até seis, com opção de exibir os demais. Critérios são ajustáveis na sessão e podem ser incluídos no favorito. São sinais descritivos para investigação, não diagnósticos ou avaliações de desempenho.

### Ordens de Serviço

- **Trocas repetidas:** padrão de pelo menos dois eventos por mesma identidade de cliente/filial e placa. Reutiliza as trocas já confirmadas; duas linhas de rastreador contam um evento. Categoria + chamado + data + cliente/placa repetidos são deduplicados, preservando todas as linhas. Exige data, chamado, cliente e placa utilizáveis. Não reúne filiais automaticamente nem estima duração.
- **Concentração de improdutivas:** padrão de pelo menos três registros improdutivos e participação de 10% ou mais nos realizados do cliente. Denominador: linhas Concluída/Pago do cliente no recorte, incluindo improdutivas. Segue o agrupamento analítico da categoria, preservando CNPJ/filial nos vínculos de trocas. Não equivale a visitas físicas distintas.
- Usa somente os filtros da Visão geral. A conferência abre as linhas correspondentes logo abaixo do painel; fonte ou filtros alterados limpam a conferência anterior.

### Consumo

- Padrão: aumento de pelo menos 50% em MB/dia, com limite absoluto mínimo atual ajustável (inicialmente zero).
- Identidade: operadora + ICCID. A origem compara a apuração selecionada com a anterior mais recente e não sobreposta no histórico ativo do mesmo chip.
- Divide cada consumo por seus próprios dias inclusivos. Exemplo: 31 MB em 31 dias → 1 MB/dia; 90 MB em 30 dias → 3 MB/dia, aumento de 200%.
- Apuração anterior com duplicidade/ambiguidade não é substituída silenciosamente por uma mais antiga. Referência zero não gera percentual. Registros não elegíveis, períodos inválidos e ambiguidades ficam fora da comparação, com cobertura explícita.
- Filtros de cliente/plano selecionam a apuração atual; a referência histórica pertence ao mesmo chip, sem inferir seu cliente histórico pela referência operacional atual.
- O botão abre Acompanhamento → Linha do tempo para esse chip, incluindo fontes e apurações. Não modifica os filtros próprios dessa categoria, não soma períodos sobrepostos e não calcula projeção ou excedente de franquia.

## Validação

Testes de domínio cobrem confirmados/pendentes do Zoho, deduplicação, datas sem confirmação, isolamento/concorrência/formato de favoritos, períodos relativos e esquema incompatível; contagens de eventos versus linhas, filiais/placas separadas, denominadores de improdutivas e comparações por dia com ambiguidades/zeros. Conferência visual usa exclusivamente planilhas e extratos fictícios, sem chamadas reais ao Zoho ou a operadoras.
