# Assistente MCP local — piloto fictício

O laboratório expõe três ferramentas MCP de consulta via HTTP Streamable, em `127.0.0.1:5682/mcp`. O servidor exige o token local do acervo, recusa pedidos com `Origin` e não aceita conexões remotas. Ele só encaminha chamadas para uma sessão ativa do Assistente em `127.0.0.1:5681`; não abre arquivos por parâmetros, caminhos ou instruções do modelo.

## Ferramentas disponíveis

- `addlog_consultar_atendimentos`: totais, períodos, filtros, rankings e detalhes de OS.
- `addlog_consultar_trocas`: trocas de rastreador/RFID/coletora e ciclos encerrados.
- `addlog_consultar_parque`: fotografia da Operacional de demonstração e cobertura de OS.

As entradas usam schema estrito, filtros enumerados e limites de até 20 linhas/grupos. O servidor MCP encaminha a chamada à sessão temporária da página. A ponte recalcula o resultado usando o mesmo snapshot já capturado para aquela pergunta e retorna à tela os indicadores, critérios, período e fontes. Sem pergunta ativa, a chamada é recusada. O perfil diferente de `demo` não disponibiliza as ferramentas ao agente.

## Iniciar e testar

1. Inicie o n8n local em `http://127.0.0.1:5678`.
2. No computador Windows com as duas planilhas `DEMO-*` em `import/`, execute `scripts/start-assistant-lab.ps1`. Ele verifica/inicia os serviços locais do acervo (5680), MCP (5682) e ponte do Assistente (5681), todos em loopback.
3. Entre no sistema publicado com Cloudflare Access e abra `#assistente-laboratorio`. A página de desenvolvimento em `localhost`/`127.0.0.1:5173` não recebe a sessão do Access; use a página autenticada para consultar.
4. Envie uma pergunta de teste. O fluxo fica inativo no n8n e é executado pela ponte com uma pergunta ativa; não o execute manualmente na interface do n8n sem esse contexto.

## Atualizar o fluxo n8n

`scripts/assistant-agent-workflow.mjs` gera `labAssistantAgent01`, incluindo Gemini e um nó MCP Client Tool ligado ao servidor local. Antes de importar uma nova versão, exporte o fluxo atual para `%LOCALAPPDATA%\Addlog\n8n-lab` e preserve o arquivo de backup fora do Git. O CLI importa pelo ID existente e substitui o conteúdo; por segurança, o fluxo permanece inativo. As referências de credenciais existentes são mantidas, mas segredos não entram no JSON do workflow.

No PowerShell, do diretório do projeto, o backup e a restauração seguem estes comandos:

```powershell
$runtime = Join-Path $env:LOCALAPPDATA 'Addlog\n8n-lab'
$env:N8N_USER_FOLDER = Join-Path $runtime 'data'
$n8n = Join-Path $runtime 'node_modules\n8n\bin\n8n'

# Exportar o workflow atual antes de qualquer importação
node $n8n export:workflow --id=labAssistantAgent01 --output=(Join-Path $runtime 'assistant-agent-before-mcp.json')

# Gerar e importar o workflow MCP (o ID existente será atualizado e ficará inativo)
node .\scripts\prepare-assistant-workflow.mjs (Join-Path $runtime 'assistant-agent-before-mcp.json')
node $n8n import:workflow --input=(Join-Path (Get-Location) 'import\assistant-agent-demo.json') --activeState=false

# Se for necessário reverter, importe o backup criado acima
node $n8n import:workflow --input=(Join-Path $runtime 'assistant-agent-before-mcp.json') --activeState=false
```

O arquivo de importação `import/assistant-agent-demo.json` é local e ignorado pelo Git. Antes do teste, confira que o fluxo possui os nós **Agente de suporte**, **Gemini · Credencial cadastrada** e **Ferramentas analíticas MCP**, com a ferramenta conectada ao agente. Depois de iniciar os serviços, rode `npm run test:assistant-e2e` somente quando as portas 5681 e 5682 estiverem livres; o script as usa temporariamente e encerra os serviços de teste ao concluir.

## Acesso e limites

- A credencial **LAB · Acervo local (somente leitura)** contém o token do arquivo `%LOCALAPPDATA%\Addlog\n8n-lab\acervo-token.txt`; ela não deve ser copiada para o JSON exportado, Git ou conversa.
- O serviço limita-se ao loopback, exige pelo menos 32 caracteres no token, permite até quatro sessões MCP simultâneas e expira sessões inativas em cinco minutos.
- A ponte exige uma asserção Cloudflare Access válida do administrador principal, restringe origem/Host, aceita somente pergunta de 3 a 1.000 caracteres e aplica pausa entre consultas.
- Os dados de teste são fictícios. O Gemini recebe a pergunta, um catálogo sintético e as respostas das ferramentas; não envie dados reais ou sensíveis.
- Chamadas e resultados não persistem na interface após recarregar. O histórico de execuções do n8n pode reter pergunta e resposta localmente pelo prazo configurado.
- O agente não tem acesso livre a arquivos, comandos, rede, escrita, Zoho, monitoramento ou dados de produção. Respostas sem consulta não geram indicadores.

## Encerrar ou recuperar

Para interromper o laboratório, use os PIDs registrados nos arquivos `*-process.json` dentro de `%LOCALAPPDATA%\Addlog\n8n-lab` e finalize apenas esses processos. Os logs `assistant.log`, `assistant-error.log`, `assistant-mcp.log` e `assistant-mcp-error.log` são locais. A ponte guarda em `assistant-last-error.json` apenas horário e código, nunca a pergunta, token ou resposta.

Se o MCP não responder, confira primeiro se n8n, ponte e MCP estão ativos; depois valide as credenciais no n8n, a existência das duas amostras e o perfil `demo` em `import/assistant-source.json`. A página autenticada é servida pelo Cloudflare; o MCP não é publicado e não recebe tráfego externo.
