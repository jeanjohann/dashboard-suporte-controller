# Publicação no Cloudflare e controle de acesso

## Estado

Preparação local concluída. **Publicação e políticas de acesso ainda não configuradas nem verificadas.** A conta Cloudflare precisa ser criada pelo proprietário, com confirmação de e-mail. Nenhum domínio comprado é necessário: usar `pages.dev`.

O acesso solicitado é por código enviado ao e-mail, restrito a `jean.carlo@addlog.com.br` e `financeiro@addlog.com.br`. A lista é configurada no Cloudflare Access; não é gravada no aplicativo React como proteção.

## Publicação

1. Criar e confirmar a conta em https://dash.cloudflare.com/sign-up.
2. Em Workers & Pages, criar um projeto **Pages** e conectar o GitHub. Conceder acesso somente ao repositório privado `Jeanjohann/dashboard-suporte-controller`.
3. Nome sugerido: `dashboard-suporte-controller` (disponibilidade ainda não verificada). Branch de produção: `main`. Raiz: diretório principal. Build: `npm run build`. Saída: `dist`. Node: 22, declarado em `.node-version`.
4. Confirmar que a saída contém somente código e recursos de `public`; planilhas da pasta `import` não fazem parte da compilação.
5. Configurar o Access assim que o endereço do projeto for conhecido. Não distribuir o endereço até concluir a verificação abaixo.

## Controle de acesso

Usar Cloudflare Zero Trust / Access, no plano gratuito. Caso o cadastro solicite cartão ou plano pago, conferir o plano selecionado antes de prosseguir; a preparação local não autoriza contratação paga.

- Ativar login One-time PIN.
- Habilitar a política Access no projeto Pages.
- A política gerada inicialmente protege as prévias; ela, sozinha, **não protege a produção**.
- Seguir a documentação oficial para proteger o endereço exato `<projeto>.pages.dev` e manter também a proteção de `*.<projeto>.pages.dev` (prévia e links de versões).
- Em cada aplicação protegida, usar política Allow com seleção **Emails**, apenas os dois endereços autorizados. Não permitir todo o domínio nem Everyone; não configurar Bypass.
- Sessão sugerida: 8 horas. Sem senha fixa no código e sem banco de usuários próprio.

## Verificação antes de liberar

- Sem sessão, produção, links de versões e recursos `/assets/` exigem autenticação.
- E-mail fora da lista não recebe acesso.
- Cada e-mail autorizado consegue abrir o sistema após o código.
- Importação, gráficos, exportação e impressão funcionam depois do login.
- Registrar URL final e data da validação aqui somente após confirmar os resultados.

A hospedagem entrega o sistema; os arquivos importados continuam sendo processados no navegador. OS e operacional são referências de sessão. Histórico de consumo e preferências pertencem ao navegador e ao endereço do site, não à identidade autenticada. Dois usuários no mesmo perfil do navegador compartilham esse armazenamento; para separar dados, usar perfis diferentes. Exporte o backup do endereço local antes de migrar o consumo para o endereço hospedado e importe-o no novo endereço. Não há sincronização automática entre computadores.

## Configuração no repositório

`public/_headers`: cabeçalhos básicos e HTML sem cache persistente. `public/robots.txt`: pedido para não indexar o site. **Esses arquivos não substituem autenticação.** `.node-version`: runtime de build.

Referências oficiais:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain
- https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/
