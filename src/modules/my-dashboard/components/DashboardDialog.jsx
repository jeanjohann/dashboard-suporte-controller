import React, { useEffect, useId, useRef } from 'react';

export function DashboardDialog({ title, onClose, children, className = '' }) {
  const ref = useRef(),
    id = useId();
  useEffect(() => {
    ref.current.showModal();
    ref.current.querySelector('[autofocus]')?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`md-dialog ${className}`}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <div>
          <span className="md-eyebrow">MEU DASHBOARD</span>
          <h2 id={id}>{title}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar janela">
          ✕
        </button>
      </header>
      {children}
    </dialog>
  );
}
