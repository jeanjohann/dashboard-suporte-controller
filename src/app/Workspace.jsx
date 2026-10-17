/**
 * Coordena a navegação e as bases da sessão. Páginas sem permissão não são montadas; páginas permitidas mantêm estado ao navegar.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { useAccess } from '../shared/security/Access.jsx';
import { allowsPage, allowsSource } from '../shared/security/permissions.js';
import { authorizeAction, accessUser } from '../shared/security/accessClient.js';
import React, { lazy, useState } from 'react';
import { DeferredPage } from './DeferredPage.jsx';

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
/** Mantém as bases da sessão e coordena páginas autorizadas e importações conjuntas. */
export function Workspace() {
  const { user } = useAccess();
  const allowed = (key) => allowsPage(user, key);
  const [page, setPage] = useState('orders'),
    [orders, setOrders] = useState(null),
    [operational, setOperational] = useState(null),
    [logistics, setLogistics] = useState(null),
    [consumptionRevision, setConsumptionRevision] = useState(0);
  // A autorização é reconsultada antes de aplicar o lote; ocultar um botão não basta.
  async function applyBatch(batch) {
    if (!(await authorizeAction('import'))) throw Error('Importação não autorizada.');
    for (const [key, value] of Object.entries(batch))
      if ((Array.isArray(value) ? value.length : value) && !allowsSource(accessUser() || user, key))
        throw Error('Você não tem permissão para importar esta base.');
    if (batch.consumption.length) {
      // Dependências do lote são carregadas somente quando há consumo a gravar.
      const [history, { mergeBulkHistory }] = await Promise.all([
        import('../modules/consumption/data/consumptionHistory.js'),
        import('../modules/imports/domain/bulkImport.js'),
      ]);
      // Confirma a gravação local antes de atualizar as outras bases e avisar a tela de consumo.
      const archive = await history.readConsumptionHistory();
      await history.writeConsumptionHistory(mergeBulkHistory(archive, batch));
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
        active={current === 'users'}
        allowed={allowed('users')}
        page="users"
        onPage={setPage}
        keepMounted={false}
      >
        <UsersPage onPage={setPage} />
      </DeferredPage>
      <DeferredPage
        active={current === 'monitoring'}
        allowed={allowed('monitoring')}
        page="monitoring"
        onPage={setPage}
      >
        <MonitoringPage onPage={setPage} />
      </DeferredPage>
      <DeferredPage
        active={current === 'imports'}
        allowed={allowed('imports')}
        page="imports"
        onPage={setPage}
      >
        <ImportPage
          onPage={setPage}
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
        onPage={setPage}
      >
        {/* Manter a página permitida montada conserva filtros; sem permissão, ela não é criada. */}
        <OrdersPage
          active={current === 'orders'}
          operational={allowed('operational-analysis') ? operational : null}
          onPage={setPage}
          onImport={setOrders}
          source={orders}
        />
      </DeferredPage>
      <DeferredPage
        active={current === 'lines'}
        allowed={allowed('lines')}
        page="lines"
        onPage={setPage}
      >
        <LinesPage
          onPage={setPage}
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
        onPage={setPage}
      >
        <OperationalPage
          page={
            ['operational', 'operational-analysis'].includes(current)
              ? current
              : allowed('operational')
                ? 'operational'
                : 'operational-analysis'
          }
          onPage={setPage}
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
