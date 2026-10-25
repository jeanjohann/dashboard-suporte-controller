/** Carrega uma página na primeira visita e mantém sua instância durante a navegação autorizada. */
import React, { Component, Suspense, useEffect, useState } from 'react';
import { Navigation } from './Navigation.jsx';
import { SidePanelProvider } from './SidePanel.jsx';
import { RetainedContent } from '../components/RetainedContent.jsx';
import { PageActivityProvider } from '../shared/layout/PageActivity.jsx';

/** Mantém o menu disponível durante o carregamento ou uma falha isolada do módulo. */
function PageStatus({ page, onPage, failed = false, onRetry }) {
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
                <div className="module-error-actions">
                  <button onClick={onRetry}>Tentar abrir este módulo novamente</button>
                  <button className="secondary" onClick={() => window.location.reload()}>
                    Recarregar página
                  </button>
                </div>
                <p className="scope">
                  A recarga pode limpar fontes carregadas somente nesta sessão. Bases gravadas no
                  banco do sistema podem ser carregadas novamente após abrir a página.
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
  state = { failed: false, attempt: 0 };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  retry = () => this.setState((state) => ({ failed: false, attempt: state.attempt + 1 }));
  render() {
    return this.state.failed ? (
      <PageStatus page={this.props.page} onPage={this.props.onPage} failed onRetry={this.retry} />
    ) : (
      <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>
    );
  }
}

/** Sem permissão, o conteúdo não é montado. Ao sair de uma página visitada, apenas a oculta. */
export function DeferredPage({
  active,
  allowed,
  page,
  onPage,
  keepMounted = true,
  backgroundActive = false,
  children,
}) {
  const [visited, setVisited] = useState(active);
  useEffect(() => {
    if (active) setVisited(true);
  }, [active]);
  if (!allowed || (!active && (!keepMounted || !visited))) return null;
  return (
    <div hidden={!active}>
      <PageActivityProvider active={active}>
        <PageBoundary page={page} onPage={onPage}>
          <Suspense fallback={<PageStatus page={page} onPage={onPage} />}>
            <RetainedContent active={active || backgroundActive}>{children}</RetainedContent>
          </Suspense>
        </PageBoundary>
      </PageActivityProvider>
    </div>
  );
}
