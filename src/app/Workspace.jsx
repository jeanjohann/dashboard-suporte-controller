/**
 * Coordena a navegação e as bases da sessão. Páginas sem permissão não são montadas; páginas permitidas mantêm estado ao navegar.
 * Consulte docs/ARQUITETURA.md para dependências e critérios de manutenção.
 */
import { useAccess } from '../shared/security/Access.jsx';
import { UsersPage } from '../modules/users/components/UsersPage.jsx';
import { allowsPage, allowsSource } from '../shared/security/permissions.js';
import { authorizeAction, accessUser } from '../shared/security/accessClient.js';
import React, { useState } from 'react';
import { LinesPage } from '../modules/consumption/components/LinesPage.jsx';
import { OperationalPage } from '../modules/operational/components/OperationalPage.jsx';
import { ImportPage } from '../modules/imports/components/ImportPage.jsx';
import {
  readConsumptionHistory,
  writeConsumptionHistory,
} from '../modules/consumption/data/consumptionHistory.js';
import { mergeBulkHistory } from '../modules/imports/domain/bulkImport.js';
import { OrdersPage } from '../modules/orders/components/OrdersPage.jsx';
/** Mantém as bases da sessão e coordena páginas autorizadas e importações conjuntas. */
export function Workspace() {
  const { user } = useAccess();
  const allowed = (key) => allowsPage(user, key);
  const [page, setPage] = useState('orders'),
    [orders, setOrders] = useState(null),
    [operational, setOperational] = useState(null),
    [consumptionRevision, setConsumptionRevision] = useState(0);
  // A autorização é reconsultada antes de aplicar o lote; ocultar um botão não basta.
  async function applyBatch(batch) {
    if (!(await authorizeAction('import'))) throw Error('Importação não autorizada.');
    for (const [key, value] of Object.entries(batch))
      if ((Array.isArray(value) ? value.length : value) && !allowsSource(accessUser() || user, key))
        throw Error('Você não tem permissão para importar esta base.');
    if (batch.consumption.length) {
      // Confirma a gravação local antes de atualizar as outras bases e avisar a tela de consumo.
      const archive = await readConsumptionHistory();
      await writeConsumptionHistory(mergeBulkHistory(archive, batch));
      setConsumptionRevision((value) => value + 1);
    }
    if (batch.orders) setOrders(batch.orders);
    if (batch.operational) setOperational(batch.operational);
  }
  const current = allowed(page)
    ? page
    : ['orders', 'operational', 'lines', 'operational-analysis', 'users', 'imports'].find(allowed);
  if (!current)
    return (
      <main className="access-status">
        <h1>Nenhuma página liberada</h1>
        <p>Solicite ao administrador a liberação das páginas necessárias.</p>
      </main>
    );
  return (
    <>
      {current === 'users' && <UsersPage onPage={setPage} />}
      <div hidden={current !== 'imports'}>
        {allowed('imports') && (
          <ImportPage
            onPage={setPage}
            onApply={applyBatch}
            orders={allowed('orders') || allowed('operational-analysis') ? orders : null}
            operational={
              allowed('operational') || allowed('operational-analysis') ? operational : null
            }
          />
        )}
      </div>
      <div hidden={current !== 'orders'}>
        {/* Manter a página permitida montada conserva filtros; sem permissão, ela não é criada. */}
        {allowed('orders') && (
          <OrdersPage
            onPage={setPage}
            onImport={setOrders}
            operational={operational}
            source={orders}
          />
        )}
      </div>
      <div hidden={current !== 'lines'}>
        {allowed('lines') && (
          <LinesPage
            onPage={setPage}
            operational={operational}
            onOperationalChange={setOperational}
            reloadToken={consumptionRevision}
          />
        )}
      </div>
      <div hidden={!['operational', 'operational-analysis'].includes(current)}>
        {(allowed('operational') || allowed('operational-analysis')) && (
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
          />
        )}
      </div>
    </>
  );
}
