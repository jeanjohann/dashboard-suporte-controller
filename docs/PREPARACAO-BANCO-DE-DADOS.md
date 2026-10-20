# Preparação para banco de dados — 0.39.0

Esta etapa prepara contratos de acesso, um adaptador SQL e a sequência de migração. **Não ativa armazenamento remoto dos dados do negócio**, novas rotas, sincronização ou coleta automática. OS, Operacional, Zoho e telemetria/tratamento do Monitoramento continuam na sessão; consumo conserva seu IndexedDB e o backup versão 1. Desde 0.41.0, somente os lembretes manuais do Monitoramento possuem IndexedDB próprio, com escopo por usuário/modo e revisão por veículo; sua migração futura deverá preservar agenda e eventos. O banco `USERS_DB` continua exclusivo de usuários/permissões.

## Separação de responsabilidades

```text
Excel / Google / CSV / APIs
        ↓ importadores e validação de cada fonte
Dados originais + origem e versão
        ↓ repositórios de cada módulo
Contrato comum de persistência
        ↓ adaptador escolhido e autorizado
Memória / IndexedDB / futuro banco no servidor
        ↓ dados lidos e validados
Cálculos atuais → cards, gráficos, tabelas e exportações
```

A persistência não redefine o que é atendimento, troca, cliente, visita improdutiva ou consumo elegível. Os cálculos atuais continuam em `domain/`; os adaptadores não corrigem campos, unem nomes ou convertem identificadores. O navegador não deve receber credenciais de banco ou fornecedores.

## Entregue nesta preparação

- `src/shared/persistence/documentRepository.js`: leitura, gravação, paginação e exclusão lógica por espaço, coleção e ID, com revisão obrigatória e versão do formato do conteúdo.
- `memoryDocumentAdapter.js`: implementação de referência para testes e sessões, sem persistência permanente.
- `documentValueAdapter.js`: ponte para módulos com `read()` / `write(value)`, controlando a revisão conhecida e exigindo nova leitura após falha ou conflito. Operações de uma instância são sequenciais. Criar outra instância ao trocar identidade/escopo.
- `server/persistence/d1DocumentAdapter.js`: adaptador preparado para a interface D1 já usada no projeto. SQL parametrizado e comparação de revisão na mesma instrução da gravação. Não é importado pelo Worker atual e não possui binding ativo.
- `server/persistence/migrations/0001_business_documents.sql`: estrutura inicial de documentos para um **banco do negócio separado**. Fora do diretório de migrações de `USERS_DB`; não foi aplicada em nenhum banco de produção.
- A importação conjunta passa pelo mesmo repositório de histórico do consumo usado na página de linhas. O hook aceita injeção de repositório; o padrão continua IndexedDB. O adaptador local e o formato dos backups não mudam.

O contrato é independente do motor. O adaptador D1 foi testado com SQL real em SQLite local; isso não equivale a homologação no serviço remoto. Outro motor, como PostgreSQL, exige um adaptador próprio e suas migrações. Não basta trocar uma URL de conexão.

## Contrato de um documento

| Campo                 | Finalidade                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `version`             | Formato do envelope; inicialmente 1                                                                   |
| `scope`               | Espaço de dados definido pelo servidor; não é prova de autorização                                    |
| `collection`          | Conjunto com uma finalidade e um validador de domínio                                                 |
| `id`                  | Chave opaca textual, estável dentro da coleção; não usar nome do cliente ou número da OS isoladamente |
| `revision`            | Número da gravação confirmado pelo banco; criação exige revisão esperada 0                            |
| `valueVersion`        | Versão do conteúdo; incompatibilidade exige migração explícita                                        |
| `value`               | Conteúdo JSON validado pelo módulo, preservando valores originais                                     |
| `updatedAt` / `actor` | Momento da gravação e identidade fornecidos pelo servidor autenticado                                 |
| `deleted`             | Exclusão lógica; conserva a revisão e impede recriação por uma sessão antiga                          |

Datas do atendimento/agendamento/apuração ficam no conteúdo e não são substituídas pelo horário da gravação. `revision` não é um histórico completo: preservação de versões anteriores exige documentos imutáveis com IDs distintos ou uma coleção de eventos própria. Exclusão lógica também não implementa uma política de eliminação definitiva.

`put(id, value, { expectedRevision })` confirma apenas se a revisão atual coincidir. Em conflito, o consumidor deve manter a edição, informar a divergência e pedir nova leitura; não existe sobrescrita forçada, tentativa automática com nova revisão ou mesclagem presumida. O adaptador deve executar essa condição atomicamente no banco, nunca como SELECT seguido de UPDATE sem condição.

`read()` distingue inexistência (`null`), exclusão lógica e erro. Falha não vira coleção vazia. `list()` usa paginação por chave, com até 500 registros por página; somente leitura completa deve substituir uma base usada nos relatórios. Várias páginas não representam uma fotografia transacional: para resultados consistentes, consultar um lote imutável/concluído ou implementar uma referência de leitura no adaptador futuro.

Fontes podem usar `immutable: true`: apenas criação; a mesma chave não pode ser substituída nem excluída pelo repositório. Para reapresentar o mesmo arquivo, o serviço deve reconhecer a identidade de conteúdo e comparar a origem já existente, sem criar outro lote. A revisão impede repetição na mesma chave, mas não reconhece arquivos iguais com IDs diferentes nem substitui uma política de idempotência da API.

A validação JSON recusa `undefined`, funções, objetos Date, números não finitos, BigInt, ciclos e campos calculados/ocultos; a conversão deve ser explícita e revisada no módulo. Isso não recupera precisão já perdida na origem. Validadores específicos continuam obrigatórios para estrutura, datas, moedas, identificadores e campos permitidos. Podem ser síncronos ou assíncronos; devem lançar/rejeitar em caso de erro ou devolver `false`, sem transformar o conteúdo recebido. IDs de equipamentos, ICCID, MSISDN, CNPJ e placas devem manter sua representação original e suas sinalizações de erro.

## Organização dos dados a conectar

| Área          | Unidade e origem a preservar                                                                   | Adaptação antes de ativar                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| OS            | Lote importado, abas, cabeçalhos/colunas na ordem, linhas físicas e células originais          | Manifesto do lote, hash quando disponível, validador do formato e paginação. Número de OS não é chave única de linha                 |
| Operacional   | Fotografia datada, layout, linha/célula original, cadastro de clientes e identificadores       | Versões independentes das OS; não transformar cadastro atual em titularidade histórica                                               |
| Consumo       | CSV/hash, operadora, apuração, versões ativas/arquivadas, anotações e referência operacional   | Preservar backup v1 e regras de apuração. Anotações precisam de revisão própria; não sobrescrever o histórico inteiro entre usuários |
| Zoho          | Coleta concluída, período, referência, agentes, respostas, apontamentos, cobertura e exclusões | Validar conteúdo e completude; separar vínculos/revisões manuais da coleta imutável                                                  |
| Monitoramento | Fotografia de comunicação e eventos de acompanhamento                                          | Separar demonstração de dados reais; definir identidade da base/veículo e referência temporal                                        |
| Logística     | Lote de envios/devoluções, cabeçalhos, linhas e datas originais                                | Confirmar vínculos antes de integrar OS/parque; não reintroduzir Consertos                                                           |

Essas unidades são um mapa para os adaptadores de domínio, não tabelas de negócio já homologadas. O documento genérico não cria automaticamente vínculos entre clientes, veículos, equipamentos ou agentes.

**Tamanho:** a tabela inicial recebe documentos JSON limitados pelo motor escolhido. Planilhas e históricos inteiros podem exceder o limite de uma linha, requisição ou transação. Antes da conexão real, medir as bases e dividir lotes em manifesto + partes/linhas; originais grandes podem exigir armazenamento de arquivos separado do banco. A troca direta do histórico consolidado pelo adaptador SQL só é adequada a uma amostra pequena de homologação. O modelo final de índices e consultas depende dessas medições e do uso esperado.

## Acesso, compartilhamento e migração

### Requisito aprovado: lembretes do Monitoramento no banco

Os lembretes e todo seu histórico **fazem parte obrigatória da futura integração com o banco de negócio**. IndexedDB é a solução provisória; a entrega da integração do Monitoramento deve incluir leitura e gravação no servidor, não apenas a criação/configuração de um banco. Conectar o banco não troca automaticamente o repositório atual.

Preservar base/ID do veículo, data/hora, observação, situação, resultado da conferência e eventos de criação, reagendamento, cancelamento e conferência. O servidor deve fornecer identidade, horário de gravação e controle de revisão, respeitando permissões e evitando mais de um lembrete ativo para o mesmo veículo no espaço autorizado. Quem compartilha a agenda e quais bases cada usuário pode acessar serão definidos antes de ativar esse acesso.

Na ativação, migrar os lembretes reais existentes de cada navegador de origem mediante conferência, incluindo os encerrados e seu histórico. Não enviar demonstração para a agenda real. Reconhecer reenvio do mesmo registro e tratar agendas locais divergentes sem duplicar eventos ou substituir dados silenciosamente; conservar a cópia local até confirmar a migração. A migração exige acesso ao navegador que contém os dados e não recupera registros já apagados.

Após a ativação, o banco será a fonte oficial da agenda: outro computador autorizado consulta os mesmos registros conforme as permissões. Falha do servidor deve ser explícita, sem anunciar gravação concluída nem cair em outra agenda local. A operação continua mostrando os vencidos ao abrir o sistema; notificações com página fechada permanecem fora do pedido atual. A homologação deve testar migração, recarga em outro navegador autorizado, isolamento de acesso, preservação dos eventos, conflitos e falhas de gravação.

O servidor futuro deverá validar a sessão e as permissões antes de construir o repositório. `scope`, `actor`, coleção permitida e relógio não podem ser aceitos livremente do navegador. A chave de escopo prepara isolamento, mas não implementa multiempresa, compartilhamento ou autorização. O comportamento atual de OS/Parque e o acesso mais restrito ao Zoho devem ser respeitados. Não adicionar uma rota genérica que permita consultar qualquer coleção pelo nome.

Sequência de ativação:

1. Definir motor/localização, quem compartilha cada base, limites, retenção, remoção e backup/restauração. Confirmar o envio dos dados ao destino escolhido.
2. Criar banco de negócio separado, permissões técnicas e migrações em ambiente de teste. Manter `USERS_DB` com sua finalidade atual.
3. Implementar validadores de conteúdo e adaptadores por módulo, começando por uma base. Dimensionar manifesto/partes/índices e coleta completa.
4. Implementar rotas autenticadas, permissões por base/ação, limites, conflitos, idempotência e confirmação de gravação. Não devolver causa interna de erro ou credenciais.
5. Migrar uma cópia da base/backup local para um espaço de homologação, com manifesto de origem e relatório de conferência. Não apagar o original ou tornar um IndexedDB antigo autoritativo em silêncio.
6. Comparar contagens, somas, exclusões, primeiras trocas, datas de cada papel e exportações. Repetir importação, simular falha, concorrência e restauração.
7. Liberar um módulo e confirmar a rotina de backup e reversão. Modo remoto indisponível deve informar erro, sem cair silenciosamente no modo local e dividir o histórico.

Armazenamento compartilhado e coleta automática são entregas separadas. Permanecem dependentes das escolhas acima; esta preparação não as ativa.

## Validação desta etapa

O mesmo conjunto de testes exercita memória e SQL local: concorrência, isolamento por espaço/coleção, identificadores e originais, paginação, exclusão lógica, fontes imutáveis, versões incompatíveis e adaptação `read`/`write`. Falhas preservam a base anterior e não viram valores zero ou históricos vazios. A suíte existente continua verificando cálculos, permissões, fontes e backups. Nenhum dado real é necessário para esses testes.
