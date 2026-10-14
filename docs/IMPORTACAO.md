# Importação e navegação

A página **Importação** permite selecionar vários arquivos de uma vez. Confira o tipo reconhecido e marque os arquivos desejados antes de clicar em **Aplicar arquivos selecionados**.

- Excel: OS na aba `OS 2025_26` ou `OS 2025`, e operacional na aba `Equipamentos`. Um arquivo pode conter uma aba reconhecida de OS e a operacional. Cada lote aceita uma referência de OS e uma operacional. Se as duas abas de OS estiverem presentes, a importação pede definir uma única base; não combina as duas automaticamente.
- Logística: Excel com `Envios` e `Devoluções`; uma referência por lote, reconhecida pelas abas e cabeçalhos. Exige acesso a Parque e Manutenção e permissão de importação. Consertos não é importado. A referência é mantida na sessão, sem gravar no histórico de consumo. Consulte [Logística](LOGISTICA-DE-EQUIPAMENTOS.md).
- CSV: formatos de consumo suportados pelo módulo M2M, identificados pelos cabeçalhos.
- Arquivos não reconhecidos aparecem com erro e ficam fora da seleção.
- OS e operacional substituem as referências atuais da sessão, preservando os dados originais e as regras de revisão.
- Consumo mantém o histórico local, notas e configurações. Arquivos idênticos não são duplicados; conflitos de versões no lote impedem a aplicação. Quando consumo e operacional são aplicados juntos, a referência operacional acompanha o histórico.
- A gravação do histórico de consumo ocorre antes de substituir OS/operacional. Falhas nessa gravação preservam as referências atuais.

## Organização da tela

Desde 0.18.1, o menu aberto mede 230 px no computador e 210 px entre 761 e 1050 px de tela. Recolhido, mede 76 px e mostra o símbolo da logo, os ícones e o comando de expansão. Recuos menores preservam os nomes completos, que podem quebrar em mais de uma linha. No celular, a navegação mantém a largura da tela. Nenhum filtro ou relatório é alterado por esse ajuste.

As categorias e os checkboxes de relatórios ficam dentro da página selecionada no menu lateral. Os relatórios principais aparecem em blocos abertos; filtros e detalhes internos podem continuar recolhíveis. Ocultar um relatório não altera os filtros nem os cálculos.

O botão de setas permite recolher o menu para uma faixa de ícones, com nomes disponíveis ao passar o mouse e rótulos acessíveis. A preferência é salva no navegador e compartilhada entre as páginas. O tema é controlado por um ícone discreto no rodapé. A seleção usa fundo suave e linha lateral, sem sombra.

**Parque e Manutenção** é o nome atual da página de cruzamento entre operacional e OS. Os critérios de vínculo e as limitações de cobertura histórica permanecem os mesmos.

## Validação

Testes automatizados cobrem reconhecimento de abas, conflitos de referências, preservação do histórico e duplicidade de consumo. A compilação valida a integração. A conferência visual interativa deve ser realizada no navegador do usuário.

### Ajustes de navegação (0.15.1)

A marca mostra apenas o símbolo no menu recolhido e a logo Addlog no menu aberto, sem a legenda Suporte Controller. O botão de recolhimento fica ao lado da marca. Os itens começam logo abaixo; Importação é o último. Clique novamente na página selecionada para fechar ou abrir suas opções. No menu compacto, clicar no ícone da página atual expande a lateral para acessar as opções. Fechar opções mantém filtros e escolhas de relatórios.
