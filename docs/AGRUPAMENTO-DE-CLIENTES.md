# Clientes consolidados e filiais

## O que muda

As análises de OS passam a oferecer **Cliente consolidado** e **CNPJ / filial**. O padrão é Cliente consolidado, com razões sociais idênticas da Base clientes reunidas, conforme autorização do proprietário em 18/10/2026. Assim, vários documentos de uma mesma empresa podem aparecer em uma única linha com todos os seus atendimentos.

A identidade original continua sendo o CNPJ completo da coluna C. AK conserva seu papel de cobrança. A consolidação é uma camada de análise; não modifica a planilha, os documentos ou os vínculos históricos.

## Como usar

1. Importe a planilha de OS com a aba **Base clientes** contendo **CNPJ** e **Razão Social**.
2. Abra **Filtros da página → Agrupar clientes por**. Use Cliente consolidado para a empresa inteira ou CNPJ / filial para conferir os documentos separadamente.
3. A opção **Consolidar razões sociais idênticas da Base clientes** vem habilitada. Pode ser desmarcada para usar somente o cadastro explícito descrito abaixo.
4. Em **Clientes e custos → Custo por cliente → Conferir clientes e filiais por CNPJ**, consulte qual cliente recebeu cada CNPJ, o critério utilizado e as linhas de origem.

O agrupamento pertence à categoria atual. Escolher CNPJ em Clientes e custos não altera Equipamentos ou Equipe de suporte. As escolhas são mantidas durante a navegação na sessão e voltam ao padrão ao recarregar o sistema. A indicação junto ao nome do arquivo permanece visível mesmo com os filtros recolhidos.

Os filtros de razão social continuam selecionando os nomes originais da OS. Eles recortam as linhas antes da agregação: para analisar a empresa inteira, mantenha todas as razões sociais pertinentes selecionadas ou deixe esse filtro sem seleção. A coluna C pode ser filtrada pelos filtros adicionais.

## Reunir nomes diferentes ou criar exceções

Adicione a coluna opcional **Cliente consolidado** na Base clientes. Para cada CNPJ que pertença ao mesmo cliente, preencha o mesmo nome de grupo e reimporte a planilha.

| CNPJ cadastrado        | Razão Social           | Cliente consolidado  |
| ---------------------- | ---------------------- | -------------------- |
| Documento da matriz    | Empresa Exemplo Matriz | Empresa Exemplo      |
| Documento da filial    | Empresa Exemplo Filial | Empresa Exemplo      |
| Documento independente | Empresa Exemplo        | Unidade independente |

O cadastro explícito tem prioridade sobre a razão social. Para manter uma unidade separada de outras com nome idêntico, atribua a ela um nome de grupo exclusivo. Use o mesmo preenchimento em todas as linhas cadastrais de um determinado CNPJ.

## Critérios e limites

- O modo automático usa somente razões sociais **exatamente iguais** no cadastro: remove espaços nas pontas, mas não aproxima grafias, não ignora diferenças de maiúsculas/acentos e não usa a raiz do CNPJ. Pode consolidar documentos com raízes diferentes quando o nome cadastrado é idêntico.
- Sem cadastro utilizável ou correspondência segura, mantém a identidade por CNPJ. Sem CNPJ utilizável, conserva o comportamento anterior pelo nome original da OS, sem enriquecimento cadastral.
- Nomes conflitantes no cadastro impedem a consolidação automática daquele CNPJ. Cliente consolidado divergente, parcialmente preenchido para o mesmo CNPJ, com erro de célula ou com cabeçalho duplicado também deixa o documento separado para conferência.
- Custos e atendimentos somam as linhas elegíveis. **Chamados distintos são recalculados com o conjunto de números do cliente inteiro**: o mesmo chamado em duas filiais conta uma vez no consolidado. Subtotais de chamados não devem ser somados.
- A escolha afeta agrupamentos de custos, volume/manutenção por cliente, perfil de intervenções, contagens de clientes e ranking de trocas por cliente nas OS. Impressão e exportações analíticas identificam modo e critério; registros originais conservam seus dados.
- Veículos identificados, reincidência, ranking por veículo, ciclos e vida em campo continuam por **CNPJ / filial + placa**. Consolidar a empresa não autoriza presumir que equipamentos ou ciclos de filiais diferentes sejam o mesmo histórico.
- O Parque continua descrevendo a fotografia da planilha Operacional, com suas próprias identidades. O piloto Google ainda consulta apenas a aba OS; a leitura conectada da Base clientes não foi ativada.

## Implementação e conferência

`customerIdentity` conserva a identidade original. `customerAnalysisIdentity` resolve o grupo somente para a apresentação analítica, sem alterar linhas ou associações históricas. A importação lê o campo opcional junto ao cadastro; preços e contatos continuam fora dessa leitura.

Testes sintéticos cobrem soma de custos/serviços, chamado compartilhado entre documentos, nomes idênticos e semelhantes, exceções explícitas, divergências cadastrais, documentos individuais, ranking de trocas e exportação do resumo com registros originais. A conferência de navegador cobre seleção por categoria, CSV e layout claro/escuro em desktop e celular.
