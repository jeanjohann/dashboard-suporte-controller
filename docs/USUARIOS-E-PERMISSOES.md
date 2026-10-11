# Usuários e permissões

Na versão 0.17.0, Monitoramento de Frota é uma página adicional, em preparação e com demonstração opt-in. Usuários comuns precisam de concessão explícita; a página não libera importações de outras bases. Exportação mantém a regra separada existente. Nenhum dado de frota foi adicionado ao D1.

## Comportamento

A autenticação continua no Cloudflare Access. A versão 0.16.0 acrescenta um cadastro interno em D1, contendo apenas e-mail, perfil, páginas liberadas, acesso ativo, permissão de importar/exportar e metadados de atualização. **Nenhuma planilha, registro operacional ou relatório é recebido pela API.**

O administrador inicial é `jeancjohann@gmail.com`, criado no banco no primeiro acesso autenticado. Seu acesso não pode ser suspenso ou rebaixado pelo aplicativo. Administradores têm todas as páginas e ações e podem cadastrar/editar pessoas. Suspender um usuário mantém seu cadastro para futura reativação.

Em **Usuários e permissões**, use Novo usuário, informe o e-mail, escolha perfil, páginas e ações e salve. Para editar, selecione Editar na lista. Novos usuários também precisam ser incluídos manualmente na política do Cloudflare Access. Cadastrar no aplicativo não envia e-mails nem altera políticas externas.

- Páginas: OS, Operacional, Consumo M2M e Parque e Manutenção.
- Importação: arquivos Excel/CSV e restauração de backups. A central verifica também se as bases do arquivo correspondem às páginas liberadas; Parque e Manutenção permite carregar OS e operacional para seus cruzamentos.
- Exportação: relatórios, gráficos, backups e impressão/PDF pelo aplicativo.
- Permissões são consultadas ao entrar, a cada minuto, ao voltar à janela e antes de importar/exportar. O cadastro é protegido no servidor; páginas não liberadas não são montadas no React.

As planilhas permanecem no navegador. As permissões de análise/importação/exportação controlam os fluxos oferecidos pelo aplicativo; **não são DRM nem isolamento dos dados entre usuários de um mesmo perfil de navegador**. Quem já tem um arquivo local ou dados exibidos pode copiar ou fotografar informações e alterar código local. Restrições fortes de acesso aos registros exigiriam processamento/entrega pelo servidor, que não fazem parte desta arquitetura e não foram implementados. O controle administrativo, por sua vez, exige autorização no servidor e não pode ser obtido apenas alterando o menu.

## Publicação e configurações

`wrangler.jsonc` aponta para o Worker já existente, com assets em dist, `server/worker.js` e o banco fornecido pelo proprietário. `/api/*` executa o Worker antes do fallback HTML. O restante mantém o Cloudflare Access em All traffic.

- USERS_DB: D1 `dashboard-suporte-acessos`, ID `cdc65ce1-280f-4f15-945d-f6fba8a9141b`.
- ACCESS_ISSUER: `https://small-grass-95ae.cloudflareaccess.com`.
- ACCESS_AUD: identificador fornecido pelo proprietário, registrado no Wrangler.
- BOOTSTRAP_ADMIN: e-mail particular autorizado para teste.
- Comando de build: `npm run build`; deploy: `npx wrangler deploy`.

A tabela inicial é criada automaticamente pela API se ainda não existe, seguindo a estrutura de `migrations/0001_users.sql` (espelhada em server/schema.js). Migrações futuras devem ser aplicadas explicitamente e manter essa estrutura em sincronia. Não usar o banco para dados das planilhas.

A produção exige resposta JSON válida de `/api/me`, sem fallback para administrador se o servidor falhar. O desenvolvimento pelo Vite conserva o modo local com todas as funções e não disponibiliza gestão remota de usuários. Não expor o servidor Vite publicamente.

## Segurança e validação

Identidade validada pelo JWT do Cloudflare Access: assinatura RS256, emissor, audiência e validade. Um cabeçalho contendo apenas o e-mail não é aceito. Essa validação é necessária para Workers com Static Assets, onde `ctx.access` não é propagado pelo roteador interno, conforme a documentação do Cloudflare.

APIs administrativas verificam perfil, origem da requisição, formato/campos aceitos e versão concorrente do cadastro. Queries usam parâmetros SQL. Respostas de usuários não são cacheadas. Cadastro desconhecido/suspenso é recusado. Falha de configuração ou banco não libera permissões.

Testes: JWT falso, expirado e de outra aplicação; usuário comum; identidade não cadastrada; CSRF; campos extras; suspensão; conflito de versão; proteção do administrador; páginas e bases; amostras de renderização sem botões de exportação. SQLite real em memória nos testes de API. Build React e empacotamento Wrangler em dry-run. A verificação autenticada na hospedagem ainda depende de publicar e testar o novo menu.

Referências:

- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/#ctxaccess-limitations
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
