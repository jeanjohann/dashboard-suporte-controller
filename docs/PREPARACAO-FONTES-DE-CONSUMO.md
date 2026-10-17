# Preparação para CSV e APIs de consumo — 0.28.0

Em Controle de Consumo → Histórico e arquivos, **Fontes de consumo e preparação das APIs** identifica CSV como fonte atual e apresenta as pendências de KORE Brasil/Saitro e Arqia. Abaixo, a prévia recolhível usa dados fictícios, sem consultar operadoras, gravar observações ou alterar o histórico/backup existente.

## O que já pode ser conferido

- A mesma resposta recebida duas vezes mantém uma observação de 100 MB, sem dobrar o consumo.
- Um acumulado de 100 MB revisado para 120 MB usa 120 MB, não 220 MB.
- CSV de 115 MB e API de 120 MB para a mesma conta/período exigem uma escolha explícita na simulação.
- Uma consulta incompleta posterior conserva a última observação completa da simulação.

As escolhas do laboratório ficam somente na sessão do componente. Não afetam arquivos reais, vínculos, notas, filtros, referências de consumo ou exportações existentes. A política não foi aplicada aos CSVs guardados; a preparação oferece um ponto testado para os futuros adaptadores.

## Contrato interno provisório

`domain/consumptionSources.js` recebe observações já normalizadas, e não respostas brutas das operadoras. Cada observação contém:

- `id`, `kind` (`csv`/`api`) e `connectionKey`: identidade da observação e conexão.
- `operator`, `accountKey`: operadora e conta explicitamente conferida.
- `start`, `end`: dias inclusivos ISO; `periodBasis`: convenção temporal validada pelo adaptador.
- `observedAt`: instante com fuso; `complete: true`: confirmação de coleta integral, incluindo todas as páginas.
- `rows`: ICCID e número como textos e volume em `ticks`, a unidade interna inteira usada no Consumo.

Esta forma interna não pressupõe que as APIs tenham esses nomes ou retornem dias inclusivos. O adaptador de cada operadora dependerá da documentação real para converter unidade, fuso e limites do período, validar precisão e completude e atribuir conta/conexão. Não reaproveitar automaticamente a conversão binária dos CSVs nem inferir a conta pelo nome do arquivo/plano.

O planejador conserva a observação completa mais recente da mesma conexão/conta/período. Observações idênticas não são repetidas. Fontes/conexões diferentes exigem escolha; períodos sobrepostos ou bases temporais incompatíveis ficam para revisão. ID repetido com conteúdo diferente é recusado. Volume ausente/incompatível não vira zero; total sem base utilizável fica indisponível. A política não modifica as entradas.

## O que continua pendente

Documentação, acesso, coleta no servidor, adaptadores, mapeamento das contas, validação de unidades/fuso, cache/armazenamento, atualização automática e ativação real. Também falta integrar a escolha efetiva de fontes ao arquivo/histórico de produção, com migração e backup definidos se houver mudança de formato. Notas permanecem no IndexedDB existente, por operadora + ICCID; nenhuma nota é apagada ou migrada nesta preparação.

Escopo das operadoras: [Integrações KORE e Arqia](INTEGRACAO-OPERADORAS.md). Uso atual: [Controle de Consumo](CONSUMO-DE-LINHAS.md).
