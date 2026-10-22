/** Acompanhamento por operadora, com acesso herdado de Consumo e consulta KORE restrita no servidor. */
import React from 'react';
import { Navigation } from '../../../app/Navigation.jsx';
import { SidePanelProvider } from '../../../app/SidePanel.jsx';
import { KorePilotPanel } from './KorePilotPanel.jsx';

export function CarrierPage({ carrier, active, onPage, operational }) {
  const name = carrier === 'kore' ? 'KORE' : 'Arqia';
  return (
    <SidePanelProvider>
      <div className="app lines-page">
        <Navigation page={carrier} onPage={onPage} />
        <main>
          <header className="page-header">
            <div>
              <p className="eyebrow">ACOMPANHAMENTO DE OPERADORAS</p>
              <h1>{name}</h1>
              <p>Linhas, consumo e situação da conexão com a operadora.</p>
            </div>
          </header>
          {carrier === 'kore' ? (
            <KorePilotPanel visible={active} operational={operational} />
          ) : (
            <section className="panel" style={{ padding: 24 }}>
              <h2>Integração Arqia</h2>
              <p>Aguardando documentação e liberação da API para conectar esta operadora.</p>
              <p className="scope">
                Os extratos importados continuam disponíveis no Controle de Consumo M2M.
              </p>
              <button onClick={() => onPage('lines')}>Abrir controle de consumo</button>
            </section>
          )}
        </main>
      </div>
    </SidePanelProvider>
  );
}
