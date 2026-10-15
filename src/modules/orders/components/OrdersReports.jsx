/** Relatórios de OS: carregados quando há base, mantendo a ordem, estados e contexto da página. */
import React from 'react';
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
import { SupportPerformance } from './SupportPerformance.jsx';

/** Recebe o controlador existente; não mantém outra cópia dos dados ou filtros. */
export function OrdersReports({ session, category, visible, operational, onPage }) {
  const {
    data,
    filename,
    filters,
    selected,
    financial,
    devices,
    monthly,
    summary,
    lifecycle,
    referenceDate,
    setReferenceDate,
    cycleState,
    setCycleState,
    displayedPeriods,
    review,
    restoreFilters,
    records,
  } = session;
  return (
    <>
      <SupportPerformance
        original={data}
        filters={filters}
        setFilters={session.setFilters}
        filename={filename}
        visible={visible.supportPerformance}
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
      <OrdersOperationsPanel summary={summary} category={category} visible={visible.operations} />
      <OrdersCallsPanel summary={summary} visible={visible.calls} />
      <OrdersRecordsPanel
        data={data}
        selected={selected}
        review={review}
        visible={visible.records}
        records={records}
      />
    </>
  );
}
