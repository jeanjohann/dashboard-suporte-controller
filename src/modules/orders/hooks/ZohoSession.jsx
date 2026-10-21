/** Leitura Zoho somente em memória, compartilhada entre a seção e a Visão geral. */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';
import { usePublishDashboardSource } from '../../my-dashboard/hooks/DashboardSources.jsx';

const ZohoContext = createContext(null);
export const defaultZohoColumns = [
  'closedTickets',
  'closedAssigned',
  'leadingTimeTickets',
  'confirmedTicketsReplied',
  'seconds',
  'meanSeconds',
];
function Session({ children }) {
  const [open, setOpen] = useState(false);
  const [presence, setPresence] = useState(null);
  const [data, setData] = useState(null);
  const [reviewedReplies, setReviewedReplies] = useState(false);
  const [mapping, setMapping] = useState({});
  const [columns, setColumns] = useState(defaultZohoColumns);
  const dashboardSource = useMemo(
    () => (data ? { data, reviewedReplies } : null),
    [data, reviewedReplies],
  );
  usePublishDashboardSource('zoho', dashboardSource);
  const value = useMemo(
    () => ({
      presence,
      setPresence,
      open,
      setOpen,
      data,
      setData,
      reviewedReplies,
      setReviewedReplies,
      mapping,
      setMapping,
      columns,
      setColumns,
    }),
    [open, data, reviewedReplies, mapping, columns, presence],
  );
  return <ZohoContext.Provider value={value}>{children}</ZohoContext.Provider>;
}
export function ZohoSessionProvider({ children }) {
  const { user, managed } = useAccess();
  return (
    <Session key={`${managed}:${user?.email}:${user?.role}:${user?.active}`}>{children}</Session>
  );
}
export const useZohoSession = () => useContext(ZohoContext);
