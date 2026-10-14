/** Cabeçalho e seletores de arquivo do consumo; ações e referências são fornecidas pelo controlador. */
import React from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
export function ConsumptionImportHeader({ busy, ready, imports }) {
  const { input, operationalInput, backupInput, load, loadOperational, readBackup } = imports;
  return (
    <header>
      <div>
        <div className="eyebrow">CONTROLE DE LINHAS</div>
        <h1>Consumo, equipamentos e acompanhamento</h1>
        <p>Arqia e Kore · histórico salvo neste navegador, com backup exportável.</p>
      </div>
      <div className="line-actions">
        <PermissionButton
          action="import"
          disabled={busy || !ready}
          onClick={() => input.current.click()}
        >
          Importar extratos
        </PermissionButton>
        <PermissionButton
          action="import"
          source="operational"
          disabled={busy || !ready}
          onClick={() => operationalInput.current.click()}
        >
          Importar operacional
        </PermissionButton>
      </div>
      <input hidden ref={input} type="file" accept=".csv,text/csv" multiple onChange={load} />
      <input
        hidden
        ref={operationalInput}
        type="file"
        accept=".xlsx,.xls"
        onChange={loadOperational}
      />
      <input
        hidden
        ref={backupInput}
        type="file"
        accept=".json,application/json"
        onChange={readBackup}
      />
    </header>
  );
}
