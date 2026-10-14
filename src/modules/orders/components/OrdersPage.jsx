/** Coordena categorias, preferências e contexto dos relatórios de OS; estado e apresentação têm responsabilidades próprias. */
import React, { useState } from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { PrintContext, ExpansionContext } from '../../../components/Section.jsx';
import { cleanPreferences } from '../config/preferences.js';
import { categoryVisibility } from '../config/dashboardCategories.js';
import { useOrdersSession } from '../hooks/useOrdersSession.js';
import { OrdersImportPanel } from './OrdersImportPanel.jsx';
import { OrdersFiltersPanel } from './OrdersFiltersPanel.jsx';
import { OrdersCategories } from './OrdersReportMenu.jsx';
import { OrdersLifecyclePanel } from './OrdersLifecyclePanel.jsx';
import { OrdersSwapsPanel } from './OrdersSwapsPanel.jsx';
import { OrdersRecordsPanel } from './OrdersRecordsPanel.jsx';
import {
  OrdersMonthlyPanel,
  OrdersFinancePanel,
  OrdersOperationsPanel,
  OrdersCallsPanel,
} from './OrdersTotalsPanels.jsx';
import { DashboardOverview } from './DashboardOverview.jsx';
import { SummaryCards } from './SummaryCards.jsx';
import { Technicians } from './Technicians.jsx';
import { DescriptiveReport } from './DescriptiveReport.jsx';
import { FieldLifePanel } from './FieldLifePanel.jsx';
import { ExtendedInsights } from './ExtendedInsights.jsx';
import { AdvancedInsights } from './AdvancedInsights.jsx';
import { Explorers } from './Explorers.jsx';

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
    setReferenceDate,
    cycleState,
    setCycleState,
    importedPeriod,
    selected,
    summary,
    financial,
    monthly,
    devices,
    lifecycle,
    displayedPeriods,
    review,
    restoreFilters,
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
                  {category === 'overview' && (
                    <DashboardOverview
                      original={data}
                      filters={filters}
                      operational={operational}
                      onPage={onPage}
                    />
                  )}
                  <SummaryCards
                    data={selected}
                    financial={financial}
                    devices={devices}
                    visible={visible.summary && category !== 'overview'}
                    filters={filters}
                  />
                  <OrdersMonthlyPanel
                    monthly={monthly}
                    selected={selected}
                    category={category}
                    visible={visible.monthly && category !== 'overview'}
                  />
                  <Technicians data={selected} visible={visible.technicians} />
                  <DescriptiveReport
                    original={data}
                    data={selected}
                    devices={devices}
                    lifecycle={lifecycle}
                    filename={filename}
                    filters={filters}
                    referenceDate={referenceDate}
                    visible={visible.descriptive}
                  />
                  <FieldLifePanel
                    original={data}
                    data={selected}
                    filename={filename}
                    filters={filters}
                    visible={visible.fieldLife}
                  />
                  <ExtendedInsights
                    original={data}
                    data={selected}
                    visibility={visible}
                    operational={operational?.data || operational}
                  />
                  <AdvancedInsights
                    original={data}
                    data={selected}
                    devices={devices}
                    lifecycle={lifecycle}
                    visibility={visible}
                    filename={filename}
                    filters={filters}
                  />
                  <Explorers
                    key={filename}
                    visibility={visible}
                    data={selected}
                    filename={filename}
                    filters={filters}
                    onRestoreFilters={restoreFilters}
                  />
                  <OrdersLifecyclePanel
                    lifecycle={lifecycle}
                    displayedPeriods={displayedPeriods}
                    cycleState={cycleState}
                    setCycleState={setCycleState}
                    referenceDate={referenceDate}
                    setReferenceDate={setReferenceDate}
                    visible={visible.lifecycle}
                  />
                  <OrdersSwapsPanel devices={devices} visible={visible.swaps} />
                  <OrdersFinancePanel financial={financial} visible={visible.finance} />
                  <OrdersOperationsPanel
                    summary={summary}
                    category={category}
                    visible={visible.operations}
                  />
                  <OrdersCallsPanel summary={summary} visible={visible.calls} />
                  <OrdersRecordsPanel
                    data={data}
                    selected={selected}
                    review={review}
                    visible={visible.records}
                    records={records}
                  />
                </>
              )}
            </main>
          </div>
        </PrintContext.Provider>
      </ExpansionContext.Provider>
    </SidePanelProvider>
  );
}
