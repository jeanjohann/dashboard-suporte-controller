/** Acompanhamento por operadora, com acesso herdado de Consumo e consulta KORE restrita no servidor. */
import React from 'react';
import { LinesPage } from './LinesPage.jsx';

export function CarrierPage({ carrier, ...props }) {
  return <LinesPage {...props} pageId={carrier} />;
}
