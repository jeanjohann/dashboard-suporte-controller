/** Dados fictícios e referência congelada para avaliar a interface, sem conexão com a API. */
export function monitoringDemo() {
  const referenceAt = '2026-10-11T10:00:00-03:00';
  const clients = ['Base Aurora', 'Base Horizonte', 'Base Vale'];
  const hours = [150, 100, 86, 73, 60, 48, 12, 4, 1, 0.5, null, 20];
  return {
    demonstration: true,
    referenceAt,
    collections: clients.map((name, i) => ({ clientId: `demo-${i}`, at: referenceAt, ok: true })),
    vehicles: hours.map((hours, i) => ({
      clientId: `demo-${i % 3}`,
      clientName: clients[i % 3],
      vehicleId: `vehicle-${i}`,
      plate: `ABC-${1001 + i}`,
      trackerId: `162${710001 + i}`,
      supplyVoltageV: i === 10 ? null : i === 11 ? 0 : i % 2 ? 24.4 : 12.6,
      profile: i === 10 ? null : `Perfil DEMO ${i % 2 ? '02' : '01'}`,
      lastRecordAt:
        hours == null ? null : new Date(Date.parse(referenceAt) - hours * 3600000).toISOString(),
    })),
    // Observações ilustrativas de coleta, não histórico de falhas inferido entre consultas.
    history: [
      { at: '2026-10-11T08:00:00-03:00', count: 5 },
      { at: '2026-10-11T09:00:00-03:00', count: 5 },
      { at: referenceAt, count: 6 },
    ],
  };
}
