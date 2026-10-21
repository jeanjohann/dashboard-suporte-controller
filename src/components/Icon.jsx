/**
 * Componente compartilhado de apresentação. As regras de negócio são fornecidas pelos módulos.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import React from 'react';
const paths = {
  'architecture-map': (
    <>
      <rect x="8" y="2" width="8" height="6" rx="1" />
      <path d="M12 8v5M4 17v-4h16v4" />
      <rect x="1" y="17" width="6" height="5" rx="1" />
      <rect x="9" y="17" width="6" height="5" rx="1" />
      <rect x="17" y="17" width="6" height="5" rx="1" />
    </>
  ),
  'my-dashboard': (
    <>
      <rect x="3" y="3" width="7" height="8" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="3" y="15" width="7" height="6" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
    </>
  ),
  laboratory: (
    <>
      <path d="M9 3h6M10 3v6l-6 10a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2L14 9V3M7.5 15h9" />
      <path d="M10 18h.01M14 17h.01" />
    </>
  ),
  implementation: (
    <>
      <path d="M12 3v12M7 8l5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
      <path d="M8 17h8" />
    </>
  ),
  vehicle: (
    <>
      <path d="m5 8 2-4h10l2 4M4 8h16v10H4zM8 12h8M6 18v3M18 18v3" />
      <circle cx="7" cy="15" r=".7" />
      <circle cx="17" cy="15" r=".7" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M10 21v-6h4v6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m7.5 12 3 3 6-6" />
    </>
  ),
  warning: (
    <>
      <path d="m12 3 10 18H2L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  maintenance: (
    <>
      <path d="M14 4a5 5 0 0 0-6 6L3 15a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 4-3-3 4-4Z" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 8V5H5a2 2 0 0 0 0 4h15v11H5a2 2 0 0 1-2-2V7" />
      <path d="M20 12h-5v5h5" />
      <path d="M17 14.5h.01" />
    </>
  ),
  average: (
    <>
      <path d="M3 20h18M6 16V9M12 16V4M18 16v-5M3 7l18-3" />
    </>
  ),
  settings: (
    <>
      <path d="M9.4 4.4 10 2.8h4l.6 1.6a2 2 0 0 0 2.5 1.4l1.7-.3 2 3.5-1.1 1.3a2 2 0 0 0 0 2.9l1.1 1.3-2 3.5-1.7-.3a2 2 0 0 0-2.5 1.4l-.6 2h-4l-.6-2a2 2 0 0 0-2.5-1.4l-1.7.3-2-3.5 1.1-1.3a2 2 0 0 0 0-2.9L3.2 9l2-3.5 1.7.3a2 2 0 0 0 2.5-1.4Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  monitoring: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M4 12h4l2-4 4 8 2-4h4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5" />
    </>
  ),
  orders: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  operational: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 10h18M9 10v10M15 10v10" />
    </>
  ),
  lines: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M10 3v4h8M9 12h6v5H9zM12 12v5" />
    </>
  ),
  'operational-analysis': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 15v-3M12 15V8M17 15v-5" />
    </>
  ),
  imports: (
    <>
      <path d="M12 15V3M8 7l4-4 4 4M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
  up: <path d="m6 14 6-6 6 6" />,
  down: <path d="m6 10 6 6 6-6" />,
};
/** Renderiza ícones vetoriais decorativos; o controle que os utiliza deve fornecer seu próprio rótulo acessível. */
export function Icon({ name, size = 18 }) {
  return (
    <svg
      className="ui-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] || paths.info}
    </svg>
  );
}
