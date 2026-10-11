# Filtros e apresentação

Os filtros de categoria continuam combinados entre si e permitem vários valores por campo. As listas agora flutuam sobre o conteúdo: abrir uma lista não aumenta a altura do painel. Clique fora ou pressione Escape para fechar. As seleções permanecem visíveis e podem ser removidas individualmente.

Os painéis compartilhados de OS, Operacional e Consumo usam campos compactos e uma grade responsiva. O componente MultiFilter também aplica o menu compacto ao Parque e ao Monitoramento. Campos específicos de cada módulo preservam seu significado.

Nas OS, o período fica sempre disponível no topo, inclusive com os filtros da página recolhidos. Ele é o mesmo período aplicado aos indicadores, gráficos e tabelas. Registro mais antigo utiliza a primeira data válida da planilha original; Todo o período limpa apenas os limites de data e conserva os filtros de categoria. Filtros adicionais ficam em um painel recolhível. Datas ausentes ou inválidas e períodos invertidos continuam seguindo as regras documentadas do produto.

Consumo mantém a seleção de apuração própria do arquivo, Operacional não recebe um período artificial para sua fotografia do parque e Monitoramento mantém sua referência de coleta. Não há filtros locais escondidos nos cards.

As explicações dos relatórios e blocos internos que possuem título são agrupadas na linha do título, no canto direito. O componente HelpLayout organiza apenas elementos de apresentação, preservando controles, textos para impressão e cálculos. Balões continuam fechando por Escape, clique externo, rolagem e redimensionamento.

## Leitura pelo financeiro

Os balões devem explicar: campo de origem, status e filtros considerados, soma ou fórmula da média, denominador do percentual, exclusões e finalidade do indicador. Não devem sugerir recebimento ou pagamento que a planilha não comprova.

- **Valor a cobrar / Cliente:** valor contratual do serviço que será cobrado do cliente; não confirma recebimento.
- **Valor a cobrar / Addlog:** valor contratual absorvido pela empresa; não equivale necessariamente ao Custo Total lançado.
- **Custo Total:** custo do atendimento lançado na planilha, utilizado mesmo quando há divergência em relação a Técnico + Km; divergência requer revisão manual.
- **Técnico:** valor do serviço técnico. **Km:** valor em reais do deslocamento.
- **Pago:** serviço executado cujo técnico já foi pago. **Concluída:** serviço executado, sem essa confirmação de pagamento.
- **Cancelada:** atendimento não realizado; valores da linha são ignorados nas análises financeiras.
- **Média válida:** soma dos valores válidos dividida pela quantidade desses valores. Ausências não são zero; zero válido faz parte da média.

Não confundir retirada executada para cancelamento de um contrato com status Cancelada da OS. Um valor apresentado como “—” indica ausência de base disponível; não deve ser interpretado como zero.

A revisão deste ajuste detalha os cards de OS, valores de contrato, ranking de técnicos, perfil e concentração das manutenções. Regras específicas de equipamento, parque e consumo permanecem nos respectivos balões e documentação de domínio.
