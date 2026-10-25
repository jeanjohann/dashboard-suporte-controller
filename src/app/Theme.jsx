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

import { themes, defaultTheme, restoredTheme } from './themeOptions.js';
const ThemeContext = createContext({ theme: defaultTheme, selectTheme: () => {} });
const storageKey = 'addlog-theme-v1';
const densityStorageKey = 'addlog-density-v2';
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return restoredTheme(localStorage.getItem(storageKey));
    } catch {
      return defaultTheme;
    }
  });
  const [density, setDensity] = useState(() => {
    try {
      const savedDensity = localStorage.getItem(densityStorageKey);
      return savedDensity === 'comfortable' ? 'comfortable' : 'compact';
    } catch {
      return 'compact';
    }
  });
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {}
  }, [theme]);
  useLayoutEffect(() => {
    document.documentElement.dataset.density = density;
    try {
      localStorage.setItem(densityStorageKey, density);
    } catch {}
  }, [density]);
  const value = useMemo(
    () => ({
      theme,
      density,
      selectTheme: (next) => {
        if (themes.some((entry) => entry.id === next)) setTheme(next);
      },
      toggleDensity: () =>
        setDensity((current) => (current === 'compact' ? 'comfortable' : 'compact')),
    }),
    [density, theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

/** Seletor acessível, fechado por escolha, clique externo ou Escape; não muda a preferência ao apenas abrir. */
export function ThemeToggle() {
  const { theme, selectTheme, density, toggleDensity } = useTheme();
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
        <strong className="theme-options-section">Espaçamento</strong>
        <button
          type="button"
          className="theme-choice"
          aria-pressed={density === 'compact'}
          onClick={toggleDensity}
        >
          <span>{density === 'compact' ? 'Compacto' : 'Confortável'}</span>
        </button>
        <small>Salvo neste navegador.</small>
      </div>
    </details>
  );
}
