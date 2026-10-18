import test from 'node:test';
import assert from 'node:assert/strict';
import { equipment } from './equipment.js';
import { fieldLife } from './fieldLife.js';
import { finance } from './analysis.js';
import { interventionProfiles } from './insights.js';
const labels = [
  'Status',
  'Tipo de Serviço',
  'Motivo',
  'Placa',
  'ID Rastreador',
  'Data de atendimento',
  'Razão Social',
  'Instruções',
  'Km',
  'Técnico',
  'Custo Total',
  'Cobrança',
  'Valor a cobrar',
];
function fixture(entries) {
  return {
    columns: labels.map((label, i) => ({ label, letter: String.fromCharCode(65 + i) })),
    rows: entries.map((entry, i) => ({
      sourceRow: i + 2,
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
          Instruções: '',
          Km: 0,
          Técnico: 100,
          'Custo Total': 100,
          Cobrança: 'Addlog',
          'Valor a cobrar': 0,
          ...entry,
        }[label],
      })),
    })),
  };
}
test('motivos de revisão e falha são sem troca somente quando o arquivo completo tem uma linha/ID no chamado e veículo', () => {
  const d = fixture([
    { Motivo: 'Revisão da Instalação', os: '#1' },
    { Motivo: 'Falha Alimentação', os: '#2' },
    { Motivo: 'Falhas no geral', os: '#3' },
    { Status: 'Cancelada', os: '#4' },
    { Motivo: 'Visita Improdutiva', os: '#5' },
  ]);
  const r = equipment(d, d);
  assert.equal(r.withoutReplacement.length, 3);
  assert.equal(r.swaps.length, 0);
  assert.equal(r.issues.length, 0);
  const profile = interventionProfiles(d, r)[0];
  assert.equal(profile.withoutReplacement, 3);
  assert.equal(profile.unproductive, 1);
  assert.equal(finance(d).totals.cost, 40000);
});
test('dois IDs diferentes confirmam evento mesmo com motivos genéricos; ordem da planilha não inventa direção', () => {
  const d = fixture([{}, { 'ID Rastreador': '162000002' }]);
  const r = equipment(d, d);
  assert.equal(r.swaps.length, 1);
  assert.equal(r.withoutReplacement.length, 0);
  assert.equal(r.swaps[0].oldSerial, null);
  assert.equal(r.swaps[0].newSerial, null);
  assert.equal(r.swaps[0].lifecycleEligible, false);
  assert.equal(r.months[0].value, 1);
  assert.deepEqual(r.swaps[0].rows, [2, 3]);
  const cut = equipment(d, { ...d, rows: [d.rows[0]] });
  assert.equal(cut.swaps.length, 0);
  assert.equal(cut.withoutReplacement.length, 0);
});
test('outras placas/chamados não formam par; mais de duas linhas ou identificador inválido não confirmam sem troca', () => {
  const d = fixture([{}, { Placa: 'XYZ2A34' }]);
  assert.equal(equipment(d, d).withoutReplacement.length, 2);
  const repeated = fixture([
    {},
    { 'ID Rastreador': '162000002' },
    { 'ID Rastreador': '130000003' },
  ]);
  assert.equal(equipment(repeated, repeated).issues.length, 3);
  const incomplete = fixture([{}, { 'ID Rastreador': null }]);
  assert.equal(equipment(incomplete, incomplete).withoutReplacement.length, 0);
  assert.equal(equipment(incomplete, incomplete).issues.length, 2);
});
test('troca sem direção confirmada impede duração de ciclo anterior; não se torna observação saudável', () => {
  const d = fixture([
    {
      'Tipo de Serviço': 'Implementação',
      Motivo: 'Instalação Business 2.1',
      'Data de atendimento': 45600,
      os: '#0',
    },
    {},
    { 'ID Rastreador': '162000002' },
  ]);
  const r = fieldLife(d, d);
  assert.equal(r.periods[0].state, 'review');
  assert.equal(r.periods[0].days, null);
  assert.equal(r.pairs.length, 1);
});
test('acessórios sem troca são separados, palavra negada não confirma substituição e categoria incerta continua em revisão', () => {
  const d = fixture([
    { Motivo: 'Manutenção de Acessório', Instruções: 'Verificar RFID' },
    { Motivo: 'Manutenção de Acessório', Instruções: 'Trocar terminal de jornada' },
    { Motivo: 'Manutenção de Acessório', Instruções: 'RFID sem troca' },
    { Motivo: 'Manutenção de Acessório', Instruções: 'Troca de acessório' },
  ]);
  const r = equipment(d, d);
  assert.equal(r.accessories.Coletora, 1);
  assert.equal(r.accessories.RFID, 0);
  assert.equal(r.accessoryWithoutReplacement.RFID.length, 2);
  assert.equal(r.excludedAccessories, 1);
  assert.equal(r.withoutReplacement.length, 0);
});
test('par sem coluna de data fica em revisão sem lançar erro ou fabricar duração', () => {
  const d = fixture([{}, { 'ID Rastreador': '162000002' }]);
  const index = d.columns.findIndex((c) => c.label === 'Data de atendimento');
  d.columns.splice(index, 1);
  d.rows.forEach((row) => row.cells.splice(index, 1));
  const result = equipment(d, d);
  assert.equal(result.swaps.length, 0);
  assert.equal(result.issues.length, 2);
  assert.equal(result.issues[0].address, '—');
});
