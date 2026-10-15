# Dashboard de suporte

**Versão:** 0.21.1 — Equipe de suporte permite selecionar Ambos para comparar agendamentos e execuções em barras e evolução separadas, com tabelas e exportações identificadas por responsabilidade. Monitoramento Ativo mantém a preparação do coletor; a API do fornecedor ainda não está conectada. Páginas visitadas conservam estado durante a navegação autorizada.

## Documentação do projeto

- [Equipe de suporte — indicadores e períodos](docs/EQUIPE-DE-SUPORTE.md)
- [Integração do monitoramento — contrato técnico e ativação futura](docs/INTEGRACAO-MONITORAMENTO.md)

[Revisão técnica e refatoração gradual](docs/REVISAO-E-REFATORACAO.md): diagnóstico, etapas concluídas, verificações e sequência proposta.

[Correções da análise crítica](docs/CORRECOES-DA-ANALISE-CRITICA.md): ajustes entregues, compatibilidade das exportações e sugestões que dependem de novas regras.

- [Logística de equipamentos — envios e devoluções](docs/LOGISTICA-DE-EQUIPAMENTOS.md)

- [Diagramas técnicos e guia de leitura das planilhas](docs/DIAGRAMAS-DO-SISTEMA.md)

- [Monitoramento Ativo — demonstração e próximos passos](docs/MONITORAMENTO-DE-FROTA.md)

- [Arquitetura, estrutura de pastas e roteiro de manutenção](docs/ARQUITETURA.md)

- [Usuários e permissões](docs/USUARIOS-E-PERMISSOES.md)

- [Hospedagem e acesso Cloudflare](docs/HOSPEDAGEM.md)

- [Importação conjunta e navegação](docs/IMPORTACAO.md)

- [Produto e regras aprovadas](docs/PRODUTO.md)
- [Guia de uso e manutenção](docs/GUIA-E-MANUTENCAO.md)
- [Histórico de versões](CHANGELOG.md)
- [Versionamento e uso em outros computadores](docs/VERSIONAMENTO.md)
- [Operacional e cruzamento com OS](docs/OPERACIONAL.md)

As contagens operacionais e os totais financeiros de serviços realizados estão implementados. O gráfico mensal está implementado; relatórios personalizados e histórico por placa/serial estão implementados. Consulte os documentos antes de futuras alterações.

Importação manual e conferência da aba `OS 2025_26` ou do formato anterior `OS 2025`, preservando a ordem original.

## Executar

Instale as dependências com `npm ci` e execute `npm run dev`. Abra o endereço informado no terminal. Para gerar a versão de produção: `npm run build`.

Para estudar o código, comece por [Arquitetura](docs/ARQUITETURA.md). As regras ficam em `domain/`, as telas em `components/` dos respectivos módulos e os testes junto das regras. Use `npm run format` para padronizar a edição e `npm run check` para conferir caminhos, formatação, testes e compilação antes de publicar.

## Navegação e aparência

O menu apresenta **Ordens de Serviço**, **Operacional**, **Consumo M2M**, **Parque e Manutenção**, **Usuários** para administradores e **Importação** por último, conforme as permissões de acesso. O controle discreto na parte inferior alterna entre tema claro e escuro; a escolha fica salva neste navegador e vale para todas as páginas. A logo oficial acompanha o contraste do tema.

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

## Manutenção do parque e relatórios

A página Operacional × OS possui indicadores com base vinculável explícita e relatórios XLSX/CSV personalizáveis. Consulte [regras e guia](docs/PARQUE-E-MANUTENCAO.md).

Guia de filtros e leitura financeira: [Filtros e apresentação](docs/FILTROS-E-APRESENTACAO.md).

[Fila consolidada para prioridades](docs/PROXIMOS-AJUSTES.md).
