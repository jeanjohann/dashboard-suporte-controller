import test from 'node:test';
import assert from 'node:assert/strict';
import { parkHistory, parkHistoryReference, sortParkHistoryRows } from './parkHistory.js';
const columns = ['Status', 'Tipo de Serviço', 'Motivo', 'Data de atendimento'].map(
  (label, index) => ({ label, index }),
);
const row = (id, date, type = 'Assistência Técnica', reason = 'Revisão', status = 'Pago') => ({
  sourceRow: id,
  cells: [status, type, reason, date].map((raw) => ({ raw })),
});
function fixture() {
  const install = row(2, 46000, 'Implementação'),
    assistance = row(3, 46010),
    unproductive = row(4, 46020, 'Assistência Técnica', 'Visita Improdutiva'),
    undated = row(5, null),
    cancel = row(6, 47000, 'Assistência Técnica', 'Revisão', 'Cancelada');
  return {
    orders: { columns, rows: [install, assistance, unproductive, undated, cancel] },
    result: {
      assistance: 1,
      eligible: [
        {
          sourceRow: 2,
          client: 'A',
          model: 'M1',
          services: [install, assistance, unproductive],
          assistance: [assistance],
        },
        { sourceRow: 3, client: '', model: 'M2', services: [undated], assistance: [] },
        { sourceRow: 4, client: 'B', model: 'M1', services: [], assistance: [] },
      ],
    },
  };
}
test('última intervenção usa efetivos de todos os tipos, mantém improdutivas e ausência distintas', () => {
  const { result, orders } = fixture();
  const reference = parkHistoryReference(orders),
    value = parkHistory(result, orders);
  assert.equal(value.devices[0].effective, 2);
  assert.equal(value.devices[0].unproductive, 1);
  assert.equal(value.devices[0].days, 10); // Referência inclui realizado improdutivo; última intervenção não.
  assert.equal(value.withoutEffective, 1);
  assert.equal(value.withoutDate, 1);
  assert.equal(value.clients.topFive, 1);
  assert.equal(value.models.items.find((item) => item.label === 'M1').base, 2);
  assert.equal(value.reference, reference);
  assert.ok(reference < '2028'); // Cancelada mais recente não muda referência.
  assert.equal(
    value.buckets.reduce((sum, item) => sum + item.value, 0),
    value.dated,
  );
});
test('referência vazia ou anterior não fabrica duração zero nem negativa; base sem assistência fica sem percentual', () => {
  const { result, orders } = fixture();
  assert.equal(parkHistory(result, orders, '').devices[0].days, null);
  const value = parkHistory(result, orders, '2020-01-01');
  assert.equal(value.future, 1);
  assert.equal(value.devices[0].days, null);
  assert.equal(parkHistory({ ...result, assistance: 0 }, orders).clients.topFive, null);
  const before = JSON.stringify(result);
  parkHistory(result, orders);
  assert.equal(JSON.stringify(result), before);
});
test('ordenação por dias considera todo o conjunto antes da página e mantém ausentes ao final', () => {
  const rows = Array.from({ length: 24 }, (_, i) => ({
    sourceRow: i + 2,
    days: i === 22 ? null : i,
    client: 'Cliente',
    serial: String(i),
    plate: 'AAA1D23',
  }));
  const sorted = sortParkHistoryRows(rows, { index: 5, direction: 'desc' });
  assert.equal(sorted[0].days, 23);
  assert.equal(sorted.at(-1).days, null);
  assert.equal(rows[0].days, 0);
});
