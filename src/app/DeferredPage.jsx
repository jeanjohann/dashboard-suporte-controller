/** Carrega uma página na primeira visita e mantém sua instância durante a navegação autorizada. */
import React, { Component, Suspense, useEffect, useState } from 'react';
import { Navigation } from './Navigation.jsx';
import { SidePanelProvider } from './SidePanel.jsx';

/** Mantém o menu disponível durante o carregamento ou uma falha isolada do módulo. */
function PageStatus({ page, onPage, failed = false }) {
  return (
    <SidePanelProvider>
      <div className="app module-loading-page">
        <Navigation page={page} onPage={onPage} />
        <main>
          <section
            className="panel"
            style={{ padding: 24 }}
            role={failed ? 'alert' : 'status'}
            aria-live="polite"
          >
            <h1>{failed ? 'Não foi possível abrir este módulo' : 'Carregando módulo…'}</h1>
            <p>
              {failed
                ? 'Confira sua conexão. Você pode continuar nas outras páginas pelo menu.'
                : 'Aguarde um instante.'}
            </p>
            {failed && (
              <>
                <button onClick={() => window.location.reload()}>Recarregar sistema</button>
                <p className="scope">
                  Ao recarregar, importe novamente as planilhas da sessão. O histórico de consumo
                  salvo neste navegador permanece.
                </p>
              </>
            )}
          </section>
        </main>
      </div>
    </SidePanelProvider>
  );
}

/** Falha de download/renderização de uma página não desmonta as outras bases e páginas da sessão. */
class PageBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <PageStatus page={this.props.page} onPage={this.props.onPage} failed />
    ) : (
      this.props.children
    );
  }
}

/** Sem permissão, o conteúdo não é montado. Ao sair de uma página visitada, apenas a oculta. */
export function DeferredPage({ active, allowed, page, onPage, keepMounted = true, children }) {
  const [visited, setVisited] = useState(active);
  useEffect(() => {
    if (active) setVisited(true);
  }, [active]);
  if (!allowed || (!active && (!keepMounted || !visited))) return null;
  return (
    <div hidden={!active}>
      <PageBoundary page={page} onPage={onPage}>
        <Suspense fallback={<PageStatus page={page} onPage={onPage} />}>{children}</Suspense>
      </PageBoundary>
    </div>
  );
}
