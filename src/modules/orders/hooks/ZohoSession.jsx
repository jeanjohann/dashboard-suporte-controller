/** Leitura Zoho somente em memória, compartilhada entre a seção e a Visão geral. */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAccess } from '../../../shared/security/Access.jsx';

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
  const [data, setData] = useState(null);
  const [reviewedReplies, setReviewedReplies] = useState(false);
  const [mapping, setMapping] = useState({});
  const [columns, setColumns] = useState(defaultZohoColumns);
  const value = useMemo(
    () => ({
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
    [open, data, reviewedReplies, mapping, columns],
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
