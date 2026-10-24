/** Temas disponíveis; preferências antigas são migradas sem invalidar a sessão. */
export const themes = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'lime', label: 'Lima e Grafite' },
];
export const defaultTheme = 'light';
const legacyThemes = {
  electric: 'lime',
  sage: 'light',
  lagoon: 'light',
  garden: 'light',
  ocean: 'light',
  midnight: 'dark',
  mist: 'light',
};
export function restoredTheme(saved) {
  if (themes.some((entry) => entry.id === saved)) return saved;
  return Object.hasOwn(legacyThemes, saved) ? legacyThemes[saved] : defaultTheme;
}
