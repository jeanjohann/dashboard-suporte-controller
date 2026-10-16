# Personalização das páginas

A partir de **0.22.0**, as escolhas de relatórios ficam na engrenagem **Personalizar página**, no canto direito do cabeçalho. A lateral conserva somente a navegação entre páginas e categorias. O padrão se aplica a OS, Operacional, Parque e Manutenção (incluindo Logística) e Consumo M2M.

## Como utilizar

1. Abra uma categoria com relatórios disponíveis e clique na engrenagem.
2. Marque os relatórios que deseja exibir. Desmarcar prepara a ocultação daquela seção.
3. Escolha a apresentação inicial de cada relatório:
   - **Padrão do relatório:** conserva o comportamento original da seção, que pode iniciar aberta ou recolhida.
   - **Completo:** inicia aberto com todo o conteúdo.
   - **Resumido:** inicia com o resumo existente. A opção aparece somente nas seções que já oferecem um resumo utilizável.
   - **Recolhido:** conserva o cabeçalho, abrindo o conteúdo quando solicitado.
4. Clique em **Salvar preferências** para aplicar e guardar as escolhas.

**Cancelar**, o botão de fechar, Escape e clicar fora da janela descartam as alterações ainda não salvas. **Restaurar padrão** prepara todos os relatórios da categoria como visíveis, com sua apresentação original; também requer Salvar para confirmar. Isso não redefine filtros, categorias de outras páginas ou dados importados.

A engrenagem continua disponível se todos os relatórios forem ocultados, permitindo recuperá-los. Nas visões gerais fixas de OS e Operacional/Parque, sem relatórios configuráveis, e nas páginas ainda sem a base necessária, o controle não aparece. Categorias de Consumo e relatórios de Logística seguem a disponibilidade de suas ferramentas.

## Preferências, estado da sessão e dados

As escolhas pertencem ao **perfil do navegador e endereço do sistema**, não ao cadastro do usuário. São independentes entre OS, Operacional, Parque e Consumo. A gravação de uma categoria preserva as escolhas das demais. O conteúdo inclui somente identificadores de relatórios, visibilidade e apresentação; nenhuma linha da planilha, filtro analítico, anotação ou credencial é incluída.

As preferências antigas das OS (`suporte-layout-v1`) são lidas quando ainda não existe configuração no formato novo. Relatórios anteriormente ocultos permanecem ocultos e podem ser reexibidos pelo modal. A chave antiga não é apagada nem reescrita. A migração não grava automaticamente: o novo formato é salvo ao confirmar as escolhas. As visibilidades dos demais módulos antes eram apenas de sessão; agora podem ser guardadas explicitamente.

Chaves locais: `addlog-page-layout-orders-v1`, `addlog-page-layout-operational-v1`, `addlog-page-layout-park-v1` e `addlog-page-layout-consumption-v1`. Não fazem parte do backup de extratos/observações do consumo e não são enviadas ao D1 ou sincronizadas entre computadores. Limpar o armazenamento do navegador pode removê-las. Se a gravação falhar, as escolhas são aplicadas somente à sessão e a janela informa a limitação, permitindo tentar novamente.

Abrir/recolher uma seção pelos botões do relatório ou pelos comandos globais continua sendo uma ação temporária; não sobrescreve a apresentação inicial salva. Ao salvar novamente no modal, a configuração é aplicada. Se um resumo salvo ficar temporariamente indisponível por falta de dados, a seção mostra o conteúdo completo, sem esconder a informação.

No Consumo, a ação **Acompanhar** revela temporariamente a Linha do tempo, mesmo que sua preferência inicial seja oculta/recolhida. Essa ação não grava preferências automaticamente; o histórico e rascunhos mantêm o fluxo existente. A ocultação usa atributos de apresentação: os componentes permanecem montados, conservando filtros, gráficos e formulários. Não representa uma restrição de segurança ou alteração das permissões existentes.

## Implementação e extensão

- `src/shared/layout/pageLayout.js`: formato v1, leitura compatível, mesclagem e modos disponíveis; regras sem dependência do navegador para testes.
- `src/shared/layout/PageLayout.jsx`: estado local, gravação explícita, revelação temporária e catálogo de capacidades.
- `src/components/PageSettings.jsx`: modal nativo com foco contido, Escape, retorno ao botão de origem e rascunhos.
- `src/components/Section.jsx`: registra a existência de resumo e aplica a apresentação sem alterar cálculos ou desmontar conteúdo.
- `src/styles/page-settings.css`: visual isolado do modal nos dois temas e em telas pequenas.
- Catálogos dos módulos: ligam os identificadores às categorias e aos títulos reais das seções. As chaves históricas das OS são preservadas; o nome de exibição pode diferir do título real, como em Distribuição geográfica.

Ao adicionar relatório: incluir a definição e categoria; manter um título estável ou migrar sua preferência; usar `Section` com `summary` somente quando houver um resumo válido. A capacidade é registrada pelo componente, não presumida pelo nome. Relatórios novos ficam visíveis por padrão. O modal só oferece controles registrados no catálogo da categoria, sem expor ações de importação/exportação ou parâmetros financeiros.

## Validação

Casos sintéticos cobrem leitura/migração, JSON incompatível, valores inválidos, isolamento entre categorias e ausência de resumo. No navegador, foram conferidos Salvar/Cancelar/Restaurar/Escape, recuperação após ocultar tudo, resumo/recolhimento, estado temporário, persistência após recarga, falha de gravação local e os quatro módulos, incluindo Logística. O fluxo de acompanhamento do consumo revela o histórico preservando rascunhos; janelas foram conferidas em desktop/celular e nos dois temas. Testes usam usuários, arquivos e respostas artificiais, sem dados de clientes.
