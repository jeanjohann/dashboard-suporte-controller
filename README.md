# Dashboard de suporte

**Versão:** 0.13.0 — operacional, revisão e cobertura do histórico de OS.

## Documentação do projeto

- [Produto e regras aprovadas](docs/PRODUTO.md)
- [Guia de uso e manutenção](docs/GUIA-E-MANUTENCAO.md)
- [Histórico de versões](CHANGELOG.md)
- [Versionamento e uso em outros computadores](docs/VERSIONAMENTO.md)
- [Operacional e cruzamento com OS](docs/OPERACIONAL.md)

As contagens operacionais e os totais financeiros de serviços realizados estão implementados. O gráfico mensal está implementado; relatórios personalizados e histórico por placa/serial estão implementados. Consulte os documentos antes de futuras alterações.

Primeira versão: importação manual e conferência da aba `OS 2025`.

## Executar

Instale as dependências com `npm install` e execute `npm run dev`. Abra o endereço informado no terminal. Para gerar a versão de produção: `npm run build`.

## Navegação e aparência

O menu segue a ordem **Ordens de Serviço**, **Operacional**, **Controle de Consumo M2M** e **OS x OP**. A chave no cabeçalho alterna entre tema claro e escuro; a escolha fica salva neste navegador e vale para todas as páginas. A logo oficial acompanha o contraste do tema.

Nas OS, **Limpar filtros** e os ícones de abrir/recolher relatórios compartilham a mesma faixa. As barras estão mais compactas: rótulos longos têm resumo visual, com identificação completa ao passar o cursor, na conferência dos registros e nas exportações. No celular, navegação, filtros e gráficos se ajustam à largura; tabelas mantêm rolagem própria para preservar as colunas.

## Regras aprovadas

- React com importação manual do Excel.
- Primeira linha como cabeçalho; ordem original das colunas e linhas preservada.
- Cada linha com número de OS é um atendimento. O número da OS identifica o chamado, que pode ter vários atendimentos.
- Nenhuma correção ou preenchimento automático.
- Status `Pago` indica pagamento ao técnico.
- `Km` contém o valor em reais do deslocamento de ida e volta informado pelo técnico, não a distância.
- Gráficos mensais usarão `Data de atendimento`, com registros sem data excluídos do gráfico e contabilizados separadamente.
- Planilha original não é alterada. A importação de OS fica na memória da sessão; o consumo possui histórico local com backup.

## Limites desta etapa

Somente colunas com cabeçalho não vazio são exibidas, em sua posição original. Cabeçalhos repetidos são diferenciados pela letra da coluna. Linhas preenchidas sem número de OS são contabilizadas como não importadas. Erros do Excel e números incompatíveis com o formato de data são sinalizados; valores originais permanecem disponíveis. Isso não representa validação completa dos dados. A versão 0.2.0 aplica as regras financeiras aprovadas aos serviços realizados. Gráfico mensal e filtros combinados estão implementados.

## Linhas — Controle de Consumo

Importação de CSVs Arqia/Kore, cards, filtros, investigação acima da média, vínculos por ICCID + MSISDN com o operacional e linha do tempo por chip com anotações. Histórico salvo neste navegador, com versões dos arquivos e backup JSON exportável/restaurável. Períodos originais preservados, com comparação também em MB por dia. Consulte [o guia do módulo](docs/CONSUMO-DE-LINHAS.md). OS e consumo mantêm filtros independentes.

## Análises de OS

Sete novas seções recolhíveis com custo por cliente, composição, reincidência por veículo, chamados com vários serviços, perfil de intervenções, duração observada e evolução de custos. Critérios e exclusões no [guia de análises](docs/ANALISES-DE-OS.md).

Na categoria Regiões, a distribuição geográfica reúne o total de atendimentos e as manutenções em um gráfico comparativo por UF ou cidade. Inclui participação da manutenção, comparação por custo/deslocamento, conferência dos registros e exportação. A manutenção já está incluída no total.

## Relatório descritivo

Exportação de quantitativos, percentuais e critérios em XLSX (resumo, originais e critérios) ou CSVs separados, seguindo os filtros. Consulte [o guia do relatório](docs/RELATORIO-DESCRITIVO.md).

## Vida em campo dos equipamentos

Na categoria Equipamentos, a seção Vida em campo até primeira troca mostra média, mediana, amostra, observações sem troca, cancelamentos e vínculos para revisão. Rastreadores usam pares confirmados de retirada/entrada; acessórios usam troca explícita por categoria. É possível analisar instalação inicial ou o ciclo iniciado numa troca anterior, com conferência das linhas e CSV. Consulte os [critérios de vida em campo](docs/VIDA-EM-CAMPO.md).
