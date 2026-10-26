import React, { useId, useRef } from 'react';
import { useTheme } from '../app/Theme.jsx';
import { DisplayModeControl } from './DisplayModeControl.jsx';

/** Ajuda e informações menos frequentes em um modal acessível, sem esconder os filtros de uso diário. */
export function PageConfigurationButton({ scope, description, children }) {
  const { density, selectDensity } = useTheme();
  const id = useId();
  const dialog = useRef(null);
  const trigger = useRef(null);
  const heading = useRef(null);

  function open() {
    if (dialog.current?.open) return;
    dialog.current?.showModal();
    heading.current?.focus();
  }

  function close() {
    dialog.current?.close();
  }

  return (
    <>
      <button
        ref={trigger}
        className="page-configuration-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-controls={`${id}-dialog`}
        onClick={open}
      >
        Configurações
      </button>
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        className="page-settings-dialog page-configuration-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClose={() => trigger.current?.focus()}
      >
        <header>
          <div>
            <span className="page-configuration-eyebrow">{scope}</span>
            <h2 ref={heading} tabIndex={-1} id={`${id}-title`}>
              Configurações e informações
            </h2>
            <p id={`${id}-description`}>{description}</p>
          </div>
          <button type="button" aria-label="Fechar configurações" onClick={close}>
            Fechar
          </button>
        </header>
        <div className="page-settings-body page-configuration-content">
          <DisplayModeControl value={density} onChange={selectDensity} />
          {children}
        </div>
        <footer>
          <span>Filtros e indicadores principais permanecem na página.</span>
          <button type="button" className="page-settings-save" onClick={close}>
            Concluído
          </button>
        </footer>
      </dialog>
    </>
  );
}
