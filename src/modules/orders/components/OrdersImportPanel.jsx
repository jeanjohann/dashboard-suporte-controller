/** Cabeçalho, seleção de arquivo, estado de leitura e apresentação inicial das OS. */
import React from 'react';
import { PermissionButton } from '../../../shared/security/Access.jsx';
import { PageSettingsButton } from '../../../components/PageSettings.jsx';

/** Apresenta o recorte e as ações recebidas; a base original permanece no controlador. */
export function OrdersImportPanel({ input, busy, error, data, load, google }) {
  return (
    <>
      <header>
        <div>
          <div className="eyebrow">CONTROLE DE SERVIÇOS</div>
          <h1>Ordens de serviço</h1>
          <p>Importe sua planilha e confira os atendimentos antes de analisar.</p>
        </div>
        <div className="page-header-actions">
          {google?.allowed && (
            <button
              type="button"
              onClick={() => google.setOpen(!google.open)}
              aria-expanded={google.open}
            >
              Google Sheets{google.connected ? ' · conectado' : ''}
            </button>
          )}
          <PermissionButton
            className="header-import-action"
            action="import"
            onClick={() => input.current.click()}
            disabled={busy || google?.busy}
          >
            {busy ? 'Lendo arquivo…' : '↑ Importar planilha'}
          </PermissionButton>
          <PageSettingsButton available={!!data} />
        </div>
        <input ref={input} type="file" accept=".xlsx,.xls" hidden onChange={load} />
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
          {data && ' A importação anterior continua disponível.'}
        </div>
      )}
      {!data && (
        <section className="empty">
          <div className="file-icon">▤</div>
          <h2>Sua operação começa pela planilha</h2>
          <p>
            Selecione o Excel que contém a aba <strong>OS 2025_26</strong> ou{' '}
            <strong>OS 2025</strong>.<br />A ordem dos registros e das colunas será preservada.
          </p>
          <PermissionButton
            action="import"
            onClick={() => input.current.click()}
            disabled={busy || google?.busy}
          >
            Selecionar arquivo Excel
          </PermissionButton>
          <div className="principles">
            <span>✓ Uma linha = um atendimento</span>
            <span>✓ Chamados podem se repetir</span>
            <span>✓ Sem correções automáticas</span>
          </div>
        </section>
      )}
    </>
  );
}
