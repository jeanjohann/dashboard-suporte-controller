/** Temas disponíveis; preferências antigas são migradas sem invalidar a sessão. */
export const themes = [
  { id: 'light', label: 'Porcelana' },
  { id: 'dark', label: 'Grafite Elétrico' },
  { id: 'lime', label: 'Lima Noturno' },
  { id: 'glance', label: 'Glance' },
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
