import React from 'react';
export function SavedSourcesPanel({ storage }) {
  if (!storage?.enabled && !storage?.error && !storage?.loading) return null;
  return (
    <section className="panel saved-sources-panel" aria-label="Bases salvas no banco">
      <header>
        <strong>Bases salvas</strong>
        <button disabled={storage.busy || storage.loading} onClick={storage.reload}>
          Carregar últimas versões
        </button>
      </header>
      <p className="scope">
        Envie a base completa pelo arquivo ou Google Sheets. A nova versão substitui a usada nos
        relatórios após a confirmação do banco, sem somar importações. Mantemos as cinco últimas
        versões de OS, Operacional e Logística. Extratos de consumo permanecem no armazenamento
        anterior.
      </p>
      {storage.loading && <p role="status">Carregando bases salvas…</p>}
      {storage.error && (
        <p role="alert" className="error">
          {storage.error}
        </p>
      )}
      {storage.message && <p role="status">{storage.message}</p>}
      <dl>
        {[
          ['orders', 'Ordens de Serviço'],
          ['operational', 'Operacional'],
          ['logistics', 'Logística'],
        ].map(([kind, label]) => {
          const head = storage.catalog[kind];
          return (
            <div key={kind}>
              <dt>{label}</dt>
              <dd>
                {head
                  ? `${head.rows.toLocaleString('pt-BR')} registros · ${head.filename}`
                  : 'Nenhuma versão salva'}
              </dd>
              {head && (
                <small>
                  Salva em{' '}
                  {new Date(head.savedAt).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                  })}
                </small>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
