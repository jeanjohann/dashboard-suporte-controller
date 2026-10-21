import test from 'node:test';
import assert from 'node:assert/strict';
import { maintenanceMatrix } from './maintenanceMatrix.js';
const labels = [
  'Status',
  'Tipo de Serviço',
  'Motivo',
  'Placa',
  'ID Rastreador',
  'Data de atendimento',
  'Razão Social',
];
function fixture(entries) {
  return {
    columns: labels.map((label, index) => ({ label, letter: String.fromCharCode(65 + index) })),
    rows: entries.map((entry, index) => ({
      sourceRow: index + 2,
      os: entry.os || '#1',
      cells: labels.map((label) => ({
        raw: {
          Status: 'Pago',
          'Tipo de Serviço': 'Assistência Técnica',
          Motivo: 'Revisão da Instalação',
          Placa: 'ABC1D23',
          'ID Rastreador': '144000001',
          'Data de atendimento': 45658,
          'Razão Social': 'Cliente',
          ...entry,
        }[label],
      })),
    })),
  };
}
test('matriz conta a troca uma vez e atribui modelo e motivo ao retirado', () => {
  const data = fixture([
    { Motivo: 'Desinstalação Business 2.1' },
    { Motivo: 'Instalação Business 2.1', 'ID Rastreador': '162000002' },
    { os: '#2' },
    { os: '#3', Motivo: 'Manutenção de Acessório' },
    { os: '#4', Motivo: 'Visita Improdutiva' },
  ]);
  const result = maintenanceMatrix(data, data);
  assert.equal(result.events, 2);
  assert.equal(result.swaps, 1);
  assert(result.groups.every((item) => item.model === 'MXT-130v2'));
  assert.deepEqual(result.groups.find((item) => item.swaps).rows, [2, 3]);
  const partial = maintenanceMatrix(data, { ...data, rows: [data.rows[0]] });
  assert.equal(partial.events, 0);
  assert.equal(partial.partial, 1);
});
test('trocas sem direção, grupos ambíguos e modelos desconhecidos permanecem explícitos', () => {
  const undirected = fixture([{}, { 'ID Rastreador': '162000002' }]);
  assert.equal(maintenanceMatrix(undirected, undirected).undirected, 1);
  assert.equal(maintenanceMatrix(undirected, undirected).events, 0);
  const unknown = fixture([{ 'ID Rastreador': '999000001' }]);
  assert.equal(maintenanceMatrix(unknown, unknown).groups[0].model, 'Modelo não identificado');
  const ambiguous = fixture([{}, {}, {}]);
  assert.equal(maintenanceMatrix(ambiguous, ambiguous).flaggedRows, 3);
  assert.equal(maintenanceMatrix(ambiguous, ambiguous).events, 0);
});
