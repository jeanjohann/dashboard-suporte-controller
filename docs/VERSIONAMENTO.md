# Versionamento e uso em outros computadores

O projeto usa Git, com branch principal `main`. Repositório privado: https://github.com/Jeanjohann/dashboard-suporte-controller.

## O que entra no repositório

Código, documentação, testes sintéticos, `package.json` e `package-lock.json`. Planilhas operacionais, relatórios CSV/TSV, PDFs, arquivos de ambiente, dependências instaladas e a pasta `dist` são ignorados. Os arquivos locais de dados permanecem no computador; ignorar não os apaga.

O teste que confere a planilha operacional original só roda quando ela está presente na raiz. Os testes sintéticos permanecem disponíveis em qualquer cópia do código. Não adicionar dados de clientes à força com `git add -f`.

## Primeiro uso em outro computador

Instale Git e Node.js com npm. Copie o endereço do repositório no GitHub e execute:

```powershell
git clone https://github.com/Jeanjohann/dashboard-suporte-controller.git
cd dashboard-suporte-controller
npm ci
npm test
npm run dev
```

Abra o endereço informado pelo Vite. Importe seus arquivos manualmente. O GitHub disponibiliza o código; o aplicativo continua sendo executado localmente. Publicar uma versão web acessível por endereço é uma etapa distinta.

## Atualizações

Antes de começar a trabalhar em outra cópia sem alterações locais, use `git pull --ff-only`. Após editar, atualize a documentação, rode os testes e gere o build:

```powershell
npm test
npm run build
git status
git diff
git add src docs README.md CHANGELOG.md package.json package-lock.json .gitignore index.html
git commit -m "Descreva a alteração realizada"
git push
```

Confira os arquivos incluídos antes de cada commit. Configure nome e email do autor do Git conforme sua conta. Nunca coloque tokens ou senhas em URLs, código ou documentação. Se houver conflito ou alterações locais antes de atualizar, revise-as antes de continuar.

## Estado inicial

Repositório local inicializado e remoto origin configurado. Autor local: Jean Johann, usando o email de privacidade Jeanjohann@users.noreply.github.com. Para enviar atualizações, o Git deste computador precisa de autenticação própria; o login do navegador não autentica automaticamente o terminal.
