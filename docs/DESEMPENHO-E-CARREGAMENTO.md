# Desempenho e carregamento — 0.20.8

Etapa R05 concluída em 15/10/2026 sobre a versão 0.20.7. A mudança reduz o código necessário para começar a usar o sistema. Cálculos, arquivos originais, armazenamento, permissões e API permanecem com seus critérios atuais.

## Medições

Comparação da compilação de produção antes/depois em uma prévia HTTP local, com Microsoft Edge sem janela, 1440 × 1000 px, cinco contextos novos por versão, cache desabilitado, processador limitado a 2×, latência de 50 ms e download de 375.000 bytes/s (3 Mbit/s). A API de permissões foi simulada com usuário fictício administrador; não houve conexão à produção nem uso de planilhas reais. Histórico local inicialmente vazio. Os tempos usam a mediana e representam a abertura da primeira tela de OS, antes da importação.

| Indicador                                       | Antes (0.20.7) | Depois (0.20.8) |
| ----------------------------------------------- | -------------- | --------------- |
| JavaScript necessário até a tela inicial de OS  | 1.538,4 kB     | 797,5 kB        |
| Soma gzip local desses arquivos                 | 468,7 kB       | 260,9 kB        |
| Mediana até o título da página estar disponível | 1,81 s         | 1,31 s          |
| Páginas montadas na abertura como administrador | 5              | 1               |
| Aberturas do IndexedDB antes de visitar Consumo | 1              | 0               |

Redução aproximada: 48,2% no JavaScript dessa abertura, 44,3% na soma gzip e 27,3% no tempo mediano medido. A diferença em retornos já carregados ficou na ordem de poucos milissegundos, dentro da variabilidade do teste; não é evidência de ganho nessa navegação.

A primeira visita aos outros módulos agora baixa e monta o código correspondente. Na amostra controlada, foram observados cerca de 0,34–0,52 s em primeiras visitas; retornos às OS ficaram em torno de 30 ms. O primeiro relatório após importar OS também pode aguardar seu código/gráficos. O total de código do sistema continua disponível e ficou próximo do anterior (aproximadamente 1,54 MB sem compressão); a economia é no que precisa chegar antes do uso, não na remoção de funcionalidades.

Esses números não medem Cloudflare Access, latência da API real, planilhas grandes, aparelhos diferentes ou todos os relatórios. Não devem ser apresentados como SLA ou garantia de carregamento. A folha de estilos manteve o mesmo conteúdo compilado nesta comparação; a reorganização não redesenha as páginas.

## Funcionamento

- `Workspace.jsx` declara páginas `lazy` fora do componente, mantendo sua identidade estável. Só tenta renderizar uma página autorizada ao visitá-la.
- `DeferredPage.jsx` mantém a instância após a primeira visita e apenas a oculta nas seguintes navegações. Revogação de permissão desmonta o conteúdo, mesmo já visitado. Administração mantém o comportamento anterior de desmontar ao sair.
- Operacional e Parque usam uma única página compartilhada; não duplicam fontes nem estados de filtro ao alternar entre os dois menus.
- `OrdersReports.jsx` reúne o conteúdo dos relatórios que antes já recebiam o controlador da página. É carregado quando há dados e continua montado depois, inclusive ao trocar de categoria ou ocultar/recolher relatórios. `useOrdersSession` continua controlando os filtros e resultados.
- `applyBatch` continua verificando autorização e confirma a escrita do consumo antes de aplicar outras bases. O lote pode alimentar páginas ainda não visitadas: na primeira abertura, elas recebem a base atual e o consumo lê o histórico confirmado.
- `vite.config.js` separa React, gráficos e planilhas, evitando que componentes simples de filtro carreguem os gráficos junto. Não há mudança de versão das bibliotecas nem nova dependência.
- O CSS do Monitoramento fica explicitamente antes dos estilos globais em `main.jsx`, preservando a precedência existente mesmo com a página carregada depois.

O ciclo de vida segue as orientações de [carregamento com lazy](https://react.dev/reference/react/lazy), [Suspense](https://react.dev/reference/react/Suspense) e [preservação do estado](https://react.dev/learn/preserving-and-resetting-state) do React. Não mover declarações `lazy` para dentro de funções de renderização nem alternar a chave de uma página para forçar seu carregamento: isso pode reiniciar seus estados.

## Falha e acesso

Durante o carregamento há uma mensagem curta e o menu continua disponível. Falha de download/renderização de um módulo mostra orientação própria e permite acessar as outras páginas. Recarregar é uma escolha explícita: o aviso informa que as planilhas da sessão precisarão ser importadas novamente e que o histórico de consumo salvo neste navegador permanece.

O adiamento de código não substitui autorização. `AccessProvider` continua confirmando a identidade antes de montar o Workspace; importação/exportação reconsultam as permissões, e a API mantém validação de JWT e regras de acesso. Uma página sem permissão não é montada. O banco do servidor continua recebendo somente usuários/permissões; esta mudança não envia planilhas ou anotações ao servidor.

## Conferência e repetição

`npm run check` confere imports, formatação, testes e compilação. A compilação gera `dist/.vite/manifest.json` e executa `scripts/bundle-report.mjs`, que informa entrada/autenticação e dependências estáticas até a primeira tela de OS. Dependências compartilhadas são contadas uma vez; importações tardias não são somadas como parte da abertura. A soma gzip é uma estimativa local, não uma medição de tráfego do usuário.

Para repetir tempos no navegador, usar compilação/servidor de prévia, mesmas condições de rede/processador, usuário/arquivos fictícios, contextos novos e pelo menos cinco execuções. Registrar separadamente abertura, primeira visita, retorno já carregado e importação/análise com dados. Não comparar servidor de desenvolvimento com compilação de produção ou sessão aquecida com sessão nova.

A conferência de interface cobre lote antes da abertura do Consumo/Operacional, recebimento das bases, vínculo atual do chip, preservação de filtros/busca e identidade das páginas, anotação salva e rascunho do consumo, histórico/rascunho do Monitoramento, CSV sem rascunho, temas claro/escuro e celular. Também verifica administração, usuário limitado, acesso recusado e falha simulada de arquivo de módulo, mantendo a base de OS disponível nas outras páginas.

Esta entrega avalia carregamento. Otimizações de cálculos para volumes maiores precisam de perfil com dados representativos e constituem uma etapa própria, caso as medições mostrem necessidade.
