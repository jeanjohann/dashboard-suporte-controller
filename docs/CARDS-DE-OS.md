# Cards da visão geral de OS

Versão 0.25.0. Acesse **Ordens de Serviço → Visão geral** após carregar a base. Os dez cards respondem somente aos filtros dessa categoria; seleções de Equipamentos ou Operação não se propagam para cá. A busca de texto dos registros continua restrita à tabela.

## O que é contado

Todos os cards partem das linhas com Status exatamente **Concluída** ou **Pago**. Pago indica pagamento ao técnico. Cancelada, Agendar e Agendado ficam fora. Cada linha é um serviço registrado: várias linhas podem pertencer ao mesmo chamado ou visita física.

| Card                      | Cálculo e interpretação                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitas e atendimentos    | Quantidade de linhas realizadas, incluindo visitas improdutivas. Não é uma contagem de visitas físicas únicas.                                                                      |
| Intervenções executadas   | Linhas realizadas sem Motivo Visita Improdutiva; abrange os tipos de serviço, não apenas manutenção. Motivo ausente não confirma produtividade.                                     |
| Visitas improdutivas      | Linhas realizadas com Motivo Visita Improdutiva, conforme reconhecimento vigente do motivo. Seus custos válidos continuam nos cards financeiros.                                    |
| Manutenções realizadas    | Linhas realizadas com Tipo de Serviço exatamente Assistência Técnica, excluindo Visita Improdutiva. Não equivale a trocas de equipamentos.                                          |
| Implementações realizadas | Linhas realizadas com Tipo de Serviço exatamente Implementação, excluindo Visita Improdutiva. Conta serviços, não equipamentos únicos nem parque instalado.                         |
| Chamados atendidos        | Quantidade de números de chamado distintos com pelo menos uma linha realizada no recorte.                                                                                           |
| Clientes com atendimento  | Razões sociais distintas e utilizáveis nas linhas realizadas, incluindo improdutivas. Não representa a carteira inteira.                                                            |
| Veículos identificados    | Pares distintos e utilizáveis razão social + placa nas linhas realizadas, incluindo improdutivas. Não representa a frota ativa.                                                     |
| Custo total lançado       | Soma válida de Custo Total nas linhas realizadas. O valor lançado prevalece mesmo com divergência entre Técnico + Km. Não comprova pagamento ou lucro.                              |
| Custo médio válido        | Custo total válido dividido pela quantidade de linhas realizadas com Custo Total válido; zeros permanecem, ausências e valores incompatíveis ficam fora do numerador e denominador. |

## Identificações e qualidade da base

Nos novos cards de cobertura, espaços nas extremidades dos textos são ignorados apenas para a análise. Não há correção da planilha, padronização de grafia, união de filiais ou conciliação de CNPJs. Nomes que diferem na grafia continuam distintos. A mesma placa no mesmo cliente conta uma vez, independentemente de chamados ou seriais; a mesma placa em clientes diferentes conta em cada par.

Células vazias ou com erro não identificam clientes. Para veículos, também ficam fora placas com marcadores conhecidos, sem distinção entre maiúsculas/minúsculas: `0`, `-`, `?`, `s/placa`, `sem placa` e `sem dados`. Isso não é validação completa da placa nem comprovação de vínculo atual.

A legenda informa quantas **linhas realizadas** não possuem cliente ou par cliente + placa utilizáveis. Não é uma quantidade de clientes/veículos desconhecidos distintos: várias linhas podem ser do mesmo veículo não identificado. Essa falta de identificação não retira a linha das contagens de atendimento ou dos custos válidos.

Sem as colunas necessárias, os três novos indicadores exibem `—`, com legenda de indisponibilidade. Com colunas presentes e nenhuma linha elegível, exibem zero. Custo total/médio sem custos válidos continuam indisponíveis. As regras dos sete indicadores anteriores foram mantidas.

## Comparação temporal

Com início e fim válidos, o sistema compara o intervalo imediatamente anterior com a mesma quantidade de dias, incluindo as duas pontas, e os mesmos filtros categóricos. A variação é a diferença entre valores; percentual = diferença / valor absoluto da base anterior × 100. Base anterior zero não gera percentual. Valor atual ou anterior indisponível não gera comparação naquele card.

Sem intervalo completo, as legendas mostram a base de cálculo e a orientação para comparar aparece uma vez abaixo do painel. O histórico disponível não comprova cobertura completa dos períodos; mudanças no perfil dos serviços ou na qualidade da base também afetam os resultados.

## Paleta e ajuda

- Laranja: volume de visitas.
- Verde: intervenções, manutenções e implementações.
- Âmbar: visitas improdutivas.
- Azul: chamados, clientes e veículos identificados.
- Violeta: valores financeiros.

Fundos suaves, bordas e ícones vetoriais diferenciam os grupos, com valores principais neutros. Texto e ícone permitem reconhecer o indicador sem depender da cor. A paleta não afirma que aumento/redução seja bom ou ruim. Temas claro e escuro possuem tons próprios. O ícone de informação no canto superior direito explica base, exclusões, finalidade e limites; Escape fecha o balão.

As cores se aplicam a esses dez cards, sem recolorir gráficos e relatórios dos outros módulos. Não houve mudança das fontes, do armazenamento ou das permissões.
