# Equipe de suporte

Disponível em **Ordens de Serviço → Equipe de suporte**, a partir de 0.21.0. Acesso segue a permissão de OS; exportação e impressão seguem a permissão separada existente. A planilha continua local.

## O que o relatório mede

Volume atribuído ao responsável registrado na OS. Não identifica o técnico prestador nem mede qualidade, SLA, tempo trabalhado ou produtividade por hora. O papel é selecionado no próprio relatório:

| Papel       | Responsável         | Data do recorte e da evolução |
| ----------- | ------------------- | ----------------------------- |
| Execução    | `Resp. Execução`    | `Data de atendimento`         |
| Agendamento | `Resp. Agendamento` | `Agendamento`                 |

Nos dois papéis entram somente serviços **Concluída/Pago**. Portanto, o volume de agendamento representa a atribuição dos serviços já realizados pela data de agendamento; não conta toda a agenda futura nem mede quantos agendamentos foram feitos naquele dia. A planilha informa a data agendada, não necessariamente o instante em que o responsável efetuou o agendamento.

Cada linha é uma visita/atendimento. **Atendimentos efetivos** excluem Motivo = Visita Improdutiva, conforme o reconhecedor já usado nas OS. Visitas improdutivas aparecem em coluna e card próprios. Agendar, Agendado e Cancelada ficam fora destes indicadores. Nenhuma regra financeira foi alterada: improdutivas continuam com seus custos válidos nos relatórios financeiros, e canceladas continuam excluídas.

## Períodos e filtros

- Últimos 7 dias: hoje e os seis dias anteriores, no calendário de São Paulo.
- Semana anterior: segunda a domingo da semana anterior à atual.
- Mês: mês civil selecionado, do primeiro ao último dia.
- Ano: ano civil selecionado, de janeiro a dezembro.
- Todo o histórico: remove somente início/fim; mantém filtros de cliente, responsáveis, tipo, motivo, cidade, UF e colunas adicionais.
- Personalizado: preencher De/Até nos filtros da página.

Os atalhos alteram o **mesmo período compartilhado de OS**. Não criam uma segunda seleção invisível. Na área de suporte, agendamento usa sua própria data, enquanto o resumo geral de registros no topo da página continua baseado em Data de atendimento. A seção informa sua própria base e quantidade elegível. Os dois filtros de responsáveis continuam separados e podem ser combinados; selecionar os dois exige que a linha atenda a ambos.

Com período ativo, realizados sem data válida são excluídos e quantificados. Sem período, continuam nos totais, mas ficam fora do gráfico temporal. Coluna obrigatória ausente torna apenas esta análise indisponível, com o nome da coluna. A linha original não é corrigida.

## Indicadores e comparação

Cards: atendimentos efetivos, visitas improdutivas, chamados distintos e clientes identificados. Chamados usam número da OS; clientes usam a razão social válida. Chamados/clientes distintos são contados no conjunto, não somados entre pessoas, pois podem aparecer em mais de um grupo.

Ranking: nomes registrados, efetivos, improdutivas, total realizado, chamados, clientes, participação, efetivos anteriores e variação. A participação divide os efetivos da pessoa por **todos os efetivos do recorte**, inclusive os sem responsável. Nomes vazios ou com erro ficam fora do ranking e podem ser conferidos em botão específico. Somente espaços externos são desconsiderados; nomes parecidos não são unidos automaticamente.

Comparação: com início e fim válidos, usa imediatamente o intervalo anterior de igual duração inclusiva, preservando os demais filtros e o papel. Não promete comparar meses civis de duração diferente. Se o anterior for zero, mostra “Sem base anterior” em vez de crescimento percentual artificial. O ranking apresenta as pessoas do período atual; o resumo anterior considera todo o recorte anterior.

Evolução: diária até 62 dias de intervalo completo; mensal nos demais casos. Não preenche artificialmente dias sem registros. Perfil detalha tipos de serviço por responsável, mantendo Visita improdutiva como categoria separada. Os botões Conferir mostram as linhas originais correspondentes; tabelas permitem ordenar.

## Relatórios e manutenção

CSV e XLSX incluem contexto, resumo, responsáveis, evolução, perfil e atendimentos originais elegíveis. Percentuais são frações numéricas (0,25 = 25%), formatados no XLSX. CSV protege textos contra interpretação como fórmulas; identificadores e células originais são preservados na aba de origem. O botão Imprimir / Salvar PDF usa a seção completa, e os comandos de resumo/recolhimento seguem o padrão do sistema.

- `src/modules/orders/domain/supportPerformance.js`: calendário, atribuição e comparação.
- `src/modules/orders/domain/supportReport.js`: tabelas CSV/XLSX, usando os resultados do domínio.
- `src/modules/orders/components/SupportPerformance.jsx`: controles, cards, ranking e detalhes.
- `src/modules/orders/domain/supportPerformance.test.js`: casos sintéticos, datas, improdutivas e exportação.

Se for criada identificação por código para os responsáveis, validar a chave antes de substituir o agrupamento atual por nome. Datas de criação, conclusão, SLA ou horas trabalhadas exigem novas fontes e critérios.

## Conferência da entrega

Testes sintéticos cobrem viradas de semana/ano, fevereiro bissexto, datas dos dois papéis, improdutivas, responsável/data ausentes, chamados compartilhados, filtro de cliente e percentuais exportados. No build de produção, a conferência local no Edge verificou atalhos, escolha de mês/ano, conferência de origem, XLSX, modo resumido e impressão, além de desktop/celular nos dois temas. Não foram usados dados reais nos testes de navegador.
