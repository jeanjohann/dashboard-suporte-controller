# Publicação no Cloudflare e controle de acesso

## Estado

Preparação local concluída. **Publicação e políticas de acesso ainda não configuradas nem verificadas.** O proprietário já informou a criação da conta e está no painel; a conexão do GitHub e as configurações externas ainda estão pendentes. Nenhum domínio comprado é necessário: usar `pages.dev`.

Para o teste inicial, liberar **somente `jeancjohann@gmail.com`**, como administrador. Os dois endereços corporativos ficam fora da configuração inicial. O usuário pediu para não solicitar códigos de login nesta etapa. A lista é configurada no Cloudflare Access; não é gravada no aplicativo React como proteção.

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
- Em cada aplicação protegida, usar política Allow com seleção **Emails**, apenas o endereço particular autorizado. Não permitir todo o domínio nem Everyone; não configurar Bypass.
- Sessão sugerida: 8 horas. Sem senha fixa no código e sem banco de usuários próprio.

## Verificação antes de liberar

- Sem sessão, produção, links de versões e recursos `/assets/` exigem autenticação.
- E-mail fora da lista não recebe acesso.
- O e-mail particular autorizado consegue abrir o sistema após o código, quando o proprietário autorizar esse teste.
- Importação, gráficos, exportação e impressão funcionam depois do login.
- Registrar URL final e data da validação aqui somente após confirmar os resultados.

A hospedagem entrega o sistema; os arquivos importados continuam sendo processados no navegador. OS e operacional são referências de sessão. Histórico de consumo e preferências pertencem ao navegador e ao endereço do site, não à identidade autenticada. Dois usuários no mesmo perfil do navegador compartilham esse armazenamento; para separar dados, usar perfis diferentes. Exporte o backup do endereço local antes de migrar o consumo para o endereço hospedado e importe-o no novo endereço. Não há sincronização automática entre computadores.

## Configuração no repositório

`public/_headers`: cabeçalhos básicos e HTML sem cache persistente. `public/robots.txt`: pedido para não indexar o site. **Esses arquivos não substituem autenticação.** `.node-version`: runtime de build.

Referências oficiais:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain
- https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/

## Permissões aprovadas — implementação pendente

O proprietário aprovou permissões por usuário para páginas inteiras e controles separados de importação/exportação. O primeiro administrador será jeancjohann@gmail.com.

- Páginas: Ordens de Serviço, Operacional, Consumo M2M e Parque e Manutenção.
- Importação: habilitar/desabilitar a ação de carregar arquivos, inclusive a central de importação.
- Exportação: habilitar/desabilitar os comandos de relatórios, gráficos, backups e impressão/PDF do aplicativo.
- Administração de usuários: exclusiva do administrador; os demais não editam suas permissões.

Isso ainda não está implementado. A política de Cloudflare Access permite entrada, mas não substitui o cadastro e a autorização interna por módulos. Para gestão no próprio sistema, será necessário validar a identidade do Access no servidor e armazenar permissões no servidor (por exemplo, Worker + D1). A autorização deve ser aplicada nas rotas/ações correspondentes, além do menu. Não gravar o papel de administrador no localStorage nem confiar em um e-mail informado pelo navegador.

Desabilitar exportação controla comandos oferecidos pelo aplicativo; não impede uma pessoa de copiar, fotografar ou imprimir dados já exibidos no navegador. O modelo atual processa arquivos locais, portanto ações locais precisam também de regras na interface. Restrições fortes sobre leitura dos dados exigem armazenamento e entrega pelo servidor, que são uma evolução separada.

Sequência: conectar repositório e criar Pages, configurar Access para produção e prévias, validar acesso quando o usuário autorizar solicitar código; depois implementar e validar gestão interna de permissões. Não anunciar permissões ativas antes dessa validação.
