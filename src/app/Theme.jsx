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
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'lime', label: 'Grafite e Lima' },
  { id: 'sage', label: 'Sálvia e Areia' },
  { id: 'lagoon', label: 'Lagoa' },
  { id: 'ocean', label: 'Azul e Âmbar' },
  { id: 'midnight', label: 'Noite Azul' },
  { id: 'electric', label: 'Lima Elétrica' },
  { id: 'mist', label: 'Bruma Azul' },
  { id: 'garden', label: 'Jardim' },
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
            <span>{entry.label}</span>
          </button>
        ))}
        <small>Salvo neste navegador.</small>
      </div>
    </details>
  );
}
