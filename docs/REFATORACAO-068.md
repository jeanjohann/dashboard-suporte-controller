# Refatoração de apresentação e Dashboard — 0.68.0

Rodada autorizada em 24/10/2026 após o [levantamento](LEVANTAMENTO-DESEMPENHO-0672.md). Sem alteração de regras de negócio, fontes reais, permissões, banco ou agendamento remoto. Nenhum arquivo de dados foi removido.

## Entrega

- Vínculos do Operacional: cinquenta linhas por página, ordenação global antes da paginação e impressão com o recorte completo. CSV continua usando todos os vínculos filtrados. Opções de filtros, seleção, ordenação e agrupamento reaproveitados enquanto suas dependências não mudam.
- Dashboard: tabelas montam apenas dez linhas na tela; a cópia completa entra na preparação de impressão e sai depois. Auditorias são montadas ao abrir e paginam vinte e cinco grupos; impressão mantém todos. Preparação compartilhada atende aos eventos de impressão, incluindo Ctrl+P, além do botão do sistema.
- Páginas/seções recolhidas: fronteira de renderização conserva filhos, controles e rascunhos, evitando novas atualizações vindas do pai enquanto inativas. Contextos de segurança continuam propagando. Não desmonta formulários nem afirma suspender todo efeito interno de qualquer componente.
- Monitoramento: atividade explícita controla relógios e leitura periódica da base salva. Eles param ao navegar para módulos sem dependência do Monitoramento. A fonte permanece ativa no Meu Dashboard e nas páginas de Consumo; apresentação pesada retém a última entrada enquanto oculta. Ao retornar, aplica os dados mais recentes e recarrega a base salva. Lembretes retomam relógio e leitura ao retornar. Isso não desliga nem altera as quatro coletas do Cloudflare.
- Fontes: produtores publicam em uma loja da sessão sem assinar todas as fontes. Assinante por fonte não renderiza por atualização independente. Meu Dashboard deixa de assinar atualizações enquanto oculto. A loja é reiniciada quando muda a identidade ou o conjunto de permissões.
- Cards: dependências incluem apenas fontes necessárias ao principal, complementos e comparação. Parque também depende de OS. Consultas equivalentes compartilham resultado; cache de até duzentas consultas, com verificação de permissão antes da leitura, invalidação por filtros/consulta, identidade e referências das fontes. A mudança de fonte descarta entradas afetadas. Vínculos Operacional × OS usam referências fracas, sem reter indefinidamente versões antigas das bases.
- Organização: prévias de gestos são agrupadas por quadro e ignoram dimensões/alvos iguais. Cancelamento remove quadro pendente; a edição é confirmada uma única vez ao soltar. Visualização dos cards é memorizada. Detecção de alteração do painel reaproveita serializações de documentos imutáveis; sem alterar o histórico de desfazer.

## Verificação local

Amostras exclusivamente fictícias. Componentes reais executados em Vite de desenvolvimento no navegador deste computador; números não representam rede, produção ou todos os usuários.

| Cenário                                                      | Antes                                         | Depois                                                                                                              |
| ------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tabela de valores com 1.800 grupos: linhas de dados montadas | 1.810 (10 + cópia completa oculta)            | 10                                                                                                                  |
| Vínculos com 1.800 veículos: linhas montadas                 | 1.800                                         | 50                                                                                                                  |
| Auditoria fechada com 350 grupos: linhas montadas            | Conteúdo completo pela implementação anterior | 0; ao abrir, até 25                                                                                                 |
| Preparação de impressão na amostra nova                      | —                                             | 1.800 vínculos e 350 grupos de auditoria; tabela de valores com cópia completa de 1.800 além das dez linhas da tela |
| Após encerrar impressão                                      | —                                             | Retorna a 10 / 50 / 0 linhas na amostra com auditoria fechada                                                       |

Três alternâncias da tabela de valores no mesmo navegador, medidas por React Profiler: implementação anterior 99,6 / 55,8 / 109,3 ms; nova 1,7 / 1,0 / 1,0 ms. São commits de reconstrução do componente, em desenvolvimento, com montagem da cópia oculta incluída; não medem paint, rede, abertura total ou p95. A comparação de tempo dos vínculos não foi usada, pois a referência simplificada do ensaio tinha menos colunas; a contagem de linhas é a evidência nessa tabela.

No aplicativo integrado com 1.800 veículos: Monitoramento ativo registrou temporizadores de 30 s, 60 s e 5 min. Em OS, nenhum desses três permaneceu ativo; ao voltar, nova leitura da base salva ocorreu e a busca `TST0001` foi preservada. No Dashboard, fonte de 60 s/5 min continuou ativa e lembretes visuais de 30 s pararam. Nenhuma atualização do fornecedor foi solicitada. Uma subárvore pausada permaneceu em quatro renders após duas atualizações independentes, e o rascunho foi preservado ao reativar. Um assinante de OS permaneceu em dois renders após atualização da fonte independente.

Painel de quarenta cards sobre mil OS fictícias: valores preservados; movimento por teclado, mudança de largura e desfazer conferidos. Preparação/encerramento de impressão foi exercitada pelos eventos do navegador e pelo conteúdo montado; não houve impressão física. Os testes de interface não constituem avaliação prolongada de memória, dispositivos móveis ou todas as combinações de gráficos. A preservação funcional dos gestos foi revisada no código; o teste interativo de movimento desta rodada usou teclado.

## Benchmark reproduzível

`npm run benchmark:dashboard`: mil OS sintéticas, cinco amostras para 10/20/40 consultas idênticas, cache inicialmente vazio em cada amostra. Confere igualdade dos resultados com o avaliador original, incluindo o primeiro cálculo. Arquivo local `layout-review/benchmark-dashboard.json`.

Medição inicial nesta máquina, em Node: medianas de 69,48 → 6,89 ms (10), 130,48 → 6,59 ms (20), 258,94 → 6,65 ms (40). Favorece consultas equivalentes; cards com consultas distintas não terão o mesmo ganho. Não inclui React, DOM, transferência nem D1 e não fundamenta uma promessa percentual para o sistema inteiro.

## Limites e sequência

Os estados das páginas permanecem em memória para conservar a edição; não foi implementada a desmontagem geral nem prometida redução absoluta da memória de uma sessão longa. Impressões completas podem continuar pesadas por conterem deliberadamente todos os registros. Nenhum Worker de processamento ou virtualização geral foi adicionado sem evidência que os justifique.

Regras e regressões de domínio devem continuar passando junto de importações, formatação e build. O mapa de arquitetura acompanha os componentes e caches novos. A próxima frente de persistência de consumo/Zoho/painéis, a homologação com relatórios reais e as dependências das operadoras continuam na fila separada.
