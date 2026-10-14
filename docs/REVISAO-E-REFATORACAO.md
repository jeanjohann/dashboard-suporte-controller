# Revisão técnica e refatoração gradual

Revisão iniciada em 14/10/2026, sobre a versão 0.20.0. Primeira entrega: 0.20.1. Este documento registra o que foi inspecionado, as alterações realizadas e a sequência proposta. Deve acompanhar as próximas etapas.

## Diagnóstico inicial

A estrutura por módulos já separa regras de análise, importadores, componentes e permissões. Os testes existentes cobrem regras financeiras, identificadores, vínculos, períodos, backups e autenticação do Worker. Essa organização permite extrair componentes mantendo os cálculos em suas funções de domínio.

| Observação verificada                                                                                                      | Implicação para manutenção                                                                  | Próxima ação                                                                           |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `LinesPage.jsx` reunia apresentação, leitura/gravação, acompanhamento e ações de importação/exportação                     | Uma alteração no formulário exigia navegar por uma página com 1.618 linhas                  | Separação iniciada nesta entrega; continuar com importação/filtros e relatórios        |
| `OrdersPage.jsx` possui cerca de mil linhas; alguns relatórios também são extensos                                         | A coordenação da tela pode ser dividida por responsabilidade                                | Extrair controles e relatórios após estabilizar a etapa de consumo                     |
| Há estilos compartilhados distribuídos entre `style.css`, `identity.css`, `theme.css`, `sidebar.css` e ajustes posteriores | A ordem de carregamento e a especificidade precisam ser consideradas em cada ajuste         | Mapear os componentes antes de consolidar CSS; validar ambos os temas e impressão      |
| Paginação e ordenação aparecem em mais de um componente, com tamanhos de página e critérios próprios                       | Unificação sem contexto pode alterar o recorte ou a ordem apresentada                       | Identificar a parte comum, preservando ordenação antes da paginação e ausências no fim |
| `Workspace` mantém páginas permitidas montadas durante a navegação                                                         | Filtros, bases em memória e rascunhos dependem desse ciclo de vida                          | Avaliar carregamento sob demanda mantendo o estado após a primeira visita              |
| O build gera um arquivo JavaScript de aproximadamente 1,52 MB, cerca de 463 KB comprimido                                  | Há oportunidade de estudar divisão por módulos; tamanho sozinho não mede lentidão percebida | Medir abertura inicial e navegação antes de mudar o carregamento                       |
| Regras de permissão são compartilhadas pelo navegador e Worker                                                             | Mudanças nessa camada exigem validação dos fluxos autorizados e recusados                   | Manter a camada independente de React e armazenamento do navegador                     |

São observações de organização e verificações dos fluxos afetados. A revisão de desempenho requer medições próprias; este documento não certifica uma auditoria completa de segurança ou todos os cenários do sistema.

## Primeira etapa entregue — consumo

| Arquivo                                  | Responsabilidade                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `components/LinesPage.jsx`               | Coordena a página, filtros, importações e apresentação dos relatórios                                                |
| `hooks/useConsumptionArchive.js`         | Lê o repositório local, controla disponibilidade/erros e confirma a gravação antes de substituir o histórico exibido |
| `hooks/useLineFollowup.js`               | Controla chip selecionado, busca, histórico, rascunho, gravação da ação e exportação individual                      |
| `components/LineHistoryPanel.jsx`        | Apresenta busca, formulário, anotações, gráfico e apurações; recebe estado e ações do acompanhamento                 |
| `components/ConsumptionArchivePanel.jsx` | Apresenta versões e revisão/restauração de backups; recebe as ações da página                                        |
| `utils/consumptionFormatting.js`         | Formatação de MB, ticks, centavos e data da ação em São Paulo, sem dependência de React                              |

Os caminhos da tabela são relativos a `src/modules/consumption/`. Busca do histórico e opções do seletor usam uma única seleção, preservando a opção atualmente escolhida mesmo quando ela não corresponde à busca. A tabela de registros e o histórico compartilham os formatos de apresentação do módulo.

A página coordenadora passou de 1.618 para 1.180 linhas. Essa métrica descreve a distribuição das responsabilidades; o código extraído continua fazendo parte do aplicativo. Os campos do formulário receberam identificação acessível explícita, inclusive durante mensagens de falha.

## Critérios preservados

- Mesmas chaves do IndexedDB, formato do histórico e backup. Nenhuma migração, limpeza ou transferência de dados.
- Gravação confirmada pelo repositório antes da atualização do histórico visível. Falha conserva o histórico anterior e o rascunho.
- Acompanhamento por operadora + ICCID. Cliente, equipamento e placa são a referência registrada na ação.
- Histórico individual usa as apurações em uso do chip, independentemente do recorte da grade. Períodos sobrepostos permanecem separados.
- Critérios de elegibilidade, duplicidades, vínculos, conversão de unidades, referências de investigação e totais financeiros permanecem no domínio existente.
- Ordenação, seleção, paginação, escolha de seções, impressão e exportação continuam com seus critérios atuais.
- Ações de importação/exportação conservam suas verificações de autorização. O acompanhamento permanece local neste navegador.
- Páginas autorizadas continuam montadas durante a navegação; os filtros e bases da sessão são preservados.

## Validação da etapa

Conferência do fluxo existente antes e depois da extração, com dados fictícios em um navegador separado. Verificações cobrem maiores consumos, troca de chip, rascunhos, anotações após recarga, busca, seleção/exportação, vínculo e placa, arquivamento/reativação, revisão e restauração explícita do backup, impressão e telas menores nos dois temas.

Foi simulada uma falha de escrita do IndexedDB: a mensagem de erro aparece, o histórico anterior permanece disponível e o rascunho pode ser retomado. Recarregar mantém somente as ações que tiveram gravação confirmada. A impressão conserva registros salvos e exclui o formulário/rascunho.

Executar também `npm run check`: caminhos locais, formatação, testes e build. Cada etapa posterior deve repetir as verificações afetadas e atualizar este documento.

## Sequência proposta

| Etapa | Escopo                                                                               | Situação                                                       |
| ----- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| R01   | Separar acompanhamento, persistência local, painel de arquivos e formatos do consumo | Entregue em 0.20.1                                             |
| R02   | Separar prévia/importação, filtros e demais relatórios do consumo                    | Próxima etapa sugerida                                         |
| R03   | Mapear CSS e consolidar apresentação dos controles compartilhados                    | Após R02, com comparação visual em claro/escuro e celular      |
| R04   | Dividir a coordenação e os grandes relatórios de OS                                  | Após consolidar o padrão de componentes do consumo             |
| R05   | Medir e avaliar carregamento por módulo, mantendo bases e estado de navegação        | Depende de medições e conferência do ciclo de vida das páginas |

Cada entrega deve ter um escopo limitado, revisão das mudanças e documentação. Alterações de regra de negócio ou formato de armazenamento precisam ser tratadas como mudanças próprias, com compatibilidade definida antes de implementação.
