/** Temas globais, com preferência local preservada e escolha explícita de paleta. */
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';

const themes = [
  { id: 'light', label: 'Claro', colors: ['#ffffff', '#147b72', '#3c7cc4'] },
  { id: 'dark', label: 'Escuro', colors: ['#232930', '#58dfbd', '#7db7ff'] },
  { id: 'lime', label: 'Grafite e Lima', colors: ['#282828', '#a8c513', '#679ca3'] },
  {
    id: 'sage',
    label: 'Sálvia e Areia',
    colors: ['#55879f', '#306c67', '#72a17f', '#cacaa5', '#e0d9c7'],
  },
  { id: 'lagoon', label: 'Lagoa', colors: ['#2ba0c9', '#23a69b', '#bad09d', '#e8e5c9', '#f3f3f3'] },
  {
    id: 'ocean',
    label: 'Azul e Âmbar',
    colors: ['#0868c5', '#0a979f', '#8bcb74', '#ffefb5', '#fffaf3'],
  },
  {
    id: 'midnight',
    label: 'Noite Azul',
    colors: ['#a9d3e2', '#edf2f0', '#172130', '#78797e', '#e5e5e5'],
  },
  {
    id: 'electric',
    label: 'Lima Elétrica',
    colors: ['#96ef4c', '#fff34d', '#131f00', '#757873', '#e2e2e2'],
  },
];
const ThemeContext = createContext({ theme: 'light', selectTheme: () => {} });
const storageKey = 'addlog-theme-v1';
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return themes.some((entry) => entry.id === saved) ? saved : 'light';
    } catch {
      return 'light';
    }
  });
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {}
  }, [theme]);
  const value = useMemo(
    () => ({
      theme,
      selectTheme: (next) => {
        if (themes.some((entry) => entry.id === next)) setTheme(next);
      },
    }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

/** Seletor acessível, fechado por escolha, clique externo ou Escape; não muda a preferência ao apenas abrir. */
export function ThemeToggle() {
  const { theme, selectTheme } = useTheme();
  const picker = useRef(null);
  useEffect(() => {
    const closeOutside = (event) => {
      if (picker.current && !picker.current.contains(event.target)) picker.current.open = false;
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return (
    <details
      ref={picker}
      className="theme-picker"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          picker.current.open = false;
          picker.current.querySelector('summary').focus();
        }
      }}
    >
      <summary
        className="theme-toggle"
        aria-label={`Escolher tema · ${themes.find((entry) => entry.id === theme).label}`}
        title="Escolher tema"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M12 3a9 9 0 0 1 0 18Z" />
        </svg>
      </summary>
      <div className="theme-options" role="group" aria-label="Temas do sistema">
        <strong>Aparência</strong>
        {themes.map((entry) => (
          <button
            type="button"
            key={entry.id}
            className="theme-choice"
            aria-label={entry.label}
            aria-pressed={theme === entry.id}
            onClick={() => {
              selectTheme(entry.id);
              picker.current.open = false;
              picker.current.querySelector('summary').focus();
            }}
          >
            <span className="theme-swatches" aria-hidden="true">
              {entry.colors.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
            <span>{entry.label}</span>
            <span aria-hidden="true">{theme === entry.id ? '✓' : ''}</span>
          </button>
        ))}
        <small>Salvo neste navegador.</small>
      </div>
    </details>
  );
}
