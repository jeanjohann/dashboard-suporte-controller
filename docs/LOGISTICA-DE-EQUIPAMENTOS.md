# Logística de equipamentos — 0.18.0

Primeira etapa: leitura e conferência de **Envios** e **Devoluções**, dentro de **Parque e Manutenção → Logística**. A base pode ser carregada sem OS e sem Operacional, diretamente nessa categoria ou pela Importação conjunta. A aba de consertos não faz parte da leitura. O arquivo original permanece intacto.

## Layout e atualização do arquivo

Os cabeçalhos ficam na primeira linha. O reconhecimento usa seus nomes, permitindo reordenar colunas sem perder a referência física. Todas as colunas com cabeçalho são preservadas. As duas abas são exigidas; uma aba pode conter somente o cabeçalho, se ainda não houver movimentações.

| Aba        | Cabeçalhos exigidos                                                          | Significado confirmado                                                                           |
| ---------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Envios     | Chamado, Envio, Recebimento, Cliente, Equipamento, ID, Rastreio, Cidade, A/C | Envio registra saída; Recebimento é a chegada ao cliente/destinatário                            |
| Devoluções | Data Recebimento, Equipamento, ID, Cliente, Placa, Situação                  | Data Recebimento registra chegada à Addlog; Situação é preservada, sem classificação nesta etapa |

Cada linha preenchida é uma **movimentação**, inclusive quando falta ID. Linhas totalmente vazias são ignoradas. IDs, nomes, kits e descrições não são corrigidos nem divididos automaticamente. Uma linha com rastreador + relé ou vários identificadores não permite afirmar que representa uma única unidade física.

Quando chegar a versão atualizada do servidor, confira abas/cabeçalhos e reimporte. A base anterior só é substituída após a leitura bem-sucedida; falha estrutural preserva a referência existente. Mudanças de layout ou significado precisam de revisão do importador. As verificações não garantem que todos os registros estejam corretos.

## Cards e recebimentos

- **Envios registrados:** quantidade de linhas da aba Envios que atendem ao recorte.
- **Envios com recebimento datado:** linhas desse recorte com Recebimento válido, excluindo recebimento anterior ao envio quando ambas as datas são válidas.
- **Devoluções registradas:** quantidade de linhas da aba Devoluções que atendem ao recorte.
- **Devoluções com recebimento datado:** linhas desse recorte com Data Recebimento válida. Situação não altera a contagem.

Os cards contam movimentações, não equipamentos únicos, unidades em estoque ou taxa de defeitos. Sem data válida de recebimento significa informação insuficiente/conferência; não declara que o material está pendente. Datas de transporte/recebimento não substituem instalação e retirada das OS, nem alteram cobrança ou status operacional.

## Filtros

Movimentação permite Todas, Envio ou Devolução. Recebimento permite Todos, Com data válida ou Sem data válida/conferir. A busca consulta valores originais e conteúdos exibidos, incluindo cliente, ID, chamado e placa. Esses filtros pertencem apenas à logística.

O período usa **Envio** para saídas e **Data Recebimento** para devoluções. Uma entrega ao destinatário em outro mês não muda o mês de saída nesse filtro. Registros sem data da movimentação ficam visíveis sem limite temporal; com período ativo, são excluídos e sua quantidade é informada. Período invertido não produz resultados. A seleção afeta cards, registros, revisão e exportação.

Datas numéricas do Excel consideram o calendário do arquivo. Textos completos `dd/mm/aaaa` e `aaaa-mm-dd` são interpretados somente para análise, com calendário validado. Vazios, hífen, datas incompletas ou impossíveis permanecem sem data analisável; os valores originais continuam disponíveis.

## Revisão e origem

Aponta campos de identificação ausentes, datas incompatíveis/ausentes/invertidas, erros do Excel, fórmulas sem resultado armazenado, IDs que não representam um identificador numérico único, possível perda de precisão e ID com formato de data. O navegador não recalcula fórmulas.

O mesmo ID pode reaparecer em datas distintas. **Mesma aba + ID numérico único + data da movimentação** é uma possível duplicidade, identificada na base completa. O aviso permanece ao filtrar somente uma das ocorrências. As linhas não são excluídas automaticamente. ID composto/ausente e data inválida não permitem essa comparação com segurança.

Cada movimentação pode gerar vários pontos. A revisão informa aba, endereço da célula, campo, conteúdo exibido e motivo. **Ver origem** apresenta todos os campos da linha, conteúdo original e fórmula armazenada quando disponível. Não há inferência de defeito ou interpretação automática de OK/NOK/Manutenção/Inservível.

## Exportação, acesso e armazenamento

CSV inclui o recorte, critérios, referências e pontos de revisão. Cada seção permite impressão/Salvar PDF e participa dos comandos de abrir/recolher e da escolha de relatórios. A ordenação trabalha sobre a tabela completa do recorte, em área com rolagem própria.

Acesso acompanha a permissão de **Parque e Manutenção**. Importar e exportar continuam exigindo suas permissões separadas, reconsultadas em produção. O banco D1 não recebe esta planilha. A referência fica na memória da sessão do navegador, compartilhada entre Logística e Importação; recarregar exige nova leitura. Não há histórico logístico persistido nem sincronização entre computadores. Os filtros da categoria são reiniciados ao reimportar ou remontar sua tela.

## Próximas etapas

Após conferir a leitura, podemos vincular rastreadores por ID e chamado às OS, apresentar cronologia e localizar possíveis divergências com a fotografia operacional. Acessórios sem ID, múltiplos itens, homônimos de clientes e a diferença entre datas logísticas e de atendimento precisam de critérios próprios. Estoque disponível, prazo de devolução, diagnóstico, reaproveitamento, descarte e interpretação de Situação continuam pendentes.

Código: `src/modules/logistics/domain/logistics.js`, `components/LogisticsPanel.jsx`; coordenação em `app/Workspace.jsx`, navegação em `modules/operational/config/operationalMenus.js` e lote em `modules/imports/domain/bulkImport.js`. Testes cobrem calendário, origens, repetições, recebimentos, estrutura, lote e permissões.
