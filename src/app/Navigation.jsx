/**
 * Estrutura do aplicativo: navegação, tema e ferramentas da barra lateral.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { useAccess } from '../shared/security/Access.jsx';
import { allowsPage } from '../shared/security/permissions.js';
import { Icon } from '../components/Icon.jsx';
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from './Theme.jsx';
import { SidePanelTarget } from './SidePanel.jsx';
const pages = [
  ['orders', 'Ordens de Serviço'],
  ['operational', 'Operacional'],
  ['lines', 'Controle de Consumo M2M'],
  ['operational-analysis', 'Parque e Manutenção'],
  ['imports', 'Importação'],
];
/** Exibe somente as páginas autorizadas e mantém expansão, recolhimento e ferramentas da página ativa. */
export function Navigation({ page, onPage }) {
  const { user, managed } = useAccess();
  const visiblePages = [
    ...pages.slice(0, -1),
    ...(managed && user?.role === 'admin' ? [['users', 'Usuários e permissões']] : []),
    pages.at(-1),
  ].filter(([key]) => allowsPage(user, key));
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('addlog-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [menuOpen, setMenuOpen] = useState(true);
  useEffect(() => setMenuOpen(true), [page]);
  useEffect(() => {
    const sync = () => {
      try {
        setCollapsed(localStorage.getItem('addlog-sidebar-collapsed') === 'true');
      } catch {}
    };
    window.addEventListener('sidebar-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('sidebar-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const changeCollapsed = (next) => {
    setCollapsed(next);
    try {
      localStorage.setItem('addlog-sidebar-collapsed', String(next));
    } catch {}
    window.dispatchEvent(new Event('sidebar-change'));
  };
  function select(key) {
    if (key === page) {
      if (collapsed) {
        changeCollapsed(false);
        setMenuOpen(true);
      } else setMenuOpen((value) => !value);
    } else {
      onPage(key);
      setMenuOpen(true);
    }
  }
  return (
    <aside className={`app-navigation${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand-row">
        <div className="logo" aria-label="Addlog">
          <span className="brand-image" role="img" aria-label="Addlog" />
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => changeCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {<Icon name={collapsed ? 'right' : 'left'} size={17} />}
        </button>
      </div>
      <nav className="side-navigation" aria-label="Páginas do sistema">
        {visiblePages.map(([key, label]) => (
          <div className="navigation-group" key={key}>
            <button
              type="button"
              title={label}
              aria-label={label}
              className={page === key ? 'active' : ''}
              aria-current={page === key ? 'page' : undefined}
              aria-expanded={key !== 'imports' && page === key ? !collapsed && menuOpen : undefined}
              aria-controls={key !== 'imports' && page === key ? `submenu-${key}` : undefined}
              onClick={() => select(key)}
            >
              <span className="navigation-icon" aria-hidden="true">
                <Icon name={key} />
              </span>
              <span className="navigation-label">{label}</span>
              {key !== 'imports' && page === key && (
                <span className="navigation-chevron" aria-hidden="true">
                  {<Icon name={menuOpen ? 'up' : 'down'} size={14} />}
                </span>
              )}
            </button>
            {page === key && (
              <div id={`submenu-${key}`} hidden={collapsed || !menuOpen}>
                <SidePanelTarget />
              </div>
            )}
          </div>
        ))}
      </nav>
      <ThemeToggle />
    </aside>
  );
}
