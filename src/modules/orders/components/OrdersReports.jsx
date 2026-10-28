/** Relatórios de OS: carregados quando há base, mantendo a ordem, estados e contexto da página. */
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ReportStories } from '../../../shared/layout/ReportStories.jsx';
import { allOrderStories } from '../config/reportStories.js';
import { useAccess } from '../../../shared/security/Access.jsx';
import { allowsPage } from '../../../shared/security/permissions.js';

const lazyNamed = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const DashboardOverview = lazyNamed(() => import('./DashboardOverview.jsx'), 'DashboardOverview');
const SummaryCards = lazyNamed(() => import('./SummaryCards.jsx'), 'SummaryCards');
const OrdersMonthlyPanel = lazyNamed(() => import('./OrdersTotalsPanels.jsx'), 'OrdersMonthlyPanel');
const OrdersFinancePanel = lazyNamed(() => import('./OrdersTotalsPanels.jsx'), 'OrdersFinancePanel');
const OrdersOperationsPanel = lazyNamed(
  () => import('./OrdersTotalsPanels.jsx'),
  'OrdersOperationsPanel',
);
const OrdersCallsPanel = lazyNamed(() => import('./OrdersTotalsPanels.jsx'), 'OrdersCallsPanel');
const Technicians = lazyNamed(() => import('./Technicians.jsx'), 'Technicians');
const DescriptiveReport = lazyNamed(() => import('./DescriptiveReport.jsx'), 'DescriptiveReport');
const FieldLifePanel = lazyNamed(() => import('./FieldLifePanel.jsx'), 'FieldLifePanel');
const ExtendedInsights = lazyNamed(() => import('./ExtendedInsights.jsx'), 'ExtendedInsights');
const AdvancedInsights = lazyNamed(() => import('./AdvancedInsights.jsx'), 'AdvancedInsights');
const Explorers = lazyNamed(() => import('./Explorers.jsx'), 'Explorers');
const SupportPerformance = lazyNamed(() => import('./SupportPerformance.jsx'), 'SupportPerformance');
const OrdersLifecyclePanel = lazyNamed(
  () => import('./OrdersLifecyclePanel.jsx'),
  'OrdersLifecyclePanel',
);
const MaintenanceMatrix = lazyNamed(() => import('./MaintenanceMatrix.jsx'), 'MaintenanceMatrix');
const OrdersSwapsPanel = lazyNamed(() => import('./OrdersSwapsPanel.jsx'), 'OrdersSwapsPanel');
const OrdersRecordsPanel = lazyNamed(() => import('./OrdersRecordsPanel.jsx'), 'OrdersRecordsPanel');

const extendedIds = ['maintenanceReasons', 'absorbedAnalysis', 'geography', 'technicianContext'];
const advancedIds = [
  'clientCosts',
  'costComposition',
  'recurrence',
  'multiCalls',
  'interventions',
  'durationAnalysis',
  'costEvolution',
];
const explorerIds = ['saved', 'export', 'report', 'history'];

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
  const [mountedPanels, setMountedPanels] = useState({});
  const currentVisibleKey = [
    ...Object.keys(visible).filter(
      (id) => visible[id] && !(category === 'overview' && ['summary', 'monthly'].includes(id)),
    ),
    ...(category === 'overview' ? ['dashboardOverview'] : []),
  ]
    .join('|');
  useEffect(() => {
    if (!currentVisibleKey) return;
    setMountedPanels((previous) => {
      const next = { ...previous };
      currentVisibleKey.split('|').forEach((id) => (next[id] = true));
      return next;
    });
  }, [currentVisibleKey]);
  const canRender = (id) => Boolean(visible[id] && !(category === 'overview' && ['summary', 'monthly'].includes(id))) || mountedPanels[id];
  const defer = (id, content) =>
    canRender(id) ? (
      <Suspense key={id} fallback={<p role="status">Preparando análise…</p>}>
        {content}
      </Suspense>
    ) : null;
  const deferGroup = (id, sectionIds, content) =>
    sectionIds.some(canRender) ? (
      <Suspense key={id} fallback={<p role="status">Preparando análise…</p>}>
        {content}
      </Suspense>
    ) : null;
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
      {defer(
        'supportPerformance',
        <SupportPerformance
          original={data}
          filters={filters}
          setFilters={session.setFilters}
          filename={filename}
          visible={visible.supportPerformance}
        />,
      )}
      {category === 'overview' && defer(
        'dashboardOverview',
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
        />,
      )}
      {defer(
        'summary',
        <SummaryCards
          data={selected}
          financial={financial}
          devices={devices}
          visible={visible.summary && category !== 'overview'}
          filters={filters}
        />,
      )}
      {defer(
        'monthly',
        <OrdersMonthlyPanel
          monthly={monthly}
          selected={selected}
          category={category}
          visible={visible.monthly && category !== 'overview'}
        />,
      )}
      {defer('technicians', <Technicians data={selected} visible={visible.technicians} />)}
      {defer(
        'descriptive',
        <DescriptiveReport
          original={data}
          data={selected}
          devices={devices}
          lifecycle={lifecycle}
          filename={filename}
          filters={filters}
          referenceDate={referenceDate}
          visible={visible.descriptive}
        />,
      )}
      {defer(
        'fieldLife',
        <FieldLifePanel
          original={data}
          data={selected}
          filename={filename}
          filters={filters}
          visible={visible.fieldLife}
        />,
      )}
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
      {deferGroup('extendedInsights', extendedIds, <ExtendedInsights data={selected} visibility={visible} />)}
      {deferGroup(
        'advancedInsights',
        advancedIds,
        <AdvancedInsights
          original={data}
          data={selected}
          devices={devices}
          lifecycle={lifecycle}
          visibility={visible}
          filename={filename}
          filters={filters}
        />,
      )}
      {deferGroup(
        'explorers',
        explorerIds,
        <Explorers
          key={filename}
          visibility={visible}
          data={selected}
          filename={filename}
          filters={filters}
          onRestoreFilters={restoreFilters}
        />,
      )}
      {defer(
        'lifecycle',
        <OrdersLifecyclePanel
          lifecycle={lifecycle}
          displayedPeriods={displayedPeriods}
          cycleState={cycleState}
          setCycleState={setCycleState}
          referenceDate={referenceDate}
          setReferenceDate={setReferenceDate}
          visible={visible.lifecycle}
        />,
      )}
      {defer(
        'maintenanceMatrix',
        <MaintenanceMatrix
          original={data}
          data={selected}
          filename={filename}
          visible={visible.maintenanceMatrix}
        />,
      )}
      {defer('swaps', <OrdersSwapsPanel data={data} devices={devices} visible={visible.swaps} />)}
      {defer(
        'finance',
        <OrdersFinancePanel financial={financial} data={selected} visible={visible.finance} />,
      )}
      {defer('operations', <OrdersOperationsPanel summary={summary} visible={visible.operations} />)}
      {defer('calls', <OrdersCallsPanel summary={summary} visible={visible.calls} />)}
      {defer(
        'records',
        <OrdersRecordsPanel
          filename={filename}
          data={data}
          selected={selected}
          review={review}
          visible={visible.records}
          records={records}
        />,
      )}
    </ReportStories>
  );
}
