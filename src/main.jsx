/** Entrada do navegador: aplica tema e autenticação antes de montar o espaço de trabalho. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './app/Theme.jsx';
import { AccessProvider } from './shared/security/Access.jsx';
import { Workspace } from './app/Workspace.jsx';
// A sequência dos estilos preserva a precedência dos ajustes de identidade, tema e layout.
// CSS do Monitoramento continua antes dos estilos globais, mesmo com sua página carregada sob demanda.
import './styles/monitoring.css';
import './styles/support.css';
import './styles/style.css';
import './styles/identity.css';
import './styles/theme.css';
import './styles/sidebar.css';
import './styles/layout-polish.css';
import './styles/filters.css';
import './styles/controls.css';
import './styles/page-settings.css';
import './styles/google-orders.css';
import './styles/filter-workspace.css';
import './styles/overview-kpis.css';
import './styles/overview-agenda.css';
createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AccessProvider>
      <Workspace />
    </AccessProvider>
  </ThemeProvider>,
);
