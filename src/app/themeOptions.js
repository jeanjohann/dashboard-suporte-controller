/** IDs estáveis das quatro paletas e migração das preferências antigas deste navegador. */
export const themes = [
  { id: 'lime', label: 'Grafite e Lima' },
  { id: 'ocean', label: 'Azul e Âmbar' },
  { id: 'midnight', label: 'Noite' },
  { id: 'mist', label: 'Bruma Azul' },
];
export const defaultTheme = 'mist';
const legacyThemes = {
  light: 'mist',
  dark: 'midnight',
  electric: 'lime',
  sage: 'mist',
  lagoon: 'ocean',
  garden: 'mist',
};
export function restoredTheme(saved) {
  if (themes.some((entry) => entry.id === saved)) return saved;
  return Object.hasOwn(legacyThemes, saved) ? legacyThemes[saved] : defaultTheme;
}
