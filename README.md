# Dashboard de suporte

**Versão:** 0.12.0 — indicadores, relatórios personalizados e histórico de equipamentos.

## Documentação do projeto

- [Produto e regras aprovadas](docs/PRODUTO.md)
- [Guia de uso e manutenção](docs/GUIA-E-MANUTENCAO.md)
- [Histórico de versões](CHANGELOG.md)
- [Versionamento e uso em outros computadores](docs/VERSIONAMENTO.md)

As contagens operacionais e os totais financeiros de serviços realizados estão implementados. O gráfico mensal está implementado; relatórios personalizados e histórico por placa/serial estão implementados. Consulte os documentos antes de futuras alterações.

Primeira versão: importação manual e conferência da aba `OS 2025`.

## Executar

Instale as dependências com `npm install` e execute `npm run dev`. Abra o endereço informado no terminal. Para gerar a versão de produção: `npm run build`.

## Regras aprovadas

- React com importação manual do Excel.
- Primeira linha como cabeçalho; ordem original das colunas e linhas preservada.
- Cada linha com número de OS é um atendimento. O número da OS identifica o chamado, que pode ter vários atendimentos.
- Nenhuma correção ou preenchimento automático.
- Status `Pago` indica pagamento ao técnico.
- `Km` contém o valor em reais do deslocamento de ida e volta informado pelo técnico, não a distância.
- Gráficos mensais usarão `Data de atendimento`, com registros sem data excluídos do gráfico e contabilizados separadamente.
- Planilha original não é alterada. Importação fica na memória da sessão.

## Limites desta etapa

Somente colunas com cabeçalho não vazio são exibidas, em sua posição original. Cabeçalhos repetidos são diferenciados pela letra da coluna. Linhas preenchidas sem número de OS são contabilizadas como não importadas. Erros do Excel e números incompatíveis com o formato de data são sinalizados; valores originais permanecem disponíveis. Isso não representa validação completa dos dados. A versão 0.2.0 aplica as regras financeiras aprovadas aos serviços realizados. Gráfico mensal e filtros combinados estão implementados.

## Linhas — Controle de Consumo

Página independente no menu lateral para importação manual de CSV consolidado, filtros, cards, ranking, resumo ordenável, exportação e revisão. Consulte [o guia do módulo](docs/CONSUMO-DE-LINHAS.md). Importações de OS e consumo permanecem em memória ao alternar páginas e são independentes.

## Análises de OS

Sete novas seções recolhíveis com custo por cliente, composição, reincidência por veículo, chamados com vários serviços, perfil de intervenções, duração observada e evolução de custos. Critérios e exclusões no [guia de análises](docs/ANALISES-DE-OS.md).

## Relatório descritivo

Exportação de quantitativos, percentuais e critérios em XLSX (resumo, originais e critérios) ou CSVs separados, seguindo os filtros. Consulte [o guia do relatório](docs/RELATORIO-DESCRITIVO.md).
