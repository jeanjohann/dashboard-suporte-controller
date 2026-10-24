# Aparência — 0.66.1

Rodada de temas autorizada em 24/10/2026. Seletor com quatro nomes, fonte compacta e preferência local por navegador.

| Tema           | Superfícies          | Destaques                                |
| -------------- | -------------------- | ---------------------------------------- |
| Grafite e Lima | Cinza grafite escuro | Lima, azul e turquesa luminosos          |
| Azul e Âmbar   | Off-white quente     | Azul moderado e âmbar nos gráficos       |
| Noite          | Cinza profundo       | Azul claro, turquesa e violeta luminosos |
| Bruma Azul     | Off-white frio       | Azul acinzentado e tons suaves de apoio  |

Grandes superfícies permanecem neutras. Cores mais saturadas identificam ações, seleções, indicadores e séries. Sucesso, aviso e erro conservam cores e textos próprios. Impressão mantém sua paleta de papel, independente do tema de tela. Nenhum dado, permissão ou preferência de dashboard foi alterado.

## Preferências anteriores

Os IDs lime, ocean, midnight e mist continuam válidos. Noite Azul passa a se chamar Noite. Grafite e Lima passa a usar superfícies escuras em toda a interface, em vez do antigo conteúdo claro com menu escuro.

Claro, Sálvia e Areia e Jardim migram para Bruma Azul. Escuro migra para Noite, Lagoa para Azul e Âmbar e Lima Elétrica para Grafite e Lima. Preferência ausente/desconhecida usa Bruma Azul. A escolha normalizada continua na chave local addlog-theme-v1; abrir o seletor não muda o tema.

## Validação

Verificadas as quatro opções, preservação dos IDs, seis migrações e preferências desconhecidas. Auditoria dos tokens de texto principal/secundário, botões, destaque, links e estados semânticos: mínimo de 4,5:1 nos pares conferidos. Séries de gráfico contra a superfície: mínimo de 3:1. Menores contrastes medidos por tema:

| Tema           | Texto  | Gráficos |
| -------------- | ------ | -------- |
| Grafite e Lima | 6,26:1 | 6,51:1   |
| Azul e Âmbar   | 5,02:1 | 3,36:1   |
| Noite          | 6,36:1 | 6,35:1   |
| Bruma Azul     | 5,18:1 | 3,34:1   |

Essas medições verificam tokens e não certificam todos os componentes, sobreposições ou séries adjacentes. A revisão visual interativa ainda precisa ocorrer: a automação de navegador está desabilitada neste ambiente. Imports, formatação, testes existentes e compilação integram a verificação da entrega.
