import React, { useEffect, useId, useRef } from 'react';

/** Progresso fora do fluxo da página; fechar a janela não interrompe a transferência. */
export function SavedSourcesStatus({ storage }) {
  const dialog = useRef(null),
    title = useId();
  const phase = storage.error
    ? 'error'
    : storage.busy
      ? 'saving'
      : storage.loading
        ? 'loading'
        : '';
  useEffect(() => {
    const element = dialog.current;
    if (phase) element?.showModal();
    return () => element?.close();
  }, [phase]);
  if (!phase) return null;
  const progress = Math.max(0, Math.min(100, storage.progress || 0));
  return (
    <dialog ref={dialog} className="saved-sources-status" aria-labelledby={title}>
      <header>
        <h2 id={title}>
          {phase === 'error'
            ? 'Não foi possível carregar'
            : phase === 'saving'
              ? 'Salvando bases'
              : 'Carregando bases salvas'}
        </h2>
        <button type="button" aria-label="Fechar progresso" onClick={() => dialog.current.close()}>
          ×
        </button>
      </header>
      {phase === 'error' ? (
        <>
          <p role="alert">{storage.error}</p>
          <button type="button" onClick={storage.reload}>
            Tentar carregar novamente
          </button>
        </>
      ) : (
        <>
          <p role="status">
            {phase === 'saving' ? 'Confirmando no banco…' : `Progresso: ${progress}%`}
          </p>
          <progress
            aria-label={phase === 'saving' ? 'Salvando bases' : 'Carregando bases salvas'}
            max="100"
            value={phase === 'loading' ? progress : undefined}
          />
          <small>Você pode fechar esta janela; a operação continuará.</small>
        </>
      )}
    </dialog>
  );
}
