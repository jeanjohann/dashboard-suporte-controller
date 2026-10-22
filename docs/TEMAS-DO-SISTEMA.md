# Temas do sistema

## Paletas adicionais — 0.54.0

O seletor passa a oferecer oito opções, preservando Claro, Escuro e Grafite e Lima. As cinco novas opções seguem as paletas fornecidas pelo proprietário, na ordem abaixo. Na revisão 0.54.1, o seletor mostra somente os nomes em fonte de 12 px, com a opção ativa destacada. Os códigos originais ficam registrados abaixo; superfícies, textos, botões e séries dos gráficos usam também tons derivados para contraste. A preferência anterior não muda até o usuário escolher outra opção.

| Tema           | Superfícies                                            | Cores fornecidas                                      |
| -------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Sálvia e Areia | Claras, com fundo quente e destaques verdes/azuis      | `#55879f`, `#306c67`, `#72a17f`, `#cacaa5`, `#e0d9c7` |
| Lagoa          | Claras, com azul, turquesa e verde suave               | `#2ba0c9`, `#23a69b`, `#bad09d`, `#e8e5c9`, `#f3f3f3` |
| Azul e Âmbar   | Claras, com azul, petróleo e creme                     | `#0868c5`, `#0a979f`, `#8bcb74`, `#ffefb5`, `#fffaf3` |
| Noite Azul     | Escuras, em azul profundo e cinza com destaques claros | `#a9d3e2`, `#edf2f0`, `#172130`, `#78797e`, `#e5e5e5` |
| Lima Elétrica  | Escuras, em verde profundo com lima e amarelo          | `#96ef4c`, `#fff34d`, `#131f00`, `#757873`, `#e2e2e2` |

O menu de escolha tem altura limitada e rolagem para caber em telas menores. Avisos, erros, sucesso e os indicadores de duração do Monitoramento mantêm significado próprio, independente da paleta. As novas variáveis ficam restritas à tela: impressão/PDF e exportações continuam com as cores portáteis existentes.

As combinações principais de texto/fundo, textos auxiliares, botões, seleção, links e estados semânticos são conferidas por contraste e pela interface. Essa conferência de pares não é uma auditoria de acessibilidade de todos os componentes do sistema.

Implementação adicional: `src/styles/theme-presets.css`, carregado pela entrada do aplicativo. Nenhum dado, regra, integração, permissão ou escolha antiga é alterado pela inclusão das novas opções.

Validação local em 22/10/2026: as cinco paletas foram selecionadas na interface com frota fictícia, sem chamadas à API real. Preferência preservada após recarregar, Escape fecha o seletor e oito opções permanecem acessíveis com rolagem em 390 × 420 px. A cor do gráfico acompanha o tema. Os 60 pares de contraste conferidos ficaram em pelo menos 4,85:1. `npm run check` aprovou formatação, importações, 398 testes e compilação; um teste previsto permanece ignorado.

## Paletas anteriores

Em **0.51.0**, o controle de aparência no rodapé do menu passa a oferecer **Claro**, **Escuro** e **Grafite e Lima**. A escolha fica salva somente neste navegador; abrir o seletor não altera a preferência. O menu fecha ao escolher, clicar fora ou pressionar Escape.

Grafite e Lima é inspirado na imagem fornecida pelo proprietário: grafite, verde lima, branco e azul petróleo. A adaptação usa lima nos destaques, grafite na navegação e superfícies claras para leitura. Gráficos combinam petróleo, oliva, ardósia, violeta e terracota; avisos mantêm significados próprios. Os tons foram adaptados à interface, sem alegação de reprodução exata dos códigos da imagem.

Claro e Escuro mantêm suas paletas anteriores. Preferências antigas continuam válidas. Não há mudança automática de tema para usuários existentes. Variáveis compartilhadas aplicam a escolha aos módulos; impressão e exportações usam suas cores próprias para preservar leitura fora da tela.

Implementação: `src/app/Theme.jsx`, tokens em `src/styles/theme.css` e navegação em `src/styles/sidebar.css`.
