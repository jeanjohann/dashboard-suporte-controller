# Temas do sistema

Em **0.51.0**, o controle de aparência no rodapé do menu passa a oferecer **Claro**, **Escuro** e **Grafite e Lima**. A escolha fica salva somente neste navegador; abrir o seletor não altera a preferência. O menu fecha ao escolher, clicar fora ou pressionar Escape.

Grafite e Lima é inspirado na imagem fornecida pelo proprietário: grafite, verde lima, branco e azul petróleo. A adaptação usa lima nos destaques, grafite na navegação e superfícies claras para leitura. Gráficos combinam petróleo, oliva, ardósia, violeta e terracota; avisos mantêm significados próprios. Os tons foram adaptados à interface, sem alegação de reprodução exata dos códigos da imagem.

Claro e Escuro mantêm suas paletas anteriores. Preferências antigas continuam válidas. Não há mudança automática de tema para usuários existentes. Variáveis compartilhadas aplicam a escolha aos módulos; impressão e exportações usam suas cores próprias para preservar leitura fora da tela.

Implementação: `src/app/Theme.jsx`, tokens em `src/styles/theme.css` e navegação em `src/styles/sidebar.css`.
