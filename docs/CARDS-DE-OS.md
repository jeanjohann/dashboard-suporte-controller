# Cards da visão geral de OS

Versão 0.25.2. Acesse **Ordens de Serviço → Visão geral** após carregar a base. Os dez cards respondem somente aos filtros dessa categoria; seleções de Equipamentos ou Operação não se propagam para cá. A busca de texto dos registros continua restrita à tabela.

Na **0.27.0**, os dez cards e a agenda mantêm seus critérios. Abaixo ficam apenas tendências compactas e atalhos: concentração/perfil detalhado passam a Operação; valores contratuais ficam em Clientes e custos; o parque completo fica em Parque e Manutenção. [Localização e instruções](ORGANIZACAO-DAS-ANALISES.md).

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

## Agenda e atalhos semanais

No quadro de filtros da Visão geral, **Semana atual** seleciona segunda a domingo da semana corrente; **Semana anterior**, a semana completa imediatamente anterior. O dia de referência usa São Paulo. Os atalhos atualizam De/Até, preservam campos categóricos e não alteram outras categorias. Selecionar datas manualmente ou Todo o período continua disponível. Com intervalo completo, a comparação dos indicadores continua usando um período anterior de igual duração.

**Agendados** e **Aguardando agendamento** são uma fotografia das pendências do arquivo: seguem os campos da categoria e ignoram De/Até, pois podem não possuir Data de atendimento. Não são os agendamentos realizados da seção Equipe de suporte nem uma agenda filtrada pela data Agendamento. O aviso ao lado dos cards explicita esse alcance.

Clique no card para abrir as linhas imediatamente abaixo; clique novamente ou em Fechar conferência para recolher. A tabela mantém todas as colunas e ordenação, com rolagem própria para ocupar menos altura. Abertura respeita a preferência de movimento reduzido; fechar devolve foco ao card. Mudança da base ou dos filtros fecha detalhes anteriores, evitando exibir uma conferência de outro recorte. Os demais blocos de conferência da Visão geral continuam em seus locais anteriores.

## Paleta e ajuda

- Laranja: volume de visitas.
- Verde: intervenções, manutenções e implementações.
- Âmbar: visitas improdutivas.
- Azul: chamados, clientes e veículos identificados.
- Violeta: valores financeiros.

Fundos suaves, bordas e ícones vetoriais diferenciam os grupos, com valores principais neutros. Texto e ícone permitem reconhecer o indicador sem depender da cor. A paleta não afirma que aumento/redução seja bom ou ruim. Temas claro e escuro possuem tons próprios. O ícone de informação no canto superior direito explica base, exclusões, finalidade e limites; Escape fecha o balão.

Na versão 0.25.1, os tons dos dez cards ficaram um pouco mais vivos. Os gráficos compartilhados também receberam séries mais nítidas, sem mudança no significado das categorias. A paleta das séries está em `src/shared/charts/palette.js`; as barras de tema usam `--chart-main` e `--chart-secondary` em `theme.css`, com valores próprios para claro e escuro. SVG utiliza as cores de impressão clara, preservando identificação de negativos. Não houve mudança das fontes, do armazenamento ou das permissões.
