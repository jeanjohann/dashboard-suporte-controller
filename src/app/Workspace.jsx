/**
 * Coordena a navegação e as bases da sessão. Páginas sem permissão não são montadas; páginas permitidas mantêm estado ao navegar.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { useAccess } from '../shared/security/Access.jsx';
import { allowsPage, allowsSource } from '../shared/security/permissions.js';
import { authorizeAction, accessUser } from '../shared/security/accessClient.js';
import React, { lazy, useEffect, useState } from 'react';
import { DeferredPage } from './DeferredPage.jsx';
import {
  DashboardSourcesProvider,
  usePublishDashboardSource,
} from '../modules/my-dashboard/hooks/DashboardSources.jsx';
import {
  assistantPreviewHash,
  canOpenAssistantPreview,
  requestsAssistantPreview,
} from '../modules/assistant/domain/previewAccess.js';

const AssistantPage = lazy(() =>
  import('../modules/assistant/components/AssistantPage.jsx').then((module) => ({
    default: module.AssistantPage,
  })),
);

// Declarações estáveis: recriar lazy dentro do Workspace reiniciaria os estados das páginas.
const UsersPage = lazy(() =>
  import('../modules/users/components/UsersPage.jsx').then((module) => ({
    default: module.UsersPage,
  })),
);
const LinesPage = lazy(() =>
  import('../modules/consumption/components/LinesPage.jsx').then((module) => ({
    default: module.LinesPage,
  })),
);
const OperationalPage = lazy(() =>
  import('../modules/operational/components/OperationalPage.jsx').then((module) => ({
    default: module.OperationalPage,
  })),
);
const ImportPage = lazy(() =>
  import('../modules/imports/components/ImportPage.jsx').then((module) => ({
    default: module.ImportPage,
  })),
);
const OrdersPage = lazy(() =>
  import('../modules/orders/components/OrdersPage.jsx').then((module) => ({
    default: module.OrdersPage,
  })),
);
const MonitoringPage = lazy(() =>
  import('../modules/monitoring/components/MonitoringPage.jsx').then((module) => ({
    default: module.MonitoringPage,
  })),
);
const MyDashboardPage = lazy(() =>
  import('../modules/my-dashboard/components/MyDashboardPage.jsx').then((module) => ({
    default: module.MyDashboardPage,
  })),
);
/** Mantém as bases da sessão e coordena páginas autorizadas e importações conjuntas. */
export function Workspace() {
  return (
    <DashboardSourcesProvider>
      <WorkspaceContent />
    </DashboardSourcesProvider>
  );
}
function WorkspaceContent() {
  const { user } = useAccess();
  const allowed = (key) =>
    key === 'assistant-lab' ? canOpenAssistantPreview(user) : allowsPage(user, key);
  const [page, setPage] = useState(() =>
      requestsAssistantPreview(user, window.location.hash) ? 'assistant-lab' : 'orders',
    ),
    [orders, setOrders] = useState(null),
    [operational, setOperational] = useState(null),
    [logistics, setLogistics] = useState(null),
    [consumptionRevision, setConsumptionRevision] = useState(0);
  usePublishDashboardSource('orders', orders);
  usePublishDashboardSource('operational', operational);
  usePublishDashboardSource('logistics', logistics);
  // Entrada explícita de laboratório; nunca é adicionada ao menu ou às permissões de usuários comuns.
  useEffect(() => {
    const syncPreview = () => {
      if (requestsAssistantPreview(user, window.location.hash)) setPage('assistant-lab');
      else setPage((current) => (current === 'assistant-lab' ? 'orders' : current));
    };
    window.addEventListener('hashchange', syncPreview);
    return () => window.removeEventListener('hashchange', syncPreview);
  }, [user]);
  function navigate(key) {
    if (key !== 'assistant-lab' && window.location.hash === assistantPreviewHash)
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      );
    setPage(key);
  }
  // A autorização é reconsultada antes de aplicar o lote; ocultar um botão não basta.
  async function applyBatch(batch) {
    if (!(await authorizeAction('import'))) throw Error('Importação não autorizada.');
    for (const [key, value] of Object.entries(batch))
      if ((Array.isArray(value) ? value.length : value) && !allowsSource(accessUser() || user, key))
        throw Error('Você não tem permissão para importar esta base.');
    if (batch.consumption.length) {
      // Dependências do lote são carregadas somente quando há consumo a gravar.
      const [{ consumptionHistoryRepository }, { mergeBulkHistory }] = await Promise.all([
        import('../modules/consumption/data/historyRepository.js'),
        import('../modules/imports/domain/bulkImport.js'),
      ]);
      // Confirma a gravação local antes de atualizar as outras bases e avisar a tela de consumo.
      const archive = await consumptionHistoryRepository.read();
      await consumptionHistoryRepository.write(mergeBulkHistory(archive, batch));
      setConsumptionRevision((value) => value + 1);
    }
    if (batch.orders) setOrders(batch.orders);
    if (batch.operational) setOperational(batch.operational);
    if (batch.logistics) setLogistics(batch.logistics);
  }
  const current = allowed(page)
    ? page
    : [
        'orders',
        'operational',
        'lines',
        'operational-analysis',
        'monitoring',
        'users',
        'imports',
      ].find(allowed);
  if (!current)
    return (
      <main className="access-status">
        <h1>Nenhuma página liberada</h1>
        <p>Solicite ao administrador a liberação das páginas necessárias.</p>
      </main>
    );
  return (
    <>
      <DeferredPage
        active={current === 'my-dashboard'}
        allowed={allowed('my-dashboard')}
        page="my-dashboard"
        onPage={navigate}
      >
        <MyDashboardPage onPage={navigate} />
      </DeferredPage>
      <DeferredPage
        active={current === 'assistant-lab'}
        allowed={canOpenAssistantPreview(user)}
        page="assistant-lab"
        onPage={navigate}
      >
        <AssistantPage onPage={navigate} />
      </DeferredPage>
      <DeferredPage
        active={current === 'users'}
        allowed={allowed('users')}
        page="users"
        onPage={navigate}
        keepMounted={false}
      >
        <UsersPage onPage={navigate} />
      </DeferredPage>
      <DeferredPage
        active={current === 'monitoring'}
        allowed={allowed('monitoring')}
        page="monitoring"
        onPage={navigate}
      >
        <MonitoringPage onPage={navigate} />
      </DeferredPage>
      <DeferredPage
        active={current === 'imports'}
        allowed={allowed('imports')}
        page="imports"
        onPage={navigate}
      >
        <ImportPage
          onPage={navigate}
          onApply={applyBatch}
          orders={allowed('orders') || allowed('operational-analysis') ? orders : null}
          operational={
            allowed('operational') || allowed('operational-analysis') ? operational : null
          }
          logistics={allowed('operational-analysis') ? logistics : null}
        />
      </DeferredPage>
      <DeferredPage
        active={current === 'orders'}
        allowed={allowed('orders')}
        page="orders"
        onPage={navigate}
      >
        {/* Manter a página permitida montada conserva filtros; sem permissão, ela não é criada. */}
        <OrdersPage
          active={current === 'orders'}
          operational={allowed('operational-analysis') ? operational : null}
          onPage={navigate}
          onImport={setOrders}
          source={orders}
        />
      </DeferredPage>
      <DeferredPage
        active={current === 'lines'}
        allowed={allowed('lines')}
        page="lines"
        onPage={navigate}
      >
        <LinesPage
          onPage={navigate}
          operational={operational}
          onOperationalChange={setOperational}
          reloadToken={consumptionRevision}
        />
      </DeferredPage>
      <DeferredPage
        active={['operational', 'operational-analysis'].includes(current)}
        allowed={allowed('operational') || allowed('operational-analysis')}
        page={
          ['operational', 'operational-analysis'].includes(current)
            ? current
            : allowed('operational')
              ? 'operational'
              : 'operational-analysis'
        }
        onPage={navigate}
      >
        <OperationalPage
          active={current === 'operational'}
          page={
            ['operational', 'operational-analysis'].includes(current)
              ? current
              : allowed('operational')
                ? 'operational'
                : 'operational-analysis'
          }
          onPage={navigate}
          orders={orders}
          source={operational}
          setSource={setOperational}
          logistics={allowed('operational-analysis') ? logistics : null}
          setLogistics={setLogistics}
        />
      </DeferredPage>
    </>
  );
}
