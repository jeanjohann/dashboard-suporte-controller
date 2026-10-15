/** Coordena categorias, preferências e contexto dos relatórios de OS; estado e apresentação têm responsabilidades próprias. */
import React, { lazy, Suspense, useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { PrintContext, ExpansionContext } from '../../../components/Section.jsx';
import { cleanPreferences } from '../config/preferences.js';
import { categoryVisibility } from '../config/dashboardCategories.js';
import { useOrdersSession } from '../hooks/useOrdersSession.js';
import { OrdersImportPanel } from './OrdersImportPanel.jsx';
import { OrdersFiltersPanel } from './OrdersFiltersPanel.jsx';
import { OrdersCategories } from './OrdersReportMenu.jsx';
// Identidade estável para conservar o estado dos relatórios após a primeira importação.
const OrdersReports = lazy(() =>
  import('./OrdersReports.jsx').then((module) => ({ default: module.OrdersReports })),
);

/** Mantém a página montada no Workspace e conserva a ordem dos relatórios e seus identificadores. */
export function OrdersPage({ onPage, onImport, operational, source }) {
  const [expansion, setExpansion] = useState(null);
  const [category, setCategory] = useState('overview');
  const [preferences, setVisible] = useState(() => {
    try {
      return cleanPreferences(JSON.parse(localStorage.getItem('suporte-layout-v1') || '{}'));
    } catch {
      return cleanPreferences({});
    }
  });
  const visible = categoryVisibility(preferences, category);
  const [layoutMessage, setLayoutMessage] = useState('');
  function setVisibility(next) {
    setVisible(next);
    try {
      localStorage.setItem('suporte-layout-v1', JSON.stringify(next));
      setLayoutMessage('Preferência salva neste navegador.');
    } catch {
      setLayoutMessage('Preferência aplicada só nesta sessão; não foi possível salvar.');
    }
  }
  const session = useOrdersSession({ source, onImport });
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
      <ExpansionContext.Provider value={expansion}>
        <PrintContext.Provider value={{ filename, filters, referenceDate }}>
          <div className="app">
            <Navigation page="orders" onPage={onPage} />
            <main>
              <OrdersImportPanel input={input} busy={busy} error={error} data={data} load={load} />
              {data && (
                <>
                  <OrdersCategories
                    category={category}
                    setCategory={setCategory}
                    setExpansion={setExpansion}
                  />
                  <OrdersFiltersPanel
                    data={data}
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
                    category={category}
                    preferences={preferences}
                    setVisibility={setVisibility}
                    layoutMessage={layoutMessage}
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
                      category={category}
                      visible={visible}
                      operational={operational}
                      onPage={onPage}
                    />
                  </Suspense>
                </>
              )}
            </main>
          </div>
        </PrintContext.Provider>
      </ExpansionContext.Provider>
    </SidePanelProvider>
  );
}
