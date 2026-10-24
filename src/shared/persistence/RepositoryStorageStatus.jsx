/** Indica a fonte oficial e exige migração explícita antes de gravar sobre uma cópia local. */
import React from 'react';
export function RepositoryStorageStatus({ repository, busy, onMigrate }) {
  if (!repository?.mode) return null;
  return (
    <div className="workspace-storage-status">
      <small>
        {repository.mode === 'checking'
          ? 'Conferindo armazenamento…'
          : repository.mode === 'remote'
            ? busy
              ? 'Banco do sistema · processando…'
              : 'Banco do sistema · piloto do administrador'
            : 'Salvo neste navegador'}
      </small>
      {repository.pendingMigration && (
        <>
          <span>
            Cópia local encontrada. Migre antes de salvar alterações. Ela será preservada.
          </span>
          <button type="button" disabled={busy} onClick={onMigrate}>
            Migrar cópia local para o banco
          </button>
        </>
      )}
    </div>
  );
}
