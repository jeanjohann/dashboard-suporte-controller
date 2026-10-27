import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx';
import { importLogistics } from '../../logistics/domain/logistics.js';
import { agents, preparedEquipmentSummary } from './indicators.js';

const period = { start: '2026-10-19', end: '2026-10-25' };
function source(rows, includeOwner = true) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      [
        'Chamado',
        'Envio',
        'Recebimento',
        'Cliente',
        'Equipamento',
        'ID',
        'Rastreio',
        'Cidade',
        'A/C',
        ...(includeOwner ? ['Responsável Suporte'] : []),
      ],
      ...rows.map(([day, owner, equipment = 'Rastreador'], index) => [
        `#${index + 1}`,
        day,
        '',
        'Cliente de teste',
        equipment,
        String(index + 1),
        '',
        '',
        '',
        ...(includeOwner ? [owner] : []),
      ]),
    ]),
    'Enviados',
  );
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      ['Data Rec.', 'Cliente', 'Equipamento', 'ID', 'Placa/Prefixo', 'Obs'],
      ['20/10/2026', 'Cliente de teste', 'Rastreador', '99', '', 'OK'],
    ]),
    'Recebidos',
  );
  return importLogistics(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }));
}

test('preparação lê Responsável Suporte de Enviados, usa a data de envio e filtra por agente', () => {
  const data = source([
    ['19/10/2026', ' Eduardo '],
    ['20/10/2026', 'Eduardo Oliveira'],
    ['25/10/2026', 'JEAN'],
    ['22/10/2026', 'Jean Johann', 'Coletora'],
    ['18/10/2026', 'Jean'],
    ['26/10/2026', 'Eduardo'],
    ['', 'Eduardo'],
    ['20/10/2026', 'Jean', ''],
  ]);
  const result = preparedEquipmentSummary(data, period);
  assert.equal(result.total, 4);
  assert.equal(result.review, 0);
  assert.deepEqual(
    result.agents.map((agent) => agent.value),
    [2, 2],
  );
  for (const agent of agents)
    assert.equal(preparedEquipmentSummary(data, period, agent.id).total, 2);
  assert.equal(preparedEquipmentSummary(data, { start: '2026-10-26', end: '2026-11-01' }).total, 1);
});

test('preparação distingue base ausente, coluna ausente, zero e nomes sem vínculo', () => {
  assert.equal(preparedEquipmentSummary(null, period), null);
  assert.deepEqual(preparedEquipmentSummary(source([], false), period), {
    unavailable: 'Responsável pela preparação',
  });
  const result = preparedEquipmentSummary(
    source([
      ['20/10/2026', 'Jean Silva'],
      ['20/10/2026', ''],
    ]),
    period,
  );
  assert.equal(result.total, 0);
  assert.equal(result.review, 2);
  assert.deepEqual(
    result.agents.map((agent) => agent.value),
    [0, 0],
  );
});
