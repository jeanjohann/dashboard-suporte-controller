/** Relatórios de OS: carregados quando há base, mantendo a ordem, estados e contexto da página. */
import React from 'react';
import { MaintenanceMatrix } from './MaintenanceMatrix.jsx';
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
import { ReportStories } from '../../../shared/layout/ReportStories.jsx';
import { allOrderStories } from '../config/reportStories.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { allowsPage } from '../../../shared/security/permissions.js';

/** Recebe o controlador existente; não mantém outra cópia dos dados ou filtros. */
export function OrdersReports({
  session,
  category,
  visible,
  operational,
  onPage,
  onCategory,
  presentations,
  setPresentations,
  attentionLimits,
  setAttentionLimits,
}) {
  const { user } = useAccess();
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
    <ReportStories groups={allOrderStories}>
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
          operational={operational}
          filters={filters}
          onPage={onPage}
          onCategory={onCategory}
          presentations={presentations}
          setPresentations={setPresentations}
          devices={devices}
          attentionLimits={attentionLimits}
          setAttentionLimits={setAttentionLimits}
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
      {category === 'equipment' && allowsPage(user, 'operational-analysis') && (
        <div className="analysis-route panel">
          <div>
            <strong>Conferência de vínculos com o parque</strong>
            <p className="scope">
              O cruzamento completo de serial + placa fica em Parque e Manutenção → Vínculos, com
              filtros próprios.
            </p>
          </div>
          <button type="button" onClick={() => onPage('operational-analysis')}>
            Abrir Parque e Manutenção
          </button>
        </div>
      )}
      <ExtendedInsights data={selected} visibility={visible} />
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
      <MaintenanceMatrix
        original={data}
        data={selected}
        filename={filename}
        visible={visible.maintenanceMatrix}
      />
      <OrdersSwapsPanel data={data} devices={devices} visible={visible.swaps} />
      <OrdersFinancePanel financial={financial} data={selected} visible={visible.finance} />
      <OrdersOperationsPanel summary={summary} visible={visible.operations} />
      <OrdersCallsPanel summary={summary} visible={visible.calls} />
      <OrdersRecordsPanel
        filename={filename}
        data={data}
        selected={selected}
        review={review}
        visible={visible.records}
        records={records}
      />
    </ReportStories>
  );
}
