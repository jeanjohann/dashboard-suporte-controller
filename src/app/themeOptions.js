/** Claro, Escuro e quatro paletas adicionais; preserva preferências válidas deste navegador. */
export const themes = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'lime', label: 'Grafite e Lima' },
  { id: 'ocean', label: 'Azul e Âmbar' },
  { id: 'midnight', label: 'Noite' },
  { id: 'mist', label: 'Bruma Azul' },
];
export const defaultTheme = 'mist';
const legacyThemes = {
  electric: 'lime',
  sage: 'mist',
  lagoon: 'ocean',
  garden: 'mist',
};
export function restoredTheme(saved) {
  if (themes.some((entry) => entry.id === saved)) return saved;
  return Object.hasOwn(legacyThemes, saved) ? legacyThemes[saved] : defaultTheme;
}
