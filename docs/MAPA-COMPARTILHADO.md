# Compartilhamento do mapa de arquitetura

Entregue em **0.49.0 — 21/10/2026**. O mapa pode ser consultado sem cadastrar usuários no sistema, usando [seu endereço independente](https://mapa-arquitetura-addlog.jean-johann.workers.dev/) e uma senha compartilhada. Administradores também encontram o atalho **Mapa de arquitetura** no menu do sistema.

## Uso

1. Enviar o endereço e a senha às pessoas autorizadas pelo proprietário.
2. Informar a senha para acessar guia, diagramas, catálogo e apresentação.
3. Usar **Sair** ao terminar em um computador compartilhado. O acesso expira após oito horas.

A senha gerada foi entregue ao proprietário em arquivo local, fora do GitHub. Não é a senha da conta Cloudflare, Google, Zoho ou do sistema. Ela não acompanha o link, o HTML nem o inventário. O site apresenta documentação, sem consultar planilhas, chamados ou cadastros do dashboard. Os links para código-fonte abrem o GitHub e dependem das permissões daquele repositório.

## Publicação e manutenção

- Configuração independente: `wrangler.architecture.jsonc`. Não adicionar bindings do dashboard a esse Worker. `run_worker_first: true` faz a verificação de senha preceder todos os arquivos ([documentação Cloudflare](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)).
- Secrets: `MAP_PASSWORD` (mínimo de 20 caracteres) e `MAP_SESSION_SECRET` (mínimo de 32). Sem configuração completa, inclusive limitador, o Worker recusa acesso. Os valores não devem ser commitados ou adicionados a `vars`.
- Limitação de cinco tentativas por minuto por IP, usando o binding da Cloudflare. A proteção tem contadores distribuídos por localização, não é um bloqueio global exato ([limites do serviço](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)).
- `npm run architecture:build` atualiza versão, inventário, HTML e diagramas e prepara `.worker-build/architecture-site`. Somente os documentos previstos são copiados; fontes, credenciais e arquivos de acesso ficam fora do pacote.
- `npm run architecture:deploy` regenera e publica esse site com `--keep-vars`. Publicar o dashboard com o Wrangler padrão continua sendo uma operação independente.
- Para revogar acessos, trocar `MAP_PASSWORD` pelo gerenciador de Secrets do Worker ou `wrangler secret put MAP_PASSWORD --config wrangler.architecture.jsonc`. A assinatura da sessão depende também da senha; a troca invalida sessões anteriores. Atualizar o arquivo local usado para compartilhar a senha, sem enviar o valor ao GitHub.
- O logout apaga o cookie daquele navegador; não revoga uma cópia roubada do cookie. Para revogação global, rotacionar a senha. Downloads já realizados não podem ser retirados.

## Validação

Testes cobrem acesso anônimo e direto a HTML/JSON/diagramas, senha incorreta, formulário externo, limite do corpo e de tentativas, configuração ausente, assinatura, audiência, expiração, rotação e logout. Conferir em produção a tela sem sessão e o mapa após autenticação, sem alterar as regras de acesso do sistema principal.
