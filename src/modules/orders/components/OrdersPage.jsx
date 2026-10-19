/** Coordena categorias, preferências e contexto dos relatórios de OS; estado e apresentação têm responsabilidades próprias. */
import React, { lazy, Suspense, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { PrintContext, ExpansionContext } from '../../../components/Section.jsx';
import {
  cleanPreferences,
  orderLayoutDefinitions,
  legacyOrderLayout,
} from '../config/preferences.js';
import { categoryVisibility, dashboardCategories } from '../config/dashboardCategories.js';
import { usePageLayout, PageLayoutProvider } from '../../../shared/layout/PageLayout.jsx';
import { useOrdersSession } from '../hooks/useOrdersSession.js';
import { OrdersImportPanel } from './OrdersImportPanel.jsx';
import { OrdersFiltersPanel } from './OrdersFiltersPanel.jsx';
import { OrdersCategories } from './OrdersReportMenu.jsx';
import { useGoogleOrders } from '../hooks/useGoogleOrders.js';
import { OrdersGooglePanel } from './OrdersGooglePanel.jsx';
import { SupportZohoPanel } from './SupportZohoPanel.jsx';
import { customerGroupingLabel, customerGroupingRule } from '../domain/customerIdentity.js';
// Identidade estável para conservar o estado dos relatórios após a primeira importação.
const OrdersReports = lazy(() =>
  import('./OrdersReports.jsx').then((module) => ({ default: module.OrdersReports })),
);

/** Mantém a página montada no Workspace e conserva a ordem dos relatórios e seus identificadores. */
export function OrdersPage({ onPage, onImport, operational, source, active = true }) {
  const [expansion, setExpansion] = useState(null);
  const [zohoOpen, setZohoOpen] = useState(false);
  const [category, setCategory] = useState('overview');
  const layout = usePageLayout('orders', legacyOrderLayout);
  const preferences = cleanPreferences(
    Object.fromEntries(Object.entries(layout.effective).map(([id, item]) => [id, item.visible])),
  );
  const visible = categoryVisibility(preferences, category);
  const menu = dashboardCategories.find((item) => item.key === category);
  const session = useOrdersSession({ source, onImport, scope: category });
  const google = useGoogleOrders({ source, onImport, active, manualBusy: session.busy });
  const {
    input,
    data,
    filename,
    error,
    busy,
    load,
    filters,
    setFilters,
    changeFilter,
    extraColumns,
    setExtraColumns,
    referenceDate,
    importedPeriod,
    selected,
    records,
  } = session;
  const { setSearch, setPage } = records;
  return (
    <SidePanelProvider>
      <PageLayoutProvider
        layout={layout}
        definitions={orderLayoutDefinitions}
        activeIds={category === 'overview' ? [] : menu.sections}
        scope={`Ordens de Serviço · ${menu.label}`}
      >
        <ExpansionContext.Provider value={expansion}>
          <PrintContext.Provider
            value={{
              filename,
              filters: {
                ...filters,
                alcance: `OS → ${menu.label}`,
                agrupamentoClientes: data ? customerGroupingLabel(data) : '',
                criterioClientes: data ? customerGroupingRule(data) : '',
              },
              referenceDate,
            }}
          >
            <div className="app">
              <Navigation page="orders" onPage={onPage} />
              <main>
                <OrdersImportPanel
                  input={input}
                  busy={busy}
                  error={error}
                  data={data}
                  load={load}
                  google={google}
                  zohoOpen={zohoOpen}
                  onToggleZoho={() => setZohoOpen((open) => !open)}
                />
                <OrdersGooglePanel google={google} manualBusy={busy} />
                <SupportZohoPanel
                  active={active && zohoOpen}
                  onClose={() => setZohoOpen(false)}
                  ordersData={data}
                />
                {data && (
                  <>
                    <OrdersCategories
                      category={category}
                      setCategory={setCategory}
                      setExpansion={setExpansion}
                      filterCounts={session.filterCounts}
                    />
                    <OrdersFiltersPanel
                      data={data}
                      customerGrouping={session.customerGrouping}
                      setCustomerGrouping={session.setCustomerGrouping}
                      consolidateIdenticalNames={session.consolidateIdenticalNames}
                      setConsolidateIdenticalNames={session.setConsolidateIdenticalNames}
                      scope={`OS → ${menu.label}`}
                      showWeekShortcuts={category === 'overview'}
                      search={records.search}
                      filename={filename}
                      selected={selected}
                      importedPeriod={importedPeriod}
                      filters={filters}
                      setFilters={setFilters}
                      changeFilter={changeFilter}
                      extraColumns={extraColumns}
                      setExtraColumns={setExtraColumns}
                      setSearch={setSearch}
                      setPage={setPage}
                      setExpansion={setExpansion}
                    />
                    <Suspense
                      fallback={
                        <section className="panel" role="status">
                          <h2>Preparando análises…</h2>
                          <p>Aguarde um instante.</p>
                        </section>
                      }
                    >
                      <OrdersReports
                        session={session}
                        operational={operational}
                        category={category}
                        visible={visible}
                        onPage={onPage}
                        onCategory={(key) => {
                          setCategory(key);
                          setExpansion(null);
                        }}
                      />
                    </Suspense>
                  </>
                )}
              </main>
            </div>
          </PrintContext.Provider>
        </ExpansionContext.Provider>
      </PageLayoutProvider>
    </SidePanelProvider>
  );
}
